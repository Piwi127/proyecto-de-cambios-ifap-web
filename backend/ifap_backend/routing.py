from django.urls import re_path
from django.apps import apps

def get_websocket_urlpatterns():
    if not apps.apps_ready:
        # Django apps not ready yet, return empty
        return []

    from .consumers import NotificationConsumer, MessagingConsumer, LessonCommentsConsumer

    # Solo incluir rutas que realmente existen
    urlpatterns = [
        re_path(r'ws/notifications/', NotificationConsumer.as_asgi()),
        re_path(r'ws/messaging/(?P<conversation_id>\d+)/$', MessagingConsumer.as_asgi()),
        re_path(r'ws/lesson-comments/(?P<lesson_id>\d+)/$', LessonCommentsConsumer.as_asgi()),
    ]

    # Agregar rutas de chat solo si la app está instalada
    if apps.is_installed('chat'):
        try:
            from chat import routing as chat_routing
            urlpatterns += chat_routing.websocket_urlpatterns
        except ImportError:
            # Si no existe el routing de chat, continuar sin él
            pass

    return urlpatterns

websocket_urlpatterns = get_websocket_urlpatterns()
