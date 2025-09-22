import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { quizService } from '../services/quizService.js';
import { courseService } from '../services/courseService.js';
import Card from '../components/Card';
import QuizQuestionsManager from '../components/QuizQuestionsManager';
import QuizResultsViewer from '../components/QuizResultsViewer';
import QuizForm from '../components/QuizForm';

const QuizzesAulaVirtual = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [filter, setFilter] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [courses, setCourses] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [showQuestionsManager, setShowQuestionsManager] = useState(null);
  const [showResultsViewer, setShowResultsViewer] = useState(null);
  const [showQuizForm, setShowQuizForm] = useState(null);
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  console.log('QuizzesAulaVirtual: Estado de autenticación:', { user, isAuthenticated, authLoading });

  useEffect(() => {
    console.log('QuizzesAulaVirtual: useEffect ejecutado, authLoading:', authLoading);
    if (!authLoading) {
      fetchData();
    }
  }, [authLoading]);

  const fetchData = async () => {
    try {
      console.log('QuizzesAulaVirtual: Iniciando fetchData');
      console.log('QuizzesAulaVirtual: Usuario actual:', user);
      setLoading(true);
      setError(null);

      console.log('QuizzesAulaVirtual: Llamando a APIs...');
      const [quizzesData, coursesData] = await Promise.all([
        quizService.getAllQuizzes(),
        courseService.getMyCourses()
      ]);

      console.log('QuizzesAulaVirtual: Datos recibidos - Quizzes:', quizzesData);
      console.log('QuizzesAulaVirtual: Datos recibidos - Cursos:', coursesData);
      
      setQuizzes(quizzesData.results || quizzesData || []);
      setCourses(coursesData.results || coursesData || []);
    } catch (err) {
      console.error('QuizzesAulaVirtual: Error fetching data:', err);
      setError('Error al cargar los quizzes. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Funciones de gestión de quizzes
  const handleCreateQuiz = () => {
    setShowQuizForm({ mode: 'create' });
  };

  const handleEditQuiz = (quizId) => {
    const quiz = quizzes.find(q => q.id === quizId);
    if (quiz) {
      setShowQuizForm({ mode: 'edit', quiz });
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este quiz? Esta acción no se puede deshacer.')) {
      return;
    }

    setActionLoading(quizId);
    try {
      await quizService.deleteQuiz(quizId);
      setQuizzes(quizzes.filter(quiz => quiz.id !== quizId));
      alert('Quiz eliminado exitosamente');
    } catch (error) {
      console.error('Error deleting quiz:', error);
      alert('Error al eliminar el quiz. Por favor, intenta nuevamente.');
    } finally {
      setActionLoading(null);
      setShowDeleteConfirm(null);
    }
  };

  const handlePublishQuiz = async (quizId) => {
    setActionLoading(quizId);
    try {
      const updatedQuiz = await quizService.updateQuiz(quizId, { is_published: true });
      setQuizzes(quizzes.map(quiz =>
        quiz.id === quizId ? { ...quiz, is_published: true } : quiz
      ));
      alert('Quiz publicado exitosamente');
    } catch (error) {
      console.error('Error publishing quiz:', error);
      alert('Error al publicar el quiz. Por favor, intenta nuevamente.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnpublishQuiz = async (quizId) => {
    setActionLoading(quizId);
    try {
      const updatedQuiz = await quizService.updateQuiz(quizId, { is_published: false });
      setQuizzes(quizzes.map(quiz =>
        quiz.id === quizId ? { ...quiz, is_published: false } : quiz
      ));
      alert('Quiz despublicado exitosamente');
    } catch (error) {
      console.error('Error unpublishing quiz:', error);
      alert('Error al despublicar el quiz. Por favor, intenta nuevamente.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleStartQuiz = async (quizId) => {
    try {
      const attempt = await quizService.startQuizAttempt(quizId);
      console.log('Attempt started:', attempt);
      // Navegar a página de realización del quiz
      navigate(`/aula-virtual/quizzes/take/${attempt.id}`);
      alert('Quiz iniciado. ¡Buena suerte!');
    } catch (error) {
      console.error('Error starting quiz:', error);
      alert('Error al iniciar el quiz. Por favor, intenta nuevamente.');
    }
  };

    const handleSaveQuiz = async (quizData) => {
    try {
      if (showQuizForm.mode === 'edit') {
        // Actualizar quiz existente
        await quizService.updateQuiz(showQuizForm.quiz.id, quizData);
        // Actualizar el quiz en la lista
        setQuizzes(quizzes.map(q =>
          q.id === showQuizForm.quiz.id ? { ...q, ...quizData } : q
        ));
        alert('Quiz actualizado exitosamente');
      } else {
        // Crear nuevo quiz
        const newQuiz = await quizService.createQuiz(quizData);
        setQuizzes([...quizzes, newQuiz]);
        alert('Quiz creado exitosamente');
      }
      setShowQuizForm(null);
    } catch (error) {
      console.error('Error saving quiz:', error);
      alert('Error al guardar el quiz. Por favor, intenta nuevamente.');
    }
  };

  const handleViewQuestions = (quizId) => {
    setShowQuestionsManager(quizId);
  };

  const handleViewResults = (quizId) => {
    setShowResultsViewer(quizId);
  };

  // Verificar si el usuario puede gestionar un quiz específico
  const canManageQuiz = (quiz) => {
    return user.is_instructor || user.is_superuser || quiz.created_by === user.id;
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

  if (authLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Verificando autenticación...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="text-red-500 text-4xl mb-4">🔒</div>
            <p className="text-gray-600 mb-4">Debes iniciar sesión para acceder a esta página</p>
            <button
              onClick={() => navigate('/login')}
              className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
            >
              Iniciar Sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

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
      {/* Modal de formulario de quiz */}
      {showQuizForm && (
        <QuizForm
          quiz={showQuizForm.mode === 'edit' ? showQuizForm.quiz : null}
          onSave={handleSaveQuiz}
          onCancel={() => setShowQuizForm(null)}
        />
      )}

      {/* Modal de gestión de preguntas */}
      {showQuestionsManager && (
        <QuizQuestionsManager
          quizId={showQuestionsManager}
          onClose={() => setShowQuestionsManager(null)}
        />
      )}

      {/* Modal de resultados */}
      {showResultsViewer && (
        <QuizResultsViewer
          quizId={showResultsViewer}
          onClose={() => setShowResultsViewer(null)}
        />
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-lg p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Evaluaciones y Quizzes</h1>
            <p className="text-primary-100">
              {user.is_instructor || user.is_superuser
                ? "Gestiona y crea evaluaciones para tus estudiantes"
                : "Practica y demuestra tus conocimientos archivísticos"
              }
            </p>
          </div>

          {/* Información del rol */}
          <div className="mt-4 md:mt-0">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">
                  {user.is_superuser ? "👑" : user.is_instructor ? "🎓" : "📚"}
                </span>
                <div>
                  <p className="font-medium">
                    {user.is_superuser ? "Administrador" : user.is_instructor ? "Docente" : "Estudiante"}
                  </p>
                  <p className="text-sm text-primary-200">
                    {user.is_superuser
                      ? "Control total del sistema"
                      : user.is_instructor
                        ? "Gestión de contenido educativo"
                        : "Acceso a evaluaciones"
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card variant="primary" className="text-center">
          <div className="text-2xl font-bold text-primary-600 mb-2">
            {quizzes.length}
          </div>
          <p className="text-gray-600 text-sm">Total Quizzes</p>
        </Card>

        <Card variant="success" className="text-center">
          <div className="text-2xl font-bold text-green-600 mb-2">
            {quizzes.filter(q => q.is_published).length}
          </div>
          <p className="text-gray-600 text-sm">Publicados</p>
        </Card>

        <Card variant="warning" className="text-center">
          <div className="text-2xl font-bold text-yellow-600 mb-2">
            {quizzes.filter(q => !q.is_published).length}
          </div>
          <p className="text-gray-600 text-sm">Borradores</p>
        </Card>

        {(user.is_instructor || user.is_superuser) && (
          <Card variant="info" className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-2">
              {quizzes.filter(q => q.created_by === user.id).length}
            </div>
            <p className="text-gray-600 text-sm">Mis Quizzes</p>
          </Card>
        )}

        {!(user.is_instructor || user.is_superuser) && (
          <Card variant="info" className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-2">
              {quizzes.filter(q => q.is_published).length}
            </div>
            <p className="text-gray-600 text-sm">Disponibles</p>
          </Card>
        )}
      </div>

      {/* Lista de quizzes */}
      <div className="grid grid-cols-1 gap-6">
        {filteredQuizzes.length > 0 ? (
          filteredQuizzes.map(quiz => (
            <Card key={quiz.id} className="hover:shadow-lg transition-shadow">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between space-y-4 lg:space-y-0 lg:space-x-6">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{quiz.title}</h3>
                    {getStatusBadge(quiz)}
                  </div>

                  <p className="text-gray-600 mb-3">{quiz.description}</p>

                  <div className="flex flex-wrap gap-2 mb-3">
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

                  <div className="text-sm text-gray-500">
                    <p>Curso: {quiz.course_details?.title || 'N/A'}</p>
                    <p>Creado por: {quiz.created_by_details?.first_name || quiz.created_by_details?.username}</p>
                    <p>Preguntas: {quiz.questions_count || 0}</p>
                  </div>
                </div>

                {/* Botones de acción según rol */}
                <div className="flex flex-col space-y-2 min-w-0 lg:min-w-[200px]">
                  {/* Botones para estudiantes */}
                  {!user.is_instructor && !user.is_superuser && quiz.is_published && (
                    <button
                      onClick={() => handleStartQuiz(quiz.id)}
                      className="w-full bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors font-medium"
                      disabled={actionLoading === quiz.id}
                    >
                      {actionLoading === quiz.id ? 'Cargando...' : 'Comenzar Quiz'}
                    </button>
                  )}

                  {/* Botones para instructores y administradores */}
                  {(user.is_instructor || user.is_superuser) && canManageQuiz(quiz) && (
                    <div className="grid grid-cols-2 gap-2">
                      {/* Editar */}
                      <button
                        onClick={() => handleEditQuiz(quiz.id)}
                        className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        disabled={actionLoading === quiz.id}
                      >
                        ✏️ Editar
                      </button>

                      {/* Gestionar Preguntas */}
                      <button
                        onClick={() => handleViewQuestions(quiz.id)}
                        className="bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                        disabled={actionLoading === quiz.id}
                      >
                        📝 Preguntas
                      </button>

                      {/* Publicar/Despublicar */}
                      {quiz.is_published ? (
                        <button
                          onClick={() => handleUnpublishQuiz(quiz.id)}
                          className="bg-yellow-600 text-white px-3 py-2 rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium"
                          disabled={actionLoading === quiz.id}
                        >
                          📥 Despublicar
                        </button>
                      ) : (
                        <button
                          onClick={() => handlePublishQuiz(quiz.id)}
                          className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                          disabled={actionLoading === quiz.id}
                        >
                          📤 Publicar
                        </button>
                      )}

                      {/* Resultados */}
                      <button
                        onClick={() => handleViewResults(quiz.id)}
                        className="bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                        disabled={actionLoading === quiz.id}
                      >
                        📊 Resultados
                      </button>
                    </div>
                  )}

                  {/* Botón de eliminar (solo para creador del quiz o admin) */}
                  {(user.is_instructor || user.is_superuser) && canManageQuiz(quiz) && (
                    <button
                      onClick={() => setShowDeleteConfirm(quiz.id)}
                      className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
                      disabled={actionLoading === quiz.id}
                    >
                      🗑️ Eliminar Quiz
                    </button>
                  )}

                  {/* Confirmación de eliminación */}
                  {showDeleteConfirm === quiz.id && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-sm text-red-800 mb-2">¿Eliminar este quiz permanentemente?</p>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleDeleteQuiz(quiz.id)}
                          className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                          disabled={actionLoading === quiz.id}
                        >
                          {actionLoading === quiz.id ? 'Eliminando...' : 'Sí, eliminar'}
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(null)}
                          className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
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

      {/* Panel de acciones para instructores y administradores */}
      {(user.is_instructor || user.is_superuser) && (
        <Card variant="gradient" className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">🎓 Panel de Gestión de Quizzes</h3>
            <p className="text-gray-600 mb-6">Como docente o administrador, tienes control total sobre los quizzes</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="text-2xl mb-2">📝</div>
                <h4 className="font-medium text-gray-900 mb-1">Crear Quiz</h4>
                <p className="text-sm text-gray-600">Diseña evaluaciones personalizadas</p>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="text-2xl mb-2">📊</div>
                <h4 className="font-medium text-gray-900 mb-1">Ver Resultados</h4>
                <p className="text-sm text-gray-600">Analiza el rendimiento de estudiantes</p>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="text-2xl mb-2">⚙️</div>
                <h4 className="font-medium text-gray-900 mb-1">Gestionar Contenido</h4>
                <p className="text-sm text-gray-600">Edita preguntas y configuraciones</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleCreateQuiz}
                className="bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium shadow-lg hover:shadow-xl"
              >
                ➕ Crear Nuevo Quiz
              </button>

              <button
                onClick={() => navigate('/aula-virtual/quizzes/stats')}
                className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-lg hover:shadow-xl"
              >
                📈 Ver Estadísticas
              </button>

              <button
                onClick={() => navigate('/aula-virtual/quizzes/archived')}
                className="bg-gray-600 text-white px-8 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium shadow-lg hover:shadow-xl"
              >
                📁 Quizzes Archivados
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Panel de acciones avanzadas para instructores y administradores */}
      {(user.is_instructor || user.is_superuser) && (
        <Card variant="gradient" className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">🚀 Herramientas Avanzadas de Quiz</h3>
            <p className="text-gray-600 mb-6">Accede a funcionalidades avanzadas para una gestión más eficiente</p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
                   onClick={() => navigate('/aula-virtual/quizzes/create')}>
                <div className="text-2xl mb-2">➕</div>
                <h4 className="font-medium text-gray-900 mb-1">Crear Quiz</h4>
                <p className="text-sm text-gray-600">Nueva página dedicada</p>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
                   onClick={() => navigate('/aula-virtual/quizzes/templates')}>
                <div className="text-2xl mb-2">📋</div>
                <h4 className="font-medium text-gray-900 mb-1">Plantillas</h4>
                <p className="text-sm text-gray-600">Usa plantillas predefinidas</p>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
                   onClick={() => navigate('/aula-virtual/quizzes/import-export')}>
                <div className="text-2xl mb-2">📥📤</div>
                <h4 className="font-medium text-gray-900 mb-1">Importar/Exportar</h4>
                <p className="text-sm text-gray-600">Migra contenido fácilmente</p>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                <div className="text-2xl mb-2">📊</div>
                <h4 className="font-medium text-gray-900 mb-1">Estadísticas</h4>
                <p className="text-sm text-gray-600">Próximamente</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/aula-virtual/quizzes/create')}
                className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium shadow-lg hover:shadow-xl"
              >
                🎯 Crear Quiz Avanzado
              </button>

              <button
                onClick={() => navigate('/aula-virtual/quizzes/templates')}
                className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-lg hover:shadow-xl"
              >
                📋 Explorar Plantillas
              </button>

              <button
                onClick={() => navigate('/aula-virtual/quizzes/import-export')}
                className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium shadow-lg hover:shadow-xl"
              >
                📥📤 Importar/Exportar
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Panel informativo para estudiantes */}
      {!(user.is_instructor || user.is_superuser) && (
        <Card variant="success" className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">📚 Modo Estudiante</h3>
            <p className="text-gray-600 mb-4">Aquí puedes acceder a todos los quizzes disponibles para practicar y demostrar tus conocimientos</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl mb-2">🎯</div>
                <h4 className="font-medium text-gray-900">Realizar Quizzes</h4>
                <p className="text-sm text-gray-600">Completa evaluaciones publicadas</p>
              </div>

              <div className="text-center">
                <div className="text-2xl mb-2">📊</div>
                <h4 className="font-medium text-gray-900">Ver Resultados</h4>
                <p className="text-sm text-gray-600">Revisa tus calificaciones</p>
              </div>

              <div className="text-center">
                <div className="text-2xl mb-2">📈</div>
                <h4 className="font-medium text-gray-900">Mejorar</h4>
                <p className="text-sm text-gray-600">Practica y progresa</p>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default QuizzesAulaVirtual;