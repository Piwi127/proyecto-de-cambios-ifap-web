import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { quizService } from '../services/quizService';
import { courseService } from '../services/courseService';
import Card from '../components/Card';

const QuizzesAulaVirtual = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [filter, setFilter] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [courses, setCourses] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [quizzesData, coursesData] = await Promise.all([
        quizService.getAllQuizzes(),
        courseService.getMyCourses()
      ]);

      setQuizzes(quizzesData);
      setCourses(coursesData);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Error al cargar los quizzes. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesFilter = filter === 'todos' ||
      (filter === 'published' && quiz.is_published) ||
      (filter === 'draft' && !quiz.is_published);

    const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quiz.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCourse = !selectedCourse || quiz.course === parseInt(selectedCourse);

    return matchesFilter && matchesSearch && matchesCourse;
  });

  const getQuizTypeColor = (type) => {
    switch (type) {
      case 'exam': return 'bg-red-100 text-red-800';
      case 'practice': return 'bg-blue-100 text-blue-800';
      case 'survey': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getQuizTypeText = (type) => {
    switch (type) {
      case 'exam': return 'Examen';
      case 'practice': return 'Práctica';
      case 'survey': return 'Encuesta';
      default: return type;
    }
  };

  const getStatusBadge = (quiz) => {
    if (!quiz.is_published) {
      return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">Borrador</span>;
    }
    return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">Publicado</span>;
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando quizzes...</p>
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
              onClick={fetchData}
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
        <h1 className="text-3xl font-bold mb-2">Evaluaciones y Quizzes</h1>
        <p className="text-primary-100">Practica y demuestra tus conocimientos archivísticos</p>
      </div>

      {/* Filtros y búsqueda */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <input
              type="text"
              placeholder="Buscar quizzes por título o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">Todos los cursos</option>
            {courses.map(course => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="todos">Todos los quizzes</option>
            <option value="published">Publicados</option>
            <option value="draft">Borradores</option>
          </select>
        </div>
      </Card>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card variant="primary" className="text-center">
          <div className="text-2xl font-bold text-primary-600 mb-2">
            {quizzes.length}
          </div>
          <p className="text-gray-600">Total Quizzes</p>
        </Card>

        <Card variant="success" className="text-center">
          <div className="text-2xl font-bold text-green-600 mb-2">
            {quizzes.filter(q => q.is_published).length}
          </div>
          <p className="text-gray-600">Publicados</p>
        </Card>

        <Card variant="warning" className="text-center">
          <div className="text-2xl font-bold text-yellow-600 mb-2">
            {quizzes.filter(q => !q.is_published).length}
          </div>
          <p className="text-gray-600">Borradores</p>
        </Card>
      </div>

      {/* Lista de quizzes */}
      <div className="grid grid-cols-1 gap-6">
        {filteredQuizzes.length > 0 ? (
          filteredQuizzes.map(quiz => (
            <Card key={quiz.id} className="hover:shadow-lg transition-shadow">
              <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{quiz.title}</h3>
                    {getStatusBadge(quiz)}
                  </div>
                  
                  <p className="text-gray-600 mb-3">{quiz.description}</p>
                  
                  <div className="flex flex-wrap gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getQuizTypeColor(quiz.quiz_type)}`}>
                      {getQuizTypeText(quiz.quiz_type)}
                    </span>
                    <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">
                      {quiz.time_limit_minutes > 0 ? `${quiz.time_limit_minutes} min` : 'Sin límite'}
                    </span>
                    <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">
                      {quiz.max_attempts > 0 ? `${quiz.max_attempts} intentos` : 'Intentos ilimitados'}
                    </span>
                    <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">
                      Aprobar: {quiz.passing_score}%
                    </span>
                  </div>

                  <div className="mt-3 text-sm text-gray-500">
                    Curso: {quiz.course_details?.title || 'N/A'} | 
                    Creado por: {quiz.created_by_details?.first_name || quiz.created_by_details?.username}
                  </div>
                </div>

                <div className="flex space-x-2">
                  {quiz.is_published ? (
                    <button className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">
                      Comenzar Quiz
                    </button>
                  ) : user.is_instructor && (
                    <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
                      Editar
                    </button>
                  )}
                  
                  {user.is_instructor && (
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                      Resultados
                    </button>
                  )}
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <span className="text-6xl">📝</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron quizzes</h3>
            <p className="text-gray-600">Intenta ajustar los filtros de búsqueda</p>
          </Card>
        )}
      </div>

      {/* Acciones para instructores */}
      {user.is_instructor && (
        <Card variant="gradient" className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">¿Quieres crear un nuevo quiz?</h3>
          <button className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium">
            Crear Nuevo Quiz
          </button>
        </Card>
      )}
    </div>
  );
};

export default QuizzesAulaVirtual;