from django.db import models
from django.conf import settings
from django.utils import timezone
from courses.models import Course


class ChatRoom(models.Model):
    """
    Modelo para las salas de chat. Pueden ser:
    - Salas de curso (asociadas a un curso específico)
    - Chats privados entre usuarios
    - Chats grupales
    """
    ROOM_TYPES = [
        ('course', 'Sala de Curso'),
        ('private', 'Chat Privado'),
        ('group', 'Chat Grupal'),
    ]
    
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    room_type = models.CharField(max_length=10, choices=ROOM_TYPES, default='private')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, null=True, blank=True, related_name='chat_rooms')
    participants = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='chat_rooms')
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_chat_rooms')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['-updated_at']
        verbose_name = 'Sala de Chat'
        verbose_name_plural = 'Salas de Chat'
    
    def __str__(self):
        return f"{self.name} ({self.get_room_type_display()})"
    
    @property
    def last_message(self):
        """Retorna el último mensaje de la sala"""
        return self.messages.filter(is_deleted=False).order_by('-created_at').first()
    
    def get_unread_count(self, user):
        """Retorna el número de mensajes no leídos para un usuario específico"""
        last_read = UserChatStatus.objects.filter(user=user, chat_room=self).first()
        if not last_read:
            return self.messages.filter(is_deleted=False).count()
        
        return self.messages.filter(
            created_at__gt=last_read.last_read_at,
            is_deleted=False
        ).exclude(sender=user).count()


class Message(models.Model):
    """
    Modelo para los mensajes del chat
    """
    MESSAGE_TYPES = [
        ('text', 'Texto'),
        ('system', 'Sistema'),
        ('notification', 'Notificación'),
    ]
    
    chat_room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='chat_messages_sent')
    content = models.TextField()
    message_type = models.CharField(max_length=20, choices=MESSAGE_TYPES, default='text')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_edited = models.BooleanField(default=False)
    is_deleted = models.BooleanField(default=False)
    reply_to = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='replies')
    
    class Meta:
        ordering = ['created_at']
        verbose_name = 'Mensaje'
        verbose_name_plural = 'Mensajes'
    
    def __str__(self):
        return f"{self.sender.username}: {self.content[:50]}..."
    
    def mark_as_read(self, user):
        """Marca el mensaje como leído por un usuario"""
        MessageRead.objects.get_or_create(
            message=self,
            user=user,
            defaults={'read_at': timezone.now()}
        )


class MessageRead(models.Model):
    """
    Modelo para rastrear qué mensajes han sido leídos por cada usuario
    """
    message = models.ForeignKey(Message, on_delete=models.CASCADE, related_name='read_by')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='read_messages')
    read_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['message', 'user']
        verbose_name = 'Mensaje Leído'
        verbose_name_plural = 'Mensajes Leídos'
    
    def __str__(self):
        return f"{self.user.username} leyó: {self.message.content[:30]}..."


class UserChatStatus(models.Model):
    """
    Modelo para rastrear el estado de los usuarios en las salas de chat
    """
    STATUS_CHOICES = [
        ('online', 'En línea'),
        ('offline', 'Desconectado'),
        ('away', 'Ausente'),
        ('busy', 'Ocupado'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='chat_statuses')
    chat_room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='user_statuses')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='offline')
    last_seen = models.DateTimeField(auto_now=True)
    last_read_at = models.DateTimeField(null=True, blank=True)
    is_typing = models.BooleanField(default=False)
    typing_started_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        unique_together = ['user', 'chat_room']
        verbose_name = 'Estado de Usuario en Chat'
        verbose_name_plural = 'Estados de Usuarios en Chat'
    
    def __str__(self):
        return f"{self.user.username} en {self.chat_room.name}: {self.get_status_display()}"
    
    def set_typing(self, is_typing=True):
        """Establece el estado de escritura del usuario"""
        self.is_typing = is_typing
        if is_typing:
            self.typing_started_at = timezone.now()
        else:
            self.typing_started_at = None
        self.save(update_fields=['is_typing', 'typing_started_at'])
    
    def update_last_read(self):
        """Actualiza la marca de tiempo de la última lectura"""
        self.last_read_at = timezone.now()
        self.save(update_fields=['last_read_at'])


class ChatNotification(models.Model):
    """
    Modelo para las notificaciones del chat
    """
    NOTIFICATION_TYPES = [
        ('new_message', 'Nuevo Mensaje'),
        ('user_joined', 'Usuario se Unió'),
        ('user_left', 'Usuario se Fue'),
        ('room_created', 'Sala Creada'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='chat_notifications')
    chat_room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='notifications')
    message = models.ForeignKey(Message, on_delete=models.CASCADE, null=True, blank=True, related_name='notifications')
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    title = models.CharField(max_length=255)
    content = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Notificación de Chat'
        verbose_name_plural = 'Notificaciones de Chat'
    
    def __str__(self):
        return f"{self.title} - {self.user.username}"
    
    def mark_as_read(self):
        """Marca la notificación como leída"""
        self.is_read = True
        self.save(update_fields=['is_read'])
