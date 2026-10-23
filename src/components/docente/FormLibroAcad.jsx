import React, { useState } from 'react';
import axiosClient from '../../api/axiosClient';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import EvidenceUploader from './EvidenceUploader';
import ColaboradoresField from './ColaboradoresField';
import SearchableSelect from '../common/SearchableSelect';
import { Save, Loader2, GraduationCap } from 'lucide-react';

const formatOdsNombre = (o) => {
  if (!o) return '';
  const nom = o.nombre || '';
  if (/^ODS\s*\d+\s*:/i.test(nom)) return nom;
  return o.numero ? `ODS ${o.numero}: ${nom}` : nom;
};

const FormLibroAcad = ({ catalogos, onSuccess }) => {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);
  const [evidencias, setEvidencias] = useState([]);
  const [colaboradoresUnt, setColaboradoresUnt] = useState([]);
  const [colaboradoresExternos, setColaboradoresExternos] = useState('');

  const [formData, setFormData] = useState({
    titulo: '',
    anio: new Date().getFullYear(),
    editorial: '',
    revisionParesExternos: false,
    productoInvestigacion: false,
    enlaceWeb: '',
    lineaUntId: '',
    odsId: '',
    sublineaInvestigacion: '',
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.titulo.trim() || !formData.editorial.trim()) {
      error('Complete el título y la editorial del libro académico.');
      return;
    }
    if (!formData.lineaUntId || !formData.odsId) {
      error('Debe seleccionar la Línea UNT y el ODS.');
      return;
    }
    if (evidencias.length < 2 || evidencias.length > 3) {
      error('Debe adjuntar entre 2 y 3 evidencias documentales (RN-05).');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        titulo: formData.titulo.trim(),
        anio: parseInt(formData.anio, 10),
        editorial: formData.editorial.trim(),
        revisionParesExternos: formData.revisionParesExternos,
        productoInvestigacion: formData.productoInvestigacion,
        enlaceWeb: formData.enlaceWeb.trim(),
        sublineaInvestigacion: formData.sublineaInvestigacion.trim(),
      };

      const params = new URLSearchParams({
        docenteDni: user.dni,
        lineaUntId: formData.lineaUntId,
        odsId: formData.odsId,
      });

      evidencias.forEach((ev) => {
        params.append('enlaces', ev.enlaceUrl);
      });

      colaboradoresUnt.forEach((c) => {
        params.append('colaboradoresUntDnis', c.dni || c);
      });

      if (colaboradoresExternos.trim()) {
        params.append('colaboradoresExternos', colaboradoresExternos.trim());
      }

      await axiosClient.post(`/producciones/libros-academicos?${params.toString()}`, payload);

      success('¡Libro académico registrado exitosamente!');
      setFormData({
        titulo: '',
        anio: new Date().getFullYear(),
        editorial: '',
        revisionParesExternos: false,
        productoInvestigacion: false,
        enlaceWeb: '',
        lineaUntId: '',
        odsId: '',
        sublineaInvestigacion: '',
      });
      setEvidencias([]);
      setColaboradoresUnt([]);
      setColaboradoresExternos('');
      if (onSuccess) onSuccess();
    } catch (err) {
      error(err.response?.data?.message || 'Error al registrar el libro académico.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-unt-light/40 border border-unt-blue/15 rounded-xl p-4 flex items-center gap-3">
        <GraduationCap className="w-5 h-5 text-unt-blue shrink-0" />
        <div className="text-xs text-unt-dark">
          <strong>Libro Académico:</strong> Texto universitario, manual de laboratorio, guía teórica o material
          de enseñanza validado por departamento académico o facultad.
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Título */}
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Título del Libro Académico / Manual <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="titulo"
            value={formData.titulo}
            onChange={handleChange}
            required
            placeholder="Ej. Manual de Prácticas de Bioquímica General..."
            className="input-unt text-sm"
          />
        </div>

        {/* Editorial */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Editorial / Facultad Editora <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="editorial"
            value={formData.editorial}
            onChange={handleChange}
            required
            placeholder="Ej. Editorial Universitaria / Fac. Ingeniería"
            className="input-unt text-sm"
          />
        </div>

        {/* Año */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Año de Edición <span className="text-rose-500">*</span>
          </label>
          <input
            type="number"
            name="anio"
            value={formData.anio}
            onChange={handleChange}
            required
            className="input-unt text-sm"
          />
        </div>

        {/* Enlace Web */}
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Enlace Web / Repositorio Digital UNT
          </label>
          <input
            type="url"
            name="enlaceWeb"
            value={formData.enlaceWeb}
            onChange={handleChange}
            placeholder="https://dspace.unitru.edu.pe/..."
            className="input-unt text-sm"
          />
        </div>

        {/* Checkbox pares */}
        <div className="flex items-center gap-2 py-2">
          <input
            type="checkbox"
            id="revisionParesExternosAcad"
            name="revisionParesExternos"
            checked={formData.revisionParesExternos}
            onChange={handleChange}
            className="w-4 h-4 rounded text-unt-blue focus:ring-unt-blue"
          />
          <label htmlFor="revisionParesExternosAcad" className="text-xs font-medium text-slate-700">
            Revisado por comité editorial o comisión académica
          </label>
        </div>

        {/* Línea de Investigación (50 Líneas Oficiales UNT) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Línea de Investigación (50 Líneas Oficiales UNT) <span className="text-rose-500">*</span>
          </label>
          <SearchableSelect
            name="lineaUntId"
            value={formData.lineaUntId}
            onChange={handleChange}
            options={catalogos?.lineasUnt || catalogos?.lineas || []}
            placeholder="-- Escriba o seleccione Línea UNT --"
            getOptionLabel={(l) => l?.nombre || ''}
            getOptionValue={(l) => l?.id}
          />
        </div>

        {/* Objetivo de Desarrollo Sostenible (17 ODS) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Objetivo de Desarrollo Sostenible (17 ODS) <span className="text-rose-500">*</span>
          </label>
          <SearchableSelect
            name="odsId"
            value={formData.odsId}
            onChange={handleChange}
            options={catalogos?.ods || []}
            placeholder="-- Escriba o seleccione ODS --"
            getOptionLabel={formatOdsNombre}
            getOptionValue={(o) => o?.id}
          />
        </div>

        {/* Sublínea libre */}
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Curso / Asignatura o Especialidad
          </label>
          <input
            type="text"
            name="sublineaInvestigacion"
            value={formData.sublineaInvestigacion}
            onChange={handleChange}
            placeholder="Ej. Fisicoquímica avanzada"
            className="input-unt text-sm"
          />
        </div>
      </div>

      {/* Sección Equipo de Investigación / Colaboradores (RN-11) */}
      <ColaboradoresField
        catalogos={catalogos}
        currentDocenteDni={user?.dni}
        colaboradoresUnt={colaboradoresUnt}
        onChangeColaboradores={setColaboradoresUnt}
        colaboradoresExternos={colaboradoresExternos}
        onChangeExternos={setColaboradoresExternos}
      />

      {/* Evidencias */}
      <div className="pt-2 border-t border-slate-100">
        <EvidenceUploader
          evidencias={evidencias}
          onChange={setEvidencias}
          min={2}
          max={3}
          label="Evidencias del Libro Académico (Resolución de Aprobación, Depósito Legal o Portada)"
        />
      </div>

      <div className="flex justify-end pt-2">
        <button type="submit" disabled={loading} className="btn-primary min-w-[200px]">
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Guardando libro...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" /> Registrar Libro Académico
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default FormLibroAcad;
