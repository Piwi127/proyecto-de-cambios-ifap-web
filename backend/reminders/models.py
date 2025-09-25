from django.db import models
from django.conf import settings
from django.utils import timezone


class Reminder(models.Model):
    """Modelo para recordatorios de calendario"""
    
    PRIORITY_CHOICES = [
        ('low', 'Baja'),
        ('medium', 'Media'),
        ('high', 'Alta'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reminders')
    title = models.CharField(max_length=200, verbose_name='Título')
    description = models.TextField(blank=True, verbose_name='Descripción')
    reminder_date = models.DateTimeField(verbose_name='Fecha del recordatorio')
    priority = models.CharField(
        max_length=10, 
        choices=PRIORITY_CHOICES, 
        default='medium',
        verbose_name='Prioridad'
    )
    is_completed = models.BooleanField(default=False, verbose_name='Completado')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-reminder_date']
        verbose_name = 'Recordatorio'
        verbose_name_plural = 'Recordatorios'
    
    def __str__(self):
        return f"{self.title} - {self.reminder_date.strftime('%Y-%m-%d %H:%M')}"