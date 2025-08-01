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
  FaUsers, 
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaFilter,
  FaCity // Added FaCity import
} from 'react-icons/fa';
import { useNavigate, Link } from 'react-router-dom'; // Corrected import path
import adminService from '../../services/adminService'; 
import userService from '../../services/userService'; 

/**
 * Composant ManageMunicipalities
 * Permet à l'administrateur de gérer (créer, modifier, supprimer) les municipalités
 * et d'assigner des gestionnaires municipaux
 */
const ManageMunicipalities = () => {
  const navigate = useNavigate(); 

  // États pour la liste des municipalités et la pagination
  const [municipalities, setMunicipalities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(0); // 0-indexed for backend
  const [municipalitiesPerPage] = useState(10);
  const [totalMunicipalities, setTotalMunicipalities] = useState(0); // Total number of municipalities

  // Search and Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProvince, setFilterProvince] = useState('');

  // Modals states
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedMunicipality, setSelectedMunicipality] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false); // New state for loading details

  // Form states for adding/editing a municipality
  const [formData, setFormData] = useState({
    municipalityName: '',
    province: '',
    country: '',
    population: '',
    wasteManagementBudget: '',
    enabled: true,
    // Fields for municipal manager (for both creation and update)
    managerId: null, // New field for manager's ID
    managerFirstName: '',
    managerLastName: '',
    managerEmail: '',
    managerPhoneNumber: '',
    managerAddress: '',
    managerPassword: '', // Only for creation
  });
  const [formErrors, setFormErrors] = useState({});

  // State for available managers (mock or fetched from API) - this is now less critical
  // as we're focusing on displaying the *assigned* manager within municipality details.
  const [availableManagers, setAvailableManagers] = useState([]);


  /**
   * Effect hook to fetch municipalities on component mount and when filters/pagination change.
   */
  useEffect(() => {
    fetchMunicipalities();
    // No longer strictly needing to fetch all available managers upfront unless
    // there's a dropdown for assigning an *existing* manager to a new municipality.
    // If the creation form *only* allows creating a new manager, this fetch is optional.
    // For now, let's keep it in case the form evolves.
    fetchAvailableManagers(); 
  }, [currentPage, municipalitiesPerPage, searchTerm, filterProvince]);


  // ==================== DATA FETCHING FUNCTIONS ====================

  /**
   * Fetches the list of municipalities from the backend.
   */
  const fetchMunicipalities = async () => {
    setLoading(true);
    setError(null);
    try {
      const filters = {
        search: searchTerm,
        province: filterProvince,
      };
      // Log the filters being sent for debugging
      console.log('Fetching municipalities with filters:', filters);

      // Correctly destructure 'content' and 'totalElements' from the API response
      const { content, totalElements } = await adminService.getAllMunicipalities(filters, currentPage, municipalitiesPerPage);
      setMunicipalities(content || []); // Ensure municipalities is always an array
      setTotalMunicipalities(totalElements || 0); // Ensure totalMunicipalities is always a number
      setLoading(false);
    } catch (err) {
      console.error("Error fetching municipalities:", err);
      setError("Erreur lors du chargement des municipalités : " + (err.message || ""));
      setLoading(false);
    }
  };

  /**
   * Fetches the list of available users who can be assigned as municipal managers.
   * This now uses the new adminService.getAllUsers endpoint with a role filter.
   */
  const fetchAvailableManagers = async () => {
    try {
      const response = await adminService.getAllUsers({
        role: 'MUNICIPAL_MANAGER' // Filter by role
      }, 0, 1000); // Pass page and size for the adminService method
      setAvailableManagers(response.content || []);
    } catch (err) {
      console.error("Erreur lors de la récupération des gestionnaires disponibles:", err);
      // Don't set global error, just log it
    }
  };

  // ==================== MODAL AND FORM HANDLERS ====================

  /**
   * Opens the add new municipality modal and resets the form.
   */
  const handleAddClick = () => {
    setEditMode(false);
    resetFormData();
    setShowAddEditModal(true);
  };

  /**
   * Opens the edit municipality modal and populates the form.
   * @param {Object} municipality - The municipality to edit.
   */
  const handleEditClick = async (municipality) => {
    setEditMode(true);
    setSelectedMunicipality(null); // Clear previous selection while loading
    setShowAddEditModal(true); // Open modal immediately for loading spinner
    setError(null); // Clear previous errors
  
    try {
      // Fetch full details of the municipality, which should now include manager data
      const fullMunicipalityDetails = await adminService.getMunicipalityById(municipality.id);
      console.log('Fetched full municipality details for editing:', fullMunicipalityDetails);
      setSelectedMunicipality(fullMunicipalityDetails); // Set the full details
  
      // Populate formData with municipality details
      const newFormData = {
        municipalityName: fullMunicipalityDetails.municipalityName || '',
        province: fullMunicipalityDetails.province || '',
        country: fullMunicipalityDetails.country || '',
        population: fullMunicipalityDetails.population || '',
        wasteManagementBudget: fullMunicipalityDetails.wasteManagementBudget || '',
        enabled: fullMunicipalityDetails.enabled,
        managerId: null, // Reset managerId unless a manager is found
        managerFirstName: '',
        managerLastName: '',
        managerEmail: '',
        managerPhoneNumber: '',
        managerAddress: '',
        managerPassword: '', // Password is only for creation, not loaded for edit
      };
  
      // Populate manager fields if a manager exists
      if (fullMunicipalityDetails.manager) {
        newFormData.managerId = fullMunicipalityDetails.manager.id;
        newFormData.managerFirstName = fullMunicipalityDetails.manager.firstName || '';
        newFormData.managerLastName = fullMunicipalityDetails.manager.lastName || '';
        newFormData.managerEmail = fullMunicipalityDetails.manager.email || '';
        newFormData.managerPhoneNumber = fullMunicipalityDetails.manager.phoneNumber || '';
        newFormData.managerAddress = fullMunicipalityDetails.manager.address || '';
      }
      
      setFormData(newFormData);
      setFormErrors({});
    } catch (err) {
      console.error("Erreur lors du chargement des détails de la municipalité pour modification:", err);
      setError("Erreur lors du chargement des détails de la municipalité pour modification : " + (err.response?.data?.message || err.message || ""));
      setShowAddEditModal(false); // Close modal if error occurs
    } finally {
      setLoadingDetails(false); // Make sure this is set to false even if there's an error
    }
  };
  

  /**
   * Opens the municipality details modal and fetches full details, including manager.
   * @param {Object} municipality - The municipality to display details for.
   */
  const handleViewDetails = async (municipality) => {
    setLoadingDetails(true);
    setSelectedMunicipality(null); // Clear previous selection while loading
    setShowDetailsModal(true); // Open modal immediately for loading spinner
    setError(null); // Clear previous errors

    try {
      // Fetch full details of the municipality, which should now include manager data
      const fullMunicipalityDetails = await adminService.getMunicipalityById(municipality.id);
      console.log('Fetched full municipality details:', fullMunicipalityDetails); // ADDED FOR DEBUGGING
      console.log('Manager property:', fullMunicipalityDetails.manager); // Added for debugging manager property
      setSelectedMunicipality(fullMunicipalityDetails);
    } catch (err) {
      console.error("Erreur lors de la récupération des détails de la municipalité:", err);
      setError("Erreur lors du chargement des détails de la municipalité : " + (err.response?.data?.message || err.message || ""));
      setShowDetailsModal(false); // Close modal if error occurs
    } finally {
      setLoadingDetails(false);
    }
  };

  /**
   * Opens the delete confirmation modal.
   * @param {Object} municipality - The municipality to be deleted.
   */
  const handleDeleteConfirmation = (municipality) => {
    setSelectedMunicipality(municipality);
    setShowDeleteModal(true);
  };

  /**
   * Closes the add/edit modal and resets the form.
   */
  const handleCloseModal = () => {
    setShowAddEditModal(false);
    resetFormData();
  };

  /**
   * Handles changes in form input fields.
   * @param {Object} e - The event object.
   */
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setFormErrors(prev => ({
      ...prev,
      [name]: undefined
    }));
  };

  /**
   * Validates the form data.
   * @returns {boolean} - True if form is valid, false otherwise.
   */
  const validateForm = () => {
    const errors = {};
    if (!formData.municipalityName) errors.municipalityName = "Le nom de la municipalité est requis.";
    if (!formData.province) errors.province = "La province est requise.";
    if (!formData.country) errors.country = "Le pays est requis.";
    // Ensure population and budget are numbers and positive for validation
    if (!formData.population || isNaN(parseInt(formData.population)) || parseInt(formData.population) <= 0) errors.population = "La population doit être un nombre positif.";
    if (!formData.wasteManagementBudget || isNaN(parseFloat(formData.wasteManagementBudget)) || parseFloat(formData.wasteManagementBudget) <= 0) errors.wasteManagementBudget = "Le budget doit être un nombre positif.";

    // Manager fields validation
    if (!editMode) { // Manager fields are only required for creation
        if (!formData.managerFirstName) errors.managerFirstName = "Le prénom du gérant est requis.";
        if (!formData.managerLastName) errors.managerLastName = "Le nom du gérant est requis.";
        if (!formData.managerEmail) {
            errors.managerEmail = "L'email du gérant est requis.";
        } else if (!/\S+@\S+\.\S+/.test(formData.managerEmail)) {
            errors.managerEmail = "Format d'email du gérant invalide.";
        }
        if (!formData.managerPhoneNumber) errors.managerPhoneNumber = "Le téléphone du gérant est requis.";
        if (!formData.managerAddress) errors.managerAddress = "L'adresse du gérant est requise.";
        if (!formData.managerPassword) errors.managerPassword = "Le mot de passe du gérant est requis.";
        else if (formData.managerPassword.length < 8) errors.managerPassword = "Le mot de passe du gérant doit être d'au moins 8 caractères.";
    } else { // In edit mode, validate manager fields if they are present and being edited
        // If there's an existing manager and fields are changed, validate them
        if (selectedMunicipality?.manager) {
            if (!formData.managerFirstName) errors.managerFirstName = "Le prénom du gérant est requis.";
            if (!formData.managerLastName) errors.managerLastName = "Le nom du gérant est requis.";
            if (!formData.managerEmail) {
                errors.managerEmail = "L'email du gérant est requis.";
            } else if (!/\S+@\S+\.\S+/.test(formData.managerEmail)) {
                errors.managerEmail = "Format d'email du gérant invalide.";
            }
            // Phone and Address can be optional, so no strict validation unless required
        }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Handles form submission for adding or updating a municipality.
   * @param {Object} e - The submit event.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      if (editMode && selectedMunicipality) {
        // Construct the update data for municipality
        const updateData = {
          municipalityName: formData.municipalityName,
          province: formData.province,
          country: formData.country,
          population: parseInt(formData.population),
          wasteManagementBudget: parseFloat(formData.wasteManagementBudget),
          enabled: formData.enabled,
        };

        // If there's an associated manager and their details are in formData, include them
        if (selectedMunicipality.manager) {
          updateData.manager = {
            id: selectedMunicipality.manager.id, // Crucial for backend to identify the manager
            firstName: formData.managerFirstName,
            lastName: formData.managerLastName,
            email: formData.managerEmail,
            phoneNumber: formData.managerPhoneNumber,
            address: formData.managerAddress,
            enabled: selectedMunicipality.manager.enabled // Assuming manager's enabled status is tied to municipality's, or handled separately
          };
        }
        
        await adminService.updateMunicipality(selectedMunicipality.id, updateData);
        setSuccess("Municipalité et/ou gérant mis à jour avec succès !");
      } else {
        const createData = {
          municipalityName: formData.municipalityName,
          province: formData.province,
          country: formData.country,
          population: parseInt(formData.population),
          wasteManagementBudget: parseFloat(formData.wasteManagementBudget),
          enabled: formData.enabled,
          managerFirstName: formData.managerFirstName, 
          managerLastName: formData.managerLastName,
          managerEmail: formData.managerEmail,
          managerPhoneNumber: formData.managerPhoneNumber,
          managerAddress: formData.managerAddress,
          managerPassword: formData.managerPassword,
        };
        await adminService.createMunicipality(createData);
        setSuccess("Municipalité ajoutée avec succès !");
      }
      handleCloseModal();
      fetchMunicipalities(); 
    }
    catch (err) {
      console.error("Erreur lors de l'opération sur la municipalité:", err);
      setError("Opération échouée: " + (err.response?.data?.message || err.message || "Une erreur inconnue est survenue."));
    }
    finally {
      setLoading(false);
    }
  };

  /**
   * Handles the deletion of a municipality.
   */
  const handleDelete = async () => {
    if (!selectedMunicipality) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await adminService.deleteMunicipality(selectedMunicipality.id);
      setSuccess("Municipalité supprimée avec succès !");
      setShowDeleteModal(false);
      fetchMunicipalities(); 
    } catch (err) {
      console.error("Erreur lors de la suppression de la municipalité:", err);
      setError("Suppression échouée: " + (err.response?.data?.message || err.message || "Une erreur inconnue est survenue."));
    } finally {
      setLoading(false);
    }
  };

  /**
   * Resets the form data.
   */
  const resetFormData = () => {
    setFormData({
      municipalityName: '',
      province: '',
      country: '',
      population: '',
      wasteManagementBudget: '',
      enabled: true,
      managerId: null, // Reset managerId
      managerFirstName: '',
      managerLastName: '',
      managerEmail: '',
      managerPhoneNumber: '',
      managerAddress: '',
      managerPassword: '',
    });
    setFormErrors({});
    setSelectedMunicipality(null);
  };

  // ==================== PAGINATION LOGIC ====================

  const totalPages = Math.ceil(totalMunicipalities / municipalitiesPerPage);

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

  // ==================== COMPONENT RENDERING ====================

  return (
    <Container className="my-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">
          <FaCity className="me-2" /> Gestion des Municipalités
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

      {/* Search and Filter Bar */}
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <Row className="mb-3">
            <Col md={6}>
              <InputGroup>
                <InputGroup.Text><FaSearch /></InputGroup.Text>
                <FormControl
                  placeholder="Rechercher par nom, province..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={4}>
              <Form.Select
                value={filterProvince}
                onChange={(e) => setFilterProvince(e.target.value)}
              >
                <option value="">Toutes les provinces</option>
                {/* Dynamically load provinces from your data or a predefined list if applicable */}
                {/* For now, a mock list or derive from existing municipalities */}
                {Array.from(new Set(municipalities.map(m => m.province))).map(province => (
                  <option key={province} value={province}>{province}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={2} className="d-flex justify-content-end">
              <Button variant="success" onClick={handleAddClick}>
                <FaPlus className="me-2" />
                Ajouter
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Municipalities Table */}
      <Card className="shadow-sm">
        <Card.Header className="bg-primary text-white">
          <h5>Liste des Municipalités</h5>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Chargement des municipalités...</p>
            </div>
          ) : municipalities.length === 0 ? (
            <Alert variant="info" className="text-center">Aucune municipalité trouvée avec les filtres actuels.</Alert>
          ) : (
            <Table striped bordered hover responsive className="text-center">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nom Municipalité</th>
                  <th>Province</th>
                  <th>Pays</th>
                  <th>Population</th>
                  <th>Budget Déchets</th>
                  <th>Gérant Municipal</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {municipalities.map((municipality) => (
                  <tr key={municipality.id}>
                    <td>{municipality.id}</td>
                    <td>{municipality.municipalityName}</td>
                    <td>{municipality.province}</td>
                    <td>{municipality.country}</td>
                    <td>{municipality.population?.toLocaleString()}</td>
                    <td>{municipality.wasteManagementBudget?.toLocaleString('fr-FR', { style: 'currency', currency: 'USD' })}</td>
                    <td>
                      {/* Display manager name, or 'N/A' if not found */}
                      {municipality.manager ? 
                        `${municipality.manager.firstName} ${municipality.manager.lastName}` : 
                        'N/A'
                      }
                    </td>
                    <td>
                        <Badge bg={municipality.enabled ? 'success' : 'secondary'}>
                            {municipality.enabled ? 'Activée' : 'Désactivée'}
                        </Badge>
                    </td>
                    <td>
                      <Button variant="info" size="sm" className="me-2" onClick={() => handleViewDetails(municipality)}>
                        <FaEye />
                      </Button>
                      <Button variant="primary" size="sm" className="me-2" onClick={() => handleEditClick(municipality)}>
                        <FaEdit />
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleDeleteConfirmation(municipality)}>
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

      {/* Add/Edit Municipality Modal */}
      <Modal show={showAddEditModal} onHide={handleCloseModal} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>{editMode ? 'Modifier la Municipalité' : 'Ajouter une Nouvelle Municipalité'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row className="mb-3">
              <Form.Group as={Col} controlId="municipalityName">
                <Form.Label>Nom de la Municipalité</Form.Label>
                <FormControl
                  type="text"
                  name="municipalityName"
                  value={formData.municipalityName}
                  onChange={handleFormChange}
                  isInvalid={!!formErrors.municipalityName}
                />
                <Form.Control.Feedback type="invalid">{formErrors.municipalityName}</Form.Control.Feedback>
              </Form.Group>
              <Form.Group as={Col} controlId="province">
                <Form.Label>Province</Form.Label>
                <FormControl
                  type="text"
                  name="province"
                  value={formData.province}
                  onChange={handleFormChange}
                  isInvalid={!!formErrors.province}
                />
                <Form.Control.Feedback type="invalid">{formErrors.province}</Form.Control.Feedback>
              </Form.Group>
            </Row>
            <Row className="mb-3">
              <Form.Group as={Col} controlId="country">
                <Form.Label>Pays</Form.Label>
                <FormControl
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleFormChange}
                  isInvalid={!!formErrors.country}
                />
                <Form.Control.Feedback type="invalid">{formErrors.country}</Form.Control.Feedback>
              </Form.Group>
              <Form.Group as={Col} controlId="population">
                <Form.Label>Population</Form.Label>
                <FormControl
                  type="number"
                  name="population"
                  value={formData.population}
                  onChange={handleFormChange}
                  isInvalid={!!formErrors.population}
                />
                <Form.Control.Feedback type="invalid">{formErrors.population}</Form.Control.Feedback>
              </Form.Group>
            </Row>
            <Row className="mb-3">
              <Form.Group as={Col} controlId="wasteManagementBudget">
                <Form.Label>Budget Gestion des Déchets ($)</Form.Label>
                <InputGroup>
                  <InputGroup.Text>$</InputGroup.Text>
                  <FormControl
                    type="number"
                    name="wasteManagementBudget"
                    value={formData.wasteManagementBudget}
                    onChange={handleFormChange}
                    isInvalid={!!formErrors.wasteManagementBudget}
                  />
                  <Form.Control.Feedback type="invalid">{formErrors.wasteManagementBudget}</Form.Control.Feedback>
                </InputGroup>
              </Form.Group>
              <Form.Group as={Col} controlId="enabled" className="d-flex align-items-center">
                <Form.Check 
                  type="switch"
                  id="enabled-switch"
                  label="Municipalité Activée"
                  name="enabled"
                  checked={formData.enabled}
                  onChange={handleFormChange}
                  className="mt-4"
                />
              </Form.Group>
            </Row>

            <hr className="my-4" />
            <h5>Informations du Gérant Municipal {editMode ? '(Modification)' : '(Création)'}</h5>
            {editMode && !selectedMunicipality?.manager && (
                <Alert variant="info">
                    Cette municipalité n'a pas de gérant municipal associé. Vous pouvez en ajouter un ici, ou la gérer via la page "Gérer les gérants municipaux".
                </Alert>
            )}
            {editMode && selectedMunicipality?.manager && (
                 <Form.Group as={Col} controlId="managerId" className="mb-3">
                    <Form.Label>ID Gérant Municipal</Form.Label>
                    <FormControl
                      type="text"
                      name="managerId"
                      value={formData.managerId || ''}
                      readOnly // Manager ID should not be editable directly
                    />
                </Form.Group>
            )}
            <Row className="mb-3">
              <Form.Group as={Col} controlId="managerFirstName">
                <Form.Label>Prénom Gérant</Form.Label>
                <FormControl
                  type="text"
                  name="managerFirstName"
                  value={formData.managerFirstName}
                  onChange={handleFormChange}
                  isInvalid={!!formErrors.managerFirstName}
                />
                <Form.Control.Feedback type="invalid">{formErrors.managerFirstName}</Form.Control.Feedback>
              </Form.Group>
              <Form.Group as={Col} controlId="managerLastName">
                <Form.Label>Nom Gérant</Form.Label>
                <FormControl
                  type="text"
                  name="managerLastName"
                  value={formData.managerLastName}
                  onChange={handleFormChange}
                  isInvalid={!!formErrors.managerLastName}
                />
                <Form.Control.Feedback type="invalid">{formErrors.managerLastName}</Form.Control.Feedback>
              </Form.Group>
            </Row>
            <Row className="mb-3">
              <Form.Group as={Col} controlId="managerEmail">
                <Form.Label>Email Gérant</Form.Label>
                <FormControl
                  type="email"
                  name="managerEmail"
                  value={formData.managerEmail}
                  onChange={handleFormChange}
                  isInvalid={!!formErrors.managerEmail}
                />
                <Form.Control.Feedback type="invalid">{formErrors.managerEmail}</Form.Control.Feedback>
              </Form.Group>
              <Form.Group as={Col} controlId="managerPhoneNumber">
                <Form.Label>Téléphone Gérant</Form.Label>
                <FormControl
                  type="text"
                  name="managerPhoneNumber"
                  value={formData.managerPhoneNumber}
                  onChange={handleFormChange}
                  isInvalid={!!formErrors.managerPhoneNumber}
                />
                <Form.Control.Feedback type="invalid">{formErrors.managerPhoneNumber}</Form.Control.Feedback>
              </Form.Group>
            </Row>
            <Form.Group controlId="managerAddress" className="mb-3">
              <Form.Label>Adresse Gérant</Form.Label>
              <FormControl
                type="text"
                name="managerAddress"
                value={formData.managerAddress}
                onChange={handleFormChange}
                isInvalid={!!formErrors.managerAddress}
              />
              <Form.Control.Feedback type="invalid">{formErrors.managerAddress}</Form.Control.Feedback>
            </Form.Group>
            {/* Password field only for creation */}
            {!editMode && (
                <Form.Group controlId="managerPassword" className="mb-3">
                    <Form.Label>Mot de Passe Gérant</Form.Label>
                    <FormControl
                        type="password"
                        name="managerPassword"
                        value={formData.managerPassword}
                        onChange={handleFormChange}
                        isInvalid={!!formErrors.managerPassword}
                    />
                    <Form.Control.Feedback type="invalid">{formErrors.managerPassword}</Form.Control.Feedback>
                </Form.Group>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Annuler
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Spinner size="sm" />{' '}
                  {editMode ? 'Modification...' : 'Création...'}
                </>
              ) : (editMode ? 'Modifier' : 'Créer')}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Municipality Details Modal */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Détails de la Municipalité: {selectedMunicipality?.municipalityName}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loadingDetails ? (
            <div className="text-center py-4">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Chargement des détails...</p>
            </div>
          ) : selectedMunicipality ? (
            <Row>
              <Col xs={12}>
                <Card className="mb-3 shadow-sm">
                  <Card.Header className="bg-light">
                    <h6><FaMapMarkerAlt className="me-2" /> Informations Générales</h6>
                  </Card.Header>
                  <Card.Body>
                    <dl className="row mb-0">
                      <dt className="col-sm-5">ID Municipalité:</dt><dd className="col-sm-7">{selectedMunicipality.id}</dd>
                      <dt className="col-sm-5">Nom Municipalité:</dt><dd className="col-sm-7">{selectedMunicipality.municipalityName}</dd>
                      <dt className="col-sm-5">Province:</dt><dd className="col-sm-7">{selectedMunicipality.province}</dd>
                      <dt className="col-sm-5">Pays:</dt><dd className="col-sm-7">{selectedMunicipality.country}</dd>
                      <dt className="col-sm-5">Population:</dt><dd className="col-sm-7">{selectedMunicipality.population?.toLocaleString()}</dd>
                      <dt className="col-sm-5">Budget Gestion Déchets:</dt><dd className="col-sm-7">{selectedMunicipality.wasteManagementBudget?.toLocaleString('fr-FR', { style: 'currency', currency: 'USD' })}</dd>
                      <dt className="col-sm-5">Statut:</dt>
                      <dd className="col-sm-7">
                          <Badge bg={selectedMunicipality.enabled ? 'success' : 'secondary'}>
                              {selectedMunicipality.enabled ? 'Activée' : 'Désactivée'}
                          </Badge>
                      </dd>
                    </dl>
                  </Card.Body>
                </Card>
              </Col>
              {/* Conditional Display for Municipal Manager details */}
              {selectedMunicipality.manager ? (
                <Col xs={12}>
                  <Card className="shadow-sm">
                    <Card.Header className="bg-light">
                      <h6><FaUsers className="me-2" /> Gérant Municipal Associé</h6>
                    </Card.Header>
                    <Card.Body>
                        <dl className="row mb-0">
                            <dt className="col-sm-5">Nom:</dt>
                            <dd className="col-sm-7">{selectedMunicipality.manager.firstName} {selectedMunicipality.manager.lastName}</dd>
                            <dt className="col-sm-5">Email:</dt>
                            <dd className="col-sm-7">{selectedMunicipality.manager.email}</dd>
                            <dt className="col-sm-5">Téléphone:</dt>
                            <dd className="col-sm-7">{selectedMunicipality.manager.phoneNumber || 'N/A'}</dd>
                            <dt className="col-sm-5">Adresse:</dt>
                            <dd className="col-sm-7">{selectedMunicipality.manager.address || 'N/A'}</dd>
                            <dt className="col-sm-5">Rôle:</dt>
                            <dd className="col-sm-7">
                                <Badge bg="info">{selectedMunicipality.manager.roleName || 'N/A'}</Badge>
                            </dd>
                        </dl>
                    </Card.Body>
                  </Card>
                </Col>
              ) : (
                <Col xs={12}>
                    <Alert variant="info" className="text-center mt-3">
                        Aucun gérant municipal associé à cette municipalité.
                    </Alert>
                </Col>
              )}
            </Row>
          ) : (
            <Alert variant="warning" className="text-center">Impossible de charger les détails de la municipality.</Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
            Fermer
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmer la Suppression</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedMunicipality && (
            <div>
              <p>Êtes-vous sûr de vouloir supprimer la municipalité <strong>{selectedMunicipality.municipalityName}</strong> ?</p>
              <Alert variant="danger">
                Cette action est irréversible et supprimera également tous les ménages, collecteurs et données associées à cette municipalité.
              </Alert>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Annuler
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={loading}>
            {loading ? 'Suppression en cours...' : 'Supprimer Définitivement'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ManageMunicipalities;
