import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from './AuthContext'; // Import AuthContext - This path is correct if both are in 'src/contexts/'

/**
 * CONTEXTE UTILISATEUR POUR LA PLATEFORME WASTECOLLECT
 *
 * Ce contexte gère l'état global de l'utilisateur connecté et fournit
 * des méthodes pour l'authentification et la gestion des données utilisateur.
 *
 * Supporte tous les types d'utilisateurs :
 * - ADMIN : Gestion globale de la plateforme
 * - COLLECTOR : Collecteurs de déchets
 * - HOUSEHOLD : Ménages/Foyers
 * - MUNICIPALITY : Municipalités
 * - MUNICIPAL_MANAGER: Gérants Municipaux (ajouté pour cohérence)
 */

// Création du contexte utilisateur
const UserContext = createContext();

// Types d'actions pour le reducer
const USER_ACTIONS = {
  SET_USER_DATA: 'SET_USER_DATA', // To set user data derived from AuthContext
  SET_LOADING: 'SET_LOADING', // Only for UserContext's internal loading, if any
  SET_ERROR: 'SET_ERROR', // Only for UserContext's internal errors
  LOGOUT: 'LOGOUT', // Triggered by AuthContext's logout
  UPDATE_PROFILE: 'UPDATE_PROFILE', // Update user data within UserContext
  SET_PREFERENCES: 'SET_PREFERENCES',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// État initial
const initialState = {
  currentUserData: null, // Detailed user data fetched after authentication
  userPreferences: {},
  isLoading: true, // Loading state for user data (separate from auth loading)
  error: null,
};

/**
 * Reducer pour gérer l'état de l'utilisateur
 * @param {Object} state - L'état actuel
 * @param {Object} action - L'action à effectuer
 */
const userReducer = (state, action) => {
  switch (action.type) {
    case USER_ACTIONS.SET_USER_DATA:
      return {
        ...state,
        currentUserData: action.payload,
        isLoading: false,
        error: null,
      };
    case USER_ACTIONS.SET_LOADING:
      return { ...state, isLoading: action.payload };
    case USER_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, isLoading: false };
    case USER_ACTIONS.LOGOUT:
      return { ...initialState, isLoading: false }; // Reset state on logout
    case USER_ACTIONS.UPDATE_PROFILE:
      return {
        ...state,
        currentUserData: { ...state.currentUserData, ...action.payload },
      };
    case USER_ACTIONS.SET_PREFERENCES:
      return {
        ...state,
        userPreferences: { ...state.userPreferences, ...action.payload },
      };
    case USER_ACTIONS.CLEAR_ERROR:
        return { ...state, error: null };
    default:
      return state;
  }
};

/**
 * Fournisseur de contexte pour l'utilisateur
 * @param {Object} { children } - Les composants enfants à envelopper
 */
export const UserProvider = ({ children }) => {
  const [state, dispatch] = useReducer(userReducer, initialState);
  const { user: authUser, isAuthenticated, isLoading: authLoading, hasRole: authHasRole } = useContext(AuthContext);

  // Effect to sync user data from AuthContext
  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated && authUser) {
        dispatch({ type: USER_ACTIONS.SET_USER_DATA, payload: authUser });
      } else {
        dispatch({ type: USER_ACTIONS.LOGOUT }); // Ensure user state is cleared on auth logout
      }
    }
  }, [authUser, isAuthenticated, authLoading]);

  // Simulate fetching more detailed user data or preferences if needed
  // This could be another useEffect that runs when authUser changes, if 'currentUserData'
  // needs to be different/more detailed than what AuthContext provides directly.
  /*
  useEffect(() => {
    const fetchDetailedUserData = async () => {
      if (isAuthenticated && authUser && authUser.id) {
        dispatch({ type: USER_ACTIONS.SET_LOADING, payload: true });
        try {
          // Replace with actual API call to fetch user profile details
          const response = await userService.getUserProfile(authUser.id);
          dispatch({ type: USER_ACTIONS.SET_USER_DATA, payload: response.data });
        } catch (err) {
          dispatch({ type: USER_ACTIONS.SET_ERROR, payload: 'Failed to load user profile data.' });
          console.error('Failed to load user profile data:', err);
        }
      }
    };

    fetchDetailedUserData();
  }, [isAuthenticated, authUser]);
  */


  /**
   * Vérifie si l'utilisateur a une permission spécifique.
   * Cette fonction dépendra du `role` de l'utilisateur obtenu de `AuthContext`.
   * Pour une gestion plus granulaire, un backend devrait fournir des permissions.
   * @param {string} permission - La permission à vérifier (ex: 'CREATE_USER', 'VIEW_REPORTS')
   * @returns {boolean}
   */
  const hasPermission = useCallback((permission) => {
    if (!state.currentUserData || !state.currentUserData.role) {
      return false;
    }

    const userRole = state.currentUserData.role;

    // Simple permission logic based on role (expand as needed)
    switch (userRole) {
      case 'ADMIN':
        return true; // Admin has all permissions
      case 'MUNICIPAL_MANAGER':
      case 'MUNICIPALITY':
        return ['VIEW_REPORTS', 'MANAGE_COLLECTORS', 'VIEW_WASTE_TRACKING'].includes(permission);
      case 'COLLECTOR':
        return ['VIEW_SERVICE_REQUESTS', 'UPDATE_SERVICE_STATUS', 'VIEW_SCHEDULE'].includes(permission);
      case 'HOUSEHOLD':
        return ['REQUEST_PICKUP', 'VIEW_PAYMENT_HISTORY', 'RATE_COLLECTOR'].includes(permission);
      default:
        return false;
    }
  }, [state.currentUserData]);

  // Expose simplified loading state (combining auth and user data loading)
  const combinedLoading = authLoading || state.isLoading;


  const contextValue = {
    user: state.currentUserData,
    isAuthenticated, // From AuthContext
    isLoading: combinedLoading,
    error: state.error,
    userPreferences: state.userPreferences,
    hasRole: authHasRole, // Use the hasRole from AuthContext
    hasPermission,
    // Methods to dispatch actions (e.g., to update user preferences or profile data
    // which would then trigger an API call and update currentUserData)
    setUserPreferences: (prefs) => dispatch({ type: USER_ACTIONS.SET_PREFERENCES, payload: prefs }),
    // Assuming profile updates go through authService and AuthContext
    // updateProfile: (data) => dispatch({ type: USER_ACTIONS.UPDATE_PROFILE, payload: data }),
    clearUserError: () => dispatch({ type: USER_ACTIONS.CLEAR_ERROR }),
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

/**
 * Hook personnalisé pour utiliser les données de l'utilisateur
 * avec vérification d'erreur intégrée
 */
export const useUser = () => {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error('useUser doit être utilisé à l\'intérieur d\'un UserProvider');
  }

  return context;
};

/**
 * HOC POUR LA PROTECTION DES ROUTES
 *
 * Composant d'ordre supérieur pour protéger les routes
 * qui nécessitent une authentification
 */
export const withAuth = (WrappedComponent, requiredPermissions = []) => {
  return function AuthenticatedComponent(props) {
    // This HOC should ideally use `useAuth` or `useUser` (if user provides all needed auth props)
    // Given the refactor, `useUser` now gets its auth state from `AuthContext`, so it's fine.
    const { isAuthenticated, hasPermission, isLoading } = useUser(); // Using useUser

    // Affichage du chargement
    if (isLoading) {
      return <div className="loading-spinner">Chargement...</div>;
    }

    // Vérification de l'authentification
    if (!isAuthenticated) {
      // Use Navigate for proper routing
      return <Navigate to="/login" replace />;
    }

    // Vérification des permissions
    if (requiredPermissions.length > 0) {
      const hasRequiredPermissions = requiredPermissions.every(permission =>
        hasPermission(permission)
      );

      if (!hasRequiredPermissions) {
        return <Navigate to="/unauthorized" replace />;
      }
    }

    return <WrappedComponent {...props} />;
  };
};

