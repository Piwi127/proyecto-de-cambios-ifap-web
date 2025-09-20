from django.contrib import admin
from .models import LibraryCategory, LibraryFile, LibraryAccess, LibraryDownload, LibraryFavorite

@admin.register(LibraryCategory)
class LibraryCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'parent', 'file_count', 'created_at']
    list_filter = ['parent', 'created_at']
    search_fields = ['name', 'description']
    ordering = ['name']
    
    def file_count(self, obj):
        return obj.files.count()
    file_count.short_description = 'Archivos'

@admin.register(LibraryFile)
class LibraryFileAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'uploaded_by', 'visibility', 'file_type', 
                   'formatted_file_size', 'download_count', 'is_featured', 'created_at']
    list_filter = ['category', 'visibility', 'file_type', 'is_featured', 'created_at', 'uploaded_by']
    search_fields = ['title', 'description', 'tags']
    readonly_fields = ['file_size', 'file_type', 'download_count', 'file_extension', 'formatted_file_size']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Información básica', {
            'fields': ('title', 'description', 'file', 'tags')
        }),
        ('Organización', {
            'fields': ('category', 'course')
        }),
        ('Permisos', {
            'fields': ('visibility', 'is_featured')
        }),
        ('Información del archivo', {
            'fields': ('file_size', 'file_type', 'file_extension', 'formatted_file_size', 'download_count'),
            'classes': ('collapse',)
        }),
    )
    
    def save_model(self, request, obj, form, change):
        if not change:  # Si es un nuevo objeto
            obj.uploaded_by = request.user
        super().save_model(request, obj, form, change)

@admin.register(LibraryAccess)
class LibraryAccessAdmin(admin.ModelAdmin):
    list_display = ['file', 'user', 'can_view', 'can_download', 'granted_by', 'granted_at']
    list_filter = ['can_view', 'can_download', 'granted_at', 'granted_by']
    search_fields = ['file__title', 'user__username', 'user__email']
    ordering = ['-granted_at']
    
    def save_model(self, request, obj, form, change):
        if not change:  # Si es un nuevo objeto
            obj.granted_by = request.user
        super().save_model(request, obj, form, change)

@admin.register(LibraryDownload)
class LibraryDownloadAdmin(admin.ModelAdmin):
    list_display = ['file', 'user', 'downloaded_at', 'ip_address']
    list_filter = ['downloaded_at', 'file__category']
    search_fields = ['file__title', 'user__username', 'user__email']
    readonly_fields = ['file', 'user', 'downloaded_at', 'ip_address']
    ordering = ['-downloaded_at']
    
    def has_add_permission(self, request):
        return False  # No permitir agregar manualmente
    
    def has_change_permission(self, request, obj=None):
        return False  # No permitir editar

@admin.register(LibraryFavorite)
class LibraryFavoriteAdmin(admin.ModelAdmin):
    list_display = ['user', 'file', 'added_at']
    list_filter = ['added_at', 'file__category']
    search_fields = ['file__title', 'user__username', 'user__email']
    readonly_fields = ['added_at']
    ordering = ['-added_at']
