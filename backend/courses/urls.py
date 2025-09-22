from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CourseViewSet

router = DefaultRouter()
router.register(r'courses', CourseViewSet)

urlpatterns = [
    path('', include(router.urls)),
    # Rutas administrativas adicionales
    path('courses/admin/all/', CourseViewSet.as_view({'get': 'admin_all'}), name='course-admin-all'),
    path('courses/admin/inactive/', CourseViewSet.as_view({'get': 'admin_inactive'}), name='course-admin-inactive'),
    path('courses/admin/metrics/', CourseViewSet.as_view({'get': 'admin_metrics'}), name='course-admin-metrics'),
    path('courses/admin/instructor-stats/', CourseViewSet.as_view({'get': 'admin_instructor_stats'}), name='course-admin-instructor-stats'),
    path('courses/bulk-activate/', CourseViewSet.as_view({'post': 'bulk_activate'}), name='course-bulk-activate'),
    path('courses/bulk-deactivate/', CourseViewSet.as_view({'post': 'bulk_deactivate'}), name='course-bulk-deactivate'),
    path('courses/bulk-delete/', CourseViewSet.as_view({'post': 'bulk_delete'}), name='course-bulk-delete'),
]