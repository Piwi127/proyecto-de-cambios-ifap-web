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

export default {
  validateContactForm,
  formatPhoneNumber,
  sanitizeInput
};