from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    role_name = serializers.ReadOnlyField()
    role_display = serializers.ReadOnlyField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 
            'is_student', 'is_instructor', 'is_staff', 'is_superuser', 'is_active',
            'date_joined', 'role_name', 'role_display'
        ]
        read_only_fields = ['id', 'date_joined', 'role_name', 'role_display']

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    perfil = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 'password', 'perfil']

    def create(self, validated_data):
        perfil = validated_data.pop('perfil')
        is_student = perfil == 'alumno'
        is_instructor = perfil == 'instructor'
        user = User.objects.create_user(
            **validated_data,
            is_student=is_student,
            is_instructor=is_instructor
        )
        return user