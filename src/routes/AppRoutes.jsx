import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import RoleSelectPage from '../pages/auth/RoleSelectPage';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import WardenDashboard from '../pages/warden/WardenDashboard';
import StudentDashboard from '../pages/student/StudentDashboard';
import NotFoundPage from '../pages/NotFoundPage';
import ProtectedRoute from './ProtectedRoute';

const RootRedirect = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/select-role" replace />;
  }

  if (user?.role === 'WARDEN' || user?.role === 'ADMIN') {
    return <Navigate to="/warden" replace />;
  }

  return <Navigate to="/student" replace />;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<RoleSelectPage />} />
      <Route path="/select-role" element={<RoleSelectPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected Warden / Admin Routes */}
      <Route
        path="/warden"
        element={
          <ProtectedRoute allowedRoles={['WARDEN', 'ADMIN']}>
            <WardenDashboard />
          </ProtectedRoute>
        }
      />

      {/* Protected Student / Hosteller Routes */}
      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRoles={['HOSTELER']}>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />

      {/* Fallback 404 Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
