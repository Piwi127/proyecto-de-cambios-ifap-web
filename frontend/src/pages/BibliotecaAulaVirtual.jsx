import React, { useState } from 'react';
import Card from '../components/Card';

const BibliotecaAulaVirtual = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todos');

  const resources = [
    {
      id: 1,
      title: 'Guía de Clasificación Documental',
      type: 'pdf',
      category: 'archivistica',
      description: 'Manual completo sobre técnicas de clasificación y organización documental.',
      author: 'Dra. María González',
      size: '2.5 MB',
      downloads: 245,
      rating: 4.8,
      course: 'Archivística Básica'
    },
    {
      id: 2,
      title: 'Normas ISO para Archivos Digitales',
      type: 'pdf',
      category: 'digital',
      description: 'Estándares internacionales para la gestión de archivos digitales.',
      author: 'Ing. Carlos Rodríguez',
      size: '1.8 MB',
      downloads: 189,
      rating: 4.6,
      course: 'Gestión Digital de Archivos'
    },
    {
      id: 3,
      title: 'Video: Técnicas de Preservación',
      type: 'video',
      category: 'preservacion',
      description: 'Tutorial práctico sobre métodos de conservación documental.',
      author: 'Dr. Juan Pérez',
      size: '45 MB',
      downloads: 156,
      rating: 4.9,
      course: 'Preservación Documental'
    },
    {
      id: 4,
      title: 'Base de Datos Histórica Peruana',
      type: 'dataset',
      category: 'historico',
      description: 'Conjunto de datos sobre archivos históricos del período colonial.',
      author: 'Instituto IFAP',
      size: '15 MB',
      downloads: 98,
      rating: 4.7,
      course: 'Archivos Históricos del Perú'
    },
    {
      id: 5,
      title: 'Plantillas de Inventario',
      type: 'template',
      category: 'herramientas',
      description: 'Plantillas editables para crear inventarios documentales.',
      author: 'Equipo IFAP',
      size: '500 KB',
      downloads: 312,
      rating: 4.5,
      course: 'Archivística Básica'
    }
  ];

  const categories = [
    { id: 'todos', name: 'Todos', icon: '📚' },
    { id: 'archivistica', name: 'Archivística', icon: '📄' },
    { id: 'digital', name: 'Digital', icon: '💻' },
    { id: 'preservacion', name: 'Preservación', icon: '🛡️' },
    { id: 'historico', name: 'Histórico', icon: '🏛️' },
    { id: 'herramientas', name: 'Herramientas', icon: '🛠️' }
  ];

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.author.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'todos' || resource.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const getTypeIcon = (type) => {
    switch (type) {
      case 'pdf': return '📄';
      case 'video': return '🎥';
      case 'dataset': return '📊';
      case 'template': return '📝';
      default: return '📄';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'pdf': return 'bg-red-100 text-red-800';
      case 'video': return 'bg-blue-100 text-blue-800';
      case 'dataset': return 'bg-green-100 text-green-800';
      case 'template': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Biblioteca de Recursos</h1>
        <p className="text-primary-100">Accede a materiales complementarios, guías y recursos adicionales para tu aprendizaje</p>
      </div>

      {/* Filtros y búsqueda */}
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

          <div className="w-full md:w-80">
            <input
              type="text"
              placeholder="Buscar recursos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
      </Card>

      {/* Lista de recursos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map((resource) => (
          <Card key={resource.id} className="hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">{getTypeIcon(resource.type)}</span>
                  <div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(resource.type)}`}>
                      {resource.type.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="mr-1">⭐</span>
                  {resource.rating}
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">{resource.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{resource.description}</p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <span className="mr-2">👤</span>
                  {resource.author}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="mr-2">📚</span>
                  {resource.course}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="mr-2">💾</span>
                  {resource.size}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="mr-2">📥</span>
                  {resource.downloads} descargas
                </div>
              </div>

              <button className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium">
                Descargar Recurso
              </button>
            </div>
          </Card>
        ))}
      </div>

      {filteredResources.length === 0 && (
        <Card className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <span className="text-6xl">📚</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron recursos</h3>
          <p className="text-gray-600">Intenta ajustar los filtros de búsqueda</p>
        </Card>
      )}

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-4">
            <span className="text-2xl">📄</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{resources.filter(r => r.type === 'pdf').length}</h3>
          <p className="text-gray-600">Documentos PDF</p>
        </Card>

        <Card className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-4">
            <span className="text-2xl">🎥</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{resources.filter(r => r.type === 'video').length}</h3>
          <p className="text-gray-600">Videos Tutoriales</p>
        </Card>

        <Card className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-4">
            <span className="text-2xl">📊</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{resources.filter(r => r.type === 'dataset').length}</h3>
          <p className="text-gray-600">Conjuntos de Datos</p>
        </Card>

        <Card className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg mx-auto mb-4">
            <span className="text-2xl">📝</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{resources.filter(r => r.type === 'template').length}</h3>
          <p className="text-gray-600">Plantillas</p>
        </Card>
      </div>
    </div>
  );
};

export default BibliotecaAulaVirtual;