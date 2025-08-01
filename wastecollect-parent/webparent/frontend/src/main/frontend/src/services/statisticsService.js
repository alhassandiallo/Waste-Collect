/**
 * Service de gestion des statistiques
 * Fournit les données analytiques pour tous les acteurs de la plateforme
 * Génère les indicateurs de performance et les rapports automatisés
 */

import axios from 'axios'; // Import axios

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/backend/api/v1'; // Corrected path

class StatisticsService {

  // getAuthToken and getHeaders are no longer needed as Axios interceptor handles auth

  /**
   * Récupère les statistiques globales de la plateforme (Admin)
   * @param {string} startDate - Date de début (YYYY-MM-DD)
   * @param {string} endDate - Date de fin (YYYY-MM-DD)
   * @returns {Promise<Object>} Statistiques globales
   */
  async getGlobalStatistics(startDate, endDate) {
    try {
      const response = await axios.get(`${API_BASE_URL}/statistics/global`, {
        params: { startDate, endDate }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques globales :', error);
      throw error.response?.data?.message || "Échec de la récupération des statistiques globales.";
    }
  }

  /**
   * Récupère les indicateurs clés de performance (KPI) pour un type d'utilisateur donné.
   * @param {string} userType - Type d'utilisateur (ADMIN, COLLECTOR, HOUSEHOLD, MUNICIPAL_MANAGER)
   * @param {number} userId - ID de l'utilisateur
   * @returns {Promise<Object>} Les KPI pour l'utilisateur spécifié.
   */
  async getKPIsByUserType(userType, userId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/statistics/kpi/${userType}/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des KPI pour ${userType} (ID: ${userId}) :`, error);
      throw error.response?.data?.message || `Échec de la récupération des KPI pour ${userType}.`;
    }
  }

  /**
   * Récupère les tendances de collecte pour un type de déchet ou une zone spécifique.
   * @param {string} type - Le type de déchet ou 'all'.
   * @param {string} area - La zone géographique ou 'all'.
   * @returns {Promise<Object>} Les données de tendance.
   */
  async getCollectionTrends(type = 'all', area = 'all') {
    try {
      const response = await axios.get(`${API_BASE_URL}/statistics/trends`, {
        params: { type, area }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des tendances de collecte :', error);
      throw error.response?.data?.message || "Échec de la récupération des tendances de collecte.";
    }
  }

  /**
   * Exécute une analyse comparative entre différentes entités (municipalités, collecteurs).
   * @param {Object} comparisonConfig - Configuration de l'analyse comparative.
   * @returns {Promise<Object>} Les résultats de l'analyse comparative.
   */
  async getComparativeAnalysis(comparisonConfig) {
    try {
      const response = await axios.post(`${API_BASE_URL}/statistics/comparative`, comparisonConfig);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de l\'analyse comparative :', error);
      throw error.response?.data?.message || "Échec de l'analyse comparative.";
    }
  }

  /**
   * Récupère les KPI (Key Performance Indicators) personnalisés
   * @param {string} userType - Type d'utilisateur
   * @param {number} userId - ID de l'utilisateur
   * @returns {Promise<Array>} Liste des KPI
   */
  async getCustomKPIs(userType, userId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/statistics/kpi?userType=${userType}&userId=${userId}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des KPI :', error);
      throw error.response?.data?.message || "Échec de la récupération des KPI.";
    }
  }
}

export default new StatisticsService();
