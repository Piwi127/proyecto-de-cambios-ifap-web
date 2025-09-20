import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  getTaskById,
  createTask,
  updateTask,
  getTaskCategories,
  assignStudentsToTask
} from '../services/taskService';

const TareaForm = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditing = Boolean(taskId);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructions: '',
    task_type: 'assignment',
    status: 'draft',
    course: '',
    lesson: '',
    category: '',
    due_date: '',
    max_score: '',
    allow_multiple_submissions: false,
    allow_late_submissions: false,
    late_penalty_per_day: ''
  });
  
  const [categories, setCategories] = useState([]);
  const [courses, setCourses] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    loadInitialData();
  }, [taskId]);

  useEffect(() => {
    if (formData.course) {
      loadCourseData(formData.course);
    }
  }, [formData.course]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Cargar categorías
      const categoriesData = await getTaskCategories();
      setCategories(categoriesData);
      
      // Cargar cursos del instructor
      // Aquí deberías implementar getCoursesByInstructor
      // const coursesData = await getCoursesByInstructor();
      // setCourses(coursesData);
      
      // Si estamos editando, cargar datos de la tarea
      if (isEditing) {
        const taskData = await getTaskById(taskId);
        setFormData({
          title: taskData.title || '',
          description: taskData.description || '',
          instructions: taskData.instructions || '',
          task_type: taskData.task_type || 'assignment',
          status: taskData.status || 'draft',
          course: taskData.course?.id || '',
          lesson: taskData.lesson?.id || '',
          category: taskData.category?.id || '',
          due_date: taskData.due_date ? taskData.due_date.split('T')[0] : '',
          max_score: taskData.max_score || '',
          allow_multiple_submissions: taskData.allow_multiple_submissions || false,
          allow_late_submissions: taskData.allow_late_submissions || false,
          late_penalty_per_day: taskData.late_penalty_per_day || ''
        });
      }
    } catch (err) {
      console.error('Error loading initial data:', err);
      setError('Error al cargar los datos iniciales');
    } finally {
      setLoading(false);
    }
  };

  const loadCourseData = async (courseId) => {
    try {
      // Aquí deberías implementar getLessonsByCourse y getStudentsByCourse
      // const [lessonsData, studentsData] = await Promise.all([
      //   getLessonsByCourse(courseId),
      //   getStudentsByCourse(courseId)
      // ]);
      // setLessons(lessonsData);
      // setAvailableStudents(studentsData);
    } catch (err) {
      console.error('Error loading course data:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleStudentSelection = (studentId) => {
    setSelectedStudents(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      } else {
        return [...prev, studentId];
      }
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
    
    if (formData.max_score && (isNaN(formData.max_score) || formData.max_score < 0)) {
      errors.push('La puntuación máxima debe ser un número válido');
    }
    
    if (formData.late_penalty_per_day && (isNaN(formData.late_penalty_per_day) || formData.late_penalty_per_day < 0 || formData.late_penalty_per_day > 100)) {
      errors.push('La penalización por día debe ser un porcentaje válido (0-100)');
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
      const taskData = {
        ...formData,
        max_score: formData.max_score ? parseFloat(formData.max_score) : null,
        late_penalty_per_day: formData.late_penalty_per_day ? parseFloat(formData.late_penalty_per_day) : null,
        due_date: formData.due_date || null,
        category: formData.category || null,
        lesson: formData.lesson || null
      };
      
      let savedTask;
      if (isEditing) {
        savedTask = await updateTask(taskId, taskData);
        setSuccess('Tarea actualizada exitosamente');
      } else {
        savedTask = await createTask(taskData);
        setSuccess('Tarea creada exitosamente');
        
        // Si hay estudiantes seleccionados, asignar la tarea
        if (selectedStudents.length > 0) {
          await assignTaskToStudents(savedTask.id, selectedStudents);
        }
      }
      
      // Redirigir después de un breve delay
      setTimeout(() => {
        navigate(`/aula-virtual/tareas/tarea/${savedTask.id}`);
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
                  Tipo de Tarea
                </label>
                <select
                  name="task_type"
                  value={formData.task_type}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="assignment">Tarea</option>
                  <option value="project">Proyecto</option>
                  <option value="essay">Ensayo</option>
                  <option value="presentation">Presentación</option>
                  <option value="lab">Laboratorio</option>
                  <option value="other">Otro</option>
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
                  <option value="archived">Archivada</option>
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
                      {course.name}
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
                      {lesson.title}
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
                  Penalización por Día Tardío (%)
                </label>
                <input
                  type="number"
                  name="late_penalty_per_day"
                  value={formData.late_penalty_per_day}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  step="0.1"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="10"
                  disabled={!formData.allow_late_submissions}
                />
              </div>
              
              <div className="md:col-span-2">
                <div className="space-y-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="allow_multiple_submissions"
                      checked={formData.allow_multiple_submissions}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Permitir múltiples entregas
                    </span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="allow_late_submissions"
                      checked={formData.allow_late_submissions}
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
                {availableStudents.map(student => (
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
                ))}
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