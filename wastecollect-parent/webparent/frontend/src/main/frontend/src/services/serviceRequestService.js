/**
 * Service pour la gestion des demandes de service
 * Gère la planification des ramassages, les demandes en temps réel
 * et l'interaction entre ménages et collecteurs
 * * Fonctionnalités principales:
 * - Création et gestion des demandes de ramassage
 * - Visualisation en temps réel pour les collecteurs (now handled by collectorService)
 * - Acceptation et traitement des demandes (now handled by collectorService)
 * - Suivi du statut des demandes
 */

// URL de base de l'API backend
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

/**
 * Classe de service pour les demandes de service
 */
class ServiceRequestService {
  
  /**
   * Récupère le token d'authentification depuis le localStorage
   * @returns {string} Token JWT
   */
  getAuthToken() {
    return localStorage.getItem('authToken');
  }

  /**
   * Configuration des headers par défaut pour les requêtes
   * @returns {Object} Headers avec token d'authentification
   */
  getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.getAuthToken()}`
    };
  }

  /**
   * Crée une nouvelle demande de service (Ménage)
   * @param {Object} requestData - Données de la demande
   * @returns {Promise<Object>} Demande créée
   */
  async createServiceRequest(requestData) {
    try {
      const response = await fetch(`${API_BASE_URL}/service-requests`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error(`Erreur lors de la création de la demande: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erreur lors de la création de la demande de service:', error);
      throw error;
    }
  }

  /**
   * Récupère toutes les demandes de service avec filtres
   * @param {Object} filters - Filtres à appliquer
   * @returns {Promise<Array>} Liste des demandes
   */
  async getAllServiceRequests(filters = {}) {
    try {
      // Construction des paramètres de requête
      const queryParams = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== undefined) {
          queryParams.append(key, filters[key]);
        }
      });

      const url = `${API_BASE_URL}/service-requests${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Erreur lors de la récupération des demandes: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération des demandes de service:', error);
      throw error;
    }
  }

  /**
   * Récupère une demande de service par son ID
   * @param {number} requestId - ID de la demande
   * @returns {Promise<Object>} Données de la demande
   */
  async getServiceRequestById(requestId) {
    try {
      const response = await fetch(`${API_BASE_URL}/service-requests/${requestId}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Demande non trouvée: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération de la demande:', error);
      throw error;
    }
  }

  /**
   * Met à jour le statut d'une demande de service
   * @param {number} requestId - ID de la demande
   * @param {string} status - Nouveau statut
   * @param {string} notes - Notes optionnelles
   * @returns {Promise<Object>} Demande mise à jour
   */
  async updateServiceRequestStatus(requestId, status, notes = '') {
    try {
      const response = await fetch(`${API_BASE_URL}/service-requests/${requestId}/status`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify({ status, notes })
      });

      if (!response.ok) {
        throw new Error(`Erreur lors de la mise à jour du statut: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      throw error;
    }
  }

  /**
   * Assigne un collecteur à une demande de service
   * @param {number} requestId - ID de la demande
   * @param {number} collectorId - ID du collecteur
   * @returns {Promise<Object>} Demande mise à jour
   */
  async assignCollectorToRequest(requestId, collectorId) {
    try {
      const response = await fetch(`${API_BASE_URL}/service-requests/${requestId}/assign`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify({ collectorId })
      });

      if (!response.ok) {
        throw new Error(`Erreur lors de l'assignation du collecteur: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erreur lors de l\'assignation du collecteur:', error);
      throw error;
    }
  }

  // Removed collector-specific actions, as they are now in collectorService.js
  // async acceptServiceRequest(requestId) { ... }
  // async completeServiceRequest(requestId, completionData) { ... }
  // async getRealTimeRequestsForCollector(collectorId) { ... }

  /**
   * Récupère l'historique des demandes pour un ménage
   * @param {number} householdId - ID du ménage
   * @param {number} page - Numéro de page
   * @param {number} size - Taille de la page
   * @returns {Promise<Object>} Historique paginé
   */
  async getHouseholdRequestHistory(householdId, page = 0, size = 10) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/service-requests/household/${householdId}/history?page=${page}&size=${size}`,
        {
          method: 'GET',
          headers: this.getHeaders()
        }
      );

      if (!response.ok) {
        throw new Error(`Erreur lors de la récupération de l'historique: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'historique:', error);
      throw error;
    }
  }

  /**
   * Annule une demande de service (Ménage)
   * @param {number} requestId - ID de la demande
   * @param {string} reason - Raison de l'annulation
   * @returns {Promise<Object>} Demande annulée
   */
  async cancelServiceRequest(requestId, reason) {
    try {
      const response = await fetch(`${API_BASE_URL}/service-requests/${requestId}/cancel`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify({ reason })
      });

      if (!response.ok) {
        throw new Error(`Erreur lors de l'annulation de la demande: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erreur lors de l\'annulation de la demande:', error);
      throw error;
    }
  }

  /**
   * Recherche des demandes avec des critères spécifiques
   * @param {Object} searchCriteria - Critères de recherche
   * @returns {Promise<Array>} Résultats de recherche
   */
  async searchServiceRequests(searchCriteria) {
    try {
      const response = await fetch(`${API_BASE_URL}/service-requests/search`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(searchCriteria)
      });

      if (!response.ok) {
        throw new Error(`Erreur lors de la recherche: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erreur lors de la recherche de demandes:', error);
      throw error;
    }
  }

  /**
   * Récupère les statistiques des demandes de service
   * @param {Object} filters - Filtres pour les statistiques
   * @returns {Promise<Object>} Statistiques des demandes
   */
  async getServiceRequestStatistics(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== undefined) {
          queryParams.append(key, filters[key]);
        }
      });

      const url = `${API_BASE_URL}/service-requests/statistics${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Erreur lors de la récupération des statistiques: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  }

  /**
   * Envoie une notification de rappel pour une demande
   * @param {number} requestId - ID de la demande
   * @returns {Promise<boolean>} Succès de l'envoi
   */
  async sendReminderNotification(requestId) {
    try {
      const response = await fetch(`${API_BASE_URL}/service-requests/${requestId}/reminder`, {
        method: 'POST',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Erreur lors de l'envoi du rappel: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Erreur lors de l\'envoi du rappel:', error);
      throw error;
    }
  }

  /**
   * Récupère les créneaux disponibles pour un collecteur
   * @param {number} collectorId - ID du collecteur
   * @param {string} date - Date souhaitée (YYYY-MM-DD)
   * @returns {Promise<Array>} Créneaux disponibles
   */
  async getAvailableTimeSlots(collectorId, date) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/service-requests/collector/${collectorId}/available-slots?date=${date}`,
        {
          method: 'GET',
          headers: this.getHeaders()
        }
      );

      if (!response.ok) {
        throw new Error(`Erreur lors de la récupération des créneaux: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération des créneaux disponibles:', error);
      throw error;
    }
  }
}

// Export de l'instance du service
const serviceRequestService = new ServiceRequestService();
export default serviceRequestService;
