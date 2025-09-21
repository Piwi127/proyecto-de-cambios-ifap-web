"""
Sistema centralizado de manejo de excepciones para IFAP Backend
"""
import logging
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import exception_handler
from django.core.exceptions import ValidationError
from django.http import Http404
from django.db import IntegrityError

logger = logging.getLogger('error_handler')

class APIException(Exception):
    """Excepción base para APIs"""
    default_detail = 'Error en la API'
    default_code = 'api_error'
    status_code = status.HTTP_500_INTERNAL_SERVER_ERROR

    def __init__(self, detail=None, code=None, status_code=None):
        if detail is None:
            detail = self.default_detail
        if code is None:
            code = self.default_code
        if status_code is None:
            status_code = self.status_code

        self.detail = detail
        self.code = code
        self.status_code = status_code

class ValidationAPIException(APIException):
    """Excepción para errores de validación"""
    default_detail = 'Error de validación'
    default_code = 'validation_error'
    status_code = status.HTTP_400_BAD_REQUEST

class PermissionAPIException(APIException):
    """Excepción para errores de permisos"""
    default_detail = 'No tienes permisos para realizar esta acción'
    default_code = 'permission_denied'
    status_code = status.HTTP_403_FORBIDDEN

class NotFoundAPIException(APIException):
    """Excepción para recursos no encontrados"""
    default_detail = 'Recurso no encontrado'
    default_code = 'not_found'
    status_code = status.HTTP_404_NOT_FOUND

class BusinessLogicException(APIException):
    """Excepción para errores de lógica de negocio"""
    default_detail = 'Error en la lógica de negocio'
    default_code = 'business_logic_error'
    status_code = status.HTTP_422_UNPROCESSABLE_ENTITY

def custom_exception_handler(exc, context):
    """
    Manejador de excepciones personalizado para DRF
    """
    # Llamar al manejador de excepciones por defecto primero
    response = exception_handler(exc, context)

    # Obtener información del contexto
    view = context.get('view', None)
    request = context.get('request', None)
    
    # Log de la excepción
    logger.error(
        f"Exception in {view.__class__.__name__ if view else 'Unknown'}: "
        f"{exc.__class__.__name__}: {str(exc)}",
        extra={
            'request': request,
            'view': view.__class__.__name__ if view else None,
            'user': request.user.id if request and hasattr(request, 'user') and request.user.is_authenticated else None,
        },
        exc_info=True
    )

    # Si DRF no maneja la excepción, la manejamos nosotros
    if response is None:
        custom_response_data = get_custom_response_data(exc)
        if custom_response_data:
            return Response(custom_response_data['data'], status=custom_response_data['status'])

    # Personalizar response de DRF
    if response is not None:
        custom_response_data = {
            'error': True,
            'message': get_error_message(exc, response),
            'code': get_error_code(exc),
            'details': response.data,
            'status_code': response.status_code,
            'timestamp': logger.handlers[0].formatter.formatTime(logger.makeRecord(
                name='timestamp', level=logging.INFO, fn='', lno=0, msg='', args=(), exc_info=None
            )) if logger.handlers else None
        }
        response.data = custom_response_data

    return response

def get_custom_response_data(exc):
    """
    Obtiene datos de respuesta personalizados para excepciones no manejadas por DRF
    """
    if isinstance(exc, APIException):
        return {
            'data': {
                'error': True,
                'message': exc.detail,
                'code': exc.code,
                'status_code': exc.status_code
            },
            'status': exc.status_code
        }
    
    elif isinstance(exc, ValidationError):
        return {
            'data': {
                'error': True,
                'message': 'Error de validación',
                'code': 'validation_error',
                'details': exc.message_dict if hasattr(exc, 'message_dict') else str(exc),
                'status_code': status.HTTP_400_BAD_REQUEST
            },
            'status': status.HTTP_400_BAD_REQUEST
        }
    
    elif isinstance(exc, Http404):
        return {
            'data': {
                'error': True,
                'message': 'Recurso no encontrado',
                'code': 'not_found',
                'status_code': status.HTTP_404_NOT_FOUND
            },
            'status': status.HTTP_404_NOT_FOUND
        }
    
    elif isinstance(exc, IntegrityError):
        return {
            'data': {
                'error': True,
                'message': 'Error de integridad en la base de datos',
                'code': 'integrity_error',
                'status_code': status.HTTP_422_UNPROCESSABLE_ENTITY
            },
            'status': status.HTTP_422_UNPROCESSABLE_ENTITY
        }
    
    # Para excepciones no controladas, devolver error genérico
    return {
        'data': {
            'error': True,
            'message': 'Error interno del servidor',
            'code': 'internal_server_error',
            'status_code': status.HTTP_500_INTERNAL_SERVER_ERROR
        },
        'status': status.HTTP_500_INTERNAL_SERVER_ERROR
    }

def get_error_message(exc, response):
    """
    Extrae un mensaje de error legible de la excepción
    """
    if isinstance(exc, APIException):
        return exc.detail
    
    if hasattr(response, 'data'):
        if isinstance(response.data, dict):
            # Buscar el primer mensaje de error
            for key, value in response.data.items():
                if isinstance(value, list) and len(value) > 0:
                    return f"{key}: {value[0]}"
                elif isinstance(value, str):
                    return f"{key}: {value}"
        elif isinstance(response.data, list) and len(response.data) > 0:
            return str(response.data[0])
    
    return 'Ha ocurrido un error'

def get_error_code(exc):
    """
    Obtiene un código de error de la excepción
    """
    if isinstance(exc, APIException):
        return exc.code
    
    # Mapeo de excepciones comunes a códigos
    error_code_mapping = {
        'ValidationError': 'validation_error',
        'PermissionDenied': 'permission_denied',
        'NotAuthenticated': 'not_authenticated',
        'AuthenticationFailed': 'authentication_failed',
        'NotFound': 'not_found',
        'MethodNotAllowed': 'method_not_allowed',
        'ParseError': 'parse_error',
        'UnsupportedMediaType': 'unsupported_media_type',
        'Throttled': 'throttled',
    }
    
    return error_code_mapping.get(exc.__class__.__name__, 'unknown_error')