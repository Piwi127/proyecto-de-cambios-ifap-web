import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  getTasks,
  getAssignments,
  getTaskCategories,
  formatTaskStatus,
  formatAssignmentStatus,
  formatTaskType,
  getStatusColor,
  isOverdue,
  calculateTimeRemaining
} from '../services/taskService';

const Tareas = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(user?.is_instructor ? 'tasks' : 'assignments');
  const [filters, setFilters] = useState({
    course: '',
    category: '',
    status: '',
    type: ''
  });

  useEffect(() => {
    loadData();
  }, [activeTab, filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar categorías
      const categoriesData = await getTaskCategories();
      setCategories(categoriesData);

      if (activeTab === 'tasks' && user?.is_instructor) {
        // Cargar tareas para instructores
        const tasksData = await getTasks(filters);
        setTasks(tasksData);
      } else {
        // Cargar asignaciones para estudiantes
        const assignmentsData = await getAssignments(filters);
        setAssignments(assignmentsData);
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      course: '',
      category: '',
      status: '',
      type: ''
    });
  };

  const handleTaskClick = (taskId) => {
    navigate(`/aula-virtual/tareas/tarea/${taskId}`);
  };

  const handleAssignmentClick = (assignmentId) => {
    navigate(`/aula-virtual/tareas/asignacion/${assignmentId}`);
  };

  const handleCreateTask = () => {
    navigate('/aula-virtual/tareas/crear');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          {user?.is_instructor ? 'Gestión de Tareas' : 'Mis Tareas'}
        </h1>
        {user?.is_instructor && (
          <button
            onClick={handleCreateTask}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Crear Tarea
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Tabs */}
      {user?.is_instructor && (
        <div className="flex space-x-1 mb-6">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'tasks'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Tareas Creadas
          </button>
          <button
            onClick={() => setActiveTab('assignments')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'assignments'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Asignaciones
          </button>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Filtros</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Curso
            </label>
            <select
              value={filters.course}
              onChange={(e) => handleFilterChange('course', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los cursos</option>
              {/* Aquí se cargarían los cursos dinámicamente */}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoría
            </label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas las categorías</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los estados</option>
              {activeTab === 'tasks' ? (
                <>
                  <option value="draft">Borrador</option>
                  <option value="published">Publicada</option>
                  <option value="archived">Archivada</option>
                </>
              ) : (
                <>
                  <option value="assigned">Asignada</option>
                  <option value="in_progress">En progreso</option>
                  <option value="submitted">Entregada</option>
                  <option value="graded">Calificada</option>
                </>
              )}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo
            </label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los tipos</option>
              <option value="assignment">Tarea</option>
              <option value="project">Proyecto</option>
              <option value="essay">Ensayo</option>
              <option value="presentation">Presentación</option>
              <option value="lab">Laboratorio</option>
              <option value="other">Otro</option>
            </select>
          </div>
        </div>
        
        <div className="mt-4">
          <button
            onClick={clearFilters}
            className="text-blue-500 hover:text-blue-600 font-medium"
          >
            Limpiar filtros
          </button>
        </div>
      </div>

      {/* Lista de tareas o asignaciones */}
      <div className="space-y-4">
        {activeTab === 'tasks' ? (
          // Vista de tareas para instructores
          tasks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No hay tareas disponibles</p>
              <button
                onClick={handleCreateTask}
                className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Crear primera tarea
              </button>
            </div>
          ) : (
            tasks.map(task => (
              <div
                key={task.id}
                onClick={() => handleTaskClick(task.id)}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      {task.title}
                    </h3>
                    <p className="text-gray-600 mb-2">{task.description}</p>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${getStatusColor(task.status)}-100 text-${getStatusColor(task.status)}-800`}>
                        {formatTaskStatus(task.status)}
                      </span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {formatTaskType(task.task_type)}
                      </span>
                      {task.category && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {task.category.name}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      {task.assignments_count} asignaciones
                    </p>
                    <p className="text-sm text-gray-500">
                      {task.submissions_count} entregas
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>Curso: {task.course?.name}</span>
                  {task.due_date && (
                    <span className={isOverdue(task.due_date, task.status) ? 'text-red-500' : ''}>
                      Vence: {new Date(task.due_date).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            ))
          )
        ) : (
          // Vista de asignaciones para estudiantes
          assignments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No tienes tareas asignadas</p>
            </div>
          ) : (
            assignments.map(assignment => (
              <div
                key={assignment.id}
                onClick={() => handleAssignmentClick(assignment.id)}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      {assignment.task_title}
                    </h3>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${getStatusColor(assignment.status)}-100 text-${getStatusColor(assignment.status)}-800`}>
                        {formatAssignmentStatus(assignment.status)}
                      </span>
                      {isOverdue(assignment.effective_due_date, assignment.status) && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Vencida
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    {assignment.latest_submission && (
                      <p className="text-sm text-green-600 font-medium">
                        Entregada
                      </p>
                    )}
                    {assignment.latest_submission?.score !== null && (
                      <p className="text-sm text-blue-600 font-medium">
                        Calificación: {assignment.latest_submission.score}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>Curso: {assignment.course_name}</span>
                  {assignment.effective_due_date && (
                    <span className={isOverdue(assignment.effective_due_date, assignment.status) ? 'text-red-500' : ''}>
                      {isOverdue(assignment.effective_due_date, assignment.status) 
                        ? 'Vencida' 
                        : `Vence en: ${calculateTimeRemaining(assignment.effective_due_date)}`
                      }
                    </span>
                  )}
                </div>
              </div>
            ))
          )
        )}
      </div>
    </div>
  );
};

export default Tareas;