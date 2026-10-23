import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import useEscapeKey from '../hooks/useEscapeKey';

describe('useEscapeKey Hook', () => {
  it('ejecuta el callback cuando se presiona la tecla Escape y el modal está activo', () => {
    const onEscapeMock = vi.fn();
    renderHook(() => useEscapeKey(onEscapeMock, true));

    // Simular evento keydown de Escape
    const event = new KeyboardEvent('keydown', { key: 'Escape' });
    window.dispatchEvent(event);

    expect(onEscapeMock).toHaveBeenCalledTimes(1);
  });

  it('NO ejecuta el callback si el modal está inactivo (isActive = false)', () => {
    const onEscapeMock = vi.fn();
    renderHook(() => useEscapeKey(onEscapeMock, false));

    const event = new KeyboardEvent('keydown', { key: 'Escape' });
    window.dispatchEvent(event);

    expect(onEscapeMock).not.toHaveBeenCalled();
  });

  it('NO ejecuta el callback si se presiona otra tecla distinta de Escape', () => {
    const onEscapeMock = vi.fn();
    renderHook(() => useEscapeKey(onEscapeMock, true));

    const event = new KeyboardEvent('keydown', { key: 'Enter' });
    window.dispatchEvent(event);

    expect(onEscapeMock).not.toHaveBeenCalled();
  });
});
