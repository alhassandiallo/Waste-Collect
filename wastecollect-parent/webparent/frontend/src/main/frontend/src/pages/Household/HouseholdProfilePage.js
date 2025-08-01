import React, { useState, useEffect, useCallback } from 'react'; // Added useCallback
import householdService from '../../services/householdService';
import useAuth from '../../hooks/useAuth';
import { Container, Row, Col, Card, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { FaUserCircle, FaEdit, FaSave, FaMapMarkerAlt, FaUsers, FaHome, FaPalette } from 'react-icons/fa';
import { toast } from 'react-toastify';

/**
 * Composant HouseholdProfilePage - Permet aux ménages de visualiser et mettre à jour leur profil.
 * Fonctionnalités principales:
 * - Affichage des informations personnelles du ménage
 * - Affichage des détails spécifiques au ménage (nb de membres, type de logement, préférences de collecte)
 * - Possibilité de modifier ces informations
 * - Affichage des coordonnées géographiques
 *
 * @component
 */
const HouseholdProfilePage = () => {
  const { user, updateProfile: authUpdateProfile } = useAuth(); // Use authUpdateProfile from useAuth
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    address: '',
    numberOfMembers: '',
    housingType: '',
    collectionPreferences: '',
    latitude: '',
    longitude: '',
    area: '', // Assuming area is the municipality name
  });
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState(null);

  // Moved fetchProfile outside useEffect and wrapped in useCallback
  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await householdService.getHouseholdProfile();
      setProfileData({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        email: data.email || '',
        phoneNumber: data.phoneNumber || '',
        address: data.address || '',
        numberOfMembers: data.numberOfMembers || '',
        housingType: data.housingType || '',
        collectionPreferences: data.collectionPreferences || '',
        latitude: data.latitude || '',
        longitude: data.longitude || '',
        area: data.area || '', // Populate area from fetched data
      });
    } catch (err) {
      console.error('Error fetching household profile:', err);
      setError('Erreur lors du chargement de votre profil. Veuillez réessayer.');
      toast.error('Échec du chargement du profil.');
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array means this function is created once

  useEffect(() => {
    if (user) { // Fetch profile only if user is authenticated
      fetchProfile();
    }
  }, [user, fetchProfile]); // Added fetchProfile to dependencies

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    // If cancelling, reset form to original data
    if (isEditing) {
      fetchProfile(); // A simple way to reset by re-fetching
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const updatePayload = {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        email: profileData.email,
        phoneNumber: profileData.phoneNumber,
        address: profileData.address,
        numberOfMembers: parseInt(profileData.numberOfMembers),
        housingType: profileData.housingType,
        collectionPreferences: profileData.collectionPreferences,
        latitude: profileData.latitude ? parseFloat(profileData.latitude) : null,
        longitude: profileData.longitude ? parseFloat(profileData.longitude) : null,
        area: profileData.area, // Include area in the update payload
      };
      
      // Use authUpdateProfile from useAuth which handles API call and context update
      const success = await authUpdateProfile(updatePayload);

      if (success) {
        toast.success('Profil mis à jour avec succès !');
        setIsEditing(false); // Exit edit mode on success
      } else {
        // Error message already handled by useAuth and toast
        setError('Échec de la mise à jour du profil.');
      }
    } catch (err) {
      console.error('Error updating household profile:', err);
      setError(err.message || 'Erreur lors de la mise à jour du profil. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" role="status">
          <span className="visually-hidden">Chargement du profil...</span>
        </Spinner>
        <p className="mt-3 text-muted">Chargement de votre profil...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger" className="text-center">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={10} lg={8}>
          <Card className="shadow-lg rounded-3 mb-4">
            <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
              <h4 className="mb-0">
                <FaUserCircle className="me-2" />
                Mon Profil de Ménage
              </h4>
              <Button variant="outline-light" onClick={handleEditToggle} disabled={loading}>
                {isEditing ? (
                  <>
                    <FaSave className="me-2" /> Annuler
                  </>
                ) : (
                  <>
                    <FaEdit className="me-2" /> Modifier
                  </>
                )}
              </Button>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
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
                        required
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
                        required
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
                    required
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
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="address">
                  <Form.Label>Adresse</Form.Label>
                  <Form.Control
                    type="text"
                    name="address"
                    value={profileData.address}
                    onChange={handleChange}
                    readOnly={!isEditing}
                    required
                  />
                </Form.Group>

                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group controlId="numberOfMembers">
                      <Form.Label>
                        <FaUsers className="me-1" /> Nombre de Membres
                      </Form.Label>
                      <Form.Control
                        type="number"
                        name="numberOfMembers"
                        value={profileData.numberOfMembers}
                        onChange={handleChange}
                        readOnly={!isEditing}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="housingType">
                      <Form.Label>
                        <FaHome className="me-1" /> Type de Logement
                      </Form.Label>
                      <Form.Select
                        name="housingType"
                        value={profileData.housingType}
                        onChange={handleChange}
                        disabled={!isEditing}
                        required
                      >
                        <option value="">Sélectionner...</option>
                        <option value="APARTMENT">Appartement</option>
                        <option value="HOUSE">Maison</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3" controlId="area">
                  <Form.Label>
                    <FaMapMarkerAlt className="me-1" /> Municipalité
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="area"
                    value={profileData.area}
                    onChange={handleChange}
                    readOnly={!isEditing} // Area might be less frequently editable directly by user
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="collectionPreferences">
                  <Form.Label>
                    <FaPalette className="me-1" /> Préférences de Collecte
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="collectionPreferences"
                    value={profileData.collectionPreferences}
                    onChange={handleChange}
                    readOnly={!isEditing}
                  />
                </Form.Group>

                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group controlId="latitude">
                      <Form.Label>Latitude</Form.Label>
                      <Form.Control
                        type="number"
                        step="any"
                        name="latitude"
                        value={profileData.latitude}
                        onChange={handleChange}
                        readOnly={!isEditing}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="longitude">
                      <Form.Label>Longitude</Form.Label>
                      <Form.Control
                        type="number"
                        step="any"
                        name="longitude"
                        value={profileData.longitude}
                        onChange={handleChange}
                        readOnly={!isEditing}
                      />
                    </Form.Group>
                  </Col>
                </Row>

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

export default HouseholdProfilePage;
