from django.contrib import admin
from .models import Quiz, Question, Option, QuizAttempt, UserAnswer

@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = ['title', 'course', 'created_by', 'quiz_type', 'is_published', 'passing_score', 'created_at']
    list_filter = ['quiz_type', 'is_published', 'created_at', 'course']
    search_fields = ['title', 'description', 'course__title']
    ordering = ['-created_at']
    readonly_fields = ['created_at', 'updated_at']

    fieldsets = (
        ('Información Básica', {
            'fields': ('title', 'description', 'course', 'lesson', 'created_by')
        }),
        ('Configuración del Quiz', {
            'fields': ('quiz_type', 'time_limit_minutes', 'max_attempts', 'passing_score',
                      'is_published', 'show_correct_answers', 'randomize_questions')
        }),
        ('Fechas', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ['question_text', 'quiz', 'question_type', 'points', 'order']
    list_filter = ['question_type', 'quiz__course']
    search_fields = ['question_text', 'quiz__title']
    ordering = ['quiz', 'order']
    readonly_fields = ['created_at']

    fieldsets = (
        ('Información de la Pregunta', {
            'fields': ('quiz', 'question_text', 'question_type', 'points', 'order', 'explanation')
        }),
        ('Fecha', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )

@admin.register(Option)
class OptionAdmin(admin.ModelAdmin):
    list_display = ['question', 'option_text', 'is_correct', 'order']
    list_filter = ['is_correct', 'question__quiz__course']
    search_fields = ['option_text', 'question__question_text']
    ordering = ['question', 'order']

@admin.register(QuizAttempt)
class QuizAttemptAdmin(admin.ModelAdmin):
    list_display = ['user', 'quiz', 'score', 'percentage', 'is_passed', 'attempt_number', 'completed_at']
    list_filter = ['is_passed', 'quiz__course', 'completed_at']
    search_fields = ['user__username', 'quiz__title']
    ordering = ['-completed_at']
    readonly_fields = ['started_at', 'completed_at', 'time_taken_seconds']

    fieldsets = (
        ('Información del Intento', {
            'fields': ('user', 'quiz', 'attempt_number', 'score', 'max_score', 'percentage', 'is_passed')
        }),
        ('Tiempos', {
            'fields': ('started_at', 'completed_at', 'time_taken_seconds'),
            'classes': ('collapse',)
        }),
    )

@admin.register(UserAnswer)
class UserAnswerAdmin(admin.ModelAdmin):
    list_display = ['attempt', 'question', 'is_correct', 'points_earned', 'answered_at']
    list_filter = ['is_correct', 'question__quiz__course', 'answered_at']
    search_fields = ['attempt__user__username', 'question__question_text']
    ordering = ['-answered_at']
    readonly_fields = ['answered_at']

    fieldsets = (
        ('Información de la Respuesta', {
            'fields': ('attempt', 'question', 'selected_options', 'text_answer', 'is_correct', 'points_earned')
        }),
        ('Fecha', {
            'fields': ('answered_at',),
            'classes': ('collapse',)
        }),
    )