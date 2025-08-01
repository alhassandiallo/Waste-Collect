/**
 * Service de gestion des utilisateurs pour la plateforme WasteCollect
 * Ce service gère toutes les opérations CRUD et les interactions avec l'API backend
 * pour les utilisateurs (Admin, Collecteur, Ménage, Municipalité)
 */

import axios from 'axios'; // Import axios

// Configuration de l'URL de base de l'API backend
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/backend/api/v1'; // Corrected path

/**
 * Classe utilitaire pour gérer les erreurs HTTP
 */
class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Utility for making HTTP requests with error handling.
 * Now uses axios directly, simplifying error handling and header management
 * due to the global axios interceptor set up in index.js.
 */
const apiRequest = async (url, options = {}) => {
  try {
    // Axios handles base URL and headers (including Authorization token) via its interceptor
    const response = await axios({
      url: url,
      method: options.method || 'GET',
      data: options.body ? JSON.parse(options.body) : undefined, // Axios uses 'data' for POST/PUT/PATCH
      params: options.params, // For GET requests, expects a plain object
      // Headers are managed by the Axios interceptor
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('API Error Response:', error.response.data);
      console.error('API Error Status:', error.response.status);
      console.error('API Error Headers:', error.response.headers);
      throw new ApiError(
        error.response.data.message || 'Erreur du serveur.',
        error.response.status,
        error.response.data
      );
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an http.ClientRequest in node.js
      console.error('API Error Request:', error.request);
      throw new ApiError('Aucune réponse reçue du serveur.', null, null);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error', error.message);
      throw new ApiError('Erreur lors de la configuration de la requête.', null, null);
    }
  }
};

const userService = {
  /**
   * Retrieves all users with optional filters and pagination.
   * @param {Object} options - Options object.
   * @param {Object} options.filters - Filters to apply (e.g., { role: 'MUNICIPAL_MANAGER' }).
   * @param {number} options.page - Page number (0-indexed).
   * @param {number} options.size - Number of items per page.
   * @returns {Promise<Object>} Paginated list of users.
   */
  async getAllUsers({ filters = {}, page = 0, size = 10 } = {}) {
    try {
      const params = {
        ...filters,
        page: page,
        size: size,
      };
      const response = await apiRequest('/users', { params });
      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      throw error;
    }
  },

  /**
   * Récupère les détails d'un utilisateur par son ID
   * @param {string} userId - L'ID de l'utilisateur
   * @returns {Promise<object>} Les détails de l'utilisateur
   */
  async getUserById(userId) {
    try {
      const response = await apiRequest(`/users/${userId}`);
      return response;
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'utilisateur ${userId}:`, error);
      throw error;
    }
  },

  /**
   * Crée un nouvel utilisateur.
   * @param {object} userData - Les données du nouvel utilisateur (e.g., nom, email, mot de passe).
   * @returns {Promise<object>} Le nouvel utilisateur créé.
   */
  async createUser(userData) {
    try {
      const response = await apiRequest('/users', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
      return response;
    } catch (error) {
      console.error('Erreur lors de la création de l\'utilisateur:', error);
      throw error;
    }
  },

  /**
   * Met à jour un utilisateur existant.
   * @param {string} userId - L'ID de l'utilisateur à mettre à jour.
   * @param {object} userData - Les données de l'utilisateur à mettre à jour.
   * @returns {Promise<object>} L'utilisateur mis à jour.
   */
  async updateUser(userId, userData) {
    try {
      const response = await apiRequest(`/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(userData),
      });
      return response;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de l'utilisateur ${userId}:`, error);
      throw error;
    }
  },

  /**
   * Supprime un utilisateur par son ID.
   * @param {string} userId - L'ID de l'utilisateur à supprimer.
   * @returns {Promise<void>}
   */
  async deleteUser(userId) {
    try {
      await apiRequest(`/users/${userId}`, {
        method: 'DELETE',
      });
      return { message: 'Utilisateur supprimé avec succès.' };
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'utilisateur ${userId}:`, error);
      throw error;
    }
  },

  /**
   * Mises à jour partielles du profil utilisateur
   * @param {string} userId - L'ID de l'utilisateur à mettre à jour
   * @param {object} updates - Un objet contenant les champs à mettre à jour
   * @returns {Promise<object>} Le profil utilisateur mis à jour
   */
  async patchUserProfile(userId, updates) {
    try {
      const response = await apiRequest(`/users/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
      return response; // apiRequest already returns response.data
    } catch (error) {
      console.error('Erreur lors de la mise à jour partielle du profil utilisateur:', error);
      throw error;
    }
  },

  /**
   * Récupère le profil du gérant municipal par l'ID de la municipalité.
   * Ceci est un exemple d'une fonction spécifique qui pourrait être nécessaire si le backend
   * expose un endpoint pour récupérer le gérant via la municipalité.
   * @param {number} municipalityId - L'ID de la municipalité.
   * @returns {Promise<Object>} Le profil du gérant municipal.
   */
  async getMunicipalManagerProfileByMunicipality(municipalityId) {
    try {
      const response = await apiRequest(`/municipal-managers/by-municipality/${municipalityId}`);
      return response;
    } catch (error) {
      console.error(`Erreur lors de la récupération du profil du gérant municipal pour la municipalité ${municipalityId}:`, error);
      throw error;
    }
  },

  /**
   * Mises à jour partielles du profil d'un gérant municipal
   * @param {string} managerId - L'ID du gérant municipal à mettre à jour
   * @param {object} updates - Un objet contenant les champs à mettre à jour
   * @returns {Promise<object>} Le profil du gérant municipal mis à jour
   */
  async patchMunicipalManagerProfile(managerId, updates) {
    try {
      const response = await apiRequest(`/municipal-managers/${managerId}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
      return response;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour partielle du profil du gérant municipal ${managerId}:`, error);
      throw error;
    }
  },

  /**
   * Retrieves all municipal managers with optional filters and pagination.
   * @param {Object} options - Options object.
   * @param {Object} options.filters - Filters to apply.
   * @param {number} options.page - Page number (0-indexed).
   * @param {number} options.size - Number of items per page.
   * @returns {Promise<Object>} Paginated list of municipal managers.
   */
  async getAllMunicipalManagers({ filters = {}, page = 0, size = 10 } = {}) {
    try {
      const params = {
        ...filters,
        page: page,
        size: size,
      };
      const response = await apiRequest('/municipal-managers', { params });
      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération des gérants municipaux:', error);
      throw error;
    }
  },
};

export default userService;
