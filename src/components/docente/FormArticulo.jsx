import React, { useState } from 'react';
import axiosClient from '../../api/axiosClient';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import EvidenceUploader from './EvidenceUploader';
import ColaboradoresField from './ColaboradoresField';
import SearchableSelect from '../common/SearchableSelect';
import { Save, Loader2, BookOpen, AlertCircle } from 'lucide-react';

const formatOdsNombre = (o) => {
  if (!o) return '';
  const nom = o.nombre || '';
  if (/^ODS\s*\d+\s*:/i.test(nom)) return nom;
  return o.numero ? `ODS ${o.numero}: ${nom}` : nom;
};

const FormArticulo = ({ catalogos, onSuccess }) => {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);
  const [colaboradoresUnt, setColaboradoresUnt] = useState([]);
  const [colaboradoresExternos, setColaboradoresExternos] = useState('');

  const [formData, setFormData] = useState({
    titulo: '',
    anio: new Date().getFullYear(),
    lineaUntId: '',
    sublineaInvestigacion: '',
    odsId: '',
    tipoArticulo: 'ORIGINAL',
    indizacion: 'SCIELO',
    cuartil: 'Q1',
    revista: '',
    doi: '',
    enlaceWeb: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.titulo.trim() || !formData.revista.trim() || !formData.enlaceWeb.trim()) {
      error('Por favor complete los campos obligatorios.');
      return;
    }
    if (!formData.lineaUntId || !formData.odsId) {
      error('Debe seleccionar la Línea de Investigación UNT y el ODS.');
      return;
    }

    // RN-04: Si no tiene DOI, se repite el enlace web
    const finalDoi = formData.doi.trim() ? formData.doi.trim() : formData.enlaceWeb.trim();

    setLoading(true);
    try {
      const payload = {
        titulo: formData.titulo.trim(),
        anio: parseInt(formData.anio, 10),
        sublineaInvestigacion: formData.sublineaInvestigacion.trim(),
        tipoArticulo: formData.tipoArticulo,
        indizacion: formData.indizacion,
        cuartil: formData.cuartil,
        revista: formData.revista.trim(),
        doi: finalDoi,
        enlaceWeb: formData.enlaceWeb.trim(),
      };

      const params = new URLSearchParams({
        docenteDni: user.dni,
        lineaUntId: formData.lineaUntId,
        odsId: formData.odsId,
      });

      colaboradoresUnt.forEach((c) => {
        params.append('colaboradoresUntDnis', c.dni || c);
      });

      if (colaboradoresExternos.trim()) {
        params.append('colaboradoresExternos', colaboradoresExternos.trim());
      }

      await axiosClient.post(
        `/producciones/articulos?${params.toString()}`,
        payload
      );

      success('¡Artículo científico registrado exitosamente!');
      setFormData({
        titulo: '',
        anio: new Date().getFullYear(),
        lineaUntId: '',
        sublineaInvestigacion: '',
        odsId: '',
        tipoArticulo: 'ORIGINAL',
        indizacion: 'SCIELO',
        cuartil: 'Q1',
        revista: '',
        doi: '',
        enlaceWeb: '',
      });
      setColaboradoresUnt([]);
      setColaboradoresExternos('');
      if (onSuccess) onSuccess();
    } catch (err) {
      error(err.response?.data?.message || 'Error al registrar el artículo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-unt-light/40 border border-unt-blue/15 rounded-xl p-4 flex items-center gap-3">
        <BookOpen className="w-5 h-5 text-unt-blue shrink-0" />
        <div className="text-xs text-unt-dark">
          <strong>Regla Institucional:</strong> Todo artículo debe estar indizado y vinculado a las
          líneas oficiales de la UNT. Si la publicación no cuenta con DOI, se utilizará automáticamente
          el enlace web.
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Título */}
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Título del Artículo Científico <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="titulo"
            value={formData.titulo}
            onChange={handleChange}
            required
            placeholder="Ej. Optimización de procesos catalíticos..."
            className="input-unt text-sm"
          />
        </div>

        {/* Revista */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Nombre de la Revista <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="revista"
            value={formData.revista}
            onChange={handleChange}
            required
            placeholder="Ej. Journal of Cleaner Production"
            className="input-unt text-sm"
          />
        </div>

        {/* Año */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Año de Publicación <span className="text-rose-500">*</span>
          </label>
          <input
            type="number"
            name="anio"
            value={formData.anio}
            onChange={handleChange}
            required
            min="1990"
            max="2030"
            className="input-unt text-sm"
          />
        </div>

        {/* Tipo de Artículo */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Tipo de Artículo <span className="text-rose-500">*</span>
          </label>
          <select
            name="tipoArticulo"
            value={formData.tipoArticulo}
            onChange={handleChange}
            className="input-unt text-sm"
          >
            <option value="ORIGINAL">Artículo Original</option>
            <option value="REVISION">Artículo de Revisión</option>
            <option value="CARTA_EDITOR">Carta al Editor</option>
            <option value="COMUNICACION_CORTA">Comunicación Corta</option>
            <option value="OTRO">Otro</option>
          </select>
        </div>

        {/* Tipo de indización */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Tipo de indización <span className="text-rose-500">*</span>
          </label>
          <select
            name="indizacion"
            value={formData.indizacion}
            onChange={handleChange}
            className="input-unt text-sm"
          >
            <option value="SCIELO">SCIELO</option>
            <option value="SCOPUS">SCOPUS</option>
            <option value="WOS">WoS</option>
            <option value="OTRO">Otro</option>
          </select>
        </div>

        {/* Cuartil */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Cuartil de la Revista
          </label>
          <select
            name="cuartil"
            value={formData.cuartil}
            onChange={handleChange}
            className="input-unt text-sm"
          >
            <option value="Q1">Q1 (Primer Cuartil)</option>
            <option value="Q2">Q2 (Segundo Cuartil)</option>
            <option value="Q3">Q3 (Tercer Cuartil)</option>
            <option value="Q4">Q4 (Cuarto Cuartil)</option>
            <option value="SIN_CUARTIL">Sin Cuartil / No Corresponde</option>
          </select>
        </div>

        {/* DOI */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Identificador DOI <span className="text-slate-400 font-normal">(Opcional si tiene URL)</span>
          </label>
          <input
            type="text"
            name="doi"
            value={formData.doi}
            onChange={handleChange}
            placeholder="Ej. 10.1016/j.jclepro.2024.1001"
            className="input-unt text-sm"
          />
        </div>

        {/* Enlace Web */}
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Enlace Web / URL de Acceso <span className="text-rose-500">*</span>
          </label>
          <input
            type="url"
            name="enlaceWeb"
            value={formData.enlaceWeb}
            onChange={handleChange}
            required
            placeholder="https://..."
            className="input-unt text-sm"
          />
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
            Sublínea / Especialidad de Investigación (Opcional)
          </label>
          <input
            type="text"
            name="sublineaInvestigacion"
            value={formData.sublineaInvestigacion}
            onChange={handleChange}
            placeholder="Ej. Nanomateriales para descontaminación"
            className="input-unt text-sm"
          />
        </div>
      </div>

      {/* Sección Equipo de Investigación / Colaboradores */}
      <ColaboradoresField
        catalogos={catalogos}
        currentDocenteDni={user?.dni}
        colaboradoresUnt={colaboradoresUnt}
        onChangeColaboradores={setColaboradoresUnt}
        colaboradoresExternos={colaboradoresExternos}
        onChangeExternos={setColaboradoresExternos}
      />

      <div className="flex justify-end pt-2">
        <button type="submit" disabled={loading} className="btn-primary min-w-[200px]">
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Guardando artículo...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" /> Registrar Artículo Científico
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default FormArticulo;
