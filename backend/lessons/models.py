from django.db import models
from django.conf import settings

class Lesson(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    course = models.ForeignKey('courses.Course', on_delete=models.CASCADE, related_name='lessons')
    instructor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    content = models.TextField(blank=True)  # Contenido de la lección
    video_url = models.URLField(blank=True)  # URL del video si existe
    order = models.PositiveIntegerField(default=0)  # Orden de la lección en el curso
    duration_minutes = models.PositiveIntegerField(default=0)
    is_published = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['course', 'order']

    def __str__(self):
        return f"{self.course.title} - {self.title}"

class LessonCompletion(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='lesson_completions')
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='completions')
    completed_at = models.DateTimeField(auto_now_add=True)
    is_completed = models.BooleanField(default=True)

    class Meta:
        unique_together = ['user', 'lesson']
        ordering = ['-completed_at']

    def __str__(self):
        return f"{self.user.username} completed {self.lesson.title}"
