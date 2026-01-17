import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { quizService } from '../services/quizService.js';
import Card from '../components/Card';

const QuizManage = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { user: _user } = useAuth(); // Usuario no utilizado actualmente
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [draggedQuestion, setDraggedQuestion] = useState(null);

  useEffect(() => {
    fetchQuizData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizId]); // fetchQuizData es estable

  const fetchQuizData = async () => {
    try {
      setLoading(true);
      const [quizData, questionsData] = await Promise.all([
        quizService.getQuizById(quizId),
        quizService.getQuizQuestions(quizId)
      ]);

      setQuiz(quizData);
      setQuestions(questionsData);
    } catch (err) {
      console.error('Error fetching quiz data:', err);
      setError('Error al cargar los datos del quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (e, question) => {
    setDraggedQuestion(question);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, targetQuestion) => {
    e.preventDefault();

    if (!draggedQuestion || draggedQuestion.id === targetQuestion.id) {
      setDraggedQuestion(null);
      return;
    }

    const draggedIndex = questions.findIndex(q => q.id === draggedQuestion.id);
    const targetIndex = questions.findIndex(q => q.id === targetQuestion.id);

    // Reordenar preguntas localmente
    const newQuestions = [...questions];
    newQuestions.splice(draggedIndex, 1);
    newQuestions.splice(targetIndex, 0, draggedQuestion);

    // Actualizar orden en el estado
    const updatedQuestions = newQuestions.map((q, index) => ({
      ...q,
      order: index + 1
    }));

    setQuestions(updatedQuestions);
    setDraggedQuestion(null);

    try {
      await quizService.updateQuestionOrder(quizId, updatedQuestions.map(q => ({ id: q.id, order: q.order })));
    } catch (error) {
      console.error('Error updating question order:', error);
      // Revertir cambios en caso de error
      await fetchQuizData();
    }
  };

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
      await fetchQuizData(); // Recargar datos
    } catch (error) {
      console.error('Error saving question:', error);
      alert('Error al guardar la pregunta');
    }
  };

  const handlePublishQuiz = async () => {
    try {
      await quizService.updateQuiz(quizId, { is_published: !quiz.is_published });
      setQuiz({ ...quiz, is_published: !quiz.is_published });
      alert(`Quiz ${quiz.is_published ? 'despublicado' : 'publicado'} exitosamente`);
    } catch (error) {
      console.error('Error updating quiz:', error);
      alert('Error al actualizar el quiz');
    }
  };

  const handleDeleteQuiz = async () => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este quiz? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      await quizService.deleteQuiz(quizId);
      alert('Quiz eliminado exitosamente');
      navigate('/aula-virtual/quizzes');
    } catch (error) {
      console.error('Error deleting quiz:', error);
      alert('Error al eliminar el quiz');
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando quiz...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => navigate('/aula-virtual/quizzes')}
              className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
            >
              Volver a Quizzes
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Gestionar Quiz</h1>
            <p className="text-primary-100">{quiz.title}</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => navigate('/aula-virtual/quizzes')}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
            >
              ← Volver
            </button>
            <button
              onClick={() => navigate(`/aula-virtual/quizzes/${quizId}/edit`)}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
            >
              ✏️ Editar Quiz
            </button>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <nav className="text-sm text-gray-600">
        <span onClick={() => navigate('/aula-virtual/quizzes')} className="cursor-pointer hover:text-primary-600">Quizzes</span>
        <span className="mx-2">/</span>
        <span className="text-primary-600 font-medium">{quiz.title}</span>
      </nav>

      {/* Información del Quiz */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{questions.length}</div>
            <p className="text-sm text-gray-600">Preguntas</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{quiz.passing_score}%</div>
            <p className="text-sm text-gray-600">Aprobación</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {quiz.time_limit_minutes > 0 ? `${quiz.time_limit_minutes}min` : 'Sin límite'}
            </div>
            <p className="text-sm text-gray-600">Tiempo</p>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${quiz.is_published ? 'text-green-600' : 'text-red-600'}`}>
              {quiz.is_published ? 'Publicado' : 'Borrador'}
            </div>
            <p className="text-sm text-gray-600">Estado</p>
          </div>
        </div>
      </Card>

      {/* Acciones principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={handleAddQuestion}
          className="bg-primary-600 text-white p-4 rounded-lg hover:bg-primary-700 transition-colors"
        >
          <div className="text-center">
            <div className="text-2xl mb-2">➕</div>
            <div className="font-medium">Agregar Pregunta</div>
          </div>
        </button>

        <button
          onClick={() => navigate(`/aula-virtual/quizzes/${quizId}/results`)}
          className="bg-indigo-600 text-white p-4 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <div className="text-center">
            <div className="text-2xl mb-2">📊</div>
            <div className="font-medium">Ver Resultados</div>
          </div>
        </button>

        <button
          onClick={handlePublishQuiz}
          className={`text-white p-4 rounded-lg transition-colors ${
            quiz.is_published
              ? 'bg-yellow-600 hover:bg-yellow-700'
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          <div className="text-center">
            <div className="text-2xl mb-2">{quiz.is_published ? '📥' : '📤'}</div>
            <div className="font-medium">
              {quiz.is_published ? 'Despublicar' : 'Publicar'}
            </div>
          </div>
        </button>

        <button
          onClick={handleDeleteQuiz}
          className="bg-red-600 text-white p-4 rounded-lg hover:bg-red-700 transition-colors"
        >
          <div className="text-center">
            <div className="text-2xl mb-2">🗑️</div>
            <div className="font-medium">Eliminar Quiz</div>
          </div>
        </button>
      </div>

      {/* Lista de preguntas con drag & drop */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Preguntas del Quiz</h3>
          <span className="text-sm text-gray-600">
            Arrastra y suelta para reordenar
          </span>
        </div>

        <div className="space-y-3">
          {questions.length > 0 ? (
            questions.map((question, index) => (
              <div
                key={question.id}
                draggable
                onDragStart={(e) => handleDragStart(e, question)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, question)}
                className={`border rounded-lg p-4 cursor-move hover:shadow-md transition-shadow ${
                  draggedQuestion?.id === question.id ? 'opacity-50' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm font-medium">
                      #{question.order || index + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{question.question_text}</h4>
                      <div className="flex items-center space-x-2 mt-1">
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
                    </div>
                  </div>

                  <div className="flex space-x-2">
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
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-4">
                <span className="text-4xl">❓</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay preguntas</h3>
              <p className="text-gray-600 mb-4">Agrega la primera pregunta para este quiz</p>
              <button
                onClick={handleAddQuestion}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
              >
                Agregar Primera Pregunta
              </button>
            </div>
          )}
        </div>
      </Card>

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

  const addOption = () => {
    setFormData({
      ...formData,
      options: [...formData.options, { option_text: '', is_correct: false }]
    });
  };

  const removeOption = (index) => {
    if (formData.options.length > 2) {
      setFormData({
        ...formData,
        options: formData.options.filter((_, i) => i !== index)
      });
    }
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
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Opciones de respuesta
              </label>
              <button
                type="button"
                onClick={addOption}
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                + Agregar opción
              </button>
            </div>
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
                  {formData.options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      className="text-red-600 hover:text-red-700 px-2"
                    >
                      ×
                    </button>
                  )}
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

export default QuizManage;
