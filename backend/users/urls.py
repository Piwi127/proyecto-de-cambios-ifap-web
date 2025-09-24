from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, UserRegisterView

router = DefaultRouter()
router.register(r'', UserViewSet)

urlpatterns = [
    path('register/', UserRegisterView.as_view(), name='user-register'),
    path('', include(router.urls)),
]