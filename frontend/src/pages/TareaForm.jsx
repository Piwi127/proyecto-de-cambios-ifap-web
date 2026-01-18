import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  getTaskById,
  createTask,
  updateTask,
  getTaskCategories,
  assignStudentsToTask
} from '../services/taskService';
import { courseService } from '../services/courseService.js';
import { lessonService } from '../services/lessonService.js';

const TareaForm = () => {
  const { id: taskId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditing = Boolean(taskId);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructions: '',
    priority: 'medium',
    status: 'draft',
    course: '',
    lesson: '',
    category: '',
    due_date: '',
    max_score: '',
    max_attempts: '1',
    allow_late_submission: false,
    late_penalty_percent: ''
  });
  
  const [categories, setCategories] = useState([]);
  const [courses, setCourses] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCourseData, setLoadingCourseData] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const normalizeList = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    return [];
  };

  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Cargar categorías
      const categoriesData = await getTaskCategories();
      setCategories(normalizeList(categoriesData));
      
      // Cargar cursos del instructor
      const coursesData = user?.is_instructor || user?.is_superuser
        ? await courseService.getTaughtCourses()
        : await courseService.getMyCourses();
      setCourses(normalizeList(coursesData));
      
      // Si estamos editando, cargar datos de la tarea
      if (isEditing) {
        const taskData = await getTaskById(taskId);
        setFormData({
          title: taskData.title || '',
          description: taskData.description || '',
          instructions: taskData.instructions || '',
          priority: taskData.priority || 'medium',
          status: taskData.status || 'draft',
          course: taskData.course?.id || '',
          lesson: taskData.lesson?.id || '',
          category: taskData.category?.id || '',
          due_date: taskData.due_date ? taskData.due_date.split('T')[0] : '',
          max_score: taskData.max_score || '',
          max_attempts: taskData.max_attempts ? String(taskData.max_attempts) : '1',
          allow_late_submission: taskData.allow_late_submission || false,
          late_penalty_percent: taskData.late_penalty_percent || ''
        });
      }
    } catch (err) {
      console.error('Error loading initial data:', err);
      setError('Error al cargar los datos iniciales');
    } finally {
      setLoading(false);
    }
  }, [isEditing, taskId, user]);

  const loadCourseData = useCallback(async (courseId) => {
    try {
      setLoadingCourseData(true);
      const [lessonsData, studentsData] = await Promise.all([
        lessonService.getAllLessons(courseId),
        courseService.getCourseStudents(courseId)
      ]);
      setLessons(normalizeList(lessonsData));
      setAvailableStudents(normalizeList(studentsData));
    } catch (err) {
      console.error('Error loading course data:', err);
      setAvailableStudents([]);
      setLessons([]);
    } finally {
      setLoadingCourseData(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    if (formData.course) {
      setSelectedStudents([]);
      loadCourseData(formData.course);
    } else {
      setLessons([]);
      setAvailableStudents([]);
      setSelectedStudents([]);
      setFormData(prev => ({ ...prev, lesson: '' }));
    }
  }, [formData.course, loadCourseData]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'course' ? { lesson: '' } : {})
    }));
  };

  const handleStudentSelection = (studentId) => {
    setSelectedStudents(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      }
      return [...prev, studentId];
    });
  };

  const selectAllStudents = () => {
    setSelectedStudents(availableStudents.map(student => student.id));
  };

  const clearStudentSelection = () => {
    setSelectedStudents([]);
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.title.trim()) {
      errors.push('El título es requerido');
    }
    
    if (!formData.description.trim()) {
      errors.push('La descripción es requerida');
    }
    
    if (!formData.course) {
      errors.push('El curso es requerido');
    }

    if (!formData.due_date) {
      errors.push('La fecha de vencimiento es requerida');
    }
    
    if (formData.max_score && (isNaN(formData.max_score) || formData.max_score < 0)) {
      errors.push('La puntuación máxima debe ser un número válido');
    }
    
    if (formData.late_penalty_percent && (isNaN(formData.late_penalty_percent) || formData.late_penalty_percent < 0 || formData.late_penalty_percent > 100)) {
      errors.push('La penalización por día debe ser un porcentaje válido (0-100)');
    }

    if (formData.max_attempts && (isNaN(formData.max_attempts) || formData.max_attempts < 1)) {
      errors.push('El número máximo de intentos debe ser válido');
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors.join(', '));
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      // Preparar datos para envío
      const dueDate = formData.due_date
        ? new Date(`${formData.due_date}T23:59:00`).toISOString()
        : null;

      const taskData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        instructions: formData.instructions.trim(),
        priority: formData.priority,
        status: formData.status,
        course: formData.course ? Number(formData.course) : null,
        lesson: formData.lesson ? Number(formData.lesson) : null,
        category: formData.category ? Number(formData.category) : null,
        due_date: dueDate,
        max_attempts: formData.max_attempts ? parseInt(formData.max_attempts, 10) : 1,
        allow_late_submission: formData.allow_late_submission,
        late_penalty_percent: formData.late_penalty_percent ? parseFloat(formData.late_penalty_percent) : 0
      };

      if (formData.max_score) {
        taskData.max_score = parseFloat(formData.max_score);
      }
      
      let savedTask;
      if (isEditing) {
        savedTask = await updateTask(taskId, taskData);
        setSuccess('Tarea actualizada exitosamente');
      } else {
        savedTask = await createTask(taskData);
        setSuccess('Tarea creada exitosamente');
        
        // Si hay estudiantes seleccionados, asignar la tarea
        const savedTaskId = savedTask?.id;
        if (selectedStudents.length > 0 && savedTaskId) {
          try {
            await assignStudentsToTask(savedTaskId, selectedStudents);
          } catch (assignError) {
            console.error('Error assigning students:', assignError);
            setSuccess('Tarea creada. No se pudieron asignar estudiantes.');
          }
        } else if (selectedStudents.length > 0 && !savedTaskId) {
          console.warn('Task created without id; skipping student assignment.');
          setSuccess('Tarea creada. No se pudieron asignar estudiantes.');
        }
      }
      
      // Redirigir después de un breve delay
      setTimeout(() => {
        if (savedTask?.id) {
          navigate(`/aula-virtual/tareas/${savedTask.id}`);
        } else {
          navigate('/aula-virtual/tareas');
        }
      }, 1500);
      
    } catch (err) {
      console.error('Error saving task:', err);
      setError('Error al guardar la tarea');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditing) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <button
              onClick={() => navigate('/aula-virtual/tareas')}
              className="text-blue-500 hover:text-blue-600 mb-4 flex items-center"
            >
              ← Volver a tareas
            </button>
            <h1 className="text-3xl font-bold text-gray-800">
              {isEditing ? 'Editar Tarea' : 'Crear Nueva Tarea'}
            </h1>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Información básica */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Información Básica</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Título de la tarea"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Descripción de la tarea"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instrucciones
                </label>
                <textarea
                  name="instructions"
                  value={formData.instructions}
                  onChange={handleInputChange}
                  rows="6"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Instrucciones detalladas para completar la tarea"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prioridad
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Baja</option>
                  <option value="medium">Media</option>
                  <option value="high">Alta</option>
                  <option value="urgent">Urgente</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="draft">Borrador</option>
                  <option value="published">Publicada</option>
                  <option value="closed">Cerrada</option>
                </select>
              </div>
            </div>
          </div>

          {/* Asignación */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Asignación</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Curso *
                </label>
                <select
                  name="course"
                  value={formData.course}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Seleccionar curso</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.title || course.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lección (Opcional)
                </label>
                <select
                  name="lesson"
                  value={formData.lesson}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!formData.course}
                >
                  <option value="">Sin lección específica</option>
                  {lessons.map(lesson => (
                    <option key={lesson.id} value={lesson.id}>
                      {lesson.title || lesson.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría (Opcional)
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sin categoría</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Vencimiento
                </label>
                <input
                  type="date"
                  name="due_date"
                  value={formData.due_date}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Configuración */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Configuración</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Puntuación Máxima
                </label>
                <input
                  type="number"
                  name="max_score"
                  value={formData.max_score}
                  onChange={handleInputChange}
                  min="0"
                  step="0.1"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Penalización por Entrega Tardía (%)
                </label>
                <input
                  type="number"
                  name="late_penalty_percent"
                  value={formData.late_penalty_percent}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  step="0.1"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="10"
                  disabled={!formData.allow_late_submission}
                />
              </div>
              
              <div className="md:col-span-2">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Máximo de intentos
                    </label>
                    <input
                      type="number"
                      name="max_attempts"
                      value={formData.max_attempts}
                      onChange={handleInputChange}
                      min="1"
                      step="1"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="1"
                    />
                  </div>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="allow_late_submission"
                      checked={formData.allow_late_submission}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Permitir entregas tardías
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Selección de estudiantes (solo para nuevas tareas) */}
          {!isEditing && formData.course && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Asignar a Estudiantes</h2>
              
              <div className="mb-4">
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={selectAllStudents}
                    className="text-blue-500 hover:text-blue-600 font-medium"
                  >
                    Seleccionar todos
                  </button>
                  <button
                    type="button"
                    onClick={clearStudentSelection}
                    className="text-red-500 hover:text-red-600 font-medium"
                  >
                    Limpiar selección
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {selectedStudents.length} de {availableStudents.length} estudiantes seleccionados
                </p>
              </div>
              
              <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md">
                {loadingCourseData ? (
                  <div className="p-4 text-sm text-gray-500">Cargando estudiantes...</div>
                ) : availableStudents.length === 0 ? (
                  <div className="p-4 text-sm text-gray-500">No hay estudiantes disponibles para este curso.</div>
                ) : (
                  availableStudents.map(student => (
                    <label
                      key={student.id}
                      className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(student.id)}
                        onChange={() => handleStudentSelection(student.id)}
                        className="mr-3"
                      />
                      <div>
                        <p className="font-medium text-gray-800">
                          {student.first_name} {student.last_name}
                        </p>
                        <p className="text-sm text-gray-500">{student.email}</p>
                      </div>
                    </label>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/aula-virtual/tareas')}
              className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              {loading ? 'Guardando...' : (isEditing ? 'Actualizar Tarea' : 'Crear Tarea')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TareaForm;
