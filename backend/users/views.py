"""
Vistas para la gestión de usuarios en el sistema IFAP.

Este módulo contiene las vistas de la API REST para:
- Registro de nuevos usuarios
- Autenticación y autorización
- Gestión de perfiles de usuario
- Administración de roles
- Operaciones CRUD de usuarios

Las vistas incluyen optimizaciones de consultas y logging de auditoría
para garantizar el rendimiento y la trazabilidad del sistema.
"""

import logging
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.core.exceptions import ValidationError
from .models import User
from .serializers import UserSerializer, UserRegistrationSerializer, UserProfileSerializer
from .permissions import (
    IsAdminUser, 
    IsInstructorOrAdmin, 
    IsOwnerOrInstructorOrAdmin,
    CanManageUsers
)
from rest_framework.views import APIView
from rest_framework.generics import CreateAPIView
from ifap_backend.pagination import StandardResultsPagination
from ifap_backend.query_optimizations import OptimizedQueryMixin, UserQueryOptimizer
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

# Imports para estadísticas del dashboard
from courses.models import Course
from lessons.models import Lesson
from quizzes.models import Quiz
from forum.models import ForumTopic
from library.models import LibraryFile

audit_logger = logging.getLogger('audit')

# Vista para el registro de usuarios
@method_decorator(csrf_exempt, name='dispatch')
class UserRegisterView(CreateAPIView):
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]
    authentication_classes = []

class UserViewSet(OptimizedQueryMixin, viewsets.ModelViewSet):
    """
    ViewSet para la gestión completa de usuarios.
    
    Proporciona endpoints para:
    - CRUD completo de usuarios
    - Autenticación (login/logout)
    - Gestión de roles
    - Consulta de información del usuario actual
    - Listado de usuarios por rol
    - Resumen estadístico de roles
    
    Incluye optimizaciones de consultas automáticas y logging de auditoría.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    pagination_class = StandardResultsPagination

    def optimize_queryset(self, queryset):
        """Aplicar optimizaciones específicas según la acción"""
        if self.action == 'list':
            return UserQueryOptimizer.get_users_with_roles()
        elif self.action in ['retrieve', 'me']:
            return queryset.select_related().prefetch_related('groups', 'user_permissions')
        elif self.action == 'list_by_role':
            role = self.request.query_params.get('role')
            if role == 'student':
                return UserQueryOptimizer.get_students_with_courses()
            elif role == 'instructor':
                return UserQueryOptimizer.get_instructors_with_courses()
        
        return queryset

    def get_permissions(self):
        """Define permisos específicos para cada acción"""
        if self.action in ['create', 'login', 'password_reset', 'password_reset_confirm']:
            return [AllowAny()]
        elif self.action in ['list', 'destroy', 'update', 'partial_update']:
            return [CanManageUsers()]
        elif self.action == 'retrieve':
            return [IsOwnerOrInstructorOrAdmin()]
        elif self.action == 'update_role':
            return [IsAdminUser()]
        elif self.action in ['me', 'logout', 'change_password']:
            return [IsAuthenticated()]
        elif self.action == 'list_by_role':
            return [IsInstructorOrAdmin()]
        return [IsAuthenticated()]

    @swagger_auto_schema(
        method='get',
        operation_description="Obtener información del usuario autenticado",
        responses={
            200: openapi.Response(
                description="Información del usuario",
                schema=UserSerializer
            ),
            401: "No autenticado"
        }
    )
    @swagger_auto_schema(
        method='patch',
        operation_description="Actualizar información del usuario autenticado",
        request_body=UserProfileSerializer,
        responses={
            200: openapi.Response(
                description="Perfil actualizado",
                schema=UserSerializer
            ),
            400: "Datos inválidos",
            401: "No autenticado"
        }
    )
    @action(detail=False, methods=['get', 'patch'], permission_classes=[IsAuthenticated])
    def me(self, request):
        """Obtener información del usuario autenticado"""
        if request.method == 'GET':
            serializer = self.get_serializer(request.user)
            audit_logger.info(f"User {request.user.id} accessed profile")
            return Response(serializer.data)

        serializer = UserProfileSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        audit_logger.info(f"User {request.user.id} updated profile")
        return Response(UserSerializer(request.user).data)

    @swagger_auto_schema(
        operation_description="Iniciar sesión en el sistema",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['username', 'password'],
            properties={
                'username': openapi.Schema(type=openapi.TYPE_STRING, description="Nombre de usuario"),
                'password': openapi.Schema(type=openapi.TYPE_STRING, format=openapi.FORMAT_PASSWORD, description="Contraseña"),
            }
        ),
        responses={
            200: openapi.Response(
                description="Login exitoso",
                examples={
                    "application/json": {
                        "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
                        "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
                        "user": {
                            "id": 1,
                            "username": "student",
                            "role": "estudiante"
                        }
                    }
                }
            ),
            400: "Credenciales inválidas",
            401: "Usuario o contraseña incorrectos"
        }
    )
    @action(detail=False, methods=['post'])
    def login(self, request):
        identifier = request.data.get('username') or request.data.get('email')
        password = request.data.get('password')

        if not identifier or not password:
            return Response(
                {'error': 'Se requieren username y password'},
                status=status.HTTP_400_BAD_REQUEST
            )

        username = identifier
        if '@' in identifier:
            user_by_email = User.objects.filter(email__iexact=identifier).only('username').first()
            if user_by_email:
                username = user_by_email.username

        user = authenticate(username=username, password=password)

        if user:
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': UserSerializer(user).data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            })
        else:
            return Response(
                {'error': 'Credenciales inválidas'},
                status=status.HTTP_401_UNAUTHORIZED
            )

    @action(detail=True, methods=['post'])
    def update_role(self, request, pk=None):
        """Actualiza el rol de un usuario (solo administradores)"""
        user_to_update = self.get_object()
        new_role = request.data.get('role')

        role_map = {
            'student': 'student',
            'estudiante': 'student',
            'alumno': 'student',
            'instructor': 'instructor',
            'docente': 'instructor',
            'admin': 'admin',
            'administrador': 'admin',
        }
        normalized_role = role_map.get(new_role)

        if normalized_role is None:
            return Response({
                'error': 'Rol inválido. Roles válidos: student/instructor/admin'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Prevenir que un administrador se quite sus propios permisos
        if (user_to_update.id == request.user.id and 
            request.user.is_superuser and 
            normalized_role != 'admin'):
            return Response({
                'error': 'No puedes cambiar tu propio rol de administrador.'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Usar el método set_role del modelo para cambio seguro
            user_to_update.set_role(normalized_role)
            user_to_update.save()
            
            audit_logger.info(
                f"Role change: User {request.user.id} ({request.user.username}) "
                f"changed role of user {user_to_update.id} ({user_to_update.username}) to {normalized_role}"
            )
            
            serializer = self.get_serializer(user_to_update)
            return Response({
                'message': f'Rol actualizado exitosamente a {user_to_update.role_display}',
                'user': serializer.data
            })
            
        except (ValidationError, ValueError) as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def list_by_role(self, request):
        """Lista usuarios filtrados por rol (docentes y administradores)"""
        role = request.query_params.get('role')
        
        if not role:
            return Response({
                'error': 'Parámetro "role" requerido'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        valid_roles = ['student', 'instructor', 'admin']
        if role not in valid_roles:
            return Response({
                'error': f'Rol inválido. Roles válidos: {", ".join(valid_roles)}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        users = User.get_users_by_role(role)
        serializer = self.get_serializer(users, many=True)
        
        return Response({
            'role': role,
            'count': users.count(),
            'users': serializer.data
        })

    @action(detail=False, methods=['get'])
    def role_summary(self, request):
        """Resumen de usuarios por rol (solo administradores)"""
        if not request.user.is_superuser:
            return Response({
                'error': 'Solo los administradores pueden ver el resumen de roles.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        summary = {
            'total_users': User.objects.count(),
            'students': User.get_users_by_role('student').count(),
            'instructors': User.get_users_by_role('instructor').count(),
            'admins': User.get_users_by_role('admin').count(),
            'users_without_role': User.objects.filter(
                is_student=False, 
                is_instructor=False, 
                is_superuser=False
            ).count()
        }
        
        return Response(summary)

    @swagger_auto_schema(
        operation_description="Obtener estadísticas completas del dashboard administrativo",
        responses={
            200: openapi.Response(
                description="Estadísticas del sistema",
                examples={
                    "application/json": {
                        "users": {
                            "total": 14,
                            "active": 14,
                            "students": 11,
                            "instructors": 2,
                            "admins": 3
                        },
                        "courses": {
                            "total": 4,
                            "active": 4
                        },
                        "lessons": {
                            "total": 0
                        },
                        "quizzes": {
                            "total": 2
                        },
                        "forum": {
                            "topics": 4
                        },
                        "library": {
                            "files": 3
                        }
                    }
                }
            ),
            403: "Sin permisos de administrador"
        }
    )
    @action(detail=False, methods=['get'], permission_classes=[IsAdminUser])
    def dashboard_stats(self, request):
        """Obtener estadísticas completas para el dashboard administrativo"""
        try:
            # Estadísticas de usuarios
            total_users = User.objects.count()
            active_users = User.objects.filter(is_active=True).count()
            students = User.objects.filter(is_student=True).count()
            instructors = User.objects.filter(is_instructor=True).count()
            admins = User.objects.filter(is_superuser=True).count()
            
            # Estadísticas de cursos
            total_courses = Course.objects.count()
            active_courses = Course.objects.filter(is_active=True).count()
            
            # Estadísticas de lecciones
            total_lessons = Lesson.objects.count()
            
            # Estadísticas de quizzes
            total_quizzes = Quiz.objects.count()
            
            # Estadísticas del foro
            total_topics = ForumTopic.objects.count()
            
            # Estadísticas de la biblioteca
            total_files = LibraryFile.objects.count()
            
            stats = {
                'users': {
                    'total': total_users,
                    'active': active_users,
                    'students': students,
                    'instructors': instructors,
                    'admins': admins
                },
                'courses': {
                    'total': total_courses,
                    'active': active_courses
                },
                'lessons': {
                    'total': total_lessons
                },
                'quizzes': {
                    'total': total_quizzes
                },
                'forum': {
                    'topics': total_topics
                },
                'library': {
                    'files': total_files
                }
            }
            
            audit_logger.info(
                f"Dashboard stats requested by admin user {request.user.id} ({request.user.username})"
            )
            
            return Response(stats)
            
        except Exception as e:
            audit_logger.error(
                f"Error getting dashboard stats for user {request.user.id}: {str(e)}"
            )
            return Response({
                'error': 'Error al obtener estadísticas del dashboard'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def logout(self, request):
        try:
            refresh_token = request.data.get('refresh_token')
            if not refresh_token:
                return Response(
                    {'error': 'refresh_token es requerido'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            token = RefreshToken(refresh_token)
            try:
                token.blacklist()
            except (AttributeError, NotImplementedError):
                # Blacklist no configurado; mantener logout exitoso
                pass
            return Response({'message': 'Logout exitoso'})
        except TokenError:
            return Response(
                {'error': 'Token inválido'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception:
            return Response(
                {'error': 'Error al hacer logout'},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated], url_path='change-password')
    def change_password(self, request):
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')
        if not old_password or not new_password:
            return Response(
                {'error': 'old_password y new_password son requeridos'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not request.user.check_password(old_password):
            return Response(
                {'error': 'La contraseña actual es incorrecta'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            validate_password(new_password, user=request.user)
        except ValidationError as e:
            return Response({'error': e.messages}, status=status.HTTP_400_BAD_REQUEST)

        request.user.set_password(new_password)
        request.user.save()
        audit_logger.info(f"User {request.user.id} changed password")
        return Response({'message': 'Contraseña actualizada correctamente'})

    @action(detail=False, methods=['post'], permission_classes=[AllowAny], url_path='password-reset')
    def password_reset(self, request):
        email = request.data.get('email')
        if not email:
            return Response(
                {'error': 'email es requerido'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = User.objects.filter(email__iexact=email, is_active=True).first()
        response_data = {'message': 'Si el correo existe, se enviara un enlace de recuperacion.'}

        if user:
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            audit_logger.info(f"Password reset requested for user {user.id}")
            if settings.DEBUG:
                response_data.update({'uid': uid, 'token': token})

        return Response(response_data)

    @action(detail=False, methods=['post'], permission_classes=[AllowAny], url_path='password-reset-confirm')
    def password_reset_confirm(self, request):
        uid = request.data.get('uid')
        token = request.data.get('token')
        new_password = request.data.get('new_password')

        if not uid or not token or not new_password:
            return Response(
                {'error': 'uid, token y new_password son requeridos'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user_id = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=user_id, is_active=True)
        except (User.DoesNotExist, ValueError, TypeError):
            return Response({'error': 'Token o usuario invalido'}, status=status.HTTP_400_BAD_REQUEST)

        if not default_token_generator.check_token(user, token):
            return Response({'error': 'Token invalido o expirado'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            validate_password(new_password, user=user)
        except ValidationError as e:
            return Response({'error': e.messages}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        audit_logger.info(f"Password reset confirmed for user {user.id}")
        return Response({'message': 'Contrasena restablecida correctamente'})
