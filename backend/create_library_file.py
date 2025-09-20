import os
import django
from django.conf import settings

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ifap_backend.settings')
django.setup()

from django.core.files.base import ContentFile
from library.models import LibraryFile
from users.models import User

# Get or create a user with id=1
try:
    user = User.objects.get(id=1)
except User.DoesNotExist:
    user = User.objects.create_user(username='testuser', email='test@example.com', password='testpassword', id=1)
    user.save()

file_path = '/home/jorge/pagina web nueva ifap dos/backend/library/documento_archivistico_peru.txt'

# Check if the file already exists in the LibraryFile model to avoid duplicates
if not LibraryFile.objects.filter(file__icontains='documento_archivistico_peru.txt').exists():
    with open(file_path, 'rb') as f:
        file_content = f.read()

    library_file = LibraryFile.objects.create(
        title='Guía de Preservación Digital para Archivos Históricos Peruanos',
        description='Documento sobre la preservación digital de archivos históricos en Perú.',
        visibility='public',
        uploaded_by=user,
        granted_by=user,
    )
    library_file.file.save('documento_archivistico_peru.txt', ContentFile(file_content))
    library_file.save()
    print('Archivo de biblioteca creado exitosamente.')
else:
    print('El archivo ya existe en la biblioteca.')