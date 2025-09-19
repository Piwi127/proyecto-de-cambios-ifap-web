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

class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.filter(is_active=True).select_related('instructor').prefetch_related('students')
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    @method_decorator(cache_page(60 * 15))  # Cache for 15 minutes
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @method_decorator(cache_page(60 * 15))
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    def get_queryset(self):
        queryset = Course.objects.filter(is_active=True).select_related('instructor').prefetch_related('students')
        # Si el usuario está autenticado, incluir información adicional
        if self.request.user.is_authenticated:
            return queryset
        return queryset

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
        if not user.is_instructor:
            return Response(
                {'error': 'No tienes permisos para ver cursos impartidos'},
                status=status.HTTP_403_FORBIDDEN
            )
        taught_courses = user.courses_taught.filter(is_active=True)
        serializer = self.get_serializer(taught_courses, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def metrics(self, request, pk=None):
        course = self.get_object()
        if not request.user.is_instructor or request.user != course.instructor:
            return Response({'error': 'Solo el instructor puede ver las métricas'}, status=status.HTTP_403_FORBIDDEN)
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
