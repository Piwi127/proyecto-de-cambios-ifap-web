from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import QuizViewSet, QuestionViewSet, QuizAttemptViewSet, StatsViewSet, QuizTemplateViewSet

router = DefaultRouter()
router.register(r'questions', QuestionViewSet, basename='question')
router.register(r'attempts', QuizAttemptViewSet, basename='attempt')
router.register(r'stats', StatsViewSet, basename='stats')
router.register(r'templates', QuizTemplateViewSet, basename='template')
router.register(r'', QuizViewSet, basename='quiz')

urlpatterns = [
    path('', include(router.urls)),
]
