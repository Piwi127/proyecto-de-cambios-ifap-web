import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Users,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  MoreVertical,
  Download,
  Upload
} from 'lucide-react';
import Card from '../components/Card';

const AdminCourses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedCourses, setSelectedCourses] = useState([]);

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    filterCourses();
  }, [filterCourses]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      // TODO: Implementar llamada a la API
      const mockCourses = [
        {
          id: 1,
          title: 'Archivística Básica',
          description: 'Introducción a los principios fundamentales de la archivística',
          instructor: 'Dra. Ana Martínez',
          category: 'archivistica',
          status: 'active',
          enrolled_students: 45,
          total_students: 50,
          lessons_count: 12,
          quizzes_count: 3,
          created_at: new Date('2024-01-15'),
          updated_at: new Date('2024-09-15')
        },
        {
          id: 2,
          title: 'Gestión Digital de Documentos',
          description: 'Estrategias modernas para la gestión documental digital',
          instructor: 'Dr. Carlos Rodríguez',
          category: 'gestion',
          status: 'active',
          enrolled_students: 32,
          total_students: 40,
          lessons_count: 8,
          quizzes_count: 2,
          created_at: new Date('2024-02-01'),
          updated_at: new Date('2024-09-10')
        },
        {
          id: 3,
          title: 'Preservación de Archivos Históricos',
          description: 'Técnicas avanzadas de preservación y conservación',
          instructor: 'Dra. María González',
          category: 'preservacion',
          status: 'draft',
          enrolled_students: 0,
          total_students: 30,
          lessons_count: 6,
          quizzes_count: 1,
          created_at: new Date('2024-08-01'),
          updated_at: new Date('2024-09-01')
        },
        {
          id: 4,
          title: 'Archivos y Sociedad',
          description: 'El rol de los archivos en la sociedad contemporánea',
          instructor: 'Dr. Luis Sánchez',
          category: 'archivistica',
          status: 'inactive',
          enrolled_students: 28,
          total_students: 35,
          lessons_count: 10,
          quizzes_count: 4,
          created_at: new Date('2023-09-01'),
          updated_at: new Date('2024-06-15')
        }
      ];
      setCourses(mockCourses);
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterCourses = useCallback(() => {
    let filtered = courses.filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.instructor.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || course.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || course.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });

    setFilteredCourses(filtered);
  }, [categoryFilter, courses, searchTerm, statusFilter]);

  const categories = [
    { value: 'all', label: 'Todas las categorías' },
    { value: 'archivistica', label: 'Archivística' },
    { value: 'gestion', label: 'Gestión Documental' },
    { value: 'preservacion', label: 'Preservación' }
  ];

  const statuses = [
    { value: 'all', label: 'Todos los estados' },
    { value: 'active', label: 'Activo' },
    { value: 'draft', label: 'Borrador' },
    { value: 'inactive', label: 'Inactivo' }
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">Activo</span>;
      case 'draft':
        return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">Borrador</span>;
      case 'inactive':
        return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">Inactivo</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">{status}</span>;
    }
  };

  const getCategoryBadge = (category) => {
    const colors = {
      archivistica: 'bg-blue-100 text-blue-800',
      gestion: 'bg-green-100 text-green-800',
      preservacion: 'bg-purple-100 text-purple-800'
    };

    const labels = {
      archivistica: 'Archivística',
      gestion: 'Gestión',
      preservacion: 'Preservación'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[category] || 'bg-gray-100 text-gray-800'}`}>
        {labels[category] || category}
      </span>
    );
  };

  const handleCourseSelection = (courseId) => {
    setSelectedCourses(prev =>
      prev.includes(courseId)
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  const handleSelectAll = () => {
    if (selectedCourses.length === filteredCourses.length) {
      setSelectedCourses([]);
    } else {
      setSelectedCourses(filteredCourses.map(course => course.id));
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedCourses.length === 0) {
      alert('Selecciona al menos un curso');
      return;
    }

    // TODO: Implementar acciones masivas
    alert(`${action} aplicado a ${selectedCourses.length} cursos`);
    setSelectedCourses([]);
  };

  const handleCreateCourse = () => {
    navigate('/admin/courses/create');
  };

  const handleEditCourse = (courseId) => {
    navigate(`/admin/courses/edit/${courseId}`);
  };

  const handleViewCourse = (courseId) => {
    navigate(`/admin/courses/${courseId}`);
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este curso? Esta acción no se puede deshacer.')) {
      return;
    }

    // TODO: Implementar eliminación
    alert(`Curso ${courseId} eliminado exitosamente`);
    loadCourses();
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando cursos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Gestión de Cursos</h1>
            <p className="text-green-100">Administra todos los cursos de la plataforma</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => navigate('/admin')}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
            >
              ← Panel Admin
            </button>
            <button
              onClick={handleCreateCourse}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
            >
              ➕ Nuevo Curso
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card variant="primary" className="text-center">
          <div className="text-2xl font-bold text-primary-600 mb-2">
            {courses.length}
          </div>
          <p className="text-gray-600 text-sm">Total Cursos</p>
        </Card>

        <Card variant="success" className="text-center">
          <div className="text-2xl font-bold text-green-600 mb-2">
            {courses.filter(c => c.status === 'active').length}
          </div>
          <p className="text-gray-600 text-sm">Cursos Activos</p>
        </Card>

        <Card variant="warning" className="text-center">
          <div className="text-2xl font-bold text-yellow-600 mb-2">
            {courses.filter(c => c.status === 'draft').length}
          </div>
          <p className="text-gray-600 text-sm">En Borrador</p>
        </Card>

        <Card variant="info" className="text-center">
          <div className="text-2xl font-bold text-blue-600 mb-2">
            {courses.reduce((sum, c) => sum + c.enrolled_students, 0)}
          </div>
          <p className="text-gray-600 text-sm">Estudiantes Inscritos</p>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <input
              type="text"
              placeholder="Buscar cursos por título, descripción o instructor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            {statuses.map(status => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            {categories.map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Bulk Actions */}
      {selectedCourses.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-blue-800">
                {selectedCourses.length} curso{selectedCourses.length !== 1 ? 's' : ''} seleccionado{selectedCourses.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleBulkAction('Activar')}
                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 inline mr-1" />
                Activar
              </button>
              <button
                onClick={() => handleBulkAction('Desactivar')}
                className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700"
              >
                <XCircle className="w-4 h-4 inline mr-1" />
                Desactivar
              </button>
              <button
                onClick={() => handleBulkAction('Eliminar')}
                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4 inline mr-1" />
                Eliminar
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Courses Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedCourses.length === filteredCourses.length && filteredCourses.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Curso
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Instructor
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estudiantes
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contenido
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCourses.map((course) => (
                <tr key={course.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedCourses.includes(course.id)}
                      onChange={() => handleCourseSelection(course.id)}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{course.title}</div>
                      <div className="text-sm text-gray-500 line-clamp-2">{course.description}</div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-gray-900">{course.instructor}</div>
                  </td>
                  <td className="px-4 py-4">
                    {getCategoryBadge(course.category)}
                  </td>
                  <td className="px-4 py-4">
                    {getStatusBadge(course.status)}
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-gray-900">
                      {course.enrolled_students}/{course.total_students}
                    </div>
                    <div className="text-xs text-gray-500">
                      {Math.round((course.enrolled_students / course.total_students) * 100)}% ocupado
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-gray-900">
                      {course.lessons_count} lecciones
                    </div>
                    <div className="text-sm text-gray-600">
                      {course.quizzes_count} evaluaciones
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewCourse(course.id)}
                        className="text-blue-600 hover:text-blue-900 p-1"
                        title="Ver curso"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditCourse(course.id)}
                        className="text-green-600 hover:text-green-900 p-1"
                        title="Editar curso"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCourse(course.id)}
                        className="text-red-600 hover:text-red-900 p-1"
                        title="Eliminar curso"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron cursos</h3>
            <p className="text-gray-600 mb-4">Intenta ajustar los filtros de búsqueda</p>
            <button
              onClick={handleCreateCourse}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Crear Primer Curso
            </button>
          </div>
        )}
      </Card>

      {/* Quick Actions */}
      <Card variant="gradient" className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Acciones Rápidas</h3>
          <p className="text-gray-600 mb-6">
            Gestiona cursos de manera eficiente
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleCreateCourse}
              className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium shadow-lg hover:shadow-xl"
            >
              ➕ Crear Nuevo Curso
            </button>
            <button
              onClick={() => navigate('/admin/courses/import')}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg hover:shadow-xl"
            >
              📥 Importar Cursos
            </button>
            <button
              onClick={() => navigate('/admin/courses/templates')}
              className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium shadow-lg hover:shadow-xl"
            >
              📋 Plantillas
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdminCourses;
