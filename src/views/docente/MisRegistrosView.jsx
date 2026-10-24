import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import axiosClient from '../../api/axiosClient';
import ConfirmModal from '../../components/common/ConfirmModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  ListOrdered,
  Search,
  Filter,
  Trash2,
  ExternalLink,
  Calendar,
  FileText,
  Award,
  BookMarked,
  GraduationCap,
  Presentation,
  Coins,
  CheckCircle,
  PlusCircle,
  Users,
  Lock,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { resolveFileUrl } from '../../utils/urlHelper';

const MisRegistrosView = () => {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [itemToDelete, setItemToDelete] = useState(null);

  const fetchRegistros = async () => {
    if (!user?.dni) return;
    setLoading(true);
    try {
      const res = await axiosClient.get(`/producciones/mis-registros/${user.dni}`);
      setRegistros(res.data || []);
    } catch (err) {
      error('Error al cargar mis registros de investigación.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistros();
  }, [user]);

  const handleDelete = async () => {
    if (!itemToDelete) return;
    if (itemToDelete.docente?.dni !== user?.dni && user?.rol !== 'ADMIN') {
      error('Acción denegada: Solo el autor principal o el Administrador pueden eliminar este registro.');
      setItemToDelete(null);
      return;
    }
    try {
      await axiosClient.delete(`/producciones/${itemToDelete.id}`);
      success('Producción eliminada lógicamente con éxito.');
      setItemToDelete(null);
      fetchRegistros();
    } catch (err) {
      error(err.response?.data?.message || 'Error al eliminar la producción.');
    }
  };

  const getTipoBadge = (tipo) => {
    const map = {
      ARTICULO_CIENTIFICO: { label: 'Artículo', bg: 'bg-blue-100 text-blue-800 border-blue-200' },
      SOLICITUD_PATENTE: { label: 'Patente', bg: 'bg-amber-100 text-amber-800 border-amber-200' },
      LIBRO_INVESTIGACION: { label: 'Libro Inv.', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
      LIBRO_ACADEMICO: { label: 'Libro Acad.', bg: 'bg-purple-100 text-purple-800 border-purple-200' },
      PONENCIA_EVENTO: { label: 'Ponencia', bg: 'bg-rose-100 text-rose-800 border-rose-200' },
      PROYECTO_CONCURSABLE: { label: 'Proyecto', bg: 'bg-cyan-100 text-cyan-800 border-cyan-200' },
      EVALUACION_PROYECTO: { label: 'Evaluación', bg: 'bg-slate-100 text-slate-800 border-slate-200' },
    };
    const c = map[tipo] || { label: tipo, bg: 'bg-slate-100 text-slate-800' };
    return <span className={`badge-unt border ${c.bg}`}>{c.label}</span>;
  };

  const registrosFiltrados = registros.filter((r) => {
    const matchesTipo = !filtroTipo || r.tipoProduccion === filtroTipo;
    const matchesBusqueda =
      !busqueda ||
      r.titulo?.toLowerCase().includes(busqueda.toLowerCase()) ||
      r.sublineaInvestigacion?.toLowerCase().includes(busqueda.toLowerCase());
    return matchesTipo && matchesBusqueda;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ListOrdered className="w-6 h-6 text-unt-blue" /> Mis Registros Declarados
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Historial de producciones científicas declaradas y colaboraciones para DNI {user?.dni} ({registros.length} total)
          </p>
        </div>

        <Link to="/docente/dashboard" className="btn-primary text-xs py-2.5">
          <PlusCircle className="w-4 h-4" /> Registrar Nueva Producción
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="card-unt p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por título o sublínea..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="input-unt pl-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="input-unt text-xs py-2 w-full md:w-56"
          >
            <option value="">Todas las tipologías</option>
            <option value="ARTICULO_CIENTIFICO">Artículo Científico</option>
            <option value="SOLICITUD_PATENTE">Solicitud de Patente</option>
            <option value="LIBRO_INVESTIGACION">Libro de Investigación</option>
            <option value="LIBRO_ACADEMICO">Libro Académico</option>
            <option value="PONENCIA_EVENTO">Ponencia en Evento</option>
            <option value="PROYECTO_CONCURSABLE">Proyecto Concursable</option>
            <option value="EVALUACION_PROYECTO">Evaluación de Proyecto</option>
          </select>
        </div>
      </div>

      {/* Content Table / Cards */}
      {loading ? (
        <LoadingSpinner message="Cargando tus registros de investigación..." />
      ) : registrosFiltrados.length === 0 ? (
        <div className="card-unt text-center p-12">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <ListOrdered className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No se encontraron producciones</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {busqueda || filtroTipo
              ? 'Intente modificar los criterios de búsqueda o filtro.'
              : 'Aún no ha registrado producciones. Utilice el cuestionario para declarar sus trabajos.'}
          </p>
          <Link to="/docente/dashboard" className="btn-primary text-xs mx-auto mt-4 inline-flex">
            Ir al Cuestionario
          </Link>
        </div>
      ) : (
        <div className="card-unt p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Tipo & Año</th>
                  <th className="py-3 px-4">Rol en Producción</th>
                  <th className="py-3 px-4">Título & Equipo</th>
                  <th className="py-3 px-4">Línea UNT / ODS</th>
                  <th className="py-3 px-4">Evidencias</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {registrosFiltrados.map((item) => {
                  const isAutorPrincipal = item.docente?.dni === user?.dni;
                  const nombrePrincipal = item.docente?.apellidosNombres || 
                    `${item.docente?.nombres || ''} ${item.docente?.apellidos || ''}`.trim() || 
                    'Docente UNT';

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div>{getTipoBadge(item.tipoProduccion)}</div>
                        <div className="text-[11px] text-slate-500 font-medium mt-1 flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {item.anio}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {isAutorPrincipal ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <Award className="w-3 h-3 text-emerald-600" /> Autor Principal
                          </span>
                        ) : (
                          <div>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                              <Users className="w-3 h-3 text-purple-600" /> Coautor / Colaborador
                            </span>
                            <div className="text-[10px] text-slate-500 mt-1 max-w-[160px] truncate" title={`Registrado por: ${nombrePrincipal}`}>
                              Registró: <span className="font-medium text-slate-700">{nombrePrincipal}</span>
                            </div>
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 max-w-md">
                        <div className="font-semibold text-slate-900 leading-snug line-clamp-2">
                          {item.titulo}
                        </div>
                        {item.sublineaInvestigacion && (
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Sublínea: {item.sublineaInvestigacion}
                          </div>
                        )}
                        {(item.colaboradoresUnt?.length > 0 || item.colaboradoresExternos) && (
                          <div className="mt-1.5 flex flex-wrap items-center gap-1 text-[11px] text-slate-500">
                            <span className="font-medium text-slate-600 flex items-center gap-0.5">
                              <Users className="w-3 h-3 text-unt-blue" /> Equipo:
                            </span>
                            {item.colaboradoresUnt?.map((c) => (
                              <span
                                key={c.dni || c.id}
                                className="bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded text-[10px]"
                              >
                                {c.apellidosNombres || `${c.nombres || ''} ${c.apellidos || ''}`.trim() || c.dni}
                              </span>
                            ))}
                            {item.colaboradoresExternos && (
                              <span className="text-[10px] text-slate-500 italic">
                                [Ext: {item.colaboradoresExternos}]
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="text-slate-800 font-medium truncate max-w-xs">
                          {item.lineaInvestigacion?.nombre || 'Línea UNT'}
                        </div>
                        <div className="text-[11px] text-unt-blue font-semibold mt-0.5">
                          ODS {item.ods?.numero}: {item.ods?.nombre}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {item.evidencias?.length > 0 ? (
                          <div className="flex flex-col gap-1">
                            {item.evidencias.map((ev, i) => (
                              <a
                                key={i}
                                href={resolveFileUrl(ev.enlaceUrl)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[11px] text-unt-blue hover:underline flex items-center gap-1 max-w-[150px] truncate"
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

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        {isAutorPrincipal || user?.rol === 'ADMIN' ? (
                          <button
                            onClick={() => setItemToDelete(item)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Eliminar registro"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        ) : (
                          <span
                            className="inline-flex p-1.5 text-slate-300 cursor-not-allowed"
                            title="Modo sólo lectura (RN-11): Sólo el autor principal o el Administrador pueden modificar o eliminar este registro."
                          >
                            <Lock className="w-4 h-4" />
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={!!itemToDelete}
        title="¿Eliminar este registro?"
        message={`Esta acción retirará la producción "${itemToDelete?.titulo}" de su lista activa (se aplicará borrado lógico institucional con trazabilidad).`}
        confirmText="Sí, Eliminar"
        isDanger={true}
        onConfirm={handleDelete}
        onCancel={() => setItemToDelete(null)}
      />
    </div>
  );
};

export default MisRegistrosView;
