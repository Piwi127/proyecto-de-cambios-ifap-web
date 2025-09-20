from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .models import ForumCategory, ForumTopic, ForumReply, ForumLike
from .serializers import (
    ForumCategorySerializer, ForumTopicListSerializer, 
    ForumTopicDetailSerializer, ForumTopicCreateSerializer,
    ForumReplySerializer, ForumLikeSerializer
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
