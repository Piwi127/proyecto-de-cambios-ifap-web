from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    # Chat directo entre usuarios (sala específica)
    re_path(r'ws/chat/(?P<room_id>\d+)/$', consumers.ChatConsumer.as_asgi()),
    
    # Chat grupal del curso
    re_path(r'ws/chat/course/(?P<course_id>\d+)/$', consumers.CourseGroupChatConsumer.as_asgi()),
]