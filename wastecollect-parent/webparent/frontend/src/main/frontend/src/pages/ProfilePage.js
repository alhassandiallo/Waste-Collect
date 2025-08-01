// frontend/src/pages/ProfilePage.js
import React, { useContext, useState, useEffect, useCallback } from 'react';
import { Card, Container, Row, Col, Button, Form, Alert, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom'; // Link is used for navigation, so it's needed here
import AuthContext from '../contexts/AuthContext'; // Path relative to src/pages
import LoadingSpinner from '../components/LoadingSpinner'; // Path relative to src/pages
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // This CSS import is specifically for react-toastify


/**
 * ProfilePage Component
 * This page displays the profile information for the currently logged-in user,
 * regardless of their role (Collector, Household, Admin, Municipality, Municipal Manager).
 * It allows viewing and potentially updating basic profile details,
 * relying on the AuthContext for user data and update functionality.
 */
const ProfilePage = () => {
  // Use AuthContext directly for the user object and updateProfile function
  const { user, updateProfile: contextUpdateProfile, isLoading: authContextLoading, isAuthenticated } = useContext(AuthContext);

  // State to hold the profile data for display and editing
  const [profileData, setProfileData] = useState(null);
  // State for managing loading status specifically for this component (after initial auth loading)
  const [loading, setLoading] = useState(true);
  // State for displaying errors
  const [error, setError] = useState(null);
  // State to control edit mode
  const [isEditing, setIsEditing] = useState(false);
  // State for form data (editable fields)
  const [formData, setFormData] = useState({});

  // Memoized function to update profile data in local state and form data
  const updateLocalProfileData = useCallback(() => {
    if (user) {
      setProfileData({
        id: user.id,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '', // Ensure consistency with backend DTO
        address: user.address || '',
        role: user.role || 'N/A', // Display role, but not editable
        // Add any other common user fields you want to display
      });
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '', // Ensure consistency with backend DTO
        address: user.address || '',
      });
      setLoading(false); // Data is now loaded from context
    } else {
      // If no user is authenticated, set loading to false and handle the state
      setLoading(false);
      setError("No user data available. Please log in.");
    }
  }, [user]);

  // Effect to initialize profile data when component mounts or user/auth status changes
  useEffect(() => {
    if (!authContextLoading) {
      updateLocalProfileData();
    }
  }, [authContextLoading, updateLocalProfileData]);

  /**
   * Handles changes in form input fields.
   * @param {Object} e - The event object.
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  /**
   * Handles form submission for updating the profile.
   * This calls the `updateProfile` function from AuthContext.
   * @param {Object} e - The event object.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // The updateProfile in AuthContext is designed to accept UserUpdateDTO fields
      const result = await contextUpdateProfile({
        id: user.id, // Pass user ID for backend identification
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber, // Ensure this matches UserUpdateDTO
        address: formData.address,
      });

      if (result) { // Assuming contextUpdateProfile returns true on success, false on failure
        setIsEditing(false);
        // The user object in AuthContext is automatically updated on success
        // updateLocalProfileData will be called by the useEffect watching `user`
        toast.success('Profil mis à jour avec succès !');
      } else {
        throw new Error('Échec de la mise à jour du profil. Veuillez réessayer.');
      }
    } catch (err) {
      console.error('Erreur lors de la mise à jour du profil:', err);
      setError(err.message || 'Une erreur inattendue est survenue lors de la mise à jour.');
      toast.error(err.message || 'Échec de la mise à jour du profil.');
    } finally {
      setLoading(false);
    }
  };

  // Show loading spinner if authentication is still loading or component data is loading
  if (loading || authContextLoading) {
    return <LoadingSpinner message="Chargement du profil..." fullScreen={true} />;
  }

  // Display error message if there's an error
  if (error) {
    return (
      <Alert variant="danger" className="text-center m-4">
        <Alert.Heading>Erreur</Alert.Heading>
        <p>{error}</p>
        <Button variant="outline-danger" onClick={updateLocalProfileData} className="mt-2">
          Réessayer
        </Button>
      </Alert>
    );
  }

  // If no profile data is available after loading (e.g., not authenticated)
  if (!profileData) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={8}>
            <Card className="text-center shadow-sm p-4">
              <h2 className="mb-3">Profil Non Trouvé</h2>
              <p className="lead">Veuillez vous connecter pour voir votre profil.</p>
              <Link to="/login" className="btn btn-primary mt-3">Aller à la page de connexion</Link>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container className="py-5 font-inter bg-gray-50 min-h-screen">
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      <Row className="justify-content-center">
        <Col md={10} lg={8}>
          <Card className="shadow-lg rounded-xl border-0 p-4">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="text-4xl font-bold text-primary mb-0 flex items-center">
                  <span className="me-2">👤</span> Mon Profil
                </h2>
                {!isEditing && (
                  <Button
                    variant="outline-primary"
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    Modifier le Profil
                  </Button>
                )}
              </div>

              <Form onSubmit={handleSubmit}>
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="font-semibold text-gray-700">Prénom</Form.Label>
                      <Form.Control
                        type="text"
                        name="firstName"
                        value={formData.firstName || ''}
                        onChange={handleChange}
                        readOnly={!isEditing}
                        className="rounded-lg border-gray-300"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="font-semibold text-gray-700">Nom</Form.Label>
                      <Form.Control
                        type="text"
                        name="lastName"
                        value={formData.lastName || ''}
                        onChange={handleChange}
                        readOnly={!isEditing}
                        className="rounded-lg border-gray-300"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label className="font-semibold text-gray-700">Email</Form.Label>
                  <Form.Control
                        type="email"
                        name="email"
                        value={formData.email || ''}
                        onChange={handleChange}
                        readOnly={!isEditing}
                        className="rounded-lg border-gray-300"
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="font-semibold text-gray-700">Numéro de téléphone</Form.Label>
                  <Form.Control
                        type="text"
                        name="phoneNumber" // Corrected to phoneNumber
                        value={formData.phoneNumber || ''}
                        onChange={handleChange}
                        readOnly={!isEditing}
                        className="rounded-lg border-gray-300"
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="font-semibold text-gray-700">Adresse</Form.Label>
                  <Form.Control
                        as="textarea"
                        rows={3}
                        name="address"
                        value={formData.address || ''}
                        onChange={handleChange}
                        readOnly={!isEditing}
                        className="rounded-lg border-gray-300"
                    />
                </Form.Group>

                {/* Display role, but not editable */}
                <Form.Group className="mb-4">
                  <Form.Label className="font-semibold text-gray-700">Rôle</Form.Label>
                  <Form.Control
                        type="text"
                        value={profileData.role || 'N/A'} // Use profileData for display
                        readOnly
                        className="rounded-lg border-gray-300 bg-gray-100"
                    />
                </Form.Group>

                {isEditing && (
                  <div className="d-flex justify-content-end gap-3">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setIsEditing(false);
                        setFormData(profileData); // Reset form data to original profile data
                      }}
                      className="px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                    >
                      Annuler
                    </Button>
                    <Button
                      variant="primary"
                      type="submit"
                      className="px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                      disabled={loading}
                    >
                      {loading ? <Spinner animation="border" size="sm" /> : 'Enregistrer les modifications'}
                    </Button>
                  </div>
                )}
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ProfilePage;
