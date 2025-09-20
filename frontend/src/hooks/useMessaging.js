import { useState, useEffect, useCallback, useRef } from 'react';
import { messagingService, MessagingWebSocket } from '../services/messagingService.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useInfiniteScroll, useCache } from './useInfiniteScroll.js';

// Hook para gestionar conversaciones con cache
export const useConversations = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Cache para conversaciones (5 minutos)
  const [cachedConversations, setCachedConversations, clearCache] = useCache(
    'conversations',
    [],
    5 * 60 * 1000
  );

  const fetchConversations = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const data = await messagingService.getConversations();
      setConversations(data);
      setCachedConversations(data);
    } catch (err) {
      setError(err.message || 'Error al cargar conversaciones');
      // Si hay error, usar datos cacheados si existen
      if (cachedConversations.length > 0) {
        setConversations(cachedConversations);
      }
      console.error('Error fetching conversations:', err);
    } finally {
      setLoading(false);
    }
  }, [user, cachedConversations, setCachedConversations]);

  const createConversation = useCallback(async (conversationData) => {
    try {
      const newConversation = await messagingService.createConversation(conversationData);
      setConversations(prev => [newConversation, ...prev]);
      // Actualizar cache
      setCachedConversations(prev => [newConversation, ...prev]);
      return newConversation;
    } catch (err) {
      setError(err.message || 'Error al crear conversación');
      throw err;
    }
  }, [setCachedConversations]);

  // Cargar desde cache inicialmente
  useEffect(() => {
    if (cachedConversations.length > 0) {
      setConversations(cachedConversations);
    }
  }, []); // Solo una vez al montar

  // Cargar desde API
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return {
    conversations,
    loading,
    error,
    refetch: fetchConversations,
    createConversation,
    clearCache
  };
};

// Hook para gestionar mensajes de una conversación con paginación infinita
export const useConversationMessages = (conversationId) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const { user } = useAuth();

  // Cache para mensajes por conversación
  const cacheKey = `messages_${conversationId}`;
  const [cachedMessages, setCachedMessages] = useCache(cacheKey, [], 10 * 60 * 1000); // 10 minutos

  const fetchMessages = useCallback(async (pageNum = 1, append = false) => {
    if (!conversationId || !user) return;

    setLoading(true);
    setError(null);

    try {
      const params = { page: pageNum, page_size: 20 };
      const data = await messagingService.getConversationMessages(conversationId, params);

      if (append) {
        setMessages(prev => [...data.results, ...prev]);
      } else {
        setMessages(data.results || []);
      }

      setHasMore(data.next !== null);
      setPage(pageNum);

      // Actualizar cache solo para la página inicial
      if (pageNum === 1) {
        setCachedMessages(data.results || []);
      }
    } catch (err) {
      setError(err.message || 'Error al cargar mensajes');
      // Usar cache si existe
      if (!append && cachedMessages.length > 0) {
        setMessages(cachedMessages);
      }
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  }, [conversationId, user, cachedMessages, setCachedMessages]);

  const sendMessage = useCallback(async (messageData) => {
    try {
      const newMessage = await messagingService.sendMessage(messageData);
      setMessages(prev => [...prev, newMessage]);
      // Limpiar cache ya que hay nuevos mensajes
      setCachedMessages([]);
      return newMessage;
    } catch (err) {
      setError(err.message || 'Error al enviar mensaje');
      throw err;
    }
  }, [setCachedMessages]);

  const loadMore = useCallback(() => {
    if (hasMore && !loading) {
      fetchMessages(page + 1, true);
    }
  }, [hasMore, loading, page, fetchMessages]);

  // Cargar desde cache inicialmente
  useEffect(() => {
    if (conversationId && cachedMessages.length > 0) {
      setMessages(cachedMessages);
    }
  }, [conversationId, cachedMessages]);

  // Cargar desde API
  useEffect(() => {
    if (conversationId) {
      fetchMessages(1, false);
    }
  }, [conversationId, fetchMessages]);

  return {
    messages,
    loading,
    error,
    hasMore,
    loadMore,
    sendMessage,
    refetch: () => fetchMessages(1, false)
  };
};

// Hook para WebSocket de mensajería
export const useMessagingWebSocket = (conversationId) => {
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const wsRef = useRef(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!conversationId || !user) return;

    const token = localStorage.getItem('access_token');
    if (!token) return;

    wsRef.current = new MessagingWebSocket(conversationId, token);

    wsRef.current.on('connected', () => {
      setIsConnected(true);
    });

    wsRef.current.on('disconnected', () => {
      setIsConnected(false);
    });

    wsRef.current.on('message', (message) => {
      // El mensaje será manejado por el hook de mensajes
      console.log('Nuevo mensaje recibido:', message);
    });

    wsRef.current.on('typing', (user, action) => {
      setTypingUsers(prev => {
        const newSet = new Set(prev);
        if (action === 'start') {
          newSet.add(user.username);
        } else {
          newSet.delete(user.username);
        }
        return newSet;
      });
    });

    wsRef.current.connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.disconnect();
      }
    };
  }, [conversationId, user]);

  const sendMessage = useCallback((content, messageType = 'text', fileUrl = null, fileName = null, fileSize = null) => {
    if (wsRef.current) {
      wsRef.current.sendMessage(content, messageType, fileUrl, fileName, fileSize);
    }
  }, []);

  const startTyping = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.startTyping();
    }
  }, []);

  const stopTyping = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.stopTyping();
    }
  }, []);

  const addReaction = useCallback((messageId, reaction) => {
    if (wsRef.current) {
      wsRef.current.addReaction(messageId, reaction);
    }
  }, []);

  return {
    isConnected,
    typingUsers: Array.from(typingUsers),
    sendMessage,
    startTyping,
    stopTyping,
    addReaction
  };
};

// Hook para comentarios de lecciones
export const useLessonComments = (lessonId) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const { user } = useAuth();

  const fetchComments = useCallback(async (pageNum = 1, append = false) => {
    if (!lessonId || !user) return;

    setLoading(true);
    setError(null);

    try {
      const params = { page: pageNum, page_size: 10 };
      const data = await messagingService.getLessonComments(lessonId, params);

      if (append) {
        setComments(prev => [...data.results, ...prev]);
      } else {
        setComments(data.results || []);
      }

      setHasMore(data.next !== null);
      setPage(pageNum);
    } catch (err) {
      setError(err.message || 'Error al cargar comentarios');
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  }, [lessonId, user]);

  const createComment = useCallback(async (commentData) => {
    try {
      const newComment = await messagingService.createLessonComment(commentData);
      setComments(prev => [newComment, ...prev]);
      return newComment;
    } catch (err) {
      setError(err.message || 'Error al crear comentario');
      throw err;
    }
  }, []);

  const toggleLike = useCallback(async (commentId) => {
    try {
      const result = await messagingService.toggleCommentLike(commentId);
      setComments(prev =>
        prev.map(comment =>
          comment.id === commentId
            ? { ...comment, user_has_liked: result.liked, likes_count: result.likes_count }
            : comment
        )
      );
      return result;
    } catch (err) {
      setError(err.message || 'Error al dar like');
      throw err;
    }
  }, []);

  const loadMore = useCallback(() => {
    if (hasMore && !loading) {
      fetchComments(page + 1, true);
    }
  }, [hasMore, loading, page, fetchComments]);

  useEffect(() => {
    if (lessonId) {
      fetchComments(1, false);
    }
  }, [lessonId, fetchComments]);

  return {
    comments,
    loading,
    error,
    hasMore,
    loadMore,
    createComment,
    toggleLike,
    refetch: () => fetchComments(1, false)
  };
};

// Hook para WebSocket de comentarios
export const useLessonCommentsWebSocket = (lessonId) => {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!lessonId || !user) return;

    const token = localStorage.getItem('access_token');
    if (!token) return;

    wsRef.current = new messagingService.LessonCommentsWebSocket(lessonId, token);

    wsRef.current.on('connected', () => {
      setIsConnected(true);
    });

    wsRef.current.on('disconnected', () => {
      setIsConnected(false);
    });

    wsRef.current.on('comment', (comment) => {
      console.log('Nuevo comentario recibido:', comment);
    });

    wsRef.current.on('like', (commentId, user, liked) => {
      console.log('Like en comentario:', commentId, user, liked);
    });

    wsRef.current.connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.disconnect();
      }
    };
  }, [lessonId, user]);

  const sendComment = useCallback((content, parentCommentId = null) => {
    if (wsRef.current) {
      wsRef.current.sendComment(content, parentCommentId);
    }
  }, []);

  const sendLike = useCallback((commentId) => {
    if (wsRef.current) {
      wsRef.current.sendLike(commentId);
    }
  }, []);

  return {
    isConnected,
    sendComment,
    sendLike
  };
};