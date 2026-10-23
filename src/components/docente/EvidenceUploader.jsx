import React, { useState } from 'react';
import { UploadCloud, Link as LinkIcon, FileText, Trash2, Plus, Loader2, CheckCircle2 } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { useToast } from '../../context/ToastContext';

const EvidenceUploader = ({ evidencias, onChange, min = 2, max = 3, label = 'Evidencias documentales' }) => {
  const [uploading, setUploading] = useState(false);
  const [directLink, setDirectLink] = useState('');
  const [linkTitle, setLinkTitle] = useState('');
  const { success, error } = useToast();

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (evidencias.length + files.length > max) {
      error(`No puedes adjuntar más de ${max} evidencias en total.`);
      return;
    }

    setUploading(true);
    try {
      const newEvidencias = [...evidencias];
      for (const file of files) {
        const formData = new FormData();
        formData.append('archivo', file);
        formData.append('file', file);
        formData.append('carpeta', 'evidencias');
        formData.append('categoria', 'evidencias');

        const res = await axiosClient.post('/archivos/subir', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        const url = res.data.enlaceUrl || res.data.urlDescarga;

        newEvidencias.push({
          nombreOriginal: file.name,
          enlaceUrl: url,
          tamanioBytes: file.size,
          mimeType: file.type || 'application/pdf',
          tipo: 'ARCHIVO',
        });
      }

      onChange(newEvidencias);
      success(`${files.length} evidencia(s) cargada(s) con éxito.`);
    } catch (err) {
      error('Error al subir archivo de evidencia. Intente nuevamente.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleAddLink = () => {
    if (!directLink.trim()) {
      error('Ingrese un enlace URL válido');
      return;
    }
    if (evidencias.length >= max) {
      error(`Límite máximo alcanzado (${max} evidencias).`);
      return;
    }

    const item = {
      nombreOriginal: linkTitle.trim() || 'Enlace a evidencia digital',
      enlaceUrl: directLink.trim(),
      mimeType: 'text/uri-list',
      tipo: 'ENLACE',
    };

    onChange([...evidencias, item]);
    setDirectLink('');
    setLinkTitle('');
    success('Enlace de evidencia agregado.');
  };

  const handleRemove = (index) => {
    const updated = evidencias.filter((_, i) => i !== index);
    onChange(updated);
  };

  const isCompliant = evidencias.length >= min && evidencias.length <= max;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-sm font-semibold text-slate-800">
            {label} <span className="text-rose-500">*</span>
          </label>
          <p className="text-xs text-slate-500 mt-0.5">
            Adjunte entre {min} y {max} evidencias (documento PDF, constancia o enlace institucional en Google Drive/OneDrive).
          </p>
        </div>
        <span
          className={`badge-unt text-xs font-semibold ${
            isCompliant
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              : 'bg-amber-100 text-amber-800 border border-amber-300'
          }`}
        >
          {evidencias.length} de {max} (Mín. {min})
        </span>
      </div>

      {/* Upload Zone & Link Input */}
      {evidencias.length < max && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* File Upload Box */}
          <label className="border-2 border-dashed border-slate-300 hover:border-unt-blue rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer bg-slate-50/60 hover:bg-unt-light/30 transition-all group">
            <input
              type="file"
              multiple
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
              accept=".pdf,.docx,.doc,.zip,.jpg,.png"
            />
            {uploading ? (
              <div className="flex flex-col items-center py-2">
                <Loader2 className="w-6 h-6 text-unt-blue animate-spin mb-1.5" />
                <span className="text-xs font-medium text-unt-blue">Subiendo archivo...</span>
              </div>
            ) : (
              <>
                <UploadCloud className="w-7 h-7 text-slate-400 group-hover:text-unt-blue transition-colors mb-1.5" />
                <span className="text-xs font-semibold text-slate-700 group-hover:text-unt-blue">
                  Subir archivo local
                </span>
                <span className="text-[11px] text-slate-400 mt-0.5">PDF, Word, Imágenes (hasta 25MB)</span>
              </>
            )}
          </label>

          {/* Direct External Link */}
          <div className="border border-slate-200 rounded-xl p-3 bg-white flex flex-col justify-between shadow-xs">
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Título de la evidencia (opcional)"
                value={linkTitle}
                onChange={(e) => setLinkTitle(e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 rounded-md border border-slate-200 focus:outline-none focus:ring-1 focus:ring-unt-blue"
              />
              <input
                type="url"
                placeholder="https://drive.google.com/..."
                value={directLink}
                onChange={(e) => setDirectLink(e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 rounded-md border border-slate-200 focus:outline-none focus:ring-1 focus:ring-unt-blue"
              />
            </div>
            <button
              type="button"
              onClick={handleAddLink}
              disabled={!directLink.trim()}
              className="mt-2 w-full btn-outline-unt text-xs py-1.5 justify-center"
            >
              <Plus className="w-3.5 h-3.5" /> Agregar Enlace Web
            </button>
          </div>
        </div>
      )}

      {/* Evidences List */}
      {evidencias.length > 0 && (
        <div className="space-y-2">
          {evidencias.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-white shadow-xs"
            >
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-lg bg-unt-light text-unt-blue flex items-center justify-center shrink-0">
                  {item.tipo === 'ARCHIVO' ? (
                    <FileText className="w-4 h-4" />
                  ) : (
                    <LinkIcon className="w-4 h-4" />
                  )}
                </div>
                <div className="overflow-hidden">
                  <div className="text-xs font-semibold text-slate-800 truncate">
                    {item.nombreOriginal || 'Evidencia adjunta'}
                  </div>
                  <a
                    href={item.enlaceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-unt-blue hover:underline truncate block"
                  >
                    {item.enlaceUrl}
                  </a>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleRemove(idx)}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors shrink-0"
                title="Eliminar evidencia"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EvidenceUploader;
