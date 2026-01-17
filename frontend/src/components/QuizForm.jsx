import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { quizService } from '../services/quizService.js';
import { courseService } from '../services/courseService.js';
import { lessonService } from '../services/lessonService.js';
import Card from '../components/Card';

const QuizForm = ({ quiz, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: quiz?.title || '',
    description: quiz?.description || '',
    course: quiz?.course || '',
    lesson: quiz?.lesson || '',
    quiz_type: quiz?.quiz_type || 'practice',
    time_limit_minutes: quiz?.time_limit_minutes || 0,
    max_attempts: quiz?.max_attempts || 0,
    passing_score: quiz?.passing_score || 70,
    is_published: quiz?.is_published || false,
    instructions: quiz?.instructions || '',
    randomize_questions: quiz?.randomize_questions || false,
    show_results_immediately: quiz?.show_results_immediately || false
  });

  const [courses, setCourses] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { user } = useAuth();

  useEffect(() => {
    fetchCourses();
    if (formData.course) {
      fetchLessons(formData.course);
    }
  }, []);

  const fetchCourses = async () => {
    try {
      const coursesData = await courseService.getMyCourses();
      setCourses(coursesData);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchLessons = async (courseId) => {
    try {
      const lessonsData = await lessonService.getAllLessons(courseId);
      const list = Array.isArray(lessonsData?.results) ? lessonsData.results : lessonsData;
      setLessons(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error('Error fetching lessons:', error);
    }
  };

  const handleCourseChange = (courseId) => {
    setFormData({ ...formData, course: courseId, lesson: '' });
    if (courseId) {
      fetchLessons(courseId);
    } else {
      setLessons([]);
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
      if (quiz) {
        // Actualizar quiz existente
        const updatedQuiz = await quizService.updateQuiz(quiz.id, formData);
        onSave(updatedQuiz);
      } else {
        // Crear nuevo quiz
        const newQuiz = await quizService.createQuiz(formData);
        onSave(newQuiz);
      }
    } catch (error) {
      console.error('Error saving quiz:', error);
      alert('Error al guardar el quiz. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {quiz ? 'Editar Quiz' : 'Crear Nuevo Quiz'}
            </h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información básica */}
            <Card>
              <h3 className="text-lg font-semibold mb-4">Información Básica</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título del Quiz *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, quiz_type: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  rows="3"
                  placeholder="Instrucciones especiales para los estudiantes"
                />
              </div>
            </Card>

            {/* Configuración del curso */}
            <Card>
              <h3 className="text-lg font-semibold mb-4">Configuración del Curso</h3>

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
                    onChange={(e) => setFormData({ ...formData, lesson: e.target.value })}
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
              <h3 className="text-lg font-semibold mb-4">Configuración de Evaluación</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Calificación de Aprobación (%) *
                  </label>
                  <input
                    type="number"
                    value={formData.passing_score}
                    onChange={(e) => setFormData({ ...formData, passing_score: parseInt(e.target.value) })}
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
                    onChange={(e) => setFormData({ ...formData, time_limit_minutes: parseInt(e.target.value) })}
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
                    onChange={(e) => setFormData({ ...formData, max_attempts: parseInt(e.target.value) })}
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
              <h3 className="text-lg font-semibold mb-4">Opciones Avanzadas</h3>

              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="randomize_questions"
                    checked={formData.randomize_questions}
                    onChange={(e) => setFormData({ ...formData, randomize_questions: e.target.checked })}
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
                    onChange={(e) => setFormData({ ...formData, show_results_immediately: e.target.checked })}
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
                    onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
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
                onClick={onCancel}
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
                {loading ? 'Guardando...' : (quiz ? 'Actualizar Quiz' : 'Crear Quiz')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default QuizForm;
