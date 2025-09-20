from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ForumCategoryViewSet, ForumTopicViewSet, 
    ForumReplyViewSet, ForumStatsView,
    LessonCommentViewSet, ConversationViewSet,
    MessageViewSet, TypingIndicatorViewSet
)

router = DefaultRouter()
router.register(r'categories', ForumCategoryViewSet, basename='forum-categories')
router.register(r'topics', ForumTopicViewSet, basename='forum-topics')
router.register(r'replies', ForumReplyViewSet, basename='forum-replies')
router.register(r'stats', ForumStatsView, basename='forum-stats')

# Nuevas rutas para comentarios en lecciones y mensajería
router.register(r'lesson-comments', LessonCommentViewSet, basename='lesson-comments')
router.register(r'conversations', ConversationViewSet, basename='conversations')
router.register(r'messages', MessageViewSet, basename='messages')
router.register(r'typing-indicators', TypingIndicatorViewSet, basename='typing-indicators')

urlpatterns = [
    path('', include(router.urls)),
]