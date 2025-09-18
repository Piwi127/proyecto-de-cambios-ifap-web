import { api, handleApiError } from './api';

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
  }
};