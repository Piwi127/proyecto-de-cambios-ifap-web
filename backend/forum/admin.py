from django.contrib import admin
from .models import ForumCategory, ForumTopic, ForumReply, ForumLike


@admin.register(ForumCategory)
class ForumCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'course', 'topics_count', 'is_active', 'created_at']
    list_filter = ['is_active', 'course', 'created_at']
    search_fields = ['name', 'description']
    readonly_fields = ['created_at', 'updated_at']
    
    def topics_count(self, obj):
        return obj.topics_count
    topics_count.short_description = 'Número de temas'


@admin.register(ForumTopic)
class ForumTopicAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'author', 'replies_count', 'views_count', 'is_pinned', 'is_locked', 'is_active', 'created_at']
    list_filter = ['is_pinned', 'is_locked', 'is_active', 'category', 'created_at']
    search_fields = ['title', 'content', 'author__username']
    readonly_fields = ['views_count', 'created_at', 'updated_at']
    raw_id_fields = ['author']
    
    def replies_count(self, obj):
        return obj.replies_count
    replies_count.short_description = 'Número de respuestas'


@admin.register(ForumReply)
class ForumReplyAdmin(admin.ModelAdmin):
    list_display = ['topic', 'author', 'parent_reply', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at', 'topic__category']
    search_fields = ['content', 'author__username', 'topic__title']
    readonly_fields = ['created_at', 'updated_at']
    raw_id_fields = ['author', 'topic', 'parent_reply']


@admin.register(ForumLike)
class ForumLikeAdmin(admin.ModelAdmin):
    list_display = ['user', 'topic', 'reply', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__username', 'topic__title']
    readonly_fields = ['created_at']
    raw_id_fields = ['user', 'topic', 'reply']
