from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.http import HttpResponse
from django.db.models import Count, Avg, Max
from .models import Quiz, Question, Option, QuizAttempt, UserAnswer, QuizTemplate
from .serializers import (
    QuizSerializer, QuestionSerializer, OptionSerializer,
    QuizAttemptSerializer, UserAnswerSerializer,
    QuizCreateSerializer, QuestionCreateSerializer, QuizSubmissionSerializer,
    QuizTemplateSerializer
)
from courses.models import Course
from lessons.models import Lesson
from users.permissions import IsInstructorOrAdmin

class QuizViewSet(viewsets.ModelViewSet):
    serializer_class = QuizSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        """
        Permisos dinámicos basados en la acción:
        - Lectura (list, retrieve): cualquier usuario autenticado
        - Escritura (create, update, delete): solo instructores y administradores
        """
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsInstructorOrAdmin()]
        return [IsAuthenticated()]

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

    def _build_quiz_payload(self, quiz):
        questions = quiz.questions.all().prefetch_related('options').order_by('order')
        return {
            'title': quiz.title,
            'description': quiz.description,
            'quiz_type': quiz.quiz_type,
            'time_limit_minutes': quiz.time_limit_minutes,
            'max_attempts': quiz.max_attempts,
            'passing_score': quiz.passing_score,
            'show_correct_answers': quiz.show_correct_answers,
            'randomize_questions': quiz.randomize_questions,
            'questions': [
                {
                    'question_text': question.question_text,
                    'question_type': question.question_type,
                    'points': question.points,
                    'order': question.order,
                    'explanation': question.explanation,
                    'options': [
                        {
                            'option_text': option.option_text,
                            'is_correct': option.is_correct,
                            'order': option.order
                        }
                        for option in question.options.all().order_by('order')
                    ]
                }
                for question in questions
            ]
        }

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def questions(self, request, pk=None):
        quiz = self.get_object()
        # Verificar que el estudiante esté inscrito en el curso si no es instructor
        if not request.user.is_instructor and not request.user.is_superuser:
            if not quiz.course.students.filter(id=request.user.id).exists():
                return Response(
                    {'error': 'No tienes acceso a las preguntas de este quiz'},
                    status=status.HTTP_403_FORBIDDEN
                )
        questions = quiz.questions.all().order_by('order')
        serializer = QuestionSerializer(questions, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['patch'], permission_classes=[IsAuthenticated, IsInstructorOrAdmin])
    def update_question_order(self, request, pk=None):
        quiz = self.get_object()

        if quiz.created_by != request.user and not request.user.is_superuser:
            return Response(
                {'error': 'No tienes permisos para reordenar preguntas de este quiz'},
                status=status.HTTP_403_FORBIDDEN
            )

        question_orders = request.data.get('question_orders', [])
        if not isinstance(question_orders, list):
            return Response(
                {'error': 'question_orders debe ser una lista'},
                status=status.HTTP_400_BAD_REQUEST
            )

        question_ids = [item.get('id') for item in question_orders]
        questions = Question.objects.filter(quiz=quiz, id__in=question_ids)

        orders_map = {item.get('id'): item.get('order') for item in question_orders}
        for question in questions:
            order_value = orders_map.get(question.id)
            if order_value is not None:
                question.order = order_value
                question.save(update_fields=['order'])

        serializer = QuestionSerializer(quiz.questions.all().order_by('order'), many=True)
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
        
        # Si es instructor o admin, puede ver todos los resultados del quiz
        if user.is_instructor or user.is_superuser:
            if quiz.created_by != user and not user.is_superuser:
                return Response(
                    {'error': 'No tienes permisos para ver los resultados de este quiz'},
                    status=status.HTTP_403_FORBIDDEN
                )
            attempts = QuizAttempt.objects.filter(quiz=quiz).order_by('-attempt_number')
        else:
            # Estudiantes solo pueden ver sus propios resultados
            attempts = QuizAttempt.objects.filter(user=user, quiz=quiz).order_by('-attempt_number')
        
        serializer = QuizAttemptSerializer(attempts, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsInstructorOrAdmin])
    def save_as_template(self, request, pk=None):
        quiz = self.get_object()

        if quiz.created_by != request.user and not request.user.is_superuser:
            return Response(
                {'error': 'No tienes permisos para guardar este quiz como plantilla'},
                status=status.HTTP_403_FORBIDDEN
            )

        payload = self._build_quiz_payload(quiz)
        template = QuizTemplate.objects.create(
            title=request.data.get('title') or quiz.title,
            description=request.data.get('description') or quiz.description,
            category=request.data.get('category', ''),
            difficulty=request.data.get('difficulty', 'beginner'),
            estimated_time=request.data.get('estimated_time', 0),
            tags=request.data.get('tags', []),
            data=payload,
            created_by=request.user
        )
        serializer = QuizTemplateSerializer(template)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated, IsInstructorOrAdmin], url_path='import')
    def import_quiz(self, request):
        data = request.data
        validation = self._validate_import_payload(data)
        if not validation['valid']:
            return Response({'errors': validation['errors']}, status=status.HTTP_400_BAD_REQUEST)

        quiz = Quiz.objects.create(
            title=data['title'],
            description=data.get('description', ''),
            course_id=data['course'],
            lesson_id=data.get('lesson'),
            quiz_type=data.get('quiz_type', 'practice'),
            time_limit_minutes=data.get('time_limit_minutes', 0),
            max_attempts=data.get('max_attempts', 1),
            passing_score=data.get('passing_score', 70),
            is_published=data.get('is_published', False),
            show_correct_answers=data.get('show_correct_answers', True),
            randomize_questions=data.get('randomize_questions', False),
            created_by=request.user
        )

        self._create_questions(quiz, data.get('questions', []))
        serializer = QuizSerializer(quiz)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated, IsInstructorOrAdmin], url_path='validate_import')
    def validate_import(self, request):
        validation = self._validate_import_payload(request.data)
        if not validation['valid']:
            return Response({'errors': validation['errors']}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'valid': True})

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated, IsInstructorOrAdmin])
    def export(self, request, pk=None):
        quiz = self.get_object()

        if quiz.created_by != request.user and not request.user.is_superuser:
            return Response(
                {'error': 'No tienes permisos para exportar este quiz'},
                status=status.HTTP_403_FORBIDDEN
            )

        export_format = request.query_params.get('format', 'json')
        payload = self._build_quiz_payload(quiz)
        payload.update({
            'course': quiz.course_id,
            'lesson': quiz.lesson_id
        })

        if export_format == 'csv':
            csv_content = self._quiz_to_csv(payload)
            response = HttpResponse(csv_content, content_type='text/csv')
            response['Content-Disposition'] = f'attachment; filename="quiz_{quiz.id}.csv"'
            return response

        return Response(payload)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated, IsInstructorOrAdmin], url_path='bulk_export')
    def bulk_export(self, request):
        quiz_ids = request.data.get('quiz_ids', [])
        export_format = request.data.get('format', 'json')
        quizzes = Quiz.objects.filter(id__in=quiz_ids, created_by=request.user)

        payload = {
            'quizzes': [
                {
                    **self._build_quiz_payload(quiz),
                    'course': quiz.course_id,
                    'lesson': quiz.lesson_id,
                    'id': quiz.id
                }
                for quiz in quizzes
            ]
        }

        if export_format == 'csv':
            csv_content = self._bulk_quizzes_to_csv(payload['quizzes'])
            response = HttpResponse(csv_content, content_type='text/csv')
            response['Content-Disposition'] = 'attachment; filename="quizzes_export.csv"'
            return response

        return Response(payload)

    def _validate_import_payload(self, data):
        errors = []
        if not data or not isinstance(data, dict):
            errors.append('El payload debe ser un objeto válido')
            return {'valid': False, 'errors': errors}

        if not data.get('title'):
            errors.append('El quiz debe tener un título válido')
        if not data.get('course'):
            errors.append('El quiz debe tener un curso válido')
        questions = data.get('questions')
        if not isinstance(questions, list) or len(questions) == 0:
            errors.append('El quiz debe tener al menos una pregunta')
        else:
            for index, question in enumerate(questions):
                if not question.get('question_text'):
                    errors.append(f'Pregunta {index + 1}: falta el texto')
                if question.get('question_type') in ['multiple_choice', 'true_false']:
                    options = question.get('options', [])
                    if len(options) < 2:
                        errors.append(f'Pregunta {index + 1}: debe tener al menos 2 opciones')
        return {'valid': len(errors) == 0, 'errors': errors}

    def _create_questions(self, quiz, questions_data):
        for question_data in questions_data:
            options_data = question_data.pop('options', [])
            question = Question.objects.create(quiz=quiz, **question_data)
            for option_data in options_data:
                Option.objects.create(question=question, **option_data)

    def _quiz_to_csv(self, payload):
        lines = ['question_text,question_type,points,order,option_text,is_correct,option_order']
        for question in payload.get('questions', []):
            options = question.get('options', []) or [{}]
            for option in options:
                lines.append(
                    f"\"{question.get('question_text','')}\","
                    f"{question.get('question_type','')},"
                    f"{question.get('points',0)},"
                    f"{question.get('order',0)},"
                    f"\"{option.get('option_text','')}\","
                    f"{option.get('is_correct', False)},"
                    f"{option.get('order',0)}"
                )
        return '\n'.join(lines)

    def _bulk_quizzes_to_csv(self, quizzes):
        lines = ['quiz_id,quiz_title,question_text,question_type,points,order,option_text,is_correct,option_order']
        for quiz in quizzes:
            for question in quiz.get('questions', []):
                options = question.get('options', []) or [{}]
                for option in options:
                    lines.append(
                        f"{quiz.get('id','')},"
                        f"\"{quiz.get('title','')}\","
                        f"\"{question.get('question_text','')}\","
                        f"{question.get('question_type','')},"
                        f"{question.get('points',0)},"
                        f"{question.get('order',0)},"
                        f"\"{option.get('option_text','')}\","
                        f"{option.get('is_correct', False)},"
                        f"{option.get('order',0)}"
                    )
        return '\n'.join(lines)

class QuestionViewSet(viewsets.ModelViewSet):
    serializer_class = QuestionSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        """
        Permisos dinámicos basados en la acción:
        - Lectura (list, retrieve): cualquier usuario autenticado (pero get_queryset filtra por instructor)
        - Escritura (create, update, delete): solo instructores y administradores
        """
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsInstructorOrAdmin()]
        return [IsAuthenticated()]

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
        if user.is_instructor or user.is_superuser:
            # Instructors and admins can see all attempts for quizzes they created
            return QuizAttempt.objects.filter(quiz__created_by=user).select_related('user', 'quiz')
        else:
            # Students can only see their own attempts
            return QuizAttempt.objects.filter(user=user).select_related('quiz')

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def answers(self, request, pk=None):
        attempt = self.get_object()
        
        # Verify access
        if not (request.user.is_instructor or request.user.is_superuser) and attempt.user != request.user:
            return Response(
                {'error': 'No tienes acceso a estas respuestas'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Additional check for instructors: only their own quizzes
        if (request.user.is_instructor or request.user.is_superuser) and attempt.quiz.created_by != request.user and not request.user.is_superuser:
            return Response(
                {'error': 'No tienes permisos para ver las respuestas de este quiz'},
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


class QuizTemplateViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = QuizTemplateSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return QuizTemplate.objects.all()

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsInstructorOrAdmin], url_path='create')
    def create_quiz(self, request, pk=None):
        template = self.get_object()
        data = template.data.copy()

        course_id = request.data.get('course') or data.get('course')
        if not course_id:
            return Response({'error': 'Debe seleccionar un curso'}, status=status.HTTP_400_BAD_REQUEST)

        quiz = Quiz.objects.create(
            title=request.data.get('title') or data.get('title', template.title),
            description=request.data.get('description') or data.get('description', template.description),
            course_id=course_id,
            lesson_id=request.data.get('lesson'),
            quiz_type=data.get('quiz_type', 'practice'),
            time_limit_minutes=data.get('time_limit_minutes', 0),
            max_attempts=data.get('max_attempts', 1),
            passing_score=data.get('passing_score', 70),
            is_published=request.data.get('is_published', False),
            show_correct_answers=data.get('show_correct_answers', True),
            randomize_questions=data.get('randomize_questions', False),
            created_by=request.user
        )

        questions = data.get('questions', [])
        for question_data in questions:
            options_data = question_data.pop('options', [])
            question = Question.objects.create(quiz=quiz, **question_data)
            for option_data in options_data:
                Option.objects.create(question=question, **option_data)

        serializer = QuizSerializer(quiz)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
