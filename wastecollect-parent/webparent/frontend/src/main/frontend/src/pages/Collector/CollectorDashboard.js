// frontend/src/pages/CollectorDashboard.js
import React, { useState, useEffect, useContext } from 'react';
import { Card, Row, Col, Badge, Alert, Button, Modal, ListGroup, Container } from 'react-bootstrap';
import AuthContext from '../../contexts/AuthContext';
import collectorService from '../../services/collectorService';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify'; // Import ToastContainer
import 'react-toastify/dist/ReactToastify.css';

/**
 * CollectorDashboard Component
 *
 * This component serves as the main dashboard for waste collectors.
 * It displays key performance indicators, recent service requests,
 * and security alerts. It also provides quick navigation links to
 * other collector-specific functionalities.
 *
 * It fetches data from the backend using various service calls,
 * handles loading and error states, and provides user feedback
 * through toast notifications.
 */
const CollectorDashboard = () => {
  // State variables for managing dashboard data
  const [dashboardData, setDashboardData] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    completedToday: 0,
    totalRevenue: 0,
    weeklyRevenue: 0,
    rating: 0,
    totalRatings: 0,
  });
  const [recentRequests, setRecentRequests] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);

  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Function to fetch dashboard data
  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch general stats for dashboard KPIs
      const statsResponse = await collectorService.getCollectorStats();
      setDashboardData(statsResponse.data);

      // Fetch recent service requests for the list
      const requestsResponse = await collectorService.getRequestsForCollector();
      // Filter for recent requests (e.g., last 5, or specific statuses)
      const recentFiveRequests = requestsResponse.data.slice(0, 5); // Limit to 5 for dashboard
      setRecentRequests(recentFiveRequests);

      // Fetch security alerts
      const alertsResponse = await collectorService.getSecurityAlerts();
      const unreadAlerts = alertsResponse.data.filter(alert => !alert.isRead).slice(0, 3); // Show max 3 unread alerts
      setAlerts(unreadAlerts);

    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      const errorMessage = err.response?.data?.message || 'Échec du chargement du tableau de bord.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  // Function to handle opening alert details modal
  const handleShowNotificationModal = (alert) => {
    setSelectedAlert(alert);
    setShowNotificationModal(true);
  };

  // Function to mark an alert as read
  const markAlertAsRead = async (alertId) => {
    try {
      await collectorService.markAlertAsRead(alertId);
      toast.success('Alerte marquée comme lue.');
      // Refresh alerts after marking as read
      loadDashboardData();
      setShowNotificationModal(false); // Close modal after action
    } catch (err) {
      console.error('Failed to mark alert as read:', err);
      toast.error('Échec de la mise à jour de l\'alerte.');
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'PENDING': return 'warning';
      case 'ACCEPTED': return 'primary';
      case 'IN_PROGRESS': return 'info';
      case 'COMPLETED': return 'success';
      case 'REJECTED': return 'danger';
      default: return 'secondary';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'GNF' }).format(amount);
  };


  return (
    <Container className="py-5 font-inter bg-gray-100 min-h-screen"> {/* Changed background color */}
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      <Row className="justify-content-center">
        <Col md={12} lg={10} className="mb-4"> {/* Adjusted Col size for better centering */}
          {loading && <LoadingSpinner message="Chargement du tableau de bord..." />}
          {error && <Alert variant="danger" className="text-center">{error}</Alert>}

          {!loading && !error && (
            <>
              <Card className="shadow-lg rounded-xl border-0 p-4 mb-4 bg-white"> {/* Added bg-white */}
                <Card.Body>
                  <h2 className="text-3xl font-bold text-green-700 mb-4 text-center">Tableau de Bord du Collecteur</h2>

                  {/* Key Performance Indicators */}
                  <Row className="text-center mb-4">
                    <Col md={4} className="mb-3">
                      <div className="p-4 bg-blue-50 rounded-lg shadow-sm"> {/* Lighter blue */}
                        <h5 className="text-lg font-semibold text-blue-800">Total Demandes</h5>
                        <p className="text-4xl font-bold text-blue-600">{dashboardData.totalRequests}</p>
                      </div>
                    </Col>
                    <Col md={4} className="mb-3">
                      <div className="p-4 bg-yellow-50 rounded-lg shadow-sm"> {/* Lighter yellow */}
                        <h5 className="text-lg font-semibold text-yellow-800">Demandes en Attente</h5>
                        <p className="text-4xl font-bold text-yellow-600">{dashboardData.pendingRequests}</p>
                      </div>
                    </Col>
                    <Col md={4} className="mb-3">
                      <div className="p-4 bg-green-50 rounded-lg shadow-sm"> {/* Lighter green */}
                        <h5 className="text-lg font-semibold text-green-800">Terminées Aujourd'hui</h5>
                        <p className="text-4xl font-bold text-green-600">{dashboardData.completedToday}</p>
                      </div>
                    </Col>
                  </Row>

                  <Row className="text-center">
                    <Col md={6} className="mb-3">
                      <div className="p-4 bg-purple-50 rounded-lg shadow-sm"> {/* Lighter purple */}
                        <h5 className="text-lg font-semibold text-purple-800">Revenu Total</h5>
                        <p className="text-4xl font-bold text-purple-600">{formatCurrency(dashboardData.totalRevenue)}</p>
                      </div>
                    </Col>
                    <Col md={6} className="mb-3">
                      <div className="p-4 bg-red-50 rounded-lg shadow-sm"> {/* Lighter red */}
                        <h5 className="text-lg font-semibold text-red-800">Note Moyenne</h5>
                        <p className="text-4xl font-bold text-red-600">{dashboardData.rating.toFixed(1)} <i className="fas fa-star text-yellow-500"></i></p>
                        <p className="text-sm text-gray-600">({dashboardData.totalRatings} évaluations)</p>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              <Row>
                <Col md={6} className="mb-4">
                  <Card className="shadow-lg rounded-xl border-0 bg-white"> {/* Added bg-white */}
                    <Card.Body>
                      <h4 className="text-xl font-semibold text-gray-800 mb-3">Demandes Récentes</h4>
                      {recentRequests.length > 0 ? (
                        <ListGroup variant="flush" className="border-t border-gray-200 pt-3">
                          {recentRequests.map(request => (
                            <ListGroup.Item key={request.id} className="d-flex justify-content-between align-items-center py-3 px-0 border-b border-gray-100 last:border-b-0 bg-transparent"> {/* Added bg-transparent */}
                              <div>
                                <h6 className="mb-1 text-gray-800">{request.description} <Badge bg={getStatusBadgeVariant(request.status)} className="ml-2">{request.status}</Badge></h6>
                                <p className="text-sm text-gray-600 mb-0">{new Date(request.createdAt).toLocaleString('fr-FR')}</p>
                              </div>
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => navigate(`/collector/service-requests`)}
                                className="px-3 py-1 rounded-lg text-sm border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white transition-colors duration-200" // Enhanced button style
                              >
                                Voir Détails
                              </Button>
                            </ListGroup.Item>
                          ))}
                        </ListGroup>
                      ) : (
                        <div className="text-center py-5 text-gray-500">
                          <i className="fas fa-box-open fa-5x mb-4"></i>
                          <h5 className="text-2xl font-semibold">Aucune Demande Récente</h5>
                          <p className="text-lg">Toutes les demandes ont été traitées ou il n'y en a pas de nouvelles.</p>
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6} className="mb-4">
                  <Card className="shadow-lg rounded-xl border-0 bg-white"> {/* Added bg-white */}
                    <Card.Body>
                      <h4 className="text-xl font-semibold text-gray-800 mb-3">Alertes de Sécurité</h4>
                      {alerts.length > 0 ? (
                        <ListGroup variant="flush" className="border-t border-gray-200 pt-3">
                          {alerts.map(alert => (
                            <ListGroup.Item key={alert.id} className="d-flex justify-content-between align-items-center py-3 px-0 border-b border-gray-100 last:border-b-0 bg-transparent"> {/* Added bg-transparent */}
                              <div>
                                <h6 className="mb-1 text-gray-800">{alert.subject} {!alert.isRead && <Badge bg="danger" className="ml-2">Nouveau</Badge>}</h6>
                                <p className="text-sm text-gray-600 mb-0">{new Date(alert.createdAt).toLocaleString('fr-FR')}</p>
                              </div>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleShowNotificationModal(alert)}
                                className="px-3 py-1 rounded-lg text-sm border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors duration-200" // Enhanced button style
                              >
                                Voir
                              </Button>
                            </ListGroup.Item>
                          ))}
                        </ListGroup>
                      ) : (
                        <div className="text-center py-5 text-gray-500">
                          <i className="fas fa-bell-slash fa-5x mb-4"></i>
                          <h5 className="text-2xl font-semibold">Aucune Alerte</h5>
                          <p className="text-lg">Vous n'avez actuellement aucune alerte de sécurité.</p>
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <Card className="shadow-lg rounded-xl border-0 p-4 mt-4 bg-white"> {/* Added bg-white */}
                <Card.Body className="text-center">
                  <h4 className="text-xl font-semibold text-gray-800 mb-3">Liens Rapides</h4>
                  <div className="d-flex flex-wrap justify-content-center gap-3">
                    <Button variant="outline-success" onClick={() => navigate('/collector/service-requests')} className="px-4 py-2 rounded-lg text-md border border-green-500 text-green-500 hover:bg-green-500 hover:text-white transition-colors duration-200">
                      <i className="fas fa-clipboard-list me-2"></i>
                      Demandes de Service
                    </Button>
                    <Button variant="outline-info" onClick={() => navigate('/collector/performance')} className="px-4 py-2 rounded-lg text-md border border-teal-500 text-teal-500 hover:bg-teal-500 hover:text-white transition-colors duration-200">
                      <i className="fas fa-chart-line me-2"></i>
                      Performance
                    </Button>
                    <Button variant="outline-warning" onClick={() => navigate('/collector/revenue')} className="px-4 py-2 rounded-lg text-md border border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white transition-colors duration-200">
                      <i className="fas fa-wallet me-2"></i>
                      Mes Revenus
                    </Button>
                    <Button variant="outline-primary" onClick={() => navigate('/collector/alerts')} className="px-4 py-2 rounded-lg text-md border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors duration-200">
                      <i className="fas fa-exclamation-triangle me-2"></i>
                      Alertes
                    </Button>
                    <Button variant="outline-secondary" onClick={() => navigate('/collector/schedule')} className="px-4 py-2 rounded-lg text-md border border-gray-500 text-gray-500 hover:bg-gray-500 hover:text-white transition-colors duration-200">
                      <i className="fas fa-calendar-alt me-2"></i>
                      Mon Emploi du Temps
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </>
          )}
        </Col>
      </Row>

      {/* Notification Details Modal */}
      <Modal show={showNotificationModal} onHide={() => setShowNotificationModal(false)} centered size="lg">
        <Modal.Header closeButton className="border-b-2 border-gray-200 pb-3">
          <Modal.Title className="text-2xl font-bold text-gray-800">Alert Details</Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-5 px-6">
          {selectedAlert && (
            <>
              <h6 className="text-xl font-semibold text-gray-800 mb-2">{selectedAlert.subject}</h6>
              <p className="text-gray-700 mb-4">{selectedAlert.message}</p>
              <div className="text-gray-600 text-sm mb-1">
                <strong>Date:</strong> {new Date(selectedAlert.createdAt).toLocaleString('en-US')}
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer className="border-t-2 border-gray-200 pt-3">
          <Button
            variant="secondary"
            onClick={() => setShowNotificationModal(false)}
            className="px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors duration-200"
          >
            Close
          </Button>
          {selectedAlert && !selectedAlert.isRead && (
            <Button
              variant="primary"
              onClick={() => markAlertAsRead(selectedAlert.id)}
              className="px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Mark as Read
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default CollectorDashboard;
