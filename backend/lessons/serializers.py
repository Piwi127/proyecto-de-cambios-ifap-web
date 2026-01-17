from rest_framework import serializers
from .models import Lesson

class LessonSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source='course.title', read_only=True)
    instructor_name = serializers.CharField(source='instructor.get_full_name', read_only=True)

    class Meta:
        model = Lesson
        fields = [
            'id', 'title', 'description', 'course', 'course_title',
            'instructor', 'instructor_name', 'order', 'duration_minutes',
            'is_published', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'instructor']

class LessonContentSerializer(serializers.ModelSerializer):
    """Serializer para mostrar el contenido completo de la lección"""

    class Meta:
        model = Lesson
        fields = [
            'id', 'title', 'description', 'content', 'video_url',
            'duration_minutes', 'order'
        ]
