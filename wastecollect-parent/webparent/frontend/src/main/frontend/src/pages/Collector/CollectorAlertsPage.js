// frontend/src/pages/Collector/CollectorAlertsPage.js
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Card, Container, Row, Col, Button, ListGroup, Alert, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../contexts/AuthContext';
import collectorService from '../../services/collectorService';
import LoadingSpinner from '../../components/LoadingSpinner';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

/**
 * CollectorAlertsPage Component
 *
 * This component displays all security alerts relevant to the logged-in collector.
 * It allows collectors to view alert details and mark alerts as read.
 * The component handles data fetching, loading states, error display, and
 * user interactions for managing alerts.
 */
const CollectorAlertsPage = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  // State to hold the list of alerts
  const [alerts, setAlerts] = useState([]);
  // State for loading indicator
  const [loading, setLoading] = useState(true);
  // State for displaying errors
  const [error, setError] = useState(null);

  /**
   * Fetches all security alerts for the current collector from the backend.
   * Alerts are sorted by read status (unread first) and then by creation date (descending).
   */
  const loadAlerts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // The backend infers the collectorId from the authenticated user.
      const response = await collectorService.getSecurityAlerts();
      // Sort alerts: unread alerts appear first, then by creation date descending.
      const sortedAlerts = response.data.sort((a, b) => {
        // If read status is different, unread (false) comes before read (true)
        if (a.isRead !== b.isRead) {
          return a.isRead ? 1 : -1;
        }
        // If read status is the same, sort by creation date descending
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      setAlerts(sortedAlerts);
    } catch (err) {
      console.error('Error loading alerts:', err);
      // Display a user-friendly error message
      setError('Failed to load alerts. Please try again.');
      toast.error('Failed to load alerts.');
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array means this function is created once

  /**
   * Marks a specific security alert as read in the backend and updates the local state.
   * @param {number} alertId - The unique identifier of the alert to mark as read.
   */
  const markAlertAsRead = async (alertId) => {
    try {
      // Call the collector service to update the alert status on the backend.
      await collectorService.markAlertAsRead(alertId);
      // Optimistically update the UI: find the alert and set its 'isRead' status to true
      setAlerts(prevAlerts =>
        prevAlerts.map(alert =>
          alert.id === alertId ? { ...alert, isRead: true, readAt: new Date().toISOString() } : alert
        ).sort((a, b) => { // Re-sort the alerts after updating one
            if (a.isRead !== b.isRead) {
                return a.isRead ? 1 : -1;
            }
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        })
      );
      toast.success('Alert marked as read successfully!');
    } catch (err) {
      console.error('Error marking alert as read:', err);
      toast.error(`Failed to mark alert as read: ${err.response?.data?.message || err.message}`);
    }
  };

  /**
   * Determines the Bootstrap badge variant (color) based on the notification type.
   * @param {string} notificationType - The type of notification (e.g., 'ALERT', 'REMINDER', 'INFO').
   * @returns {string} The Bootstrap variant string ('danger', 'warning', 'info', 'secondary').
   */
  const getAlertBadgeVariant = (notificationType) => {
    switch (notificationType) {
      case 'ALERT': return 'danger';
      case 'REMINDER': return 'warning';
      case 'INFO': return 'info';
      default: return 'secondary';
    }
  };

  // Effect hook to load alerts when the component mounts or user ID changes.
  useEffect(() => {
    if (user?.id) {
      loadAlerts();
    }
  }, [user?.id, loadAlerts]); // `loadAlerts` is a dependency because it's wrapped in useCallback

  // Render loading spinner if data is being fetched
  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div className="d-flex justify-content-center">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  // Render error message if an error occurred during data fetching
  if (error) {
    return (
      <div className="container-fluid py-4">
        <Alert variant="danger" className="m-3 rounded-lg shadow-sm">
          <Alert.Heading className="font-semibold">Error</Alert.Heading>
          <p>{error}</p>
          <Button variant="outline-danger" onClick={loadAlerts} className="mt-2 rounded-md">
            Retry
          </Button>
        </Alert>
      </div>
    );
  }

  // Main component render
  return (
    <Container className="py-5 font-inter bg-gray-50 min-h-screen">
      <Row className="justify-content-center">
        <Col md={10} lg={8}>
          <Card className="shadow-lg rounded-xl border-0 p-4">
            <Card.Body>
              {/* Header and navigation button */}
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="text-4xl font-bold text-red-600 mb-0 d-flex align-items-center">
                  <span className="me-2 text-3xl">🚨</span> Alertes de Sécurité
                </h2>
                {/* Removed the single "Retour au Tableau de Bord" button from here to consolidate below */}
              </div>

              {/* Conditional rendering for alerts list or no alerts message */}
              {alerts.length > 0 ? (
                <ListGroup variant="flush" className="rounded-lg border border-gray-200">
                  {alerts
                    .filter(alert => alert && alert.id) // Ensure alert object and its ID are valid
                    .map(alert => (
                      <ListGroup.Item
                        key={alert.id} // Unique key for each list item
                        className={`d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center py-4 px-5 border-b border-gray-200 ${alert.isRead ? 'bg-gray-50 text-gray-600' : 'bg-white text-gray-800 font-semibold'}`}
                      >
                        <div className="flex-grow-1 mb-2 mb-md-0">
                          <div className="d-flex align-items-center mb-1">
                            {/* Badge for notification type */}
                            <Badge bg={getAlertBadgeVariant(alert.notificationType)} className="rounded-full px-3 py-1 text-xs font-medium me-2">
                              {alert.notificationType === 'ALERT' ? 'ALERTE' : alert.notificationType.replace('_', ' ')}
                            </Badge>
                            {/* Alert subject/title */}
                            <h6 className="mb-0 text-lg">{alert.subject}</h6>
                            {/* Conditional display for read status */}
                            {alert.isRead ? <span className="ms-2 text-sm text-muted">(Lu)</span> : null}
                            {!alert.isRead ? <Badge bg="danger" className="ms-2 rounded-full text-xs">Nouveau</Badge> : null}
                          </div>
                          {/* Alert message/description */}
                          <p className="mb-1 text-sm text-gray-700">{alert.message}</p>
                          {/* Alert creation date */}
                          <small className="text-muted">
                            Date: {new Date(alert.createdAt).toLocaleString('fr-FR')}
                          </small>
                        </div>
                        {/* Button to mark as read, only visible if not already read */}
                        {!alert.isRead ? (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => markAlertAsRead(alert.id)}
                            className="px-3 py-1 rounded-lg text-sm hover:bg-blue-700 transition-colors duration-200"
                          >
                            Marquer comme Lu
                          </Button>
                        ) : null}
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                ) : (
                  // Message displayed when no alerts are found
                  <div className="text-center py-5 text-gray-500">
                    <i className="fas fa-bell-slash fa-5x mb-4"></i>
                    <h5 className="text-2xl font-semibold">Aucune Alerte Trouvée</h5>
                    <p className="text-lg">Vous n'avez actuellement aucune alerte de sécurité.</p>
                  </div>
                )}
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
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CollectorAlertsPage;
