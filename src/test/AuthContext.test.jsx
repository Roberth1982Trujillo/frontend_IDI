import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../context/AuthContext';

const TestComponent = () => {
  const { user, isAuthenticated, hasRole } = useAuth();
  return (
    <div>
      <span data-testid="auth-status">{isAuthenticated ? 'LOGGED_IN' : 'GUEST'}</span>
      <span data-testid="user-role">{user?.rol || 'NO_ROLE'}</span>
      <span data-testid="is-admin">{hasRole('ADMIN') ? 'IS_ADMIN' : 'NOT_ADMIN'}</span>
      <span data-testid="is-docente">{hasRole('DOCENTE') ? 'IS_DOCENTE' : 'NOT_DOCENTE'}</span>
    </div>
  );
};

describe('AuthContext RBAC & Session Management', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('inicia como invitado cuando no hay token en localStorage', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('auth-status').textContent).toBe('GUEST');
    expect(screen.getByTestId('user-role').textContent).toBe('NO_ROLE');
    expect(screen.getByTestId('is-admin').textContent).toBe('NOT_ADMIN');
  });

  it('restaura la sesión de administrador desde localStorage correctamente', () => {
    const adminUser = {
      usuario: 'admin',
      rol: 'ROLE_ADMIN',
      nombres: 'Administrador UNT',
    };
    localStorage.setItem('unt_token', 'mock_jwt_token_123');
    localStorage.setItem('unt_user', JSON.stringify(adminUser));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('auth-status').textContent).toBe('LOGGED_IN');
    expect(screen.getByTestId('user-role').textContent).toBe('ROLE_ADMIN');
    expect(screen.getByTestId('is-admin').textContent).toBe('IS_ADMIN');
    expect(screen.getByTestId('is-docente').textContent).toBe('NOT_DOCENTE');
  });

  it('identifica y valida el rol de docente investigador correctamente', () => {
    const docenteUser = {
      usuario: '12345678',
      dni: '12345678',
      rol: 'ROLE_DOCENTE',
      nombres: 'Juan Carlos',
      apellidos: 'Pérez Rodríguez',
    };
    localStorage.setItem('unt_token', 'mock_docente_token');
    localStorage.setItem('unt_user', JSON.stringify(docenteUser));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('auth-status').textContent).toBe('LOGGED_IN');
    expect(screen.getByTestId('user-role').textContent).toBe('ROLE_DOCENTE');
    expect(screen.getByTestId('is-docente').textContent).toBe('IS_DOCENTE');
    expect(screen.getByTestId('is-admin').textContent).toBe('NOT_ADMIN');
  });
});
