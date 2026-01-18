/**
 * Servicio centralizado de manejo de errores para el frontend
 */

class ErrorHandler {
  constructor() {
    this.errorSubscribers = [];
    this.recentErrors = new Map();
    this.throttleWindowMs = 10000;
    this.setupGlobalErrorHandlers();
  }

  /**
   * Configurar manejadores globales de errores
   */
  setupGlobalErrorHandlers() {
    // Manejar errores de JavaScript no capturados
    window.addEventListener('error', (event) => {
      this.handleError({
        type: 'javascript',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
        stack: event.error?.stack
      });
    });

    // Manejar promesas rechazadas no capturadas
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError({
        type: 'promise',
        message: event.reason?.message || 'Unhandled promise rejection',
        reason: event.reason,
        stack: event.reason?.stack
      });
    });
  }

  /**
   * Manejar errores de API
   */
  handleAPIError(error, context = {}) {
    const errorInfo = this.parseAPIError(error);
    
    this.logError({
      type: 'api',
      ...errorInfo,
      context,
      timestamp: new Date().toISOString()
    });

    this.notifySubscribers({
      type: 'api',
      ...errorInfo,
      context
    });

    return errorInfo;
  }

  /**
   * Parsear errores de API
   */
  parseAPIError(error) {
    if (error.response) {
      // Error con respuesta del servidor
      const { status, data } = error.response;
      
      return {
        status,
        message: data?.message || this.getDefaultMessage(status),
        code: data?.code || 'api_error',
        details: data?.details || null,
        isNetworkError: false
      };
    } else if (error.request) {
      // Error de red (no hay respuesta)
      return {
        status: 0,
        message: 'Error de conexión. Verifica tu conexión a internet.',
        code: 'network_error',
        details: null,
        isNetworkError: true
      };
    } else {
      // Error en la configuración de la request
      return {
        status: 0,
        message: error.message || 'Error inesperado',
        code: 'request_error',
        details: null,
        isNetworkError: false
      };
    }
  }

  /**
   * Obtener mensaje por defecto según status code
   */
  getDefaultMessage(status) {
    const messages = {
      400: 'Datos inválidos en la solicitud',
      401: 'No estás autenticado. Por favor, inicia sesión.',
      403: 'No tienes permisos para realizar esta acción',
      404: 'El recurso solicitado no existe',
      422: 'Error de validación en los datos',
      429: 'Demasiadas solicitudes. Intenta más tarde.',
      500: 'Error interno del servidor',
      502: 'Servicio no disponible temporalmente',
      503: 'Servidor sobrecargado. Intenta más tarde.',
      504: 'Tiempo de espera agotado'
    };

    return messages[status] || 'Ha ocurrido un error inesperado';
  }

  /**
   * Manejar errores generales
   */
  handleError(errorInfo) {
    this.logError(errorInfo);
    this.notifySubscribers(errorInfo);
  }

  /**
   * Logging de errores
   */
  logError(errorInfo) {
    const logData = {
      ...errorInfo,
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.getCurrentUserId(),
      sessionId: this.getSessionId()
    };

    const key = [
      errorInfo.type || 'unknown',
      errorInfo.status || '0',
      errorInfo.code || 'unknown',
      logData.url || '',
      errorInfo.message || ''
    ].join('|');
    const now = Date.now();
    const lastLogged = this.recentErrors.get(key);
    if (lastLogged && now - lastLogged < this.throttleWindowMs) {
      return;
    }
    this.recentErrors.set(key, now);
    if (this.recentErrors.size > 200) {
      const cutoff = now - this.throttleWindowMs;
      for (const [storedKey, timestamp] of this.recentErrors.entries()) {
        if (timestamp < cutoff) {
          this.recentErrors.delete(storedKey);
        }
      }
    }

    // Console log en desarrollo
    if (import.meta.env.DEV) {
      console.group('🚨 Error Captured');
      console.error('Error Info:', errorInfo);
      console.error('Full Log Data:', logData);
      console.groupEnd();
    }

    // Enviar a servicio de logging si está configurado
    this.sendToLoggingService(logData);
  }

  /**
   * Obtener ID del usuario actual
   */
  getCurrentUserId() {
    try {
      const token = localStorage.getItem('access_token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.user_id;
      }
    } catch {
      // Token inválido o no existe
    }
    return null;
  }

  /**
   * Obtener ID de sesión
   */
  getSessionId() {
    let sessionId = sessionStorage.getItem('session_id');
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('session_id', sessionId);
    }
    return sessionId;
  }

  /**
   * Enviar errores a servicio de logging (implementar según necesidad)
   */
  async sendToLoggingService(logData) {
    try {
      // Aquí se puede implementar envío a servicio externo como Sentry, LogRocket, etc.
      // Por ahora, solo almacenar en localStorage para debugging
      const errors = JSON.parse(localStorage.getItem('error_logs') || '[]');
      errors.push(logData);
      
      // Mantener solo los últimos 50 errores
      if (errors.length > 50) {
        errors.splice(0, errors.length - 50);
      }
      
      localStorage.setItem('error_logs', JSON.stringify(errors));
    } catch (e) {
      console.error('Failed to log error:', e);
    }
  }

  /**
   * Suscribirse a notificaciones de errores
   */
  subscribe(callback) {
    this.errorSubscribers.push(callback);
    
    // Retornar función para cancelar suscripción
    return () => {
      const index = this.errorSubscribers.indexOf(callback);
      if (index > -1) {
        this.errorSubscribers.splice(index, 1);
      }
    };
  }

  /**
   * Notificar a todos los suscriptores
   */
  notifySubscribers(errorInfo) {
    this.errorSubscribers.forEach(callback => {
      try {
        callback(errorInfo);
      } catch (e) {
        console.error('Error in error subscriber:', e);
      }
    });
  }

  /**
   * Obtener logs de errores almacenados
   */
  getStoredErrorLogs() {
    try {
      return JSON.parse(localStorage.getItem('error_logs') || '[]');
    } catch {
      return [];
    }
  }

  /**
   * Limpiar logs de errores almacenados
   */
  clearStoredErrorLogs() {
    localStorage.removeItem('error_logs');
  }

  /**
   * Crear error personalizado con context
   */
  createContextualError(message, context = {}) {
    const error = new Error(message);
    error.context = context;
    return error;
  }

  /**
   * Manejo de errores de validación de formularios
   */
  handleValidationErrors(errors, formName = 'form') {
    const validationInfo = {
      type: 'validation',
      formName,
      errors: this.normalizeValidationErrors(errors),
      timestamp: new Date().toISOString()
    };

    this.logError(validationInfo);
    this.notifySubscribers(validationInfo);

    return validationInfo;
  }

  /**
   * Normalizar errores de validación
   */
  normalizeValidationErrors(errors) {
    if (typeof errors === 'string') {
      return { general: [errors] };
    }

    if (Array.isArray(errors)) {
      return { general: errors };
    }

    // Si es un objeto de errores del backend
    if (typeof errors === 'object') {
      const normalized = {};
      for (const [field, messages] of Object.entries(errors)) {
        normalized[field] = Array.isArray(messages) ? messages : [messages];
      }
      return normalized;
    }

    return { general: ['Error de validación desconocido'] };
  }
}

// Instancia singleton
const errorHandler = new ErrorHandler();

export default errorHandler;

// Funciones de conveniencia
export const handleAPIError = (error, context) => errorHandler.handleAPIError(error, context);
export const handleError = (error) => errorHandler.handleError(error);
export const subscribeToErrors = (callback) => errorHandler.subscribe(callback);
export const handleValidationErrors = (errors, formName) => errorHandler.handleValidationErrors(errors, formName);
