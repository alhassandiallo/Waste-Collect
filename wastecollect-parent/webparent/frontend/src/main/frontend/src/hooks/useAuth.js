// frontend/src/hooks/useAuth.js
import { useState, useEffect, useContext, useCallback } from 'react';
import AuthContext from '../contexts/AuthContext';
import authService from '../services/authService';
import { toast } from 'react-toastify';

/**
 * Hook personnalisé pour gérer l'authentification dans l'application WasteCollect
 * Centralise toute la logique d'authentification et fournit une interface simple
 * pour les composants qui ont besoin d'accéder aux informations d'authentification
 */
const useAuth = () => {
  // Obtient les valeurs du contexte
  const context = useContext(AuthContext);

  // S'assurer que le hook est utilisé à l'intérieur d'un AuthProvider
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }

  // Déstructure les valeurs d'AuthContext
  const {
    user,
    isAuthenticated,
    isLoading: contextLoading,
    authError: contextError,
    login: contextLogin,
    register: contextRegister,
    logout: contextLogout,
    refreshToken: contextRefreshToken,
    updateProfile: contextUpdateProfileInContext,
    hasRole,
    clearError: contextClearError,
  } = context;

  // État local pour le statut de traitement (peut être fusionné avec contextLoading si désiré)
  const [isProcessing, setIsProcessing] = useState(false);

  /**
   * Fonction de connexion
   * Dèlegue la
   */
  const login = useCallback(async (credentials) => {
    setIsProcessing(true);
    try {
      await contextLogin(credentials);
      return true;
    } catch (error) {
      console.error('Login failed in useAuth:', error);
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [contextLogin]);

  /**
   * Fonction d'inscription
   * @param {Object} userData - Données de l'utilisateur pour l'inscription.
   * @param {string} roleType - Le type de rôle pour l'inscription (e.g., 'HOUSEHOLD', 'COLLECTOR').
   * @returns {boolean} - True si l'inscription est réussie, false sinon.
   */
  const register = useCallback(async (userData, roleType) => {
    setIsProcessing(true);
    try {
      await contextRegister(userData, roleType);
      toast.success('Compte créé avec succès !');
      return true;
    } catch (error) {
      console.error('Registration failed in useAuth:', error);
      toast.error(error.message || 'Échec de l\'inscription.');
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [contextRegister]);

  /**
   * Fonction de déconnexion
   * Dèlegue à AuthContext.
   */
  const logout = useCallback(() => {
    contextLogout();
    toast.info('Vous avez été déconnecté.');
  }, [contextLogout]);

  /**
   * Fonction de rafraîchissement du token
   * Dèlegue à AuthContext.
   */
  const refreshToken = useCallback(async () => {
    try {
      await contextRefreshToken();
      return true;
    } catch (error) {
      console.error('Token refresh failed in useAuth:', error);
      // Optionally, force logout if refresh fails
      contextLogout();
      return false;
    }
  }, [contextRefreshToken, contextLogout]);

  /**
   * Met à jour le profil de l'utilisateur.
   * Cette fonction gère l'appel API et la mise à jour de l'état global de l'utilisateur.
   * @param {Object} profileData - Les données du profil à mettre à jour.
   * @returns {boolean} - True si la mise à jour est réussie, false sinon.
   */
  const updateProfile = useCallback(async (profileData) => {
    setIsProcessing(true);
    try {
      // Assuming contextUpdateProfileInContext now correctly takes the DTO and handles the API call
      // and updates the user in the context.
      await contextUpdateProfileInContext(profileData);
      toast.success('Profil mis à jour avec succès.');
      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Échec de la mise à jour du profil.';
      toast.error(errorMessage);
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [contextUpdateProfileInContext]);

  /**
   * Change le mot de passe de l'utilisateur.
   * @param {string} currentPassword - Le mot de passe actuel de l'utilisateur.
   * @param {string} newPassword - Le nouveau mot de passe.
   * @param {string} confirmNewPassword - La confirmation du nouveau mot de passe.
   * @returns {boolean} - True si le mot de passe est mis à jour avec succès, false sinon.
   */
  const changePassword = useCallback(async (currentPassword, newPassword, confirmNewPassword) => {
    setIsProcessing(true);
    try {
      if (newPassword !== confirmNewPassword) {
        toast.error('Le nouveau mot de passe et la confirmation ne correspondent pas.');
        return false;
      }
      // Directly call authService for password change
      await authService.changePassword(currentPassword, newPassword);
      toast.success('Mot de passe mis à jour avec succès.');
      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Échec du changement de mot de passe.';
      toast.error(errorMessage);
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  /**
   * Fonction pour effacer les erreurs d'authentification
   * Dèlegue à AuthContext.
   */
  const clearAuthError = () => {
    contextClearError();
  };

  // Interface publique du hook
  return {
    // États d'authentification
    user,
    isAuthenticated,
    isLoading: contextLoading || isProcessing, // Combine les états de chargement
    authError: contextError, // Utilise l'erreur directement du contexte

    // Fonctions d'authentification
    login,
    register,
    logout,
    refreshToken,
    updateProfile,
    changePassword,

    // Fonctions utilitaires
    hasRole, // Directement du contexte
    hasAnyRole: (requiredRoles) => {
      if (!user || !user.roleName) return false; // Use roleName here
      return requiredRoles.includes(user.roleName);
    },
    clearAuthError,

    // Raccourcis pour les rôles courants - CHANGÉ EN FONCTIONS
    isAdmin: () => hasRole('ADMIN'),
    isCollector: () => hasRole('COLLECTOR'),
    isHousehold: () => hasRole('HOUSEHOLD'),
    isMunicipality: () => hasRole('MUNICIPALITY'),
    isMunicipalManager: () => hasRole('MUNICIPAL_MANAGER'),
  };
};

export default useAuth;