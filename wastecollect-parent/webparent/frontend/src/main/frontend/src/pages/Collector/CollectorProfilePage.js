// frontend/src/pages/Collector/CollectorProfilePage.js
import React, { useState, useEffect, useCallback } from 'react';
import collectorService from '../../services/collectorService';
import useAuth from '../../hooks/useAuth';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Container, Row, Col, Card, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { FaUserCircle, FaEdit, FaSave, FaMapMarkerAlt, FaIdCard } from 'react-icons/fa'; // Updated icons
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

/**
 * Composant CollectorProfilePage - Permet aux collecteurs de visualiser et mettre à jour leur profil.
 * Fonctionnalités principales:
 * - Affichage des informations personnelles du collecteur
 * - Affichage des détails spécifiques au collecteur (ID unique, statut)
 * - Possibilité de modifier les informations de base et le statut
 *
 * @component
 */
const CollectorProfilePage = () => {
  const { user } = useAuth(); // No longer need updateProfile from useAuth for this specific page
  const navigate = useNavigate(); // Initialize navigate hook
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    address: '',
    collectorId: '', // Added from CollectorProfileDTO
    status: '',
    municipalityName: '', // Added for display
  });
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState(null);

  // Enum values for CollectorStatus (match backend enum if applicable)
  const collectorStatuses = ['ACTIVE', 'INACTIVE', 'ON_LEAVE', 'SUSPENDED'];

  const loadProfileData = useCallback(async () => {
    if (!user || !user.id) { // Ensure user and user.id are available
      setLoading(false);
      setError("Utilisateur non authentifié ou ID utilisateur non disponible.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await collectorService.getCollectorProfile();
      const data = response.data; // Access data from response.data
      setProfileData({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        email: data.email || '',
        phoneNumber: data.phoneNumber || '',
        address: data.address || '',
        collectorId: data.collectorId || '',
        status: data.status || '',
        municipalityName: data.municipalityName || 'N/A',
      });
      console.log("Collector Profile Data Loaded:", data); // Log the actual data
    } catch (err) {
      console.error('Error fetching collector profile:', err);
      setError('Erreur lors du chargement du profil du collecteur. Veuillez réessayer.');
      toast.error('Erreur lors du chargement du profil.');
    } finally {
      setLoading(false);
    }
  }, [user]); // Depend on 'user' to re-run when user object is updated (e.g., after initial load)

  useEffect(() => {
    loadProfileData();
  }, [loadProfileData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (isEditing) {
      loadProfileData(); // Reset form to original data on cancel
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
        status: profileData.status,
      };
      
      // Directly call collectorService to update collector profile
      const response = await collectorService.updateCollectorProfile(updatePayload);

      // Check if the collectorService update was successful
      if (response && (response.status === 200 || response.status === 204)) {
        // No need to call authUpdateProfile here as collectorService handles the backend update
        // and the AuthContext user object will be refreshed on next page load or specific refresh action.
        // If you want immediate AuthContext update, you'd need to fetch the user profile again
        // after successful update, or manually update the user object in AuthContext.
        // For now, relying on the next loadProfileData() call to refresh.

        toast.success('Profil de collecteur mis à jour avec succès !');
        setIsEditing(false); // Exit editing mode on success
        loadProfileData(); // Re-fetch to ensure UI is consistent with backend
      } else {
        // If collectorService update was not successful, throw an error
        throw new Error(response?.data?.message || 'La mise à jour du profil a échoué.');
      }
    } catch (err) {
      console.error('Error updating collector profile:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors de la mise à jour du profil. Veuillez réessayer.';
      toast.error(errorMessage); // Show error toast
    } finally {
      setLoading(false); // Always set loading to false
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger" className="text-center">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="py-5 font-inter bg-light min-h-screen">
      <Row className="justify-content-center">
        <Col md={10} lg={8}>
          <Card className="shadow-lg rounded-xl border-0 p-4">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="text-3xl font-bold text-gray-800">
                  <FaUserCircle className="me-2 text-primary" /> Mon Profil
                </h2>
                <Button
                  variant="primary"
                  onClick={handleEditToggle}
                  disabled={loading}
                  className="px-4 py-2 rounded-lg text-md font-semibold shadow-md hover:bg-blue-700 transition-colors duration-200"
                >
                  {isEditing ? (
                    <>
                      <FaSave className="me-2" /> Annuler
                    </>
                  ) : (
                    <>
                      <FaEdit className="me-2" /> Modifier le Profil
                    </>
                  )}
                </Button>
              </div>

              <p className="lead text-gray-700 mb-5">
                Gérez vos informations personnelles et votre statut de collecteur.
              </p>

              {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group controlId="firstName" className="mb-3">
                      <Form.Label>Prénom</Form.Label>
                      <Form.Control
                        type="text"
                        name="firstName"
                        value={profileData.firstName}
                        onChange={handleChange}
                        readOnly={!isEditing}
                        required
                        className="rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="lastName" className="mb-3">
                      <Form.Label>Nom</Form.Label>
                      <Form.Control
                        type="text"
                        name="lastName"
                        value={profileData.lastName}
                        onChange={handleChange}
                        readOnly={!isEditing}
                        required
                        className="rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
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
                    className="rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
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
                    className="rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
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
                    className="rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  />
                </Form.Group>

                {/* Collector-specific fields based on DTOs */}
                <Form.Group className="mb-3" controlId="collectorId">
                  <Form.Label>
                    <FaIdCard className="me-1" /> ID Collecteur
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="collectorId"
                    value={profileData.collectorId}
                    readOnly // This field is read-only
                    className="rounded-lg border-gray-300 bg-gray-100"
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="status">
                  <Form.Label>Statut du Collecteur</Form.Label>
                  <Form.Select
                    name="status"
                    value={profileData.status}
                    onChange={handleChange}
                    disabled={!isEditing}
                    required
                    className="rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Sélectionner...</option>
                    {collectorStatuses.map(status => (
                      <option key={status} value={status}>{status.replace('_', ' ')}</option>
                    ))}
                  </Form.Select>
                </Form.Group>

                {/* Display Municipality Name */}
                <Form.Group className="mb-3" controlId="municipalityName">
                  <Form.Label>
                    <FaMapMarkerAlt className="me-1" /> Municipalité
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="municipalityName"
                    value={profileData.municipalityName}
                    readOnly // This field is read-only
                    className="rounded-lg border-gray-300 bg-gray-100"
                  />
                </Form.Group>

                {isEditing && (
                  <Button variant="primary" type="submit" disabled={loading} className="px-4 py-2 rounded-lg text-md font-semibold shadow-md hover:bg-blue-700 transition-colors duration-200">
                    {loading ? (
                      <Spinner animation="border" size="sm" className="me-2" />
                    ) : (
                      <FaSave className="me-2" />
                    )}
                    Enregistrer les Modifications
                  </Button>
                )}
              </Form>

              {/* Added Return and Return to Dashboard buttons */}
              <div className="text-center mt-5 d-flex justify-content-center gap-3 flex-wrap">
                <Button
                  variant="outline-secondary"
                  onClick={() => navigate(-1)}
                  className="px-5 py-3 rounded-lg text-lg font-semibold shadow-md hover:bg-gray-100 transition-colors duration-200"
                >
                  <i className="fas fa-arrow-left me-2"></i> Retour
                </Button>
                <Button
                  variant="primary"
                  onClick={() => navigate('/collector/dashboard')}
                  className="px-5 py-3 rounded-lg text-lg font-semibold shadow-md hover:bg-blue-700 transition-colors duration-200"
                >
                  <i className="fas fa-tachometer-alt me-2"></i> Retour au Tableau de Bord
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CollectorProfilePage;
