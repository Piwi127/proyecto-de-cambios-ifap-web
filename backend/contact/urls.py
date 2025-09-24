from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ContactInfoViewSet, contact_info_test_view, ContactFormSubmissionViewSet

router = DefaultRouter()
router.register(r'submissions', ContactFormSubmissionViewSet, basename='contactformsubmission')

urlpatterns = [
    path('info/', ContactInfoViewSet.as_view({'get': 'list'}), name='contactinfo-list'),
    path('test/', contact_info_test_view, name='contact-test-view'),
    path('', include(router.urls)),
]