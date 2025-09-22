from django.contrib import admin
from .models import ChatRoom, Message, MessageRead, UserChatStatus, ChatNotification


@admin.register(ChatRoom)
class ChatRoomAdmin(admin.ModelAdmin):
    list_display = ['name', 'room_type', 'course', 'created_by', 'created_at', 'is_active']
    list_filter = ['room_type', 'is_active', 'created_at']
    search_fields = ['name', 'description', 'created_by__username']
    filter_horizontal = ['participants']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Información Básica', {
            'fields': ('name', 'description', 'room_type', 'is_active')
        }),
        ('Asociaciones', {
            'fields': ('course', 'created_by', 'participants')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ['sender', 'chat_room', 'content_preview', 'message_type', 'created_at', 'is_deleted']
    list_filter = ['message_type', 'is_deleted', 'is_edited', 'created_at']
    search_fields = ['content', 'sender__username', 'chat_room__name']
    readonly_fields = ['created_at', 'updated_at']
    
    def content_preview(self, obj):
        return obj.content[:50] + ('...' if len(obj.content) > 50 else '')
    content_preview.short_description = 'Contenido'
    
    fieldsets = (
        ('Mensaje', {
            'fields': ('chat_room', 'sender', 'content', 'message_type')
        }),
        ('Estado', {
            'fields': ('is_edited', 'is_deleted', 'reply_to')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(MessageRead)
class MessageReadAdmin(admin.ModelAdmin):
    list_display = ['user', 'message_preview', 'read_at']
    list_filter = ['read_at']
    search_fields = ['user__username', 'message__content']
    readonly_fields = ['read_at']
    
    def message_preview(self, obj):
        return obj.message.content[:30] + ('...' if len(obj.message.content) > 30 else '')
    message_preview.short_description = 'Mensaje'


@admin.register(UserChatStatus)
class UserChatStatusAdmin(admin.ModelAdmin):
    list_display = ['user', 'chat_room', 'status', 'is_typing', 'last_seen']
    list_filter = ['status', 'is_typing', 'last_seen']
    search_fields = ['user__username', 'chat_room__name']
    readonly_fields = ['last_seen', 'typing_started_at']
    
    fieldsets = (
        ('Usuario y Sala', {
            'fields': ('user', 'chat_room')
        }),
        ('Estado', {
            'fields': ('status', 'is_typing', 'typing_started_at')
        }),
        ('Actividad', {
            'fields': ('last_seen', 'last_read_at')
        }),
    )


@admin.register(ChatNotification)
class ChatNotificationAdmin(admin.ModelAdmin):
    list_display = ['user', 'title', 'notification_type', 'is_read', 'created_at']
    list_filter = ['notification_type', 'is_read', 'created_at']
    search_fields = ['user__username', 'title', 'content']
    readonly_fields = ['created_at']
    
    fieldsets = (
        ('Notificación', {
            'fields': ('user', 'chat_room', 'notification_type', 'title', 'content')
        }),
        ('Estado', {
            'fields': ('is_read', 'message')
        }),
        ('Timestamp', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
