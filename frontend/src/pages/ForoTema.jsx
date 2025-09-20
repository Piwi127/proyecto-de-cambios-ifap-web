import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import forumService from '../services/forumService';
import { 
  ArrowLeft, 
  Heart, 
  MessageCircle, 
  Pin, 
  Lock, 
  Eye,
  Calendar,
  User,
  Send,
  Edit,
  Trash2,
  MoreVertical
} from 'lucide-react';

const ForoTema = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [topic, setTopic] = useState(null);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);

  useEffect(() => {
    loadTopicData();
  }, [topicId]);

  const loadTopicData = async () => {
    try {
      setLoading(true);
      const [topicData, repliesData] = await Promise.all([
        forumService.getTopic(topicId),
        forumService.getReplies(topicId)
      ]);
      setTopic(topicData);
      setReplies(repliesData.results || repliesData);
    } catch (error) {
      console.error('Error loading topic:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLikeTopic = async () => {
    try {
      const result = await forumService.toggleTopicLike(topicId);
      setTopic(prev => ({
        ...prev,
        likes_count: result.likes_count,
        user_has_liked: result.liked
      }));
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleSubmitReply = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    try {
      setSubmittingReply(true);
      await forumService.createReply({
        topic: topicId,
        content: replyContent
      });
      setReplyContent('');
      setShowReplyForm(false);
      loadTopicData(); // Recargar para mostrar la nueva respuesta
    } catch (error) {
      console.error('Error creating reply:', error);
      alert('Error al enviar la respuesta');
    } finally {
      setSubmittingReply(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Tema no encontrado</h2>
          <button
            onClick={() => navigate('/aula-virtual/foro')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Volver al Foro
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/aula-virtual/foro')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver al Foro
          </button>
        </div>

        {/* Topic */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="p-6">
            {/* Topic Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {topic.is_pinned && (
                    <Pin className="w-5 h-5 text-yellow-500" />
                  )}
                  {topic.is_locked && (
                    <Lock className="w-5 h-5 text-red-500" />
                  )}
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {topic.category_name}
                  </span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {topic.title}
                </h1>
              </div>
              
              {(user?.is_instructor || topic.author === user?.id) && (
                <div className="relative">
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            {/* Topic Meta */}
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {topic.author_name}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDate(topic.created_at)}
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {topic.views_count} vistas
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                {topic.replies_count} respuestas
              </div>
            </div>

            {/* Topic Content */}
            <div className="prose max-w-none mb-6">
              <div className="whitespace-pre-wrap text-gray-700">
                {topic.content}
              </div>
            </div>

            {/* Topic Actions */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleLikeTopic}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    topic.user_has_liked
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${topic.user_has_liked ? 'fill-current' : ''}`} />
                  {topic.likes_count}
                </button>
              </div>

              {!topic.is_locked && (
                <button
                  onClick={() => setShowReplyForm(!showReplyForm)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  Responder
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Reply Form */}
        {showReplyForm && !topic.is_locked && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Escribir Respuesta
            </h3>
            <form onSubmit={handleSubmitReply}>
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Escribe tu respuesta..."
                required
              />
              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowReplyForm(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submittingReply || !replyContent.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {submittingReply ? 'Enviando...' : 'Enviar Respuesta'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Replies */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Respuestas ({replies.length})
          </h2>

          {replies.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay respuestas aún
              </h3>
              <p className="text-gray-600 mb-4">
                Sé el primero en responder a este tema.
              </p>
              {!topic.is_locked && (
                <button
                  onClick={() => setShowReplyForm(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Escribir Primera Respuesta
                </button>
              )}
            </div>
          ) : (
            replies.map((reply) => (
              <div key={reply.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {reply.author_name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {reply.author_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(reply.created_at)}
                      </div>
                    </div>
                  </div>

                  {reply.author === user?.id && (
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-gray-400 hover:text-blue-600">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="prose max-w-none mb-4">
                  <div className="whitespace-pre-wrap text-gray-700">
                    {reply.content}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
                    <Heart className="w-4 h-4" />
                    {reply.likes_count || 0}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ForoTema;