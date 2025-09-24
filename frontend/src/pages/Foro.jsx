import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import forumService from '../services/forumService';
import { 
  MessageCircle, 
  Plus, 
  Search, 
  Pin, 
  Lock, 
  Heart,
  Eye,
  Calendar,
  User,
  Filter,
  TrendingUp
} from 'lucide-react';

const Foro = () => {
  const navigate = useNavigate();
  const { user: _user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [topics, setTopics] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreateTopic, setShowCreateTopic] = useState(false);
  const [forumStats, setForumStats] = useState(null);

  useEffect(() => {
    loadForumData();
  }, []);

  useEffect(() => {
    loadTopics();
  }, [selectedCategory, searchTerm]);

  const loadForumData = async () => {
    try {
      setLoading(true);
      const [categoriesData, statsData] = await Promise.all([
        forumService.getCategories(),
        forumService.getForumStats()
      ]);
      setCategories(categoriesData.results || categoriesData);
      setForumStats(statsData);
    } catch (error) {
      console.error('Error loading forum data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTopics = async () => {
    try {
      const topicsData = await forumService.getTopics(
        selectedCategory?.id, 
        searchTerm || null
      );
      setTopics(topicsData.results || topicsData);
    } catch (error) {
      console.error('Error loading topics:', error);
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setSearchTerm('');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadTopics();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Foro de Discusión
              </h1>
              <p className="text-gray-600">
                Comparte ideas, haz preguntas y conecta con otros estudiantes
              </p>
            </div>
            <button
              onClick={() => setShowCreateTopic(true)}
              className="mt-4 md:mt-0 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Nuevo Tema
            </button>
          </div>

          {/* Stats */}
          {forumStats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {forumStats.total_categories}
                </div>
                <div className="text-sm text-gray-600">Categorías</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {forumStats.total_topics}
                </div>
                <div className="text-sm text-gray-600">Temas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {forumStats.total_replies}
                </div>
                <div className="text-sm text-gray-600">Respuestas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {forumStats.popular_topics?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Populares</div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Search */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Buscar temas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </form>
            </div>

            {/* Categories */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Categorías
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => handleCategorySelect(null)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    !selectedCategory 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  Todas las categorías
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategorySelect(category)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedCategory?.id === category.id 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{category.name}</span>
                      <span className="text-xs text-gray-500">
                        {category.topics_count || 0}
                      </span>
                    </div>
                    {category.description && (
                      <div className="text-xs text-gray-500 mt-1">
                        {category.description}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Topics List */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-4 border-b border-gray-200">
                <h2 className="font-semibold text-gray-900">
                  {selectedCategory ? selectedCategory.name : 'Todos los Temas'}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {topics.length} tema{topics.length !== 1 ? 's' : ''} encontrado{topics.length !== 1 ? 's' : ''}
                </p>
              </div>

              <div className="divide-y divide-gray-200">
                {topics.length === 0 ? (
                  <div className="p-8 text-center">
                    <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No hay temas disponibles
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {selectedCategory 
                        ? 'No se encontraron temas en esta categoría.' 
                        : 'Sé el primero en crear un tema de discusión.'
                      }
                    </p>
                    <button
                      onClick={() => setShowCreateTopic(true)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Crear Primer Tema
                    </button>
                  </div>
                ) : (
                  topics.map((topic) => (
                    <div key={topic.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {topic.is_pinned && (
                              <Pin className="w-4 h-4 text-yellow-500" />
                            )}
                            {topic.is_locked && (
                              <Lock className="w-4 h-4 text-red-500" />
                            )}
                            <h3 
                              className="font-medium text-gray-900 hover:text-blue-600 cursor-pointer"
                              onClick={() => navigate(`/aula-virtual/foro/tema/${topic.id}`)}
                            >
                              {topic.title}
                            </h3>
                          </div>
                          
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {topic.content}
                          </p>

                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {topic.author_name}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(topic.created_at)}
                            </div>
                            <div className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {topic.views_count} vistas
                            </div>
                            <div className="flex items-center gap-1">
                              <MessageCircle className="w-3 h-3" />
                              {topic.replies_count} respuestas
                            </div>
                            <div className="flex items-center gap-1">
                              <Heart className="w-3 h-3" />
                              {topic.likes_count} likes
                            </div>
                          </div>
                        </div>

                        <div className="ml-4 text-right">
                          <div className="text-xs text-gray-500">
                            Última actividad
                          </div>
                          <div className="text-xs text-gray-700">
                            {formatDate(topic.updated_at)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Topic Modal */}
      {showCreateTopic && (
        <CreateTopicModal
          categories={categories}
          onClose={() => setShowCreateTopic(false)}
          onSuccess={() => {
            setShowCreateTopic(false);
            loadTopics();
          }}
        />
      )}
    </div>
  );
};

// Modal para crear tema
const CreateTopicModal = ({ categories, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim() || !formData.category) {
      alert('Por favor completa todos los campos');
      return;
    }

    try {
      setLoading(true);
      await forumService.createTopic(formData);
      onSuccess();
    } catch (error) {
      console.error('Error creating topic:', error);
      alert('Error al crear el tema');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Crear Nuevo Tema
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Selecciona una categoría</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Escribe un título descriptivo..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contenido
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe tu tema de discusión..."
                required
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Creando...' : 'Crear Tema'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Foro;