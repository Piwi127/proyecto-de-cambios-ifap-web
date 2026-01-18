import React, { useCallback, useEffect, useState } from 'react';
import { courseService } from '../../services/courseService.js';
import { useAuth } from '../../context/AuthContext.jsx';
import './TareasTab.css';

const TareasTab = ({ courseId }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [submissionFile, setSubmissionFile] = useState(null);
  const [submissionText, setSubmissionText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isInstructor = user?.role === 'instructor' || user?.role === 'admin';

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const tasksData = await courseService.getCourseTasks(courseId);
      setTasks(Array.isArray(tasksData) ? tasksData : []);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Error al cargar las tareas');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    if (courseId) {
      fetchTasks();
    }
  }, [courseId, fetchTasks]);

  const handleCreateTask = async (taskData) => {
    try {
      await courseService.createTask(courseId, taskData);
      await fetchTasks();
      setShowCreateForm(false);
    } catch (err) {
      console.error('Error creating task:', err);
      setError('Error al crear la tarea');
    }
  };

  const handleSubmitTask = async (taskId) => {
    if (!submissionText.trim() && !submissionFile) {
      alert('Debes proporcionar una respuesta o subir un archivo');
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('submission_text', submissionText);
      if (submissionFile) {
        formData.append('submission_file', submissionFile);
      }

      await courseService.submitTask(taskId, formData);
      setSubmissionText('');
      setSubmissionFile(null);
      setSelectedTask(null);
      await fetchTasks();
      alert('Tarea enviada exitosamente');
    } catch (err) {
      console.error('Error submitting task:', err);
      alert('Error al enviar la tarea');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No definida';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTaskStatus = (task) => {
    if (!task.due_date) return 'sin-fecha';
    const now = new Date();
    const dueDate = new Date(task.due_date);
    
    if (task.user_submission) {
      return task.user_submission.grade !== null ? 'calificada' : 'enviada';
    }
    
    return now > dueDate ? 'vencida' : 'pendiente';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pendiente': return '#ffa726';
      case 'enviada': return '#42a5f5';
      case 'calificada': return '#66bb6a';
      case 'vencida': return '#ef5350';
      default: return '#9e9e9e';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pendiente': return 'Pendiente';
      case 'enviada': return 'Enviada';
      case 'calificada': return 'Calificada';
      case 'vencida': return 'Vencida';
      default: return 'Sin fecha';
    }
  };

  if (loading) {
    return (
      <div className="tareas-loading">
        <div className="spinner"></div>
        <p>Cargando tareas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tareas-error">
        <p>{error}</p>
        <button onClick={fetchTasks} className="btn-retry">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="tareas-tab">
      <div className="tareas-header">
        <h3>Tareas del Curso</h3>
        {isInstructor && (
          <button 
            onClick={() => setShowCreateForm(true)}
            className="btn-create-task"
          >
            + Nueva Tarea
          </button>
        )}
      </div>

      {tasks.length === 0 ? (
        <div className="no-tasks">
          <p>No hay tareas disponibles en este curso.</p>
          {isInstructor && (
            <button 
              onClick={() => setShowCreateForm(true)}
              className="btn-create-first-task"
            >
              Crear primera tarea
            </button>
          )}
        </div>
      ) : (
        <div className="tasks-grid">
          {tasks.map((task) => {
            const status = getTaskStatus(task);
            return (
              <div key={task.id} className="task-card">
                <div className="task-header">
                  <h4 className="task-title">{task.title}</h4>
                  <span 
                    className="task-status"
                    style={{ backgroundColor: getStatusColor(status) }}
                  >
                    {getStatusText(status)}
                  </span>
                </div>
                
                <p className="task-description">{task.description}</p>
                
                <div className="task-meta">
                  <div className="task-dates">
                    <p><strong>Fecha límite:</strong> {formatDate(task.due_date)}</p>
                    {task.max_score && (
                      <p><strong>Puntuación máxima:</strong> {task.max_score}</p>
                    )}
                  </div>
                  
                  {task.user_submission && (
                    <div className="submission-info">
                      <p><strong>Enviado:</strong> {formatDate(task.user_submission.submitted_at)}</p>
                      {task.user_submission.grade !== null && (
                        <p><strong>Calificación:</strong> {task.user_submission.grade}/{task.max_score}</p>
                      )}
                    </div>
                  )}
                </div>

                <div className="task-actions">
                  {!task.user_submission && status !== 'vencida' && (
                    <button 
                      onClick={() => setSelectedTask(task)}
                      className="btn-submit-task"
                    >
                      Enviar Tarea
                    </button>
                  )}
                  
                  {task.user_submission && (
                    <button 
                      onClick={() => setSelectedTask(task)}
                      className="btn-view-submission"
                    >
                      Ver Envío
                    </button>
                  )}
                  
                  {isInstructor && (
                    <button 
                      onClick={() => {/* TODO: Implementar vista de instructor */}}
                      className="btn-manage-task"
                    >
                      Gestionar
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal para enviar tarea */}
      {selectedTask && !selectedTask.user_submission && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Enviar Tarea: {selectedTask.title}</h3>
              <button 
                onClick={() => setSelectedTask(null)}
                className="btn-close"
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Respuesta de texto:</label>
                <textarea
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  placeholder="Escribe tu respuesta aquí..."
                  rows={6}
                  className="submission-textarea"
                />
              </div>
              
              <div className="form-group">
                <label>Archivo adjunto (opcional):</label>
                <input
                  type="file"
                  onChange={(e) => setSubmissionFile(e.target.files[0])}
                  className="file-input"
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                />
                {submissionFile && (
                  <p className="file-selected">
                    Archivo seleccionado: {submissionFile.name}
                  </p>
                )}
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                onClick={() => setSelectedTask(null)}
                className="btn-cancel"
                disabled={submitting}
              >
                Cancelar
              </button>
              <button 
                onClick={() => handleSubmitTask(selectedTask.id)}
                className="btn-submit"
                disabled={submitting}
              >
                {submitting ? 'Enviando...' : 'Enviar Tarea'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para ver envío */}
      {selectedTask && selectedTask.user_submission && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Envío: {selectedTask.title}</h3>
              <button 
                onClick={() => setSelectedTask(null)}
                className="btn-close"
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="submission-details">
                <p><strong>Enviado el:</strong> {formatDate(selectedTask.user_submission.submitted_at)}</p>
                
                {selectedTask.user_submission.submission_text && (
                  <div className="submission-text">
                    <h4>Respuesta:</h4>
                    <p>{selectedTask.user_submission.submission_text}</p>
                  </div>
                )}
                
                {selectedTask.user_submission.submission_file && (
                  <div className="submission-file">
                    <h4>Archivo adjunto:</h4>
                    <a 
                      href={selectedTask.user_submission.submission_file}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="file-link"
                    >
                      Descargar archivo
                    </a>
                  </div>
                )}
                
                {selectedTask.user_submission.grade !== null && (
                  <div className="submission-grade">
                    <h4>Calificación:</h4>
                    <p className="grade-display">
                      {selectedTask.user_submission.grade}/{selectedTask.max_score}
                    </p>
                    {selectedTask.user_submission.feedback && (
                      <div className="feedback">
                        <h5>Comentarios del instructor:</h5>
                        <p>{selectedTask.user_submission.feedback}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                onClick={() => setSelectedTask(null)}
                className="btn-close-modal"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Formulario para crear nueva tarea */}
      {showCreateForm && (
        <CreateTaskForm
          onSubmit={handleCreateTask}
          onCancel={() => setShowCreateForm(false)}
        />
      )}
    </div>
  );
};

// Componente para crear nueva tarea
const CreateTaskForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: '',
    max_score: '',
    instructions: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      alert('El título y la descripción son obligatorios');
      return;
    }
    onSubmit(formData);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content create-task-modal">
        <div className="modal-header">
          <h3>Crear Nueva Tarea</h3>
          <button onClick={onCancel} className="btn-close">×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label>Título *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>
          
          <div className="form-group">
            <label>Descripción *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              className="form-textarea"
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Fecha límite</label>
              <input
                type="datetime-local"
                name="due_date"
                value={formData.due_date}
                onChange={handleChange}
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <label>Puntuación máxima</label>
              <input
                type="number"
                name="max_score"
                value={formData.max_score}
                onChange={handleChange}
                min="0"
                step="0.1"
                className="form-input"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>Instrucciones adicionales</label>
            <textarea
              name="instructions"
              value={formData.instructions}
              onChange={handleChange}
              rows={3}
              className="form-textarea"
              placeholder="Instrucciones específicas para la tarea..."
            />
          </div>
        </form>
        
        <div className="modal-footer">
          <button onClick={onCancel} className="btn-cancel">
            Cancelar
          </button>
          <button onClick={handleSubmit} className="btn-submit">
            Crear Tarea
          </button>
        </div>
      </div>
    </div>
  );
};

export default TareasTab;
