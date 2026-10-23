import React, { useState } from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import EvidenceUploader from '../components/docente/EvidenceUploader';
import { ToastProvider } from '../context/ToastContext';

const Wrapper = ({ initialEvidencias = [] }) => {
  const [evidencias, setEvidencias] = useState(initialEvidencias);
  return (
    <ToastProvider>
      <EvidenceUploader
        evidencias={evidencias}
        onChange={setEvidencias}
        min={2}
        max={3}
        label="Evidencias de Prueba"
      />
    </ToastProvider>
  );
};

describe('EvidenceUploader (RN-05: 2 a 3 evidencias)', () => {
  it('renderiza el contador inicial indicando que requiere mínimo 2 evidencias', () => {
    render(<Wrapper initialEvidencias={[]} />);
    expect(screen.getByText('0 de 3 (Mín. 2)')).toBeInTheDocument();
    expect(screen.getByText('Evidencias de Prueba')).toBeInTheDocument();
  });

  it('permite agregar un enlace externo de evidencia y actualiza el contador', () => {
    render(<Wrapper initialEvidencias={[]} />);

    const titleInput = screen.getByPlaceholderText('Título de la evidencia (opcional)');
    const urlInput = screen.getByPlaceholderText('https://drive.google.com/...');
    const addButton = screen.getByRole('button', { name: /Agregar Enlace Web/i });

    fireEvent.change(titleInput, { target: { value: 'Constancia de Patente' } });
    fireEvent.change(urlInput, { target: { value: 'https://drive.google.com/patente.pdf' } });
    fireEvent.click(addButton);

    expect(screen.getByText('Constancia de Patente')).toBeInTheDocument();
    expect(screen.getByText('1 de 3 (Mín. 2)')).toBeInTheDocument();
  });

  it('valida el cumplimiento de la regla cuando se adjuntan 2 evidencias', () => {
    const dosEvidencias = [
      { nombreOriginal: 'Evidencia 1', enlaceUrl: 'https://unt.edu.pe/1.pdf', tipo: 'ENLACE' },
      { nombreOriginal: 'Evidencia 2', enlaceUrl: 'https://unt.edu.pe/2.pdf', tipo: 'ENLACE' },
    ];
    render(<Wrapper initialEvidencias={dosEvidencias} />);

    expect(screen.getByText('2 de 3 (Mín. 2)')).toBeInTheDocument();
    expect(screen.getByText('Evidencia 1')).toBeInTheDocument();
    expect(screen.getByText('Evidencia 2')).toBeInTheDocument();
  });
});
