"""
Tests para el modelo User y funcionalidades relacionadas
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from rest_framework.test import APITestCase
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from users.models import User
from users.serializers import UserSerializer, UserRegistrationSerializer

User = get_user_model()

class UserModelTest(TestCase):
    """Tests para el modelo User"""

    def setUp(self):
        """Configuración inicial para cada test"""
        self.user_data = {
            'username': 'testuser',
            'email': 'test@ifap.edu.pe',
            'first_name': 'Test',
            'last_name': 'User',
            'password': 'TestPassword123!'
        }

    def test_create_student_user(self):
        """Test para crear un usuario estudiante"""
        user = User.objects.create_user(
            **self.user_data,
            is_student=True
        )
        
        self.assertTrue(user.is_student)
        self.assertFalse(user.is_instructor)
        self.assertFalse(user.is_superuser)
        self.assertEqual(user.role_name, 'estudiante')

    def test_create_instructor_user(self):
        """Test para crear un usuario instructor"""
        user = User.objects.create_user(
            **self.user_data,
            is_instructor=True,
            is_student=False
        )
        
        self.assertTrue(user.is_instructor)
        self.assertFalse(user.is_student)
        self.assertEqual(user.role_name, 'docente')

    def test_create_admin_user(self):
        """Test para crear un usuario administrador"""
        user = User.objects.create_superuser(
            **self.user_data
        )
        
        self.assertTrue(user.is_superuser)
        self.assertTrue(user.is_staff)
        self.assertEqual(user.role_name, 'administrador')

    def test_user_role_validation(self):
        """Test para validación de roles únicos"""
        with self.assertRaises(ValidationError):
            user = User(**self.user_data, is_student=True, is_instructor=True)
            user.clean()

    def test_user_string_representation(self):
        """Test para la representación string del usuario"""
        user = User(**self.user_data)
        expected = f"{user.first_name} {user.last_name} ({user.username})"
        self.assertEqual(str(user), expected)

    def test_user_permissions_methods(self):
        """Test para métodos de permisos del usuario"""
        # Usuario estudiante
        student = User.objects.create_user(**self.user_data, is_student=True)
        self.assertFalse(student.can_manage_users())
        self.assertFalse(student.can_manage_courses())
        
        # Usuario instructor
        instructor_data = self.user_data.copy()
        instructor_data['username'] = 'instructor'
        instructor = User.objects.create_user(**instructor_data, is_instructor=True, is_student=False)
        self.assertFalse(instructor.can_manage_users())
        self.assertTrue(instructor.can_manage_courses())
        
        # Usuario admin
        admin_data = self.user_data.copy()
        admin_data['username'] = 'admin'
        admin = User.objects.create_superuser(**admin_data)
        self.assertTrue(admin.can_manage_users())
        self.assertTrue(admin.can_manage_courses())

    def test_set_role_method(self):
        """Test para el método set_role"""
        user = User.objects.create_user(**self.user_data)
        
        # Establecer como estudiante
        user.set_role('student')
        self.assertTrue(user.is_student)
        self.assertFalse(user.is_instructor)
        
        # Establecer como instructor
        user.set_role('instructor')
        self.assertTrue(user.is_instructor)
        self.assertFalse(user.is_student)
        
        # Establecer como admin
        user.set_role('admin')
        self.assertTrue(user.is_superuser)
        self.assertTrue(user.is_staff)

    def test_get_users_by_role(self):
        """Test para el método get_users_by_role"""
        # Crear usuarios con diferentes roles
        student = User.objects.create_user(username='student', is_student=True)
        instructor = User.objects.create_user(username='instructor', is_instructor=True, is_student=False)
        admin = User.objects.create_superuser(username='admin')
        
        # Verificar filtros
        students = User.get_users_by_role('student')
        instructors = User.get_users_by_role('instructor')
        admins = User.get_users_by_role('admin')
        
        self.assertIn(student, students)
        self.assertIn(instructor, instructors)
        self.assertIn(admin, admins)


class UserAPITest(APITestCase):
    """Tests para las APIs de Usuario"""

    def setUp(self):
        """Configuración inicial para tests de API"""
        self.student_data = {
            'username': 'student',
            'email': 'student@ifap.edu.pe',
            'first_name': 'Student',
            'last_name': 'Test',
            'password': 'TestPassword123!'
        }
        
        self.instructor_data = {
            'username': 'instructor',
            'email': 'instructor@ifap.edu.pe',
            'first_name': 'Instructor',
            'last_name': 'Test',
            'password': 'TestPassword123!'
        }
        
        # Crear usuarios de prueba
        self.student = User.objects.create_user(**self.student_data, is_student=True)
        self.instructor = User.objects.create_user(**self.instructor_data, is_instructor=True, is_student=False)
        self.admin = User.objects.create_superuser(
            username='admin',
            email='admin@ifap.edu.pe',
            password='AdminPassword123!'
        )

    def get_jwt_token(self, user):
        """Obtener token JWT para un usuario"""
        refresh = RefreshToken.for_user(user)
        return str(refresh.access_token)

    def test_user_registration(self):
        """Test para registro de usuario"""
        url = '/api/users/register/'
        data = {
            'username': 'newuser',
            'email': 'newuser@ifap.edu.pe',
            'first_name': 'New',
            'last_name': 'User',
            'password': 'NewPassword123!',
            'confirm_password': 'NewPassword123!'
        }
        
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username='newuser').exists())

    def test_user_login(self):
        """Test para login de usuario"""
        url = '/api/users/login/'
        data = {
            'username': self.student.username,
            'password': 'TestPassword123!'
        }
        
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_user_profile_access(self):
        """Test para acceso al perfil de usuario"""
        url = '/api/users/me/'
        token = self.get_jwt_token(self.student)
        
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], self.student.username)

    def test_user_list_permissions(self):
        """Test para permisos de lista de usuarios"""
        url = '/api/users/'
        
        # Sin autenticación
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        
        # Como estudiante
        token = self.get_jwt_token(self.student)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
        # Como admin
        token = self.get_jwt_token(self.admin)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_user_role_update(self):
        """Test para actualización de rol de usuario"""
        url = f'/api/users/{self.student.id}/update_role/'
        token = self.get_jwt_token(self.admin)
        
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.post(url, {'role': 'instructor'}, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verificar que el rol se actualizó
        self.student.refresh_from_db()
        self.assertTrue(self.student.is_instructor)
        self.assertFalse(self.student.is_student)

    def test_user_serializer_validation(self):
        """Test para validación del serializer"""
        # Datos inválidos
        invalid_data = {
            'username': '',  # Username vacío
            'email': 'invalid-email',  # Email inválido
            'password': '123'  # Password muy corto
        }
        
        serializer = UserRegistrationSerializer(data=invalid_data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('username', serializer.errors)
        self.assertIn('email', serializer.errors)

    def test_password_validation(self):
        """Test para validación de contraseñas"""
        url = '/api/users/register/'
        
        # Contraseña muy corta
        data = self.student_data.copy()
        data['username'] = 'testuser1'
        data['password'] = '123'
        data['confirm_password'] = '123'
        
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        # Contraseñas no coinciden
        data['password'] = 'ValidPassword123!'
        data['confirm_password'] = 'DifferentPassword123!'
        
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)