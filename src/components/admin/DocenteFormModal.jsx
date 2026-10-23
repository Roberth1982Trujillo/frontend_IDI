import React, { useState, useEffect, useMemo } from 'react';
import axiosClient from '../../api/axiosClient';
import { useToast } from '../../context/ToastContext';
import {
  UserPlus,
  Save,
  X,
  Loader2,
  Building,
  GraduationCap,
  Briefcase,
  FlaskConical,
  Compass,
} from 'lucide-react';
import useEscapeKey from '../../hooks/useEscapeKey';
import SearchableSelect from '../common/SearchableSelect';

// Helper para relacionar Programa de Estudio con Escuela Profesional
const getProgramasForEscuela = (escuela, allProgramas = []) => {
  if (!escuela || !allProgramas || allProgramas.length === 0) return [];
  const escNom = (escuela.nombre || '').trim().toLowerCase();

  // Si la escuela pertenece a Posgrado
  if (escuela.esPosgrado || escNom.includes('posgrado')) {
    const posg = allProgramas.filter((p) => (p.nombre || '').toLowerCase().startsWith('posgrado'));
    return posg.length > 0 ? posg : allProgramas;
  }

  // Filtrar programas de pregrado coincidentes
  const pregradoMatch = allProgramas.filter((p) => {
    const progNom = (p.nombre || '').trim().toLowerCase();
    if (progNom.startsWith('posgrado')) return false;

    // Coincidencias exactas o semánticas
    if (progNom === escNom) return true;
    if (escNom.includes('pesquer') && progNom.includes('pesquer')) return true;
    if (escNom.includes('informática') && progNom.includes('informática')) return true;
    if (escNom.includes('farmacia') && progNom.includes('farmacia')) return true;
    if (escNom.includes('comunicación') && progNom.includes('comunicación')) return true;
    if (escNom.includes('materiales') && progNom.includes('materiales')) return true;
    if (escNom.includes('minas') && progNom.includes('minas')) return true;
    if (escNom.includes('sistemas') && progNom.includes('sistemas')) return true;
    if (escNom.includes('industrial') && progNom.includes('industrial')) return true;
    if (escNom.includes('mecánica') && progNom.includes('mecánica') && !progNom.includes('mecatrónica') && !escNom.includes('mecatrónica')) return true;
    if (escNom.includes('mecatrónica') && progNom.includes('mecatrónica')) return true;
    if (escNom.includes('metalúrgica') && progNom.includes('metalúrgica')) return true;
    if (escNom.includes('química') && progNom.includes('química') && !progNom.includes('ambiental') && !escNom.includes('ambiental')) return true;
    if (escNom.includes('ambiental') && progNom.includes('ambiental')) return true;
    if (escNom.includes('civil') && progNom.includes('civil')) return true;
    if (escNom.includes('agronomía') && progNom.includes('agronomía')) return true;
    if (escNom.includes('zootecnia') && progNom.includes('zootecnia')) return true;
    if (escNom.includes('agrícola') && progNom.includes('agrícola')) return true;
    if (escNom.includes('agroindustrial') && progNom.includes('agroindustrial')) return true;
    if ((escNom.includes('médicas') || escNom.includes('medicina')) && progNom.includes('medicina')) return true;
    if (escNom.includes('estomatología') && progNom.includes('estomatología')) return true;
    if (escNom.includes('enfermería') && progNom.includes('enfermería')) return true;
    if (escNom.includes('derecho') && progNom.includes('derecho')) return true;
    if (escNom.includes('política') && progNom.includes('política')) return true;
    if (escNom.includes('economía') && progNom.includes('economía')) return true;
    if (escNom.includes('administración') && progNom.includes('administración')) return true;
    if (escNom.includes('contabilidad') && progNom.includes('contabilidad')) return true;
    if (escNom.includes('antropología') && progNom.includes('antropología')) return true;
    if (escNom.includes('arqueología') && progNom.includes('arqueología')) return true;
    if (escNom.includes('social') && progNom.includes('social')) return true;
    if (escNom.includes('turismo') && progNom.includes('turismo')) return true;
    if (escNom.includes('inicial') && progNom.includes('inicial')) return true;
    if (escNom.includes('primaria') && progNom.includes('primaria')) return true;
    if (escNom.includes('secundaria') && progNom.includes('secundaria')) return true;
    if (escNom.includes('biológicas') && progNom.includes('biológicas')) return true;
    if (escNom.includes('microbiología') && progNom.includes('microbiología')) return true;
    if (escNom.includes('física') && progNom.includes('física')) return true;
    if (escNom.includes('matemática') && progNom.includes('matemática')) return true;
    if (escNom.includes('estadística') && progNom.includes('estadística')) return true;
    if (escNom.includes('arquitectura') && progNom.includes('arquitectura')) return true;

    return false;
  });

  return pregradoMatch.length > 0 ? pregradoMatch : allProgramas;
};

// Helpers para formatear ODS y Línea UNT sin duplicaciones visuales
const formatOdsNombre = (o) => {
  if (!o) return '';
  const nom = (o.nombre || '').trim();
  if (/^ODS\s*\d+\s*:/i.test(nom)) return nom;
  return o.numero ? `ODS ${o.numero}: ${nom}` : nom;
};

const formatLineaNombre = (l) => {
  if (!l) return '';
  const nom = (l.nombre || '').trim();
  if (/^Línea\s*\d+\s*:/i.test(nom)) return nom;
  return l.numero ? `Línea ${l.numero}: ${nom}` : nom;
};

const DocenteFormModal = ({ isOpen, onClose, onSuccess, initialData = null, catalogos }) => {
  useEscapeKey(onClose, isOpen);
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);

  const initialFormState = {
    dni: '',
    nombres: '',
    apellidos: '',
    correo: '',
    genero: 'MASCULINO',
    rangoEtario: 'DE_36_A_40',
    nivelRenacyt: 'NIVEL_I',
    vigenciaDocenteInvestigador: 'ACTIVO',
    condicion: 'NOMBRADO',
    categoria: 'PRINCIPAL',
    modalidad: 'DE',
    facultadId: '',
    escuelaId: '',
    programaEstudioId: '',
    areaInvestigacionId: '',
    lineaInvestigacionId: '',
    sublineaInvestigacion: '',
    odsId: '',
    esPosgrado: false,
    unidadPosgrado: '',
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    if (initialData) {
      setFormData({
        dni: initialData.dni || '',
        nombres: initialData.nombres || '',
        apellidos: initialData.apellidos || '',
        correo: initialData.correo || '',
        genero: initialData.genero || 'MASCULINO',
        rangoEtario: initialData.rangoEtario || 'DE_36_A_40',
        nivelRenacyt: initialData.nivelRenacyt || 'NIVEL_I',
        vigenciaDocenteInvestigador:
          initialData.vigenciaDocenteInvestigador || initialData.vigencia || 'ACTIVO',
        condicion: initialData.condicion || 'NOMBRADO',
        categoria: initialData.categoria || 'PRINCIPAL',
        modalidad: initialData.modalidad || 'DE',
        facultadId: initialData.facultad?.id || initialData.facultadId || '',
        escuelaId: initialData.escuela?.id || initialData.escuelaId || '',
        programaEstudioId: initialData.programaEstudio?.id || initialData.programaEstudioId || '',
        areaInvestigacionId:
          initialData.areaInvestigacion?.id ||
          initialData.areaInvestigacionId ||
          initialData.areaConcytec?.id ||
          '',
        lineaInvestigacionId:
          initialData.lineaInvestigacion?.id ||
          initialData.lineaInvestigacionId ||
          initialData.lineaUnt?.id ||
          '',
        sublineaInvestigacion: initialData.sublineaInvestigacion || '',
        odsId: initialData.ods?.id || initialData.odsId || '',
        esPosgrado: Boolean(initialData.esPosgrado || initialData.escuelaPosgrado),
        unidadPosgrado: initialData.unidadPosgrado || '',
      });
    } else {
      setFormData(initialFormState);
    }
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: type === 'checkbox' ? checked : value };

      // Cascada RN-08: si cambia la facultad, reiniciar escuela y programa de estudio
      if (name === 'facultadId') {
        updated.escuelaId = '';
        updated.programaEstudioId = '';
      }

      // Cascada RN-08: si cambia la escuela, autoseleccionar el programa correspondiente
      if (name === 'escuelaId') {
        const selectedEsc = catalogos?.escuelas?.find(
          (esc) => String(esc.id) === String(value)
        );
        const matchedProgs = getProgramasForEscuela(selectedEsc, catalogos?.programas);
        if (matchedProgs.length > 0) {
          updated.programaEstudioId = matchedProgs[0].id;
        } else {
          updated.programaEstudioId = '';
        }
      }

      return updated;
    });
  };

  // Filtrar escuelas por la facultad seleccionada
  const filteredEscuelas = useMemo(() => {
    if (!formData.facultadId || !catalogos?.escuelas) return [];
    return catalogos.escuelas.filter((esc) => {
      const facId = esc.facultad?.id ?? esc.facultadId;
      return String(facId) === String(formData.facultadId);
    });
  }, [formData.facultadId, catalogos?.escuelas]);

  // Filtrar programas de estudio dependientes de la escuela seleccionada
  const selectedEscuelaObj = useMemo(() => {
    if (!formData.escuelaId || !catalogos?.escuelas) return null;
    return catalogos.escuelas.find((esc) => String(esc.id) === String(formData.escuelaId)) || null;
  }, [formData.escuelaId, catalogos?.escuelas]);

  const filteredProgramas = useMemo(() => {
    if (!selectedEscuelaObj) return [];
    return getProgramasForEscuela(selectedEscuelaObj, catalogos?.programas);
  }, [selectedEscuelaObj, catalogos?.programas]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!/^\d{8}$/.test(formData.dni.trim())) {
      error('El DNI debe tener exactamente 8 dígitos numéricos.');
      return;
    }
    if (!formData.nombres.trim() || !formData.apellidos.trim()) {
      error('Complete los nombres y apellidos del docente.');
      return;
    }
    if (!formData.facultadId) {
      error('Seleccione la facultad de adscripción institucional.');
      return;
    }
    if (!formData.escuelaId) {
      error('Seleccione la escuela profesional correspondiente.');
      return;
    }

    setLoading(true);
    try {
      // Payload con alias para compatibilidad total con el DTO
      const payload = {
        ...formData,
        vigencia: formData.vigenciaDocenteInvestigador,
        areaConcytecId: formData.areaInvestigacionId || null,
        areaInvestigacionId: formData.areaInvestigacionId || null,
        lineaUntId: formData.lineaInvestigacionId || null,
        lineaInvestigacionId: formData.lineaInvestigacionId || null,
        programaEstudioId: formData.programaEstudioId || null,
        odsId: formData.odsId || null,
        escuelaPosgrado: formData.esPosgrado,
      };

      if (initialData?.id) {
        await axiosClient.put(`/docentes/${initialData.id}`, payload);
        success('Docente actualizado con éxito.');
      } else {
        await axiosClient.post('/docentes', payload);
        success('Docente registrado en el padrón con éxito.');
      }
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      error(err.response?.data?.message || 'Error al guardar el docente.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] shadow-2xl border border-slate-100 overflow-hidden flex flex-col">
        {/* Cabecera */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-unt-light text-unt-blue flex items-center justify-center shadow-xs">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {initialData ? 'Editar Perfil Docente' : 'Nuevo Registro de Docente'}
              </h3>
              <p className="text-xs text-slate-500">Padrón institucional oficial UNT</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cuerpo del formulario con scroll suave */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          {/* BLOQUE 1: Identificación Personal y Demografía */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-100 text-xs font-bold text-slate-800">
              <UserPlus className="w-4 h-4 text-unt-blue" />
              <span>1. Identificación Personal y Demografía</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  DNI <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  maxLength={8}
                  name="dni"
                  value={formData.dni}
                  onChange={handleChange}
                  required
                  disabled={!!initialData}
                  className="input-unt text-xs font-mono"
                  placeholder="12345678"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Nombres <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="nombres"
                  value={formData.nombres}
                  onChange={handleChange}
                  required
                  className="input-unt text-xs"
                  placeholder="Nombres completos"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Apellidos <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="apellidos"
                  value={formData.apellidos}
                  onChange={handleChange}
                  required
                  className="input-unt text-xs"
                  placeholder="Apellidos paterno y materno"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  name="correo"
                  value={formData.correo}
                  onChange={handleChange}
                  className="input-unt text-xs"
                  placeholder="docente@unitru.edu.pe"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Género
                </label>
                <select
                  name="genero"
                  value={formData.genero}
                  onChange={handleChange}
                  className="input-unt text-xs"
                >
                  <option value="MASCULINO">Masculino</option>
                  <option value="FEMENINO">Femenino</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Rango Etario (11 rangos oficiales)
                </label>
                <select
                  name="rangoEtario"
                  value={formData.rangoEtario}
                  onChange={handleChange}
                  className="input-unt text-xs"
                >
                  <option value="MENOR_A_25">Menor a 25</option>
                  <option value="DE_26_A_30">26 – 30</option>
                  <option value="DE_31_A_35">31 – 35</option>
                  <option value="DE_36_A_40">36 – 40</option>
                  <option value="DE_41_A_45">41 – 45</option>
                  <option value="DE_46_A_50">46 – 50</option>
                  <option value="DE_51_A_55">51 – 55</option>
                  <option value="DE_56_A_60">56 – 60</option>
                  <option value="DE_61_A_65">61 – 65</option>
                  <option value="DE_66_A_70">66 – 70</option>
                  <option value="MAYOR_A_70">Mayor a 70</option>
                </select>
              </div>
            </div>
          </div>

          {/* BLOQUE 2: Adscripción Institucional */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-100 text-xs font-bold text-slate-800">
              <Building className="w-4 h-4 text-unt-blue" />
              <span>2. Adscripción Institucional</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Facultad Adscrita <span className="text-rose-500">*</span>
                </label>
                <SearchableSelect
                  name="facultadId"
                  value={formData.facultadId}
                  onChange={handleChange}
                  options={catalogos?.facultades || []}
                  placeholder="-- Escriba o seleccione Facultad --"
                  getOptionLabel={(f) => f.nombre}
                  getOptionValue={(f) => f.id}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Escuela Profesional (Cascada) <span className="text-rose-500">*</span>
                </label>
                <select
                  name="escuelaId"
                  value={formData.escuelaId}
                  onChange={handleChange}
                  disabled={!formData.facultadId}
                  className="input-unt text-xs disabled:bg-slate-100"
                >
                  <option value="">
                    {!formData.facultadId ? '-- Seleccione Facultad primero --' : '-- Seleccionar Escuela --'}
                  </option>
                  {filteredEscuelas.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Programa de Estudio (Depende de Escuela)
                </label>
                <select
                  name="programaEstudioId"
                  value={formData.programaEstudioId}
                  onChange={handleChange}
                  disabled={!formData.escuelaId}
                  className="input-unt text-xs disabled:bg-slate-100"
                >
                  <option value="">
                    {!formData.escuelaId
                      ? '-- Seleccione Escuela primero --'
                      : filteredProgramas.length === 0
                      ? '-- No hay programas asociados --'
                      : '-- Seleccionar Programa --'}
                  </option>
                  {filteredProgramas.map((prog) => (
                    <option key={prog.id} value={prog.id}>
                      {prog.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* BLOQUE 3: Régimen y Carrera Docente */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-100 text-xs font-bold text-slate-800">
              <Briefcase className="w-4 h-4 text-unt-blue" />
              <span>3. Régimen y Carrera Docente</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Condición
                </label>
                <select
                  name="condicion"
                  value={formData.condicion}
                  onChange={handleChange}
                  className="input-unt text-xs"
                >
                  <option value="NOMBRADO">Nombrado</option>
                  <option value="CONTRATADO">Contratado</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Categoría
                </label>
                <select
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleChange}
                  className="input-unt text-xs"
                >
                  <option value="PRINCIPAL">Principal</option>
                  <option value="ASOCIADO">Asociado</option>
                  <option value="AUXILIAR">Auxiliar</option>
                  <option value="JEFE_DE_PRACTICA">Jefe de Práctica</option>
                  <option value="NC">No corresponde (NC)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Modalidad
                </label>
                <select
                  name="modalidad"
                  value={formData.modalidad}
                  onChange={handleChange}
                  className="input-unt text-xs"
                >
                  <option value="DE">Dedicación Exclusiva (DE)</option>
                  <option value="TC">Tiempo Completo (TC)</option>
                  <option value="TP">Tiempo Parcial (TP)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Nivel RENACYT
                </label>
                <select
                  name="nivelRenacyt"
                  value={formData.nivelRenacyt}
                  onChange={handleChange}
                  className="input-unt text-xs"
                >
                  <option value="DISTINGUIDO">Distinguido</option>
                  <option value="NIVEL_I">Nivel I</option>
                  <option value="NIVEL_II">Nivel II</option>
                  <option value="NIVEL_III">Nivel III</option>
                  <option value="NIVEL_IV">Nivel IV</option>
                  <option value="NIVEL_V">Nivel V</option>
                  <option value="NIVEL_VI">Nivel VI</option>
                  <option value="NIVEL_VII">Nivel VII</option>
                  <option value="NO">No RENACYT</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Vigencia Docente
                </label>
                <select
                  name="vigenciaDocenteInvestigador"
                  value={formData.vigenciaDocenteInvestigador}
                  onChange={handleChange}
                  className="input-unt text-xs"
                >
                  <option value="ACTIVO">Activo</option>
                  <option value="INACTIVO">Inactivo</option>
                  <option value="NC">No corresponde (NC)</option>
                </select>
              </div>
            </div>
          </div>

          {/* BLOQUE 4: Perfil de Investigación y Vinculación Institucional */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-100 text-xs font-bold text-slate-800">
              <FlaskConical className="w-4 h-4 text-unt-blue" />
              <span>4. Perfil de Investigación y Vinculación Institucional</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Área de Investigación (6 áreas CONCYTEC)
                </label>
                <select
                  name="areaInvestigacionId"
                  value={formData.areaInvestigacionId}
                  onChange={handleChange}
                  className="input-unt text-xs"
                >
                  <option value="">-- Seleccionar Área CONCYTEC --</option>
                  {catalogos?.areasConcytec?.map((area) => (
                    <option key={area.id} value={area.id}>
                      {area.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Objetivo de Desarrollo Sostenible (17 ODS)
                </label>
                <SearchableSelect
                  name="odsId"
                  value={formData.odsId}
                  onChange={handleChange}
                  options={catalogos?.ods || []}
                  placeholder="-- Escriba o seleccione ODS --"
                  getOptionLabel={(o) => formatOdsNombre(o)}
                  getOptionValue={(o) => o.id}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Línea de Investigación (50 Líneas Oficiales UNT)
                </label>
                <SearchableSelect
                  name="lineaInvestigacionId"
                  value={formData.lineaInvestigacionId}
                  onChange={handleChange}
                  options={catalogos?.lineasUnt || []}
                  placeholder="-- Escriba o seleccione Línea UNT --"
                  getOptionLabel={(l) => formatLineaNombre(l)}
                  getOptionValue={(l) => l.id}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Sublínea de Investigación <span className="text-slate-400 font-normal">(PARA TIPEAR)</span>
                </label>
                <input
                  type="text"
                  name="sublineaInvestigacion"
                  value={formData.sublineaInvestigacion}
                  onChange={handleChange}
                  className="input-unt text-xs"
                  placeholder="Ej. Biorremediación, Síntesis de polímeros..."
                />
              </div>
            </div>
          </div>

          {/* BLOQUE 5: Adscripción a Posgrado (RN-07) */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="esPosgrado"
                name="esPosgrado"
                checked={formData.esPosgrado}
                onChange={handleChange}
                className="w-4 h-4 rounded text-unt-blue focus:ring-unt-blue"
              />
              <label htmlFor="esPosgrado" className="text-xs font-semibold text-slate-800 flex items-center gap-1.5 cursor-pointer">
                <GraduationCap className="w-4 h-4 text-unt-blue" />
                <span>Docente adscrito a Posgrado (RN-07)</span>
              </label>
            </div>

            {formData.esPosgrado && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-6 pt-1 bg-slate-50/70 p-3 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Unidad de Posgrado
                  </label>
                  <input
                    type="text"
                    name="unidadPosgrado"
                    value={formData.unidadPosgrado}
                    onChange={handleChange}
                    className="input-unt text-xs bg-white"
                    placeholder="Ej. Unidad de Posgrado en Ciencias Biológicas"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Programa de Maestría / Doctorado
                  </label>
                  <input
                    type="text"
                    name="programaPosgrado"
                    value={formData.programaPosgrado || ''}
                    onChange={handleChange}
                    className="input-unt text-xs bg-white"
                    placeholder="Ej. Doctorado en Ciencias Físicas"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Botones de acción */}
          <div className="pt-4 border-t border-slate-200 flex justify-end gap-3 sticky bottom-0 bg-white/95 backdrop-blur-xs py-2">
            <button type="button" onClick={onClose} className="btn-secondary text-xs py-2 px-4">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="btn-primary text-xs py-2 px-5">
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Guardando...
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" /> Guardar Docente
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DocenteFormModal;
