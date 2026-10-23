import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  FolderTree,
  Building,
  GraduationCap,
  Layers,
  Compass,
  Globe2,
  Plus,
  Edit2,
  Power,
  X,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import useEscapeKey from '../../hooks/useEscapeKey';

const CatalogosView = () => {
  const { success, error } = useToast();
  const [catalogos, setCatalogos] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('facultades'); // 'facultades', 'lineas', 'ods', 'areas', 'programas'
  const [selectedFacultadId, setSelectedFacultadId] = useState('');

  // Modales y estados para Facultad
  const [modalFacultadOpen, setModalFacultadOpen] = useState(false);
  const [facultadEnEdicion, setFacultadEnEdicion] = useState(null);
  const [nombreFacultad, setNombreFacultad] = useState('');
  const [abreviaturaFacultad, setAbreviaturaFacultad] = useState('');
  const [savingFacultad, setSavingFacultad] = useState(false);

  // Modales y estados para Escuela
  const [modalEscuelaOpen, setModalEscuelaOpen] = useState(false);
  const [escuelaEnEdicion, setEscuelaEnEdicion] = useState(null);
  const [nombreNuevaEscuela, setNombreNuevaEscuela] = useState('');
  const [savingEscuela, setSavingEscuela] = useState(false);

  useEscapeKey(() => setModalFacultadOpen(false), modalFacultadOpen);
  useEscapeKey(() => setModalEscuelaOpen(false), modalEscuelaOpen);

  const fetchCatalogos = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/catalogos/todos');
      const data = res.data || {};
      setCatalogos(data);
      if (data?.facultades?.length && !selectedFacultadId) {
        setSelectedFacultadId(data.facultades[0].id.toString());
      }
    } catch {
      error('Error al cargar catálogos institucionales.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalogos();
  }, []);

  // --- Handlers de Facultades ---
  const handleOpenNuevaFacultad = () => {
    setFacultadEnEdicion(null);
    setNombreFacultad('');
    setAbreviaturaFacultad('');
    setModalFacultadOpen(true);
  };

  const handleOpenEditarFacultad = (fac) => {
    setFacultadEnEdicion(fac);
    setNombreFacultad(fac.nombre || '');
    setAbreviaturaFacultad(fac.abreviatura || '');
    setModalFacultadOpen(true);
  };

  const handleSaveFacultad = async (e) => {
    e.preventDefault();
    if (!nombreFacultad.trim()) {
      error('El nombre de la facultad es obligatorio.');
      return;
    }

    setSavingFacultad(true);
    try {
      if (facultadEnEdicion) {
        // Actualizar facultad existente
        await axiosClient.put(`/catalogos/facultades/${facultadEnEdicion.id}`, {
          nombre: nombreFacultad.trim(),
          abreviatura: abreviaturaFacultad.trim() || null,
        });
        success(`Facultad "${nombreFacultad.trim()}" actualizada con éxito.`);
      } else {
        // Crear nueva facultad
        const res = await axiosClient.post('/catalogos/facultades', {
          nombre: nombreFacultad.trim(),
          abreviatura: abreviaturaFacultad.trim() || null,
          activo: true,
        });
        success(`Nueva facultad "${nombreFacultad.trim()}" agregada exitosamente.`);
        if (res.data?.id) {
          setSelectedFacultadId(res.data.id.toString());
        }
      }
      setModalFacultadOpen(false);
      fetchCatalogos();
    } catch (err) {
      error(err.response?.data?.message || 'Error al guardar la facultad.');
    } finally {
      setSavingFacultad(false);
    }
  };

  const handleToggleEstadoFacultad = async (fac) => {
    const nuevoEstado = fac.activo === false;
    try {
      await axiosClient.patch(`/catalogos/facultades/${fac.id}/estado`, null, {
        params: { activo: nuevoEstado },
      });
      success(
        `Facultad "${fac.nombre}" ${nuevoEstado ? 'activada' : 'desactivada'} correctamente.`
      );
      fetchCatalogos();
    } catch (err) {
      error(
        err.response?.data?.message ||
          'No se puede desactivar una facultad con escuelas activas asociadas. Desactive primero las escuelas dependientes (RN-08).'
      );
    }
  };

  // --- Handlers de Escuelas ---
  const handleOpenNuevaEscuela = () => {
    setEscuelaEnEdicion(null);
    setNombreNuevaEscuela('');
    setModalEscuelaOpen(true);
  };

  const handleOpenEditarEscuela = (esc) => {
    setEscuelaEnEdicion(esc);
    setNombreNuevaEscuela(esc.nombre || '');
    setModalEscuelaOpen(true);
  };

  const handleSaveEscuela = async (e) => {
    e.preventDefault();
    if (!nombreNuevaEscuela.trim() || !selectedFacultadId) {
      error('Ingrese el nombre de la escuela');
      return;
    }

    setSavingEscuela(true);
    try {
      if (escuelaEnEdicion) {
        // Actualizar escuela existente
        await axiosClient.put(`/catalogos/escuelas/${escuelaEnEdicion.id}`, {
          nombre: nombreNuevaEscuela.trim(),
        });
        success(`Escuela "${nombreNuevaEscuela.trim()}" actualizada.`);
      } else {
        // Crear nueva escuela vinculada a la facultad seleccionada
        await axiosClient.post(
          `/catalogos/escuelas`,
          {
            nombre: nombreNuevaEscuela.trim(),
            facultad: { id: parseInt(selectedFacultadId, 10) },
            activo: true,
          },
          {
            params: { facultadId: selectedFacultadId },
          }
        );
        success('Nueva escuela profesional agregada.');
      }
      setNombreNuevaEscuela('');
      setModalEscuelaOpen(false);
      fetchCatalogos();
    } catch (err) {
      error(err.response?.data?.message || 'Error al guardar la escuela profesional.');
    } finally {
      setSavingEscuela(false);
    }
  };

  const handleToggleEstadoEscuela = async (escuela) => {
    const nuevoEstado = escuela.activo === false;
    try {
      await axiosClient.patch(`/catalogos/escuelas/${escuela.id}/estado`, null, {
        params: { activo: nuevoEstado },
      });
      success(
        `Estado de la escuela "${escuela.nombre}" actualizado a ${
          nuevoEstado ? 'Activo' : 'Inactivo'
        }.`
      );
      fetchCatalogos();
    } catch {
      error('No se pudo cambiar el estado de la escuela.');
    }
  };

  if (loading && !catalogos) {
    return <LoadingSpinner message="Cargando catálogos oficiales UNT..." />;
  }

  const selectedFacultad = catalogos?.facultades?.find(
    (f) => f.id === parseInt(selectedFacultadId, 10)
  );

  const escuelasDeFacultad =
    catalogos?.escuelas?.filter(
      (esc) => esc.facultad?.id === parseInt(selectedFacultadId, 10)
    ) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <FolderTree className="w-6 h-6 text-unt-blue" /> Gestión de Catálogos Institucionales
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Configuración jerárquica de Facultades, Escuelas, Líneas de Investigación y ODS (CU-02, RN-08)
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto space-x-2">
        <button
          onClick={() => setActiveTab('facultades')}
          className={`py-2.5 px-4 text-xs font-bold border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'facultades'
              ? 'border-unt-blue text-unt-blue'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Building className="w-4 h-4" /> Facultades y Escuelas ({catalogos?.facultades?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('lineas')}
          className={`py-2.5 px-4 text-xs font-bold border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'lineas'
              ? 'border-unt-blue text-unt-blue'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Compass className="w-4 h-4" /> Líneas de Investigación UNT ({catalogos?.lineasUnt?.length || catalogos?.lineas?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('ods')}
          className={`py-2.5 px-4 text-xs font-bold border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'ods'
              ? 'border-unt-blue text-unt-blue'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Globe2 className="w-4 h-4" /> ODS de la ONU ({catalogos?.ods?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('areas')}
          className={`py-2.5 px-4 text-xs font-bold border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'areas'
              ? 'border-unt-blue text-unt-blue'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Layers className="w-4 h-4" /> Áreas CONCYTEC ({catalogos?.areasConcytec?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('programas')}
          className={`py-2.5 px-4 text-xs font-bold border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'programas'
              ? 'border-unt-blue text-unt-blue'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <GraduationCap className="w-4 h-4" /> Programas de Estudio ({catalogos?.programas?.length || 0})
        </button>
      </div>

      {/* Tab 1: Facultades y Escuelas (Cascada RN-08) */}
      {activeTab === 'facultades' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna Izquierda: Lista de Facultades con botón "+ Nueva Facultad" */}
          <div className="card-unt p-4 space-y-3 lg:col-span-1">
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 whitespace-nowrap">
                Facultades
              </h3>
              <button
                id="btn-nueva-facultad"
                type="button"
                onClick={handleOpenNuevaFacultad}
                className="btn-primary text-xs py-2 px-3 flex items-center gap-1.5 shadow-xs whitespace-nowrap shrink-0"
                title="Registrar una nueva facultad institucional"
              >
                <Plus className="w-3.5 h-3.5 shrink-0" /> Nueva Facultad
              </button>
            </div>

            <div className="space-y-1.5 max-h-[520px] overflow-y-auto pr-1">
              {catalogos?.facultades?.map((fac) => {
                const isSelected = selectedFacultadId === fac.id.toString();
                const totalEscuelas =
                  catalogos?.escuelas?.filter((e) => e.facultad?.id === fac.id).length || 0;
                return (
                  <button
                    key={fac.id}
                    onClick={() => setSelectedFacultadId(fac.id.toString())}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all flex items-center justify-between border ${
                      isSelected
                        ? 'bg-unt-blue text-white border-unt-blue shadow-sm font-semibold'
                        : 'bg-white hover:bg-slate-50 border-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="truncate mr-2">
                      <span className="block truncate">{fac.nombre}</span>
                      {fac.abreviatura && (
                        <span
                          className={`text-[10px] ${
                            isSelected ? 'text-white/80' : 'text-slate-400'
                          }`}
                        >
                          {fac.abreviatura}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {fac.activo === false && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 font-bold">
                          Inactiva
                        </span>
                      )}
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {totalEscuelas} esc.
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Columna Derecha: Detalle de la Facultad Seleccionada y sus Escuelas */}
          <div className="card-unt p-6 lg:col-span-2 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">
                    {selectedFacultad?.nombre || 'Facultad Seleccionada'}
                  </h3>
                  <span
                    className={`badge-unt text-[10px] ${
                      selectedFacultad?.activo !== false
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {selectedFacultad?.activo !== false ? 'Activa' : 'Inactiva'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedFacultad?.abreviatura
                    ? `Abreviatura: ${selectedFacultad.abreviatura} • `
                    : ''}
                  Escuelas Profesionales dependientes ({escuelasDeFacultad.length} en total)
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {selectedFacultad && (
                  <>
                    <button
                      id="btn-editar-facultad"
                      type="button"
                      onClick={() => handleOpenEditarFacultad(selectedFacultad)}
                      className="btn-secondary text-xs py-2 px-2.5 text-slate-700 hover:text-unt-blue flex items-center gap-1.5"
                      title="Editar nombre y datos de esta facultad"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-unt-blue" />
                      <span>Editar Facultad</span>
                    </button>

                    <button
                      id="btn-toggle-facultad"
                      type="button"
                      onClick={() => handleToggleEstadoFacultad(selectedFacultad)}
                      className={`p-2 rounded-lg border text-xs flex items-center gap-1.5 transition-colors ${
                        selectedFacultad.activo !== false
                          ? 'border-slate-200 text-slate-600 hover:border-rose-300 hover:text-rose-600 hover:bg-rose-50'
                          : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                      }`}
                      title={
                        selectedFacultad.activo !== false
                          ? 'Desactivar facultad'
                          : 'Activar facultad'
                      }
                    >
                      <Power className="w-3.5 h-3.5" />
                      <span className="hidden md:inline">
                        {selectedFacultad.activo !== false ? 'Desactivar' : 'Activar'}
                      </span>
                    </button>
                  </>
                )}

                <button
                  id="btn-nueva-escuela"
                  type="button"
                  onClick={handleOpenNuevaEscuela}
                  className="btn-primary text-xs py-2 px-3 flex items-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" /> Nueva Escuela
                </button>
              </div>
            </div>

            {/* Listado de Escuelas de la Facultad */}
            <div className="divide-y divide-slate-100">
              {escuelasDeFacultad.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  No hay escuelas profesionales registradas en esta facultad.
                </div>
              ) : (
                escuelasDeFacultad.map((esc) => (
                  <div
                    key={esc.id}
                    className="py-3 flex items-center justify-between hover:bg-slate-50/70 px-2.5 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-unt-light text-unt-blue flex items-center justify-center font-bold text-xs shrink-0">
                        {esc.id}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-800">{esc.nombre}</span>
                        <span className="block text-[11px] text-slate-400">
                          Código interno UNT #{esc.id}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <span
                        className={`badge-unt text-[10px] ${
                          esc.activo !== false
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {esc.activo !== false ? 'Activo' : 'Inactivo'}
                      </span>

                      <button
                        onClick={() => handleOpenEditarEscuela(esc)}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-unt-blue hover:bg-unt-light transition-colors"
                        title="Editar nombre de la escuela"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleToggleEstadoEscuela(esc)}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          esc.activo !== false
                            ? 'border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-rose-50'
                            : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                        }`}
                        title={esc.activo !== false ? 'Desactivar escuela' : 'Activar escuela'}
                      >
                        <Power className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Líneas UNT */}
      {activeTab === 'lineas' && (
        <div className="card-unt p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-900">
            50 Líneas Oficiales de Investigación UNT
          </h3>
          <p className="text-xs text-slate-500">
            Aprobadas por Resolución de Consejo Universitario para la adscripción obligatoria de proyectos
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            {(catalogos?.lineasUnt || catalogos?.lineas)?.map((l) => (
              <div
                key={l.id}
                className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 flex items-start gap-3"
              >
                <div className="w-6 h-6 rounded-md bg-unt-blue text-white font-bold text-xs flex items-center justify-center shrink-0">
                  {l.id}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">{l.nombre}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Área: {l.areaConcytec?.nombre || 'Ciencias Generales'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: ODS */}
      {activeTab === 'ods' && (
        <div className="card-unt p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-900">
            17 Objetivos de Desarrollo Sostenible (ODS - Agenda 2030)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
            {catalogos?.ods?.map((o) => (
              <div
                key={o.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-xs flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-unt-blue text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-xs">
                  {o.numero || o.id}
                </div>
                <div className="text-xs font-semibold text-slate-800">{o.nombre}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Áreas CONCYTEC */}
      {activeTab === 'areas' && (
        <div className="card-unt p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-900">
            6 Áreas de Conocimiento OCDE / CONCYTEC
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            {catalogos?.areasConcytec?.map((a) => (
              <div
                key={a.id}
                className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs flex items-center gap-3"
              >
                <Layers className="w-5 h-5 text-unt-blue shrink-0" />
                <div className="text-xs font-bold text-slate-800">{a.nombre}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Programas */}
      {activeTab === 'programas' && (
        <div className="card-unt p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-900">
            Programas Profesionales y de Posgrado ({catalogos?.programas?.length || 0})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-2">
            {catalogos?.programas?.map((p) => (
              <div
                key={p.id}
                className="p-3 rounded-lg border border-slate-200/80 bg-slate-50 text-xs font-medium text-slate-700"
              >
                {p.nombre}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal para Crear o Editar Facultad */}
      {modalFacultadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Building className="w-4 h-4 text-unt-blue" />
                {facultadEnEdicion ? 'Editar Facultad' : 'Nueva Facultad Institucional'}
              </h3>
              <button
                type="button"
                onClick={() => setModalFacultadOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveFacultad} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nombre Oficial de la Facultad <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={nombreFacultad}
                  onChange={(e) => setNombreFacultad(e.target.value)}
                  placeholder="Ej. Facultad de Ciencias Agropecuarias"
                  required
                  className="input-unt text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Abreviatura o Sigla (Opcional)
                </label>
                <input
                  type="text"
                  value={abreviaturaFacultad}
                  onChange={(e) => setAbreviaturaFacultad(e.target.value)}
                  placeholder="Ej. FCA, FI, FCM"
                  maxLength={10}
                  className="input-unt text-xs"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Identificador corto para gráficos y reportes analíticos.
                </span>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalFacultadOpen(false)}
                  className="btn-secondary text-xs py-2 px-3"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingFacultad}
                  className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
                >
                  {savingFacultad ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  {facultadEnEdicion ? 'Actualizar Facultad' : 'Registrar Facultad'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para Crear o Editar Escuela */}
      {modalEscuelaOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-unt-blue" />
                {escuelaEnEdicion ? 'Editar Escuela Profesional' : 'Agregar Escuela Profesional'}
              </h3>
              <button
                type="button"
                onClick={() => setModalEscuelaOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEscuela} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Facultad Asignada:
                </label>
                <div className="text-xs font-bold text-unt-blue p-2.5 bg-unt-light rounded-lg border border-unt-blue/20">
                  {selectedFacultad?.nombre}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nombre de la Escuela Profesional <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={nombreNuevaEscuela}
                  onChange={(e) => setNombreNuevaEscuela(e.target.value)}
                  placeholder="Ej. Escuela de Ingeniería Ambiental"
                  required
                  className="input-unt text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalEscuelaOpen(false)}
                  className="btn-secondary text-xs py-2 px-3"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingEscuela}
                  className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
                >
                  {savingEscuela ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  {escuelaEnEdicion ? 'Actualizar Escuela' : 'Guardar Escuela'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CatalogosView;
