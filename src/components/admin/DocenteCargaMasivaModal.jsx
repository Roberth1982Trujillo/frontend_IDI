import React, { useState } from 'react';
import axiosClient from '../../api/axiosClient';
import { useToast } from '../../context/ToastContext';
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  AlertCircle,
  CheckCircle2,
  X,
  Loader2,
  FileText,
} from 'lucide-react';
import useEscapeKey from '../../hooks/useEscapeKey';

const DocenteCargaMasivaModal = ({ isOpen, onClose, onSuccess }) => {
  useEscapeKey(onClose, isOpen);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [result, setResult] = useState(null);
  const { success, error } = useToast();

  if (!isOpen) return null;

  const handleDownloadTemplate = async () => {
    setDownloading(true);
    try {
      const res = await axiosClient.get('/docentes/plantilla-excel', {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'plantilla_docentes_unt.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      success('Plantilla oficial de docentes descargada.');
    } catch {
      error('Error al descargar la plantilla Excel.');
    } finally {
      setDownloading(false);
    }
  };

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      error('Seleccione un archivo Excel (.xlsx)');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('archivo', file);

      const res = await axiosClient.post('/docentes/carga-masiva', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setResult(res.data);
      success(
        `Procesamiento completado: ${res.data.procesadosExitosos || 0} docentes importados correctamente.`
      );
      if (onSuccess) onSuccess();
    } catch (err) {
      error(err.response?.data?.message || 'Error al procesar el archivo Excel.');
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
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Carga Masiva del Padrón Docente</h3>
              <p className="text-xs text-slate-500">Importación mediante archivo Excel oficial (.xlsx)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Download template banner */}
          <div className="bg-unt-light/50 border border-unt-blue/20 rounded-xl p-4 flex items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-unt-dark block">Plantilla Oficial UNT</span>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Descargue el formato con las columnas y catálogos estandarizados para asegurar la carga sin errores.
              </p>
            </div>
            <button
              type="button"
              onClick={handleDownloadTemplate}
              disabled={downloading}
              className="btn-outline-unt text-xs py-2 shrink-0"
            >
              {downloading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              Descargar Plantilla
            </button>
          </div>

          {/* Upload Zone */}
          <label className="border-2 border-dashed border-slate-300 hover:border-emerald-600 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer bg-slate-50/50 hover:bg-emerald-50/20 transition-all group">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
            />
            <UploadCloud className="w-10 h-10 text-slate-400 group-hover:text-emerald-600 transition-colors mb-2" />
            <span className="text-sm font-semibold text-slate-700 group-hover:text-emerald-700">
              {file ? file.name : 'Haga clic para seleccionar o arrastre el archivo .xlsx'}
            </span>
            <span className="text-xs text-slate-400 mt-1">Formato compatible: Microsoft Excel (.xlsx)</span>
          </label>

          {/* Results Summary if uploaded */}
          {result && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-emerald-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Filas exitosas: {result.procesadosExitosos || 0}
                </span>
                <span className="text-rose-600 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" /> Errores detectados: {result.errores?.length || 0}
                </span>
              </div>

              {result.errores?.length > 0 && (
                <div className="max-h-40 overflow-y-auto space-y-1.5 pt-2 border-t border-slate-200">
                  {result.errores.map((err, i) => (
                    <div
                      key={i}
                      className="text-[11px] p-2 rounded bg-rose-50 text-rose-800 border border-rose-200 flex items-start gap-2"
                    >
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>{err}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
          <button onClick={onClose} className="btn-secondary text-xs py-2">
            Cerrar
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className="btn-primary text-xs py-2 bg-emerald-600 hover:bg-emerald-700 border-none"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Procesando importación...
              </>
            ) : (
              <>
                <FileSpreadsheet className="w-3.5 h-3.5" /> Procesar Carga Masiva
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocenteCargaMasivaModal;
