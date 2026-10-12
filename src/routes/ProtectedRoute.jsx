import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, token, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <LoadingSpinner fullPage message="Verifying authentication session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/select-role" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Redirect to the user's appropriate portal based on their actual role
    if (user?.role === 'WARDEN' || user?.role === 'ADMIN') {
      return <Navigate to="/warden" replace />;
    }
    return <Navigate to="/student" replace />;
  }

  return children;
};

export default ProtectedRoute;
