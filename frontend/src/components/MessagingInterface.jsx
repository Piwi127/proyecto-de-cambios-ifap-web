import React, { useState, useEffect } from 'react';
import Card from './Card';
import ConversationList from './ConversationList';
import ChatWindow from './ChatWindow';
import { useConversations, useConversationMessages, useMessagingWebSocket } from '../hooks/useMessaging.js';
import { messagingService } from '../services/messagingService.js';
import { useAuth } from '../context/AuthContext.jsx';

const NewConversationModal = ({ isOpen, onClose, onCreateConversation }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isGroup, setIsGroup] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async (term) => {
    if (term.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const results = await messagingService.searchUsers(term);
      setSearchResults(results.results || []);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  const handleUserSelect = (user) => {
    if (selectedUsers.find(u => u.id === user.id)) {
      setSelectedUsers(selectedUsers.filter(u => u.id !== user.id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleCreate = async () => {
    if (selectedUsers.length === 0) return;

    setLoading(true);
    try {
      const conversationData = {
        participant_ids: selectedUsers.map(u => u.id),
        is_group: isGroup,
        subject: isGroup ? groupName : `Chat con ${selectedUsers[0].first_name}`,
        group_name: isGroup ? groupName : null
      };

      await onCreateConversation(conversationData);
      onClose();
      setSelectedUsers([]);
      setGroupName('');
      setIsGroup(false);
    } catch (error) {
      console.error('Error creating conversation:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold mb-4">Nueva Conversación</h3>

        {/* Toggle grupo/individual */}
        <div className="flex items-center space-x-3 mb-4">
          <label className="flex items-center">
            <input
              type="radio"
              checked={!isGroup}
              onChange={() => setIsGroup(false)}
              className="mr-2"
            />
            Individual
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              checked={isGroup}
              onChange={() => setIsGroup(true)}
              className="mr-2"
            />
            Grupo
          </label>
        </div>

        {/* Nombre del grupo */}
        {isGroup && (
          <input
            type="text"
            placeholder="Nombre del grupo"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4"
          />
        )}

        {/* Búsqueda de usuarios */}
        <input
          type="text"
          placeholder="Buscar usuarios..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4"
        />

        {/* Resultados de búsqueda */}
        <div className="max-h-40 overflow-y-auto mb-4">
          {searchResults.map(user => (
            <div
              key={user.id}
              onClick={() => handleUserSelect(user)}
              className={`p-2 cursor-pointer rounded ${
                selectedUsers.find(u => u.id === user.id)
                  ? 'bg-primary-100 border border-primary-300'
                  : 'hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {user.first_name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm">{user.first_name} {user.last_name}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Usuarios seleccionados */}
        {selectedUsers.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium mb-2">Seleccionados:</p>
            <div className="flex flex-wrap gap-2">
              {selectedUsers.map(user => (
                <span
                  key={user.id}
                  className="bg-primary-100 text-primary-800 px-2 py-1 rounded-full text-xs"
                >
                  {user.first_name} {user.last_name}
                  <button
                    onClick={() => handleUserSelect(user)}
                    className="ml-1 text-primary-600 hover:text-primary-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Botones */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleCreate}
            disabled={selectedUsers.length === 0 || loading || (isGroup && !groupName.trim())}
            className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            {loading ? 'Creando...' : 'Crear'}
          </button>
        </div>
      </div>
    </div>
  );
};

const MessagingInterface = () => {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [showNewConversationModal, setShowNewConversationModal] = useState(false);
  const { user } = useAuth();

  const {
    conversations,
    conversationsLoading,
    conversationsError,
    fetchConversations,
    createConversation,
  } = useConversations();

  const {
    messages,
    loading: messagesLoading,
    error: messagesError,
    sendMessage,
    loadMore,
    hasMore
  } = useConversationMessages(selectedConversation?.id);

  const {
    isConnected,
    typingUsers,
    sendMessage: wsSendMessage,
    startTyping,
    stopTyping,
    addReaction
  } = useMessagingWebSocket(selectedConversation?.id);

  const handleSendMessage = async (content) => {
    if (!selectedConversation) return;

    try {
      const messageData = {
        conversation: selectedConversation.id,
        content
      };

      // Enviar solo por API REST (WebSocket deshabilitado)
      await sendMessage(messageData);

    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleCreateConversation = async (conversationData) => {
    try {
      const newConversation = await createConversation(conversationData);
      setSelectedConversation(newConversation);
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  const handleReaction = async (messageId, reaction) => {
    try {
      await messagingService.addReaction(messageId, reaction);
      // WebSocket deshabilitado - la reacción se actualizará en el próximo polling
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-lg p-6 text-white mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Mensajes</h1>
            <p className="text-primary-100">Comunícate con instructores y compañeros de clase</p>
          </div>
          <button
            onClick={() => setShowNewConversationModal(true)}
            className="px-4 py-2 bg-white text-primary-600 rounded-lg hover:bg-gray-100 font-medium"
          >
            Nueva Conversación
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-300px)]">
        {/* Lista de conversaciones */}
        <Card className="lg:col-span-1">
          <ConversationList
            conversations={conversations}
            selectedConversation={selectedConversation}
            onSelectConversation={setSelectedConversation}
            loading={conversationsLoading}
            error={conversationsError}
          />
        </Card>

        {/* Chat */}
        <Card className="lg:col-span-2 flex flex-col">
          <ChatWindow
            conversation={selectedConversation}
            messages={messages}
            loading={messagesLoading}
            error={messagesError}
            onSendMessage={handleSendMessage}
            onLoadMore={loadMore}
            hasMore={hasMore}
            typingUsers={typingUsers}
            onReaction={handleReaction}
          />
        </Card>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
        <Card className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-4">
            <span className="text-2xl">💬</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{Array.isArray(conversations) ? conversations.length : 0}</h3>
          <p className="text-gray-600">Conversaciones</p>
        </Card>

        <Card className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-4">
            <span className="text-2xl">📨</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
              {conversations && Array.isArray(conversations) ? conversations.reduce((acc, conv) => acc + (conv.unread_count || 0), 0) : 0}
            </h3>
          <p className="text-gray-600">Mensajes Sin Leer</p>
        </Card>

        <Card className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-4">
            <span className="text-2xl">👥</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
              {Array.isArray(conversations) ? conversations.filter(conv => conv.is_group).length : 0}
            </h3>
          <p className="text-gray-600">Conversaciones Grupales</p>
        </Card>

        <Card className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg mx-auto mb-4">
            <span className="text-2xl">📱</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
            🟢
          </h3>
          <p className="text-gray-600">HTTP Polling</p>
        </Card>
      </div>

      {/* Modal para nueva conversación */}
      <NewConversationModal
        isOpen={showNewConversationModal}
        onClose={() => setShowNewConversationModal(false)}
        onCreateConversation={handleCreateConversation}
      />
    </div>
  );
};

export default MessagingInterface;