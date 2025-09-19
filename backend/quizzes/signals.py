from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import QuizAttempt
from notifications.models import Notification

@receiver(post_save, sender=QuizAttempt)
def create_notification_on_quiz_attempt(sender, instance, created, **kwargs):
    if created and not instance.completed_at:
        message = f"New pending quiz: {instance.quiz.title} in {instance.quiz.course.title}"
        Notification.objects.create(recipient=instance.user, message=message)