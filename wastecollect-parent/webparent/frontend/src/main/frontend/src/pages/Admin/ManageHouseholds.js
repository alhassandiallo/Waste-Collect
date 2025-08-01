import React, { useState, useEffect } from 'react';
import { 
    Container, 
    Row, 
    Col, 
    Card, 
    Table, 
    Button, 
    Modal, 
    Form, 
    Alert, 
    Badge,
    InputGroup,
    FormControl,
    Spinner,
    Pagination
} from 'react-bootstrap';
import { 
    FaPlus, 
    FaEdit, 
    FaTrash, 
    FaSearch, 
    FaEye, 
    FaFilter,
    FaDownload,
    FaHome,
    FaPhone,
    FaEnvelope,
    FaMapMarkerAlt
} from 'react-icons/fa';
import { useNavigate, Link } from 'react-router-dom'; 
import adminService from '../../services/adminService'; 

/**
 * Composant ManageHouseholds - Gestion des ménages par l'administrateur
 * * Fonctionnalités incluses:
 * - Affichage de la liste des ménages avec pagination
 * - Recherche et filtrage des ménages
 * - Ajout, modification et suppression de ménages
 * - Visualisation des détails d'un ménage
 * - Export des données
 * - Interface responsive pour web et mobile
 */
const ManageHouseholds = () => {
    const navigate = useNavigate(); 

    // ==================== ÉTATS LOCAUX ====================
    
    // État pour la liste des ménages
    const [households, setHouseholds] = useState([]);
    
    // États pour le chargement et les messages d'erreur/succès
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // États pour la pagination
    // Changed initial currentPage to 0 for 0-indexed backend pagination
    const [currentPage, setCurrentPage] = useState(0); 
    const [householdsPerPage] = useState(10); 
    const [totalHouseholds, setTotalHouseholds] = useState(0); 

    // États pour la recherche et le filtrage
    const [searchTerm, setSearchTerm] = useState('');
    const [filterMunicipality, setFilterMunicipality] = useState('');
    const [filterHousingType, setFilterHousingType] = useState('');
    const [municipalities, setMunicipalities] = useState([]); 

    // États pour les modales (ajout/édition et suppression)
    const [showAddEditModal, setShowAddEditModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [editMode, setEditMode] = useState(false); 
    const [selectedHousehold, setSelectedHousehold] = useState(null); 

    // État du formulaire pour l'ajout/édition d'un ménage
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        address: '',
        numberOfMembers: '',
        housingType: '',
        municipalityName: '', 
        collectionPreferences: '',
        latitude: '',
        longitude: '',
        isActive: true, 
    });
    const [formErrors, setFormErrors] = useState({});

    // ==================== EFFETS DE CÔTÉ (useEffect) ====================

    /**
     * Charge les ménages et les municipalités au montage du composant
     * et chaque fois que les paramètres de pagination/filtre changent.
     */
    useEffect(() => {
        fetchHouseholds();
        fetchMunicipalities();
    }, [currentPage, householdsPerPage, searchTerm, filterMunicipality, filterHousingType]);

    // ==================== FONCTIONS DE RÉCUPÉRATION DES DONNÉES ====================

    /**
     * Récupère la liste des ménages depuis le backend avec filtres et pagination.
     */
    const fetchHouseholds = async () => {
        setLoading(true);
        setError(null);
        try {
            const filters = {
                search: searchTerm,
                municipality: filterMunicipality,
                housingType: filterHousingType,
            };
            console.log("Fetching households with filters:", filters, "page (0-indexed):", currentPage, "limit:", householdsPerPage);
            // Pass filters as the first argument to getAllHouseholds
            const response = await adminService.getAllHouseholds(filters, currentPage, householdsPerPage);
            console.log("Response from getAllHouseholds:", response);

            // Safely get content and totalElements, with fallbacks
            const householdContent = response?.content || [];
            const householdTotalElements = response?.totalElements || 0;

            console.log("Processed household content:", householdContent);
            console.log("Processed total elements:", householdTotalElements);

            setHouseholds(householdContent);
            setTotalHouseholds(householdTotalElements);
            setLoading(false);
        } catch (err) {
            console.error("Erreur lors de la récupération des ménages:", err);
            setError("Erreur lors du chargement des ménages : " + (err.response?.data?.message || err.message || ""));
            setLoading(false);
        }
    };

    /**
     * Récupère la liste des municipalités pour le dropdown de filtre/formulaire.
     */
    const fetchMunicipalities = async () => {
        try {
            const response = await adminService.getAllMunicipalities({}, 0, 1000); // Using 0-indexed page for consistency
            setMunicipalities(response.content || []); // Ensure municipalities is always an array
        } catch (err) {
            console.error("Erreur lors de la récupération des municipalités:", err);
        }
    };

    // ==================== MODAL AND FORM HANDLERS ====================

    /**
     * Ouvre la modale d'ajout de ménage et réinitialise le formulaire.
     */
    const handleAddHouseholdClick = () => {
        setEditMode(false);
        resetFormData();
        setShowAddEditModal(true);
    };

    /**
     * Ouvre la modale d'édition et pré-remplit le formulaire avec les données du ménage sélectionné.
     * @param {Object} household - Le ménage à éditer.
     */
    const handleEditHouseholdClick = (household) => {
        setEditMode(true);
        setSelectedHousehold(household);
        setFormData({
            firstName: household.firstName || '',
            lastName: household.lastName || '',
            email: household.email || '',
            phoneNumber: household.phoneNumber || '',
            address: household.address || '',
            numberOfMembers: household.numberOfMembers || '',
            housingType: household.housingType || '',
            municipalityName: household.area || '', 
            collectionPreferences: household.collectionPreferences || '',
            latitude: household.latitude || '',
            longitude: household.longitude || '',
            isActive: household.isActive,
        });
        setFormErrors({});
        setShowAddEditModal(true);
    };

    /**
     * Ouvre la modale de détails d'un ménage.
     * @param {Object} household - Le ménage à afficher.
     */
    const handleViewDetailsClick = (household) => {
        setSelectedHousehold(household);
        setShowDetailsModal(true);
    };

    /**
     * Ouvre la modale de confirmation de suppression.
     * @param {Object} household - Le ménage à supprimer.
     */
    const handleDeleteConfirmation = (household) => {
        setSelectedHousehold(household);
        setShowDeleteModal(true);
    };


    /**
     * Gère les changements dans les champs du formulaire.
     * @param {Object} e - L'événement de changement.
     */
    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setFormErrors(prev => ({
            ...prev,
            [name]: undefined
        }));
    };

    /**
     * Valide les données du formulaire avant soumission.
     * @returns {boolean} - Vrai si le formulaire est valide, faux sinon.
     */
    const validateForm = () => {
        const errors = {};
        if (!formData.firstName) errors.firstName = "Le prénom est requis.";
        if (!formData.lastName) errors.lastName = "Le nom est requis.";
        if (!formData.email) {
            errors.email = "L'email est requis.";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            errors.email = "Format d'email invalide.";
        }
        if (!formData.phoneNumber) errors.phoneNumber = "Le numéro de téléphone est requis.";
        if (!formData.address) errors.address = "L'adresse est requise.";
        if (!formData.numberOfMembers || parseInt(formData.numberOfMembers) <= 0) errors.numberOfMembers = "Le nombre de membres doit être > 0.";
        if (!formData.housingType) errors.housingType = "Le type de logement est requis.";
        if (!formData.municipalityName) errors.municipalityName = "La municipalité est requise.";
        if (formData.latitude && isNaN(parseFloat(formData.latitude))) errors.latitude = "Latitude invalide.";
        if (formData.longitude && isNaN(parseFloat(formData.longitude))) errors.longitude = "Longitude invalide.";


        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    /**
     * Soumet le formulaire (ajout ou édition).
     * @param {Object} e - L'événement de soumission.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccess(null); 
        setError(null); 

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            if (editMode && selectedHousehold) {
                // For editing, use HouseholdUpdateDTO (no password)
                const updateData = {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    phoneNumber: formData.phoneNumber,
                    address: formData.address,
                    numberOfMembers: parseInt(formData.numberOfMembers),
                    housingType: formData.housingType,
                    area: formData.municipalityName, 
                    collectionPreferences: formData.collectionPreferences,
                    latitude: parseFloat(formData.latitude),
                    longitude: parseFloat(formData.longitude),
                    isActive: formData.isActive,
                    // Find the municipality ID from the name for the backend DTO
                    municipalityId: municipalities.find(m => m.municipalityName === formData.municipalityName)?.id,
                };
                await adminService.updateHousehold(selectedHousehold.id, updateData);
                setSuccess("Ménage mis à jour avec succès !");
            } else {
                // For adding, use HouseholdCreationDTO (includes password)
                const createData = {
                    ...formData,
                    numberOfMembers: parseInt(formData.numberOfMembers),
                    latitude: parseFloat(formData.latitude),
                    longitude: parseFloat(formData.longitude),
                    password: "DefaultPassword123!", // Default or generated password
                };
                await adminService.createHousehold(createData);
                setSuccess("Ménage ajouté avec succès !");
            }
            setShowAddEditModal(false);
            fetchHouseholds(); 
        } catch (err) {
            console.error("Erreur lors de l'opération sur le ménage:", err);
            setError("Opération échouée : " + (err.response?.data?.message || err.message || "Une erreur inconnue est survenue."));
        } finally {
            setLoading(false);
        }
    };

    /**
     * Gère la suppression confirmée d'un ménage.
     */
    const handleDeleteHousehold = async () => {
        if (!selectedHousehold) return;
        setLoading(true);
        setSuccess(null);
        setError(null);
        try {
            await adminService.deleteHousehold(selectedHousehold.id);
            setSuccess("Ménage supprimé avec succès !");
            setShowDeleteModal(false);
            fetchHouseholds(); 
        } catch (err) {
            console.error("Erreur lors de la suppression du ménage:", err);
            setError("Suppression échouée : " + (err.response?.data?.message || err.message || "Une erreur inconnue est survenue."));
        } finally {
            setLoading(false);
        }
    };

    /**
     * Réinitialise les données du formulaire d'ajout/édition.
     */
    const resetFormData = () => {
        setFormData({
            firstName: '',
            lastName: '',
            email: '',
            phoneNumber: '',
            address: '',
            numberOfMembers: '',
            housingType: '',
            municipalityName: '',
            collectionPreferences: '',
            latitude: '',
            longitude: '',
            isActive: true,
        });
        setFormErrors({});
        setSelectedHousehold(null);
    };

    // ==================== GESTION DE LA PAGINATION ====================

    // Calculate total pages based on totalHouseholds and householdsPerPage
    const totalPages = Math.ceil(totalHouseholds / householdsPerPage);

    // Function to handle page change
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const renderPagination = () => {
        const pageNumbers = [];
        const maxPageButtons = 5; 
        // Adjust start and end page for 0-indexed currentPage and 1-indexed display
        let startPage = Math.max(0, currentPage - Math.floor(maxPageButtons / 2));
        let endPage = Math.min(totalPages - 1, startPage + maxPageButtons - 1);

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

    // ==================== RENDU DU COMPOSANT ====================

    return (
        <Container className="my-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="mb-0">
                    <FaHome className="me-2" /> Gestion des Ménages
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

            {/* Barre de recherche et filtres */}
            <Card className="shadow-sm mb-4">
                <Card.Body>
                    <Row className="mb-3">
                        <Col md={6}>
                            <InputGroup>
                                <InputGroup.Text><FaSearch /></InputGroup.Text>
                                <FormControl
                                    placeholder="Rechercher par nom, email, adresse..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </InputGroup>
                        </Col>
                        <Col md={3}>
                            <Form.Select
                                value={filterMunicipality}
                                onChange={(e) => setFilterMunicipality(e.target.value)}
                            >
                                <option value="">Toutes les municipalités</option>
                                {municipalities.map(m => (
                                    <option key={m.id} value={m.municipalityName}>{m.municipalityName}</option>
                                ))}
                            </Form.Select>
                        </Col>
                        <Col md={3}>
                            <Form.Select
                                value={filterHousingType}
                                onChange={(e) => setFilterHousingType(e.target.value)}
                            >
                                <option value="">Tous les types de logement</option>
                                <option value="APARTMENT">Appartement</option>
                                <option value="HOUSE">Maison</option>
                                <option value="CONDO">Condominium</option>
                            </Form.Select>
                        </Col>
                    </Row>
                    <div className="d-flex justify-content-end">
                        <Button variant="success" onClick={handleAddHouseholdClick}>
                            <FaPlus className="me-2" />
                            Ajouter un Ménage
                        </Button>
                    </div>
                </Card.Body>
            </Card>

            {/* Tableau des ménages */}
            <Card className="shadow-sm">
                <Card.Header className="bg-primary text-white">
                  <h5>Liste des Ménages</h5>
                </Card.Header>
                <Card.Body>
                  {loading ? (
                    <div className="text-center py-5">
                      <Spinner animation="border" variant="primary" />
                      <p className="mt-2">Chargement des ménages...</p>
                    </div>
                  ) : (Array.isArray(households) && households.length === 0) ? ( // Added Array.isArray check
                    <Alert variant="info" className="text-center">Aucun ménage trouvé avec les filtres actuels.</Alert>
                  ) : (
                    <Table striped bordered hover responsive className="text-center">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Nom Complet</th>
                          <th>Email</th>
                          <th>Téléphone</th>
                          <th>Adresse</th>
                          <th>Municipalité</th>
                          <th>Logement</th>
                          <th>Membres</th>
                          <th>Statut</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.isArray(households) && households.map((household) => ( // Added Array.isArray check
                          <tr key={household.id}>
                            <td>{household.id}</td>
                            <td>{household.firstName} {household.lastName}</td>
                            <td>{household.email}</td>
                            <td>{household.phoneNumber}</td>
                            <td>{household.address}</td>
                            <td>{household.area || 'N/A'}</td> 
                            <td><Badge bg="info">{household.housingType}</Badge></td>
                            <td>{household.numberOfMembers}</td>
                            <td>
                                <Badge bg={household.isActive ? 'success' : 'secondary'}>
                                    {household.isActive ? 'Actif' : 'Inactif'}
                                </Badge>
                            </td>
                            <td>
                              <Button variant="info" size="sm" className="me-2" onClick={() => handleViewDetailsClick(household)}>
                                <FaEye />
                              </Button>
                              <Button variant="primary" size="sm" className="me-2" onClick={() => handleEditHouseholdClick(household)}>
                                <FaEdit />
                              </Button>
                              <Button variant="danger" size="sm" onClick={() => handleDeleteConfirmation(household)}>
                                <FaTrash />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                  {renderPagination()}
                </Card.Body>
            </Card>

            {/* Modale d'ajout/édition de ménage */}
            <Modal show={showAddEditModal} onHide={() => setShowAddEditModal(false)} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>{editMode ? 'Modifier le Ménage' : 'Ajouter un Nouveau Ménage'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Row className="mb-3">
                            <Form.Group as={Col} controlId="firstName">
                                <Form.Label>Prénom</Form.Label>
                                <FormControl
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleFormChange}
                                    isInvalid={!!formErrors.firstName}
                                />
                                <Form.Control.Feedback type="invalid">{formErrors.firstName}</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} controlId="lastName">
                                <Form.Label>Nom</Form.Label>
                                <FormControl
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleFormChange}
                                    isInvalid={!!formErrors.lastName}
                                />
                                <Form.Control.Feedback type="invalid">{formErrors.lastName}</Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                        <Row className="mb-3">
                            <Form.Group as={Col} controlId="email">
                                <Form.Label>Email</Form.Label>
                                <FormControl
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleFormChange}
                                    isInvalid={!!formErrors.email}
                                    disabled={editMode} 
                                />
                                <Form.Control.Feedback type="invalid">{formErrors.email}</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} controlId="phoneNumber">
                                <Form.Label>Téléphone</Form.Label>
                                <FormControl
                                    type="text"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleFormChange}
                                    isInvalid={!!formErrors.phoneNumber}
                                />
                                <Form.Control.Feedback type="invalid">{formErrors.phoneNumber}</Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                        <Form.Group controlId="address" className="mb-3">
                            <Form.Label>Adresse</Form.Label>
                            <FormControl
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleFormChange}
                                isInvalid={!!formErrors.address}
                            />
                            <Form.Control.Feedback type="invalid">{formErrors.address}</Form.Control.Feedback>
                        </Form.Group>
                        <Row className="mb-3">
                            <Form.Group as={Col} controlId="numberOfMembers">
                                <Form.Label>Nombre de Membres</Form.Label>
                                <FormControl
                                    type="number"
                                    name="numberOfMembers"
                                    value={formData.numberOfMembers}
                                    onChange={handleFormChange}
                                    isInvalid={!!formErrors.numberOfMembers}
                                />
                                <Form.Control.Feedback type="invalid">{formErrors.numberOfMembers}</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} controlId="housingType">
                                <Form.Label>Type de Logement</Form.Label>
                                <Form.Select
                                    name="housingType"
                                    value={formData.housingType}
                                    onChange={handleFormChange}
                                    isInvalid={!!formErrors.housingType}
                                >
                                    <option value="">Sélectionner...</option>
                                    <option value="APARTMENT">Appartement</option>
                                    <option value="HOUSE">Maison</option>
                                    <option value="CONDO">Condominium</option>
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">{formErrors.housingType}</Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                        <Row className="mb-3">
                            <Form.Group as={Col} controlId="municipalityName">
                                <Form.Label>Municipalité</Form.Label>
                                <Form.Select
                                    name="municipalityName"
                                    value={formData.municipalityName}
                                    onChange={handleFormChange}
                                    isInvalid={!!formErrors.municipalityName}
                                >
                                    <option value="">Sélectionner une municipalité</option>
                                    {municipalities.map(m => (
                                        <option key={m.id} value={m.municipalityName}>{m.municipalityName}</option>
                                    ))}
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">{formErrors.municipalityName}</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} controlId="collectionPreferences">
                                <Form.Label>Préférences de Collecte</Form.Label>
                                <FormControl
                                    type="text"
                                    name="collectionPreferences"
                                    value={formData.collectionPreferences}
                                    onChange={handleFormChange}
                                    placeholder="Ex: Lundi, Mercredi matin"
                                />
                            </Form.Group>
                        </Row>
                        <Form.Group controlId="isActive" className="mb-3">
                            <Form.Check
                                type="switch"
                                id="isActiveSwitch"
                                label="Compte actif"
                                name="isActive"
                                checked={formData.isActive}
                                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                            />
                        </Form.Group>
                        <Button variant="primary" type="submit" disabled={loading}>
                            {loading ? (
                                <>
                                    <Spinner animation="border" size="sm" className="me-2" />
                                    Chargement...
                                </>
                            ) : editMode ? 'Sauvegarder les modifications' : 'Ajouter le Ménage'}
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* Modale de détails du ménage */}
            <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>Détails du Ménage: {selectedHousehold?.firstName} {selectedHousehold?.lastName}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedHousehold && (
                        <Row>
                            <Col md={6}>
                                <Card className="mb-3 shadow-sm">
                                    <Card.Header className="bg-light">
                                        <h6><FaHome className="me-2" /> Informations Générales</h6>
                                    </Card.Header>
                                    <Card.Body>
                                        <p><strong>Nom Complet:</strong> {selectedHousehold.firstName} {selectedHousehold.lastName}</p>
                                        <p><strong>Email:</strong> {selectedHousehold.email}</p>
                                        <p><strong>Téléphone:</strong> {selectedHousehold.phoneNumber}</p>
                                        <p><strong>Adresse:</strong> {selectedHousehold.address}</p>
                                        <p>
                                            <strong>Statut:</strong>{' '}
                                            <Badge bg={selectedHousehold.isActive ? 'success' : 'secondary'}>
                                                {selectedHousehold.isActive ? 'Actif' : 'Inactif'}
                                            </Badge>
                                        </p>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col md={6}>
                                <Card className="mb-3 shadow-sm">
                                    <Card.Header className="bg-light">
                                        <h6><FaMapMarkerAlt className="me-2" /> Détails du Logement</h6>
                                    </Card.Header>
                                    <Card.Body>
                                        <p><strong>Municipalité:</strong> {selectedHousehold.area || 'N/A'}</p> 
                                        <p><strong>Type de Logement:</strong> {selectedHousehold.housingType}</p>
                                        <p><strong>Membres du Ménage:</strong> {selectedHousehold.numberOfMembers}</p>
                                        <p><strong>Préférences de Collecte:</strong> {selectedHousehold.collectionPreferences || 'Non spécifié'}</p>
                                        <p><strong>Coordonnées GPS:</strong> {selectedHousehold.latitude}, {selectedHousehold.longitude}</p>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
                        Fermer
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Modale de confirmation de suppression */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirmer la Suppression</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedHousehold && (
                        <div>
                            <p>Êtes-vous sûr de vouloir supprimer le ménage suivant ?</p>
                            <div className="alert alert-warning">
                                <strong>{selectedHousehold.firstName} {selectedHousehold.lastName}</strong><br />
                                {selectedHousehold.email}<br />
                                {selectedHousehold.address}
                            </div>
                            <p className="text-danger">
                                <strong>Attention:</strong> Cette action est irréversible et supprimera également 
                                toutes les données associées (demandes de service, paiements, etc.).
                            </p>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        Annuler
                    </Button>
                    <Button variant="danger" onClick={handleDeleteHousehold} disabled={loading}>
                        {loading ? 'Suppression en cours...' : 'Supprimer définitivement'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default ManageHouseholds;
