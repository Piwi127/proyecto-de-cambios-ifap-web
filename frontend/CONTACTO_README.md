# Página de Contacto - IFAP

## Descripción
Página completa de contacto para el Instituto de Formación Archivística (IFAP) con formulario interactivo, información de contacto y funcionalidades avanzadas.

## Características Principales

### 📝 Formulario de Contacto
- **Campos requeridos**: Nombre, Email, Asunto, Mensaje
- **Campos opcionales**: Teléfono, Tipo de consulta
- **Validación en tiempo real**: Mensajes de error específicos para cada campo
- **Formateo automático**: Teléfono se formatea automáticamente
- **Sanitización**: Protección contra caracteres HTML maliciosos
- **Estados de carga**: Indicador visual durante el envío
- **Feedback visual**: Mensajes de éxito/error con colores diferenciados

### 📞 Información de Contacto
- **Dirección**: Av. Principal 123, Lima, Perú
- **Teléfono**: +51 1 234 5678
- **Email**: info@ifap.edu.pe
- **Horario**: Lunes - Viernes: 8:00 AM - 6:00 PM
- **Información dinámica**: Se carga desde API cuando está disponible

### 🎨 Características de UI/UX
- **Diseño responsivo**: Funciona en desktop, tablet y móvil
- **Animaciones suaves**: Transiciones y efectos hover
- **Tema consistente**: Sigue el diseño del resto de la aplicación
- **Accesibilidad**: Labels apropiados, navegación por teclado
- **Iconografía**: Emojis y iconos para mejor comprensión visual

### 🔗 Integración con API
- **Servicio de contacto**: `contactService.js` para envío de formularios
- **Manejo de errores**: Fallback a datos por defecto si API falla
- **Validación del lado cliente**: Antes de enviar a servidor

### 📱 Secciones Adicionales
- **Mapa interactivo**: Placeholder para futura implementación
- **Redes sociales**: Enlaces a Facebook, Twitter, Instagram, LinkedIn
- **Preguntas frecuentes**: Información útil sobre matrículas y certificaciones
- **Call-to-action**: Botones para llamar o enviar email directamente

## Estructura de Archivos

```
frontend/src/
├── pages/
│   └── Contacto.jsx          # Página principal de contacto
├── services/
│   └── contactService.js     # Servicio para API de contacto
└── utils/
    └── validation.js         # Utilidades de validación
```

## Validaciones Implementadas

### Nombre
- Obligatorio
- Mínimo 2 caracteres
- Sanitización de entrada

### Email
- Obligatorio
- Formato válido de email
- Sanitización de entrada

### Teléfono
- Opcional
- Formato válido (números, espacios, guiones, paréntesis)
- Formateo automático para números peruanos

### Asunto
- Obligatorio
- Mínimo 5 caracteres
- Sanitización de entrada

### Mensaje
- Obligatorio
- Mínimo 10 caracteres
- Sanitización de entrada

## Tipos de Consulta Disponibles
- Consulta General
- Información de Cursos
- Matrícula
- Certificación
- Soporte Técnico
- Otros

## Tecnologías Utilizadas
- **React**: Componentes funcionales con hooks
- **Tailwind CSS**: Estilos y diseño responsivo
- **React Router**: Navegación
- **Fetch API**: Comunicación con backend
- **ES6+**: JavaScript moderno

## Próximas Mejoras
- [ ] Integración con Google Maps para ubicación
- [ ] Sistema de tickets para seguimiento de consultas
- [ ] Notificaciones push para respuestas
- [ ] Integración con WhatsApp Business
- [ ] Análisis de formularios enviados
- [ ] Sistema de calificación de satisfacción

## Uso
1. Navegar a `/contacto`
2. Completar el formulario con información válida
3. Seleccionar tipo de consulta apropiado
4. Enviar formulario
5. Recibir confirmación de envío

## API Endpoints
- `POST /api/contact/` - Enviar formulario de contacto
- `GET /api/contact/info/` - Obtener información de contacto

## Consideraciones de Seguridad
- Sanitización de todas las entradas de usuario
- Validación del lado cliente y servidor
- Protección contra XSS
- Rate limiting recomendado en el backend