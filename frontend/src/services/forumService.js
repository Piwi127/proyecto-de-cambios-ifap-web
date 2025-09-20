import { api } from './api.js';

const forumService = {
  // Categorías
  getCategories: async (courseId = null) => {
    const params = courseId ? { course: courseId } : {};
    const response = await api.get('/forum/categories/', { params });
    return response.data;
  },

  createCategory: async (categoryData) => {
    const response = await api.post('/forum/categories/', categoryData);
    return response.data;
  },

  updateCategory: async (categoryId, categoryData) => {
    const response = await api.put(`/forum/categories/${categoryId}/`, categoryData);
    return response.data;
  },

  deleteCategory: async (categoryId) => {
    const response = await api.delete(`/forum/categories/${categoryId}/`);
    return response.data;
  },

  // Temas
  getTopics: async (categoryId = null, search = null) => {
    const params = {};
    if (categoryId) params.category = categoryId;
    if (search) params.search = search;
    
    const response = await api.get('/forum/topics/', { params });
    return response.data;
  },

  getTopic: async (topicId) => {
    const response = await api.get(`/forum/topics/${topicId}/`);
    return response.data;
  },

  createTopic: async (topicData) => {
    const response = await api.post('/forum/topics/', topicData);
    return response.data;
  },

  updateTopic: async (topicId, topicData) => {
    const response = await api.put(`/forum/topics/${topicId}/`, topicData);
    return response.data;
  },

  deleteTopic: async (topicId) => {
    const response = await api.delete(`/forum/topics/${topicId}/`);
    return response.data;
  },

  toggleTopicLike: async (topicId) => {
    const response = await api.post(`/forum/topics/${topicId}/toggle_like/`);
    return response.data;
  },

  toggleTopicPin: async (topicId) => {
    const response = await api.post(`/forum/topics/${topicId}/toggle_pin/`);
    return response.data;
  },

  toggleTopicLock: async (topicId) => {
    const response = await api.post(`/forum/topics/${topicId}/toggle_lock/`);
    return response.data;
  },

  // Respuestas
  getReplies: async (topicId) => {
    const response = await api.get('/forum/replies/', { 
      params: { topic: topicId } 
    });
    return response.data;
  },

  createReply: async (replyData) => {
    const response = await api.post('/forum/replies/', replyData);
    return response.data;
  },

  updateReply: async (replyId, replyData) => {
    const response = await api.put(`/forum/replies/${replyId}/`, replyData);
    return response.data;
  },

  deleteReply: async (replyId) => {
    const response = await api.delete(`/forum/replies/${replyId}/`);
    return response.data;
  },

  toggleReplyLike: async (replyId) => {
    const response = await api.post(`/forum/replies/${replyId}/toggle_like/`);
    return response.data;
  },

  // Estadísticas
  getForumStats: async () => {
    const response = await api.get('/forum/stats/overview/');
    return response.data;
  },

  getUserStats: async () => {
    const response = await api.get('/forum/stats/user_stats/');
    return response.data;
  }
};

export default forumService;