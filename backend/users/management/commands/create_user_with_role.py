"""
Comando de gestión para crear usuarios con roles específicos.
Uso: python manage.py create_user_with_role --username <username> --email <email> --role <role>
"""

from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError

User = get_user_model()


class Command(BaseCommand):
    help = 'Crea un usuario con un rol específico'

    def add_arguments(self, parser):
        parser.add_argument(
            '--username',
            type=str,
            required=True,
            help='Nombre de usuario'
        )
        parser.add_argument(
            '--email',
            type=str,
            required=True,
            help='Correo electrónico'
        )
        parser.add_argument(
            '--password',
            type=str,
            help='Contraseña (si no se proporciona, se solicitará)'
        )
        parser.add_argument(
            '--role',
            type=str,
            choices=['student', 'instructor', 'admin'],
            required=True,
            help='Rol del usuario: student, instructor, admin'
        )
        parser.add_argument(
            '--first-name',
            type=str,
            help='Nombre'
        )
        parser.add_argument(
            '--last-name',
            type=str,
            help='Apellido'
        )

    def handle(self, *args, **options):
        username = options['username']
        email = options['email']
        role = options['role']
        password = options['password']
        first_name = options.get('first_name', '')
        last_name = options.get('last_name', '')

        # Verificar si el usuario ya existe
        if User.objects.filter(username=username).exists():
            raise CommandError(f'El usuario "{username}" ya existe.')

        if User.objects.filter(email=email).exists():
            raise CommandError(f'Ya existe un usuario con el email "{email}".')

        # Solicitar contraseña si no se proporcionó
        if not password:
            import getpass
            password = getpass.getpass('Contraseña: ')
            password_confirm = getpass.getpass('Confirmar contraseña: ')
            
            if password != password_confirm:
                raise CommandError('Las contraseñas no coinciden.')

        try:
            # Crear el usuario
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name
            )

            # Establecer el rol
            user.set_role(role)
            user.save()

            # Mensaje de éxito
            role_display = user.role_display
            self.stdout.write(
                self.style.SUCCESS(
                    f'Usuario "{username}" creado exitosamente con rol "{role_display}"'
                )
            )

            # Mostrar información del usuario
            self.stdout.write(f'ID: {user.id}')
            self.stdout.write(f'Username: {user.username}')
            self.stdout.write(f'Email: {user.email}')
            self.stdout.write(f'Nombre completo: {user.first_name} {user.last_name}')
            self.stdout.write(f'Rol: {user.role_display}')
            self.stdout.write(f'Es superusuario: {user.is_superuser}')
            self.stdout.write(f'Es staff: {user.is_staff}')

        except ValidationError as e:
            raise CommandError(f'Error de validación: {e}')
        except Exception as e:
            raise CommandError(f'Error al crear el usuario: {e}')