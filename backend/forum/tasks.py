from celery import shared_task
from django.utils import timezone
from datetime import timedelta
from .models import TypingIndicator


@shared_task
def cleanup_old_typing_indicators():
    """
    Limpia los indicadores de escritura antiguos (más de 30 segundos)
    """
    cutoff_time = timezone.now() - timedelta(seconds=30)
    old_indicators = TypingIndicator.objects.filter(timestamp__lt=cutoff_time)
    count = old_indicators.count()
    old_indicators.delete()
    return f"Eliminados {count} indicadores de escritura antiguos"


@shared_task
def update_conversation_last_message():
    """
    Actualiza el campo last_message de las conversaciones
    """
    from .models import Conversation, Message

    conversations = Conversation.objects.all()
    updated_count = 0

    for conversation in conversations:
        last_message = conversation.messages.order_by('-created_at').first()
        if last_message:
            conversation.last_message = last_message
            conversation.save()
            updated_count += 1

    return f"Actualizadas {updated_count} conversaciones con último mensaje"


@shared_task
def mark_messages_as_read_for_inactive_users():
    """
    Marca mensajes como leídos para usuarios que han estado inactivos
    """
    from django.contrib.sessions.models import Session
    from .models import Message, MessageRead

    # Obtener sesiones activas recientes
    recent_sessions = Session.objects.filter(
        expire_date__gt=timezone.now()
    ).values_list('session_key', flat=True)

    # Para simplificar, marcamos todos los mensajes no leídos como leídos
    # En una implementación real, verificaríamos la actividad del usuario
    unread_messages = Message.objects.filter(
        read_by__isnull=True
    ).exclude(sender__isnull=True)

    marked_count = 0
    for message in unread_messages:
        # Solo marcar como leído si han pasado más de 5 minutos
        if timezone.now() - message.created_at > timedelta(minutes=5):
            MessageRead.objects.get_or_create(
                user=message.sender,
                message=message
            )
            marked_count += 1

    return f"Marcados {marked_count} mensajes como leídos"