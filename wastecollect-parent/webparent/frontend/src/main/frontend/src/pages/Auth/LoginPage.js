import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import { Container, Row, Col, Card, Form, Button, Spinner } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useAuth from '../../hooks/useAuth';

/**
 * Page de connexion pour la plateforme WasteCollect
 * Permet aux utilisateurs de se connecter avec leur email et mot de passe.
 * This component focuses purely on displaying the login form and handling submission.
 * All post-login redirection is handled by the RoleBasedRedirector in App.js.
 */
const LoginPage = () => {
  const navigate = useNavigate(); // Initialize useNavigate hook

  // Local state for form data
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  // Hooks for authentication context
  const { login, isLoading, authError, isAuthenticated, user, clearAuthError } = useAuth(); // Destructure isAuthenticated and user

  // Effect to display authentication errors (this remains, as it's for user feedback)
  useEffect(() => {
    if (authError) {
      toast.error(authError);
      clearAuthError(); // Clear the error after displaying to prevent repeated toasts
    }
  }, [authError, clearAuthError]);

  // Effect to redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      // If user is already authenticated, redirect them to the root path
      // The RoleBasedRedirector will then handle the specific dashboard redirection
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, user, navigate]); // Depend on isAuthenticated, user, and navigate

  /**
   * Handles form input changes.
   * @param {Object} e - Event object.
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  /**
   * Handles login form submission.
   * @param {Object} e - Event object.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Formulaire de connexion soumis avec les données :", formData);
    // FIX: Pass the entire formData object to the login function.
    // The useAuth hook expects a single object with email and password properties.
    const success = await login(formData);
    if (success) {
      // If login was successful, the AuthContext state (isAuthenticated, user) will update.
      // The useEffect above, listening to isAuthenticated and user, will then trigger navigation to '/'.
      // The RoleBasedRedirector in App.js will then handle the final role-based redirect.
      // No explicit navigate call needed directly here after successful login, as the useEffect handles it.
    }
  };

  // If already loading or authenticated, do not show the login form
  if (isLoading) {
    return (
      <div className="login-page d-flex align-items-center justify-content-center min-vh-100 bg-light">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }
  // The useEffect above will handle redirection if isAuthenticated is true.
  // So, if we reach here and isAuthenticated is true, it means we are in the process of redirecting.
  // We can render null or a small loading message here.
  if (isAuthenticated) {
      return null; // Or a simple "Redirecting..." message
  }


  return (
    <div className="login-page d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <ToastContainer position="top-center" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      <div className="container py-5"> {/* Use a div with container class for consistent padding */}
        <div className="row justify-content-center"> {/* Centering row */}
          <div className="col-lg-8 col-md-10 col-sm-12"> {/* Responsive columns */}
            <Card className="shadow-lg rounded-3 border-0 p-4 p-md-5 animate__animated animate__fadeInDown">
              <Card.Body>
                <h2 className="card-title text-center mb-4 text-primary fw-bold">
                  Bienvenue sur WasteCollect
                </h2>
                <p className="text-center text-muted mb-4">
                  Connectez-vous à votre compte
                </p>

                <Form onSubmit={handleSubmit} noValidate>
                  <Form.Group className="mb-3">
                    <Form.Label htmlFor="emailInput">Adresse email</Form.Label>
                    <Form.Control
                      id="emailInput"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      className="rounded-md"
                      placeholder="Adresse email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label htmlFor="passwordInput">Mot de passe</Form.Label>
                    <Form.Control
                      id="passwordInput"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      className="rounded-md"
                      placeholder="Mot de passe"
                      value={formData.password}
                      onChange={handleChange}
                    />
                  </Form.Group>

                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <Form.Group controlId="remember-me">
                      <Form.Check
                        type="checkbox"
                        label="Se souvenir de moi"
                        className="text-muted"
                      />
                    </Form.Group>

                    <Link to="/forgot-password" className="text-decoration-none text-success fw-semibold">
                      Mot de passe oublié ?
                    </Link>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-100 btn-lg rounded-pill shadow-sm mt-3"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="me-2"
                      />
                    ) : (
                      'Se connecter'
                    )}
                  </Button>
                </Form>

                <div className="text-center mt-4">
                  <hr className="my-3" />
                  <div>
                    <span className="text-muted small">Pas encore de compte ? </span>
                    <Link to="/register" className="text-success text-decoration-none fw-semibold">
                      S'inscrire
                    </Link>
                  </div>
                </div>
              </Card.Body>
            </Card>

            {/* Additional Information */}
            <div className="text-center mt-4">
              <div className="row text-muted small">
                <Col xs={4}>
                  <i className="fas fa-users d-block mb-1"></i>
                  <span>Ménages</span>
                </Col>
                <Col xs={4}>
                  <i className="fas fa-truck d-block mb-1"></i>
                  <span>Collecteurs</span>
                </Col>
                <Col xs={4}>
                  <i className="fas fa-city d-block mb-1"></i>
                  <span>Municipalités</span>
                </Col>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
