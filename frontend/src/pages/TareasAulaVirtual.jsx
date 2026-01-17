import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import { useAuth } from '../context/AuthContext.jsx';
import { getTasks, startAssignment, createSubmission } from '../services/taskService';

const TareasAulaVirtual = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [filter, setFilter] = useState('todas');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState(null);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [activeTask, setActiveTask] = useState(null);
  const [submissionContent, setSubmissionContent] = useState('');
  const [submissionFiles, setSubmissionFiles] = useState([]);

  useEffect(() => {
    loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const normalizeList = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    return [];
  };

  const mapPriority = (priority) => {
    switch (priority) {
      case 'high':
      case 'urgent':
        return 'alta';
      case 'low':
        return 'baja';
      default:
        return 'media';
    }
  };

  const mapAssignmentStatus = (status) => {
    switch (status) {
      case 'assigned':
        return 'pendiente';
      case 'in_progress':
        return 'en-progreso';
      case 'submitted':
      case 'graded':
        return 'completada';
      case 'returned':
        return 'en-progreso';
      default:
        return 'pendiente';
    }
  };

  const mapTaskStatus = (status) => {
    switch (status) {
      case 'draft':
        return 'pendiente';
      case 'published':
        return 'en-progreso';
      case 'closed':
        return 'completada';
      default:
        return 'pendiente';
    }
  };

  const progressFromStatus = (status) => {
    switch (status) {
      case 'pendiente':
        return 0;
      case 'en-progreso':
        return 60;
      case 'completada':
        return 100;
      default:
        return 0;
    }
  };

  const mapTask = (task) => {
    const assignment = task.user_assignment || null;
    const uiStatus = assignment ? mapAssignmentStatus(assignment.status) : mapTaskStatus(task.status);
    const dueDate = assignment?.effective_due_date || task.due_date;

    return {
      id: task.id,
      assignmentId: assignment?.id || null,
      title: task.title,
      description: task.description,
      course: task.course?.title || task.course?.name || assignment?.course_name || 'Sin curso',
      dueDate,
      priority: mapPriority(task.priority),
      status: uiStatus,
      rawAssignmentStatus: assignment?.status || null,
      progress: progressFromStatus(uiStatus),
      isAssignment: Boolean(assignment)
    };
  };

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTasks();
      setTasks(normalizeList(data).map(mapTask));
    } catch (err) {
      console.error('Error loading tasks:', err);
      setError('Error al cargar las tareas');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'todas') return true;
    if (filter === 'pendientes') return task.status === 'pendiente';
    if (filter === 'en-progreso') return task.status === 'en-progreso';
    if (filter === 'completadas') return task.status === 'completada';
    return task.priority === filter;
  });
  
  const handleStartTask = async (task) => {
    if (!task.assignmentId) return;
    try {
      setActionLoading(task.id);
      await startAssignment(task.assignmentId);
      await loadTasks();
    } catch (err) {
      console.error('Error starting task:', err);
      setError('No se pudo iniciar la tarea');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCompleteTask = async (task) => {
    if (!task.assignmentId) return;
    setActiveTask(task);
    setSubmissionContent('');
    setSubmissionFiles([]);
    setShowCompleteModal(true);
  };

  const handleSubmitCompletion = async () => {
    if (!activeTask?.assignmentId) return;
    try {
      setActionLoading(activeTask.id);
      await createSubmission(
        { assignment: activeTask.assignmentId, content: submissionContent.trim() },
        submissionFiles
      );
      await loadTasks();
      setShowCompleteModal(false);
    } catch (err) {
      console.error('Error completing task:', err);
      setError('No se pudo completar la tarea');
    } finally {
      setActionLoading(null);
    }
  };

  const handleEditTask = (task) => {
    if (user?.is_instructor || user?.is_superuser) {
      navigate(`/aula-virtual/tareas/editar/${task.id}`);
      return;
    }
    navigate(`/aula-virtual/tareas/${task.id}`);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'alta': return 'text-red-600 bg-red-100';
      case 'media': return 'text-yellow-600 bg-yellow-100';
      case 'baja': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pendiente': return 'text-gray-600 bg-gray-100';
      case 'en-progreso': return 'text-blue-600 bg-blue-100';
      case 'completada': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pendiente': return 'Pendiente';
      case 'en-progreso': return 'En Progreso';
      case 'completada': return 'Completada';
      default: return 'Desconocido';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const isOverdue = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    return due < today;
  };

  const stats = useMemo(() => ({
    total: tasks.length,
    pendientes: tasks.filter(t => t.status === 'pendiente').length,
    enProgreso: tasks.filter(t => t.status === 'en-progreso').length,
    completadas: tasks.filter(t => t.status === 'completada').length,
    altas: tasks.filter(t => t.priority === 'alta').length
  }), [tasks]);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Mis Tareas</h1>
        <p className="text-primary-100">Organiza y sigue el progreso de tus actividades académicas</p>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-4">
            <span className="text-2xl">📋</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{stats.total}</h3>
          <p className="text-gray-600">Total Tareas</p>
        </Card>

        <Card className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg mx-auto mb-4">
            <span className="text-2xl">⏳</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{stats.pendientes}</h3>
          <p className="text-gray-600">Pendientes</p>
        </Card>

        <Card className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-4">
            <span className="text-2xl">🔄</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{stats.enProgreso}</h3>
          <p className="text-gray-600">En Progreso</p>
        </Card>

        <Card className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-4">
            <span className="text-2xl">✅</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{stats.completadas}</h3>
          <p className="text-gray-600">Completadas</p>
        </Card>

        <Card className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-lg mx-auto mb-4">
            <span className="text-2xl">🚨</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{stats.altas}</h3>
          <p className="text-gray-600">Alta Prioridad</p>
        </Card>
      </div>

      {/* Filtros y acciones */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'todas', name: 'Todas', count: stats.total },
              { id: 'pendientes', name: 'Pendientes', count: stats.pendientes },
              { id: 'en-progreso', name: 'En Progreso', count: stats.enProgreso },
              { id: 'completadas', name: 'Completadas', count: stats.completadas },
              { id: 'alta', name: 'Alta Prioridad', count: stats.altas }
            ].map((filterOption) => (
              <button
                key={filterOption.id}
                onClick={() => setFilter(filterOption.id)}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === filterOption.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filterOption.name}
                <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                  filter === filterOption.id ? 'bg-primary-500' : 'bg-gray-200'
                }`}>
                  {filterOption.count}
                </span>
              </button>
            ))}
          </div>

          {(user?.is_instructor || user?.is_superuser) && (
            <button
              onClick={() => navigate('/aula-virtual/tareas/crear')}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              Nueva Tarea
            </button>
          )}
        </div>
      </Card>

      {/* Lista de tareas */}
      <div className="space-y-4">
        {loading && (
          <Card>
            <div className="text-center py-8 text-gray-500">Cargando tareas...</div>
          </Card>
        )}
        {!loading && error && (
          <Card>
            <div className="text-center py-8 text-red-600">{error}</div>
          </Card>
        )}
        {!loading && !error && filteredTasks.map((task) => (
          <Card key={task.id} className={`transition-all hover:shadow-lg ${isOverdue(task.dueDate) && task.status !== 'completada' ? 'border-l-4 border-l-red-500' : ''}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className={`text-lg font-semibold ${task.status === 'completada' ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                    {task.title}
                  </h3>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(task.priority)}`}>
                    {task.priority.toUpperCase()}
                  </span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}>
                    {getStatusLabel(task.status)}
                  </span>
                  {isOverdue(task.dueDate) && task.status !== 'completada' && (
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                      VENCIDA
                    </span>
                  )}
                </div>

                <p className="text-gray-600 mb-3">{task.description}</p>

                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                  <span>📚 {task.course}</span>
                  <span>📅 Vence: {formatDate(task.dueDate)}</span>
                  <span>📊 Progreso: {task.progress}%</span>
                </div>

                {/* Barra de progreso */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      task.status === 'completada' ? 'bg-green-600' :
                      task.priority === 'alta' ? 'bg-red-600' :
                      task.priority === 'media' ? 'bg-yellow-600' : 'bg-green-600'
                    }`}
                    style={{ width: `${task.progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="ml-4 flex flex-col space-y-2">
                {task.isAssignment && task.status !== 'completada' && (
                  <>
                    <button
                      onClick={() => task.status === 'pendiente' ? handleStartTask(task) : handleCompleteTask(task)}
                      className="px-3 py-1 bg-primary-600 text-white text-sm rounded hover:bg-primary-700 transition-colors disabled:opacity-60"
                      disabled={actionLoading === task.id}
                    >
                      {actionLoading === task.id
                        ? 'Procesando...'
                        : (task.status === 'pendiente' ? 'Iniciar' : 'Completar')}
                    </button>
                  </>
                )}
                <button
                  onClick={() => handleEditTask(task)}
                  className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 transition-colors"
                >
                  {user?.is_instructor || user?.is_superuser ? 'Editar' : 'Ver'}
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {!loading && !error && filteredTasks.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <span className="text-6xl">📋</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay tareas</h3>
            <p className="text-gray-600">No se encontraron tareas con los filtros seleccionados</p>
          </div>
        </Card>
      )}
      {showCompleteModal && activeTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Completar tarea</h2>
                <p className="text-sm text-gray-500">{activeTask.title}</p>
              </div>
              <button
                onClick={() => setShowCompleteModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Comentario o entrega</label>
                <textarea
                  rows={4}
                  value={submissionContent}
                  onChange={(e) => setSubmissionContent(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Describe lo realizado o pega tu entrega..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Archivos adjuntos</label>
                <input
                  type="file"
                  multiple
                  onChange={(e) => setSubmissionFiles(Array.from(e.target.files || []))}
                  className="w-full text-sm text-gray-600"
                />
                {submissionFiles.length > 0 && (
                  <p className="text-sm text-gray-500 mt-2">{submissionFiles.length} archivo(s) seleccionado(s)</p>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => setShowCompleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSubmitCompletion}
                disabled={actionLoading === activeTask.id || (!submissionContent.trim() && submissionFiles.length === 0)}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-60"
              >
                {actionLoading === activeTask.id ? 'Enviando...' : 'Enviar entrega'}
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default TareasAulaVirtual;
