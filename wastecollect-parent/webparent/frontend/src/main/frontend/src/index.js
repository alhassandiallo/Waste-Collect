/**
 * Point d'entrée principal de l'application React WasteCollect
 * Ce fichier initialise l'application React et configure les services essentiels
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // Composant racine de l'application
import './styles/main.css'; // Styles personnalisés de l'application

// Import des polyfills pour la compatibilité navigateur
import 'core-js/stable';
import 'regenerator-runtime/runtime';

/**
 * Configuration et initialisation des services de l'application
 */

// Configuration de l'intercepteur Axios pour les requêtes API
import axios from 'axios';
import authService from './services/authService'; // Import authService for token logic

// Configuration de base d'Axios
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8080/backend/api';
axios.defaults.timeout = 10000; // Timeout de 10 secondes
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Intercepteur pour ajouter le token d'authentification à chaque requête
axios.interceptors.request.use(
  (config) => {
    try {
      // Use the centralized getToken function from authService
      const token = authService.getToken(); 
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout du token d\'authentification:', error);
      // Gérer l'erreur, par exemple en déconnectant l'utilisateur
      window.dispatchEvent(new CustomEvent('authenticationError', { detail: { message: 'Token invalide ou expiré. Veuillez vous reconnecter.' } }));
      return Promise.reject(error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les réponses d'erreur (par exemple, 401 Unauthorized, 403 Forbidden)
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status } = error.response;
      if (status === 401 || status === 403) {
        console.error(`Erreur d'authentification ou d'autorisation: ${status}`);
        // Dispatch custom event to handle authentication errors globally
        window.dispatchEvent(new CustomEvent('authenticationError', {
          detail: { message: 'Session expirée ou accès non autorisé. Veuillez vous reconnecter.', status }
        }));
      } else if (status >= 500) {
        console.error(`Erreur serveur: ${status}`);
        window.dispatchEvent(new CustomEvent('serverError', {
          detail: { message: 'Une erreur interne du serveur est survenue. Veuillez réessayer plus tard.', status }
        }));
      }
    }
    return Promise.reject(error);
  }
);


/**
 * Composant ErrorBoundary pour capturer les erreurs React
 * Empêche l'application de crasher et affiche un message d'erreur de repli
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Mettre à jour l'état pour que le prochain rendu affiche l'UI de repli
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Vous pouvez également enregistrer l'erreur dans un service de rapport d'erreurs
    console.error("Erreur React non capturée:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // Vous pouvez rendre n'importe quelle UI de repli personnalisée
      return (
        <div className="container mt-5">
          <div className="row justify-content-center">
            <div className="col-md-8">
              <div className="alert alert-danger text-center" role="alert">
                <h4 className="alert-heading">Oops! Une erreur est survenue.</h4>
                <p>
                  Nous sommes désolés, quelque chose s'est mal passé.
                  Veuillez essayer de recharger la page.
                </p>
                <button
                  className="btn btn-outline-danger"
                  onClick={() => window.location.reload()}
                >
                  <i className="fas fa-redo me-2"></i>
                  Recharger la page
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Fonction utilitaire pour vérifier la connectivité réseau
 */
const checkNetworkStatus = () => {
  const updateOnlineStatus = () => {
    const isOnline = navigator.onLine;
    console.log(`🌐 Statut réseau: ${isOnline ? 'En ligne' : 'Hors ligne'}`);
    
    window.dispatchEvent(new CustomEvent('networkStatusChange', { 
      detail: { isOnline } 
    }));
  };

  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
};

// Initialiser la surveillance du réseau
checkNetworkStatus();

/**
 * Configuration du mode strict React pour le développement
 */
const StrictModeWrapper = ({ children }) => {
  if (process.env.NODE_ENV === 'development') {
    return <React.StrictMode>{children}</React.StrictMode>;
  }
  return children;
};

/**
 * Rendu de l'application React
 */
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <StrictModeWrapper>
    <ErrorBoundary>
      {/* --- START OF MODIFICATION ---
        The AuthProvider from App.js is the single source of truth for auth context.
        The redundant provider that was here has been removed to prevent context conflicts
        and rendering issues.
        --- END OF MODIFICATION ---
      */}
      <App />
    </ErrorBoundary>
  </StrictModeWrapper>
);
