import React, { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SearchableSelect from '../components/common/SearchableSelect';

const mockFacultades = [
  { id: 1, nombre: 'Facultad de Ciencias Biológicas' },
  { id: 2, nombre: 'Facultad de Ciencias Médicas' },
  { id: 3, nombre: 'Facultad de Ciencias Físicas y Matemáticas' },
  { id: 4, nombre: 'Facultad de Estomatología' },
];

const Wrapper = ({ onChange = vi.fn() }) => {
  const [val, setVal] = useState('');
  const handleChange = (e) => {
    setVal(e.target.value);
    onChange(e);
  };

  return (
    <SearchableSelect
      name="facultadId"
      value={val}
      onChange={handleChange}
      options={mockFacultades}
      placeholder="-- Seleccionar Facultad --"
      getOptionLabel={(f) => f.nombre}
      getOptionValue={(f) => f.id}
    />
  );
};

describe('SearchableSelect (RN-13: Filtrado predictivo al tipear)', () => {
  it('muestra el placeholder inicialmente y abre el menú al hacer clic', () => {
    render(<Wrapper />);

    expect(screen.getByText(/-- Seleccionar Facultad --/i)).toBeInTheDocument();

    // Clic para abrir el dropdown
    fireEvent.click(screen.getByText(/-- Seleccionar Facultad --/i));

    // El input de búsqueda debe estar presente
    expect(screen.getByPlaceholderText(/Escriba para filtrar/i)).toBeInTheDocument();
    expect(screen.getByText(/Facultad de Estomatología/i)).toBeInTheDocument();
  });

  it('filtra opciones en tiempo real al escribir texto insensible a mayúsculas y acentos', () => {
    render(<Wrapper />);

    fireEvent.click(screen.getByText(/-- Seleccionar Facultad --/i));

    const searchInput = screen.getByPlaceholderText(/Escriba para filtrar/i);
    // Escribir "fisicas" sin tildes
    fireEvent.change(searchInput, { target: { value: 'fisicas' } });

    // Debe mostrar Ciencias Físicas y Matemáticas y ocultar las demás
    expect(screen.getByText(/Facultad de Ciencias Físicas y Matemáticas/i)).toBeInTheDocument();
    expect(screen.queryByText(/Facultad de Estomatología/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Facultad de Ciencias Médicas/i)).not.toBeInTheDocument();
  });

  it('selecciona la opción al hacer clic y actualiza el valor', () => {
    const handleChangeMock = vi.fn();
    render(<Wrapper onChange={handleChangeMock} />);

    fireEvent.click(screen.getByText(/-- Seleccionar Facultad --/i));

    const option = screen.getByText(/Facultad de Estomatología/i);
    fireEvent.click(option);

    expect(handleChangeMock).toHaveBeenCalledWith(
      expect.objectContaining({
        target: { name: 'facultadId', value: 4 },
      })
    );
  });
});
