from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.shortcuts import get_object_or_404
from django.db.models import Q, Count, Max
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import datetime

from .models import ChatRoom, Message, MessageRead, UserChatStatus, ChatNotification
from .serializers import (
    ChatRoomSerializer, ChatRoomCreateSerializer, MessageSerializer,
    MessageCreateSerializer, UserChatStatusSerializer, ChatNotificationSerializer
)
from courses.models import Course
from users.permissions import IsStudentOrHigher

User = get_user_model()


class MessagePagination(PageNumberPagination):
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 100


class ChatRoomViewSet(viewsets.ModelViewSet):
    serializer_class = ChatRoomSerializer
    permission_classes = [permissions.IsAuthenticated, IsStudentOrHigher]
    
    def get_queryset(self):
        user = self.request.user
        return ChatRoom.objects.filter(
            participants=user
        ).annotate(
            last_message_time=Max('messages__timestamp')
        ).order_by('-last_message_time', '-updated_at')
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ChatRoomCreateSerializer
        return ChatRoomSerializer
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['get'])
    def messages(self, request, pk=None):
        """Obtener mensajes de una sala de chat"""
        chat_room = self.get_object()
        
        # Verificar que el usuario sea participante
        if not chat_room.participants.filter(id=request.user.id).exists():
            return Response(
                {'error': 'No tienes acceso a esta sala de chat'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        messages = chat_room.messages.select_related('sender').prefetch_related('read_by__user')
        
        # Paginación
        paginator = MessagePagination()
        page = paginator.paginate_queryset(messages, request)
        
        if page is not None:
            serializer = MessageSerializer(page, many=True, context={'request': request})
            return paginator.get_paginated_response(serializer.data)
        
        serializer = MessageSerializer(messages, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def send_message(self, request, pk=None):
        """Enviar un mensaje a la sala de chat"""
        chat_room = self.get_object()
        
        # Verificar que el usuario sea participante
        if not chat_room.participants.filter(id=request.user.id).exists():
            return Response(
                {'error': 'No tienes acceso a esta sala de chat'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = MessageCreateSerializer(
            data=request.data,
            context={'request': request, 'chat_room_id': chat_room.id}
        )
        
        if serializer.is_valid():
            message = serializer.save()
            response_serializer = MessageSerializer(message, context={'request': request})
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def participants_status(self, request, pk=None):
        """Obtener el estado de los participantes de la sala"""
        chat_room = self.get_object()
        
        # Verificar que el usuario sea participante
        if not chat_room.participants.filter(id=request.user.id).exists():
            return Response(
                {'error': 'No tienes acceso a esta sala de chat'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        statuses = UserChatStatus.objects.filter(chat_room=chat_room)
        serializer = UserChatStatusSerializer(statuses, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def mark_messages_read(self, request, pk=None):
        """Marcar mensajes como leídos"""
        chat_room = self.get_object()
        
        # Verificar que el usuario sea participante
        if not chat_room.participants.filter(id=request.user.id).exists():
            return Response(
                {'error': 'No tienes acceso a esta sala de chat'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Obtener mensajes no leídos
        unread_messages = chat_room.messages.exclude(
            read_by__user=request.user
        )
        
        # Marcar como leídos
        for message in unread_messages:
            MessageRead.objects.get_or_create(
                message=message,
                user=request.user,
                defaults={'read_at': timezone.now()}
            )
        
        return Response({'status': 'Messages marked as read'})
    
    @action(detail=False, methods=['get'])
    def course_rooms(self, request):
        """Obtener salas de chat de los cursos del usuario"""
        user = request.user
        
        # Obtener cursos donde el usuario es instructor o estudiante
        if user.is_instructor:
            courses = Course.objects.filter(instructor=user)
        elif user.is_student:
            courses = Course.objects.filter(students=user)
        else:
            courses = Course.objects.none()
        
        # Obtener salas de chat de estos cursos
        chat_rooms = ChatRoom.objects.filter(
            course__in=courses,
            room_type='course'
        ).annotate(
            last_message_time=Max('messages__timestamp')
        ).order_by('-last_message_time', '-updated_at')
        
        serializer = ChatRoomSerializer(chat_rooms, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def create_course_chat(self, request):
        """Crear una sala de chat para un curso"""
        course_id = request.data.get('course_id')
        if not course_id:
            return Response(
                {'error': 'course_id es requerido'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        course = get_object_or_404(Course, id=course_id)
        
        # Verificar permisos (solo instructor puede crear chat del curso)
        if course.instructor != request.user:
            return Response(
                {'error': 'Solo el instructor puede crear el chat del curso'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Verificar si ya existe una sala para este curso
        existing_room = ChatRoom.objects.filter(course=course, room_type='course').first()
        if existing_room:
            serializer = ChatRoomSerializer(existing_room, context={'request': request})
            return Response(serializer.data)
        
        # Crear nueva sala
        chat_room = ChatRoom.objects.create(
            name=f'Chat del curso: {course.title}',
            description=f'Chat grupal para el curso {course.title}',
            room_type='course',
            course=course,
            created_by=request.user
        )
        
        # Agregar participantes (instructor + estudiantes)
        participants = [course.instructor]
        participants.extend(course.students.all())
        chat_room.participants.set(participants)
        
        serializer = ChatRoomSerializer(chat_room, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class MessageViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        return Message.objects.filter(
            chat_room__participants=user
        ).select_related('sender', 'chat_room').prefetch_related('read_by__user')
    
    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        """Marcar un mensaje específico como leído"""
        message = self.get_object()
        
        MessageRead.objects.get_or_create(
            message=message,
            user=request.user,
            defaults={'read_at': timezone.now()}
        )
        
        return Response({'status': 'Message marked as read'})


class ChatNotificationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ChatNotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return ChatNotification.objects.filter(
            user=self.request.user
        ).select_related('chat_room', 'message__sender').order_by('-created_at')
    
    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        """Obtener el número de notificaciones no leídas"""
        count = self.get_queryset().filter(is_read=False).count()
        return Response({'unread_count': count})
    
    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        """Marcar todas las notificaciones como leídas"""
        self.get_queryset().filter(is_read=False).update(is_read=True)
        return Response({'status': 'All notifications marked as read'})
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Marcar una notificación específica como leída"""
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({'status': 'Notification marked as read'})
