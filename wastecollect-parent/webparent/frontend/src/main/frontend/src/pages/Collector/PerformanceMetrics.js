// frontend/src/pages/Collector/PerformanceMetrics.js
import React, { useState, useEffect, useContext, useCallback } from 'react';
import AuthContext from '../../contexts/AuthContext';
import collectorService from '../../services/collectorService';
import LoadingSpinner from '../../components/LoadingSpinner';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { Card, Row, Col, Form, Button } from 'react-bootstrap';
import { Alert } from 'react-bootstrap';

/**
 * PerformanceMetrics Component - Displays performance metrics for collectors.
 *
 * This component allows collectors to visualize their performance indicators:
 * - General statistics (number of collections, revenue, ratings)
 * - Performance charts by period (visually represented placeholders)
 * - Objectives and achievements
 * - Revenue evolution
 * - Household feedback
 *
 * Features included:
 * - Responsive display (web and mobile)
 * - Filtering by period (day, week, month, year)
 * - Enhanced visual design for KPIs and sections
 * - Data export (button placeholder)
 * - Objective achievement notifications (button placeholder)
 */
const PerformanceMetrics = () => {
    // Authentication context to retrieve logged-in collector info
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    // State variables for managing dashboard data and performance metrics
    const [stats, setStats] = useState({
        totalCollections: 0,
        totalRevenue: 0,
        averageRating: 0,
        completedToday: 0,
        pendingRequests: 0,
        weeklyRevenue: 0,
        dailyCollections: 0,
        totalRatings: 0,
        objectivesMet: 0,
        completionRate: 0, // Added for display
        feedbackScore: 0 // Added for display
    });
    const [performanceData, setPerformanceData] = useState([]); // For charts
    const [objectives, setObjectives] = useState([]); // For objectives
    const [feedback, setFeedback] = useState([]); // For recent feedback
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [period, setPeriod] = useState('daily'); // Filter for performance data

    /**
     * Fetches performance data from the backend.
     */
    const loadPerformanceData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const statsResponse = await collectorService.getCollectorStats();
            // Ensure all stats fields are initialized to avoid undefined errors
            setStats({
                totalCollections: statsResponse.data.totalRequests ?? 0, // Assuming totalRequests maps to totalCollections
                totalRevenue: statsResponse.data.totalRevenue ?? 0,
                averageRating: statsResponse.data.rating ?? 0, // Assuming 'rating' is averageRating
                completedToday: statsResponse.data.completedToday ?? 0,
                pendingRequests: statsResponse.data.pendingRequests ?? 0,
                weeklyRevenue: statsResponse.data.weeklyRevenue ?? 0,
                dailyCollections: statsResponse.data.dailyCollections ?? 0, // If backend provides this
                totalRatings: statsResponse.data.totalRatings ?? 0,
                objectivesMet: statsResponse.data.objectivesMet ?? 0, // Placeholder, assuming backend provides
                completionRate: statsResponse.data.completionRate ?? 0, // Placeholder, assuming backend provides
                feedbackScore: statsResponse.data.feedbackScore ?? 0 // Placeholder, assuming backend provides
            });

            const performanceResponse = await collectorService.getCollectorPerformance(period);
            setPerformanceData(performanceResponse.data);

            const objectivesResponse = await collectorService.getObjectives();
            setObjectives(objectivesResponse.data);

            const feedbackResponse = await collectorService.getRecentFeedback();
            setFeedback(feedbackResponse.data);

        } catch (err) {
            console.error('Erreur lors du chargement des données de performance:', err);
            const errorMessage = err.response?.data?.message || 'Échec du chargement des données de performance.';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [user, period]); // Reload if user changes or period filter changes

    useEffect(() => {
        if (user) {
            loadPerformanceData();
        }
    }, [user, loadPerformanceData]);

    const handlePeriodChange = (e) => {
        setPeriod(e.target.value);
    };

    // Helper function to render star ratings
    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) {
                stars.push(<i key={i} className="fas fa-star text-yellow-400"></i>);
            } else if (i - 0.5 === rating) {
                stars.push(<i key={i} className="fas fa-star-half-alt text-yellow-400"></i>);
            } else {
                stars.push(<i key={i} className="far fa-star text-gray-300"></i>);
            }
        }
        return stars;
    };

    // Placeholder for a more visually appealing chart representation
    const renderPerformanceChartPlaceholder = () => (
        <div className="bg-white p-6 rounded-xl shadow-inner border border-gray-200">
            <h5 className="text-xl font-semibold text-gray-800 mb-4">Tendances de Performance ({period === 'daily' ? 'Quotidien' : period === 'weekly' ? 'Hebdomadaire' : period === 'monthly' ? 'Mensuel' : 'Annuel'})</h5>
            <div className="flex items-end h-48 gap-2 border-b border-l border-gray-300 pb-2 pl-2">
                {/* Example bars - replace with actual data mapping if recharts is integrated */}
                {[...Array(7)].map((_, i) => (
                    <div
                        key={i}
                        className="bg-blue-400 hover:bg-blue-500 transition-all duration-300 rounded-t-sm"
                        style={{ height: `${Math.random() * 80 + 20}%`, width: `${100 / 7 - 2}%` }} // Random height for visual effect
                        title={`Value: ${Math.round(Math.random() * 100)}`}
                    ></div>
                ))}
            </div>
            <div className="text-center text-gray-500 text-sm mt-2">
                {/* X-axis labels placeholder */}
                <div className="flex justify-between px-2">
                    <span>Jour 1</span>
                    <span>...</span>
                    <span>Jour 7</span>
                </div>
            </div>
            <p className="text-center text-gray-500 text-sm mt-4">
                Les graphiques interactifs pour cette section seront disponibles bientôt.
            </p>
        </div>
    );


    return (
        <div className="font-inter bg-gradient-to-br from-green-100 to-blue-100 min-h-screen py-12"> {/* Increased vertical padding */}
            <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
            <div className="container mx-auto px-4">
                <div className="max-w-7xl mx-auto">
                    {loading && (
                        <LoadingSpinner message="Chargement des métriques de performance..." fullScreen={false} />
                    )}

                    {error && (
                        <Alert variant="danger" className="mb-4 text-center shadow-md rounded-lg">
                            Erreur: {error}
                        </Alert>
                    )}

                    {!loading && !error && (
                        <div>
                            <h2 className="text-5xl font-extrabold text-green-800 mb-12 text-center drop-shadow-md"> {/* Increased margin-bottom */}
                                📈 Mes Performances
                            </h2>

                            {/* Section: Hero KPIs */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                                {/* Total Collections */}
                                <Card className="shadow-xl rounded-2xl border-0 p-5 bg-white transform hover:scale-105 transition-transform duration-300">
                                    <Card.Body className="text-center">
                                        <div className="text-5xl text-blue-600 mb-3">
                                            <i className="fas fa-box-open"></i>
                                        </div>
                                        <h5 className="text-xl font-semibold text-gray-800 mb-2">Collectes Totales</h5>
                                        <p className="text-4xl font-bold text-blue-700">
                                            {stats.totalCollections ?? 0}
                                        </p>
                                    </Card.Body>
                                </Card>

                                {/* Total Revenue */}
                                <Card className="shadow-xl rounded-2xl border-0 p-5 bg-white transform hover:scale-105 transition-transform duration-300">
                                    <Card.Body className="text-center">
                                        <div className="text-5xl text-green-600 mb-3">
                                            <i className="fas fa-dollar-sign"></i>
                                        </div>
                                        <h5 className="text-xl font-semibold text-gray-800 mb-2">Revenu Total</h5>
                                        <p className="text-4xl font-bold text-green-700">
                                            ${(stats.totalRevenue ?? 0).toFixed(2)}
                                        </p>
                                    </Card.Body>
                                </Card>

                                {/* Average Rating */}
                                <Card className="shadow-xl rounded-2xl border-0 p-5 bg-white transform hover:scale-105 transition-transform duration-300">
                                    <Card.Body className="text-center">
                                        <div className="text-5xl text-yellow-500 mb-3">
                                            <i className="fas fa-star"></i>
                                        </div>
                                        <h5 className="text-xl font-semibold text-gray-800 mb-2">Note Moyenne</h5>
                                        <p className="text-4xl font-bold text-yellow-600">
                                            {(stats.averageRating ?? 0).toFixed(1)}/5
                                        </p>
                                        <p className="text-sm text-gray-600">({stats.totalRatings ?? 0} évaluations)</p>
                                    </Card.Body>
                                </Card>

                                {/* Completion Rate */}
                                <Card className="shadow-xl rounded-2xl border-0 p-5 bg-white transform hover:scale-105 transition-transform duration-300">
                                    <Card.Body className="text-center">
                                        <div className="text-5xl text-purple-600 mb-3">
                                            <i className="fas fa-check-circle"></i>
                                        </div>
                                        <h5 className="text-xl font-semibold text-gray-800 mb-2">Taux de Complétion</h5>
                                        <p className="text-4xl font-bold text-purple-700">
                                            {(stats.completionRate ?? 0).toFixed(1)}%
                                        </p>
                                    </Card.Body>
                                </Card>
                            </div>

                            {/* Section: Daily/Weekly Overview */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                                {/* Completed Today */}
                                <Card className="shadow-lg rounded-xl border-0 p-4 bg-white">
                                    <Card.Body>
                                        <div className="d-flex align-items-center mb-3">
                                            <div className="text-4xl text-teal-500 me-3">
                                                <i className="fas fa-calendar-check"></i>
                                            </div>
                                            <div>
                                                <h5 className="text-xl font-semibold text-gray-800 mb-1">Collectes Terminées Aujourd'hui</h5>
                                                <p className="text-3xl font-bold text-teal-600">{stats.completedToday ?? 0}</p>
                                            </div>
                                        </div>
                                    </Card.Body>
                                </Card>

                                {/* Pending Requests */}
                                <Card className="shadow-lg rounded-xl border-0 p-4 bg-white">
                                    <Card.Body>
                                        <div className="d-flex align-items-center mb-3">
                                            <div className="text-4xl text-orange-500 me-3">
                                                <i className="fas fa-hourglass-half"></i>
                                            </div>
                                            <div>
                                                <h5 className="text-xl font-semibold text-gray-800 mb-1">Demandes en Attente</h5>
                                                <p className="text-3xl font-bold text-orange-600">{stats.pendingRequests ?? 0}</p>
                                            </div>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </div>

                            {/* Section: Performance Trends (Chart Placeholder) */}
                            <div className="card shadow-xl rounded-2xl border-0 p-6 mb-10 bg-white">
                                <div className="card-body">
                                    <Form.Group controlId="periodFilter" className="mb-5 d-flex align-items-center">
                                        <Form.Label className="me-3 text-lg font-semibold text-gray-700">Performance par Période:</Form.Label>
                                        <Form.Control
                                            as="select"
                                            value={period}
                                            onChange={handlePeriodChange}
                                            className="w-auto rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                                        >
                                            <option value="daily">Quotidien</option>
                                            <option value="weekly">Hebdomadaire</option>
                                            <option value="monthly">Mensuel</option>
                                            <option value="yearly">Annuel</option>
                                        </Form.Control>
                                    </Form.Group>
                                    {renderPerformanceChartPlaceholder()}
                                </div>
                            </div>

                            {/* Section: Objectives */}
                            <div className="card shadow-xl rounded-2xl border-0 p-6 mb-10 bg-white">
                                <div className="card-body">
                                    <h4 className="text-3xl font-bold text-gray-800 mb-6 text-center border-b-2 border-green-500 pb-3"> {/* Added border */}
                                        🎯 Mes Objectifs
                                    </h4>
                                    {objectives.length > 0 ? (
                                        <ul className="list-unstyled space-y-4">
                                            {objectives.map((obj, index) => (
                                                <li key={index} className="d-flex align-items-center bg-green-50 p-4 rounded-lg shadow-sm border border-green-200"> {/* Changed bg and border color */}
                                                    <div className={`text-3xl me-4 ${obj.achieved ? 'text-green-600' : 'text-orange-600'}`}> {/* Stronger text color */}
                                                        <i className={`fas fa-${obj.achieved ? 'check-circle' : 'bullseye'}`}></i>
                                                    </div>
                                                    <div>
                                                        <h6 className="font-semibold text-gray-800 mb-1 text-lg">{obj.description}</h6>
                                                        <p className="text-sm text-gray-700 mb-0">Statut: <span className="font-medium">{obj.achieved ? 'Atteint' : 'En cours'}</span></p> {/* Darker text */}
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="text-center py-5 text-gray-500">
                                            <i className="fas fa-bullseye fa-5x mb-4"></i>
                                            <h5 className="text-2xl font-semibold">Aucun Objectif Fixé</h5>
                                            <p className="text-lg">Définissez des objectifs pour suivre votre progression !</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Section: Household Feedback */}
                            <div className="card shadow-xl rounded-2xl border-0 p-6 mb-10 bg-white">
                                <div className="card-body">
                                    <h4 className="text-3xl font-bold text-gray-800 mb-6 text-center border-b-2 border-blue-500 pb-3"> {/* Added border */}
                                        💬 Retours des Ménages
                                    </h4>
                                    {feedback.length > 0 ? (
                                        <ul className="list-unstyled space-y-4">
                                            {feedback.map((f, index) => (
                                                <li key={index} className="bg-blue-50 p-4 rounded-lg shadow-sm border border-blue-200"> {/* Changed bg and border color */}
                                                    <div className="d-flex align-items-center mb-2">
                                                        <div className="text-2xl text-gray-700 me-3"> {/* Darker text */}
                                                            <i className="fas fa-user-circle"></i>
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-gray-800 mb-0">
                                                                {f.householdName || 'Ménage Anonyme'}
                                                            </p>
                                                            <div className="text-sm">
                                                                {renderStars(f.rating ?? 0)} <span className="text-yellow-600 font-bold">{(f.rating ?? 0).toFixed(1)}/5</span> {/* Stronger yellow */}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <p className="text-gray-700 text-base mb-2">{f.comment}</p>
                                                    <p className="text-xs text-gray-600 mb-0">Date: {new Date(f.createdAt).toLocaleDateString('fr-FR')}</p> {/* Darker text */}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="text-center py-5 text-gray-500">
                                            <i className="fas fa-comments fa-5x mb-4"></i>
                                            <h5 className="text-2xl font-semibold">Aucun Retour Récent</h5>
                                            <p className="text-lg">Les retours des ménages apparaîtront ici.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="d-flex justify-content-center gap-4 mt-12 flex-wrap"> {/* Increased margin-top */}
                                <Button
                                  variant="outline-secondary"
                                  onClick={() => navigate(-1)}
                                  className="px-6 py-3 rounded-xl text-lg font-semibold shadow-md hover:bg-gray-100 transition-colors duration-200 flex items-center"
                                >
                                  <i className="fas fa-arrow-left me-2"></i> Retour
                                </Button>
                                <Button
                                  variant="primary"
                                  onClick={() => navigate('/collector/dashboard')}
                                  className="px-6 py-3 rounded-xl text-lg font-semibold shadow-md hover:bg-blue-700 transition-colors duration-200 flex items-center"
                                >
                                  <i className="fas fa-tachometer-alt me-2"></i> Retour au Tableau de Bord
                                </Button>
                                <Button className="btn btn-success px-6 py-3 rounded-xl text-lg font-semibold shadow-md hover:bg-green-700 transition-colors duration-200 flex items-center">
                                    <i className="fas fa-download me-2"></i>
                                    Exporter les Données
                                </Button>
                                <Button className="btn btn-info px-6 py-3 rounded-xl text-lg font-semibold shadow-md hover:bg-teal-600 transition-colors duration-200 flex items-center">
                                    <i className="fas fa-cog me-2"></i>
                                    Paramètres des Objectifs
                                </Button>
                                <Button
                                    className="btn btn-warning px-6 py-3 rounded-xl text-lg font-semibold shadow-md hover:bg-yellow-600 transition-colors duration-200 flex items-center"
                                    onClick={() => navigate('/collector/schedule')}
                                >
                                    <i className="fas fa-calendar-alt me-2"></i>
                                    Planifier les Collectes
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PerformanceMetrics;
