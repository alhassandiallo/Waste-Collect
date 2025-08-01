import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Spinner, Alert } from 'react-bootstrap'; // Added Alert
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import authService from '../../services/authService'; // Assuming authService handles reset requests

/**
 * Composant ResetPasswordPage - Permet aux utilisateurs de réinitialiser leur mot de passe
 * en utilisant un jeton de réinitialisation reçu par e-mail.
 */
const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation(); // To get URL parameters
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [token, setToken] = useState(null);
  const [isValidToken, setIsValidToken] = useState(false); // State to track token validity

  // Extract token from URL on component mount
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const receivedToken = queryParams.get('token');
    if (receivedToken) {
      setToken(receivedToken);
      // You might want to add a backend call here to validate the token immediately
      // For now, we'll assume it's valid if present for UI rendering.
      // The actual validation will happen on submission to resetPassword endpoint.
      setIsValidToken(true);
    } else {
      setError('Jeton de réinitialisation manquant. Veuillez utiliser le lien complet de votre e-mail.');
      toast.error('Jeton de réinitialisation manquant.');
      setIsValidToken(false);
    }
  }, [location.search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!token) {
      setError('Jeton de réinitialisation manquant. Impossible de procéder.');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      setLoading(false);
      return;
    }

    try {
      // Assuming authService has a method to reset password with a token
      await authService.resetPassword(token, password);
      toast.success('Votre mot de passe a été réinitialisé avec succès !');
      navigate('/login'); // Redirect to login page
    } catch (err) {
      console.error('Erreur lors de la réinitialisation du mot de passe:', err);
      setError(err.message || 'Échec de la réinitialisation du mot de passe. Le jeton peut être invalide ou expiré.');
      toast.error(err.message || 'Échec de la réinitialisation.');
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
                  Réinitialiser votre mot de passe
                </h2>
                <p className="text-center text-muted mb-4">
                  Veuillez entrer votre nouveau mot de passe ci-dessous.
                </p>

                {error && <Alert variant="danger" className="text-center"><i className="fas fa-exclamation-triangle me-2"></i>{error}</Alert>}
                {!token && (
                  <Alert variant="info" className="text-center">
                    Chargement... Si vous ne voyez pas le formulaire, le jeton de réinitialisation est peut-être manquant ou invalide.
                  </Alert>
                )}

                {isValidToken && ( // Only show form if a token is present
                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                      <Form.Label htmlFor="newPasswordInput">Nouveau mot de passe</Form.Label>
                      <Form.Control
                        id="newPasswordInput"
                        name="password"
                        type="password"
                        autoComplete="new-password"
                        required
                        className="rounded-md"
                        placeholder="Minimum 8 caractères"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                      />
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label htmlFor="confirmNewPasswordInput">Confirmer le nouveau mot de passe</Form.Label>
                      <Form.Control
                        id="confirmNewPasswordInput"
                        name="confirmPassword"
                        type="password"
                        autoComplete="new-password"
                        required
                        className="rounded-md"
                        placeholder="Confirmer le nouveau mot de passe"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
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
                        'Réinitialiser le mot de passe'
                      )}
                    </Button>
                  </Form>
                )}

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

export default ResetPasswordPage;
