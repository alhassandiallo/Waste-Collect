/**
 * Service de gestion des litiges
 * Gère les conflits entre ménages et collecteurs, les réclamations et leur résolution
 * Utilisé par tous les acteurs de la plateforme pour signaler et résoudre les problèmes
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

class DisputeService {
  
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
   * Crée un nouveau litige
   * @param {Object} disputeData - Données du litige (type, description, preuves, etc.)
   * @returns {Promise<Object>} Litige créé
   */
  async createDispute(disputeData) {
    try {
      const response = await fetch(`${API_BASE_URL}/disputes`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(disputeData)
      });

      if (!response.ok) {
        throw new Error(`Erreur lors de la création du litige: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la création du litige:', error);
      throw error;
    }
  }

  /**
   * Récupère tous les litiges avec filtres optionnels
   * @param {Object} filters - Filtres (statut, type, date, utilisateur, etc.)
   * @param {number} page - Numéro de page
   * @param {number} size - Taille de la page
   * @returns {Promise<Object>} Liste paginée des litiges
   */
  async getDisputes(filters = {}, page = 0, size = 10) {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        ...filters
      });

      const response = await fetch(
        `${API_BASE_URL}/disputes?${queryParams}`,
        {
          method: 'GET',
          headers: this.getHeaders()
        }
      );

      if (!response.ok) {
        throw new Error(`Erreur lors de la récupération des litiges: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération des litiges:', error);
      throw error;
    }
  }

  /**
   * Récupère les détails d'un litige spécifique
   * @param {number} disputeId - ID du litige
   * @returns {Promise<Object>} Détails complets du litige
   */
  async getDisputeDetails(disputeId) {
    try {
      const response = await fetch(`${API_BASE_URL}/disputes/${disputeId}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Erreur lors de la récupération du litige: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération des détails du litige:', error);
      throw error;
    }
  }

  /**
   * Met à jour le statut d'un litige
   * @param {number} disputeId - ID du litige
   * @param {string} newStatus - Nouveau statut (EN_COURS, RESOLU, FERME, etc.)
   * @param {string} comment - Commentaire sur le changement de statut
   * @returns {Promise<Object>} Litige mis à jour
   */
  async updateDisputeStatus(disputeId, newStatus, comment = '') {
    try {
      const response = await fetch(
        `${API_BASE_URL}/disputes/${disputeId}/status`,
        {
          method: 'PUT',
          headers: this.getHeaders(),
          body: JSON.stringify({ 
            status: newStatus,
            comment: comment
          })
        }
      );

      if (!response.ok) {
        throw new Error(`Erreur lors de la mise à jour du statut: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut du litige:', error);
      throw error;
    }
  }

  /**
   * Ajoute un commentaire ou une réponse à un litige
   * @param {number} disputeId - ID du litige
   * @param {Object} commentData - Données du commentaire
   * @returns {Promise<Object>} Commentaire ajouté
   */
  async addComment(disputeId, commentData) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/disputes/${disputeId}/comments`,
        {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify(commentData)
        }
      );

      if (!response.ok) {
        throw new Error(`Erreur lors de l'ajout du commentaire: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de l\'ajout du commentaire:', error);
      throw error;
    }
  }

  /**
   * Récupère les litiges d'un utilisateur spécifique
   * @param {number} userId - ID de l'utilisateur
   * @param {string} userType - Type d'utilisateur (HOUSEHOLD, COLLECTOR, etc.)
   * @param {number} page - Numéro de page
   * @param {number} size - Taille de la page
   * @returns {Promise<Object>} Litiges de l'utilisateur
   */
  async getUserDisputes(userId, userType, page = 0, size = 10) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/disputes/user/${userId}?userType=${userType}&page=${page}&size=${size}`,
        {
          method: 'GET',
          headers: this.getHeaders()
        }
      );

      if (!response.ok) {
        throw new Error(`Erreur lors de la récupération des litiges utilisateur: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération des litiges utilisateur:', error);
      throw error;
    }
  }

  /**
   * Assigne un litige à un administrateur pour traitement
   * @param {number} disputeId - ID du litige
   * @param {number} adminId - ID de l'administrateur
   * @returns {Promise<Object>} Litige assigné
   */
  async assignDispute(disputeId, adminId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/disputes/${disputeId}/assign`,
        {
          method: 'PUT',
          headers: this.getHeaders(),
          body: JSON.stringify({ adminId })
        }
      );

      if (!response.ok) {
        throw new Error(`Erreur lors de l'assignation du litige: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de l\'assignation du litige:', error);
      throw error;
    }
  }

  /**
   * Résout un litige avec une solution proposée
   * @param {number} disputeId - ID du litige
   * @param {Object} resolutionData - Données de résolution
   * @returns {Promise<Object>} Litige résolu
   */
  async resolveDispute(disputeId, resolutionData) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/disputes/${disputeId}/resolve`,
        {
          method: 'PUT',
          headers: this.getHeaders(),
          body: JSON.stringify(resolutionData)
        }
      );

      if (!response.ok) {
        throw new Error(`Erreur lors de la résolution du litige: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la résolution du litige:', error);
      throw error;
    }
  }

  /**
   * Ferme définitivement un litige
   * @param {number} disputeId - ID du litige
   * @param {string} reason - Raison de fermeture
   * @returns {Promise<Object>} Confirmation de fermeture
   */
  async closeDispute(disputeId, reason) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/disputes/${disputeId}/close`,
        {
          method: 'PUT',
          headers: this.getHeaders(),
          body: JSON.stringify({ reason })
        }
      );

      if (!response.ok) {
        throw new Error(`Erreur lors de la fermeture du litige: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la fermeture du litige:', error);
      throw error;
    }
  }

  /**
   * Upload des fichiers de preuve pour un litige
   * @param {number} disputeId - ID du litige
   * @param {FileList} files - Fichiers à uploader
   * @returns {Promise<Array>} Liste des fichiers uploadés
   */
  async uploadEvidence(disputeId, files) {
    try {
      const formData = new FormData();
      
      // Ajout de chaque fichier au FormData
      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
      }

      const response = await fetch(
        `${API_BASE_URL}/disputes/${disputeId}/evidence`,
        {
          method: 'POST',
          headers: {
            'Authorization': this.getAuthToken() ? `Bearer ${this.getAuthToken()}` : ''
          },
          body: formData
        }
      );

      if (!response.ok) {
        throw new Error(`Erreur lors de l'upload des preuves: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de l\'upload des preuves:', error);
      throw error;
    }
  }

  /**
   * Récupère les statistiques des litiges
   * @param {Object} filters - Filtres pour les statistiques
   * @returns {Promise<Object>} Statistiques des litiges
   */
  async getDisputeStatistics(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters);
      
      const response = await fetch(
        `${API_BASE_URL}/disputes/statistics?${queryParams}`,
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
      console.error('Erreur lors de la récupération des statistiques de litiges:', error);
      throw error;
    }
  }

  /**
   * Récupère les types de litiges disponibles
   * @returns {Promise<Array>} Liste des types de litiges
   */
  async getDisputeTypes() {
    try {
      const response = await fetch(`${API_BASE_URL}/disputes/types`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Erreur lors de la récupération des types de litiges: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération des types de litiges:', error);
      throw error;
    }
  }

  /**
   * Recherche des litiges par mots-clés
   * @param {string} query - Terme de recherche
   * @param {Object} filters - Filtres additionnels
   * @param {number} page - Numéro de page
   * @param {number} size - Taille de la page
   * @returns {Promise<Object>} Résultats de recherche
   */
  async searchDisputes(query, filters = {}, page = 0, size = 10) {
    try {
      const queryParams = new URLSearchParams({
        q: query,
        page: page.toString(),
        size: size.toString(),
        ...filters
      });

      const response = await fetch(
        `${API_BASE_URL}/disputes/search?${queryParams}`,
        {
          method: 'GET',
          headers: this.getHeaders()
        }
      );

      if (!response.ok) {
        throw new Error(`Erreur lors de la recherche de litiges: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la recherche de litiges:', error);
      throw error;
    }
  }

  /**
   * Envoie une notification concernant un litige
   * @param {number} disputeId - ID du litige
   * @param {Object} notificationData - Données de notification
   * @returns {Promise<Object>} Confirmation d'envoi
   */
  async sendDisputeNotification(disputeId, notificationData) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/disputes/${disputeId}/notify`,
        {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify(notificationData)
        }
      );

      if (!response.ok) {
        throw new Error(`Erreur lors de l'envoi de la notification: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la notification de litige:', error);
      throw error;
    }
  }

  /**
   * Récupère l'historique des actions sur un litige
   * @param {number} disputeId - ID du litige
   * @returns {Promise<Array>} Historique des actions
   */
  async getDisputeHistory(disputeId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/disputes/${disputeId}/history`,
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
      console.error('Erreur lors de la récupération de l\'historique du litige:', error);
      throw error;
    }
  }

  /**
   * Évalue la satisfaction après résolution d'un litige
   * @param {number} disputeId - ID du litige
   * @param {Object} feedbackData - Données d'évaluation
   * @returns {Promise<Object>} Évaluation enregistrée
   */
  async submitFeedback(disputeId, feedbackData) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/disputes/${disputeId}/feedback`,
        {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify(feedbackData)
        }
      );

      if (!response.ok) {
        throw new Error(`Erreur lors de l'envoi de l'évaluation: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'évaluation:', error);
      throw error;
    }
  }
}

// Export d'une instance unique du service
export default new DisputeService();