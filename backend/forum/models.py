from django.db import models
from django.contrib.auth import get_user_model
from courses.models import Course

User = get_user_model()

class ForumCategory(models.Model):
    """Categorías del foro"""
    name = models.CharField(max_length=100, verbose_name="Nombre")
    description = models.TextField(blank=True, verbose_name="Descripción")
    course = models.ForeignKey(
        Course, 
        on_delete=models.CASCADE, 
        related_name='forum_categories',
        null=True, 
        blank=True,
        verbose_name="Curso"
    )
    is_active = models.BooleanField(default=True, verbose_name="Activo")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de creación")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Fecha de actualización")

    class Meta:
        verbose_name = "Categoría del Foro"
        verbose_name_plural = "Categorías del Foro"
        ordering = ['name']

    def __str__(self):
        return self.name

    @property
    def topics_count(self):
        return self.topics.filter(is_active=True).count()

    @property
    def latest_post(self):
        latest_topic = self.topics.filter(is_active=True).order_by('-updated_at').first()
        if latest_topic:
            latest_reply = latest_topic.replies.filter(is_active=True).order_by('-created_at').first()
            return latest_reply if latest_reply else latest_topic
        return None


class ForumTopic(models.Model):
    """Temas del foro"""
    title = models.CharField(max_length=200, verbose_name="Título")
    content = models.TextField(verbose_name="Contenido")
    category = models.ForeignKey(
        ForumCategory, 
        on_delete=models.CASCADE, 
        related_name='topics',
        verbose_name="Categoría"
    )
    author = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='forum_topics',
        verbose_name="Autor"
    )
    is_pinned = models.BooleanField(default=False, verbose_name="Fijado")
    is_locked = models.BooleanField(default=False, verbose_name="Bloqueado")
    is_active = models.BooleanField(default=True, verbose_name="Activo")
    views_count = models.PositiveIntegerField(default=0, verbose_name="Visualizaciones")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de creación")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Fecha de actualización")

    class Meta:
        verbose_name = "Tema del Foro"
        verbose_name_plural = "Temas del Foro"
        ordering = ['-is_pinned', '-updated_at']

    def __str__(self):
        return self.title

    @property
    def replies_count(self):
        return self.replies.filter(is_active=True).count()

    @property
    def latest_reply(self):
        return self.replies.filter(is_active=True).order_by('-created_at').first()

    def increment_views(self):
        self.views_count += 1
        self.save(update_fields=['views_count'])


class ForumReply(models.Model):
    """Respuestas a los temas del foro"""
    content = models.TextField(verbose_name="Contenido")
    topic = models.ForeignKey(
        ForumTopic, 
        on_delete=models.CASCADE, 
        related_name='replies',
        verbose_name="Tema"
    )
    author = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='forum_replies',
        verbose_name="Autor"
    )
    parent_reply = models.ForeignKey(
        'self', 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True,
        related_name='child_replies',
        verbose_name="Respuesta padre"
    )
    is_active = models.BooleanField(default=True, verbose_name="Activo")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de creación")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Fecha de actualización")

    class Meta:
        verbose_name = "Respuesta del Foro"
        verbose_name_plural = "Respuestas del Foro"
        ordering = ['created_at']

    def __str__(self):
        return f"Respuesta de {self.author.username} en {self.topic.title}"

    @property
    def is_reply_to_reply(self):
        return self.parent_reply is not None


class ForumLike(models.Model):
    """Likes para temas y respuestas del foro"""
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE,
        verbose_name="Usuario"
    )
    topic = models.ForeignKey(
        ForumTopic, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True,
        related_name='likes',
        verbose_name="Tema"
    )
    reply = models.ForeignKey(
        ForumReply, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True,
        related_name='likes',
        verbose_name="Respuesta"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de creación")

    class Meta:
        verbose_name = "Like del Foro"
        verbose_name_plural = "Likes del Foro"
        unique_together = [
            ['user', 'topic'],
            ['user', 'reply']
        ]

    def __str__(self):
        if self.topic:
            return f"{self.user.username} likes {self.topic.title}"
        elif self.reply:
            return f"{self.user.username} likes reply in {self.reply.topic.title}"
        return f"Like de {self.user.username}"

    def clean(self):
        from django.core.exceptions import ValidationError
        if not self.topic and not self.reply:
            raise ValidationError("Debe especificar un tema o una respuesta")
        if self.topic and self.reply:
            raise ValidationError("No puede especificar tanto un tema como una respuesta")


# Modelos para comentarios en lecciones
class LessonComment(models.Model):
    """Comentarios en lecciones"""
    lesson = models.ForeignKey(
        'lessons.Lesson',
        on_delete=models.CASCADE,
        related_name='comments',
        verbose_name="Lección"
    )
    author = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='lesson_comments',
        verbose_name="Autor"
    )
    content = models.TextField(verbose_name="Contenido")
    parent_comment = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='replies',
        verbose_name="Comentario padre"
    )
    is_active = models.BooleanField(default=True, verbose_name="Activo")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de creación")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Fecha de actualización")

    class Meta:
        verbose_name = "Comentario de Lección"
        verbose_name_plural = "Comentarios de Lección"
        ordering = ['created_at']

    def __str__(self):
        return f"Comentario de {self.author.username} en {self.lesson.title}"

    @property
    def is_reply(self):
        return self.parent_comment is not None

    @property
    def replies_count(self):
        return self.replies.filter(is_active=True).count()


class LessonCommentLike(models.Model):
    """Likes para comentarios de lecciones"""
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        verbose_name="Usuario"
    )
    comment = models.ForeignKey(
        LessonComment,
        on_delete=models.CASCADE,
        related_name='likes',
        verbose_name="Comentario"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de creación")

    class Meta:
        verbose_name = "Like de Comentario"
        verbose_name_plural = "Likes de Comentarios"
        unique_together = ['user', 'comment']

    def __str__(self):
        return f"{self.user.username} likes comment in {self.comment.lesson.title}"


# Modelos para mensajería privada
class Conversation(models.Model):
    """Conversaciones privadas entre usuarios"""
    participants = models.ManyToManyField(
        User,
        related_name='conversations',
        verbose_name="Participantes"
    )
    subject = models.CharField(max_length=200, blank=True, verbose_name="Asunto")
    is_group = models.BooleanField(default=False, verbose_name="Es grupo")
    group_name = models.CharField(max_length=100, blank=True, verbose_name="Nombre del grupo")
    group_description = models.TextField(blank=True, verbose_name="Descripción del grupo")
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_conversations',
        verbose_name="Creado por"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de creación")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Fecha de actualización")

    class Meta:
        verbose_name = "Conversación"
        verbose_name_plural = "Conversaciones"
        ordering = ['-updated_at']

    def __str__(self):
        if self.is_group and self.group_name:
            return f"Grupo: {self.group_name}"
        elif self.participants.count() == 2:
            participants_names = [p.username for p in self.participants.all()]
            return f"Chat: {participants_names[0]} - {participants_names[1]}"
        else:
            return f"Conversación con {self.participants.count()} participantes"

    @property
    def last_message(self):
        return self.messages.order_by('-created_at').first()

    @property
    def unread_count_for_user(self, user):
        return self.messages.exclude(sender=user).filter(
            ~models.Q(read_by=user)
        ).count()


class Message(models.Model):
    """Mensajes en conversaciones"""
    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name='messages',
        verbose_name="Conversación"
    )
    sender = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='sent_messages',
        verbose_name="Remitente"
    )
    content = models.TextField(verbose_name="Contenido")
    message_type = models.CharField(
        max_length=20,
        choices=[
            ('text', 'Texto'),
            ('image', 'Imagen'),
            ('file', 'Archivo'),
            ('system', 'Sistema')
        ],
        default='text',
        verbose_name="Tipo de mensaje"
    )
    file_url = models.URLField(blank=True, verbose_name="URL del archivo")
    file_name = models.CharField(max_length=255, blank=True, verbose_name="Nombre del archivo")
    file_size = models.PositiveIntegerField(null=True, blank=True, verbose_name="Tamaño del archivo")
    is_edited = models.BooleanField(default=False, verbose_name="Editado")
    edited_at = models.DateTimeField(null=True, blank=True, verbose_name="Fecha de edición")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de creación")

    class Meta:
        verbose_name = "Mensaje"
        verbose_name_plural = "Mensajes"
        ordering = ['created_at']

    def __str__(self):
        return f"Mensaje de {self.sender.username} en {self.conversation}"

    def mark_as_read_for_user(self, user):
        MessageRead.objects.get_or_create(
            message=self,
            user=user,
            defaults={'read_at': models.functions.Now()}
        )


class MessageRead(models.Model):
    """Registro de mensajes leídos por usuarios"""
    message = models.ForeignKey(
        Message,
        on_delete=models.CASCADE,
        related_name='read_by',
        verbose_name="Mensaje"
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='read_messages',
        verbose_name="Usuario"
    )
    read_at = models.DateTimeField(auto_now_add=True, verbose_name="Leído en")

    class Meta:
        verbose_name = "Mensaje Leído"
        verbose_name_plural = "Mensajes Leídos"
        unique_together = ['message', 'user']

    def __str__(self):
        return f"{self.user.username} leyó mensaje {self.message.id}"


class MessageReaction(models.Model):
    """Reacciones a mensajes"""
    message = models.ForeignKey(
        Message,
        on_delete=models.CASCADE,
        related_name='reactions',
        verbose_name="Mensaje"
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='message_reactions',
        verbose_name="Usuario"
    )
    reaction = models.CharField(max_length=50, verbose_name="Reacción")  # emoji
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de creación")

    class Meta:
        verbose_name = "Reacción a Mensaje"
        verbose_name_plural = "Reacciones a Mensajes"
        unique_together = ['message', 'user', 'reaction']

    def __str__(self):
        return f"{self.user.username} reaccionó {self.reaction} al mensaje {self.message.id}"


class TypingIndicator(models.Model):
    """Indicadores de escritura en tiempo real"""
    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name='typing_indicators',
        verbose_name="Conversación"
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='typing_in',
        verbose_name="Usuario escribiendo"
    )
    timestamp = models.DateTimeField(auto_now=True, verbose_name="Timestamp")

    class Meta:
        verbose_name = "Indicador de Escritura"
        verbose_name_plural = "Indicadores de Escritura"
        unique_together = ['conversation', 'user']

    def __str__(self):
        return f"{self.user.username} está escribiendo en {self.conversation}"
