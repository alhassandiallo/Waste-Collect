import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Container, Alert, Spinner } from 'react-bootstrap';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  ArcElement,
} from 'chart.js';
import municipalityService from '../../services/municipalityService';
import useAuth from '../../hooks/useAuth'; // Import useAuth to get user and municipalityId

// Enregistrement des composants Chart.js nécessaires
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  ArcElement
);

/**
 * Composant Dashboard principal pour les municipalités
 * Affiche un aperçu complet des métriques de collecte des déchets,
 * des zones mal desservies et des statistiques globales
 */
const MunicipalityDashboard = () => {
  // Get user from auth context to access municipality ID
  const { user, isLoading: authLoading } = useAuth();
  const municipalityId = user?.municipalityId; // Assuming municipalityId is available on the user object

  // Estados para gestionar los datos y la interfaz
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Define initial state for dashboard data. This will be used if no data is fetched.
  const initialDashboardData = {
    collectionData: {
      totalCollections: 0,
      totalWasteVolumeKg: 0,
      averageWastePerCollectionKg: 0,
      pendingServiceRequests: 0,
      completedServiceRequests: 0,
      wasteVolumeByType: {},
    },
    metrics: {
      totalHouseholds: 0,
      activeHouseholds: 0,
      totalCollectors: 0,
      activeCollectors: 0,
      averageResponseTimeHours: 0,
      averageCollectionRating: 0,
      totalDisputes: 0,
    },
    underservedAreasCount: 0,
    wasteVolumeChartData: {
      labels: [],
      datasets: [],
    },
    serviceRequestStatusChartData: {
      labels: [],
      datasets: [],
    },
  };
  const [dashboardData, setDashboardData] = useState(initialDashboardData);

  // Options for charts (can be customized further) - Moved outside useEffect
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Titre du graphique',
      },
    },
  };

  const wasteVolumeChartOptions = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      title: {
        display: true,
        text: 'Volume de Déchets par Type (Kg)',
      },
    },
  };

  const serviceRequestStatusOptions = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      title: {
        display: true,
        text: 'Statut des Demandes de Service',
      },
    },
  };


  /**
   * Chargement initial des données du tableau de bord
   */
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true); // Start loading for any fetch attempt
      setError(null); // Clear previous errors

      // Check for municipalityId AFTER authLoading has settled
      if (!municipalityId && !authLoading) {
        setError("ID de la municipalité non disponible. Certaines données peuvent être manquantes. Veuillez contacter l'administrateur.");
        setDashboardData(initialDashboardData); // Reset to initial empty state
        setLoading(false); // Stop loading to render the empty UI with the error message
        return; // Exit early as no API call can be made without municipalityId
      }

      // Only attempt to fetch if municipalityId is available
      if (municipalityId) {
        try {
          const endDate = new Date();
          const startDate = new Date();
          startDate.setDate(endDate.getDate() - 30);

          const formatDateTime = (date) => date.toISOString().slice(0, 19);
          const formattedStartDate = formatDateTime(startDate);
          const formattedEndDate = formatDateTime(endDate);

          // Fetch collection data
          const collectionDataResponse = await municipalityService.getWasteCollectionData(
            municipalityId,
            formattedStartDate,
            formattedEndDate
          );

          // Fetch metrics data
          const metricsResponse = await municipalityService.getMetricsAnalysis(
            municipalityId,
            formattedStartDate,
            formattedEndDate
          );

          // Fetch underserved areas count
          const underservedAreasResult = await municipalityService.identifyUnderservedAreas(
            municipalityId, 30, 2
          );
          const underservedAreasCount = underservedAreasResult.length;

          // Prepare data for charts
          const wasteVolumeLabels = Object.keys(collectionDataResponse.wasteVolumeByType);
          const wasteVolumeValues = Object.values(collectionDataResponse.wasteVolumeByType);

          const wasteVolumeChartData = {
            labels: wasteVolumeLabels,
            datasets: [
              {
                label: 'Volume de Déchets (kg)',
                data: wasteVolumeValues,
                backgroundColor: [
                  'rgba(255, 99, 132, 0.6)', 'rgba(54, 162, 235, 0.6)', 'rgba(255, 206, 86, 0.6)',
                  'rgba(75, 192, 192, 0.6)', 'rgba(153, 102, 255, 0.6)', 'rgba(255, 159, 64, 0.6)',
                ],
                borderColor: [
                  'rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)',
                  'rgba(75, 192, 192, 1)', 'rgba(153, 102, 255, 1)', 'rgba(255, 159, 64, 1)',
                ],
                borderWidth: 1,
              },
            ],
          };

          const serviceRequestStatusChartData = {
            labels: ['En Attente / En Cours', 'Complétées'],
            datasets: [
              {
                label: 'Demandes de Service',
                data: [collectionDataResponse.pendingServiceRequests, collectionDataResponse.completedServiceRequests],
                backgroundColor: ['rgba(255, 159, 64, 0.6)', 'rgba(75, 192, 192, 0.6)'],
                borderColor: ['rgba(255, 159, 64, 1)', 'rgba(75, 192, 192, 1)'],
                borderWidth: 1,
              },
            ],
          };

          setDashboardData({
            collectionData: collectionDataResponse,
            metrics: metricsResponse,
            underservedAreasCount: underservedAreasCount,
            wasteVolumeChartData: wasteVolumeChartData,
            serviceRequestStatusChartData: serviceRequestStatusChartData,
          });

        } catch (err) {
          console.error('Erreur lors du chargement des données du tableau de bord :', err);
          setError('Impossible de charger toutes les données du tableau de bord. Certaines sections peuvent être vides.');
          setDashboardData(initialDashboardData); // Reset to initial empty state on error
        } finally {
          setLoading(false); // Always set loading to false to show the UI
        }
      }
    };

    // Trigger fetchDashboardData only when authLoading is false, allowing municipalityId to be set
    if (!authLoading) {
      fetchDashboardData();
    }
  }, [municipalityId, authLoading]); // Re-run effect if municipalityId or authLoading changes

  // Always render the container. Loading spinner and error alert are conditional within it.
  return (
    <Container fluid className="py-4">
      {/* Loading Spinner */}
      {(loading || authLoading) && (
        <div className="text-center my-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Chargement du tableau de bord...</span>
          </Spinner>
          <p className="mt-3">Chargement des données du tableau de bord de la municipalité...</p>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <Alert variant="danger" className="my-5">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </Alert>
      )}

      {/* Main Dashboard Content (always rendered, data might be initial/empty on error) */}
      {!loading && ( // Render content only after initial loading phase (even if there's an error)
        <>
          <h2 className="mb-4 text-center">
            <i className="fas fa-city text-primary me-2"></i>
            Tableau de Bord de la Municipalité
            <span className="d-block text-muted small mt-1">{user?.municipalityName || 'Non assignée'}</span>
          </h2>

          {/* Cartes de statistiques clés */}
          <Row className="mb-4">
            <Col md={3} sm={6} className="mb-3">
              <Card className="shadow-sm border-0 h-100 bg-primary text-white">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="text-uppercase mb-0">Total Collections</h6>
                      <h3 className="display-6 fw-bold">{dashboardData.collectionData.totalCollections}</h3>
                    </div>
                    <i className="fas fa-trash-alt fa-3x opacity-50"></i>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} sm={6} className="mb-3">
              <Card className="shadow-sm border-0 h-100 bg-success text-white">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="text-uppercase mb-0">Volume Déchets (kg)</h6>
                      <h3 className="display-6 fw-bold">{dashboardData.collectionData.totalWasteVolumeKg.toFixed(2)}</h3>
                    </div>
                    <i className="fas fa-weight-hanging fa-3x opacity-50"></i>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} sm={6} className="mb-3">
              <Card className="shadow-sm border-0 h-100 bg-info text-white">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="text-uppercase mb-0">Zones Mal Desservies</h6>
                      <h3 className="display-6 fw-bold">{dashboardData.underservedAreasCount}</h3>
                    </div>
                    <i className="fas fa-map-marked-alt fa-3x opacity-50"></i>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} sm={6} className="mb-3">
              <Card className="shadow-sm border-0 h-100 bg-warning text-white">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="text-uppercase mb-0">Collecteurs Actifs</h6>
                      <h3 className="display-6 fw-bold">{dashboardData.metrics.activeCollectors}</h3>
                    </div>
                    <i className="fas fa-users fa-3x opacity-50"></i>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Graphiques et analyses */}
          <Row className="mb-4">
            <Col md={6} className="mb-3">
              <Card className="shadow-sm border-0 h-100">
                <Card.Body>
                  <h5 className="card-title text-center text-primary mb-3">Volume de Déchets par Type</h5>
                  <div style={{ height: '300px' }}>
                    {dashboardData.wasteVolumeChartData.labels.length > 0 ? (
                      <Doughnut data={dashboardData.wasteVolumeChartData} options={wasteVolumeChartOptions} />
                    ) : (
                      <div className="text-center py-5 text-muted">Pas de données de volume disponibles.</div>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} className="mb-3">
              <Card className="shadow-sm border-0 h-100">
                <Card.Body>
                  <h5 className="card-title text-center text-primary mb-3">Statut des Demandes de Service</h5>
                  <div style={{ height: '300px' }}>
                    {dashboardData.serviceRequestStatusChartData.labels.length > 0 ? (
                      <Bar data={dashboardData.serviceRequestStatusChartData} options={serviceRequestStatusOptions} />
                    ) : (
                      <div className="text-center py-5 text-muted">Pas de données de demandes de service disponibles.</div>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Métriques supplémentaires */}
          <Row className="mb-4">
            <Col md={12} className="mb-3">
              <Card className="shadow-sm border-0">
                <Card.Body>
                  <h5 className="card-title text-primary mb-3">Aperçu des Performances</h5>
                  <Row>
                    <Col md={4} className="mb-3">
                      <p className="mb-1">
                        <i className="fas fa-hourglass-half me-2 text-secondary"></i>
                        Temps de Réponse Moyen (Heures):
                      </p>
                      <h4 className="fw-bold text-dark">
                        {dashboardData.metrics.averageResponseTimeHours.toFixed(2)}
                      </h4>
                    </Col>
                    <Col md={4} className="mb-3">
                      <p className="mb-1">
                        <i className="fas fa-star me-2 text-warning"></i>
                        Note Moyenne Collecteurs:
                      </p>
                      <h4 className="fw-bold text-dark">
                        {dashboardData.metrics.averageCollectionRating.toFixed(1)} / 5
                      </h4>
                    </Col>
                    <Col md={4} className="mb-3">
                      <p className="mb-1">
                        <i className="fas fa-frown me-2 text-danger"></i>
                        Litiges Actifs:
                      </p>
                      <h4 className="fw-bold text-dark">
                        {dashboardData.metrics.totalDisputes}
                      </h4>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={4} className="mb-3">
                      <p className="mb-1">
                        <i className="fas fa-home me-2 text-primary"></i>
                        Ménages Totaux:
                      </p>
                      <h4 className="fw-bold text-dark">
                        {dashboardData.metrics.totalHouseholds}
                      </h4>
                    </Col>
                    <Col md={4} className="mb-3">
                      <p className="mb-1">
                        <i className="fas fa-users-line me-2 text-success"></i>
                        Ménages Actifs:
                      </p>
                      <h4 className="fw-bold text-dark">
                        {dashboardData.metrics.activeHouseholds}
                      </h4>
                    </Col>
                    <Col md={4} className="mb-3">
                      <p className="mb-1">
                        <i className="fas fa-truck-pickup me-2 text-info"></i>
                        Collecteurs Totaux:
                      </p>
                      <h4 className="fw-bold text-dark">
                        {dashboardData.metrics.totalCollectors}
                      </h4>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Raccourcis d'action */}
          <Row className="mb-4">
            <Col md={12}>
              <Card className="shadow-sm border-0">
                <Card.Body>
                  <h5 className="card-title text-primary mb-3">Actions Rapides</h5>
                  <Row>
                    <Col md={3} className="mb-3">
                      <button className="btn btn-outline-primary w-100 h-100 d-flex flex-column align-items-center justify-content-center p-3">
                        <i className="fas fa-map-marked-alt fa-2x mb-2"></i>
                        <span>Zones mal desservies</span>
                      </button>
                    </Col>
                    <Col md={3} className="mb-3">
                      <button className="btn btn-outline-success w-100 h-100 d-flex flex-column align-items-center justify-content-center p-3">
                        <i className="fas fa-chart-bar fa-2x mb-2"></i>
                        <span>Suivi des volumes</span>
                      </button>
                    </Col>
                    <Col md={3} className="mb-3">
                      <button className="btn btn-outline-info w-100 h-100 d-flex flex-column align-items-center justify-content-center p-3">
                        <i className="fas fa-file-alt fa-2x mb-2"></i>
                        <span>Générer rapport</span>
                      </button>
                    </Col>
                    <Col md={3} className="mb-3">
                      <button className="btn btn-outline-warning w-100 h-100 d-flex flex-column align-items-center justify-content-center p-3">
                        <i className="fas fa-cog fa-2x mb-2"></i>
                        <span>Paramètres</span>
                      </button>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </Container>
  );
};

export default MunicipalityDashboard;
