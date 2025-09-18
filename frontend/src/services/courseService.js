import { api, handleApiError } from './api';

export const courseService = {
  // Get all courses
  async getAllCourses(params = {}) {
    try {
      const response = await api.get('/courses/', { params });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get course by ID
  async getCourseById(courseId) {
    try {
      const response = await api.get(`/courses/${courseId}/`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Create new course (instructor only)
  async createCourse(courseData) {
    try {
      const response = await api.post('/courses/', courseData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Update course (instructor only)
  async updateCourse(courseId, courseData) {
    try {
      const response = await api.patch(`/courses/${courseId}/`, courseData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Delete course (instructor only)
  async deleteCourse(courseId) {
    try {
      const response = await api.delete(`/courses/${courseId}/`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Enroll in course
  async enrollInCourse(courseId) {
    try {
      const response = await api.post(`/courses/${courseId}/enroll/`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Unenroll from course
  async unenrollFromCourse(courseId) {
    try {
      const response = await api.post(`/courses/${courseId}/unenroll/`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get user's enrolled courses
  async getMyCourses() {
    try {
      const response = await api.get('/courses/my_courses/');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get courses taught by instructor
  async getTaughtCourses() {
    try {
      const response = await api.get('/courses/taught_courses/');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Search courses
  async searchCourses(query, filters = {}) {
    try {
      const params = { search: query, ...filters };
      const response = await api.get('/courses/', { params });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
};