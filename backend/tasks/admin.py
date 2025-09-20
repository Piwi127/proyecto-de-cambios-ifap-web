from django.contrib import admin
from django.utils.html import format_html
from .models import TaskCategory, Task, TaskAssignment, TaskSubmission, TaskFile, TaskComment

@admin.register(TaskCategory)
class TaskCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'color_display', 'icon', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'description']
    readonly_fields = ['created_at', 'updated_at']

    def color_display(self, obj):
        return format_html(
            '<span style="background-color: {}; padding: 2px 8px; border-radius: 3px; color: white;">{}</span>',
            obj.color,
            obj.color
        )
    color_display.short_description = 'Color'

class TaskAssignmentInline(admin.TabularInline):
    model = TaskAssignment
    extra = 0
    readonly_fields = ['assigned_date', 'created_at']
    fields = ['student', 'status', 'due_date_override', 'started_at', 'last_activity']

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ['title', 'course', 'category', 'priority', 'status', 'due_date', 'instructor', 'created_at']
    list_filter = ['status', 'priority', 'category', 'course', 'created_at', 'due_date']
    search_fields = ['title', 'description', 'course__title', 'instructor__username']
    readonly_fields = ['created_at', 'updated_at', 'submissions_count', 'pending_submissions_count']
    filter_horizontal = []
    inlines = [TaskAssignmentInline]
    
    fieldsets = (
        ('Información Básica', {
            'fields': ('title', 'description', 'instructions', 'category')
        }),
        ('Relaciones', {
            'fields': ('course', 'lesson', 'instructor')
        }),
        ('Configuración', {
            'fields': ('priority', 'status', 'max_score', 'max_attempts', 'show_score_to_student')
        }),
        ('Fechas', {
            'fields': ('start_date', 'due_date')
        }),
        ('Entregas Tardías', {
            'fields': ('allow_late_submission', 'late_penalty_percent'),
            'classes': ('collapse',)
        }),
        ('Archivos', {
            'fields': ('attachment_required', 'allowed_file_types', 'max_file_size_mb'),
            'classes': ('collapse',)
        }),
        ('Estadísticas', {
            'fields': ('submissions_count', 'pending_submissions_count'),
            'classes': ('collapse',)
        }),
        ('Metadatos', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('course', 'category', 'instructor')

class TaskSubmissionInline(admin.TabularInline):
    model = TaskSubmission
    extra = 0
    readonly_fields = ['submitted_at', 'is_late', 'graded_at']
    fields = ['attempt_number', 'score', 'feedback', 'graded_by', 'is_final', 'submitted_at', 'is_late']

@admin.register(TaskAssignment)
class TaskAssignmentAdmin(admin.ModelAdmin):
    list_display = ['task', 'student', 'status', 'assigned_date', 'effective_due_date', 'is_overdue']
    list_filter = ['status', 'assigned_date', 'task__course', 'task__category']
    search_fields = ['task__title', 'student__username', 'student__first_name', 'student__last_name']
    readonly_fields = ['assigned_date', 'created_at', 'updated_at', 'effective_due_date', 'is_overdue']
    inlines = [TaskSubmissionInline]
    
    fieldsets = (
        ('Asignación', {
            'fields': ('task', 'student', 'status')
        }),
        ('Fechas', {
            'fields': ('assigned_date', 'due_date_override', 'effective_due_date')
        }),
        ('Seguimiento', {
            'fields': ('started_at', 'last_activity', 'is_overdue'),
            'classes': ('collapse',)
        }),
        ('Metadatos', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('task', 'student', 'task__course')

class TaskFileInline(admin.TabularInline):
    model = TaskFile
    extra = 0
    readonly_fields = ['uploaded_at', 'file_size']
    fields = ['file', 'original_name', 'file_type', 'file_size', 'uploaded_at']

class TaskCommentInline(admin.TabularInline):
    model = TaskComment
    extra = 0
    readonly_fields = ['created_at', 'updated_at']
    fields = ['author', 'content', 'is_private', 'created_at']

@admin.register(TaskSubmission)
class TaskSubmissionAdmin(admin.ModelAdmin):
    list_display = ['assignment', 'attempt_number', 'score', 'submitted_at', 'is_late', 'graded_by', 'is_final']
    list_filter = ['is_late', 'is_final', 'submitted_at', 'graded_at', 'assignment__task__course']
    search_fields = ['assignment__task__title', 'assignment__student__username', 'content']
    readonly_fields = ['submitted_at', 'is_late', 'graded_at', 'created_at', 'updated_at']
    inlines = [TaskFileInline, TaskCommentInline]
    
    fieldsets = (
        ('Entrega', {
            'fields': ('assignment', 'attempt_number', 'content', 'is_final')
        }),
        ('Calificación', {
            'fields': ('score', 'feedback', 'graded_by', 'graded_at')
        }),
        ('Metadatos', {
            'fields': ('submitted_at', 'is_late', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'assignment', 'assignment__task', 'assignment__student', 'graded_by'
        )

@admin.register(TaskFile)
class TaskFileAdmin(admin.ModelAdmin):
    list_display = ['original_name', 'submission', 'file_type', 'file_size_display', 'uploaded_at']
    list_filter = ['file_type', 'uploaded_at']
    search_fields = ['original_name', 'submission__assignment__task__title']
    readonly_fields = ['uploaded_at', 'file_size']

    def file_size_display(self, obj):
        size = obj.file_size
        if size < 1024:
            return f"{size} B"
        elif size < 1024 * 1024:
            return f"{size / 1024:.1f} KB"
        else:
            return f"{size / (1024 * 1024):.1f} MB"
    file_size_display.short_description = 'Tamaño'

@admin.register(TaskComment)
class TaskCommentAdmin(admin.ModelAdmin):
    list_display = ['submission', 'author', 'content_preview', 'is_private', 'created_at']
    list_filter = ['is_private', 'created_at', 'author']
    search_fields = ['content', 'submission__assignment__task__title', 'author__username']
    readonly_fields = ['created_at', 'updated_at']

    def content_preview(self, obj):
        return obj.content[:50] + "..." if len(obj.content) > 50 else obj.content
    content_preview.short_description = 'Contenido'
