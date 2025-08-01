/**
 * Service de gestion des collectes de déchets
 * Gère les demandes de ramassage, le suivi en temps réel et les tournées
 * Utilisé par les ménages, collecteurs, municipalités et administrateurs
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

class WasteCollectionService {
  
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
   * Crée une nouvelle demande de collecte (utilisé par les ménages)
   * @param {Object} collectionData - Données de la demande (adresse, type déchets, etc.)
   * @returns {Promise<Object>} Demande de collecte créée
   */
  async createCollectionRequest(collectionData) {
    try {
      const response = await fetch(`${API_BASE_URL}/waste-collections`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(collectionData)
      });

      if (!response.ok) {
        throw new Error(`Erreur lors de la création de la demande: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la création de la demande de collecte:', error);
      throw error;
    }
  }

  /**
   * Récupère toutes les demandes de collecte disponibles pour un collecteur
   * @param {number} collecteurId - ID du collecteur
   * @param {string} status - Statut des demandes (EN_ATTENTE, ACCEPTEE, etc.)
   * @returns {Promise<Array>} Liste des demandes disponibles
   */
  async getAvailableCollections(collecteurId, status = 'EN_ATTENTE') {
    try {
      const response = await fetch(
        `${API_BASE_URL}/waste-collections/available?collecteurId=${collecteurId}&status=${status}`,
        {
          method: 'GET',
          headers: this.getHeaders()
        }
      );

      if (!response.ok) {
        throw new Error(`Erreur lors de la récupération des collectes: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération des collectes disponibles:', error);
      throw error;
    }
  }

  /**
   * Accepte une demande de collecte (utilisé par les collecteurs)
   * @param {number} collectionId - ID de la collecte
   * @param {number} collecteurId - ID du collecteur
   * @returns {Promise<Object>} Collecte acceptée
   */
  async acceptCollection(collectionId, collecteurId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/waste-collections/${collectionId}/accept`,
        {
          method: 'PUT',
          headers: this.getHeaders(),
          body: JSON.stringify({ collecteurId })
        }
      );

      if (!response.ok) {
        throw new Error(`Erreur lors de l'acceptation de la collecte: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de l\'acceptation de la collecte:', error);
      throw error;
    }
  }

  /**
   * Marque une collecte comme terminée
   * @param {number} collectionId - ID de la collecte
   * @param {Object} completionData - Données de fin (poids, notes, photo)
   * @returns {Promise<Object>} Collecte terminée
   */
  async completeCollection(collectionId, completionData) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/waste-collections/${collectionId}/complete`,
        {
          method: 'PUT',
          headers: this.getHeaders(),
          body: JSON.stringify(completionData)
        }
      );

      if (!response.ok) {
        throw new Error(`Erreur lors de la finalisation de la collecte: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la finalisation de la collecte:', error);
      throw error;
    }
  }

  /**
   * Récupère l'historique des collectes d'un utilisateur
   * @param {number} userId - ID de l'utilisateur (ménage ou collecteur)
   * @param {string} userType - Type d'utilisateur (HOUSEHOLD, COLLECTOR)
   * @param {number} page - Numéro de page
   * @param {number} size - Taille de la page
   * @returns {Promise<Object>} Historique paginé des collectes
   */
  async getCollectionHistory(userId, userType, page = 0, size = 10) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/waste-collections/history?userId=${userId}&userType=${userType}&page=${page}&size=${size}`,
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
      console.error('Erreur lors de la récupération de l\'historique des collectes:', error);
      throw error;
    }
  }

  /**
   * Récupère les détails d'une collecte spécifique
   * @param {number} collectionId - ID de la collecte
   * @returns {Promise<Object>} Détails de la collecte
   */
  async getCollectionDetails(collectionId) {
    try {
      const response = await fetch(`${API_BASE_URL}/waste-collections/${collectionId}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Erreur lors de la récupération de la collecte: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération des détails de la collecte:', error);
      throw error;
    }
  }

  /**
   * Récupère les collectes en temps réel pour un collecteur
   * @param {number} collecteurId - ID du collecteur
   * @returns {Promise<Array>} Collectes en cours et à venir
   */
  async getRealTimeCollections(collecteurId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/waste-collections/real-time/${collecteurId}`,
        {
          method: 'GET',
          headers: this.getHeaders()
        }
      );

      if (!response.ok) {
        throw new Error(`Erreur lors de la récupération des collectes en temps réel: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération des collectes en temps réel:', error);
      throw error;
    }
  }

  /**
   * Met à jour la localisation d'une collecte en cours
   * @param {number} collectionId - ID de la collecte
   * @param {Object} locationData - Coordonnées GPS (latitude, longitude)
   * @returns {Promise<Object>} Confirmation de mise à jour
   */
  async updateCollectionLocation(collectionId, locationData) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/waste-collections/${collectionId}/location`,
        {
          method: 'PUT',
          headers: this.getHeaders(),
          body: JSON.stringify(locationData)
        }
      );

      if (!response.ok) {
        throw new Error(`Erreur lors de la mise à jour de la localisation: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la localisation:', error);
      throw error;
    }
  }

  /**
   * Annule une demande de collecte
   * @param {number} collectionId - ID de la collecte à annuler
   * @param {string} reason - Raison d'annulation
   * @returns {Promise<Object>} Confirmation d'annulation
   */
  async cancelCollection(collectionId, reason) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/waste-collections/${collectionId}/cancel`,
        {
          method: 'PUT',
          headers: this.getHeaders(),
          body: JSON.stringify({ reason })
        }
      );

      if (!response.ok) {
        throw new Error(`Erreur lors de l'annulation de la collecte: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de l\'annulation de la collecte:', error);
      throw error;
    }
  }

  /**
   * Récupère les volumes de déchets par zone (pour municipalités)
   * @param {number} municipalityId - ID de la municipalité
   * @param {string} period - Période d'analyse (jour, semaine, mois)
   * @returns {Promise<Object>} Statistiques de volumes par zone
   */
  async getWasteVolumesByArea(municipalityId, period = 'mois') {
    try {
      const response = await fetch(
        `${API_BASE_URL}/waste-collections/volumes/municipality/${municipalityId}?period=${period}`,
        {
          method: 'GET',
          headers: this.getHeaders()
        }
      );

      if (!response.ok) {
        throw new Error(`Erreur lors de la récupération des volumes: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération des volumes de déchets:', error);
      throw error;
    }
  }

  /**
   * Identifie les zones mal desservies
   * @param {number} municipalityId - ID de la municipalité
   * @returns {Promise<Array>} Liste des zones sous-desservies
   */
  async getUnderservedAreas(municipalityId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/waste-collections/underserved-areas/${municipalityId}`,
        {
          method: 'GET',
          headers: this.getHeaders()
        }
      );

      if (!response.ok) {
        throw new Error(`Erreur lors de l'identification des zones mal desservies: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de l\'identification des zones mal desservies:', error);
      throw error;
    }
  }

  /**
   * Récupère les collectes par zone géographique
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude  
   * @param {number} radius - Rayon en kilomètres
   * @returns {Promise<Array>} Collectes dans la zone
   */
  async getCollectionsByArea(lat, lng, radius = 5) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/waste-collections/area?lat=${lat}&lng=${lng}&radius=${radius}`,
        {
          method: 'GET',
          headers: this.getHeaders()
        }
      );

      if (!response.ok) {
        throw new Error(`Erreur lors de la récupération des collectes par zone: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération des collectes par zone:', error);
      throw error;
    }
  }

  /**
   * Programme une collecte récurrente
   * @param {Object} scheduleData - Données de planification (fréquence, jours, etc.)
   * @returns {Promise<Object>} Planification créée
   */
  async scheduleRecurringCollection(scheduleData) {
    try {
      const response = await fetch(`${API_BASE_URL}/waste-collections/schedule`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(scheduleData)
      });

      if (!response.ok) {
        throw new Error(`Erreur lors de la programmation de la collecte: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la programmation de la collecte récurrente:', error);
      throw error;
    }
  }
}

// Export d'une instance unique du service
export default new WasteCollectionService();
