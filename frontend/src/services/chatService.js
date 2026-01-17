import { api } from './api';

class ChatService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    // Configuración de WebSocket desde variables de entorno
    const defaultHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    const wsProtocol =
      typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    this.wsBaseUrl = import.meta.env.VITE_API_WS_URL || `${wsProtocol}//${defaultHost}:8000`;
    this.wsBaseUrlAlt = import.meta.env.VITE_API_WS_URL_ALT || `${wsProtocol}//${defaultHost}:8001`;
    this.wsBaseUrlAlt2 = import.meta.env.VITE_API_WS_URL_ALT2 || `${wsProtocol}//${defaultHost}:8003`;
  }

  // API Methods
  async getChatRooms() {
    try {
      const response = await api.get('/chat/rooms/');
      return response.data;
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
      throw error;
    }
  }

  async createChatRoom(data) {
    try {
      const response = await api.post('/chat/rooms/', data);
      return response.data;
    } catch (error) {
      console.error('Error creating chat room:', error);
      throw error;
    }
  }

  async getMessages(roomId, page = 1) {
    try {
      const response = await api.get(`/chat/messages/?room=${roomId}&page=${page}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }

  async sendMessage(data) {
    try {
      const response = await api.post('/chat/messages/', data);
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  async markMessageAsRead(messageId) {
    try {
      const response = await api.post(`/chat/messages/${messageId}/mark_as_read/`);
      return response.data;
    } catch (error) {
      console.error('Error marking message as read:', error);
      throw error;
    }
  }

  async getNotifications() {
    try {
      const response = await api.get('/chat/notifications/');
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  // WebSocket Methods
  connectToRoom(roomId, token) {
    if (this.socket) {
      this.disconnect();
    }

    const wsUrl = `${this.wsBaseUrl}/ws/chat/${roomId}/?token=${token}`;
    this.socket = new WebSocket(wsUrl);

    this.socket.onopen = () => {
      console.log('Connected to chat room:', roomId);
      this.reconnectAttempts = 0;
      this.emit('connected', { roomId });
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleMessage(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.socket.onclose = (event) => {
      console.log('Disconnected from chat room:', roomId);
      this.emit('disconnected', { roomId, code: event.code });
      
      if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
        this.attemptReconnect(roomId, token);
      }
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.emit('error', { error });
    };
  }

  connectToCourseRoom(courseId, token) {
    if (this.socket) {
      this.disconnect();
    }

    const wsUrl = `${this.wsBaseUrl}/ws/chat/course/${courseId}/?token=${token}`;
    this.socket = new WebSocket(wsUrl);

    this.socket.onopen = () => {
      console.log('Connected to course chat room:', courseId);
      this.reconnectAttempts = 0;
      this.emit('connected', { courseId });
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleMessage(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.socket.onclose = (event) => {
      console.log('Disconnected from course chat room:', courseId);
      this.emit('disconnected', { courseId, code: event.code });
      
      if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
        this.attemptReconnect(courseId, token, true);
      }
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.emit('error', { error });
    };
  }

  attemptReconnect(roomId, token, isCourseRoom = false) {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms...`);
    
    setTimeout(() => {
      if (isCourseRoom) {
        this.connectToCourseRoom(roomId, token);
      } else {
        this.connectToRoom(roomId, token);
      }
    }, delay);
  }

  handleMessage(data) {
    switch (data.type) {
      case 'chat_message':
        this.emit('message', data.message);
        break;
      case 'user_typing':
        this.emit('typing', data);
        break;
      case 'user_stopped_typing':
        this.emit('stopped_typing', data);
        break;
      case 'user_status_update':
        this.emit('status_update', data);
        break;
      case 'room_update':
        this.emit('room_update', data);
        break;
      default:
        console.log('Unknown message type:', data.type);
    }
  }

  sendWebSocketMessage(type, data = {}) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        type,
        ...data
      }));
    } else {
      console.warn('WebSocket is not connected');
    }
  }

  sendChatMessage(content) {
    this.sendWebSocketMessage('chat_message', { content });
  }

  sendTypingIndicator() {
    this.sendWebSocketMessage('typing');
  }

  sendStopTypingIndicator() {
    this.sendWebSocketMessage('stop_typing');
  }

  updateUserStatus(status) {
    this.sendWebSocketMessage('user_status', { status });
  }

  disconnect() {
    if (this.socket) {
      this.socket.close(1000);
      this.socket = null;
    }
  }

  // Event handling
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in event callback:', error);
        }
      });
    }
  }

  // Configuration methods
  setWebSocketUrl(port) {
    if (port === 8000) {
      this.wsBaseUrl = this.wsBaseUrl.replace(/:\d+/, ':8000');
    } else if (port === 8001) {
      this.wsBaseUrl = this.wsBaseUrl.replace(/:\d+/, ':8001');
    } else if (port === 8003) {
      this.wsBaseUrl = this.wsBaseUrl.replace(/:\d+/, ':8003');
    }
  }

  useAlternateWebSocket(port = 8001) {
    if (port === 8001) {
      this.wsBaseUrl = this.wsBaseUrlAlt;
    } else if (port === 8003) {
      this.wsBaseUrl = this.wsBaseUrlAlt2;
    } else {
      const defaultHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
      const wsProtocol =
        typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      this.wsBaseUrl = import.meta.env.VITE_API_WS_URL || `${wsProtocol}//${defaultHost}:8000`;
    }
  }

  // Utility methods
  isConnected() {
    return this.socket && this.socket.readyState === WebSocket.OPEN;
  }

  getConnectionState() {
    if (!this.socket) return 'disconnected';
    
    switch (this.socket.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting';
      case WebSocket.OPEN:
        return 'connected';
      case WebSocket.CLOSING:
        return 'closing';
      case WebSocket.CLOSED:
        return 'disconnected';
      default:
        return 'unknown';
    }
  }
}

export default new ChatService();
