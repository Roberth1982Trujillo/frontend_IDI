import React, { useState } from 'react';
import axiosClient from '../../api/axiosClient';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import EvidenceUploader from './EvidenceUploader';
import ColaboradoresField from './ColaboradoresField';
import SearchableSelect from '../common/SearchableSelect';
import { Save, Loader2, CheckCircle } from 'lucide-react';

const formatOdsNombre = (o) => {
  if (!o) return '';
  const nom = o.nombre || '';
  if (/^ODS\s*\d+\s*:/i.test(nom)) return nom;
  return o.numero ? `ODS ${o.numero}: ${nom}` : nom;
};

const FormEvaluacion = ({ catalogos, onSuccess }) => {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);
  const [evidencias, setEvidencias] = useState([]);
  const [colaboradoresUnt, setColaboradoresUnt] = useState([]);
  const [colaboradoresExternos, setColaboradoresExternos] = useState('');

  const [formData, setFormData] = useState({
    tituloEvento: '',
    anioConvocatoria: new Date().getFullYear(),
    agenciaFinanciamiento: 'PROCIENCIA',
    agenciaDetalle: '',
    tipoProyecto: 'BASICA',
    montoGanador: 'MAYOR_A_200000',
    nombreConvocatoria: '',
    constanciaEvaluador: true,
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

    if (!formData.tituloEvento.trim() || !formData.nombreConvocatoria.trim()) {
      error('Complete el título del evento evaluado y el nombre de la convocatoria.');
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
        titulo: formData.tituloEvento.trim(),
        tituloEvento: formData.tituloEvento.trim(),
        anioConvocatoria: parseInt(formData.anioConvocatoria, 10),
        agenciaFinanciamiento: formData.agenciaFinanciamiento,
        agenciaDetalle: formData.agenciaDetalle.trim(),
        tipoProyecto: formData.tipoProyecto,
        montoGanador: formData.montoGanador,
        nombreConvocatoria: formData.nombreConvocatoria.trim(),
        constanciaEvaluador: formData.constanciaEvaluador,
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

      await axiosClient.post(`/producciones/evaluaciones?${params.toString()}`, payload);

      success('¡Evaluación de proyectos registrada exitosamente!');
      setFormData({
        tituloEvento: '',
        anioConvocatoria: new Date().getFullYear(),
        agenciaFinanciamiento: 'PROCIENCIA',
        agenciaDetalle: '',
        tipoProyecto: 'BASICA',
        montoGanador: 'MAYOR_A_200000',
        nombreConvocatoria: '',
        constanciaEvaluador: true,
        lineaUntId: '',
        odsId: '',
        sublineaInvestigacion: '',
      });
      setEvidencias([]);
      setColaboradoresUnt([]);
      setColaboradoresExternos('');
      if (onSuccess) onSuccess();
    } catch (err) {
      error(err.response?.data?.message || 'Error al registrar la evaluación de proyectos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-unt-light/40 border border-unt-blue/15 rounded-xl p-4 flex items-center gap-3">
        <CheckCircle className="w-5 h-5 text-unt-blue shrink-0" />
        <div className="text-xs text-unt-dark">
          <strong>Evaluación de Proyectos:</strong> Desempeño como evaluador externo, jurado o revisor de
          proyectos de investigación en fondos concursables reconocidos.
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Título Evento */}
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Título del Evento / Concurso Evaluado <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="tituloEvento"
            value={formData.tituloEvento}
            onChange={handleChange}
            required
            placeholder="Ej. Evaluación de Becas de Posgrado y Proyectos Especiales 2024"
            className="input-unt text-sm"
          />
        </div>

        {/* Nombre Convocatoria */}
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Nombre de la Convocatoria Oficial <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="nombreConvocatoria"
            value={formData.nombreConvocatoria}
            onChange={handleChange}
            required
            placeholder="Ej. Convocatoria Anual de Investigadores Concytec"
            className="input-unt text-sm"
          />
        </div>

        {/* Agencia */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Agencia / Entidad Organizadora <span className="text-rose-500">*</span>
          </label>
          <select
            name="agenciaFinanciamiento"
            value={formData.agenciaFinanciamiento}
            onChange={handleChange}
            className="input-unt text-sm"
          >
            <option value="PROCIENCIA">PROCIENCIA (CONCYTEC)</option>
            <option value="PROINNOVATE">PROINNÓVATE</option>
            <option value="UNT_CANON">UNT (Comisión Central de Investigación)</option>
            <option value="FONDO_EXTRANJERO">Fondo Extranjero</option>
            <option value="OTRO">Otra Entidad</option>
          </select>
        </div>

        {/* Tipo Proyecto */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Área / Tipo de Proyectos Evaluados <span className="text-rose-500">*</span>
          </label>
          <select
            name="tipoProyecto"
            value={formData.tipoProyecto}
            onChange={handleChange}
            className="input-unt text-sm"
          >
            <option value="BASICA">Investigación Básica</option>
            <option value="APLICADA">Investigación Aplicada</option>
            <option value="DESARROLLO_TECNOLOGICO">Desarrollo Tecnológico</option>
            <option value="CIENCIAS_SOCIALES">Ciencias Sociales</option>
            <option value="OTRO">Otro Tipo</option>
          </select>
        </div>

        {/* Monto de Proyectos Evaluados */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Rango de Monto de Proyectos Evaluados <span className="text-rose-500">*</span>
          </label>
          <select
            name="montoGanador"
            value={formData.montoGanador}
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
            Año de la Evaluación <span className="text-rose-500">*</span>
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

        {/* Checkbox constancia */}
        <div className="md:col-span-2 flex items-center gap-2 py-2">
          <input
            type="checkbox"
            id="constanciaEvaluador"
            name="constanciaEvaluador"
            checked={formData.constanciaEvaluador}
            onChange={handleChange}
            className="w-4 h-4 rounded text-unt-blue focus:ring-unt-blue"
          />
          <label htmlFor="constanciaEvaluador" className="text-xs font-medium text-slate-700">
            Cuento con certificado o constancia oficial de evaluador emitida por la entidad
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
          label="Evidencias de la Evaluación (Constancia de Evaluador, Oficio de Designación o Carta de Agradecimiento)"
        />
      </div>

      <div className="flex justify-end pt-2">
        <button type="submit" disabled={loading} className="btn-primary min-w-[200px]">
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Guardando evaluación...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" /> Registrar Evaluación de Proyectos
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default FormEvaluacion;
