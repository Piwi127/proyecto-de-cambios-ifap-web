import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';

const QuizTemplates = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      // TODO: Implementar servicio para obtener plantillas
      // Por ahora usamos datos de ejemplo
      const mockTemplates = [
        {
          id: 1,
          title: 'Evaluación Básica de Conocimientos',
          description: 'Plantilla para evaluaciones generales con preguntas de opción múltiple',
          category: 'general',
          difficulty: 'beginner',
          questionCount: 10,
          estimatedTime: 15,
          tags: ['básico', 'general', 'opción múltiple'],
          usageCount: 45
        },
        {
          id: 2,
          title: 'Examen de Archivística Avanzada',
          description: 'Evaluación completa para estudiantes avanzados en archivística',
          category: 'archivistica',
          difficulty: 'advanced',
          questionCount: 25,
          estimatedTime: 45,
          tags: ['archivística', 'avanzado', 'completo'],
          usageCount: 23
        },
        {
          id: 3,
          title: 'Práctica de Gestión Documental',
          description: 'Ejercicios prácticos sobre gestión y preservación de documentos',
          category: 'gestion',
          difficulty: 'intermediate',
          questionCount: 15,
          estimatedTime: 30,
          tags: ['gestión', 'documental', 'práctica'],
          usageCount: 67
        },
        {
          id: 4,
          title: 'Cuestionario de Verdadero/Falso',
          description: 'Evaluación rápida con preguntas de verdadero o falso',
          category: 'general',
          difficulty: 'beginner',
          questionCount: 20,
          estimatedTime: 10,
          tags: ['verdadero/falso', 'rápido', 'básico'],
          usageCount: 89
        },
        {
          id: 5,
          title: 'Evaluación de Preservación Digital',
          description: 'Preguntas sobre técnicas modernas de preservación digital',
          category: 'preservacion',
          difficulty: 'advanced',
          questionCount: 18,
          estimatedTime: 35,
          tags: ['digital', 'preservación', 'moderno'],
          usageCount: 34
        }
      ];
      setTemplates(mockTemplates);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: 'all', label: 'Todas las categorías' },
    { value: 'general', label: 'General' },
    { value: 'archivistica', label: 'Archivística' },
    { value: 'gestion', label: 'Gestión Documental' },
    { value: 'preservacion', label: 'Preservación' }
  ];

  const difficulties = {
    beginner: { label: 'Principiante', color: 'bg-green-100 text-green-800' },
    intermediate: { label: 'Intermedio', color: 'bg-yellow-100 text-yellow-800' },
    advanced: { label: 'Avanzado', color: 'bg-red-100 text-red-800' }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  const handleUseTemplate = async (template) => {
    try {
      // TODO: Implementar lógica para usar plantilla
      alert(`Usando plantilla: ${template.title}`);
      navigate('/aula-virtual/quizzes/create', {
        state: { template: template }
      });
    } catch (error) {
      console.error('Error using template:', error);
      alert('Error al usar la plantilla');
    }
  };

  const handleCreateCustomTemplate = () => {
    navigate('/aula-virtual/quizzes/create');
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando plantillas...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Plantillas de Quiz</h1>
            <p className="text-purple-100">Utiliza plantillas predefinidas para crear tus evaluaciones</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => navigate('/aula-virtual/quizzes')}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
            >
              ← Quizzes
            </button>
            <button
              onClick={handleCreateCustomTemplate}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
            >
              ➕ Crear Personalizado
            </button>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <nav className="text-sm text-gray-600">
        <span onClick={() => navigate('/aula-virtual/quizzes')} className="cursor-pointer hover:text-primary-600">Quizzes</span>
        <span className="mx-2">/</span>
        <span className="text-primary-600 font-medium">Plantillas</span>
      </nav>

      {/* Filtros y búsqueda */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar plantillas
            </label>
            <input
              type="text"
              placeholder="Buscar por título, descripción o etiquetas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoría
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <div className="text-sm text-gray-600">
              <p className="font-medium">{filteredTemplates.length} plantillas encontradas</p>
              <p>de {templates.length} total</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card variant="primary" className="text-center">
          <div className="text-2xl font-bold text-primary-600 mb-2">
            {templates.length}
          </div>
          <p className="text-gray-600 text-sm">Total Plantillas</p>
        </Card>

        <Card variant="success" className="text-center">
          <div className="text-2xl font-bold text-green-600 mb-2">
            {templates.filter(t => t.difficulty === 'beginner').length}
          </div>
          <p className="text-gray-600 text-sm">Principiante</p>
        </Card>

        <Card variant="warning" className="text-center">
          <div className="text-2xl font-bold text-yellow-600 mb-2">
            {templates.filter(t => t.difficulty === 'intermediate').length}
          </div>
          <p className="text-gray-600 text-sm">Intermedio</p>
        </Card>

        <Card variant="danger" className="text-center">
          <div className="text-2xl font-bold text-red-600 mb-2">
            {templates.filter(t => t.difficulty === 'advanced').length}
          </div>
          <p className="text-gray-600 text-sm">Avanzado</p>
        </Card>
      </div>

      {/* Lista de plantillas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.length > 0 ? (
          filteredTemplates.map(template => (
            <Card key={template.id} className="hover:shadow-lg transition-shadow">
              <div className="flex flex-col h-full">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                      {template.title}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ml-2 flex-shrink-0 ${
                      difficulties[template.difficulty].color
                    }`}>
                      {difficulties[template.difficulty].label}
                    </span>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {template.description}
                  </p>

                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Preguntas:</span>
                      <p className="text-gray-600">{template.questionCount}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Tiempo:</span>
                      <p className="text-gray-600">{template.estimatedTime} min</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {template.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="text-xs text-gray-500">
                    Usado {template.usageCount} veces
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleUseTemplate(template)}
                    className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium"
                  >
                    Usar Plantilla
                  </button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="col-span-full">
            <Card className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <span className="text-6xl">🔍</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron plantillas</h3>
              <p className="text-gray-600 mb-4">Intenta ajustar los filtros de búsqueda</p>
              <button
                onClick={handleCreateCustomTemplate}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
              >
                Crear Quiz Personalizado
              </button>
            </Card>
          </div>
        )}
      </div>

      {/* Crear nueva plantilla */}
      <Card variant="gradient" className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">¿Quieres crear tu propia plantilla?</h3>
          <p className="text-gray-600 mb-6">
            Crea una plantilla personalizada basada en tus necesidades específicas
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleCreateCustomTemplate}
              className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium shadow-lg hover:shadow-xl"
            >
              ➕ Crear Plantilla Personalizada
            </button>
            <button
              onClick={() => navigate('/aula-virtual/quizzes')}
              className="bg-gray-600 text-white px-8 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium shadow-lg hover:shadow-xl"
            >
              ← Volver a Quizzes
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default QuizTemplates;