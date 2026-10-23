import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../routes/ProtectedRoute';
import { AuthProvider } from '../context/AuthContext';

describe('ProtectedRoute RBAC Security', () => {
  it('permite el acceso si el usuario autenticado cuenta con el rol requerido', () => {
    localStorage.setItem(
      'unt_user',
      JSON.stringify({ usuario: 'admin', rol: 'ROLE_ADMIN' })
    );
    localStorage.setItem('unt_token', 'valid_token');

    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/admin/test']}>
          <Routes>
            <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'ROLE_ADMIN']} />}>
              <Route path="/admin/test" element={<div>CONTENIDO_ADMIN_SEGURO</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    expect(screen.getByText('CONTENIDO_ADMIN_SEGURO')).toBeInTheDocument();
  });

  it('bloquea y redirige a usuario sin permisos adecuados', () => {
    localStorage.setItem(
      'unt_user',
      JSON.stringify({ usuario: 'docente', rol: 'ROLE_DOCENTE' })
    );
    localStorage.setItem('unt_token', 'valid_token');

    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/admin/test']}>
          <Routes>
            <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'ROLE_ADMIN']} />}>
              <Route path="/admin/test" element={<div>CONTENIDO_ADMIN_SEGURO</div>} />
            </Route>
            <Route path="/docente/dashboard" element={<div>DASHBOARD_DOCENTE_FALLBACK</div>} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    expect(screen.queryByText('CONTENIDO_ADMIN_SEGURO')).not.toBeInTheDocument();
    expect(screen.getByText('DASHBOARD_DOCENTE_FALLBACK')).toBeInTheDocument();
  });
});
