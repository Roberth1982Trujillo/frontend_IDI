import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { useToast } from '../../context/ToastContext';
import DocenteCargaMasivaModal from '../../components/admin/DocenteCargaMasivaModal';
import DocenteFormModal from '../../components/admin/DocenteFormModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  Users,
  Search,
  Filter,
  UserPlus,
  FileSpreadsheet,
  Edit2,
  Building,
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

const DocentesListView = () => {
  const { error } = useToast();
  const [docentes, setDocentes] = useState([]);
  const [catalogos, setCatalogos] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroFacultad, setFiltroFacultad] = useState('');
  const [filtroVigencia, setFiltroVigencia] = useState('');

  const [modalMasivaOpen, setModalMasivaOpen] = useState(false);
  const [modalDocenteOpen, setModalDocenteOpen] = useState(false);
  const [selectedDocente, setSelectedDocente] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resDocentes, resCat] = await Promise.all([
        axiosClient.get('/docentes'),
        axiosClient.get('/catalogos/todos'),
      ]);
      setDocentes(resDocentes.data || []);
      setCatalogos(resCat.data || {});
    } catch (err) {
      error(err.response?.data?.message || 'Error al cargar la lista de docentes y catálogos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEdit = (doc) => {
    setSelectedDocente(doc);
    setModalDocenteOpen(true);
  };

  const handleCreateNew = () => {
    setSelectedDocente(null);
    setModalDocenteOpen(true);
  };

  // Filter docentes
  const docentesFiltrados = docentes.filter((d) => {
    const matchesBusqueda =
      !busqueda ||
      d.dni?.includes(busqueda) ||
      `${d.nombres} ${d.apellidos}`.toLowerCase().includes(busqueda.toLowerCase());
    const matchesFacultad =
      !filtroFacultad || d.facultad?.id === parseInt(filtroFacultad, 10);
    const matchesVigencia = !filtroVigencia || d.vigencia === filtroVigencia;
    return matchesBusqueda && matchesFacultad && matchesVigencia;
  });

  const totalDocentes = docentes.length;
  const renacytCount = docentes.filter(
    (d) => d.nivelRenacyt && d.nivelRenacyt !== 'NO_RENACYT'
  ).length;
  const activosCount = docentes.filter((d) => d.vigencia === 'ACTIVO').length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-unt-blue" /> Padrón General de Docentes
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Administración institucional del cuerpo docente e investigadores de la UNT (CU-03)
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setModalMasivaOpen(true)}
            className="btn-secondary text-xs py-2.5 text-emerald-700 hover:text-emerald-800"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Carga Masiva (.xlsx)
          </button>
          <button onClick={handleCreateNew} className="btn-primary text-xs py-2.5">
            <UserPlus className="w-4 h-4" /> Nuevo Docente
          </button>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card-unt p-4 flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-unt-light text-unt-blue flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Total Padrón
            </span>
            <span className="text-xl font-extrabold text-slate-900">{totalDocentes}</span>
          </div>
        </div>

        <div className="card-unt p-4 flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Docentes Activos
            </span>
            <span className="text-xl font-extrabold text-emerald-700">{activosCount}</span>
          </div>
        </div>

        <div className="card-unt p-4 flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Calificados RENACYT
            </span>
            <span className="text-xl font-extrabold text-purple-700">{renacytCount}</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card-unt p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por DNI o nombres..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="input-unt pl-9 text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={filtroFacultad}
            onChange={(e) => setFiltroFacultad(e.target.value)}
            className="input-unt text-xs py-2 w-full sm:w-60"
          >
            <option value="">Todas las Facultades</option>
            {catalogos?.facultades?.map((f) => (
              <option key={f.id} value={f.id}>
                {f.nombre}
              </option>
            ))}
          </select>

          <select
            value={filtroVigencia}
            onChange={(e) => setFiltroVigencia(e.target.value)}
            className="input-unt text-xs py-2 w-full sm:w-36"
          >
            <option value="">Vigencia (Todos)</option>
            <option value="ACTIVO">Activo</option>
            <option value="INACTIVO">Inactivo</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner message="Cargando padrón docente..." />
      ) : (
        <div className="card-unt p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Docente / DNI</th>
                  <th className="py-3 px-4">Facultad & Escuela</th>
                  <th className="py-3 px-4">Categoría / Condición</th>
                  <th className="py-3 px-4">RENACYT</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {docentesFiltrados.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-bold text-slate-900">
                        {doc.nombres} {doc.apellidos}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        DNI: {doc.dni}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-semibold text-slate-800 truncate">
                        {doc.facultad?.nombre || 'Facultad'}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate mt-0.5">
                        {doc.escuela?.nombre || 'Escuela'}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-medium text-slate-800">
                        {doc.categoria || 'Sin categoría'}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {doc.condicion || 'Nombrado'}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`badge-unt ${
                          doc.nivelRenacyt && doc.nivelRenacyt !== 'NO_RENACYT'
                            ? 'bg-purple-100 text-purple-700 border border-purple-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {doc.nivelRenacyt || 'No Renacyt'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`badge-unt ${
                          doc.vigencia === 'ACTIVO'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}
                      >
                        {doc.vigencia || 'Activo'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleEdit(doc)}
                        className="btn-outline-unt text-[11px] py-1 px-2.5 inline-flex"
                      >
                        <Edit2 className="w-3 h-3" /> Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modales */}
      <DocenteCargaMasivaModal
        isOpen={modalMasivaOpen}
        onClose={() => setModalMasivaOpen(false)}
        onSuccess={fetchData}
      />

      <DocenteFormModal
        isOpen={modalDocenteOpen}
        onClose={() => setModalDocenteOpen(false)}
        onSuccess={fetchData}
        initialData={selectedDocente}
        catalogos={catalogos}
      />
    </div>
  );
};

export default DocentesListView;
