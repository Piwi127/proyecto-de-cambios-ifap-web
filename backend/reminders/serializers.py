from rest_framework import serializers
from .models import Reminder


class ReminderSerializer(serializers.ModelSerializer):
    """Serializer para el modelo Reminder"""
    
    user = serializers.StringRelatedField(read_only=True)
    
    class Meta:
        model = Reminder
        fields = [
            'id', 'user', 'title', 'description', 'reminder_date',
            'priority', 'is_completed', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']
    
    def validate_reminder_date(self, value):
        """Validar que la fecha del recordatorio no sea en el pasado"""
        from django.utils import timezone
        
        if value < timezone.now():
            raise serializers.ValidationError(
                "La fecha del recordatorio no puede ser en el pasado."
            )
        return value