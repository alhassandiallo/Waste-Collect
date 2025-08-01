import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

/**
 * Composant UnauthorizedPage - Affiche un message d'accès non autorisé.
 * Permet de rediriger l'utilisateur vers la page d'accueil ou de connexion.
 */
const UnauthorizedPage = () => {
  return (
    <Container className="d-flex align-items-center justify-content-center min-vh-100 text-center">
      <Row>
        <Col>
          {/* Replaced FaExclamationTriangle with an inline SVG */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 576 512"
            fill="currentColor"
            width="80px"
            height="80px"
            className="text-warning mb-4"
            aria-hidden="true"
          >
            {/*! Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License) Copyright 2024 Fonticons, Inc. */}
            <path d="M569.5 440.3L344.7 33.4c-6.1-11.7-18.4-18.8-31.5-18.8s-25.4 7.1-31.5 18.8L6.5 440.3C.4 452 .9 460.9 9.9 460.9h556.2c9.1 0 9.7-8.9 3.4-20.6zM288 352c-17.7 0-32-14.3-32-32V208c0-17.7 14.3-32 32-32s32 14.3 32 32v112c0 17.7-14.3 32-32 32zm32 128c0-17.7-14.3-32-32-32s-32 14.3-32 32 14.3 32 32 32 32-14.3 32-32z"/>
          </svg>
          <h1 className="display-4 text-danger">Accès Non Autorisé</h1>
          <p className="lead">
            Vous n'avez pas la permission d'accéder à cette page.
          </p>
          <hr className="my-4" />
          <p>
            Veuillez vous assurer que vous êtes connecté avec le bon rôle ou contactez l'administrateur.
          </p>
          <Button as={Link} to="/login" variant="primary" className="me-3">
            {/* Replaced FaHome with an inline SVG or a simple text/emoji if SVG is too complex */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 576 512"
              fill="currentColor"
              width="16px"
              height="16px"
              className="me-2"
              aria-hidden="true"
            >
              {/*! Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License) Copyright 2024 Fonticons, Inc. */}
              <path d="M575.8 255.5c0 18-15.6 32.7-34.7 32.7H479.4v148.5c0 16.7-13.6 30.3-30.3 30.3H336c-16.7 0-30.3-13.6-30.3-30.3V317.1h-89v119.5c0 16.7-13.6 30.3-30.3 30.3H30.3C13.6 467.4 0 453.8 0 437.1V288.2H50.8c-19-1-34.4-15.7-34.4-33.7 0-18 15.6-32.7 34.7-32.7H.1L288 12.8 576 255.5z"/>
            </svg>
            Retour à la Connexion
          </Button>
          <Button as={Link} to="/" variant="outline-secondary">
            Accueil
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default UnauthorizedPage;
