from django.urls import re_path
from django.apps import apps

def get_websocket_urlpatterns():
    if not apps.apps_ready:
        # Django apps not ready yet, return empty
        return []
    
    from .consumers import NotificationConsumer, MessagingConsumer, LessonCommentsConsumer
    from messaging import routing as messaging_routing
    urlpatterns = [
        re_path(r'ws/notifications/', NotificationConsumer.as_asgi()),
        re_path(r'ws/messaging/(?P<conversation_id>\d+)/$', MessagingConsumer.as_asgi()),
        re_path(r'ws/lesson-comments/(?P<lesson_id>\d+)/$', LessonCommentsConsumer.as_asgi()),
    ]
    urlpatterns += messaging_routing.websocket_urlpatterns
    return urlpatterns
websocket_urlpatterns = get_websocket_urlpatterns()