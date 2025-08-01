import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Button, Alert, Badge, ProgressBar, Modal } from 'react-bootstrap';
import AuthContext from '../../contexts/AuthContext';
import householdService from '../../services/householdService';
import serviceRequestService from '../../services/serviceRequestService';
import wasteCollectionService from '../../services/wasteCollectionService';
import paymentService from '../../services/paymentService';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Link, useNavigate } from 'react-router-dom';
import { FaPlusCircle, FaHistory, FaCog, FaStar, FaBell, FaChartPie, FaMoneyBillWave, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa'; // Added FaExclamationTriangle

/**
 * Composant principal du tableau de bord des ménages
 * Affiche un aperçu complet des activités et statistiques du ménage
 * Responsive pour web et mobile
 */
const HouseholdDashboard = () => {
    // Récupération du contexte d'authentification
    const { user } = useContext(AuthContext);
    
    // Hooks pour la navigation
    const navigate = useNavigate();

    // États pour la gestion des données
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dashboardData, setDashboardData] = useState({
        activeRequests: 0,
        completedCollections: 0,
        totalPayments: 0,
        upcomingPickups: [],
        recentNotifications: [],
        wasteGenerationStats: {},
        favoriteCollectors: []
    });
    
    // États pour les modals et notifications
    const [showNotificationModal, setShowNotificationModal] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState(null);

    // Chargement des données du tableau de bord
    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            setError(null); // Clear previous errors on new fetch
            if (!user || !user.id) {
                setLoading(false);
                setError("Informations utilisateur non disponibles. Veuillez vous reconnecter.");
                return;
            }

            try {
                // Fetch household profile
                const profile = await householdService.getHouseholdProfile();
                
                // Fetch active service requests
                const activeReqs = await serviceRequestService.getServiceRequestsByHousehold(user.id, 'PENDING');
                
                // Fetch completed collections
                const completedCols = await serviceRequestService.getServiceRequestsByHousehold(user.id, 'COMPLETED');
                
                // Fetch total payments
                const payments = await paymentService.getHouseholdPayments(user.id);
                const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

                // Fetch upcoming pickups
                const upcoming = await serviceRequestService.getServiceRequestsByHousehold(user.id, 'SCHEDULED');
                
                // Fetch recent notifications
                const notifications = await householdService.getNotifications(true);

                // Fetch waste generation stats
                const wasteStats = await householdService.getWasteGenerationPatterns();

                setDashboardData({
                    activeRequests: activeReqs.length,
                    completedCollections: completedCols.length,
                    totalPayments: totalPaid,
                    upcomingPickups: upcoming,
                    recentNotifications: notifications,
                    wasteGenerationStats: wasteStats,
                    favoriteCollectors: [], // placeholder
                });

            } catch (err) {
                console.error('Error fetching dashboard data:', err);
                // Set a general error message, but still allow dashboard to render
                setError('Erreur lors du chargement de certaines données du tableau de bord. Veuillez vérifier votre connexion ou réessayer.');
                // Optionally, set specific data parts to empty/default if fetching failed for that part
                setDashboardData(prev => ({
                    ...prev,
                    activeRequests: prev.activeRequests, // Keep existing if partially loaded or default
                    completedCollections: prev.completedCollections,
                    totalPayments: prev.totalPayments,
                    upcomingPickups: [], // Clear if this failed
                    recentNotifications: [], // Clear if this failed
                    wasteGenerationStats: {}, // Clear if this failed
                    favoriteCollectors: []
                }));
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [user]);

    const handleNotificationClick = (notification) => {
        setSelectedNotification(notification);
        setShowNotificationModal(true);
        // Optionally mark as read on click
        if (!notification.read) {
            householdService.markNotificationAsRead(notification.id)
                .then(() => {
                    // Refresh notifications after marking as read
                    setDashboardData(prev => ({
                        ...prev,
                        recentNotifications: prev.recentNotifications.map(n => 
                            n.id === notification.id ? { ...n, read: true } : n
                        )
                    }));
                })
                .catch(err => console.error('Failed to mark notification as read:', err));
        }
    };

    const closeNotificationModal = () => {
        setShowNotificationModal(false);
        setSelectedNotification(null);
    };

    if (loading) {
        return <LoadingSpinner message="Chargement du tableau de bord..." fullScreen />;
    }

    return (
        <Container className="py-5">
            <h1 className="text-center text-primary mb-4 display-4 fw-bold">
                Bienvenue, {user?.firstName}!
            </h1>
            <p className="text-center text-muted mb-5">Votre tableau de bord WasteCollect</p>

            {/* Display general error message if any, but continue rendering dashboard */}
            {error && (
                <Alert variant="danger" className="text-center mb-4">
                    <FaExclamationTriangle className="me-2" /> {error}
                </Alert>
            )}

            <Row className="mb-5 justify-content-center">
                {/* Stats Cards */}
                <Col md={4} className="mb-3">
                    <Card className="shadow-sm border-left-primary h-100 py-2">
                        <Card.Body>
                            <div className="row no-gutters align-items-center">
                                <div className="col mr-2">
                                    <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                                        Demandes Actives
                                    </div>
                                    <div className="h5 mb-0 font-weight-bold text-gray-800">
                                        {dashboardData.activeRequests}
                                    </div>
                                </div>
                                <div className="col-auto">
                                    <FaPlusCircle size={32} className="text-gray-300" />
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={4} className="mb-3">
                    <Card className="shadow-sm border-left-success h-100 py-2">
                        <Card.Body>
                            <div className="row no-gutters align-items-center">
                                <div className="col mr-2">
                                    <div className="text-xs font-weight-bold text-success text-uppercase mb-1">
                                        Collectes Terminées
                                    </div>
                                    <div className="h5 mb-0 font-weight-bold text-gray-800">
                                        {dashboardData.completedCollections}
                                    </div>
                                </div>
                                <div className="col-auto">
                                    <FaCheckCircle size={32} className="text-gray-300" />
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={4} className="mb-3">
                    <Card className="shadow-sm border-left-info h-100 py-2">
                        <Card.Body>
                            <div className="row no-gutters align-items-center">
                                <div className="col mr-2">
                                    <div className="text-xs font-weight-bold text-info text-uppercase mb-1">
                                        Paiements Totaux
                                    </div>
                                    <div className="h5 mb-0 font-weight-bold text-gray-800">
                                        {dashboardData.totalPayments.toFixed(2)} GNF
                                    </div>
                                </div>
                                <div className="col-auto">
                                    <FaMoneyBillWave size={32} className="text-gray-300" />
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row>
                {/* Actions Rapides */}
                <Col lg={4} className="mb-4">
                    <Card className="shadow h-100">
                        <Card.Header className="bg-gradient-primary text-white">
                            <h5 className="mb-0">
                                <i className="fas fa-bolt me-2"></i>Actions Rapides
                            </h5>
                        </Card.Header>
                        <Card.Body>
                            <div className="d-grid gap-3">
                                <Button 
                                    variant="outline-primary" 
                                    as={Link} 
                                    to="/household/request-pickup" 
                                    className="btn-responsive"
                                >
                                    <FaPlusCircle className="me-2" />
                                    Demander une Collecte
                                </Button>
                                <Button 
                                    variant="outline-success" 
                                    as={Link} 
                                    to="/household/payment-history" 
                                    className="btn-responsive"
                                >
                                    <FaHistory className="me-2" />
                                    Historique des Paiements
                                </Button>
                                <Button 
                                    variant="outline-info" 
                                    as={Link} 
                                    to="/household/rate-collector" 
                                    className="btn-responsive"
                                >
                                    <FaStar className="me-2" />
                                    Évaluer un Collecteur
                                </Button>
                                <Button 
                                    variant="outline-secondary" 
                                    as={Link} 
                                    to="/household/settings" 
                                    className="btn-responsive"
                                >
                                    <FaCog className="me-2" />
                                    Mes Préférences
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Prochaines Collectes */}
                <Col lg={4} className="mb-4">
                    <Card className="shadow h-100">
                        <Card.Header className="bg-gradient-success text-white">
                            <h5 className="mb-0">
                                <i className="fas fa-calendar-alt me-2"></i>Prochaines Collectes
                            </h5>
                        </Card.Header>
                        <Card.Body>
                            {dashboardData.upcomingPickups && dashboardData.upcomingPickups.length > 0 ? (
                                <ul className="list-group list-group-flush">
                                    {dashboardData.upcomingPickups.map(pickup => (
                                        <li key={pickup.id} className="list-group-item d-flex justify-content-between align-items-center">
                                            <div>
                                                <h6 className="mb-1">{pickup.wasteType} - {new Date(pickup.preferredDate).toLocaleDateString()}</h6>
                                                <small className="text-muted">{pickup.address}</small>
                                            </div>
                                            <Badge bg="primary">{pickup.status}</Badge>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-center text-muted">Aucune collecte prévue pour le moment.</p>
                            )}
                        </Card.Body>
                    </Card>
                </Col>

                {/* Notifications Récentes */}
                <Col lg={4} className="mb-4">
                    <Card className="shadow h-100">
                        <Card.Header className="bg-gradient-info text-white">
                            <h5 className="mb-0">
                                <FaBell className="me-2" />Notifications Récentes
                                <Badge pill bg="light" text="dark" className="ms-2">{dashboardData.recentNotifications ? dashboardData.recentNotifications.length : 0}</Badge>
                            </h5>
                        </Card.Header>
                        <Card.Body>
                            {dashboardData.recentNotifications && dashboardData.recentNotifications.length > 0 ? (
                                <ul className="list-group list-group-flush cursor-pointer">
                                    {dashboardData.recentNotifications.map(notification => (
                                        <li 
                                            key={notification.id} 
                                            className={`list-group-item d-flex justify-content-between align-items-start ${!notification.read ? 'bg-light fw-bold' : ''} py-3`}
                                            onClick={() => handleNotificationClick(notification)}
                                        >
                                            <div>
                                                <small className="text-muted d-block mb-1">
                                                    {new Date(notification.createdAt).toLocaleString()}
                                                </small>
                                                <p className="mb-1">{notification.message}</p>
                                            </div>
                                            {!notification.read && <Badge bg="warning" className="ms-2">Nouveau</Badge>}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-center text-muted">Aucune notification récente.</p>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Statistiques de Génération de Déchets */}
            <Row className="mt-4 justify-content-center">
                <Col lg={8} className="mb-4">
                    <Card className="shadow">
                        <Card.Header className="bg-gradient-secondary text-white">
                            <h5 className="mb-0">
                                <FaChartPie className="me-2" />Statistiques de Génération de Déchets
                            </h5>
                        </Card.Header>
                        <Card.Body>
                            {dashboardData.wasteGenerationStats && dashboardData.wasteGenerationStats.averageVolume ? (
                                <div>
                                    <p>
                                        Volume moyen de déchets générés par mois: 
                                        <span className="fw-bold text-primary ms-2">
                                            {dashboardData.wasteGenerationStats.averageVolume} Litres
                                        </span>
                                    </p>
                                    <ProgressBar 
                                        now={dashboardData.wasteGenerationStats.averageVolume / 200 * 100} // Example scale
                                        label={`${dashboardData.wasteGenerationStats.averageVolume}L`} 
                                        variant="warning" 
                                        className="mt-3"
                                    />
                                    <small className="text-muted mt-2 d-block">
                                        Basé sur les données des 
                                        {dashboardData.wasteGenerationStats.frequencyDays ? dashboardData.wasteGenerationStats.frequencyDays/30 : 'N/A'} derniers mois.
                                    </small>
                                </div>
                            ) : (
                                <p className="text-center text-muted">
                                    Données de statistiques de déchets non disponibles.
                                </p>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Notification Detail Modal */}
            <Modal show={showNotificationModal} onHide={closeNotificationModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Détail de la Notification</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedNotification ? (
                        <>
                            <p><strong>Date:</strong> {selectedNotification.createdAt ? new Date(selectedNotification.createdAt).toLocaleString() : 'N/A'}</p>
                            <p><strong>Message:</strong> {selectedNotification.message}</p>
                            <p><strong>Statut:</strong> {selectedNotification.read ? 'Lue' : 'Non lue'}</p>
                        </>
                    ) : (
                        <p>Aucune notification sélectionnée.</p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowNotificationModal(false)}>
                        Fermer
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Styles CSS personnalisés pour la responsivité */}
            <style jsx>{`
                .btn-responsive {
                    font-size: 0.9rem;
                    padding: 0.5rem 1rem;
                }
                
                @media (max-width: 768px) {
                    .btn-responsive {
                        font-size: 0.8rem;
                        padding: 0.4rem 0.8rem;
                    }
                    
                    .display-4 {
                        font-size: 2rem !important;
                    }
                    
                    .h2 {
                        font-size: 1.5rem !important;
                    }
                }
                
                .cursor-pointer {
                    cursor: pointer;
                }
                
                .space-y-3 > * + * {
                    margin-top: 1rem;
                }
                
                .space-y-2 > * + * {
                    margin-top: 0.5rem;
                }
                
                .last\\:border-0:last-child {
                    border-bottom: none !important;
                }
            `}</style>
        </Container>
    );
};

export default HouseholdDashboard;
