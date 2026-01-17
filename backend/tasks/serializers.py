from rest_framework import serializers
from django.utils import timezone
from django.contrib.auth import get_user_model

from .models import (
    TaskCategory, Task, TaskAssignment, TaskSubmission, TaskFile, TaskComment
)
from courses.serializers import CourseSerializer
from users.serializers import UserSerializer

User = get_user_model()

class TaskCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskCategory
        fields = ['id', 'name', 'description', 'color', 'icon', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']

class TaskFileSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()
    
    class Meta:
        model = TaskFile
        fields = [
            'id', 'file', 'file_url', 'original_name', 'file_size', 
            'file_type', 'uploaded_at'
        ]
        read_only_fields = ['id', 'file_url', 'uploaded_at']
    
    def get_file_url(self, obj):
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None

class TaskCommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    
    class Meta:
        model = TaskComment
        fields = [
            'id', 'submission', 'author', 'content', 'is_private', 
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'author', 'created_at', 'updated_at']

class TaskSubmissionSerializer(serializers.ModelSerializer):
    files = TaskFileSerializer(many=True, read_only=True)
    comments = TaskCommentSerializer(many=True, read_only=True)
    graded_by = UserSerializer(read_only=True)
    
    class Meta:
        model = TaskSubmission
        fields = [
            'id', 'assignment', 'content', 'score', 'feedback', 
            'attempt_number', 'submitted_at', 'graded_at', 'graded_by',
            'files', 'comments'
        ]
        read_only_fields = [
            'id', 'attempt_number', 'submitted_at', 'graded_at', 
            'graded_by', 'files', 'comments'
        ]

class TaskSubmissionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskSubmission
        fields = ['assignment', 'content']

class TaskAssignmentSerializer(serializers.ModelSerializer):
    student = UserSerializer(read_only=True)
    task_title = serializers.CharField(source='task.title', read_only=True)
    task_description = serializers.CharField(source='task.description', read_only=True)
    task_instructions = serializers.CharField(source='task.instructions', read_only=True)
    task_priority = serializers.CharField(source='task.priority', read_only=True)
    task_due_date = serializers.DateTimeField(source='task.due_date', read_only=True)
    task_max_attempts = serializers.IntegerField(source='task.max_attempts', read_only=True)
    task_allow_late_submission = serializers.BooleanField(source='task.allow_late_submission', read_only=True)
    task_late_penalty_percent = serializers.DecimalField(source='task.late_penalty_percent', max_digits=5, decimal_places=2, read_only=True)
    task_max_score = serializers.DecimalField(source='task.max_score', max_digits=5, decimal_places=2, read_only=True)
    instructor_name = serializers.CharField(source='task.instructor.get_full_name', read_only=True)
    course_name = serializers.CharField(source='task.course.title', read_only=True)
    submissions = TaskSubmissionSerializer(many=True, read_only=True)
    effective_due_date = serializers.SerializerMethodField()
    is_overdue = serializers.SerializerMethodField()
    latest_submission = serializers.SerializerMethodField()
    
    class Meta:
        model = TaskAssignment
        fields = [
            'id', 'task', 'task_title', 'task_description', 'task_instructions',
            'task_priority',
            'task_due_date', 'task_max_attempts', 'task_allow_late_submission',
            'task_late_penalty_percent', 'task_max_score', 'instructor_name',
            'course_name',
            'student', 'status', 'assigned_date', 'due_date_override',
            'effective_due_date',
            'started_at', 'last_activity', 'is_overdue', 'submissions',
            'latest_submission'
        ]
        read_only_fields = [
            'id', 'task_title', 'task_description', 'task_instructions',
            'task_priority',
            'task_due_date', 'task_max_attempts', 'task_allow_late_submission',
            'task_late_penalty_percent', 'task_max_score', 'instructor_name',
            'course_name', 'student', 'assigned_date', 'started_at',
            'last_activity', 'effective_due_date', 'is_overdue',
            'submissions', 'latest_submission'
        ]
    
    def get_effective_due_date(self, obj):
        return obj.due_date_override or obj.task.due_date
    
    def get_is_overdue(self, obj):
        due_date = obj.due_date_override or obj.task.due_date
        if due_date and obj.status in ['assigned', 'in_progress']:
            return timezone.now() > due_date
        return False
    
    def get_latest_submission(self, obj):
        latest = obj.submissions.order_by('-submitted_at').first()
        if latest:
            return TaskSubmissionSerializer(latest, context=self.context).data
        return None

class TaskSerializer(serializers.ModelSerializer):
    category = TaskCategorySerializer(read_only=True)
    course = CourseSerializer(read_only=True)
    lesson = serializers.PrimaryKeyRelatedField(read_only=True)
    instructor = UserSerializer(read_only=True)
    assignments_count = serializers.SerializerMethodField()
    submissions_count = serializers.SerializerMethodField()
    graded_count = serializers.SerializerMethodField()
    average_score = serializers.SerializerMethodField()
    user_assignment = serializers.SerializerMethodField()
    
    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'instructions', 'category', 'course',
            'lesson',
            'instructor', 'priority', 'status', 'due_date', 'start_date',
            'max_attempts', 'max_score', 'allow_late_submission',
            'late_penalty_percent', 'show_score_to_student',
            'attachment_required', 'allowed_file_types', 'max_file_size_mb',
            'created_at', 'updated_at', 'assignments_count',
            'submissions_count', 'graded_count', 'average_score',
            'user_assignment'
        ]
        read_only_fields = [
            'id', 'category', 'course', 'lesson', 'instructor', 'created_at',
            'updated_at', 'assignments_count', 'submissions_count',
            'graded_count', 'average_score', 'user_assignment'
        ]
    
    def get_assignments_count(self, obj):
        return obj.assignments.count()
    
    def get_submissions_count(self, obj):
        return TaskSubmission.objects.filter(assignment__task=obj).count()
    
    def get_graded_count(self, obj):
        return obj.assignments.filter(status='graded').count()
    
    def get_average_score(self, obj):
        submissions = TaskSubmission.objects.filter(
            assignment__task=obj,
            score__isnull=False
        )
        if submissions.exists():
            total_score = sum(s.score for s in submissions)
            return round(total_score / submissions.count(), 2)
        return None
    
    def get_user_assignment(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated and not request.user.is_instructor:
            assignment = obj.assignments.filter(student=request.user).first()
            if assignment:
                return TaskAssignmentSerializer(assignment, context=self.context).data
        return None

class TaskCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = [
            'title', 'description', 'instructions', 'category', 'course',
            'lesson', 'priority', 'status', 'due_date', 'start_date',
            'max_attempts', 'max_score', 'allow_late_submission',
            'late_penalty_percent', 'show_score_to_student',
            'attachment_required', 'allowed_file_types', 'max_file_size_mb'
        ]

    def validate_category(self, value):
        if value and not value.is_active:
            raise serializers.ValidationError("Categoría no válida")
        return value

    def validate_course(self, value):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            raise serializers.ValidationError("Usuario no autenticado")

        if request.user.is_superuser:
            return value

        if not request.user.is_instructor:
            raise serializers.ValidationError("No tienes permiso para crear tareas en este curso")

        if value.instructor_id != request.user.id:
            raise serializers.ValidationError("No tienes permiso para crear tareas en este curso")

        return value

# Serializers para estadísticas
class TaskStatsSerializer(serializers.Serializer):
    total_assignments = serializers.IntegerField()
    submitted = serializers.IntegerField()
    graded = serializers.IntegerField()
    pending = serializers.IntegerField()
    overdue = serializers.IntegerField()
    average_score = serializers.FloatField()

class UserTaskStatsSerializer(serializers.Serializer):
    total_tasks = serializers.IntegerField()
    completed_tasks = serializers.IntegerField()
    pending_tasks = serializers.IntegerField()
    overdue_tasks = serializers.IntegerField()
    average_score = serializers.FloatField()
    completion_rate = serializers.FloatField()
