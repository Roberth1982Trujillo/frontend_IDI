import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { user, isAuthenticated, loading, hasRole } = useAuth();

  if (loading) {
    return <LoadingSpinner message="Verificando permisos institucionales..." />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/identificacion-docente" replace />;
  }

  if (allowedRoles.length > 0 && !hasRole(allowedRoles)) {
    // If Docente tried to access Admin route, send to Docente Dashboard
    if (user.rol === 'ROLE_DOCENTE' || user.rol === 'DOCENTE') {
      return <Navigate to="/docente/dashboard" replace />;
    }
    // If Admin/Directivo tried to access unauthorized route
    return <Navigate to="/reportes/indicadores" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
