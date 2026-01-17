import { api, handleApiError } from './api.js';

export const quizService = {
  // Get all quizzes (with optional filters)
  async getAllQuizzes(params = {}) {
    try {
      const response = await api.get('/quizzes/', { params });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get quiz by ID
  async getQuizById(quizId) {
    try {
      const response = await api.get(`/quizzes/${quizId}/`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Create new quiz (instructor only)
  async createQuiz(quizData) {
    try {
      const response = await api.post('/quizzes/', quizData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Update quiz (instructor only)
  async updateQuiz(quizId, quizData) {
    try {
      const response = await api.patch(`/quizzes/${quizId}/`, quizData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Delete quiz (instructor only)
  async deleteQuiz(quizId) {
    try {
      const response = await api.delete(`/quizzes/${quizId}/`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get quiz questions
  async getQuizQuestions(quizId) {
    try {
      const response = await api.get(`/quizzes/${quizId}/questions/`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Create question (instructor only)
  async createQuestion(questionData) {
    try {
      const response = await api.post('/quizzes/questions/', questionData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Update question (instructor only)
  async updateQuestion(questionId, questionData) {
    try {
      const response = await api.patch(`/quizzes/questions/${questionId}/`, questionData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Delete question (instructor only)
  async deleteQuestion(questionId) {
    try {
      const response = await api.delete(`/quizzes/questions/${questionId}/`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Start a new quiz attempt
  async startQuizAttempt(quizId) {
    try {
      const response = await api.post(`/quizzes/${quizId}/start_attempt/`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Submit quiz answers
  async submitQuiz(quizId, answers) {
    try {
      const response = await api.post(`/quizzes/${quizId}/submit/`, {
        answers: answers
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get user's quiz attempts
  async getMyAttempts() {
    try {
      const response = await api.get('/quizzes/my_attempts/');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get quiz results
  async getQuizResults(quizId) {
    try {
      const response = await api.get(`/quizzes/${quizId}/results/`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get attempt details with answers
  async getAttemptDetails(attemptId) {
    try {
      const response = await api.get(`/attempts/${attemptId}/answers/`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get user statistics
  async getUserStats() {
    try {
      const response = await api.get('/stats/user_stats/');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Search quizzes
  async searchQuizzes(query, filters = {}) {
    try {
      const params = { search: query, ...filters };
      const response = await api.get('/quizzes/', { params });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get quizzes by course
  async getQuizzesByCourse(courseId) {
    try {
      const response = await api.get('/quizzes/', { params: { course: courseId } });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get quizzes by lesson
  async getQuizzesByLesson(lessonId) {
    try {
      const response = await api.get('/quizzes/', { params: { lesson: lessonId } });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Update question order (drag & drop)
  async updateQuestionOrder(quizId, questionOrders) {
    try {
      const response = await api.patch(`/quizzes/${quizId}/update_question_order/`, {
        question_orders: questionOrders
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get quiz templates
  async getQuizTemplates(params = {}) {
    try {
      const response = await api.get('/quizzes/templates/', { params });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Create quiz from template
  async createQuizFromTemplate(templateId, customizations = {}) {
    try {
      const response = await api.post(`/quizzes/templates/${templateId}/create/`, customizations);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Save quiz as template
  async saveQuizAsTemplate(quizId, templateData) {
    try {
      const response = await api.post(`/quizzes/${quizId}/save_as_template/`, templateData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Import quiz from file
  async importQuiz(importData) {
    try {
      const response = await api.post('/quizzes/import/', importData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Export quiz to file
  async exportQuiz(quizId, format = 'json') {
    try {
      const response = await api.get(`/quizzes/${quizId}/export/`, {
        params: { format },
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Bulk export quizzes
  async bulkExportQuizzes(quizIds, format = 'json') {
    try {
      const response = await api.post('/quizzes/bulk_export/', {
        quiz_ids: quizIds,
        format: format
      }, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Validate import data
  async validateImportData(importData) {
    try {
      const response = await api.post('/quizzes/validate_import/', importData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get quiz statistics
  async getQuizStatistics(quizId) {
    try {
      const response = await api.get(`/quizzes/${quizId}/statistics/`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get global quiz statistics
  async getGlobalStatistics() {
    try {
      const response = await api.get('/quizzes/global_statistics/');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Duplicate quiz
  async duplicateQuiz(quizId, newTitle = null) {
    try {
      const response = await api.post(`/quizzes/${quizId}/duplicate/`, {
        title: newTitle
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Archive quiz
  async archiveQuiz(quizId) {
    try {
      const response = await api.patch(`/quizzes/${quizId}/archive/`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Unarchive quiz
  async unarchiveQuiz(quizId) {
    try {
      const response = await api.patch(`/quizzes/${quizId}/unarchive/`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get archived quizzes
  async getArchivedQuizzes() {
    try {
      const response = await api.get('/quizzes/archived/');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
};
