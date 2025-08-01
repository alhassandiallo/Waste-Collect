import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { FaUserCog, FaSave, FaLock } from 'react-icons/fa'; 
import { toast } from 'react-toastify';
import useAuth from '../../hooks/useAuth';
import householdService from '../../services/householdService'; // Use household service

/**
 * HouseholdSettingsPage - Component for managing personal and preferences settings for households.
 * This page allows households to update their profile information,
 * and change their password.
 */
const HouseholdSettingsPage = () => {
    const { user, updateProfile: authUpdateProfile, changePassword: authChangePassword } = useAuth();

    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState({ show: false, type: '', message: '' });

    // State for household profile settings
    const [profileSettings, setProfileSettings] = useState({
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
    });

    // State for password change form
    const [passwordSettings, setPasswordSettings] = useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
    });

    // Load household profile data on component mount
    useEffect(() => {
        const fetchHouseholdProfile = async () => {
            setLoading(true);
            try {
                const data = await householdService.getHouseholdProfile();
                setProfileSettings({
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
                });
                setAlert({ show: false, type: '', message: '' });
            } catch (err) {
                console.error('Error fetching household profile:', err);
                setAlert({ show: true, type: 'danger', message: 'Erreur lors du chargement du profil.' });
            } finally {
                setLoading(false);
            }
        };

        if (user && user.role === 'HOUSEHOLD') { // Ensure it only fetches for households
            fetchHouseholdProfile();
        }
    }, [user]);

    // Handle changes in profile settings form
    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfileSettings((prev) => ({ ...prev, [name]: value }));
    };

    // Handle changes in password settings form
    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordSettings((prev) => ({ ...prev, [name]: value }));
    };

    // Handle profile update submission
    const handleUpdateProfile = async () => {
        setLoading(true);
        setAlert({ show: false, type: '', message: '' });
        try {
            // Only send fields that might have changed or are part of the update DTO
            const updateData = {
                firstName: profileSettings.firstName,
                lastName: profileSettings.lastName,
                email: profileSettings.email,
                phoneNumber: profileSettings.phoneNumber,
                address: profileSettings.address,
                numberOfMembers: parseInt(profileSettings.numberOfMembers), // Ensure number
                housingType: profileSettings.housingType,
                collectionPreferences: profileSettings.collectionPreferences,
                latitude: profileSettings.latitude ? parseFloat(profileSettings.latitude) : null,
                longitude: profileSettings.longitude ? parseFloat(profileSettings.longitude) : null,
            };
            
            // Use authUpdateProfile from useAuth which also updates context
            const success = await authUpdateProfile(updateData);
            if (success) {
                setAlert({ show: true, type: 'success', message: 'Profil mis à jour avec succès !' });
                toast.success('Profil mis à jour !');
            } else {
                 setAlert({ show: true, type: 'danger', message: 'Échec de la mise à jour du profil.' });
            }
        } catch (err) {
            console.error('Error updating profile:', err);
            setAlert({ show: true, type: 'danger', message: err.message || 'Échec de la mise à jour du profil.' });
        } finally {
            setLoading(false);
        }
    };

    // Handle password change submission
    const handleChangePassword = async () => {
        setLoading(true);
        setAlert({ show: false, type: '', message: '' });

        const { currentPassword, newPassword, confirmNewPassword } = passwordSettings;

        if (newPassword !== confirmNewPassword) {
            setAlert({ show: true, type: 'danger', message: 'Les nouveaux mots de passe ne correspondent pas.' });
            setLoading(false);
            return;
        }
        if (newPassword.length < 8) {
            setAlert({ show: true, type: 'danger', message: 'Le nouveau mot de passe doit contenir au moins 8 caractères.' });
            setLoading(false);
            return;
        }

        try {
            const success = await authChangePassword(currentPassword, newPassword);
            if (success) {
                setAlert({ show: true, type: 'success', message: 'Mot de passe changé avec succès !' });
                setPasswordSettings({ currentPassword: '', newPassword: '', confirmNewPassword: '' }); // Clear form
                toast.success('Mot de passe mis à jour !');
            } else {
                 setAlert({ show: true, type: 'danger', message: 'Échec du changement de mot de passe.' });
            }
        } catch (err) {
            console.error('Error changing password:', err);
            setAlert({ show: true, type: 'danger', message: err.message || 'Échec du changement de mot de passe.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="py-5">
            <Row className="mb-4">
                <Col>
                    <h1 className="text-primary text-center">Paramètres du Ménage</h1>
                    <p className="lead text-muted text-center">Gérez les informations de votre profil et vos préférences.</p>
                </Col>
            </Row>

            {loading && (
                <div className="d-flex justify-content-center my-4">
                    <Spinner animation="border" variant="primary" />
                </div>
            )}

            {alert.show && <Alert variant={alert.type}>{alert.message}</Alert>}

            {!loading && user && user.role === 'HOUSEHOLD' && (
                <>
                    {/* Profile Settings Card */}
                    <Card className="shadow mb-4">
                        <Card.Header className="bg-primary text-white">
                            <FaUserCog className="me-2" />
                            Informations du Profil
                        </Card.Header>
                        <Card.Body>
                            <Form>
                                <Row className="mb-3">
                                    <Col md={6}>
                                        <Form.Group controlId="firstName">
                                            <Form.Label>Prénom</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="firstName"
                                                value={profileSettings.firstName}
                                                onChange={handleProfileChange}
                                                disabled={loading}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group controlId="lastName">
                                            <Form.Label>Nom</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="lastName"
                                                value={profileSettings.lastName}
                                                onChange={handleProfileChange}
                                                disabled={loading}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Form.Group className="mb-3" controlId="email">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        name="email"
                                        value={profileSettings.email}
                                        onChange={handleProfileChange}
                                        disabled={loading}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="phoneNumber">
                                    <Form.Label>Numéro de Téléphone</Form.Label>
                                    <Form.Control
                                        type="tel"
                                        name="phoneNumber"
                                        value={profileSettings.phoneNumber}
                                        onChange={handleProfileChange}
                                        disabled={loading}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="address">
                                    <Form.Label>Adresse</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="address"
                                        value={profileSettings.address}
                                        onChange={handleProfileChange}
                                        disabled={loading}
                                    />
                                </Form.Group>

                                <Row className="mb-3">
                                    <Col md={6}>
                                        <Form.Group controlId="numberOfMembers">
                                            <Form.Label>Nombre de Membres</Form.Label>
                                            <Form.Control
                                                type="number"
                                                name="numberOfMembers"
                                                value={profileSettings.numberOfMembers}
                                                onChange={handleProfileChange}
                                                disabled={loading}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group controlId="housingType">
                                            <Form.Label>Type de Logement</Form.Label>
                                            <Form.Select
                                                name="housingType"
                                                value={profileSettings.housingType}
                                                onChange={handleProfileChange}
                                                disabled={loading}
                                            >
                                                <option value="">Sélectionner...</option>
                                                <option value="APARTMENT">Appartement</option>
                                                <option value="HOUSE">Maison</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Form.Group className="mb-3" controlId="collectionPreferences">
                                    <Form.Label>Préférences de Collecte</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        name="collectionPreferences"
                                        value={profileSettings.collectionPreferences}
                                        onChange={handleProfileChange}
                                        disabled={loading}
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
                                                value={profileSettings.latitude}
                                                onChange={handleProfileChange}
                                                disabled={loading}
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
                                                value={profileSettings.longitude}
                                                onChange={handleProfileChange}
                                                disabled={loading}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>


                                <Button
                                    variant="primary"
                                    onClick={handleUpdateProfile}
                                    disabled={loading}
                                >
                                    <FaSave className="me-2" />
                                    Mettre à jour le Profil
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>

                    {/* Password Settings Card */}
                    <Card className="shadow">
                        <Card.Header className="bg-info text-white">
                            <FaLock className="me-2" />
                            Changer le Mot de Passe
                        </Card.Header>
                        <Card.Body>
                            <Form>
                                <Form.Group className="mb-3" controlId="currentPassword">
                                    <Form.Label>Mot de passe actuel</Form.Label>
                                    <Form.Control
                                        type="password"
                                        name="currentPassword"
                                        value={passwordSettings.currentPassword}
                                        onChange={handlePasswordChange}
                                        disabled={loading}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="newPassword">
                                    <Form.Label>Nouveau mot de passe</Form.Label>
                                    <Form.Control
                                        type="password"
                                        name="newPassword"
                                        value={passwordSettings.newPassword}
                                        onChange={handlePasswordChange}
                                        disabled={loading}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="confirmNewPassword">
                                    <Form.Label>Confirmer le nouveau mot de passe</Form.Label>
                                    <Form.Control
                                        type="password"
                                        name="confirmNewPassword"
                                        value={passwordSettings.confirmNewPassword}
                                        onChange={handlePasswordChange}
                                        disabled={loading}
                                    />
                                </Form.Group>
                                <Button
                                    variant="info"
                                    onClick={handleChangePassword}
                                    disabled={loading}
                                >
                                    <FaSave className="me-2" />
                                    Changer le Mot de Passe
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </>
            )}
        </Container>
    );
};

export default HouseholdSettingsPage;
