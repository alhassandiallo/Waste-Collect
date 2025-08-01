// frontend/src/contexts/AuthContext.js
import React, { createContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';
import axios from 'axios';
import { toast } from 'react-toastify';

/**
 * Defines the keys used for storing authentication data in localStorage.
 */
const STORAGE_KEYS = {
  USER: 'user',
  TOKEN: 'accessToken',
};

/**
 * Utility for secure storage (using Base64 encoding for this prototype).
 */
const secureStorage = {
  setItem: (key, value) => {
    try {
      const valueToEncode = typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value);
      const encryptedValue = btoa(valueToEncode);
      localStorage.setItem(key, encryptedValue);
    } catch (error) {
      console.error(`Error storing ${key}:`, error);
    }
  },
  getItem: (key) => {
    try {
      const encryptedValue = localStorage.getItem(key);
      if (!encryptedValue) return null;

      const decryptedString = atob(encryptedValue);
      try {
        return JSON.parse(decryptedString);
      } catch (e) {
        return decryptedString;
      }
    } catch (error) {
      console.error(`Error retrieving ${key}:`, error);
      localStorage.removeItem(key); // Clear potentially corrupted item
      return null;
    }
  },
  removeItem: (key) => {
    localStorage.removeItem(key);
  },
};

// Create the AuthContext
const AuthContext = createContext();

/**
 * AuthProvider Component
 * Manages the authentication state, including user data, authentication status,
 * loading states, and authentication errors. It provides methods for login,
 * logout, registration, token refresh, and profile updates.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Initial loading true to check session
  const [authError, setAuthError] = useState(null);

  /**
   * Saves user and token to secure storage.
   * @param {object} userData - User details.
   * @param {string} token - JWT token.
   */
  const saveAuthData = useCallback((userData, token) => {
    secureStorage.setItem(STORAGE_KEYS.USER, userData);
    secureStorage.setItem(STORAGE_KEYS.TOKEN, token);
    setUser(userData);
    setIsAuthenticated(true);
  }, []);

  /**
   * Clears user and token from secure storage and resets state.
   */
  const clearAuthData = useCallback(() => {
    secureStorage.removeItem(STORAGE_KEYS.USER);
    secureStorage.removeItem(STORAGE_KEYS.TOKEN);
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  /**
   * Loads user and token from secure storage on component mount.
   */
  useEffect(() => {
    const loadUserFromStorage = async () => {
      try {
        setIsLoading(true);
        const storedUser = secureStorage.getItem(STORAGE_KEYS.USER);
        const storedToken = secureStorage.getItem(STORAGE_KEYS.TOKEN);

        if (storedUser && storedToken) {
          // Attempt to get a fresh profile and validate token with backend
          // This also ensures the user data in context is always up-to-date
          const profile = await authService.getProfile();
          setUser(profile);
          setIsAuthenticated(true);
          // Set the token for Axios to use in subsequent requests
          authService.setToken(storedToken); // Ensure Axios interceptor has the token
        } else {
          clearAuthData();
        }
      } catch (error) {
        console.error('Failed to load user from storage or refresh token:', error);
        // If profile fetching fails or token is invalid, clear auth data
        clearAuthData();
        toast.error('Session expirée ou invalide. Veuillez vous reconnecter.');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserFromStorage();

    // Set up Axios interceptor for 401 responses to refresh token
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        // Check if it's a 401 error and not a retry
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true; // Mark as retried
          try {
            const result = await authService.refreshToken(); // Call refresh token API
            if (result && result.token) {
              authService.setToken(result.token); // Update token in storage and axios headers
              originalRequest.headers['Authorization'] = `Bearer ${result.token}`;
              return axios(originalRequest); // Retry original request with new token
            }
          } catch (refreshError) {
            console.error('Failed to refresh token:', refreshError);
            clearAuthData(); // Force logout if refresh fails
            setAuthError('Session expirée. Veuillez vous reconnecter.');
            toast.error('Votre session a expiré. Veuillez vous reconnecter.');
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [clearAuthData]);

  /**
   * Handles user login.
   * @param {object} credentials - User login credentials (email, password).
   */
  const login = useCallback(async (credentials) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const response = await authService.login(credentials.email, credentials.password);
      // Backend should return user profile data and token upon successful login
      const { token, user: userData } = response;
      saveAuthData(userData, token); // Store both user data and token
      toast.success('Connexion réussie !');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Échec de la connexion. Veuillez vérifier vos identifiants.';
      setAuthError(errorMessage);
      toast.error(errorMessage);
      throw err; // Re-throw to allow components to catch
    } finally {
      setIsLoading(false);
    }
  }, [saveAuthData]);

  /**
   * Handles user registration.
   * @param {object} userData - User registration data.
   * @param {string} roleType - The type of role for registration (e.g., 'HOUSEHOLD', 'COLLECTOR').
   */
  const register = useCallback(async (userData, roleType) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      let response;
      if (roleType === 'HOUSEHOLD') {
        response = await authService.registerHousehold(userData);
      } else if (roleType === 'COLLECTOR') {
        response = await authService.registerCollector(userData);
      } else if (roleType === 'ADMIN') {
        response = await authService.registerAdmin(userData);
      } else {
        throw new Error('Rôle de l\'utilisateur non supporté pour l\'inscription.');
      }
      toast.success('Inscription réussie !');
      // For registration, we don't necessarily log them in immediately or set auth data
      // unless the backend directly returns tokens for immediate login.
      // Assuming successful registration is enough here.
      return response;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Échec de l\'inscription.';
      setAuthError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Handles user logout.
   */
  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.logout(); // Call backend logout (if any)
      clearAuthData();
      toast.info('Déconnexion réussie.');
    } catch (err) {
      console.error('Logout error:', err);
      toast.error('Erreur lors de la déconnexion.');
    } finally {
      setIsLoading(false);
    }
  }, [clearAuthData]);

  /**
   * Refreshes the authentication token.
   */
  const refreshToken = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await authService.refreshToken();
      if (response && response.token) {
        // Retrieve current user data, then update token
        const storedUser = secureStorage.getItem(STORAGE_KEYS.USER);
        saveAuthData(storedUser, response.token); // Re-save with new token
      }
      return response;
    } catch (err) {
      console.error('AuthContext.refreshToken: Failed to refresh token', err);
      clearAuthData(); // Force logout on refresh failure
      setAuthError('Échec du rafraîchissement de la session.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [clearAuthData, saveAuthData]);

  // Update profile in AuthContext and secure storage
  const updateProfileInContext = useCallback(async (updatedProfileData) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      // Assuming updatedProfileData contains the full DTO structure expected by the backend.
      // The backend 'auth/profile' endpoint should return the updated profile.
      const response = await authService.updateProfile(updatedProfileData);
      // The `response.data` from `authService.updateProfile` should be the updated UserDTO
      // or CollectorProfileDTO, which we then use to update the context.
      const updatedUser = { ...user, ...response }; // Merge existing user data with updated fields

      // Ensure that `roleName` is properly set in the `user` object in context.
      // If the backend `getProfile` or `updateProfile` returns a DTO that has `roleName`,
      // this will be handled. Otherwise, ensure it's manually assigned if needed.
      if (!updatedUser.roleName && user?.roleName) {
        updatedUser.roleName = user.roleName;
      }

      setUser(updatedUser);
      secureStorage.setItem(STORAGE_KEYS.USER, updatedUser); // Update localStorage
      toast.success('Profil mis à jour avec succès.');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Échec de la mise à jour du profil.';
      setAuthError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user]); // Depend on 'user' to ensure we're always working with the latest user state

    // Placeholder for changePassword, actual API call is in authService
    // and coordinated by useAuth. This context only provides the mechanism
    // for useAuth to call authService.
    const changePasswordInContext = useCallback(() => {
        // No direct action in AuthContext, as useAuth handles the service call
        // and error handling for the password change.
    }, []);

    /**
     * Checks if the current user has a specific role.
     * @param {string} role - The role to check (e.g., 'ADMIN', 'COLLECTOR').
     * @returns {boolean} - True if the user has the role, false otherwise.
     */
    const hasRole = useCallback((role) => {
        // Use user?.roleName as the source of truth for the role
        return user?.roleName === role;
    }, [user]);

    /**
     * Clears any authentication errors.
     */
    const clearError = () => {
        setAuthError(null);
    };

    const contextValue = {
        user,
        isAuthenticated,
        isLoading,
        authError,
        login,
        register, // Exposing register function from context
        logout,
        refreshToken,
        updateProfile: updateProfileInContext,
        changePassword: changePasswordInContext,
        hasRole,
        clearError,
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;