from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from django.shortcuts import get_object_or_404
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django.db.models import Avg, Count, Q
from django.db import transaction
from django.utils import timezone
from lessons.models import LessonCompletion
from quizzes.models import Quiz, QuizAttempt
from .models import Course, CourseAuditLog
from .serializers import (
    CourseSerializer, CourseAdminSerializer, BulkOperationSerializer,
    TransferCourseSerializer, CourseMetricsSerializer, InstructorStatsSerializer,
    CourseAuditLogSerializer
)
from ifap_backend.pagination import StandardResultsPagination
from ifap_backend.query_optimizations import OptimizedQueryMixin, CourseQueryOptimizer
from ifap_backend.cache_service import cache_service, CacheKeys
from users.permissions import IsAdminUser, IsInstructorOrAdmin, CanManageCourses
import logging

logger = logging.getLogger('courses')

class CourseViewSet(OptimizedQueryMixin, viewsets.ModelViewSet):
    """
    ViewSet para la gestión completa de cursos.

    Proporciona endpoints para:
    - Listar y crear cursos (CRUD básico)
    - Inscribir/desinscribir estudiantes
    - Ver métricas de cursos
    - Operaciones administrativas (activar, desactivar, transferir, eliminar)
    - Estadísticas globales y por instructor

    Atributos:
        queryset: QuerySet base filtrado por cursos activos
        serializer_class: Serializador principal para cursos
        pagination_class: Clase de paginación estándar
    """
    queryset = Course.objects.filter(is_active=True)
    serializer_class = CourseSerializer
    pagination_class = StandardResultsPagination

    def get_permissions(self):
        """
        Retorna permisos granulares basados en la acción específica.

        Este método implementa un sistema de permisos basado en roles que varía
        según la operación que se está realizando:

        Operaciones de escritura (create, update, partial_update, destroy):
        - Requiere autenticación y permisos de gestión de cursos

        Operaciones de inscripción (enroll, unenroll):
        - Solo requiere autenticación básica

        Operaciones de consulta personal (my_courses, taught_courses):
        - Requiere autenticación para ver cursos propios/impartidos

        Operaciones administrativas (activate, deactivate, transfer, admin_delete):
        - Solo para administradores

        Operaciones masivas (bulk_activate, bulk_deactivate, bulk_delete):
        - Solo para administradores

        Operaciones de métricas administrativas:
        - Solo para administradores

        Operaciones de lectura generales (list, retrieve):
        - Permite acceso de solo lectura a usuarios no autenticados

        Returns:
            list: Lista de clases de permisos aplicables a la acción actual
        """
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            # Solo instructores y administradores pueden crear/modificar cursos
            return [IsAuthenticated(), CanManageCourses()]
        elif self.action in ['enroll', 'unenroll']:
            # Solo estudiantes autenticados pueden inscribirse/desinscribirse
            return [IsAuthenticated()]
        elif self.action in ['my_courses', 'taught_courses']:
            # Solo usuarios autenticados pueden ver sus cursos
            return [IsAuthenticated()]
        elif self.action in ['students']:
            # Solo docentes/admin pueden ver estudiantes del curso
            return [IsAuthenticated(), IsInstructorOrAdmin()]
        elif self.action in ['activate', 'deactivate', 'transfer', 'admin_delete']:
            # Solo administradores pueden realizar estas acciones
            return [IsAuthenticated(), IsAdminUser()]
        elif self.action in ['bulk_activate', 'bulk_deactivate', 'bulk_delete']:
            # Solo administradores para operaciones masivas
            return [IsAuthenticated(), IsAdminUser()]
        elif self.action in ['admin_all', 'admin_inactive', 'admin_metrics', 'admin_instructor_stats']:
            # Solo administradores para endpoints administrativos
            return [IsAuthenticated(), IsAdminUser()]
        else:
            # Para list, retrieve y otras acciones de lectura
            return [IsAuthenticatedOrReadOnly()]

    def optimize_queryset(self, queryset):
        """
        Aplica optimizaciones específicas de consulta según la acción actual.

        Este método implementa diferentes estrategias de optimización de base de datos
        basadas en el tipo de operación que se está realizando:

        Para 'list': Utiliza CourseQueryOptimizer para obtener cursos con detalles
        pre-cargados incluyendo instructor, estudiantes, lecciones y categorías.

        Para 'retrieve': Aplica select_related y prefetch_related para evitar
        consultas N+1 al obtener detalles completos de un curso específico.

        Para 'my_courses': Utiliza CourseQueryOptimizer para obtener cursos
        del usuario actual con optimizaciones específicas.

        Para otras acciones: Aplica optimizaciones básicas con select_related
        del instructor y prefetch_related de estudiantes.

        Args:
            queryset: QuerySet base a optimizar

        Returns:
            QuerySet: QuerySet optimizado con las relaciones apropiadas pre-cargadas
        """
        if self.action == 'list':
            return CourseQueryOptimizer.get_courses_with_details().filter(is_active=True)
        elif self.action == 'retrieve':
            return queryset.select_related('instructor').prefetch_related(
                'students', 'lessons'
            )
        elif self.action == 'my_courses':
            return CourseQueryOptimizer.get_user_courses(self.request.user)

        return queryset.select_related('instructor').prefetch_related('students')

    # ========== VALIDACIONES DE SEGURIDAD ==========

    def _validate_course_ownership(self, course, user):
        """
        Valida que el usuario tenga permisos para acceder/modificar el curso.
        Retorna True si tiene permisos, False en caso contrario.
        """
        if user.is_superuser:
            return True

        if user.is_instructor and course.instructor == user:
            return True

        return False

    def _validate_course_state_for_operation(self, course, operation):
        """
        Valida el estado del curso antes de realizar una operación específica.
        """
        state_validations = {
            'activate': lambda c: not c.is_active,
            'deactivate': lambda c: c.is_active,
            'transfer': lambda c: c.is_active,
            'delete': lambda c: True,  # Los admins pueden eliminar cursos en cualquier estado
        }

        if operation not in state_validations:
            return True

        validation_func = state_validations[operation]
        if not validation_func(course):
            return False, f"El curso no se puede {operation}. Estado actual: {'activo' if course.is_active else 'inactivo'}"

        return True, None

    def _validate_instructor_transfer(self, course, new_instructor):
        """
        Valida que la transferencia de instructor sea segura.
        """
        if course.instructor == new_instructor:
            return False, "El curso ya pertenece a este instructor"

        if not new_instructor.is_instructor:
            return False, "El nuevo instructor debe tener el rol de instructor"

        return True, None

    def _validate_bulk_operation_courses(self, course_ids, required_state=None):
        """
        Valida cursos para operaciones masivas.
        """
        courses = Course.objects.filter(id__in=course_ids)

        if courses.count() != len(course_ids):
            return False, "Uno o más IDs de cursos no son válidos"

        if required_state is not None:
            courses_in_wrong_state = courses.exclude(is_active=required_state)
            if courses_in_wrong_state.exists():
                wrong_courses = list(courses_in_wrong_state.values_list('title', flat=True))
                expected_state = "activos" if required_state else "inactivos"
                return False, f"Los siguientes cursos no están {expected_state}: {', '.join(wrong_courses[:5])}"

        return True, None

    def _log_security_event(self, event_type, details, user=None, course=None):
        """
        Registra eventos de seguridad para auditoría con información detallada.

        Este método crea un registro completo de auditoría que incluye:
        - Información de la sesión del usuario
        - Detalles del navegador y sistema operativo
        - Información específica de la operación de seguridad
        - Estado del curso si está disponible

        Args:
            event_type: Tipo de evento de seguridad (ej: 'UNAUTHORIZED_ACCESS', 'INVALID_COURSE_STATE')
            details: Descripción detallada del evento
            user: Usuario involucrado en el evento (opcional)
            course: Curso relacionado con el evento (opcional)
        """
        # Crear registro de auditoría detallado
        CourseAuditLog.log_action(
            course=course,
            user=user,
            action='security_event',
            ip_address=getattr(self.request, 'META', {}).get('REMOTE_ADDR'),
            user_agent=self.request.META.get('HTTP_USER_AGENT', ''),
            session_key=self.request.session.session_key,
            operation_details={
                'event_type': event_type,
                'severity': 'warning',
                'details': details,
                'request_method': self.request.method,
                'request_path': self.request.path
            },
            affected_objects={
                'course_id': course.id if course else None,
                'user_id': user.id if user else None
            } if course or user else None,
            additional_data={
                'security_event': True,
                'timestamp': timezone.now().isoformat()
            }
        )

        # Mantener el logging tradicional para compatibilidad
        logger.warning(
            f"Security Event: {event_type} - User: {user.username if user else 'Anonymous'} - "
            f"Course: {course.title if course else 'N/A'} - Details: {details}",
            extra={
                'event_type': event_type,
                'user_id': user.id if user else None,
                'course_id': course.id if course else None,
                'ip_address': getattr(self.request, 'META', {}).get('REMOTE_ADDR'),
                'user_agent': self.request.META.get('HTTP_USER_AGENT', ''),
                'details': details
            }
        )

    @method_decorator(cache_page(60 * 15))  # Cache for 15 minutes
    def list(self, request, *args, **kwargs):
        logger.info(f"User {request.user.id if request.user.is_authenticated else 'anonymous'} requested course list")
        return super().list(request, *args, **kwargs)

    def retrieve(self, request, *args, **kwargs):
        """
        Obtiene los detalles completos de un curso específico.

        Este método implementa una estrategia de cache inteligente para mejorar
        el rendimiento al servir detalles de cursos frecuentemente consultados:

        1. Verifica si la respuesta está en cache usando una clave específica
        2. Si está en cache, retorna la respuesta cacheada inmediatamente
        3. Si no está en cache, obtiene el curso usando queryset optimizado
        4. Serializa el curso con todas sus relaciones pre-cargadas
        5. Almacena la respuesta en cache para futuras consultas

        Optimizaciones aplicadas:
        - Cache de 15 minutos para reducir carga en la base de datos
        - QuerySet optimizado con select_related y prefetch_related
        - Logging detallado para monitoreo de rendimiento

        Args:
            request: HttpRequest object
            *args: Argumentos posicionales adicionales
            **kwargs: Argumentos nombrados (incluye 'pk' del curso)

        Returns:
            Response: JSON con detalles completos del curso incluyendo:
            - Información básica del curso
            - Datos del instructor
            - Lista de estudiantes inscritos
            - Lecciones asociadas
            - Categorías del curso

        Note:
            La clave de cache incluye el ID del usuario para manejar
            diferentes niveles de acceso según permisos.
        """
        course_id = kwargs.get('pk')
        cache_key = cache_service.make_key(CacheKeys.COURSE_DETAIL, course_id, request.user.id if request.user.is_authenticated else 'anonymous')

        cached_response = cache_service.get(cache_key, cache_alias='api')
        if cached_response:
            logger.info(f"Course {course_id} detail served from cache")
            return Response(cached_response)

        # Usar queryset optimizado en lugar de super().retrieve()
        queryset = self.optimize_queryset(self.get_queryset())
        instance = get_object_or_404(queryset, pk=course_id)
        serializer = self.get_serializer(instance, context={'request': request})
        response = Response(serializer.data)

        if response.status_code == 200:
            cache_service.set(cache_key, response.data, 900, 'api')  # 15 minutos
            logger.info(f"Course {course_id} detail cached")

        return response

    @action(detail=True, methods=['post'])
    def enroll(self, request, pk=None):
        course = self.get_object()
        user = request.user

        if course.students.filter(id=user.id).exists():
            return Response(
                {'message': 'Ya estás inscrito en este curso'},
                status=status.HTTP_400_BAD_REQUEST
            )

        course.students.add(user)
        return Response({'message': 'Inscripción exitosa'})

    @action(detail=True, methods=['post'])
    def unenroll(self, request, pk=None):
        course = self.get_object()
        user = request.user

        if not course.students.filter(id=user.id).exists():
            return Response(
                {'message': 'No estás inscrito en este curso'},
                status=status.HTTP_400_BAD_REQUEST
            )

        course.students.remove(user)
        return Response({'message': 'Te has dado de baja del curso'})

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated, IsInstructorOrAdmin])
    def students(self, request, pk=None):
        course = self.get_object()

        if not self._validate_course_ownership(course, request.user):
            return Response(
                {'detail': 'No tienes permiso para ver estudiantes de este curso'},
                status=status.HTTP_403_FORBIDDEN
            )

        students = course.students.all()
        data = [
            {
                'id': student.id,
                'username': student.username,
                'first_name': student.first_name,
                'last_name': student.last_name,
                'email': student.email
            }
            for student in students
        ]
        return Response(data)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_courses(self, request):
        """
        Retorna los cursos en los que el usuario autenticado está inscrito,
        incluyendo el progreso de lecciones y quizzes.
        """
        user = request.user
        enrolled_courses = Course.objects.filter(students=user, is_active=True).prefetch_related('lessons')

        courses_data = []
        for course in enrolled_courses:
            total_lessons = course.lessons.count()
            completed_lessons = LessonCompletion.objects.filter(
                lesson__course=course,
                user=user,
                is_completed=True
            ).count()

            total_quizzes = Quiz.objects.filter(lesson__course=course).count()
            completed_quizzes = QuizAttempt.objects.filter(
                quiz__lesson__course=course,
                user=user,
                is_passed=True
            ).count()

            progress_lessons = (completed_lessons / total_lessons * 100) if total_lessons > 0 else 0
            progress_quizzes = (completed_quizzes / total_quizzes * 100) if total_quizzes > 0 else 0
            
            # Simple average of lesson and quiz progress for overall course progress
            overall_progress = (progress_lessons + progress_quizzes) / 2

            # Get next lesson (first incomplete lesson)
            next_lesson = None
            completed_lesson_ids = LessonCompletion.objects.filter(
                lesson__course=course,
                user=user,
                is_completed=True
            ).values_list('lesson_id', flat=True)
            
            next_lesson = course.lessons.filter(is_published=True).exclude(
                id__in=completed_lesson_ids
            ).order_by('order').first()
            
            courses_data.append({
                "id": course.id,
                "title": course.title,
                "description": course.description,
                "instructor": course.instructor.get_full_name() if course.instructor else "N/A",
                "progress": round(overall_progress, 2),
                "next_lesson_title": next_lesson.title if next_lesson else "No hay lecciones pendientes",
                "total_lessons": total_lessons,
                "completed_lessons": completed_lessons,
                "total_quizzes": total_quizzes,
                "completed_quizzes": completed_quizzes,
            })

        return Response(courses_data)

    @action(detail=False, methods=['get'])
    def taught_courses(self, request):
        user = request.user
        # Permitir acceso a instructores y superusers/administradores
        if not user.is_instructor and not user.is_superuser:
            return Response(
                {'error': 'No tienes permisos para ver cursos impartidos'},
                status=status.HTTP_403_FORBIDDEN
            )

        if user.is_superuser:
            # Si es superuser, mostrar todos los cursos activos
            taught_courses = Course.objects.filter(is_active=True)
        else:
            # Si es instructor, mostrar solo sus cursos
            taught_courses = user.courses_taught.filter(is_active=True)

        serializer = self.get_serializer(taught_courses, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'], url_path='metrics', permission_classes=[IsAuthenticated, IsInstructorOrAdmin])
    def course_metrics(self, request, pk=None):
        """
        Retorna métricas detalladas para un curso específico.
        Accesible por instructores del curso o administradores.
        """
        course = get_object_or_404(Course, pk=pk)

        if not (request.user.is_superuser or (request.user.is_instructor and course.instructor == request.user)):
            return Response({"detail": "No tiene permiso para ver las métricas de este curso."}, status=status.HTTP_403_FORBIDDEN)

        total_students = course.students.count()
        completed_lessons = LessonCompletion.objects.filter(lesson__course=course, completed_by=request.user, is_completed=True).count()
        total_quizzes = Quiz.objects.filter(lesson__course=course).count()
        completed_quizzes = QuizAttempt.objects.filter(quiz__lesson__course=course, user=request.user, is_completed=True).count()

        data = {
            "total_students": total_students,
            "completed_lessons": completed_lessons,
            "total_quizzes": total_quizzes,
            "completed_quizzes": completed_quizzes,
            "course_id": course.id,
            "course_title": course.title,
        }
        return Response(data)

    # ========== OPERACIONES ADMINISTRATIVAS ==========

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsAdminUser])
    def activate(self, request, pk=None):
        """Activar un curso específico"""
        course = self.get_object()

        # Validar estado del curso
        is_valid, error_message = self._validate_course_state_for_operation(course, 'activate')
        if not is_valid:
            self._log_security_event('INVALID_COURSE_STATE', error_message, request.user, course)
            return Response(
                {'message': error_message},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validar que el usuario tenga permisos sobre el curso
        if not self._validate_course_ownership(course, request.user):
            self._log_security_event('UNAUTHORIZED_COURSE_ACCESS', 'Usuario sin permisos para activar curso', request.user, course)
            return Response(
                {'message': 'No tienes permisos para activar este curso'},
                status=status.HTTP_403_FORBIDDEN
            )

        old_values = {'is_active': course.is_active}
        course.is_active = True
        course.save()

        # Registrar en el log de auditoría con información detallada
        CourseAuditLog.log_action(
            course=course,
            user=request.user,
            action='activate',
            old_values=old_values,
            new_values={'is_active': course.is_active},
            ip_address=getattr(request, 'META', {}).get('REMOTE_ADDR'),
            user_agent=request.META.get('HTTP_USER_AGENT'),
            session_key=request.session.session_key,
            operation_details={
                'operation_type': 'course_activation',
                'activation_method': 'admin_action',
                'reason': request.data.get('reason', ''),
                'previous_state': 'inactive',
                'new_state': 'active'
            },
            affected_objects={
                'course_id': course.id,
                'course_title': course.title,
                'instructor_id': course.instructor.id
            },
            previous_state={
                'id': course.id,
                'title': course.title,
                'is_active': False,
                'instructor': course.instructor.id,
                'students_count': course.students.count(),
                'created_at': course.created_at.isoformat()
            },
            new_state={
                'id': course.id,
                'title': course.title,
                'is_active': True,
                'instructor': course.instructor.id,
                'students_count': course.students.count(),
                'updated_at': course.updated_at.isoformat()
            },
            additional_data={'reason': request.data.get('reason', '')}
        )

        return Response({
            'message': 'Curso activado exitosamente',
            'course': CourseAdminSerializer(course).data
        })

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsAdminUser])
    def deactivate(self, request, pk=None):
        """Desactivar un curso específico"""
        course = self.get_object()

        # Validar estado del curso
        is_valid, error_message = self._validate_course_state_for_operation(course, 'deactivate')
        if not is_valid:
            self._log_security_event('INVALID_COURSE_STATE', error_message, request.user, course)
            return Response(
                {'message': error_message},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validar que el usuario tenga permisos sobre el curso
        if not self._validate_course_ownership(course, request.user):
            self._log_security_event('UNAUTHORIZED_COURSE_ACCESS', 'Usuario sin permisos para desactivar curso', request.user, course)
            return Response(
                {'message': 'No tienes permisos para desactivar este curso'},
                status=status.HTTP_403_FORBIDDEN
            )

        old_values = {'is_active': course.is_active}
        course.is_active = False
        course.save()

        # Registrar en el log de auditoría
        CourseAuditLog.log_action(
            course=course,
            user=request.user,
            action='deactivate',
            old_values=old_values,
            new_values={'is_active': course.is_active},
            ip_address=getattr(request, 'META', {}).get('REMOTE_ADDR'),
            user_agent=request.META.get('HTTP_USER_AGENT'),
            additional_data={'reason': request.data.get('reason', '')}
        )

        return Response({
            'message': 'Curso desactivado exitosamente',
            'course': CourseAdminSerializer(course).data
        })

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated, IsAdminUser])
    def bulk_activate(self, request):
        """Activar múltiples cursos"""
        serializer = BulkOperationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        course_ids = serializer.validated_data['course_ids']

        # Validar cursos para operación masiva
        is_valid, error_message = self._validate_bulk_operation_courses(course_ids, required_state=False)
        if not is_valid:
            self._log_security_event('INVALID_BULK_OPERATION', error_message, request.user)
            return Response(
                {'message': error_message},
                status=status.HTTP_400_BAD_REQUEST
            )

        courses = Course.objects.filter(id__in=course_ids, is_active=False)

        if not courses.exists():
            return Response(
                {'message': 'No se encontraron cursos inactivos para activar'},
                status=status.HTTP_400_BAD_REQUEST
            )

        activated_count = 0
        for course in courses:
            # Validar permisos para cada curso individualmente
            if not self._validate_course_ownership(course, request.user):
                self._log_security_event('UNAUTHORIZED_BULK_COURSE_ACCESS', f'Sin permisos para curso {course.title}', request.user, course)
                continue

            old_values = {'is_active': course.is_active}
            course.is_active = True
            course.save()
            activated_count += 1

            # Registrar en el log de auditoría
            CourseAuditLog.log_action(
                course=course,
                user=request.user,
                action='bulk_activate',
                old_values=old_values,
                new_values={'is_active': course.is_active},
                ip_address=getattr(request, 'META', {}).get('REMOTE_ADDR'),
                user_agent=request.META.get('HTTP_USER_AGENT'),
                additional_data={
                    'reason': serializer.validated_data.get('reason', ''),
                    'bulk_operation': True,
                    'total_courses': len(course_ids)
                }
            )

        return Response({
            'message': f'{activated_count} cursos activados exitosamente',
            'activated_count': activated_count,
            'reason': serializer.validated_data.get('reason', '')
        })

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated, IsAdminUser])
    def bulk_deactivate(self, request):
        """Desactivar múltiples cursos"""
        serializer = BulkOperationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        course_ids = serializer.validated_data['course_ids']
        courses = Course.objects.filter(id__in=course_ids, is_active=True)

        if not courses.exists():
            return Response(
                {'message': 'No se encontraron cursos activos para desactivar'},
                status=status.HTTP_400_BAD_REQUEST
            )

        deactivated_count = 0
        for course in courses:
            old_values = {'is_active': course.is_active}
            course.is_active = False
            course.save()
            deactivated_count += 1

            # Registrar en el log de auditoría
            CourseAuditLog.log_action(
                course=course,
                user=request.user,
                action='bulk_deactivate',
                old_values=old_values,
                new_values={'is_active': course.is_active},
                ip_address=getattr(request, 'META', {}).get('REMOTE_ADDR'),
                user_agent=request.META.get('HTTP_USER_AGENT'),
                additional_data={
                    'reason': serializer.validated_data.get('reason', ''),
                    'bulk_operation': True,
                    'total_courses': len(course_ids)
                }
            )

        return Response({
            'message': f'{deactivated_count} cursos desactivados exitosamente',
            'deactivated_count': deactivated_count,
            'reason': serializer.validated_data.get('reason', '')
        })

    @action(detail=True, methods=['put'], permission_classes=[IsAuthenticated, IsAdminUser])
    def transfer(self, request, pk=None):
        """Transferir curso a otro instructor"""
        course = self.get_object()
        serializer = TransferCourseSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        new_instructor_id = serializer.validated_data['new_instructor_id']
        new_instructor = get_object_or_404(User, id=new_instructor_id)

        # Validar estado del curso para transferencia
        is_valid, error_message = self._validate_course_state_for_operation(course, 'transfer')
        if not is_valid:
            self._log_security_event('INVALID_COURSE_STATE', error_message, request.user, course)
            return Response(
                {'message': error_message},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validar que el usuario tenga permisos sobre el curso
        if not self._validate_course_ownership(course, request.user):
            self._log_security_event('UNAUTHORIZED_COURSE_ACCESS', 'Usuario sin permisos para transferir curso', request.user, course)
            return Response(
                {'message': 'No tienes permisos para transferir este curso'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Validar la transferencia de instructor
        is_transfer_valid, transfer_error = self._validate_instructor_transfer(course, new_instructor)
        if not is_transfer_valid:
            self._log_security_event('INVALID_INSTRUCTOR_TRANSFER', transfer_error, request.user, course)
            return Response(
                {'message': transfer_error},
                status=status.HTTP_400_BAD_REQUEST
            )

        old_values = {'instructor': course.instructor.id}
        course.instructor = new_instructor
        course.save()

        # Registrar en el log de auditoría
        CourseAuditLog.log_action(
            course=course,
            user=request.user,
            action='transfer',
            old_values=old_values,
            new_values={'instructor': course.instructor.id},
            ip_address=getattr(request, 'META', {}).get('REMOTE_ADDR'),
            user_agent=request.META.get('HTTP_USER_AGENT'),
            additional_data={
                'reason': serializer.validated_data.get('reason', ''),
                'old_instructor': old_values['instructor'],
                'new_instructor': course.instructor.id
            }
        )

        return Response({
            'message': 'Curso transferido exitosamente',
            'course': CourseAdminSerializer(course).data,
            'transferred_to': {
                'id': new_instructor.id,
                'name': new_instructor.get_full_name(),
                'username': new_instructor.username
            }
        })

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated, IsAdminUser])
    def admin_all(self, request):
        """Listar todos los cursos (solo admin)"""
        courses = Course.objects.all().order_by('-created_at')
        page = self.paginate_queryset(courses)
        if page is not None:
            serializer = CourseAdminSerializer(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)

        serializer = CourseAdminSerializer(courses, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated, IsAdminUser])
    def admin_inactive(self, request):
        """Listar cursos inactivos"""
        courses = Course.objects.filter(is_active=False).order_by('-created_at')
        page = self.paginate_queryset(courses)
        if page is not None:
            serializer = CourseAdminSerializer(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)

        serializer = CourseAdminSerializer(courses, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['delete'], permission_classes=[IsAuthenticated, IsAdminUser])
    def admin_delete(self, request, pk=None):
        """Eliminar curso (solo admin)"""
        course = self.get_object()

        # Registrar en el log de auditoría antes de eliminar
        CourseAuditLog.log_action(
            course=course,
            user=request.user,
            action='delete',
            old_values={
                'title': course.title,
                'instructor': course.instructor.id,
                'is_active': course.is_active,
                'students_count': course.students.count()
            },
            ip_address=getattr(request, 'META', {}).get('REMOTE_ADDR'),
            user_agent=request.META.get('HTTP_USER_AGENT'),
            additional_data={'reason': request.data.get('reason', '')}
        )

        course.delete()
        return Response({
            'message': 'Curso eliminado exitosamente'
        }, status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated, IsAdminUser])
    def bulk_delete(self, request):
        """Eliminar múltiples cursos"""
        serializer = BulkOperationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        course_ids = serializer.validated_data['course_ids']
        courses = Course.objects.filter(id__in=course_ids)

        if not courses.exists():
            return Response(
                {'message': 'No se encontraron cursos para eliminar'},
                status=status.HTTP_400_BAD_REQUEST
            )

        deleted_count = 0
        for course in courses:
            # Registrar en el log de auditoría antes de eliminar
            CourseAuditLog.log_action(
                course=course,
                user=request.user,
                action='bulk_delete',
                old_values={
                    'title': course.title,
                    'instructor': course.instructor.id,
                    'is_active': course.is_active,
                    'students_count': course.students.count()
                },
                ip_address=getattr(request, 'META', {}).get('REMOTE_ADDR'),
                user_agent=request.META.get('HTTP_USER_AGENT'),
                additional_data={
                    'reason': serializer.validated_data.get('reason', ''),
                    'bulk_operation': True,
                    'total_courses': len(course_ids)
                }
            )

            course.delete()
            deleted_count += 1

        return Response({
            'message': f'{deleted_count} cursos eliminados exitosamente',
            'deleted_count': deleted_count,
            'reason': serializer.validated_data.get('reason', '')
        })

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated, IsAdminUser])
    def admin_metrics(self, request):
        """Métricas globales de cursos"""
        total_courses = Course.objects.count()
        active_courses = Course.objects.filter(is_active=True).count()
        inactive_courses = Course.objects.filter(is_active=False).count()

        # Calcular total de estudiantes únicos
        total_students = Course.objects.aggregate(
            total=Count('students', distinct=True)
        )['total']

        # Promedio de estudiantes por curso
        if total_courses > 0:
            average_students_per_course = total_students / total_courses
        else:
            average_students_per_course = 0

        # Cursos por modalidad
        courses_by_modality = {}
        for modality, _ in Course.MODALITY_CHOICES:
            count = Course.objects.filter(modality=modality).count()
            courses_by_modality[modality] = count

        # Actividad reciente (últimos 10 logs de auditoría)
        recent_activity = CourseAuditLog.objects.select_related(
            'course', 'user'
        ).order_by('-timestamp')[:10]

        recent_activity_data = []
        for log in recent_activity:
            recent_activity_data.append({
                'id': log.id,
                'course_title': log.course.title,
                'action': log.action,
                'user': log.user.get_full_name() if log.user else 'Usuario eliminado',
                'timestamp': log.timestamp,
                'ip_address': log.ip_address
            })

        data = {
            'total_courses': total_courses,
            'active_courses': active_courses,
            'inactive_courses': inactive_courses,
            'total_students': total_students,
            'average_students_per_course': round(average_students_per_course, 2),
            'courses_by_modality': courses_by_modality,
            'recent_activity': recent_activity_data
        }

        serializer = CourseMetricsSerializer(data)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated, IsAdminUser])
    def admin_instructor_stats(self, request):
        """Estadísticas por instructor"""
        from django.db.models import Count, Avg

        # Obtener todos los instructores con sus estadísticas
        instructors = User.objects.filter(is_instructor=True).annotate(
            courses_count=Count('courses_taught'),
            total_students=Count('courses_taught__students', distinct=True),
            active_courses=Count('courses_taught', filter=Q(courses_taught__is_active=True))
        ).filter(courses_count__gt=0)

        stats_data = []
        for instructor in instructors:
            if instructor.courses_count > 0:
                avg_students = instructor.total_students / instructor.courses_count
            else:
                avg_students = 0

            stats_data.append({
                'instructor_id': instructor.id,
                'instructor_name': instructor.get_full_name(),
                'courses_count': instructor.courses_count,
                'total_students': instructor.total_students,
                'active_courses': instructor.active_courses,
                'average_students_per_course': round(avg_students, 2)
            })

        # Ordenar por número de cursos (descendente)
        stats_data.sort(key=lambda x: x['courses_count'], reverse=True)

        serializer = InstructorStatsSerializer(stats_data, many=True)
        return Response(serializer.data)
