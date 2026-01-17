import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getTaskById,
  getTaskAssignments,
  getTaskComments,
  createTaskComment,
  updateTask,
  deleteTask,
  formatTaskStatus,
  formatTaskType,
  getStatusColor,
  isOverdue
} from '../services/taskService';

const TareaDetalle = () => {
  const { id: taskId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [task, setTask] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    loadTaskData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId]); // loadTaskData es estable

  const loadTaskData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [taskData, submissionsData, commentsData] = await Promise.all([
        getTaskById(taskId),
        getTaskAssignments(taskId),
        getTaskComments()
      ]);

      setTask(taskData);
      setSubmissions(submissionsData);
      setComments(commentsData);
    } catch (err) {
      console.error('Error loading task data:', err);
      setError('Error al cargar los datos de la tarea');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setSubmittingComment(true);
      const comment = await createTaskComment(taskId, {
        content: newComment.trim()
      });
      
      setComments(prev => [...prev, comment]);
      setNewComment('');
    } catch (err) {
      console.error('Error adding comment:', err);
      setError('Error al agregar el comentario');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleEditTask = () => {
    navigate(`/aula-virtual/tareas/editar/${taskId}`);
  };

  const handleDeleteTask = async () => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
      return;
    }

    try {
      await deleteTask(taskId);
      navigate('/aula-virtual/tareas');
    } catch (err) {
      console.error('Error deleting task:', err);
      setError('Error al eliminar la tarea');
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const updatedTask = await updateTask(taskId, { status: newStatus });
      setTask(updatedTask);
    } catch (err) {
      console.error('Error updating task status:', err);
      setError('Error al actualizar el estado de la tarea');
    }
  };

  const getSubmissionStats = () => {
    const total = submissions.length;
    const submitted = submissions.filter(s => s.latest_submission).length;
    const graded = submissions.filter(s => s.latest_submission?.score !== null).length;
    
    return { total, submitted, graded };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-500 text-lg">Tarea no encontrada</p>
        </div>
      </div>
    );
  }

  const stats = getSubmissionStats();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div className="flex-1">
          <button
            onClick={() => navigate('/aula-virtual/tareas')}
            className="text-blue-500 hover:text-blue-600 mb-4 flex items-center"
          >
            ← Volver a tareas
          </button>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{task.title}</h1>
          <div className="flex flex-wrap gap-2 mb-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium bg-${getStatusColor(task.status)}-100 text-${getStatusColor(task.status)}-800`}>
              {formatTaskStatus(task.status)}
            </span>
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
              {formatTaskType(task.priority)}
            </span>
            {task.category && (
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                {task.category.name}
              </span>
            )}
            {isOverdue(task.due_date, task.status) && (
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                Vencida
              </span>
            )}
          </div>
        </div>
        
        {user?.is_instructor && (
          <div className="flex space-x-2">
            <button
              onClick={handleEditTask}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Editar
            </button>
            <div className="relative">
              <select
                value={task.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="bg-gray-100 border border-gray-300 rounded-lg px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="draft">Borrador</option>
                <option value="published">Publicada</option>
                <option value="closed">Cerrada</option>
              </select>
            </div>
            <button
              onClick={handleDeleteTask}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Eliminar
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Stats para instructores */}
      {user?.is_instructor && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Estudiantes Asignados</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Entregas Recibidas</h3>
            <p className="text-3xl font-bold text-green-600">{stats.submitted}</p>
            <p className="text-sm text-gray-500">{stats.total > 0 ? Math.round((stats.submitted / stats.total) * 100) : 0}% del total</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Calificadas</h3>
            <p className="text-3xl font-bold text-purple-600">{stats.graded}</p>
            <p className="text-sm text-gray-500">{stats.submitted > 0 ? Math.round((stats.graded / stats.submitted) * 100) : 0}% de entregas</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-1 mb-6">
        <button
          onClick={() => setActiveTab('details')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'details'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Detalles
        </button>
        {user?.is_instructor && (
          <button
            onClick={() => setActiveTab('submissions')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'submissions'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Entregas ({stats.submitted})
          </button>
        )}
        <button
          onClick={() => setActiveTab('comments')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'comments'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Comentarios ({comments.length})
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {activeTab === 'details' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Información General</h3>
                <div className="space-y-3">
                  <div>
                    <span className="font-medium text-gray-600">Curso:</span>
                    <span className="ml-2">{task.course?.name}</span>
                  </div>
                  {task.lesson && (
                    <div>
                      <span className="font-medium text-gray-600">Lección:</span>
                      <span className="ml-2">{task.lesson.title}</span>
                    </div>
                  )}
                  <div>
                    <span className="font-medium text-gray-600">Instructor:</span>
                    <span className="ml-2">{task.instructor?.first_name} {task.instructor?.last_name}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Fecha de creación:</span>
                    <span className="ml-2">{new Date(task.created_at).toLocaleDateString()}</span>
                  </div>
                  {task.due_date && (
                    <div>
                      <span className="font-medium text-gray-600">Fecha de vencimiento:</span>
                      <span className={`ml-2 ${isOverdue(task.due_date, task.status) ? 'text-red-500 font-medium' : ''}`}>
                        {new Date(task.due_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {task.max_score && (
                    <div>
                      <span className="font-medium text-gray-600">Puntuación máxima:</span>
                      <span className="ml-2">{task.max_score} puntos</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Configuración</h3>
                <div className="space-y-3">
                  <div>
                    <span className="font-medium text-gray-600">Máximo de intentos:</span>
                    <span className="ml-2">{task.max_attempts || 1}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Entregas tardías:</span>
                    <span className="ml-2">{task.allow_late_submission ? 'Permitidas' : 'No permitidas'}</span>
                  </div>
                  {task.late_penalty_percent && (
                    <div>
                      <span className="font-medium text-gray-600">Penalización por día:</span>
                      <span className="ml-2">{task.late_penalty_percent}%</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Descripción</h3>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{task.description}</p>
              </div>
            </div>
            
            {task.instructions && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Instrucciones</h3>
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">{task.instructions}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'submissions' && user?.is_instructor && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Entregas de Estudiantes</h3>
            {submissions.length === 0 ? (
              <p className="text-gray-500">No hay entregas disponibles</p>
            ) : (
              <div className="space-y-4">
                {submissions.map(submission => (
                  <div key={submission.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium text-gray-800">
                          {submission.student_name}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {submission.student_email}
                        </p>
                      </div>
                      <div className="text-right">
                        {submission.latest_submission ? (
                          <div>
                            <span className="text-green-600 font-medium">Entregada</span>
                            <p className="text-sm text-gray-500">
                              {new Date(submission.latest_submission.submitted_at).toLocaleDateString()}
                            </p>
                            {submission.latest_submission.score !== null && (
                              <p className="text-sm text-blue-600 font-medium">
                                {submission.latest_submission.score}/{task.max_score || 100}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-red-600">Sin entregar</span>
                        )}
                      </div>
                    </div>
                    {submission.latest_submission && (
                      <button
                        onClick={() => navigate(`/aula-virtual/tareas/entrega/${submission.latest_submission.id}`)}
                        className="text-blue-500 hover:text-blue-600 text-sm"
                      >
                        Ver entrega →
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'comments' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Comentarios</h3>
            
            {/* Formulario para nuevo comentario */}
            <form onSubmit={handleAddComment} className="mb-6">
              <div className="mb-4">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Escribe un comentario..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>
              <button
                type="submit"
                disabled={submittingComment || !newComment.trim()}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                {submittingComment ? 'Enviando...' : 'Agregar Comentario'}
              </button>
            </form>
            
            {/* Lista de comentarios */}
            {comments.length === 0 ? (
              <p className="text-gray-500">No hay comentarios aún</p>
            ) : (
              <div className="space-y-4">
                {comments.map(comment => (
                  <div key={comment.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium text-gray-800">
                          {comment.author_name}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {new Date(comment.created_at).toLocaleDateString()} a las {new Date(comment.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TareaDetalle;
