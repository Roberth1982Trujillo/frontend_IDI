import React, { useState } from 'react';
import axiosClient from '../../api/axiosClient';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import EvidenceUploader from './EvidenceUploader';
import ColaboradoresField from './ColaboradoresField';
import SearchableSelect from '../common/SearchableSelect';
import { Save, Loader2, Presentation } from 'lucide-react';

const formatOdsNombre = (o) => {
  if (!o) return '';
  const nom = o.nombre || '';
  if (/^ODS\s*\d+\s*:/i.test(nom)) return nom;
  return o.numero ? `ODS ${o.numero}: ${nom}` : nom;
};

const FormPonencia = ({ catalogos, onSuccess }) => {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);
  const [evidencias, setEvidencias] = useState([]);
  const [colaboradoresUnt, setColaboradoresUnt] = useState([]);
  const [colaboradoresExternos, setColaboradoresExternos] = useState('');

  const [formData, setFormData] = useState({
    titulo: '',
    anio: new Date().getFullYear(),
    nombreEvento: '',
    tipoEvento: 'CONGRESO',
    amplitud: 'INTERNACIONAL',
    publicadoProceedings: 'SI',
    enlacePublicacion: '',
    enlacePonencia: '',
    lineaUntId: '',
    odsId: '',
    sublineaInvestigacion: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.titulo.trim() || !formData.nombreEvento.trim()) {
      error('Complete el título de la ponencia y el nombre del evento.');
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
        nombreEvento: formData.nombreEvento.trim(),
        tipoEvento: formData.tipoEvento,
        amplitud: formData.amplitud,
        publicadoProceedings: formData.publicadoProceedings,
        enlacePublicacion: formData.enlacePublicacion.trim(),
        enlacePonencia: formData.enlacePonencia.trim(),
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

      await axiosClient.post(`/producciones/ponencias?${params.toString()}`, payload);

      success('¡Ponencia científica registrada exitosamente!');
      setFormData({
        titulo: '',
        anio: new Date().getFullYear(),
        nombreEvento: '',
        tipoEvento: 'CONGRESO',
        amplitud: 'INTERNACIONAL',
        publicadoProceedings: 'SI',
        enlacePublicacion: '',
        enlacePonencia: '',
        lineaUntId: '',
        odsId: '',
        sublineaInvestigacion: '',
      });
      setEvidencias([]);
      setColaboradoresUnt([]);
      setColaboradoresExternos('');
      if (onSuccess) onSuccess();
    } catch (err) {
      error(err.response?.data?.message || 'Error al registrar la ponencia.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-unt-light/40 border border-unt-blue/15 rounded-xl p-4 flex items-center gap-3">
        <Presentation className="w-5 h-5 text-unt-blue shrink-0" />
        <div className="text-xs text-unt-dark">
          <strong>Ponencia en Evento Científico:</strong> Presentaciones orales o conferencias dictadas en
          congresos, simposios o seminarios reconocidos, con o sin publicación en actas (proceedings).
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Título */}
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Título de la Ponencia / Trabajo Presentado <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="titulo"
            value={formData.titulo}
            onChange={handleChange}
            required
            placeholder="Ej. Análisis de impacto ambiental de nanopartículas..."
            className="input-unt text-sm"
          />
        </div>

        {/* Nombre Evento */}
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Nombre del Evento Científico <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="nombreEvento"
            value={formData.nombreEvento}
            onChange={handleChange}
            required
            placeholder="Ej. X Congreso Internacional de Ciencia de Materiales"
            className="input-unt text-sm"
          />
        </div>

        {/* Tipo Evento */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Tipo de Evento <span className="text-rose-500">*</span>
          </label>
          <select
            name="tipoEvento"
            value={formData.tipoEvento}
            onChange={handleChange}
            className="input-unt text-sm"
          >
            <option value="CONGRESO">Congreso Científico</option>
            <option value="SIMPOSIO">Simposio Especializado</option>
            <option value="TALLER">Taller / Workshop</option>
            <option value="CURSO">Curso Internacional</option>
            <option value="OTRO">Otro Evento Académico</option>
          </select>
        </div>

        {/* Amplitud */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Ámbito / Amplitud <span className="text-rose-500">*</span>
          </label>
          <select
            name="amplitud"
            value={formData.amplitud}
            onChange={handleChange}
            className="input-unt text-sm"
          >
            <option value="INTERNACIONAL">Internacional</option>
            <option value="NACIONAL">Nacional</option>
          </select>
        </div>

        {/* Año */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Año del Evento <span className="text-rose-500">*</span>
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

        {/* Publicado en Proceedings */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            ¿Publicado en Proceedings / Libro de Actas? <span className="text-rose-500">*</span>
          </label>
          <select
            name="publicadoProceedings"
            value={formData.publicadoProceedings}
            onChange={handleChange}
            className="input-unt text-sm"
          >
            <option value="SI">Sí, publicado en Proceedings completo</option>
            <option value="SOLO_LIBRO_RESUMEN">Solo en Libro de Resúmenes (Abstracts)</option>
            <option value="NO">No publicado en libro de actas</option>
          </select>
        </div>

        {/* Enlaces */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Enlace de la Publicación / Proceedings
          </label>
          <input
            type="url"
            name="enlacePublicacion"
            value={formData.enlacePublicacion}
            onChange={handleChange}
            placeholder="https://proceedings.sciencedirect.com/..."
            className="input-unt text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Enlace a Diapositivas o Grabación
          </label>
          <input
            type="url"
            name="enlacePonencia"
            value={formData.enlacePonencia}
            onChange={handleChange}
            placeholder="https://drive.google.com/..."
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
          label="Evidencias de la Ponencia (Certificado de Expositor, Programa del Congreso o Acta)"
        />
      </div>

      <div className="flex justify-end pt-2">
        <button type="submit" disabled={loading} className="btn-primary min-w-[200px]">
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Guardando ponencia...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" /> Registrar Ponencia Científica
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default FormPonencia;
