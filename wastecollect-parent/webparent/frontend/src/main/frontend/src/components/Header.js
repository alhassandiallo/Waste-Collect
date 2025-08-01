import React, { useContext, useState } from 'react';
import { Navbar, Nav, NavDropdown, Container, Badge, Button } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AuthContext from '../contexts/AuthContext';

/**
 * Composant Header - Barre de navigation principale de l'application WasteCollect
 * Affiche différents menus selon le rôle de l'utilisateur connecté
 * Adapté pour les écrans web et mobile avec Bootstrap responsive
 */
const Header = () => {
  // Récupération du contexte d'authentification
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  
  // Hooks pour la navigation et la localisation
  const navigate = useNavigate();
  const location = useLocation();
  
  // État pour gérer l'affichage des notifications (simulation)
  const [notificationCount] = useState(3);

  /**
   * Gestion de la déconnexion utilisateur
   * Appelle la fonction logout du contexte et redirige vers la page de connexion
   */
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  /**
   * Fonction pour vérifier si un lien est actif
   * @param {string} path - Chemin à vérifier
   * @returns {boolean} - True si le chemin correspond à la route actuelle
   */
  const isActiveLink = (path) => {
    // Check if the current location pathname starts with the given path, for nested routes
    return location.pathname.startsWith(path);
  };

  /**
   * Génération des liens de navigation basés sur le rôle de l'utilisateur
   */
  const renderNavLinks = () => {
    // Ensure user object and roleName exist before attempting to access
    if (!isAuthenticated || !user || !user.roleName) {
      return null; 
    }

    switch (user.roleName) { // Changed user.role to user.roleName
      case 'ADMIN':
        return (
          <>
            <Nav.Link as={Link} to="/admin/dashboard" className={isActiveLink('/admin/dashboard') ? 'active' : ''}>
              Dashboard
            </Nav.Link>
            <Nav.Link as={Link} to="/admin/manage-collectors" className={isActiveLink('/admin/manage-collectors') ? 'active' : ''}>
              Collecteurs
            </Nav.Link>
            <Nav.Link as={Link} to="/admin/manage-households" className={isActiveLink('/admin/manage-households') ? 'active' : ''}>
              Ménages
            </Nav.Link>
            <Nav.Link as={Link} to="/admin/manage-municipalities" className={isActiveLink('/admin/manage-municipalities') ? 'active' : ''}>
              Municipalités
            </Nav.Link>
            <Nav.Link as={Link} to="/admin/reports" className={isActiveLink('/admin/reports') ? 'active' : ''}>
              Rapports
            </Nav.Link>
            {/* <Nav.Link as={Link} to="/admin/settings" className={isActiveLink('/admin/settings') ? 'active' : ''}>
              Paramètres
            </Nav.Link> */} {/* Settings moved to dropdown */}
          </>
        );
      case 'COLLECTOR':
        return (
          <>
            <Nav.Link as={Link} to="/collector/dashboard" className={isActiveLink('/collector/dashboard') ? 'active' : ''}>
              Dashboard
            </Nav.Link>
            <Nav.Link as={Link} to="/collector/service-requests" className={isActiveLink('/collector/service-requests') ? 'active' : ''}>
              Demandes
            </Nav.Link>
            <Nav.Link as={Link} to="/collector/schedule" className={isActiveLink('/collector/schedule') ? 'active' : ''}>
              Mon Planning
            </Nav.Link>
            <Nav.Link as={Link} to="/collector/performance" className={isActiveLink('/collector/performance') ? 'active' : ''}>
              Performance
            </Nav.Link>
            <Nav.Link as={Link} to="/collector/revenue" className={isActiveLink('/collector/revenue') ? 'active' : ''}>
              Revenus
            </Nav.Link>
            {/* <Nav.Link as={Link} to="/collector/alerts" className={isActiveLink('/collector/alerts') ? 'active' : ''}>
              Alertes
            </Nav.Link> */} {/* Alerts might be part of notifications */}
            {/* <Nav.Link as={Link} to="/collector/settings" className={isActiveLink('/collector/settings') ? 'active' : ''}>
              Paramètres
            </Nav.Link> */} {/* Settings moved to dropdown */}
          </>
        );
      case 'HOUSEHOLD':
        return (
          <>
            <Nav.Link as={Link} to="/household/dashboard" className={isActiveLink('/household/dashboard') ? 'active' : ''}>
              Dashboard
            </Nav.Link>
            <Nav.Link as={Link} to="/household/request-pickup" className={isActiveLink('/household/request-pickup') ? 'active' : ''}>
              Demander Collecte
            </Nav.Link>
            <Nav.Link as={Link} to="/household/payment-history" className={isActiveLink('/household/payment-history') ? 'active' : ''}>
              Historique Paiements
            </Nav.Link>
            <Nav.Link as={Link} to="/household/rate-collector" className={isActiveLink('/household/rate-collector') ? 'active' : ''}>
              Évaluer Collecteur {/* New link for RateCollectorPage */}
            </Nav.Link>
          </>
        );
      case 'MUNICIPALITY': 
      case 'MUNICIPAL_MANAGER':
        return (
          <>
            <Nav.Link as={Link} to="/municipality/dashboard" className={isActiveLink('/municipality/dashboard') ? 'active' : ''}>
              Dashboard Municipal
            </Nav.Link>
            <Nav.Link as={Link} to="/municipality/waste-tracking" className={isActiveLink('/municipality/waste-tracking') ? 'active' : ''}>
              Suivi Déchets
            </Nav.Link>
            <Nav.Link as={Link} to="/municipality/underserved-areas" className={isActiveLink('/municipality/underserved-areas') ? 'active' : ''}>
              Zones Non Desservies
            </Nav.Link>
          </>
        );
      default:
        return null;
    }
  };

  /**
   * Helper function to determine the correct settings path based on user role.
   * @param {string} roleName - The role name of the current user.
   * @returns {string} The appropriate settings path.
   */
  const getSettingsPathForRole = (roleName) => {
    switch (roleName) {
      case 'ADMIN':
        return '/admin/settings';
      case 'COLLECTOR':
        return '/collector/settings';
      case 'HOUSEHOLD':
        return '/household/settings'; // Correct path for Household settings
      case 'MUNICIPALITY':
      case 'MUNICIPAL_MANAGER':
        return '/municipality/settings'; // Assuming municipality settings for both
      default:
        return '/profile'; // Fallback to a general profile page if role has no specific settings
    }
  };

  /**
   * Helper function to determine the correct notifications path based on user role.
   * @param {string} roleName - The role name of the current user.
   * @returns {string} The appropriate notifications path.
   */
  const getNotificationsPathForRole = (roleName) => {
    switch (roleName) {
      case 'ADMIN':
        return '/admin/notifications';
      case 'COLLECTOR':
        return '/collector/notifications'; // New page for general collector notifications
      case 'HOUSEHOLD':
        return '/household/notifications'; // Assuming a household notifications page
      case 'MUNICIPALITY':
      case 'MUNICIPAL_MANAGER':
        return '/municipality/notifications'; // Assuming a municipal notifications page
      default:
        return '/notifications'; // Fallback to a general notifications page
    }
  };

  /**
   * Helper function to determine the correct profile path based on user role.
   * This is for the "Mon Profil" link in the dropdown.
   * @param {string} roleName - The role name of the current user.
   * @returns {string} The appropriate profile path.
   */
  const getProfilePathForRole = (roleName) => {
    switch (roleName) {
      case 'ADMIN':
        return '/admin/profile';
      case 'COLLECTOR':
        return '/collector/profile';
      case 'HOUSEHOLD':
        return '/household/profile'; // Correct path for Household Profile
      case 'MUNICIPALITY':
      case 'MUNICIPAL_MANAGER':
        return '/municipality/profile'; // Assuming municipal manager profile
      default:
        return '/profile'; // Fallback general profile page
    }
  };


  return (
    <Navbar bg="dark" variant="dark" expand="lg" sticky="top" className="shadow-sm">
      <Container fluid>
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
          <img
            src="https://placehold.co/40x40/28a745/ffffff?text=WC" // Placeholder for WasteCollect logo
            alt="WasteCollect Logo"
            className="me-2 rounded-circle"
          />
          <span className="fw-bold">WasteCollect</span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {renderNavLinks()}
          </Nav>
          <Nav>
            {isAuthenticated ? (
              <>
                {/* Dynamically determine notifications path based on user role */}
                <Nav.Link as={Link} to={getNotificationsPathForRole(user?.roleName)} className="position-relative">
                  <i className="fas fa-bell"></i> Notifications
                  {notificationCount > 0 && (
                    <Badge pill bg="danger" className="position-absolute top-0 start-100 translate-middle">
                      {notificationCount}
                      <span className="visually-hidden">notifications non lues</span>
                    </Badge>
                  )}
                </Nav.Link>

                {/* Dropdown de Profil Utilisateur */}
                <NavDropdown
                  title={
                    <span className="text-white">
                      <i className="fas fa-user-circle me-1"></i>
                      {user ? `${user.firstName} ${user.lastName}` : 'Profile'} ({user?.roleName})
                    </span>
                  }
                  id="basic-nav-dropdown"
                  align="end" // Align dropdown to the right
                >
                  <NavDropdown.Item as={Link} to={getProfilePathForRole(user?.roleName)}> {/* Use dynamic profile path */}
                    <i className="fas fa-user me-1"></i>
                    Mon Profil
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/disputes">
                    <i className="fas fa-exclamation-circle me-1"></i>
                    Mes Litiges
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} to={getSettingsPathForRole(user?.roleName)}>
                    <i className="fas fa-cog me-1"></i>
                    Paramètres
                  </NavDropdown.Item>
                  
                  <NavDropdown.Divider />
                  
                  {/* Bouton de déconnexion */}
                  <NavDropdown.Item onClick={handleLogout}>
                    <i className="fas fa-sign-out-alt me-1"></i>
                    Se Déconnecter
                  </NavDropdown.Item>
                </NavDropdown>
              </>
            ) : (
              // Boutons de connexion/inscription pour utilisateurs non connectés
              <Nav>
                <Nav.Link 
                  as={Link} 
                  to="/login"
                  className={isActiveLink('/login') ? 'active' : ''}
                >
                  <i className="fas fa-sign-in-alt me-1"></i>
                  Connexion
                </Nav.Link>
                <Nav.Link 
                  as={Link} 
                  to="/register" 
                  variant="outline-light" 
                  size="sm"
                  className={isActiveLink('/register') ? 'active' : ''}
                >
                  <i className="fas fa-user-plus me-1"></i>
                  S'inscrire
                </Nav.Link>
              </Nav>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
