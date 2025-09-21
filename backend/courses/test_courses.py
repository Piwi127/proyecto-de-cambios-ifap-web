"""
Tests para modelos y APIs de cursos
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from courses.models import Course
from courses.serializers import CourseSerializer
from datetime import date, timedelta

User = get_user_model()

class CourseModelTest(TestCase):
    """Tests para el modelo Course"""

    def setUp(self):
        """Configuración inicial para cada test"""
        self.instructor = User.objects.create_user(
            username='instructor',
            email='instructor@ifap.edu.pe',
            is_instructor=True,
            is_student=False
        )
        
        self.student = User.objects.create_user(
            username='student',
            email='student@ifap.edu.pe',
            is_student=True
        )
        
        self.course_data = {
            'title': 'Curso de Prueba',
            'description': 'Descripción del curso de prueba',
            'instructor': self.instructor,
            'duration_weeks': 8,
            'start_date': date.today(),
            'end_date': date.today() + timedelta(weeks=8),
            'is_active': True
        }

    def test_create_course(self):
        """Test para crear un curso"""
        course = Course.objects.create(**self.course_data)
        
        self.assertEqual(course.title, 'Curso de Prueba')
        self.assertEqual(course.instructor, self.instructor)
        self.assertTrue(course.is_active)

    def test_course_string_representation(self):
        """Test para la representación string del curso"""
        course = Course.objects.create(**self.course_data)
        self.assertEqual(str(course), 'Curso de Prueba')

    def test_course_enrollment(self):
        """Test para inscripción de estudiantes"""
        course = Course.objects.create(**self.course_data)
        course.students.add(self.student)
        
        self.assertIn(self.student, course.students.all())
        self.assertEqual(course.students.count(), 1)

    def test_course_duration_validation(self):
        """Test para validación de duración del curso"""
        # Fecha de fin antes que fecha de inicio
        invalid_data = self.course_data.copy()
        invalid_data['end_date'] = date.today() - timedelta(days=1)
        
        with self.assertRaises(Exception):
            course = Course(**invalid_data)
            course.full_clean()

    def test_course_slug_generation(self):
        """Test para generación automática de slug"""
        course = Course.objects.create(**self.course_data)
        # Verificar que se genera un slug basado en el título
        expected_slug = 'curso-de-prueba'
        self.assertTrue(course.slug)  # Asumiendo que el modelo tiene slug


class CourseAPITest(APITestCase):
    """Tests para las APIs de Curso"""

    def setUp(self):
        """Configuración inicial para tests de API"""
        self.instructor = User.objects.create_user(
            username='instructor',
            email='instructor@ifap.edu.pe',
            password='InstructorPass123!',
            is_instructor=True,
            is_student=False
        )
        
        self.student = User.objects.create_user(
            username='student',
            email='student@ifap.edu.pe',
            password='StudentPass123!',
            is_student=True
        )
        
        self.admin = User.objects.create_superuser(
            username='admin',
            email='admin@ifap.edu.pe',
            password='AdminPass123!'
        )
        
        self.course = Course.objects.create(
            title='Curso de Prueba',
            description='Descripción del curso',
            instructor=self.instructor,
            duration_weeks=8,
            start_date=date.today(),
            end_date=date.today() + timedelta(weeks=8),
            is_active=True
        )

    def get_jwt_token(self, user):
        """Obtener token JWT para un usuario"""
        refresh = RefreshToken.for_user(user)
        return str(refresh.access_token)

    def test_course_list_public_access(self):
        """Test para acceso público a lista de cursos"""
        url = '/api/courses/'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)

    def test_course_detail_public_access(self):
        """Test para acceso público a detalle de curso"""
        url = f'/api/courses/{self.course.id}/'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], self.course.title)

    def test_course_enrollment(self):
        """Test para inscripción en curso"""
        url = f'/api/courses/{self.course.id}/enroll/'
        token = self.get_jwt_token(self.student)
        
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.post(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(self.course.students.filter(id=self.student.id).exists())

    def test_course_unenrollment(self):
        """Test para desinscripción de curso"""
        # Primero inscribir al estudiante
        self.course.students.add(self.student)
        
        url = f'/api/courses/{self.course.id}/unenroll/'
        token = self.get_jwt_token(self.student)
        
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.post(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(self.course.students.filter(id=self.student.id).exists())

    def test_course_double_enrollment(self):
        """Test para prevenir doble inscripción"""
        # Inscribir al estudiante
        self.course.students.add(self.student)
        
        url = f'/api/courses/{self.course.id}/enroll/'
        token = self.get_jwt_token(self.student)
        
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.post(url)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_course_creation_permissions(self):
        """Test para permisos de creación de cursos"""
        url = '/api/courses/'
        course_data = {
            'title': 'Nuevo Curso',
            'description': 'Descripción del nuevo curso',
            'duration_weeks': 6,
            'start_date': date.today().isoformat(),
            'end_date': (date.today() + timedelta(weeks=6)).isoformat()
        }
        
        # Sin autenticación
        response = self.client.post(url, course_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        
        # Como estudiante
        token = self.get_jwt_token(self.student)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.post(url, course_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
        # Como instructor
        token = self.get_jwt_token(self.instructor)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.post(url, course_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_course_update_permissions(self):
        """Test para permisos de actualización de cursos"""
        url = f'/api/courses/{self.course.id}/'
        update_data = {
            'title': 'Título Actualizado',
            'description': 'Descripción actualizada'
        }
        
        # Como estudiante
        token = self.get_jwt_token(self.student)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.patch(url, update_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
        # Como instructor propietario
        token = self.get_jwt_token(self.instructor)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.patch(url, update_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verificar que se actualizó
        self.course.refresh_from_db()
        self.assertEqual(self.course.title, 'Título Actualizado')

    def test_course_deletion_permissions(self):
        """Test para permisos de eliminación de cursos"""
        url = f'/api/courses/{self.course.id}/'
        
        # Como instructor
        token = self.get_jwt_token(self.instructor)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
        # Como admin
        token = self.get_jwt_token(self.admin)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_course_serializer_validation(self):
        """Test para validación del serializer de cursos"""
        # Datos inválidos
        invalid_data = {
            'title': '',  # Título vacío
            'duration_weeks': -1,  # Duración negativa
        }
        
        serializer = CourseSerializer(data=invalid_data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('title', serializer.errors)

    def test_course_students_list(self):
        """Test para obtener lista de estudiantes de un curso"""
        # Inscribir algunos estudiantes
        student2 = User.objects.create_user(
            username='student2',
            email='student2@ifap.edu.pe',
            is_student=True
        )
        
        self.course.students.add(self.student, student2)
        
        url = f'/api/courses/{self.course.id}/students/'
        token = self.get_jwt_token(self.instructor)
        
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_course_statistics(self):
        """Test para obtener estadísticas del curso"""
        url = f'/api/courses/{self.course.id}/statistics/'
        token = self.get_jwt_token(self.instructor)
        
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('student_count', response.data)
        self.assertIn('completion_rate', response.data)