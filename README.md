# IFAP - Instituto de Formación y Actualización Profesional

Repositorio principal del proyecto IFAP: backend Django con API REST/WebSockets y frontend React + Vite.

## Estructura del Proyecto

- **backend/**: API Django (REST + Channels)
- **frontend/**: App React (Vite + Tailwind)
- **etherpad/**: Integración de Etherpad
- **docs/**: Documentación completa

## Tecnologias Aplicadas

**Backend**
- Django 4.2 + Django REST Framework
- JWT (djangorestframework-simplejwt)
- Channels + Daphne (WebSockets)
- Redis + channels-redis (capas de canales)
- drf-yasg (Swagger/OpenAPI)
- psycopg2-binary (PostgreSQL)
- Pillow, django-filter, django-cors-headers, django-redis, whitenoise
- Pytest + pytest-django + pytest-cov, factory-boy, Faker

**Frontend**
- React 19 + React Router
- Vite 7
- Tailwind CSS + PostCSS + Autoprefixer
- MUI (Material UI) + Emotion
- Axios
- Jitsi SDK
- WebSocket client

## Dependencias

**Backend** (ver `backend/requirements.txt`)
- Django==4.2.7
- djangorestframework==3.14.0
- djangorestframework-simplejwt==5.3.0
- django-cors-headers==4.3.1
- Pillow==11.3.0
- python-decouple==3.8
- psycopg2-binary==2.9.10
- django-filter==23.3
- drf-yasg==1.21.7
- channels==4.1.0
- channels-redis==4.2.0
- django-redis==5.4.0
- redis==5.0.1
- whitenoise==6.6.0
- pytest==7.4.3
- pytest-django==4.7.0
- pytest-cov==4.1.0
- factory-boy==3.3.0
- faker==20.1.0

**Frontend** (ver `frontend/package.json`)
- react, react-dom, react-router-dom
- vite, @vitejs/plugin-react
- tailwindcss, postcss, autoprefixer
- @mui/material, @mui/icons-material, @emotion/react, @emotion/styled
- axios
- @jitsi/react-sdk
- lucide-react
- websocket

## Requisitos

- Python 3.9+ y pip
- Node.js + npm
- PostgreSQL (produccion), SQLite (desarrollo)
- Redis (opcional para Channels/colas)

## Instalacion

**Backend**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
```

**Frontend**
```bash
cd frontend
npm install
```

## Ejecucion

**Modo rapido (recomendado)**
```bash
./start_servers.sh
```

**Detener servidores**
```bash
./stop_servers.sh
```

**Manualmente**
```bash
cd backend
python manage.py runserver
```
```bash
cd frontend
npm run dev
```

## Actualizaciones recientes (tareas y cursos)

### Cambios en backend
- **Respuesta consistente al crear tareas**: `POST /api/tasks/` ahora retorna el payload completo con `id` usando `TaskSerializer` en `TaskViewSet.create`.
- **Router de tasks corregido**: el registro del viewset principal se movio al final para no capturar rutas como `/api/tasks/comments/`.
- **Asignacion de estudiantes**: `assign_students` permite instructores y superusuarios; evita 403 inesperados.
- **Filtros por curso**: se corrigio el uso del campo `course__instructor` (el modelo usa `Course.instructor`), y se agrego acceso total para superusuarios.
- **Endpoint de estudiantes del curso**: se agrego `GET /api/courses/<id>/students/` y permisos adecuados en `CourseViewSet.get_permissions`.

### Cambios en frontend
- **Rutas de tareas**: se ajustaron endpoints para no duplicar `/api` (usa `baseURL` + `/tasks/...`).
- **Creacion de tareas**: el formulario evita enviar `max_score: null`; ahora se omite el campo si esta vacio.
- **Asignacion de estudiantes**: se evita llamar `/assign_students/` si no hay `id` y se maneja el error sin bloquear la creacion.

### Scripts y configuracion
- **start_servers.sh**: se elimino un `PYTHONPATH` hardcodeado que apuntaba a otro proyecto, asegurando que el backend se levante desde este repo.

## Pruebas y verificacion ejecutadas

Se validaron los endpoints clave con `APIClient` (Django), incluyendo:
- `POST /api/tasks/` -> 201 con `id`
- `POST /api/tasks/<id>/assign_students/` -> 200
- `GET /api/tasks/<id>/` -> 200
- `GET /api/tasks/<id>/assignments/` -> 200
- `GET /api/tasks/comments/` -> 200
- `GET /api/courses/<id>/students/` -> 200

## Notas de uso (tareas)

- Para crear y asignar tareas desde la UI, el usuario debe ser **instructor** o **admin**.
- El endpoint de estudiantes del curso requiere autenticacion y permisos de instructor/admin.

## Variables de Entorno

**Backend** (`backend/.env`)
- `SECRET_KEY`
- `DEBUG`
- `ALLOWED_HOSTS`
- `DATABASE_URL`
- `CHANNEL_LAYERS_REDIS_URL` (si usas Redis)

**Frontend** (`frontend/.env`)
- `VITE_API_URL` (default: `http://localhost:8000/api`)
- `VITE_WS_URL` (default: `ws://localhost:8000`)

## Estado del Proyecto

✅ Sistema funcional
- Backend Django en `http://localhost:8000`
- Frontend Vite en `http://localhost:5174`
- WebSockets activos
- Logs: `logs/backend.log`, `logs/frontend.log`

## Notas de Funcionalidad

- Recordatorios: el frontend incluye `ReminderModal`/`ReminderCard` y un `reminderService` con fallback a `localStorage` cuando el backend de `reminders` no esta disponible.
- En backend, la ruta `/api/reminders/` se registra solo si la app `reminders` existe.

## Documentacion

Consulta el indice en `docs/INDEX.md` para la guia completa de configuracion, pruebas y mantenimiento.
