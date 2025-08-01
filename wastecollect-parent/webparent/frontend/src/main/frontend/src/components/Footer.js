import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom'; // Import useLocation
import useAuth from '../hooks/useAuth'; // Import useAuth hook

/**
 * Composant Footer - Pied de page de l'application WasteCollect
 * Contient les informations de contact, liens utiles et mentions légales
 * Adapté pour l'affichage responsive sur web et mobile
 */
const Footer = () => {
  // Année actuelle pour le copyright
  const currentYear = new Date().getFullYear();

  // Get authentication status from AuthContext
  const { isAuthenticated } = useAuth();
  // Get current location from React Router
  const location = useLocation();

  // Determine if the current page is login or register
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <footer className="bg-dark text-light mt-auto">
      {/* Section principale du footer - Conditionally rendered */}
      {/* This container will only be visible if the user is authenticated AND not on an auth page */}
      {isAuthenticated && !isAuthPage && (
        <div className="py-4">
          <Container>
            <Row>
              {/* Colonne 1: À propos de WasteCollect */}
              <Col md={4} className="mb-3">
                <h5 className="mb-3">
                  <i className="fas fa-recycle me-2 text-success"></i>
                  WasteCollect
                </h5>
                <p className=" small">
                  Plateforme digitale de gestion des déchets ménagers, connectant 
                  collecteurs, ménages, municipalités et administrateurs pour une 
                  gestion efficace et transparente des déchets urbains.
                </p>
                <div className="d-flex gap-3">
                  {/* Réseaux sociaux - Keep them text-light for contrast on dark background */}
                  <a href="#" className="text-light text-decoration-none">
                    <i className="fab fa-facebook-f"></i>
                  </a>
                  <a href="#" className="text-light text-decoration-none">
                    <i className="fab fa-twitter"></i>
                  </a>
                  <a href="#" className="text-light text-decoration-none">
                    <i className="fab fa-linkedin-in"></i>
                  </a>
                  <a href="#" className="text-light text-decoration-none">
                    <i className="fab fa-instagram"></i>
                  </a>
                </div>
              </Col>

              {/* Colonne 2: Liens rapides */}
              <Col md={2} className="mb-3">
                <h6 className="mb-3 text-uppercase fw-bold">Liens Rapides</h6>
                <ul className="list-unstyled">
                  <li className="mb-2">
                    {/* Changed to text-light for visibility on dark background */}
                    <Link to="/about" className="text-light text-decoration-none small">
                      <i className="fas fa-chevron-right me-1"></i>
                      À propos
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link to="/services" className="text-light text-decoration-none small">
                      <i className="fas fa-chevron-right me-1"></i>
                      Nos Services
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link to="/how-it-works" className="text-light text-decoration-none small">
                      <i className="fas fa-chevron-right me-1"></i>
                      Comment ça marche
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link to="/pricing" className="text-light text-decoration-none small">
                      <i className="fas fa-chevron-right me-1"></i>
                      Tarification
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link to="/faq" className="text-light text-decoration-none small">
                      <i className="fas fa-chevron-right me-1"></i>
                      FAQ
                    </Link>
                  </li>
                </ul>
              </Col>

              {/* Colonne 3: Support et aide */}
              <Col md={3} className="mb-3">
                <h6 className="mb-3 text-uppercase fw-bold">Support</h6>
                <ul className="list-unstyled">
                  <li className="mb-2">
                    <Link to="/help" className="text-light text-decoration-none small">
                      <i className="fas fa-question-circle me-1"></i>
                      Centre d'aide
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link to="/contact" className="text-light text-decoration-none small">
                      <i className="fas fa-envelope me-1"></i>
                      Nous contacter
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link to="/report-issue" className="text-light text-decoration-none small">
                      <i className="fas fa-bug me-1"></i>
                      Signaler un problème
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link to="/feedback" className="text-light text-decoration-none small">
                      <i className="fas fa-comment me-1"></i>
                      Feedback
                    </Link>
                  </li>
                  <li className="mb-2">
                    <a 
                      href="tel:+224000000000" 
                      className="text-light text-decoration-none small"
                    >
                      <i className="fas fa-phone me-1"></i>
                      Urgence: +224 000 000 000
                    </a>
                  </li>
                </ul>
              </Col>

              {/* Colonne 4: Informations de contact */}
              <Col md={3} className="mb-3">
                <h6 className="mb-3 text-uppercase fw-bold">Contact</h6>
                <div className=" small"> {/* This div has 'small' class */}
                  <div className="mb-2">
                    <i className="fas fa-map-marker-alt me-2"></i>
                    Conakry, République de Guinée
                  </div>
                  <div className="mb-2">
                    <i className="fas fa-envelope me-2"></i>
                    {/* Changed to text-light for consistency */}
                    <a 
                      href="mailto:contact@wastecollect.gn" 
                      className="text-light text-decoration-none"
                    >
                      contact@wastecollect.gn
                    </a>
                  </div>
                  <div className="mb-2">
                    <i className="fas fa-phone me-2"></i>
                    {/* Changed to text-light for consistency */}
                    <a 
                      href="tel:+224123456789" 
                      className="text-light text-decoration-none"
                    >
                      +224 123 456 789
                    </a>
                  </div>
                  <div className="mb-2">
                    <i className="fas fa-clock me-2"></i>
                    Lun - Ven: 8h00 - 18h00
                  </div>
                  <div className="mb-2">
                    <i className="fas fa-calendar-alt me-2"></i>
                    Sam: 8h00 - 14h00
                  </div>
                </div>

                {/* Application mobile */}
                <div className="mt-3">
                  <h6 className="small text-uppercase fw-bold mb-2">Application Mobile</h6>
                  <div className="d-flex flex-column gap-1">
                    <a href="#" className="text-decoration-none">
                      <img 
                        src="/assets/images/app-store-badge.png" 
                        alt="Télécharger sur App Store" 
                        className="img-fluid"
                        style={{ maxHeight: '35px' }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </a>
                    <a href="#" className="text-decoration-none">
                      <img 
                        src="/assets/images/google-play-badge.png" 
                        alt="Télécharger sur Google Play" 
                        className="img-fluid"
                        style={{ maxHeight: '35px' }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </a>
                  </div>
                </div>
              </Col>
            </Row>
          </Container>
        </div>
      )}

      {/* Séparateur */}
      <hr className="my-0" style={{ borderColor: '#495057' }} />

      {/* Section copyright et mentions légales */}
      <div className="py-3">
        <Container>
          <Row className="align-items-center">
            <Col md={6} className="text-center text-md-start">
              <small className="">
                © {currentYear} WasteCollect. Tous droits réservés.
                <span className="d-none d-md-inline">
                  {' '}Développé avec ❤️ pour un environnement plus propre.
                </span>
              </small>
            </Col>
            <Col md={6} className="text-center text-md-end mt-2 mt-md-0">
              <div className="d-flex justify-content-center justify-content-md-end gap-3">
                {/* Changed to text-light for consistency */}
                <Link 
                  to="/privacy-policy" 
                  className="text-light text-decoration-none small"
                >
                  Politique de confidentialité
                </Link>
                <Link 
                  to="/terms-of-service" 
                  className="text-light text-decoration-none small"
                >
                  Conditions d'utilisation
                </Link>
                <Link 
                  to="/cookies-policy" 
                  className="text-light text-decoration-none small"
                >
                  Cookies
                </Link>
              </div>
            </Col>
          </Row>

          {/* Informations techniques et partenaires */}
          <Row className="mt-3">
            <Col className="text-center">
              <div className="d-flex justify-content-center align-items-center gap-4 flex-wrap">
                {/* Badge de statut du système */}
                <div className="d-flex align-items-center">
                  <span className="badge bg-success me-2">
                    <i className="fas fa-circle" style={{ fontSize: '0.5rem' }}></i>
                  </span>
                  <small className="">Système opérationnel</small>
                </div>

                {/* Informations de version */}
                <small className="">
                  <i className="fas fa-code me-1"></i>
                  Version 1.0.0
                </small>

                {/* Partenaire technique */}
                <small className="">
                  <i className="fas fa-handshake me-1"></i>
                  En partenariat avec Enabel
                </small>

                {/* Technologies utilisées */}
                <div className="d-none d-lg-flex align-items-center gap-2">
                  <small className="">Propulsé par:</small>
                  <span className="badge bg-secondary">React</span>
                  <span className="badge bg-secondary">Spring Boot</span>
                  <span className="badge bg-secondary">MySQL</span>
                </div>
              </div>
            </Col>
          </Row>

          {/* Message motivationnel */}
          <Row className="mt-3">
            <Col className="text-center">
              <small className=" fst-italic">
                "Ensemble pour une gestion durable des déchets en Guinée"
              </small>
            </Col>
          </Row>
        </Container>
      </div>
    </footer>
  );
};

export default Footer;
