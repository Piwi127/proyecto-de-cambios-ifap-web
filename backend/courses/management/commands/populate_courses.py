from django.core.management.base import BaseCommand
from courses.models import Course
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Populates the database with initial course data.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Populating courses...'))

        # Create a default instructor if none exists
        try:
            instructor = User.objects.get(username='admin')
        except User.DoesNotExist:
            instructor = User.objects.create_user(
                username='admin',
                email='admin@example.com',
                password='adminpassword',
                is_staff=True,
                is_superuser=True
            )
            self.stdout.write(self.style.WARNING('Created default admin user for instructor.'))

        courses_data = [
            {
                'title': 'Archivística Básica',
                'description': 'Introducción a los principios fundamentales de la archivística.',
                'duration_hours': 40,
                'modality': 'virtual',
            },
            {
                'title': 'Gestión Digital',
                'description': 'Estrategias y herramientas para la gestión de documentos digitales.',
                'duration_hours': 60,
                'modality': 'hibrido',
            },
            {
                'title': 'Archivos Históricos',
                'description': 'Estudio y conservación de documentos con valor histórico.',
                'duration_hours': 50,
                'modality': 'presencial',
            },
            {
                'title': 'Preservación de Documentos',
                'description': 'Técnicas y métodos para la preservación a largo plazo de documentos.',
                'duration_hours': 45,
                'modality': 'virtual',
            },
        ]

        for course_data in courses_data:
            course, created = Course.objects.update_or_create(
                title=course_data['title'],
                defaults={
                    'description': course_data['description'],
                    'instructor': instructor,
                    'duration_hours': course_data['duration_hours'],
                    'modality': course_data['modality'],
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Successfully created course: {course.title}'))
            else:
                self.stdout.write(self.style.INFO(f'Updated existing course: {course.title}'))

        self.stdout.write(self.style.SUCCESS('Course population complete.'))