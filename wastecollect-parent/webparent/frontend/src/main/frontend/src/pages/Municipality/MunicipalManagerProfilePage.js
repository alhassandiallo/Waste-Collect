import React, { useState, useEffect, useCallback } from 'react';
import useAuth from '../../hooks/useAuth';
import { Container, Row, Col, Card, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { FaUserCircle, FaEdit, FaSave, FaMapMarkerAlt, FaCity } from 'react-icons/fa'; // Added FaCity, removed unused icons
import { toast } from 'react-toastify';

/**
 * Composant MunicipalManagerProfilePage - Permet aux gérants municipaux de visualiser et mettre à jour leur profil.
 * Fonctionnalités principales:
 * - Affichage des informations personnelles du gérant municipal
 * - Affichage des détails de la municipalité associée
 * - Possibilité de modifier ces informations
 *
 * @component
 */
const MunicipalManagerProfilePage = () => {
  const { user, updateProfile: authUpdateProfile } = useAuth();
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    address: '',
    municipalityName: '', // Holds the name of the associated municipality
    municipalityId: null, // Holds the ID of the associated municipality
  });
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Effect to load user profile data when the component mounts or user changes.
   * This assumes `user` object from `useAuth` contains `municipalityName` and `municipalityId`.
   */
  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        address: user.address || '',
        municipalityName: user.municipalityName || 'Non assignée',
        municipalityId: user.municipalityId || null,
      });
      setLoading(false);
    } else {
      setLoading(false);
      setError('Impossible de charger les données du profil. Veuillez vous connecter.');
    }
  }, [user]);

  /**
   * Handles changes in form fields.
   */
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  }, []);

  /**
   * Handles form submission for updating profile.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Prepare data for update. Note: municipalityId and municipalityName are read-only
      // from the perspective of the manager's profile update form.
      // The backend update DTO might only expect basic user fields and municipalityId.
      const updatePayload = {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        email: profileData.email,
        phoneNumber: profileData.phoneNumber,
        address: profileData.address,
        // Include municipalityId if the backend expects it for a MunicipalManager update,
        // even if it's not directly editable by the manager here.
        municipalityId: profileData.municipalityId
      };

      // Call the centralized update profile function from useAuth
      const success = await authUpdateProfile(updatePayload);

      if (success) {
        toast.success('Profil mis à jour avec succès!');
        setIsEditing(false); // Exit editing mode on success
      } else {
        toast.error('Échec de la mise à jour du profil.');
      }
    } catch (err) {
      console.error('Erreur lors de la mise à jour du profil:', err);
      toast.error('Erreur: ' + (err.response?.data?.message || 'Une erreur inattendue est survenue.'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center min-vh-100">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Chargement du profil...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="my-5">
        <Alert variant="danger">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="my-5">
      <Row className="justify-content-center">
        <Col md={10} lg={8}>
          <Card className="shadow-lg border-0 rounded-lg">
            <Card.Header className="bg-success text-white text-center py-4">
              <FaUserCircle size={60} className="mb-2" />
              <h3 className="mb-0">Profil du Gérant Municipal</h3>
              <p className="lead mb-0">{profileData.firstName} {profileData.lastName}</p>
            </Card.Header>
            <Card.Body className="p-4">
              <div className="d-flex justify-content-end mb-3">
                <Button variant="outline-secondary" onClick={() => setIsEditing(!isEditing)}>
                  <FaEdit className="me-2" />
                  {isEditing ? 'Annuler' : 'Modifier le Profil'}
                </Button>
              </div>

              <Form onSubmit={handleSubmit}>
                <h5 className="text-primary mb-3">Informations Personnelles</h5>
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group controlId="firstName">
                      <Form.Label>Prénom</Form.Label>
                      <Form.Control
                        type="text"
                        name="firstName"
                        value={profileData.firstName}
                        onChange={handleChange}
                        readOnly={!isEditing}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="lastName">
                      <Form.Label>Nom</Form.Label>
                      <Form.Control
                        type="text"
                        name="lastName"
                        value={profileData.lastName}
                        onChange={handleChange}
                        readOnly={!isEditing}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3" controlId="email">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleChange}
                    readOnly={!isEditing}
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="phoneNumber">
                  <Form.Label>Numéro de Téléphone</Form.Label>
                  <Form.Control
                    type="tel"
                    name="phoneNumber"
                    value={profileData.phoneNumber}
                    onChange={handleChange}
                    readOnly={!isEditing}
                  />
                </Form.Group>

                <Form.Group className="mb-4" controlId="address">
                  <Form.Label>Adresse</Form.Label>
                  <Form.Control
                    type="text"
                    name="address"
                    value={profileData.address}
                    onChange={handleChange}
                    readOnly={!isEditing}
                  />
                </Form.Group>

                <h5 className="text-primary mb-3">Informations sur la Municipalité</h5>
                <Form.Group className="mb-3" controlId="municipalityName">
                  <Form.Label>Nom de la Municipalité</Form.Label>
                  <Form.Control
                    type="text"
                    name="municipalityName"
                    value={profileData.municipalityName}
                    readOnly // This field is derived, not directly editable here
                  />
                </Form.Group>
                <Form.Group className="mb-4" controlId="municipalityId">
                  <Form.Label>ID de la Municipalité</Form.Label>
                  <Form.Control
                    type="text"
                    name="municipalityId"
                    value={profileData.municipalityId || 'N/A'}
                    readOnly // This field is derived, not directly editable here
                  />
                </Form.Group>

                {isEditing && (
                  <Button variant="primary" type="submit" disabled={loading}>
                    {loading ? (
                      <Spinner animation="border" size="sm" className="me-2" />
                    ) : (
                      <FaSave className="me-2" />
                    )}
                    Enregistrer les Modifications
                  </Button>
                )}
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default MunicipalManagerProfilePage;
