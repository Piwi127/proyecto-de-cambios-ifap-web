# Estructura del Frontend - IFAP

## Descripción General
El frontend del IFAP está construido con React y utiliza Tailwind CSS para los estilos. La aplicación está estructurada de manera modular y sigue las mejores prácticas de desarrollo web moderno.

## Tecnologías Principales
- React
- Tailwind CSS
- React Router DOM
- Material UI
- Axios (para peticiones HTTP)
- Vite (como bundler)

## Estructura de Carpetas

```
frontend/
├── src/
│   ├── assets/         # Imágenes, iconos y recursos estáticos
│   ├── components/     # Componentes reutilizables
│   ├── context/        # Contextos de React para estado global
│   ├── pages/          # Páginas/vistas principales
│   ├── services/       # Servicios para API y lógica de negocio
│   └── utils/          # Utilidades y funciones auxiliares
├── public/             # Archivos públicos
└── dist/              # Archivos de producción compilados
```

## Componentes Principales

### Layout (`Layout.jsx`)
- Componente contenedor principal
- Estructura básica con navbar y footer
- Maneja la disposición general de la aplicación

### NavbarModern (`NavbarModern.jsx`)
- Barra de navegación moderna y responsive
- Menú desplegable para móviles
- Enlaces a las secciones principales

### Páginas Principales

#### Home (`HomeModern.jsx`)
- Página de inicio con diseño moderno
- Secciones:
  - Hero con carrusel
  - Misión y Visión
  - Estadísticas
  - Cursos destacados
  - Testimonios

#### Aula Virtual
- Dashboard del estudiante
- Perfil del estudiante
- Cursos disponibles
- Calendario
- Foro
- Mensajes
- Notificaciones
- Tareas
- Configuración

#### Cursos
- Archivística Básica
- Gestión Digital
- Archivos Históricos
- Preservación de Documentos

## Estilos y Temas

### Configuración de Tailwind (`tailwind.config.js`)
- Colores personalizados:
  - Primary: Verde (#22c55e)
  - Secondary: Amarillo (#eab308)
  - Neutral: Grises
- Fuentes:
  - Principal: Inter
- Animaciones personalizadas
- Efectos y transiciones

### Estilos Globales (`index.css`)
- Directivas de Tailwind
- Estilos base
- Componentes personalizados
- Utilidades

## Rutas y Navegación

### Rutas Públicas
- `/` - Inicio
- `/about` - Acerca de
- `/contacto` - Contacto
- `/blog` - Blog
- `/login` - Inicio de sesión
- `/dashboard` - Panel principal

### Rutas de Cursos
- `/cursos/archivistica-basica`
- `/cursos/gestion-digital`
- `/cursos/archivos-historicos`
- `/cursos/preservacion`

### Rutas Protegidas (Aula Virtual)
- `/aula-virtual`
- `/aula-virtual/perfil`
- `/aula-virtual/cursos`
- `/aula-virtual/calendario`
- `/aula-virtual/foro`
- `/aula-virtual/mensajes`
- `/aula-virtual/notificaciones`
- `/aula-virtual/tareas`
- `/aula-virtual/configuracion`

## Integración con Backend
- Comunicación mediante API REST
- Autenticación mediante tokens
- Manejo de sesiones y estado global
- Integración con servicios del backend Django

## Características de Diseño
- Diseño responsive
- Temas claro/oscuro
- Animaciones y transiciones suaves
- Componentes interactivos
- Accesibilidad (WCAG)
- Optimización de rendimiento

## Desarrollo y Despliegue
- Entorno de desarrollo con Vite
- Scripts de construcción optimizados
- Configuración de ESLint
- Compresión y optimización de assets