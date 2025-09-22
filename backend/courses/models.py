from django.db import models
from django.conf import settings

class CourseAuditLog(models.Model):
    """
    Modelo para auditar todas las operaciones administrativas realizadas en cursos.
    Registra cambios, activaciones, desactivaciones, transferencias y eliminaciones.
    """
    ACTION_CHOICES = [
        ('create', 'Creación'),
        ('update', 'Actualización'),
        ('activate', 'Activación'),
        ('deactivate', 'Desactivación'),
        ('transfer', 'Transferencia'),
        ('delete', 'Eliminación'),
        ('bulk_activate', 'Activación Masiva'),
        ('bulk_deactivate', 'Desactivación Masiva'),
        ('bulk_delete', 'Eliminación Masiva'),
    ]

    course = models.ForeignKey('Course', on_delete=models.CASCADE, related_name='audit_logs')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='course_audit_logs')
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    timestamp = models.DateTimeField(auto_now_add=True)
    old_values = models.JSONField(null=True, blank=True, help_text='Valores anteriores (para actualizaciones)')
    new_values = models.JSONField(null=True, blank=True, help_text='Nuevos valores (para actualizaciones)')
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(null=True, blank=True)
    user_agent_parsed = models.JSONField(null=True, blank=True, help_text='Información parseada del navegador y sistema operativo')
    session_key = models.CharField(max_length=40, null=True, blank=True, help_text='Clave de sesión del usuario')
    operation_details = models.JSONField(null=True, blank=True, help_text='Detalles específicos de la operación realizada')
    affected_objects = models.JSONField(null=True, blank=True, help_text='IDs y tipos de objetos afectados por la operación')
    previous_state = models.JSONField(null=True, blank=True, help_text='Estado completo del objeto antes de la operación')
    new_state = models.JSONField(null=True, blank=True, help_text='Estado completo del objeto después de la operación')
    additional_data = models.JSONField(null=True, blank=True, help_text='Datos adicionales específicos de la acción')

    class Meta:
        ordering = ['-timestamp']
        verbose_name = 'Log de Auditoría de Curso'
        verbose_name_plural = 'Logs de Auditoría de Cursos'

    def __str__(self):
        return f"{self.course.title} - {self.action} - {self.timestamp}"

    @classmethod
    def log_action(cls, course, user, action, old_values=None, new_values=None, ip_address=None, user_agent=None, session_key=None, operation_details=None, affected_objects=None, previous_state=None, new_state=None, additional_data=None):
        """
        Método de clase para crear un registro de auditoría completo con información detallada.

        Este método crea un registro de auditoría enriquecido que incluye:
        - Información básica de la operación (curso, usuario, acción, timestamp)
        - Información técnica (IP, user agent, sesión)
        - Información detallada de la operación (detalles específicos, objetos afectados)
        - Estados antes y después de la operación
        - Datos adicionales personalizados

        Args:
            course: Instancia del curso sobre el que se realiza la acción
            user: Usuario que realiza la acción (puede ser None para acciones del sistema)
            action: Tipo de acción realizada (create, update, activate, etc.)
            old_values: Valores anteriores del objeto (para operaciones de actualización)
            new_values: Valores nuevos del objeto (para operaciones de actualización)
            ip_address: Dirección IP desde donde se realiza la acción
            user_agent: String del user agent del navegador
            session_key: Clave de sesión del usuario (para rastreo de sesiones)
            operation_details: Detalles específicos de la operación realizada
            affected_objects: Diccionario con IDs y tipos de objetos afectados
            previous_state: Estado completo del objeto antes de la operación
            new_state: Estado completo del objeto después de la operación
            additional_data: Datos adicionales específicos de la acción

        Returns:
            CourseAuditLog: Instancia del registro de auditoría creado
        """
        # Parsear user agent si está disponible
        user_agent_parsed = None
        if user_agent:
            try:
                # Aquí se podría usar una librería como user-agents para parsear
                # Por simplicidad, creamos un diccionario básico
                user_agent_parsed = {
                    'browser': 'Chrome' if 'Chrome' in user_agent else 'Firefox' if 'Firefox' in user_agent else 'Safari' if 'Safari' in user_agent else 'Other',
                    'mobile': 'Mobile' in user_agent,
                    'platform': 'Windows' if 'Windows' in user_agent else 'macOS' if 'Mac' in user_agent else 'Linux' if 'Linux' in user_agent else 'Other'
                }
            except Exception:
                user_agent_parsed = {'error': 'Could not parse user agent'}

        return cls.objects.create(
            course=course,
            user=user,
            action=action,
            old_values=old_values,
            new_values=new_values,
            ip_address=ip_address,
            user_agent=user_agent,
            user_agent_parsed=user_agent_parsed,
            session_key=session_key,
            operation_details=operation_details,
            affected_objects=affected_objects,
            previous_state=previous_state,
            new_state=new_state,
            additional_data=additional_data
        )

class Course(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    instructor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='courses_taught')
    students = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='courses_enrolled', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    duration_hours = models.PositiveIntegerField(default=0)
    modality = models.CharField(max_length=20, choices=[
        ('presencial', 'Presencial'),
        ('virtual', 'Virtual'),
        ('hibrido', 'Híbrido')
    ], default='virtual')

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title

    @property
    def enrolled_students_count(self):
        return self.students.count()
