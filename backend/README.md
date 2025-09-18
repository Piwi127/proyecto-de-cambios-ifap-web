## Backend Setup

This document outlines the steps to set up and run the backend for the IFAP website.

### Prerequisites

Before you begin, ensure you have the following installed:

*   **Python 3.x**: It is recommended to use Python 3.8 or higher.
*   **pip**: Python package installer.
*   **virtualenv** (optional but recommended): For creating isolated Python environments.
*   **PostgreSQL (or compatible database)**: The project is configured to use PostgreSQL. Ensure you have it installed and running.
*   **libpq-dev**: Development libraries for PostgreSQL. On Debian/Ubuntu, install with `sudo apt-get install libpq-dev`.

### Installation Steps

1.  **Navigate to the backend directory:**

    ```bash
    cd /home/jorge/pagina web nueva ifap dos/backend
    ```

2.  **Create and activate a virtual environment (recommended):**

    ```bash
    python3 -m venv venv
    source venv/bin/activate
    ```

3.  **Install Python dependencies:**

    ```bash
    pip install -r requirements.txt
    ```

    *Note: If you encounter issues with `psycopg2-binary` or `Pillow`, ensure `libpq-dev` is installed and try installing them individually or without specifying a version if a specific version causes conflicts.*

4.  **Apply database migrations:**

    ```bash
    python3 manage.py migrate
    ```

5.  **Create a superuser (for Django Admin access):**

    ```bash
    python3 manage.py createsuperuser
    ```

6.  **Populate initial course data (optional):**

    If you have a `populate_courses.py` management command, you can run it to add initial course data:

    ```bash
    python3 manage.py populate_courses
    ```

7.  **Run the development server:**

    ```bash
    python3 manage.py runserver
    ```

    The backend server will typically run on `http://localhost:8000/`.

### Configuration

*   **Database Settings**: Database configuration is located in `ifap_backend/settings.py`. Ensure your PostgreSQL settings are correctly configured.
*   **Environment Variables**: Sensitive information and settings can be managed using environment variables (e.g., `python-decouple`).

### API Endpoints

Refer to `INTEGRACION_BACKEND_FRONTEND.md` for details on available API endpoints.