import React, { useState, useRef } from 'react';
import Card from '../components/Card';

const DraggableQuestionList = ({
  questions,
  onReorder,
  onEdit,
  onDelete,
  onAdd,
  readOnly = false
}) => {
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverItem, setDragOverItem] = useState(null);
  const dragItemRef = useRef(null);

  const handleDragStart = (e, index) => {
    if (readOnly) return;

    setDraggedItem(index);
    dragItemRef.current = index;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.outerHTML);

    // Add visual feedback
    e.target.style.opacity = '0.5';
  };

  const handleDragEnd = (e) => {
    if (readOnly) return;

    setDraggedItem(null);
    setDragOverItem(null);
    dragItemRef.current = null;

    // Reset visual feedback
    e.target.style.opacity = '1';
  };

  const handleDragOver = (e, index) => {
    if (readOnly) return;

    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    if (dragOverItem !== index) {
      setDragOverItem(index);
    }
  };

  const handleDragLeave = (e) => {
    if (readOnly) return;

    // Only clear dragOverItem if we're actually leaving the list item
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverItem(null);
    }
  };

  const handleDrop = (e, dropIndex) => {
    if (readOnly) return;

    e.preventDefault();

    const dragIndex = dragItemRef.current;

    if (dragIndex === null || dragIndex === dropIndex) {
      setDraggedItem(null);
      setDragOverItem(null);
      return;
    }

    // Reorder the questions
    const newQuestions = [...questions];
    const [draggedQuestion] = newQuestions.splice(dragIndex, 1);
    newQuestions.splice(dropIndex, 0, draggedQuestion);

    // Update order numbers
    const updatedQuestions = newQuestions.map((question, index) => ({
      ...question,
      order: index + 1
    }));

    // Call the reorder callback
    if (onReorder) {
      onReorder(updatedQuestions);
    }

    setDraggedItem(null);
    setDragOverItem(null);
    dragItemRef.current = null;
  };

  const getQuestionTypeIcon = (type) => {
    switch (type) {
      case 'multiple_choice': return '☑️';
      case 'true_false': return '✓✗';
      case 'short_answer': return '📝';
      case 'essay': return '📄';
      default: return '❓';
    }
  };

  const getQuestionTypeText = (type) => {
    switch (type) {
      case 'multiple_choice': return 'Opción Múltiple';
      case 'true_false': return 'Verdadero/Falso';
      case 'short_answer': return 'Respuesta Corta';
      case 'essay': return 'Ensayo';
      default: return type;
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyText = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'Fácil';
      case 'medium': return 'Medio';
      case 'hard': return 'Difícil';
      default: return 'N/A';
    }
  };

  if (!questions || questions.length === 0) {
    return (
      <Card className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <span className="text-6xl">📝</span>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay preguntas</h3>
        <p className="text-gray-600 mb-4">Agrega la primera pregunta para comenzar</p>
        {!readOnly && onAdd && (
          <button
            onClick={onAdd}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
          >
            ➕ Agregar Pregunta
          </button>
        )}
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Preguntas ({questions.length})
        </h3>
        {!readOnly && onAdd && (
          <button
            onClick={onAdd}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 text-sm"
          >
            ➕ Agregar Pregunta
          </button>
        )}
      </div>

      {/* Instructions */}
      {!readOnly && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            💡 <strong>Arrastrar y soltar:</strong> Haz clic y arrastra las preguntas para reordenarlas
          </p>
        </div>
      )}

      {/* Questions List */}
      <div className="space-y-2">
        {questions.map((question, index) => (
          <Card
            key={question.id || index}
            className={`transition-all duration-200 ${
              draggedItem === index ? 'opacity-50' : ''
            } ${
              dragOverItem === index ? 'border-primary-500 bg-primary-50' : ''
            } ${
              !readOnly ? 'cursor-move hover:shadow-md' : ''
            }`}
            draggable={!readOnly}
            onDragStart={(e) => handleDragStart(e, index)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
          >
            <div className="flex items-start space-x-4">
              {/* Drag Handle */}
              {!readOnly && (
                <div className="flex-shrink-0 mt-1">
                  <div className="text-gray-400 hover:text-gray-600 cursor-move">
                    <span className="text-lg">⋮⋮</span>
                  </div>
                </div>
              )}

              {/* Question Number */}
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-primary-100 text-primary-800 rounded-full flex items-center justify-center font-semibold text-sm">
                  {index + 1}
                </div>
              </div>

              {/* Question Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-lg">{getQuestionTypeIcon(question.type)}</span>
                      <span className="text-sm font-medium text-gray-600">
                        {getQuestionTypeText(question.type)}
                      </span>
                      {question.difficulty && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
                          {getDifficultyText(question.difficulty)}
                        </span>
                      )}
                      {question.points && (
                        <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">
                          {question.points} pts
                        </span>
                      )}
                    </div>

                    <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">
                      {question.text}
                    </h4>

                    {/* Options Preview */}
                    {question.type === 'multiple_choice' && question.options && (
                      <div className="space-y-1 mb-2">
                        {question.options.slice(0, 3).map((option, optIndex) => (
                          <div key={optIndex} className="text-sm text-gray-600 flex items-center space-x-2">
                            <span className="w-4 h-4 border border-gray-300 rounded flex-shrink-0"></span>
                            <span className="line-clamp-1">{option.text}</span>
                            {question.correct_answers && question.correct_answers.includes(option.id) && (
                              <span className="text-green-600 font-medium">✓</span>
                            )}
                          </div>
                        ))}
                        {question.options.length > 3 && (
                          <p className="text-xs text-gray-500">
                            +{question.options.length - 3} opciones más...
                          </p>
                        )}
                      </div>
                    )}

                    {/* True/False Preview */}
                    {question.type === 'true_false' && (
                      <div className="flex space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <span className="w-4 h-4 border border-gray-300 rounded flex-shrink-0"></span>
                          <span>Verdadero</span>
                          {question.correct_answers && question.correct_answers[0] === 'true' && (
                            <span className="text-green-600 font-medium">✓</span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="w-4 h-4 border border-gray-300 rounded flex-shrink-0"></span>
                          <span>Falso</span>
                          {question.correct_answers && question.correct_answers[0] === 'false' && (
                            <span className="text-green-600 font-medium">✓</span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Short Answer/Essay Preview */}
                    {(question.type === 'short_answer' || question.type === 'essay') && (
                      <div className="text-sm text-gray-600">
                        <div className="bg-gray-50 border border-gray-200 rounded p-2">
                          {question.type === 'short_answer' ? 'Respuesta corta...' : 'Respuesta extendida...'}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  {!readOnly && (
                    <div className="flex-shrink-0 ml-4">
                      <div className="flex space-x-2">
                        {onEdit && (
                          <button
                            onClick={() => onEdit(question, index)}
                            className="text-blue-600 hover:text-blue-800 p-1"
                            title="Editar pregunta"
                          >
                            ✏️
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(question.id || index)}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="Eliminar pregunta"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Add Question Button at Bottom */}
      {!readOnly && onAdd && questions.length > 0 && (
        <div className="text-center pt-4">
          <button
            onClick={onAdd}
            className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
          >
            ➕ Agregar Otra Pregunta
          </button>
        </div>
      )}
    </div>
  );
};

export default DraggableQuestionList;