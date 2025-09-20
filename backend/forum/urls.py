from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ForumCategoryViewSet, ForumTopicViewSet, 
    ForumReplyViewSet, ForumStatsView
)

router = DefaultRouter()
router.register(r'categories', ForumCategoryViewSet, basename='forum-categories')
router.register(r'topics', ForumTopicViewSet, basename='forum-topics')
router.register(r'replies', ForumReplyViewSet, basename='forum-replies')
router.register(r'stats', ForumStatsView, basename='forum-stats')

urlpatterns = [
    path('', include(router.urls)),
]