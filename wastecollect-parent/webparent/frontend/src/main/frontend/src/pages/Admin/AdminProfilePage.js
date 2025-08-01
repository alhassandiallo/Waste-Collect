import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { FaUserCircle, FaEnvelope, FaPhone, FaMapMarkerAlt, FaEdit, FaSave, FaSyncAlt } from 'react-icons/fa';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import adminService from '../../services/adminService'; // Ensure adminService is imported
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/LoadingSpinner';

/**
 * AdminProfilePage - Page de profil pour l'administrateur.
 * Cette page affiche les informations du profil de l'administrateur
 * et permet de les modifier.
 */
const AdminProfilePage = () => {
	const navigate = useNavigate();
	
    // Get user details, loading state from AuthContext
    const { user, isLoading: authLoading } = useAuth();

    // State to hold the profile data for the form, including admin-specific fields
    const [profileData, setProfileData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        address: '',
        position: '', // Admin-specific field
        managementArea: '', // Admin-specific field
    });

    // State for managing loading status specifically for this component's data fetching/updating
    const [loading, setLoading] = useState(true);
    // State for displaying errors
    const [error, setError] = useState(null);
    // State to control edit mode
    const [isEditing, setIsEditing] = useState(false);
    // State for form validation errors
    const [formErrors, setFormErrors] = useState({});

    /**
     * Fetches the admin's profile data from the backend.
     * This function is memoized using useCallback to prevent unnecessary re-renders.
     */
    const fetchAdminProfile = useCallback(async () => {
        if (!user || !user.id) {
            // If user or user.id is not available yet, cannot fetch profile
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            // Call adminService to get the specific admin's profile using their ID
            const response = await adminService.getAdminProfile(user.id);
            setProfileData({
                firstName: response.firstName || '',
                lastName: response.lastName || '',
                email: response.email || '',
                phoneNumber: response.phoneNumber || '',
                address: response.address || '',
                position: response.position || '', // Populate admin-specific field
                managementArea: response.managementArea || '', // Populate admin-specific field
            });
        } catch (err) {
            console.error("Error fetching admin profile:", err);
            setError("Erreur lors du chargement du profil administrateur.");
        } finally {
            setLoading(false);
        }
    }, [user]); // Dependency on 'user' object

    // useEffect to load profile data when the component mounts or user changes
    useEffect(() => {
        // If user data is already in context, and it's an admin, use it directly for initial display
        // Otherwise, fetch the full admin profile from the backend.
        if (user && user.id && user.roleName === 'ADMIN') {
            setProfileData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
                phoneNumber: user.phoneNumber || '',
                address: user.address || '',
                // These might not be directly in the `user` context object if it's a generic UserDTO.
                // So, we still need to fetch the full admin profile for these specific fields.
                position: '', 
                managementArea: '',
            });
            // Fetch the detailed admin profile to get 'position' and 'managementArea'
            fetchAdminProfile();
        } else if (user && user.id) {
            // If user is logged in but not an admin, or if user data is not fully populated for admin, fetch
            fetchAdminProfile();
        } else {
            setLoading(false); // No user, no loading needed
        }
    }, [user, fetchAdminProfile]); // Dependencies: user and fetchAdminProfile

    /**
     * Handles changes in form input fields.
     * @param {Object} e - The event object.
     */
    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear specific error when input changes
        setFormErrors(prev => ({
            ...prev,
            [name]: undefined
        }));
    };

    /**
     * Validates the form data before submission.
     * @returns {boolean} True if the form is valid, false otherwise.
     */
    const validateForm = () => {
        const errors = {};
        if (!profileData.firstName) errors.firstName = "Le prénom est requis.";
        if (!profileData.lastName) errors.lastName = "Le nom est requis.";
        if (!profileData.email) {
            errors.email = "L'email est requis.";
        } else if (!/\S+@\S+\.\S+/.test(profileData.email)) {
            errors.email = "Format d'email invalide.";
        }
        if (!profileData.phoneNumber) errors.phoneNumber = "Le numéro de téléphone est requis.";
        if (!profileData.address) errors.address = "L'adresse est requise.";
        if (!profileData.position) errors.position = "Le poste est requis."; // Validation for new field
        if (!profileData.managementArea) errors.managementArea = "La zone de gestion est requise."; // Validation for new field
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    /**
     * Handles the form submission for updating the admin profile.
     * @param {Object} e - The event object.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!validateForm()) {
            toast.error("Veuillez corriger les erreurs dans le formulaire.");
            return;
        }

        setLoading(true);
        try {
            // Call adminService directly for admin profile update
            const updatedProfile = await adminService.updateAdminProfile(user.id, {
                firstName: profileData.firstName,
                lastName: profileData.lastName,
                email: profileData.email,
                phoneNumber: profileData.phoneNumber,
                address: profileData.address,
                position: profileData.position, // Include admin-specific field
                managementArea: profileData.managementArea, // Include admin-specific field
            });

            // Update local profile data with the response from the backend
            setProfileData(updatedProfile);
            setIsEditing(false); // Exit edit mode on successful update
            toast.success("Profil mis à jour avec succès !"); // Display success toast
        } catch (err) {
            console.error("Error updating admin profile:", err);
            // Display error message from backend if available, otherwise a generic one
            const errorMessage = err.response?.data?.message || "Échec de la mise à jour du profil. Veuillez réessayer.";
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Show loading spinner if authentication is still loading or component data is loading
    if (loading || authLoading) {
        return <LoadingSpinner message="Chargement du profil..." fullScreen={true} />;
    }

    // Display error message if there's an error
    if (error) {
        return <Alert variant="danger" className="text-center m-4">{error}</Alert>;
    }

    return (
        <Container className="my-4">
        	<div className="d-flex justify-content-between align-items-center mb-4">
		        <h2 className="mb-0">
		          <FaUserCircle className="me-2" /> Gestion du Profil
		        </h2>
		        <div>
		          <Button variant="outline-secondary" onClick={() => navigate(-1)} className="me-2">
		            Retour
		          </Button>
		          <Button variant="outline-primary" onClick={() => navigate('/admin/dashboard')}>
		            Retour au Tableau de Bord
		          </Button>
		        </div>
		      </div>
            <Row className="justify-content-center">
                <Col md={8} lg={7}>
                    <Card className="shadow-sm">
                        <Card.Header className="bg-primary text-white d-flex align-items-center">
                            <FaUserCircle className="me-2" size={24} />
                            <h5 className="mb-0">Mon Profil Administrateur</h5>
                            <Button
                                variant={isEditing ? "warning" : "light"} // Change button color in edit mode
                                size="sm"
                                className="ms-auto"
                                onClick={() => setIsEditing(!isEditing)}
                                disabled={loading} // Disable button while loading
                            >
                                {isEditing ? <><FaSave className="me-2" />Annuler l'édition</> : <><FaEdit className="me-2" />Modifier</>}
                            </Button>
                        </Card.Header>
                        <Card.Body>
                            <Form onSubmit={handleSubmit}>
                                <Row className="mb-3">
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label>Prénom:</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="firstName"
                                                value={profileData.firstName}
                                                onChange={handleFormChange}
                                                readOnly={!isEditing}
                                                isInvalid={!!formErrors.firstName}
                                            />
                                            <Form.Control.Feedback type="invalid">{formErrors.firstName}</Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label>Nom:</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="lastName"
                                                value={profileData.lastName}
                                                onChange={handleFormChange}
                                                readOnly={!isEditing}
                                                isInvalid={!!formErrors.lastName}
                                            />
                                            <Form.Control.Feedback type="invalid">{formErrors.lastName}</Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Form.Group className="mb-3">
                                    <Form.Label><FaEnvelope className="me-1" /> Email:</Form.Label>
                                    <Form.Control
                                        type="email"
                                        name="email"
                                        value={profileData.email}
                                        onChange={handleFormChange}
                                        readOnly={!isEditing}
                                        isInvalid={!!formErrors.email}
                                    />
                                    <Form.Control.Feedback type="invalid">{formErrors.email}</Form.Control.Feedback>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label><FaPhone className="me-1" /> Téléphone:</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="phoneNumber"
                                        value={profileData.phoneNumber}
                                        onChange={handleFormChange}
                                        readOnly={!isEditing}
                                        isInvalid={!!formErrors.phoneNumber}
                                    />
                                    <Form.Control.Feedback type="invalid">{formErrors.phoneNumber}</Form.Control.Feedback>
                                </Form.Group>

                                <Form.Group className="mb-4">
                                    <Form.Label><FaMapMarkerAlt className="me-1" /> Adresse:</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        name="address"
                                        rows={3}
                                        value={profileData.address}
                                        onChange={handleFormChange}
                                        readOnly={!isEditing}
                                        isInvalid={!!formErrors.address}
                                    />
                                    <Form.Control.Feedback type="invalid">{formErrors.address}</Form.Control.Feedback>
                                </Form.Group>

                                {/* New Admin-specific fields */}
                                <Row className="mb-3">
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label>Poste:</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="position"
                                                value={profileData.position}
                                                onChange={handleFormChange}
                                                readOnly={!isEditing}
                                                isInvalid={!!formErrors.position}
                                            />
                                            <Form.Control.Feedback type="invalid">{formErrors.position}</Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label>Zone de Gestion:</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="managementArea"
                                                value={profileData.managementArea}
                                                onChange={handleFormChange}
                                                readOnly={!isEditing}
                                                isInvalid={!!formErrors.managementArea}
                                            />
                                            <Form.Control.Feedback type="invalid">{formErrors.managementArea}</Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                {isEditing && (
                                    <Button variant="success" type="submit" className="w-100" disabled={loading}>
                                        {loading ? <Spinner animation="border" size="sm" /> : <><FaSave className="me-2" />Enregistrer les modifications</>}
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

export default AdminProfilePage;
