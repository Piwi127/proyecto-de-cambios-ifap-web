"""
URL configuration for ifap_backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

# Configuración de Swagger/OpenAPI
schema_view = get_schema_view(
    openapi.Info(
        title="IFAP Web Platform API",
        default_version='v1',
        description="""
        API del Sistema Web del Instituto de Formación Archivística del Perú (IFAP)
        
        Esta API proporciona acceso a todas las funcionalidades del sistema educativo:
        - Gestión de usuarios (estudiantes, instructores, administradores)
        - Cursos y lecciones
        - Sistema de evaluaciones (quizzes)
        - Foro de discusión
        - Sistema de tareas y asignaciones
        - Biblioteca digital
        - Notificaciones en tiempo real
        
        ## Autenticación
        La API utiliza JWT (JSON Web Tokens) para autenticación.
        
        ## Paginación
        Todas las listas están paginadas con un máximo de 20 elementos por página por defecto.
        
        ## Códigos de Error
        - 400: Datos inválidos
        - 401: No autenticado
        - 403: Sin permisos
        - 404: Recurso no encontrado
        - 422: Error de lógica de negocio
        - 500: Error interno del servidor
        """,
        terms_of_service="https://ifap.edu.pe/terms/",
        contact=openapi.Contact(
            name="Equipo de Desarrollo IFAP",
            email="desarrollo@ifap.edu.pe",
            url="https://ifap.edu.pe/contacto/"
        ),
        license=openapi.License(
            name="Licencia Privada",
            url="https://ifap.edu.pe/license/"
        ),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
    authentication_classes=[],
)

urlpatterns = [
    # URLs de administración
    path('admin/', admin.site.urls),
    
    # URLs de la API
    path('api/', include('users.urls')),
    path('api/', include('courses.urls')),
    path('api/', include('lessons.urls')),
    path('api/', include('quizzes.urls')),
    path('api/', include('notifications.urls')),
    path('api/forum/', include('forum.urls')),
    path('api/tasks/', include('tasks.urls')),
    path('api/library/', include('library.urls')),

    
    # URLs de documentación de la API
    path('api/docs/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('api/redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    path('api/schema/', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    
    # Health check endpoint
    path('api/health/', include('ifap_backend.health_urls')),
]

# Servir archivos estáticos en desarrollo
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
