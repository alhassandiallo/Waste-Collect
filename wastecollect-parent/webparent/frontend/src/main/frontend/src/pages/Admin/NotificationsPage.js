import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Spinner, Badge, Pagination, Modal } from 'react-bootstrap';
import { FaBell, FaFilter, FaCheckCircle, FaTrash, FaEye, FaSyncAlt, FaExclamationTriangle, FaEnvelopeOpen, FaEnvelope } from 'react-icons/fa';
import AuthContext from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import notificationService from '../../services/notificationService';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

/**
 * Composant NotificationsPage - Gère l'affichage et l'interaction avec les notifications pour les administrateurs.
 *
 * Fonctionnalités:
 * - Affichage d'une liste de notifications avec pagination.
 * - Filtrage par statut (lues/non lues), type.
 * - Marquage des notifications comme lues ou non lues.
 * - Suppression des notifications.
 * - Affichage de messages d'erreur et de chargement.
 */
const NotificationsPage = () => {
    // Contexte d'authentification pour obtenir les informations de l'utilisateur
    const { user, isLoading: authLoading } = useContext(AuthContext);

    // États pour les données des notifications
    const [notificationsData, setNotificationsData] = useState({ content: [], totalPages: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [notificationToDelete, setNotificationToDelete] = useState(null);

    // États pour les filtres
    const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'read', 'unread'
    const [filterType, setFilterType] = useState('all'); // 'all', 'SYSTEM_ALERT', 'SERVICE_REQUEST', etc.

    // États pour la pagination
    const [currentPage, setCurrentPage] = useState(0); // Spring Data JPA page index starts from 0
    const [itemsPerPage] = useState(10); // Corresponds to backend 'size'

    // Types de notifications pour le filtre (DOIT CORRESPONDRE À NotificationType.java)
    const notificationTypes = [
        'ALERT',
        'REMINDER',
        'INFO',
        'SYSTEM_MESSAGE',
        'PAYMENT_CONFIRMATION',
        'DISPUTE_RESOLUTION',
        'SERVICE_REQUEST_UPDATE',
        'NEW_SERVICE_REQUEST',
        'COLLECTION_REMINDER'
    ];

    /**
     * Load notifications from the backend API.
     * This function is memoized using useCallback to prevent unnecessary re-renders.
     */
    const loadNotifications = useCallback(async () => {
        setLoading(true);
        setError(null); // Clear previous errors

        if (!user || !user.id) {
            setError("Informations utilisateur non disponibles pour charger les notifications.");
            setLoading(false);
            return;
        }

        try {
            const filters = {
                page: currentPage,
                size: itemsPerPage,
                sort: 'createdAt,desc', // Sort by creation date descending
            };

            // Conditionally add status and type filters
            if (filterStatus !== 'all') {
                filters.isRead = filterStatus === 'read';
            }
            if (filterType !== 'all') {
                filters.notificationType = filterType;
            }

            console.log("Fetching notifications with filters:", filters);

            const response = await notificationService.getNotificationsForUser(user.id, filters);
            setNotificationsData({
                content: response.content || [],
                totalPages: response.totalPages || 0
            });
            console.log("Notifications loaded:", response.content);

        } catch (err) {
            console.error("Erreur lors du chargement des notifications:", err);
            setError(err.message || "Impossible de charger les notifications.");
            setNotificationsData({ content: [], totalPages: 0 }); // Ensure content is empty on error
            toast.error(err.message || "Erreur lors du chargement des notifications.");
        } finally {
            setLoading(false);
        }
    }, [user, currentPage, itemsPerPage, filterStatus, filterType]);

    /**
     * Effectue le chargement initial des notifications.
     */
    useEffect(() => {
        if (!authLoading && user) {
            loadNotifications();
        } else if (!authLoading && !user) {
            setError("Authentification requise pour voir les notifications.");
            setLoading(false);
        }
    }, [user, authLoading, loadNotifications]);
    
    /**
     * Gère le changement de page de la pagination.
     */
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    /**
     * Marque une notification comme lue ou non lue.
     * @param {number} id L'ID de la notification.
     * @param {boolean} currentIsReadStatus Le statut de lecture actuel de la notification.
     */
    const handleMarkAsRead = async (id, currentIsReadStatus) => {
        setError(null);
        try {
            if (currentIsReadStatus) { // If currently read, mark as unread
                await notificationService.markNotificationAsUnread(id);
                setNotificationsData(prev => ({
                    ...prev,
                    content: prev.content.map(notif => (notif.id === id ? { ...notif, isRead: false, readAt: null } : notif))
                }));
                toast.success(`Notification marquée comme non lue.`);
            } else { // If currently unread, mark as read
                await notificationService.markNotificationAsRead(id);
                setNotificationsData(prev => ({
                    ...prev,
                    content: prev.content.map(notif => (notif.id === id ? { ...notif, isRead: true, readAt: new Date().toISOString() } : notif))
                }));
                toast.success(`Notification marquée comme lue.`);
            }
        } catch (err) {
            console.error("Erreur lors de la mise à jour de la notification:", err);
            setError(err.message || "Impossible de mettre à jour la notification.");
            toast.error(err.message || "Erreur lors de la mise à jour de la notification.");
        }
    };

    /**
     * Ouvre la modale de confirmation de suppression.
     * @param {Object} notification La notification à supprimer.
     */
    const confirmDeleteNotification = (notification) => {
        setNotificationToDelete(notification);
        setShowDeleteConfirm(true);
    };

    /**
     * Gère la suppression d'une notification après confirmation.
     */
    const handleDeleteNotification = async () => {
        setError(null);
        if (!notificationToDelete) return;

        try {
            await notificationService.deleteNotification(notificationToDelete.id);
            // After deletion, reload the current page to get fresh data
            loadNotifications();
            toast.success("Notification supprimée.");
            setShowDeleteConfirm(false);
            setNotificationToDelete(null);
        } catch (err) {
            console.error("Erreur lors de la suppression de la notification:", err);
            setError(err.message || "Impossible de supprimer la notification.");
            toast.error(err.message || "Erreur lors de la suppression de la notification.");
        }
    };

    /**
     * Formate la date d'une notification.
     * @param {string} dateString La chaîne de caractères de la date.
     * @returns {string} La date formatée.
     */
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleString('fr-FR', {
                year: 'numeric', month: 'short', day: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });
        } catch (e) {
            console.error("Error formatting date:", dateString, e);
            return 'Date invalide';
        }
    };

    /**
     * Obtient le libellé de type de notification en français.
     * @param {string} type Le type de notification.
     * @returns {string} Le libellé traduit.
     */
    const getTypeLabel = (type) => {
        switch (type) {
            case 'ALERT': return 'Alerte Générale';
            case 'REMINDER': return 'Rappel';
            case 'INFO': return 'Information';
            case 'SYSTEM_MESSAGE': return 'Message Système';
            case 'PAYMENT_CONFIRMATION': return 'Confirmation Paiement';
            case 'DISPUTE_RESOLUTION': return 'Résolution Litige';
            case 'SERVICE_REQUEST_UPDATE': return 'Mise à jour Demande';
            case 'NEW_SERVICE_REQUEST': return 'Nouvelle Demande';
            case 'COLLECTION_REMINDER': return 'Rappel Collecte';
            default: return type;
        }
    };

    // Affiche un spinner de chargement si les données d'authentification sont en cours de chargement
    if (authLoading) {
        return <LoadingSpinner message="Chargement des informations utilisateur..." />;
    }

    return (
        <Container fluid className="py-4">
            <ToastContainer position="top-center" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
            <Row className="mb-4">
                <Col md={8}>
                    <h2 className="h3 mb-2">
                        <FaBell className="me-2 text-info" />
                        Gestion des Notifications
                    </h2>
                    <p className="text-muted">
                        Visualisez et gérez toutes les notifications système et utilisateur.
                    </p>
                </Col>
                <Col md={4} className="text-end">
                    <Button variant="outline-primary" onClick={loadNotifications} disabled={loading}>
                        <FaSyncAlt className={loading ? 'fa-spin' : ''} />
                        {loading ? ' Actualisation...' : ' Actualiser'}
                    </Button>
                </Col>
            </Row>

            {error && (
                <Alert variant="danger" dismissible onClose={() => setError(null)}>
                    <FaExclamationTriangle className="me-2" />
                    {error}
                </Alert>
            )}

            <Card className="mb-4 shadow-sm">
                <Card.Body>
                    <Row className="g-3">
                        <Col md={6} lg={4}>
                            <Form.Group>
                                <Form.Label>Filtrer par statut</Form.Label>
                                <Form.Select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(0); }}>
                                    <option value="all">Tous</option>
                                    <option value="read">Lues</option>
                                    <option value="unread">Non Lues</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={6} lg={4}>
                            <Form.Group>
                                <Form.Label>Filtrer par type</Form.Label>
                                <Form.Select value={filterType} onChange={(e) => { setFilterType(e.target.value); setCurrentPage(0);}}>
                                    <option value="all">Tous les types</option>
                                    {notificationTypes.map(type => (
                                        <option key={type} value={type}>{getTypeLabel(type)}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            <Card className="shadow-sm">
                <Card.Body>
                    <div className="table-responsive">
                        <table className="table table-hover align-middle">
                            <thead className="table-light">
                                <tr>
                                    <th>Statut</th>
                                    <th>Type</th>
                                    <th>Message</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="text-center py-4">
                                            <LoadingSpinner message="Chargement des notifications..." />
                                        </td>
                                    </tr>
                                ) : notificationsData.content.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="text-center py-4">
                                            <FaBell size={50} className="text-muted mb-3" />
                                            <h5 className="text-muted">Aucune notification trouvée</h5>
                                            <p className="text-muted">
                                                Il n'y a pas de notifications correspondant à vos filtres.
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    notificationsData.content.map((notif) => (
                                        <tr key={notif.id}>
                                            <td>
                                                <Badge bg={notif.isRead ? 'success' : 'primary'}>
                                                    {notif.isRead ? <FaCheckCircle className="me-1" /> : <FaEnvelope className="me-1" />}
                                                    {notif.isRead ? 'Lue' : 'Non lue'}
                                                </Badge>
                                            </td>
                                            <td>
                                                <span className="badge bg-light text-dark">
                                                    {getTypeLabel(notif.notificationType)}
                                                </span>
                                            </td>
                                            <td>{notif.message}</td>
                                            <td><small>{formatDate(notif.createdAt)}</small></td>
                                            <td>
                                                <Button
                                                    variant={notif.isRead ? 'outline-warning' : 'outline-success'}
                                                    size="sm"
                                                    className="me-2"
                                                    onClick={() => handleMarkAsRead(notif.id, notif.isRead)}
                                                    title={notif.isRead ? 'Marquer comme non lue' : 'Marquer comme lue'}
                                                >
                                                    {notif.isRead ? <FaEnvelopeOpen /> : <FaCheckCircle />}
                                                </Button>
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    onClick={() => confirmDeleteNotification(notif)}
                                                    title="Supprimer"
                                                >
                                                    <FaTrash />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                   {/* Pagination is still conditionally rendered based on totalPages > 1 */}
                   {notificationsData.totalPages > 1 && (
                        <nav className="mt-4">
                            <Pagination className="justify-content-center">
                                <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 0} />
                                {[...Array(notificationsData.totalPages).keys()].map(page => (
                                    <Pagination.Item key={page} active={page === currentPage} onClick={() => handlePageChange(page)}>
                                        {page + 1}
                                    </Pagination.Item>
                                ))}
                                <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === notificationsData.totalPages - 1} />
                            </Pagination>
                        </nav>
                    )}
                </Card.Body>
            </Card>

            {/* Confirmation Modal for Delete */}
            <Modal show={showDeleteConfirm} onHide={() => setShowDeleteConfirm(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirmer la suppression</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Êtes-vous sûr de vouloir supprimer la notification "{notificationToDelete?.message}" ?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
                        Annuler
                    </Button>
                    <Button variant="danger" onClick={handleDeleteNotification}>
                        Supprimer
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default NotificationsPage;
