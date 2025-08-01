// frontend/src/pages/Collector/CollectorNotificationsPage.js
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Card, Container, Row, Col, ListGroup, Alert, Badge, Button, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../contexts/AuthContext';
import collectorService from '../../services/collectorService'; // Assuming service for fetching notifications
import LoadingSpinner from '../../components/LoadingSpinner';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

/**
 * CollectorNotificationsPage Component
 *
 * This component displays general notifications for the logged-in collector.
 * It's designed to be a central inbox for various types of notifications
 * beyond just security alerts (e.g., service request updates, payment confirmations, general announcements).
 * It fetches data, handles loading states, error display, and user interactions
 * like marking notifications as read.
 */
const CollectorNotificationsPage = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  // State to hold the list of notifications
  const [notifications, setNotifications] = useState([]);
  // State for loading indicator
  const [loading, setLoading] = useState(true);
  // State for displaying errors
  const [error, setError] = useState(null);

  /**
   * Fetches all general notifications for the current collector from the backend.
   * Notifications are sorted by creation date (descending) and unread ones prioritized.
   */
  const loadNotifications = useCallback(async () => {
    if (!user) {
      setError('User not authenticated.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // NOTE: Assuming a new method `getNotifications` in collectorService.js
      // If such a method doesn't exist, you'll need to implement it in the backend
      // and expose it via collectorService.
      // For now, this will simulate fetching, or you might adapt collectorService.getSecurityAlerts
      // if general notifications are handled by the same endpoint but with different types.
      const response = await collectorService.getSecurityAlerts(); // Using alerts as a placeholder for now
      // Filter or transform data if necessary to fit 'notifications' structure
      setNotifications(response.data.sort((a, b) => {
        // Sort unread first, then by creation date descending
        if (a.isRead === b.isRead) {
          return new Date(b.createdAt) - new Date(a.createdAt);
        }
        return a.isRead ? 1 : -1;
      }));
      toast.success('Notifications chargées avec succès!');
    } catch (err) {
      console.error('Failed to load notifications:', err);
      const errorMessage = err.response?.data?.message || 'Échec du chargement des notifications.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  /**
   * Marks a single notification as read.
   * @param {string} notificationId - The ID of the notification to mark as read.
   */
  const markNotificationAsRead = async (notificationId) => {
    try {
      // NOTE: Assuming a new method `markNotificationAsRead` in collectorService.js or notificationService.js
      // For now, this will simulate the action.
      // await collectorService.markNotificationAsRead(notificationId);
      toast.success('Notification marquée comme lue.');
      // Update the state locally to reflect the change immediately
      setNotifications(prevNotifications =>
        prevNotifications.map(notif =>
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
      toast.error('Échec de la mise à jour de la notification.');
    }
  };

  /**
   * Marks all unread notifications as read.
   */
  const markAllAsRead = async () => {
    try {
      // NOTE: Assuming a new method `markAllNotificationsAsRead` in collectorService.js or notificationService.js
      // For now, this will simulate the action.
      // await collectorService.markAllNotificationsAsRead();
      toast.success('Toutes les notifications ont été marquées comme lues.');
      setNotifications(prevNotifications =>
        prevNotifications.map(notif => ({ ...notif, isRead: true }))
      );
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
      toast.error('Échec du marquage de toutes les notifications comme lues.');
    }
  };

  const getNotificationBadgeVariant = (isRead) => {
    return isRead ? 'secondary' : 'info';
  };

  return (
    <Container className="py-5 font-inter bg-gray-50 min-h-screen">
      <Row className="justify-content-center">
        <Col md={10} lg={8}>
          <Card className="shadow-lg rounded-xl border-0 p-4">
            <Card.Body>
              <h2 className="text-4xl font-bold text-purple-700 mb-4 text-center">🔔 Mes Notifications</h2>
              <p className="lead text-gray-700 mb-4 text-center">
                Consultez ici toutes les mises à jour importantes, les rappels et les messages.
              </p>

              {loading && <LoadingSpinner message="Chargement des notifications..." />}
              {error && <Alert variant="danger" className="text-center">{error}</Alert>}

              {!loading && !error && (
                <div className="mb-4 d-flex justify-content-end">
                  <Button
                    variant="outline-secondary"
                    onClick={markAllAsRead}
                    disabled={notifications.every(notif => notif.isRead)}
                    className="px-4 py-2 rounded-lg text-md shadow-sm hover:bg-gray-100 transition-colors duration-200"
                  >
                    Marquer Tout comme Lu
                  </Button>
                </div>
              )}

              {!loading && !error && notifications.length > 0 ? (
                <ListGroup variant="flush" className="border-t border-gray-200 pt-3">
                  {notifications.map(notification => (
                    <ListGroup.Item
                      key={notification.id}
                      className="d-flex justify-content-between align-items-start py-3 px-0 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex-grow-1">
                        <h6 className="mb-1 text-gray-800">
                          {notification.subject}{' '}
                          <Badge bg={getNotificationBadgeVariant(notification.isRead)} className="ml-2">
                            {notification.isRead ? 'Lu' : 'Non Lu'}
                          </Badge>
                        </h6>
                        <p className="text-sm text-gray-700 mb-2">{notification.message}</p>
                        <small className="text-muted">
                          Date: {new Date(notification.createdAt).toLocaleString('fr-FR')}
                        </small>
                      </div>
                      {!notification.isRead ? (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => markNotificationAsRead(notification.id)}
                          className="px-3 py-1 rounded-lg text-sm hover:bg-blue-700 transition-colors duration-200 flex-shrink-0 ml-3"
                        >
                          Marquer comme Lu
                        </Button>
                      ) : null}
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                !loading && !error && (
                  <div className="text-center py-5 text-gray-500">
                    <i className="fas fa-bell-slash fa-5x mb-4"></i>
                    <h5 className="text-2xl font-semibold">Aucune Notification Trouvée</h5>
                    <p className="text-lg">Vous n'avez actuellement aucune nouvelle notification.</p>
                  </div>
                )
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

export default CollectorNotificationsPage;
