// frontend/src/pages/Collector/CollectorSettingsPage.js
import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { FaUserCog, FaBell, FaLock, FaSave } from 'react-icons/fa'; // FaSyncAlt removed as it's not used in the snippet
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../contexts/AuthContext';
import collectorService from '../../services/collectorService';
import useAuth from '../../hooks/useAuth';
import { toast } from 'react-toastify';

/**
 * CollectorSettingsPage - Component for managing personal and notification settings for collectors.
 * This page allows collectors to update their profile information, notification preferences,
 * and change their password.
 */
const CollectorSettingsPage = () => {
    const navigate = useNavigate();
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
        profilePictureUrl: ''
    });

    const [notificationSettings, setNotificationSettings] = useState({
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
        alertTone: true
    });

    const [passwordSettings, setPasswordSettings] = useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
    });

    // Populate profile settings from AuthContext user data on component mount or user change
    useEffect(() => {
        if (user) {
            setProfileSettings({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
                phoneNumber: user.phoneNumber || '',
                address: user.address || '',
                profilePictureUrl: user.profilePictureUrl || ''
            });
            // Also load other settings that might be stored in the user object
            setNotificationSettings({
                emailNotifications: user.emailNotifications ?? true,
                smsNotifications: user.smsNotifications ?? false,
                pushNotifications: user.pushNotifications ?? true,
                alertTone: user.alertTone ?? true
            });
        }
    }, [user]); // Re-run if user object changes

    // Fetch full profile from backend on component mount for potentially richer data
    const loadCollectorProfile = async () => {
        setLoading(true);
        setAlert({ show: false, type: '', message: '' });
        try {
            // Use collectorService to get detailed profile
            const response = await collectorService.getCollectorProfile();
            setProfileSettings(prev => ({ ...prev, ...response.data })); // Merge with existing to keep defaults if API misses fields
            toast.success('Profil collecteur chargé avec succès!');
        } catch (err) {
            console.error('Error loading collector profile:', err);
            setAlert({ show: true, type: 'danger', message: 'Échec du chargement du profil collecteur.' });
            toast.error('Échec du chargement du profil collecteur.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCollectorProfile();
    }, []); // Empty dependency array means it runs once on mount

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfileSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleNotificationChange = (e) => {
        const { name, checked } = e.target;
        setNotificationSettings(prev => ({ ...prev, [name]: checked }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setAlert({ show: false, type: '', message: '' });
        try {
            await authUpdateProfile(profileSettings); // Call updateProfile from useAuth
            setAlert({ show: true, type: 'success', message: 'Profil mis à jour avec succès!' });
            toast.success('Profil mis à jour avec succès!');
        } catch (err) {
            console.error('Error updating profile:', err);
            const errorMessage = err.response?.data?.message || 'Échec de la mise à jour du profil.';
            setAlert({ show: true, type: 'danger', message: errorMessage });
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleNotificationSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setAlert({ show: false, type: '', message: '' });
        try {
            // Placeholder: In a real app, you would send this to a notification service
            // await notificationService.updateNotificationPreferences(user.id, notificationSettings);
            toast.success('Préférences de notification mises à jour avec succès!');
            setAlert({ show: true, type: 'success', message: 'Préférences de notification mises à jour avec succès!' });
        } catch (err) {
            console.error('Error updating notification settings:', err);
            const errorMessage = err.response?.data?.message || 'Échec de la mise à jour des préférences de notification.';
            setAlert({ show: true, type: 'danger', message: errorMessage });
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setAlert({ show: false, type: '', message: '' });
        try {
            if (passwordSettings.newPassword !== passwordSettings.confirmNewPassword) {
                setAlert({ show: true, type: 'danger', message: 'Le nouveau mot de passe et la confirmation ne correspondent pas.' });
                toast.error('Le nouveau mot de passe et la confirmation ne correspondent pas.');
                return;
            }
            await authChangePassword(passwordSettings.currentPassword, passwordSettings.newPassword); // Call changePassword from useAuth
            setAlert({ show: true, type: 'success', message: 'Mot de passe mis à jour avec succès!' });
            toast.success('Mot de passe mis à jour avec succès!');
            setPasswordSettings({ currentPassword: '', newPassword: '', confirmNewPassword: '' }); // Clear fields
        } catch (err) {
            console.error('Error changing password:', err);
            const errorMessage = err.response?.data?.message || 'Échec du changement de mot de passe.';
            setAlert({ show: true, type: 'danger', message: errorMessage });
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="py-5 font-inter bg-gray-50 min-h-screen">
            <Row className="justify-content-center">
                <Col md={10} lg={8}>
                    <h2 className="text-4xl font-bold text-green-600 mb-5 text-center">⚙️ Mes Paramètres</h2>

                    {loading && (
                        <div className="text-center my-4">
                            <Spinner animation="border" role="status" variant="primary" />
                            <p className="mt-2 text-gray-600">Chargement des paramètres...</p>
                        </div>
                    )}

                    {alert.show && (
                        <Alert variant={alert.type} onClose={() => setAlert({ show: false, type: '', message: '' })} dismissible className="mb-4">
                            {alert.message}
                        </Alert>
                    )}

                    {!loading && ( // Render content only when not loading
                        <>
                            {/* Profile Settings Card */}
                            <Card className="shadow-lg rounded-xl border-0 p-4 mb-5">
                                <Card.Body>
                                    <h4 className="text-2xl font-bold text-gray-800 mb-4 flex items-center"><FaUserCog className="me-3 text-blue-500" /> Paramètres du Profil</h4>
                                    <Form onSubmit={handleProfileSubmit}>
                                        <Form.Group className="mb-3" controlId="firstName">
                                            <Form.Label>Prénom</Form.Label>
                                            <Form.Control type="text" name="firstName" value={profileSettings.firstName} onChange={handleProfileChange} disabled={loading} />
                                        </Form.Group>
                                        <Form.Group className="mb-3" controlId="lastName">
                                            <Form.Label>Nom</Form.Label>
                                            <Form.Control type="text" name="lastName" value={profileSettings.lastName} onChange={handleProfileChange} disabled={loading} />
                                        </Form.Group>
                                        <Form.Group className="mb-3" controlId="email">
                                            <Form.Label>Email</Form.Label>
                                            <Form.Control type="email" name="email" value={profileSettings.email} onChange={handleProfileChange} disabled={true} /> {/* Email usually not editable */}
                                        </Form.Group>
                                        <Form.Group className="mb-3" controlId="phoneNumber">
                                            <Form.Label>Téléphone</Form.Label>
                                            <Form.Control type="text" name="phoneNumber" value={profileSettings.phoneNumber} onChange={handleProfileChange} disabled={loading} />
                                        </Form.Group>
                                        <Form.Group className="mb-3" controlId="address">
                                            <Form.Label>Adresse</Form.Label>
                                            <Form.Control as="textarea" rows={3} name="address" value={profileSettings.address} onChange={handleProfileChange} disabled={loading} />
                                        </Form.Group>
                                        <Button variant="primary" type="submit" disabled={loading}>
                                            <FaSave className="me-2" />
                                            Enregistrer les modifications
                                        </Button>
                                    </Form>
                                </Card.Body>
                            </Card>

                            {/* Notification Settings Card */}
                            <Card className="shadow-lg rounded-xl border-0 p-4 mb-5">
                                <Card.Body>
                                    <h4 className="text-2xl font-bold text-gray-800 mb-4 flex items-center"><FaBell className="me-3 text-yellow-500" /> Préférences de Notification</h4>
                                    <Form onSubmit={handleNotificationSubmit}>
                                        <Form.Group className="mb-3" controlId="emailNotifications">
                                            <Form.Check
                                                type="switch"
                                                id="email-notifications-switch"
                                                label="Notifications par Email"
                                                name="emailNotifications"
                                                checked={notificationSettings.emailNotifications}
                                                onChange={handleNotificationChange}
                                                disabled={loading}
                                            />
                                        </Form.Group>
                                        <Form.Group className="mb-3" controlId="smsNotifications">
                                            <Form.Check
                                                type="switch"
                                                id="sms-notifications-switch"
                                                label="Notifications par SMS"
                                                name="smsNotifications"
                                                checked={notificationSettings.smsNotifications}
                                                onChange={handleNotificationChange}
                                                disabled={loading}
                                            />
                                        </Form.Group>
                                        <Form.Group className="mb-3" controlId="pushNotifications">
                                            <Form.Check
                                                type="switch"
                                                id="push-notifications-switch"
                                                label="Notifications Push"
                                                name="pushNotifications"
                                                checked={notificationSettings.pushNotifications}
                                                onChange={handleNotificationChange}
                                                disabled={loading}
                                            />
                                        </Form.Group>
                                        <Form.Group className="mb-3" controlId="alertTone">
                                            <Form.Check
                                                type="switch"
                                                id="alert-tone-switch"
                                                label="Sonnerie d'alerte"
                                                name="alertTone"
                                                checked={notificationSettings.alertTone}
                                                onChange={handleNotificationChange}
                                                disabled={loading}
                                            />
                                        </Form.Group>
                                        <Button variant="info" type="submit" disabled={loading}>
                                            <FaSave className="me-2" />
                                            Enregistrer les préférences
                                        </Button>
                                    </Form>
                                </Card.Body>
                            </Card>

                            {/* Password Settings Card */}
                            <Card className="shadow-lg rounded-xl border-0 p-4 mb-5">
                                <Card.Body>
                                    <h4 className="text-2xl font-bold text-gray-800 mb-4 flex items-center"><FaLock className="me-3 text-red-500" /> Changer le Mot de Passe</h4>
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
                        </>
                    )}
                </Col>
            </Row>
        </Container>
    );
};

export default CollectorSettingsPage;
