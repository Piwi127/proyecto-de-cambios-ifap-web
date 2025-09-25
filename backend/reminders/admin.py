from django.contrib import admin
from .models import Reminder


@admin.register(Reminder)
class ReminderAdmin(admin.ModelAdmin):
    """Configuración del admin para Reminder"""
    
    list_display = ['title', 'user', 'reminder_date', 'priority', 'is_completed', 'created_at']
    list_filter = ['priority', 'is_completed', 'created_at', 'reminder_date']
    search_fields = ['title', 'description', 'user__username']
    list_editable = ['is_completed', 'priority']
    date_hierarchy = 'reminder_date'
    
    fieldsets = (
        ('Información básica', {
            'fields': ('user', 'title', 'description')
        }),
        ('Configuración del recordatorio', {
            'fields': ('reminder_date', 'priority', 'is_completed')
        }),
        ('Metadatos', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at']
    
    def get_queryset(self, request):
        """Personalizar queryset para optimizar consultas"""
        return super().get_queryset(request).select_related('user')