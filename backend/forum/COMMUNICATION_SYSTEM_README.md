# Sistema de Comunicación IFAP

Este documento describe el sistema completo de comunicación implementado para la plataforma IFAP, incluyendo foros de discusión, comentarios en lecciones y mensajería privada.

## Componentes del Sistema

### 1. Foros de Discusión
- **Categorías**: Organizan los temas por curso o materia
- **Temas**: Discusiones principales con título y contenido
- **Respuestas**: Comentarios en hilos de discusión
- **Likes**: Sistema de votación positiva
- **Moderación**: Fijar, bloquear y gestionar temas

### 2. Comentarios en Lecciones
- **Comentarios principales**: Comentarios directos en lecciones
- **Respuestas**: Hilos de conversación anidados
- **Likes**: Sistema de votación en comentarios
- **Tiempo real**: Actualizaciones en vivo vía WebSocket

### 3. Mensajería Privada
- **Conversaciones individuales**: Chat uno a uno
- **Conversaciones grupales**: Chat con múltiples participantes
- **Archivos**: Compartir archivos en mensajes
- **Reacciones**: Sistema de emojis en mensajes
- **Indicadores de escritura**: Mostrar cuando alguien está escribiendo
- **Marcas de leído**: Confirmación de mensajes leídos

## API Endpoints

### Foros de Discusión
```
GET    /api/forum/categories/           # Listar categorías
POST   /api/forum/categories/           # Crear categoría
GET    /api/forum/topics/               # Listar temas
POST   /api/forum/topics/               # Crear tema
GET    /api/forum/topics/{id}/          # Detalle de tema
PUT    /api/forum/topics/{id}/          # Actualizar tema
DELETE /api/forum/topics/{id}/          # Eliminar tema
POST   /api/forum/topics/{id}/toggle_like/    # Like/Unlike tema
POST   /api/forum/topics/{id}/toggle_pin/     # Fijar/Desfijar tema
POST   /api/forum/topics/{id}/toggle_lock/    # Bloquear/Desbloquear tema
GET    /api/forum/replies/              # Listar respuestas
POST   /api/forum/replies/              # Crear respuesta
POST   /api/forum/replies/{id}/toggle_like/   # Like/Unlike respuesta
GET    /api/forum/stats/overview/       # Estadísticas generales
GET    /api/forum/stats/user_stats/     # Estadísticas del usuario
```

### Comentarios en Lecciones
```
GET    /api/forum/lesson-comments/?lesson={id}     # Listar comentarios de lección
POST   /api/forum/lesson-comments/                  # Crear comentario
PUT    /api/forum/lesson-comments/{id}/             # Actualizar comentario
DELETE /api/forum/lesson-comments/{id}/             # Eliminar comentario
POST   /api/forum/lesson-comments/{id}/toggle_like/ # Like/Unlike comentario
DELETE /api/forum/lesson-comments/{id}/soft_delete/ # Eliminación suave
```

### Mensajería Privada
```
GET    /api/forum/conversations/                    # Listar conversaciones
POST   /api/forum/conversations/                    # Crear conversación
GET    /api/forum/conversations/{id}/               # Detalle de conversación
PUT    /api/forum/conversations/{id}/               # Actualizar conversación
DELETE /api/forum/conversations/{id}/               # Eliminar conversación
GET    /api/forum/conversations/{id}/messages/      # Mensajes de conversación
POST   /api/forum/conversations/{id}/add_participants/    # Agregar participantes
POST   /api/forum/conversations/{id}/remove_participants/ # Remover participantes
GET    /api/forum/messages/                         # Listar mensajes
POST   /api/forum/messages/                         # Enviar mensaje
PUT    /api/forum/messages/{id}/                    # Editar mensaje
DELETE /api/forum/messages/{id}/                    # Eliminar mensaje
POST   /api/forum/messages/{id}/mark_as_read/       # Marcar como leído
POST   /api/forum/messages/{id}/add_reaction/       # Agregar reacción
DELETE /api/forum/messages/{id}/remove_reaction/    # Remover reacción
POST   /api/forum/typing-indicators/start_typing/   # Iniciar indicador de escritura
POST   /api/forum/typing-indicators/stop_typing/    # Detener indicador de escritura
```

## WebSocket Endpoints

### Mensajería en Tiempo Real
```
ws/messaging/{conversation_id}/?token={auth_token}
```

**Mensajes del cliente:**
```json
{
  "type": "message",
  "content": "Hola mundo",
  "message_type": "text"
}
```

```json
{
  "type": "typing_start"
}
```

```json
{
  "type": "typing_stop"
}
```

```json
{
  "type": "reaction",
  "message_id": 123,
  "reaction": "👍"
}
```

**Mensajes del servidor:**
```json
{
  "type": "message",
  "message": {
    "id": 123,
    "sender": {"id": 1, "username": "usuario"},
    "content": "Hola mundo",
    "created_at": "2024-01-01T12:00:00Z"
  }
}
```

```json
{
  "type": "typing",
  "user": {"id": 1, "username": "usuario"},
  "action": "start"
}
```

```json
{
  "type": "reaction",
  "message_id": 123,
  "reaction": "👍",
  "user": {"id": 1, "username": "usuario"}
}
```

### Comentarios en Lecciones en Tiempo Real
```
ws/lesson-comments/{lesson_id}/?token={auth_token}
```

**Mensajes del cliente:**
```json
{
  "type": "comment",
  "content": "Excelente explicación",
  "parent_comment_id": null
}
```

```json
{
  "type": "like",
  "comment_id": 123
}
```

**Mensajes del servidor:**
```json
{
  "type": "comment",
  "comment": {
    "id": 123,
    "author": {"id": 1, "username": "usuario"},
    "content": "Excelente explicación",
    "created_at": "2024-01-01T12:00:00Z"
  }
}
```

```json
{
  "type": "like",
  "comment_id": 123,
  "user": {"id": 1, "username": "usuario"},
  "liked": true
}
```

## Modelos de Datos

### Conversation
- `participants`: Usuarios en la conversación
- `subject`: Asunto (opcional)
- `is_group`: Si es conversación grupal
- `group_name`: Nombre del grupo
- `created_by`: Usuario que creó la conversación
- `last_message`: Último mensaje
- `updated_at`: Última actualización

### Message
- `conversation`: Conversación a la que pertenece
- `sender`: Usuario que envió el mensaje
- `content`: Contenido del mensaje
- `message_type`: Tipo (text, image, file, etc.)
- `file_url`: URL del archivo adjunto
- `is_edited`: Si el mensaje fue editado
- `created_at`: Fecha de creación

### LessonComment
- `lesson`: Lección a la que pertenece
- `author`: Usuario que creó el comentario
- `content`: Contenido del comentario
- `parent_comment`: Comentario padre (para respuestas)
- `is_reply`: Si es una respuesta
- `is_active`: Estado activo del comentario
- `created_at`: Fecha de creación

## Permisos y Seguridad

### Autenticación
- Todos los endpoints requieren autenticación JWT
- WebSocket requiere token de autenticación en query parameters

### Autorización
- **Comentarios**: Solo usuarios inscritos en el curso pueden comentar
- **Mensajes**: Solo participantes pueden ver/enviar mensajes
- **Foros**: Control de acceso por curso y permisos de instructor
- **Moderación**: Solo instructores pueden fijar/bloquear temas

### Validación
- Longitud máxima de mensajes: 1000 caracteres
- Tipos de archivo permitidos: imágenes, documentos, PDFs
- Tamaño máximo de archivos: 10MB
- Rate limiting: Prevención de spam

## Notificaciones

El sistema genera notificaciones automáticas para:
- Nuevos mensajes en conversaciones
- Nuevos comentarios en lecciones
- Likes en comentarios
- Nuevos temas en foros
- Nuevas respuestas en temas

## Tareas en Segundo Plano

### cleanup_old_typing_indicators
- Elimina indicadores de escritura antiguos (>30 segundos)
- Frecuencia: Cada 30 segundos

### update_conversation_last_message
- Actualiza el último mensaje de conversaciones
- Frecuencia: Cada 5 minutos

### mark_messages_as_read_for_inactive_users
- Marca mensajes como leídos para usuarios inactivos
- Frecuencia: Cada 10 minutos

## Configuración

### Variables de Entorno
```bash
# Configuración de archivos
MAX_FILE_SIZE=10485760  # 10MB
ALLOWED_FILE_TYPES=jpg,jpeg,png,pdf,doc,docx,txt

# Configuración de WebSocket
WEBSOCKET_HEARTBEAT=30  # segundos
WEBSOCKET_TIMEOUT=300   # segundos

# Configuración de notificaciones
NOTIFICATION_BATCH_SIZE=50
NOTIFICATION_RETENTION_DAYS=30
```

### Configuración de Django
```python
# settings.py
INSTALLED_APPS = [
    # ... otras apps
    'forum',
    'channels',
    'celery',
]

# Configuración de Channels
ASGI_APPLICATION = 'ifap_backend.asgi.application'

CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            'hosts': [('127.0.0.1', 6379)],
        },
    },
}

# Configuración de Celery
CELERY_BROKER_URL = 'redis://localhost:6379/0'
CELERY_RESULT_BACKEND = 'redis://localhost:6379/0'
CELERY_BEAT_SCHEDULE = {
    'cleanup-typing-indicators': {
        'task': 'forum.tasks.cleanup_old_typing_indicators',
        'schedule': 30.0,
    },
    'update-last-messages': {
        'task': 'forum.tasks.update_conversation_last_message',
        'schedule': 300.0,  # 5 minutos
    },
}
```

## Próximos Pasos

1. **Frontend Implementation**
   - Componentes React para mensajería
   - Interfaz de comentarios en lecciones
   - Integración WebSocket en tiempo real

2. **Características Avanzadas**
   - Mensajes temporales (que se autodestruyen)
   - Encriptación end-to-end
   - Búsqueda en mensajes
   - Archivos compartidos con preview

3. **Optimizaciones**
   - Paginación infinita
   - Compresión de imágenes
   - Cache de conversaciones frecuentes
   - Optimización de consultas N+1

4. **Monitoreo**
   - Métricas de uso
   - Logs de errores
   - Alertas de rendimiento
   - Backup de conversaciones

## Testing

### Pruebas Unitarias
```bash
# Ejecutar pruebas del foro
python manage.py test forum.tests

# Ejecutar pruebas de mensajería
python manage.py test forum.tests.test_messaging

# Ejecutar pruebas de comentarios
python manage.py test forum.tests.test_comments
```

### Pruebas de Integración
- WebSocket connections
- Notificaciones en tiempo real
- Autenticación y autorización
- Rate limiting

### Pruebas de Carga
- Múltiples usuarios simultáneos
- Gran volumen de mensajes
- Archivos grandes
- Conexiones WebSocket concurrentes