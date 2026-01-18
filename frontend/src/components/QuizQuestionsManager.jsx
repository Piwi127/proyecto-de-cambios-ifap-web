import React, { useCallback, useEffect, useState } from 'react';
import { quizService } from '../services/quizService.js';
import Card from '../components/Card';

const QuizQuestionsManager = ({ quizId, onClose }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);

  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true);
      const questionsData = await quizService.getQuizQuestions(quizId);
      setQuestions(questionsData);
    } catch (err) {
      console.error('Error fetching questions:', err);
    } finally {
      setLoading(false);
    }
  }, [quizId]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleAddQuestion = () => {
    setShowAddForm(true);
    setEditingQuestion(null);
  };

  const handleEditQuestion = (question) => {
    setEditingQuestion(question);
    setShowAddForm(true);
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta pregunta?')) {
      return;
    }

    try {
      await quizService.deleteQuestion(questionId);
      setQuestions(questions.filter(q => q.id !== questionId));
    } catch (error) {
      console.error('Error deleting question:', error);
      alert('Error al eliminar la pregunta');
    }
  };

  const handleSaveQuestion = async (questionData) => {
    try {
      const options = (questionData.options || []).map((option, index) => ({
        option_text: option.option_text,
        is_correct: Boolean(option.is_correct),
        order: index + 1
      }));
      const payload = {
        quiz: Number(quizId),
        question_text: questionData.question_text,
        question_type: questionData.question_type,
        points: Number(questionData.points || 1),
        order: editingQuestion?.order || questions.length + 1,
        explanation: questionData.explanation || '',
        options
      };

      if (editingQuestion) {
        await quizService.updateQuestion(editingQuestion.id, payload);
      } else {
        await quizService.createQuestion(payload);
      }

      setShowAddForm(false);
      setEditingQuestion(null);
      await fetchQuestions(); // Recargar preguntas
    } catch (error) {
      console.error('Error saving question:', error);
      alert('Error al guardar la pregunta');
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p>Cargando preguntas...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Gestionar Preguntas del Quiz</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Botón agregar pregunta */}
          <div className="mb-6">
            <button
              onClick={handleAddQuestion}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              ➕ Agregar Pregunta
            </button>
          </div>

          {/* Lista de preguntas */}
          <div className="space-y-4">
            {questions.length > 0 ? (
              questions.map((question, index) => (
                <Card key={question.id}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                          #{index + 1}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          question.question_type === 'multiple_choice' ? 'bg-green-100 text-green-800' :
                          question.question_type === 'true_false' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {question.question_type === 'multiple_choice' ? 'Opción Múltiple' :
                           question.question_type === 'true_false' ? 'Verdadero/Falso' : 'Ensayo'}
                        </span>
                        <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-medium">
                          {question.points} pts
                        </span>
                      </div>

                      <h3 className="font-medium text-gray-900 mb-2">{question.question_text}</h3>

                      {question.question_type === 'multiple_choice' && question.options && (
                        <div className="space-y-1">
                          {question.options.map((option, optIndex) => (
                            <div key={optIndex} className={`p-2 rounded text-sm ${
                              option.is_correct ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
                            }`}>
                              {option.is_correct && <span className="text-green-600 mr-2">✓</span>}
                              {option.option_text}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => handleEditQuestion(question)}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(question.id)}
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="text-center py-8">
                <div className="text-gray-400 mb-4">
                  <span className="text-4xl">❓</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay preguntas</h3>
                <p className="text-gray-600">Agrega la primera pregunta para este quiz</p>
              </Card>
            )}
          </div>

          {/* Formulario para agregar/editar pregunta */}
          {showAddForm && (
            <QuestionForm
              question={editingQuestion}
              onSave={handleSaveQuestion}
              onCancel={() => {
                setShowAddForm(false);
                setEditingQuestion(null);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// Componente para el formulario de pregunta
const QuestionForm = ({ question, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    question_text: question?.question_text || '',
    question_type: question?.question_type || 'multiple_choice',
    points: question?.points || 5,
    options: question?.options || [
      { option_text: '', is_correct: false },
      { option_text: '', is_correct: false },
      { option_text: '', is_correct: false },
      { option_text: '', is_correct: false }
    ]
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const updateOption = (index, field, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setFormData({ ...formData, options: newOptions });
  };

  return (
    <Card className="mt-6">
      <h3 className="text-lg font-semibold mb-4">
        {question ? 'Editar Pregunta' : 'Nueva Pregunta'}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Texto de la pregunta
          </label>
          <textarea
            value={formData.question_text}
            onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            rows="3"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de pregunta
            </label>
            <select
              value={formData.question_type}
              onChange={(e) => setFormData({ ...formData, question_type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="multiple_choice">Opción Múltiple</option>
              <option value="true_false">Verdadero/Falso</option>
              <option value="essay">Ensayo</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Puntos
            </label>
            <input
              type="number"
              value={formData.points}
              onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              min="1"
              required
            />
          </div>
        </div>

        {formData.question_type === 'multiple_choice' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Opciones de respuesta
            </label>
            <div className="space-y-2">
              {formData.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={option.is_correct}
                    onChange={(e) => updateOption(index, 'is_correct', e.target.checked)}
                    className="rounded"
                  />
                  <input
                    type="text"
                    value={option.option_text}
                    onChange={(e) => updateOption(index, 'option_text', e.target.value)}
                    placeholder={`Opción ${index + 1}`}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Marca las opciones que sean correctas
            </p>
          </div>
        )}

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
          >
            {question ? 'Actualizar' : 'Crear'} Pregunta
          </button>
        </div>
      </form>
    </Card>
  );
};

export default QuizQuestionsManager;
