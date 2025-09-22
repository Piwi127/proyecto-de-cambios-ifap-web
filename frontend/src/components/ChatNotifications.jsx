import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import chatService from '../services/chatService';

const ChatNotifications = ({ onNotificationClick }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    // Configurar listeners para notificaciones
    chatService.on('message', handleNewMessage);
    chatService.on('notification', handleNotification);

    // Cargar notificaciones no leídas al inicializar
    loadUnreadNotifications();

    return () => {
      chatService.off('message', handleNewMessage);
      chatService.off('notification', handleNotification);
    };
  }, []);

  const loadUnreadNotifications = async () => {
    try {
      const response = await chatService.getNotifications();
      const unread = response.results?.filter(n => !n.is_read) || [];
      setNotifications(unread);
      setUnreadCount(unread.length);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const handleNewMessage = (message) => {
    // Solo mostrar notificación si el mensaje no es del usuario actual
    if (message.sender.id !== user.id) {
      showNotification({
        id: Date.now(),
        type: 'message',
        title: `${message.sender.first_name} ${message.sender.last_name}`,
        content: message.content,
        room_id: message.room_id,
        course_id: message.course_id,
        created_at: new Date().toISOString()
      });
    }
  };

  const handleNotification = (notification) => {
    showNotification(notification);
  };

  const showNotification = (notification) => {
    // Agregar notificación a la lista
    setNotifications(prev => [notification, ...prev.slice(0, 4)]); // Mantener solo las últimas 5
    setUnreadCount(prev => prev + 1);

    // Reproducir sonido de notificación
    playNotificationSound();

    // Mostrar notificación del navegador si está permitido
    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.content,
        icon: '/favicon.ico',
        tag: `chat-${notification.room_id || notification.course_id}`,
        requireInteraction: false
      });
    }

    // Auto-ocultar después de 5 segundos
    setTimeout(() => {
      removeNotification(notification.id);
    }, 5000);
  };

  const playNotificationSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => {
        console.log('No se pudo reproducir el sonido de notificación:', e);
      });
    }
  };

  const removeNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const markAsRead = async (notificationId) => {
    try {
      await chatService.markNotificationAsRead(notificationId);
      removeNotification(notificationId);
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    
    // Llamar al callback para abrir el chat correspondiente
    if (onNotificationClick) {
      onNotificationClick({
        roomId: notification.room_id,
        courseId: notification.course_id,
        type: notification.room_id ? 'direct' : 'course'
      });
    }
  };

  // Solicitar permisos de notificación al cargar
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  return (
    <>
      {/* Audio para notificaciones */}
      <audio
        ref={audioRef}
        preload="auto"
        style={{ display: 'none' }}
      >
        <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT" type="audio/wav" />
      </audio>

      {/* Contenedor de notificaciones */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            onClick={() => handleNotificationClick(notification)}
            className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
          >
            <div className="flex items-start space-x-3">
              {/* Icono */}
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-lg">💬</span>
                </div>
              </div>

              {/* Contenido */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {notification.title}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeNotification(notification.id);
                    }}
                    className="text-gray-400 hover:text-gray-600 ml-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <p className="text-sm text-gray-600 truncate mt-1">
                  {notification.content}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(notification.created_at).toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>

            {/* Indicador de nuevo mensaje */}
            <div className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          </div>
        ))}
      </div>

      {/* Badge de contador (para usar en el botón de mensajes) */}
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </>
  );
};

export default ChatNotifications;