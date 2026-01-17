import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { quizService } from '../services/quizService.js';
import { courseService } from '../services/courseService.js';
import { lessonService } from '../services/lessonService.js';
import Card from '../components/Card';

const QuizCreate = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user: _user } = useAuth(); // Usuario no utilizado actualmente
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    course: '',
    lesson: '',
    quiz_type: 'practice',
    time_limit_minutes: 0,
    max_attempts: 0,
    passing_score: 70,
    is_published: false,
    instructions: '',
    randomize_questions: false,
    show_results_immediately: false
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    const template = location.state?.template;
    if (template?.data) {
      setFormData(prev => ({
        ...prev,
        title: template.title || template.data.title || '',
        description: template.description || template.data.description || '',
        quiz_type: template.data.quiz_type || prev.quiz_type,
        time_limit_minutes: template.data.time_limit_minutes || prev.time_limit_minutes,
        max_attempts: template.data.max_attempts ?? prev.max_attempts,
        passing_score: template.data.passing_score ?? prev.passing_score,
        randomize_questions: template.data.randomize_questions ?? prev.randomize_questions
      }));
    }
  }, [location.state]);

  useEffect(() => {
    if (formData.course) {
      fetchLessons();
    } else {
      setLessons([]);
    }
  }, [formData.course]);

  const fetchCourses = async () => {
    try {
      const coursesData = await courseService.getMyCourses();
      setCourses(coursesData);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchLessons = async () => {
    try {
      const lessonsData = await lessonService.getAllLessons(formData.course);
      const list = Array.isArray(lessonsData?.results) ? lessonsData.results : lessonsData;
      setLessons(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error('Error fetching lessons:', error);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'El título es obligatorio';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es obligatoria';
    }

    if (!formData.course) {
      newErrors.course = 'Debe seleccionar un curso';
    }

    if (formData.passing_score < 0 || formData.passing_score > 100) {
      newErrors.passing_score = 'La calificación de aprobación debe estar entre 0 y 100';
    }

    if (formData.time_limit_minutes < 0) {
      newErrors.time_limit_minutes = 'El límite de tiempo no puede ser negativo';
    }

    if (formData.max_attempts < 0) {
      newErrors.max_attempts = 'El número máximo de intentos no puede ser negativo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const newQuiz = await quizService.createQuiz(formData);
      alert('Quiz creado exitosamente');

      // Redirigir a la página de gestión del quiz
      navigate(`/aula-virtual/quizzes/${newQuiz.id}/manage`);
    } catch (error) {
      console.error('Error creating quiz:', error);
      alert('Error al crear el quiz. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleCourseChange = (courseId) => {
    handleInputChange('course', courseId);
    handleInputChange('lesson', '');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Crear Nuevo Quiz</h1>
            <p className="text-primary-100">Diseña una evaluación personalizada para tus estudiantes</p>
          </div>
          <button
            onClick={() => navigate('/aula-virtual/quizzes')}
            className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
          >
            ← Volver a Quizzes
          </button>
        </div>
      </div>

      {/* Breadcrumb */}
      <nav className="text-sm text-gray-600">
        <span>Quizzes</span>
        <span className="mx-2">/</span>
        <span className="text-primary-600 font-medium">Crear Nuevo Quiz</span>
      </nav>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información básica */}
        <Card>
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded text-sm font-medium mr-2">1</span>
            Información Básica
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título del Quiz *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ej: Evaluación de Archivos Históricos"
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Quiz
              </label>
              <select
                value={formData.quiz_type}
                onChange={(e) => handleInputChange('quiz_type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="practice">Práctica</option>
                <option value="exam">Examen</option>
                <option value="survey">Encuesta</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              rows="3"
              placeholder="Describe el propósito y contenido del quiz"
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Instrucciones (opcional)
            </label>
            <textarea
              value={formData.instructions}
              onChange={(e) => handleInputChange('instructions', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              rows="3"
              placeholder="Instrucciones especiales para los estudiantes"
            />
          </div>
        </Card>

        {/* Configuración del curso */}
        <Card>
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded text-sm font-medium mr-2">2</span>
            Configuración del Curso
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Curso *
              </label>
              <select
                value={formData.course}
                onChange={(e) => handleCourseChange(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                  errors.course ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Seleccionar curso</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
              {errors.course && <p className="text-red-500 text-sm mt-1">{errors.course}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lección (opcional)
              </label>
              <select
                value={formData.lesson}
                onChange={(e) => handleInputChange('lesson', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                disabled={!formData.course}
              >
                <option value="">Seleccionar lección</option>
                {lessons.map(lesson => (
                  <option key={lesson.id} value={lesson.id}>
                    {lesson.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* Configuración de evaluación */}
        <Card>
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded text-sm font-medium mr-2">3</span>
            Configuración de Evaluación
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Calificación de Aprobación (%) *
              </label>
              <input
                type="number"
                value={formData.passing_score}
                onChange={(e) => handleInputChange('passing_score', parseInt(e.target.value))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                  errors.passing_score ? 'border-red-500' : 'border-gray-300'
                }`}
                min="0"
                max="100"
              />
              {errors.passing_score && <p className="text-red-500 text-sm mt-1">{errors.passing_score}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Límite de Tiempo (minutos)
              </label>
              <input
                type="number"
                value={formData.time_limit_minutes}
                onChange={(e) => handleInputChange('time_limit_minutes', parseInt(e.target.value))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                  errors.time_limit_minutes ? 'border-red-500' : 'border-gray-300'
                }`}
                min="0"
                placeholder="0 = sin límite"
              />
              {errors.time_limit_minutes && <p className="text-red-500 text-sm mt-1">{errors.time_limit_minutes}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Máximo de Intentos
              </label>
              <input
                type="number"
                value={formData.max_attempts}
                onChange={(e) => handleInputChange('max_attempts', parseInt(e.target.value))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                  errors.max_attempts ? 'border-red-500' : 'border-gray-300'
                }`}
                min="0"
                placeholder="0 = intentos ilimitados"
              />
              {errors.max_attempts && <p className="text-red-500 text-sm mt-1">{errors.max_attempts}</p>}
            </div>
          </div>
        </Card>

        {/* Opciones avanzadas */}
        <Card>
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded text-sm font-medium mr-2">4</span>
            Opciones Avanzadas
          </h3>

          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="randomize_questions"
                checked={formData.randomize_questions}
                onChange={(e) => handleInputChange('randomize_questions', e.target.checked)}
                className="rounded"
              />
              <label htmlFor="randomize_questions" className="ml-2 text-sm text-gray-700">
                Aleatorizar orden de preguntas
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="show_results_immediately"
                checked={formData.show_results_immediately}
                onChange={(e) => handleInputChange('show_results_immediately', e.target.checked)}
                className="rounded"
              />
              <label htmlFor="show_results_immediately" className="ml-2 text-sm text-gray-700">
                Mostrar resultados inmediatamente después de completar
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_published"
                checked={formData.is_published}
                onChange={(e) => handleInputChange('is_published', e.target.checked)}
                className="rounded"
              />
              <label htmlFor="is_published" className="ml-2 text-sm text-gray-700">
                Publicar quiz (visible para estudiantes)
              </label>
            </div>
          </div>
        </Card>

        {/* Botones de acción */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/aula-virtual/quizzes')}
            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium"
            disabled={loading}
          >
            {loading ? 'Creando Quiz...' : 'Crear Quiz'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuizCreate;
