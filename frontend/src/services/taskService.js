import { api } from './api.js';

// Categorías de tareas
export const getTaskCategories = async () => {
  const response = await api.get('/tasks/api/categories/');
  return response.data;
};

export const createTaskCategory = async (categoryData) => {
  const response = await api.post('/tasks/api/categories/', categoryData);
  return response.data;
};

export const updateTaskCategory = async (id, categoryData) => {
  const response = await api.put(`/tasks/api/categories/${id}/`, categoryData);
  return response.data;
};

export const deleteTaskCategory = async (id) => {
  const response = await api.delete(`/tasks/api/categories/${id}/`);
  return response.data;
};

// Tareas
export const getTasks = async (params = {}) => {
  const response = await api.get('/tasks/api/tasks/', { params });
  return response.data;
};

export const getTaskById = async (id) => {
  const response = await api.get(`/tasks/api/tasks/${id}/`);
  return response.data;
};

export const createTask = async (taskData) => {
  const response = await api.post('/tasks/api/tasks/', taskData);
  return response.data;
};

export const updateTask = async (id, taskData) => {
  const response = await api.put(`/tasks/api/tasks/${id}/`, taskData);
  return response.data;
};

export const deleteTask = async (id) => {
  const response = await api.delete(`/tasks/api/tasks/${id}/`);
  return response.data;
};

export const assignStudentsToTask = async (taskId, studentIds, dueDateOverride = null) => {
  const response = await api.post(`/tasks/api/tasks/${taskId}/assign_students/`, {
    student_ids: studentIds,
    due_date_override: dueDateOverride
  });
  return response.data;
};

export const getTaskAssignments = async (taskId, params = {}) => {
  const response = await api.get(`/tasks/api/tasks/${taskId}/assignments/`, { params });
  return response.data;
};

export const getTaskStats = async (taskId) => {
  const response = await api.get(`/tasks/api/tasks/${taskId}/stats/`);
  return response.data;
};

// Asignaciones
export const getAssignments = async (params = {}) => {
  const response = await api.get('/tasks/api/assignments/', { params });
  return response.data;
};

export const getAssignmentById = async (id) => {
  const response = await api.get(`/tasks/api/assignments/${id}/`);
  return response.data;
};

export const startAssignment = async (id) => {
  const response = await api.post(`/tasks/api/assignments/${id}/start/`);
  return response.data;
};

export const getAssignmentSubmissions = async (assignmentId) => {
  const response = await api.get(`/tasks/api/assignments/${assignmentId}/submissions/`);
  return response.data;
};

// Entregas
export const getSubmissions = async (params = {}) => {
  const response = await api.get('/tasks/api/submissions/', { params });
  return response.data;
};

export const getSubmissionById = async (id) => {
  const response = await api.get(`/tasks/api/submissions/${id}/`);
  return response.data;
};

export const createSubmission = async (submissionData, files = []) => {
  const formData = new FormData();
  
  // Agregar datos de la entrega
  Object.keys(submissionData).forEach(key => {
    formData.append(key, submissionData[key]);
  });
  
  // Agregar archivos
  files.forEach(file => {
    formData.append('files', file);
  });
  
  const response = await api.post('/tasks/api/submissions/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const gradeSubmission = async (id, score, feedback = '') => {
  const response = await api.post(`/tasks/api/submissions/${id}/grade/`, {
    score,
    feedback
  });
  return response.data;
};

export const addCommentToSubmission = async (submissionId, content, isPrivate = false) => {
  const response = await api.post(`/tasks/api/submissions/${submissionId}/add_comment/`, {
    content,
    is_private: isPrivate
  });
  return response.data;
};

// Archivos
export const getTaskFiles = async (params = {}) => {
  const response = await api.get('/tasks/api/files/', { params });
  return response.data;
};

export const getTaskFileById = async (id) => {
  const response = await api.get(`/tasks/api/files/${id}/`);
  return response.data;
};

// Comentarios
export const getTaskComments = async (params = {}) => {
  const response = await api.get('/tasks/api/comments/', { params });
  return response.data;
};

export const createTaskComment = async (commentData) => {
  const response = await api.post('/tasks/api/comments/', commentData);
  return response.data;
};

export const updateTaskComment = async (id, commentData) => {
  const response = await api.put(`/tasks/api/comments/${id}/`, commentData);
  return response.data;
};

export const deleteTaskComment = async (id) => {
  const response = await api.delete(`/tasks/api/comments/${id}/`);
  return response.data;
};

// Utilidades
export const formatTaskStatus = (status) => {
  const statusMap = {
    'draft': 'Borrador',
    'published': 'Publicada',
    'closed': 'Cerrada'
  };
  return statusMap[status] || status;
};

export const formatAssignmentStatus = (status) => {
  const statusMap = {
    'assigned': 'Asignada',
    'in_progress': 'En progreso',
    'submitted': 'Entregada',
    'graded': 'Calificada'
  };
  return statusMap[status] || status;
};

export const formatTaskType = (type) => {
  const typeMap = {
    'assignment': 'Tarea',
    'project': 'Proyecto',
    'essay': 'Ensayo',
    'presentation': 'Presentación',
    'lab': 'Laboratorio',
    'other': 'Otro',
    'low': 'Baja',
    'medium': 'Media',
    'high': 'Alta',
    'urgent': 'Urgente'
  };
  return typeMap[type] || type;
};

export const getStatusColor = (status) => {
  const colorMap = {
    'assigned': 'blue',
    'in_progress': 'yellow',
    'submitted': 'green',
    'graded': 'purple',
    'draft': 'gray',
    'published': 'green',
    'archived': 'red'
  };
  return colorMap[status] || 'gray';
};

export const isOverdue = (dueDate, status) => {
  if (!dueDate || ['submitted', 'graded'].includes(status)) {
    return false;
  }
  return new Date(dueDate) < new Date();
};

export const calculateTimeRemaining = (dueDate) => {
  if (!dueDate) return null;
  
  const now = new Date();
  const due = new Date(dueDate);
  const diff = due - now;
  
  if (diff <= 0) return 'Vencida';
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  if (days > 0) {
    return `${days} día${days > 1 ? 's' : ''}`;
  } else if (hours > 0) {
    return `${hours} hora${hours > 1 ? 's' : ''}`;
  } else {
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${minutes} minuto${minutes > 1 ? 's' : ''}`;
  }
};
