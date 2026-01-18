import React, { useState, useRef, useEffect } from 'react';
import { useLessonComments, useLessonCommentsWebSocket } from '../hooks/useMessaging.js';
import { useAuth } from '../context/AuthContext.jsx';

const CommentItem = ({ comment, onReply, onLike, onLoadReplies, showReplies = false }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');

  const handleReply = async () => {
    if (!replyContent.trim()) return;

    try {
      await onReply(comment.id, replyContent);
      setReplyContent('');
      setShowReplyForm(false);
    } catch (error) {
      console.error('Error replying to comment:', error);
    }
  };

  const handleLike = async () => {
    try {
      await onLike(comment.id);
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return 'Ahora';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min`;
    if (diff < 86400000) return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
  };

  return (
    <div className={`border-l-2 ${comment.is_reply ? 'border-gray-300 ml-6' : 'border-primary-300'} pl-4 py-3`}>
      <div className="flex items-start space-x-3">
        {/* Avatar */}
        <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-white text-sm font-semibold">
            {comment.author.first_name.charAt(0).toUpperCase()}
          </span>
        </div>

        {/* Contenido del comentario */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-sm font-medium text-gray-900">
              {comment.author.first_name} {comment.author.last_name}
            </span>
            <span className="text-xs text-gray-500">
              {formatTime(comment.created_at)}
            </span>
          </div>

          <p className="text-sm text-gray-700 mb-2 whitespace-pre-wrap">
            {comment.content}
          </p>

          {/* Acciones */}
          <div className="flex items-center space-x-4 text-xs">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-1 px-2 py-1 rounded transition-colors ${
                comment.user_has_liked
                  ? 'text-red-600 bg-red-50'
                  : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
              }`}
            >
              <span>👍</span>
              <span>{comment.likes_count}</span>
            </button>

            {!comment.is_reply && (
              <button
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="text-gray-600 hover:text-primary-600 px-2 py-1 rounded transition-colors"
              >
                Responder
              </button>
            )}

            {comment.replies && comment.replies.length > 0 && !showReplies && (
              <button
                onClick={() => onLoadReplies(comment.id)}
                className="text-primary-600 hover:text-primary-700 px-2 py-1 rounded transition-colors"
              >
                Ver {comment.replies.length} respuesta{comment.replies.length !== 1 ? 's' : ''}
              </button>
            )}
          </div>

          {/* Formulario de respuesta */}
          {showReplyForm && (
            <div className="mt-3">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Escribe tu respuesta..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              />
              <div className="flex space-x-2 mt-2">
                <button
                  onClick={handleReply}
                  disabled={!replyContent.trim()}
                  className="px-3 py-1 bg-primary-600 text-white text-sm rounded hover:bg-primary-700 disabled:opacity-50"
                >
                  Responder
                </button>
                <button
                  onClick={() => {
                    setShowReplyForm(false);
                    setReplyContent('');
                  }}
                  className="px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Respuestas */}
          {showReplies && comment.replies && comment.replies.length > 0 && (
            <div className="mt-3 space-y-3">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  onReply={onReply}
                  onLike={onLike}
                  onLoadReplies={onLoadReplies}
                  showReplies={true}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CommentForm = ({ onSubmit, loading, placeholder = "Escribe un comentario..." }) => {
  const [content, setContent] = useState('');
  const textareaRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      await onSubmit(content);
      setContent('');
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [content]);

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="flex space-x-3">
        <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-white font-semibold">U</span>
        </div>
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            style={{ minHeight: '80px' }}
          />
          <div className="flex justify-end mt-2">
            <button
              type="submit"
              disabled={!content.trim() || loading}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              {loading ? 'Publicando...' : 'Publicar Comentario'}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

const LessonComments = ({ lessonId }) => {
  const [loadedReplies, setLoadedReplies] = useState(new Set());
  const { user } = useAuth();

  const {
    comments,
    loading,
    error,
    hasMore,
    loadMore,
    createComment,
    toggleLike
  } = useLessonComments(lessonId);

  const { isConnected } = useLessonCommentsWebSocket(lessonId);

  const handleCreateComment = async (content) => {
    await createComment({
      lesson: lessonId,
      content
    });
  };

  const handleReply = async (parentCommentId, content) => {
    await createComment({
      lesson: lessonId,
      content,
      parent_comment: parentCommentId
    });
  };

  const handleLike = async (commentId) => {
    await toggleLike(commentId);
  };

  const handleLoadReplies = (commentId) => {
    setLoadedReplies(prev => new Set([...prev, commentId]));
  };

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Debes iniciar sesión para ver los comentarios</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Comentarios ({comments.length})
          </h3>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-xs text-gray-600">
              {isConnected ? 'Conectado' : 'Desconectado'}
            </span>
          </div>
        </div>
      </div>

      {/* Formulario para nuevo comentario */}
      <div className="p-4">
        <CommentForm
          onSubmit={handleCreateComment}
          loading={loading}
        />
      </div>

      {/* Lista de comentarios */}
      <div className="px-4 pb-4">
        {loading && comments.length === 0 && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando comentarios...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <div className="text-red-500 mb-2">
              <span className="text-4xl">⚠️</span>
            </div>
            <p className="text-sm text-gray-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 px-3 py-1 bg-primary-600 text-white text-sm rounded hover:bg-primary-700"
            >
              Reintentar
            </button>
          </div>
        )}

        {!loading && !error && comments.length === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-4">
              <span className="text-4xl">💬</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Sin comentarios aún</h3>
            <p className="text-gray-600">Sé el primero en comentar en esta lección</p>
          </div>
        )}

        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onReply={handleReply}
              onLike={handleLike}
              onLoadReplies={handleLoadReplies}
              showReplies={loadedReplies.has(comment.id)}
            />
          ))}
        </div>

        {/* Botón para cargar más */}
        {hasMore && !loading && (
          <div className="text-center mt-6">
            <button
              onClick={loadMore}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cargar más comentarios
            </button>
          </div>
        )}

        {loading && comments.length > 0 && (
          <div className="text-center mt-6">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonComments;
