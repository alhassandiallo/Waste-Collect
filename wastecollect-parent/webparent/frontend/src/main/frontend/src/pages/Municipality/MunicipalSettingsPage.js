// frontend/src/pages/Municipal/MunicipalSettingsPage.js
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { FaUserCog, FaBell, FaLock, FaSave } from 'react-icons/fa';
import { toast } from 'react-toastify';
import useAuth from '../../hooks/useAuth'; // Use useAuth for profile and password management
import municipalityService from '../../services/municipalityService'; // For municipality-specific settings if any

/**
 * MunicipalSettingsPage - Component for managing personal and notification settings for municipal managers.
 * This page allows municipal managers to update their profile information, notification preferences,
 * and change their password.
 */
const MunicipalSettingsPage = () => {
    // Destructure user, updateProfile, and changePassword from useAuth
    const { user, updateProfile: authUpdateProfile, changePassword: authChangePassword } = useAuth();

    // State for managing loading status
    const [loading, setLoading] = useState(false);
    // State for managing alert messages (success/error)
    const [alert, setAlert] = useState({ show: false, type: '', message: '' });

    // States for various setting categories
    const [profileSettings, setProfileSettings] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        address: '',
        municipalityName: '', // Assuming this comes from user profile
    });

    const [notificationSettings, setNotificationSettings] = useState({
        emailNotifications: true,
        smsNotifications: false,
        appNotifications: true,
    });

    const [passwordSettings, setPasswordSettings] = useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
    });

    /**
     * Effect to load user profile data when the component mounts or user changes
     */
    useEffect(() => {
        if (user) {
            setProfileSettings({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
                phoneNumber: user.phoneNumber || '',
                address: user.address || '',
                municipalityName: user.municipalityName || 'N/A', // Assuming municipalityName is available on user object
            });
            // You might load actual notification preferences from a backend API if they exist
            // For now, using default state values.
        }
    }, [user]);

    /**
     * Handles changes in profile settings form fields
     */
    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfileSettings(prev => ({ ...prev, [name]: value }));
    };

    /**
     * Handles changes in notification settings checkboxes
     */
    const handleNotificationChange = (e) => {
        const { name, checked } = e.target;
        setNotificationSettings(prev => ({ ...prev, [name]: checked }));
    };

    /**
     * Handles changes in password settings form fields
     */
    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordSettings(prev => ({ ...prev, [name]: value }));
    };

    /**
     * Handles submission of profile settings
     */
    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setAlert({ show: false, type: '', message: '' });

        try {
            // Call the updateProfile from useAuth (which interacts with authService)
            const success = await authUpdateProfile({
                firstName: profileSettings.firstName,
                lastName: profileSettings.lastName,
                email: profileSettings.email,
                phoneNumber: profileSettings.phoneNumber,
                address: profileSettings.address,
                // Do not send municipalityName back as it's typically set by backend
            });

            if (success) {
                toast.success('Profil mis à jour avec succès !');
            } else {
                toast.error('Échec de la mise à jour du profil.');
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error('Une erreur est survenue lors de la mise à jour du profil.');
        } finally {
            setLoading(false);
        }
    };

    /**
     * Handles submission of notification settings
     * This is a placeholder as backend integration for notifications is not present
     */
    const handleNotificationSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setAlert({ show: false, type: '', message: '' });

        // Simulate API call
        setTimeout(() => {
            console.log('Notification settings updated:', notificationSettings);
            toast.success('Préférences de notification mises à jour !');
            setLoading(false);
        }, 1000);
    };

    /**
     * Handles password change request
     */
    const handleChangePassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setAlert({ show: false, type: '', message: '' });

        const { currentPassword, newPassword, confirmNewPassword } = passwordSettings;

        if (newPassword !== confirmNewPassword) {
            toast.error('Le nouveau mot de passe et la confirmation ne correspondent pas.');
            setLoading(false);
            return;
        }

        if (!user || !user.email) {
            toast.error('Erreur: Impossible de trouver l\'utilisateur pour changer le mot de passe.');
            setLoading(false);
            return;
        }

        try {
            // Call changePassword from useAuth (which interacts with authService)
            const success = await authChangePassword(user.email, currentPassword, newPassword);
            if (success) {
                toast.success('Mot de passe mis à jour avec succès.');
                // Clear password fields on success
                setPasswordSettings({
                    currentPassword: '',
                    newPassword: '',
                    confirmNewPassword: '',
                });
            } else {
                // Error message already handled by useAuth
            }
        } catch (error) {
            console.error("Error changing password:", error);
            toast.error('Une erreur est survenue lors du changement de mot de passe.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="my-5">
            <Row className="justify-content-center">
                <Col md={10} lg={8}>
                    <h2 className="mb-4 text-center">
                        <FaUserCog className="me-2" />
                        Paramètres du Compte Municipal
                    </h2>
                    {alert.show && (
                        <Alert variant={alert.type} onClose={() => setAlert({ show: false })} dismissible>
                            {alert.message}
                        </Alert>
                    )}
                    {loading && (
                        <div className="d-flex justify-content-center my-3">
                            <Spinner animation="border" role="status">
                                <span className="visually-hidden">Chargement...</span>
                            </Spinner>
                        </div>
                    )}

                    {/* Section Informations du Profil */}
                    <Card className="shadow-sm mb-4">
                        <Card.Header className="bg-primary text-white">
                            <h5 className="mb-0">
                                <FaUserCog className="me-2" />
                                Informations du Profil
                            </h5>
                        </Card.Header>
                        <Card.Body>
                            <Form onSubmit={handleProfileSubmit}>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3" controlId="firstName">
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
                                        <Form.Group className="mb-3" controlId="lastName">
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
                                <Form.Group className="mb-3" controlId="municipalityName">
                                    <Form.Label>Municipalité</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="municipalityName"
                                        value={profileSettings.municipalityName}
                                        readOnly // This should be read-only as it's assigned by backend
                                        disabled={loading}
                                    />
                                </Form.Group>
                                <Button variant="primary" type="submit" disabled={loading}>
                                    <FaSave className="me-2" />
                                    Enregistrer le Profil
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>

                    {/* Section Préférences de Notification */}
                    <Card className="shadow-sm mb-4">
                        <Card.Header className="bg-info text-white">
                            <h5 className="mb-0">
                                <FaBell className="me-2" />
                                Préférences de Notification
                            </h5>
                        </Card.Header>
                        <Card.Body>
                            <Form onSubmit={handleNotificationSubmit}>
                                <Form.Group className="mb-3" controlId="emailNotifications">
                                    <Form.Check
                                        type="checkbox"
                                        name="emailNotifications"
                                        label="Recevoir les notifications par email"
                                        checked={notificationSettings.emailNotifications}
                                        onChange={handleNotificationChange}
                                        disabled={loading}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="smsNotifications">
                                    <Form.Check
                                        type="checkbox"
                                        name="smsNotifications"
                                        label="Recevoir les notifications par SMS"
                                        checked={notificationSettings.smsNotifications}
                                        onChange={handleNotificationChange}
                                        disabled={loading}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="appNotifications">
                                    <Form.Check
                                        type="checkbox"
                                        name="appNotifications"
                                        label="Recevoir les notifications in-app"
                                        checked={notificationSettings.appNotifications}
                                        onChange={handleNotificationChange}
                                        disabled={loading}
                                    />
                                </Form.Group>
                                <Button variant="info" type="submit" disabled={loading}>
                                    <FaSave className="me-2" />
                                    Enregistrer les Préférences
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>

                    {/* Section Changer le Mot de Passe */}
                    <Card className="shadow-sm mb-4">
                        <Card.Header className="bg-warning text-white">
                            <h5 className="mb-0">
                                <FaLock className="me-2" />
                                Changer le Mot de Passe
                            </h5>
                        </Card.Header>
                        <Card.Body>
                            <Form onSubmit={handleChangePassword}>
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
                                    variant="warning"
                                    type="submit"
                                    disabled={loading}
                                >
                                    <FaSave className="me-2" />
                                    Changer le Mot de Passe
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default MunicipalSettingsPage;
