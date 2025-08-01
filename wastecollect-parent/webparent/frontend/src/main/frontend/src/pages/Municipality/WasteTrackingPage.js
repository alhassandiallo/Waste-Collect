import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Container,
  Form,
  Button,
  Alert,
  Spinner,
  Badge,
  ProgressBar,
  Table
} from 'react-bootstrap';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
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
import municipalityService from '../../services/municipalityService'; // Changed to municipalityService
import useAuth from '../../hooks/useAuth'; // Import useAuth to get user and municipalityId


// Enregistrement des composants Chart.js
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
 * Composant de suivi des volumes de déchets pour les municipalités
 * Permet de visualiser et analyser les volumes de déchets collectés
 * avec des filtres par période, zone et type de déchet
 */
const WasteVolumeTracking = () => {
  const { user, isLoading: authLoading } = useAuth();
  const municipalityId = user?.municipalityId;

  // États pour la gestion des données et de l'interface
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Define initial state for volume data. This will be used if no data is fetched.
  const initialVolumeData = {
    totalCollections: 0,
    totalWasteVolumeKg: 0,
    averageWastePerCollectionKg: 0,
    pendingServiceRequests: 0,
    completedServiceRequests: 0,
    wasteVolumeByType: {},
    chartLabels: [],
    chartValues: [],
    topCollectors: [
      { id: 1, name: 'Jean Dupont', volume: 1500, rating: 4.8 },
      { id: 2, name: 'Marie Curie', volume: 1200, rating: 4.5 },
      { id: 3, name: 'Pierre Lemaire', volume: 900, rating: 4.2 },
    ],
    areaBreakdown: [
      { id: 1, name: 'Quartier Nord', volume: 2500, percentage: 30 },
      { id: 2, name: 'Centre-Ville', volume: 3500, percentage: 40 },
      { id: 3, name: 'Banlieue Est', volume: 2000, percentage: 20 },
      { id: 4, name: 'Zone Industrielle', volume: 500, percentage: 10 },
    ],
    metrics: {
      activeHouseholds: 'N/A',
      activeCollectors: 'N/A',
      averageCollectionRating: 'N/A',
    }
  };
  const [volumeData, setVolumeData] = useState(initialVolumeData);

  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    wasteType: 'all', // "all", "HOUSEHOLD", "ELECTRONIC", etc.
    area: 'all', // Represents municipality for now, could be sub-areas later
  });

  /**
   * Chargement initial des données de suivi des volumes
   */
  useEffect(() => {
    const fetchWasteVolumeData = async () => {
      setLoading(true); // Start loading for any fetch attempt
      setError(null); // Clear previous errors

      // Check for municipalityId AFTER authLoading has settled
      if (!municipalityId && !authLoading) {
        setError("ID de la municipalité non disponible. Certaines données peuvent être manquantes. Veuillez contacter l'administrateur.");
        setVolumeData(initialVolumeData); // Reset to initial empty state
        setLoading(false); // Stop loading to render the empty UI with the error message
        return; // Exit early as no API call can be made without municipalityId
      }

      // Only attempt to fetch if municipalityId is available
      if (municipalityId) {
        try {
          const now = new Date();
          const defaultEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Last day of current month
          const defaultStartDate = new Date(now.getFullYear(), now.getMonth(), 1); // First day of current month

          const effectiveStartDate = filters.startDate ? new Date(filters.startDate) : defaultStartDate;
          const effectiveEndDate = filters.endDate ? new Date(filters.endDate) : defaultEndDate;

          const formatDateTime = (date) => date.toISOString().slice(0, 19);
          const formattedStartDate = formatDateTime(effectiveStartDate);
          const formattedEndDate = formatDateTime(effectiveEndDate);

          // Call the updated backend service method for waste collection data
          const collectionResponse = await municipalityService.getWasteCollectionData(
            municipalityId,
            formattedStartDate,
            formattedEndDate
          );

          // Optionally, fetch metrics data if needed for this page
          const metricsResponse = await municipalityService.getMetricsAnalysis(
              municipalityId,
              formattedStartDate,
              formattedEndDate
          );

          // Prepare data for the volume by type chart
          const wasteVolumeLabels = Object.keys(collectionResponse.wasteVolumeByType);
          const wasteVolumeValues = Object.values(collectionResponse.wasteVolumeByType);

          setVolumeData(prevData => ({
            ...prevData,
            totalCollections: collectionResponse.totalCollections,
            totalWasteVolumeKg: collectionResponse.totalWasteVolumeKg,
            averageWastePerCollectionKg: collectionResponse.averageWastePerCollectionKg,
            pendingServiceRequests: collectionResponse.pendingServiceRequests,
            completedServiceRequests: collectionResponse.completedServiceRequests,
            wasteVolumeByType: collectionResponse.wasteVolumeByType,
            chartLabels: wasteVolumeLabels,
            chartValues: wasteVolumeValues,
            metrics: { // Update metrics if fetched
              activeHouseholds: metricsResponse.activeHouseholds,
              activeCollectors: metricsResponse.activeCollectors,
              averageCollectionRating: metricsResponse.averageCollectionRating,
            }
          }));

        } catch (err) {
          console.error('Erreur lors du chargement des volumes de déchets :', err);
          setError('Impossible de charger les données de suivi des volumes. Certaines sections peuvent être vides.');
          setVolumeData(initialVolumeData); // Reset to initial empty state on error
        } finally {
          setLoading(false); // Always set loading to false to show the UI
        }
      }
    };

    // Trigger fetchWasteVolumeData only when authLoading is false, allowing municipalityId to be set
    if (!authLoading) {
        fetchWasteVolumeData();
    }
  }, [filters, municipalityId, authLoading]); // Re-fetch when filters or municipalityId change

  /**
   * Gère les changements dans les filtres
   */
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  /**
   * Options pour le graphique des volumes par type de déchet (Doughnut Chart)
   */
  const wasteTypeChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          boxWidth: 20,
          padding: 10,
        },
      },
      title: {
        display: true,
        text: 'Volume de Déchets par Type (kg)',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw;
            const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(2) : 0;
            return `${label}: ${value.toFixed(2)} kg (${percentage}%)`;
          }
        }
      }
    },
  };

  /**
   * Données pour le graphique des volumes par type de déchet (Doughnut Chart)
   */
  const wasteTypeDoughnutData = {
    labels: volumeData.chartLabels,
    datasets: [
      {
        data: volumeData.chartValues,
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#00FF7F', '#8A2BE2', '#DC143C', '#20B2AA'
        ],
        hoverBackgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#00FF7F', '#8A2BE2', '#DC143C', '#20B2AA'
        ],
        borderColor: '#fff',
        borderWidth: 2,
      },
    ],
  };

  /**
   * Options pour le graphique des tendances de volume (Line Chart)
   */
  const wasteTrendLineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Tendances de Volume de Déchets (kg)',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Volume (kg)',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Période',
        },
      },
    },
  };

  /**
   * Données pour le graphique des tendances de volume (Line Chart)
   * Cette partie est actuellement factice car le backend ne fournit pas de tendances agrégées sur le temps.
   * Il faudra adapter cela si l'API backend 'getWasteVolumeTrends' est utilisée.
   */
  const wasteTrendLineData = {
    labels: ['Semaine 1', 'Semaine 2', 'Semaine 3', 'Semaine 4'],
    datasets: [
      {
        label: 'Volume de Déchets (kg)',
        data: [volumeData.totalWasteVolumeKg * 0.2, volumeData.totalWasteVolumeKg * 0.3, volumeData.totalWasteVolumeKg * 0.25, volumeData.totalWasteVolumeKg * 0.25],
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };


  return (
    <Container fluid className="py-4">
      {/* Loading Spinner */}
      {(loading || authLoading) && (
        <div className="text-center my-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Chargement des données de suivi...</span>
          </Spinner>
          <p className="mt-3">Chargement des données de suivi des volumes de déchets...</p>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <Alert variant="danger" className="my-5">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </Alert>
      )}

      {/* Main Waste Tracking Content (always rendered, data might be initial/empty on error) */}
      {!loading && ( // Render content only after initial loading phase (even if there's an error)
        <>
          <h2 className="mb-4 text-center">
            <i className="fas fa-chart-line text-success me-2"></i>
            Suivi des Volumes de Déchets
          </h2>

          {/* Section Filtres */}
          <Card className="shadow-sm mb-4">
            <Card.Body>
              <Card.Title className="text-primary">
                <i className="fas fa-filter me-2"></i>
                Filtres de Données
              </Card.Title>
              <Form>
                <Row className="align-items-end">
                  <Col md={4} className="mb-3">
                    <Form.Group controlId="startDate">
                      <Form.Label>Date de début</Form.Label>
                      <Form.Control
                        type="date"
                        name="startDate"
                        value={filters.startDate}
                        onChange={handleFilterChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4} className="mb-3">
                    <Form.Group controlId="endDate">
                      <Form.Label>Date de fin</Form.Label>
                      <Form.Control
                        type="date"
                        name="endDate"
                        value={filters.endDate}
                        onChange={handleFilterChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4} className="mb-3">
                    <Form.Group controlId="wasteType">
                      <Form.Label>Type de Déchet</Form.Label>
                      <Form.Select
                        name="wasteType"
                        value={filters.wasteType}
                        onChange={handleFilterChange}
                      >
                        <option value="all">Tous les types</option>
                        <option value="HOUSEHOLD">Ménager</option>
                        <option value="ELECTRONIC">Électronique</option>
                        <option value="ORGANIC">Organique</option>
                        <option value="PAPER">Papier</option>
                        <option value="PLASTIC">Plastique</option>
                        <option value="METAL">Métal</option>
                        <option value="GLASS">Verre</option>
                        <option value="BULK">Encombrants</option>
                        <option value="HAZARDOUS">Dangereux</option>
                        <option value="GENERAL">Général</option>
                        <option value="OTHER">Autre</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>

          {/* Cartes récapitulatives */}
          <Row className="mb-4">
            <Col md={4} className="mb-3">
              <Card className="shadow-sm border-start border-primary border-4 h-100">
                <Card.Body>
                  <h6 className="text-muted text-uppercase">Collectes Totales</h6>
                  <h3 className="display-5 fw-bold text-primary">
                    {volumeData.totalCollections}
                  </h3>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-3">
              <Card className="shadow-sm border-start border-success border-4 h-100">
                <Card.Body>
                  <h6 className="text-muted text-uppercase">Volume Total Collecté (kg)</h6>
                  <h3 className="display-5 fw-bold text-success">
                    {volumeData.totalWasteVolumeKg.toFixed(2)}
                  </h3>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-3">
              <Card className="shadow-sm border-start border-info border-4 h-100">
                <Card.Body>
                  <h6 className="text-muted text-uppercase">Moyenne par Collecte (kg)</h6>
                  <h3 className="display-5 fw-bold text-info">
                    {volumeData.averageWastePerCollectionKg.toFixed(2)}
                  </h3>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Graphiques */}
          <Row className="mb-4">
            <Col md={6} className="mb-3">
              <Card className="shadow-sm h-100">
                <Card.Body>
                  {volumeData.chartLabels.length > 0 ? (
                    <Doughnut data={wasteTypeDoughnutData} options={wasteTypeChartOptions} />
                  ) : (
                    <div className="text-center py-5 text-muted">Pas de données de volume par type.</div>
                  )}
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} className="mb-3">
              <Card className="shadow-sm h-100">
                <Card.Body>
                  <Line data={wasteTrendLineData} options={wasteTrendLineOptions} />
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Statistiques détaillées et actions rapides */}
          <Row>
            <Col md={12}>
              <Card className="shadow-sm">
                <Card.Body>
                  <h5 className="card-title text-primary mb-3">Statistiques Détaillées</h5>
                  <Row>
                    <Col md={4}>
                      <ul className="list-unstyled">
                        <li className="mb-2">
                          <i className="fas fa-hourglass-half text-warning me-2"></i>
                          Demandes en attente : <strong>{volumeData.pendingServiceRequests}</strong>
                        </li>
                        <li className="mb-2">
                          <i className="fas fa-check-circle text-success me-2"></i>
                          Demandes complétées : <strong>{volumeData.completedServiceRequests}</strong>
                        </li>
                        <li className="mb-2">
                          <i className="fas fa-home text-primary me-2"></i>
                          Ménages actifs : <strong>{volumeData.metrics?.activeHouseholds || 'N/A'}</strong> {/* Access from metrics if available */}
                        </li>
                      </ul>
                    </Col>
                    <Col md={4}>
                      <ul className="list-unstyled">
                        <li className="mb-2">
                          <i className="fas fa-users text-info me-2"></i>
                          Nombre de collecteurs actifs : <strong>{volumeData.metrics?.activeCollectors || 'N/A'}</strong>
                        </li>
                        <li className="mb-2">
                          <i className="fas fa-map-marked-alt text-warning me-2"></i>
                          Zones couvertes : <strong>{volumeData.areaBreakdown.length}</strong> {/* This is still dummy, needs backend */}
                        </li>
                        <li className="mb-2">
                          <i className="fas fa-star text-warning me-2"></i>
                          Note moyenne des collecteurs : <strong>
                            {
                              typeof volumeData.metrics?.averageCollectionRating === 'number'
                                ? volumeData.metrics.averageCollectionRating.toFixed(1)
                                : 'N/A'
                            }
                          </strong>
                        </li>
                      </ul>
                    </Col>
                    <Col md={4}>
                      <h6 className="text-primary">Actions rapides :</h6>
                      <div className="d-grid gap-2">
                        <Button variant="outline-primary" size="sm">
                          <i className="fas fa-download me-2"></i>
                          Exporter les données
                        </Button>
                        <Button variant="outline-success" size="sm">
                          <i className="fas fa-file-pdf me-2"></i>
                          Générer rapport
                        </Button>
                        <Button variant="outline-info" size="sm">
                          <i className="fas fa-share-alt me-2"></i>
                          Partager l'analyse
                        </Button>
                      </div>
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

export default WasteVolumeTracking;
