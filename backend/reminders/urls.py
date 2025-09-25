from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ReminderViewSet

# Crear el router para las vistas basadas en ViewSet
router = DefaultRouter()
router.register(r'', ReminderViewSet, basename='reminder')

urlpatterns = [
    path('', include(router.urls)),
]