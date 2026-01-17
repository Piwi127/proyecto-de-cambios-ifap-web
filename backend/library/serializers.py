from rest_framework import serializers
from .models import LibraryCategory, LibraryFile, LibraryAccess, LibraryDownload, LibraryFavorite
from users.serializers import UserSerializer
from courses.serializers import CourseSerializer

class LibraryCategorySerializer(serializers.ModelSerializer):
    subcategories = serializers.SerializerMethodField()
    file_count = serializers.SerializerMethodField()
    
    class Meta:
        model = LibraryCategory
        fields = ['id', 'name', 'description', 'parent', 'subcategories', 
                 'file_count', 'created_at', 'updated_at']
    
    def get_subcategories(self, obj):
        if obj.subcategories.exists():
            return LibraryCategorySerializer(obj.subcategories.all(), many=True).data
        return []
    
    def get_file_count(self, obj):
        return obj.files.count()

class LibraryFileSerializer(serializers.ModelSerializer):
    uploaded_by = UserSerializer(read_only=True)
    category = LibraryCategorySerializer(read_only=True)
    course = CourseSerializer(read_only=True)
    file_extension = serializers.ReadOnlyField()
    formatted_file_size = serializers.ReadOnlyField()
    is_favorited = serializers.SerializerMethodField()
    can_download = serializers.SerializerMethodField()
    
    class Meta:
        model = LibraryFile
        fields = ['id', 'title', 'description', 'file', 'category', 'course',
                 'uploaded_by', 'visibility', 'file_size', 'file_type', 
                 'download_count', 'is_featured', 'tags', 'file_extension',
                 'formatted_file_size', 'is_favorited', 'can_download',
                 'created_at', 'updated_at']
        read_only_fields = ['file_size', 'file_type', 'download_count', 'uploaded_by']
    
    def get_is_favorited(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return LibraryFavorite.objects.filter(user=request.user, file=obj).exists()
        return False
    
    def get_can_download(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            user = request.user
            
            # Administradores pueden descargar todo
            if user.is_superuser:
                return True
            
            # Verificar visibilidad
            if obj.visibility == 'public':
                return True
            elif obj.visibility == 'students' and user.is_student:
                return True
            elif obj.visibility == 'instructors' and (user.is_instructor or user.is_superuser):
                return True
            elif obj.visibility == 'course' and obj.course:
                # Verificar si el usuario está inscrito en el curso
                if user.is_student:
                    return user.courses_enrolled.filter(id=obj.course.id).exists()
                elif user.is_instructor:
                    return user.courses_taught.filter(id=obj.course.id).exists()
            elif obj.visibility == 'private':
                # Solo el propietario o usuarios con permisos específicos
                if obj.uploaded_by == user:
                    return True
                return LibraryAccess.objects.filter(
                    file=obj, user=user, can_download=True
                ).exists()
        
        return False

class LibraryFileCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = LibraryFile
        fields = ['title', 'description', 'file', 'category', 'course',
                 'visibility', 'is_featured', 'tags']
    
    def create(self, validated_data):
        validated_data['uploaded_by'] = self.context['request'].user
        return super().create(validated_data)

class LibraryAccessSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    file = LibraryFileSerializer(read_only=True)
    granted_by = UserSerializer(read_only=True)
    
    class Meta:
        model = LibraryAccess
        fields = ['id', 'file', 'user', 'can_view', 'can_download', 
                 'granted_by', 'granted_at']

class LibraryDownloadSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    file = LibraryFileSerializer(read_only=True)
    
    class Meta:
        model = LibraryDownload
        fields = ['id', 'file', 'user', 'downloaded_at', 'ip_address']

class LibraryFavoriteSerializer(serializers.ModelSerializer):
    file = LibraryFileSerializer(read_only=True)
    
    class Meta:
        model = LibraryFavorite
        fields = ['id', 'file', 'added_at']

class LibraryStatsSerializer(serializers.Serializer):
    total_files = serializers.IntegerField()
    total_downloads = serializers.IntegerField()
    total_size = serializers.CharField()
    recent_uploads = serializers.IntegerField()
    popular_files = LibraryFileSerializer(many=True)
    categories_stats = serializers.ListField()
