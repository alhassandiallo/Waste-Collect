import React, { useState, useEffect } from 'react';
import { 
    Container, 
    Row, 
    Col, 
    Card, 
    Form, 
    Button, 
    Table, 
    Alert, 
    Spinner,
    Modal,
    Badge,
    Dropdown,
    InputGroup,
    FormControl,
    Pagination
} from 'react-bootstrap';
import { 
    FaFileDownload, 
    FaFilter, 
    FaEye, 
    FaChartBar, 
    FaCalendarAlt,
    FaSearch,
    FaFilePdf,
    FaFileExcel,
    FaPrint
} from 'react-icons/fa';
import { useNavigate, Link } from 'react-router-dom'; // Import useNavigate and Link
import adminService from '../../services/adminService'; 
import useAuth from '../../hooks/useAuth';

/**
 * ReportsPage - Page de génération et gestion des rapports pour les administrateurs
 * * Cette page permet aux administrateurs de :
 * - Générer des rapports automatisés sur différentes périodes
 * - Filtrer les rapports par type, période, municipalité, collecteur
 * - Visualiser les données sous forme de tableaux et graphiques
 * - Exporter les rapports en différents formats (PDF, Excel)
 * - Analyser les performances globales du système
 */
const ReportsPage = () => {
    const navigate = useNavigate(); // Initialize useNavigate

    // Récupération du contexte d'authentification
    const { user } = useAuth();

    // États pour la gestion des données
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);

    // États pour le formulaire de génération de rapport
    const [reportConfig, setReportConfig] = useState({
        title: '',
        type: 'performance', // Default type
        period: 'monthly', // Default period
        includeCharts: true,
        format: 'pdf', // Default format
        municipalityId: '', // Optional filter
        collectorId: '',    // Optional filter
        startDate: '',      // Optional date filter
        endDate: '',        // Optional date filter
    });

    // États pour les filtres d'affichage des rapports existants
    const [filterReportType, setFilterReportType] = useState('');
    const [filterReportStatus, setFilterReportStatus] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    // Données mock pour les dropdowns de filtres (à remplacer par des appels API réels)
    const [municipalities, setMunicipalities] = useState([]);
    const [collectors, setCollectors] = useState([]);

    // Pagination
    const [currentPage, setCurrentPage] = useState(0); // 0-indexed for backend
    const [reportsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);

    /**
     * Effet pour charger les rapports et les listes de filtres au montage
     */
    useEffect(() => {
        fetchReports();
        fetchFilterOptions(); // Fetch municipalities and collectors for dropdowns
    }, [currentPage, filterReportType, filterReportStatus, searchQuery]);

    /**
     * Récupère la liste des rapports depuis l'API
     */
    const fetchReports = async () => {
        setLoading(true);
        setError(null);
        try {
            const filters = {
                type: filterReportType,
                status: filterReportStatus,
                search: searchQuery,
            };
            // Corrected: Use adminService.getGeneratedReports instead of getAllReports
            // Pass filters as a single object, and pagination parameters separately
            const { content, totalElements } = await adminService.getGeneratedReports(filters, currentPage, reportsPerPage);
            setReports(content || []); // Ensure reports is always an array
            setTotalItems(totalElements || 0); // Ensure totalItems is always a number
            setLoading(false);
        } catch (err) {
            console.error("Erreur lors de la récupération des rapports:", err);
            setError("Erreur lors du chargement des rapports. " + (err.message || ""));
            setLoading(false);
        }
    };

    /**
     * Récupère les options pour les filtres (municipalités, collecteurs)
     */
    const fetchFilterOptions = async () => {
        try {
            // Fetch municipalities
            const municipalitiesResponse = await adminService.getAllMunicipalities({ page: 0, limit: 1000 }); // Changed to 0-indexed page
            setMunicipalities(municipalitiesResponse.content || []); // Ensure it's an array

            // Fetch collectors
            const collectorsResponse = await adminService.getAllCollectors({ page: 0, limit: 1000 }); // Changed to 0-indexed page
            setCollectors(collectorsResponse.content || []); // Ensure it's an array
        } catch (err) {
            console.error("Erreur lors du chargement des options de filtre:", err);
            // Optionally set specific error for filter options
        }
    };

    /**
     * Gère le changement des champs du formulaire de configuration de rapport
     * @param {Object} e - Événement de changement
     */
    const handleConfigChange = (e) => {
        const { name, value, type, checked } = e.target;
        setReportConfig(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    /**
     * Gère la soumission du formulaire pour générer un nouveau rapport
     * @param {Object} e - Événement de soumission
     */
    const handleGenerateReport = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            // Add generatedBy information from the logged-in user
            const configToSend = {
                ...reportConfig,
                generatedBy: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.email || 'Admin Inconnu',
            };
            await adminService.generateReport(configToSend);
            setSuccess("Rapport demandé avec succès ! Il apparaîtra bientôt dans la liste.");
            // Reset form
            setReportConfig({
                title: '',
                type: 'performance',
                period: 'monthly',
                includeCharts: true,
                format: 'pdf',
                municipalityId: '',
                collectorId: '',
                startDate: '',
                endDate: '',
            });
            fetchReports(); // Refresh list after generation request
        } catch (err) {
            console.error("Erreur lors de la génération du rapport:", err);
            setError("Erreur lors de la génération du rapport : " + (err.response?.data?.message || err.message || ""));
        } finally {
            setLoading(false);
        }
    };

    /**
     * Ouvre la modale pour visualiser les détails d'un rapport
     * @param {Object} report - Le rapport sélectionné
     */
    const viewReportDetails = (report) => {
        setSelectedReport(report);
        setShowModal(true);
    };

    /**
     * Simule le téléchargement d'un rapport
     * @param {Long} reportId - ID du rapport à télécharger
     */
    const downloadReport = async (reportId) => {
        setLoading(true);
        setError(null);
        try {
            // In a real app, this would trigger a backend endpoint to serve the file
            // Corrected: Use adminService.downloadReport
            const fileBlob = await adminService.downloadReport(reportId);
            // Create a Blob URL and trigger download
            const url = window.URL.createObjectURL(new Blob([fileBlob]));
            const link = document.createElement('a');
            link.href = url;
            // Determine filename based on report properties, or a generic name
            const filename = selectedReport ? `${selectedReport.title.replace(/\s/g, '_')}.${selectedReport.format}` : `report_${reportId}.pdf`;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url); // Clean up the URL object

            setSuccess(`Rapport ${reportId} téléchargé avec succès !`);
        } catch (err) {
            console.error("Erreur lors du téléchargement du rapport:", err);
            setError("Erreur lors du téléchargement du rapport. " + (err.response?.data?.message || err.message || ""));
        } finally {
            setLoading(false);
        }
    };

    // Pagination logic
    const currentReports = reports; // The backend should handle pagination, so 'reports' should already be paginated content

    const totalPages = Math.ceil(totalItems / reportsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const renderPagination = () => {
        const pageNumbers = [];
        const maxPageButtons = 5; 
        let startPage = Math.max(0, currentPage - Math.floor(maxPageButtons / 2)); // Adjusted for 0-indexed page
        let endPage = Math.min(totalPages - 1, startPage + maxPageButtons - 1); // Adjusted for 0-indexed page and totalPages

        if (endPage - startPage + 1 < maxPageButtons) {
          startPage = Math.max(0, endPage - maxPageButtons + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(
                <Pagination.Item key={i} active={i === currentPage} onClick={() => paginate(i)}>
                    {i + 1} {/* Display 1-indexed page number to user */}
                </Pagination.Item>
            );
        }
        return (
            <Pagination className="justify-content-center mt-3">
                <Pagination.Prev onClick={() => paginate(currentPage - 1)} disabled={currentPage === 0} />
                {pageNumbers}
                <Pagination.Next onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages - 1} />
            </Pagination>
        );
    };


    return (
        <Container className="my-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="mb-0">
                    <FaChartBar className="me-2" />
                    Gestion des Rapports
                </h2>
                <div>
                    <Button variant="outline-secondary" onClick={() => navigate(-1)} className="me-2">
                        Retour
                    </Button>
                    <Button variant="outline-primary" onClick={() => navigate('/admin/dashboard')}>
                        Retour au Tableau de Bord
                    </Button>
                </div>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}

            {/* Section pour la Génération de Nouveaux Rapports */}
            <Card className="shadow-sm mb-4">
                <Card.Header className="bg-primary text-white">
                    <h5><FaFilePdf className="me-2" /> Générer un Nouveau Rapport</h5>
                </Card.Header>
                <Card.Body>
                    <Form onSubmit={handleGenerateReport}>
                        <Row className="mb-3">
                            <Form.Group as={Col} controlId="reportTitle">
                                <Form.Label>Titre du Rapport</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="title"
                                    value={reportConfig.title}
                                    onChange={handleConfigChange}
                                    placeholder="Ex: Rapport de Performance Mensuel"
                                    required
                                    disabled={loading}
                                />
                            </Form.Group>
                            <Form.Group as={Col} controlId="reportType">
                                <Form.Label>Type de Rapport</Form.Label>
                                <Form.Select
                                    name="type"
                                    value={reportConfig.type}
                                    onChange={handleConfigChange}
                                    required
                                    disabled={loading}
                                >
                                    <option value="performance">Performance</option>
                                    <option value="collections">Collectes</option>
                                    <option value="financial">Financier</option>
                                    <option value="predictive">Prédictif</option>
                                    <option value="user_engagement">Engagement Utilisateur</option>
                                </Form.Select>
                            </Form.Group>
                            <Form.Group as={Col} controlId="reportPeriod">
                                <Form.Label>Période</Form.Label>
                                <Form.Select
                                    name="period"
                                    value={reportConfig.period}
                                    onChange={handleConfigChange}
                                    required
                                    disabled={loading}
                                >
                                    <option value="daily">Journalier</option>
                                    <option value="weekly">Hebdomadaire</option>
                                    <option value="monthly">Mensuel</option>
                                    <option value="quarterly">Trimestriel</option>
                                    <option value="yearly">Annuel</option>
                                    <option value="custom">Personnalisé</option>
                                </Form.Select>
                            </Form.Group>
                        </Row>

                        {reportConfig.period === 'custom' && (
                            <Row className="mb-3">
                                <Form.Group as={Col} controlId="startDate">
                                    <Form.Label>Date de Début</Form.Label>
                                    <Form.Control
                                        type="date"
                                        name="startDate"
                                        value={reportConfig.startDate}
                                        onChange={handleConfigChange}
                                        disabled={loading}
                                    />
                                </Form.Group>
                                <Form.Group as={Col} controlId="endDate">
                                    <Form.Label>Date de Fin</Form.Label>
                                    <Form.Control
                                        type="date"
                                        name="endDate"
                                        value={reportConfig.endDate}
                                        onChange={handleConfigChange}
                                        disabled={loading}
                                    />
                                </Form.Group>
                            </Row>
                        )}

                        <Row className="mb-3">
                            <Form.Group as={Col} controlId="reportFormat">
                                <Form.Label>Format</Form.Label>
                                <Form.Select
                                    name="format"
                                    value={reportConfig.format}
                                    onChange={handleConfigChange}
                                    required
                                    disabled={loading}
                                >
                                    <option value="pdf">PDF</option>
                                    <option value="excel">Excel</option>
                                    <option value="csv">CSV</option>
                                </Form.Select>
                            </Form.Group>
                            <Form.Group as={Col} controlId="includeCharts">
                                <Form.Check
                                    type="checkbox"
                                    label="Inclure les graphiques"
                                    name="includeCharts"
                                    checked={reportConfig.includeCharts}
                                    onChange={handleConfigChange}
                                    disabled={loading}
                                    className="mt-4"
                                />
                            </Form.Group>
                        </Row>

                        <Row className="mb-3">
                            <Form.Group as={Col} controlId="filterMunicipality">
                                <Form.Label>Municipalité (Optionnel)</Form.Label>
                                <Form.Select
                                    name="municipalityId"
                                    value={reportConfig.municipalityId}
                                    onChange={handleConfigChange}
                                    disabled={loading}
                                >
                                    <option value="">Toutes les municipalités</option>
                                    {municipalities && municipalities.map(m => ( // Added conditional check
                                        <option key={m.id} value={m.id}>{m.municipalityName}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                            <Form.Group as={Col} controlId="filterCollector">
                                <Form.Label>Collecteur (Optionnel)</Form.Label>
                                <Form.Select
                                    name="collectorId"
                                    value={reportConfig.collectorId}
                                    onChange={handleConfigChange}
                                    disabled={loading}
                                >
                                    <option value="">Tous les collecteurs</option>
                                    {collectors && collectors.map(c => ( // Added conditional check
                                        <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Row>

                        <Button variant="primary" type="submit" disabled={loading}>
                            {loading ? (
                                <>
                                    <Spinner animation="border" size="sm" className="me-2" />
                                    Génération...
                                </>
                            ) : (
                                <>
                                    <FaFileDownload className="me-2" />
                                    Générer le Rapport
                                </>
                            )}
                        </Button>
                    </Form>
                </Card.Body>
            </Card>

            {/* Section pour la Liste des Rapports Générés */}
            <Card className="shadow-sm mt-4">
                <Card.Header className="bg-secondary text-white d-flex justify-content-between align-items-center">
                    <h5><FaFileExcel className="me-2" /> Rapports Générés</h5>
                    <InputGroup className="w-auto">
                        <FormControl
                            placeholder="Rechercher des rapports..."
                            aria-label="Rechercher des rapports"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Button variant="light" onClick={fetchReports}>
                            <FaSearch />
                        </Button>
                        <Dropdown>
                            <Dropdown.Toggle variant="light" id="dropdown-filter">
                                <FaFilter className="me-1" /> Filtrer
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                <Dropdown.Item onClick={() => setFilterReportType('')}>Tous les types</Dropdown.Item>
                                <Dropdown.Item onClick={() => setFilterReportType('performance')}>Performance</Dropdown.Item>
                                <Dropdown.Item onClick={() => setFilterReportType('collections')}>Collectes</Dropdown.Item>
                                <Dropdown.Item onClick={() => setFilterReportType('financial')}>Financier</Dropdown.Item>
                                <Dropdown.Divider />
                                <Dropdown.Item onClick={() => setFilterReportStatus('')}>Tous les statuts</Dropdown.Item>
                                <Dropdown.Item onClick={() => setFilterReportStatus('completed')}>Terminé</Dropdown.Item>
                                <Dropdown.Item onClick={() => setFilterReportStatus('processing')}>En cours</Dropdown.Item>
                                <Dropdown.Item onClick={() => setFilterReportStatus('failed')}>Échec</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </InputGroup>
                </Card.Header>
                <Card.Body>
                    {loading && reports.length === 0 ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="primary" />
                            <p className="mt-2">Chargement des rapports...</p>
                        </div>
                    ) : reports.length === 0 ? (
                        <Alert variant="info" className="text-center">Aucun rapport trouvé avec les filtres actuels.</Alert>
                    ) : (
                        <Table striped bordered hover responsive className="text-center">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Titre</th>
                                    <th>Type</th>
                                    <th>Période</th>
                                    <th>Date Génération</th>
                                    <th>Statut</th>
                                    <th>Format</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentReports.map(report => (
                                    <tr key={report.id}>
                                        <td>{report.id}</td>
                                        <td>{report.title}</td>
                                        <td>{report.type}</td>
                                        <td>{report.period}</td>
                                        <td>{new Date(report.generatedDate).toLocaleDateString()}</td>
                                        <td>
                                            <Badge bg={
                                                report.status === 'completed' ? 'success' :
                                                report.status === 'processing' ? 'warning' : 'danger'
                                            }>
                                                {report.status}
                                            </Badge>
                                        </td>
                                        <td>{report.format}</td>
                                        <td>
                                            <Button variant="info" size="sm" className="me-2" onClick={() => viewReportDetails(report)}>
                                                <FaEye /> Détails
                                            </Button>
                                            {report.status === 'completed' && (
                                                <Button variant="primary" size="sm" onClick={() => downloadReport(report.id)}>
                                                    <FaFileDownload /> Télécharger
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                    {renderPagination()}
                </Card.Body>
            </Card>

            {/* Modal for Report Details */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>Détails du Rapport : {selectedReport?.title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedReport && (
                        <div>
                            <Row className="mb-3">
                                <Col>
                                    <strong>Type:</strong> {selectedReport.type}
                                </Col>
                                <Col>
                                    <strong>Période:</strong> {selectedReport.period}
                                </Col>
                                <Col>
                                    <strong>Généré le:</strong> {new Date(selectedReport.generatedDate).toLocaleString()}
                                </Col>
                            </Row>
                            <Row className="mb-3">
                                <Col>
                                    <strong>Statut:</strong> <Badge bg={
                                        selectedReport.status === 'completed' ? 'success' :
                                        selectedReport.status === 'processing' ? 'warning' : 'danger'
                                    }>{selectedReport.status}</Badge>
                                </Col>
                                <Col>
                                    <strong>Format:</strong> {selectedReport.format}
                                </Col>
                                <Col>
                                    <strong>Taille du fichier:</strong> {selectedReport.fileSize || 'N/A'}
                                </Col>
                            </Row>
                            <Row className="mb-3">
                                <Col>
                                    <strong>Municipalité:</strong> {selectedReport.municipalityName || 'Toutes'}
                                </Col>
                                <Col>
                                    <strong>Généré par:</strong> {selectedReport.generatedBy || 'N/A'}
                                </Col>
                                <Col></Col> {/* For alignment */}
                            </Row>
                            
                            {/* Report Data Overview - Mock/Placeholder content */}
                            <hr />
                            <h6>Aperçu des Données</h6>
                            <div className="bg-light p-3 rounded">
                                <p className="mb-1">• Nombre de collecteurs analysés: 15</p>
                                <p className="mb-1">• Période couverte: 30 jours</p>
                                <p className="mb-1">• Collectes totales: 1,247</p>
                                <p className="mb-0">• Taux de satisfaction: 87%</p>
                            </div>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Fermer
                    </Button>
                    {selectedReport && selectedReport.status === 'completed' && (
                        <Button 
                            variant="primary" 
                            onClick={() => downloadReport(selectedReport.id)}
                        >
                            <FaFileDownload className="me-2" />
                            Télécharger
                        </Button>
                    )}
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default ReportsPage;
