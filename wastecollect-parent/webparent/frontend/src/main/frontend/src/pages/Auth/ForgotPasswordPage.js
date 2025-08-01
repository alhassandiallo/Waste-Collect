import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Spinner, Alert } from 'react-bootstrap'; // Added Alert
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import authService from '../../services/authService'; // Assuming authService handles reset requests

/**
 * Composant ForgotPasswordPage - Permet aux utilisateurs de demander une réinitialisation de mot de passe.
 * Les utilisateurs soumettent leur adresse e-mail pour recevoir un lien de réinitialisation.
 */
const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      // Assuming authService has a method to request password reset
      await authService.requestPasswordReset(email);
      setMessage('Un lien de réinitialisation de mot de passe a été envoyé à votre adresse e-mail. Veuillez vérifier votre boîte de réception (et vos spams).');
      toast.success('Lien de réinitialisation envoyé !');
    } catch (err) {
      console.error('Erreur lors de la demande de réinitialisation du mot de passe:', err);
      setError(err.message || 'Échec de l\'envoi du lien de réinitialisation. Veuillez vérifier l\'adresse e-mail.');
      toast.error(err.message || 'Échec de la demande.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <ToastContainer position="top-center" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col lg={6} md={8} sm={10}>
            <Card className="shadow-lg rounded-3 border-0 p-4 p-md-5 animate__animated animate__fadeInUp">
              <Card.Body>
                <h2 className="card-title text-center mb-4 text-primary fw-bold">
                  Mot de passe oublié ?
                </h2>
                <p className="text-center text-muted mb-4">
                  Entrez votre adresse e-mail ci-dessous et nous vous enverrons un lien pour réinitialiser votre mot de passe.
                </p>

                {message && <Alert variant="success" className="text-center"><i className="fas fa-check-circle me-2"></i>{message}</Alert>}
                {error && <Alert variant="danger" className="text-center"><i className="fas fa-exclamation-triangle me-2"></i>{error}</Alert>}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-4">
                    <Form.Label htmlFor="emailInput">Adresse email</Form.Label>
                    <Form.Control
                      id="emailInput"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      className="rounded-md"
                      placeholder="Votre adresse email enregistrée"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                    />
                  </Form.Group>

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-100 btn-lg rounded-pill shadow-sm"
                    disabled={loading}
                  >
                    {loading ? (
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="me-2"
                      />
                    ) : (
                      'Envoyer le lien de réinitialisation'
                    )}
                  </Button>
                </Form>

                <div className="text-center mt-4">
                  <hr className="my-3" />
                  <Link to="/login" className="text-success text-decoration-none fw-semibold">
                    Retour à la connexion
                  </Link>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ForgotPasswordPage;
