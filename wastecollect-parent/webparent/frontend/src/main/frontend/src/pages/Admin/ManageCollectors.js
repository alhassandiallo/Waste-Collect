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
  Pagination,
} from 'react-bootstrap'; 
import { useNavigate, Link } from 'react-router-dom'; 
import adminService from '../../services/adminService'; 
import userService from '../../services/userService'; 
import { FaPlus, FaEdit, FaTrash, FaSearch, FaEye, FaFilter, FaUsers, FaMapMarkerAlt, FaPhone, FaEnvelope, FaSyncAlt } from 'react-icons/fa'; 

/**
 * Composant ManageCollectors - Interface d'administration pour la gestion des collecteurs
 * * Fonctionnalités principales :
 * - Affichage de la liste des collecteurs avec pagination
 * - Création de nouveaux collecteurs
 * - Modification des informations des collecteurs
 * - Suppression des collecteurs
 * - Filtrage et recherche
 * - Gestion du statut des collecteurs (actif/inactif)
 * - Visualisation des performances
 */
const ManageCollectors = () => {
  const navigate = useNavigate();

  // États pour la gestion de la liste des collecteurs
  const [collectors, setCollectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0); // Added for total elements count
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // États pour les modaux
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false); // Renamed for clarity

  // États pour les données des formulaires
  const [newCollector, setNewCollector] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
    address: '',
    status: 'ACTIVE', // Default status
    municipalityName: '', // For new collector creation
  });

  const [editCollector, setEditCollector] = useState({
    id: null,
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    address: '',
    status: '',
    municipalityName: '',
  });

  const [selectedCollector, setSelectedCollector] = useState(null);

  // États pour la recherche et le filtrage
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterMunicipality, setFilterMunicipality] = useState(''); // New filter for municipality

  // États pour la validation des formulaires
  const [formErrors, setFormErrors] = useState({});

  /**
   * Valide les champs du formulaire de création/édition
   * @param {Object} data - Les données du formulaire
   * @param {boolean} isCreate - Vrai si c'est un formulaire de création
   * @returns {Object} - Erreurs de validation
   */
  const validateForm = (data, isCreate = false) => {
    let errors = {};
    if (!data.firstName.trim()) errors.firstName = 'Le prénom est requis.';
    if (!data.lastName.trim()) errors.lastName = 'Le nom est requis.';
    if (!data.email.trim()) {
      errors.email = 'L\'email est requis.';
    } else if (!/\S+@\S+\.\S+/.test(data.email)) {
      errors.email = 'Format d\'email invalide.';
    }
    if (isCreate && !data.password.trim()) errors.password = 'Le mot de passe est requis.';
    if (isCreate && data.password.trim() && data.password.trim().length < 6) {
      errors.password = 'Le mot de passe doit contenir au moins 6 caractères.';
    }
    if (!data.phoneNumber.trim()) errors.phoneNumber = 'Le numéro de téléphone est requis.';
    if (!data.municipalityName.trim()) errors.municipalityName = 'Le nom de la municipalité est requis.';
    
    return errors;
  };

  /**
   * Fonction asynchrone pour charger les collecteurs depuis l'API.
   * @param {number} page - Numéro de page à charger (0-indexé).
   */
  const fetchCollectors = async (page = currentPage) => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null); // Clear success messages on new fetch
    try {
      const response = await adminService.getAllCollectors({
        page: page,
        size: 10,
        search: searchTerm,
        status: filterStatus,
        municipality: filterMunicipality,
      });
      setCollectors(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
      setCurrentPage(page);
    } catch (err) {
      console.error('Erreur lors du chargement des collecteurs:', err);
      setError(err.message || 'Échec du chargement des collecteurs.');
    } finally {
      setLoading(false);
    }
  };

  // Effet pour charger les collecteurs au montage du composant ou au changement de page/filtres
  useEffect(() => {
    fetchCollectors();
  }, [currentPage, searchTerm, filterStatus, filterMunicipality]); // Depend on filters and search term

  // Gestionnaires de changement pour les formulaires
  const handleNewChange = (e) => {
    const { name, value } = e.target;
    setNewCollector((prev) => ({ ...prev, [name]: value }));
    // Clear error for the field being edited
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditCollector((prev) => ({ ...prev, [name]: value }));
     // Clear error for the field being edited
     if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // ==================== CRUD OPERATIONS ====================

  /**
   * Ouvre le modal de création et réinitialise le formulaire.
   */
  const handleCreateClick = () => {
    setNewCollector({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      phoneNumber: '',
      address: '',
      status: 'ACTIVE', // Default status
      municipalityName: '',
    });
    setFormErrors({});
    setError(null);
    setShowCreateModal(true);
  };

  /**
   * Gère la soumission du formulaire de création.
   */
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    const errors = validateForm(newCollector, true);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setLoading(false);
      return;
    }

    try {
      await adminService.createCollector(newCollector);
      setSuccessMessage('Collecteur créé avec succès !');
      setShowCreateModal(false);
      fetchCollectors(); // Recharger la liste
    } catch (err) {
      console.error('Erreur lors de la création du collecteur:', err);
      setError(err.message || 'Échec de la création du collecteur.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Ouvre le modal d'édition avec les données du collecteur sélectionné.
   * @param {Long} id - L'ID du collecteur à éditer.
   */
  const handleEdit = (id) => {
    const collectorToEdit = collectors.find((c) => c.id === id);
    if (collectorToEdit) {
      setEditCollector({
        id: collectorToEdit.id,
        firstName: collectorToEdit.firstName,
        lastName: collectorToEdit.lastName,
        email: collectorToEdit.email,
        phoneNumber: collectorToEdit.phoneNumber,
        address: collectorToEdit.address,
        status: collectorToEdit.status,
        municipalityName: collectorToEdit.municipalityName || '', // Ensure it's a string
      });
      setFormErrors({});
      setError(null);
      setShowEditModal(true);
    }
  };

  /**
   * Gère la soumission du formulaire d'édition.
   */
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    const errors = validateForm(editCollector);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setLoading(false);
      return;
    }

    try {
      await adminService.updateCollector(editCollector.id, {
        firstName: editCollector.firstName,
        lastName: editCollector.lastName,
        email: editCollector.email,
        phoneNumber: editCollector.phoneNumber,
        address: editCollector.address,
        status: editCollector.status,
        // municipalityName is not part of update DTO for collector
      });
      setSuccessMessage('Collecteur mis à jour avec succès !');
      setShowEditModal(false);
      fetchCollectors(); // Recharger la liste
    } catch (err) {
      console.error('Erreur lors de la mise à jour du collecteur:', err);
      setError(err.message || 'Échec de la mise à jour du collecteur.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Prépare le modal de confirmation de suppression.
   * @param {Object} collector - Le collecteur à supprimer.
   */
  const handleDeleteClick = (collector) => {
    setSelectedCollector(collector);
    setDeleteModalOpen(true);
  };

  /**
   * Gère la suppression d'un collecteur.
   */
  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      await adminService.deleteCollector(selectedCollector.id);
      setSuccessMessage('Collecteur supprimé avec succès !');
      setDeleteModalOpen(false);
      setSelectedCollector(null);
      fetchCollectors(); // Recharger la liste
    } catch (err) {
      console.error('Erreur lors de la suppression du collecteur:', err);
      setError(err.message || 'Échec de la suppression du collecteur.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Affiche les détails d'un collecteur.
   * @param {Long} id - L'ID du collecteur dont on veut voir les détails.
   */
  const handleViewDetails = (id) => {
    const collectorDetails = collectors.find((c) => c.id === id);
    if (collectorDetails) {
      setSelectedCollector(collectorDetails);
      setShowDetailsModal(true);
    }
  };

  // ==================== PAGINATION & FILTERS ====================

  /**
   * Gère le changement de page de la pagination.
   * @param {number} pageNumber - Le numéro de page vers lequel naviguer.
   */
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  /**
   * Gère la soumission du formulaire de recherche/filtrage.
   * Re-fetches data for the current page with new filters.
   */
  const handleFilterSearch = () => {
    setCurrentPage(0); // Reset to first page on new search/filter
    fetchCollectors(0); // Fetch data with new filters
  };

  /**
   * Réinitialise tous les filtres et la recherche.
   */
  const handleResetFilters = () => {
    setSearchTerm('');
    setFilterStatus('');
    setFilterMunicipality('');
    setCurrentPage(0); // Reset to first page
    fetchCollectors(0); // Fetch data without filters
  };

  // ==================== RENDERING ====================

  return (
    <Container className="my-4">
      
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">
          <FaUsers className="me-2" /> Gestion des Collecteurs
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
      {successMessage && <Alert variant="success">{successMessage}</Alert>}

      <Card className="mb-4 shadow-sm">
        <Card.Header as="h5" className="bg-primary text-white d-flex justify-content-between align-items-center">
          Liste des Collecteurs
          <Button variant="light" onClick={handleCreateClick} disabled={loading}>
            <FaPlus className="me-2" />Ajouter un Collecteur
          </Button>
        </Card.Header>
        <Card.Body>
          {/* Filter and Search Section */}
          <Row className="mb-3 g-2">
            <Col md={4}>
              <InputGroup>
                <InputGroup.Text><FaSearch /></InputGroup.Text>
                <FormControl
                  placeholder="Rechercher par nom, prénom ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => { if (e.key === 'Enter') handleFilterSearch(); }}
                />
              </InputGroup>
            </Col>
            <Col md={3}>
              <Form.Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">Filtrer par Statut</option>
                <option value="ACTIVE">Actif</option>
                <option value="INACTIVE">Inactif</option>
                <option value="ON_LEAVE">En congé</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <FormControl
                placeholder="Filtrer par Municipalité"
                value={filterMunicipality}
                onChange={(e) => setFilterMunicipality(e.target.value)}
                onKeyPress={(e) => { if (e.key === 'Enter') handleFilterSearch(); }}
              />
            </Col>
            <Col md={2}>
              <Button variant="outline-primary" onClick={handleFilterSearch} className="me-2">
                <FaFilter className="me-1" />Filtrer
              </Button>
              <Button variant="outline-secondary" onClick={handleResetFilters}>
                <FaSyncAlt className="me-1" />Reset
              </Button>
            </Col>
          </Row>

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Chargement...</span>
              </Spinner>
              <p className="mt-2">Chargement des collecteurs...</p>
            </div>
          ) : collectors.length === 0 ? (
            <Alert variant="info" className="text-center">
              Aucun collecteur trouvé.
            </Alert>
          ) : (
            <>
              <Table striped bordered hover responsive className="mb-4">
                <thead>
                  <tr>
                    <th>ID Collecteur</th> {/* Corrected header for the custom ID */}
                    <th>Nom</th>
                    <th>Email</th>
                    <th>Téléphone</th>
                    <th>Municipalité</th>
                    <th>Statut</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {collectors.map((collector) => (
                    <tr key={collector.id}>
                      {/* IMPORTANT: Display collector.collectorId, not collector.id */}
                      <td>{collector.collectorId}</td> 
                      <td>{collector.firstName} {collector.lastName}</td>
                      <td>{collector.email}</td>
                      <td>{collector.phoneNumber}</td>
                      <td>{collector.municipalityName}</td>
                      <td>
                        <Badge bg={collector.status === 'ACTIVE' ? 'success' : (collector.status === 'INACTIVE' ? 'danger' : 'warning')}>
                          {collector.status}
                        </Badge>
                      </td>
                      <td className="text-center">
                        <Button variant="info" size="sm" className="me-2" onClick={() => handleViewDetails(collector.id)}><FaEye /></Button>
                        <Button variant="primary" size="sm" className="me-2" onClick={() => handleEdit(collector.id)}><FaEdit /></Button>
                        <Button variant="danger" size="sm" onClick={() => handleDeleteClick(collector)}><FaTrash /></Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <Row className="justify-content-md-center">
                <Col md="auto">
                  <Pagination>
                    <Pagination.First onClick={() => handlePageChange(0)} disabled={currentPage === 0} />
                    <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 0} />
                    {[...Array(totalPages)].map((_, index) => (
                      <Pagination.Item
                        key={index}
                        active={index === currentPage}
                        onClick={() => handlePageChange(index)}
                      >
                        {index + 1}
                      </Pagination.Item>
                    ))}
                    <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages - 1} />
                    <Pagination.Last onClick={() => handlePageChange(totalPages - 1)} disabled={currentPage === totalPages - 1} />
                  </Pagination>
                </Col>
              </Row>
              <p className="text-center mt-3">
                Affichage de {collectors.length} collecteurs sur {totalElements} au total. Page {currentPage + 1} sur {totalPages}.
              </p>
            </>
          )}
        </Card.Body>
      </Card>

      {/* Create Collector Modal */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Ajouter un nouveau Collecteur</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleCreateSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Prénom</Form.Label>
                  <Form.Control
                    type="text"
                    name="firstName"
                    value={newCollector.firstName}
                    onChange={handleNewChange}
                    isInvalid={!!formErrors.firstName}
                  />
                  <Form.Control.Feedback type="invalid">{formErrors.firstName}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nom</Form.Label>
                  <Form.Control
                    type="text"
                    name="lastName"
                    value={newCollector.lastName}
                    onChange={handleNewChange}
                    isInvalid={!!formErrors.lastName}
                  />
                  <Form.Control.Feedback type="invalid">{formErrors.lastName}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={newCollector.email}
                onChange={handleNewChange}
                isInvalid={!!formErrors.email}
              />
              <Form.Control.Feedback type="invalid">{formErrors.email}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Mot de passe</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={newCollector.password}
                onChange={handleNewChange}
                isInvalid={!!formErrors.password}
              />
              <Form.Control.Feedback type="invalid">{formErrors.password}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Téléphone</Form.Label>
              <Form.Control
                type="text"
                name="phoneNumber"
                value={newCollector.phoneNumber}
                onChange={handleNewChange}
                isInvalid={!!formErrors.phoneNumber}
              />
              <Form.Control.Feedback type="invalid">{formErrors.phoneNumber}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Adresse</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="address"
                value={newCollector.address}
                onChange={handleNewChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Statut</Form.Label>
              <Form.Select
                name="status"
                value={newCollector.status}
                onChange={handleNewChange}
              >
                <option value="ACTIVE">Actif</option>
                <option value="INACTIVE">Inactif</option>
                <option value="ON_LEAVE">En congé</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Municipalité</Form.Label>
              <Form.Control
                type="text"
                name="municipalityName"
                value={newCollector.municipalityName}
                onChange={handleNewChange}
                isInvalid={!!formErrors.municipalityName}
              />
              <Form.Control.Feedback type="invalid">{formErrors.municipalityName}</Form.Control.Feedback>
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100" disabled={loading}>
              {loading ? <Spinner animation="border" size="sm" /> : 'Ajouter Collecteur'}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Edit Collector Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Modifier Collecteur</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleEditSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Prénom</Form.Label>
                  <Form.Control
                    type="text"
                    name="firstName"
                    value={editCollector.firstName}
                    onChange={handleEditChange}
                    isInvalid={!!formErrors.firstName}
                  />
                  <Form.Control.Feedback type="invalid">{formErrors.firstName}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nom</Form.Label>
                  <Form.Control
                    type="text"
                    name="lastName"
                    value={editCollector.lastName}
                    onChange={handleEditChange}
                    isInvalid={!!formErrors.lastName}
                  />
                  <Form.Control.Feedback type="invalid">{formErrors.lastName}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={editCollector.email}
                onChange={handleEditChange}
                isInvalid={!!formErrors.email}
              />
              <Form.Control.Feedback type="invalid">{formErrors.email}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Téléphone</Form.Label>
              <Form.Control
                type="text"
                name="phoneNumber"
                value={editCollector.phoneNumber}
                onChange={handleEditChange}
                isInvalid={!!formErrors.phoneNumber}
              />
              <Form.Control.Feedback type="invalid">{formErrors.phoneNumber}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Adresse</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="address"
                value={editCollector.address}
                onChange={handleEditChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Statut</Form.Label>
              <Form.Select
                name="status"
                value={editCollector.status}
                onChange={handleEditChange}
              >
                <option value="ACTIVE">Actif</option>
                <option value="INACTIVE">Inactif</option>
                <option value="ON_LEAVE">En congé</option>
              </Form.Select>
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100" disabled={loading}>
              {loading ? <Spinner animation="border" size="sm" /> : 'Mettre à jour'}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Details Modal */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Détails du Collecteur</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedCollector ? (
            <Row>
              <Col>
                <Card>
                  <Card.Body>
                    <Card.Title className="text-primary mb-3">
                      <FaUsers className="me-2" />
                      {selectedCollector.firstName} {selectedCollector.lastName}
                    </Card.Title>
                    <dl className="row">
                      <dt className="col-sm-4">ID Collecteur:</dt>
                      {/* Display the human-readable collectorId */}
                      <dd className="col-sm-8">{selectedCollector.collectorId}</dd> 

                      <dt className="col-sm-4">Email:</dt>
                      <dd className="col-sm-8">
                        <FaEnvelope className="me-1" />{selectedCollector.email}
                      </dd>

                      <dt className="col-sm-4">Téléphone:</dt>
                      <dd className="col-sm-8">
                        <FaPhone className="me-1" />{selectedCollector.phoneNumber}
                      </dd>

                      <dt className="col-sm-4">Adresse:</dt>
                      <dd className="col-sm-8">
                        <FaMapMarkerAlt className="me-1" />{selectedCollector.address || 'N/A'}
                      </dd>

                      <dt className="col-sm-4">Municipalité:</dt>
                      <dd className="col-sm-8">
                        <FaMapMarkerAlt className="me-1" />{selectedCollector.municipalityName || 'Non assignée'}
                      </dd>

                      <dt className="col-sm-4">Statut:</dt>
                      <dd className="col-sm-8">
                        <Badge bg={selectedCollector.status === 'ACTIVE' ? 'success' : (selectedCollector.status === 'INACTIVE' ? 'danger' : 'warning')}>
                          {selectedCollector.status}
                        </Badge>
                      </dd>
                      {/* Add more collector-specific details here like assigned routes, performance metrics etc. */}
                    </dl>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          ) : (
            <Alert variant="warning" className="text-center">Impossible de charger les détails du collecteur.</Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
            Fermer
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={deleteModalOpen} onHide={() => setDeleteModalOpen(false)} centered> 
        <Modal.Header closeButton> 
          <Modal.Title>Confirmer la Suppression</Modal.Title>
        </Modal.Header>
        <Modal.Body> 
          Êtes-vous sûr de vouloir supprimer le collecteur <strong>
            {selectedCollector?.firstName} {selectedCollector?.lastName}
          </strong> ? Cette action est irréversible.
        </Modal.Body>
        <Modal.Footer> 
          <Button variant="secondary" onClick={() => setDeleteModalOpen(false)}> 
            Annuler
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={loading}> 
            {loading ? 'Suppression en cours...' : 'Supprimer'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ManageCollectors;
