from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Q, Count, Avg
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import os

from .models import (
    TaskCategory, Task, TaskAssignment, TaskSubmission, TaskFile, TaskComment
)
from .serializers import (
    TaskCategorySerializer, TaskSerializer, TaskAssignmentSerializer,
    TaskSubmissionSerializer, TaskFileSerializer, TaskCommentSerializer,
    TaskCreateSerializer, TaskSubmissionCreateSerializer
)
from users.permissions import IsInstructorOrAdmin, IsOwnerOrInstructorOrAdmin

class TaskCategoryViewSet(viewsets.ModelViewSet):
    queryset = TaskCategory.objects.filter(is_active=True)
    serializer_class = TaskCategorySerializer
    permission_classes = [permissions.IsAuthenticated, IsInstructorOrAdmin]

    def get_queryset(self):
        queryset = super().get_queryset()
        return queryset.order_by('name')

class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Task.objects.select_related('course', 'category', 'instructor')
        
        # Filtrar por curso si se especifica
        course_id = self.request.query_params.get('course', None)
        if course_id:
            queryset = queryset.filter(course_id=course_id)
        
        # Filtrar por categoría si se especifica
        category_id = self.request.query_params.get('category', None)
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        
        # Filtrar por estado si se especifica
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Los instructores ven todas las tareas de sus cursos
        if user.is_instructor:
            queryset = queryset.filter(
                Q(instructor=user) | Q(course__instructors=user)
            ).distinct()
        else:
            # Los estudiantes solo ven tareas asignadas a ellos
            queryset = queryset.filter(
                assignments__student=user,
                status='published'
            ).distinct()
        
        return queryset.order_by('-created_at')

    def get_serializer_class(self):
        if self.action == 'create':
            return TaskCreateSerializer
        return TaskSerializer

    def perform_create(self, serializer):
        serializer.save(instructor=self.request.user)

    @action(detail=True, methods=['post'])
    def assign_students(self, request, pk=None):
        """Asignar tarea a estudiantes específicos"""
        task = self.get_object()
        student_ids = request.data.get('student_ids', [])
        due_date_override = request.data.get('due_date_override', None)
        
        if not request.user.is_instructor:
            return Response(
                {'error': 'Solo los instructores pueden asignar tareas'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        assignments_created = []
        for student_id in student_ids:
            assignment, created = TaskAssignment.objects.get_or_create(
                task=task,
                student_id=student_id,
                defaults={'due_date_override': due_date_override}
            )
            if created:
                assignments_created.append(assignment)
        
        serializer = TaskAssignmentSerializer(assignments_created, many=True)
        return Response({
            'message': f'{len(assignments_created)} asignaciones creadas',
            'assignments': serializer.data
        })

    @action(detail=True, methods=['get'])
    def assignments(self, request, pk=None):
        """Obtener asignaciones de una tarea"""
        task = self.get_object()
        assignments = task.assignments.select_related('student').all()
        
        # Filtrar por estado si se especifica
        status_filter = request.query_params.get('status', None)
        if status_filter:
            assignments = assignments.filter(status=status_filter)
        
        serializer = TaskAssignmentSerializer(assignments, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def stats(self, request, pk=None):
        """Estadísticas de una tarea"""
        task = self.get_object()
        
        stats = {
            'total_assignments': task.assignments.count(),
            'submitted': task.assignments.filter(status='submitted').count(),
            'graded': task.assignments.filter(status='graded').count(),
            'pending': task.assignments.filter(status='assigned').count(),
            'overdue': task.assignments.filter(
                status__in=['assigned', 'in_progress']
            ).filter(
                Q(due_date_override__lt=timezone.now()) | 
                Q(due_date_override__isnull=True, task__due_date__lt=timezone.now())
            ).count(),
            'average_score': task.assignments.filter(
                submissions__score__isnull=False
            ).aggregate(avg_score=Avg('submissions__score'))['avg_score'] or 0
        }
        
        return Response(stats)

class TaskAssignmentViewSet(viewsets.ModelViewSet):
    serializer_class = TaskAssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = TaskAssignment.objects.select_related('task', 'student', 'task__course')
        
        if user.is_instructor:
            # Los instructores ven asignaciones de sus tareas
            queryset = queryset.filter(
                Q(task__instructor=user) | Q(task__course__instructors=user)
            ).distinct()
        else:
            # Los estudiantes solo ven sus propias asignaciones
            queryset = queryset.filter(student=user)
        
        # Filtrar por curso si se especifica
        course_id = self.request.query_params.get('course', None)
        if course_id:
            queryset = queryset.filter(task__course_id=course_id)
        
        # Filtrar por estado si se especifica
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        return queryset.order_by('-assigned_date')

    @action(detail=True, methods=['post'])
    def start(self, request, pk=None):
        """Marcar asignación como iniciada"""
        assignment = self.get_object()
        
        if assignment.student != request.user:
            return Response(
                {'error': 'No tienes permiso para iniciar esta tarea'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if assignment.status == 'assigned':
            assignment.status = 'in_progress'
            assignment.started_at = timezone.now()
            assignment.last_activity = timezone.now()
            assignment.save()
        
        serializer = self.get_serializer(assignment)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def submissions(self, request, pk=None):
        """Obtener entregas de una asignación"""
        assignment = self.get_object()
        submissions = assignment.submissions.all().order_by('-submitted_at')
        serializer = TaskSubmissionSerializer(submissions, many=True)
        return Response(serializer.data)

class TaskSubmissionViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSubmissionSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        user = self.request.user
        queryset = TaskSubmission.objects.select_related(
            'assignment', 'assignment__task', 'assignment__student', 'graded_by'
        )
        
        if user.is_instructor:
            # Los instructores ven entregas de sus tareas
            queryset = queryset.filter(
                Q(assignment__task__instructor=user) | 
                Q(assignment__task__course__instructors=user)
            ).distinct()
        else:
            # Los estudiantes solo ven sus propias entregas
            queryset = queryset.filter(assignment__student=user)
        
        # Filtrar por asignación si se especifica
        assignment_id = self.request.query_params.get('assignment', None)
        if assignment_id:
            queryset = queryset.filter(assignment_id=assignment_id)
        
        return queryset.order_by('-submitted_at')

    def get_serializer_class(self):
        if self.action == 'create':
            return TaskSubmissionCreateSerializer
        return TaskSubmissionSerializer

    def perform_create(self, serializer):
        assignment_id = self.request.data.get('assignment')
        assignment = get_object_or_404(TaskAssignment, id=assignment_id)
        
        # Verificar permisos
        if assignment.student != self.request.user:
            raise PermissionError("No tienes permiso para entregar esta tarea")
        
        # Verificar límite de intentos
        current_attempts = assignment.submissions.count()
        if current_attempts >= assignment.task.max_attempts:
            raise ValueError("Has alcanzado el límite de intentos para esta tarea")
        
        # Calcular número de intento
        attempt_number = current_attempts + 1
        
        submission = serializer.save(
            assignment=assignment,
            attempt_number=attempt_number
        )
        
        # Actualizar estado de la asignación
        assignment.status = 'submitted'
        assignment.last_activity = timezone.now()
        assignment.save()
        
        # Procesar archivos adjuntos si los hay
        files = self.request.FILES.getlist('files')
        for file in files:
            TaskFile.objects.create(
                submission=submission,
                file=file,
                original_name=file.name,
                file_size=file.size,
                file_type=file.content_type or 'application/octet-stream'
            )

    @action(detail=True, methods=['post'])
    def grade(self, request, pk=None):
        """Calificar una entrega"""
        submission = self.get_object()
        
        if not request.user.is_instructor:
            return Response(
                {'error': 'Solo los instructores pueden calificar'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        score = request.data.get('score')
        feedback = request.data.get('feedback', '')
        
        if score is not None:
            submission.score = score
            submission.feedback = feedback
            submission.graded_by = request.user
            submission.graded_at = timezone.now()
            submission.save()
            
            # Actualizar estado de la asignación
            submission.assignment.status = 'graded'
            submission.assignment.save()
        
        serializer = self.get_serializer(submission)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def add_comment(self, request, pk=None):
        """Agregar comentario a una entrega"""
        submission = self.get_object()
        content = request.data.get('content')
        is_private = request.data.get('is_private', False)
        
        if not content:
            return Response(
                {'error': 'El contenido del comentario es requerido'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        comment = TaskComment.objects.create(
            submission=submission,
            author=request.user,
            content=content,
            is_private=is_private and request.user.is_instructor
        )
        
        serializer = TaskCommentSerializer(comment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class TaskFileViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = TaskFileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = TaskFile.objects.select_related('submission', 'submission__assignment')
        
        if user.is_instructor:
            # Los instructores ven archivos de entregas de sus tareas
            queryset = queryset.filter(
                Q(submission__assignment__task__instructor=user) |
                Q(submission__assignment__task__course__instructors=user)
            ).distinct()
        else:
            # Los estudiantes solo ven sus propios archivos
            queryset = queryset.filter(submission__assignment__student=user)
        
        return queryset.order_by('-uploaded_at')

class TaskCommentViewSet(viewsets.ModelViewSet):
    serializer_class = TaskCommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = TaskComment.objects.select_related('submission', 'author')
        
        if user.is_instructor:
            # Los instructores ven todos los comentarios de sus tareas
            queryset = queryset.filter(
                Q(submission__assignment__task__instructor=user) |
                Q(submission__assignment__task__course__instructors=user)
            ).distinct()
        else:
            # Los estudiantes ven comentarios no privados y sus propios comentarios
            queryset = queryset.filter(
                Q(submission__assignment__student=user) &
                (Q(is_private=False) | Q(author=user))
            )
        
        # Filtrar por entrega si se especifica
        submission_id = self.request.query_params.get('submission', None)
        if submission_id:
            queryset = queryset.filter(submission_id=submission_id)
        
        return queryset.order_by('created_at')

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
