import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Search, X, Check } from 'lucide-react';

const SearchableSelect = ({
  name,
  value,
  onChange,
  options = [],
  placeholder = '-- Seleccionar opción --',
  disabled = false,
  className = '',
  label = null,
  required = false,
  getOptionLabel = (opt) => opt?.nombre || opt?.label || String(opt || ''),
  getOptionValue = (opt) => opt?.id ?? opt?.value ?? opt,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);
  const listRef = useRef(null);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Foco automático en el buscador al abrir
  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setHighlightedIndex(0);
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Normalizar texto para búsqueda insensible a mayúsculas y acentos/tildes
  const normalizeText = (text) =>
    (text || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return options;
    const normSearch = normalizeText(searchTerm);
    return options.filter((opt) => {
      const labelText = normalizeText(getOptionLabel(opt));
      return labelText.includes(normSearch);
    });
  }, [options, searchTerm, getOptionLabel]);

  // Opción actualmente seleccionada
  const selectedOption = useMemo(() => {
    if (value === '' || value === null || value === undefined) return null;
    return options.find((opt) => String(getOptionValue(opt)) === String(value)) || null;
  }, [options, value, getOptionValue]);

  const handleSelect = (opt) => {
    const val = opt ? getOptionValue(opt) : '';
    if (onChange) {
      onChange({
        target: {
          name,
          value: val,
        },
      });
    }
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    if (onChange) {
      onChange({
        target: {
          name,
          value: '',
        },
      });
    }
  };

  const handleKeyDown = (e) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === 'Enter' || e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < filteredOptions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredOptions[highlightedIndex]) {
        handleSelect(filteredOptions[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation(); // Evitar cerrar el modal contenedor al cerrar el dropdown
      setIsOpen(false);
    }
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      {/* Botón disparador con estilo nativo */}
      <div
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-xs bg-white border rounded-lg cursor-pointer transition-all ${
          disabled
            ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
            : isOpen
            ? 'border-unt-blue ring-1 ring-unt-blue/30 text-slate-900 shadow-xs'
            : 'border-slate-200 hover:border-slate-300 text-slate-800'
        }`}
      >
        <span className={`truncate ${!selectedOption ? 'text-slate-400' : 'font-medium'}`}>
          {selectedOption ? getOptionLabel(selectedOption) : placeholder}
        </span>

        <div className="flex items-center gap-1 shrink-0 text-slate-400">
          {selectedOption && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-0.5 hover:text-slate-600 rounded-sm hover:bg-slate-100 transition-colors"
              title="Limpiar selección"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-unt-blue' : ''
            }`}
          />
        </div>
      </div>

      {/* Menú desplegable flotante */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          {/* Caja de Búsqueda Predictiva */}
          <div className="p-2 border-b border-slate-100 bg-slate-50/70">
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setHighlightedIndex(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Escriba para filtrar..."
                className="w-full pl-8 pr-7 py-1.5 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:border-unt-blue focus:ring-1 focus:ring-unt-blue/20 text-slate-800 placeholder:text-slate-400"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 p-0.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Lista de Opciones Filtradas */}
          <div
            ref={listRef}
            className="max-h-56 overflow-y-auto divide-y divide-slate-50 py-1"
          >
            {/* Opción vacía/placeholder */}
            <div
              onClick={() => handleSelect(null)}
              className="px-3 py-2 text-xs text-slate-400 hover:bg-slate-50 cursor-pointer italic"
            >
              {placeholder}
            </div>

            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt, index) => {
                const optVal = getOptionValue(opt);
                const isSelected = String(optVal) === String(value);
                const isHighlighted = index === highlightedIndex;

                return (
                  <div
                    key={optVal || index}
                    onClick={() => handleSelect(opt)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`flex items-center justify-between px-3 py-2 text-xs cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-unt-light text-unt-blue font-semibold'
                        : isHighlighted
                        ? 'bg-slate-50 text-slate-900'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="truncate pr-2">{getOptionLabel(opt)}</span>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-unt-blue shrink-0" />
                    )}
                  </div>
                );
              })
            ) : (
              <div className="px-3 py-4 text-center text-xs text-slate-400">
                No se encontraron coincidencias para "{searchTerm}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
