import React, { useState, useEffect } from 'react';
import serviceRequestService from '../../services/serviceRequestService';
import collectorService from '../../services/collectorService';
import useAuth from '../../hooks/useAuth';
import { toast } from 'react-toastify';
import { Modal, Button, Form, Spinner, Alert } from 'react-bootstrap';
import { FaStar, FaRegStar, FaCommentDots, FaClock, FaHandsHelping, FaLightbulb, FaCheckCircle, FaPaperPlane } from 'react-icons/fa';


/**
 * Composant RateCollectorPage - Permet aux ménages d'évaluer les collecteurs
 * Fonctionnalités principales:
 * - Affichage des ramassages terminés à évaluer
 * - Système de notation par étoiles (1-5)
 * - Commentaires détaillés sur la qualité du service
 * - Critères d'évaluation multiples (ponctualité, propreté, courtoisie)
 * - Historique des évaluations données
 *
 * @component
 */
const RateCollectorPage = () => {
  // Récupération du contexte d'authentification
  const { user } = useAuth();

  // État pour les ramassages terminés non évalués
  const [completedPickups, setCompletedPickups] = useState([]);

  // État pour l'historique des évaluations
  const [ratingHistory, setRatingHistory] = useState([]);

  // État du formulaire d'évaluation actuel
  const [currentRating, setCurrentRating] = useState({
    serviceRequestId: null,
    collectorId: null,
    overallRating: 0, // Note globale sur 5
    punctualityRating: 0, // Ponctualité
    cleanlinessRating: 0, // Propreté
    courtesyRating: 0, // Courtoisie
    comment: '', // Commentaire détaillé
  });

  // États pour la gestion des modals et des chargements
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState(null);

  // Effet pour charger les ramassages à évaluer et l'historique des évaluations
  useEffect(() => {
    const fetchPickupsAndRatings = async () => {
      setLoading(true);
      setError(null);
      if (!user || !user.id) {
        setLoading(false);
        return;
      }
      try {
        // Fetch completed pickups that need rating
        const pickups = await serviceRequestService.getServiceRequestsByHousehold(user.id, 'COMPLETED_AWAITING_RATING');
        setCompletedPickups(pickups);

        // Fetch rating history
        const history = await collectorService.getCollectorRatingsByHousehold(user.id);
        setRatingHistory(history);

      } catch (err) {
        console.error('Error fetching data for rating:', err);
        setError('Erreur lors du chargement des données. Veuillez réessayer.');
        toast.error('Erreur lors du chargement des données.');
      } finally {
        setLoading(false);
      }
    };

    fetchPickupsAndRatings();
  }, [user]); // Re-run when user changes

  /**
   * Ouvre la modale d'évaluation pour un ramassage spécifique.
   * @param {object} pickup - Le ramassage à évaluer.
   */
  const openRatingModal = (pickup) => {
    setCurrentRating({
      serviceRequestId: pickup.id,
      collectorId: pickup.collectorId, // Assuming collectorId is available on pickup
      overallRating: 0,
      punctualityRating: 0,
      cleanlinessRating: 0,
      courtesyRating: 0,
      comment: '',
    });
    setShowRatingModal(true);
  };

  /**
   * Ferme la modale d'évaluation.
   */
  const closeRatingModal = () => {
    setShowRatingModal(false);
    setError(null);
  };

  /**
   * Gère le changement de note pour un critère donné.
   * @param {string} criteria - Le critère de notation (overall, punctuality, etc.).
   * @param {number} value - La valeur de la note (1-5).
   */
  const handleRatingChange = (criteria, value) => {
    setCurrentRating((prev) => ({
      ...prev,
      [criteria]: value,
    }));
  };

  /**
   * Gère le changement du commentaire.
   * @param {object} e - L'événement de changement.
   */
  const handleCommentChange = (e) => {
    setCurrentRating((prev) => ({
      ...prev,
      comment: e.target.value,
    }));
  };

  /**
   * Soumet l'évaluation au service backend.
   */
  const handleSubmitRating = async () => {
    setSubmitLoading(true);
    setError(null);
    try {
      if (currentRating.overallRating === 0) {
        setError('Veuillez donner une note globale.');
        toast.error('Veuillez donner une note globale.');
        return;
      }

      const payload = {
        serviceRequestId: currentRating.serviceRequestId,
        collectorId: currentRating.collectorId,
        overallRating: currentRating.overallRating,
        punctualityRating: currentRating.punctualityRating,
        cleanlinessRating: currentRating.cleanlinessRating,
        courtesyRating: currentRating.courtesyRating,
        comment: currentRating.comment,
      };

      await collectorService.submitCollectorRating(payload);
      toast.success('Évaluation soumise avec succès !');
      closeRatingModal();
      // Refresh the lists after successful submission
      const pickups = await serviceRequestService.getServiceRequestsByHousehold(user.id, 'COMPLETED_AWAITING_RATING');
      setCompletedPickups(pickups);
      const history = await collectorService.getCollectorRatingsByHousehold(user.id);
      setRatingHistory(history);

    } catch (err) {
      console.error('Error submitting rating:', err);
      setError(err.message || 'Erreur lors de la soumission de l\'évaluation. Veuillez réessayer.');
      toast.error(err.message || 'Échec de l\'évaluation.');
    } finally {
      setSubmitLoading(false);
    }
  };

  /**
   * Rendu des étoiles de notation.
   * @param {string} criteria - Le critère de notation.
   * @param {number} ratingValue - La note actuelle.
   * @returns {JSX.Element[]} Les étoiles à afficher.
   */
  const renderStars = (criteria, ratingValue) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FaStar
          key={`${criteria}-${i}`}
          className={`cursor-pointer rating-star ${i <= ratingValue ? 'text-warning' : 'text-muted'}`}
          onClick={() => handleRatingChange(criteria, i)}
          size={24}
        />
      );
    }
    return stars;
  };

  return (
    <div className="container py-5">
      <h1 className="text-primary text-center mb-4">Évaluer un Collecteur</h1>
      <p className="lead text-muted text-center mb-5">
        Votre feedback est essentiel pour améliorer nos services.
      </p>

      {loading && (
        <div className="d-flex justify-content-center my-5">
          <Spinner animation="border" variant="primary" />
        </div>
      )}

      {error && <Alert variant="danger" className="text-center">{error}</Alert>}

      {/* Ramassages à Évaluer */}
      {!loading && (
        <div className="card shadow mb-5">
          <div className="card-header bg-success text-white d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              <FaHandsHelping className="me-2" />
              Ramassages Terminés à Évaluer
            </h5>
            <span className="badge bg-light text-dark">{completedPickups.length}</span>
          </div>
          <div className="card-body">
            {completedPickups.length > 0 ? (
              <div className="list-group">
                {completedPickups.map((pickup) => (
                  <div key={pickup.id} className="list-group-item d-flex justify-content-between align-items-center mb-3 p-3 shadow-sm rounded">
                    <div>
                      <h6 className="mb-1 text-primary">Demande #{pickup.id} - {pickup.wasteType}</h6>
                      <small className="text-muted">
                        Date: {new Date(pickup.preferredDate).toLocaleDateString()}
                        {pickup.collectorName && ` - Collecteur: ${pickup.collectorName}`}
                      </small>
                      <p className="mb-0 small">{pickup.description || 'Aucune description fournie.'}</p>
                    </div>
                    <Button variant="warning" onClick={() => openRatingModal(pickup)}>
                      <FaStar className="me-2" />
                      Évaluer
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted py-3">
                Aucun ramassage terminé en attente d'évaluation pour le moment.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Historique des Évaluations */}
      {!loading && (
        <div className="card shadow">
          <div className="card-header bg-info text-white d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              <FaClock className="me-2" />
              Historique des Évaluations
            </h5>
            <span className="badge bg-light text-dark">{ratingHistory.length}</span>
          </div>
          <div className="card-body">
            {ratingHistory.length > 0 ? (
              <div className="list-group">
                {ratingHistory.map((rating) => (
                  <div key={rating.id} className="list-group-item d-flex justify-content-between align-items-start mb-3 p-3 shadow-sm rounded">
                    <div>
                      <h6 className="mb-1 text-info">Évaluation pour Collecteur: {rating.collectorName || 'Inconnu'}</h6>
                      <div className="d-flex align-items-center mb-2">
                        <span className="me-2">Note:</span>
                        {[...Array(5)].map((_, i) => (
                          <FaStar
                            key={i}
                            className={i < rating.ratingValue ? 'text-warning' : 'text-muted'}
                            size={18}
                          />
                        ))}
                      </div>
                      <p className="mb-1 small">
                        <span className="fw-semibold">Commentaire:</span> {rating.comment || 'N/A'}
                      </p>
                      <small className="text-muted">Évalué le: {new Date(rating.createdAt).toLocaleDateString()}</small>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted py-3">
                Aucune évaluation soumise jusqu'à présent.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Modal d'évaluation */}
      {showRatingModal && (
        <Modal show={showRatingModal} onHide={closeRatingModal} centered backdrop="static" keyboard={false}>
          <Modal.Header closeButton className="bg-warning text-white">
            <Modal.Title><FaStar className="me-2" />Évaluer le Ramassage</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {error && <Alert variant="danger">{error}</Alert>}
            <p className="text-muted mb-4">
              Veuillez évaluer la qualité du service pour la demande #
              {currentRating.serviceRequestId} effectuée par le collecteur.
            </p>

            <Form>
              {/* Note Globale */}
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Note Générale <span className="text-danger">*</span></Form.Label>
                <div className="star-rating">
                  {renderStars('overallRating', currentRating.overallRating)}
                </div>
              </Form.Group>

              {/* Critères détaillés (optionnel) */}
              <h6 className="mt-4 mb-3 text-secondary">Critères Détaillés (optionnel)</h6>
              <Form.Group className="mb-2">
                <Form.Label>Ponctualité</Form.Label>
                <div className="star-rating">
                  {renderStars('punctualityRating', currentRating.punctualityRating)}
                </div>
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Propreté (site de collecte)</Form.Label>
                <div className="star-rating">
                  {renderStars('cleanlinessRating', currentRating.cleanlinessRating)}
                </div>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Courtoisie du Collecteur</Form.Label>
                <div className="star-rating">
                  {renderStars('courtesyRating', currentRating.courtesyRating)}
                </div>
              </Form.Group>

              {/* Commentaire */}
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Commentaire (optionnel)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={currentRating.comment}
                  onChange={handleCommentChange}
                  placeholder="Décrivez votre expérience..."
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={closeRatingModal}
            >
              Annuler
            </Button>
            <Button
              variant="warning"
              onClick={handleSubmitRating}
              disabled={submitLoading || currentRating.overallRating === 0}
            >
              {submitLoading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Envoi...
                </>
              ) : (
                <>
                  <FaPaperPlane className="me-2" />
                  Envoyer l'Évaluation
                </>
              )}
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      {/* Styles CSS personnalisés */
      // These are inline for the specific component as per user's original file
      }
      <style jsx>{`
        .rating-star {
          transition: all 0.2s ease;
        }
        .rating-star:hover {
          transform: scale(1.1);
        }
        .star-rating {
          display: inline-flex;
          gap: 2px;
        }
        /* Using bootstrap modal class directly instead of custom .modal */
        .modal-backdrop {
          backdrop-filter: blur(5px);
        }
        .card {
          transition: transform 0.2s ease;
        }
        .card:hover {
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
};

export default RateCollectorPage;
