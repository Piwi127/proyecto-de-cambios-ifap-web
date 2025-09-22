import json
import asyncio
from datetime import datetime
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from django.core.exceptions import ObjectDoesNotExist
from .models import ChatRoom, Message, UserChatStatus, MessageRead

User = get_user_model()


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.room_group_name = f'chat_{self.room_id}'
        self.user = self.scope['user']
        
        if self.user.is_anonymous:
            await self.close()
            return
        
        # Verificar que el usuario tenga acceso a la sala
        has_access = await self.check_room_access()
        if not has_access:
            await self.close()
            return
        
        # Unirse al grupo de la sala
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
        
        # Actualizar estado del usuario a en línea
        await self.update_user_status(is_online=True)
        
        # Notificar a otros usuarios que este usuario se conectó
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'user_status_update',
                'user_id': self.user.id,
                'username': self.user.username,
                'is_online': True,
                'timestamp': datetime.now().isoformat()
            }
        )

    async def disconnect(self, close_code):
        if hasattr(self, 'room_group_name'):
            # Actualizar estado del usuario a desconectado
            await self.update_user_status(is_online=False, is_typing=False)
            
            # Notificar a otros usuarios que este usuario se desconectó
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'user_status_update',
                    'user_id': self.user.id,
                    'username': self.user.username,
                    'is_online': False,
                    'timestamp': datetime.now().isoformat()
                }
            )
            
            # Salir del grupo de la sala
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )

    async def receive(self, text_data):
        try:
            text_data_json = json.loads(text_data)
            message_type = text_data_json.get('type')
            
            if message_type == 'chat_message':
                await self.handle_chat_message(text_data_json)
            elif message_type == 'typing_indicator':
                await self.handle_typing_indicator(text_data_json)
            elif message_type == 'mark_as_read':
                await self.handle_mark_as_read(text_data_json)
            
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Invalid JSON format'
            }))

    async def handle_chat_message(self, data):
        content = data.get('content', '').strip()
        if not content:
            return
        
        # Guardar mensaje en la base de datos
        message = await self.save_message(content)
        if not message:
            return
        
        # Enviar mensaje a todos los usuarios en la sala
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message_id': message.id,
                'content': message.content,
                'sender_id': message.sender.id,
                'sender_username': message.sender.username,
                'sender_full_name': message.sender.get_full_name() or message.sender.username,
                'timestamp': message.created_at.isoformat(),
                'message_type': message.message_type
            }
        )

    async def handle_typing_indicator(self, data):
        is_typing = data.get('is_typing', False)
        
        # Actualizar estado de escritura
        await self.update_user_status(is_typing=is_typing)
        
        # Enviar indicador de escritura a otros usuarios
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'typing_indicator',
                'user_id': self.user.id,
                'username': self.user.username,
                'is_typing': is_typing,
                'timestamp': datetime.now().isoformat()
            }
        )

    async def handle_mark_as_read(self, data):
        message_id = data.get('message_id')
        if message_id:
            await self.mark_message_as_read(message_id)

    # Handlers para mensajes del grupo
    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'message_id': event['message_id'],
            'content': event['content'],
            'sender_id': event['sender_id'],
            'sender_username': event['sender_username'],
            'sender_full_name': event['sender_full_name'],
            'timestamp': event['timestamp'],
            'message_type': event['message_type']
        }))

    async def typing_indicator(self, event):
        # No enviar el indicador al mismo usuario que está escribiendo
        if event['user_id'] != self.user.id:
            await self.send(text_data=json.dumps({
                'type': 'typing_indicator',
                'user_id': event['user_id'],
                'username': event['username'],
                'is_typing': event['is_typing'],
                'timestamp': event['timestamp']
            }))

    async def user_status_update(self, event):
        # No enviar la actualización al mismo usuario
        if event['user_id'] != self.user.id:
            await self.send(text_data=json.dumps({
                'type': 'user_status_update',
                'user_id': event['user_id'],
                'username': event['username'],
                'is_online': event['is_online'],
                'timestamp': event['timestamp']
            }))

    # Métodos de base de datos
    @database_sync_to_async
    def check_room_access(self):
        try:
            room = ChatRoom.objects.get(id=self.room_id)
            return room.participants.filter(id=self.user.id).exists()
        except ObjectDoesNotExist:
            return False

    @database_sync_to_async
    def save_message(self, content):
        try:
            room = ChatRoom.objects.get(id=self.room_id)
            message = Message.objects.create(
                chat_room=room,
                sender=self.user,
                content=content,
                message_type='text'
            )
            return message
        except ObjectDoesNotExist:
            return None

    @database_sync_to_async
    def update_user_status(self, is_online=None, is_typing=None):
        try:
            room = ChatRoom.objects.get(id=self.room_id)
            status, created = UserChatStatus.objects.get_or_create(
                user=self.user,
                chat_room=room,
                defaults={'is_online': False, 'is_typing': False}
            )
            
            if is_online is not None:
                status.is_online = is_online
            if is_typing is not None:
                status.is_typing = is_typing
            
            status.last_seen = datetime.now()
            status.save()
            
        except ObjectDoesNotExist:
            pass

    @database_sync_to_async
    def mark_message_as_read(self, message_id):
        try:
            message = Message.objects.get(id=message_id)
            MessageRead.objects.get_or_create(
                message=message,
                user=self.user,
                defaults={'read_at': datetime.now()}
            )
        except ObjectDoesNotExist:
            pass


class CourseGroupChatConsumer(ChatConsumer):
    """Consumer específico para chats grupales de cursos"""
    
    async def connect(self):
        self.course_id = self.scope['url_route']['kwargs']['course_id']
        self.room_group_name = f'course_chat_{self.course_id}'
        self.user = self.scope['user']
        
        if self.user.is_anonymous:
            await self.close()
            return
        
        # Verificar que el usuario esté inscrito en el curso
        has_access = await self.check_course_access()
        if not has_access:
            await self.close()
            return
        
        # Obtener o crear sala de chat del curso
        room = await self.get_or_create_course_room()
        self.room_id = room.id
        
        # Continuar con la conexión normal
        await super().connect()

    @database_sync_to_async
    def check_course_access(self):
        from courses.models import Course
        try:
            course = Course.objects.get(id=self.course_id)
            # Verificar si es instructor o estudiante del curso
            return (course.instructor == self.user or 
                   course.students.filter(id=self.user.id).exists())
        except ObjectDoesNotExist:
            return False

    @database_sync_to_async
    def get_or_create_course_room(self):
        from courses.models import Course
        try:
            course = Course.objects.get(id=self.course_id)
            room, created = ChatRoom.objects.get_or_create(
                course=course,
                room_type='course',
                defaults={
                    'name': f'Chat del curso: {course.title}',
                    'description': f'Chat grupal para el curso {course.title}',
                    'created_by': self.user
                }
            )
            
            # Agregar participantes si es una nueva sala
            if created:
                participants = [course.instructor]
                participants.extend(course.students.all())
                room.participants.set(participants)
            
            return room
        except ObjectDoesNotExist:
            return None