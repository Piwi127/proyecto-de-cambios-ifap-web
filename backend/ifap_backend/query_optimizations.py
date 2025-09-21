"""
Optimizaciones de queries para mejorar el rendimiento de la base de datos
"""
from django.db import models
from django.db.models import Prefetch, Q, Count, Avg
from django.core.cache import cache
from ifap_backend.cache_service import cache_service, CacheKeys

class OptimizedQueryMixin:
    """Mixin para optimizar queries en ViewSets"""
    
    def get_queryset(self):
        """Override del queryset base con optimizaciones"""
        queryset = super().get_queryset()
        
        # Aplicar optimizaciones específicas según la acción
        if hasattr(self, 'optimize_queryset'):
            return self.optimize_queryset(queryset)
        
        return queryset
    
    def optimize_queryset(self, queryset):
        """Método para ser sobrescrito en cada ViewSet"""
        return queryset

class UserQueryOptimizer:
    """Optimizaciones específicas para User queries"""
    
    @staticmethod
    def get_users_with_roles():
        """Usuarios con información de roles optimizada"""
        from users.models import User
        return User.objects.select_related().prefetch_related(
            'groups',
            'user_permissions'
        )
    
    @staticmethod
    def get_students_with_courses():
        """Estudiantes con sus cursos"""
        from users.models import User
        from courses.models import Course
        
        return User.objects.filter(
            is_student=True
        ).prefetch_related(
            Prefetch(
                'enrolled_courses',
                queryset=Course.objects.select_related('instructor')
            )
        )
    
    @staticmethod
    def get_instructors_with_courses():
        """Instructores con sus cursos"""
        from users.models import User
        from courses.models import Course
        
        return User.objects.filter(
            is_instructor=True
        ).prefetch_related(
            Prefetch(
                'taught_courses',
                queryset=Course.objects.annotate(
                    student_count=Count('students')
                )
            )
        )

class CourseQueryOptimizer:
    """Optimizaciones específicas para Course queries"""
    
    @staticmethod
    def get_courses_with_details():
        """Cursos con información completa"""
        from courses.models import Course
        
        return Course.objects.select_related(
            'instructor'
        ).prefetch_related(
            'students',
            'categories'
        ).annotate(
            student_count=Count('students'),
            lesson_count=Count('lessons')
        )
    
    @staticmethod
    def get_course_with_lessons(course_id):
        """Curso específico con lecciones optimizadas"""
        from courses.models import Course
        from lessons.models import Lesson
        
        return Course.objects.select_related(
            'instructor'
        ).prefetch_related(
            Prefetch(
                'lessons',
                queryset=Lesson.objects.select_related(
                    'course'
                ).order_by('order', 'created_at')
            ),
            'students'
        ).get(id=course_id)
    
    @staticmethod
    def get_user_courses(user):
        """Cursos de un usuario específico"""
        from courses.models import Course
        
        if user.is_instructor:
            return Course.objects.filter(
                instructor=user
            ).select_related().prefetch_related(
                'students'
            ).annotate(
                student_count=Count('students'),
                lesson_count=Count('lessons')
            )
        else:
            return Course.objects.filter(
                students=user
            ).select_related(
                'instructor'
            ).annotate(
                lesson_count=Count('lessons')
            )

class ForumQueryOptimizer:
    """Optimizaciones específicas para Forum queries"""
    
    @staticmethod
    def get_topics_with_details():
        """Topics del foro con información completa"""
        from forum.models import Topic
        
        return Topic.objects.select_related(
            'author',
            'course'
        ).prefetch_related(
            'tags'
        ).annotate(
            reply_count=Count('replies'),
            latest_reply_date=models.Max('replies__created_at')
        )
    
    @staticmethod
    def get_topic_with_replies(topic_id):
        """Topic específico con replies optimizadas"""
        from forum.models import Topic, Reply
        
        return Topic.objects.select_related(
            'author',
            'course'
        ).prefetch_related(
            Prefetch(
                'replies',
                queryset=Reply.objects.select_related(
                    'author'
                ).order_by('created_at')
            ),
            'tags'
        ).get(id=topic_id)
    
    @staticmethod
    def get_user_conversations(user):
        """Conversaciones de un usuario"""
        from forum.models import Conversation
        
        return Conversation.objects.filter(
            participants=user
        ).select_related().prefetch_related(
            'participants',
            Prefetch(
                'messages',
                queryset=models.Q(
                    # Solo los últimos 10 mensajes
                ).order_by('-created_at')[:10]
            )
        ).annotate(
            message_count=Count('messages'),
            unread_count=Count(
                'messages',
                filter=Q(is_read=False, sender__ne=user)
            )
        )

class TaskQueryOptimizer:
    """Optimizaciones específicas para Task queries"""
    
    @staticmethod
    def get_tasks_with_assignments():
        """Tareas con asignaciones optimizadas"""
        from tasks.models import Task
        
        return Task.objects.select_related(
            'course',
            'created_by'
        ).prefetch_related(
            'assigned_students'
        ).annotate(
            assignment_count=Count('assignments'),
            submission_count=Count('assignments__submissions')
        )
    
    @staticmethod
    def get_user_assignments(user):
        """Asignaciones de un usuario"""
        from tasks.models import Assignment
        
        return Assignment.objects.filter(
            student=user
        ).select_related(
            'task',
            'task__course',
            'student'
        ).prefetch_related(
            'submissions'
        ).annotate(
            submission_count=Count('submissions')
        )

class LibraryQueryOptimizer:
    """Optimizaciones específicas para Library queries"""
    
    @staticmethod
    def get_documents_with_categories():
        """Documentos con categorías optimizadas"""
        from library.models import Document
        
        return Document.objects.select_related(
            'uploaded_by'
        ).prefetch_related(
            'categories',
            'tags'
        ).annotate(
            download_count=Count('downloads')
        )
    
    @staticmethod
    def get_categories_with_document_count():
        """Categorías con conteo de documentos"""
        from library.models import Category
        
        return Category.objects.prefetch_related(
            'documents'
        ).annotate(
            document_count=Count('documents')
        )

class NotificationQueryOptimizer:
    """Optimizaciones específicas para Notification queries"""
    
    @staticmethod
    def get_user_notifications(user, limit=20):
        """Notificaciones de un usuario optimizadas"""
        from notifications.models import Notification
        
        cache_key = cache_service.make_key(
            CacheKeys.USER_NOTIFICATIONS,
            user.id,
            limit
        )
        
        cached_notifications = cache_service.get(cache_key, cache_alias='api')
        if cached_notifications is not None:
            return cached_notifications
        
        notifications = Notification.objects.filter(
            recipient=user
        ).select_related(
            'sender'
        ).order_by('-created_at')[:limit]
        
        # Cache por 5 minutos
        cache_service.set(cache_key, list(notifications.values()), 300, 'api')
        
        return notifications
    
    @staticmethod
    def get_unread_count(user):
        """Conteo de notificaciones no leídas optimizado"""
        from notifications.models import Notification
        
        cache_key = cache_service.make_key(
            CacheKeys.NOTIFICATION_COUNT,
            user.id
        )
        
        cached_count = cache_service.get(cache_key, cache_alias='api')
        if cached_count is not None:
            return cached_count
        
        count = Notification.objects.filter(
            recipient=user,
            is_read=False
        ).count()
        
        # Cache por 2 minutos
        cache_service.set(cache_key, count, 120, 'api')
        
        return count

# Funciones de utilidad para optimización de queries
def optimize_queryset_for_action(queryset, action, model_name):
    """Aplicar optimizaciones según la acción y modelo"""
    
    optimizers = {
        'users': UserQueryOptimizer,
        'courses': CourseQueryOptimizer,
        'forum': ForumQueryOptimizer,
        'tasks': TaskQueryOptimizer,
        'library': LibraryQueryOptimizer,
        'notifications': NotificationQueryOptimizer,
    }
    
    optimizer = optimizers.get(model_name.lower())
    if not optimizer:
        return queryset
    
    # Aplicar optimizaciones específicas según la acción
    optimization_map = {
        'list': 'get_{}_with_details'.format(model_name.lower()),
        'retrieve': 'get_{}_with_full_details'.format(model_name.lower()),
        'create': queryset,
        'update': queryset,
        'destroy': queryset,
    }
    
    optimization_method = optimization_map.get(action)
    if optimization_method and hasattr(optimizer, optimization_method):
        return getattr(optimizer, optimization_method)()
    
    return queryset