# README del Backend

## Descripción del Proyecto
Este proyecto backend es el corazón de la plataforma educativa IFAP, desarrollado con Django y Django REST Framework. Proporciona la API necesaria para la gestión de usuarios, cursos, lecciones, cuestionarios y notificaciones en tiempo real, sirviendo como el cerebro detrás de la aplicación frontend.

## Estructura del Proyecto
```
backend/
├── ifap_backend/            # Configuración principal del proyecto Django
│   ├── __init__.py
│   ├── asgi.py              # Configuración ASGI para servidores asíncronos (WebSockets)
│   ├── consumers.py         # Manejadores de WebSocket para notificaciones en tiempo real
│   ├── routing.py           # Enrutamiento de WebSocket
│   ├── settings.py          # Configuración del proyecto (base de datos, apps, etc.)
│   ├── urls.py              # URLs globales del proyecto
│   └── wsgi.py              # Configuración WSGI para servidores síncronos
│
├── users/                   # Aplicación Django para la gestión de usuarios y autenticación
│   ├── migrations/          # Migraciones de base de datos para el modelo de usuario
│   ├── models.py            # Modelos de usuario
│   ├── serializers.py       # Serializadores para la API REST de usuarios
│   ├── views.py             # Vistas de la API REST de usuarios
│   └── urls.py              # URLs de la aplicación de usuarios
│
├── courses/                 # Aplicación Django para la gestión de cursos
│   ├── migrations/
│   ├── models.py
│   ├── serializers.py
│   ├── views.py
│   └── urls.py
│
├── lessons/                 # Aplicación Django para la gestión de lecciones
│   ├── migrations/
│   ├── models.py
│   ├── serializers.py
│   ├── views.py
│   └── urls.py
│
├── quizzes/                 # Aplicación Django para la gestión de cuestionarios
│   ├── migrations/
│   ├── models.py
│   ├── serializers.py
│   ├── views.py
│   └── urls.py
│
├── notifications/           # Aplicación Django para la gestión de notificaciones
│   ├── migrations/
│   ├── models.py
│   ├── serializers.py
│   ├── views.py
│   ├── utils.py             # Utilidades para el manejo de notificaciones
│   └── urls.py
│
├── venv/                    # Entorno virtual de Python
├── manage.py                # Utilidad de línea de comandos de Django
├── requirements.txt         # Dependencias del proyecto Python
├── db.sqlite3               # Base de datos SQLite (solo para desarrollo)
└── README.md                # Este archivo
```

## Tecnologías Utilizadas
-   **Framework Web**: Django (v4.x)
-   **API REST**: Django REST Framework (DRF)
-   **Base de Datos**: PostgreSQL (producción), SQLite (desarrollo)
-   **Servidor Asíncrono**: Daphne (para WebSockets)
-   **Autenticación**: JWT (JSON Web Tokens) con `djangorestframework-simplejwt`
-   **WebSockets**: Django Channels (para notificaciones en tiempo real)
-   **Celery**: Para tareas asíncronas y programación de tareas (si aplica)
-   **Redis**: Como broker para Celery y Channel Layers (si aplica)

## Requisitos del Sistema
-   Python (versión 3.9 o superior)
-   pip (administrador de paquetes de Python)
-   PostgreSQL (para entorno de producción)

## Configuración del Entorno
Sigue estos pasos para configurar y ejecutar el proyecto en tu entorno local:

1.  **Clonar el repositorio**:
    ```bash
    git clone <URL_DEL_REPOSITORIO>
    cd backend
    ```

2.  **Crear y activar un entorno virtual**:
    ```bash
    python3 -m venv venv
    source venv/bin/activate
    ```

3.  **Instalar dependencias**:
    ```bash
    pip install -r requirements.txt
    ```

4.  **Configurar variables de entorno**:
    Crea un archivo `.env` en la raíz del directorio `backend/` y añade las siguientes variables. Puedes basarte en un archivo `.env.example` si existe.

    ```
    SECRET_KEY='tu_clave_secreta_de_django'
    DEBUG=True
    ALLOWED_HOSTS='localhost,127.0.0.1'
    DATABASE_URL='sqlite:///db.sqlite3' # O tu URL de PostgreSQL
    # Para WebSockets
    CHANNEL_LAYERS_REDIS_URL='redis://localhost:6379/1' # Si usas Redis
    ```
    *   `SECRET_KEY`: Clave secreta de Django (¡generar una nueva para producción!).
    *   `DEBUG`: `True` para desarrollo, `False` para producción.
    *   `ALLOWED_HOSTS`: Hosts permitidos para tu aplicación.
    *   `DATABASE_URL`: URL de conexión a tu base de datos. Para desarrollo, `sqlite:///db.sqlite3` es suficiente.
    *   `CHANNEL_LAYERS_REDIS_URL`: URL de conexión a Redis si usas Django Channels con Redis como backend.

5.  **Aplicar migraciones de base de datos**:
    ```bash
    python manage.py migrate
    ```

6.  **Crear un superusuario (opcional)**:
    ```bash
    python manage.py createsuperuser
    ```

7.  **Iniciar el servidor de desarrollo**:
    Para el servidor web HTTP (API REST):
    ```bash
    python manage.py runserver
    ```
    Para el servidor ASGI (WebSockets con Daphne):
    ```bash
    daphne -b 0.0.0.0 -p 8000 ifap_backend.asgi:application
    ```
    Esto iniciará el servidor en `http://localhost:8000`.

## Scripts Disponibles
-   `python manage.py runserver`: Inicia el servidor de desarrollo HTTP.
-   `daphne -b 0.0.0.0 -p 8000 ifap_backend.asgi:application`: Inicia el servidor ASGI para WebSockets.
-   `python manage.py migrate`: Aplica las migraciones de la base de datos.
-   `python manage.py makemigrations <app_name>`: Crea nuevas migraciones para una aplicación específica.
-   `python manage.py createsuperuser`: Crea un usuario administrador.
-   `pip install -r requirements.txt`: Instala las dependencias del proyecto.
-   `pip freeze > requirements.txt`: Genera el archivo `requirements.txt` con las dependencias actuales.

## Flujo de Trabajo
Para contribuir al proyecto, sigue el siguiente flujo de trabajo:

1.  **Crear una nueva rama**:
    ```bash
    git checkout -b feature/nombre-de-tu-feature
    ```
    O `bugfix/nombre-del-bug`, `hotfix/nombre-del-hotfix`, etc.

2.  **Realizar cambios y commits descriptivos**:
    Asegúrate de que tus mensajes de commit sean claros y concisos.

3.  **Subir tus cambios**:
    ```bash
    git push origin feature/nombre-de-tu-feature
    ```

4.  **Crear un Pull Request (PR)**:
    Abre un PR a la rama `main` (o la rama de desarrollo principal) para que tus cambios sean revisados y fusionados.

## Guía de Estilos
-   **PEP 8**: Sigue las directrices de estilo de código de Python (PEP 8).
-   **Django Best Practices**: Adhiérete a las mejores prácticas de desarrollo de Django.
-   **Nombres de modelos**: Singular, PascalCase (ej. `Course`, `Lesson`).
-   **Nombres de campos**: snake_case (ej. `created_at`, `user_id`).
-   **Docstrings**: Utiliza docstrings para documentar módulos, clases y funciones.

## Despliegue
El proceso de despliegue para el entorno de producción implica los siguientes pasos:

1.  **Configuración de variables de entorno de producción**:
    Asegúrate de que `DEBUG=False` y `SECRET_KEY` sea una clave fuerte y única. Configura `ALLOWED_HOSTS` con los dominios de producción.

2.  **Base de datos de producción**:
    Configura `DATABASE_URL` para tu base de datos PostgreSQL en producción.

3.  **Instalar dependencias de producción**:
    ```bash
    pip install -r requirements.txt
    ```

4.  **Recopilar archivos estáticos**:
    ```bash
    python manage.py collectstatic
    ```

5.  **Aplicar migraciones**:
    ```bash
    python manage.py migrate
    ```

6.  **Servidor Web (Gunicorn/uWSGI)**:
    Utiliza un servidor WSGI como Gunicorn o uWSGI para servir la aplicación Django.
    Ejemplo con Gunicorn:
    ```bash
    gunicorn ifap_backend.wsgi:application --bind 0.0.0.0:8000
    ```

7.  **Servidor ASGI (Daphne)**:
    Para WebSockets, utiliza Daphne.
    ```bash
    daphne -b 0.0.0.0 -p 8001 ifap_backend.asgi:application
    ```

8.  **Proxy Inverso (Nginx/Apache)**:
    Configura un proxy inverso (Nginx o Apache) para dirigir el tráfico HTTP/HTTPS a Gunicorn y el tráfico WebSocket a Daphne.

## Troubleshooting
-   **Errores 500 en producción**:
    *   Verifica los logs del servidor (Gunicorn/uWSGI, Nginx/Apache).
    *   Asegúrate de que `DEBUG` esté en `False` y `ALLOWED_HOSTS` esté configurado correctamente.
    *   Revisa la conexión a la base de datos.
-   **Problemas de conexión WebSocket**:
    *   Asegúrate de que Daphne esté corriendo y sea accesible.
    *   Verifica la configuración de `CHANNEL_LAYERS` en `settings.py`.
    *   Revisa los logs de Daphne y Redis.
-   **Errores de migración**:
    *   Asegúrate de que la base de datos esté accesible y los permisos sean correctos.
    *   Verifica que no haya conflictos en las migraciones.

## Contribución
¡Agradecemos tus contribuciones! Para contribuir, por favor:

1.  Reporta cualquier issue o bug con la mayor cantidad de detalles posible.
2.  Sigue las guías de estilo y el flujo de trabajo de Git.
3.  Asegúrate de que tus cambios pasen las pruebas y el linting.
4.  Prueba tus cambios localmente antes de enviar un Pull Request.

## Contacto
Para soporte técnico o preguntas, por favor contacta a [tu_email@ejemplo.com].