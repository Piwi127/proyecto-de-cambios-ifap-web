import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import chatService from '../services/chatService';

const Chat = ({ roomId, courseId, isOpen, onClose }) => {
  const { user, token } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (isOpen && (roomId || courseId)) {
      initializeChat();
    }

    return () => {
      chatService.disconnect();
    };
  }, [isOpen, roomId, courseId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeChat = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar mensajes existentes
      if (roomId) {
        const messagesData = await chatService.getMessages(roomId);
        setMessages(messagesData.results || []);
        chatService.connectToRoom(roomId, token);
      } else if (courseId) {
        const messagesData = await chatService.getMessages(courseId);
        setMessages(messagesData.results || []);
        chatService.connectToCourseRoom(courseId, token);
      }

      // Configurar event listeners
      chatService.on('connected', handleConnected);
      chatService.on('disconnected', handleDisconnected);
      chatService.on('message', handleNewMessage);
      chatService.on('typing', handleTyping);
      chatService.on('stopped_typing', handleStoppedTyping);
      chatService.on('error', handleError);

    } catch (error) {
      console.error('Error initializing chat:', error);
      setError('Error al conectar con el chat');
    } finally {
      setLoading(false);
    }
  };

  const handleConnected = () => {
    setIsConnected(true);
    setError(null);
  };

  const handleDisconnected = () => {
    setIsConnected(false);
  };

  const handleNewMessage = (message) => {
    setMessages(prev => [...prev, message]);
    
    // Marcar como leído si no es del usuario actual
    if (message.sender.id !== user.id) {
      chatService.markMessageAsRead(message.id);
    }
  };

  const handleTyping = (data) => {
    if (data.user_id !== user.id) {
      setTypingUsers(prev => {
        if (!prev.includes(data.username)) {
          return [...prev, data.username];
        }
        return prev;
      });
    }
  };

  const handleStoppedTyping = (data) => {
    setTypingUsers(prev => prev.filter(username => username !== data.username));
  };

  const handleError = (error) => {
    console.error('Chat error:', error);
    setError('Error de conexión');
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !isConnected) return;

    try {
      const messageData = {
        content: newMessage.trim(),
        room: roomId || courseId
      };

      // Enviar a través de WebSocket para tiempo real
      chatService.sendChatMessage(newMessage.trim());
      
      // También enviar a través de API para persistencia
      await chatService.sendMessage(messageData);
      
      setNewMessage('');
      stopTyping();
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Error al enviar mensaje');
    }
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    
    if (!isTyping) {
      setIsTyping(true);
      chatService.sendTypingIndicator();
    }

    // Reset typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 2000);
  };

  const stopTyping = () => {
    if (isTyping) {
      setIsTyping(false);
      chatService.sendStopTypingIndicator();
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hoy';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ayer';
    } else {
      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short'
      });
    }
  };

  const groupMessagesByDate = (messages) => {
    const groups = {};
    messages.forEach(message => {
      const date = new Date(message.created_at).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    return groups;
  };

  if (!isOpen) return null;

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md h-[600px] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
            <div>
              <h3 className="font-semibold">
                {courseId ? 'Chat del Curso' : 'Chat Directo'}
              </h3>
              <p className="text-blue-100 text-sm">
                {isConnected ? 'Conectado' : 'Desconectado'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-red-500 text-center">
                <p className="font-medium">Error de conexión</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          ) : (
            <>
              {Object.entries(messageGroups).map(([date, dayMessages]) => (
                <div key={date}>
                  {/* Date separator */}
                  <div className="flex items-center justify-center my-4">
                    <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                      {formatDate(dayMessages[0].created_at)}
                    </div>
                  </div>

                  {/* Messages for this date */}
                  {dayMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender.id === user.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                          message.sender.id === user.id
                            ? 'bg-blue-600 text-white rounded-br-md'
                            : 'bg-white text-gray-800 rounded-bl-md shadow-sm'
                        }`}
                      >
                        {message.sender.id !== user.id && (
                          <p className="text-xs font-medium text-gray-500 mb-1">
                            {message.sender.first_name} {message.sender.last_name}
                          </p>
                        )}
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.sender.id === user.id ? 'text-blue-100' : 'text-gray-400'
                        }`}>
                          {formatTime(message.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ))}

              {/* Typing indicator */}
              {typingUsers.length > 0 && (
                <div className="flex justify-start">
                  <div className="bg-gray-200 text-gray-600 px-4 py-2 rounded-2xl rounded-bl-md">
                    <div className="flex items-center space-x-1">
                      <span className="text-xs">
                        {typingUsers.join(', ')} está{typingUsers.length > 1 ? 'n' : ''} escribiendo
                      </span>
                      <div className="flex space-x-1">
                        <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-200">
          <form onSubmit={sendMessage} className="flex items-center space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={handleInputChange}
              placeholder="Escribe un mensaje..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={!isConnected}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || !isConnected}
              className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;