from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import ChatRoom, Message, MessageRead, UserChatStatus, ChatNotification

User = get_user_model()


class UserBasicSerializer(serializers.ModelSerializer):
    """Serializer básico para información de usuario en el chat"""
    full_name = serializers.SerializerMethodField()
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'full_name', 'role_display']
    
    def get_full_name(self, obj):
        return obj.get_full_name() or obj.username


class MessageReadSerializer(serializers.ModelSerializer):
    user = UserBasicSerializer(read_only=True)
    
    class Meta:
        model = MessageRead
        fields = ['user', 'read_at']


class MessageSerializer(serializers.ModelSerializer):
    sender = UserBasicSerializer(read_only=True)
    read_by = MessageReadSerializer(many=True, read_only=True)
    is_read_by_user = serializers.SerializerMethodField()
    
    class Meta:
        model = Message
        fields = [
            'id', 'content', 'sender', 'created_at', 'message_type',
            'edited_at', 'is_edited', 'read_by', 'is_read_by_user'
        ]
        read_only_fields = ['id', 'sender', 'created_at', 'edited_at', 'is_edited']
    
    def get_is_read_by_user(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.read_by.filter(user=request.user).exists()
        return False


class UserChatStatusSerializer(serializers.ModelSerializer):
    user = UserBasicSerializer(read_only=True)
    
    class Meta:
        model = UserChatStatus
        fields = ['user', 'is_online', 'is_typing', 'last_seen']


class ChatRoomSerializer(serializers.ModelSerializer):
    participants = UserBasicSerializer(many=True, read_only=True)
    created_by = UserBasicSerializer(read_only=True)
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    online_participants = serializers.SerializerMethodField()
    course_title = serializers.CharField(source='course.title', read_only=True)
    
    class Meta:
        model = ChatRoom
        fields = [
            'id', 'name', 'description', 'room_type', 'course', 'course_title',
            'participants', 'created_by', 'created_at', 'updated_at',
            'last_message', 'unread_count', 'online_participants'
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']
    
    def get_last_message(self, obj):
        last_message = obj.messages.order_by('-created_at').first()
        if last_message:
            return {
                'id': last_message.id,
                'content': last_message.content,
                'sender': last_message.sender.username,
                'timestamp': last_message.created_at,
                'message_type': last_message.message_type
            }
        return None
    
    def get_unread_count(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            # Contar mensajes no leídos por el usuario actual
            return obj.messages.exclude(
                read_by__user=request.user
            ).count()
        return 0
    
    def get_online_participants(self, obj):
        online_statuses = obj.user_statuses.filter(is_online=True)
        return UserChatStatusSerializer(online_statuses, many=True).data


class ChatRoomCreateSerializer(serializers.ModelSerializer):
    participants = serializers.PrimaryKeyRelatedField(
        many=True, 
        queryset=User.objects.all(),
        required=False
    )
    
    class Meta:
        model = ChatRoom
        fields = ['name', 'description', 'room_type', 'course', 'participants']
    
    def create(self, validated_data):
        participants = validated_data.pop('participants', [])
        request = self.context.get('request')
        
        chat_room = ChatRoom.objects.create(
            created_by=request.user,
            **validated_data
        )
        
        # Agregar el creador como participante
        participants.append(request.user)
        chat_room.participants.set(participants)
        
        return chat_room


class ChatNotificationSerializer(serializers.ModelSerializer):
    sender = UserBasicSerializer(source='message.sender', read_only=True)
    chat_room = ChatRoomSerializer(read_only=True)
    
    class Meta:
        model = ChatNotification
        fields = [
            'id', 'user', 'chat_room', 'message', 'sender',
            'notification_type', 'is_read', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class MessageCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['content', 'message_type']
    
    def create(self, validated_data):
        request = self.context.get('request')
        chat_room_id = self.context.get('chat_room_id')
        
        return Message.objects.create(
            sender=request.user,
            chat_room_id=chat_room_id,
            **validated_data
        )