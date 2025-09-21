import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser, User

logger = logging.getLogger('middleware')

@database_sync_to_async
def get_user_from_token(token_key):
    from rest_framework_simplejwt.tokens import AccessToken
    try:
        token = AccessToken(token_key)
        user_id = token['user_id']
        user = User.objects.get(id=user_id)
        logger.info(f"WebSocket authentication successful for user {user_id}")
        return user
    except Exception as e:
        logger.error(f"Error decoding JWT: {e}")
        return AnonymousUser()

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        query_string = self.scope['query_string'].decode()
        token_key = [q.split('=')[1] for q in query_string.split('&') if q.split('=')[0] == 'token']
        token = token_key[0] if token_key else None

        user = await get_user_from_token(token) if token else AnonymousUser()

        if user.is_anonymous:
            await self.close()
            return

        self.scope['user'] = user
        self.user = user
        self.group_name = f'user_{self.user.id}'
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        if not self.user.is_anonymous:
            await self.channel_layer.group_discard(
                self.group_name,
                self.channel_name
            )

    async def receive(self, text_data):
        # We don't expect to receive messages from the frontend for notifications
        pass

    async def send_notification(self, event):
        message = event['message']
        await self.send(text_data=json.dumps({
            'message': message
        }))


class LessonCommentsConsumer(AsyncWebsocketConsumer):
    """Consumer para comentarios en lecciones en tiempo real"""

    async def connect(self):
        query_string = self.scope['query_string'].decode()
        token_key = [q.split('=')[1] for q in query_string.split('&') if q.split('=')[0] == 'token']
        token = token_key[0] if token_key else None

        user = await get_user_from_token(token) if token else AnonymousUser()

        if user.is_anonymous:
            await self.close()
            return

        self.scope['user'] = user
        self.user = user
        self.lesson_id = self.scope['url_route']['kwargs']['lesson_id']

        # Verificar que el usuario tenga acceso a la lección
        if not await self.user_has_access_to_lesson(self.lesson_id):
            await self.close()
            return

        self.group_name = f'lesson_comments_{self.lesson_id}'
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_discard(
                self.group_name,
                self.channel_name
            )

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get('type')

        if message_type == 'comment':
            await self.handle_comment(data)
        elif message_type == 'like':
            await self.handle_like(data)

    async def handle_comment(self, data):
        content = data.get('content', '')
        parent_comment_id = data.get('parent_comment_id')

        # Crear comentario en la base de datos
        comment = await self.create_comment(content, parent_comment_id)

        # Enviar comentario a todos los usuarios conectados
        await self.channel_layer.group_send(
            self.group_name,
            {
                'type': 'new_comment',
                'comment': {
                    'id': comment.id,
                    'author': {
                        'id': comment.author.id,
                        'username': comment.author.username,
                        'first_name': comment.author.first_name,
                        'last_name': comment.author.last_name
                    },
                    'content': comment.content,
                    'parent_comment': comment.parent_comment.id if comment.parent_comment else None,
                    'is_reply': comment.is_reply,
                    'created_at': comment.created_at.isoformat()
                }
            }
        )

    async def handle_like(self, data):
        comment_id = data.get('comment_id')

        if not comment_id:
            return

        # Alternar like
        liked = await self.toggle_like(comment_id)

        # Enviar actualización de likes
        await self.channel_layer.group_send(
            self.group_name,
            {
                'type': 'comment_like',
                'comment_id': comment_id,
                'user': {
                    'id': self.user.id,
                    'username': self.user.username
                },
                'liked': liked
            }
        )

    async def new_comment(self, event):
        await self.send(text_data=json.dumps({
            'type': 'comment',
            'comment': event['comment']
        }))

    async def comment_like(self, event):
        await self.send(text_data=json.dumps({
            'type': 'like',
            'comment_id': event['comment_id'],
            'user': event['user'],
            'liked': event['liked']
        }))

    @database_sync_to_async
    def user_has_access_to_lesson(self, lesson_id):
        from lessons.models import Lesson
        try:
            lesson = Lesson.objects.get(id=lesson_id)
            # Verificar si el usuario está inscrito en el curso
            return lesson.course.students.filter(id=self.user.id).exists() or self.user.is_instructor
        except Lesson.DoesNotExist:
            return False

    @database_sync_to_async
    def create_comment(self, content, parent_comment_id):
        from forum.models import LessonComment
        return LessonComment.objects.create(
            lesson_id=self.lesson_id,
            author=self.user,
            content=content,
            parent_comment_id=parent_comment_id
        )

    @database_sync_to_async
    def toggle_like(self, comment_id):
        from forum.models import LessonCommentLike
        like, created = LessonCommentLike.objects.get_or_create(
            user=self.user,
            comment_id=comment_id
        )

        if not created:
            like.delete()
            return False
        return True