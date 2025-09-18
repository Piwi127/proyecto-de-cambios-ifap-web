import React, { useState } from 'react';
import Card from '../components/Card';

const TareasAulaVirtual = () => {
  const [filter, setFilter] = useState('todas');
  const [showNewTask, setShowNewTask] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', dueDate: '', priority: 'media', course: '' });

  const tasks = [
    {
      id: 1,
      title: 'Proyecto Final de Digitalización',
      description: 'Digitalizar y catalogar 50 documentos históricos siguiendo las normativas archivísticas',
      course: 'Gestión Digital de Archivos',
      dueDate: '2025-09-20',
      priority: 'alta',
      status: 'pendiente',
      createdAt: '2025-09-10',
      progress: 0
    },
    {
      id: 2,
      title: 'Ensayo sobre Preservación Documental',
      description: 'Redactar un ensayo de 2000 palabras sobre técnicas modernas de preservación',
      course: 'Preservación de Documentos',
      dueDate: '2025-09-18',
      priority: 'media',
      status: 'en-progreso',
      createdAt: '2025-09-08',
      progress: 60
    },
    {
      id: 3,
      title: 'Lectura: Historia de la Archivística',
      description: 'Leer capítulos 5-8 del libro "Historia de la Archivística en América Latina"',
      course: 'Archivos Históricos',
      dueDate: '2025-09-16',
      priority: 'baja',
      status: 'completada',
      createdAt: '2025-09-05',
      progress: 100
    },
    {
      id: 4,
      title: 'Práctica de Clasificación Documental',
      description: 'Clasificar 100 documentos administrativos según el sistema de clasificación estudiado',
      course: 'Archivística Básica',
      dueDate: '2025-09-22',
      priority: 'alta',
      status: 'pendiente',
      createdAt: '2025-09-12',
      progress: 0
    },
    {
      id: 5,
      title: 'Participación en Foro de Discusión',
      description: 'Participar activamente en al menos 3 discusiones del foro sobre temas archivísticos',
      course: 'Archivística General',
      dueDate: '2025-09-25',
      priority: 'media',
      status: 'en-progreso',
      createdAt: '2025-09-11',
      progress: 33
    }
  ];

  const courses = [...new Set(tasks.map(task => task.course))];

  const filteredTasks = tasks.filter(task => {
    if (filter === 'todas') return true;
    if (filter === 'pendientes') return task.status === 'pendiente';
    if (filter === 'en-progreso') return task.status === 'en-progreso';
    if (filter === 'completadas') return task.status === 'completada';
    return task.priority === filter;
  });

  const handleCreateTask = () => {
    if (!newTask.title.trim()) return;

    // Aquí iría la lógica para crear la tarea en el backend
    console.log('Creando nueva tarea:', newTask);

    // Reset form
    setNewTask({ title: '', description: '', dueDate: '', priority: 'media', course: '' });
    setShowNewTask(false);
  };

  const updateTaskStatus = (taskId, newStatus) => {
    // Aquí iría la lógica para actualizar el estado de la tarea
    console.log('Actualizando tarea', taskId, 'a estado:', newStatus);
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

  const stats = {
    total: tasks.length,
    pendientes: tasks.filter(t => t.status === 'pendiente').length,
    enProgreso: tasks.filter(t => t.status === 'en-progreso').length,
    completadas: tasks.filter(t => t.status === 'completada').length,
    altas: tasks.filter(t => t.priority === 'alta').length
  };

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

          <button
            onClick={() => setShowNewTask(true)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            Nueva Tarea
          </button>
        </div>
      </Card>

      {/* Lista de tareas */}
      <div className="space-y-4">
        {filteredTasks.map((task) => (
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
                {task.status !== 'completada' && (
                  <>
                    <button
                      onClick={() => updateTaskStatus(task.id, task.status === 'pendiente' ? 'en-progreso' : 'completada')}
                      className="px-3 py-1 bg-primary-600 text-white text-sm rounded hover:bg-primary-700 transition-colors"
                    >
                      {task.status === 'pendiente' ? 'Iniciar' : 'Completar'}
                    </button>
                    <button className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 transition-colors">
                      Editar
                    </button>
                  </>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredTasks.length === 0 && (
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

      {/* Modal para nueva tarea */}
      {showNewTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Crear Nueva Tarea</h2>
              <button
                onClick={() => setShowNewTask(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>

            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título de la Tarea</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Escribe el título de la tarea..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                  rows={3}
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Describe los detalles de la tarea..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Curso</label>
                  <select
                    value={newTask.course}
                    onChange={(e) => setNewTask({...newTask, course: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Seleccionar curso...</option>
                    {courses.map((course) => (
                      <option key={course} value={course}>{course}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Límite</label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad</label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="baja">Baja</option>
                  <option value="media">Media</option>
                  <option value="alta">Alta</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowNewTask(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleCreateTask}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Crear Tarea
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default TareasAulaVirtual;