import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Form, Alert, Spinner } from 'react-bootstrap';
import {
    FaList, FaPlus, FaSearch, FaFilter, FaSyncAlt,
    FaClock, FaSpinner, FaCheckCircle, FaExclamationTriangle,
    FaEye, FaListAlt, FaInbox, FaChevronLeft, FaChevronRight
} from 'react-icons/fa';
import AuthContext from '../../contexts/AuthContext';
import disputeService from '../../services/disputeService';
import LoadingSpinner from '../../components/LoadingSpinner';

/**
 * Composant DisputeList - Affichage de la liste des litiges
 *
 * Ce composant permet de:
 * - Afficher tous les litiges selon le rôle de l'utilisateur
 * - Filtrer les litiges par statut, type, date
 * - Naviguer vers les détails d'un litige
 * - Créer un nouveau litige (pour les ménages et collecteurs)
 * - Gérer la pagination des résultats
 *
 * Rôles supportés:
 * - ADMIN: Voir tous les litiges
 * - COLLECTOR: Voir ses litiges en tant que collecteur
 * - HOUSEHOLD: Voir ses litiges en tant que ménage
 * - MUNICIPALITY: Voir les litiges de sa zone
 */
const DisputeList = () => {
    // États locaux pour la gestion des données
    const [disputes, setDisputes] = useState([]);
    const [filteredDisputes, setFilteredDisputes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // États pour les filtres
    const [statusFilter, setStatusFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // États pour la pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    // Contexte d'authentification et navigation
    const { user, isLoading: authLoading } = useContext(AuthContext); // Get authLoading state
    const navigate = useNavigate();

    // Types de litiges disponibles
    const disputeTypes = [
        'SERVICE_QUALITY',
        'PAYMENT_ISSUE',
        'SCHEDULING_CONFLICT',
        'DAMAGE_CLAIM',
        'HARASSMENT',
        'OTHER'
    ];

    // Statuts des litiges
    const disputeStatuses = [
        'PENDING',
        'IN_PROGRESS',
        'RESOLVED',
        'REJECTED',
        'ESCALATED'
    ];

    /**
     * Chargement initial des litiges au montage du composant
     * ou lorsque l'utilisateur est chargé.
     */
    useEffect(() => {
        // Only attempt to load disputes if authentication is not loading and user data is available
        if (!authLoading && user) {
            loadDisputes();
        } else if (!authLoading && !user) {
            // If auth is done loading but no user, it means user is not authenticated.
            // In a PrivateRoute, this should redirect to login, but handling for safety.
            setLoading(false);
            setError("Authentification requise pour voir les litiges.");
        }
    }, [user, authLoading]); // Depend on user and authLoading

    /**
     * Application des filtres quand les données ou filtres changent
     */
    useEffect(() => {
        applyFilters();
    }, [disputes, statusFilter, typeFilter, dateFilter, searchTerm]);

    /**
     * Fonction pour charger les litiges selon le rôle de l'utilisateur
     */
    const loadDisputes = async () => {
        setLoading(true);
        setError(null); // Clear previous errors

        try {
            let disputesData = [];

            // Ensure user object and its properties are available
            if (!user || !user.role) {
                console.warn("User or user role not available, cannot load disputes.");
                setError("Informations utilisateur non disponibles. Veuillez vous reconnecter.");
                setLoading(false);
                return;
            }

            console.log(`Loading disputes for role: ${user.role}, user ID: ${user.id}, municipality ID: ${user.municipalityId}`);

            switch (user.role) {
                case 'ADMIN':
                    const allDisputesResponse = await disputeService.getAllDisputes(); // Assuming this returns { data: [...] } or direct array
                    disputesData = allDisputesResponse?.data || allDisputesResponse || [];
                    break;
                case 'COLLECTOR':
                    // Check if collector ID is available
                    if (!user.id) {
                        throw new Error('ID du collecteur non disponible.');
                    }
                    const collectorDisputesResponse = await disputeService.getDisputesByCollector(user.id); // Assuming this returns { data: [...] } or direct array
                    disputesData = collectorDisputesResponse?.data || collectorDisputesResponse || [];
                    break;
                case 'HOUSEHOLD':
                    // Check if household ID is available
                    if (!user.id) {
                        throw new Error('ID du ménage non disponible.');
                    }
                    const householdDisputesResponse = await disputeService.getDisputesByHousehold(user.id); // Assuming this returns { data: [...] } or direct array
                    disputesData = householdDisputesResponse?.data || householdDisputesResponse || [];
                    break;
                case 'MUNICIPALITY':
                case 'MUNICIPAL_MANAGER':
                    // Check if municipality ID is available for municipal roles
                    if (!user.municipalityId) {
                        throw new Error('ID de la municipalité non disponible pour ce rôle.');
                    }
                    const municipalityDisputesResponse = await disputeService.getDisputesByMunicipality(user.municipalityId); // Assuming this returns { data: [...] } or direct array
                    disputesData = municipalityDisputesResponse?.data || municipalityDisputesResponse || [];
                    break;
                default:
                    throw new Error('Rôle utilisateur non reconnu ou non autorisé pour cette page.');
            }

            setDisputes(disputesData);
            console.log("Litiges chargés avec succès:", disputesData);

        } catch (err) {
            console.error('Erreur lors du chargement des litiges:', err);
            setError(err.message || 'Erreur lors du chargement des litiges. Veuillez réessayer.');
            setDisputes([]); // Clear disputes on error
        } finally {
            setLoading(false);
        }
    };

    /**
     * Application des filtres sur la liste des litiges
     */
    const applyFilters = () => {
        let filtered = [...disputes];

        // Filtre par statut
        if (statusFilter) {
            filtered = filtered.filter(dispute => dispute.status === statusFilter);
        }

        // Filtre par type
        if (typeFilter) {
            filtered = filtered.filter(dispute => dispute.type === typeFilter);
        }

        // Filtre par date (derniers 30 jours, 7 jours, etc.)
        if (dateFilter) {
            const now = new Date();
            let filterDate = null;

            switch (dateFilter) {
                case '7':
                    filterDate = new Date(now.setDate(now.getDate() - 7));
                    break;
                case '30':
                    filterDate = new Date(now.setDate(now.getDate() - 30));
                    break;
                case '90':
                    filterDate = new Date(now.setDate(now.getDate() - 90));
                    break;
                default:
                    filterDate = null;
            }

            if (filterDate) {
                filtered = filtered.filter(dispute =>
                    new Date(dispute.createdAt) >= filterDate
                );
            }
        }

        // Recherche textuelle
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(dispute =>
                dispute.title?.toLowerCase().includes(term) ||
                dispute.description?.toLowerCase().includes(term) ||
                (dispute.id && dispute.id.toString().includes(term))
            );
        }

        setFilteredDisputes(filtered);
        setCurrentPage(1); // Reset à la première page après filtrage
    };

    /**
     * Navigation vers les détails d'un litige
     */
    const handleViewDetails = (disputeId) => {
        navigate(`/disputes/${disputeId}`);
    };

    /**
     * Navigation vers le formulaire de création de litige (placeholder for now)
     */
    const handleCreateDispute = () => {
        navigate('/disputes/create');
    };

    /**
     * Obtenir la classe CSS pour le badge de statut
     */
    const getStatusBadgeClass = (status) => {
        const statusClasses = {
            'PENDING': 'bg-warning text-dark',
            'IN_PROGRESS': 'bg-info text-white',
            'RESOLVED': 'bg-success text-white',
            'REJECTED': 'bg-danger text-white',
            'ESCALATED': 'bg-secondary text-white'
        };
        return `badge ${statusClasses[status] || 'bg-secondary text-white'}`;
    };

    /**
     * Obtenir le libellé du statut en français
     */
    const getStatusLabel = (status) => {
        const statusLabels = {
            'PENDING': 'En attente',
            'IN_PROGRESS': 'En cours',
            'RESOLVED': 'Résolu',
            'REJECTED': 'Rejeté',
            'ESCALATED': 'Escaladé'
        };
        return statusLabels[status] || status;
    };

    /**
     * Obtenir le libellé du type en français
     */
    const getTypeLabel = (type) => {
        const typeLabels = {
            'SERVICE_QUALITY': 'Qualité de service',
            'PAYMENT_ISSUE': 'Problème de paiement',
            'SCHEDULING_CONFLICT': 'Conflit d\'horaire',
            'DAMAGE_CLAIM': 'Réclamation de dommage',
            'HARASSMENT': 'Harcèlement',
            'OTHER': 'Autre'
        };
        return typeLabels[type] || type;
    };

    /**
     * Formatage de la date
     */
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            console.error("Error formatting date:", dateString, e);
            return 'Date invalide';
        }
    };

    /**
     * Calcul des éléments pour la pagination
     */
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredDisputes.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredDisputes.length / itemsPerPage);

    /**
     * Changement de page
     */
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // Affichage du spinner de chargement global (incluant le chargement d'auth)
    if (loading || authLoading) {
        return <LoadingSpinner message="Chargement des litiges..." />;
    }

    return (
        // Changed to Container for better centering and width control
        <Container className="py-4">
            {/* The content will be wrapped in a Row and Col for centering */}
            <Row className="justify-content-center">
                <Col lg={10}> {/* Adjust Col size as needed, e.g., lg={10} or md={11} */}
                    {/* En-tête de la page */}
                    <Row className="mb-4">
                        <Col md={8}>
                            <h2 className="h3 mb-2">
                                <FaExclamationTriangle className="me-2 text-warning" />
                                Gestion des Litiges
                            </h2>
                            <p className="text-muted">
                                Gérez et suivez les litiges de la plateforme
                            </p>
                        </Col>
                        <Col md={4} className="text-end">
                            {/* Bouton de création pour les ménages et collecteurs */}
                            {(user?.role === 'HOUSEHOLD' || user?.role === 'COLLECTOR') && (
                                <Button
                                    variant="primary"
                                    onClick={handleCreateDispute}
                                >
                                    <FaPlus className="me-2" />
                                    Nouveau Litige
                                </Button>
                            )}
                        </Col>
                    </Row>

                    {/* Message d'erreur */}
                    {error && (
                        <Alert variant="danger" dismissible onClose={() => setError(null)}>
                            <i className="fas fa-exclamation-circle me-2"></i>
                            {error}
                        </Alert>
                    )}

                    {/* Filtres et recherche */}
                    <Card className="mb-4 shadow-sm">
                        <Card.Body>
                            <Row className="g-3">
                                {/* Barre de recherche */}
                                <Col md={4}>
                                    <Form.Group>
                                        <Form.Label>Rechercher</Form.Label>
                                        <div className="input-group">
                                            <span className="input-group-text">
                                                <FaSearch />
                                            </span>
                                            <Form.Control
                                                type="text"
                                                placeholder="Titre, description, ID..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                        </div>
                                    </Form.Group>
                                </Col>

                                {/* Filtre par statut */}
                                <Col md={2}>
                                    <Form.Group>
                                        <Form.Label>Statut</Form.Label>
                                        <Form.Select
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                        >
                                            <option value="">Tous</option>
                                            {disputeStatuses.map(status => (
                                                <option key={status} value={status}>
                                                    {getStatusLabel(status)}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>

                                {/* Filtre par type */}
                                <Col md={3}>
                                    <Form.Group>
                                        <Form.Label>Type</Form.Label>
                                        <Form.Select
                                            value={typeFilter}
                                            onChange={(e) => setTypeFilter(e.target.value)}
                                        >
                                            <option value="">Tous</option>
                                            {disputeTypes.map(type => (
                                                <option key={type} value={type}>
                                                    {getTypeLabel(type)}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>

                                {/* Filtre par date */}
                                <Col md={2}>
                                    <Form.Group>
                                        <Form.Label>Période</Form.Label>
                                        <Form.Select
                                            value={dateFilter}
                                            onChange={(e) => setDateFilter(e.target.value)}
                                        >
                                            <option value="">Toutes</option>
                                            <option value="7">7 derniers jours</option>
                                            <option value="30">30 derniers jours</option>
                                            <option value="90">90 derniers jours</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>

                                {/* Bouton de réinitialisation */}
                                <Col md={1} className="d-flex align-items-end">
                                    <Button
                                        variant="outline-secondary"
                                        className="w-100"
                                        onClick={() => {
                                            setStatusFilter('');
                                            setTypeFilter('');
                                            setDateFilter('');
                                            setSearchTerm('');
                                        }}
                                    >
                                        <FaSyncAlt />
                                    </Button>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>

                    {/* Statistiques rapides */}
                    <Row className="mb-4">
                        <Col md={3} className="mb-3">
                            <Card bg="primary" text="white" className="shadow-sm">
                                <Card.Body>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <h6 className="card-title">Total Litiges</h6>
                                            <h4 className="mb-0">{disputes.length}</h4>
                                        </div>
                                        <FaListAlt size={32} className="opacity-75" />
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={3} className="mb-3">
                            <Card bg="warning" text="dark" className="shadow-sm">
                                <Card.Body>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <h6 className="card-title">En attente</h6>
                                            <h4 className="mb-0">
                                                {disputes.filter(d => d.status === 'PENDING').length}
                                            </h4>
                                        </div>
                                        <FaClock size={32} className="opacity-75" />
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={3} className="mb-3">
                            <Card bg="info" text="white" className="shadow-sm">
                                <Card.Body>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <h6 className="card-title">En cours</h6>
                                            <h4 className="mb-0">
                                                {disputes.filter(d => d.status === 'IN_PROGRESS').length}
                                            </h4>
                                        </div>
                                        <FaSpinner size={32} className="opacity-75" />
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={3} className="mb-3">
                            <Card bg="success" text="white" className="shadow-sm">
                                <Card.Body>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <h6 className="card-title">Résolus</h6>
                                            <h4 className="mb-0">
                                                {disputes.filter(d => d.status === 'RESOLVED').length}
                                            </h4>
                                        </div>
                                        <FaCheckCircle size={32} className="opacity-75" />
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    {/* Liste des litiges */}
                    <Card className="shadow-sm">
                        <Card.Body>
                            {currentItems.length === 0 ? (
                                <div className="text-center py-5">
                                    <FaInbox size={50} className="text-muted mb-3" />
                                    <h5 className="text-muted">Aucun litige trouvé</h5>
                                    <p className="text-muted">
                                        {disputes.length === 0
                                            ? "Il n'y a pas encore de litiges enregistrés."
                                            : "Aucun litige ne correspond aux critères de recherche."
                                        }
                                    </p>
                                    {(user?.role === 'HOUSEHOLD' || user?.role === 'COLLECTOR') && (
                                        <Button variant="link" onClick={handleCreateDispute}>
                                            Cliquez ici pour créer un nouveau litige.
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                <>
                                    {/* Tableau responsive pour desktop */}
                                    <div className="table-responsive d-none d-md-block">
                                        <table className="table table-hover align-middle">
                                            <thead className="table-light">
                                                <tr>
                                                    <th>ID</th>
                                                    <th>Titre</th>
                                                    <th>Type</th>
                                                    <th>Statut</th>
                                                    <th>Créé le</th>
                                                    <th>Priorité</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {currentItems.map((dispute) => (
                                                    <tr key={dispute.id}>
                                                        <td>
                                                            <small className="text-muted">
                                                                #{dispute.id}
                                                            </small>
                                                        </td>
                                                        <td>
                                                            <div>
                                                                <strong>{dispute.title}</strong>
                                                                <br />
                                                                <small className="text-muted">
                                                                    {dispute.description?.substring(0, 50)}
                                                                    {dispute.description?.length > 50 && '...'}
                                                                </small>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <span className="badge bg-light text-dark">
                                                                {getTypeLabel(dispute.type)}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <span className={getStatusBadgeClass(dispute.status)}>
                                                                {getStatusLabel(dispute.status)}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <small>{formatDate(dispute.createdAt)}</small>
                                                        </td>
                                                        <td>
                                                            <span className={`badge ${
                                                                dispute.priority === 'HIGH' ? 'bg-danger' :
                                                                dispute.priority === 'MEDIUM' ? 'bg-warning text-dark' :
                                                                'bg-secondary'
                                                            }`}>
                                                                {dispute.priority === 'HIGH' ? 'Élevée' :
                                                                 dispute.priority === 'MEDIUM' ? 'Moyenne' : 'Faible'}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <Button
                                                                variant="outline-primary"
                                                                size="sm"
                                                                onClick={() => handleViewDetails(dispute.id)}
                                                            >
                                                                <FaEye className="me-1" />
                                                                Voir
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Cards pour mobile */}
                                    <div className="d-md-none">
                                        {currentItems.map((dispute) => (
                                            <Card key={dispute.id} className="mb-3 shadow-sm">
                                                <Card.Body>
                                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                                        <h6 className="card-title mb-0">#{dispute.id} - {dispute.title}</h6>
                                                        <span className={getStatusBadgeClass(dispute.status)}>
                                                            {getStatusLabel(dispute.status)}
                                                        </span>
                                                    </div>
                                                    <p className="card-text text-muted small mb-2">
                                                        {dispute.description?.substring(0, 100)}
                                                        {dispute.description?.length > 100 && '...'}
                                                    </p>
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <div>
                                                            <span className="badge bg-light text-dark me-2">
                                                                {getTypeLabel(dispute.type)}
                                                            </span>
                                                            <small className="text-muted">
                                                                {formatDate(dispute.createdAt)}
                                                            </small>
                                                        </div>
                                                        <Button
                                                            variant="outline-primary"
                                                            size="sm"
                                                            onClick={() => handleViewDetails(dispute.id)}
                                                        >
                                                            <FaEye className="me-1" />
                                                            Voir détails
                                                        </Button>
                                                    </div>
                                                </Card.Body>
                                            </Card>
                                        ))}
                                    </div>

                                    {/* Pagination */}
                                    {totalPages > 1 && (
                                        <nav className="mt-4">
                                            <ul className="pagination justify-content-center">
                                                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                                    <Button
                                                        className="page-link"
                                                        onClick={() => handlePageChange(currentPage - 1)}
                                                        disabled={currentPage === 1}
                                                    >
                                                        <FaChevronLeft />
                                                    </Button>
                                                </li>

                                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                                    <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                                                        <Button
                                                            className="page-link"
                                                            onClick={() => handlePageChange(page)}
                                                        >
                                                            {page}
                                                        </Button>
                                                    </li>
                                                ))}

                                                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                                    <Button
                                                        className="page-link"
                                                        onClick={() => handlePageChange(currentPage + 1)}
                                                        disabled={currentPage === totalPages}
                                                    >
                                                        <FaChevronRight />
                                                    </Button>
                                                </li>
                                            </ul>
                                        </nav>
                                    )}
                                </>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default DisputeList;
