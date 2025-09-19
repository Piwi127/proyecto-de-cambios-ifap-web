from django.db import models
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver
from .utils import send_notification_to_user

class Notification(models.Model):
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    read = models.BooleanField(default=False)

    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        return f'Notification for {self.recipient.username}: {self.message[:50]}...'


@receiver(post_save, sender=Notification)
def notify_user(sender, instance, created, **kwargs):
    if created:
        send_notification_to_user(instance.recipient.id, instance.message)
