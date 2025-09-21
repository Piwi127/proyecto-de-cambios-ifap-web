"""
Middleware para manejo centralizado de errores
"""
import logging
import traceback
from django.http import JsonResponse
from django.conf import settings
import json

logger = logging.getLogger('middleware')

class ErrorHandlingMiddleware:
    """
    Middleware para capturar y manejar errores no controlados
    """
    
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        return response

    def process_exception(self, request, exception):
        """
        Procesa excepciones no manejadas
        """
        # Log del error
        logger.error(
            f"Unhandled exception: {exception.__class__.__name__}: {str(exception)}",
            extra={
                'request_path': request.path,
                'request_method': request.method,
                'user': request.user.id if hasattr(request, 'user') and request.user.is_authenticated else None,
                'traceback': traceback.format_exc(),
            },
            exc_info=True
        )

        # En modo DEBUG, dejar que Django maneje la excepción
        if settings.DEBUG:
            return None

        # En producción, devolver una respuesta JSON genérica
        return JsonResponse({
            'error': True,
            'message': 'Ha ocurrido un error interno del servidor',
            'code': 'internal_server_error',
            'status_code': 500
        }, status=500)

class RequestLoggingMiddleware:
    """
    Middleware para logging de requests
    """
    
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Log del request entrante
        logger.info(
            f"Request: {request.method} {request.path}",
            extra={
                'request_method': request.method,
                'request_path': request.path,
                'user': request.user.id if hasattr(request, 'user') and request.user.is_authenticated else None,
                'ip_address': self.get_client_ip(request),
                'user_agent': request.META.get('HTTP_USER_AGENT', ''),
            }
        )

        response = self.get_response(request)

        # Log del response
        logger.info(
            f"Response: {response.status_code} for {request.method} {request.path}",
            extra={
                'response_status': response.status_code,
                'request_method': request.method,
                'request_path': request.path,
                'user': request.user.id if hasattr(request, 'user') and request.user.is_authenticated else None,
            }
        )

        return response

    def get_client_ip(self, request):
        """Obtiene la IP real del cliente"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip

class SecurityHeadersMiddleware:
    """
    Middleware para añadir headers de seguridad
    """
    
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        
        # Añadir headers de seguridad
        response['X-Content-Type-Options'] = 'nosniff'
        response['X-Frame-Options'] = 'DENY'
        response['X-XSS-Protection'] = '1; mode=block'
        response['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        
        # Solo en producción
        if not settings.DEBUG:
            response['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
        
        return response