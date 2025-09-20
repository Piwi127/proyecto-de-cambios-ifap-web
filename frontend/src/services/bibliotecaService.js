import { api, handleApiError } from './api';

export const bibliotecaAPI = {
  // Categorías
  async getCategories() {
    try {
      const response = await api.get('/library/categories/');
      return response;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async createCategory(categoryData) {
    try {
      const response = await api.post('/library/categories/', categoryData);
      return response;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async updateCategory(categoryId, categoryData) {
    try {
      const response = await api.put(`/library/categories/${categoryId}/`, categoryData);
      return response;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async deleteCategory(categoryId) {
    try {
      const response = await api.delete(`/library/categories/${categoryId}/`);
      return response;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Archivos
  async getFiles(params = {}) {
    try {
      const response = await api.get('/library/files/', { params });
      return response;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async getFileById(fileId) {
    try {
      const response = await api.get(`/library/files/${fileId}/`);
      return response;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async uploadFile(formData) {
    try {
      const response = await api.post('/library/files/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async updateFile(fileId, fileData) {
    try {
      const response = await api.put(`/library/files/${fileId}/`, fileData);
      return response;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async deleteFile(fileId) {
    try {
      const response = await api.delete(`/library/files/${fileId}/`);
      return response;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async downloadFile(fileId) {
    try {
      const response = await api.post(`/library/files/${fileId}/download/`);
      return response;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Favoritos
  async getFavorites() {
    try {
      const response = await api.get('/library/favorites/');
      return response;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async addFavorite(fileId) {
    try {
      const response = await api.post('/library/favorites/', { file: fileId });
      return response;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async removeFavorite(fileId) {
    try {
      // Buscar el favorito por file ID y eliminarlo
      const favorites = await this.getFavorites();
      const favorite = favorites.data.find(fav => fav.file === fileId);
      if (favorite) {
        const response = await api.delete(`/library/favorites/${favorite.id}/`);
        return response;
      }
      throw new Error('Favorito no encontrado');
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Accesos
  async getAccesses(params = {}) {
    try {
      const response = await api.get('/library/accesses/', { params });
      return response;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async createAccess(accessData) {
    try {
      const response = await api.post('/library/accesses/', accessData);
      return response;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async updateAccess(accessId, accessData) {
    try {
      const response = await api.put(`/library/accesses/${accessId}/`, accessData);
      return response;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async deleteAccess(accessId) {
    try {
      const response = await api.delete(`/library/accesses/${accessId}/`);
      return response;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Descargas
  async getDownloads(params = {}) {
    try {
      const response = await api.get('/library/downloads/', { params });
      return response;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Estadísticas
  async getStats() {
    try {
      const response = await api.get('/library/files/stats/');
      return response;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async getTopFiles() {
    try {
      const response = await api.get('/library/files/top_downloads/');
      return response;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async getRecentDownloads() {
    try {
      const response = await api.get('/library/downloads/recent/');
      return response;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Búsqueda
  async searchFiles(query, filters = {}) {
    try {
      const params = { search: query, ...filters };
      const response = await api.get('/library/files/', { params });
      return response;
    } catch (error) {
      throw handleApiError(error);
    }
  }
};

export default bibliotecaAPI;