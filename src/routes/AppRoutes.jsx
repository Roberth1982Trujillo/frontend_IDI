import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import ProtectedRoute from './ProtectedRoute';
import { useAuth } from '../context/AuthContext';

// Views
import LoginAdminView from '../views/auth/LoginAdminView';
import DocenteIdentificacionView from '../views/auth/DocenteIdentificacionView';
import DocenteDashboardView from '../views/docente/DocenteDashboardView';
import MisRegistrosView from '../views/docente/MisRegistrosView';
import DocentesListView from '../views/admin/DocentesListView';
import CatalogosView from '../views/admin/CatalogosView';
import SupervisionView from '../views/directivo/SupervisionView';
import IndicadoresBiView from '../views/directivo/IndicadoresBiView';
import GraficosCruzadosView from '../views/directivo/GraficosCruzadosView';
import FichaInvestigadorView from '../views/directivo/FichaInvestigadorView';
import NotFoundView from '../views/NotFoundView';

const HomeRedirect = () => {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated || !user) {
    return <Navigate to="/identificacion-docente" replace />;
  }
  if (user.rol === 'ROLE_DOCENTE' || user.rol === 'DOCENTE') {
    return <Navigate to="/docente/dashboard" replace />;
  }
  if (user.rol === 'ROLE_ADMIN' || user.rol === 'ADMIN') {
    return <Navigate to="/admin/docentes" replace />;
  }
  return <Navigate to="/reportes/indicadores" replace />;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        {/* Public Routes */}
        <Route path="/login" element={<LoginAdminView />} />
        <Route path="/identificacion-docente" element={<DocenteIdentificacionView />} />
        <Route path="/" element={<HomeRedirect />} />

        {/* Protected for Docentes */}
        <Route element={<ProtectedRoute allowedRoles={['DOCENTE', 'ROLE_DOCENTE']} />}>
          <Route path="/docente/dashboard" element={<DocenteDashboardView />} />
          <Route path="/docente/mis-registros" element={<MisRegistrosView />} />
        </Route>

        {/* Protected for Admin */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'ROLE_ADMIN']} />}>
          <Route path="/admin" element={<Navigate to="/admin/docentes" replace />} />
          <Route path="/admin/docentes" element={<DocentesListView />} />
          <Route path="/admin/catalogos" element={<CatalogosView />} />
        </Route>

        {/* Protected for Admin or Directivo */}
        <Route
          element={
            <ProtectedRoute
              allowedRoles={['ADMIN', 'ROLE_ADMIN', 'DIRECTIVO', 'ROLE_DIRECTIVO']}
            />
          }
        >
          <Route path="/supervision" element={<SupervisionView />} />
          <Route path="/reportes/indicadores" element={<IndicadoresBiView />} />
          <Route path="/reportes/cruzados" element={<GraficosCruzadosView />} />
          <Route path="/reportes/investigador" element={<FichaInvestigadorView />} />
        </Route>

        {/* 404 Not Found */}
        <Route path="*" element={<NotFoundView />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
