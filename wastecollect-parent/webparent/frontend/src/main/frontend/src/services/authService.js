// authService.js - Service pour les appels d'API d'authentification et de gestion des utilisateurs
// Gère la connexion, l'inscription pour différents types d'utilisateurs, la gestion des tokens et la récupération de profils.

import axios from 'axios';

// Obtient l'URL de base de l'API depuis les variables d'environnement ou utilise une valeur par défaut
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/backend/api/v1';

const authService = {

  /**
   * Retrieves the raw JWT token string from secure storage.
   * The token is expected to be Base64 encoded.
   */
  getToken: () => {
    try {
      const encryptedToken = localStorage.getItem('accessToken');
      if (!encryptedToken) return null;
      // The token itself is what's needed for the Authorization header.
      // It's stored as a Base64 encoded string.
      return atob(encryptedToken);
    } catch (error) {
      console.error('Erreur lors de la récupération du token depuis le stockage :', error);
      // If decoding fails, the token is corrupt. Remove it.
      localStorage.removeItem('accessToken');
      return null;
    }
  },

  /**
   * This function is now primarily handled by AuthContext to ensure consistency.
   * If called directly, it should Base64 encode the raw token string for storage.
   */
  setToken: (token) => {
    try {
      // Base64 encode the token before storing it
      const encryptedToken = btoa(token);
      localStorage.setItem('accessToken', encryptedToken);
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du token :', error);
    }
  },

  removeToken: () => {
    localStorage.removeItem('accessToken');
  },

  /**
   * Authenticates a user with the backend.
   * @param {string} email - User's email.
   * @param {string} password - User's password.
   * @returns {Promise<object>} - Contains token and user details.
   */
  login: async (email, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
      // The backend should return the token directly in the response body,
      // and potentially user information for immediate context setup.
      // Example: { token: "...", user: { id: ..., email: ..., roleName: "..." } }
      const { token, user } = response.data; // Assuming backend returns { token, user }
      authService.setToken(token); // Store the token
      return { token, user }; // Return both for AuthContext to manage
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      throw error; // Re-throw to be caught by AuthContext/useAuth
    }
  },

  /**
   * Registers a new household user.
   * @param {object} householdData - Data for household registration.
   * @returns {Promise<object>} - Response from the backend.
   */
  registerHousehold: async (householdData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register/household`, householdData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de l\'inscription du ménage:', error);
      throw error;
    }
  },

  /**
   * Registers a new collector user.
   * @param {object} collectorData - Data for collector registration.
   * @returns {Promise<object>} - Response from the backend.
   */
  registerCollector: async (collectorData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register/collector`, collectorData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de l\'inscription du collecteur:', error);
      throw error;
    }
  },

  /**
   * Registers a new admin user.
   * @param {object} adminData - Data for admin registration.
   * @returns {Promise<object>} - Response from the backend.
   */
  registerAdmin: async (adminData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register/admin`, adminData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de l\'inscription de l\'administrateur:', error);
      throw error;
    }
  },

  /**
   * Logs out the user.
   * Currently, this is mainly client-side token removal.
   * If a backend invalidate-session endpoint exists, it should be called here.
   */
  logout: async () => {
    try {
      // In a JWT setup, backend logout might not be strictly necessary
      // as tokens are self-contained. However, if there's a blacklist
      // or session invalidation on the server, call it.
      // await axios.post(`${API_BASE_URL}/auth/logout`); // Example if backend has logout endpoint
      authService.removeToken();
      // Clear user data from local storage as well
      localStorage.removeItem('user'); // Assuming 'user' key for user data
      return true;
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      throw error;
    }
  },

  /**
   * Sends a request to the backend to initiate a password reset.
   * @param {string} email - The email address for the password reset.
   */
  forgotPassword: async (email) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/forgot-password`, null, { params: { email } });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la demande de réinitialisation du mot de passe:', error);
      throw error.response?.data?.message || "Échec de l'envoi de l'email de réinitialisation.";
    }
  },

  /**
   * Resets the user's password using a reset token.
   * @param {string} token - The password reset token.
   * @param {string} newPassword - The new password.
   */
  resetPassword: async (token, newPassword) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/reset-password`, { token, newPassword });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la réinitialisation du mot de passe:', error);
      throw error.response?.data?.message || "Échec de la réinitialisation du mot de passe.";
    }
  },

  /**
   * Fetches the profile of the currently authenticated user.
   * @returns {Promise<object>} The user's profile data.
   * @throws {Error} If fetching fails.
   */
  getProfile: async () => {
    try {
      // This endpoint should return a DTO (e.g., UserDTO, CollectorProfileDTO)
      // based on the authenticated user's role.
      const response = await axios.get(`${API_BASE_URL}/auth/profile`);
      return response.data; // Return the user profile object
    } catch (error) {
      console.error('Erreur lors de la récupération du profil utilisateur :', error);
      throw error.response?.data?.message || "Échec de la récupération du profil utilisateur.";
    }
  },

  /**
   * Updates the profile of the currently authenticated user.
   * This generic update endpoint should be handled by the backend to
   * correctly update the specific user type's profile (e.g., Collector, Household).
   * It should accept a DTO appropriate for general user updates (e.g., UserUpdateDTO)
   * or a specific DTO if the backend maps it based on role.
   * For a collector, it might be `CollectorUpdateDTO`.
   * @param {object} profileData - The data to update in the user's profile.
   * @returns {Promise<object>} The updated user's profile data.
   * @throws {Error} If updating fails.
   */
  updateProfile: async (profileData) => {
    try {
      // Assuming the backend's /auth/profile PUT endpoint can handle general user profile updates
      // and intelligently delegate to specific user types based on the authenticated user's role.
      // The DTO sent here should match the backend's expected DTO for this endpoint.
      const response = await axios.put(`${API_BASE_URL}/auth/profile`, profileData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil utilisateur :', error);
      throw error.response?.data?.message || "Échec de la mise à jour du profil utilisateur.";
    }
  },

  /**
   * Updates the user's password.
   * @param {string} currentPassword - The user's current password.
   * @param {string} newPassword - The user's new password.
   * @returns {Promise<string>} Success message.
   */
  changePassword: async (currentPassword, newPassword) => {
    try {
      // This endpoint is specific to the CollectorController,
      // so it's a direct call to the collector API path.
      // If there was a general user password change endpoint, it would be here.
      // For now, assuming CollectorController handles it.
      const response = await axios.post(`${API_BASE_URL}/collector/update-password`, {
        currentPassword,
        newPassword,
        confirmNewPassword: newPassword // Backend expects this for validation
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors du changement de mot de passe:', error);
      throw error;
    }
  },

  /**
   * Refreshes the authentication token.
   * This is a client-side call to the backend's /api/v1/auth/refresh endpoint.
   * @returns {Promise<object>} New token and token type.
   * @throws {Error} If token refresh fails.
   */
  refreshToken: async () => {
    try {
      // The current (potentially expired) token is automatically sent by the Axios interceptor.
      // The backend /refresh endpoint will validate it and issue a new one.
      const response = await axios.post(`${API_BASE_URL}/auth/refresh`);
      authService.setToken(response.data.token); // Store the new token
      return response.data;
    } catch (error) {
      console.error('authService.refreshToken: Erreur lors du rafraîchissement du token:', error);
      throw error;
    }
  },
};

export default authService;