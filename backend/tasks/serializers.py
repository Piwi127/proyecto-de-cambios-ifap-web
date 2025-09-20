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
    course_name = serializers.CharField(source='task.course.name', read_only=True)
    submissions = TaskSubmissionSerializer(many=True, read_only=True)
    effective_due_date = serializers.SerializerMethodField()
    is_overdue = serializers.SerializerMethodField()
    latest_submission = serializers.SerializerMethodField()
    
    class Meta:
        model = TaskAssignment
        fields = [
            'id', 'task', 'task_title', 'course_name', 'student', 'status',
            'assigned_date', 'due_date_override', 'effective_due_date',
            'started_at', 'last_activity', 'is_overdue', 'submissions',
            'latest_submission'
        ]
        read_only_fields = [
            'id', 'task_title', 'course_name', 'student', 'assigned_date',
            'started_at', 'last_activity', 'effective_due_date', 'is_overdue',
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
            'instructor', 'status', 'task_type', 'due_date', 'max_attempts',
            'max_score', 'allow_late_submission', 'auto_grade', 'rubric',
            'created_at', 'updated_at', 'assignments_count', 'submissions_count',
            'graded_count', 'average_score', 'user_assignment'
        ]
        read_only_fields = [
            'id', 'category', 'course', 'instructor', 'created_at', 'updated_at',
            'assignments_count', 'submissions_count', 'graded_count', 
            'average_score', 'user_assignment'
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
    category_id = serializers.IntegerField(write_only=True)
    course_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = Task
        fields = [
            'title', 'description', 'instructions', 'category_id', 'course_id',
            'status', 'task_type', 'due_date', 'max_attempts', 'max_score',
            'allow_late_submission', 'auto_grade', 'rubric'
        ]
    
    def validate_category_id(self, value):
        try:
            TaskCategory.objects.get(id=value, is_active=True)
        except TaskCategory.DoesNotExist:
            raise serializers.ValidationError("Categoría no válida")
        return value
    
    def validate_course_id(self, value):
        from courses.models import Course
        try:
            course = Course.objects.get(id=value)
            # Verificar que el usuario sea instructor del curso
            request = self.context.get('request')
            if request and not course.instructors.filter(id=request.user.id).exists():
                raise serializers.ValidationError("No tienes permiso para crear tareas en este curso")
        except Course.DoesNotExist:
            raise serializers.ValidationError("Curso no válido")
        return value
    
    def create(self, validated_data):
        category_id = validated_data.pop('category_id')
        course_id = validated_data.pop('course_id')
        
        validated_data['category_id'] = category_id
        validated_data['course_id'] = course_id
        
        return super().create(validated_data)

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