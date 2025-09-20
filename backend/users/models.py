from django.db import models
from django.contrib.auth.models import AbstractUser, Group, Permission
from django.core.exceptions import ValidationError

class User(AbstractUser):
    is_student = models.BooleanField(default=True, verbose_name='Es estudiante')
    is_instructor = models.BooleanField(default=False, verbose_name='Es docente')

    groups = models.ManyToManyField(
        Group,
        verbose_name='groups',
        blank=True,
        related_name='custom_user_set',
        related_query_name='custom_user',
    )
    user_permissions = models.ManyToManyField(
        Permission,
        verbose_name='user permissions',
        blank=True,
        related_name='custom_user_set',
        related_query_name='custom_user',
    )

    class Meta:
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.username})"

    def clean(self):
        """Validaciones personalizadas para el modelo User"""
        super().clean()
        
        # Validar que un usuario no tenga múltiples roles principales
        active_roles = sum([self.is_student, self.is_instructor, self.is_superuser])
        if active_roles > 1:
            raise ValidationError(
                'Un usuario solo puede tener un rol principal activo (estudiante, docente o administrador).'
            )
        
        # Si es superusuario, debe ser staff también
        if self.is_superuser and not self.is_staff:
            self.is_staff = True

    def save(self, *args, **kwargs):
        """Override del método save para aplicar validaciones"""
        self.clean()
        super().save(*args, **kwargs)

    @property
    def role_name(self):
        """Retorna el nombre del rol principal del usuario"""
        if self.is_superuser:
            return 'administrador'
        elif self.is_instructor:
            return 'docente'
        elif self.is_student:
            return 'estudiante'
        else:
            return 'sin_rol'

    @property
    def role_display(self):
        """Retorna el nombre del rol para mostrar en la interfaz"""
        role_names = {
            'administrador': 'Administrador de la Interfaz Web',
            'docente': 'Docente',
            'estudiante': 'Estudiante',
            'sin_rol': 'Sin Rol Asignado'
        }
        return role_names.get(self.role_name, 'Rol Desconocido')

    def has_role(self, role):
        """Verifica si el usuario tiene un rol específico"""
        role_mapping = {
            'student': self.is_student,
            'instructor': self.is_instructor,
            'admin': self.is_superuser,
            'staff': self.is_staff
        }
        return role_mapping.get(role, False)

    def can_manage_users(self):
        """Verifica si el usuario puede gestionar otros usuarios"""
        return self.is_superuser

    def can_manage_courses(self):
        """Verifica si el usuario puede gestionar cursos"""
        return self.is_superuser or self.is_instructor

    def can_view_all_students(self):
        """Verifica si el usuario puede ver todos los estudiantes"""
        return self.is_superuser or self.is_instructor

    def set_role(self, role):
        """Establece el rol del usuario de forma segura"""
        # Resetear todos los roles
        self.is_student = False
        self.is_instructor = False
        self.is_superuser = False
        self.is_staff = False
        
        # Establecer el nuevo rol
        if role == 'student':
            self.is_student = True
        elif role == 'instructor':
            self.is_instructor = True
        elif role == 'admin':
            self.is_superuser = True
            self.is_staff = True
        else:
            raise ValueError(f"Rol inválido: {role}. Roles válidos: 'student', 'instructor', 'admin'")

    @classmethod
    def get_users_by_role(cls, role):
        """Retorna usuarios filtrados por rol"""
        if role == 'student':
            return cls.objects.filter(is_student=True)
        elif role == 'instructor':
            return cls.objects.filter(is_instructor=True)
        elif role == 'admin':
            return cls.objects.filter(is_superuser=True)
        else:
            return cls.objects.none()
