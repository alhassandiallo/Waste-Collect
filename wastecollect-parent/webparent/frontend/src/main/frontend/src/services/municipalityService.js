/**
 * Service pour la gestion des municipalités
 * Gère toutes les interactions avec l'API backend pour les municipalités
 *
 * Fonctionnalités principales:
 * - Gestion CRUD des municipalités
 * - Suivi des volumes de déchets
 * - Identification des zones mal desservies
 * - Métriques et analyses
 */

import axios from 'axios'; // Import axios

// Obtient l'URL de base de l'API depuis les variables d'environnement ou utilise une valeur par défaut
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/backend/api/v1';

/**
 * Classe de service pour les municipalités
 */
class MunicipalityService {

  // No longer need getAuthToken and getHeaders as Axios interceptor handles it
  // getAuthToken() { /* ... */ }
  // getHeaders() { /* ... */ }

  /**
   * Récupère toutes les municipalités
   * @returns {Promise<Array>} Liste des municipalités
   */
  async getAllMunicipalities() {
    try {
      const response = await axios.get(`${API_BASE_URL}/municipalities`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération de toutes les municipalités :', error);
      throw error.response?.data?.message || "Échec de la récupération de toutes les municipalités.";
    }
  }

  /**
   * Récupère une municipalité par son ID
   * @param {number} id - ID de la municipalité
   * @returns {Promise<Object>} Détails de la municipalité
   */
  async getMunicipalityById(id) {
    try {
      const response = await axios.get(`${API_BASE_URL}/municipalities/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération de la municipalité avec l'ID ${id} :`, error);
      throw error.response?.data?.message || `Échec de la récupération de la municipalité avec l'ID ${id}.`;
    }
  }

  /**
   * Crée une nouvelle municipalité
   * @param {Object} municipalityData - Données de la nouvelle municipalité
   * @returns {Promise<Object>} Municipalité créée
   */
  async createMunicipality(municipalityData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/municipalities`, municipalityData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création de la municipalité :', error);
      throw error.response?.data?.message || "Échec de la création de la municipalité.";
    }
  }

  /**
   * Met à jour une municipalité existante
   * @param {number} id - ID de la municipalité à mettre à jour
   * @param {Object} municipalityData - Données de la municipalité à mettre à jour
   * @returns {Promise<Object>} Municipalité mise à jour
   */
  async updateMunicipality(id, municipalityData) {
    try {
      const response = await axios.put(`${API_BASE_URL}/municipalities/${id}`, municipalityData);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de la municipalité avec l'ID ${id} :`, error);
      throw error.response?.data?.message || `Échec de la mise à jour de la municipalité avec l'ID ${id}.`;
    }
  }

  /**
   * Supprime une municipalité par son ID
   * @param {number} id - ID de la municipalité à supprimer
   * @returns {Promise<void>}
   */
  async deleteMunicipality(id) {
    try {
      await axios.delete(`${API_BASE_URL}/municipalities/${id}`);
    } catch (error) {
      console.error(`Erreur lors de la suppression de la municipalité avec l'ID ${id} :`, error);
      throw error.response?.data?.message || `Échec de la suppression de la municipalité avec l'ID ${id}.`;
    }
  }

  /**
   * Récupère les données de collecte de déchets pour la municipalité
   * @returns {Promise<Object>} Données de collecte de déchets
   */
  async getWasteCollectionData() {
    try {
      // Assuming this endpoint exists and is secured
      const response = await axios.get(`${API_BASE_URL}/municipalities/collection-data`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des données de collecte :', error);
      throw error.response?.data?.message || "Échec de la récupération des données de collecte.";
    }
  }

  /**
   * Récupère les zones mal desservies
   * @param {Object} filters - Filtres pour la recherche des zones mal desservies
   * @returns {Promise<Array>} Liste des zones mal desservies
   */
  async getUnderservedAreas(filters = {}) {
    try {
      // Build query parameters from filters object
      const params = new URLSearchParams(filters).toString();
      const response = await axios.get(`${API_BASE_URL}/municipalities/underserved-areas?${params}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des zones mal desservies :', error);
      throw error.response?.data?.message || "Échec de la récupération des zones mal desservies.";
    }
  }

  /**
   * Récupère les métriques et analyses de la municipalité
   * @returns {Promise<Object>} Métriques et analyses
   */
  async getMetricsAnalysis() {
    try {
      const response = await axios.get(`${API_BASE_URL}/municipalities/metrics-analysis`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des métriques et analyses :', error);
      throw error.response?.data?.message || "Échec de la récupération des métriques et analyses.";
    }
  }

  /**
   * Récupère les données de cartographie des déchets
   * @returns {Promise<Object>} Données de cartographie
   */
  async getWasteMappingData() {
    try {
      const response = await axios.get(`${API_BASE_URL}/municipalities/waste-mapping`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des données de cartographie des déchets :', error);
      throw error.response?.data?.message || "Échec de la récupération des données de cartographie des déchets.";
    }
  }

  /**
   * Génère un rapport détaillé pour la municipalité
   * @returns {Promise<Object>} Rapport détaillé
   */
  async generateDetailedReport() {
    try {
      const response = await axios.get(`${API_BASE_URL}/municipalities/detailed-report`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la génération du rapport détaillé :', error);
      throw error.response?.data?.message || "Échec de la génération du rapport détaillé.";
    }
  }

  /**
   * Récupère les données comparatives de la municipalité
   * @returns {Promise<Object>} Données comparatives
   */
  async getComparativeMunicipalityData() {
    try {
      const response = await axios.get(`${API_BASE_URL}/municipalities/comparative-data`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des données comparatives :', error);
      throw error.response?.data?.message || "Échec de la récupération des données comparatives.";
    }
  }

    /**
   * Récupère les tendances de volume de déchets par mois pour une municipalité.
   * @param {number} municipalityId - L'ID de la municipalité.
   * @param {number} months - Le nombre de mois pour lesquels récupérer les tendances.
   * @returns {Promise<Object>} Les données de tendance.
   */
  async getWasteVolumeTrends(municipalityId, months) {
    try {
      const response = await axios.get(`${API_BASE_URL}/municipalities/${municipalityId}/trends?months=${months}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des tendances de volume de déchets :', error);
      throw error.response?.data?.message || "Échec de la récupération des tendances de volume de déchets.";
    }
  }

  /**
   * Génère un rapport de performance pour la municipalité.
   * @param {number} municipalityId - L'ID de la municipalité.
   * @param {Object} reportParams - Les paramètres du rapport.
   * @returns {Promise<Object>} Le rapport généré.
   */
  async generatePerformanceReport(municipalityId, reportParams) {
    try {
      const response = await axios.post(`${API_BASE_URL}/municipalities/${municipalityId}/reports`, reportParams);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la génération du rapport de performance :', error);
      throw error.response?.data?.message || "Échec de la génération du rapport de performance.";
    }
  }

    /**
   * Plans an intervention for a specific underserved area.
   * This is a simulated call as the backend endpoint is not explicitly provided.
   * @param {string} areaId - The ID of the underserved area.
   * @returns {Promise<void>}
   */
  async scheduleIntervention(areaId) {
    try {
        // Simulate an API call to a backend endpoint for scheduling an intervention
        // Replace with actual backend call when available
        const response = await axios.post(`${API_BASE_URL}/interventions/schedule`, { areaId });
        console.log(`Intervention scheduled for area ${areaId}:`, response.data);
        return response.data;
    } catch (error) {
        console.error(`Error scheduling intervention for area ${areaId}:`, error);
        throw error.response?.data?.message || `Failed to schedule intervention for area ${areaId}.`;
    }
  }
}

// Export a single instance of the service
export default new MunicipalityService();
