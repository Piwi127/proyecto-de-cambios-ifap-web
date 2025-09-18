import React, { useState } from 'react';
import Card from '../components/Card';

const ForoAulaVirtual = () => {
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewTopic, setShowNewTopic] = useState(false);

  const categories = [
    { id: 'todos', name: 'Todos los temas', icon: '💬' },
    { id: 'archivistica', name: 'Archivística General', icon: '📄' },
    { id: 'digital', name: 'Digitalización', icon: '💻' },
    { id: 'preservacion', name: 'Preservación', icon: '🛡️' },
    { id: 'historico', name: 'Historia Archivística', icon: '🏛️' },
    { id: 'ayuda', name: 'Ayuda y Soporte', icon: '❓' }
  ];

  const topics = [
    {
      id: 1,
      title: '¿Cómo organizar archivos digitales de gran volumen?',
      author: 'Ana García',
      avatar: 'AG',
      category: 'digital',
      replies: 12,
      views: 245,
      lastReply: '2025-09-15 14:30',
      lastReplyBy: 'Carlos Rodríguez',
      isSticky: false,
      isLocked: false
    },
    {
      id: 2,
      title: 'IMPORTANTE: Cambios en las normativas de preservación 2025',
      author: 'Administrador',
      avatar: 'AD',
      category: 'preservacion',
      replies: 8,
      views: 189,
      lastReply: '2025-09-14 16:45',
      lastReplyBy: 'María González',
      isSticky: true,
      isLocked: false
    },
    {
      id: 3,
      title: 'Experiencias con digitalización de documentos coloniales',
      author: 'Juan Pérez',
      avatar: 'JP',
      category: 'historico',
      replies: 15,
      views: 312,
      lastReply: '2025-09-13 11:20',
      lastReplyBy: 'Ana García',
      isSticky: false,
      isLocked: false
    },
    {
      id: 4,
      title: 'Problemas con la clasificación de documentos administrativos',
      author: 'Roberto Mendoza',
      avatar: 'RM',
      category: 'archivistica',
      replies: 6,
      views: 98,
      lastReply: '2025-09-12 09:15',
      lastReplyBy: 'Carlos Rodríguez',
      isSticky: false,
      isLocked: false
    },
    {
      id: 5,
      title: '¿Dónde encontrar software gratuito para gestión documental?',
      author: 'Luis Torres',
      avatar: 'LT',
      category: 'ayuda',
      replies: 9,
      views: 156,
      lastReply: '2025-09-11 17:30',
      lastReplyBy: 'Ana García',
      isSticky: false,
      isLocked: false
    }
  ];

  const filteredTopics = topics.filter(topic => {
    const matchesSearch = topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      topic.author.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'todos' || topic.category === selectedCategory;

    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    // Ordenar primero los sticky, luego por fecha de último reply
    if (a.isSticky && !b.isSticky) return -1;
    if (!a.isSticky && b.isSticky) return 1;
    return new Date(b.lastReply) - new Date(a.lastReply);
  });

  const getCategoryColor = (category) => {
    switch (category) {
      case 'archivistica': return 'bg-blue-100 text-blue-800';
      case 'digital': return 'bg-green-100 text-green-800';
      case 'preservacion': return 'bg-purple-100 text-purple-800';
      case 'historico': return 'bg-yellow-100 text-yellow-800';
      case 'ayuda': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Foro de Discusión</h1>
        <p className="text-primary-100">Comparte conocimientos, resuelve dudas y conecta con otros estudiantes e instructores</p>
      </div>

      {/* Barra de acciones */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Buscar temas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <button
              onClick={() => setShowNewTopic(true)}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              Nuevo Tema
            </button>
          </div>
        </div>
      </Card>

      {/* Lista de temas */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tema
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Respuestas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vistas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Última Actividad
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTopics.map((topic) => (
                <tr key={topic.id} className={`hover:bg-gray-50 cursor-pointer ${topic.isSticky ? 'bg-blue-50' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">{topic.avatar}</span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          {topic.isSticky && <span className="text-blue-600 text-sm">📌</span>}
                          {topic.isLocked && <span className="text-gray-500 text-sm">🔒</span>}
                          <h3 className="text-sm font-medium text-gray-900 truncate">{topic.title}</h3>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">por {topic.author}</span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(topic.category)}`}>
                            {categories.find(cat => cat.id === topic.category)?.name}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {topic.replies}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {topic.views}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>
                      <div className="text-gray-900">{topic.lastReply}</div>
                      <div>por {topic.lastReplyBy}</div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTopics.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <span className="text-6xl">💬</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron temas</h3>
            <p className="text-gray-600">Intenta ajustar los filtros de búsqueda o crea un nuevo tema</p>
          </div>
        )}
      </Card>

      {/* Estadísticas del foro */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-4">
            <span className="text-2xl">💬</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{topics.length}</h3>
          <p className="text-gray-600">Temas Activos</p>
        </Card>

        <Card className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-4">
            <span className="text-2xl">📝</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
            {topics.reduce((acc, topic) => acc + topic.replies, 0)}
          </h3>
          <p className="text-gray-600">Respuestas Totales</p>
        </Card>

        <Card className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-4">
            <span className="text-2xl">👥</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
            {new Set(topics.map(t => t.author)).size}
          </h3>
          <p className="text-gray-600">Participantes</p>
        </Card>

        <Card className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg mx-auto mb-4">
            <span className="text-2xl">👀</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
            {topics.reduce((acc, topic) => acc + topic.views, 0)}
          </h3>
          <p className="text-gray-600">Vistas Totales</p>
        </Card>
      </div>

      {/* Modal para nuevo tema */}
      {showNewTopic && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Crear Nuevo Tema</h2>
              <button
                onClick={() => setShowNewTopic(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>

            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título del Tema</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Escribe un título descriptivo..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                  {categories.filter(cat => cat.id !== 'todos').map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mensaje</label>
                <textarea
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Describe tu pregunta o tema de discusión..."
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowNewTopic(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Publicar Tema
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ForoAulaVirtual;