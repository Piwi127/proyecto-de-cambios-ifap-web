from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .models import (
    ForumCategory, ForumTopic, ForumReply, ForumLike,
    LessonComment, LessonCommentLike, Conversation, Message,
    MessageRead, MessageReaction, TypingIndicator
)
from .serializers import (
    ForumCategorySerializer, ForumTopicListSerializer, 
    ForumTopicDetailSerializer, ForumTopicCreateSerializer,
    ForumReplySerializer, ForumLikeSerializer,
    LessonCommentSerializer, LessonCommentCreateSerializer,
    LessonCommentLikeSerializer, ConversationSerializer,
    MessageSerializer, MessageCreateSerializer,
    MessageReactionSerializer, TypingIndicatorSerializer
)


class ForumCategoryViewSet(viewsets.ModelViewSet):
    """ViewSet para categorías del foro"""
    queryset = ForumCategory.objects.filter(is_active=True)
    serializer_class = ForumCategorySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        course_id = self.request.query_params.get('course', None)
        if course_id:
            queryset = queryset.filter(course_id=course_id)
        return queryset.order_by('name')


class ForumTopicViewSet(viewsets.ModelViewSet):
    """ViewSet para temas del foro"""
    queryset = ForumTopic.objects.filter(is_active=True)
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ForumTopicCreateSerializer
        elif self.action == 'retrieve':
            return ForumTopicDetailSerializer
        return ForumTopicListSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        category_id = self.request.query_params.get('category', None)
        search = self.request.query_params.get('search', None)
        
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | 
                Q(content__icontains=search) |
                Q(author__username__icontains=search)
            )
        
        return queryset.order_by('-is_pinned', '-updated_at')
    
    def retrieve(self, request, *args, **kwargs):
        """Incrementar vistas al obtener un tema"""
        instance = self.get_object()
        instance.increment_views()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
    
    def perform_update(self, serializer):
        # Solo el autor o un instructor puede editar
        topic = self.get_object()
        if topic.author != self.request.user and not self.request.user.is_instructor:
            return Response(
                {'error': 'No tienes permisos para editar este tema'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        serializer.save()
    
    @action(detail=True, methods=['post'])
    def toggle_like(self, request, pk=None):
        """Alternar like en un tema"""
        topic = self.get_object()
        like, created = ForumLike.objects.get_or_create(
            user=request.user,
            topic=topic,
            defaults={'topic': topic}
        )
        
        if not created:
            like.delete()
            return Response({'liked': False, 'likes_count': topic.likes.count()})
        
        return Response({'liked': True, 'likes_count': topic.likes.count()})
    
    @action(detail=True, methods=['post'])
    def toggle_pin(self, request, pk=None):
        """Fijar/desfijar tema (solo instructores)"""
        if not request.user.is_instructor:
            return Response(
                {'error': 'Solo los instructores pueden fijar temas'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        topic = self.get_object()
        topic.is_pinned = not topic.is_pinned
        topic.save()
        
        return Response({
            'pinned': topic.is_pinned,
            'message': f'Tema {"fijado" if topic.is_pinned else "desfijado"} exitosamente'
        })
    
    @action(detail=True, methods=['post'])
    def toggle_lock(self, request, pk=None):
        """Bloquear/desbloquear tema (solo instructores)"""
        if not request.user.is_instructor:
            return Response(
                {'error': 'Solo los instructores pueden bloquear temas'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        topic = self.get_object()
        topic.is_locked = not topic.is_locked
        topic.save()
        
        return Response({
            'locked': topic.is_locked,
            'message': f'Tema {"bloqueado" if topic.is_locked else "desbloqueado"} exitosamente'
        })


class ForumReplyViewSet(viewsets.ModelViewSet):
    """ViewSet para respuestas del foro"""
    queryset = ForumReply.objects.filter(is_active=True)
    serializer_class = ForumReplySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        topic_id = self.request.query_params.get('topic', None)
        
        if topic_id:
            # Solo respuestas principales (sin parent_reply)
            queryset = queryset.filter(topic_id=topic_id, parent_reply__isnull=True)
        
        return queryset.order_by('created_at')
    
    def perform_create(self, serializer):
        # Verificar que el tema no esté bloqueado
        topic = serializer.validated_data['topic']
        if topic.is_locked and not self.request.user.is_instructor:
            return Response(
                {'error': 'No puedes responder en un tema bloqueado'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer.save(author=self.request.user)
    
    def perform_update(self, serializer):
        # Solo el autor puede editar su respuesta
        reply = self.get_object()
        if reply.author != self.request.user:
            return Response(
                {'error': 'No tienes permisos para editar esta respuesta'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        serializer.save()
    
    @action(detail=True, methods=['post'])
    def toggle_like(self, request, pk=None):
        """Alternar like en una respuesta"""
        reply = self.get_object()
        like, created = ForumLike.objects.get_or_create(
            user=request.user,
            reply=reply,
            defaults={'reply': reply}
        )
        
        if not created:
            like.delete()
            return Response({'liked': False, 'likes_count': reply.likes.count()})
        
        return Response({'liked': True, 'likes_count': reply.likes.count()})


class ForumStatsView(viewsets.ViewSet):
    """Vista para estadísticas del foro"""
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def overview(self, request):
        """Estadísticas generales del foro"""
        total_categories = ForumCategory.objects.filter(is_active=True).count()
        total_topics = ForumTopic.objects.filter(is_active=True).count()
        total_replies = ForumReply.objects.filter(is_active=True).count()
        
        # Temas más populares (por vistas)
        popular_topics = ForumTopic.objects.filter(is_active=True).order_by('-views_count')[:5]
        popular_topics_data = ForumTopicListSerializer(
            popular_topics, 
            many=True, 
            context={'request': request}
        ).data
        
        # Temas recientes
        recent_topics = ForumTopic.objects.filter(is_active=True).order_by('-created_at')[:5]
        recent_topics_data = ForumTopicListSerializer(
            recent_topics, 
            many=True, 
            context={'request': request}
        ).data
        
        return Response({
            'total_categories': total_categories,
            'total_topics': total_topics,
            'total_replies': total_replies,
            'popular_topics': popular_topics_data,
            'recent_topics': recent_topics_data
        })
    
    @action(detail=False, methods=['get'])
    def user_stats(self, request):
        """Estadísticas del usuario actual"""
        user = request.user
        user_topics = ForumTopic.objects.filter(author=user, is_active=True).count()
        user_replies = ForumReply.objects.filter(author=user, is_active=True).count()
        
        # Temas del usuario
        my_topics = ForumTopic.objects.filter(author=user, is_active=True).order_by('-created_at')[:5]
        my_topics_data = ForumTopicListSerializer(
            my_topics, 
            many=True, 
            context={'request': request}
        ).data
        
        return Response({
            'user_topics_count': user_topics,
            'user_replies_count': user_replies,
            'my_recent_topics': my_topics_data
        })


# Vistas para comentarios en lecciones
class LessonCommentViewSet(viewsets.ModelViewSet):
    """ViewSet para comentarios en lecciones"""
    queryset = LessonComment.objects.filter(is_active=True)
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'create':
            return LessonCommentCreateSerializer
        return LessonCommentSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        lesson_id = self.request.query_params.get('lesson', None)
        parent_id = self.request.query_params.get('parent', None)

        if lesson_id:
            queryset = queryset.filter(lesson_id=lesson_id)

        if parent_id:
            queryset = queryset.filter(parent_comment_id=parent_id)
        else:
            # Solo comentarios principales si no se especifica parent
            queryset = queryset.filter(parent_comment__isnull=True)

        return queryset.order_by('created_at')

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    def perform_update(self, serializer):
        # Solo el autor puede editar su comentario
        comment = self.get_object()
        if comment.author != self.request.user:
            return Response(
                {'error': 'No tienes permisos para editar este comentario'},
                status=status.HTTP_403_FORBIDDEN
            )
        serializer.save()

    @action(detail=True, methods=['post'])
    def toggle_like(self, request, pk=None):
        """Alternar like en un comentario"""
        comment = self.get_object()
        like, created = LessonCommentLike.objects.get_or_create(
            user=request.user,
            comment=comment
        )

        if not created:
            like.delete()
            return Response({'liked': False, 'likes_count': comment.likes.count()})

        return Response({'liked': True, 'likes_count': comment.likes.count()})

    @action(detail=True, methods=['delete'])
    def soft_delete(self, request, pk=None):
        """Eliminación suave de comentario (solo autor)"""
        comment = self.get_object()
        if comment.author != request.user:
            return Response(
                {'error': 'No tienes permisos para eliminar este comentario'},
                status=status.HTTP_403_FORBIDDEN
            )

        comment.is_active = False
        comment.save()
        return Response({'message': 'Comentario eliminado exitosamente'})


# Vistas para mensajería privada
class ConversationViewSet(viewsets.ModelViewSet):
    """ViewSet para conversaciones privadas"""
    queryset = Conversation.objects.all()
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(participants=self.request.user).order_by('-updated_at')

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['get'])
    def messages(self, request, pk=None):
        """Obtener mensajes de una conversación"""
        conversation = self.get_object()

        # Verificar que el usuario sea participante
        if request.user not in conversation.participants.all():
            return Response(
                {'error': 'No tienes acceso a esta conversación'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Marcar mensajes como leídos
        conversation.mark_messages_as_read_for_user(request.user)

        messages = conversation.messages.order_by('created_at')
        serializer = MessageSerializer(messages, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def add_participants(self, request, pk=None):
        """Agregar participantes a una conversación grupal"""
        conversation = self.get_object()
        user_ids = request.data.get('user_ids', [])

        if not conversation.is_group:
            return Response(
                {'error': 'Solo se pueden agregar participantes a conversaciones grupales'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Verificar permisos (solo creador puede agregar participantes)
        if conversation.created_by != request.user:
            return Response(
                {'error': 'Solo el creador puede agregar participantes'},
                status=status.HTTP_403_FORBIDDEN
            )

        for user_id in user_ids:
            conversation.participants.add(user_id)

        return Response({'message': 'Participantes agregados exitosamente'})

    @action(detail=True, methods=['post'])
    def remove_participants(self, request, pk=None):
        """Remover participantes de una conversación grupal"""
        conversation = self.get_object()
        user_ids = request.data.get('user_ids', [])

        if not conversation.is_group:
            return Response(
                {'error': 'Solo se pueden remover participantes de conversaciones grupales'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Verificar permisos
        if conversation.created_by != request.user and request.user.id not in user_ids:
            return Response(
                {'error': 'No tienes permisos para remover participantes'},
                status=status.HTTP_403_FORBIDDEN
            )

        for user_id in user_ids:
            if user_id != conversation.created_by.id:  # No se puede remover al creador
                conversation.participants.remove(user_id)

        return Response({'message': 'Participantes removidos exitosamente'})


class MessageViewSet(viewsets.ModelViewSet):
    """ViewSet para mensajes"""
    queryset = Message.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'create':
            return MessageCreateSerializer
        return MessageSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        conversation_id = self.request.query_params.get('conversation', None)

        if conversation_id:
            queryset = queryset.filter(conversation_id=conversation_id)

        return queryset.order_by('created_at')

    def perform_create(self, serializer):
        message = serializer.save(sender=self.request.user)

        # Marcar como leído para el remitente
        message.mark_as_read_for_user(self.request.user)

        # Actualizar timestamp de la conversación
        message.conversation.save()

    def perform_update(self, serializer):
        # Solo el remitente puede editar su mensaje
        message = self.get_object()
        if message.sender != self.request.user:
            return Response(
                {'error': 'No tienes permisos para editar este mensaje'},
                status=status.HTTP_403_FORBIDDEN
            )

        message.is_edited = True
        serializer.save()

    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        """Marcar mensaje como leído"""
        message = self.get_object()
        message.mark_as_read_for_user(request.user)
        return Response({'message': 'Mensaje marcado como leído'})

    @action(detail=True, methods=['post'])
    def add_reaction(self, request, pk=None):
        """Agregar reacción a un mensaje"""
        message = self.get_object()
        reaction = request.data.get('reaction')

        if not reaction:
            return Response(
                {'error': 'Debe especificar una reacción'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Crear o actualizar reacción
        reaction_obj, created = MessageReaction.objects.get_or_create(
            user=request.user,
            message=message,
            defaults={'reaction': reaction}
        )

        if not created:
            reaction_obj.reaction = reaction
            reaction_obj.save()

        return Response({'message': 'Reacción agregada exitosamente'})

    @action(detail=True, methods=['delete'])
    def remove_reaction(self, request, pk=None):
        """Remover reacción de un mensaje"""
        message = self.get_object()

        try:
            reaction = MessageReaction.objects.get(
                user=request.user,
                message=message
            )
            reaction.delete()
            return Response({'message': 'Reacción removida exitosamente'})
        except MessageReaction.DoesNotExist:
            return Response(
                {'error': 'No tienes una reacción en este mensaje'},
                status=status.HTTP_404_NOT_FOUND
            )


class TypingIndicatorViewSet(viewsets.ModelViewSet):
    """ViewSet para indicadores de escritura"""
    queryset = TypingIndicator.objects.all()
    serializer_class = TypingIndicatorSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        conversation_id = self.request.query_params.get('conversation', None)

        if conversation_id:
            queryset = queryset.filter(conversation_id=conversation_id)

        return queryset.order_by('-timestamp')

    @action(detail=False, methods=['post'])
    def start_typing(self, request):
        """Iniciar indicador de escritura"""
        conversation_id = request.data.get('conversation_id')

        if not conversation_id:
            return Response(
                {'error': 'Debe especificar el ID de la conversación'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Crear o actualizar indicador
        indicator, created = TypingIndicator.objects.get_or_create(
            user=request.user,
            conversation_id=conversation_id,
            defaults={'conversation_id': conversation_id}
        )

        if not created:
            indicator.save()  # Actualizar timestamp

        return Response({'message': 'Indicador de escritura iniciado'})

    @action(detail=False, methods=['post'])
    def stop_typing(self, request):
        """Detener indicador de escritura"""
        conversation_id = request.data.get('conversation_id')

        if not conversation_id:
            return Response(
                {'error': 'Debe especificar el ID de la conversación'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Eliminar indicador
        TypingIndicator.objects.filter(
            user=request.user,
            conversation_id=conversation_id
        ).delete()

        return Response({'message': 'Indicador de escritura detenido'})
