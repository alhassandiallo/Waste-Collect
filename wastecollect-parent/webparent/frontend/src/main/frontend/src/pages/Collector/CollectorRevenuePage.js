// frontend/src/pages/Collector/CollectorRevenuePage.js
import React, { useState, useEffect, useContext } from 'react';
import { Card, Container, Row, Col, Button, Table, Alert, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../contexts/AuthContext';
import collectorService from '../../services/collectorService'; // Using collectorService for revenue
import LoadingSpinner from '../../components/LoadingSpinner';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

/**
 * CollectorRevenuePage Component
 * Cette page affiche des informations détaillées sur les revenus mobiles du collecteur,
 * y compris l'historique des transactions, les résumés des gains et les méthodes de paiement.
 */
const CollectorRevenuePage = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Fetches the collector's mobile revenue data.
   */
  const loadRevenueData = async () => {
    // Ensure user and user.id are available before fetching data
    if (!user || !user.id) {
      setLoading(false);
      setError("User not authenticated or user ID not available. Cannot fetch revenue data.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Use collectorService for collector's own revenue
      // Assuming getMobileRevenue returns an array of payment objects directly
      const response = await collectorService.getMobileRevenue();
      setPayments(response); // Assuming response is the array of payments
      console.log("Collector Revenue Data Loaded:", response);
    } catch (err) {
      console.error('Error fetching collector revenue:', err);
      setError('Erreur lors du chargement des données de revenus.');
      toast.error('Erreur lors du chargement des revenus.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRevenueData();
  }, [user]); // Re-run when the user context changes

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'GNF', // Guinean Franc
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getPaymentStatusBadgeVariant = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'FAILED':
        return 'danger';
      case 'REFUNDED':
        return 'info';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Container className="py-5 font-inter bg-gray-50 min-h-screen">
      <ToastContainer />
      <Row className="justify-content-center">
        <Col md={10} lg={8}>
          <Card className="shadow-lg rounded-xl border-0 p-4">
            <Card.Body className="text-center">
              <h2 className="text-4xl font-bold text-green-600 mb-4">💰 Mes Revenus</h2>
              <p className="lead text-gray-700 mb-4">
                Visualisez l'historique de vos transactions et vos gains.
              </p>

              {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

              {payments.length > 0 ? (
                <Table responsive striped bordered hover className="mt-4 shadow-sm rounded-lg overflow-hidden">
                  <thead className="bg-green-100">
                    <tr>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Date</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Montant</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Méthode</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Statut</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Référence</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">ID Ménage</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">ID Demande</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => (
                      <tr key={payment.transactionReference}>
                        <td className="py-3 px-4 text-sm text-gray-800">
                          {new Date(payment.paymentDate).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-800 font-semibold">{formatCurrency(payment.amount)}</td>
                        <td className="py-3 px-4 text-sm text-gray-800">{payment.paymentMethod}</td>
                        <td className="py-3 px-4 text-sm">
                          <Badge bg={getPaymentStatusBadgeVariant(payment.status)} className="rounded-full px-3 py-1">
                            {payment.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-800">{payment.transactionReference}</td>
                        <td className="py-3 px-4 text-sm text-gray-800">{payment.householdId || 'N/A'}</td>
                        <td className="py-3 px-4 text-sm text-gray-800">{payment.serviceRequestId || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <div className="text-center py-5 text-gray-500">
                  <i className="fas fa-coins fa-5x mb-4"></i>
                  <h5 className="text-2xl font-semibold">Aucun Détail de Revenu Disponible</h5>
                  <p className="text-lg">Votre historique de transactions apparaîtra ici une fois que vous commencerez à gagner de l'argent.</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <div className="text-center mt-5">
        <Button
          variant="primary"
          onClick={() => navigate('/collector/dashboard')}
          className="mt-4 px-5 py-3 rounded-lg text-lg font-semibold shadow-md hover:bg-blue-700 transition-colors duration-200"
        >
          Retour au Tableau de Bord
        </Button>
      </div>
    </Container>
  );
};

export default CollectorRevenuePage;