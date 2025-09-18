import React, { useState } from 'react';
import Card from '../components/Card';

const MensajesAulaVirtual = () => {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const conversations = [
    {
      id: 1,
      name: 'Prof. Ana García',
      avatar: 'AG',
      role: 'Instructor',
      lastMessage: 'Recuerda que la entrega del proyecto es mañana',
      timestamp: '2025-09-15 10:30',
      unread: 2,
      online: true,
      messages: [
        {
          id: 1,
          sender: 'Prof. Ana García',
          content: 'Hola estudiante, ¿cómo vas con el proyecto de digitalización?',
          timestamp: '2025-09-14 09:15',
          isMine: false
        },
        {
          id: 2,
          sender: 'Yo',
          content: 'Hola profesora, ya casi lo termino. Solo me queda revisar algunos detalles.',
          timestamp: '2025-09-14 09:20',
          isMine: true
        },
        {
          id: 3,
          sender: 'Prof. Ana García',
          content: 'Excelente. Recuerda que la entrega del proyecto es mañana antes de las 23:59.',
          timestamp: '2025-09-15 10:30',
          isMine: false
        }
      ]
    },
    {
      id: 2,
      name: 'Carlos Rodríguez',
      avatar: 'CR',
      role: 'Estudiante',
      lastMessage: '¿Me puedes ayudar con el ejercicio de preservación?',
      timestamp: '2025-09-14 16:45',
      unread: 1,
      online: false,
      messages: [
        {
          id: 1,
          sender: 'Carlos Rodríguez',
          content: 'Hola, ¿estás disponible para ayudarme con el ejercicio de preservación de documentos?',
          timestamp: '2025-09-14 16:45',
          isMine: false
        }
      ]
    },
    {
      id: 3,
      name: 'María González',
      avatar: 'MG',
      role: 'Instructor',
      lastMessage: 'Las diapositivas del módulo 3 ya están disponibles',
      timestamp: '2025-09-13 14:20',
      unread: 0,
      online: true,
      messages: [
        {
          id: 1,
          sender: 'María González',
          content: 'Hola clase, acabo de subir las diapositivas del módulo 3 sobre archivos históricos.',
          timestamp: '2025-09-13 14:20',
          isMine: false
        },
        {
          id: 2,
          sender: 'Yo',
          content: 'Gracias profesora, ya las estoy revisando.',
          timestamp: '2025-09-13 14:25',
          isMine: true
        }
      ]
    },
    {
      id: 4,
      name: 'Grupo: Archivística Básica',
      avatar: 'GA',
      role: 'Grupo',
      lastMessage: 'Nuevo material disponible en la biblioteca',
      timestamp: '2025-09-12 11:10',
      unread: 0,
      online: false,
      messages: [
        {
          id: 1,
          sender: 'Sistema',
          content: 'Nuevo material disponible en la biblioteca: "Guía de clasificación documental"',
          timestamp: '2025-09-12 11:10',
          isMine: false
        }
      ]
    }
  ];

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    // Aquí iría la lógica para enviar el mensaje al backend
    console.log('Enviando mensaje:', newMessage);

    // Simular envío exitoso
    setNewMessage('');
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return 'Ahora';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min`;
    if (diff < 86400000) return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-lg p-6 text-white mb-6">
        <h1 className="text-3xl font-bold mb-2">Mensajes</h1>
        <p className="text-primary-100">Comunícate con instructores y compañeros de clase</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-300px)]">
        {/* Lista de conversaciones */}
        <Card className="lg:col-span-1">
          <div className="p-4 border-b border-gray-200">
            <input
              type="text"
              placeholder="Buscar conversaciones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div className="overflow-y-auto h-full">
            {filteredConversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => setSelectedConversation(conv)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedConversation?.id === conv.id ? 'bg-primary-50 border-r-4 border-primary-600' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">{conv.avatar}</span>
                    </div>
                    {conv.online && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-900 truncate">{conv.name}</h3>
                      <span className="text-xs text-gray-500">{formatTime(conv.timestamp)}</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-1">{conv.role}</p>
                    <p className="text-sm text-gray-700 truncate">{conv.lastMessage}</p>
                  </div>

                  {conv.unread > 0 && (
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center justify-center w-6 h-6 bg-primary-600 text-white text-xs font-bold rounded-full">
                        {conv.unread}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Chat */}
        <Card className="lg:col-span-2 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Header del chat */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">{selectedConversation.avatar}</span>
                    </div>
                    {selectedConversation.online && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{selectedConversation.name}</h3>
                    <p className="text-sm text-gray-500">{selectedConversation.role}</p>
                  </div>
                </div>
              </div>

              {/* Mensajes */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {selectedConversation.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isMine ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.isMine
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${message.isMine ? 'text-primary-100' : 'text-gray-500'}`}>
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input para nuevo mensaje */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Escribe un mensaje..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Enviar
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="text-gray-400 mb-4">
                  <span className="text-6xl">💬</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Selecciona una conversación</h3>
                <p className="text-gray-600">Elige una conversación de la lista para comenzar a chatear</p>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
        <Card className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-4">
            <span className="text-2xl">💬</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{conversations.length}</h3>
          <p className="text-gray-600">Conversaciones</p>
        </Card>

        <Card className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-4">
            <span className="text-2xl">📨</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
            {conversations.reduce((acc, conv) => acc + conv.unread, 0)}
          </h3>
          <p className="text-gray-600">Mensajes Sin Leer</p>
        </Card>

        <Card className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-4">
            <span className="text-2xl">👥</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
            {conversations.filter(conv => conv.online).length}
          </h3>
          <p className="text-gray-600">Contactos Online</p>
        </Card>

        <Card className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg mx-auto mb-4">
            <span className="text-2xl">📝</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
            {conversations.reduce((acc, conv) => acc + conv.messages.length, 0)}
          </h3>
          <p className="text-gray-600">Mensajes Totales</p>
        </Card>
      </div>
    </div>
  );
};

export default MensajesAulaVirtual;