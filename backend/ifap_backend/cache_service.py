"""
Servicio de cache centralizado para optimizar consultas frecuentes
"""
import logging
from django.core.cache import caches
from django.core.cache.utils import make_template_fragment_key
from django.conf import settings
from functools import wraps
import hashlib
import json

logger = logging.getLogger('middleware')

class CacheService:
    """Servicio centralizado para manejo de cache"""
    
    def __init__(self):
        self.default_cache = caches['default']
        self.api_cache = caches.get('api', self.default_cache)
        self.default_timeout = getattr(settings, 'CACHE_TIMEOUT', 300)
    
    def get(self, key, default=None, cache_alias='default'):
        """Obtener valor del cache"""
        cache = caches[cache_alias] if cache_alias != 'default' else self.default_cache
        try:
            return cache.get(key, default)
        except Exception as e:
            logger.error(f"Cache get error for key {key}: {e}")
            return default
    
    def set(self, key, value, timeout=None, cache_alias='default'):
        """Establecer valor en cache"""
        cache = caches[cache_alias] if cache_alias != 'default' else self.default_cache
        timeout = timeout or self.default_timeout
        try:
            return cache.set(key, value, timeout)
        except Exception as e:
            logger.error(f"Cache set error for key {key}: {e}")
            return False
    
    def delete(self, key, cache_alias='default'):
        """Eliminar valor del cache"""
        cache = caches[cache_alias] if cache_alias != 'default' else self.default_cache
        try:
            return cache.delete(key)
        except Exception as e:
            logger.error(f"Cache delete error for key {key}: {e}")
            return False
    
    def clear(self, cache_alias='default'):
        """Limpiar todo el cache"""
        cache = caches[cache_alias] if cache_alias != 'default' else self.default_cache
        try:
            return cache.clear()
        except Exception as e:
            logger.error(f"Cache clear error: {e}")
            return False
    
    def get_many(self, keys, cache_alias='default'):
        """Obtener múltiples valores del cache"""
        cache = caches[cache_alias] if cache_alias != 'default' else self.default_cache
        try:
            return cache.get_many(keys)
        except Exception as e:
            logger.error(f"Cache get_many error: {e}")
            return {}
    
    def set_many(self, data, timeout=None, cache_alias='default'):
        """Establecer múltiples valores en cache"""
        cache = caches[cache_alias] if cache_alias != 'default' else self.default_cache
        timeout = timeout or self.default_timeout
        try:
            return cache.set_many(data, timeout)
        except Exception as e:
            logger.error(f"Cache set_many error: {e}")
            return False
    
    def make_key(self, prefix, *args, **kwargs):
        """Generar clave de cache consistente"""
        key_parts = [str(prefix)]
        key_parts.extend([str(arg) for arg in args])
        key_parts.extend([f"{k}:{v}" for k, v in sorted(kwargs.items())])
        
        key_string = ":".join(key_parts)
        
        # Si la clave es muy larga, usar hash
        if len(key_string) > 200:
            key_hash = hashlib.md5(key_string.encode()).hexdigest()
            return f"{prefix}:hash:{key_hash}"
        
        return key_string
    
    def invalidate_pattern(self, pattern, cache_alias='default'):
        """Invalidar claves que coincidan con un patrón"""
        cache = caches[cache_alias] if cache_alias != 'default' else self.default_cache
        try:
            if hasattr(cache, 'delete_pattern'):
                return cache.delete_pattern(pattern)
            else:
                # Fallback para backends que no soportan delete_pattern
                logger.warning(f"Cache backend doesn't support pattern deletion: {pattern}")
                return False
        except Exception as e:
            logger.error(f"Cache pattern invalidation error: {e}")
            return False

# Instancia global del servicio
cache_service = CacheService()

def cache_result(timeout=None, cache_alias='default', key_prefix='api'):
    """
    Decorador para cachear resultados de funciones
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Generar clave de cache
            cache_key = cache_service.make_key(
                key_prefix, 
                func.__name__,
                *args,
                **kwargs
            )
            
            # Intentar obtener del cache
            cached_result = cache_service.get(cache_key, cache_alias=cache_alias)
            if cached_result is not None:
                logger.debug(f"Cache hit for {func.__name__}: {cache_key}")
                return cached_result
            
            # Ejecutar función y cachear resultado
            result = func(*args, **kwargs)
            cache_service.set(cache_key, result, timeout, cache_alias)
            logger.debug(f"Cache set for {func.__name__}: {cache_key}")
            
            return result
        return wrapper
    return decorator

def cache_queryset(timeout=None, cache_alias='api', key_prefix='queryset'):
    """
    Decorador específico para cachear querysets
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Obtener parámetros de request si están disponibles
            request = kwargs.get('request') or (args[0] if args and hasattr(args[0], 'user') else None)
            user_id = request.user.id if request and hasattr(request, 'user') and request.user.is_authenticated else 'anonymous'
            
            # Generar clave de cache incluyendo user_id
            cache_key = cache_service.make_key(
                key_prefix,
                func.__name__,
                user_id,
                *args[1:] if request else args,  # Excluir request de args
                **{k: v for k, v in kwargs.items() if k != 'request'}
            )
            
            # Intentar obtener del cache
            cached_result = cache_service.get(cache_key, cache_alias=cache_alias)
            if cached_result is not None:
                logger.debug(f"Queryset cache hit for {func.__name__}: {cache_key}")
                return cached_result
            
            # Ejecutar función y cachear resultado
            result = func(*args, **kwargs)
            
            # Serializar queryset si es necesario
            if hasattr(result, 'values'):
                cached_data = list(result.values())
            else:
                cached_data = result
            
            cache_service.set(cache_key, cached_data, timeout, cache_alias)
            logger.debug(f"Queryset cache set for {func.__name__}: {cache_key}")
            
            return result
        return wrapper
    return decorator

class CacheKeys:
    """Constantes para claves de cache"""
    
    # Usuarios
    USER_PROFILE = 'user_profile'
    USER_PERMISSIONS = 'user_permissions'
    USER_COURSES = 'user_courses'
    
    # Cursos
    COURSE_LIST = 'course_list'
    COURSE_DETAIL = 'course_detail'
    COURSE_STUDENTS = 'course_students'
    COURSE_LESSONS = 'course_lessons'
    
    # Lecciones
    LESSON_DETAIL = 'lesson_detail'
    LESSON_CONTENT = 'lesson_content'
    LESSON_COMMENTS = 'lesson_comments'
    
    # Foro
    FORUM_TOPICS = 'forum_topics'
    FORUM_REPLIES = 'forum_replies'
    FORUM_CATEGORIES = 'forum_categories'
    
    # Notificaciones
    USER_NOTIFICATIONS = 'user_notifications'
    NOTIFICATION_COUNT = 'notification_count'
    
    # Tareas
    TASK_LIST = 'task_list'
    TASK_ASSIGNMENTS = 'task_assignments'
    TASK_SUBMISSIONS = 'task_submissions'
    
    # Biblioteca
    LIBRARY_DOCUMENTS = 'library_documents'
    LIBRARY_CATEGORIES = 'library_categories'

def invalidate_user_cache(user_id):
    """Invalidar cache relacionado con un usuario específico"""
    patterns = [
        f"*{CacheKeys.USER_PROFILE}*{user_id}*",
        f"*{CacheKeys.USER_PERMISSIONS}*{user_id}*",
        f"*{CacheKeys.USER_COURSES}*{user_id}*",
        f"*{CacheKeys.USER_NOTIFICATIONS}*{user_id}*",
        f"*{CacheKeys.NOTIFICATION_COUNT}*{user_id}*",
    ]
    
    for pattern in patterns:
        cache_service.invalidate_pattern(pattern, 'api')

def invalidate_course_cache(course_id):
    """Invalidar cache relacionado con un curso específico"""
    patterns = [
        f"*{CacheKeys.COURSE_DETAIL}*{course_id}*",
        f"*{CacheKeys.COURSE_STUDENTS}*{course_id}*",
        f"*{CacheKeys.COURSE_LESSONS}*{course_id}*",
        f"*{CacheKeys.COURSE_LIST}*",
    ]
    
    for pattern in patterns:
        cache_service.invalidate_pattern(pattern, 'api')

def invalidate_forum_cache(topic_id=None):
    """Invalidar cache relacionado con el foro"""
    patterns = [
        f"*{CacheKeys.FORUM_TOPICS}*",
        f"*{CacheKeys.FORUM_CATEGORIES}*",
    ]
    
    if topic_id:
        patterns.append(f"*{CacheKeys.FORUM_REPLIES}*{topic_id}*")
    
    for pattern in patterns:
        cache_service.invalidate_pattern(pattern, 'api')