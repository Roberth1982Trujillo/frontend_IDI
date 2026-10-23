import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FormArticulo from '../components/docente/FormArticulo';
import { ToastProvider } from '../context/ToastContext';
import { AuthProvider } from '../context/AuthContext';

const mockCatalogos = {
  lineas: [
    { id: 1, nombre: 'Nanomateriales y Catálisis' },
    { id: 2, nombre: 'Biotecnología Ambiental' },
  ],
  ods: [
    { id: 4, numero: 4, nombre: 'Educación de Calidad' },
    { id: 6, numero: 6, nombre: 'Agua Limpia y Saneamiento' },
  ],
};

const renderWithProviders = (ui) => {
  const user = { dni: '12345678', nombres: 'Juan', rol: 'ROLE_DOCENTE' };
  localStorage.setItem('unt_user', JSON.stringify(user));
  localStorage.setItem('unt_token', 'mock_token');

  return render(
    <ToastProvider>
      <AuthProvider>{ui}</AuthProvider>
    </ToastProvider>
  );
};

describe('FormArticulo (CU-06 & RN-04: Artículo Científico)', () => {
  it('renderiza los campos requeridos y las opciones de catálogos con búsqueda', () => {
    renderWithProviders(<FormArticulo catalogos={mockCatalogos} onSuccess={vi.fn()} />);

    expect(screen.getByText(/Título del Artículo Científico/i)).toBeInTheDocument();
    expect(screen.getByText(/Nombre de la Revista/i)).toBeInTheDocument();
    expect(screen.getByText(/Escriba o seleccione Línea UNT/i)).toBeInTheDocument();
    expect(screen.getByText(/Escriba o seleccione ODS/i)).toBeInTheDocument();

    // Al hacer clic en el selector de línea UNT, muestra las opciones filtrables
    fireEvent.click(screen.getByText(/Escriba o seleccione Línea UNT/i));
    expect(screen.getByText(/Nanomateriales y Catálisis/i)).toBeInTheDocument();
  });

  it('permite completar los datos y tiene el botón de registrar disponible', () => {
    renderWithProviders(<FormArticulo catalogos={mockCatalogos} onSuccess={vi.fn()} />);

    const tituloInput = screen.getByPlaceholderText(/Ej. Optimización de procesos/i);
    const revistaInput = screen.getByPlaceholderText(/Ej. Journal of Cleaner/i);

    fireEvent.change(tituloInput, { target: { value: 'Estudio de Nanopartículas en UNT' } });
    fireEvent.change(revistaInput, { target: { value: 'Nature Materials' } });

    expect(tituloInput.value).toBe('Estudio de Nanopartículas en UNT');
    expect(revistaInput.value).toBe('Nature Materials');
    expect(screen.getByRole('button', { name: /Registrar Artículo Científico/i })).toBeInTheDocument();
  });
});
