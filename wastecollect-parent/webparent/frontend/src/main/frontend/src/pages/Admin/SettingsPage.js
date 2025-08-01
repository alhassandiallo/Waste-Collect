import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { FaUserCog, FaBell, FaLock, FaDatabase, FaInfoCircle, FaSave, FaSyncAlt, FaDownload } from 'react-icons/fa'; // Import FaDownload
import { useNavigate, Link } from 'react-router-dom'; // Import useNavigate

/**
 * SettingsPage - Component for managing application settings for administrators.
 * This page provides various configurable options including general preferences,\r\n
 * notification settings, security, and data management.
 *\r\n
 * NOTE: This is a client-side mock-up. Real-world implementation would require\r\n
 * backend endpoints for fetching and updating user/system settings.
 */
const SettingsPage = () => {
    const navigate = useNavigate(); // Initialize useNavigate

    // State for managing loading status
    const [loading, setLoading] = useState(false);
    // State for managing alert messages (success/error)
    const [alert, setAlert] = useState({ show: false, type: '', message: '' });

    // States for various setting categories
    const [generalSettings, setGeneralSettings] = useState({
        username: 'AdminUser', // Mock data, ideally from logged-in user context
        email: 'admin@wastecollect.com', // Mock data
        language: 'fr',
        theme: 'light',
    });

    const [notificationSettings, setNotificationSettings] = useState({
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
        alertThreshold: 80, // Example: waste bin full alert threshold
    });

    const [securitySettings, setSecuritySettings] = useState({
        twoFactorAuth: false,
        sessionTimeout: 30, // in minutes
        // password: '', // Password change should be handled separately
        // confirmPassword: '',
    });

    // Mock effect to simulate loading settings
    useEffect(() => {
        setLoading(true);
        // In a real app, you'd fetch these from your backend
        setTimeout(() => {
            // setGeneralSettings(fetchedGeneralSettings);
            // setNotificationSettings(fetchedNotificationSettings);
            // setSecuritySettings(fetchedSecuritySettings);
            setLoading(false);
        }, 1000);
    }, []);

    /**
     * Handles changes in general settings form.
     */
    const handleGeneralChange = (e) => {
        const { name, value } = e.target;
        setGeneralSettings(prev => ({ ...prev, [name]: value }));
    };

    /**
     * Handles changes in notification settings form.
     */
    const handleNotificationChange = (e) => {
        const { name, type, checked, value } = e.target;
        setNotificationSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    /**
     * Handles changes in security settings form.
     */
    const handleSecurityChange = (e) => {
        const { name, type, checked, value } = e.target;
        setSecuritySettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    /**
     * Simulates saving settings to the backend.
     */
    const handleSaveSettings = async (settingType) => {
        setLoading(true);
        setAlert({ show: false, type: '', message: '' });
        try {
            // Simulate API call based on settingType
            console.log(`Saving ${settingType} settings:`, 
                settingType === 'general' ? generalSettings :
                settingType === 'notifications' ? notificationSettings :
                securitySettings
            );
            await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay
            setAlert({ show: true, type: 'success', message: `${settingType} settings saved successfully!` });
        } catch (error) {
            console.error(`Error saving ${settingType} settings:`, error);
            setAlert({ show: true, type: 'danger', message: `Failed to save ${settingType} settings.` });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="my-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="mb-0">
                    <FaUserCog className="me-2" /> Paramètres de l'Application
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

            {alert.show && <Alert variant={alert.type}>{alert.message}</Alert>}

            {loading && (
                <div className="text-center my-4">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-2">Chargement des paramètres...</p>
                </div>
            )}

            {/* General Settings Card */}
            <Row className="mb-4">
                <Col lg={12}>
                    <Card className="shadow-sm">
                        <Card.Header className="bg-primary text-white d-flex align-items-center">
                            <FaUserCog className="me-2" />
                            <h5 className="mb-0">Paramètres Généraux</h5>
                        </Card.Header>
                        <Card.Body>
                            <Form>
                                <Form.Group className="mb-3" controlId="generalUsername">
                                    <Form.Label>Nom d'utilisateur</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="username"
                                        value={generalSettings.username}
                                        onChange={handleGeneralChange}
                                        disabled={loading}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="generalEmail">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        name="email"
                                        value={generalSettings.email}
                                        onChange={handleGeneralChange}
                                        disabled={loading}
                                    />
                                </Form.Group>
                                <Row>
                                    <Form.Group as={Col} className="mb-3" controlId="generalLanguage">
                                        <Form.Label>Langue</Form.Label>
                                        <Form.Select
                                            name="language"
                                            value={generalSettings.language}
                                            onChange={handleGeneralChange}
                                            disabled={loading}
                                        >
                                            <option value="fr">Français</option>
                                            <option value="en">English</option>
                                        </Form.Select>
                                    </Form.Group>
                                    <Form.Group as={Col} className="mb-3" controlId="generalTheme">
                                        <Form.Label>Thème</Form.Label>
                                        <Form.Select
                                            name="theme"
                                            value={generalSettings.theme}
                                            onChange={handleGeneralChange}
                                            disabled={loading}
                                        >
                                            <option value="light">Clair</option>
                                            <option value="dark">Sombre</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Row>
                                <Button
                                    variant="primary"
                                    onClick={() => handleSaveSettings('general')}
                                    disabled={loading}
                                >
                                    <FaSave className="me-2" />
                                    Sauvegarder les Paramètres Généraux
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Notification Settings Card */}
            <Row className="mb-4">
                <Col lg={12}>
                    <Card className="shadow-sm">
                        <Card.Header className="bg-success text-white d-flex align-items-center">
                            <FaBell className="me-2" />
                            <h5 className="mb-0">Paramètres de Notification</h5>
                        </Card.Header>
                        <Card.Body>
                            <Form>
                                <Form.Group className="mb-3" controlId="notificationEmail">
                                    <Form.Check
                                        type="checkbox"
                                        label="Notifications par Email"
                                        name="emailNotifications"
                                        checked={notificationSettings.emailNotifications}
                                        onChange={handleNotificationChange}
                                        disabled={loading}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="notificationSMS">
                                    <Form.Check
                                        type="checkbox"
                                        label="Notifications par SMS"
                                        name="smsNotifications"
                                        checked={notificationSettings.smsNotifications}
                                        onChange={handleNotificationChange}
                                        disabled={loading}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="notificationPush">
                                    <Form.Check
                                        type="checkbox"
                                        label="Notifications Push"
                                        name="pushNotifications"
                                        checked={notificationSettings.pushNotifications}
                                        onChange={handleNotificationChange}
                                        disabled={loading}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="notificationThreshold">
                                    <Form.Label>Seuil d'alerte (en %)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="alertThreshold"
                                        value={notificationSettings.alertThreshold}
                                        onChange={handleNotificationChange}
                                        min="0"
                                        max="100"
                                        disabled={loading}
                                    />
                                </Form.Group>
                                <Button
                                    variant="success"
                                    onClick={() => handleSaveSettings('notifications')}
                                    disabled={loading}
                                >
                                    <FaSave className="me-2" />
                                    Sauvegarder les Notifications
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Security Settings Card */}
            <Row className="mb-4">
                <Col lg={12}>
                    <Card className="shadow-sm">
                        <Card.Header className="bg-info text-white d-flex align-items-center">
                            <FaLock className="me-2" />
                            <h5 className="mb-0">Paramètres de Sécurité</h5>
                        </Card.Header>
                        <Card.Body>
                            <Form>
                                <Form.Group className="mb-3" controlId="securityTwoFactor">
                                    <Form.Check
                                        type="switch"
                                        id="twoFactorAuthSwitch"
                                        label="Authentification à deux facteurs (2FA)"
                                        name="twoFactorAuth"
                                        checked={securitySettings.twoFactorAuth}
                                        onChange={handleSecurityChange}
                                        disabled={loading}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="securitySessionTimeout">
                                    <Form.Label>Délai d'expiration de session (minutes)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="sessionTimeout"
                                        value={securitySettings.sessionTimeout}
                                        onChange={handleSecurityChange}
                                        min="5"
                                        max="120"
                                        disabled={loading}
                                    />
                                </Form.Group>
                                {/* Password change link/button can go here, leading to a dedicated component/modal */}
                                <Button
                                    variant="info"
                                    onClick={() => handleSaveSettings('security')}
                                    disabled={loading}
                                >
                                    <FaSave className="me-2" />
                                    Sauvegarder les Paramètres de Sécurité
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Data Management Card */}
            <Row className="mb-4">
                <Col lg={12}>
                    <Card className="shadow-sm">
                        <Card.Header className="bg-warning text-dark d-flex align-items-center">
                            <FaDatabase className="me-2" />
                            <h5 className="mb-0">Gestion des Données</h5>
                        </Card.Header>
                        <Card.Body>
                            <Form>
                                <p className="text-muted">
                                    Gérez l'importation et l'exportation des données du système.
                                    Ces opérations peuvent prendre du temps en fonction du volume de données.
                                </p>
                                <p>
                                    <Button variant="outline-warning" size="sm" className="me-2" disabled>
                                        <FaDownload className="me-2" />
                                        Exporter les données (Bientôt)
                                    </Button>
                                    <Button variant="outline-info" size="sm" className="ms-2" disabled>
                                        Importer des données (Bientôt)
                                    </Button>
                                </p>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* About Section Card */}
            <Row>
                <Col lg={12}>
                    <Card className="shadow-sm">
                        <Card.Header className="bg-light d-flex align-items-center">
                            <FaInfoCircle className="me-2" />
                            <h5 className="mb-0">À propos</h5>
                        </Card.Header>
                        <Card.Body>
                            <p><strong>WasteCollect Application</strong></p>
                            <p>Version: 1.0.0 (Beta)</p>
                            <p>Dernière mise à jour: Juin 2025</p>
                            <p className="text-muted">
                                &copy; 2025 WasteCollect. Tous droits réservés.
                            </p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default SettingsPage;
