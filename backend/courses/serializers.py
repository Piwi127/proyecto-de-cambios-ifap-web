from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Course, CourseAuditLog

User = get_user_model()

class CourseSerializer(serializers.ModelSerializer):
    instructor_name = serializers.CharField(source='instructor.get_full_name', read_only=True)
    enrolled_students_count = serializers.ReadOnlyField()
    is_enrolled = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            'id', 'title', 'description', 'instructor', 'instructor_name',
            'students', 'created_at', 'updated_at', 'is_active',
            'duration_hours', 'modality', 'enrolled_students_count', 'is_enrolled'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'enrolled_students_count', 'instructor']

    def get_is_enrolled(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.students.filter(id=request.user.id).exists()
        return False

class CourseAdminSerializer(serializers.ModelSerializer):
    """
    Serializador para operaciones administrativas de cursos.
    Incluye todos los campos y permite modificaciones administrativas.
    """
    instructor_name = serializers.CharField(source='instructor.get_full_name', read_only=True)
    enrolled_students_count = serializers.ReadOnlyField()
    students_details = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            'id', 'title', 'description', 'instructor', 'instructor_name',
            'students', 'students_details', 'created_at', 'updated_at', 'is_active',
            'duration_hours', 'modality', 'enrolled_students_count'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'enrolled_students_count']

    def get_students_details(self, obj):
        """Retorna detalles básicos de los estudiantes inscritos"""
        students = obj.students.all()
        return [
            {
                'id': student.id,
                'username': student.username,
                'full_name': student.get_full_name(),
                'email': student.email
            }
            for student in students
        ]

class BulkOperationSerializer(serializers.Serializer):
    """
    Serializador para operaciones masivas en cursos.
    """
    course_ids = serializers.ListField(
        child=serializers.IntegerField(),
        allow_empty=False,
        help_text="Lista de IDs de cursos para la operación masiva"
    )
    reason = serializers.CharField(
        max_length=500,
        required=False,
        help_text="Razón de la operación masiva (opcional)"
    )

    def validate_course_ids(self, value):
        """Validar que todos los IDs correspondan a cursos existentes"""
        if not Course.objects.filter(id__in=value).count() == len(value):
            raise serializers.ValidationError("Uno o más IDs de cursos no son válidos")
        return value

class TransferCourseSerializer(serializers.Serializer):
    """
    Serializador para transferencia de cursos entre instructores.
    """
    new_instructor_id = serializers.IntegerField(
        help_text="ID del nuevo instructor al que se transferirá el curso"
    )
    reason = serializers.CharField(
        max_length=500,
        required=False,
        help_text="Razón de la transferencia (opcional)"
    )

    def validate_new_instructor_id(self, value):
        """Validar que el nuevo instructor existe y es instructor"""
        try:
            user = User.objects.get(id=value)
            if not user.is_instructor:
                raise serializers.ValidationError("El usuario debe ser un instructor")
            return value
        except User.DoesNotExist:
            raise serializers.ValidationError("El instructor especificado no existe")

class CourseMetricsSerializer(serializers.Serializer):
    """
    Serializador para métricas de cursos.
    """
    total_courses = serializers.IntegerField(read_only=True)
    active_courses = serializers.IntegerField(read_only=True)
    inactive_courses = serializers.IntegerField(read_only=True)
    total_students = serializers.IntegerField(read_only=True)
    average_students_per_course = serializers.FloatField(read_only=True)
    courses_by_modality = serializers.DictField(read_only=True)
    recent_activity = serializers.ListField(read_only=True)

class InstructorStatsSerializer(serializers.Serializer):
    """
    Serializador para estadísticas por instructor.
    """
    instructor_id = serializers.IntegerField(read_only=True)
    instructor_name = serializers.CharField(read_only=True)
    courses_count = serializers.IntegerField(read_only=True)
    total_students = serializers.IntegerField(read_only=True)
    active_courses = serializers.IntegerField(read_only=True)
    average_students_per_course = serializers.FloatField(read_only=True)

class CourseAuditLogSerializer(serializers.ModelSerializer):
    """
    Serializador para el sistema de auditoría de cursos.
    """
    course_title = serializers.CharField(source='course.title', read_only=True)
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = CourseAuditLog
        fields = [
            'id', 'course', 'course_title', 'user', 'user_name', 'user_username',
            'action', 'timestamp', 'old_values', 'new_values', 'ip_address',
            'user_agent', 'additional_data'
        ]
        read_only_fields = ['id', 'timestamp']
