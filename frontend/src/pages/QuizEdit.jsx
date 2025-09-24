import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { quizService } from '../services/quizService.js';
import { courseService } from '../services/courseService.js';
import Card from '../components/Card';

const QuizEdit = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { user: _user } = useAuth(); // Usuario no utilizado actualmente
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizId]); // fetchData es estable

  useEffect(() => {
    if (formData.course) {
      fetchLessons();
    } else {
      setLessons([]);
    }
  }, [formData.course]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [quizData, coursesData] = await Promise.all([
        quizService.getQuizById(quizId),
        courseService.getMyCourses()
      ]);

      setFormData({
        title: quizData.title || '',
        description: quizData.description || '',
        course: quizData.course || '',
        lesson: quizData.lesson || '',
        quiz_type: quizData.quiz_type || 'practice',
        time_limit_minutes: quizData.time_limit_minutes || 0,
        max_attempts: quizData.max_attempts || 0,
        passing_score: quizData.passing_score || 70,
        is_published: quizData.is_published || false,
        instructions: quizData.instructions || '',
        randomize_questions: quizData.randomize_questions || false,
        show_results_immediately: quizData.show_results_immediately || false
      });

      setCourses(coursesData);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Error al cargar los datos del quiz');
      navigate('/aula-virtual/quizzes');
    } finally {
      setLoading(false);
    }
  };

  const fetchLessons = async () => {
    try {
      // TODO: Implementar servicio para obtener lecciones de un curso
      setLessons([]);
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

    setSaving(true);
    try {
      await quizService.updateQuiz(quizId, formData);
      alert('Quiz actualizado exitosamente');
      navigate(`/aula-virtual/quizzes/${quizId}/manage`);
    } catch (error) {
      console.error('Error updating quiz:', error);
      alert('Error al actualizar el quiz. Por favor, intenta nuevamente.');
    } finally {
      setSaving(false);
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

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando quiz...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Editar Quiz</h1>
            <p className="text-blue-100">Modifica la configuración del quiz</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => navigate(`/aula-virtual/quizzes/${quizId}/manage`)}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
            >
              ← Gestionar
            </button>
            <button
              onClick={() => navigate('/aula-virtual/quizzes')}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
            >
              ← Quizzes
            </button>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <nav className="text-sm text-gray-600">
        <span onClick={() => navigate('/aula-virtual/quizzes')} className="cursor-pointer hover:text-primary-600">Quizzes</span>
        <span className="mx-2">/</span>
        <span onClick={() => navigate(`/aula-virtual/quizzes/${quizId}/manage`)} className="cursor-pointer hover:text-primary-600">Gestionar</span>
        <span className="mx-2">/</span>
        <span className="text-primary-600 font-medium">Editar</span>
      </nav>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información básica */}
        <Card>
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium mr-2">1</span>
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
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows="3"
              placeholder="Instrucciones especiales para los estudiantes"
            />
          </div>
        </Card>

        {/* Configuración del curso */}
        <Card>
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium mr-2">2</span>
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
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium mr-2">3</span>
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
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
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
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
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
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
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
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium mr-2">4</span>
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
            onClick={() => navigate(`/aula-virtual/quizzes/${quizId}/manage`)}
            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium"
            disabled={saving}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            disabled={saving}
          >
            {saving ? 'Guardando...' : 'Actualizar Quiz'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuizEdit;