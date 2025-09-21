import React, { useState, useEffect, useRef } from 'react';
import { messagingService } from '../services/messagingService.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useScrollTrigger } from '../hooks/useInfiniteScroll.js';
import { w3cwebsocket as W3CWebSocket } from 'websocket';

const MessageItem = ({ message, onReaction }) => {
  const { user } = useAuth();
  const isMine = message.sender.id === user?.id;

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  const getReactions = () => {
    if (!message.reactions) return {};

    const reactions = {};
    Object.entries(message.reactions).forEach(([reaction, users]) => {
      reactions[reaction] = users.length;
    });
    return reactions;
  };

  const reactions = getReactions();

  return (
    <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-xs lg:max-w-md ${isMine ? 'order-2' : 'order-1'}`}>
        {/* Avatar para mensajes del otro usuario */}
        {!isMine && (
          <div className="flex items-center mb-1">
            <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center mr-2">
              <span className="text-white text-sm font-semibold">
                {message.sender.first_name.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-xs text-gray-500 font-medium">
              {message.sender.first_name} {message.sender.last_name}
            </span>
          </div>
        )}

        {/* Contenido del mensaje */}
        <div
          className={`px-4 py-2 rounded-lg ${
            isMine
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-900'
          }`}
        >
          {/* Archivo adjunto */}
          {message.message_type === 'file' && message.file_url && (
            <div className="mb-2">
              <a
                href={message.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center space-x-2 p-2 rounded ${
                  isMine ? 'bg-primary-700' : 'bg-gray-200'
                }`}
              >
                <span className="text-lg">📎</span>
                <div>
                  <p className="text-sm font-medium truncate">{message.file_name}</p>
                  <p className="text-xs opacity-75">
                    {(message.file_size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </a>
            </div>
          )}

          {/* Imagen */}
          {message.message_type === 'image' && message.file_url && (
            <div className="mb-2">
              <img
                src={message.file_url}
                alt={message.file_name || 'Imagen'}
                className="max-w-full rounded cursor-pointer hover:opacity-90"
                onClick={() => window.open(message.file_url, '_blank')}
              />
            </div>
          )}

          {/* Contenido de texto */}
          {message.content && (
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          )}

          {/* Estado de edición */}
          {message.is_edited && (
            <p className={`text-xs mt-1 italic ${isMine ? 'text-primary-200' : 'text-gray-500'}`}>
              editado
            </p>
          )}
        </div>

        {/* Reacciones */}
        {Object.keys(reactions).length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {Object.entries(reactions).map(([reaction, count]) => (
              <button
                key={reaction}
                onClick={() => onReaction(message.id, reaction)}
                className={`text-xs px-2 py-1 rounded-full ${
                  isMine ? 'bg-primary-700 text-white' : 'bg-gray-200 text-gray-700'
                } hover:opacity-80 transition-opacity`}
              >
                {reaction} {count}
              </button>
            ))}
          </div>
        )}

        {/* Timestamp */}
        <p className={`text-xs mt-1 ${isMine ? 'text-right' : 'text-left'} text-gray-500`}>
          {formatTime(message.created_at)}
          {message.is_read_by_current_user && isMine && (
            <span className="ml-1">✓✓</span>
          )}
        </p>
      </div>
    </div>
  );
};

const MessageInput = ({ onSendMessage, onTypingStart, onTypingStop, disabled }) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef(null);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setMessage(value);
    // Funcionalidad de typing deshabilitada sin WebSocket
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
      // Funcionalidad de typing deshabilitada sin WebSocket
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [message]);

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
      <div className="flex space-x-3">
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Escribe un mensaje..."
            disabled={disabled}
            rows={1}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none max-h-32"
            style={{ minHeight: '40px' }}
          />
        </div>
        <button
          type="submit"
          disabled={!message.trim() || disabled}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
        >
          <span className="hidden sm:inline">Enviar</span>
          <span className="sm:hidden">📤</span>
        </button>
      </div>
    </form>
  );
};

const ChatWindow = ({ conversation, messages, loading, error, onSendMessage, onLoadMore, hasMore, typingUsers, onReaction }) => {
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const { user } = useAuth();
  const [wsClient, setWsClient] = useState(null);
  const [currentTypingUsers, setCurrentTypingUsers] = useState([]);

  const WS_URL = import.meta.env.VITE_API_WS_URL;

  const setupWebSocket = useCallback(() => {
    if (!conversation || !user || !WS_URL) return;

    const client = new W3CWebSocket(`${WS_URL}/ws/chat/${conversation.id}/?token=${localStorage.getItem('access_token')}`);

    client.onopen = () => {
      console.log('WebSocket Client Connected');
    };

    client.onmessage = (message) => {
      const data = JSON.parse(message.data);
      console.log('WebSocket message received:', data);

      if (data.type === 'chat_message') {
        // Aquí se debería actualizar el estado de los mensajes en el componente padre
        // Para simplificar, asumimos que el padre tiene una función para añadir mensajes
        // onNewMessage(data.message);
        console.log('New message received:', data.message);
      } else if (data.type === 'typing_status') {
        setCurrentTypingUsers(data.users);
      }
    };

    client.onclose = () => {
      console.log('WebSocket Client Disconnected');
    };

    client.onerror = (error) => {
      console.error('WebSocket Error:', error);
    };

    setWsClient(client);

    return () => {
      client.close();
    };
  }, [conversation, user, WS_URL]);

  useEffect(() => {
    const cleanup = setupWebSocket();
    return () => {
      if (cleanup) cleanup();
    };
  }, [setupWebSocket]);

  // Usar scroll trigger para paginación infinita
  const scrollTriggerRef = useScrollTrigger(() => {
    if (hasMore && !loading) {
      onLoadMore();
    }
  }, { threshold: 200 });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleReaction = async (messageId, reaction) => {
    try {
      await messagingService.addReaction(messageId, reaction);
      // onReaction(messageId, reaction); // Esto debería venir del WebSocket
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  const handleSendMessage = useCallback((messageContent) => {
    if (wsClient && wsClient.readyState === wsClient.OPEN) {
      wsClient.send(JSON.stringify({
        type: 'message',
        message: messageContent,
        conversation_id: conversation.id,
      }));
    }
  }, [wsClient, conversation]);

  const handleTypingStart = useCallback(() => {
    if (wsClient && wsClient.readyState === wsClient.OPEN) {
      wsClient.send(JSON.stringify({
        type: 'typing',
        is_typing: true,
        conversation_id: conversation.id,
      }));
    }
  }, [wsClient, conversation]);

  const handleTypingStop = useCallback(() => {
    if (wsClient && wsClient.readyState === wsClient.OPEN) {
      wsClient.send(JSON.stringify({
        type: 'typing',
        is_typing: false,
        conversation_id: conversation.id,
      }));
    }
  }, [wsClient, conversation]);

  const getConversationName = () => {
    if (!conversation) return '';

    if (conversation.is_group) {
      return conversation.group_name || 'Grupo';
    }

    const otherParticipant = conversation.participants.find(p => p.id !== user?.id);
    return otherParticipant ? `${otherParticipant.first_name} ${otherParticipant.last_name}` : 'Usuario';
  };

  const getAvatar = () => {
    if (!conversation) return '';

    if (conversation.is_group) {
      return conversation.group_name ? conversation.group_name.charAt(0).toUpperCase() : 'G';
    }

    const otherParticipant = conversation.participants.find(p => p.id !== user?.id);
    return otherParticipant ? otherParticipant.first_name.charAt(0).toUpperCase() : 'U';
  };

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 mb-4">
            <span className="text-6xl">💬</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Selecciona una conversación</h3>
          <p className="text-gray-600">Elige una conversación de la lista para comenzar a chatear</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header del chat */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold">{getAvatar()}</span>
            </div>
            {/* Aquí podrías agregar indicador de online */}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-900">{getConversationName()}</h3>
            <p className="text-sm text-gray-500">
              {conversation.is_group ? `${conversation.participants.length} miembros` : 'Chat individual'}
            </p>
          </div>
        </div>
      </div>

      {/* Mensajes */}
      <div
        ref={(el) => {
          messagesContainerRef.current = el;
          scrollTriggerRef.current = el;
        }}
        className="flex-1 overflow-y-auto p-4 space-y-2"
      >
        {loading && hasMore && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        )}

        {messages.map((message) => (
          <MessageItem
            key={message.id}
            message={message}
            onReaction={handleReaction}
          />
        ))}

        {/* Indicador de escritura */}
        {currentTypingUsers.length > 0 && (
          <div className="flex items-center space-x-2 text-gray-500 text-sm">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span>
              {currentTypingUsers.length === 1
                ? `${currentTypingUsers[0].first_name} está escribiendo...`
                : `${currentTypingUsers.map(u => u.first_name).join(', ')} están escribiendo...`
              }
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input de mensaje */}
      <MessageInput
        onSendMessage={handleSendMessage}
        onTypingStart={handleTypingStart}
        onTypingStop={handleTypingStop}
        disabled={false}
      />
    </div>
  );
};

export default ChatWindow;