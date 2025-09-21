from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from django.shortcuts import get_object_or_404
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django.db.models import Avg, Count
from lessons.models import LessonCompletion
from quizzes.models import Quiz, QuizAttempt
from .models import Course
from .serializers import CourseSerializer
from ifap_backend.pagination import StandardResultsPagination
from ifap_backend.query_optimizations import OptimizedQueryMixin, CourseQueryOptimizer
from ifap_backend.cache_service import cache_service, CacheKeys
import logging

logger = logging.getLogger('courses')

class CourseViewSet(OptimizedQueryMixin, viewsets.ModelViewSet):
    queryset = Course.objects.filter(is_active=True)
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    pagination_class = StandardResultsPagination

    def optimize_queryset(self, queryset):
        """Aplicar optimizaciones específicas según la acción"""
        if self.action == 'list':
            return CourseQueryOptimizer.get_courses_with_details().filter(is_active=True)
        elif self.action == 'retrieve':
            return queryset.select_related('instructor').prefetch_related(
                'students', 'lessons', 'categories'
            )
        elif self.action == 'my_courses':
            return CourseQueryOptimizer.get_user_courses(self.request.user)
        
        return queryset.select_related('instructor').prefetch_related('students')

    @method_decorator(cache_page(60 * 15))  # Cache for 15 minutes
    def list(self, request, *args, **kwargs):
        logger.info(f"User {request.user.id if request.user.is_authenticated else 'anonymous'} requested course list")
        return super().list(request, *args, **kwargs)

    def retrieve(self, request, *args, **kwargs):
        course_id = kwargs.get('pk')
        cache_key = cache_service.make_key(CacheKeys.COURSE_DETAIL, course_id, request.user.id if request.user.is_authenticated else 'anonymous')
        
        cached_response = cache_service.get(cache_key, cache_alias='api')
        if cached_response:
            logger.info(f"Course {course_id} detail served from cache")
            return Response(cached_response)
        
        response = super().retrieve(request, *args, **kwargs)
        if response.status_code == 200:
            cache_service.set(cache_key, response.data, 900, 'api')  # 15 minutos
            logger.info(f"Course {course_id} detail cached")
        
        return response

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def enroll(self, request, pk=None):
        course = self.get_object()
        user = request.user

        if course.students.filter(id=user.id).exists():
            return Response(
                {'message': 'Ya estás inscrito en este curso'},
                status=status.HTTP_400_BAD_REQUEST
            )

        course.students.add(user)
        return Response({'message': 'Inscripción exitosa'})

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def unenroll(self, request, pk=None):
        course = self.get_object()
        user = request.user

        if not course.students.filter(id=user.id).exists():
            return Response(
                {'message': 'No estás inscrito en este curso'},
                status=status.HTTP_400_BAD_REQUEST
            )

        course.students.remove(user)
        return Response({'message': 'Te has dado de baja del curso'})

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_courses(self, request):
        user = request.user
        enrolled_courses = user.courses_enrolled.filter(is_active=True)
        serializer = self.get_serializer(enrolled_courses, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def taught_courses(self, request):
        user = request.user
        # Permitir acceso a instructores y superusers/administradores
        if not user.is_instructor and not user.is_superuser:
            return Response(
                {'error': 'No tienes permisos para ver cursos impartidos'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if user.is_superuser:
            # Si es superuser, mostrar todos los cursos activos
            taught_courses = Course.objects.filter(is_active=True)
        else:
            # Si es instructor, mostrar solo sus cursos
            taught_courses = user.courses_taught.filter(is_active=True)
        
        serializer = self.get_serializer(taught_courses, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def metrics(self, request, pk=None):
        course = self.get_object()
        # Permitir acceso al instructor del curso o a superusers/administradores
        if not request.user.is_superuser and (not request.user.is_instructor or request.user != course.instructor):
            return Response({'error': 'Solo el instructor o administradores pueden ver las métricas'}, status=status.HTTP_403_FORBIDDEN)
        total_students = course.students.count()
        total_lessons = course.lessons.count()
        if total_lessons > 0:
            completions = LessonCompletion.objects.filter(lesson__course=course).values('user').annotate(count=Count('id')).aggregate(avg=Avg('count'))
            avg_progress = ((completions['avg'] or 0) / total_lessons) * 100
        else:
            avg_progress = 0
        quizzes = Quiz.objects.filter(course=course)
        if quizzes.exists():
            avg_score = QuizAttempt.objects.filter(quiz__in=quizzes).aggregate(avg=Avg('percentage'))['avg'] or 0
        else:
            avg_score = 0
        data = {
            'total_students': total_students,
            'average_progress': round(avg_progress, 2),
            'average_score': round(avg_score, 2),
        }
        return Response(data)
