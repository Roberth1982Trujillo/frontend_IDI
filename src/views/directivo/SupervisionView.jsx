import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { useToast } from '../../context/ToastContext';
import CorreccionModal from '../../components/directivo/CorreccionModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  CheckSquare,
  Search,
  Filter,
  Calendar,
  ExternalLink,
  Edit2,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { resolveFileUrl } from '../../utils/urlHelper';

const SupervisionView = () => {
  const { error } = useToast();
  const [producciones, setProducciones] = useState([]);
  const [catalogos, setCatalogos] = useState(null);
  const [loading, setLoading] = useState(true);

  const [filtroDni, setFiltroDni] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroAnio, setFiltroAnio] = useState('');
  const [filtroEstado, setFiltroEstado] = useState(''); // '', 'ACTIVO', 'INACTIVO'

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProd, setSelectedProd] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resProd, resCat] = await Promise.all([
        axiosClient.get('/producciones/supervision'),
        axiosClient.get('/catalogos/todos'),
      ]);
      setProducciones(resProd.data || []);
      setCatalogos(resCat.data || {});
    } catch {
      error('Error al cargar la bandeja de supervisión de producciones.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCorreccion = (prod) => {
    setSelectedProd(prod);
    setModalOpen(true);
  };

  const produccionesFiltradas = producciones.filter((p) => {
    const matchesDni =
      !filtroDni ||
      p.docente?.dni?.includes(filtroDni) ||
      `${p.docente?.nombres} ${p.docente?.apellidos}`.toLowerCase().includes(filtroDni.toLowerCase()) ||
      p.titulo?.toLowerCase().includes(filtroDni.toLowerCase());
    const matchesTipo = !filtroTipo || p.tipoProduccion === filtroTipo;
    const matchesAnio = !filtroAnio || p.anio === parseInt(filtroAnio, 10);
    const matchesEstado =
      !filtroEstado ||
      (filtroEstado === 'ACTIVO' && p.activo !== false) ||
      (filtroEstado === 'INACTIVO' && p.activo === false);
    return matchesDni && matchesTipo && matchesAnio && matchesEstado;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <CheckSquare className="w-6 h-6 text-unt-blue" /> Bandeja de Supervisión y Auditoría
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Revisión general de la producción declarada por los docentes con trazabilidad de cambios (CU-04)
        </p>
      </div>

      {/* Filters Bar */}
      <div className="card-unt p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por DNI, docente o título..."
            value={filtroDni}
            onChange={(e) => setFiltroDni(e.target.value)}
            className="input-unt pl-9 text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="input-unt text-xs py-2 w-full sm:w-48"
          >
            <option value="">Todas las Tipologías</option>
            <option value="ARTICULO_CIENTIFICO">Artículo Científico</option>
            <option value="SOLICITUD_PATENTE">Solicitud de Patente</option>
            <option value="LIBRO_INVESTIGACION">Libro de Investigación</option>
            <option value="LIBRO_ACADEMICO">Libro Académico</option>
            <option value="PONENCIA_EVENTO">Ponencia en Evento</option>
            <option value="PROYECTO_CONCURSABLE">Proyecto Concursable</option>
            <option value="EVALUACION_PROYECTO">Evaluación de Proyecto</option>
          </select>

          <input
            type="number"
            placeholder="Año..."
            value={filtroAnio}
            onChange={(e) => setFiltroAnio(e.target.value)}
            className="input-unt text-xs py-2 w-full sm:w-24"
          />

          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="input-unt text-xs py-2 w-full sm:w-32"
          >
            <option value="">Estado (Todos)</option>
            <option value="ACTIVO">Activos</option>
            <option value="INACTIVO">Retirados</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner message="Cargando bandeja de supervisión..." />
      ) : (
        <div className="card-unt p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Docente Investigador</th>
                  <th className="py-3 px-4">Tipo & Año</th>
                  <th className="py-3 px-4">Título del Trabajo</th>
                  <th className="py-3 px-4">Evidencias</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {produccionesFiltradas.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-bold text-slate-900">
                        {prod.docente?.nombres} {prod.docente?.apellidos}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        DNI: {prod.docente?.dni}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="badge-unt bg-unt-light text-unt-blue border border-unt-blue/20">
                        {prod.tipoProduccion?.replace(/_/g, ' ')}
                      </span>
                      <div className="text-[11px] text-slate-500 font-medium mt-1">
                        Año: {prod.anio}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 max-w-sm">
                      <div className="font-semibold text-slate-900 line-clamp-2">
                        {prod.titulo}
                      </div>
                      {prod.sublineaInvestigacion && (
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Sublínea: {prod.sublineaInvestigacion}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {prod.evidencias?.length > 0 ? (
                        <div className="flex flex-col gap-1">
                          {prod.evidencias.map((ev, i) => (
                            <a
                              key={i}
                              href={resolveFileUrl(ev.enlaceUrl)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] text-unt-blue hover:underline flex items-center gap-1 max-w-[130px] truncate"
                              title={ev.nombreOriginal}
                            >
                              <ExternalLink className="w-3 h-3 shrink-0" />
                              <span className="truncate">{ev.nombreOriginal || 'Evidencia'}</span>
                            </a>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400">Sin evidencias</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`badge-unt text-[10px] ${
                          prod.activo !== false
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}
                      >
                        {prod.activo !== false ? 'Activo' : 'Retirado'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleOpenCorreccion(prod)}
                        className="btn-outline-unt text-[11px] py-1 px-2.5 inline-flex"
                      >
                        <Edit2 className="w-3 h-3" /> Supervisar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de Corrección */}
      <CorreccionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchData}
        produccion={selectedProd}
      />
    </div>
  );
};

export default SupervisionView;
