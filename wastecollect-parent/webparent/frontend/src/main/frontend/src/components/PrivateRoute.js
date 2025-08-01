// frontend/src/components/PrivateRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

/**
 * PrivateRoute Component
 * A wrapper component that protects routes based on authentication status and user roles.
 *
 * It provides:
 * - A loading state while authentication information is being fetched.
 * - Redirection to the login page if the user is not authenticated.
 * - Redirection to an unauthorized page if the user is authenticated but does not have
 * the required roles to access the route.
 * - Renders its children (the protected component) if the user is authenticated and authorized.
 */
const PrivateRoute = ({ children, allowedRoles }) => {
    // Get authentication and user details from the useAuth hook
    const { isAuthenticated, user, isLoading } = useAuth();

    // While authentication status is being determined, display a loading message.
    // This prevents premature redirects before the user object is fully loaded.
    if (isLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center min-h-screen">
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading user session...</span>
                    </div>
                    <p className="mt-3 text-gray-600">Chargement de la session utilisateur...</p>
                </div>
            </div>
        );
    }

    // If the user is not authenticated, redirect them to the login page.
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // If allowedRoles are specified, check if the authenticated user has any of them.
    if (allowedRoles && allowedRoles.length > 0) {
        // Check user.roleName instead of user.role for consistency with backend DTOs
        if (!user || !user.roleName || !allowedRoles.includes(user.roleName)) {
            console.warn(`Access denied for user with role ${user?.roleName}. Required roles: ${allowedRoles.join(', ')}`);
            return <Navigate to="/unauthorized" replace />;
        }
    }

    // If all checks pass (authenticated and authorized), render the children components.
    return children;
};

export default PrivateRoute;
