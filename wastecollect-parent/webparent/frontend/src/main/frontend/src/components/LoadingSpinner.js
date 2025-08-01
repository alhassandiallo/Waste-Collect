import React from 'react';
import { Spinner, Container, Row, Col } from 'react-bootstrap';

/**
 * Composant LoadingSpinner - Indicateur de chargement réutilisable
 * Utilisé pendant les opérations asynchrones (authentification, requêtes API, etc.)
 * Propose différentes variantes d'affichage selon le contexte d'utilisation
 */
const LoadingSpinner = ({ 
  message = 'Chargement en cours...', 
  size = 'md', 
  variant = 'primary',
  overlay = false,
  fullScreen = false,
  showLogo = false,
  children
}) => {
  
  /**
   * Fonction pour déterminer la taille du spinner selon le prop size
   * @param {string} size - Taille demandée (sm, md, lg, xl)
   * @returns {Object} - Objet contenant les propriétés de style
   */
  const getSpinnerSize = (size) => {
    switch (size) {
      case 'sm':
        return { width: '1.5rem', height: '1.5rem' };
      case 'lg':
        return { width: '3rem', height: '3rem' };
      case 'xl':
        return { width: '4rem', height: '4rem' };
      default: // md
        return { width: '2rem', height: '2rem' };
    }
  };

  /**
   * Fonction pour obtenir la classe CSS du texte selon la taille
   * @param {string} size - Taille du spinner
   * @returns {string} - Classe CSS appropriée
   */
  const getTextSize = (size) => {
    switch (size) {
      case 'sm':
        return 'small';
      case 'lg':
        return 'h6';
      case 'xl':
        return 'h5';
      default:
        return '';
    }
  };

  /**
   * Composant Logo animé pour l'écran de chargement principal
   */
  const AnimatedLogo = () => (
    <div className="mb-3">
      <div 
        className="d-inline-block position-relative"
        style={{
          animation: 'pulse 2s infinite'
        }}
      >
        <i 
          className="fas fa-recycle text-success" 
          style={{ 
            fontSize: size === 'xl' ? '4rem' : size === 'lg' ? '3rem' : '2rem',
            animation: 'spin 3s linear infinite'
          }}
        ></i>
      </div>
      <div className="mt-2">
        <strong className="text-primary">WasteCollect</strong>
      </div>
    </div>
  );

  /**
   * Spinner simple pour utilisation inline
   */
  const SimpleSpinner = () => (
    <div className="d-flex align-items-center justify-content-center">
      <Spinner
        animation="border"
        variant={variant}
        style={getSpinnerSize(size)}
        className="me-2"
      />
      {message && (
        <span className={`text-${variant} ${getTextSize(size)}`}>
          {message}
        </span>
      )}
    </div>
  );

  /**
   * Spinner avec overlay pour masquer le contenu pendant le chargement
   */
  const OverlaySpinner = () => (
    <div 
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        zIndex: 9999,
        backdropFilter: 'blur(2px)'
      }}
    >
      <div className="text-center">
        {showLogo && <AnimatedLogo />}
        <Spinner
          animation="border"
          variant={variant}
          style={getSpinnerSize(size)}
          className="mb-3"
        />
        {message && (
          <div className={`text-${variant} ${getTextSize(size)}`}>
            {message}
          </div>
        )}
        {children}
      </div>
    </div>
  );

  /**
   * Spinner plein écran pour le chargement initial de l'application
   */
  const FullScreenSpinner = () => (
    <div 
      className="min-vh-100 d-flex align-items-center justify-content-center bg-light"
      style={{ 
        backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}
    >
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} md={6} lg={4} className="text-center">
            <div className="card border-0 shadow-lg bg-white text-dark rounded-3">
              <div className="card-body p-5">
                {showLogo && <AnimatedLogo />}
                
                {/* Spinner principal */}
                <div className="mb-4">
                  <Spinner
                    animation="border"
                    variant={variant}
                    style={getSpinnerSize(size)}
                  />
                </div>

                {/* Message de chargement */}
                {message && (
                  <h6 className={`text-${variant} mb-3`}>
                    {message}
                  </h6>
                )}

                {/* Barre de progression animée */}
                <div className="progress mb-3" style={{ height: '4px' }}>
                  <div 
                    className={`progress-bar progress-bar-striped progress-bar-animated bg-${variant}`}
                    style={{ 
                      width: '100%',
                      animation: 'loading-bar 2s ease-in-out infinite'
                    }}
                  ></div>
                </div>

                {/* Conseil ou information additionnelle */}
                <small className="text-muted">
                  {children || 'Préparation de votre espace de travail...'}
                </small>

                {/* Points de chargement animés */}
                <div className="mt-3">
                  <span className="text-muted">
                    <span 
                      className="d-inline-block me-1"
                      style={{ animation: 'blink 1.4s infinite both' }}
                    >
                      •
                    </span>
                    <span 
                      className="d-inline-block me-1"
                      style={{ animation: 'blink 1.4s infinite both', animationDelay: '0.2s' }}
                    >
                      •
                    </span>
                    <span 
                      className="d-inline-block"
                      style={{ animation: 'blink 1.4s infinite both', animationDelay: '0.4s' }}
                    >
                      •
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );

  /**
   * Spinner dans une carte pour sections spécifiques
   */
  const CardSpinner = () => (
    <div className="card border-0 shadow-sm">
      <div className="card-body text-center py-5">
        <Spinner
          animation="border"
          variant={variant}
          style={getSpinnerSize(size)}
          className="mb-3"
        />
        {message && (
          <div className={`text-${variant} ${getTextSize(size)}`}>
            {message}
          </div>
        )}
        {children}
      </div>
    </div>
  );

  /**
   * Spinner en ligne pour boutons et éléments compacts
   */
  const InlineSpinner = () => (
    <span className="d-inline-flex align-items-center">
      <Spinner
        animation="border"
        size="sm"
        variant={variant}
        className="me-2"
      />
      {message}
    </span>
  );

  // Styles CSS additionnels intégrés (pour les animations)
  React.useEffect(() => {
    // Injection des styles d'animation si pas déjà présents
    if (!document.querySelector('#loading-spinner-styles')) {
      const style = document.createElement('style');
      style.id = 'loading-spinner-styles';
      style.textContent = `
        @keyframes loading-bar {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0.3; }
        }
        
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // Rendu conditionnel selon le type de spinner demandé
  if (fullScreen) {
    return <FullScreenSpinner />;
  }
  
  if (overlay) {
    return <OverlaySpinner />;
  }
  
  if (size === 'card') {
    return <CardSpinner />;
  }
  
  if (size === 'inline') {
    return <InlineSpinner />;
  }
  
  // Spinner simple par défaut
  return <SimpleSpinner />;
};

/**
 * Composant LoadingButton - Bouton avec état de chargement
 * Utilisé pour les actions qui nécessitent une attente (soumission de formulaire, etc.)
 */
export const LoadingButton = ({ 
  loading = false, 
  disabled = false, 
  children, 
  variant = 'primary',
  size = 'md',
  loadingText = 'Chargement...',
  ...props 
}) => {
  return (
    <button
      {...props}
      className={`btn btn-${variant} ${size !== 'md' ? `btn-${size}` : ''} ${props.className || ''}`}
      disabled={loading || disabled}
    >
      {loading ? (
        <>
          <Spinner
            animation="border"
            size="sm"
            className="me-2"
          />
          {loadingText}
        </>
      ) : (
        children
      )}
    </button>
  );
};

/**
 * Composant LoadingCard - Carte avec état de chargement pour le contenu
 * Utilisé pour afficher un placeholder pendant le chargement des données
 */
export const LoadingCard = ({ 
  loading = false, 
  children, 
  loadingMessage = 'Chargement des données...',
  className = '',
  ...props 
}) => {
  return (
    <div className={`card ${className}`} {...props}>
      {loading ? (
        <div className="card-body text-center py-5">
          <LoadingSpinner 
            message={loadingMessage}
            size="lg"
            variant="primary"
          />
        </div>
      ) : (
        children
      )}
    </div>
  );
};

export default LoadingSpinner;