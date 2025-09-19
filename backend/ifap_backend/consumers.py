import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async

@database_sync_to_async
def get_user_from_token(token_key):
    from rest_framework.authtoken.models import Token
    from django.contrib.auth.models import AnonymousUser
    try:
        token = Token.objects.get(key=token_key)
        return token.user
    except Token.DoesNotExist:
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