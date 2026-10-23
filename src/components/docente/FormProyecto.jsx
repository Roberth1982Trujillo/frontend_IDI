import React, { useState } from 'react';
import axiosClient from '../../api/axiosClient';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import EvidenceUploader from './EvidenceUploader';
import ColaboradoresField from './ColaboradoresField';
import SearchableSelect from '../common/SearchableSelect';
import { Save, Loader2, Coins } from 'lucide-react';

const formatOdsNombre = (o) => {
  if (!o) return '';
  const nom = o.nombre || '';
  if (/^ODS\s*\d+\s*:/i.test(nom)) return nom;
  return o.numero ? `ODS ${o.numero}: ${nom}` : nom;
};

const FormProyecto = ({ catalogos, onSuccess }) => {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);
  const [evidencias, setEvidencias] = useState([]);
  const [colaboradoresUnt, setColaboradoresUnt] = useState([]);
  const [colaboradoresExternos, setColaboradoresExternos] = useState('');

  const [formData, setFormData] = useState({
    titulo: '',
    anioConvocatoria: new Date().getFullYear(),
    agenciaFinanciamiento: 'PROCIENCIA',
    agenciaDetalle: '',
    tipoProyecto: 'APLICADA',
    montoGanado: 'DE_100000_A_150000',
    nombreConvocatoria: '',
    enlaceGanadores: '',
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

    if (!formData.titulo.trim() || !formData.nombreConvocatoria.trim()) {
      error('Complete el título del proyecto y el nombre de la convocatoria.');
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
        anioConvocatoria: parseInt(formData.anioConvocatoria, 10),
        agenciaFinanciamiento: formData.agenciaFinanciamiento,
        agenciaDetalle: formData.agenciaDetalle.trim(),
        tipoProyecto: formData.tipoProyecto,
        montoGanado: formData.montoGanado,
        nombreConvocatoria: formData.nombreConvocatoria.trim(),
        enlaceGanadores: formData.enlaceGanadores.trim(),
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

      await axiosClient.post(`/producciones/proyectos?${params.toString()}`, payload);

      success('¡Proyecto con fondos concursables registrado exitosamente!');
      setFormData({
        titulo: '',
        anioConvocatoria: new Date().getFullYear(),
        agenciaFinanciamiento: 'PROCIENCIA',
        agenciaDetalle: '',
        tipoProyecto: 'APLICADA',
        montoGanado: 'DE_100000_A_150000',
        nombreConvocatoria: '',
        enlaceGanadores: '',
        lineaUntId: '',
        odsId: '',
        sublineaInvestigacion: '',
      });
      setEvidencias([]);
      setColaboradoresUnt([]);
      setColaboradoresExternos('');
      if (onSuccess) onSuccess();
    } catch (err) {
      error(err.response?.data?.message || 'Error al registrar el proyecto concursable.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-unt-light/40 border border-unt-blue/15 rounded-xl p-4 flex items-center gap-3">
        <Coins className="w-5 h-5 text-unt-blue shrink-0" />
        <div className="text-xs text-unt-dark">
          <strong>Fondos Concursables:</strong> Proyectos de I+D+i adjudicados mediante convocatorias competitivas
          nacionales (Prociencia, Proinnóvate, Canon UNT) o fondos internacionales.
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Título */}
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Título del Proyecto Ganador <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="titulo"
            value={formData.titulo}
            onChange={handleChange}
            required
            placeholder="Ej. Biorremediación de aguas mediante microalgas..."
            className="input-unt text-sm"
          />
        </div>

        {/* Nombre Convocatoria */}
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Nombre de la Convocatoria / Concurso <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="nombreConvocatoria"
            value={formData.nombreConvocatoria}
            onChange={handleChange}
            required
            placeholder="Ej. Concurso Nacional de Proyectos de Investigación Aplicada 2024-I"
            className="input-unt text-sm"
          />
        </div>

        {/* Agencia */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Agencia de Financiamiento <span className="text-rose-500">*</span>
          </label>
          <select
            name="agenciaFinanciamiento"
            value={formData.agenciaFinanciamiento}
            onChange={handleChange}
            className="input-unt text-sm"
          >
            <option value="PROCIENCIA">PROCIENCIA (CONCYTEC)</option>
            <option value="PROINNOVATE">PROINNÓVATE (PRODUCE)</option>
            <option value="UNT_CANON">UNT - CANON Minero Institucional</option>
            <option value="FONDO_EXTRANJERO">Fondo Extranjero / Cooperación Internacional</option>
            <option value="OTRO">Otra Entidad Financiadora</option>
          </select>
        </div>

        {/* Detalle Agencia si Otro */}
        {formData.agenciaFinanciamiento === 'OTRO' && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nombre de la Entidad Financiadora
            </label>
            <input
              type="text"
              name="agenciaDetalle"
              value={formData.agenciaDetalle}
              onChange={handleChange}
              placeholder="Ej. Fundación Rockefeller"
              className="input-unt text-sm"
            />
          </div>
        )}

        {/* Tipo Proyecto */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Tipo de Proyecto <span className="text-rose-500">*</span>
          </label>
          <select
            name="tipoProyecto"
            value={formData.tipoProyecto}
            onChange={handleChange}
            className="input-unt text-sm"
          >
            <option value="BASICA">Investigación Básica</option>
            <option value="APLICADA">Investigación Aplicada</option>
            <option value="DESARROLLO_TECNOLOGICO">Desarrollo Tecnológico / Innovación</option>
            <option value="CIENCIAS_SOCIALES">Ciencias Sociales y Humanidades</option>
            <option value="OTRO">Otro Tipo</option>
          </select>
        </div>

        {/* Monto */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Rango de Monto Adjudicado (S/) <span className="text-rose-500">*</span>
          </label>
          <select
            name="montoGanado"
            value={formData.montoGanado}
            onChange={handleChange}
            className="input-unt text-sm"
          >
            <option value="MENOR_A_50000">Menor a S/ 50,000</option>
            <option value="DE_50000_A_100000">De S/ 50,000 a S/ 100,000</option>
            <option value="DE_100000_A_150000">De S/ 100,000 a S/ 150,000</option>
            <option value="DE_150000_A_200000">De S/ 150,000 a S/ 200,000</option>
            <option value="MAYOR_A_200000">Mayor a S/ 200,000</option>
          </select>
        </div>

        {/* Año Convocatoria */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Año de la Convocatoria <span className="text-rose-500">*</span>
          </label>
          <input
            type="number"
            name="anioConvocatoria"
            value={formData.anioConvocatoria}
            onChange={handleChange}
            required
            className="input-unt text-sm"
          />
        </div>

        {/* Enlace Ganadores */}
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Enlace Web a la Lista Oficial de Ganadores / Resolución
          </label>
          <input
            type="url"
            name="enlaceGanadores"
            value={formData.enlaceGanadores}
            onChange={handleChange}
            placeholder="https://prociencia.gob.pe/ganadores-2024..."
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
          label="Evidencias del Proyecto (Convenio de Financiamiento, Contrato o Resolución de Ganador)"
        />
      </div>

      <div className="flex justify-end pt-2">
        <button type="submit" disabled={loading} className="btn-primary min-w-[200px]">
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Guardando proyecto...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" /> Registrar Proyecto Concursable
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default FormProyecto;
