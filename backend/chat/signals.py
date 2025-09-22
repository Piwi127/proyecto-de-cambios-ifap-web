from django.db.models.signals import post_save, m2m_changed
from django.dispatch import receiver
from django.utils import timezone
from .models import Message, ChatRoom, ChatNotification, UserChatStatus


@receiver(post_save, sender=Message)
def create_message_notification(sender, instance, created, **kwargs):
    """
    Crea notificaciones cuando se envía un nuevo mensaje
    """
    if created and instance.message_type == 'text':
        # Obtener todos los participantes de la sala excepto el remitente
        participants = instance.chat_room.participants.exclude(id=instance.sender.id)
        
        for participant in participants:
            ChatNotification.objects.create(
                user=participant,
                chat_room=instance.chat_room,
                message=instance,
                notification_type='new_message',
                title=f'Nuevo mensaje de {instance.sender.get_full_name() or instance.sender.username}',
                content=instance.content[:100] + ('...' if len(instance.content) > 100 else '')
            )


@receiver(post_save, sender=Message)
def update_chat_room_timestamp(sender, instance, created, **kwargs):
    """
    Actualiza el timestamp de la sala de chat cuando se envía un mensaje
    """
    if created:
        instance.chat_room.updated_at = timezone.now()
        instance.chat_room.save(update_fields=['updated_at'])


@receiver(m2m_changed, sender=ChatRoom.participants.through)
def handle_participant_changes(sender, instance, action, pk_set, **kwargs):
    """
    Maneja los cambios en los participantes de una sala de chat
    """
    if action == 'post_add':
        # Cuando se agregan nuevos participantes
        for user_id in pk_set:
            # Crear o actualizar el estado del usuario en la sala
            UserChatStatus.objects.get_or_create(
                user_id=user_id,
                chat_room=instance,
                defaults={
                    'status': 'online',
                    'last_seen': timezone.now()
                }
            )
            
            # Crear notificación para otros participantes
            other_participants = instance.participants.exclude(id=user_id)
            from django.contrib.auth import get_user_model
            User = get_user_model()
            new_user = User.objects.get(id=user_id)
            
            for participant in other_participants:
                ChatNotification.objects.create(
                    user=participant,
                    chat_room=instance,
                    notification_type='user_joined',
                    title='Nuevo participante',
                    content=f'{new_user.get_full_name() or new_user.username} se unió al chat'
                )
    
    elif action == 'post_remove':
        # Cuando se remueven participantes
        for user_id in pk_set:
            # Actualizar estado a offline
            try:
                status = UserChatStatus.objects.get(user_id=user_id, chat_room=instance)
                status.status = 'offline'
                status.save(update_fields=['status'])
            except UserChatStatus.DoesNotExist:
                pass
            
            # Crear notificación para otros participantes
            other_participants = instance.participants.all()
            from django.contrib.auth import get_user_model
            User = get_user_model()
            try:
                removed_user = User.objects.get(id=user_id)
                for participant in other_participants:
                    ChatNotification.objects.create(
                        user=participant,
                        chat_room=instance,
                        notification_type='user_left',
                        title='Participante se fue',
                        content=f'{removed_user.get_full_name() or removed_user.username} dejó el chat'
                    )
            except User.DoesNotExist:
                pass


@receiver(post_save, sender=ChatRoom)
def create_room_notification(sender, instance, created, **kwargs):
    """
    Crea notificaciones cuando se crea una nueva sala de chat
    """
    if created:
        # Notificar a todos los participantes sobre la nueva sala
        for participant in instance.participants.all():
            if participant != instance.created_by:
                ChatNotification.objects.create(
                    user=participant,
                    chat_room=instance,
                    notification_type='room_created',
                    title='Nueva sala de chat',
                    content=f'Has sido agregado a la sala "{instance.name}"'
                )