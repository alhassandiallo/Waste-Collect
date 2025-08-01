import React, { useState, useEffect } from 'react';
import { Card, Container, Row, Col, Form, Button, Table, Alert, Spinner } from 'react-bootstrap';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import statisticsService from '../../services/statisticsService';

/**
 * Composant PeriodStatistics - Gestion et affichage des statistiques périodiques
 * Ce composant permet aux utilisateurs (Admin, Municipalité) de visualiser
 * les statistiques de collecte de déchets sur différentes périodes
 */
const PeriodStatistics = () => {
    // États pour la gestion des données et de l'interface
    const [statistics, setStatistics] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedPeriod, setSelectedPeriod] = useState('MONTHLY'); // DAILY, WEEKLY, MONTHLY, YEARLY
    const [dateRange, setDateRange] = useState({
        startDate: new Date(new Date().getFullYear(), new Date().getMonth() - 3, 1).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    });
    const [selectedMetrics, setSelectedMetrics] = useState(['collections', 'volume', 'revenue']);
    const [municipalityFilter, setMunicipalityFilter] = useState('');
    const [municipalities, setMunicipalities] = useState([]);

    // Couleurs pour les graphiques
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

    /**
     * Effet pour charger les données initiales au montage du composant
     */
    useEffect(() => {
        loadMunicipalities();
        loadStatistics();
    }, []);

    /**
     * Effet pour recharger les statistiques quand les filtres changent
     */
    useEffect(() => {
        if (dateRange.startDate && dateRange.endDate) {
            loadStatistics();
        }
    }, [selectedPeriod, dateRange, municipalityFilter]);

    /**
     * Charge la liste des municipalités pour le filtre
     */
    const loadMunicipalities = async () => {
        try {
            const data = await statisticsService.getMunicipalities();
            setMunicipalities(data);
        } catch (error) {
            console.error('Erreur lors du chargement des municipalités:', error);
        }
    };

    /**
     * Charge les statistiques selon les filtres sélectionnés
     */
    const loadStatistics = async () => {
        setLoading(true);
        setError('');
        
        try {
            const params = {
                period: selectedPeriod,
                startDate: dateRange.startDate,
                endDate: dateRange.endDate,
                municipalityId: municipalityFilter || null,
                metrics: selectedMetrics
            };

            const data = await statisticsService.getPeriodStatistics(params);
            setStatistics(data);
        } catch (error) {
            setError('Erreur lors du chargement des statistiques: ' + error.message);
            console.error('Erreur:', error);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Gère le changement de période sélectionnée
     */
    const handlePeriodChange = (event) => {
        setSelectedPeriod(event.target.value);
    };

    /**
     * Gère le changement de plage de dates
     */
    const handleDateRangeChange = (field, value) => {
        setDateRange(prev => ({
            ...prev,
            [field]: value
        }));
    };

    /**
     * Gère la sélection/désélection des métriques à afficher
     */
    const handleMetricToggle = (metric) => {
        setSelectedMetrics(prev => 
            prev.includes(metric) 
                ? prev.filter(m => m !== metric)
                : [...prev, metric]
        );
    };

    /**
     * Formate les données pour les graphiques temporels
     */
    const formatTimeSeriesData = () => {
        if (!statistics?.timeSeries) return [];
        
        return statistics.timeSeries.map(item => ({
            period: item.period,
            collections: item.totalCollections,
            volume: item.totalVolume,
            revenue: item.totalRevenue,
            households: item.activeHouseholds,
            collectors: item.activeCollectors
        }));
    };

    /**
     * Formate les données pour le graphique de répartition par type de déchet
     */
    const formatWasteTypeData = () => {
        if (!statistics?.wasteTypeBreakdown) return [];
        
        return statistics.wasteTypeBreakdown.map((item, index) => ({
            name: item.wasteType,
            value: item.volume,
            percentage: item.percentage,
            fill: COLORS[index % COLORS.length]
        }));
    };

    /**
     * Calcule les statistiques de performance
     */
    const calculatePerformanceMetrics = () => {
        if (!statistics?.summary) return {};
        
        const current = statistics.summary;
        const previous = statistics.previousPeriod;
        
        return {
            collectionsGrowth: previous ? ((current.totalCollections - previous.totalCollections) / previous.totalCollections * 100).toFixed(1) : 0,
            volumeGrowth: previous ? ((current.totalVolume - previous.totalVolume) / previous.totalVolume * 100).toFixed(1) : 0,
            revenueGrowth: previous ? ((current.totalRevenue - previous.totalRevenue) / previous.totalRevenue * 100).toFixed(1) : 0,
            efficiencyRate: (current.successfulCollections / current.totalCollections * 100).toFixed(1)
        };
    };

    const performanceMetrics = calculatePerformanceMetrics();

    return (
        <Container fluid className="py-4">
            {/* En-tête avec titre et contrôles de filtre */}
            <Row className="mb-4">
                <Col>
                    <h2 className="text-primary">
                        <i className="fas fa-chart-line me-2"></i>
                        Statistiques Périodiques
                    </h2>
                    <p className="text-muted">
                        Analyse détaillée des performances de collecte sur différentes périodes
                    </p>
                </Col>
            </Row>

            {/* Panneau de filtres */}
            <Card className="mb-4">
                <Card.Header>
                    <h5 className="mb-0">
                        <i className="fas fa-filter me-2"></i>
                        Filtres et Options
                    </h5>
                </Card.Header>
                <Card.Body>
                    <Row>
                        {/* Sélection de la période */}
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label>Période d'analyse</Form.Label>
                                <Form.Select 
                                    value={selectedPeriod} 
                                    onChange={handlePeriodChange}
                                >
                                    <option value="DAILY">Quotidienne</option>
                                    <option value="WEEKLY">Hebdomadaire</option>
                                    <option value="MONTHLY">Mensuelle</option>
                                    <option value="YEARLY">Annuelle</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>

                        {/* Plage de dates */}
                        <Col md={4}>
                            <Row>
                                <Col>
                                    <Form.Group>
                                        <Form.Label>Date de début</Form.Label>
                                        <Form.Control 
                                            type="date"
                                            value={dateRange.startDate}
                                            onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col>
                                    <Form.Group>
                                        <Form.Label>Date de fin</Form.Label>
                                        <Form.Control 
                                            type="date"
                                            value={dateRange.endDate}
                                            onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Col>

                        {/* Filtre par municipalité */}
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label>Municipalité</Form.Label>
                                <Form.Select 
                                    value={municipalityFilter}
                                    onChange={(e) => setMunicipalityFilter(e.target.value)}
                                >
                                    <option value="">Toutes les municipalités</option>
                                    {municipalities.map(municipality => (
                                        <option key={municipality.id} value={municipality.id}>
                                            {municipality.name}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>

                        {/* Bouton de mise à jour */}
                        <Col md={2} className="d-flex align-items-end">
                            <Button 
                                variant="primary" 
                                onClick={loadStatistics}
                                disabled={loading}
                                className="w-100"
                            >
                                {loading ? (
                                    <>
                                        <Spinner animation="border" size="sm" className="me-2" />
                                        Chargement...
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-sync-alt me-2"></i>
                                        Actualiser
                                    </>
                                )}
                            </Button>
                        </Col>
                    </Row>

                    {/* Sélection des métriques à afficher */}
                    <Row className="mt-3">
                        <Col>
                            <Form.Label>Métriques à afficher:</Form.Label>
                            <div className="d-flex flex-wrap gap-3 mt-2">
                                {[
                                    { key: 'collections', label: 'Collectes', icon: 'fas fa-truck' },
                                    { key: 'volume', label: 'Volume', icon: 'fas fa-weight' },
                                    { key: 'revenue', label: 'Revenus', icon: 'fas fa-coins' },
                                    { key: 'households', label: 'Ménages actifs', icon: 'fas fa-home' },
                                    { key: 'collectors', label: 'Collecteurs actifs', icon: 'fas fa-users' }
                                ].map(metric => (
                                    <Form.Check
                                        key={metric.key}
                                        type="checkbox"
                                        id={`metric-${metric.key}`}
                                        label={
                                            <span>
                                                <i className={`${metric.icon} me-2`}></i>
                                                {metric.label}
                                            </span>
                                        }
                                        checked={selectedMetrics.includes(metric.key)}
                                        onChange={() => handleMetricToggle(metric.key)}
                                    />
                                ))}
                            </div>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Affichage des erreurs */}
            {error && (
                <Alert variant="danger" className="mb-4">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    {error}
                </Alert>
            )}

            {/* Indicateurs de performance clés */}
            {statistics?.summary && (
                <Row className="mb-4">
                    <Col md={3}>
                        <Card className="bg-primary text-white">
                            <Card.Body>
                                <div className="d-flex justify-content-between">
                                    <div>
                                        <h6 className="card-title">Total Collectes</h6>
                                        <h3>{statistics.summary.totalCollections?.toLocaleString()}</h3>
                                        {performanceMetrics.collectionsGrowth !== 0 && (
                                            <small className={`d-flex align-items-center ${performanceMetrics.collectionsGrowth > 0 ? 'text-success' : 'text-danger'}`}>
                                                <i className={`fas fa-arrow-${performanceMetrics.collectionsGrowth > 0 ? 'up' : 'down'} me-1`}></i>
                                                {Math.abs(performanceMetrics.collectionsGrowth)}%
                                            </small>
                                        )}
                                    </div>
                                    <i className="fas fa-truck fa-2x opacity-50"></i>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className="bg-success text-white">
                            <Card.Body>
                                <div className="d-flex justify-content-between">
                                    <div>
                                        <h6 className="card-title">Volume Total (kg)</h6>
                                        <h3>{statistics.summary.totalVolume?.toLocaleString()}</h3>
                                        {performanceMetrics.volumeGrowth !== 0 && (
                                            <small className={`d-flex align-items-center ${performanceMetrics.volumeGrowth > 0 ? 'text-success' : 'text-danger'}`}>
                                                <i className={`fas fa-arrow-${performanceMetrics.volumeGrowth > 0 ? 'up' : 'down'} me-1`}></i>
                                                {Math.abs(performanceMetrics.volumeGrowth)}%
                                            </small>
                                        )}
                                    </div>
                                    <i className="fas fa-weight fa-2x opacity-50"></i>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className="bg-warning text-white">
                            <Card.Body>
                                <div className="d-flex justify-content-between">
                                    <div>
                                        <h6 className="card-title">Revenus Totaux</h6>
                                        <h3>{statistics.summary.totalRevenue?.toLocaleString()} GNF</h3>
                                        {performanceMetrics.revenueGrowth !== 0 && (
                                            <small className={`d-flex align-items-center ${performanceMetrics.revenueGrowth > 0 ? 'text-success' : 'text-danger'}`}>
                                                <i className={`fas fa-arrow-${performanceMetrics.revenueGrowth > 0 ? 'up' : 'down'} me-1`}></i>
                                                {Math.abs(performanceMetrics.revenueGrowth)}%
                                            </small>
                                        )}
                                    </div>
                                    <i className="fas fa-coins fa-2x opacity-50"></i>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className="bg-info text-white">
                            <Card.Body>
                                <div className="d-flex justify-content-between">
                                    <div>
                                        <h6 className="card-title">Taux d'Efficacité</h6>
                                        <h3>{performanceMetrics.efficiencyRate}%</h3>
                                        <small>Collectes réussies</small>
                                    </div>
                                    <i className="fas fa-chart-line fa-2x opacity-50"></i>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            )}

            {/* Graphiques et visualisations */}
            {statistics && (
                <Row>
                    {/* Graphique temporel des tendances */}
                    <Col lg={8} className="mb-4">
                        <Card>
                            <Card.Header>
                                <h5 className="mb-0">
                                    <i className="fas fa-chart-line me-2"></i>
                                    Évolution Temporelle des Métriques
                                </h5>
                            </Card.Header>
                            <Card.Body>
                                <div style={{ width: '100%', height: 400 }}>
                                    <ResponsiveContainer>
                                        <LineChart data={formatTimeSeriesData()}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis 
                                                dataKey="period" 
                                                tick={{ fontSize: 12 }}
                                            />
                                            <YAxis tick={{ fontSize: 12 }} />
                                            <Tooltip 
                                                formatter={(value, name) => [
                                                    name === 'revenue' ? `${value?.toLocaleString()} GNF` : value?.toLocaleString(),
                                                    name === 'collections' ? 'Collectes' :
                                                    name === 'volume' ? 'Volume (kg)' :
                                                    name === 'revenue' ? 'Revenus' :
                                                    name === 'households' ? 'Ménages actifs' :
                                                    name === 'collectors' ? 'Collecteurs actifs' : name
                                                ]}
                                            />
                                            <Legend />
                                            {selectedMetrics.includes('collections') && (
                                                <Line 
                                                    type="monotone" 
                                                    dataKey="collections" 
                                                    stroke="#8884d8" 
                                                    strokeWidth={2}
                                                    name="Collectes"
                                                />
                                            )}
                                            {selectedMetrics.includes('volume') && (
                                                <Line 
                                                    type="monotone" 
                                                    dataKey="volume" 
                                                    stroke="#82ca9d" 
                                                    strokeWidth={2}
                                                    name="Volume (kg)"
                                                />
                                            )}
                                            {selectedMetrics.includes('revenue') && (
                                                <Line 
                                                    type="monotone" 
                                                    dataKey="revenue" 
                                                    stroke="#ffc658" 
                                                    strokeWidth={2}
                                                    name="Revenus"
                                                />
                                            )}
                                            {selectedMetrics.includes('households') && (
                                                <Line 
                                                    type="monotone" 
                                                    dataKey="households" 
                                                    stroke="#ff7300" 
                                                    strokeWidth={2}
                                                    name="Ménages actifs"
                                                />
                                            )}
                                            {selectedMetrics.includes('collectors') && (
                                                <Line 
                                                    type="monotone" 
                                                    dataKey="collectors" 
                                                    stroke="#00c49f" 
                                                    strokeWidth={2}
                                                    name="Collecteurs actifs"
                                                />
                                            )}
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* Graphique de répartition par type de déchet */}
                    <Col lg={4} className="mb-4">
                        <Card>
                            <Card.Header>
                                <h5 className="mb-0">
                                    <i className="fas fa-chart-pie me-2"></i>
                                    Répartition par Type de Déchet
                                </h5>
                            </Card.Header>
                            <Card.Body>
                                <div style={{ width: '100%', height: 400 }}>
                                    <ResponsiveContainer>
                                        <PieChart>
                                            <Pie
                                                data={formatWasteTypeData()}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, percentage }) => `${name}: ${percentage}%`}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {formatWasteTypeData().map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value) => [`${value.toLocaleString()} kg`, 'Volume']} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            )}

            {/* Tableau détaillé des statistiques */}
            {statistics?.detailedBreakdown && (
                <Card className="mb-4">
                    <Card.Header>
                        <h5 className="mb-0">
                            <i className="fas fa-table me-2"></i>
                            Détail des Statistiques par Période
                        </h5>
                    </Card.Header>
                    <Card.Body>
                        <div className="table-responsive">
                            <Table striped bordered hover>
                                <thead className="table-dark">
                                    <tr>
                                        <th>Période</th>
                                        <th>Collectes</th>
                                        <th>Volume (kg)</th>
                                        <th>Revenus (GNF)</th>
                                        <th>Ménages Actifs</th>
                                        <th>Collecteurs Actifs</th>
                                        <th>Taux de Réussite</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {statistics.detailedBreakdown.map((item, index) => (
                                        <tr key={index}>
                                            <td className="fw-bold">{item.period}</td>
                                            <td>{item.totalCollections?.toLocaleString()}</td>
                                            <td>{item.totalVolume?.toLocaleString()}</td>
                                            <td>{item.totalRevenue?.toLocaleString()}</td>
                                            <td>{item.activeHouseholds?.toLocaleString()}</td>
                                            <td>{item.activeCollectors?.toLocaleString()}</td>
                                            <td>
                                                <span className={`badge ${item.successRate >= 80 ? 'bg-success' : item.successRate >= 60 ? 'bg-warning' : 'bg-danger'}`}>
                                                    {item.successRate}%
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    </Card.Body>
                </Card>
            )}

            {/* Message quand aucune donnée n'est disponible */}
            {!loading && !statistics && (
                <Card>
                    <Card.Body className="text-center py-5">
                        <i className="fas fa-chart-line fa-3x text-muted mb-3"></i>
                        <h5 className="text-muted">Aucune statistique disponible</h5>
                        <p className="text-muted">
                            Veuillez sélectionner une période et des filtres pour afficher les statistiques.
                        </p>
                        <Button variant="primary" onClick={loadStatistics}>
                            <i className="fas fa-sync-alt me-2"></i>
                            Charger les statistiques
                        </Button>
                    </Card.Body>
                </Card>
            )}
        </Container>
    );
};

export default PeriodStatistics;