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
from django.contrib.auth import authenticate
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.core.exceptions import ValidationError
from .models import User
from .serializers import UserSerializer, UserRegistrationSerializer
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
        if self.action in ['create', 'login']:
            return [AllowAny()]
        elif self.action in ['list', 'destroy', 'update', 'partial_update']:
            return [CanManageUsers()]
        elif self.action == 'retrieve':
            return [IsOwnerOrInstructorOrAdmin()]
        elif self.action == 'update_role':
            return [IsAdminUser()]
        elif self.action in ['me', 'logout']:
            return [IsAuthenticated()]
        elif self.action == 'list_by_role':
            return [IsInstructorOrAdmin()]
        return [IsAuthenticated()]

    @swagger_auto_schema(
        operation_description="Obtener información del usuario autenticado",
        responses={
            200: openapi.Response(
                description="Información del usuario",
                schema=UserSerializer
            ),
            401: "No autenticado"
        }
    )
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        """Obtener información del usuario autenticado"""
        serializer = self.get_serializer(request.user)
        audit_logger.info(f"User {request.user.id} accessed profile")
        return Response(serializer.data)

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
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            return Response(
                {'error': 'Se requieren username y password'},
                status=status.HTTP_400_BAD_REQUEST
            )

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
        
        # Validar rol
        valid_roles = ['student', 'instructor', 'admin']
        if new_role not in valid_roles:
            return Response({
                'error': f'Rol inválido. Roles válidos: {", ".join(valid_roles)}'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Prevenir que un administrador se quite sus propios permisos
        if (user_to_update.id == request.user.id and 
            request.user.is_superuser and 
            new_role != 'admin'):
            return Response({
                'error': 'No puedes cambiar tu propio rol de administrador.'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Usar el método set_role del modelo para cambio seguro
            user_to_update.set_role(new_role)
            user_to_update.save()
            
            audit_logger.info(
                f"Role change: User {request.user.id} ({request.user.username}) "
                f"changed role of user {user_to_update.id} ({user_to_update.username}) to {new_role}"
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
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'message': 'Logout exitoso'})
        except Exception as e:
            return Response(
                {'error': 'Error al hacer logout'},
                status=status.HTTP_400_BAD_REQUEST
            )
