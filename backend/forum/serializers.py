from rest_framework import serializers
from .models import (
    ForumCategory, ForumTopic, ForumReply, ForumLike,
    LessonComment, LessonCommentLike, Conversation, Message,
    MessageRead, MessageReaction, TypingIndicator
)
from users.serializers import UserSerializer


class ForumCategorySerializer(serializers.ModelSerializer):
    topics_count = serializers.ReadOnlyField()
    latest_post = serializers.SerializerMethodField()
    
    class Meta:
        model = ForumCategory
        fields = ['id', 'name', 'description', 'course', 'is_active', 
                 'topics_count', 'latest_post', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']
    
    def get_latest_post(self, obj):
        latest_post = obj.latest_post
        if latest_post:
            if hasattr(latest_post, 'topic'):  # Es una respuesta
                return {
                    'type': 'reply',
                    'id': latest_post.id,
                    'author': latest_post.author.username,
                    'created_at': latest_post.created_at,
                    'topic_title': latest_post.topic.title
                }
            else:  # Es un tema
                return {
                    'type': 'topic',
                    'id': latest_post.id,
                    'author': latest_post.author.username,
                    'created_at': latest_post.created_at,
                    'title': latest_post.title
                }
        return None


class ForumTopicListSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    replies_count = serializers.ReadOnlyField()
    latest_reply = serializers.SerializerMethodField()
    likes_count = serializers.SerializerMethodField()
    user_has_liked = serializers.SerializerMethodField()
    
    class Meta:
        model = ForumTopic
        fields = ['id', 'title', 'category', 'category_name', 'author', 
                 'is_pinned', 'is_locked', 'views_count', 'replies_count',
                 'latest_reply', 'likes_count', 'user_has_liked', 'created_at', 'updated_at']
    
    def get_latest_reply(self, obj):
        latest_reply = obj.latest_reply
        if latest_reply:
            return {
                'id': latest_reply.id,
                'author': latest_reply.author.username,
                'created_at': latest_reply.created_at
            }
        return None
    
    def get_likes_count(self, obj):
        return obj.likes.count()
    
    def get_user_has_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(user=request.user).exists()
        return False


class ForumTopicDetailSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    category = ForumCategorySerializer(read_only=True)
    replies_count = serializers.ReadOnlyField()
    likes_count = serializers.SerializerMethodField()
    user_has_liked = serializers.SerializerMethodField()
    
    class Meta:
        model = ForumTopic
        fields = ['id', 'title', 'content', 'category', 'author', 
                 'is_pinned', 'is_locked', 'is_active', 'views_count', 
                 'replies_count', 'likes_count', 'user_has_liked',
                 'created_at', 'updated_at']
        read_only_fields = ['author', 'views_count', 'created_at', 'updated_at']
    
    def get_likes_count(self, obj):
        return obj.likes.count()
    
    def get_user_has_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(user=request.user).exists()
        return False


class ForumTopicCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ForumTopic
        fields = ['title', 'content', 'category']
    
    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)


class ForumReplySerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    likes_count = serializers.SerializerMethodField()
    user_has_liked = serializers.SerializerMethodField()
    child_replies = serializers.SerializerMethodField()
    
    class Meta:
        model = ForumReply
        fields = ['id', 'content', 'topic', 'author', 'parent_reply',
                 'likes_count', 'user_has_liked', 'child_replies',
                 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['author', 'created_at', 'updated_at']
    
    def get_likes_count(self, obj):
        return obj.likes.count()
    
    def get_user_has_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(user=request.user).exists()
        return False
    
    def get_child_replies(self, obj):
        if obj.child_replies.exists():
            return ForumReplySerializer(
                obj.child_replies.filter(is_active=True), 
                many=True, 
                context=self.context
            ).data
        return []
    
    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)


class ForumLikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ForumLike
        fields = ['id', 'user', 'topic', 'reply', 'created_at']
        read_only_fields = ['user', 'created_at']
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
    
    def validate(self, data):
        if not data.get('topic') and not data.get('reply'):
            raise serializers.ValidationError("Debe especificar un tema o una respuesta")
        if data.get('topic') and data.get('reply'):
            raise serializers.ValidationError("No puede especificar tanto un tema como una respuesta")
        return data


# Serializadores para comentarios en lecciones
class LessonCommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    replies = serializers.SerializerMethodField()
    likes_count = serializers.SerializerMethodField()
    user_has_liked = serializers.SerializerMethodField()
    lesson_title = serializers.CharField(source='lesson.title', read_only=True)

    class Meta:
        model = LessonComment
        fields = [
            'id', 'lesson', 'lesson_title', 'author', 'content', 'parent_comment',
            'replies', 'likes_count', 'user_has_liked', 'is_active', 'is_reply',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['author', 'created_at', 'updated_at']

    def get_replies(self, obj):
        if obj.replies.exists():
            return LessonCommentSerializer(
                obj.replies.filter(is_active=True),
                many=True,
                context=self.context
            ).data
        return []

    def get_likes_count(self, obj):
        return obj.likes.count()

    def get_user_has_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(user=request.user).exists()
        return False


class LessonCommentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = LessonComment
        fields = ['lesson', 'content', 'parent_comment']

    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)


class LessonCommentLikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = LessonCommentLike
        fields = ['id', 'comment', 'user', 'created_at']
        read_only_fields = ['user', 'created_at']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


# Serializadores para mensajería privada
class ConversationSerializer(serializers.ModelSerializer):
    participants = UserSerializer(many=True, read_only=True)
    created_by = UserSerializer(read_only=True)
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    participant_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )

    class Meta:
        model = Conversation
        fields = [
            'id', 'participants', 'participant_ids', 'subject', 'is_group',
            'group_name', 'group_description', 'created_by', 'last_message',
            'unread_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']

    def get_last_message(self, obj):
        last_msg = obj.last_message
        if last_msg:
            return {
                'id': last_msg.id,
                'content': last_msg.content[:100] + '...' if len(last_msg.content) > 100 else last_msg.content,
                'sender': last_msg.sender.username,
                'created_at': last_msg.created_at,
                'message_type': last_msg.message_type
            }
        return None

    def get_unread_count(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.unread_count_for_user(request.user)
        return 0

    def create(self, validated_data):
        participant_ids = validated_data.pop('participant_ids', [])
        validated_data['created_by'] = self.context['request'].user

        conversation = super().create(validated_data)

        # Agregar participantes
        conversation.participants.add(self.context['request'].user)
        for participant_id in participant_ids:
            conversation.participants.add(participant_id)

        return conversation


class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    reactions = serializers.SerializerMethodField()
    read_by_users = serializers.SerializerMethodField()
    is_read_by_current_user = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = [
            'id', 'conversation', 'sender', 'content', 'message_type',
            'file_url', 'file_name', 'file_size', 'is_edited', 'edited_at',
            'reactions', 'read_by_users', 'is_read_by_current_user', 'created_at'
        ]
        read_only_fields = ['sender', 'created_at', 'edited_at']

    def get_reactions(self, obj):
        reactions = {}
        for reaction in obj.reactions.all():
            if reaction.reaction not in reactions:
                reactions[reaction.reaction] = []
            reactions[reaction.reaction].append({
                'user': reaction.user.username,
                'user_id': reaction.user.id
            })
        return reactions

    def get_read_by_users(self, obj):
        return [read.user.username for read in obj.read_by.all()]

    def get_is_read_by_current_user(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.read_by.filter(user=request.user).exists()
        return False

    def create(self, validated_data):
        validated_data['sender'] = self.context['request'].user
        message = super().create(validated_data)

        # Marcar como leído para el remitente
        message.mark_as_read_for_user(message.sender)

        return message


class MessageCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['conversation', 'content', 'message_type', 'file_url', 'file_name', 'file_size']

    def create(self, validated_data):
        validated_data['sender'] = self.context['request'].user
        return super().create(validated_data)


class MessageReactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = MessageReaction
        fields = ['id', 'message', 'reaction', 'user', 'created_at']
        read_only_fields = ['user', 'created_at']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class TypingIndicatorSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = TypingIndicator
        fields = ['id', 'conversation', 'user', 'timestamp']
        read_only_fields = ['user', 'timestamp']