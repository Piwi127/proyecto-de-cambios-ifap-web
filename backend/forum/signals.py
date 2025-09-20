from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.utils import timezone
from .models import (
    Message, MessageRead, Conversation, LessonComment,
    LessonCommentLike, ForumTopic, ForumReply
)
from notifications.models import Notification


@receiver(post_save, sender=Message)
def handle_new_message(sender, instance, created, **kwargs):
    """Manejar eventos cuando se crea un nuevo mensaje"""
    if created:
        # Actualizar timestamp de la conversación
        instance.conversation.save()

        # Crear notificaciones para otros participantes
        for participant in instance.conversation.participants.exclude(id=instance.sender.id):
            Notification.objects.create(
                user=participant,
                title=f"Nuevo mensaje en {instance.conversation.subject or 'conversación'}",
                message=f"{instance.sender.username}: {instance.content[:50]}{'...' if len(instance.content) > 50 else ''}",
                notification_type='message',
                related_object_id=instance.id,
                related_object_type='message'
            )


@receiver(post_save, sender=LessonComment)
def handle_new_lesson_comment(sender, instance, created, **kwargs):
    """Manejar eventos cuando se crea un nuevo comentario en lección"""
    if created:
        # Crear notificaciones para estudiantes del curso
        course_students = instance.lesson.course.students.exclude(id=instance.author.id)

        for student in course_students:
            Notification.objects.create(
                user=student,
                title=f"Nuevo comentario en {instance.lesson.title}",
                message=f"{instance.author.username}: {instance.content[:50]}{'...' if len(instance.content) > 50 else ''}",
                notification_type='lesson_comment',
                related_object_id=instance.id,
                related_object_type='lesson_comment'
            )


@receiver(post_save, sender=LessonCommentLike)
def handle_lesson_comment_like(sender, instance, created, **kwargs):
    """Manejar eventos cuando se da like a un comentario"""
    if created:
        # Notificar al autor del comentario
        if instance.comment.author != instance.user:
            Notification.objects.create(
                user=instance.comment.author,
                title="Like en tu comentario",
                message=f"{instance.user.username} le dio like a tu comentario",
                notification_type='like',
                related_object_id=instance.id,
                related_object_type='comment_like'
            )


@receiver(post_save, sender=ForumTopic)
def handle_new_forum_topic(sender, instance, created, **kwargs):
    """Manejar eventos cuando se crea un nuevo tema en el foro"""
    if created:
        # Notificar a estudiantes del curso sobre nuevo tema
        course_students = instance.category.course.students.exclude(id=instance.author.id)

        for student in course_students:
            Notification.objects.create(
                user=student,
                title=f"Nuevo tema en {instance.category.name}",
                message=f"{instance.author.username}: {instance.title}",
                notification_type='forum_topic',
                related_object_id=instance.id,
                related_object_type='forum_topic'
            )


@receiver(post_save, sender=ForumReply)
def handle_new_forum_reply(sender, instance, created, **kwargs):
    """Manejar eventos cuando se crea una nueva respuesta en el foro"""
    if created:
        # Notificar al autor del tema
        if instance.topic.author != instance.author:
            Notification.objects.create(
                user=instance.topic.author,
                title=f"Nueva respuesta en {instance.topic.title}",
                message=f"{instance.author.username}: {instance.content[:50]}{'...' if len(instance.content) > 50 else ''}",
                notification_type='forum_reply',
                related_object_id=instance.id,
                related_object_type='forum_reply'
            )


@receiver(post_save, sender=Conversation)
def handle_new_conversation(sender, instance, created, **kwargs):
    """Manejar eventos cuando se crea una nueva conversación"""
    if created:
        # Notificaciones para participantes (excepto el creador)
        for participant in instance.participants.exclude(id=instance.created_by.id):
            Notification.objects.create(
                user=participant,
                title="Nueva conversación",
                message=f"Has sido agregado a la conversación: {instance.subject or 'Sin asunto'}",
                notification_type='conversation',
                related_object_id=instance.id,
                related_object_type='conversation'
            )


@receiver(post_delete, sender=MessageRead)
def handle_message_read_deleted(sender, instance, **kwargs):
    """Manejar cuando se elimina una marca de leído"""
    # Actualizar el conteo de mensajes no leídos en la conversación
    instance.message.conversation.save()


@receiver(post_save, sender=MessageRead)
def handle_message_read_created(sender, instance, created, **kwargs):
    """Manejar cuando se marca un mensaje como leído"""
    if created:
        # Actualizar el conteo de mensajes no leídos en la conversación
        instance.message.conversation.save()