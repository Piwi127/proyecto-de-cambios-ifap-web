from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count, Sum
from django.http import HttpResponse, Http404
from django.utils import timezone
from datetime import timedelta
import mimetypes

from .models import LibraryCategory, LibraryFile, LibraryAccess, LibraryDownload, LibraryFavorite
from .serializers import (
    LibraryCategorySerializer, LibraryFileSerializer, LibraryFileCreateSerializer,
    LibraryAccessSerializer, LibraryDownloadSerializer, LibraryFavoriteSerializer,
    LibraryStatsSerializer
)
from users.permissions import IsInstructorOrAdmin, IsOwnerOrInstructorOrAdmin

class LibraryCategoryViewSet(viewsets.ModelViewSet):
    queryset = LibraryCategory.objects.all()
    serializer_class = LibraryCategorySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsInstructorOrAdmin]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

class LibraryFileViewSet(viewsets.ModelViewSet):
    queryset = LibraryFile.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'course', 'visibility', 'file_type', 'is_featured']
    search_fields = ['title', 'description', 'tags']
    ordering_fields = ['title', 'created_at', 'download_count', 'file_size']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return LibraryFileCreateSerializer
        return LibraryFileSerializer
    
    def get_queryset(self):
        user = self.request.user
        queryset = LibraryFile.objects.select_related('uploaded_by', 'category', 'course')
        
        # Filtrar por permisos de visibilidad
        if user.is_superuser:
            return queryset
        
        # Construir filtros de visibilidad
        visibility_filter = Q(visibility='public')
        
        if user.is_student:
            visibility_filter |= Q(visibility='students')
            # Archivos de cursos en los que está inscrito
            visibility_filter |= Q(
                visibility='course',
                course__in=user.courses_enrolled.all()
            )
        elif user.is_instructor:
            visibility_filter |= Q(visibility='instructors')
            # Archivos de cursos que enseña
            visibility_filter |= Q(
                visibility='course',
                course__in=user.courses_taught.all()
            )
        
        # Archivos propios
        visibility_filter |= Q(uploaded_by=user)
        
        # Archivos con permisos específicos
        visibility_filter |= Q(
            access_permissions__user=user,
            access_permissions__can_view=True
        )
        
        return queryset.filter(visibility_filter).distinct()
    
    def get_permissions(self):
        if self.action in ['create']:
            permission_classes = [IsAuthenticated]
        elif self.action in ['update', 'partial_update', 'destroy']:
            permission_classes = [IsOwnerOrInstructorOrAdmin]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        """Descargar archivo"""
        file_obj = self.get_object()
        
        # Verificar permisos de descarga
        serializer = LibraryFileSerializer(file_obj, context={'request': request})
        if not serializer.data.get('can_download', False):
            return Response(
                {'error': 'No tienes permisos para descargar este archivo'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            # Registrar descarga
            LibraryDownload.objects.create(
                file=file_obj,
                user=request.user,
                ip_address=request.META.get('REMOTE_ADDR')
            )
            
            # Incrementar contador
            file_obj.download_count += 1
            file_obj.save(update_fields=['download_count'])
            
            # Preparar respuesta de descarga
            response = HttpResponse(
                file_obj.file.read(),
                content_type=mimetypes.guess_type(file_obj.file.name)[0] or 'application/octet-stream'
            )
            response['Content-Disposition'] = f'attachment; filename="{file_obj.file.name}"'
            response['Content-Length'] = file_obj.file_size
            
            return response
            
        except Exception as e:
            return Response(
                {'error': 'Error al descargar el archivo'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post', 'delete'])
    def favorite(self, request, pk=None):
        """Agregar/quitar de favoritos"""
        file_obj = self.get_object()
        
        if request.method == 'POST':
            favorite, created = LibraryFavorite.objects.get_or_create(
                user=request.user,
                file=file_obj
            )
            if created:
                return Response({'message': 'Archivo agregado a favoritos'})
            else:
                return Response({'message': 'El archivo ya está en favoritos'})
        
        elif request.method == 'DELETE':
            try:
                favorite = LibraryFavorite.objects.get(
                    user=request.user,
                    file=file_obj
                )
                favorite.delete()
                return Response({'message': 'Archivo removido de favoritos'})
            except LibraryFavorite.DoesNotExist:
                return Response(
                    {'error': 'El archivo no está en favoritos'},
                    status=status.HTTP_404_NOT_FOUND
                )
    
    @action(detail=False, methods=['get'])
    def my_files(self, request):
        """Archivos subidos por el usuario actual"""
        files = self.get_queryset().filter(uploaded_by=request.user)
        page = self.paginate_queryset(files)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(files, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def favorites(self, request):
        """Archivos favoritos del usuario"""
        favorites = LibraryFavorite.objects.filter(user=request.user)
        files = [fav.file for fav in favorites]
        
        page = self.paginate_queryset(files)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(files, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def recent(self, request):
        """Archivos recientes (últimos 30 días)"""
        recent_date = timezone.now() - timedelta(days=30)
        files = self.get_queryset().filter(created_at__gte=recent_date)
        
        page = self.paginate_queryset(files)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(files, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def popular(self, request):
        """Archivos más descargados"""
        files = self.get_queryset().filter(download_count__gt=0).order_by('-download_count')[:10]
        serializer = self.get_serializer(files, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Estadísticas de la biblioteca"""
        if not request.user.role in ['instructor', 'admin']:
            return Response(
                {'error': 'No tienes permisos para ver las estadísticas'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        queryset = self.get_queryset()
        recent_date = timezone.now() - timedelta(days=30)
        
        stats = {
            'total_files': queryset.count(),
            'total_downloads': queryset.aggregate(Sum('download_count'))['download_count__sum'] or 0,
            'total_size': self._format_size(queryset.aggregate(Sum('file_size'))['file_size__sum'] or 0),
            'recent_uploads': queryset.filter(created_at__gte=recent_date).count(),
            'popular_files': LibraryFileSerializer(
                queryset.order_by('-download_count')[:5],
                many=True,
                context={'request': request}
            ).data,
            'categories_stats': list(
                LibraryCategory.objects.annotate(
                    file_count=Count('files')
                ).values('name', 'file_count')
            )
        }
        
        serializer = LibraryStatsSerializer(stats)
        return Response(serializer.data)
    
    def _format_size(self, size_bytes):
        """Formatear tamaño en bytes a formato legible"""
        if size_bytes < 1024:
            return f"{size_bytes} B"
        elif size_bytes < 1024 * 1024:
            return f"{size_bytes / 1024:.1f} KB"
        elif size_bytes < 1024 * 1024 * 1024:
            return f"{size_bytes / (1024 * 1024):.1f} MB"
        else:
            return f"{size_bytes / (1024 * 1024 * 1024):.1f} GB"

class LibraryAccessViewSet(viewsets.ModelViewSet):
    queryset = LibraryAccess.objects.all()
    serializer_class = LibraryAccessSerializer
    permission_classes = [IsInstructorOrAdmin]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['file', 'user', 'can_view', 'can_download']
    
    def perform_create(self, serializer):
        serializer.save(granted_by=self.request.user)

class LibraryDownloadViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = LibraryDownload.objects.all()
    serializer_class = LibraryDownloadSerializer
    permission_classes = [IsInstructorOrAdmin]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['file', 'user']
    ordering_fields = ['downloaded_at']
    ordering = ['-downloaded_at']

class LibraryFavoriteViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = LibraryFavoriteSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return LibraryFavorite.objects.filter(user=self.request.user)
