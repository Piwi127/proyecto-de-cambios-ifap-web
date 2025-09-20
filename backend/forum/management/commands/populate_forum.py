from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from forum.models import ForumCategory, ForumTopic, ForumReply
from courses.models import Course

User = get_user_model()

class Command(BaseCommand):
    help = 'Populate forum with sample data'

    def handle(self, *args, **options):
        self.stdout.write('Creating forum sample data...')

        # Crear categorías
        categories_data = [
            {
                'name': 'Archivística General',
                'description': 'Discusiones sobre principios y técnicas archivísticas'
            },
            {
                'name': 'Digitalización',
                'description': 'Temas relacionados con la digitalización de documentos'
            },
            {
                'name': 'Preservación Digital',
                'description': 'Estrategias y técnicas de preservación digital'
            },
            {
                'name': 'Historia Archivística',
                'description': 'Discusiones sobre archivos históricos y patrimonio documental'
            },
            {
                'name': 'Ayuda y Soporte',
                'description': 'Preguntas generales y soporte técnico'
            }
        ]

        categories = []
        for cat_data in categories_data:
            category, created = ForumCategory.objects.get_or_create(
                name=cat_data['name'],
                defaults={
                    'description': cat_data['description']
                }
            )
            categories.append(category)
            if created:
                self.stdout.write(f'Created category: {category.name}')

        # Obtener o crear usuario administrador
        admin_user, created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@ifap.edu',
                'first_name': 'Administrador',
                'last_name': 'IFAP',
                'is_staff': True,
                'is_superuser': True
            }
        )

        # Crear temas de ejemplo
        topics_data = [
            {
                'title': '¡Bienvenidos al Foro de IFAP!',
                'content': '''¡Hola a todos los estudiantes y profesores!

Este es nuestro nuevo espacio de discusión donde podrán:
- Hacer preguntas sobre los cursos
- Compartir experiencias y conocimientos
- Colaborar en proyectos
- Resolver dudas técnicas

¡Esperamos que sea de gran utilidad para toda la comunidad educativa!

Saludos,
Equipo IFAP''',
                'category': categories[4],  # Ayuda y Soporte
                'is_pinned': True
            },
            {
                'title': 'Mejores prácticas para la organización de archivos digitales',
                'content': '''Hola compañeros,

Me gustaría abrir una discusión sobre las mejores prácticas para organizar archivos digitales de gran volumen. En mi experiencia trabajando con archivos municipales, he encontrado que:

1. La nomenclatura consistente es fundamental
2. La estructura de carpetas debe ser lógica y escalable
3. Los metadatos son clave para la recuperación

¿Qué estrategias han funcionado mejor en sus experiencias?''',
                'category': categories[1]  # Digitalización
            },
            {
                'title': 'Dudas sobre el Principio de Procedencia',
                'content': '''Estoy estudiando el principio de procedencia y tengo algunas dudas sobre su aplicación práctica.

¿Podrían ayudarme con ejemplos concretos de cómo aplicar este principio en archivos complejos donde hay documentos de múltiples orígenes?

Gracias de antemano.''',
                'category': categories[0]  # Archivística General
            },
            {
                'title': 'Herramientas de software para preservación digital',
                'content': '''¿Qué herramientas de software recomiendan para la preservación digital a largo plazo?

He estado investigando sobre:
- LOCKSS
- Fedora
- DSpace
- Samvera

¿Alguien tiene experiencia práctica con alguna de estas plataformas?''',
                'category': categories[2]  # Preservación Digital
            }
        ]

        for topic_data in topics_data:
            topic, created = ForumTopic.objects.get_or_create(
                title=topic_data['title'],
                defaults={
                    'content': topic_data['content'],
                    'category': topic_data['category'],
                    'author': admin_user,
                    'is_pinned': topic_data.get('is_pinned', False)
                }
            )
            if created:
                self.stdout.write(f'Created topic: {topic.title}')

        self.stdout.write(
            self.style.SUCCESS('Successfully populated forum with sample data!')
        )