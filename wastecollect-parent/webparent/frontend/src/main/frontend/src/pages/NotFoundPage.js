import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

/**
 * Composant NotFoundPage - Affiche une page 404 introuvable.
 * Offre des options de navigation pour retourner à l'accueil ou au tableau de bord.
 */
const NotFoundPage = () => {
  return (
    <Container className="d-flex align-items-center justify-content-center min-vh-100 text-center">
      <Row>
        <Col>
          <h1 className="display-1 text-danger">404</h1>
          <h2 className="mb-4">Page Non Trouvée</h2>
          <p className="lead">
            Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
          </p>
          <hr className="my-4" />
          <p>
            Veuillez vérifier l'URL ou utiliser les liens ci-dessous pour naviguer.
          </p>
          <Button as={Link} to="/" variant="primary" className="me-3">
            Retour à l'Accueil
          </Button>
          <Button as={Link} to="/login" variant="outline-secondary">
            Se Connecter
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default NotFoundPage;
