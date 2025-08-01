// frontend/src/services/notificationService.js

import authService from './authService'; // Assuming authService handles token retrieval

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api/v1'; // Base URL for your backend API

/**
 * Service pour la gestion des notifications.
 * Encapsule les appels API pour les notifications.
 */
class NotificationService {

  /**
   * Récupère les headers d'authentification pour les requêtes API.
   * @returns {Object} Headers avec le token d'authentification.
   */
  getAuthHeaders() {
    // Correctly retrieve the token string from the auth service
    const token = authService.getToken(); 
    if (!token) {
        console.warn("No authentication token found for notificationService request.");
        return { 'Content-Type': 'application/json' };
    }
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  /**
   * Récupère toutes les notifications pour un utilisateur spécifique avec pagination et filtres.
   * @param {Long} userId L'ID de l'utilisateur.
   * @param {Object} filters Les filtres (e.g., { page: 0, size: 10, sort: 'createdAt,desc', status: 'read', type: 'ALERT' }).
   * @returns {Promise<Object>} Une promesse qui résout en un objet de page de notifications.
   */
  async getNotificationsForUser(userId, filters = {}) {
    const params = new URLSearchParams();
    if (filters.page !== undefined) params.append('page', filters.page);
    if (filters.size !== undefined) params.append('size', filters.size);
    if (filters.sort !== undefined) params.append('sort', filters.sort);

    // Mapping frontend filterStatus to backend isRead boolean
    if (filters.status === 'read') {
        params.append('isRead', 'true');
    } else if (filters.status === 'unread') {
        params.append('isRead', 'false');
    }

    // Pass notificationType filter if not 'all'
    if (filters.type && filters.type !== 'all') {
        params.append('notificationType', filters.type); // Backend expects the enum string directly
    }

    const url = `${API_BASE_URL}/notifications/user/${userId}`;

    try {
      const response = await fetch(`${url}?${params.toString()}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Erreur inconnue' }));
        throw new Error(errorData.message || 'Erreur lors de la récupération des notifications.');
      }
      return await response.json(); // This should return a Page object (Spring Data Page)
    } catch (error) {
      console.error('Erreur récupération notifications:', error);
      throw error;
    }
  }

  /**
   * Marque une notification comme lue.
   * @param {Long} id L'ID de la notification.
   * @returns {Promise<Object>} La notification mise à jour.
   */
  async markNotificationAsRead(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/${id}/mark-read`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Erreur inconnue' }));
        throw new Error(errorData.message || 'Erreur lors du marquage comme lu.');
      }
      return await response.json();
    } catch (error) {
      console.error('Erreur marquage notification comme lue:', error);
      throw error;
    }
  }

    /**
     * Marque une notification comme non lue.
     * @param {Long} id L'ID de la notification.
     * @returns {Promise<Object>} La notification mise à jour.
     */
    async markNotificationAsUnread(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/notifications/${id}/mark-unread`, {
                method: 'PUT',
                headers: this.getAuthHeaders(),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Erreur inconnue' }));
                throw new Error(errorData.message || 'Erreur lors du marquage comme non lue.');
            }
            return await response.json();
        } catch (error) {
            console.error('Erreur marquage notification comme non lue:', error);
            throw error;
        }
    }

  /**
   * Supprime une notification.
   * @param {Long} id L'ID de la notification.
   * @returns {Promise<void>} Une promesse qui résout si la suppression est réussie.
   */
  async deleteNotification(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        // Handle potential JSON error response from the backend on failure
        const errorData = await response.json().catch(() => ({ message: 'Erreur lors de la suppression.' }));
        throw new Error(errorData.message || 'Erreur lors de la suppression de la notification.');
      }
      // No content is returned on successful deletion (204 No Content), so return nothing.
    } catch (error) {
      console.error('Erreur suppression notification:', error);
      throw error;
    }
  }

  /**
   * Marque toutes les notifications non lues d'un utilisateur comme lues.
   * @param {Long} userId L'ID de l'utilisateur.
   * @returns {Promise<Long>} Le nombre de notifications marquées comme lues.
   */
  async markAllNotificationsAsReadForUser(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/user/${userId}/mark-all-read`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Erreur inconnue' }));
        throw new Error(errorData.message || 'Erreur lors du marquage de toutes les notifications comme lues.');
      }
      return await response.json(); // Returns a Long (count)
    } catch (error) {
      console.error('Erreur marquage toutes notifications comme lues:', error);
      throw error;
    }
  }

    /**
     * Récupère le statut de l'alerte de sécurité (dernière notification non lue de type ALERT).
     * @returns {Promise<Object|null>} Le DTO de l'alerte ou null si aucune alerte.
     */
    async getAlertStatus() {
        try {
            const response = await fetch(`${API_BASE_URL}/notifications/alert-status`, {
                method: 'GET',
                headers: this.getAuthHeaders(),
            });

            if (response.status === 204) { // No Content
                return null;
            }
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Erreur inconnue' }));
                throw new Error(errorData.message || 'Erreur lors de la récupération du statut d\'alerte.');
            }
            return await response.json();
        } catch (error) {
            console.error('Erreur récupération statut alerte:', error);
            throw error;
        }
    }
}

export default new NotificationService(); // Export an instance of the service
