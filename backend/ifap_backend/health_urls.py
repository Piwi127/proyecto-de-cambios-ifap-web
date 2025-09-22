"""
URLs para endpoints de health check
"""
from django.urls import path
from django.http import JsonResponse
from django.conf import settings
import psutil
import os
from datetime import datetime

def health_check(request):
    """
    Endpoint básico de health check
    """
    return JsonResponse({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'service': 'IFAP Backend API',
        'version': getattr(settings, 'APP_VERSION', '1.0.0'),
        'environment': os.environ.get('ENVIRONMENT', 'development')
    })

def detailed_health_check(request):
    """
    Endpoint detallado de health check con métricas del sistema
    """
    try:
        # Información del sistema
        system_info = {
            'cpu_percent': psutil.cpu_percent(interval=1),
            'memory': {
                'total': psutil.virtual_memory().total,
                'available': psutil.virtual_memory().available,
                'percent': psutil.virtual_memory().percent
            },
            'disk': {
                'total': psutil.disk_usage('/').total,
                'free': psutil.disk_usage('/').free,
                'percent': psutil.disk_usage('/').percent
            }
        }

        # Verificar conexiones críticas
        checks = {
            'database': check_database(),
            'redis': check_redis() if hasattr(settings, 'CACHES') and 'redis' in str(settings.CACHES.get('default', {}).get('BACKEND', '')) else 'not_configured',
            'channels': check_channels()
        }

        # Determinar estado general
        all_healthy = all(status == 'healthy' for status in checks.values() if status != 'not_configured')

        return JsonResponse({
            'status': 'healthy' if all_healthy else 'degraded',
            'timestamp': datetime.now().isoformat(),
            'service': 'IFAP Backend API',
            'version': getattr(settings, 'APP_VERSION', '1.0.0'),
            'environment': os.environ.get('ENVIRONMENT', 'development'),
            'system': system_info,
            'checks': checks,
            'uptime': os.times().elapsed if hasattr(os.times(), 'elapsed') else None
        })

    except Exception as e:
        return JsonResponse({
            'status': 'unhealthy',
            'timestamp': datetime.now().isoformat(),
            'error': str(e)
        }, status=503)

def check_database():
    """Verificar conexión a la base de datos"""
    try:
        from django.db import connection
        cursor = connection.cursor()
        cursor.execute("SELECT 1")
        return 'healthy'
    except Exception:
        return 'unhealthy'

def check_redis():
    """Verificar conexión a Redis"""
    try:
        from django.core.cache import cache
        cache.set('health_check', 'ok', 10)
        result = cache.get('health_check')
        return 'healthy' if result == 'ok' else 'unhealthy'
    except Exception:
        return 'unhealthy'

def check_channels():
    """Verificar configuración de Channels"""
    try:
        from channels.layers import get_channel_layer
        layer = get_channel_layer()
        return 'healthy' if layer else 'unhealthy'
    except Exception:
        return 'unhealthy'

urlpatterns = [
    path('', health_check, name='health_check'),
    path('detailed/', detailed_health_check, name='detailed_health_check'),
]