// frontend/src/App.js
import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css'; // Retained this as it's common for React Bootstrap apps
import './styles/main.css'; // Retained this as it's common for React apps
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Retained this as it's typically required for toastify styles

// Import common components (restoring from original context, assuming they exist)
import Header from './components/Header';
import Footer from './components/Footer';
import LoadingSpinner from './components/LoadingSpinner';

// Import authentication pages
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import UnauthorizedPage from './pages/Auth/UnauthorizedPage'; // Now importing the created UnauthorizedPage
import NotFoundPage from './pages/NotFoundPage'; // Now importing the created NotFoundPage
import ForgotPasswordPage from './pages/Auth/ForgotPasswordPage'; // NEW: Import ForgotPasswordPage
import ResetPasswordPage from './pages/Auth/ResetPasswordPage';   // NEW: Import ResetPasswordPage


// Import Admin pages (restoring all original imports)
import AdminDashboard from './pages/Admin/AdminDashboard';
import ManageCollectors from './pages/Admin/ManageCollectors';
import ManageHouseholds from './pages/Admin/ManageHouseholds';
import ReportsPage from './pages/Admin/ReportsPage';
import AdminLayout from './pages/Admin/AdminLayout';
import ManageMunicipalities from './pages/Admin/ManageMunicipalities';
import SettingsPage from './pages/Admin/SettingsPage'; // Admin Settings
import AdminProfilePage from './pages/Admin/AdminProfilePage';
import NotificationsPage from './pages/Admin/NotificationsPage';
// The *only* new import directly relevant to notifications
import SendNotificationPage from './pages/Admin/SendNotificationPage';


// Import Collector pages (restoring all original imports)
import CollectorDashboard from './pages/Collector/CollectorDashboard';
import ServiceRequests from './pages/Collector/ServiceRequests';
import PerformanceMetrics from './pages/Collector/PerformanceMetrics';
import CollectorRevenuePage from './pages/Collector/CollectorRevenuePage';
import CollectorSchedulePage from './pages/Collector/CollectorSchedulePage';
import CollectorProfilePage from './pages/Collector/CollectorProfilePage';
import CollectorSettingsPage from './pages/Collector/CollectorSettingsPage';
import CollectorAlertsPage from './pages/Collector/CollectorAlertsPage';

// Import Household pages (ensuring correct named exports are used)
import HouseholdDashboard from './pages/Household/HouseholdDashboard';
import RequestPickup from './pages/Household/MakeServiceRequest'; // MakeServiceRequest.js exports RequestPickup
import PaymentHistory from './pages/Household/PaymentHistoryPage'; // PaymentHistoryPage.js exports PaymentHistory
import HouseholdSettingsPage from './pages/Household/HouseholdSettingsPage'; // HouseholdSettingsPage.js exports HouseholdSettingsPage
import HouseholdProfilePage from './pages/Household/HouseholdProfilePage'; // HouseholdProfilePage.js exports HouseholdProfilePage
import RateCollectorPage from './pages/Household/RateCollectorPage'; // NEW: RateCollectorPage.js exports RateCollectorPage

// Import Municipality pages (restoring all original imports)
import MunicipalityDashboard from './pages/Municipality/MunicipalityDashboard';
import WasteTrackingPage from './pages/Municipality/WasteTrackingPage';
import UnderservedAreasPage from './pages/Municipality/UnderservedAreasPage';
import MunicipalSettingsPage from './pages/Municipality/MunicipalSettingsPage';
import MunicipalManagerProfilePage from './pages/Municipality/MunicipalManagerProfilePage';

// Import General pages (restoring all original imports)
import DisputeList from './pages/Dispute/DisputeList';
import DisputeDetailsPage from './pages/Dispute/DisputeDetailsPage';
import ProfilePage from './pages/ProfilePage'; // Generic profile page fallback

// Import AuthProvider and AuthContext
import { AuthProvider } from './contexts/AuthContext';
import AuthContext from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';


// RoleBasedRedirector component
const RoleBasedRedirector = () => {
  const { user, isAuthenticated, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Vérification de la session..." showLogo />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect based on user role after successful authentication
  switch (user.roleName) {
    case 'ADMIN':
      return <Navigate to="/admin/dashboard" replace />;
    case 'COLLECTOR':
      return <Navigate to="/collector/dashboard" replace />;
    case 'HOUSEHOLD':
      return <Navigate to="/household/dashboard" replace />;
    case 'MUNICIPALITY':
    case 'MUNICIPAL_MANAGER':
      return <Navigate to="/municipality/dashboard" replace />;
    default:
      return <Navigate to="/unauthorized" replace />; // Redirect to unauthorized if role is unknown
  }
};


function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App d-flex flex-column min-vh-100">
          <Header />
          <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
          <main className="flex-grow-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} /> {/* NEW ROUTE */}
              <Route path="/reset-password" element={<ResetPasswordPage />} />   {/* NEW ROUTE */}
              <Route path="/unauthorized" element={<UnauthorizedPage />} />
              <Route path="/not-found" element={<NotFoundPage />} />

              {/* Default redirect based on authentication and role */}
              <Route path="/" element={<RoleBasedRedirector />} />

              {/* Admin Routes - This uses AdminLayout as per your original file */}
              <Route path="/admin" element={<PrivateRoute allowedRoles={['ADMIN']}><AdminLayout /></PrivateRoute>}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="manage-collectors" element={<ManageCollectors />} />
                <Route path="manage-households" element={<ManageHouseholds />} />
                <Route path="manage-municipalities" element={<ManageMunicipalities />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="profile" element={<AdminProfilePage />} />
                <Route path="notifications" element={<NotificationsPage />} />
                {/* The *only* new route directly relevant to notifications */}
                <Route path="send-notification" element={<SendNotificationPage />} />
              </Route>

              {/* Collector Routes - This uses AdminLayout as per your original file */}
              <Route path="/collector" element={<PrivateRoute allowedRoles={['COLLECTOR']}><AdminLayout /></PrivateRoute>}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<CollectorDashboard />} />
                <Route path="service-requests" element={<ServiceRequests />} />
                <Route path="schedule" element={<CollectorSchedulePage />} />
                <Route path="performance" element={<PerformanceMetrics />} />
                <Route path="revenue" element={<CollectorRevenuePage />} />
                <Route path="alerts" element={<CollectorAlertsPage />} />
                <Route path="settings" element={<CollectorSettingsPage />} />
                <Route path="profile" element={<CollectorProfilePage />} />
                <Route path="notifications" element={<NotificationsPage />} />
              </Route>

              {/* Household Routes */}
              {/* If AdminLayout is not provided, this route will cause errors. Replacing with a generic div+Outlet fallback. */}
              <Route path="/household" element={<PrivateRoute allowedRoles={['HOUSEHOLD']}>
                {/* Placeholder for layout if AdminLayout is not provided and causing issues */}
                <div className="container py-5">
                  <div className="row">
                    <div className="col-12">
                      <Outlet /> {/* Renders nested routes here */}
                    </div>
                  </div>
                </div>
              </PrivateRoute>}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<HouseholdDashboard />} />
                <Route path="request-pickup" element={<RequestPickup />} />
                <Route path="payment-history" element={<PaymentHistory />} />
                <Route path="settings" element={<HouseholdSettingsPage />} />
                <Route path="profile" element={<HouseholdProfilePage />} />
                <Route path="rate-collector" element={<RateCollectorPage />} />
                <Route path="notifications" element={<NotificationsPage />} />
              </Route>

              {/* Municipality Routes - This uses AdminLayout as per your original file */}
              <Route path="/municipality" element={<PrivateRoute allowedRoles={['MUNICIPALITY', 'MUNICIPAL_MANAGER']}><AdminLayout /></PrivateRoute>}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<MunicipalityDashboard />} />
                <Route path="waste-tracking" element={<WasteTrackingPage />} />
                <Route path="underserved-areas" element={<UnderservedAreasPage />} />
                <Route path="settings" element={<MunicipalSettingsPage />} />
                <Route path="profile" element={<MunicipalManagerProfilePage />} />
                <Route path="notifications" element={<NotificationsPage />} />
              </Route>

              {/* General Disputes Page */}
              <Route path="/disputes" element={<PrivateRoute allowedRoles={['ADMIN', 'COLLECTOR', 'HOUSEHOLD', 'MUNICIPALITY', 'MUNICIPAL_MANAGER']}><DisputeList /></PrivateRoute>} />
              <Route path="/disputes/:disputeId" element={<PrivateRoute allowedRoles={['ADMIN', 'COLLECTOR', 'HOUSEHOLD', 'MUNICIPALITY', 'MUNICIPAL_MANAGER']}><DisputeDetailsPage /></PrivateRoute>} />

              {/* Fallback for generic profile */}
              <Route path="/profile" element={<PrivateRoute allowedRoles={['ADMIN', 'COLLECTOR', 'HOUSEHOLD', 'MUNICIPALITY', 'MUNICIPAL_MANAGER']}><ProfilePage /></PrivateRoute>} />

              {/* Catch-all for 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
