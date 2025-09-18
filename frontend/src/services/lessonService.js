import { api, handleApiError } from './api';

export const lessonService = {
  // Get all lessons (optionally filtered by course)
  async getAllLessons(courseId = null) {
    try {
      const params = courseId ? { course: courseId } : {};
      const response = await api.get('/lessons/', { params });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get lesson by ID
  async getLessonById(lessonId) {
    try {
      const response = await api.get(`/lessons/${lessonId}/`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get lesson content (with access control)
  async getLessonContent(lessonId) {
    try {
      const response = await api.get(`/lessons/${lessonId}/content/`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Create new lesson (instructor only)
  async createLesson(lessonData) {
    try {
      const response = await api.post('/lessons/', lessonData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Update lesson (instructor only)
  async updateLesson(lessonId, lessonData) {
    try {
      const response = await api.patch(`/lessons/${lessonId}/`, lessonData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Delete lesson (instructor only)
  async deleteLesson(lessonId) {
    try {
      const response = await api.delete(`/lessons/${lessonId}/`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get lessons for a specific course that user is enrolled in
  async getMyCourseLessons(courseId) {
    try {
      const response = await api.get('/lessons/my_course_lessons/', {
        params: { course_id: courseId }
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Mark lesson as completed
  async markLessonCompleted(lessonId) {
    try {
      const response = await api.post(`/lessons/${lessonId}/complete/`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get lesson progress
  async getLessonProgress(lessonId) {
    try {
      const response = await api.get(`/lessons/${lessonId}/progress/`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Search lessons
  async searchLessons(query, filters = {}) {
    try {
      const params = { search: query, ...filters };
      const response = await api.get('/lessons/', { params });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
};