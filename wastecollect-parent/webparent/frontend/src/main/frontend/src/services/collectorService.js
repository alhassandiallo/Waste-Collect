// frontend/src/services/collectorService.js
import api from './api'; // Correctly imports the single, globally configured axios instance

// FIX: The base URL no longer needs the /api prefix, as it's handled globally.
const COLLECTOR_API_BASE_URL = '/v1/collector';

const collectorService = {
    // Fetches general performance summary for the authenticated collector (for Dashboard & PerformanceMetrics)
    getCollectorStats: () => {
        return api.get(`${COLLECTOR_API_BASE_URL}/performance-indicators`);
    },

    // Fetches detailed performance data for charts (for PerformanceMetrics)
    getCollectorPerformance: (period) => {
        return api.get(`${COLLECTOR_API_BASE_URL}/performance-data`, { params: { period } });
    },

    // Fetches collector's objectives (for PerformanceMetrics)
    getObjectives: () => {
        return api.get(`${COLLECTOR_API_BASE_URL}/objectives`);
    },

    // Fetches recent household feedback (for PerformanceMetrics)
    getRecentFeedback: (limit = 5) => {
        return api.get(`${COLLECTOR_API_BASE_URL}/recent-feedback`, { params: { limit } });
    },

    // Fetches all security alerts for the authenticated collector (for Dashboard and CollectorAlertsPage)
    getSecurityAlerts: () => {
        return api.get(`${COLLECTOR_API_BASE_URL}/alerts`);
    },

    // Marks a specific security alert as read for the authenticated collector
    markAlertAsRead: (alertId) => {
        // Assuming the backend has a PUT or POST endpoint like /api/v1/collector/alerts/mark-as-read/{alertId}
        return api.put(`${COLLECTOR_API_BASE_URL}/alerts/mark-as-read/${alertId}`);
    },

    // Fetches mobile revenue details for the authenticated collector (for CollectorRevenuePage)
    getMobileRevenue: () => {
        return api.get(`${COLLECTOR_API_BASE_URL}/revenue`);
    },

    // Sends a security alert (if collectors can initiate them)
    sendSecurityAlert: (alertData) => {
        return api.post(`${COLLECTOR_API_BASE_URL}/send-alert`, alertData);
    },

    // Fetches service requests relevant to the authenticated collector
    getRequestsForCollector: () => {
        return api.get(`${COLLECTOR_API_BASE_URL}/service-requests`);
    },

    // Accepts a service request
    acceptRequest: (requestId, actionData) => {
        return api.post(`${COLLECTOR_API_BASE_URL}/${requestId}/accept`, actionData);
    },

    // Rejects a service request
    rejectRequest: (requestId, actionData) => {
        return api.post(`${COLLECTOR_API_BASE_URL}/${requestId}/reject`, actionData);
    },

    // Marks a service request as in progress
    startRequest: (requestId) => {
        return api.post(`${COLLECTOR_API_BASE_URL}/${requestId}/start`);
    },

    // Marks a service request as completed
    completeRequest: (requestId, actionData) => {
        return api.post(`${COLLECTOR_API_BASE_URL}/${requestId}/complete`, actionData);
    },

    // For dashboard, fetching recent requests. Reusing getRequestsForCollector
    getRecentRequestsByCollector: () => {
        return api.get(`${COLLECTOR_API_BASE_URL}/service-requests`);
    },

    // Fetches the collector's profile
    getCollectorProfile: () => {
        return api.get(`${COLLECTOR_API_BASE_URL}/profile`);
    },

    // Updates the collector's profile
    updateCollectorProfile: (profileData) => {
        return api.put(`${COLLECTOR_API_BASE_URL}/profile`, profileData);
    },

    // Updates the collector's password
    updateCollectorPassword: (passwordData) => {
        return api.put(`${COLLECTOR_API_BASE_URL}/update-password`, passwordData);
    },
};

export default collectorService;
