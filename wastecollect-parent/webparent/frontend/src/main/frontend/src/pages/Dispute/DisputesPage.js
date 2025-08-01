import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Container, Row, Col, Button, Badge, Alert, Modal, Form, Spinner } from 'react-bootstrap';
import { FaArrowLeft, FaEdit, FaCheck, FaTimes, FaEye, FaDownload, FaComments } from 'react-icons/fa';
import AuthContext  from '../../contexts/AuthContext';
import disputeService from '../../services/disputeService';
import LoadingSpinner from '../../components/LoadingSpinner';

/**
 * Composant DisputeDetails - Affiche les détails complets d'un litige
 * 
 * Fonctionnalités:
 * - Affichage des informations complètes du litige
 * - Gestion du statut du litige (résolu, en cours, fermé)
 * - Ajout de commentaires et notes
 * - Téléchargement des pièces jointes
 * - Actions différenciées selon le rôle utilisateur
 * - Interface responsive pour web et mobile
 */
const DisputeDetails = () => {
    // Récupération de l'ID du litige depuis l'URL
    const { disputeId } = useParams();
    const navigate = useNavigate();
    
    // Contexte d'authentification pour récupérer les infos utilisateur
    const { user } = useContext(AuthContext);
    
    // États locaux pour la gestion des données
    const [dispute, setDispute] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    
    // États pour les modales et formulaires
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [showCommentModal, setShowCommentModal] = useState(false);
    const [newStatus, setNewStatus] = useState('');
    const [newComment, setNewComment] = useState('');
    const [statusChangeReason, setStatusChangeReason] = useState('');
    const [submitting, setSubmitting] = useState(false);

    /**
     * Effet pour charger les détails du litige au montage du composant
     */
    useEffect(() => {
        loadDisputeDetails();
    }, [disputeId]);

    /**
     * Fonction pour charger les détails du litige depuis l'API
     */
    const loadDisputeDetails = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Appel au service pour récupérer les détails du litige
            const response = await disputeService.getDisputeById(disputeId);
            setDispute(response.data);
        } catch (err) {
            console.error('Erreur lors du chargement du litige:', err);
            setError('Impossible de charger les détails du litige. Veuillez réessayer.');
        } finally {
            setLoading(false);
        }
    };

    /**
     * Fonction pour déterminer la couleur du badge selon le statut
     */
    const getStatusBadgeVariant = (status) => {
        switch (status?.toLowerCase()) {
            case 'nouveau':
            case 'new':
                return 'primary';
            case 'en_cours':
            case 'in_progress':
                return 'warning';
            case 'resolu':
            case 'resolved':
                return 'success';
            case 'ferme':
            case 'closed':
                return 'secondary';
            case 'rejete':
            case 'rejected':
                return 'danger';
            default:
                return 'secondary';
        }
    };

    /**
     * Fonction pour déterminer la couleur selon le niveau de priorité
     */
    const getPriorityBadgeVariant = (priority) => {
        switch (priority?.toLowerCase()) {
            case 'haute':
            case 'high':
                return 'danger';
            case 'moyenne':
            case 'medium':
                return 'warning';
            case 'basse':
            case 'low':
                return 'info';
            default:
                return 'secondary';
        }
    };

    /**
     * Fonction pour changer le statut du litige
     */
    const handleStatusChange = async () => {
        if (!newStatus || !statusChangeReason.trim()) {
            setError('Veuillez sélectionner un nouveau statut et fournir une raison.');
            return;
        }

        try {
            setSubmitting(true);
            setError(null);

            // Données à envoyer pour le changement de statut
            const updateData = {
                status: newStatus,
                statusChangeReason: statusChangeReason,
                updatedBy: user.id
            };

            // Appel au service pour mettre à jour le statut
            await disputeService.updateDisputeStatus(disputeId, updateData);
            
            setSuccess('Statut du litige mis à jour avec succès.');
            setShowStatusModal(false);
            setNewStatus('');
            setStatusChangeReason('');
            
            // Recharger les détails pour refléter les changements
            await loadDisputeDetails();
        } catch (err) {
            console.error('Erreur lors de la mise à jour du statut:', err);
            setError('Impossible de mettre à jour le statut. Veuillez réessayer.');
        } finally {
            setSubmitting(false);
        }
    };

    /**
     * Fonction pour ajouter un commentaire au litige
     */
    const handleAddComment = async () => {
        if (!newComment.trim()) {
            setError('Veuillez saisir un commentaire.');
            return;
        }

        try {
            setSubmitting(true);
            setError(null);

            // Données du commentaire
            const commentData = {
                content: newComment,
                authorId: user.id,
                authorName: user.name,
                disputeId: disputeId
            };

            // Appel au service pour ajouter le commentaire
            await disputeService.addDisputeComment(disputeId, commentData);
            
            setSuccess('Commentaire ajouté avec succès.');
            setShowCommentModal(false);
            setNewComment('');
            
            // Recharger les détails pour afficher le nouveau commentaire
            await loadDisputeDetails();
        } catch (err) {
            console.error('Erreur lors de l\'ajout du commentaire:', err);
            setError('Impossible d\'ajouter le commentaire. Veuillez réessayer.');
        } finally {
            setSubmitting(false);
        }
    };

    /**
     * Fonction pour télécharger une pièce jointe
     */
    const handleDownloadAttachment = async (attachmentId, filename) => {
        try {
            const response = await disputeService.downloadAttachment(attachmentId);
            
            // Créer un lien de téléchargement
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Erreur lors du téléchargement:', err);
            setError('Impossible de télécharger le fichier.');
        }
    };

    /**
     * Fonction pour vérifier si l'utilisateur peut modifier le litige
     */
    const canModifyDispute = () => {
        return user && (user.role === 'ADMIN' || user.id === dispute?.reporterId);
    };

    /**
     * Fonction pour vérifier si l'utilisateur peut changer le statut
     */
    const canChangeStatus = () => {
        return user && (user.role === 'ADMIN' || user.role === 'COLLECTOR');
    };

    // Affichage du spinner pendant le chargement
    if (loading) {
        return <LoadingSpinner message="Chargement des détails du litige..." />;
    }

    // Affichage d'erreur si le litige n'est pas trouvé
    if (!dispute) {
        return (
            <Container className="mt-4">
                <Alert variant="danger">
                    Litige introuvable. Veuillez vérifier l'ID du litige.
                </Alert>
                <Button variant="outline-primary" onClick={() => navigate(-1)}>
                    <FaArrowLeft className="me-2" />
                    Retour
                </Button>
            </Container>
        );
    }

    return (
        <Container fluid className="mt-4">
            {/* En-tête avec bouton de retour */}
            <Row className="mb-4">
                <Col>
                    <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                            <Button 
                                variant="outline-primary" 
                                size="sm" 
                                onClick={() => navigate(-1)}
                                className="me-3"
                            >
                                <FaArrowLeft className="me-1" />
                                Retour
                            </Button>
                            <h2 className="mb-0">Détails du Litige #{dispute.id}</h2>
                        </div>
                        
                        {/* Actions selon les permissions */}
                        <div className="d-flex gap-2">
                            {canChangeStatus() && (
                                <Button
                                    variant="warning"
                                    size="sm"
                                    onClick={() => setShowStatusModal(true)}
                                >
                                    <FaEdit className="me-1" />
                                    Changer Statut
                                </Button>
                            )}
                            <Button
                                variant="info"
                                size="sm"
                                onClick={() => setShowCommentModal(true)}
                            >
                                <FaComments className="me-1" />
                                Ajouter Commentaire
                            </Button>
                        </div>
                    </div>
                </Col>
            </Row>

            {/* Affichage des messages d'alerte */}
            {error && (
                <Alert variant="danger" dismissible onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}
            {success && (
                <Alert variant="success" dismissible onClose={() => setSuccess(null)}>
                    {success}
                </Alert>
            )}

            <Row>
                {/* Colonne principale avec les détails */}
                <Col lg={8}>
                    {/* Informations générales du litige */}
                    <Card className="mb-4">
                        <Card.Header className="bg-primary text-white">
                            <h5 className="mb-0">Informations Générales</h5>
                        </Card.Header>
                        <Card.Body>
                            <Row>
                                <Col md={6}>
                                    <p><strong>Titre:</strong> {dispute.title}</p>
                                    <p><strong>Type:</strong> {dispute.type}</p>
                                    <p><strong>Priorité:</strong>
                                        <Badge 
                                            bg={getPriorityBadgeVariant(dispute.priority)} 
                                            className="ms-2"
                                        >
                                            {dispute.priority}
                                        </Badge>
                                    </p>
                                    <p><strong>Statut:</strong>
                                        <Badge 
                                            bg={getStatusBadgeVariant(dispute.status)} 
                                            className="ms-2"
                                        >
                                            {dispute.status}
                                        </Badge>
                                    </p>
                                </Col>
                                <Col md={6}>
                                    <p><strong>Date de création:</strong> {new Date(dispute.createdAt).toLocaleString('fr-FR')}</p>
                                    <p><strong>Dernière mise à jour:</strong> {new Date(dispute.updatedAt).toLocaleString('fr-FR')}</p>
                                    <p><strong>Signalé par:</strong> {dispute.reporterName}</p>
                                    {dispute.assignedToName && (
                                        <p><strong>Assigné à:</strong> {dispute.assignedToName}</p>
                                    )}
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>

                    {/* Description détaillée */}
                    <Card className="mb-4">
                        <Card.Header>
                            <h5 className="mb-0">Description</h5>
                        </Card.Header>
                        <Card.Body>
                            <p style={{whiteSpace: 'pre-wrap'}}>{dispute.description}</p>
                        </Card.Body>
                    </Card>

                    {/* Informations sur la demande de service liée */}
                    {dispute.serviceRequest && (
                        <Card className="mb-4">
                            <Card.Header>
                                <h5 className="mb-0">Demande de Service Associée</h5>
                            </Card.Header>
                            <Card.Body>
                                <Row>
                                    <Col md={6}>
                                        <p><strong>ID de la demande:</strong> #{dispute.serviceRequest.id}</p>
                                        <p><strong>Type de service:</strong> {dispute.serviceRequest.serviceType}</p>
                                        <p><strong>Date programmée:</strong> {new Date(dispute.serviceRequest.scheduledDate).toLocaleDateString('fr-FR')}</p>
                                    </Col>
                                    <Col md={6}>
                                        <p><strong>Collecteur:</strong> {dispute.serviceRequest.collectorName}</p>
                                        <p><strong>Adresse:</strong> {dispute.serviceRequest.address}</p>
                                        <p><strong>Statut:</strong>
                                            <Badge bg="info" className="ms-2">
                                                {dispute.serviceRequest.status}
                                            </Badge>
                                        </p>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    )}

                    {/* Historique des commentaires */}
                    <Card className="mb-4">
                        <Card.Header>
                            <h5 className="mb-0">Historique et Commentaires</h5>
                        </Card.Header>
                        <Card.Body>
                            {dispute.comments && dispute.comments.length > 0 ? (
                                <div>
                                    {dispute.comments.map((comment, index) => (
                                        <div key={index} className="border-bottom pb-3 mb-3">
                                            <div className="d-flex justify-content-between align-items-start">
                                                <div>
                                                    <strong>{comment.authorName}</strong>
                                                    <small className="text-muted ms-2">
                                                        {new Date(comment.createdAt).toLocaleString('fr-FR')}
                                                    </small>
                                                </div>
                                                {comment.isStatusChange && (
                                                    <Badge bg="info">Changement de statut</Badge>
                                                )}
                                            </div>
                                            <p className="mt-2 mb-0" style={{whiteSpace: 'pre-wrap'}}>
                                                {comment.content}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted">Aucun commentaire pour le moment.</p>
                            )}
                        </Card.Body>
                    </Card>
                </Col>

                {/* Colonne latérale avec informations supplémentaires */}
                <Col lg={4}>
                    {/* Actions rapides */}
                    <Card className="mb-4">
                        <Card.Header>
                            <h6 className="mb-0">Actions Rapides</h6>
                        </Card.Header>
                        <Card.Body>
                            <div className="d-grid gap-2">
                                {canChangeStatus() && dispute.status !== 'RESOLU' && (
                                    <Button
                                        variant="success"
                                        size="sm"
                                        onClick={() => {
                                            setNewStatus('RESOLU');
                                            setShowStatusModal(true);
                                        }}
                                    >
                                        <FaCheck className="me-1" />
                                        Marquer comme Résolu
                                    </Button>
                                )}
                                {canChangeStatus() && dispute.status !== 'FERME' && (
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => {
                                            setNewStatus('FERME');
                                            setShowStatusModal(true);
                                        }}
                                    >
                                        <FaTimes className="me-1" />
                                        Fermer le Litige
                                    </Button>
                                )}
                                <Button
                                    variant="outline-info"
                                    size="sm"
                                    onClick={() => setShowCommentModal(true)}
                                >
                                    <FaComments className="me-1" />
                                    Ajouter Commentaire
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>

                    {/* Pièces jointes */}
                    {dispute.attachments && dispute.attachments.length > 0 && (
                        <Card className="mb-4">
                            <Card.Header>
                                <h6 className="mb-0">Pièces Jointes</h6>
                            </Card.Header>
                            <Card.Body>
                                {dispute.attachments.map((attachment, index) => (
                                    <div key={index} className="d-flex justify-content-between align-items-center mb-2">
                                        <div>
                                            <small className="text-muted">{attachment.filename}</small>
                                            <br />
                                            <small className="text-muted">{attachment.size}</small>
                                        </div>
                                        <Button
                                            variant="outline-primary"
                                            size="sm"
                                            onClick={() => handleDownloadAttachment(attachment.id, attachment.filename)}
                                        >
                                            <FaDownload />
                                        </Button>
                                    </div>
                                ))}
                            </Card.Body>
                        </Card>
                    )}

                    {/* Informations métadonnées */}
                    <Card>
                        <Card.Header>
                            <h6 className="mb-0">Métadonnées</h6>
                        </Card.Header>
                        <Card.Body>
                            <small className="text-muted">
                                <p><strong>ID:</strong> {dispute.id}</p>
                                <p><strong>Créé le:</strong> {new Date(dispute.createdAt).toLocaleString('fr-FR')}</p>
                                <p><strong>Modifié le:</strong> {new Date(dispute.updatedAt).toLocaleString('fr-FR')}</p>
                                {dispute.resolvedAt && (
                                    <p><strong>Résolu le:</strong> {new Date(dispute.resolvedAt).toLocaleString('fr-FR')}</p>
                                )}
                            </small>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Modal pour changer le statut */}
            <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Changer le Statut du Litige</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Nouveau Statut</Form.Label>
                            <Form.Select
                                value={newStatus}
                                onChange={(e) => setNewStatus(e.target.value)}
                            >
                                <option value="">Sélectionner un statut</option>
                                <option value="NOUVEAU">Nouveau</option>
                                <option value="EN_COURS">En Cours</option>
                                <option value="RESOLU">Résolu</option>
                                <option value="FERME">Fermé</option>
                                <option value="REJETE">Rejeté</option>
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Raison du Changement</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={statusChangeReason}
                                onChange={(e) => setStatusChangeReason(e.target.value)}
                                placeholder="Expliquez la raison de ce changement de statut..."
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowStatusModal(false)}>
                        Annuler
                    </Button>
                    <Button 
                        variant="primary" 
                        onClick={handleStatusChange}
                        disabled={submitting}
                    >
                        {submitting ? (
                            <>
                                <Spinner size="sm" className="me-2" />
                                Mise à jour...
                            </>
                        ) : (
                            'Confirmer'
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Modal pour ajouter un commentaire */}
            <Modal show={showCommentModal} onHide={() => setShowCommentModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Ajouter un Commentaire</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group>
                            <Form.Label>Commentaire</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={4}
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Saisissez votre commentaire..."
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowCommentModal(false)}>
                        Annuler
                    </Button>
                    <Button 
                        variant="primary" 
                        onClick={handleAddComment}
                        disabled={submitting}
                    >
                        {submitting ? (
                            <>
                                <Spinner size="sm" className="me-2" />
                                Ajout...
                            </>
                        ) : (
                            'Ajouter'
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default DisputeDetails;