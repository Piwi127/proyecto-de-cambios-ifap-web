from django.db import models
from django.conf import settings
from courses.models import Course
from lessons.models import Lesson
from django.core.validators import MinValueValidator, MaxValueValidator

class Quiz(models.Model):
    QUIZ_TYPES = [
        ('practice', 'Práctica'),
        ('exam', 'Examen'),
        ('survey', 'Encuesta'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='quizzes')
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, null=True, blank=True, related_name='quizzes')
    quiz_type = models.CharField(max_length=20, choices=QUIZ_TYPES, default='practice')
    time_limit_minutes = models.PositiveIntegerField(default=0, help_text="0 = sin límite de tiempo")
    max_attempts = models.PositiveIntegerField(default=1, help_text="0 = intentos ilimitados")
    passing_score = models.PositiveIntegerField(
        default=70,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Porcentaje mínimo para aprobar"
    )
    is_published = models.BooleanField(default=False)
    show_correct_answers = models.BooleanField(default=True)
    randomize_questions = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    class Meta:
        ordering = ['course', 'lesson', 'created_at']
        verbose_name = 'Quiz'
        verbose_name_plural = 'Quizzes'

    def __str__(self):
        return f"{self.course.title} - {self.title}"

class Question(models.Model):
    QUESTION_TYPES = [
        ('multiple_choice', 'Selección múltiple'),
        ('true_false', 'Verdadero/Falso'),
        ('short_answer', 'Respuesta corta'),
        ('essay', 'Ensayo'),
    ]
    
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='questions')
    question_text = models.TextField()
    question_type = models.CharField(max_length=20, choices=QUESTION_TYPES, default='multiple_choice')
    points = models.PositiveIntegerField(default=1)
    order = models.PositiveIntegerField(default=0)
    explanation = models.TextField(blank=True, help_text="Explicación de la respuesta correcta")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['quiz', 'order']
        
    def __str__(self):
        return f"{self.quiz.title} - Pregunta {self.order}"

class Option(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='options')
    option_text = models.CharField(max_length=500)
    is_correct = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['question', 'order']
        
    def __str__(self):
        return f"{self.question} - Opción {self.order}"

class QuizAttempt(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='quiz_attempts')
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='attempts')
    score = models.FloatField(default=0)
    max_score = models.PositiveIntegerField(default=0)
    percentage = models.FloatField(default=0)
    is_passed = models.BooleanField(default=False)
    time_taken_seconds = models.PositiveIntegerField(default=0)
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    attempt_number = models.PositiveIntegerField(default=1)

    class Meta:
        ordering = ['-started_at']
        unique_together = ['user', 'quiz', 'attempt_number']
        
    def __str__(self):
        return f"{self.user.username} - {self.quiz.title} - Intento {self.attempt_number}"

class UserAnswer(models.Model):
    attempt = models.ForeignKey(QuizAttempt, on_delete=models.CASCADE, related_name='user_answers')
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    selected_options = models.ManyToManyField(Option, blank=True)
    text_answer = models.TextField(blank=True)
    is_correct = models.BooleanField(default=False)
    points_earned = models.FloatField(default=0)
    answered_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['answered_at']
        
    def __str__(self):
        return f"{self.attempt} - {self.question}"