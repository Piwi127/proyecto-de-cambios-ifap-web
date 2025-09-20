"""
Decoradores y clases de permisos personalizados para el control de acceso basado en roles.
"""

from functools import wraps
from django.http import JsonResponse
from django.core.exceptions import PermissionDenied
from rest_framework.permissions import BasePermission
from rest_framework.response import Response
from rest_framework import status


# Decoradores para vistas basadas en funciones
def require_role(allowed_roles):
    """
    Decorador que requiere que el usuario tenga uno de los roles especificados.
    
    Args:
        allowed_roles (list): Lista de roles permitidos ['student', 'instructor', 'admin']
    """
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            if not request.user.is_authenticated:
                return JsonResponse(
                    {'error': 'Autenticación requerida'}, 
                    status=401
                )
            
            user_has_role = any(request.user.has_role(role) for role in allowed_roles)
            if not user_has_role:
                return JsonResponse(
                    {'error': f'Acceso denegado. Roles requeridos: {", ".join(allowed_roles)}'}, 
                    status=403
                )
            
            return view_func(request, *args, **kwargs)
        return wrapper
    return decorator


def require_admin(view_func):
    """Decorador que requiere permisos de administrador"""
    return require_role(['admin'])(view_func)


def require_instructor_or_admin(view_func):
    """Decorador que requiere permisos de docente o administrador"""
    return require_role(['instructor', 'admin'])(view_func)


def require_student_or_higher(view_func):
    """Decorador que permite acceso a estudiantes, docentes y administradores"""
    return require_role(['student', 'instructor', 'admin'])(view_func)


# Clases de permisos para Django REST Framework
class IsAdminUser(BasePermission):
    """
    Permiso que solo permite acceso a administradores.
    """
    message = 'Solo los administradores pueden realizar esta acción.'

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.has_role('admin')


class IsInstructorOrAdmin(BasePermission):
    """
    Permiso que permite acceso a docentes y administradores.
    """
    message = 'Solo los docentes y administradores pueden realizar esta acción.'

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and 
            (request.user.has_role('instructor') or request.user.has_role('admin'))
        )


class IsStudentOrHigher(BasePermission):
    """
    Permiso que permite acceso a estudiantes, docentes y administradores.
    """
    message = 'Acceso denegado.'

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and 
            (request.user.has_role('student') or 
             request.user.has_role('instructor') or 
             request.user.has_role('admin'))
        )


class IsOwnerOrInstructorOrAdmin(BasePermission):
    """
    Permiso que permite acceso al propietario del objeto, docentes o administradores.
    Útil para que los estudiantes solo puedan ver/editar sus propios datos.
    """
    message = 'Solo puedes acceder a tus propios datos, o ser docente/administrador.'

    def has_permission(self, request, view):
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        # Administradores y docentes tienen acceso completo
        if request.user.has_role('admin') or request.user.has_role('instructor'):
            return True
        
        # Los usuarios pueden acceder a sus propios objetos
        if hasattr(obj, 'user'):
            return obj.user == request.user
        elif hasattr(obj, 'owner'):
            return obj.owner == request.user
        elif hasattr(obj, 'id') and hasattr(request.user, 'id'):
            return obj.id == request.user.id
        
        return False


class CanManageUsers(BasePermission):
    """
    Permiso específico para gestión de usuarios.
    Solo administradores pueden gestionar usuarios.
    """
    message = 'Solo los administradores pueden gestionar usuarios.'

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.can_manage_users()


class CanManageCourses(BasePermission):
    """
    Permiso específico para gestión de cursos.
    Docentes y administradores pueden gestionar cursos.
    """
    message = 'Solo los docentes y administradores pueden gestionar cursos.'

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.can_manage_courses()


class ReadOnlyForStudents(BasePermission):
    """
    Permiso que permite lectura a estudiantes, pero escritura solo a docentes y administradores.
    """
    message = 'Los estudiantes solo tienen permisos de lectura.'

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        # Administradores y docentes tienen acceso completo
        if request.user.has_role('admin') or request.user.has_role('instructor'):
            return True
        
        # Estudiantes solo pueden leer (GET, HEAD, OPTIONS)
        if request.user.has_role('student'):
            return request.method in ['GET', 'HEAD', 'OPTIONS']
        
        return False


# Funciones auxiliares para verificaciones de permisos
def user_can_access_course(user, course):
    """
    Verifica si un usuario puede acceder a un curso específico.
    
    Args:
        user: Usuario a verificar
        course: Curso al que se quiere acceder
    
    Returns:
        bool: True si puede acceder, False en caso contrario
    """
    # Administradores tienen acceso a todo
    if user.has_role('admin'):
        return True
    
    # Docentes pueden acceder a sus cursos
    if user.has_role('instructor'):
        return hasattr(course, 'instructor') and course.instructor == user
    
    # Estudiantes pueden acceder a cursos en los que están inscritos
    if user.has_role('student'):
        return hasattr(course, 'students') and user in course.students.all()
    
    return False


def user_can_modify_user(requesting_user, target_user):
    """
    Verifica si un usuario puede modificar a otro usuario.
    
    Args:
        requesting_user: Usuario que solicita la modificación
        target_user: Usuario que se quiere modificar
    
    Returns:
        bool: True si puede modificar, False en caso contrario
    """
    # Solo administradores pueden modificar otros usuarios
    if requesting_user.has_role('admin'):
        return True
    
    # Los usuarios pueden modificar sus propios datos
    if requesting_user.id == target_user.id:
        return True
    
    return False


def get_accessible_courses_for_user(user):
    """
    Retorna los cursos a los que un usuario tiene acceso según su rol.
    
    Args:
        user: Usuario para el que se buscan los cursos
    
    Returns:
        QuerySet: Cursos accesibles para el usuario
    """
    from courses.models import Course  # Import local para evitar dependencias circulares
    
    if user.has_role('admin'):
        # Administradores ven todos los cursos
        return Course.objects.all()
    elif user.has_role('instructor'):
        # Docentes ven sus cursos
        return Course.objects.filter(instructor=user)
    elif user.has_role('student'):
        # Estudiantes ven cursos en los que están inscritos
        return Course.objects.filter(students=user)
    else:
        return Course.objects.none()