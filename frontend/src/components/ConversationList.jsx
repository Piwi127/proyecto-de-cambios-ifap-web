import React, { useState, useEffect } from 'react';
import { messagingService } from '../services/messagingService.js';
import { useAuth } from '../context/AuthContext.jsx';

const ConversationItem = ({ conversation, isSelected, onClick }) => {
  const formatTime = (timestamp) => {
    if (!timestamp) return '';

    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return 'Ahora';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min`;
    if (diff < 86400000) return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
  };

  const getConversationName = () => {
    if (conversation.is_group) {
      return conversation.group_name || 'Grupo';
    }

    // Para conversaciones individuales, mostrar el nombre del otro participante
    const otherParticipant = conversation.participants.find(p => p.id !== conversation.current_user_id);
    return otherParticipant ? `${otherParticipant.first_name} ${otherParticipant.last_name}` : 'Usuario';
  };

  const getAvatar = () => {
    if (conversation.is_group) {
      return conversation.group_name ? conversation.group_name.charAt(0).toUpperCase() : 'G';
    }

    const otherParticipant = conversation.participants.find(p => p.id !== conversation.current_user_id);
    return otherParticipant ? otherParticipant.first_name.charAt(0).toUpperCase() : 'U';
  };

  return (
    <div
      onClick={onClick}
      className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
        isSelected ? 'bg-primary-50 border-r-4 border-primary-600' : ''
      }`}
    >
      <div className="flex items-center space-x-3">
        <div className="relative">
          <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold">{getAvatar()}</span>
          </div>
          {conversation.online && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900 truncate">
              {getConversationName()}
            </h3>
            <span className="text-xs text-gray-500">
              {conversation.last_message ? formatTime(conversation.last_message.created_at) : ''}
            </span>
          </div>
          <p className="text-xs text-gray-500 mb-1">
            {conversation.is_group ? 'Grupo' : 'Individual'}
          </p>
          <p className="text-sm text-gray-700 truncate">
            {conversation.last_message ?
              `${conversation.last_message.sender.username}: ${conversation.last_message.content}` :
              'Sin mensajes'
            }
          </p>
        </div>

        {conversation.unread_count > 0 && (
          <div className="flex-shrink-0">
            <span className="inline-flex items-center justify-center w-6 h-6 bg-primary-600 text-white text-xs font-bold rounded-full">
              {conversation.unread_count}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

const ConversationList = ({ conversations, selectedConversation, onSelectConversation, loading, error }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();

  // Agregar current_user_id a las conversaciones para el componente
  const conversationsWithUserId = conversations.map(conv => ({
    ...conv,
    current_user_id: user?.id
  }));

  const filteredConversations = conversationsWithUserId.filter(conv => {
    const name = conv.is_group ?
      (conv.group_name || 'Grupo') :
      conv.participants.find(p => p.id !== user?.id)?.first_name || '';

    return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           (conv.last_message?.content || '').toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <div className="text-red-500 mb-2">
          <span className="text-4xl">⚠️</span>
        </div>
        <p className="text-sm text-gray-600">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-3 py-1 bg-primary-600 text-white text-sm rounded hover:bg-primary-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header con búsqueda */}
      <div className="p-4 border-b border-gray-200">
        <input
          type="text"
          placeholder="Buscar conversaciones..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
        />
      </div>

      {/* Lista de conversaciones */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-400 mb-4">
              <span className="text-4xl">💬</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No se encontraron conversaciones' : 'No hay conversaciones'}
            </h3>
            <p className="text-gray-600 text-sm">
              {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Comienza una nueva conversación'}
            </p>
          </div>
        ) : (
          filteredConversations.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              isSelected={selectedConversation?.id === conversation.id}
              onClick={() => onSelectConversation(conversation)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ConversationList;