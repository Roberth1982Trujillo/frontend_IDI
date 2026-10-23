import React, { useState } from 'react';
import axiosClient from '../../api/axiosClient';
import { useToast } from '../../context/ToastContext';
import { Download, FileSpreadsheet, FileText, X, Loader2 } from 'lucide-react';
import useEscapeKey from '../../hooks/useEscapeKey';

const ExportModal = ({ isOpen, onClose, filtroActual }) => {
  useEscapeKey(onClose, isOpen);

  const { success, error } = useToast();
  const [formato, setFormato] = useState('excel'); // 'excel' | 'pdf'
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleExport = async () => {
    setLoading(true);
    try {
      const endpoint = formato === 'excel' ? '/reportes/exportar/excel' : '/reportes/exportar/pdf';
      const extension = formato === 'excel' ? 'xlsx' : 'pdf';
      const filename = `reporte_idi_unt_${Date.now()}.${extension}`;

      const res = await axiosClient.post(endpoint, filtroActual || {}, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();

      success(`Reporte institucional en ${formato.toUpperCase()} descargado exitosamente.`);
      onClose();
    } catch {
      error(`Error al generar el reporte en formato ${formato.toUpperCase()}.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-unt-light text-unt-blue flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Exportar Reporte Oficial</h3>
              <p className="text-[11px] text-slate-500">Seleccione el formato de salida deseado</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Formats Grid */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {/* Excel */}
            <div
              onClick={() => setFormato('excel')}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center text-center ${
                formato === 'excel'
                  ? 'border-emerald-600 bg-emerald-50/50 text-emerald-900 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
              }`}
            >
              <FileSpreadsheet className="w-8 h-8 text-emerald-600 mb-2" />
              <span className="text-xs font-bold block">Excel (.xlsx)</span>
              <span className="text-[10px] text-slate-500 mt-0.5">Hoja de cálculo analítica</span>
            </div>

            {/* PDF */}
            <div
              onClick={() => setFormato('pdf')}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center text-center ${
                formato === 'pdf'
                  ? 'border-rose-600 bg-rose-50/50 text-rose-900 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
              }`}
            >
              <FileText className="w-8 h-8 text-rose-600 mb-2" />
              <span className="text-xs font-bold block">PDF Ejecutivo</span>
              <span className="text-[10px] text-slate-500 mt-0.5">Documento con membrete UNT</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 text-center leading-relaxed">
            El archivo se generará en vivo aplicando los 16 filtros actualmente activos en el tablero analítico.
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
          <button onClick={onClose} className="btn-secondary text-xs py-2">
            Cancelar
          </button>
          <button onClick={handleExport} disabled={loading} className="btn-primary text-xs py-2">
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Generando archivo...
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" /> Descargar {formato.toUpperCase()}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
