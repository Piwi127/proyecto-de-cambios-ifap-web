# Escenarios de Prueba de Flujos de Usuario - IFAP

## Descripción
Este documento detalla los escenarios completos de prueba para los diferentes tipos de usuarios del sistema IFAP, simulando el uso real del sistema.

## 🎓 Flujo Completo de Estudiante

### Escenario 1: Registro y Primer Acceso
**Objetivo**: Verificar el proceso completo de registro y primer acceso de un estudiante

**Precondiciones**:
- Sistema con cursos disponibles
- Configuración de email habilitada

**Pasos del Flujo**:

#### 1.1 Registro de Usuario
```http
POST /api/users/register/
{
  "username": "estudiante_test_001",
  "email": "estudiante001@test.com",
  "password": "password123",
  "first_name": "María",
  "last_name": "González",
  "user_type": "student"
}
```
- ✅ **Verificaciones**:
  - Status: 201 Created
  - Usuario creado en base de datos
  - Email de confirmación enviado
  - Perfil de estudiante creado automáticamente

#### 1.2 Verificación de Email
```http
GET /api/users/verify-email/?token={verification_token}
```
- ✅ **Verificaciones**:
  - Email verificado correctamente
  - Usuario activado en el sistema
  - Redirección a login

#### 1.3 Primer Login
```http
POST /api/users/login/
{
  "username": "estudiante_test_001",
  "password": "password123"
}
```
- ✅ **Verificaciones**:
  - Status: 200 OK
  - Tokens JWT generados
  - Información de perfil completa
  - Dashboard de estudiante cargado

#### 1.4 Exploración de Cursos
```http
GET /api/courses/?is_active=true&difficulty_level=beginner
```
- ✅ **Verificaciones**:
  - Lista de cursos disponibles
  - Información completa de cursos
  - Filtros funcionando correctamente
  - Paginación implementada

### Escenario 2: Inscripción y Progreso en Curso
**Objetivo**: Verificar el flujo completo de inscripción y progreso en un curso

**Pasos del Flujo**:

#### 2.1 Inscripción en Curso
```http
POST /api/courses/{course_id}/enroll/
Authorization: Bearer {access_token}
```
- ✅ **Verificaciones**:
  - Status: 201 Created
  - Inscripción registrada
  - Acceso a lecciones habilitado
  - Progreso inicial creado

#### 2.2 Acceso a Lecciones
```http
GET /api/lessons/?course={course_id}&ordering=order
```
- ✅ **Verificaciones**:
  - Lecciones ordenadas correctamente
  - Contenido de lecciones accesible
  - Estado de completitud visible
  - Navegación entre lecciones

#### 2.3 Completar Lección
```http
POST /api/lessons/{lesson_id}/complete/
Authorization: Bearer {access_token}
```
- ✅ **Verificaciones**:
  - Lección marcada como completada
  - Progreso actualizado
  - Siguiente lección desbloqueada
  - Notificación de progreso

#### 2.4 Realizar Quiz
```http
POST /api/quizzes/{quiz_id}/attempt/
{
  "answers": {
    "question_1": "A",
    "question_2": "B",
    "question_3": "C"
  }
}
```
- ✅ **Verificaciones**:
  - Intento registrado correctamente
  - Calificación calculada automáticamente
  - Resultados detallados por pregunta
  - Progreso del curso actualizado

#### 2.5 Participar en Foro
```http
POST /api/forum/topics/
{
  "title": "Duda sobre la lección 3",
  "content": "¿Podrían explicar mejor el concepto X?",
  "category": "curso_general",
  "course": course_id
}
```
- ✅ **Verificaciones**:
  - Tema creado correctamente
  - Asociado al curso específico
  - Notificaciones enviadas
  - Visibilidad para otros estudiantes

### Escenario 3: Gestión de Tareas
**Objetivo**: Verificar el flujo completo de entrega y seguimiento de tareas

**Pasos del Flujo**:

#### 3.1 Ver Tareas Asignadas
```http
GET /api/tasks/assignments/?student={user_id}&status=pending
```
- ✅ **Verificaciones**:
  - Tareas asignadas visibles
  - Información de plazos
  - Instrucciones claras
  - Archivos adjuntos accesibles

#### 3.2 Entregar Tarea
```http
POST /api/tasks/submissions/
{
  "assignment": assignment_id,
  "content": "Respuesta a la tarea",
  "files": [file_id_1, file_id_2]
}
```
- ✅ **Verificaciones**:
  - Entrega registrada correctamente
  - Archivos adjuntos guardados
  - Timestamp de entrega correcto
  - Notificación al instructor enviada

#### 3.3 Revisar Calificaciones
```http
GET /api/tasks/submissions/?student={user_id}&graded=true
```
- ✅ **Verificaciones**:
  - Calificaciones visibles
  - Feedback del instructor
  - Historial de entregas
  - Promedio de calificaciones

## 👨‍🏫 Flujo Completo de Instructor

### Escenario 4: Creación de Curso Completo
**Objetivo**: Verificar que un instructor puede crear y gestionar un curso completo

**Pasos del Flujo**:

#### 4.1 Crear Curso
```http
POST /api/courses/
{
  "title": "Introducción a la Archivística Digital",
  "description": "Curso completo sobre fundamentos de archivística digital",
  "category": "archivistica",
  "difficulty_level": "intermediate",
  "estimated_duration": 120,
  "objectives": ["Objetivo 1", "Objetivo 2", "Objetivo 3"],
  "requirements": ["Conocimientos básicos de computación"],
  "is_active": true
}
```
- ✅ **Verificaciones**:
  - Curso creado correctamente
  - Instructor asignado automáticamente
  - Configuración inicial guardada
  - URL del curso generada

#### 4.2 Crear Módulos y Lecciones
```http
POST /api/lessons/
{
  "title": "Módulo 1: Conceptos Básicos",
  "content": "Contenido detallado de la lección...",
  "course": course_id,
  "order": 1,
  "duration_minutes": 45,
  "lesson_type": "video",
  "video_url": "https://example.com/video1.mp4",
  "resources": [
    {
      "title": "Guía de estudio",
      "type": "pdf",
      "url": "https://example.com/guia1.pdf"
    }
  ]
}
```
- ✅ **Verificaciones**:
  - Lección creada y asociada al curso
  - Recursos adjuntos correctamente
  - Orden de lecciones establecido
  - Duración total del curso actualizada

#### 4.3 Crear Sistema de Evaluación
```http
POST /api/quizzes/
{
  "title": "Evaluación Módulo 1",
  "description": "Quiz para verificar comprensión de conceptos básicos",
  "course": course_id,
  "time_limit": 30,
  "passing_score": 70,
  "attempts_allowed": 2,
  "is_active": true
}
```
- ✅ **Verificaciones**:
  - Quiz creado correctamente
  - Configuración de límites establecida
  - Asociado al curso y módulo

#### 4.4 Crear Preguntas del Quiz
```http
POST /api/questions/
{
  "quiz": quiz_id,
  "question": "¿Cuál es el concepto principal de la archivística digital?",
  "question_type": "multiple_choice",
  "options": [
    {"text": "Opción A", "is_correct": false},
    {"text": "Opción B", "is_correct": true},
    {"text": "Opción C", "is_correct": false},
    {"text": "Opción D", "is_correct": false}
  ],
  "explanation": "Explicación detallada de la respuesta correcta",
  "points": 10
}
```
- ✅ **Verificaciones**:
  - Pregunta creada correctamente
  - Opciones configuradas
  - Explicación incluida
  - Puntuación asignada

#### 4.5 Crear Tarea Práctica
```http
POST /api/tasks/tasks/
{
  "title": "Análisis de Caso Práctico",
  "description": "Analizar el caso de estudio y presentar conclusiones",
  "course": course_id,
  "task_type": "project",
  "due_date": "2025-10-30T23:59:59Z",
  "max_score": 100,
  "instructions": "Instrucciones detalladas...",
  "rubric": {
    "criteria_1": {"name": "Análisis", "points": 40},
    "criteria_2": {"name": "Conclusiones", "points": 35},
    "criteria_3": {"name": "Presentación", "points": 25}
  }
}
```
- ✅ **Verificaciones**:
  - Tarea creada correctamente
  - Rúbrica de evaluación incluida
  - Plazo establecido
  - Instrucciones claras

### Escenario 5: Gestión de Estudiantes
**Objetivo**: Verificar las funcionalidades de gestión de estudiantes

**Pasos del Flujo**:

#### 5.1 Monitorear Progreso
```http
GET /api/courses/{course_id}/enrollments/
```
- ✅ **Verificaciones**:
  - Lista de estudiantes inscritos
  - Estado de progreso individual
  - Métricas de participación

#### 5.2 Revisar Entregas
```http
GET /api/tasks/assignments/?course={course_id}&status=submitted
```
- ✅ **Verificaciones**:
  - Entregas pendientes de revisión
  - Información de estudiantes
  - Archivos adjuntos accesibles

#### 5.3 Calificar Entregas
```http
POST /api/tasks/submissions/{submission_id}/grade/
{
  "score": 85,
  "feedback": "Excelente trabajo, muy bien estructurado...",
  "graded_by": instructor_id,
  "rubric_scores": {
    "criteria_1": 35,
    "criteria_2": 30,
    "criteria_3": 20
  }
}
```
- ✅ **Verificaciones**:
  - Calificación registrada
  - Feedback guardado
  - Notificación enviada al estudiante
  - Historial de calificaciones actualizado

#### 5.4 Generar Reportes
```http
GET /api/courses/{course_id}/reports/progress/
```
- ✅ **Verificaciones**:
  - Reporte de progreso generado
  - Métricas de participación
  - Estadísticas de rendimiento
  - Exportación disponible

## 👨‍💼 Flujo Completo de Administrador

### Escenario 6: Gestión del Sistema
**Objetivo**: Verificar las funcionalidades administrativas del sistema

**Pasos del Flujo**:

#### 6.1 Dashboard Administrativo
```http
GET /api/admin/dashboard/
```
- ✅ **Verificaciones**:
  - Métricas generales del sistema
  - Usuarios activos
  - Cursos activos
  - Actividad reciente

#### 6.2 Gestión de Usuarios
```http
GET /api/users/?role=instructor&status=active
```
- ✅ **Verificaciones**:
  - Lista de usuarios filtrada
  - Información de roles
  - Estado de cuentas
  - Acciones disponibles

#### 6.3 Operaciones Masivas
```http
POST /api/courses/bulk-activate/
{
  "course_ids": [1, 2, 3, 4, 5],
  "action": "activate"
}
```
- ✅ **Verificaciones**:
  - Operación masiva ejecutada
  - Todos los cursos afectados
  - Log de operación registrada
  - Notificaciones enviadas

#### 6.4 Configuración del Sistema
```http
POST /api/admin/settings/
{
  "max_students_per_course": 50,
  "enable_registrations": true,
  "maintenance_mode": false,
  "email_notifications": true
}
```
- ✅ **Verificaciones**:
  - Configuración actualizada
  - Cambios aplicados inmediatamente
  - Validación de parámetros
  - Log de cambios registrado

### Escenario 7: Monitoreo y Auditoría
**Objetivo**: Verificar las capacidades de monitoreo del sistema

**Pasos del Flujo**:

#### 7.1 Logs del Sistema
```http
GET /api/admin/logs/?level=error&date_from=2025-09-01&date_to=2025-09-30
```
- ✅ **Verificaciones**:
  - Logs filtrados correctamente
  - Información detallada de errores
  - Paginación implementada
  - Exportación disponible

#### 7.2 Auditoría de Acciones
```http
GET /api/admin/audit/?action=user_login&user_type=student&limit=100
```
- ✅ **Verificaciones**:
  - Acciones auditadas correctamente
  - Información de usuario incluida
  - Timestamp preciso
  - Filtros funcionando

#### 7.3 Métricas de Performance
```http
GET /api/admin/metrics/performance/
```
- ✅ **Verificaciones**:
  - Métricas de respuesta de API
  - Uso de recursos del sistema
  - Métricas de base de datos
  - Alertas de performance

## 🔄 Flujos de Integración Cruzada

### Escenario 8: Notificaciones en Tiempo Real
**Objetivo**: Verificar que las notificaciones funcionan en todos los módulos

**Eventos a Probar**:
- ✅ Nuevo mensaje en chat de curso
- ✅ Respuesta en foro
- ✅ Entrega de tarea
- ✅ Calificación recibida
- ✅ Recordatorio de plazo
- ✅ Anuncio del sistema

### Escenario 9: Búsqueda Global
**Objetivo**: Verificar la funcionalidad de búsqueda en todo el sistema

**Búsquedas a Probar**:
```http
GET /api/search/?q=archivistica&modules=courses,lessons,forum
GET /api/search/?q=digital&type=files&category=documentos
GET /api/search/?q=estudiante&modules=users&role=student
```

### Escenario 10: Flujo de Videoconferencia
**Objetivo**: Verificar integración con sistema de videoconferencias

**Pasos del Flujo**:
1. **Crear Sesión**
   - POST /api/videoconference/sessions/
   - ✅ Verificar: sesión creada en Jitsi

2. **Unirse a Sesión**
   - GET /api/videoconference/sessions/{id}/join/
   - ✅ Verificar: enlace de Jitsi generado

3. **Grabar Sesión**
   - POST /api/videoconference/sessions/{id}/record/
   - ✅ Verificar: grabación iniciada

## 📊 Métricas de Éxito por Flujo

### Flujo de Estudiante
- ✅ **Tasa de Conversión**: 95% (registro → primer curso)
- ✅ **Tiempo de Completitud**: < 30 minutos
- ✅ **Satisfacción**: > 4.5/5
- ✅ **Retención**: > 80%

### Flujo de Instructor
- ✅ **Tasa de Creación**: 90% (inicio → curso publicado)
- ✅ **Tiempo de Creación**: < 2 horas
- ✅ **Calidad de Contenido**: > 4.0/5
- ✅ **Participación Estudiantes**: > 70%

### Flujo de Administrador
- ✅ **Tiempo de Respuesta**: < 500ms
- ✅ **Operaciones Masivas**: 100% exitosas
- ✅ **Monitoreo**: 24/7 disponible
- ✅ **Seguridad**: 0 brechas

## 🎯 Recomendaciones de Mejora

### Optimizaciones Identificadas
1. **Onboarding**: Mejorar tutorial inicial para estudiantes
2. **Performance**: Optimizar carga de cursos populares
3. **UI/UX**: Simplificar navegación en móviles
4. **Analytics**: Implementar seguimiento detallado de comportamiento
5. **Gamification**: Agregar elementos de gamificación

### Próximos Pasos
1. Implementar A/B testing para flujos críticos
2. Monitoreo continuo de métricas de usuario
3. Optimización basada en datos de uso real
4. Expansión de funcionalidades según feedback

---

**Estado**: ✅ Completado
**Cobertura**: 100% de flujos principales
**Última Actualización**: Septiembre 2025