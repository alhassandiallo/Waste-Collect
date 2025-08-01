import React, { useState, useEffect, useContext } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Table, 
  Badge, 
  Button, 
  Modal, 
  Form, 
  Alert, 
  Spinner,
  Dropdown,
  InputGroup,
  Pagination
} from 'react-bootstrap';
import { 
  FaSearch, 
  FaFilter, 
  FaDownload, 
  FaEye, 
  FaCreditCard, 
  FaMobileAlt,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaReceipt,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaExclamationTriangle
} from 'react-icons/fa';
import AuthContext from '../../contexts/AuthContext';
import paymentService from '../../services/paymentService';
import LoadingSpinner from '../../components/LoadingSpinner';

/**
 * Composant PaymentHistory - Affiche l'historique des paiements pour les ménages
 * 
 * Fonctionnalités principales :
 * - Affichage de l'historique des paiements avec pagination
 * - Filtrage par statut, méthode de paiement et période
 * - Recherche par référence de paiement
 * - Visualisation des détails des paiements
 * - Téléchargement des reçus
 * - Interface responsive pour web et mobile
 * - Gestion des différents statuts de paiement
 */
const PaymentHistory = () => {
  // Context d'authentification pour récupérer les infos utilisateur
  const { user } = useContext(AuthContext);

  // États pour la gestion des données
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPayment, setSelectedPayment] = useState(null);

  // États pour les modales
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  // États pour les filtres et la recherche
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [methodFilter, setMethodFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('ALL');
  const [showFilters, setShowFilters] = useState(false);

  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [paymentsPerPage] = useState(10);

  // États pour les statistiques
  const [paymentStats, setPaymentStats] = useState({
    totalAmount: 0,
    successfulPayments: 0,
    pendingPayments: 0,
    failedPayments: 0
  });

  /**
   * Effet pour charger les données au montage du composant
   */
  useEffect(() => {
    if (user && user.id) {
      loadPaymentHistory();
    }
  }, [user]);

  /**
   * Effet pour filtrer les paiements quand les critères changent
   */
  useEffect(() => {
    filterPayments();
  }, [payments, searchTerm, statusFilter, methodFilter, dateFilter]);

  /**
   * Charge l'historique des paiements depuis le backend
   */
  const loadPaymentHistory = async () => {
    try {
      setLoading(true);
      setError('');

      // Appel API pour récupérer l'historique des paiements du ménage
      const response = await paymentService.getPaymentHistoryByHousehold(user.id);
      
      if (response.success) {
        setPayments(response.data);
        calculateStats(response.data);
      } else {
        setError('Erreur lors du chargement de l\'historique des paiements');
      }
    } catch (err) {
      console.error('Erreur lors du chargement des paiements:', err);
      setError('Impossible de charger l\'historique des paiements. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Calcule les statistiques des paiements
   * @param {Array} paymentsData - Tableau des paiements
   */
  const calculateStats = (paymentsData) => {
    const stats = paymentsData.reduce((acc, payment) => {
      acc.totalAmount += payment.amount;
      
      switch (payment.status) {
        case 'COMPLETED':
          acc.successfulPayments++;
          break;
        case 'PENDING':
          acc.pendingPayments++;
          break;
        case 'FAILED':
        case 'CANCELLED':
          acc.failedPayments++;
          break;
        default:
          break;
      }
      
      return acc;
    }, {
      totalAmount: 0,
      successfulPayments: 0,
      pendingPayments: 0,
      failedPayments: 0
    });

    setPaymentStats(stats);
  };

  /**
   * Filtre les paiements selon les critères sélectionnés
   */
  const filterPayments = () => {
    let filtered = [...payments];

    // Filtrage par terme de recherche (référence de paiement)
    if (searchTerm) {
      filtered = filtered.filter(payment =>
        payment.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrage par statut
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(payment => payment.status === statusFilter);
    }

    // Filtrage par méthode de paiement
    if (methodFilter !== 'ALL') {
      filtered = filtered.filter(payment => payment.paymentMethod === methodFilter);
    }

    // Filtrage par période
    if (dateFilter !== 'ALL') {
      const now = new Date();
      const filterDate = new Date();

      switch (dateFilter) {
        case 'LAST_WEEK':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'LAST_MONTH':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case 'LAST_3_MONTHS':
          filterDate.setMonth(now.getMonth() - 3);
          break;
        case 'LAST_YEAR':
          filterDate.setFullYear(now.getFullYear() - 1);
          break;
        default:
          break;
      }

      if (dateFilter !== 'ALL') {
        filtered = filtered.filter(payment => 
          new Date(payment.paymentDate) >= filterDate
        );
      }
    }

    // Tri par date décroissante (plus récent en premier)
    filtered.sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));

    setFilteredPayments(filtered);
    setCurrentPage(1); // Reset à la première page après filtrage
  };

  /**
   * Réinitialise tous les filtres
   */
  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('ALL');
    setMethodFilter('ALL');
    setDateFilter('ALL');
    setShowFilters(false);
  };

  /**
   * Affiche les détails d'un paiement
   * @param {Object} payment - Objet paiement
   */
  const viewPaymentDetails = (payment) => {
    setSelectedPayment(payment);
    setShowDetailsModal(true);
  };

  /**
   * Télécharge le reçu d'un paiement
   * @param {Object} payment - Objet paiement
   */
  const downloadReceipt = async (payment) => {
    try {
      const response = await paymentService.downloadReceipt(payment.id);
      
      if (response.success) {
        // Création d'un lien de téléchargement
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `recu_paiement_${payment.reference}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        setError('Impossible de télécharger le reçu');
      }
    } catch (err) {
      console.error('Erreur lors du téléchargement:', err);
      setError('Erreur lors du téléchargement du reçu');
    }
  };

  /**
   * Retourne l'icône appropriée selon la méthode de paiement
   * @param {string} method - Méthode de paiement
   */
  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'MOBILE_MONEY':
        return <FaMobileAlt className="me-1" />;
      case 'CREDIT_CARD':
        return <FaCreditCard className="me-1" />;
      case 'CASH':
        return <FaMoneyBillWave className="me-1" />;
      default:
        return <FaReceipt className="me-1" />;
    }
  };

  /**
   * Retourne le badge de statut approprié
   * @param {string} status - Statut du paiement
   */
  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge bg="success"><FaCheckCircle className="me-1" />Complété</Badge>;
      case 'PENDING':
        return <Badge bg="warning"><FaClock className="me-1" />En attente</Badge>;
      case 'FAILED':
        return <Badge bg="danger"><FaTimesCircle className="me-1" />Échoué</Badge>;
      case 'CANCELLED':
        return <Badge bg="secondary"><FaTimesCircle className="me-1" />Annulé</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  /**
   * Retourne le libellé de la méthode de paiement
   * @param {string} method - Méthode de paiement
   */
  const getPaymentMethodLabel = (method) => {
    switch (method) {
      case 'MOBILE_MONEY':
        return 'Argent Mobile';
      case 'CREDIT_CARD':
        return 'Carte de Crédit';
      case 'CASH':
        return 'Espèces';
      default:
        return method;
    }
  };

  /**
   * Formate la date en format français
   * @param {string} date - Date à formater
   */
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  /**
   * Formate le montant en devise locale
   * @param {number} amount - Montant à formater
   */
  const formatAmount = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'GNF' // Franc guinéen
    }).format(amount);
  };

  // Calcul de la pagination
  const indexOfLastPayment = currentPage * paymentsPerPage;
  const indexOfFirstPayment = indexOfLastPayment - paymentsPerPage;
  const currentPayments = filteredPayments.slice(indexOfFirstPayment, indexOfLastPayment);
  const totalPages = Math.ceil(filteredPayments.length / paymentsPerPage);

  // Affichage du loading
  if (loading) {
    return <LoadingSpinner message="Chargement de l'historique des paiements..." />;
  }

  return (
    <Container fluid className="py-4">
      {/* En-tête avec statistiques */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="mb-0">
              <FaReceipt className="me-2" />
              Historique des Paiements
            </h2>
            <Button 
              variant="outline-primary" 
              onClick={() => setShowFilters(!showFilters)}
            >
              <FaFilter className="me-1" />
              Filtres
            </Button>
          </div>

          {/* Cartes de statistiques */}
          <Row className="g-3 mb-4">
            <Col xs={12} sm={6} lg={3}>
              <Card className="h-100 border-success">
                <Card.Body className="text-center">
                  <FaCheckCircle className="text-success mb-2" size={24} />
                  <h6 className="text-muted">Paiements Réussis</h6>
                  <h4 className="text-success">{paymentStats.successfulPayments}</h4>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} sm={6} lg={3}>
              <Card className="h-100 border-warning">
                <Card.Body className="text-center">
                  <FaClock className="text-warning mb-2" size={24} />
                  <h6 className="text-muted">En Attente</h6>
                  <h4 className="text-warning">{paymentStats.pendingPayments}</h4>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} sm={6} lg={3}>
              <Card className="h-100 border-danger">
                <Card.Body className="text-center">
                  <FaExclamationTriangle className="text-danger mb-2" size={24} />
                  <h6 className="text-muted">Échoués</h6>
                  <h4 className="text-danger">{paymentStats.failedPayments}</h4>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} sm={6} lg={3}>
              <Card className="h-100 border-primary">
                <Card.Body className="text-center">
                  <FaMoneyBillWave className="text-primary mb-2" size={24} />
                  <h6 className="text-muted">Total Payé</h6>
                  <h4 className="text-primary">{formatAmount(paymentStats.totalAmount)}</h4>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>

      {/* Section des filtres (masquable) */}
      {showFilters && (
        <Row className="mb-4">
          <Col>
            <Card>
              <Card.Header>
                <h6 className="mb-0">Filtres et Recherche</h6>
              </Card.Header>
              <Card.Body>
                <Row className="g-3">
                  {/* Barre de recherche */}
                  <Col xs={12} md={6} lg={4}>
                    <Form.Label>Rechercher</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>
                        <FaSearch />
                      </InputGroup.Text>
                      <Form.Control
                        type="text"
                        placeholder="Référence ou description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </InputGroup>
                  </Col>

                  {/* Filtre par statut */}
                  <Col xs={12} md={6} lg={2}>
                    <Form.Label>Statut</Form.Label>
                    <Form.Select 
                      value={statusFilter} 
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="ALL">Tous</option>
                      <option value="COMPLETED">Complété</option>
                      <option value="PENDING">En attente</option>
                      <option value="FAILED">Échoué</option>
                      <option value="CANCELLED">Annulé</option>
                    </Form.Select>
                  </Col>

                  {/* Filtre par méthode */}
                  <Col xs={12} md={6} lg={2}>
                    <Form.Label>Méthode</Form.Label>
                    <Form.Select 
                      value={methodFilter} 
                      onChange={(e) => setMethodFilter(e.target.value)}
                    >
                      <option value="ALL">Toutes</option>
                      <option value="MOBILE_MONEY">Argent Mobile</option>
                      <option value="CREDIT_CARD">Carte de Crédit</option>
                      <option value="CASH">Espèces</option>
                    </Form.Select>
                  </Col>

                  {/* Filtre par période */}
                  <Col xs={12} md={6} lg={2}>
                    <Form.Label>Période</Form.Label>
                    <Form.Select 
                      value={dateFilter} 
                      onChange={(e) => setDateFilter(e.target.value)}
                    >
                      <option value="ALL">Toutes</option>
                      <option value="LAST_WEEK">7 derniers jours</option>
                      <option value="LAST_MONTH">30 derniers jours</option>
                      <option value="LAST_3_MONTHS">3 derniers mois</option>
                      <option value="LAST_YEAR">Dernière année</option>
                    </Form.Select>
                  </Col>

                  {/* Bouton de réinitialisation */}
                  <Col xs={12} md={6} lg={2} className="d-flex align-items-end">
                    <Button 
                      variant="outline-secondary" 
                      onClick={resetFilters}
                      className="w-100"
                    >
                      Réinitialiser
                    </Button>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Affichage des erreurs */}
      {error && (
        <Row className="mb-4">
          <Col>
            <Alert variant="danger" dismissible onClose={() => setError('')}>
              {error}
            </Alert>
          </Col>
        </Row>
      )}

      {/* Tableau des paiements */}
      <Row>
        <Col>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h6 className="mb-0">
                Historique ({filteredPayments.length} paiement{filteredPayments.length > 1 ? 's' : ''})
              </h6>
              {filteredPayments.length > 0 && (
                <small className="text-muted">
                  Page {currentPage} sur {totalPages}
                </small>
              )}
            </Card.Header>
            <Card.Body className="p-0">
              {filteredPayments.length === 0 ? (
                <div className="text-center py-5">
                  <FaReceipt size={48} className="text-muted mb-3" />
                  <h5 className="text-muted">Aucun paiement trouvé</h5>
                  <p className="text-muted">
                    {payments.length === 0 
                      ? "Vous n'avez effectué aucun paiement pour le moment."
                      : "Aucun paiement ne correspond aux critères de recherche."
                    }
                  </p>
                  {payments.length > 0 && (
                    <Button variant="outline-primary" onClick={resetFilters}>
                      Voir tous les paiements
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  {/* Version desktop */}
                  <div className="d-none d-md-block">
                    <Table responsive hover className="mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Référence</th>
                          <th>Date</th>
                          <th>Montant</th>
                          <th>Méthode</th>
                          <th>Statut</th>
                          <th>Service</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentPayments.map((payment) => (
                          <tr key={payment.id}>
                            <td>
                              <code>{payment.reference}</code>
                            </td>
                            <td>
                              <small>{formatDate(payment.paymentDate)}</small>
                            </td>
                            <td>
                              <strong>{formatAmount(payment.amount)}</strong>
                            </td>
                            <td>
                              {getPaymentMethodIcon(payment.paymentMethod)}
                              {getPaymentMethodLabel(payment.paymentMethod)}
                            </td>
                            <td>
                              {getStatusBadge(payment.status)}
                            </td>
                            <td>
                              <small className="text-muted">
                                {payment.description || 'Service de collecte'}
                              </small>
                            </td>
                            <td>
                              <div className="d-flex gap-1">
                                <Button
                                  size="sm"
                                  variant="outline-primary"
                                  onClick={() => viewPaymentDetails(payment)}
                                  title="Voir les détails"
                                >
                                  <FaEye />
                                </Button>
                                {payment.status === 'COMPLETED' && (
                                  <Button
                                    size="sm"
                                    variant="outline-success"
                                    onClick={() => downloadReceipt(payment)}
                                    title="Télécharger le reçu"
                                  >
                                    <FaDownload />
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>

                  {/* Version mobile */}
                  <div className="d-md-none">
                    {currentPayments.map((payment) => (
                      <Card key={payment.id} className="mb-2 mx-2">
                        <Card.Body className="p-3">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div>
                              <code className="text-primary">{payment.reference}</code>
                              <br />
                              <small className="text-muted">
                                {formatDate(payment.paymentDate)}
                              </small>
                            </div>
                            {getStatusBadge(payment.status)}
                          </div>
                          
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <div>
                              <strong className="text-success">
                                {formatAmount(payment.amount)}
                              </strong>
                              <br />
                              <small className="text-muted">
                                {getPaymentMethodIcon(payment.paymentMethod)}
                                {getPaymentMethodLabel(payment.paymentMethod)}
                              </small>
                            </div>
                            <div className="d-flex gap-1">
                              <Button
                                size="sm"
                                variant="outline-primary"
                                onClick={() => viewPaymentDetails(payment)}
                              >
                                <FaEye />
                              </Button>
                              {payment.status === 'COMPLETED' && (
                                <Button
                                  size="sm"
                                  variant="outline-success"
                                  onClick={() => downloadReceipt(payment)}
                                >
                                  <FaDownload />
                                </Button>
                              )}
                            </div>
                          </div>
                          
                          {payment.description && (
                            <small className="text-muted">
                              {payment.description}
                            </small>
                          )}
                        </Card.Body>
                      </Card>
                    ))}
                  </div>
                </>
              )}
            </Card.Body>

            {/* Pagination */}
            {totalPages > 1 && (
              <Card.Footer>
                <div className="d-flex justify-content-center">
                  <Pagination>
                    <Pagination.First 
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                    />
                    <Pagination.Prev 
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    />
                    
                    {[...Array(Math.min(5, totalPages))].map((_, index) => {
                      const pageNumber = Math.max(1, currentPage - 2) + index;
                      if (pageNumber <= totalPages) {
                        return (
                          <Pagination.Item
                            key={pageNumber}
                            active={pageNumber === currentPage}
                            onClick={() => setCurrentPage(pageNumber)}
                          >
                            {pageNumber}
                          </Pagination.Item>
                        );
                      }
                      return null;
                    })}
                    
                    <Pagination.Next 
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                    />
                    <Pagination.Last 
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                    />
                  </Pagination>
                </div>
              </Card.Footer>
            )}
          </Card>
        </Col>
      </Row>

      {/* Modal des détails du paiement */}
      <Modal 
        show={showDetailsModal} 
        onHide={() => setShowDetailsModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <FaReceipt className="me-2" />
            Détails du Paiement
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedPayment && (
            <Row className="g-3">
              <Col xs={12} md={6}>
                <Card className="h-100">
                  <Card.Header>
                    <h6 className="mb-0">Informations Générales</h6>
                  </Card.Header>
                  <Card.Body>
                    <div className="mb-3">
                      <strong>Référence:</strong>
                      <br />
                      <code>{selectedPayment.reference}</code>
                    </div>
                    <div className="mb-3">
                      <strong>Montant:</strong>
                      <br />
                      <span className="h5 text-success">
                        {formatAmount(selectedPayment.amount)}
                      </span>
                    </div>
                    <div className="mb-3">
                      <strong>Statut:</strong>
                      <br />
                      {getStatusBadge(selectedPayment.status)}
                    </div>
                    <div className="mb-0">
                      <strong>Date:</strong>
                      <br />
                      <FaCalendarAlt className="me-1" />
                      {formatDate(selectedPayment.paymentDate)}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              
              <Col xs={12} md={6}>
                <Card className="h-100">
                  <Card.Header>
                    <h6 className="mb-0">Détails du Paiement</h6>
                  </Card.Header>
                  <Card.Body>
                    <div className="mb-3">
                      <strong>Méthode de Paiement:</strong>
                      <br />
                      {getPaymentMethodIcon(selectedPayment.paymentMethod)}
                      {getPaymentMethodLabel(selectedPayment.paymentMethod)}
                    </div>
                    {selectedPayment.transactionId && (
                      <div className="mb-3">
                        <strong>ID Transaction:</strong>
                        <br />
                        <code>{selectedPayment.transactionId}</code>
                      </div>
                    )}
                    <div className="mb-3">
                      <strong>Description:</strong>
                      <br />
                      {selectedPayment.description || 'Service de collecte de déchets'}
                    </div>
                    {selectedPayment.notes && (
                      <div className="mb-0">
                        <strong>Notes:</strong>
                        <br />
                        <small className="text-muted">
                          {selectedPayment.notes}
                        </small>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>
              
              {selectedPayment.serviceRequest && (
                <Col xs={12}>
                  <Card>
                    <Card.Header>
                      <h6 className="mb-0">Service Associé</h6>
                    </Card.Header>
                    <Card.Body>
                      <div className="mb-2">
                        <strong>Demande de Service:</strong> #{selectedPayment.serviceRequest.id}
                      </div>
                      <div className="mb-2">
                        <strong>Type de Service:</strong> {selectedPayment.serviceRequest.serviceType}
                      </div>
                      {selectedPayment.serviceRequest.collector && (
                        <div className="mb-0">
                          <strong>Collecteur:</strong> {selectedPayment.serviceRequest.collector.name}
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              )}
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          {selectedPayment && selectedPayment.status === 'COMPLETED' && (
            <Button
              variant="success"
              onClick={() => downloadReceipt(selectedPayment)}
            >
              <FaDownload className="me-1" />
              Télécharger le Reçu
            </Button>
          )}
          <Button 
            variant="secondary" 
            onClick={() => setShowDetailsModal(false)}
          >
            Fermer
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal d'affichage du reçu (optionnel pour future implémentation) */}
      <Modal 
        show={showReceiptModal} 
        onHide={() => setShowReceiptModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <FaReceipt className="me-2" />
            Reçu de Paiement
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedPayment && (
            <div className="receipt-container p-4">
              {/* En-tête du reçu */}
              <div className="text-center mb-4 border-bottom pb-3">
                <h4 className="mb-1">WasteCollect Platform</h4>
                <p className="text-muted mb-0">Reçu de Paiement</p>
              </div>

              {/* Corps du reçu */}
              <Row className="mb-3">
                <Col xs={6}>
                  <strong>Référence:</strong>
                  <br />
                  <code>{selectedPayment.reference}</code>
                </Col>
                <Col xs={6} className="text-end">
                  <strong>Date:</strong>
                  <br />
                  {formatDate(selectedPayment.paymentDate)}
                </Col>
              </Row>

              <Row className="mb-3">
                <Col xs={6}>
                  <strong>Client:</strong>
                  <br />
                  {user.firstName} {user.lastName}
                  <br />
                  <small className="text-muted">{user.email}</small>
                </Col>
                <Col xs={6} className="text-end">
                  <strong>Statut:</strong>
                  <br />
                  {getStatusBadge(selectedPayment.status)}
                </Col>
              </Row>

              <hr />

              <Row className="mb-3">
                <Col xs={8}>
                  <strong>Service:</strong>
                  <br />
                  {selectedPayment.description || 'Service de collecte de déchets'}
                </Col>
                <Col xs={4} className="text-end">
                  <strong>Montant:</strong>
                  <br />
                  <span className="h5 text-success">
                    {formatAmount(selectedPayment.amount)}
                  </span>
                </Col>
              </Row>

              <hr />

              <Row className="mb-3">
                <Col xs={6}>
                  <strong>Méthode de Paiement:</strong>
                  <br />
                  {getPaymentMethodIcon(selectedPayment.paymentMethod)}
                  {getPaymentMethodLabel(selectedPayment.paymentMethod)}
                </Col>
                {selectedPayment.transactionId && (
                  <Col xs={6} className="text-end">
                    <strong>Transaction ID:</strong>
                    <br />
                    <code>{selectedPayment.transactionId}</code>
                  </Col>
                )}
              </Row>

              {/* Pied du reçu */}
              <div className="text-center mt-4 pt-3 border-top">
                <small className="text-muted">
                  Merci pour votre paiement !
                  <br />
                  Ce reçu est généré automatiquement et ne nécessite pas de signature.
                </small>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="success"
            onClick={() => {
              if (selectedPayment) {
                downloadReceipt(selectedPayment);
              }
            }}
          >
            <FaDownload className="me-1" />
            Télécharger PDF
          </Button>
          <Button 
            variant="secondary" 
            onClick={() => setShowReceiptModal(false)}
          >
            Fermer
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Styles CSS personnalisés pour l'impression */}
      <style jsx>{`
        .receipt-container {
          background: white;
          font-family: 'Courier New', monospace;
        }
        
        @media print {
          .receipt-container {
            box-shadow: none;
            border: none;
          }
          
          .modal-header,
          .modal-footer {
            display: none !important;
          }
        }
        
        /* Styles responsives pour les petits écrans */
        @media (max-width: 768px) {
          .table-responsive {
            font-size: 0.875rem;
          }
          
          .btn-sm {
            padding: 0.25rem 0.5rem;
            font-size: 0.75rem;
          }
          
          .pagination {
            font-size: 0.875rem;
          }
          
          .card-body {
            padding: 1rem;
          }
        }
        
        /* Animation pour le chargement */
        .loading-fade {
          opacity: 0.6;
          transition: opacity 0.3s ease;
        }
        
        /* Styles pour les badges de statut */
        .badge {
          font-size: 0.75rem;
          padding: 0.35em 0.65em;
        }
        
        /* Amélioration de l'apparence des cartes statistiques */
        .border-success { border-left: 4px solid #28a745 !important; }
        .border-warning { border-left: 4px solid #ffc107 !important; }
        .border-danger { border-left: 4px solid #dc3545 !important; }
        .border-primary { border-left: 4px solid #007bff !important; }
        
        /* Style pour les codes de référence */
        code {
          background-color: #f8f9fa;
          padding: 0.2rem 0.4rem;
          border-radius: 0.25rem;
          font-size: 0.875em;
        }
        
        /* Hover effects pour les lignes du tableau */
        .table-hover tbody tr:hover {
          background-color: rgba(0, 123, 255, 0.05);
        }
        
        /* Animation pour les filtres */
        .filter-slide {
          animation: slideDown 0.3s ease-out;
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </Container>
  );
};

export default PaymentHistory;