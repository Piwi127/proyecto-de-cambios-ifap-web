"""
Vistas para health checks del sistema
"""
import logging
from django.http import JsonResponse
from django.db import connection
from django.core.cache import cache
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
import redis
import time
from datetime import datetime

logger = logging.getLogger('middleware')

@swagger_auto_schema(
    method='get',
    operation_description="Health check básico del sistema",
    responses={
        200: openapi.Response(
            description="Sistema funcionando correctamente",
            examples={
                "application/json": {
                    "status": "ok",
                    "timestamp": "2024-01-15T10:30:00Z",
                    "version": "1.0.0"
                }
            }
        ),
        503: openapi.Response(
            description="Sistema no disponible",
            examples={
                "application/json": {
                    "status": "error",
                    "timestamp": "2024-01-15T10:30:00Z",
                    "message": "Database connection failed"
                }
            }
        )
    }
)
@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """
    Health check básico del sistema
    """
    try:
        # Verificar conexión a la base de datos
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        
        return JsonResponse({
            'status': 'ok',
            'timestamp': datetime.now().isoformat(),
            'version': getattr(settings, 'VERSION', '1.0.0')
        })
    
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return JsonResponse({
            'status': 'error',
            'timestamp': datetime.now().isoformat(),
            'message': str(e)
        }, status=503)


@swagger_auto_schema(
    method='get',
    operation_description="Health check detallado del sistema con información de todos los servicios",
    responses={
        200: openapi.Response(
            description="Información detallada del estado del sistema",
            examples={
                "application/json": {
                    "status": "ok",
                    "timestamp": "2024-01-15T10:30:00Z",
                    "version": "1.0.0",
                    "services": {
                        "database": {"status": "ok", "response_time": 0.05},
                        "cache": {"status": "ok", "response_time": 0.02},
                        "redis": {"status": "ok", "response_time": 0.01}
                    },
                    "system": {
                        "python_version": "3.11.0",
                        "django_version": "4.2.7",
                        "debug": False
                    }
                }
            }
        )
    }
)
@api_view(['GET'])
@permission_classes([AllowAny])
def detailed_health_check(request):
    """
    Health check detallado con información de todos los servicios
    """
    health_data = {
        'status': 'ok',
        'timestamp': datetime.now().isoformat(),
        'version': getattr(settings, 'VERSION', '1.0.0'),
        'services': {},
        'system': {}
    }
    
    overall_status = 'ok'
    
    # Check de base de datos
    try:
        start_time = time.time()
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        db_response_time = time.time() - start_time
        
        health_data['services']['database'] = {
            'status': 'ok',
            'response_time': round(db_response_time, 3)
        }
    except Exception as e:
        health_data['services']['database'] = {
            'status': 'error',
            'error': str(e)
        }
        overall_status = 'degraded'
    
    # Check de cache
    try:
        start_time = time.time()
        cache_key = 'health_check_test'
        cache.set(cache_key, 'test', 10)
        cached_value = cache.get(cache_key)
        cache.delete(cache_key)
        cache_response_time = time.time() - start_time
        
        if cached_value == 'test':
            health_data['services']['cache'] = {
                'status': 'ok',
                'response_time': round(cache_response_time, 3)
            }
        else:
            health_data['services']['cache'] = {
                'status': 'error',
                'error': 'Cache read/write failed'
            }
            overall_status = 'degraded'
    except Exception as e:
        health_data['services']['cache'] = {
            'status': 'error',
            'error': str(e)
        }
        overall_status = 'degraded'
    
    # Check de Redis
    try:
        start_time = time.time()
        redis_url = getattr(settings, 'REDIS_URL', 'redis://localhost:6379/0')
        r = redis.from_url(redis_url)
        r.ping()
        redis_response_time = time.time() - start_time
        
        health_data['services']['redis'] = {
            'status': 'ok',
            'response_time': round(redis_response_time, 3)
        }
    except Exception as e:
        health_data['services']['redis'] = {
            'status': 'error',
            'error': str(e)
        }
        overall_status = 'degraded'
    
    # Información del sistema
    import sys
    import django
    
    health_data['system'] = {
        'python_version': sys.version.split()[0],
        'django_version': django.get_version(),
        'debug': settings.DEBUG,
        'environment': getattr(settings, 'ENVIRONMENT', 'development')
    }
    
    health_data['status'] = overall_status
    
    status_code = 200 if overall_status == 'ok' else 206
    
    return JsonResponse(health_data, status=status_code)