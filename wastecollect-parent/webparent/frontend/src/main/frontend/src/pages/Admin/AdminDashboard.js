// File: frontend/src/pages/Admin/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import adminService from '../../services/adminService.js'; // Added .js extension for explicit resolution
import { Container, Row, Col, Card, Button, Alert, Spinner, Dropdown, Form } from 'react-bootstrap';
import { FaChartLine, FaUsers, FaTrash, FaCity, FaFileAlt, FaSyncAlt, FaArrowRight, FaCog, FaHome, FaBell, FaPaperPlane, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';


/**
 * Tableau de bord principal pour les administrateurs
 * Affiche les statistiques globales, les indicateurs de performance
 * et les raccourcis vers les principales fonctionnalités d'administration
 */
const AdminDashboard = () => {
  // États pour les données du dashboard
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalUsers: 0,
      totalCollectors: 0,
      totalHouseholds: 0,
      totalMunicipalities: 0,
      activeServiceRequests: 0,
      completedCollections: 0,
      totalRevenue: 0,
      pendingDisputes: 0
    },
    recentActivities: [],
    performanceMetrics: {
      averageResponseTime: 0,
      customerSatisfaction: 0,
      collectionEfficiency: 0
    },
    alerts: []
  });

  // États pour la gestion de l'interface
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statsPeriod, setStatsPeriod] = useState('week'); // Default to weekly stats
  const [metricsPeriod, setMetricsPeriod] = useState('week'); // Default to weekly metrics

  // Fonction pour charger les données du tableau de bord
  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch all data concurrently
      const [
        statsResponse, 
        activitiesResponse, 
        performanceResponse, 
        alertsResponse
      ] = await Promise.all([
        adminService.getGlobalStatistics(statsPeriod),
        adminService.getRecentActivities(),
        adminService.getPerformanceMetrics(metricsPeriod),
        adminService.getSystemAlerts()
      ]);

      setDashboardData({
        stats: statsResponse,
        recentActivities: activitiesResponse,
        performanceMetrics: performanceResponse,
        alerts: alertsResponse
      });
    } catch (err) {
      console.error("Erreur lors du chargement des données du tableau de bord:", err);
      setError("Impossible de charger les données du tableau de bord. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les données initiales et à chaque changement de période
  useEffect(() => {
    fetchDashboardData();
  }, [statsPeriod, metricsPeriod]); // Re-fetch when period changes

  // Rendu des cartes de statistiques principales
  const renderStatsCards = () => (
    <Row className="mb-4">
      {Object.entries(dashboardData.stats).map(([key, value]) => (
        <Col key={key} lg={3} md={6} sm={12} className="mb-4">
          <Card className="shadow-sm h-100 border-left-primary">
            <Card.Body>
              <div className="d-flex align-items-center justify-content-between">
                <div className="text-uppercase text-primary fw-bold text-xs mb-1">
                  {key === 'totalUsers' && 'Total Utilisateurs'}
                  {key === 'totalCollectors' && 'Total Collecteurs'}
                  {key === 'totalHouseholds' && 'Total Ménages'}
                  {key === 'totalMunicipalities' && 'Total Municipalités'}
                  {key === 'activeServiceRequests' && 'Demandes Actives'}
                  {key === 'completedCollections' && 'Collectes Complétées'}
                  {key === 'totalRevenue' && 'Revenus Totaux'}
                  {key === 'pendingDisputes' && 'Litiges en Attente'}
                </div>
                <FaUsers className="text-gray-300" size={32} />
              </div>
              <div className="h5 mb-0 fw-bold text-gray-800">
                {key === 'totalRevenue' ? `${value.toFixed(2)} FCFA` : value.toLocaleString()}
              </div>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );

  // Rendu des alertes système
  const renderSystemAlerts = () => (
    <Card className="shadow-sm mb-4">
      <Card.Header className="bg-warning text-dark fw-bold d-flex align-items-center">
        <FaExclamationTriangle className="me-2" /> Alertes Système
      </Card.Header>
      <Card.Body>
        {dashboardData.alerts.length > 0 ? (
          <ul className="list-group list-group-flush">
            {dashboardData.alerts.map((alert) => (
              <li key={alert.id} className="list-group-item d-flex justify-content-between align-items-center">
                <span>{alert.message}</span>
                <span className="badge bg-danger">Critique</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted">Aucune alerte système active.</p>
        )}
      </Card.Body>
    </Card>
  );

  // Rendu des métriques de performance
  const renderPerformanceMetrics = () => (
    <Card className="shadow-sm mb-4">
      <Card.Header className="bg-success text-white fw-bold d-flex align-items-center">
        <FaChartLine className="me-2" /> Métriques de Performance
      </Card.Header>
      <Card.Body>
        <Row>
          <Col md={4} className="text-center">
            <h6>Temps de Réponse Moyen</h6>
            <p className="display-6 text-success">{dashboardData.performanceMetrics.averageResponseTime.toFixed(1)}h</p>
          </Col>
          <Col md={4} className="text-center">
            <h6>Satisfaction Client</h6>
            <p className="display-6 text-info">{dashboardData.performanceMetrics.customerSatisfaction.toFixed(1)}%</p>
          </Col>
          <Col md={4} className="text-center">
            <h6>Efficacité de Collecte</h6>
            <p className="display-6 text-primary">{dashboardData.performanceMetrics.collectionEfficiency.toFixed(1)}%</p>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );

  // Rendu des activités récentes
  const renderRecentActivities = () => (
    <Card className="shadow-sm mb-4">
      <Card.Header className="bg-info text-white fw-bold d-flex align-items-center">
        <FaSyncAlt className="me-2" /> Activités Récentes
      </Card.Header>
      <Card.Body>
        {dashboardData.recentActivities.length > 0 ? (
          <ul className="list-group list-group-flush">
            {dashboardData.recentActivities.map((activity) => (
              <li key={activity.id} className="list-group-item d-flex align-items-center">
                {/* Dynamic icon based on activity type, fallback to FaBell */}
                {activity.icon === 'user-plus' && <FaUsers className={`me-2 text-${activity.type}`} />}
                {activity.icon === 'check-circle' && <FaCheckCircle className={`me-2 text-${activity.type}`} />}
                {activity.icon === 'exclamation-triangle' && <FaExclamationTriangle className={`me-2 text-${activity.type}`} />}
                {activity.icon === 'bell' && <FaBell className={`me-2 text-${activity.type}`} />}
                {!['user-plus', 'check-circle', 'exclamation-triangle', 'bell'].includes(activity.icon) && <FaBell className={`me-2 text-${activity.type}`} />}
                <div>
                  <h6 className="mb-1">{activity.title}</h6>
                  <p className="mb-0 text-muted">{activity.description}</p>
                  <small className="text-secondary">{activity.timeAgo}</small>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted">Aucune activité récente.</p>
        )}
      </Card.Body>
    </Card>
  );

  // Rendu des actions rapides
  const renderQuickActions = () => (
    <Card className="shadow-sm mb-4">
      <Card.Header className="bg-dark text-white fw-bold d-flex align-items-center">
        <FaCog className="me-2" /> Actions Rapides
      </Card.Header>
      <Card.Body>
        <div className="d-grid gap-2">
          <Button as={Link} to="/admin/manage-collectors" variant="outline-primary">
            <FaUsers className="me-2" /> Gérer les Collecteurs
          </Button>
          <Button as={Link} to="/admin/manage-households" variant="outline-primary">
            <FaHome className="me-2" /> Gérer les Ménages
          </Button>
          <Button as={Link} to="/admin/reports" variant="outline-primary">
            <FaFileAlt className="me-2" /> Générer des Rapports
          </Button>
          <Button as={Link} to="/admin/manage-municipalities" variant="outline-primary">
            <FaCity className="me-2" /> Gérer les Municipalités
          </Button>
          {/* <Button as={Link} to="/admin/manage-users" variant="outline-primary"> */}
          {/* <FaUsers className="me-2" /> Gérer les Utilisateurs */}
          {/* </Button> */}
          <Button as={Link} to="/admin/send-notification" variant="outline-primary"> {/* NEW BUTTON */}
            <FaPaperPlane className="me-2" /> Envoyer une Notification
          </Button>
        </div>
      </Card.Body>
    </Card>
  );

  return (
    <Container className="my-4">
      <h2 className="mb-4 text-center text-primary">Tableau de Bord Administrateur</h2>

      {/* Period Selection for Stats and Metrics */}
      <div className="d-flex justify-content-center align-items-center mb-4">
        <div className="me-3">
          <Form.Label className="me-2 mb-0">Statistiques:</Form.Label>
          <Form.Select value={statsPeriod} onChange={(e) => setStatsPeriod(e.target.value)} size="sm">
            <option value="day">Jour</option>
            <option value="week">Semaine</option>
            <option value="month">Mois</option>
            <option value="year">Année</option>
          </Form.Select>
        </div>
        <div>
          <Form.Label className="me-2 mb-0">Métriques:</Form.Label>
          <Form.Select value={metricsPeriod} onChange={(e) => setMetricsPeriod(e.target.value)} size="sm">
            <option value="day">Jour</option>
            <option value="week">Semaine</option>
            <option value="month">Mois</option>
            <option value="year">Année</option>
          </Form.Select>
        </div>
      </div>

      {isLoading && (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Chargement du tableau de bord...</p>
        </div>
      )}

      {/* Always render content, even if there's an error. Data will be initial or last successfully loaded. */}
      {error && <Alert variant="danger">{error}</Alert>} {/* Display error message if present */}

      {/* Render content if not currently loading, regardless of error state */}
      {!isLoading && (
        <>
          {/* Statistiques principales */}
          {renderStatsCards()}

          {/* Alertes système */}
          {dashboardData.alerts.length > 0 && (
            <Row className="mb-4">
              <Col xs={12}>
                {renderSystemAlerts()}
              </Col>
            </Row>
          )}

          {/* Métriques de performance */}
          <Row className="mb-4">
            <Col xs={12}>
              {renderPerformanceMetrics()}
            </Col>
          </Row>

          {/* Activités récentes et actions rapides */}
          <Row>
            <Col lg={6} className="mb-4">
              {renderRecentActivities()}
            </Col>
            <Col lg={6} className="mb-4">
              {renderQuickActions()}
            </Col>
          </Row>
        </>
      )}
    </Container>
  );
};

export default AdminDashboard;
