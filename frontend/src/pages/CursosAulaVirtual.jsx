import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext.jsx'; // Comentado: no utilizado
import { courseService } from '../services/courseService.js';
import Card from '../components/Card';

const CursosAulaVirtual = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrolling, setEnrolling] = useState({});
  // const {  } = useAuth(); // Comentado: no se utiliza actualmente

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);

      // Obtener todos los cursos disponibles
      const allCourses = await courseService.getAllCourses();

      // Validar que allCourses sea un array
      if (!Array.isArray(allCourses)) {
        console.error('API did not return an array for courses:', allCourses);
        setError('Error en el formato de respuesta de la API. Por favor, contacta al administrador.');
        setCourses([]);
        return;
      }

      // Obtener cursos en los que el usuario está inscrito
      let enrolledCourses = [];
      try {
        enrolledCourses = await courseService.getMyCourses();
        // Validar que enrolledCourses también sea un array
        if (!Array.isArray(enrolledCourses)) {
          console.warn('API did not return an array for enrolled courses, using empty array');
          enrolledCourses = [];
        }
      } catch (enrollError) {
        console.log('User not enrolled in any courses or not authenticated:', enrollError.message);
        enrolledCourses = [];
      }

      // Combinar información: marcar cursos en los que el usuario está inscrito
      const coursesWithEnrollment = allCourses.map(course => ({
        ...course,
        enrolled: enrolledCourses.some(ec => ec.id === course.id),
        progress: enrolledCourses.find(ec => ec.id === course.id)?.progress || 0,
        status: enrolledCourses.find(ec => ec.id === course.id)?.progress === 100 ?
                'completado' :
                enrolledCourses.some(ec => ec.id === course.id) ?
                'en-progreso' : 'disponible'
      }));

      setCourses(coursesWithEnrollment);
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('Error al cargar los cursos. Por favor, intenta nuevamente.');
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      setEnrolling(prev => ({ ...prev, [courseId]: true }));
      await courseService.enrollInCourse(courseId);
      
      // Actualizar el estado local
      setCourses(prev => prev.map(course => 
        course.id === courseId 
          ? { ...course, enrolled: true, status: 'en-progreso' }
          : course
      ));
      
    } catch (err) {
      console.error('Error enrolling in course:', err);
      setError('Error al inscribirse en el curso. Por favor, intenta nuevamente.');
    } finally {
      setEnrolling(prev => ({ ...prev, [courseId]: false }));
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesFilter = filter === 'todos' ||
      (filter === 'en-progreso' && course.status === 'en-progreso') ||
      (filter === 'completados' && course.status === 'completado') ||
      (filter === 'disponibles' && course.status === 'disponible');

    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (course.instructor_name && course.instructor_name.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'en-progreso': return 'bg-blue-100 text-blue-800';
      case 'completado': return 'bg-green-100 text-green-800';
      case 'disponible': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'en-progreso': return 'En Progreso';
      case 'completado': return 'Completado';
      case 'disponible': return 'Disponible';
      default: return status;
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      archivística: '📄',
      digital: '💻',
      histórico: '🏛️',
      preservación: '🔍',
      legal: '⚖️',
      básico: '📚',
      avanzado: '🎓'
    };
    
    return icons[category] || '📚';
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

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchCourses}
              className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Catálogo de Cursos</h1>
        <p className="text-primary-100">Explora y únete a nuestros programas de formación archivística</p>
      </div>

      {/* Filtros y búsqueda */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('todos')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'todos' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todos ({courses.length})
            </button>
            <button
              onClick={() => setFilter('en-progreso')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'en-progreso' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              En Progreso ({courses.filter(c => c.status === 'en-progreso').length})
            </button>
            <button
              onClick={() => setFilter('completados')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'completados' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Completados ({courses.filter(c => c.status === 'completado').length})
            </button>
            <button
              onClick={() => setFilter('disponibles')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'disponibles' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Disponibles ({courses.filter(c => c.status === 'disponible').length})
            </button>
          </div>

          <div className="w-full md:w-80">
            <input
              type="text"
              placeholder="Buscar cursos, instructores..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
      </Card>

      {/* Lista de cursos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          course && (
            <Card key={course.id} className="hover:shadow-lg transition-shadow h-full flex flex-col">
              <div className="relative flex-1">
                <div className="w-full h-48 bg-gradient-to-br from-blue-500 to-blue-600 rounded-t-lg flex items-center justify-center">
                  <span className="text-6xl text-white opacity-90">
                    {getCategoryIcon(course.modality || 'básico')}
                  </span>
                </div>
                <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(course.status)}`}>
                  {getStatusText(course.status)}
                </div>
                {course.enrolled && course.progress > 0 && (
                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="w-full bg-white bg-opacity-90 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-white font-medium mt-1 text-center">
                      {course.progress}% completado
                    </p>
                  </div>
                )}
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{course.title}</h3>
                <p className="text-gray-600 text-sm mb-4 flex-1 line-clamp-3">{course.description}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="mr-2">👨‍🏫</span>
                    {course.instructor_name || 'Instructor por asignar'}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="mr-2">⏰</span>
                    {course.duration_hours || 0} horas
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="mr-2">🎯</span>
                    {course.modality ? course.modality.charAt(0).toUpperCase() + course.modality.slice(1) : 'Virtual'}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="mr-2">👥</span>
                    {course.enrolled_students_count || 0} estudiantes
                  </div>
                </div>

                <div className="mt-auto">
                  {course.enrolled ? (
                    <button 
                      onClick={() => {
                        if (course.status === 'completado') {
                          // Navegar a certificados o mostrar certificado
                          navigate(`/aula-virtual/certificado/${course.id}`);
                        } else {
                          // Navegar al curso para continuar
                          navigate(`/aula-virtual/curso/${course.id}`);
                        }
                      }}
                      className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                    >
                      {course.status === 'completado' ? 'Ver Certificado' : 'Continuar Curso'}
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleEnroll(course.id)}
                      disabled={enrolling[course.id]}
                      className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                    >
                      {enrolling[course.id] ? 'Inscribiendo...' : 'Inscribirme'}
                    </button>
                  )}
                </div>
              </div>
            </Card>
          )
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <Card className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <span className="text-6xl">📚</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron cursos</h3>
          <p className="text-gray-600">Intenta ajustar los filtros de búsqueda</p>
        </Card>
      )}
    </div>
  );
};

export default CursosAulaVirtual;