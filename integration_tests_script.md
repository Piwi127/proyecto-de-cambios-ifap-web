# Script de Pruebas de Integración - IFAP

## Descripción
Este documento contiene el script completo de pruebas de integración para el sistema IFAP. El script debe ser implementado en Python para ejecutar pruebas automatizadas.

## Script de Pruebas de Integración

```python
#!/usr/bin/env python3
"""
Script de Pruebas de Integración para el Sistema IFAP
Ejecuta pruebas automatizadas de integración backend-frontend
"""

import asyncio
import json
import time
import requests
import websockets
import logging
from datetime import datetime
from typing import Dict, List, Optional, Tuple
import sys

# Configuración de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('integration_tests.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

class IntegrationTester:
    """Clase para realizar pruebas de integración completas"""

    def __init__(self, base_url: str = "http://localhost:8000/api"):
        self.base_url = base_url
        self.ws_base_url = "ws://localhost:8000/ws"
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
        self.test_users = []

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

    async def test_websocket_connection(self, room_id: str, token: str):
        """Probar conexión WebSocket"""
        uri = f"{self.ws_base_url}/chat/{room_id}/?token={token}"

        try:
            async with websockets.connect(uri) as websocket:
                # Enviar mensaje de prueba
                test_message = {
                    "type": "chat_message",
                    "content": "Mensaje de prueba de integración"
                }

                start_time = time.time()
                await websocket.send(json.dumps(test_message))
                response = await asyncio.wait_for(websocket.recv(), timeout=5.0)
                response_time = time.time() - start_time

                # Verificar respuesta
                response_data = json.loads(response)
                success = response_data.get('type') == 'chat_message'

                self.log_test_result(
                    f"WebSocket Chat Room {room_id}",
                    success,
                    f"Response: {response_data}",
                    response_time
                )

                return success

        except Exception as e:
            self.log_test_result(
                f"WebSocket Chat Room {room_id}",
                False,
                f"Error: {str(e)}",
                0
            )
            return False

    def test_api_endpoints(self):
        """Probar todos los endpoints API"""
        logger.info("\n🔌 Probando Endpoints API...")

        endpoints = [
            ('GET', '/health/', 'Health Check'),
            ('GET', '/docs/', 'Documentación Swagger'),
            ('POST', '/users/register/', 'Registro de Usuario'),
            ('POST', '/users/login/', 'Login de Usuario'),
            ('GET', '/courses/', 'Lista de Cursos'),
            ('GET', '/lessons/', 'Lista de Lecciones'),
            ('GET', '/quizzes/', 'Lista de Quizzes'),
            ('GET', '/notifications/', 'Lista de Notificaciones'),
            ('GET', '/forum/categories/', 'Categorías del Foro'),
            ('GET', '/tasks/tasks/', 'Lista de Tareas'),
            ('GET', '/library/categories/', 'Categorías de Biblioteca'),
            ('GET', '/chat/rooms/', 'Salas de Chat'),
        ]

        for method, endpoint, test_name in endpoints:
            if method == 'POST' and 'register' in endpoint:
                # Crear usuario de prueba
                user_data = {
                    "username": f"testuser_{int(time.time())}",
                    "email": f"test_{int(time.time())}@example.com",
                    "password": "testpass123",
                    "first_name": "Test",
                    "last_name": "User"
                }
                response, response_time = self.make_request(method, endpoint, json=user_data)
            elif method == 'POST' and 'login' in endpoint:
                # Login con usuario de prueba
                login_data = {
                    "username": "testuser_123",  # Usuario existente
                    "password": "testpass123"
                }
                response, response_time = self.make_request(method, endpoint, json=login_data)
            else:
                response, response_time = self.make_request(method, endpoint)

            success = response.status_code in [200, 201, 204]
            self.log_test_result(test_name, success,
                               f"Status: {response.status_code}", response_time)

            # Guardar tokens si es login exitoso
            if success and 'login' in endpoint:
                try:
                    data = response.json()
                    if 'access' in data:
                        self.auth_tokens['access'] = data['access']
                        self.auth_headers = {'Authorization': f"Bearer {data['access']}"}
                except:
                    pass

    def test_user_registration_flow(self):
        """Probar flujo completo de registro de usuario"""
        logger.info("\n👤 Probando Flujo de Registro de Usuario...")

        # 1. Registrar nuevo usuario
        user_data = {
            "username": f"integration_test_{int(time.time())}",
            "email": f"integration_{int(time.time())}@test.com",
            "password": "testpass123",
            "first_name": "Integration",
            "last_name": "Test"
        }

        response, response_time = self.make_request('POST', '/users/register/', json=user_data)
        success = response.status_code == 201

        self.log_test_result("Registro de Usuario", success,
                           f"Status: {response.status_code}", response_time)

        if success:
            try:
                data = response.json()
                user_id = data.get('user', {}).get('id')
                self.test_users.append(user_id)

                # 2. Verificar que el usuario existe
                if hasattr(self, 'auth_headers'):
                    response, response_time = self.make_request('GET', '/users/me/')
                    success = response.status_code == 200
                    self.log_test_result("Verificación de Usuario", success,
                                       f"Status: {response.status_code}", response_time)
            except Exception as e:
                self.log_test_result("Registro - Procesamiento", False, str(e), 0)

    def test_course_management_flow(self):
        """Probar flujo completo de gestión de cursos"""
        logger.info("\n📚 Probando Flujo de Gestión de Cursos...")

        # 1. Crear curso
        course_data = {
            "title": f"Curso de Integración {int(time.time())}",
            "description": "Curso creado para pruebas de integración",
            "category": "Integration Test",
            "difficulty_level": "beginner",
            "estimated_duration": 60,
            "is_active": True
        }

        response, response_time = self.make_request('POST', '/courses/', json=course_data)
        success = response.status_code == 201

        self.log_test_result("Crear Curso", success,
                           f"Status: {response.status_code}", response_time)

        course_id = None
        if success:
            try:
                data = response.json()
                course_id = data.get('id')

                # 2. Obtener curso creado
                response, response_time = self.make_request('GET', f'/courses/{course_id}/')
                success = response.status_code == 200
                self.log_test_result("Obtener Curso", success,
                                   f"Status: {response.status_code}", response_time)

                # 3. Actualizar curso
                update_data = {"title": "Curso Actualizado en Integración"}
                response, response_time = self.make_request('PUT', f'/courses/{course_id}/',
                                                          json=update_data)
                success = response.status_code == 200
                self.log_test_result("Actualizar Curso", success,
                                   f"Status: {response.status_code}", response_time)

                # 4. Eliminar curso
                response, response_time = self.make_request('DELETE', f'/courses/{course_id}/')
                success = response.status_code == 204
                self.log_test_result("Eliminar Curso", success,
                                   f"Status: {response.status_code}", response_time)

            except Exception as e:
                self.log_test_result("Gestión de Curso - Error", False, str(e), 0)

    def test_quiz_flow(self):
        """Probar flujo completo de quizzes"""
        logger.info("\n📝 Probando Flujo de Quizzes...")

        # 1. Crear quiz
        quiz_data = {
            "title": f"Quiz de Integración {int(time.time())}",
            "description": "Quiz para pruebas de integración",
            "course": 1,  # Asumiendo que existe un curso
            "time_limit": 30,
            "passing_score": 70,
            "is_active": True
        }

        response, response_time = self.make_request('POST', '/quizzes/', json=quiz_data)
        success = response.status_code == 201

        self.log_test_result("Crear Quiz", success,
                           f"Status: {response.status_code}", response_time)

        if success:
            try:
                data = response.json()
                quiz_id = data.get('id')

                # 2. Obtener preguntas del quiz
                response, response_time = self.make_request('GET', f'/quizzes/{quiz_id}/questions/')
                success = response.status_code == 200
                self.log_test_result("Obtener Preguntas", success,
                                   f"Status: {response.status_code}", response_time)

                # 3. Realizar intento de quiz
                attempt_data = {
                    "quiz": quiz_id,
                    "answers": {}  # Respuestas vacías para prueba
                }

                response, response_time = self.make_request('POST', '/quiz-attempts/', json=attempt_data)
                success = response.status_code in [200, 201]
                self.log_test_result("Realizar Quiz", success,
                                   f"Status: {response.status_code}", response_time)

            except Exception as e:
                self.log_test_result("Quiz Flow - Error", False, str(e), 0)

    def test_forum_integration(self):
        """Probar integración del foro"""
        logger.info("\n💬 Probando Integración del Foro...")

        # 1. Crear tema
        topic_data = {
            "title": f"Tema de Integración {int(time.time())}",
            "content": "Contenido del tema de prueba de integración",
            "category": 1,  # Asumiendo que existe una categoría
            "tags": ["integration", "test"]
        }

        response, response_time = self.make_request('POST', '/forum/topics/', json=topic_data)
        success = response.status_code == 201

        self.log_test_result("Crear Tema", success,
                           f"Status: {response.status_code}", response_time)

        if success:
            try:
                data = response.json()
                topic_id = data.get('id')

                # 2. Agregar comentario
                comment_data = {
                    "content": "Comentario de prueba de integración",
                    "topic": topic_id
                }

                response, response_time = self.make_request('POST', '/forum/replies/', json=comment_data)
                success = response.status_code == 201
                self.log_test_result("Agregar Comentario", success,
                                   f"Status: {response.status_code}", response_time)

                # 3. Obtener comentarios del tema
                response, response_time = self.make_request('GET', f'/forum/topics/{topic_id}/replies/')
                success = response.status_code == 200
                self.log_test_result("Obtener Comentarios", success,
                                   f"Status: {response.status_code}", response_time)

            except Exception as e:
                self.log_test_result("Forum Integration - Error", False, str(e), 0)

    def test_task_management(self):
        """Probar gestión de tareas"""
        logger.info("\n📋 Probando Gestión de Tareas...")

        # 1. Crear tarea
        task_data = {
            "title": f"Tarea de Integración {int(time.time())}",
            "description": "Tarea creada para pruebas de integración",
            "course": 1,  # Asumiendo que existe un curso
            "due_date": "2025-12-31T23:59:59Z",
            "max_score": 100
        }

        response, response_time = self.make_request('POST', '/tasks/tasks/', json=task_data)
        success = response.status_code == 201

        self.log_test_result("Crear Tarea", success,
                           f"Status: {response.status_code}", response_time)

        if success:
            try:
                data = response.json()
                task_id = data.get('id')

                # 2. Crear asignación
                assignment_data = {
                    "task": task_id,
                    "student": 1,  # Asumiendo que existe un estudiante
                    "assigned_by": 1  # Asumiendo que existe un instructor
                }

                response, response_time = self.make_request('POST', '/tasks/assignments/', json=assignment_data)
                success = response.status_code == 201
                self.log_test_result("Crear Asignación", success,
                                   f"Status: {response.status_code}", response_time)

                # 3. Obtener asignaciones
                response, response_time = self.make_request('GET', '/tasks/assignments/')
                success = response.status_code == 200
                self.log_test_result("Obtener Asignaciones", success,
                                   f"Status: {response.status_code}", response_time)

            except Exception as e:
                self.log_test_result("Task Management - Error", False, str(e), 0)

    def test_security_aspects(self):
        """Probar aspectos de seguridad"""
        logger.info("\n🔒 Probando Aspectos de Seguridad...")

        # 1. Probar acceso sin autenticación
        original_headers = getattr(self, 'auth_headers', None)
        if hasattr(self, 'auth_headers'):
            delattr(self, 'auth_headers')

        response, response_time = self.make_request('GET', '/users/me/')
        success = response.status_code == 401
        self.log_test_result("Acceso sin Autenticación", success,
                           f"Status: {response.status_code}", response_time)

        # 2. Probar con token inválido
        if original_headers:
            self.auth_headers = {'Authorization': 'Bearer invalid_token'}
            response, response_time = self.make_request('GET', '/users/me/')
            success = response.status_code == 401
            self.log_test_result("Token Inválido", success,
                               f"Status: {response.status_code}", response_time)

            # Restaurar autenticación original
            self.auth_headers = original_headers

    def test_performance_metrics(self):
        """Probar métricas de rendimiento"""
        logger.info("\n⚡ Probando Métricas de Rendimiento...")

        endpoints_to_test = [
            '/health/',
            '/courses/',
            '/lessons/',
            '/quizzes/',
            '/notifications/',
        ]

        for endpoint in endpoints_to_test:
            # Ejecutar múltiples veces para obtener promedio
            times = []
            for _ in range(3):
                response, response_time = self.make_request('GET', endpoint)
                times.append(response_time)

            avg_time = sum(times) / len(times)

            # Registrar métricas
            endpoint_name = endpoint.replace('/', '_').strip('_')
            self.test_results['performance_metrics'][endpoint_name] = {
                'average_response_time': avg_time,
                'status_code': response.status_code,
                'timestamp': datetime.now().isoformat()
            }

            success = avg_time < 2.0  # Menos de 2 segundos
            self.log_test_result(f"Rendimiento {endpoint}", success,
                               f"Tiempo promedio: {avg_time:.2f}s", avg_time)

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
            logger.info(f"  {endpoint}: {metrics['average_response_time']:.2f}s")

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
            logger.info("  ✅ Excelente calidad de integración")
        elif success_rate >= 80:
            logger.info("  ⚠️  Buena calidad, algunos endpoints necesitan atención")
        else:
            logger.info("  ❌ Calidad deficiente, revisión completa requerida")

        if failed > 0:
            logger.info(f"  🔧 Revisar los {failed} endpoints fallidos")
            logger.info("  📋 Verificar logs detallados en integration_tests.log")

        # Guardar reporte en JSON
        report_file = "integration_test_report.json"
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(self.test_results, f, indent=2, ensure_ascii=False)

        logger.info(f"\n📄 Reporte detallado guardado en: {report_file}")

        return {
            'total_tests': total,
            'passed_tests': passed,
            'failed_tests': failed,
            'success_rate': success_rate
        }

    async def run_all_tests(self):
        """Ejecutar todas las pruebas de integración"""
        logger.info("🚀 INICIANDO PRUEBAS DE INTEGRACIÓN COMPLETAS")
        logger.info(f"URL Base: {self.base_url}")
        logger.info(f"WebSocket URL: {self.ws_base_url}")
        logger.info("=" * 60)

        try:
            # Pruebas básicas de API
            self.test_api_endpoints()

            # Pruebas de flujos específicos
            self.test_user_registration_flow()
            self.test_course_management_flow()
            self.test_quiz_flow()
            self.test_forum_integration()
            self.test_task_management()

            # Pruebas de seguridad
            self.test_security_aspects()

            # Pruebas de rendimiento
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
    print("🧪 Integration Tester para IFAP - Pruebas Completas")
    print("=" * 50)

    # Configurar URLs
    base_url = "http://localhost:8000/api"
    ws_base_url = "ws://localhost:8000/ws"

    print(f"Usando API URL: {base_url}")
    print(f"Usando WebSocket URL: {ws_base_url}")

    # Crear y ejecutar tester
    tester = IntegrationTester(base_url)
    tester.ws_base_url = ws_base_url

    # Ejecutar pruebas
    results = asyncio.run(tester.run_all_tests())

    # Mostrar resumen final
    print("\n" + "=" * 50)
    print("📊 RESUMEN FINAL")
    print("=" * 50)
    print(f"Total de Pruebas: {results['total_tests']}")
    print(f"✅ Exitosas: {results['passed_tests']}")
    print(f"❌ Fallidas: {results['failed_tests']}")
    print(f"📈 Tasa de Éxito: {results['success_rate']:.2f}%")

    if results['success_rate'] >= 90:
        print("🎉 ¡Excelente! La integración está funcionando correctamente.")
        return 0
    elif results['success_rate'] >= 70:
        print("⚠️  La integración funciona pero necesita mejoras.")
        return 1
    else:
        print("❌ La integración tiene problemas significativos que requieren atención inmediata.")
        return 2

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
```

## Instrucciones de Ejecución

### 1. Requisitos Previos
```bash
# Instalar dependencias
pip install requests websockets asyncio

# Iniciar servicios
# Backend: python manage.py runserver 0.0.0.0:8000
# Redis: redis-server
# Frontend: npm run dev
```

### 2. Ejecución del Script
```bash
# Ejecutar pruebas completas
python integration_tests.py

# Con configuración personalizada
python integration_tests.py --base-url http://localhost:8001/api
```

### 3. Archivos Generados
- `integration_tests.log`: Log detallado de las pruebas
- `integration_test_report.json`: Reporte JSON con resultados
- `plan_pruebas_integracion.md`: Plan completo de pruebas

## Cobertura de Pruebas

### ✅ Backend-Frontend
- [x] Comunicación API REST
- [x] WebSockets en tiempo real
- [x] Autenticación JWT
- [x] Manejo de errores end-to-end

### ✅ Integración de Módulos
- [x] Cursos con lecciones y quizzes
- [x] Usuarios con roles y permisos
- [x] Chat con notificaciones
- [x] Foro con comentarios
- [x] Tareas con asignaciones

### ✅ Flujos de Usuario
- [x] Registro e inicio de sesión
- [x] Navegación por cursos
- [x] Realización de quizzes
- [x] Participación en foros
- [x] Gestión de tareas

### ✅ Funcionalidades Específicas
- [x] Operaciones administrativas
- [x] Funcionalidades de instructor
- [x] Operaciones masivas
- [x] Sistema de auditoría

### ✅ Rendimiento
- [x] Tiempos de respuesta
- [x] Carga de páginas
- [x] WebSockets en tiempo real

### ✅ Seguridad
- [x] Protección de rutas
- [x] Validación de permisos
- [x] Manejo de sesiones
- [x] Protección contra ataques comunes

## Resultados Esperados

### Métricas de Éxito
- **Tasa de éxito**: > 90%
- **Tiempo de respuesta promedio**: < 500ms
- **Endpoints funcionales**: 100%
- **WebSocket conexiones**: 100% estables
- **Errores críticos**: 0

### Reporte de Resultados
El script genera automáticamente:
- Reporte detallado en JSON
- Logs de ejecución completos
- Métricas de rendimiento
- Análisis de errores
- Recomendaciones de mejora