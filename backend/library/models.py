from django.db import models
from django.contrib.auth import get_user_model
from courses.models import Course
import os

User = get_user_model()

class LibraryCategory(models.Model):
    """Categorías para organizar los archivos de la biblioteca"""
    name = models.CharField(max_length=100, verbose_name="Nombre")
    description = models.TextField(blank=True, verbose_name="Descripción")
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, 
                              related_name='subcategories', verbose_name="Categoría padre")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Categoría de Biblioteca"
        verbose_name_plural = "Categorías de Biblioteca"
        ordering = ['name']
    
    def __str__(self):
        if self.parent:
            return f"{self.parent.name} > {self.name}"
        return self.name

class LibraryFile(models.Model):
    """Archivos almacenados en la biblioteca"""
    VISIBILITY_CHOICES = [
        ('public', 'Público'),
        ('students', 'Solo Estudiantes'),
        ('instructors', 'Solo Instructores'),
        ('course', 'Solo Curso Específico'),
        ('private', 'Privado'),
    ]
    
    title = models.CharField(max_length=200, verbose_name="Título")
    description = models.TextField(blank=True, verbose_name="Descripción")
    file = models.FileField(upload_to='library/%Y/%m/', verbose_name="Archivo")
    category = models.ForeignKey(LibraryCategory, on_delete=models.SET_NULL, 
                                null=True, blank=True, related_name='files',
                                verbose_name="Categoría")
    course = models.ForeignKey(Course, on_delete=models.CASCADE, null=True, blank=True,
                              related_name='library_files', verbose_name="Curso")
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE, 
                                   related_name='uploaded_files',
                                   verbose_name="Subido por")
    visibility = models.CharField(max_length=20, choices=VISIBILITY_CHOICES, 
                                 default='public', verbose_name="Visibilidad")
    file_size = models.BigIntegerField(default=0, verbose_name="Tamaño del archivo")
    file_type = models.CharField(max_length=50, blank=True, verbose_name="Tipo de archivo")
    download_count = models.PositiveIntegerField(default=0, verbose_name="Descargas")
    is_featured = models.BooleanField(default=False, verbose_name="Destacado")
    tags = models.CharField(max_length=500, blank=True, 
                           help_text="Etiquetas separadas por comas",
                           verbose_name="Etiquetas")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Archivo de Biblioteca"
        verbose_name_plural = "Archivos de Biblioteca"
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        if self.file:
            self.file_size = self.file.size
            self.file_type = os.path.splitext(self.file.name)[1].lower()
        super().save(*args, **kwargs)
    
    @property
    def file_extension(self):
        return os.path.splitext(self.file.name)[1].lower() if self.file else ''
    
    @property
    def formatted_file_size(self):
        """Retorna el tamaño del archivo en formato legible"""
        if self.file_size < 1024:
            return f"{self.file_size} B"
        elif self.file_size < 1024 * 1024:
            return f"{self.file_size / 1024:.1f} KB"
        elif self.file_size < 1024 * 1024 * 1024:
            return f"{self.file_size / (1024 * 1024):.1f} MB"
        else:
            return f"{self.file_size / (1024 * 1024 * 1024):.1f} GB"

class LibraryAccess(models.Model):
    """Control de acceso específico para archivos"""
    file = models.ForeignKey(LibraryFile, on_delete=models.CASCADE, 
                            related_name='access_permissions')
    user = models.ForeignKey(User, on_delete=models.CASCADE, 
                            related_name='library_permissions')
    can_view = models.BooleanField(default=True, verbose_name="Puede ver")
    can_download = models.BooleanField(default=True, verbose_name="Puede descargar")
    granted_by = models.ForeignKey(User, on_delete=models.CASCADE, 
                                  related_name='granted_permissions',
                                  verbose_name="Otorgado por")
    granted_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Acceso a Biblioteca"
        verbose_name_plural = "Accesos a Biblioteca"
        unique_together = ['file', 'user']
    
    def __str__(self):
        return f"{self.user.username} - {self.file.title}"

class LibraryDownload(models.Model):
    """Registro de descargas de archivos"""
    file = models.ForeignKey(LibraryFile, on_delete=models.CASCADE, 
                            related_name='downloads')
    user = models.ForeignKey(User, on_delete=models.CASCADE, 
                            related_name='library_downloads')
    downloaded_at = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    
    class Meta:
        verbose_name = "Descarga de Biblioteca"
        verbose_name_plural = "Descargas de Biblioteca"
        ordering = ['-downloaded_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.file.title} - {self.downloaded_at}"

class LibraryFavorite(models.Model):
    """Archivos favoritos de los usuarios"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, 
                            related_name='library_favorites')
    file = models.ForeignKey(LibraryFile, on_delete=models.CASCADE, 
                            related_name='favorited_by')
    added_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Favorito de Biblioteca"
        verbose_name_plural = "Favoritos de Biblioteca"
        unique_together = ['user', 'file']
        ordering = ['-added_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.file.title}"
