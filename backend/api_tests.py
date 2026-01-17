#!/usr/bin/env python3
"""
Script de pruebas exhaustivas para todos los endpoints API del proyecto IFAP
"""
import os
import sys
import json
import time
import requests
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
import psutil
import logging

# Configuración de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('api_tests.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

class APITester:
    """Clase para realizar pruebas exhaustivas de la API"""

    def __init__(self, base_url: str = "http://localhost:8000/api"):
        self.base_url = base_url
        self.session = requests.Session()
        self.test_results = {
            'total_tests': 0,
            'passed_tests': 0,
            'failed_tests': 0,
            'errors': [],
            'performance_metrics': {},
            'security_issues': []
        }
        self.auth_tokens = {}
        self.created_course_id = None

    def log_test_result(self, test_name: str, success: bool, details: str = "", response_time: float = 0):
        """Registrar resultado de una prueba"""
        self.test_results['total_tests'] += 1
        if success:
            self.test_results['passed_tests'] += 1
            logger.info(f"✅ {test_name} - PASSED ({response_time:.2f}s)")
        else:
            self.test_results['failed_tests'] += 1
            error_msg = f"❌ {test_name} - FAILED ({response_time:.2f}s): {details}"
            logger.error(error_msg)
            self.test_results['errors'].append(error_msg)

    def make_request(self, method: str, endpoint: str, **kwargs) -> Tuple[requests.Response, float]:
        """Realizar una petición HTTP con medición de tiempo"""
        if endpoint.startswith('http://') or endpoint.startswith('https://'):
            url = endpoint
        else:
            url = f"{self.base_url}{endpoint}"

        # Agregar headers de autenticación si están disponibles
        if hasattr(self, 'auth_headers') and self.auth_headers:
            headers = kwargs.get('headers', {})
            headers.update(self.auth_headers)
            kwargs['headers'] = headers

        start_time = time.time()
        try:
            response = self.session.request(method, url, timeout=10, **kwargs)
            response_time = time.time() - start_time
            return response, response_time
        except requests.exceptions.RequestException as e:
            response_time = time.time() - start_time
            # Crear una respuesta mock para errores de conexión
            response = requests.Response()
            response.status_code = 0
            response._content = str(e).encode()
            return response, response_time

    def test_health_endpoints(self):
        """Probar endpoints de health check"""
        logger.info("\n🩺 Probando endpoints de Health Check...")

        # Health check básico
        response, response_time = self.make_request('GET', '/health-check/')
        success = response.status_code == 200
        self.log_test_result("Health Check Básico", success,
                           f"Status: {response.status_code}", response_time)

        # Health check detallado
        # Verificar estructura de respuesta
        if response.status_code == 200:
            try:
                data = response.json()
                required_fields = ['status']
                success = all(field in data for field in required_fields)
                self.log_test_result("Estructura Health Check", success,
                                   "Verificación de campos requeridos")
            except:
                self.log_test_result("Estructura Health Check", False,
                                   "Respuesta no es JSON válido")

    def test_swagger_documentation(self):
        """Probar documentación Swagger"""
        logger.info("\n📚 Probando documentación Swagger...")

        base_root = self.base_url
        if base_root.endswith('/api'):
            base_root = base_root[:-4]
        response, response_time = self.make_request('GET', f'{base_root}/swagger/')
        success = response.status_code == 200
        self.log_test_result("Documentación Swagger", success,
                           f"Status: {response.status_code}", response_time)

    def test_authentication_endpoints(self):
        """Probar endpoints de autenticación"""
        logger.info("\n🔐 Probando endpoints de Autenticación...")

        # Datos de prueba
        test_user = {
            "username": f"testuser_{int(time.time())}",
            "email": f"test_{int(time.time())}@example.com",
            "password": "testpass123",
            "first_name": "Test",
            "last_name": "User",
            "perfil": "instructor"
        }

        # 1. Registro de usuario
        response, response_time = self.make_request('POST', '/users/register/',
                                                 json=test_user)
        success = response.status_code == 201
        self.log_test_result("Registro de Usuario", success,
                           f"Status: {response.status_code}", response_time)

        if success:
            try:
                response.json()
            except:
                self.log_test_result("Registro - JSON", False,
                                   "Respuesta no es JSON válido")

        # 2. Login con credenciales correctas
        login_data = {
            "username": test_user["username"],
            "password": test_user["password"]
        }
        response, response_time = self.make_request('POST', '/users/login/',
                                                 json=login_data)
        success = response.status_code == 200
        self.log_test_result("Login Correcto", success,
                           f"Status: {response.status_code}", response_time)
        if success:
            try:
                data = response.json()
                tokens = data.get('tokens', {})
                access_token = tokens.get('access')
                refresh_token = tokens.get('refresh')
                if access_token and refresh_token:
                    self.auth_tokens['access'] = access_token
                    self.auth_tokens['refresh'] = refresh_token
                    self.auth_headers = {'Authorization': f"Bearer {access_token}"}
                    logger.info("✅ Tokens de autenticación obtenidos correctamente")
                else:
                    self.log_test_result("Login - Tokens", False,
                                       "Tokens no encontrados en respuesta")
            except:
                self.log_test_result("Login - JSON", False,
                                   "Respuesta no es JSON válido")

        # 3. Login con credenciales incorrectas
        wrong_login_data = {
            "username": test_user["username"],
            "password": "wrongpassword"
        }
        response, response_time = self.make_request('POST', '/users/login/',
                                                 json=wrong_login_data)
        success = response.status_code == 401
        self.log_test_result("Login Incorrecto", success,
                           f"Status: {response.status_code}", response_time)

        # 4. Usuario actual (requiere autenticación)
        if hasattr(self, 'auth_headers'):
            response, response_time = self.make_request('GET', '/users/me/')
            success = response.status_code == 200
            self.log_test_result("Usuario Actual", success,
                               f"Status: {response.status_code}", response_time)

        # 5. Logout
        if self.auth_tokens.get('refresh'):
            response, response_time = self.make_request(
                'POST',
                '/users/logout/',
                json={'refresh_token': self.auth_tokens.get('refresh')}
            )
            success = response.status_code == 200
            self.log_test_result("Logout", success,
                               f"Status: {response.status_code}", response_time)

    def test_course_endpoints(self):
        """Probar endpoints de cursos"""
        logger.info("\n📚 Probando endpoints de Cursos...")

        # Crear curso de prueba
        course_data = {
            "title": f"Curso de Prueba {int(time.time())}",
            "description": "Descripción del curso de prueba",
            "category": "Test Category",
            "difficulty_level": "beginner",
            "estimated_duration": 60,
            "is_active": True
        }

        # 1. Crear curso
        response, response_time = self.make_request('POST', '/courses/',
                                                 json=course_data)
        success = response.status_code == 201
        self.log_test_result("Crear Curso", success,
                           f"Status: {response.status_code}", response_time)

        course_id = None
        if success:
            try:
                data = response.json()
                course_id = data.get('id')
                self.created_course_id = course_id
                logger.info(f"✅ Curso creado con ID: {course_id}")
            except:
                self.log_test_result("Crear Curso - JSON", False,
                                   "Respuesta no es JSON válido")

        # 2. Listar cursos
        response, response_time = self.make_request('GET', '/courses/')
        success = response.status_code == 200
        self.log_test_result("Listar Cursos", success,
                           f"Status: {response.status_code}", response_time)

        # 3. Obtener curso específico
        if course_id:
            response, response_time = self.make_request('GET', f'/courses/{course_id}/')
            success = response.status_code == 200
            self.log_test_result("Obtener Curso", success,
                               f"Status: {response.status_code}", response_time)

        # 4. Actualizar curso
        if course_id:
            update_data = {"title": "Curso Actualizado"}
            response, response_time = self.make_request('PATCH', f'/courses/{course_id}/',
                                                     json=update_data)
            success = response.status_code == 200
            self.log_test_result("Actualizar Curso", success,
                               f"Status: {response.status_code}", response_time)

        # 5. Eliminar curso (usar uno separado para no romper pruebas dependientes)
        delete_course_data = {
            "title": f"Curso para Eliminar {int(time.time())}",
            "description": "Curso de prueba para eliminación",
            "category": "Test Category",
            "difficulty_level": "beginner",
            "estimated_duration": 60,
            "is_active": True
        }
        response, _ = self.make_request('POST', '/courses/', json=delete_course_data)
        delete_course_id = None
        if response.status_code == 201:
            try:
                delete_course_id = response.json().get('id')
            except:
                delete_course_id = None
        if delete_course_id:
            response, response_time = self.make_request('DELETE', f'/courses/{delete_course_id}/')
            success = response.status_code == 204
            self.log_test_result("Eliminar Curso", success,
                               f"Status: {response.status_code}", response_time)

    def test_admin_course_endpoints(self):
        """Probar endpoints administrativos de cursos"""
        logger.info("\n👨‍💼 Probando endpoints administrativos de Cursos...")

        endpoints = [
            ('/courses/admin/all/', 'Cursos Admin - Todos'),
            ('/courses/admin/inactive/', 'Cursos Admin - Inactivos'),
            ('/courses/admin/metrics/', 'Cursos Admin - Métricas'),
            ('/courses/admin/instructor-stats/', 'Cursos Admin - Stats Instructor')
        ]

        for endpoint, test_name in endpoints:
            response, response_time = self.make_request('GET', endpoint)
            success = response.status_code in [200, 403]
            self.log_test_result(test_name, success,
                               f"Status: {response.status_code}", response_time)

    def test_bulk_course_operations(self):
        """Probar operaciones masivas de cursos"""
        logger.info("\n📦 Probando operaciones masivas de Cursos...")

        # Crear múltiples cursos para pruebas masivas
        courses_data = [
            {
                "title": f"Curso Masivo {i} {int(time.time())}",
                "description": f"Descripción del curso masivo {i}",
                "category": "Bulk Test",
                "difficulty_level": "beginner",
                "estimated_duration": 30,
                "is_active": True
            }
            for i in range(3)
        ]

        course_ids = []
        for course_data in courses_data:
            response, response_time = self.make_request('POST', '/courses/',
                                                     json=course_data)
            if response.status_code == 201:
                try:
                    data = response.json()
                    course_ids.append(data.get('id'))
                except:
                    pass

        # Operaciones masivas
        bulk_operations = [
            ('/courses/bulk-activate/', 'Activación Masiva', {'course_ids': course_ids}),
            ('/courses/bulk-deactivate/', 'Desactivación Masiva', {'course_ids': course_ids}),
        ]

        for endpoint, test_name, data in bulk_operations:
            response, response_time = self.make_request('POST', endpoint, json=data)
            success = response.status_code in [200, 403]
            self.log_test_result(test_name, success,
                               f"Status: {response.status_code}", response_time)

        # Eliminación masiva
        if course_ids:
            response, response_time = self.make_request('POST', '/courses/bulk-delete/',
                                                     json={'course_ids': course_ids})
            success = response.status_code in [200, 403]
            self.log_test_result("Eliminación Masiva", success,
                               f"Status: {response.status_code}", response_time)

    def test_lesson_endpoints(self):
        """Probar endpoints de lecciones"""
        logger.info("\n📖 Probando endpoints de Lecciones...")

        # Crear curso primero para asociar lección
        course_data = {
            "title": f"Curso para Lecciones {int(time.time())}",
            "description": "Curso de prueba para lecciones",
            "category": "Test",
            "difficulty_level": "beginner",
            "estimated_duration": 60,
            "is_active": True
        }

        course_id = self.created_course_id
        if not course_id:
            response, _ = self.make_request('POST', '/courses/', json=course_data)
            if response.status_code == 201:
                try:
                    data = response.json()
                    course_id = data.get('id')
                except:
                    pass

        if course_id:
            lesson_data = {
                "title": "Lección de Prueba",
                "description": "Descripción de la lección de prueba",
                "course": course_id,
                "order": 1,
                "duration_minutes": 30
            }

            # CRUD de lecciones
            operations = [
                ('POST', '/lessons/', lesson_data, 'Crear Lección'),
                ('GET', '/lessons/', None, 'Listar Lecciones'),
            ]

            for method, endpoint, data, test_name in operations:
                if data:
                    response, response_time = self.make_request(method, endpoint, json=data)
                else:
                    response, response_time = self.make_request(method, endpoint)

                success = response.status_code in [200, 201]
                self.log_test_result(test_name, success,
                                   f"Status: {response.status_code}", response_time)

    def test_quiz_endpoints(self):
        """Probar endpoints de quizzes"""
        logger.info("\n📝 Probando endpoints de Quizzes...")

        # Crear quiz
        course_id = self.created_course_id
        if not course_id:
            course_data = {
                "title": f"Curso para Quizzes {int(time.time())}",
                "description": "Curso de prueba para quizzes",
                "category": "Test",
                "difficulty_level": "beginner",
                "estimated_duration": 60,
                "is_active": True
            }
            response, _ = self.make_request('POST', '/courses/', json=course_data)
            if response.status_code == 201:
                try:
                    course_id = response.json().get('id')
                except:
                    course_id = None

        quiz_data = {
            "title": f"Quiz de Prueba {int(time.time())}",
            "description": "Quiz para testing",
            "course": course_id or 1,
            "time_limit": 30,
            "passing_score": 70,
            "is_active": True
        }

        response, response_time = self.make_request('POST', '/quizzes/', json=quiz_data)
        success = response.status_code == 201
        self.log_test_result("Crear Quiz", success,
                           f"Status: {response.status_code}", response_time)

        quiz_id = None
        if success:
            try:
                data = response.json()
                quiz_id = data.get('id')
            except:
                pass

        # Probar otros endpoints de quiz
        quiz_endpoints = [
            ('/quizzes/questions/', 'Preguntas'),
            ('/quizzes/attempts/', 'Intentos'),
            ('/quizzes/stats/user_stats/', 'Estadísticas'),
        ]

        for endpoint, test_name in quiz_endpoints:
            response, response_time = self.make_request('GET', endpoint)
            success = response.status_code == 200
            self.log_test_result(f"Listar {test_name}", success,
                               f"Status: {response.status_code}", response_time)

    def test_notification_endpoints(self):
        """Probar endpoints de notificaciones"""
        logger.info("\n🔔 Probando endpoints de Notificaciones...")

        endpoints = [
            ('/notifications/', 'Lista de Notificaciones'),
        ]

        for endpoint, test_name in endpoints:
            response, response_time = self.make_request('GET', endpoint)
            success = response.status_code == 200
            self.log_test_result(test_name, success,
                               f"Status: {response.status_code}", response_time)

    def test_forum_endpoints(self):
        """Probar endpoints de foro"""
        logger.info("\n💬 Probando endpoints de Foro...")

        forum_endpoints = [
            ('/forum/categories/', 'Categorías del Foro'),
            ('/forum/topics/', 'Temas del Foro'),
            ('/forum/replies/', 'Respuestas del Foro'),
            ('/forum/stats/overview/', 'Estadísticas del Foro'),
            ('/forum/lesson-comments/', 'Comentarios en Lecciones'),
            ('/forum/conversations/', 'Conversaciones'),
            ('/forum/messages/', 'Mensajes'),
            ('/forum/typing-indicators/', 'Indicadores de Escritura'),
        ]

        for endpoint, test_name in forum_endpoints:
            response, response_time = self.make_request('GET', endpoint)
            success = response.status_code == 200
            self.log_test_result(test_name, success,
                               f"Status: {response.status_code}", response_time)

    def test_task_endpoints(self):
        """Probar endpoints de tareas"""
        logger.info("\n📋 Probando endpoints de Tareas...")

        task_endpoints = [
            ('/tasks/categories/', 'Categorías de Tareas'),
            ('/tasks/', 'Tareas'),
            ('/tasks/assignments/', 'Asignaciones'),
            ('/tasks/submissions/', 'Entregas'),
            ('/tasks/files/', 'Archivos de Tareas'),
            ('/tasks/comments/', 'Comentarios de Tareas'),
        ]

        for endpoint, test_name in task_endpoints:
            response, response_time = self.make_request('GET', endpoint)
            success = response.status_code == 200
            self.log_test_result(test_name, success,
                               f"Status: {response.status_code}", response_time)

    def test_library_endpoints(self):
        """Probar endpoints de biblioteca"""
        logger.info("\n📚 Probando endpoints de Biblioteca...")

        library_endpoints = [
            ('/library/categories/', 'Categorías de Biblioteca'),
            ('/library/files/', 'Archivos de Biblioteca'),
            ('/library/access/', 'Control de Acceso'),
            ('/library/downloads/', 'Descargas'),
            ('/library/favorites/', 'Favoritos'),
        ]

        for endpoint, test_name in library_endpoints:
            response, response_time = self.make_request('GET', endpoint)
            success = response.status_code == 200
            self.log_test_result(test_name, success,
                               f"Status: {response.status_code}", response_time)

    def test_security_aspects(self):
        """Probar aspectos de seguridad"""
        logger.info("\n🔒 Probando aspectos de Seguridad...")

        # 1. Endpoint sin autenticación (debería fallar)
        original_headers = getattr(self, 'auth_headers', None)
        if hasattr(self, 'auth_headers'):
            delattr(self, 'auth_headers')

        response, response_time = self.make_request('GET', '/users/me/')
        success = response.status_code == 401
        self.log_test_result("Acceso sin Autenticación", success,
                           f"Status: {response.status_code}", response_time)

        # Restaurar autenticación
        if original_headers:
            self.auth_headers = original_headers

        # 2. Probar con token inválido
        if hasattr(self, 'auth_headers'):
            original_auth = self.auth_headers['Authorization']
            self.auth_headers['Authorization'] = 'Bearer invalid_token'

            response, response_time = self.make_request('GET', '/users/me/')
            success = response.status_code == 401
            self.log_test_result("Token Inválido", success,
                               f"Status: {response.status_code}", response_time)

            # Restaurar token original
            self.auth_headers['Authorization'] = original_auth

    def test_performance_metrics(self):
        """Probar métricas de rendimiento"""
        logger.info("\n⚡ Probando métricas de rendimiento...")

        endpoints_to_test = [
            '/health-check/',
            '/courses/',
            '/lessons/',
            '/quizzes/',
            '/notifications/',
        ]

        for endpoint in endpoints_to_test:
            start_time = time.time()
            response, response_time = self.make_request('GET', endpoint)

            # Registrar métricas
            endpoint_name = endpoint.replace('/', '_').strip('_')
            self.test_results['performance_metrics'][endpoint_name] = {
                'response_time': response_time,
                'status_code': response.status_code,
                'timestamp': datetime.now().isoformat()
            }

            success = response_time < 2.0  # Menos de 2 segundos
            self.log_test_result(f"Rendimiento {endpoint}", success,
                               f"Tiempo: {response_time:.2f}s", response_time)

    def generate_report(self):
        """Generar reporte final de pruebas"""
        logger.info("\n📊 GENERANDO REPORTE FINAL DE PRUEBAS")
        logger.info("=" * 60)

        # Resumen general
        total = self.test_results['total_tests']
        passed = self.test_results['passed_tests']
        failed = self.test_results['failed_tests']
        success_rate = (passed / total * 100) if total > 0 else 0

        logger.info(f"Total de Pruebas: {total}")
        logger.info(f"Pruebas Exitosas: {passed}")
        logger.info(f"Pruebas Fallidas: {failed}")
        logger.info(f"Tasa de Éxito: {success_rate:.2f}%")

        # Métricas de rendimiento
        logger.info("\n📈 MÉTRICAS DE RENDIMIENTO:")
        for endpoint, metrics in self.test_results['performance_metrics'].items():
            logger.info(f"  {endpoint}: {metrics['response_time']:.2f}s")

        # Errores encontrados
        if self.test_results['errors']:
            logger.info("\n❌ ERRORES ENCONTRADOS:")
            for error in self.test_results['errors'][:10]:  # Mostrar solo primeros 10
                logger.info(f"  {error}")
            if len(self.test_results['errors']) > 10:
                logger.info(f"  ... y {len(self.test_results['errors']) - 10} errores más")

        # Recomendaciones
        logger.info("\n💡 RECOMENDACIONES:")
        if success_rate >= 95:
            logger.info("  ✅ Excelente calidad de API")
        elif success_rate >= 80:
            logger.info("  ⚠️  Buena calidad, algunos endpoints necesitan atención")
        else:
            logger.info("  ❌ Calidad deficiente, revisión completa requerida")

        if failed > 0:
            logger.info(f"  🔧 Revisar los {failed} endpoints fallidos")
            logger.info("  📋 Verificar logs detallados en api_tests.log")

        # Guardar reporte en JSON
        report_file = "api_test_report.json"
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(self.test_results, f, indent=2, ensure_ascii=False)

        logger.info(f"\n📄 Reporte detallado guardado en: {report_file}")

        return {
            'total_tests': total,
            'passed_tests': passed,
            'failed_tests': failed,
            'success_rate': success_rate
        }

    def run_all_tests(self):
        """Ejecutar todas las pruebas"""
        logger.info("🚀 INICIANDO PRUEBAS EXHAUSTIVAS DE API")
        logger.info(f"URL Base: {self.base_url}")
        logger.info("=" * 60)

        try:
            # Pruebas básicas
            self.test_health_endpoints()
            self.test_swagger_documentation()

            # Pruebas de autenticación
            self.test_authentication_endpoints()

            # Pruebas de módulos principales
            self.test_course_endpoints()
            self.test_admin_course_endpoints()
            self.test_bulk_course_operations()
            self.test_lesson_endpoints()
            self.test_quiz_endpoints()
            self.test_notification_endpoints()
            self.test_forum_endpoints()
            self.test_task_endpoints()
            self.test_library_endpoints()
            # Pruebas de seguridad y rendimiento
            self.test_security_aspects()
            self.test_performance_metrics()

            # Generar reporte final
            return self.generate_report()

        except Exception as e:
            logger.error(f"❌ Error crítico durante las pruebas: {str(e)}")
            return {
                'total_tests': 1,
                'passed_tests': 0,
                'failed_tests': 1,
                'success_rate': 0,
                'error': str(e)
            }

def main():
    """Función principal"""
    print("🧪 API Tester para IFAP - Pruebas Exhaustivas")
    print("=" * 50)

    # Configurar URL base
    base_url = os.environ.get("IFAP_API_BASE_URL", "http://localhost:8000/api")
    print(f"Usando URL base: {base_url}")

    # Crear y ejecutar tester
    tester = APITester(base_url)
    results = tester.run_all_tests()

    # Mostrar resumen final
    print("\n" + "=" * 50)
    print("📊 RESUMEN FINAL")
    print("=" * 50)
    print(f"Total de Pruebas: {results['total_tests']}")
    print(f"✅ Exitosas: {results['passed_tests']}")
    print(f"❌ Fallidas: {results['failed_tests']}")
    print(f"📈 Tasa de Éxito: {results['success_rate']:.2f}%")

    if results['success_rate'] >= 90:
        print("🎉 ¡Excelente! La API está funcionando correctamente.")
    elif results['success_rate'] >= 70:
        print("⚠️  La API funciona pero necesita mejoras.")
    else:
        print("❌ La API tiene problemas significativos que requieren atención inmediata.")

    return results['success_rate'] >= 70

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
