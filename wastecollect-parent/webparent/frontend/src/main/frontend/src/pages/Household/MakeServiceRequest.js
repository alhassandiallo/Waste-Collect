import React, { useState, useEffect } from 'react';
import serviceRequestService from '../../services/serviceRequestService';
import wasteCollectionService from '../../services/wasteCollectionService';
import useAuth from '../../hooks/useAuth';

/**
 * Composant RequestPickup - Permet aux ménages de planifier et demander des ramassages
 * Fonctionnalités principales:
 * - Création de demandes de ramassage avec informations détaillées
 * - Sélection du type de déchets et estimation du volume
 * - Planification flexible avec préférences horaires
 * - Suivi en temps réel de l'état des demandes
 * 
 * @component
 */
const RequestPickup = () => {
  // Récupération du contexte d'authentification pour identifier l'utilisateur
  const { user } = useAuth();
  
  // État pour le formulaire de création de demande
  const [requestForm, setRequestForm] = useState({
    wasteType: 'GENERAL', // Type de déchet par défaut
    estimatedVolume: '', // Volume estimé en litres
    preferredDate: '', // Date préférée pour le ramassage
    preferredTimeSlot: 'MORNING', // Créneau horaire préféré
    urgencyLevel: 'NORMAL', // Niveau d'urgence
    specialInstructions: '', // Instructions spéciales
    address: '', // Adresse de ramassage
    contactPhone: '', // Numéro de téléphone de contact
    isRecurring: false, // Demande récurrente ou ponctuelle
    recurringFrequency: 'WEEKLY' // Fréquence si récurrente
  });
  
  // État pour la liste des demandes actives
  const [activeRequests, setActiveRequests] = useState([]);
  
  // États pour la gestion de l'interface utilisateur
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Statistiques du ménage
  const [householdStats, setHouseholdStats] = useState({
    totalRequests: 0,
    completedPickups: 0,
    averageRating: 0,
    totalWasteCollected: 0
  });

  /**
   * Chargement initial des données du composant
   * Récupère les demandes actives et les statistiques du ménage
   */
  useEffect(() => {
    loadActiveRequests();
    loadHouseholdStats();
  }, []);

  /**
   * Charge les demandes de ramassage actives du ménage connecté
   * Filtre les demandes par statut (en attente, acceptées, en cours)
   */
  const loadActiveRequests = async () => {
    try {
      setLoading(true);
      const response = await serviceRequestService.getByHouseholdId(user.id);
      
      // Filtrer les demandes actives (non terminées et non annulées)
      const activeOnly = response.data.filter(request => 
        ['PENDING', 'ACCEPTED', 'IN_PROGRESS'].includes(request.status)
      );
      
      setActiveRequests(activeOnly);
    } catch (error) {
      console.error('Erreur lors du chargement des demandes:', error);
      setMessage({
        type: 'error',
        text: 'Erreur lors du chargement de vos demandes actives'
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Charge les statistiques du ménage depuis l'API
   * Inclut le nombre total de demandes, ramassages effectués, etc.
   */
  const loadHouseholdStats = async () => {
    try {
      const response = await wasteCollectionService.getHouseholdStatistics(user.id);
      setHouseholdStats(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    }
  };

  /**
   * Gère les changements dans les champs du formulaire
   * Met à jour l'état du formulaire de manière immutable
   * 
   * @param {Event} e - Événement de changement du champ
   */
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setRequestForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  /**
   * Soumission du formulaire de demande de ramassage
   * Valide les données et envoie la demande au backend
   * 
   * @param {Event} e - Événement de soumission du formulaire
   */
  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    
    // Validation des champs obligatoires
    if (!requestForm.wasteType || !requestForm.estimatedVolume || !requestForm.preferredDate) {
      setMessage({
        type: 'error',
        text: 'Veuillez remplir tous les champs obligatoires'
      });
      return;
    }

    // Validation de la date (ne peut pas être dans le passé)
    const selectedDate = new Date(requestForm.preferredDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      setMessage({
        type: 'error',
        text: 'La date de ramassage ne peut pas être dans le passé'
      });
      return;
    }

    try {
      setSubmitLoading(true);
      
      // Préparation des données pour l'API
      const requestData = {
        ...requestForm,
        householdId: user.id,
        status: 'PENDING',
        requestDate: new Date().toISOString(),
        estimatedVolume: parseFloat(requestForm.estimatedVolume)
      };

      // Envoi de la demande au backend
      await serviceRequestService.create(requestData);
      
      // Réinitialisation du formulaire et rechargement des données
      setRequestForm({
        wasteType: 'GENERAL',
        estimatedVolume: '',
        preferredDate: '',
        preferredTimeSlot: 'MORNING',
        urgencyLevel: 'NORMAL',
        specialInstructions: '',
        address: '',
        contactPhone: '',
        isRecurring: false,
        recurringFrequency: 'WEEKLY'
      });
      
      setMessage({
        type: 'success',
        text: 'Votre demande de ramassage a été créée avec succès!'
      });
      
      // Rechargement des demandes actives
      loadActiveRequests();
      
    } catch (error) {
      console.error('Erreur lors de la création de la demande:', error);
      setMessage({
        type: 'error',
        text: 'Erreur lors de la création de votre demande. Veuillez réessayer.'
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  /**
   * Annule une demande de ramassage existante
   * Seules les demandes en statut PENDING peuvent être annulées
   * 
   * @param {number} requestId - ID de la demande à annuler
   */
  const handleCancelRequest = async (requestId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir annuler cette demande?')) {
      return;
    }

    try {
      await serviceRequestService.updateStatus(requestId, 'CANCELLED');
      setMessage({
        type: 'success',
        text: 'Demande annulée avec succès'
      });
      loadActiveRequests();
    } catch (error) {
      console.error('Erreur lors de l\'annulation:', error);
      setMessage({
        type: 'error',
        text: 'Erreur lors de l\'annulation de la demande'
      });
    }
  };

  /**
   * Formate la date pour l'affichage dans l'interface utilisateur
   * 
   * @param {string} dateString - Date au format ISO
   * @returns {string} Date formatée pour l'affichage
   */
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  /**
   * Retourne la classe CSS pour le badge de statut en fonction du statut de la demande
   * 
   * @param {string} status - Statut de la demande
   * @returns {string} Classe CSS Bootstrap pour le badge
   */
  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      'PENDING': 'bg-warning',
      'ACCEPTED': 'bg-info',
      'IN_PROGRESS': 'bg-primary',
      'COMPLETED': 'bg-success',
      'CANCELLED': 'bg-danger'
    };
    return `badge ${statusClasses[status] || 'bg-secondary'}`;
  };

  /**
   * Traduit le statut de la demande en français
   * 
   * @param {string} status - Statut en anglais
   * @returns {string} Statut traduit en français
   */
  const translateStatus = (status) => {
    const translations = {
      'PENDING': 'En attente',
      'ACCEPTED': 'Acceptée',
      'IN_PROGRESS': 'En cours',
      'COMPLETED': 'Terminée',
      'CANCELLED': 'Annulée'
    };
    return translations[status] || status;
  };

  return (
    <div className="container-fluid py-4">
      {/* En-tête avec statistiques rapides */}
      <div className="row mb-4">
        <div className="col-12">
          <h2 className="mb-3">
            <i className="fas fa-truck me-2"></i>
            Demander un Ramassage
          </h2>
          
          {/* Statistiques rapides */}
          <div className="row g-3">
            <div className="col-6 col-md-3">
              <div className="card bg-primary text-white h-100">
                <div className="card-body text-center">
                  <i className="fas fa-list-alt fa-2x mb-2"></i>
                  <h5 className="card-title">{householdStats.totalRequests}</h5>
                  <p className="card-text small">Total Demandes</p>
                </div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="card bg-success text-white h-100">
                <div className="card-body text-center">
                  <i className="fas fa-check-circle fa-2x mb-2"></i>
                  <h5 className="card-title">{householdStats.completedPickups}</h5>
                  <p className="card-text small">Ramassages Effectués</p>
                </div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="card bg-info text-white h-100">
                <div className="card-body text-center">
                  <i className="fas fa-star fa-2x mb-2"></i>
                  <h5 className="card-title">{householdStats.averageRating.toFixed(1)}</h5>
                  <p className="card-text small">Note Moyenne</p>
                </div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="card bg-warning text-white h-100">
                <div className="card-body text-center">
                  <i className="fas fa-weight fa-2x mb-2"></i>
                  <h5 className="card-title">{householdStats.totalWasteCollected}kg</h5>
                  <p className="card-text small">Déchets Collectés</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages d'alerte */}
      {message.text && (
        <div className={`alert alert-${message.type === 'error' ? 'danger' : 'success'} alert-dismissible fade show`}>
          {message.text}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setMessage({ type: '', text: '' })}
          ></button>
        </div>
      )}

      <div className="row">
        {/* Formulaire de nouvelle demande */}
        <div className="col-lg-8">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h5 className="card-title mb-0">
                <i className="fas fa-plus me-2"></i>
                Nouvelle Demande de Ramassage
              </h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmitRequest}>
                <div className="row">
                  {/* Type de déchets */}
                  <div className="col-md-6 mb-3">
                    <label htmlFor="wasteType" className="form-label">
                      Type de Déchets <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      id="wasteType"
                      name="wasteType"
                      value={requestForm.wasteType}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="GENERAL">Déchets Généraux</option>
                      <option value="ORGANIC">Déchets Organiques</option>
                      <option value="RECYCLABLE">Recyclables</option>
                      <option value="HAZARDOUS">Déchets Dangereux</option>
                      <option value="ELECTRONIC">Déchets Électroniques</option>
                      <option value="BULK">Déchets Encombrants</option>
                    </select>
                  </div>

                  {/* Volume estimé */}
                  <div className="col-md-6 mb-3">
                    <label htmlFor="estimatedVolume" className="form-label">
                      Volume Estimé (litres) <span className="text-danger">*</span>
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      id="estimatedVolume"
                      name="estimatedVolume"
                      value={requestForm.estimatedVolume}
                      onChange={handleInputChange}
                      min="1"
                      max="1000"
                      placeholder="Ex: 50"
                      required
                    />
                  </div>

                  {/* Date préférée */}
                  <div className="col-md-6 mb-3">
                    <label htmlFor="preferredDate" className="form-label">
                      Date Préférée <span className="text-danger">*</span>
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      id="preferredDate"
                      name="preferredDate"
                      value={requestForm.preferredDate}
                      onChange={handleInputChange}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>

                  {/* Créneau horaire */}
                  <div className="col-md-6 mb-3">
                    <label htmlFor="preferredTimeSlot" className="form-label">
                      Créneau Horaire Préféré
                    </label>
                    <select
                      className="form-select"
                      id="preferredTimeSlot"
                      name="preferredTimeSlot"
                      value={requestForm.preferredTimeSlot}
                      onChange={handleInputChange}
                    >
                      <option value="MORNING">Matin (8h-12h)</option>
                      <option value="AFTERNOON">Après-midi (12h-17h)</option>
                      <option value="EVENING">Soir (17h-20h)</option>
                      <option value="FLEXIBLE">Flexible</option>
                    </select>
                  </div>

                  {/* Niveau d'urgence */}
                  <div className="col-md-6 mb-3">
                    <label htmlFor="urgencyLevel" className="form-label">
                      Niveau d'Urgence
                    </label>
                    <select
                      className="form-select"
                      id="urgencyLevel"
                      name="urgencyLevel"
                      value={requestForm.urgencyLevel}
                      onChange={handleInputChange}
                    >
                      <option value="LOW">Faible</option>
                      <option value="NORMAL">Normal</option>
                      <option value="HIGH">Élevé</option>
                      <option value="URGENT">Urgent</option>
                    </select>
                  </div>

                  {/* Adresse */}
                  <div className="col-md-6 mb-3">
                    <label htmlFor="address" className="form-label">
                      Adresse de Ramassage
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="address"
                      name="address"
                      value={requestForm.address}
                      onChange={handleInputChange}
                      placeholder="Adresse complète"
                    />
                  </div>

                  {/* Téléphone de contact */}
                  <div className="col-md-6 mb-3">
                    <label htmlFor="contactPhone" className="form-label">
                      Téléphone de Contact
                    </label>
                    <input
                      type="tel"
                      className="form-control"
                      id="contactPhone"
                      name="contactPhone"
                      value={requestForm.contactPhone}
                      onChange={handleInputChange}
                      placeholder="+224 XX XX XX XX"
                    />
                  </div>

                  {/* Demande récurrente */}
                  <div className="col-md-6 mb-3">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="isRecurring"
                        name="isRecurring"
                        checked={requestForm.isRecurring}
                        onChange={handleInputChange}
                      />
                      <label className="form-check-label" htmlFor="isRecurring">
                        Demande Récurrente
                      </label>
                    </div>
                  </div>

                  {/* Fréquence de récurrence (si récurrente) */}
                  {requestForm.isRecurring && (
                    <div className="col-md-6 mb-3">
                      <label htmlFor="recurringFrequency" className="form-label">
                        Fréquence
                      </label>
                      <select
                        className="form-select"
                        id="recurringFrequency"
                        name="recurringFrequency"
                        value={requestForm.recurringFrequency}
                        onChange={handleInputChange}
                      >
                        <option value="DAILY">Quotidienne</option>
                        <option value="WEEKLY">Hebdomadaire</option>
                        <option value="BIWEEKLY">Bi-hebdomadaire</option>
                        <option value="MONTHLY">Mensuelle</option>
                      </select>
                    </div>
                  )}

                  {/* Instructions spéciales */}
                  <div className="col-12 mb-3">
                    <label htmlFor="specialInstructions" className="form-label">
                      Instructions Spéciales
                    </label>
                    <textarea
                      className="form-control"
                      id="specialInstructions"
                      name="specialInstructions"
                      value={requestForm.specialInstructions}
                      onChange={handleInputChange}
                      rows="3"
                      placeholder="Informations supplémentaires pour le collecteur..."
                    ></textarea>
                  </div>
                </div>

                {/* Bouton de soumission */}
                <div className="d-grid">
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg"
                    disabled={submitLoading}
                  >
                    {submitLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Création en cours...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-paper-plane me-2"></i>
                        Créer la Demande
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Liste des demandes actives */}
        <div className="col-lg-4">
          <div className="card shadow">
            <div className="card-header bg-info text-white">
              <h5 className="card-title mb-0">
                <i className="fas fa-clock me-2"></i>
                Demandes Actives ({activeRequests.length})
              </h5>
            </div>
            <div className="card-body p-0">
              {loading ? (
                <div className="text-center p-4">
                  <div className="spinner-border text-primary"></div>
                  <p className="mt-2">Chargement...</p>
                </div>
              ) : activeRequests.length === 0 ? (
                <div className="text-center p-4 text-muted">
                  <i className="fas fa-inbox fa-3x mb-3"></i>
                  <p>Aucune demande active</p>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {activeRequests.map((request, index) => (
                    <div key={request.id} className="list-group-item">
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="flex-grow-1">
                          <h6 className="mb-1">
                            <i className="fas fa-trash me-1"></i>
                            {request.wasteType}
                          </h6>
                          <p className="mb-1 small text-muted">
                            <i className="fas fa-calendar me-1"></i>
                            {formatDate(request.preferredDate)}
                          </p>
                          <p className="mb-1 small text-muted">
                            <i className="fas fa-flask me-1"></i>
                            {request.estimatedVolume}L
                          </p>
                          {request.collectorName && (
                            <p className="mb-1 small text-success">
                              <i className="fas fa-user me-1"></i>
                              {request.collectorName}
                            </p>
                          )}
                        </div>
                        <div className="text-end">
                          <span className={getStatusBadgeClass(request.status)}>
                            {translateStatus(request.status)}
                          </span>
                          {request.status === 'PENDING' && (
                            <button
                              className="btn btn-sm btn-outline-danger mt-2"
                              onClick={() => handleCancelRequest(request.id)}
                              title="Annuler la demande"
                            >
                              <i className="fas fa-times"></i>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Conseils pour l'utilisateur */}
          <div className="card shadow mt-3">
            <div className="card-header bg-light">
              <h6 className="card-title mb-0">
                <i className="fas fa-lightbulb me-2"></i>
                Conseils Utiles
              </h6>
            </div>
            <div className="card-body">
              <ul className="list-unstyled small">
                <li className="mb-2">
                  <i className="fas fa-check-circle text-success me-2"></i>
                  Préparez vos déchets la veille du ramassage
                </li>
                <li className="mb-2">
                  <i className="fas fa-check-circle text-success me-2"></i>
                  Triez vos déchets selon leur type
                </li>
                <li className="mb-2">
                  <i className="fas fa-check-circle text-success me-2"></i>
                  Indiquez clairement votre adresse
                </li>
                <li className="mb-0">
                  <i className="fas fa-check-circle text-success me-2"></i>
                  Soyez disponible durant le créneau choisi
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestPickup;