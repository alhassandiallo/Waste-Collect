// File: frontend/src/pages/Admin/SendNotificationPage.js
import React, { useState, useEffect, useCallback } from 'react';
import {
    Container,
    Form,
    Button,
    Card,
    Row,
    Col,
    Alert,
    Spinner,
    InputGroup // Added InputGroup import
} from 'react-bootstrap';
import { FaPaperPlane, FaUserTag, FaUsers, FaEnvelope, FaBell, FaExclamationTriangle, FaInfoCircle, FaCalendarAlt, FaCity } from 'react-icons/fa';
import Select from 'react-select'; // For multi-select dropdown
import { toast } from 'react-toastify';
import { useNavigate, Link } from 'react-router-dom';
import adminService from '../../services/adminService';
// Removed unused import: import userService from '../../services/userService'; 

const notificationTypes = [
    { value: 'ALERT', label: 'Alerte', icon: <FaExclamationTriangle className="me-2 text-danger" /> },
    { value: 'REMINDER', label: 'Rappel', icon: <FaCalendarAlt className="me-2 text-warning" /> },
    { value: 'INFO', label: 'Information', icon: <FaInfoCircle className="me-2 text-info" /> },
    { value: 'SYSTEM_MESSAGE', label: 'Message Système', icon: <FaBell className="me-2 text-primary" /> },
    // Add other relevant types from NotificationType.java if needed
    // { value: 'PAYMENT_CONFIRMATION', label: 'Confirmation Paiement' },
    // { value: 'DISPUTE_RESOLUTION', label: 'Résolution Litige' },
    // { value: 'SERVICE_REQUEST_UPDATE', label: 'Mise à jour Demande de Service' },
    // { value: 'NEW_SERVICE_REQUEST', label: 'Nouvelle Demande de Service' },
    // { value: 'COLLECTION_REMINDER', label: 'Rappel de Collecte' },
];

const roles = [
    { value: 'COLLECTOR', label: 'Collecteurs' },
    { value: 'HOUSEHOLD', label: 'Ménages' },
    { value: 'MUNICIPALITY', label: 'Municipalités' }, // Note: This role is for municipality user accounts, not the municipal entities themselves.
    { value: 'MUNICIPAL_MANAGER', label: 'Gérants Municipaux' },
];

/**
 * SendNotificationPage - Admin page for sending custom notifications.
 * Allows administrators to compose messages and target them to:
 * - All users
 * - Users of a specific role (Collector, Household, Municipality, Municipal Manager)
 * - Specific individual users (selected from a list)
 */
const SendNotificationPage = () => {
	const navigate = useNavigate();
	
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [notificationType, setNotificationType] = useState(notificationTypes[0].value);
    const [targetAudience, setTargetAudience] = useState('ALL'); // 'ALL', 'ROLE', 'SPECIFIC_USERS'
    const [targetRole, setTargetRole] = useState('');
    const [allUsers, setAllUsers] = useState([]); // List of all users for specific user selection
    const [selectedUsers, setSelectedUsers] = useState([]); // Selected users for specific targeting
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Fetch all users for the 'SPECIFIC_USERS' dropdown
    const fetchAllUsers = useCallback(async () => {
        try {
            setError(null);
            const response = await adminService.getAllUsers({ page: 0, size: 9999 }); // Fetch all users, no pagination
            const formattedUsers = response.content.map(user => ({
                value: user.id,
                label: `${user.firstName} ${user.lastName} (${user.email}) - ${user.roleName}`
            }));
            setAllUsers(formattedUsers);
        } catch (err) {
            console.error("Error fetching all users:", err);
            setError("Erreur lors du chargement de la liste des utilisateurs.");
        }
    }, []);

    useEffect(() => {
        if (targetAudience === 'SPECIFIC_USERS' && allUsers.length === 0) {
            fetchAllUsers();
        }
    }, [targetAudience, allUsers.length, fetchAllUsers]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        let requestBody = {
            subject,
            message,
            notificationType,
            targetAudience,
        };

        if (targetAudience === 'ROLE') {
            if (!targetRole) {
                setError('Veuillez sélectionner un rôle cible.');
                setLoading(false);
                return;
            }
            requestBody.targetRole = targetRole;
        } else if (targetAudience === 'SPECIFIC_USERS') {
            if (selectedUsers.length === 0) {
                setError('Veuillez sélectionner au moins un utilisateur cible.');
                setLoading(false);
                return;
            }
            requestBody.targetUserIds = selectedUsers.map(user => user.value);
        }

        try {
            await adminService.sendNotification(requestBody);
            setSuccess('Notification envoyée avec succès !');
            toast.success('Notification envoyée avec succès !');
            // Clear form
            setSubject('');
            setMessage('');
            setTargetAudience('ALL');
            setTargetRole('');
            setSelectedUsers([]);
        } catch (err) {
            console.error("Failed to send notification:", err);
            setError(err.message || 'Échec de l\'envoi de la notification. Veuillez réessayer.');
            toast.error(err.message || 'Échec de l\'envoi de la notification.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="my-5">
        	<div className="d-flex justify-content-between align-items-center mb-4">
		        <h2 className="mb-0">
		          <FaEnvelope className="me-2" /> Gestion des Notifications
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
            <Card className="shadow-sm">
                <Card.Header as="h4" className="bg-primary text-white d-flex align-items-center">
                    <FaPaperPlane className="me-2" /> Envoyer une Nouvelle Notification
                </Card.Header>
                <Card.Body>
                    {error && <Alert variant="danger">{error}</Alert>}
                    {success && <Alert variant="success">{success}</Alert>}

                    <Form onSubmit={handleSubmit}>
                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Group controlId="notificationSubject">
                                    <Form.Label>Sujet <span className="text-danger">*</span></Form.Label>
                                    <InputGroup>
                                        <InputGroup.Text><FaEnvelope /></InputGroup.Text>
                                        <Form.Control
                                            type="text"
                                            placeholder="Sujet de la notification"
                                            value={subject}
                                            onChange={(e) => setSubject(e.target.value)}
                                            required
                                            maxLength={255}
                                        />
                                    </InputGroup>
                                    <Form.Text className="text-muted">
                                        Max 255 caractères.
                                    </Form.Text>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group controlId="notificationType">
                                    <Form.Label>Type de Notification <span className="text-danger">*</span></Form.Label>
                                    <InputGroup>
                                        <InputGroup.Text><FaBell /></InputGroup.Text>
                                        <Form.Select
                                            value={notificationType}
                                            onChange={(e) => setNotificationType(e.target.value)}
                                            required
                                        >
                                            {notificationTypes.map((type) => (
                                                <option key={type.value} value={type.value}>
                                                    {type.icon} {type.label}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </InputGroup>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group controlId="notificationMessage" className="mb-3">
                            <Form.Label>Message <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={5}
                                placeholder="Contenu détaillé de la notification..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                required
                            />
                        </Form.Group>

                        <Form.Group controlId="targetAudience" className="mb-3">
                            <Form.Label>Cible de la Notification <span className="text-danger">*</span></Form.Label>
                            <InputGroup>
                                <InputGroup.Text><FaUsers /></InputGroup.Text>
                                <Form.Select
                                    value={targetAudience}
                                    onChange={(e) => {
                                        setTargetAudience(e.target.value);
                                        setTargetRole(''); // Reset role when audience changes
                                        setSelectedUsers([]); // Reset specific users when audience changes
                                    }}
                                    required
                                >
                                    <option value="ALL">Tous les Utilisateurs</option>
                                    <option value="ROLE">Par Rôle</option>
                                    <option value="SPECIFIC_USERS">Utilisateurs Spécifiques</option>
                                </Form.Select>
                            </InputGroup>
                        </Form.Group>

                        {targetAudience === 'ROLE' && (
                            <Form.Group controlId="targetRole" className="mb-3">
                                <Form.Label>Sélectionner un Rôle <span className="text-danger">*</span></Form.Label>
                                <InputGroup>
                                    <InputGroup.Text><FaUserTag /></InputGroup.Text>
                                    <Form.Select
                                        value={targetRole}
                                        onChange={(e) => setTargetRole(e.target.value)}
                                        required
                                    >
                                        <option value="">-- Choisir un rôle --</option>
                                        {roles.map((role) => (
                                            <option key={role.value} value={role.value}>
                                                {role.label}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </InputGroup>
                            </Form.Group>
                        )}

                        {targetAudience === 'SPECIFIC_USERS' && (
                            <Form.Group controlId="specificUsers" className="mb-3">
                                <Form.Label>Sélectionner les Utilisateurs <span className="text-danger">*</span></Form.Label>
                                {allUsers.length > 0 ? (
                                    <Select
                                        isMulti
                                        name="users"
                                        options={allUsers}
                                        className="basic-multi-select"
                                        classNamePrefix="select"
                                        placeholder="Rechercher et sélectionner des utilisateurs..."
                                        value={selectedUsers}
                                        onChange={setSelectedUsers}
                                        isLoading={loading && allUsers.length === 0}
                                    />
                                ) : (
                                    <p className="text-muted">Chargement des utilisateurs...</p>
                                )}
                            </Form.Group>
                        )}

                        <Button
                            variant="primary"
                            type="submit"
                            className="w-100 mt-4 d-flex align-items-center justify-content-center"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Spinner
                                        as="span"
                                        animation="border"
                                        size="sm"
                                        role="status"
                                        aria-hidden="true"
                                        className="me-2"
                                    />
                                    Envoi en cours...
                                </>
                            ) : (
                                <>
                                    <FaPaperPlane className="me-2" /> Envoyer la Notification
                                </>
                            )}
                        </Button>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default SendNotificationPage;
