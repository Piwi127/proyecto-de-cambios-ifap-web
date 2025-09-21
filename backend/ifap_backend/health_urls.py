"""
URLs para health checks del sistema
"""
from django.urls import path
from . import health_views

urlpatterns = [
    path('', health_views.health_check, name='health_check'),
    path('detailed/', health_views.detailed_health_check, name='detailed_health_check'),
]