// File: frontend/src/services/adminService.js
// adminService.js - Service pour la gestion des administrateurs
// Gère les collecteurs, ménages, municipalités, rapports et analyses

import authService from './authService';
import axios from 'axios'; // Import axios for consistency with other services

// Corrected API base URL to directly use the backend endpoint
const API_BASE_URL = 'http://localhost:8080/backend/api/v1'; 

/**
 * Service pour la gestion des fonctionnalités administratives
 */
class AdminService {

  /**
   * Création des headers avec authentification pour les requêtes API
   * @returns {Object} - Headers avec token d'authentification
   */
  getAuthHeaders() {
    const token = authService.getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  // ==================== GENERAL USER MANAGEMENT (NEW) ====================
  /**
   * Retrieves all users with optional filters and pagination, accessible by ADMIN.
   * This endpoint is typically used by the admin dashboard for listing and managing users of various roles.
   * @param {Object} filters - Filters object (e.g., { role: 'MUNICIPAL_MANAGER', search: 'John Doe' }).
   * @param {number} page - Page number (0-indexed for backend).
   * @param {number} size - Number of items per page.
   * @returns {Promise<Object>} - Paginated list of users.
   * Backend Endpoint: GET /api/v1/admin/users?role=...&page=...&size=...
   */
  async getAllUsers(filters = {}, page = 0, size = 10) {
    try {
      const params = {
        page: page,
        size: size,
      };
      // Explicitly add filters to params
      for (const key in filters) {
        if (Object.hasOwnProperty.call(filters, key) && filters[key] !== undefined) {
          params[key] = filters[key];
        }
      }
      
      const response = await axios.get(`${API_BASE_URL}/admin/users`, {
        params: params,
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      throw error.response?.data?.message || error.message || 'Erreur lors de la récupération des utilisateurs.';
    }
  }

  // ==================== ADMIN PROFILE MANAGEMENT ====================

  /**
   * Récupère le profil d'un administrateur par ID.
   * @param {string} id - L'ID de l'administrateur.
   * @returns {Promise<Object>} - Détails du profil administrateur.
   */
  async getAdminProfile(id) {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/profile/${id}`, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération du profil admin ${id}:`, error);
      throw error.response?.data?.message || error.message || `Erreur lors de la récupération du profil admin ${id}.`;
    }
  }

  /**
   * Met à jour le profil d'un administrateur.
   * @param {string} id - L'ID de l'administrateur à mettre à jour.
   * @param {Object} adminData - Données du profil administrateur à mettre à jour (AdminUpdateDTO).
   * @returns {Promise<Object>} - Le profil administrateur mis à jour.
   */
  async updateAdminProfile(id, adminData) {
    try {
      const response = await axios.put(`${API_BASE_URL}/admin/profile/${id}`, adminData, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du profil admin ${id}:`, error);
      throw error.response?.data?.message || error.message || `Erreur lors de la mise à jour du profil admin ${id}.`;
    }
  }

  /**
   * Supprime un administrateur par ID.
   * @param {string} id - L'ID de l'administrateur à supprimer.
   * @returns {Promise<Object>} - Réponse de l'API.
   */
  async deleteAdmin(id) {
    try {
      const response = await axios.delete(`${API_BASE_URL}/admin/profile/${id}`, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'administrateur ${id}:`, error);
      throw error.response?.data?.message || error.message || `Erreur lors de la suppression de l'administrateur ${id}.`;
    }
  }

  // ==================== GESTION DES COLLECTEURS ====================

  /**
   * Récupération de la liste de tous les collecteurs
   * @param {Object} filters - Filtres de recherche (statut, zone, etc.)
   * @param {number} page - Numéro de page pour la pagination (0-indexed pour le backend)
   * @param {number} limit - Nombre d'éléments par page
   * @returns {Promise<Object>} - Liste des collecteurs avec pagination et totalItems
   */
  async getAllCollectors(filters = {}, page = 0, limit = 10) { 
    try {
      const params = { 
        page: page,
        size: limit, 
      };
      // Explicitly add filters to params
      for (const key in filters) {
        if (Object.hasOwnProperty.call(filters, key) && filters[key] !== undefined) {
          params[key] = filters[key];
        }
      }
      
      const response = await axios.get(`${API_BASE_URL}/admin/collectors`, { 
        params: params, 
        headers: this.getAuthHeaders(),
      });
      return response.data; 
    } catch (error) {
      console.error('Erreur lors de la récupération des collecteurs:', error);
      throw error.response?.data?.message || error.message || 'Erreur lors de la récupération des collecteurs.';
    }
  }


  /**
   * Création d'un nouveau collecteur
   * @param {Object} collectorData - Données du collecteur à créer
   * @returns {Promise<Object>} - Réponse de l'API
   */
  async createCollector(collectorData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/admin/collectors`, collectorData, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création du collecteur:', error);
      throw error.response?.data?.message || error.message || 'Erreur lors de la création du collecteur.';
    }
  }

  /**
   * Récupération des détails d'un collecteur par ID
   * @param {string} id - L'ID du collecteur
   * @returns {Promise<Object>} - Détails du collecteur
   */
  async getCollectorById(id) {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/collectors/${id}`, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération du collecteur ${id}:`, error);
      throw error.response?.data?.message || error.message || `Erreur lors de la récupération du collecteur ${id}.`;
    }
  }

  /**
   * Mise à jour d'un collecteur existant
   * @param {string} id - L'ID du collecteur à mettre à jour
   * @param {Object} collectorData - Données du collecteur à mettre à jour
   * @returns {Promise<Object>} - Réponse de l'API
   */
  async updateCollector(id, collectorData) {
    try {
      const response = await axios.put(`${API_BASE_URL}/admin/collectors/${id}`, collectorData, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du collecteur ${id}:`, error);
      throw error.response?.data?.message || error.message || `Erreur lors de la mise à jour du collecteur ${id}.`;
    }
  }

  /**
   * Suppression d'un collecteur par ID
   * @param {string} id - L'ID du collecteur à supprimer
   * @returns {Promise<Object>} - Réponse de l'API
   */
  async deleteCollector(id) {
    try {
      const response = await axios.delete(`${API_BASE_URL}/admin/collectors/${id}`, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la suppression du collecteur ${id}:`, error);
      throw error.response?.data?.message || error.message || `Erreur lors de la suppression du collecteur ${id}.`;
    }
  }

  /**
   * Toggles the status of a collector (e.g., active/inactive).
   * @param {string} id - The ID of the collector.
   * @param {boolean} isActive - The new active status.
   * @returns {Promise<Object>} - API response.
   */
  async toggleCollectorStatus(id, isActive) {
    try {
      const response = await axios.patch(`${API_BASE_URL}/admin/collectors/${id}/status`, { isActive }, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error(`Erreur lors du changement de statut du collecteur ${id}:`, error);
      throw error.response?.data?.message || error.message || `Erreur lors du changement de statut du collecteur ${id}.`;
    }
  }

  // ==================== GESTION DES MÉNAGES ====================

  /**
   * Récupération de la liste de tous les ménages
   * @param {Object} filters - Filtres de recherche (municipalité, statut, etc.)
   * @param {number} page - Numéro de page pour la pagination
   * @param {number} limit - Nombre d'éléments par page
   * @returns {Promise<Object>} - Liste des ménages avec pagination
   */
  async getAllHouseholds(filters = {}, page = 0, limit = 10) {
    try {
      const params = { 
        page: page,
        size: limit, 
      };
      // Explicitly add filters to params
      for (const key in filters) {
        if (Object.hasOwnProperty.call(filters, key) && filters[key] !== undefined) {
          params[key] = filters[key];
        }
      }

      const response = await axios.get(`${API_BASE_URL}/admin/households`, { 
        params: params, 
        headers: this.getAuthHeaders(),
      });
      return response.data; 
    } catch (error) {
      console.error('Erreur lors de la récupération des ménages:', error);
      throw error.response?.data?.message || error.message || 'Erreur lors de la récupération des ménages.';
    }
  }

  /**
   * Création d'un nouveau ménage
   * @param {Object} householdData - Données du ménage à créer
   * @returns {Promise<Object>} - Réponse de l'API
   */
  async createHousehold(householdData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/admin/households`, householdData, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création du ménage:', error);
      throw error.response?.data?.message || error.message || 'Erreur lors de la création du ménage.';
    }
  }

  /**
   * Récupération des détails d'un ménage par ID
   * @param {string} id - L'ID du ménage
   * @returns {Promise<Object>} - Détails du ménage
   */
  async getHouseholdById(id) {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/households/${id}`, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération du ménage ${id}:`, error);
      throw error.response?.data?.message || error.message || `Erreur lors de la récupération du ménage ${id}.`;
    }
  }

  /**
   * Mise à jour d'un ménage existant
   * @param {string} id - L'ID du ménage à mettre à jour
   * @param {Object} householdData - Données du ménage à mettre à jour
   * @returns {Promise<Object>} - Réponse de l'API
   */
  async updateHousehold(id, householdData) {
    try {
      const response = await axios.put(`${API_BASE_URL}/admin/households/${id}`, householdData, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du ménage ${id}:`, error);
      throw error.response?.data?.message || error.message || 'Erreur lors de la mise à jour du ménage.';
    }
  }

  /**
   * Suppression d'un ménage par ID
   * @param {string} id - L'ID du ménage à supprimer
   * @returns {Promise<Object>} - Réponse de l'API
   */
  async deleteHousehold(id) {
    try {
      const response = await axios.delete(`${API_BASE_URL}/admin/households/${id}`, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la suppression du ménage ${id}:`, error);
      throw error.response?.data?.message || error.message || `Erreur lors de la suppression du ménage ${id}.`;
    }
  }

  // ==================== GESTION DES MUNICIPALITÉS ====================

  /**
   * Récupération de la liste de toutes les municipalités
   * @param {Object} filters - Filtres de recherche (nom, province, etc.)
   * @param {number} page - Numéro de page pour la pagination
   * @param {number} limit - Nombre d'éléments par page
   * @returns {Promise<Object>} - Liste des municipalités avec pagination
   */
  async getAllMunicipalities(filters = {}, page = 0, limit = 10) {
    try {
      const params = { 
        page: page,
        size: limit,
      };
      // Explicitly add filters to params
      for (const key in filters) {
        if (Object.hasOwnProperty.call(filters, key) && filters[key] !== undefined) {
          params[key] = filters[key];
        }
      }

      const response = await axios.get(`${API_BASE_URL}/admin/municipalities`, { 
        params: params, 
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des municipalités:', error);
      throw error.response?.data?.message || error.message || 'Erreur lors de la récupération des municipalités.';
    }
  }
  
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
      const response = await axios.get(`${API_BASE_URL}/municipal-managers`, { params, headers: this.getAuthHeaders() }); // Assuming this endpoint is under root /api/v1 or handled by general user service
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des gérants municipaux:', error);
      throw error.response?.data?.message || error.message || 'Erreur lors de la récupération des gérants municipaux.';
    }
  }


  /**
   * Création d'une nouvelle municipalité
   * @param {Object} municipalityData - Données de la municipalité à créer
   * @returns {Promise<Object>} - Réponse de l'API
   */
  async createMunicipality(municipalityData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/admin/municipalities`, municipalityData, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création de la municipalité:', error);
      throw error.response?.data?.message || error.message || 'Erreur lors de la création de la municipalité.';
    }
  }

  /**
   * Récupération des détails d'une municipalité par ID
   * @param {string} id - L'ID de la municipalité
   * @returns {Promise<Object>} - Détails de la municipalité
   */
  async getMunicipalityById(id) {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/municipalities/${id}`, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération de la municipalité ${id}:`, error);
      throw error.response?.data?.message || error.message || `Erreur lors de la récupération de la municipalité ${id}.`;
    }
  }

  /**
   * Mise à jour d'une municipalité existante
   * @param {string} id - L'ID de la municipalité à mettre à jour
   * @param {Object} municipalityData - Données de la municipalité à mettre à jour
   * @returns {Promise<Object>} - Réponse de l'API
   */
  async updateMunicipality(id, municipalityData) {
    try {
      const response = await axios.put(`${API_BASE_URL}/admin/municipalities/${id}`, municipalityData, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de la municipalité ${id}:`, error);
      throw error.response?.data?.message || error.message || 'Erreur lors de la mise à jour de la municipalité.';
    }
  }

  /**
   * Suppression d'une municipalité par ID
   * @param {string} id - L'ID de la municipalité à supprimer
   * @returns {Promise<Object>} - Réponse de l'API
   */
  async deleteMunicipality(id) {
    try {
      const response = await axios.delete(`${API_BASE_URL}/admin/municipalities/${id}`, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la suppression de la municipalité ${id}:`, error);
      throw error.response?.data?.message || error.message || `Erreur lors de la suppression de la municipalité ${id}.`;
    }
  }

  // ==================== GESTION DES RAPPORTS ====================

  /**
   * Génère un rapport
   * @param {Object} reportConfig - Configuration du rapport (type, période, format)
   * @returns {Promise<Object>} - Confirmation de génération
   */
  async generateReport(reportConfig) {
    try {
      const response = await axios.post(`${API_BASE_URL}/admin/reports/generate`, reportConfig, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la génération du rapport:', error);
      throw error.response?.data?.message || error.message || 'Erreur lors de la génération du rapport.';
    }
  }

  /**
   * Récupère la liste des rapports générés avec filtres et pagination.
   * @param {Object} filters - Filtres de recherche (type, statut, recherche par titre).
   * @param {number} page - Numéro de page pour la pagination (0-indexed pour le backend).
   * @param {number} size - Nombre d'éléments par page.
   * @returns {Promise<Object>} - Liste des rapports avec pagination.
   */
  async getGeneratedReports(filters = {}, page = 0, size = 10) {
    try {
      const params = { 
        ...filters, // Include type, status, search directly
        page: page,
        size: size, 
      };
      
      const response = await axios.get(`${API_BASE_URL}/admin/reports`, { 
        params: params, 
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des rapports:', error);
      throw error.response?.data?.message || error.message || 'Erreur lors de la récupération des rapports.';
    }
  }

  /**
   * Télécharge un rapport spécifique
   * @param {string} id - L'ID du rapport à télécharger
   * @returns {Promise<Blob>} - Le contenu binaire du fichier
   */
  async downloadReport(id) {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/reports/${id}/download`, {
        responseType: 'blob', // Important: pour recevoir le fichier binaire
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error(`Erreur lors du téléchargement du rapport ${id}:`, error);
      throw error.response?.data?.message || error.message || `Erreur lors du téléchargement du rapport ${id}.`;
    }
  }

  // ==================== DASHBOARD & ANALYTICS ====================

  /**
   * Récupère les statistiques globales pour le tableau de bord admin.
   * @param {string} period - Période pour les statistiques (ex: 'week', 'month', 'year')
   * @returns {Promise<Object>} - Données statistiques
   */
  async getGlobalStatistics(period = 'week') {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/statistics/global`, {
        params: { period },
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques globales:', error);
      throw error.response?.data?.message || error.message || 'Erreur lors de la récupération des statistiques globales.';
    }
  }

  /**
   * Récupère les activités récentes pour le tableau de bord admin.
   * @returns {Promise<Array>} - Liste des activités récentes
   */
  async getRecentActivities() {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/activities/recent`, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des activités récentes:', error);
      throw error.response?.data?.message || error.message || 'Erreur lors de la récupération des activités récentes.';
    }
  }

  /**
   * Récupère les métriques de performance pour le tableau de bord admin.
   * @param {string} period - Période pour les métriques (ex: 'week', 'month', 'year')
   * @returns {Promise<Object>} - Métriques de performance
   */
  async getPerformanceMetrics(period = 'week') {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/metrics/performance`, {
        params: { period },
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des métriques de performance:', error);
      throw error.response?.data?.message || error.message || 'Erreur lors de la récupération des métriques de performance.';
    }
  }

  /**
   * Récupère les alertes système pour le tableau de bord admin.
   * @returns {Promise<Array>} - Liste des alertes système
   */
  async getSystemAlerts() {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/alerts/system`, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des alertes système:', error);
      throw error.response?.data?.message || error.message || 'Erreur lors de la récupération des alertes système.';
    }
  }

  /**
   * Récupère les données de collecte de déchets pour l'analyse globale.
   * @param {string} startDate - Date de début (ISO 8601 string)
   * @param {string} endDate - Date de fin (ISO 8601 string)
   * @returns {Promise<Object>} - Données de collecte de déchets
   */
  async getGlobalWasteCollectionData(startDate, endDate) {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/dashboard/waste-collection-data`, {
        params: { startDate, endDate },
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des données de collecte de déchets:', error);
      throw error.response?.data?.message || error.message || 'Erreur lors de la récupération des données de collecte de déchets.';
    }
  }

  /**
   * Réalise une analyse globale des métriques.
   * @param {string} startDate - Date de début (ISO 8601 string)
   * @param {string} endDate - Date de fin (ISO 8601 string)
   * @returns {Promise<Object>} - Résultats de l'analyse des métriques
   */
  async getGlobalMetricsAnalysis(startDate, endDate) {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/dashboard/metrics-analysis`, {
        params: { startDate, endDate },
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de l\'analyse globale des métriques:', error);
      throw error.response?.data?.message || error.message || 'Erreur lors de l\'analyse globale des métriques.';
    }
  }

  /**
   * Récupère le nombre total de zones mal desservies.
   * @returns {Promise<number>} - Nombre de zones mal desservies
   */
  async getGlobalUnderservedAreasCount() {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/dashboard/underserved-areas-count`, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération du nombre de zones mal desservies:', error);
      throw error.response?.data?.message || error.message || 'Erreur lors de la récupération du nombre de zones mal desservies.';
    }
  }

  /**
   * Sends a notification from the admin to specific users or roles.
   * @param {Object} notificationData - Object containing subject, message, notificationType, targetAudience, targetRole (optional), targetUserIds (optional)
   * @returns {Promise<string>} - Success message
   */
  async sendNotification(notificationData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/admin/notifications/send`, notificationData, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la notification:', error);
      throw error.response?.data?.message || error.message || 'Erreur lors de l\'envoi de la notification.';
    }
  }

}

// Export a singleton instance of the AdminService
export default new AdminService();
