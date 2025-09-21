import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from .models import Message, Conversation
from .serializers import MessageSerializer

User = get_user_model()
logger = logging.getLogger(__name__)

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.conversation_id = self.scope['url_route']['kwargs']['conversation_id']
        self.conversation_group_name = f'chat_{self.conversation_id}'

        # Join conversation group
        await self.channel_layer.group_add(
            self.conversation_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Leave conversation group
        await self.channel_layer.group_discard(
            self.conversation_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get('type')

        if message_type == 'message':
            message_content = data.get('message')
            sender = self.scope['user']

            if sender.is_anonymous:
                await self.send(text_data=json.dumps({'error': 'Authentication required.'}))
                return

            # Save message to database
            message = await self.create_chat_message(sender, message_content)

            # Send message to conversation group
            await self.channel_layer.group_send(
                self.conversation_group_name,
                {
                    'type': 'chat_message',
                    'message': MessageSerializer(message).data
                }
            )
        elif message_type == 'typing_status':
            is_typing = data.get('is_typing')
            user_id = data.get('user_id')

            await self.channel_layer.group_send(
                self.conversation_group_name,
                {
                    'type': 'typing_status',
                    'user_id': user_id,
                    'is_typing': is_typing
                }
            )

    async def chat_message(self, event):
        message = event['message']
        await self.send(text_data=json.dumps({
            'type': 'message',
            'message': message
        }))

    async def typing_status(self, event):
        await self.send(text_data=json.dumps({
            'type': 'typing_status',
            'user_id': event['user_id'],
            'is_typing': event['is_typing']
        }))

    @database_sync_to_async
    def create_chat_message(self, sender, message_data):
        conversation = Conversation.objects.get(id=self.conversation_id)
        message = Message.objects.create(
            conversation=conversation,
            sender=sender,
            content=message_data['content']
        )
        return message