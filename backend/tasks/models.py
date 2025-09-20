from django.db import models
from django.contrib.auth import get_user_model
from courses.models import Course
from lessons.models import Lesson

User = get_user_model()

class TaskCategory(models.Model):
    """Categorías de tareas (Tarea, Quiz, Proyecto, etc.)"""
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    color = models.CharField(max_length=7, default='#3B82F6')  # Color hex
    icon = models.CharField(max_length=50, default='clipboard')  # Icono de Lucide
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Categoría de Tarea'
        verbose_name_plural = 'Categorías de Tareas'
        ordering = ['name']

    def __str__(self):
        return self.name

class Task(models.Model):
    """Tareas/Asignaciones del curso"""
    PRIORITY_CHOICES = [
        ('low', 'Baja'),
        ('medium', 'Media'),
        ('high', 'Alta'),
        ('urgent', 'Urgente'),
    ]

    STATUS_CHOICES = [
        ('draft', 'Borrador'),
        ('published', 'Publicada'),
        ('closed', 'Cerrada'),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField()
    instructions = models.TextField(blank=True, help_text="Instrucciones detalladas para completar la tarea")
    
    # Relaciones
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='tasks')
    lesson = models.ForeignKey(Lesson, on_delete=models.SET_NULL, null=True, blank=True, related_name='tasks')
    category = models.ForeignKey(TaskCategory, on_delete=models.SET_NULL, null=True, blank=True)
    instructor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_tasks')
    assigned_students = models.ManyToManyField(User, through='TaskAssignment', related_name='assigned_tasks')
    
    # Configuración
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='draft')
    max_score = models.DecimalField(max_digits=5, decimal_places=2, default=100.00)
    
    # Fechas
    due_date = models.DateTimeField(help_text="Fecha límite de entrega")
    start_date = models.DateTimeField(null=True, blank=True, help_text="Fecha de inicio (opcional)")
    
    # Configuraciones adicionales
    allow_late_submission = models.BooleanField(default=False)
    late_penalty_percent = models.DecimalField(max_digits=5, decimal_places=2, default=0.00, 
                                             help_text="Porcentaje de penalización por entrega tardía")
    max_attempts = models.PositiveIntegerField(default=1, help_text="Número máximo de intentos")
    show_score_to_student = models.BooleanField(default=True)
    
    # Archivos adjuntos
    attachment_required = models.BooleanField(default=False)
    allowed_file_types = models.CharField(max_length=200, blank=True, 
                                        help_text="Tipos de archivo permitidos (ej: pdf,doc,docx)")
    max_file_size_mb = models.PositiveIntegerField(default=10)
    
    # Metadatos
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Tarea'
        verbose_name_plural = 'Tareas'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.course.title}"

    @property
    def is_overdue(self):
        from django.utils import timezone
        return timezone.now() > self.due_date and self.status == 'published'

    @property
    def submissions_count(self):
        return self.submissions.count()

    @property
    def pending_submissions_count(self):
        return self.assignments.filter(status='assigned').count()

class TaskAssignment(models.Model):
    """Asignación de tarea a estudiante específico"""
    STATUS_CHOICES = [
        ('assigned', 'Asignada'),
        ('in_progress', 'En Progreso'),
        ('submitted', 'Entregada'),
        ('graded', 'Calificada'),
        ('returned', 'Devuelta para Revisión'),
    ]

    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='assignments')
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='task_assignments')
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='assigned')
    
    # Fechas personalizadas (pueden diferir de la tarea principal)
    assigned_date = models.DateTimeField(auto_now_add=True)
    due_date_override = models.DateTimeField(null=True, blank=True, 
                                           help_text="Fecha límite personalizada para este estudiante")
    
    # Seguimiento
    started_at = models.DateTimeField(null=True, blank=True)
    last_activity = models.DateTimeField(null=True, blank=True)
    
    # Metadatos
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Asignación de Tarea'
        verbose_name_plural = 'Asignaciones de Tareas'
        unique_together = ['task', 'student']
        ordering = ['-assigned_date']

    def __str__(self):
        return f"{self.task.title} - {self.student.get_full_name()}"

    @property
    def effective_due_date(self):
        return self.due_date_override or self.task.due_date

    @property
    def is_overdue(self):
        from django.utils import timezone
        return timezone.now() > self.effective_due_date and self.status in ['assigned', 'in_progress']

class TaskSubmission(models.Model):
    """Entrega de tarea por parte del estudiante"""
    assignment = models.ForeignKey(TaskAssignment, on_delete=models.CASCADE, related_name='submissions')
    attempt_number = models.PositiveIntegerField(default=1)
    
    # Contenido de la entrega
    content = models.TextField(blank=True, help_text="Texto de la entrega")
    
    # Archivos adjuntos
    def submission_file_path(instance, filename):
        return f'task_submissions/{instance.assignment.task.id}/{instance.assignment.student.id}/{filename}'
    
    # Metadatos de entrega
    submitted_at = models.DateTimeField(auto_now_add=True)
    is_late = models.BooleanField(default=False)
    
    # Calificación
    score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    feedback = models.TextField(blank=True)
    graded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, 
                                related_name='graded_submissions')
    graded_at = models.DateTimeField(null=True, blank=True)
    
    # Estado
    is_final = models.BooleanField(default=True, help_text="Si es la entrega final o un borrador")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Entrega de Tarea'
        verbose_name_plural = 'Entregas de Tareas'
        ordering = ['-submitted_at']
        unique_together = ['assignment', 'attempt_number']

    def __str__(self):
        return f"Entrega {self.attempt_number} - {self.assignment}"

    def save(self, *args, **kwargs):
        # Verificar si la entrega es tardía
        if not self.pk:  # Solo en creación
            from django.utils import timezone
            self.is_late = timezone.now() > self.assignment.effective_due_date
        super().save(*args, **kwargs)

class TaskFile(models.Model):
    """Archivos adjuntos a las entregas de tareas"""
    submission = models.ForeignKey(TaskSubmission, on_delete=models.CASCADE, related_name='files')
    
    def file_upload_path(instance, filename):
        return f'task_files/{instance.submission.assignment.task.id}/{instance.submission.assignment.student.id}/{filename}'
    
    file = models.FileField(upload_to=file_upload_path)
    original_name = models.CharField(max_length=255)
    file_size = models.PositiveIntegerField()  # En bytes
    file_type = models.CharField(max_length=50)
    
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Archivo de Tarea'
        verbose_name_plural = 'Archivos de Tareas'

    def __str__(self):
        return f"{self.original_name} - {self.submission}"

class TaskComment(models.Model):
    """Comentarios en las tareas (instructor-estudiante)"""
    submission = models.ForeignKey(TaskSubmission, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    
    # Metadatos
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_private = models.BooleanField(default=False, help_text="Solo visible para instructores")

    class Meta:
        verbose_name = 'Comentario de Tarea'
        verbose_name_plural = 'Comentarios de Tareas'
        ordering = ['created_at']

    def __str__(self):
        return f"Comentario de {self.author.get_full_name()} en {self.submission}"
