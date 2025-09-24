from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from django.shortcuts import get_object_or_404
from django.utils import timezone
from courses.models import Course
from .models import Lesson, LessonCompletion
from .serializers import LessonSerializer, LessonContentSerializer

class LessonViewSet(viewsets.ModelViewSet):
    queryset = Lesson.objects.filter(is_published=True)
    serializer_class = LessonSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = Lesson.objects.filter(is_published=True)
        course_id = self.request.query_params.get('course', None)
        if course_id:
            queryset = queryset.filter(course_id=course_id)
        return queryset

    def perform_create(self, serializer):
        # Solo instructores pueden crear lecciones
        if not self.request.user.is_instructor:
            raise PermissionError("Solo instructores pueden crear lecciones")
        serializer.save(instructor=self.request.user)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_course_lessons(self, request):
        user = request.user
        course_id = request.query_params.get('course_id')

        if not course_id:
            return Response(
                {'error': 'Se requiere course_id'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Verificar que el usuario esté inscrito en el curso
        try:
            course = get_object_or_404(Course, id=course_id, students=user)
            lessons = Lesson.objects.filter(course=course, is_published=True)
            serializer = self.get_serializer(lessons, many=True)
            return Response(serializer.data)
        except:
            return Response(
                {'error': 'No tienes acceso a este curso'},
                status=status.HTTP_403_FORBIDDEN
            )

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def content(self, request, pk=None):
        lesson = self.get_object()
        user = request.user

        # Verificar que el usuario esté inscrito en el curso
        if not lesson.course.students.filter(id=user.id).exists():
            return Response(
                {'error': 'No tienes acceso a esta lección'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = LessonContentSerializer(lesson)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def complete(self, request, pk=None):
        lesson = self.get_object()
        user = request.user

        # Verificar que el usuario esté inscrito en el curso
        if not lesson.course.students.filter(id=user.id).exists():
            return Response(
                {'error': 'No tienes acceso a esta lección'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Verificar si ya está completada
        completion, created = LessonCompletion.objects.get_or_create(
            user=user,
            lesson=lesson,
            defaults={'completed_at': timezone.now()}
        )

        if created:
            return Response(
                {'message': 'Lección marcada como completada', 'completed_at': completion.completed_at},
                status=status.HTTP_201_CREATED
            )
        else:
            return Response(
                {'message': 'La lección ya estaba completada', 'completed_at': completion.completed_at},
                status=status.HTTP_200_OK
            )
