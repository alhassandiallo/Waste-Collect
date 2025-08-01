import React, { useState, useEffect } from 'react';
import municipalityService from '../../services/municipalityService';
import { toast } from 'react-toastify';
import useAuth from '../../hooks/useAuth'; // Import useAuth to get user and municipalityId
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';


/**
 * Composant UnderservedAreas - Identification des zones mal desservies
 * * Ce composant permet aux municipalités d'identifier et d'analyser les zones
 * qui ne reçoivent pas un service de collecte de déchets adéquat.
 * * Fonctionnalités principales :
 * - Affichage des zones avec faible couverture de collecte
 * - Cartes interactives des zones mal desservies
 * - Métriques de couverture par quartier/secteur
 * - Recommandations d'amélioration
 * - Filtrage par critères (population, fréquence de collecte, etc.)
 */
const UnderservedAreas = () => {
    const { user, isLoading: authLoading } = useAuth();
    const municipalityId = user?.municipalityId;

    // États pour la gestion des données
    const [underservedAreas, setUnderservedAreas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedArea, setSelectedArea] = useState(null);
    const [filters, setFilters] = useState({
        coverageThreshold: 50, // Seuil de couverture en pourcentage
        populationMin: 0,
        daysSinceLastCollectionThreshold: 30, // New filter for days since last collection
        minPendingRequestsThreshold: 2, // New filter for min pending requests
        priorityLevel: 'all' // This will now be derived from backend calculated values
    });
    const [showMap, setShowMap] = useState(false);

    /**
     * Chargement initial des données des zones mal desservies
     */
    useEffect(() => {
        const loadUnderservedAreas = async () => {
            setLoading(true); // Start loading for any fetch attempt
            setError(null); // Clear previous errors

            // Check for municipalityId AFTER authLoading has settled
            if (!municipalityId && !authLoading) {
                setError("ID de la municipalité non disponible. Impossible de charger les zones mal desservies.");
                setUnderservedAreas([]); // Ensure it's an empty array
                setLoading(false); // Stop loading to render the empty UI with the error message
                return; // Exit early as no API call can be made without municipalityId
            }

            // Only attempt to fetch if municipalityId is available
            if (municipalityId) {
                try {
                    // Pass municipalityId and new thresholds to the backend service
                    const response = await municipalityService.identifyUnderservedAreas(
                        municipalityId,
                        parseInt(filters.daysSinceLastCollectionThreshold),
                        parseInt(filters.minPendingRequestsThreshold)
                    );
                    setUnderservedAreas(response); // Backend now returns List<HouseholdDTO> directly
                } catch (err) {
                    setError('Erreur lors du chargement des zones mal desservies. Veuillez réessayer.');
                    console.error('Erreur:', err);
                    setUnderservedAreas([]); // Ensure it's an empty array on error
                } finally {
                    setLoading(false); // Always set loading to false to show the UI
                }
            }
        };

        // Trigger loadUnderservedAreas only when authLoading is false, allowing municipalityId to be set
        if (!authLoading) {
            loadUnderservedAreas();
        }
    }, [filters, municipalityId, authLoading]); // Add municipalityId and authLoading to dependencies

    /**
     * Gestion du changement des filtres
     */
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    /**
     * Calcul du niveau de priorité basé sur les métriques (client-side derivation or based on backend hint)
     * For now, a simplified client-side logic using the backend's areaCoveragePercentage
     */
    const getPriorityLevel = (area) => {
        if (area.areaCoveragePercentage < 30 || area.daysSinceLastCollection >= 60) return 'Critique';
        if (area.areaCoveragePercentage < 60 || area.daysSinceLastCollection >= 30) return 'Élevée';
        return 'Modérée';
    };

    /**
     * Obtenir la classe CSS pour le niveau de priorité
     */
    const getPriorityClass = (area) => {
        const priority = getPriorityLevel(area);
        switch (priority) {
            case 'Critique': return 'text-danger';
            case 'Élevée': return 'text-warning';
            default: return 'text-info';
        }
    };

    /**
     * Fonction pour planifier une intervention dans une zone (simulated for now)
     */
    const scheduleIntervention = async (areaId) => {
        try {
            // This would call a backend endpoint to schedule an intervention for the area (household ID in this context)
            // For now, it's a simulated success.
            // Assuming municipalityService has a method for this, e.g., scheduleIntervention
            // await municipalityService.scheduleIntervention(areaId);
            toast.success(`Intervention planifiée pour la zone (ID ménage): ${areaId}`);
            // After successful action, re-load data to reflect changes
            // Call loadUnderservedAreas directly, no need for the wrapper function unless it's memoized
            if (municipalityId) { // Ensure municipalityId is available before reloading
                 await municipalityService.identifyUnderservedAreas(
                    municipalityId,
                    parseInt(filters.daysSinceLastCollectionThreshold),
                    parseInt(filters.minPendingRequestsThreshold)
                ).then(setUnderservedAreas).catch(err => setError('Erreur lors de l\'actualisation après intervention.'));
            }

        } catch (err) {
            toast.error('Erreur lors de la planification de l\'intervention');
            console.error('Erreur:', err);
        }
    };


    return (
        <Container fluid className="py-4">
            {/* Loading Spinner */}
            {(loading || authLoading) && (
                <div className="text-center my-5">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Chargement des données...</span>
                    </Spinner>
                    <p className="mt-3">Chargement des zones mal desservies de la municipalité...</p>
                </div>
            )}

            {/* Error Alert */}
            {error && (
                <Alert variant="danger" className="my-5">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    {error}
                </Alert>
            )}

            {/* Main Content - always rendered, data might be initial/empty on error */}
            {!loading && ( // Render content only after initial loading phase (even if there's an error)
                <>
                    {/* En-tête avec titre et actions */}
                    <div className="row mb-4">
                        <div className="col-12">
                            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center">
                                <div>
                                    <h2 className="h4 mb-1">
                                        <i className="fas fa-map-marked-alt text-warning me-2"></i>
                                        Zones Mal Desservies
                                    </h2>
                                    <p className="text-muted mb-0">
                                        Identification et analyse des zones nécessitant une amélioration du service
                                    </p>
                                </div>
                                <div className="mt-3 mt-md-0">
                                    <button
                                        className="btn btn-outline-primary me-2"
                                        onClick={() => setShowMap(!showMap)}
                                    >
                                        <i className={`fas ${showMap ? 'fa-list' : 'fa-map'} me-1`}></i>
                                        {showMap ? 'Vue Liste' : 'Vue Carte'}
                                    </button>
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => { // Re-trigger fetch when button clicked
                                            if (municipalityId) {
                                                setLoading(true); // Manually set loading to true for re-fetch
                                                setError(null);
                                                municipalityService.identifyUnderservedAreas(
                                                    municipalityId,
                                                    parseInt(filters.daysSinceLastCollectionThreshold),
                                                    parseInt(filters.minPendingRequestsThreshold)
                                                ).then(setUnderservedAreas).catch(err => {
                                                    setError('Erreur lors de l\'actualisation des zones mal desservies.');
                                                    console.error('Error refreshing:', err);
                                                    setUnderservedAreas([]);
                                                }).finally(() => setLoading(false));
                                            } else {
                                                setError("ID de la municipalité non disponible pour actualiser.");
                                            }
                                        }}
                                    >
                                        <i className="fas fa-sync-alt me-1"></i>
                                        Actualiser
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Panneau de filtres */}
                    <div className="row mb-4">
                        <div className="col-12">
                            <div className="card">
                                <div className="card-body">
                                    <h5 className="card-title">
                                        <i className="fas fa-filter me-2"></i>
                                        Filtres d'Analyse
                                    </h5>
                                    <div className="row g-3">
                                        <div className="col-md-3">
                                            <label className="form-label">Jours depuis dernière collecte</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                name="daysSinceLastCollectionThreshold"
                                                value={filters.daysSinceLastCollectionThreshold}
                                                onChange={handleFilterChange}
                                                min="0"
                                            />
                                            <small className="text-muted">
                                                Considérer mal desservi si &gt; {filters.daysSinceLastCollectionThreshold} jours
                                            </small>
                                        </div>
                                        <div className="col-md-3">
                                            <label className="form-label">Min. Demandes en Attente</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                name="minPendingRequestsThreshold"
                                                value={filters.minPendingRequestsThreshold}
                                                onChange={handleFilterChange}
                                                min="0"
                                            />
                                            <small className="text-muted">
                                                Considérer mal desservi si &ge; {filters.minPendingRequestsThreshold} demandes
                                            </small>
                                        </div>
                                        <div className="col-md-3">
                                            <label className="form-label">Population Minimale</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                name="populationMin"
                                                value={filters.populationMin}
                                                onChange={handleFilterChange}
                                                placeholder="0"
                                            />
                                        </div>
                                        <div className="col-md-3">
                                            <label className="form-label">Niveau de Priorité</label>
                                            <select
                                                className="form-select"
                                                name="priorityLevel"
                                                value={filters.priorityLevel}
                                                onChange={handleFilterChange}
                                            >
                                                <option value="all">Tous les niveaux</option>
                                                <option value="critical">Critique</option>
                                                <option value="high">Élevée</option>
                                                <option value="moderate">Modérée</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Statistiques globales */}
                    <div className="row mb-4">
                        <div className="col-md-3 col-sm-6 mb-3">
                            <div className="card bg-danger text-white">
                                <div className="card-body">
                                    <div className="d-flex justify-content-between">
                                        <div>
                                            <h6 className="card-title">Zones Critiques</h6>
                                            <h4 className="mb-0">
                                                {underservedAreas.filter(area => getPriorityLevel(area) === 'Critique').length}
                                            </h4>
                                        </div>
                                        <i className="fas fa-exclamation-triangle fa-2x opacity-75"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3 col-sm-6 mb-3">
                            <div className="card bg-warning text-white">
                                <div className="card-body">
                                    <div className="d-flex justify-content-between">
                                        <div>
                                            <h6 className="card-title">Priorité Élevée</h6>
                                            <h4 className="mb-0">
                                                {underservedAreas.filter(area => getPriorityLevel(area) === 'Élevée').length}
                                            </h4>
                                        </div>
                                        <i className="fas fa-exclamation fa-2x opacity-75"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3 col-sm-6 mb-3">
                            <div className="card bg-info text-white">
                                <div className="card-body">
                                    <div className="d-flex justify-content-between">
                                        <div>
                                            <h6 className="card-title">Total Zones</h6>
                                            <h4 className="mb-0">{underservedAreas.length}</h4>
                                        </div>
                                        <i className="fas fa-map-marker fa-2x opacity-75"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3 col-sm-6 mb-3">
                            <div className="card bg-secondary text-white">
                                <div className="card-body">
                                    <div className="d-flex justify-content-between">
                                        <div>
                                            <h6 className="card-title">Ménages Affectés</h6>
                                            <h4 className="mb-0">
                                                {underservedAreas.length} {/* Assuming each area is a household now */}
                                            </h4>
                                        </div>
                                        <i className="fas fa-users fa-2x opacity-75"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Vue Carte ou Liste */}
                    {showMap ? (
                        // Vue Carte (placeholder - nécessitera une intégration avec une API de cartes)
                        <div className="row">
                            <div className="col-12">
                                <div className="card">
                                    <div className="card-body">
                                        <div
                                            className="d-flex justify-content-center align-items-center bg-light rounded"
                                            style={{ height: '500px' }}
                                        >
                                            <div className="text-center">
                                                <i className="fas fa-map fa-4x text-muted mb-3"></i>
                                                <h5 className="text-muted">Carte Interactive</h5>
                                                <p className="text-muted">
                                                    Intégration avec Google Maps/OpenStreetMap à implémenter.
                                                    Affichage des points des ménages mal desservis si les coordonnées sont disponibles.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        // Vue Liste des zones mal desservies
                        <div className="row">
                            <div className="col-12">
                                <div className="card">
                                    <div className="card-header">
                                        <h5 className="mb-0">
                                            <i className="fas fa-list me-2"></i>
                                            Liste des Ménages Mal Desservis
                                        </h5>
                                    </div>
                                    <div className="card-body p-0">
                                        {underservedAreas.length === 0 ? (
                                            <div className="text-center py-5">
                                                <i className="fas fa-check-circle fa-3x text-success mb-3"></i>
                                                <h5>Excellente Couverture!</h5>
                                                <p className="text-muted">
                                                    Aucun ménage mal desservi détecté avec les critères actuels.
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="table-responsive">
                                                <table className="table table-hover mb-0">
                                                    <thead className="table-light">
                                                        <tr>
                                                            <th>Ménage</th>
                                                            <th>Adresse</th>
                                                            <th>Jours sans collecte</th>
                                                            <th>Couverture (%)</th>
                                                            <th>Priorité</th>
                                                            <th>Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {underservedAreas.map((area) => (
                                                            <tr key={area.id}>
                                                                <td>
                                                                    <div>
                                                                        <strong>{area.firstName} {area.lastName}</strong>
                                                                        <br />
                                                                        <small className="text-muted">
                                                                            {area.email}
                                                                        </small>
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <div>
                                                                        {area.address}
                                                                        <br/>
                                                                        <small className="text-muted">
                                                                            {area.municipalityName} ({area.latitude}, {area.longitude})
                                                                        </small>
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <span className={`badge ${area.daysSinceLastCollection > 30 ? 'bg-danger' : 'bg-warning'}`}>
                                                                        {area.daysSinceLastCollection === 999 ? 'Jamais' : area.daysSinceLastCollection + ' jours'}
                                                                    </span>
                                                                </td>
                                                                <td>
                                                                    <div className="d-flex align-items-center">
                                                                        <div className="progress flex-grow-1 me-2" style={{ height: '8px' }}>
                                                                            <div
                                                                                className="progress-bar"
                                                                                role="progressbar"
                                                                                style={{ width: `${area.areaCoveragePercentage}%` }}
                                                                                aria-valuenow={area.areaCoveragePercentage}
                                                                                aria-valuemin="0"
                                                                                aria-valuemax="100"
                                                                            ></div>
                                                                        </div>
                                                                        <small>{area.areaCoveragePercentage}%</small>
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <span className={`badge ${getPriorityLevel(area) === 'Critique' ? 'bg-danger' :
                                                                        getPriorityLevel(area) === 'Élevée' ? 'bg-warning' : 'bg-info'}`}>
                                                                        {getPriorityLevel(area)}
                                                                    </span>
                                                                </td>
                                                                <td>
                                                                    <div className="btn-group" role="group">
                                                                        <button
                                                                            className="btn btn-sm btn-outline-primary"
                                                                            onClick={() => setSelectedArea(area)}
                                                                            data-bs-toggle="modal"
                                                                            data-bs-target="#areaDetailsModal"
                                                                        >
                                                                            <i className="fas fa-eye"></i>
                                                                        </button>
                                                                        <button
                                                                            className="btn btn-sm btn-outline-success"
                                                                            onClick={() => scheduleIntervention(area.id)}
                                                                        >
                                                                            <i className="fas fa-calendar-plus"></i>
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Modal de détails d'une zone */}
                    <div className="modal fade" id="areaDetailsModal" tabIndex="-1">
                        <div className="modal-dialog modal-lg">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">
                                        <i className="fas fa-info-circle me-2"></i>
                                        Détails du Ménage Mal Desservi
                                    </h5>
                                    <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                                </div>
                                {selectedArea && (
                                    <div className="modal-body">
                                        <div className="row">
                                            <div className="col-md-6">
                                                <h6>Informations Générales</h6>
                                                <table className="table table-sm">
                                                    <tbody>
                                                        <tr>
                                                            <td><strong>Nom:</strong></td>
                                                            <td>{selectedArea.firstName} {selectedArea.lastName}</td>
                                                        </tr>
                                                        <tr>
                                                            <td><strong>Email:</strong></td>
                                                            <td>{selectedArea.email}</td>
                                                        </tr>
                                                        <tr>
                                                            <td><strong>Téléphone:</strong></td>
                                                            <td>{selectedArea.phoneNumber}</td>
                                                        </tr>
                                                        <tr>
                                                            <td><strong>Adresse:</strong></td>
                                                            <td>{selectedArea.address}, {selectedArea.municipalityName}</td>
                                                        </tr>
                                                        <tr>
                                                            <td><strong>Coordonnées:</strong></td>
                                                            <td>({selectedArea.latitude}, {selectedArea.longitude})</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                            <div className="col-md-6">
                                                <h6>Métriques de Service</h6>
                                                <table className="table table-sm">
                                                    <tbody>
                                                        <tr>
                                                            <td><strong>Jours sans collecte:</strong></td>
                                                            <td>{selectedArea.daysSinceLastCollection === 999 ? 'Jamais' : selectedArea.daysSinceLastCollection + ' jours'}</td>
                                                        </tr>
                                                        <tr>
                                                            <td><strong>Couverture (%):</strong></td>
                                                            <td>{selectedArea.areaCoveragePercentage}%</td>
                                                        </tr>
                                                        <tr>
                                                            <td><strong>Nombre de membres:</strong></td>
                                                            <td>{selectedArea.numberOfMembers}</td>
                                                        </tr>
                                                        <tr>
                                                            <td><strong>Type de logement:</strong></td>
                                                            <td>{selectedArea.housingType}</td>
                                                        </tr>
                                                        <tr>
                                                            <td><strong>Préférences de collecte:</strong></td>
                                                            <td>{selectedArea.collectionPreferences || 'N/A'}</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        {/* Recommandations */}
                                        <div className="mt-3">
                                            <h6>Recommandations d'Amélioration</h6>
                                            <div className="alert alert-info">
                                                <ul className="mb-0">
                                                    {selectedArea.areaCoveragePercentage < 50 && (
                                                        <li>Augmenter la fréquence de collecte dans cette zone.</li>
                                                    )}
                                                    {selectedArea.daysSinceLastCollection > 14 && (
                                                        <li>Planifier une collecte d'urgence pour ce ménage.</li>
                                                    )}
                                                    {selectedArea.numberOfMembers > 5 && selectedArea.housingType === 'HOUSE' && (
                                                        <li>Envisager un bac de collecte de plus grande capacité.</li>
                                                    )}
                                                    <li>Sensibiliser ce ménage aux horaires et types de collecte.</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                                        Fermer
                                    </button>
                                    {selectedArea && (
                                        <button
                                            type="button"
                                            className="btn btn-primary"
                                            onClick={() => scheduleIntervention(selectedArea.id)}
                                        >
                                            <i className="fas fa-calendar-plus me-1"></i>
                                            Planifier Intervention
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </Container>
    );
};

export default UnderservedAreas;
