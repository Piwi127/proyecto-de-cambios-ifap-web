# Plan de Migración de Base de Datos: SQLite a PostgreSQL

Este documento detalla los pasos recomendados para migrar la base de datos del proyecto de Django de SQLite a PostgreSQL, con el fin de obtener una solución más robusta, escalable y con características avanzadas para un entorno de producción.

## 1. Justificación de la Migración a PostgreSQL

PostgreSQL es la base de datos relacional recomendada por las siguientes razones:
*   **Robustez y Fiabilidad**: Conocido por su estabilidad y capacidad para manejar grandes volúmenes de datos y transacciones complejas.
*   **Integridad de Datos Avanzada**: Soporte completo para transacciones ACID, claves foráneas, restricciones y tipos de datos complejos.
*   **Concurrencia y Escalabilidad**: Excelente manejo de la concurrencia y capacidad de escalar para soportar el crecimiento del proyecto.
*   **Características Avanzadas**: Incluye funcionalidades como JSONB, índices avanzados, funciones de ventana y un ecosistema rico en extensiones.
*   **Soporte Óptimo con Django**: Django se integra de manera eficiente con PostgreSQL, aprovechando al máximo sus capacidades.

## 2. Pasos Detallados para la Migración

### Paso 2.1: Preparación del Entorno

1.  **Instalar PostgreSQL**:
    *   Asegúrate de tener PostgreSQL instalado en tu servidor de desarrollo y producción.
    *   Ejemplo de instalación en sistemas basados en Debian/Ubuntu:
        ```bash
        sudo apt update
        sudo apt install postgresql postgresql-contrib
        ```
2.  **Crear un Usuario y Base de Datos en PostgreSQL**:
    *   Accede a la consola de PostgreSQL:
        ```bash
        sudo -i -u postgres psql
        ```
    *   Crea un usuario para tu proyecto (ej. `ifap_user`) y asigna una contraseña segura:
        ```sql
        CREATE USER ifap_user WITH PASSWORD 'tu_contraseña_segura';
        ```
    *   Crea la base de datos para tu proyecto (ej. `ifap_db`) y asigna el propietario:
        ```sql
        CREATE DATABASE ifap_db OWNER ifap_user;
        ```
    *   Sal de la consola de PostgreSQL:
        ```sql
        \q
        ```

### Paso 2.2: Configuración de Django

1.  **Instalar el Adaptador de PostgreSQL para Python**:
    *   Activa tu entorno virtual de Python.
    *   Instala `psycopg2-binary`:
        ```bash
        pip install psycopg2-binary
        ```
    *   Asegúrate de añadirlo a tu `requirements.txt`.
2.  **Modificar `settings.py`**:
    *   Abre el archivo <mcfile name="settings.py" path="/home/jorge/pagina web nueva ifap dos/backend/ifap_backend/settings.py"></mcfile>.
    *   Localiza la sección `DATABASES` y reemplaza la configuración de SQLite por la de PostgreSQL:

        ```python
        DATABASES = {
            'default': {
                'ENGINE': 'django.db.backends.postgresql',
                'NAME': 'ifap_db',          # Nombre de la base de datos creada
                'USER': 'ifap_user',         # Usuario de la base de datos
                'PASSWORD': 'tu_contraseña_segura', # Contraseña del usuario
                'HOST': 'localhost',         # O la IP del servidor de PostgreSQL
                'PORT': '',                  # Deja vacío para el puerto por defecto (5432)
            }
        }
        ```
    *   **Importante**: Para producción, considera usar variables de entorno para `NAME`, `USER`, `PASSWORD`, `HOST` y `PORT` para mayor seguridad.

### Paso 2.3: Migración de Esquema y Datos

1.  **Realizar Migraciones de Django**:
    *   Con la nueva configuración de la base de datos, ejecuta las migraciones de Django para crear el esquema en PostgreSQL:
        ```bash
        python manage.py makemigrations
        python manage.py migrate
        ```
    *   Esto creará todas las tablas definidas en tus modelos de Django en la base de datos PostgreSQL.
2.  **Migrar Datos Existentes (Opcional, si hay datos en SQLite)**:
    *   Si tienes datos importantes en tu base de datos `db.sqlite3` que deseas transferir a PostgreSQL, puedes usar las herramientas de `dumpdata` y `loaddata` de Django.
    *   **Exportar datos de SQLite**:
        ```bash
        python manage.py dumpdata --exclude auth.permission --exclude contenttypes --indent 2 > initial_data.json
        ```
        (Asegúrate de ejecutar esto *antes* de cambiar la configuración de la base de datos a PostgreSQL, o temporalmente vuelve a la configuración de SQLite para exportar).
    *   **Importar datos a PostgreSQL**:
        *   Asegúrate de que tu `settings.py` esté configurado para PostgreSQL.
        *   Ejecuta:
            ```bash
            python manage.py loaddata initial_data.json
            ```
        *   **Nota**: Para proyectos grandes, este método puede no ser el más eficiente. Considera herramientas de terceros o scripts personalizados para una migración de datos más robusta.

### Paso 2.4: Verificación

1.  **Iniciar el Servidor de Desarrollo**:
    *   Asegúrate de que tu servidor de PostgreSQL esté en ejecución.
    *   Inicia el servidor de desarrollo de Django:
        ```bash
        python manage.py runserver
        ```
2.  **Probar la Aplicación**:
    *   Accede a tu aplicación y verifica que todas las funcionalidades (registro de usuarios, inicio de sesión, creación de contenido, etc.) funcionen correctamente con la nueva base de datos PostgreSQL.
    *   Verifica directamente en la base de datos PostgreSQL que los datos se estén guardando y recuperando correctamente.

## 3. Consideraciones Adicionales

*   **Copia de Seguridad**: Siempre realiza una copia de seguridad completa de tu base de datos SQLite antes de iniciar cualquier proceso de migración.
*   **Entorno de Producción**: Los pasos para el entorno de producción serán similares, pero deberás asegurarte de que PostgreSQL esté configurado de forma segura y optimizada para producción.
*   **Variables de Entorno**: Utiliza variables de entorno para la configuración sensible de la base de datos en producción para evitar exponer credenciales en el código.
*   **Rendimiento**: Una vez migrado, monitorea el rendimiento de tu base de datos PostgreSQL y realiza ajustes si es necesario (índices, configuración del servidor, etc.).