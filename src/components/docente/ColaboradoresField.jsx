import React, { useMemo } from 'react';
import SearchableSelect from '../common/SearchableSelect';
import { Users, UserPlus, X, Building2 } from 'lucide-react';

const ColaboradoresField = ({
  catalogos,
  currentDocenteDni,
  colaboradoresUnt = [],
  onChangeColaboradores,
  colaboradoresExternos = '',
  onChangeExternos,
}) => {
  // Filtrar docentes disponibles: activos, que no sean el docente que registra y que no estén ya seleccionados
  const availableDocentes = useMemo(() => {
    const list = catalogos?.docentes || [];
    const selectedDniSet = new Set(colaboradoresUnt.map((c) => c.dni || c));
    return list.filter(
      (d) => d.dni !== currentDocenteDni && !selectedDniSet.has(d.dni)
    );
  }, [catalogos?.docentes, currentDocenteDni, colaboradoresUnt]);

  const handleAddColaborador = (e) => {
    const dni = e.target.value;
    if (!dni) return;
    const docenteObj = (catalogos?.docentes || []).find((d) => d.dni === dni);
    if (docenteObj) {
      onChangeColaboradores([...colaboradoresUnt, docenteObj]);
    } else {
      onChangeColaboradores([...colaboradoresUnt, { dni, nombreCompleto: `DNI ${dni}` }]);
    }
  };

  const handleRemoveColaborador = (dniToRemove) => {
    onChangeColaboradores(
      colaboradoresUnt.filter((c) => (c.dni || c) !== dniToRemove)
    );
  };

  return (
    <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-4 space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-slate-200/60">
        <Users className="w-4 h-4 text-unt-blue" />
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
          Equipo de Investigación y Colaboradores (Coautorías)
        </h4>
      </div>

      {/* Selector de Docentes UNT */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
          <UserPlus className="w-3.5 h-3.5 text-unt-blue" />
          Docentes Colaboradores de la UNT (Opcional)
        </label>
        <p className="text-[11px] text-slate-500">
          Busque por DNI o apellidos en el padrón institucional. El trabajo aparecerá en sus registros y sumará a sus facultades (RN-11).
        </p>

        <SearchableSelect
          name="colaborador_unt_select"
          value=""
          onChange={handleAddColaborador}
          options={availableDocentes}
          getOptionLabel={(d) => `${d.nombreCompleto} (${d.dni}) - ${d.facultad || 'UNT'}`}
          getOptionValue={(d) => d.dni}
          placeholder="+ Buscar y agregar docente de la UNT..."
          disabled={availableDocentes.length === 0}
        />

        {/* Chips de Colaboradores UNT Seleccionados */}
        {colaboradoresUnt.length > 0 ? (
          <div className="flex flex-wrap gap-2 pt-1">
            {colaboradoresUnt.map((c) => {
              const dni = c.dni || c;
              const nombre = c.nombreCompleto || `DNI ${dni}`;
              const facultad = c.facultad || '';
              return (
                <span
                  key={dni}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-unt-blue/10 border border-unt-blue/25 text-unt-dark font-medium shadow-xs"
                >
                  <span className="font-semibold">{nombre}</span>
                  {facultad && (
                    <span className="text-[10px] bg-white/70 px-1.5 py-0.5 rounded text-slate-600 flex items-center gap-0.5">
                      <Building2 className="w-2.5 h-2.5" />
                      {facultad}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveColaborador(dni)}
                    className="p-0.5 hover:bg-unt-blue/20 rounded-full text-slate-500 hover:text-rose-600 transition-colors ml-0.5"
                    title="Remover colaborador"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              );
            })}
          </div>
        ) : (
          <div className="text-[11px] text-slate-400 italic">
            Sin coautores de la UNT agregados (registro como autor individual).
          </div>
        )}
      </div>

      {/* Campo texto libre para colaboradores externos */}
      <div className="space-y-1 pt-1">
        <label className="text-xs font-semibold text-slate-700">
          Coautores o Colaboradores Externos (Fuera de la UNT - Opcional)
        </label>
        <input
          type="text"
          placeholder="Ej: Dr. Carlos Mendoza (UNMSM), Dra. Elena Ramos (UBA)"
          value={colaboradoresExternos}
          onChange={(e) => onChangeExternos(e.target.value)}
          className="input-unt text-xs py-2 w-full"
          maxLength={500}
        />
        <p className="text-[10px] text-slate-400">
          Ingrese los nombres e instituciones de los coautores externos separados por comas.
        </p>
      </div>
    </div>
  );
};

export default ColaboradoresField;
