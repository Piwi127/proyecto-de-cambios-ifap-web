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

audit_logger = logging.getLogger('audit')

# Vista para el registro de usuarios
@method_decorator(csrf_exempt, name='dispatch')
class UserRegisterView(CreateAPIView):
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]
    authentication_classes = []

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

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

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

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
