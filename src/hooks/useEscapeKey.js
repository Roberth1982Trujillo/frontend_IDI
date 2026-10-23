import { useEffect } from 'react';

/**
 * Hook reutilizable para cerrar modales o overlays al presionar la tecla ESC.
 * @param {Function} onEscape - Callback a ejecutar al presionar Escape.
 * @param {boolean} isActive - Indica si el modal está abierto o la escucha está activa.
 */
export const useEscapeKey = (onEscape, isActive = true) => {
  useEffect(() => {
    if (!isActive || typeof onEscape !== 'function') return;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' || event.key === 'Esc') {
        onEscape();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onEscape, isActive]);
};

export default useEscapeKey;
