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
