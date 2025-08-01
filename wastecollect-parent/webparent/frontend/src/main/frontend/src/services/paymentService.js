/**
 * Service de gestion des paiements
 * Gère les paiements numériques, l'argent mobile et l'historique des transactions
 * Utilisé par les ménages, collecteurs et administrateurs
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

class PaymentService {
  
  /**
   * Récupère le token d'authentification depuis le localStorage
   * @returns {string|null} Token JWT ou null si non connecté
   */
  getAuthToken() {
    return localStorage.getItem('authToken');
  }

  /**
   * Configuration des headers pour les requêtes HTTP
   * @returns {Object} Headers avec token d'authentification
   */
  getHeaders() {
    const token = this.getAuthToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  }

  /**
   * Initie un nouveau paiement
   * @param {Object} paymentData - Données du paiement (montant, méthode, etc.)
   * @returns {Promise<Object>} Réponse du serveur avec les détails du paiement
   */
  async initiatePayment(paymentData) {
    try {
      const response = await fetch(`${API_BASE_URL}/payments`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(paymentData)
      });

      if (!response.ok) {
        throw new Error(`Erreur lors de l'initiation du paiement: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de l\'initiation du paiement:', error);
      throw error;
    }
  }

  /**
   * Confirme un paiement existant
   * @param {number} paymentId - ID du paiement à confirmer
   * @param {Object} confirmationData - Données de confirmation
   * @returns {Promise<Object>} Paiement confirmé
   */
  async confirmPayment(paymentId, confirmationData) {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/${paymentId}/confirm`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(confirmationData)
      });

      if (!response.ok) {
        throw new Error(`Erreur lors de la confirmation du paiement: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la confirmation du paiement:', error);
      throw error;
    }
  }

  /**
   * Récupère l'historique des paiements d'un utilisateur
   * @param {number} userId - ID de l'utilisateur
   * @param {number} page - Numéro de page (pagination)
   * @param {number} size - Taille de la page
   * @returns {Promise<Object>} Liste paginée des paiements
   */
  async getPaymentHistory(userId, page = 0, size = 10) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/payments/user/${userId}?page=${page}&size=${size}`,
        {
          method: 'GET',
          headers: this.getHeaders()
        }
      );

      if (!response.ok) {
        throw new Error(`Erreur lors de la récupération de l'historique: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'historique des paiements:', error);
      throw error;
    }
  }

  /**
   * Récupère les détails d'un paiement spécifique
   * @param {number} paymentId - ID du paiement
   * @returns {Promise<Object>} Détails du paiement
   */
  async getPaymentDetails(paymentId) {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/${paymentId}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Erreur lors de la récupération du paiement: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération du paiement:', error);
      throw error;
    }
  }

  /**
   * Récupère les revenus d'un collecteur
   * @param {number} collecteurId - ID du collecteur
   * @param {string} periode - Période (jour, semaine, mois)
   * @returns {Promise<Object>} Statistiques de revenus
   */
  async getCollectorRevenue(collecteurId, periode = 'mois') {
    try {
      const response = await fetch(
        `${API_BASE_URL}/payments/collector/${collecteurId}/revenue?period=${periode}`,
        {
          method: 'GET',
          headers: this.getHeaders()
        }
      );

      if (!response.ok) {
        throw new Error(`Erreur lors de la récupération des revenus: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération des revenus:', error);
      throw error;
    }
  }

  /**
   * Récupère les méthodes de paiement disponibles
   * @returns {Promise<Array>} Liste des méthodes de paiement
   */
  async getPaymentMethods() {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/methods`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Erreur lors de la récupération des méthodes de paiement: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération des méthodes de paiement:', error);
      throw error;
    }
  }

  /**
   * Annule un paiement en attente
   * @param {number} paymentId - ID du paiement à annuler
   * @returns {Promise<Object>} Confirmation d'annulation
   */
  async cancelPayment(paymentId) {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/${paymentId}/cancel`, {
        method: 'PUT',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Erreur lors de l'annulation du paiement: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de l\'annulation du paiement:', error);
      throw error;
    }
  }

  /**
   * Récupère les statistiques de paiement pour l'admin
   * @param {string} startDate - Date de début (YYYY-MM-DD)
   * @param {string} endDate - Date de fin (YYYY-MM-DD)
   * @returns {Promise<Object>} Statistiques des paiements
   */
  async getPaymentStatistics(startDate, endDate) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/payments/statistics?startDate=${startDate}&endDate=${endDate}`,
        {
          method: 'GET',
          headers: this.getHeaders()
        }
      );

      if (!response.ok) {
        throw new Error(`Erreur lors de la récupération des statistiques: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques de paiement:', error);
      throw error;
    }
  }

  /**
   * Vérifie le statut d'un paiement mobile
   * @param {string} transactionId - ID de transaction du service mobile
   * @returns {Promise<Object>} Statut de la transaction
   */
  async checkMobilePaymentStatus(transactionId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/payments/mobile/status/${transactionId}`,
        {
          method: 'GET',
          headers: this.getHeaders()
        }
      );

      if (!response.ok) {
        throw new Error(`Erreur lors de la vérification du statut: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la vérification du statut de paiement mobile:', error);
      throw error;
    }
  }
}

// Export d'une instance unique du service
export default new PaymentService();
