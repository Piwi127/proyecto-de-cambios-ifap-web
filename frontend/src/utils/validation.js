// Utilidades de validación para el formulario de contacto
export const validateContactForm = (formData) => {
  const errors = {};

  // Validar nombre
  if (!formData.nombre.trim()) {
    errors.nombre = 'El nombre es obligatorio';
  } else if (formData.nombre.trim().length < 2) {
    errors.nombre = 'El nombre debe tener al menos 2 caracteres';
  }

  // Validar email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!formData.email.trim()) {
    errors.email = 'El email es obligatorio';
  } else if (!emailRegex.test(formData.email)) {
    errors.email = 'Ingresa un email válido';
  }

  // Validar teléfono (opcional pero si se ingresa debe ser válido)
  if (formData.telefono.trim()) {
    const phoneRegex = /^[+]?[0-9\s-()]{7,}$/;
    if (!phoneRegex.test(formData.telefono)) {
      errors.telefono = 'Ingresa un número de teléfono válido';
    }
  }

  // Validar asunto
  if (!formData.asunto.trim()) {
    errors.asunto = 'El asunto es obligatorio';
  } else if (formData.asunto.trim().length < 5) {
    errors.asunto = 'El asunto debe tener al menos 5 caracteres';
  }

  // Validar mensaje
  if (!formData.mensaje.trim()) {
    errors.mensaje = 'El mensaje es obligatorio';
  } else if (formData.mensaje.trim().length < 10) {
    errors.mensaje = 'El mensaje debe tener al menos 10 caracteres';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Formatear teléfono mientras se escribe
export const formatPhoneNumber = (value) => {
  // Remover todos los caracteres no numéricos excepto +
  const cleaned = value.replace(/[^\d+]/g, '');

  // Si comienza con +, mantener el formato internacional
  if (cleaned.startsWith('+')) {
    return cleaned;
  }

  // Para números peruanos, agregar formato
  if (cleaned.length >= 9) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }

  return cleaned;
};

// Sanitizar entrada de texto
export const sanitizeInput = (input) => {
  return input
    .replace(/[<>]/g, '') // Remover caracteres HTML
    .trim();
};

// Validaciones específicas para cursos
export const validateCourseForm = (formData) => {
  const errors = {};

  // Validar título
  if (!formData.title?.trim()) {
    errors.title = 'El título del curso es obligatorio';
  } else if (formData.title.trim().length < 5) {
    errors.title = 'El título debe tener al menos 5 caracteres';
  } else if (formData.title.trim().length > 200) {
    errors.title = 'El título no puede tener más de 200 caracteres';
  }

  // Validar descripción
  if (!formData.description?.trim()) {
    errors.description = 'La descripción es obligatoria';
  } else if (formData.description.trim().length < 20) {
    errors.description = 'La descripción debe tener al menos 20 caracteres';
  } else if (formData.description.trim().length > 2000) {
    errors.description = 'La descripción no puede tener más de 2000 caracteres';
  }

  // Validar instructor
  if (!formData.instructor_id) {
    errors.instructor_id = 'Debe seleccionar un instructor';
  }

  // Validar categoría
  if (!formData.category?.trim()) {
    errors.category = 'La categoría es obligatoria';
  }

  // Validar nivel
  if (!formData.level) {
    errors.level = 'Debe seleccionar un nivel';
  }

  // Validar modalidad
  if (!formData.modality) {
    errors.modality = 'Debe seleccionar una modalidad';
  }

  // Validar duración (opcional pero si se ingresa debe ser válida)
  if (formData.duration && (isNaN(formData.duration) || formData.duration <= 0)) {
    errors.duration = 'La duración debe ser un número positivo';
  }

  // Validar precio (opcional pero si se ingresa debe ser válido)
  if (formData.price && (isNaN(formData.price) || formData.price < 0)) {
    errors.price = 'El precio debe ser un número positivo';
  }

  // Validar capacidad máxima (opcional pero si se ingresa debe ser válida)
  if (formData.max_students && (isNaN(formData.max_students) || formData.max_students <= 0)) {
    errors.max_students = 'La capacidad debe ser un número positivo';
  }

  // Validar fechas
  if (formData.start_date && formData.end_date) {
    const startDate = new Date(formData.start_date);
    const endDate = new Date(formData.end_date);

    if (startDate >= endDate) {
      errors.end_date = 'La fecha de fin debe ser posterior a la fecha de inicio';
    }
  }

  // Validar URL de imagen (opcional pero si se ingresa debe ser válida)
  if (formData.image_url && formData.image_url.trim()) {
    const urlRegex = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i;
    if (!urlRegex.test(formData.image_url.trim())) {
      errors.image_url = 'Ingresa una URL válida de imagen';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Validar permisos de administrador
export const validateAdminPermissions = (user, requiredPermissions = []) => {
  if (!user) {
    return { hasPermission: false, error: 'Usuario no autenticado' };
  }

  if (!user.is_superuser) {
    return { hasPermission: false, error: 'Se requieren permisos de administrador' };
  }

  // Validar permisos específicos si se requieren
  if (requiredPermissions.length > 0) {
    const hasAllPermissions = requiredPermissions.every(permission =>
      user.permissions?.includes(permission)
    );

    if (!hasAllPermissions) {
      return {
        hasPermission: false,
        error: `Permisos requeridos: ${requiredPermissions.join(', ')}`
      };
    }
  }

  return { hasPermission: true };
};

// Sanitizar datos de curso
export const sanitizeCourseData = (data) => {
  const sanitized = {};

  // Sanitizar campos de texto
  if (data.title) sanitized.title = sanitizeInput(data.title);
  if (data.description) sanitized.description = sanitizeInput(data.description);
  if (data.category) sanitized.category = sanitizeInput(data.category);
  if (data.level) sanitized.level = sanitizeInput(data.level);
  if (data.modality) sanitized.modality = sanitizeInput(data.modality);

  // Mantener campos numéricos y booleanos
  if (typeof data.duration === 'number') sanitized.duration = data.duration;
  if (typeof data.price === 'number') sanitized.price = data.price;
  if (typeof data.max_students === 'number') sanitized.max_students = data.max_students;
  if (typeof data.instructor_id === 'number') sanitized.instructor_id = data.instructor_id;
  if (typeof data.is_active === 'boolean') sanitized.is_active = data.is_active;

  // Sanitizar URLs
  if (data.image_url) sanitized.image_url = sanitizeInput(data.image_url);

  // Mantener fechas
  if (data.start_date) sanitized.start_date = data.start_date;
  if (data.end_date) sanitized.end_date = data.end_date;

  return sanitized;
};

export default {
  validateContactForm,
  formatPhoneNumber,
  sanitizeInput,
  validateCourseForm,
  validateAdminPermissions,
  sanitizeCourseData
};