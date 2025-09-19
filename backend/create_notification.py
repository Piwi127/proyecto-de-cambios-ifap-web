import os
os.environ['DJANGO_SETTINGS_MODULE'] = 'ifap_backend.settings'
import django
django.setup()
from users.models import User
from notifications.models import Notification
user = User.objects.get(id=6)
Notification.objects.create(recipient=user, message='Test real-time notification')