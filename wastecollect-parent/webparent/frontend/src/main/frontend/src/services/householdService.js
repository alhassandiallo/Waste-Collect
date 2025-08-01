// householdService.js - Service pour la gestion des ménages
// Gère les demandes de ramassage, évaluations, paiements et préférences

import authService from './authService';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

/**
 * Service pour la gestion des fonctionnalités des ménages
 */
class HouseholdService {

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

  /**
   * Récupération du profil du ménage connecté
   * @returns {Promise<Object>} - Données du ménage
   */
  async getHouseholdProfile() {
    try {
      const response = await fetch(`${API_BASE_URL}/households/profile`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération du profil');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur récupération profil ménage:', error);
      throw error;
    }
  }

  /**
   * Mise à jour du profil du ménage
   * @param {Object} profileData - Nouvelles données du profil
   * @returns {Promise<Object>} - Profil mis à jour
   */
  async updateHouseholdProfile(profileData) {
    try {
      const response = await fetch(`${API_BASE_URL}/households/profile`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour du profil');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur mise à jour profil ménage:', error);
      throw error;
    }
  }

  /**
   * Création d'une nouvelle demande de ramassage
   * @param {Object} requestData - Données de la demande (type déchets, date, adresse, etc.)
   * @returns {Promise<Object>} - Confirmation de création de demande
   */
  async createPickupRequest(requestData) {
    try {
      const response = await fetch(`${API_BASE_URL}/households/pickup-requests`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          ...requestData,
          requestDate: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création de la demande');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur création demande ramassage:', error);
      throw error;
    }
  }

  /**
   * Récupération de l'historique des demandes de ramassage
   * @param {Object} filters - Filtres (statut, date, etc.)
   * @returns {Promise<Array>} - Liste des demandes historiques
   */
  async getPickupHistory(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const url = `${API_BASE_URL}/households/pickup-requests${queryParams ? `?${queryParams}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération de l\'historique');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur récupération historique ramassage:', error);
      throw error;
    }
  }

  /**
   * Annulation d'une demande de ramassage
   * @param {number} requestId - ID de la demande à annuler
   * @param {string} reason - Raison de l'annulation
   * @returns {Promise<Object>} - Confirmation d'annulation
   */
  async cancelPickupRequest(requestId, reason) {
    try {
      const response = await fetch(`${API_BASE_URL}/households/pickup-requests/${requestId}/cancel`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'annulation de la demande');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur annulation demande:', error);
      throw error;
    }
  }

  /**
   * Évaluation d'un collecteur après une collecte
   * @param {number} collectionId - ID de la collecte
   * @param {Object} ratingData - Note et commentaires
   * @returns {Promise<Object>} - Confirmation d'évaluation
   */
  async rateCollector(collectionId, ratingData) {
    try {
      const response = await fetch(`${API_BASE_URL}/households/rate-collector`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          collectionId,
          rating: ratingData.rating,
          comment: ratingData.comment,
          ratingDate: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'évaluation du collecteur');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur évaluation collecteur:', error);
      throw error;
    }
  }

  /**
   * Récupération des statistiques de génération de déchets du ménage
   * @param {string} period - Période d'analyse (weekly, monthly, yearly)
   * @returns {Promise<Object>} - Statistiques de génération de déchets
   */
  async getWasteGenerationStats(period = 'monthly') {
    try {
      const response = await fetch(`${API_BASE_URL}/households/waste-stats?period=${period}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des statistiques');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur récupération stats déchets:', error);
      throw error;
    }
  }

  /**
   * Configuration des préférences de collecte du ménage
   * @param {Object} preferences - Préférences (horaires, fréquence, types de déchets, etc.)
   * @returns {Promise<Object>} - Confirmation de mise à jour des préférences
   */
  async updateCollectionPreferences(preferences) {
    try {
      const response = await fetch(`${API_BASE_URL}/households/preferences`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(preferences),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour des préférences');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur mise à jour préférences:', error);
      throw error;
    }
  }

  /**
   * Récupération des préférences de collecte actuelles
   * @returns {Promise<Object>} - Préférences actuelles
   */
  async getCollectionPreferences() {
    try {
      const response = await fetch(`${API_BASE_URL}/households/preferences`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des préférences');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur récupération préférences:', error);
      throw error;
    }
  }

  /**
   * Configuration des notifications de ramassage
   * @param {Object} notificationSettings - Paramètres de notification
   * @returns {Promise<Object>} - Confirmation de configuration
   */
  async updateNotificationSettings(notificationSettings) {
    try {
      const response = await fetch(`${API_BASE_URL}/households/notifications`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(notificationSettings),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la configuration des notifications');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur configuration notifications:', error);
      throw error;
    }
  }

  /**
   * Récupération de l'historique des paiements
   * @param {number} page - Numéro de page pour la pagination
   * @param {number} limit - Nombre de paiements par page
   * @returns {Promise<Object>} - Historique des paiements avec pagination
   */
  async getPaymentHistory(page = 1, limit = 10) {
    try {
      const params = new URLSearchParams({ 
        page: page.toString(), 
        limit: limit.toString() 
      });
      
      const response = await fetch(`${API_BASE_URL}/households/payments?${params}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération de l\'historique de paiement');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur récupération historique paiement:', error);
      throw error;
    }
  }

  /**
   * Initiation d'un paiement numérique
   * @param {Object} paymentData - Données de paiement (montant, méthode, etc.)
   * @returns {Promise<Object>} - Confirmation et détails de paiement
   */
  async initiatePayment(paymentData) {
    try {
      const response = await fetch(`${API_BASE_URL}/households/payments/initiate`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          ...paymentData,
          paymentDate: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'initiation du paiement');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur initiation paiement:', error);
      throw error;
    }
  }

  /**
   * Récupération des collecteurs disponibles dans la zone
   * @param {Object} location - Coordonnées géographiques (latitude, longitude)
   * @returns {Promise<Array>} - Liste des collecteurs disponibles
   */
  async getAvailableCollectors(location) {
    try {
      const params = new URLSearchParams({
        latitude: location.latitude.toString(),
        longitude: location.longitude.toString(),
      });
      
      const response = await fetch(`${API_BASE_URL}/households/collectors/available?${params}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des collecteurs');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur récupération collecteurs disponibles:', error);
      throw error;
    }
  }

  /**
   * Suivi en temps réel d'une collecte en cours
   * @param {number} requestId - ID de la demande de collecte
   * @returns {Promise<Object>} - Statut et localisation de la collecte
   */
  async trackCollection(requestId) {
    try {
      const response = await fetch(`${API_BASE_URL}/households/pickup-requests/${requestId}/track`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Erreur lors du suivi de la collecte');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur suivi collecte:', error);
      throw error;
    }
  }

  /**
   * Récupération des notifications du ménage
   * @param {boolean} unreadOnly - Si true, récupère seulement les non lues
   * @returns {Promise<Array>} - Liste des notifications
   */
  async getNotifications(unreadOnly = false) {
    try {
      const params = unreadOnly ? '?unreadOnly=true' : '';
      const response = await fetch(`${API_BASE_URL}/households/notifications${params}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des notifications');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur récupération notifications:', error);
      throw error;
    }
  }

  /**
   * Marquage d'une notification comme lue
   * @param {number} notificationId - ID de la notification
   * @returns {Promise<Object>} - Confirmation de lecture
   */
  async markNotificationAsRead(notificationId) {
    try {
      const response = await fetch(`${API_BASE_URL}/households/notifications/${notificationId}/read`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Erreur lors du marquage de la notification');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur marquage notification:', error);
      throw error;
    }
  }
}

// Export d'une instance unique du service
export default new HouseholdService();