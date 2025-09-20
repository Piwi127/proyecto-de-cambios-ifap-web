from django.urls import re_path

from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/notifications/', consumers.NotificationConsumer.as_asgi()),
    re_path(r'ws/messaging/(?P<conversation_id>\d+)/$', consumers.MessagingConsumer.as_asgi()),
    re_path(r'ws/lesson-comments/(?P<lesson_id>\d+)/$', consumers.LessonCommentsConsumer.as_asgi()),
]