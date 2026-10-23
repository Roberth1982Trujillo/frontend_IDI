import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { useToast } from '../../context/ToastContext';
import {
  Edit3,
  Trash2,
  RotateCcw,
  Save,
  X,
  Loader2,
  Calendar,
  User,
  Clock,
  ExternalLink,
} from 'lucide-react';
import useEscapeKey from '../../hooks/useEscapeKey';

const CorreccionModal = ({ isOpen, onClose, onSuccess, produccion }) => {
  useEscapeKey(onClose, isOpen);

  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    titulo: '',
    sublineaInvestigacion: '',
    revista: '',
    editorial: '',
    numeroSolicitud: '',
  });

  useEffect(() => {
    if (produccion) {
      setFormData({
        titulo: produccion.titulo || '',
        sublineaInvestigacion: produccion.sublineaInvestigacion || '',
        revista: produccion.revista || '',
        editorial: produccion.editorial || '',
        numeroSolicitud: produccion.numeroSolicitud || '',
      });
    }
  }, [produccion]);

  if (!isOpen || !produccion) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axiosClient.put(`/producciones/${produccion.id}`, formData);
      success('Producción actualizada con trazabilidad de auditoría (RN-10).');
      if (onSuccess) onSuccess();
      onClose();
    } catch {
      error('Error al actualizar la producción.');
    } finally {
      setLoading(false);
    }
  };

  const handleSoftDelete = async () => {
    setLoading(true);
    try {
      await axiosClient.delete(`/producciones/${produccion.id}`);
      success('Registro retirado lógicamente (activo = false).');
      if (onSuccess) onSuccess();
      onClose();
    } catch {
      error('Error al retirar la producción.');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    setLoading(true);
    try {
      await axiosClient.post(`/producciones/${produccion.id}/recuperar`);
      success('Registro reactivado exitosamente (activo = true).');
      if (onSuccess) onSuccess();
      onClose();
    } catch {
      error('Error al reactivar la producción.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] shadow-2xl border border-slate-100 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-unt-light text-unt-blue flex items-center justify-center">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Supervisión y Corrección</h3>
              <p className="text-xs text-slate-500">
                Docente: {produccion.docente?.nombres} {produccion.docente?.apellidos} (DNI: {produccion.docente?.dni})
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleUpdate} className="p-6 space-y-4 overflow-y-auto">
          {/* Título */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Título de la Producción <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="titulo"
              value={formData.titulo}
              onChange={handleChange}
              required
              className="input-unt text-xs"
            />
          </div>

          {/* Sublínea */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Sublínea de Investigación
            </label>
            <input
              type="text"
              name="sublineaInvestigacion"
              value={formData.sublineaInvestigacion}
              onChange={handleChange}
              className="input-unt text-xs"
            />
          </div>

          {/* Evidencias adjuntas */}
          {produccion.evidencias?.length > 0 && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="block text-xs font-bold text-slate-700 mb-2">
                Evidencias Documentales Asociadas ({produccion.evidencias.length})
              </span>
              <div className="space-y-1.5">
                {produccion.evidencias.map((ev, i) => (
                  <a
                    key={i}
                    href={ev.enlaceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-unt-blue hover:underline flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>{ev.nombreOriginal || 'Enlace de evidencia'}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Registro de Auditoría (RN-10) */}
          <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 space-y-1">
            <span className="font-bold flex items-center gap-1.5 text-amber-800">
              <Clock className="w-3.5 h-3.5" /> Trazabilidad de Auditoría (RN-10)
            </span>
            <div className="flex flex-wrap gap-4 text-[11px] text-amber-800/90 pt-1">
              <div>
                Estado: <strong>{produccion.activo !== false ? 'Activo' : 'Retirado Lógicamente'}</strong>
              </div>
              {produccion.usuarioModificacion && (
                <div>
                  Última modificación por: <strong>{produccion.usuarioModificacion}</strong>
                </div>
              )}
              {produccion.fechaModificacion && (
                <div>
                  Fecha: <strong>{new Date(produccion.fechaModificacion).toLocaleString()}</strong>
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
            <div>
              {produccion.activo !== false ? (
                <button
                  type="button"
                  onClick={handleSoftDelete}
                  disabled={loading}
                  className="btn-danger text-xs py-2"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Borrado Lógico
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleRestore}
                  disabled={loading}
                  className="btn-secondary text-xs py-2 text-emerald-700 hover:bg-emerald-50 border-emerald-300"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-emerald-600" /> Reactivar Registro
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button type="button" onClick={onClose} className="btn-secondary text-xs py-2">
                Cancelar
              </button>
              <button type="submit" disabled={loading} className="btn-primary text-xs py-2">
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Guardar Corrección
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CorreccionModal;
