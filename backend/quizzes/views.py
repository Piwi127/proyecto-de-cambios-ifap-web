from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Count, Avg, Max
from .models import Quiz, Question, Option, QuizAttempt, UserAnswer
from .serializers import (
    QuizSerializer, QuestionSerializer, OptionSerializer,
    QuizAttemptSerializer, UserAnswerSerializer,
    QuizCreateSerializer, QuestionCreateSerializer, QuizSubmissionSerializer
)
from courses.models import Course
from lessons.models import Lesson

class QuizViewSet(viewsets.ModelViewSet):
    serializer_class = QuizSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_instructor:
            # Instructors can see all quizzes they created
            return Quiz.objects.filter(created_by=user).select_related(
                'course', 'lesson', 'created_by'
            ).prefetch_related('questions__options')
        else:
            # Students can only see published quizzes for courses they're enrolled in
            enrolled_courses = user.courses_enrolled.filter(is_active=True)
            return Quiz.objects.filter(
                is_published=True,
                course__in=enrolled_courses
            ).select_related('course', 'lesson', 'created_by').prefetch_related('questions__options')

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return QuizCreateSerializer
        return QuizSerializer

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def questions(self, request, pk=None):
        quiz = self.get_object()
        questions = quiz.questions.all().order_by('order')
        serializer = QuestionSerializer(questions, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def start_attempt(self, request, pk=None):
        quiz = self.get_object()
        user = request.user

        # Check if user is enrolled in the course
        if not quiz.course.students.filter(id=user.id).exists():
            return Response(
                {'error': 'No estás inscrito en este curso'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Check max attempts
        if quiz.max_attempts > 0:
            attempt_count = QuizAttempt.objects.filter(user=user, quiz=quiz).count()
            if attempt_count >= quiz.max_attempts:
                return Response(
                    {'error': 'Has alcanzado el máximo número de intentos permitidos'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        # Create new attempt
        attempt = QuizAttempt.objects.create(
            user=user,
            quiz=quiz,
            attempt_number=QuizAttempt.objects.filter(user=user, quiz=quiz).count() + 1
        )

        serializer = QuizAttemptSerializer(attempt)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def submit(self, request, pk=None):
        quiz = self.get_object()
        user = request.user

        # Get the latest attempt
        attempt = QuizAttempt.objects.filter(user=user, quiz=quiz, completed_at__isnull=True).first()
        if not attempt:
            return Response(
                {'error': 'No hay un intento activo para este quiz'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = QuizSubmissionSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        answers_data = serializer.validated_data['answers']
        total_score = 0
        max_score = 0

        # Process each answer
        for answer_data in answers_data:
            question = get_object_or_404(Question, id=answer_data['question_id'])
            max_score += question.points

            user_answer = UserAnswer.objects.create(
                attempt=attempt,
                question=question,
                text_answer=answer_data.get('text_answer', '')
            )

            # Handle selected options for multiple choice questions
            if 'selected_options' in answer_data:
                selected_options = Option.objects.filter(id__in=answer_data['selected_options'])
                user_answer.selected_options.set(selected_options)

            # Calculate if answer is correct
            if question.question_type in ['multiple_choice', 'true_false']:
                correct_options = question.options.filter(is_correct=True)
                selected_correct = user_answer.selected_options.filter(is_correct=True).count()
                total_correct = correct_options.count()
                
                if selected_correct == total_correct and user_answer.selected_options.count() == total_correct:
                    user_answer.is_correct = True
                    user_answer.points_earned = question.points
                    total_score += question.points
                else:
                    user_answer.points_earned = 0
            else:
                # For essay/short answer, manual grading needed
                user_answer.points_earned = 0

            user_answer.save()

        # Update attempt
        attempt.score = total_score
        attempt.max_score = max_score
        attempt.percentage = (total_score / max_score * 100) if max_score > 0 else 0
        attempt.is_passed = attempt.percentage >= quiz.passing_score
        attempt.completed_at = timezone.now()
        if attempt.completed_at:
            attempt.time_taken_seconds = int((attempt.completed_at - attempt.started_at).total_seconds())
        attempt.save()

        serializer = QuizAttemptSerializer(attempt)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_attempts(self, request):
        user = request.user
        attempts = QuizAttempt.objects.filter(user=user).select_related('quiz', 'quiz__course')
        serializer = QuizAttemptSerializer(attempts, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def results(self, request, pk=None):
        quiz = self.get_object()
        user = request.user
        
        attempts = QuizAttempt.objects.filter(user=user, quiz=quiz).order_by('-attempt_number')
        serializer = QuizAttemptSerializer(attempts, many=True)
        return Response(serializer.data)

class QuestionViewSet(viewsets.ModelViewSet):
    serializer_class = QuestionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_instructor:
            return Question.objects.filter(quiz__created_by=user).select_related('quiz').prefetch_related('options')
        return Question.objects.none()  # Students can't access questions directly

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return QuestionCreateSerializer
        return QuestionSerializer

    def create(self, request, *args, **kwargs):
        quiz_id = request.data.get('quiz')
        quiz = get_object_or_404(Quiz, id=quiz_id)
        
        # Verify the instructor owns the quiz
        if quiz.created_by != request.user:
            return Response(
                {'error': 'No tienes permisos para agregar preguntas a este quiz'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        serializer.save()

class QuizAttemptViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = QuizAttemptSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_instructor:
            # Instructors can see all attempts for their quizzes
            return QuizAttempt.objects.filter(quiz__created_by=user).select_related('user', 'quiz')
        else:
            # Students can only see their own attempts
            return QuizAttempt.objects.filter(user=user).select_related('quiz')

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def answers(self, request, pk=None):
        attempt = self.get_object()
        
        # Verify access
        if not request.user.is_instructor and attempt.user != request.user:
            return Response(
                {'error': 'No tienes acceso a estos resultados'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        answers = attempt.user_answers.all().select_related('question')
        serializer = UserAnswerSerializer(answers, many=True)
        return Response(serializer.data)

class StatsViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'], permission_classes=[IsAdminUser])
    def overall(self, request):
        # Overall statistics for admin
        total_quizzes = Quiz.objects.count()
        total_questions = Question.objects.count()
        total_attempts = QuizAttempt.objects.count()
        avg_score = QuizAttempt.objects.aggregate(avg=Avg('percentage'))['avg'] or 0
        
        return Response({
            'total_quizzes': total_quizzes,
            'total_questions': total_questions,
            'total_attempts': total_attempts,
            'average_score': round(avg_score, 2)
        })

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def user_stats(self, request):
        user = request.user
        attempts = QuizAttempt.objects.filter(user=user)
        
        total_attempts = attempts.count()
        passed_attempts = attempts.filter(is_passed=True).count()
        avg_score = attempts.aggregate(avg=Avg('percentage'))['avg'] or 0
        
        return Response({
            'total_attempts': total_attempts,
            'passed_attempts': passed_attempts,
            'average_score': round(avg_score, 2),
            'success_rate': round((passed_attempts / total_attempts * 100) if total_attempts > 0 else 0, 2)
        })