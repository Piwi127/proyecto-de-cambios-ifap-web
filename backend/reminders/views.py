from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from .models import Reminder
from .serializers import ReminderSerializer


class ReminderViewSet(viewsets.ModelViewSet):
    """ViewSet para gestionar recordatorios"""
    
    serializer_class = ReminderSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filtrar recordatorios por usuario autenticado"""
        return Reminder.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        """Asignar el usuario autenticado al crear un recordatorio"""
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Obtener recordatorios próximos (siguientes 7 días)"""
        now = timezone.now()
        upcoming_date = now + timezone.timedelta(days=7)
        
        reminders = self.get_queryset().filter(
            reminder_date__gte=now,
            reminder_date__lte=upcoming_date,
            is_completed=False
        )
        
        serializer = self.get_serializer(reminders, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def overdue(self, request):
        """Obtener recordatorios vencidos"""
        now = timezone.now()
        
        reminders = self.get_queryset().filter(
            reminder_date__lt=now,
            is_completed=False
        )
        
        serializer = self.get_serializer(reminders, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def mark_completed(self, request, pk=None):
        """Marcar un recordatorio como completado"""
        reminder = self.get_object()
        reminder.is_completed = True
        reminder.save()
        
        serializer = self.get_serializer(reminder)
        return Response(serializer.data)