from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CourseViewSet

router = DefaultRouter()
router.register(r'', CourseViewSet)

urlpatterns = [
    path('', include(router.urls)),
    # Rutas administrativas adicionales
    path('admin/all/', CourseViewSet.as_view({'get': 'admin_all'}), name='course-admin-all'),
    path('admin/inactive/', CourseViewSet.as_view({'get': 'admin_inactive'}), name='course-admin-inactive'),
    path('admin/metrics/', CourseViewSet.as_view({'get': 'admin_metrics'}), name='course-admin-metrics'),
    path('admin/instructor-stats/', CourseViewSet.as_view({'get': 'admin_instructor_stats'}), name='course-admin-instructor-stats'),
    path('bulk-activate/', CourseViewSet.as_view({'post': 'bulk_activate'}), name='course-bulk-activate'),
    path('bulk-deactivate/', CourseViewSet.as_view({'post': 'bulk_deactivate'}), name='course-bulk-deactivate'),
    path('bulk-delete/', CourseViewSet.as_view({'post': 'bulk_delete'}), name='course-bulk-delete'),
    path('<int:pk>/metrics/', CourseViewSet.as_view({'get': 'course_metrics'}), name='course-metrics'),
]