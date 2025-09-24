from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

from users.views import UserViewSet
from rest_framework_simplejwt.views import TokenRefreshView

from ifap_backend.views import HealthCheckView


schema_view = get_schema_view(
    openapi.Info(
        title="IFAP API",
        default_version='v1',
        description="API for IFAP platform",
        terms_of_service="https://www.google.com/policies/terms/",
        contact=openapi.Contact(email="contact@ifap.local"),
        license=openapi.License(name="BSD License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/token/', UserViewSet.as_view({'post': 'login'}), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/users/', include('users.urls')),
    path('api/courses/', include('courses.urls')),
    path('api/lessons/', include('lessons.urls')),
    path('api/quizzes/', include('quizzes.urls')),
    path('api/notifications/', include('notifications.urls')),
    path('api/forum/', include('forum.urls')),
    path('api/tasks/', include('tasks.urls')),
    path('api/library/', include('library.urls')),
    path('api/chat/', include('chat.urls')),
    path('api/contact/', include('contact.urls')),
    path('api/health-check/', HealthCheckView.as_view(), name='health_check'),

    # Swagger UI and ReDoc
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),

] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT) \
  + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
