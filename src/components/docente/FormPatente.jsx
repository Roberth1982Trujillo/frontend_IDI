import React, { useState } from 'react';
import axiosClient from '../../api/axiosClient';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import EvidenceUploader from './EvidenceUploader';
import ColaboradoresField from './ColaboradoresField';
import SearchableSelect from '../common/SearchableSelect';
import { Save, Loader2, Award } from 'lucide-react';

const formatOdsNombre = (o) => {
  if (!o) return '';
  const nom = o.nombre || '';
  if (/^ODS\s*\d+\s*:/i.test(nom)) return nom;
  return o.numero ? `ODS ${o.numero}: ${nom}` : nom;
};

const FormPatente = ({ catalogos, onSuccess }) => {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);
  const [evidencias, setEvidencias] = useState([]);
  const [colaboradoresUnt, setColaboradoresUnt] = useState([]);
  const [colaboradoresExternos, setColaboradoresExternos] = useState('');

  const [formData, setFormData] = useState({
    titulo: '',
    numeroSolicitud: '',
    anioSolicitud: new Date().getFullYear(),
    agente: 'A_TRAVES_DE_UNT',
    estado: 'EN_PROCESO',
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

    if (!formData.titulo.trim() || !formData.numeroSolicitud.trim()) {
      error('Complete el título y número de solicitud de patente.');
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
        numeroSolicitud: formData.numeroSolicitud.trim(),
        anioSolicitud: parseInt(formData.anioSolicitud, 10),
        agente: formData.agente,
        estado: formData.estado,
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

      await axiosClient.post(`/producciones/patentes?${params.toString()}`, payload);

      success('¡Solicitud de patente registrada exitosamente!');
      setFormData({
        titulo: '',
        numeroSolicitud: '',
        anioSolicitud: new Date().getFullYear(),
        agente: 'A_TRAVES_DE_UNT',
        estado: 'EN_PROCESO',
        lineaUntId: '',
        odsId: '',
        sublineaInvestigacion: '',
      });
      setEvidencias([]);
      setColaboradoresUnt([]);
      setColaboradoresExternos('');
      if (onSuccess) onSuccess();
    } catch (err) {
      error(err.response?.data?.message || 'Error al registrar la solicitud de patente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-unt-light/40 border border-unt-blue/15 rounded-xl p-4 flex items-center gap-3">
        <Award className="w-5 h-5 text-unt-blue shrink-0" />
        <div className="text-xs text-unt-dark">
          <strong>Propiedad Intelectual:</strong> Declare las solicitudes de patente o modelos de utilidad
          tramitados ante INDECOPI, ya sea a través de la UNT o de manera individual.
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Título */}
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Denominación / Título de la Invención <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="titulo"
            value={formData.titulo}
            onChange={handleChange}
            required
            placeholder="Ej. Dispositivo de filtración por membranas bioactivas..."
            className="input-unt text-sm"
          />
        </div>

        {/* Nro Solicitud */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            N° de Expediente / Solicitud INDECOPI <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="numeroSolicitud"
            value={formData.numeroSolicitud}
            onChange={handleChange}
            required
            placeholder="Ej. EXP-2024-00123"
            className="input-unt text-sm"
          />
        </div>

        {/* Año */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Año de Presentación <span className="text-rose-500">*</span>
          </label>
          <input
            type="number"
            name="anioSolicitud"
            value={formData.anioSolicitud}
            onChange={handleChange}
            required
            className="input-unt text-sm"
          />
        </div>

        {/* Agente */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Vía de Gestión <span className="text-rose-500">*</span>
          </label>
          <select
            name="agente"
            value={formData.agente}
            onChange={handleChange}
            className="input-unt text-sm"
          >
            <option value="A_TRAVES_DE_UNT">A través de la UNT (Titular Institucional)</option>
            <option value="INDIVIDUAL">Individual / Particular</option>
          </select>
        </div>

        {/* Estado */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Estado de la Solicitud <span className="text-rose-500">*</span>
          </label>
          <select
            name="estado"
            value={formData.estado}
            onChange={handleChange}
            className="input-unt text-sm"
          >
            <option value="EN_PROCESO">En Trámite / Proceso de Examen</option>
            <option value="CONCEDIDA">Concedida / Título Otorgado</option>
            <option value="DENEGADA">Denegada / Abandonada</option>
          </select>
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
            Sublínea / Área Tecnológica (Opcional)
          </label>
          <input
            type="text"
            name="sublineaInvestigacion"
            value={formData.sublineaInvestigacion}
            onChange={handleChange}
            placeholder="Ej. Biotecnología y procesos de purificación"
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
          label="Evidencias de la Solicitud (Constancia de Presentación / Cargo INDECOPI)"
        />
      </div>

      <div className="flex justify-end pt-2">
        <button type="submit" disabled={loading} className="btn-primary min-w-[200px]">
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Guardando patente...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" /> Registrar Solicitud de Patente
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default FormPatente;
