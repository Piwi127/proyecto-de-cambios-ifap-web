# README del Frontend

## Descripción del Proyecto
Este proyecto frontend es la interfaz de usuario para la plataforma educativa IFAP. Desarrollado con React, proporciona un panel de control para profesores, gestión de cursos, notificaciones en tiempo real y otras funcionalidades interactivas para una experiencia de usuario fluida y eficiente.

## Estructura del Proyecto
```
frontend/
├── public/                  # Archivos estáticos públicos
│   ├── index.html           # Punto de entrada HTML principal
│   └── assets/              # Recursos estáticos (imágenes, fuentes, etc.)
│
├── src/                     # Código fuente principal
│   ├── assets/              # Imágenes, iconos y otros recursos estáticos específicos de la aplicación
│   ├── components/          # Componentes React reutilizables (ej. Card, Navbar, Button)
│   ├── context/             # Contextos de React para gestión de estado global (ej. AuthContext)
│   ├── hooks/               # Custom Hooks de React para lógica reutilizable (ej. useWebSocket)
│   ├── pages/               # Vistas/páginas principales de la aplicación (ej. DashboardProfesor, Login)
│   ├── services/            # Lógica para interactuar con la API backend y servicios externos (ej. authService, courseService, notificationService)
│   ├── styles/              # Archivos de estilos globales o específicos (ej. index.css, App.css)
│   ├── utils/               # Funciones utilitarias y helpers (ej. validation.js)
│   ├── App.jsx              # Componente raíz de la aplicación
│   └── main.jsx             # Punto de entrada de la aplicación React
│
├── .env.development         # Variables de entorno para desarrollo
├── .env.production          # Variables de entorno para producción
├── package.json             # Dependencias y scripts del proyecto
├── vite.config.js           # Configuración de Vite
└── README.md                # Este archivo
```

## Tecnologías Utilizadas
- **Framework**: React (v18+)
- **Gestión de estado**: React Context API (para autenticación y otros estados globales)
- **Estilos**: Tailwind CSS (para un desarrollo rápido y consistente de la UI)
- **Routing**: React Router DOM (para la navegación entre páginas)
- **Comunicación con API**: Axios (para peticiones HTTP)
- **WebSockets**: Native WebSocket API (para notificaciones en tiempo real)
- **Bundler**: Vite (para un entorno de desarrollo rápido y optimización de build)
- **Linting**: ESLint (para mantener la calidad y consistencia del código)
- **Formateo**: Prettier (para formateo automático del código)

## Requisitos del Sistema
- Node.js (versión 18 o superior)
- npm (versión 9 o superior)

## Configuración del Entorno
Sigue estos pasos para configurar y ejecutar el proyecto en tu entorno local:

1.  **Clonar el repositorio**:
    ```bash
    git clone <URL_DEL_REPOSITORIO>
    cd frontend
    ```

2.  **Instalar dependencias**:
    ```bash
    npm install
    ```

3.  **Configurar variables de entorno**:
    Crea un archivo `.env.development` en la raíz del directorio `frontend/` y añade las siguientes variables. Puedes basarte en un archivo `.env.example` si existe.

    ```
    VITE_API_URL=http://localhost:8000/api
    VITE_WS_URL=ws://localhost:8000
    ```
    *   `VITE_API_URL`: URL base de tu API backend.
    *   `VITE_WS_URL`: URL base para las conexiones WebSocket.

4.  **Iniciar el servidor de desarrollo**:
    ```bash
    npm run dev
    ```
    Esto iniciará el servidor de desarrollo de Vite, generalmente en `http://localhost:5174`.

## Scripts Disponibles
-   `npm run dev`: Inicia el servidor de desarrollo con Vite.
-   `npm run build`: Compila la aplicación para producción en el directorio `dist/`.
-   `npm run lint`: Ejecuta ESLint para verificar problemas de estilo y errores en el código.
-   `npm run format`: Formatea automáticamente el código usando Prettier.

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
-   **Convención de nombres para componentes**: PascalCase (ej. `MyComponent.jsx`).
-   **Estructura de imports**: 
    1.  Módulos de React y librerías externas.
    2.  Componentes de la aplicación.
    3.  Contextos, hooks, servicios, utilidades.
    4.  Archivos de estilos.
-   **Reglas de linting**: Se aplican las reglas definidas en el archivo `.eslintrc.cjs` del proyecto. Se recomienda usar la extensión de ESLint en tu editor.
-   **Formateo**: Se utiliza Prettier para el formateo automático. Configurado en `.prettierrc.cjs`.

## Despliegue
El proceso de despliegue para el entorno de producción implica los siguientes pasos:

1.  **Generar la build de producción**:
    ```bash
    npm run build
    ```
    Esto creará una carpeta `dist/` con los archivos optimizados para producción.

2.  **Subir los archivos generados**:
    Los contenidos de la carpeta `dist/` deben ser subidos a tu servidor web (ej. Nginx, Apache, Vercel, Netlify).

3.  **Configurar el servidor web**:
    Asegúrate de que tu servidor web esté configurado para servir los archivos estáticos y manejar el enrutamiento del lado del cliente (generalmente configurando un fallback a `index.html` para rutas no encontradas).

## Troubleshooting
-   **`net::ERR_ABORTED` o página en blanco**:
    *   Asegúrate de que el servidor backend esté corriendo y accesible en `VITE_API_URL`.
    *   Intenta reiniciar el servidor de desarrollo de Vite con `npm run dev -- --force` para limpiar la caché.
    *   Verifica la consola del navegador para errores de JavaScript.
-   **Errores de conexión WebSocket**:
    *   Asegúrate de que el servidor backend esté ejecutando el servicio WebSocket y sea accesible en `VITE_WS_URL`.
    *   Verifica que el token de autenticación se esté enviando correctamente.
-   **Problemas de autenticación (tokens inválidos)**:
    *   Limpia el `localStorage` de tu navegador (tokens `access_token`, `refresh_token`, `user_data`).
    *   Intenta iniciar sesión nuevamente.

## Contribución
¡Agradecemos tus contribuciones! Para contribuir, por favor:

1.  Reporta cualquier issue o bug con la mayor cantidad de detalles posible.
2.  Sigue las guías de estilo y el flujo de trabajo de Git.
3.  Asegúrate de que tus cambios pasen las pruebas de linting y formateo.
4.  Prueba tus cambios localmente antes de enviar un Pull Request.

## Contacto
Para soporte técnico o preguntas, por favor contacta a [aguilarmirandajorgerolando2@gmail.com].
