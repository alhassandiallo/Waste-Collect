import React, { useState, useEffect } from 'react';
import statisticsService from '../../services/statisticsService';

/**
 * Composant StatisticsOverview - Vue d'ensemble des statistiques
 * 
 * Ce composant fournit une vue d'ensemble complète des statistiques
 * de la plateforme de gestion des déchets avec des métriques en temps réel.
 * 
 * Fonctionnalités principales :
 * - Indicateurs clés de performance (KPI)
 * - Graphiques et visualisations des données
 * - Comparaisons périodiques
 * - Métriques par rôle (collecteurs, ménages, municipalités)
 * - Export des données statistiques
 * - Actualisation automatique des données
 */
const StatisticsOverview = () => {
    // États pour la gestion des données statistiques
    const [stats, setStats] = useState({
        global: {},
        collectors: {},
        households: {},
        municipalities: {},
        trends: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [timeRange, setTimeRange] = useState('7d'); // 7d, 30d, 90d, 1y
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [lastUpdate, setLastUpdate] = useState(null);

    /**
     * Chargement initial des statistiques
     */
    useEffect(() => {
        loadStatistics();
        
        // Configuration de l'actualisation automatique
        let interval;
        if (autoRefresh) {
            interval = setInterval(loadStatistics, 300000); // 5 minutes
        }
        
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [timeRange, autoRefresh]);

    /**
     * Fonction pour charger toutes les statistiques
     */
    const loadStatistics = async () => {
        try {
            setLoading(true);
            const [globalStats, collectorStats, householdStats, municipalityStats, trendsData] = 
                await Promise.all([
                    statisticsService.getGlobalStatistics(timeRange),
                    statisticsService.getCollectorStatistics(timeRange),
                    statisticsService.getHouseholdStatistics(timeRange),
                    statisticsService.getMunicipalityStatistics(timeRange),
                    statisticsService.getTrends(timeRange)
                ]);

            setStats({
                global: globalStats.data,
                collectors: collectorStats.data,
                households: householdStats.data,
                municipalities: municipalityStats.data,
                trends: trendsData.data
            });
            
            setLastUpdate(new Date());
        } catch (err) {
            setError('Erreur lors du chargement des statistiques');
            console.error('Erreur:', err);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Calcul du pourcentage de variation
     */
    const calculateGrowthPercentage = (current, previous) => {
        if (!previous || previous === 0) return 0;
        return ((current - previous) / previous * 100).toFixed(1);
    };

    /**
     * Obtenir la classe CSS pour l'indicateur de croissance
     */
    const getGrowthClass = (percentage) => {
        return percentage >= 0 ? 'text-success' : 'text-danger';
    };

    /**
     * Export des statistiques en format CSV
     */
    const exportStatistics = async () => {
        try {
            const response = await statisticsService.exportStatistics(timeRange);
            const blob = new Blob([response.data], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `statistiques_${timeRange}_${new Date().toISOString().split('T')[0]}.csv`;
            link.click();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            alert('Erreur lors de l\'export des statistiques');
            console.error('Erreur:', err);
        }
    };

    /**
     * Formatage des nombres avec séparateurs de milliers
     */
    const formatNumber = (num) => {
        return num ? num.toLocaleString('fr-FR') : '0';
    };

    if (loading && !stats.global.totalUsers) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
                <div className="text-center">
                    <div className="spinner-border text-primary mb-3" role="status">
                        <span className="visually-hidden">Chargement...</span>
                    </div>
                    <p className="text-muted">Chargement des statistiques...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="alert alert-danger" role="alert">
                <i className="fas fa-exclamation-triangle me-2"></i>
                {error}
                <button 
                    className="btn btn-outline-danger btn-sm ms-3"
                    onClick={loadStatistics}
                >
                    Réessayer
                </button>
            </div>
        );
    }

    return (
        <div className="container-fluid">
            {/* En-tête avec contrôles */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center">
                        <div>
                            <h2 className="h4 mb-1">
                                <i className="fas fa-chart-bar text-primary me-2"></i>
                                Tableau de Bord Statistiques
                            </h2>
                            <p className="text-muted mb-0">
                                Vue d'ensemble des performances de la plateforme
                                {lastUpdate && (
                                    <small className="ms-2">
                                        • Dernière mise à jour: {lastUpdate.toLocaleTimeString('fr-FR')}
                                    </small>
                                )}
                            </p>
                        </div>
                        
                        <div className="d-flex flex-wrap gap-2 mt-3 mt-lg-0">
                            {/* Sélecteur de période */}
                            <select 
                                className="form-select"
                                value={timeRange}
                                onChange={(e) => setTimeRange(e.target.value)}
                                style={{ width: '120px' }}
                            >
                                <option value="7d">7 jours</option>
                                <option value="30d">30 jours</option>
                                <option value="90d">90 jours</option>
                                <option value="1y">1 année</option>
                            </select>
                            
                            {/* Toggle actualisation automatique */}
                            <div className="form-check form-switch d-flex align-items-center">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id="autoRefresh"
                                    checked={autoRefresh}
                                    onChange={(e) => setAutoRefresh(e.target.checked)}
                                />
                                <label className="form-check-label ms-1" htmlFor="autoRefresh">
                                    Auto-actualisation
                                </label>
                            </div>
                            
                            {/* Boutons d'action */}
                            <button 
                                className="btn btn-outline-primary"
                                onClick={loadStatistics}
                                disabled={loading}
                            >
                                <i className="fas fa-sync-alt me-1"></i>
                                Actualiser
                            </button>
                            
                            <button 
                                className="btn btn-success"
                                onClick={exportStatistics}
                            >
                                <i className="fas fa-download me-1"></i>
                                Exporter
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Indicateurs clés de performance */}
            <div className="row mb-4">
                <div className="col-lg-3 col-md-6 mb-3">
                    <div className="card bg-primary text-white h-100">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-start">
                                <div>
                                    <h6 className="card-title">Utilisateurs Totaux</h6>
                                    <h3 className="mb-1">{formatNumber(stats.global.totalUsers)}</h3>
                                    <small className={getGrowthClass(stats.global.userGrowth)}>
                                        <i className={`fas fa-arrow-${stats.global.userGrowth >= 0 ? 'up' : 'down'} me-1`}></i>
                                        {Math.abs(stats.global.userGrowth)}% vs période précédente
                                    </small>
                                </div>
                                <i className="fas fa-users fa-2x opacity-75"></i>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="col-lg-3 col-md-6 mb-3">
                    <div className="card bg-success text-white h-100">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-start">
                                <div>
                                    <h6 className="card-title">Collections Réalisées</h6>
                                    <h3 className="mb-1">{formatNumber(stats.global.totalCollections)}</h3>
                                    <small className={getGrowthClass(stats.global.collectionGrowth)}>
                                        <i className={`fas fa-arrow-${stats.global.collectionGrowth >= 0 ? 'up' : 'down'} me-1`}></i>
                                        {Math.abs(stats.global.collectionGrowth)}% vs période précédente
                                    </small>
                                </div>
                                <i className="fas fa-trash-alt fa-2x opacity-75"></i>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="col-lg-3 col-md-6 mb-3">
                    <div className="card bg-warning text-white h-100">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-start">
                                <div>
                                    <h6 className="card-title">Volume Collecté</h6>
                                    <h3 className="mb-1">{formatNumber(stats.global.totalVolume)} kg</h3>
                                    <small className={getGrowthClass(stats.global.volumeGrowth)}>
                                        <i className={`fas fa-arrow-${stats.global.volumeGrowth >= 0 ? 'up' : 'down'} me-1`}></i>
                                        {Math.abs(stats.global.volumeGrowth)}% vs période précédente
                                    </small>
                                </div>
                                <i className="fas fa-weight fa-2x opacity-75"></i>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="col-lg-3 col-md-6 mb-3">
                    <div className="card bg-info text-white h-100">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-start">
                                <div>
                                    <h6 className="card-title">Revenus Générés</h6>
                                    <h3 className="mb-1">{formatNumber(stats.global.totalRevenue)} GNF</h3>
                                    <small className={getGrowthClass(stats.global.revenueGrowth)}>
                                        <i className={`fas fa-arrow-${stats.global.revenueGrowth >= 0 ? 'up' : 'down'} me-1`}></i>
                                        {Math.abs(stats.global.revenueGrowth)}% vs période précédente
                                    </small>
                                </div>
                                <i className="fas fa-coins fa-2x opacity-75"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Statistiques par catégorie */}
            <div className="row mb-4">
                {/* Statistiques des Collecteurs */}
                <div className="col-lg-4  mb-4">
                    <div className="card h-100">
                        <div className="card-header bg-light">
                            <h5 className="mb-0">
                                <i className="fas fa-user-tie text-primary me-2"></i>
                                Collecteurs
                            </h5>
                        </div>
                        <div className="card-body">
                            <div className="row g-3">
                                <div className="col-6">
                                    <div className="text-center">
                                        <h4 className="text-primary mb-1">{formatNumber(stats.collectors.total)}</h4>
                                        <small className="text-muted">Total Actifs</small>
                                    </div>
                                </div>
                                <div className="col-6">
                                    <div className="text-center">
                                        <h4 className="text-success mb-1">{stats.collectors.averageRating}/5</h4>
                                        <small className="text-muted">Note Moyenne</small>
                                    </div>
                                </div>
                                <div className="col-6">
                                    <div className="text-center">
                                        <h4 className="text-warning mb-1">{formatNumber(stats.collectors.totalEarnings)} GNF</h4>
                                        <small className="text-muted">Revenus Totaux</small>
                                    </div>
                                </div>
                                <div className="col-6">
                                    <div className="text-center">
                                        <h4 className="text-info mb-1">{stats.collectors.efficiencyRate}%</h4>
                                        <small className="text-muted">Taux d'Efficacité</small>
                                    </div>
                                </div>
                            </div>
                            <hr />
                            <div className="d-flex justify-content-between align-items-center">
                                <small className="text-muted">Nouveaux cette période:</small>
                                <span className="badge bg-primary">{stats.collectors.newThisPeriod}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Statistiques des Ménages */}
                <div className="col-lg-4 mb-4">
                    <div className="card h-100">
                        <div className="card-header bg-light">
                            <h5 className="mb-0">
                                <i className="fas fa-home text-success me-2"></i>
                                Ménages
                            </h5>
                        </div>
                        <div className="card-body">
                            <div className="row g-3">
                                <div className="col-6">
                                    <div className="text-center">
                                        <h4 className="text-primary mb-1">{formatNumber(stats.households.total)}</h4>
                                        <small className="text-muted">Total Inscrits</small>
                                    </div>
                                </div>
                                <div className="col-6">
                                    <div className="text-center">
                                        <h4 className="text-success mb-1">{stats.households.activePercentage}%</h4>
                                        <small className="text-muted">Taux d'Activité</small>
                                    </div>
                                </div>
                                <div className="col-6">
                                    <div className="text-center">
                                        <h4 className="text-warning mb-1">{formatNumber(stats.households.totalRequests)}</h4>
                                        <small className="text-muted">Demandes Totales</small>
                                    </div>
                                </div>
                                <div className="col-6">
                                    <div className="text-center">
                                        <h4 className="text-info mb-1">{stats.households.satisfactionRate}%</h4>
                                        <small className="text-muted">Satisfaction</small>
                                    </div>
                                </div>
                            </div>
                            <hr />
                            <div className="d-flex justify-content-between align-items-center">
                                <small className="text-muted">Nouveaux cette période:</small>
                                <span className="badge bg-success">{stats.households.newThisPeriod}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Statistiques des Municipalités */}
                <div className="col-lg-4 mb-4">
                    <div className="card h-100">
                        <div className="card-header bg-light">
                            <h5 className="mb-0">
                                <i className="fas fa-city text-warning me-2"></i>
                                Municipalités
                            </h5>
                        </div>
                        <div className="card-body">
                            <div className="row g-3">
                                <div className="col-6">
                                    <div className="text-center">
                                        <h4 className="text-primary mb-1">{formatNumber(stats.municipalities.total)}</h4>
                                        <small className="text-muted">Total Actives</small>
                                    </div>
                                </div>
                                <div className="col-6">
                                    <div className="text-center">
                                        <h4 className="text-success mb-1">{stats.municipalities.coverageRate}%</h4>
                                        <small className="text-muted">Taux Couverture</small>
                                    </div>
                                </div>
                                <div className="col-6">
                                    <div className="text-center">
                                        <h4 className="text-warning mb-1">{formatNumber(stats.municipalities.totalPopulation)}</h4>
                                        <small className="text-muted">Population Totale</small>
                                    </div>
                                </div>
                                <div className="col-6">
                                    <div className="text-center">
                                        <h4 className="text-info mb-1">{stats.municipalities.averageFrequency}</h4>
                                        <small className="text-muted">Fréq. Moyenne</small>
                                    </div>
                                </div>
                            </div>
                            <hr />
                            <div className="d-flex justify-content-between align-items-center">
                                <small className="text-muted">Zones mal desservies:</small>
                                <span className="badge bg-danger">{stats.municipalities.underservedAreas}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Graphiques et tendances */}
            <div className="row mb-4">
                {/* Graphique des tendances */}
                <div className="col-lg-8 mb-4">
                    <div className="card">
                        <div className="card-header">
                            <h5 className="mb-0">
                                <i className="fas fa-chart-line me-2"></i>
                                Tendances sur {timeRange === '7d' ? '7 jours' : timeRange === '30d' ? '30 jours' : timeRange === '90d' ? '90 jours' : '1 année'}
                            </h5>
                        </div>
                        <div className="card-body">
                            {/* Placeholder pour graphique - nécessitera une bibliothèque comme Chart.js ou Recharts */}
                            <div className="d-flex justify-content-center align-items-center bg-light rounded" style={{ height: '300px' }}>
                                <div className="text-center">
                                    <i className="fas fa-chart-line fa-3x text-muted mb-3"></i>
                                    <h6 className="text-muted">Graphique des Tendances</h6>
                                    <p className="text-muted small">
                                        Intégration Chart.js/Recharts à implémenter
                                        <br />
                                        Données disponibles: {stats.trends.length} points
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Répartition par type de déchets */}
                <div className="col-lg-4 mb-4">
                    <div className="card">
                        <div className="card-header">
                            <h5 className="mb-0">
                                <i className="fas fa-chart-pie me-2"></i>
                                Types de Déchets
                            </h5>
                        </div>
                        <div className="card-body">
                            <div className="mb-3">
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                    <small>Organiques</small>
                                    <small>45%</small>
                                </div>
                                <div className="progress" style={{ height: '8px' }}>
                                    <div className="progress-bar bg-success" style={{ width: '45%' }}></div>
                                </div>
                            </div>
                            
                            <div className="mb-3">
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                    <small>Recyclables</small>
                                    <small>30%</small>
                                </div>
                                <div className="progress" style={{ height: '8px' }}>
                                    <div className="progress-bar bg-primary" style={{ width: '30%' }}></div>
                                </div>
                            </div>
                            
                            <div className="mb-3">
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                    <small>Non-recyclables</small>
                                    <small>20%</small>
                                </div>
                                <div className="progress" style={{ height: '8px' }}>
                                    <div className="progress-bar bg-warning" style={{ width: '20%' }}></div>
                                </div>
                            </div>
                            
                            <div className="mb-3">
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                    <small>Dangereux</small>
                                    <small>5%</small>
                                </div>
                                <div className="progress" style={{ height: '8px' }}>
                                    <div className="progress-bar bg-danger" style={{ width: '5%' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tableaux détaillés */}
            <div className="row">
                {/* Top Collecteurs */}
                <div className="col-lg-6 mb-4">
                    <div className="card">
                        <div className="card-header">
                            <h5 className="mb-0">
                                <i className="fas fa-trophy text-warning me-2"></i>
                                Top Collecteurs
                            </h5>
                        </div>
                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <table className="table table-hover mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Rang</th>
                                            <th>Collecteur</th>
                                            <th>Collections</th>
                                            <th>Note</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stats.collectors.topPerformers?.map((collector, index) => (
                                            <tr key={collector.id}>
                                                <td>
                                                    <span className={`badge ${index === 0 ? 'bg-warning' : index === 1 ? 'bg-secondary' : index === 2 ? 'bg-info' : 'bg-light text-dark'}`}>
                                                        #{index + 1}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <div className="avatar-sm bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2">
                                                            {collector.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <div className="fw-medium">{collector.name}</div>
                                                            <small className="text-muted">{collector.location}</small>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="badge bg-success">{collector.collections}</span>
                                                </td>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <span className="me-1">{collector.rating}</span>
                                                        <i className="fas fa-star text-warning"></i>
                                                    </div>
                                                </td>
                                            </tr>
                                        )) || Array.from({ length: 5 }, (_, i) => (
                                            <tr key={i}>
                                                <td><span className="badge bg-light text-dark">#{i + 1}</span></td>
                                                <td>
                                                    <div className="placeholder-glow">
                                                        <span className="placeholder col-8"></span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="placeholder-glow">
                                                        <span className="placeholder col-4"></span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="placeholder-glow">
                                                        <span className="placeholder col-6"></span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Activité récente */}
                <div className="col-lg-6 mb-4">
                    <div className="card">
                        <div className="card-header">
                            <h5 className="mb-0">
                                <i className="fas fa-clock text-info me-2"></i>
                                Activité Récente
                            </h5>
                        </div>
                        <div className="card-body">
                            <div className="timeline">
                                {stats.global.recentActivity?.map((activity, index) => (
                                    <div key={index} className="timeline-item d-flex mb-3">
                                        <div className={`timeline-marker bg-${activity.type === 'collection' ? 'success' : activity.type === 'registration' ? 'primary' : 'warning'} rounded-circle d-flex align-items-center justify-content-center me-3`} style={{ width: '32px', height: '32px', minWidth: '32px' }}>
                                            <i className={`fas fa-${activity.type === 'collection' ? 'trash' : activity.type === 'registration' ? 'user-plus' : 'exclamation'} fa-sm text-white`}></i>
                                        </div>
                                        <div className="timeline-content">
                                            <div className="fw-medium">{activity.description}</div>
                                            <small className="text-muted">{activity.timestamp}</small>
                                        </div>
                                    </div>
                                )) || Array.from({ length: 5 }, (_, i) => (
                                    <div key={i} className="timeline-item d-flex mb-3">
                                        <div className="timeline-marker bg-secondary rounded-circle me-3" style={{ width: '32px', height: '32px', minWidth: '32px' }}></div>
                                        <div className="timeline-content flex-grow-1">
                                            <div className="placeholder-glow">
                                                <span className="placeholder col-10"></span>
                                                <br />
                                                <span className="placeholder col-4"></span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatisticsOverview;