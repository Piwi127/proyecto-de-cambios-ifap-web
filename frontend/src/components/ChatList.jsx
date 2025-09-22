import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import chatService from '../services/chatService';
import Chat from './Chat';

const ChatList = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [chatRooms, setChatRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null);
  const [activeTab, setActiveTab] = useState('direct'); // 'direct' or 'course'

  useEffect(() => {
    if (isOpen) {
      loadChatRooms();
    }
  }, [isOpen]);

  const loadChatRooms = async () => {
    try {
      setLoading(true);
      setError(null);
      const rooms = await chatService.getChatRooms();
      setChatRooms(rooms.results || []);
    } catch (error) {
      console.error('Error loading chat rooms:', error);
      setError('Error al cargar los chats');
    } finally {
      setLoading(false);
    }
  };

  const createDirectChat = async (participantId) => {
    try {
      const roomData = {
        name: `Chat directo`,
        room_type: 'direct',
        participants: [participantId]
      };
      
      const newRoom = await chatService.createChatRoom(roomData);
      setChatRooms(prev => [newRoom, ...prev]);
      setSelectedChat({ roomId: newRoom.id, type: 'direct' });
    } catch (error) {
      console.error('Error creating direct chat:', error);
      setError('Error al crear el chat');
    }
  };

  const openChat = (room) => {
    if (room.room_type === 'course') {
      setSelectedChat({ courseId: room.course?.id, type: 'course' });
    } else {
      setSelectedChat({ roomId: room.id, type: 'direct' });
    }
  };

  const closeChat = () => {
    setSelectedChat(null);
  };

  const formatLastMessage = (room) => {
    if (!room.last_message) return 'Sin mensajes';
    
    const content = room.last_message.content;
    const maxLength = 30;
    return content.length > maxLength ? content.substring(0, maxLength) + '...' : content;
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short'
      });
    }
  };

  const getParticipantName = (room) => {
    if (room.room_type === 'course') {
      return room.course?.title || 'Chat del Curso';
    }
    
    const otherParticipant = room.participants?.find(p => p.id !== user.id);
    return otherParticipant ? 
      `${otherParticipant.first_name} ${otherParticipant.last_name}` : 
      'Chat Directo';
  };

  const directChats = chatRooms.filter(room => room.room_type === 'direct');
  const courseChats = chatRooms.filter(room => room.room_type === 'course');

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md h-[600px] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">💬</div>
              <div>
                <h3 className="font-semibold">Mensajes</h3>
                <p className="text-blue-100 text-sm">
                  {chatRooms.length} conversaciones
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

          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('direct')}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                activeTab === 'direct'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Directos ({directChats.length})
            </button>
            <button
              onClick={() => setActiveTab('course')}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                activeTab === 'course'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Cursos ({courseChats.length})
            </button>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-red-500 text-center">
                  <p className="font-medium">Error</p>
                  <p className="text-sm">{error}</p>
                  <button
                    onClick={loadChatRooms}
                    className="mt-2 text-blue-600 hover:text-blue-700 text-sm"
                  >
                    Reintentar
                  </button>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {(activeTab === 'direct' ? directChats : courseChats).map((room) => (
                  <div
                    key={room.id}
                    onClick={() => openChat(room)}
                    className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${
                          room.room_type === 'course' 
                            ? 'bg-green-500' 
                            : 'bg-blue-500'
                        }`}>
                          {room.room_type === 'course' ? '🎓' : '👤'}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {getParticipantName(room)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatTime(room.last_message?.created_at)}
                          </p>
                        </div>
                        <p className="text-sm text-gray-500 truncate">
                          {formatLastMessage(room)}
                        </p>
                      </div>

                      {/* Unread indicator */}
                      {room.unread_count > 0 && (
                        <div className="flex-shrink-0">
                          <div className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                            {room.unread_count > 9 ? '9+' : room.unread_count}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {(activeTab === 'direct' ? directChats : courseChats).length === 0 && (
                  <div className="flex items-center justify-center h-32">
                    <div className="text-gray-500 text-center">
                      <div className="text-4xl mb-2">💬</div>
                      <p className="text-sm">
                        {activeTab === 'direct' 
                          ? 'No tienes chats directos' 
                          : 'No tienes chats de curso'
                        }
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <button
              onClick={() => {/* TODO: Implementar nuevo chat */}}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              + Nuevo Chat
            </button>
          </div>
        </div>
      </div>

      {/* Chat Component */}
      {selectedChat && (
        <Chat
          roomId={selectedChat.roomId}
          courseId={selectedChat.courseId}
          isOpen={true}
          onClose={closeChat}
        />
      )}
    </>
  );
};

export default ChatList;