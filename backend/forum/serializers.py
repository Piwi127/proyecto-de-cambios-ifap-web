from rest_framework import serializers
from .models import ForumCategory, ForumTopic, ForumReply, ForumLike
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