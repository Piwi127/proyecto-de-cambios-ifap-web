from rest_framework import serializers
from .models import Quiz, Question, Option, QuizAttempt, UserAnswer
from courses.serializers import CourseSerializer
from lessons.serializers import LessonSerializer
from users.serializers import UserSerializer

class OptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Option
        fields = ['id', 'option_text', 'is_correct', 'order']
        read_only_fields = ['id']

class QuestionSerializer(serializers.ModelSerializer):
    options = OptionSerializer(many=True, read_only=True)
    
    class Meta:
        model = Question
        fields = ['id', 'question_text', 'question_type', 'points', 'order', 
                 'explanation', 'options', 'created_at']
        read_only_fields = ['id', 'created_at']

class QuizSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)
    course_details = CourseSerializer(source='course', read_only=True)
    lesson_details = LessonSerializer(source='lesson', read_only=True)
    created_by_details = UserSerializer(source='created_by', read_only=True)
    total_questions = serializers.SerializerMethodField()
    total_points = serializers.SerializerMethodField()
    
    class Meta:
        model = Quiz
        fields = ['id', 'title', 'description', 'course', 'lesson', 'quiz_type',
                 'time_limit_minutes', 'max_attempts', 'passing_score', 'is_published',
                 'show_correct_answers', 'randomize_questions', 'created_at', 'updated_at',
                 'created_by', 'questions', 'course_details', 'lesson_details',
                 'created_by_details', 'total_questions', 'total_points']
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by']
    
    def get_total_questions(self, obj):
        return obj.questions.count()
    
    def get_total_points(self, obj):
        return sum(question.points for question in obj.questions.all())
    
    def validate(self, data):
        # Validar que el creador sea instructor
        request = self.context.get('request')
        if request and request.user and not request.user.is_instructor:
            raise serializers.ValidationError("Solo los instructores pueden crear quizzes")
        return data

class QuizAttemptSerializer(serializers.ModelSerializer):
    quiz_details = QuizSerializer(source='quiz', read_only=True)
    user_details = UserSerializer(source='user', read_only=True)
    time_taken_formatted = serializers.SerializerMethodField()
    
    class Meta:
        model = QuizAttempt
        fields = ['id', 'user', 'quiz', 'score', 'max_score', 'percentage', 'is_passed',
                 'time_taken_seconds', 'time_taken_formatted', 'started_at', 'completed_at',
                 'attempt_number', 'quiz_details', 'user_details']
        read_only_fields = ['id', 'started_at', 'completed_at']
    
    def get_time_taken_formatted(self, obj):
        if obj.time_taken_seconds:
            minutes = obj.time_taken_seconds // 60
            seconds = obj.time_taken_seconds % 60
            return f"{minutes}m {seconds}s"
        return "0s"

class UserAnswerSerializer(serializers.ModelSerializer):
    question_details = QuestionSerializer(source='question', read_only=True)
    selected_options_details = OptionSerializer(source='selected_options', many=True, read_only=True)
    
    class Meta:
        model = UserAnswer
        fields = ['id', 'attempt', 'question', 'selected_options', 'text_answer',
                 'is_correct', 'points_earned', 'answered_at', 'question_details',
                 'selected_options_details']
        read_only_fields = ['id', 'answered_at']

class QuizCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quiz
        fields = ['title', 'description', 'course', 'lesson', 'quiz_type',
                 'time_limit_minutes', 'max_attempts', 'passing_score', 'is_published',
                 'show_correct_answers', 'randomize_questions']

class QuestionCreateSerializer(serializers.ModelSerializer):
    options = OptionSerializer(many=True)
    
    class Meta:
        model = Question
        fields = ['quiz', 'question_text', 'question_type', 'points', 'order', 'explanation', 'options']
    
    def create(self, validated_data):
        options_data = validated_data.pop('options')
        question = Question.objects.create(**validated_data)
        
        for option_data in options_data:
            Option.objects.create(question=question, **option_data)
        
        return question

class QuizSubmissionSerializer(serializers.Serializer):
    answers = serializers.ListField(
        child=serializers.DictField()
    )
    
    def validate_answers(self, value):
        for answer in value:
            if 'question_id' not in answer:
                raise serializers.ValidationError("Cada respuesta debe tener un question_id")
            if 'selected_options' not in answer and 'text_answer' not in answer:
                raise serializers.ValidationError("Cada respuesta debe tener selected_options o text_answer")
        return value