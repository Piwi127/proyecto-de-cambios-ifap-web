import React, { useState, useEffect } from 'react';
import Card from './Card';

const QuestionForm = ({
  question = null,
  onSave,
  onCancel,
  isOpen = false,
  onClose
}) => {
  const [formData, setFormData] = useState({
    text: '',
    type: 'multiple_choice',
    difficulty: 'medium',
    points: 1,
    explanation: '',
    options: [
      { id: 'opt1', text: '', is_correct: false },
      { id: 'opt2', text: '', is_correct: false }
    ],
    correct_answer: '',
    time_limit: null
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (question) {
      setFormData({
        text: question.text || '',
        type: question.type || 'multiple_choice',
        difficulty: question.difficulty || 'medium',
        points: question.points || 1,
        explanation: question.explanation || '',
        options: question.options || [
          { id: 'opt1', text: '', is_correct: false },
          { id: 'opt2', text: '', is_correct: false }
        ],
        correct_answer: question.correct_answer || '',
        time_limit: question.time_limit || null
      });
    } else {
      // Reset form for new question
      setFormData({
        text: '',
        type: 'multiple_choice',
        difficulty: 'medium',
        points: 1,
        explanation: '',
        options: [
          { id: 'opt1', text: '', is_correct: false },
          { id: 'opt2', text: '', is_correct: false }
        ],
        correct_answer: '',
        time_limit: null
      });
    }
    setErrors({});
  }, [question, isOpen]);

  const questionTypes = [
    { value: 'multiple_choice', label: 'Opción Múltiple', icon: '☑️' },
    { value: 'true_false', label: 'Verdadero/Falso', icon: '✓✗' },
    { value: 'short_answer', label: 'Respuesta Corta', icon: '📝' },
    { value: 'essay', label: 'Ensayo', icon: '📄' }
  ];

  const difficulties = [
    { value: 'easy', label: 'Fácil', color: 'bg-green-100 text-green-800' },
    { value: 'medium', label: 'Medio', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'hard', label: 'Difícil', color: 'bg-red-100 text-red-800' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const handleOptionChange = (optionId, field, value) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map(option =>
        option.id === optionId
          ? { ...option, [field]: value }
          : field === 'is_correct' && prev.type === 'multiple_choice'
            ? { ...option, is_correct: false } // Only one correct answer for multiple choice
            : option
      )
    }));
  };

  const addOption = () => {
    const newOptionId = `opt${formData.options.length + 1}`;
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, { id: newOptionId, text: '', is_correct: false }]
    }));
  };

  const removeOption = (optionId) => {
    if (formData.options.length <= 2) {
      alert('Debes tener al menos 2 opciones');
      return;
    }

    setFormData(prev => ({
      ...prev,
      options: prev.options.filter(option => option.id !== optionId)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.text.trim()) {
      newErrors.text = 'La pregunta es obligatoria';
    }

    if (formData.type === 'multiple_choice') {
      const filledOptions = formData.options.filter(opt => opt.text.trim());
      if (filledOptions.length < 2) {
        newErrors.options = 'Debes tener al menos 2 opciones con texto';
      }

      const correctOptions = formData.options.filter(opt => opt.is_correct);
      if (correctOptions.length === 0) {
        newErrors.correct_answer = 'Debes seleccionar al menos una respuesta correcta';
      }
    }

    if (formData.type === 'true_false' && !formData.correct_answer) {
      newErrors.correct_answer = 'Debes seleccionar la respuesta correcta';
    }

    if (formData.points < 1) {
      newErrors.points = 'Los puntos deben ser al menos 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const questionData = {
        ...formData,
        text: formData.text.trim(),
        options: formData.type === 'multiple_choice'
          ? formData.options.filter(opt => opt.text.trim())
          : []
      };

      await onSave(questionData);

      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Error saving question:', error);
      alert('Error al guardar la pregunta. Por favor, intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    if (onClose) {
      onClose();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {question ? 'Editar Pregunta' : 'Nueva Pregunta'}
          </h2>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Question Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pregunta *
            </label>
            <textarea
              value={formData.text}
              onChange={(e) => handleInputChange('text', e.target.value)}
              placeholder="Escribe la pregunta aquí..."
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-vertical min-h-[100px] ${
                errors.text ? 'border-red-500' : 'border-gray-300'
              }`}
              rows={3}
            />
            {errors.text && (
              <p className="mt-1 text-sm text-red-600">{errors.text}</p>
            )}
          </div>

          {/* Type and Difficulty */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Pregunta *
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {questionTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dificultad
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) => handleInputChange('difficulty', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {difficulties.map(diff => (
                  <option key={diff.value} value={diff.value}>
                    {diff.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Points and Time Limit */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Puntos *
              </label>
              <input
                type="number"
                min="1"
                value={formData.points}
                onChange={(e) => handleInputChange('points', parseInt(e.target.value) || 1)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.points ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.points && (
                <p className="mt-1 text-sm text-red-600">{errors.points}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Límite de Tiempo (segundos)
              </label>
              <input
                type="number"
                min="0"
                placeholder="Sin límite"
                value={formData.time_limit || ''}
                onChange={(e) => handleInputChange('time_limit', e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Options for Multiple Choice */}
          {formData.type === 'multiple_choice' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Opciones *
                </label>
                <button
                  type="button"
                  onClick={addOption}
                  className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                >
                  ➕ Agregar Opción
                </button>
              </div>

              <div className="space-y-3">
                {formData.options.map((option, index) => (
                  <div key={option.id} className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="correct_option"
                      checked={option.is_correct}
                      onChange={() => handleOptionChange(option.id, 'is_correct', true)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                    />
                    <input
                      type="text"
                      value={option.text}
                      onChange={(e) => handleOptionChange(option.id, 'text', e.target.value)}
                      placeholder={`Opción ${index + 1}`}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    {formData.options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(option.id)}
                        className="text-red-600 hover:text-red-800 p-2"
                        title="Eliminar opción"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {errors.options && (
                <p className="mt-2 text-sm text-red-600">{errors.options}</p>
              )}
              {errors.correct_answer && (
                <p className="mt-2 text-sm text-red-600">{errors.correct_answer}</p>
              )}
            </div>
          )}

          {/* True/False Options */}
          {formData.type === 'true_false' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Respuesta Correcta *
              </label>
              <div className="flex space-x-6">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="true_false_answer"
                    value="true"
                    checked={formData.correct_answer === 'true'}
                    onChange={(e) => handleInputChange('correct_answer', e.target.value)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 mr-2"
                  />
                  Verdadero
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="true_false_answer"
                    value="false"
                    checked={formData.correct_answer === 'false'}
                    onChange={(e) => handleInputChange('correct_answer', e.target.value)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 mr-2"
                  />
                  Falso
                </label>
              </div>
              {errors.correct_answer && (
                <p className="mt-2 text-sm text-red-600">{errors.correct_answer}</p>
              )}
            </div>
          )}

          {/* Explanation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Explicación (Opcional)
            </label>
            <textarea
              value={formData.explanation}
              onChange={(e) => handleInputChange('explanation', e.target.value)}
              placeholder="Explica por qué esta es la respuesta correcta..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-vertical"
              rows={3}
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-400"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Guardando...' : (question ? 'Actualizar' : 'Crear')}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default QuestionForm;