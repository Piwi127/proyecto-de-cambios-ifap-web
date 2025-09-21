import { api } from './api.js';

// Servicio de mensajería
export const messagingService = {
  // Obtener conversaciones del usuario
  async getConversations(params = {}) {
    try {
      const response = await api.get('/api/messaging/conversations/', { params });
      return response.data;
    } catch (error) {
      console.error('Error al obtener conversaciones:', error);
      throw error;
    }
  },

  // Crear nueva conversación
  async createConversation(conversationData) {
    try {
      const response = await api.post('/api/messaging/conversations/', conversationData);
      return response.data;
    } catch (error) {
      console.error('Error al crear conversación:', error);
      throw error;
    }
  },

  // Obtener conversación específica
  async getConversation(conversationId) {
    try {
      const response = await api.get(`/api/messaging/conversations/${conversationId}/`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener conversación:', error);
      throw error;
    }
  },

  // Obtener mensajes de una conversación
  async getConversationMessages(conversationId, params = {}) {
    try {
      const response = await api.get(`/api/messaging/conversations/${conversationId}/messages/`, { params });
      return response.data;
    } catch (error) {
      console.error('Error al obtener mensajes:', error);
      throw error;
    }
  },

  // Enviar mensaje
  async sendMessage(messageData) {
    try {
      const response = await api.post('/api/messaging/messages/', messageData);
      return response.data;
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      throw error;
    }
  },

  // Marcar mensaje como leído
  async markMessageAsRead(messageId) {
    try {
      const response = await api.post(`/api/messaging/messages/${messageId}/mark_as_read/`);
      return response.data;
    } catch (error) {
      console.error('Error al marcar mensaje como leído:', error);
      throw error;
    }
  },

  // Agregar reacción a mensaje
  async addReaction(messageId, reaction) {
    try {
      const response = await api.post(`/api/messaging/messages/${messageId}/add_reaction/`, { reaction });
      return response.data;
    } catch (error) {
      console.error('Error al agregar reacción:', error);
      throw error;
    }
  },

  // Remover reacción de mensaje
  async removeReaction(messageId) {
    try {
      const response = await api.delete(`/api/messaging/messages/${messageId}/remove_reaction/`);
      return response.data;
    } catch (error) {
      console.error('Error al remover reacción:', error);
      throw error;
    }
  },

  // Agregar participantes a conversación grupal
  async addParticipants(conversationId, userIds) {
    try {
      const response = await api.post(`/api/messaging/conversations/${conversationId}/add_participants/`, {
        user_ids: userIds
      });
      return response.data;
    } catch (error) {
      console.error('Error al agregar participantes:', error);
      throw error;
    }
  },

  // Remover participantes de conversación grupal
  async removeParticipants(conversationId, userIds) {
    try {
      const response = await api.post(`/api/messaging/conversations/${conversationId}/remove_participants/`, {
        user_ids: userIds
      });
      return response.data;
    } catch (error) {
      console.error('Error al remover participantes:', error);
      throw error;
    }
  },

  // Buscar usuarios para crear conversación
  async searchUsers(query) {
    try {
      const response = await api.get('/users/', {
        params: { search: query }
      });
      return response.data;
    } catch (error) {
      console.error('Error al buscar usuarios:', error);
      throw error;
    }
  }
};

// Servicio de comentarios en lecciones
export const lessonCommentsService = {
  // Obtener comentarios de una lección
  async getLessonComments(lessonId, params = {}) {
    try {
      const response = await api.get('/forum/lesson-comments/', {
        params: { lesson: lessonId, ...params }
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener comentarios:', error);
      throw error;
    }
  },

  // Crear comentario en lección
  async createLessonComment(commentData) {
    try {
      const response = await api.post('/forum/lesson-comments/', commentData);
      return response.data;
    } catch (error) {
      console.error('Error al crear comentario:', error);
      throw error;
    }
  },

  // Actualizar comentario
  async updateLessonComment(commentId, commentData) {
    try {
      const response = await api.put(`/forum/lesson-comments/${commentId}/`, commentData);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar comentario:', error);
      throw error;
    }
  },

  // Eliminar comentario (soft delete)
  async deleteLessonComment(commentId) {
    try {
      const response = await api.delete(`/forum/lesson-comments/${commentId}/soft_delete/`);
      return response.data;
    } catch (error) {
      console.error('Error al eliminar comentario:', error);
      throw error;
    }
  },

  // Dar like a comentario
  async toggleCommentLike(commentId) {
    try {
      const response = await api.post(`/forum/lesson-comments/${commentId}/toggle_like/`);
      return response.data;
    } catch (error) {
      console.error('Error al dar like:', error);
      throw error;
    }
  }
};

// Servicio de WebSocket para mensajería en tiempo real
export class MessagingWebSocket {
  constructor(conversationId, token) {
    this.conversationId = conversationId;
    this.token = token;
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 3000;
    this.messageHandlers = new Map();
    this.typingTimeout = null;
  }

  connect() {
    const wsUrl = `ws://localhost:8000/ws/messaging/${this.conversationId}/?token=${this.token}`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('WebSocket conectado para conversación:', this.conversationId);
        this.reconnectAttempts = 0;
        this.emit('connected');
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('Error al parsear mensaje WebSocket:', error);
        }
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket desconectado:', event.code, event.reason);
        this.emit('disconnected');

        // Intentar reconectar si no fue un cierre intencional
        if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.attemptReconnect();
        }
      };

      this.ws.onerror = (error) => {
        console.error('Error en WebSocket:', error);
        this.emit('error', error);
      };

    } catch (error) {
      console.error('Error al conectar WebSocket:', error);
      this.emit('error', error);
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close(1000, 'Cliente desconectado');
      this.ws = null;
    }
  }

  attemptReconnect() {
    this.reconnectAttempts++;
    console.log(`Intentando reconectar... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    setTimeout(() => {
      this.connect();
    }, this.reconnectInterval);
  }

  sendMessage(content, messageType = 'text', fileUrl = null, fileName = null, fileSize = null) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message = {
        type: 'message',
        content,
        message_type: messageType,
        file_url: fileUrl,
        file_name: fileName,
        file_size: fileSize
      };

      this.ws.send(JSON.stringify(message));
    } else {
      console.error('WebSocket no está conectado');
    }
  }

  startTyping() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'typing_start' }));

      // Limpiar timeout anterior
      if (this.typingTimeout) {
        clearTimeout(this.typingTimeout);
      }

      // Detener typing automáticamente después de 3 segundos
      this.typingTimeout = setTimeout(() => {
        this.stopTyping();
      }, 3000);
    }
  }

  stopTyping() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'typing_stop' }));
    }

    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
      this.typingTimeout = null;
    }
  }

  addReaction(messageId, reaction) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'reaction',
        message_id: messageId,
        reaction
      }));
    }
  }

  on(event, handler) {
    if (!this.messageHandlers.has(event)) {
      this.messageHandlers.set(event, []);
    }
    this.messageHandlers.get(event).push(handler);
  }

  off(event, handler) {
    if (this.messageHandlers.has(event)) {
      const handlers = this.messageHandlers.get(event);
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  emit(event, ...args) {
    if (this.messageHandlers.has(event)) {
      this.messageHandlers.get(event).forEach(handler => {
        handler(...args);
      });
    }
  }

  handleMessage(data) {
    switch (data.type) {
      case 'message':
        this.emit('message', data.message);
        break;
      case 'typing':
        this.emit('typing', data.user, data.action);
        break;
      case 'reaction':
        this.emit('reaction', data.message_id, data.reaction, data.user);
        break;
      default:
        console.log('Tipo de mensaje desconocido:', data.type);
    }
  }
}

// Servicio de WebSocket para comentarios en lecciones
export class LessonCommentsWebSocket {
  constructor(lessonId, token) {
    this.lessonId = lessonId;
    this.token = token;
    this.ws = null;
    this.messageHandlers = new Map();
  }

  connect() {
    const wsUrl = `ws://localhost:8000/ws/lesson-comments/${this.lessonId}/?token=${this.token}`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('WebSocket conectado para comentarios de lección:', this.lessonId);
        this.emit('connected');
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('Error al parsear mensaje WebSocket:', error);
        }
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket de comentarios desconectado');
        this.emit('disconnected');
      };

      this.ws.onerror = (error) => {
        console.error('Error en WebSocket de comentarios:', error);
        this.emit('error', error);
      };

    } catch (error) {
      console.error('Error al conectar WebSocket de comentarios:', error);
      this.emit('error', error);
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close(1000, 'Cliente desconectado');
      this.ws = null;
    }
  }

  sendComment(content, parentCommentId = null) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message = {
        type: 'comment',
        content,
        parent_comment_id: parentCommentId
      };

      this.ws.send(JSON.stringify(message));
    } else {
      console.error('WebSocket de comentarios no está conectado');
    }
  }

  sendLike(commentId) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'like',
        comment_id: commentId
      }));
    }
  }

  on(event, handler) {
    if (!this.messageHandlers.has(event)) {
      this.messageHandlers.set(event, []);
    }
    this.messageHandlers.get(event).push(handler);
  }

  off(event, handler) {
    if (this.messageHandlers.has(event)) {
      const handlers = this.messageHandlers.get(event);
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  emit(event, ...args) {
    if (this.messageHandlers.has(event)) {
      this.messageHandlers.get(event).forEach(handler => {
        handler(...args);
      });
    }
  }

  handleMessage(data) {
    switch (data.type) {
      case 'comment':
        this.emit('comment', data.comment);
        break;
      case 'like':
        this.emit('like', data.comment_id, data.user, data.liked);
        break;
      default:
        console.log('Tipo de mensaje de comentario desconocido:', data.type);
    }
  }
}