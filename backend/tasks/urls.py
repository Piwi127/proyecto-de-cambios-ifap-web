from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'categories', views.TaskCategoryViewSet, basename='task-category')
router.register(r'tasks', views.TaskViewSet, basename='task')
router.register(r'assignments', views.TaskAssignmentViewSet, basename='task-assignment')
router.register(r'submissions', views.TaskSubmissionViewSet, basename='task-submission')
router.register(r'files', views.TaskFileViewSet, basename='task-file')
router.register(r'comments', views.TaskCommentViewSet, basename='task-comment')

app_name = 'tasks'

urlpatterns = [
    path('api/', include(router.urls)),
]