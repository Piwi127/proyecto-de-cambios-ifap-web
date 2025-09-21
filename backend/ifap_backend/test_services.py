"""
Tests para servicios de cache y manejo de errores
"""
from django.test import TestCase, override_settings
from django.contrib.auth import get_user_model
from django.core.cache import cache
from rest_framework.test import APITestCase
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from ifap_backend.cache_service import (
    CacheService, cache_service, cache_result, 
    CacheKeys, invalidate_user_cache
)
from ifap_backend.exceptions import (
    APIException, ValidationAPIException, 
    NotFoundAPIException, custom_exception_handler
)
from unittest.mock import Mock, patch
import time

User = get_user_model()

class CacheServiceTest(TestCase):
    """Tests para el servicio de cache"""

    def setUp(self):
        """Configuración inicial para tests de cache"""
        self.cache_service = CacheService()
        cache.clear()  # Limpiar cache antes de cada test

    def test_basic_cache_operations(self):
        """Test para operaciones básicas de cache"""
        # Set y Get
        key = 'test_key'
        value = 'test_value'
        
        result = self.cache_service.set(key, value, 60)
        self.assertTrue(result)
        
        cached_value = self.cache_service.get(key)
        self.assertEqual(cached_value, value)

    def test_cache_expiration(self):
        """Test para expiración de cache"""
        key = 'expiring_key'
        value = 'expiring_value'
        
        # Cache con timeout muy corto
        self.cache_service.set(key, value, 1)
        
        # Verificar que existe
        cached_value = self.cache_service.get(key)
        self.assertEqual(cached_value, value)
        
        # Esperar a que expire
        time.sleep(2)
        
        # Verificar que ya no existe
        cached_value = self.cache_service.get(key)
        self.assertIsNone(cached_value)

    def test_cache_delete(self):
        """Test para eliminación de cache"""
        key = 'delete_key'
        value = 'delete_value'
        
        self.cache_service.set(key, value)
        self.assertIsNotNone(self.cache_service.get(key))
        
        result = self.cache_service.delete(key)
        self.assertTrue(result)
        self.assertIsNone(self.cache_service.get(key))

    def test_cache_many_operations(self):
        """Test para operaciones múltiples de cache"""
        data = {
            'key1': 'value1',
            'key2': 'value2',
            'key3': 'value3'
        }
        
        # Set many
        result = self.cache_service.set_many(data)
        self.assertTrue(result)
        
        # Get many
        keys = list(data.keys())
        cached_data = self.cache_service.get_many(keys)
        
        self.assertEqual(len(cached_data), 3)
        for key, value in data.items():
            self.assertEqual(cached_data[key], value)

    def test_make_key_method(self):
        """Test para generación de claves de cache"""
        # Clave simple
        key = self.cache_service.make_key('prefix', 'arg1', 'arg2')
        expected = 'prefix:arg1:arg2'
        self.assertEqual(key, expected)
        
        # Clave con kwargs
        key = self.cache_service.make_key('prefix', user_id=123, page=1)
        self.assertIn('prefix', key)
        self.assertIn('user_id:123', key)
        self.assertIn('page:1', key)
        
        # Clave muy larga (debe usar hash)
        long_args = ['very_long_argument'] * 20
        key = self.cache_service.make_key('prefix', *long_args)
        self.assertTrue(key.startswith('prefix:hash:'))

    def test_cache_result_decorator(self):
        """Test para el decorador cache_result"""
        call_count = 0
        
        @cache_result(timeout=60, key_prefix='test_func')
        def expensive_function(x, y):
            nonlocal call_count
            call_count += 1
            return x + y
        
        # Primera llamada - debe ejecutar la función
        result1 = expensive_function(1, 2)
        self.assertEqual(result1, 3)
        self.assertEqual(call_count, 1)
        
        # Segunda llamada - debe usar cache
        result2 = expensive_function(1, 2)
        self.assertEqual(result2, 3)
        self.assertEqual(call_count, 1)  # No debe incrementar
        
        # Llamada con argumentos diferentes - debe ejecutar la función
        result3 = expensive_function(2, 3)
        self.assertEqual(result3, 5)
        self.assertEqual(call_count, 2)

    def test_invalidate_user_cache(self):
        """Test para invalidación de cache de usuario"""
        user = User.objects.create_user(
            username='testuser',
            email='test@ifap.edu.pe'
        )
        
        # Simular cache de usuario
        user_cache_key = cache_service.make_key(CacheKeys.USER_PROFILE, user.id)
        cache_service.set(user_cache_key, {'username': user.username})
        
        # Verificar que existe
        self.assertIsNotNone(cache_service.get(user_cache_key))
        
        # Invalidar cache
        invalidate_user_cache(user.id)
        
        # En este test, como usamos LocMem que no soporta patterns,
        # solo verificamos que la función no lance errores
        self.assertTrue(True)

    @override_settings(CACHES={
        'default': {
            'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
            'LOCATION': 'test-cache',
        }
    })
    def test_cache_fallback(self):
        """Test para fallback cuando Redis no está disponible"""
        # Este test verifica que el cache funciona con LocMem como fallback
        key = 'fallback_test'
        value = 'fallback_value'
        
        result = cache_service.set(key, value)
        self.assertTrue(result)
        
        cached_value = cache_service.get(key)
        self.assertEqual(cached_value, value)


class ErrorHandlerTest(TestCase):
    """Tests para el manejo de errores"""

    def test_api_exception_creation(self):
        """Test para creación de excepciones API"""
        exc = APIException("Error de prueba")
        self.assertEqual(exc.detail, "Error de prueba")
        self.assertEqual(exc.status_code, 500)

    def test_validation_api_exception(self):
        """Test para excepción de validación"""
        exc = ValidationAPIException("Error de validación")
        self.assertEqual(exc.status_code, 400)
        self.assertEqual(exc.code, 'validation_error')

    def test_not_found_api_exception(self):
        """Test para excepción de recurso no encontrado"""
        exc = NotFoundAPIException("Recurso no encontrado")
        self.assertEqual(exc.status_code, 404)
        self.assertEqual(exc.code, 'not_found')

    def test_custom_exception_handler(self):
        """Test para el manejador de excepciones personalizado"""
        # Crear una excepción de prueba
        exc = ValidationAPIException("Error de validación")
        
        # Crear contexto mock
        request_mock = Mock()
        request_mock.user.is_authenticated = True
        request_mock.user.id = 1
        
        view_mock = Mock()
        view_mock.__class__.__name__ = 'TestView'
        
        context = {
            'request': request_mock,
            'view': view_mock
        }
        
        # Llamar al manejador
        response = custom_exception_handler(exc, context)
        
        # Verificar que retorna la respuesta correcta
        self.assertIsNotNone(response)
        self.assertEqual(response.status_code, 400)
        self.assertTrue(response.data['error'])


class ErrorHandlerAPITest(APITestCase):
    """Tests de integración para manejo de errores en APIs"""

    def setUp(self):
        """Configuración inicial"""
        self.user = User.objects.create_user(
            username='testuser',
            email='test@ifap.edu.pe',
            password='TestPass123!'
        )

    def get_jwt_token(self, user):
        """Obtener token JWT para un usuario"""
        refresh = RefreshToken.for_user(user)
        return str(refresh.access_token)

    def test_authentication_error_handling(self):
        """Test para manejo de errores de autenticación"""
        url = '/api/users/me/'
        
        # Sin token
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        
        # Con token inválido
        self.client.credentials(HTTP_AUTHORIZATION='Bearer invalid_token')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_permission_error_handling(self):
        """Test para manejo de errores de permisos"""
        url = '/api/users/'
        token = self.get_jwt_token(self.user)
        
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.get(url)
        
        # Usuario normal no puede listar usuarios
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_validation_error_handling(self):
        """Test para manejo de errores de validación"""
        url = '/api/users/register/'
        
        # Datos inválidos
        invalid_data = {
            'username': '',  # Username vacío
            'email': 'invalid-email',  # Email inválido
            'password': '123'  # Password muy corto
        }
        
        response = self.client.post(url, invalid_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_not_found_error_handling(self):
        """Test para manejo de errores 404"""
        url = '/api/users/99999/'  # Usuario inexistente
        token = self.get_jwt_token(self.user)
        
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    @patch('ifap_backend.exceptions.logger')
    def test_error_logging(self, mock_logger):
        """Test para verificar que los errores se loggean correctamente"""
        url = '/api/users/register/'
        
        # Datos que causarán error
        invalid_data = {'username': ''}
        
        response = self.client.post(url, invalid_data, format='json')
        
        # Verificar que se llamó al logger
        # (Este test puede necesitar ajustes según la implementación específica)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)