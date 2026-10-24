import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  UserCheck,
  Search,
  Award,
  BookOpen,
  Calendar,
  Building,
  GraduationCap,
  ExternalLink,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';
import { resolveFileUrl } from '../../utils/urlHelper';

const FichaInvestigadorView = () => {
  const { error } = useToast();
  const [dniBusqueda, setDniBusqueda] = useState('12345678');
  const [fichaData, setFichaData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchFicha = async (dni = dniBusqueda) => {
    if (!dni || dni.length < 8) return;
    setLoading(true);
    try {
      const res = await axiosClient.get(`/reportes/investigador/${dni.trim()}`);
      setFichaData(res.data);
    } catch {
      error('Investigador no encontrado con el DNI indicado.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFicha('12345678');
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchFicha(dniBusqueda);
  };

  const docente = fichaData?.docente;
  const producciones = fichaData?.producciones || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-unt-blue" /> Ficha 360° del Investigador
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Perfil integral, categorización académica e histórico de producción científica (CU-16)
          </p>
        </div>

        {/* Quick DNI Search Bar */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            placeholder="DNI del docente..."
            value={dniBusqueda}
            maxLength={8}
            onChange={(e) => setDniBusqueda(e.target.value.replace(/\D/g, ''))}
            className="input-unt text-xs py-2 w-48 font-mono"
          />
          <button type="submit" disabled={loading} className="btn-primary text-xs py-2 px-3">
            <Search className="w-3.5 h-3.5" /> Buscar
          </button>
        </form>
      </div>

      {loading ? (
        <LoadingSpinner message="Consultando Ficha 360° del investigador..." />
      ) : docente ? (
        <>
          {/* Researcher Profile Header (Figma 3-49045) */}
          <div className="card-unt p-6 bg-gradient-to-r from-unt-blue to-unt-dark text-white relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center font-black text-2xl text-unt-gold shadow-inner">
                  {docente.nombres?.[0] || 'D'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-unt-gold tracking-wider uppercase">
                      Docente Ordinario UNT
                    </span>
                    <span className="badge-unt bg-white/15 text-white text-[10px]">
                      DNI: {docente.dni}
                    </span>
                  </div>
                  <h2 className="text-xl font-extrabold mt-0.5">
                    {docente.nombres} {docente.apellidos}
                  </h2>
                  <p className="text-xs text-white/80 mt-1">
                    {docente.facultad?.nombre || 'Facultad de Ingeniería'} •{' '}
                    {docente.escuela?.nombre || 'Escuela Profesional'}
                  </p>
                </div>
              </div>

              {/* Status badges */}
              <div className="flex flex-wrap md:flex-col items-start md:items-end gap-2 text-xs">
                <span className="badge-unt bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  <CheckCircle className="w-3.5 h-3.5" /> Vigencia: {docente.vigencia || 'ACTIVO'}
                </span>
                <span className="badge-unt bg-unt-goldLight text-unt-dark font-bold">
                  RENACYT: {docente.nivelRenacyt || 'Nivel I'}
                </span>
                <span className="badge-unt bg-white/10 text-white">
                  {docente.categoria || 'Principal'} - {docente.condicion || 'Nombrado'}
                </span>
              </div>
            </div>
          </div>

          {/* 7 Metric Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {[
              { label: 'Artículos', key: 'articulos', color: 'text-blue-600', val: producciones.filter(p => p.tipoProduccion === 'ARTICULO_CIENTIFICO').length },
              { label: 'Patentes', key: 'patentes', color: 'text-amber-600', val: producciones.filter(p => p.tipoProduccion === 'SOLICITUD_PATENTE').length },
              { label: 'Libros Inv.', key: 'librosInv', color: 'text-emerald-600', val: producciones.filter(p => p.tipoProduccion === 'LIBRO_INVESTIGACION').length },
              { label: 'Libros Acad.', key: 'librosAcad', color: 'text-purple-600', val: producciones.filter(p => p.tipoProduccion === 'LIBRO_ACADEMICO').length },
              { label: 'Ponencias', key: 'ponencias', color: 'text-rose-600', val: producciones.filter(p => p.tipoProduccion === 'PONENCIA_EVENTO').length },
              { label: 'Proyectos', key: 'proyectos', color: 'text-cyan-600', val: producciones.filter(p => p.tipoProduccion === 'PROYECTO_CONCURSABLE').length },
              { label: 'Evaluaciones', key: 'evaluaciones', color: 'text-slate-700', val: producciones.filter(p => p.tipoProduccion === 'EVALUACION_PROYECTO').length },
            ].map((m, i) => (
              <div key={i} className="card-unt p-3.5 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block truncate">
                  {m.label}
                </span>
                <span className={`text-xl font-extrabold block mt-1 ${m.color}`}>{m.val}</span>
              </div>
            ))}
          </div>

          {/* Historical Productions Table */}
          <div className="card-unt p-0 overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">
                Historial de Trabajos Declarados ({producciones.length})
              </span>
              <span className="text-[11px] text-slate-500">Trazabilidad completa</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4">Tipo & Año</th>
                    <th className="py-2.5 px-4">Rol</th>
                    <th className="py-2.5 px-4">Título & Equipo</th>
                    <th className="py-2.5 px-4">Línea UNT</th>
                    <th className="py-2.5 px-4">Evidencias</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {producciones.map((p) => {
                    const isPrincipal = p.docente?.dni === docente.dni;
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="badge-unt bg-unt-light text-unt-blue text-[10px]">
                            {p.tipoProduccion?.replace(/_/g, ' ')}
                          </span>
                          <div className="text-[11px] text-slate-400 mt-0.5">Año: {p.anio}</div>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          {isPrincipal ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Autor Principal
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                              Coautor
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-900 max-w-md">
                          <div>{p.titulo}</div>
                          {(p.colaboradoresUnt?.length > 0 || p.colaboradoresExternos) && (
                            <div className="text-[10px] font-normal text-slate-500 mt-1 flex flex-wrap items-center gap-1">
                              <span className="font-semibold text-slate-600">Equipo:</span>
                              {!isPrincipal && p.docente && (
                                <span className="text-slate-700 font-medium bg-slate-100 px-1 rounded">
                                  {p.docente.apellidosNombres || `${p.docente.nombres || ''} ${p.docente.apellidos || ''}`.trim()} (Principal)
                                </span>
                              )}
                              {p.colaboradoresUnt?.map((c) => (
                                <span key={c.dni || c.id} className="bg-slate-100 text-slate-600 px-1 rounded">
                                  {c.apellidosNombres || `${c.nombres || ''} ${c.apellidos || ''}`.trim()}
                                </span>
                              ))}
                              {p.colaboradoresExternos && (
                                <span className="italic text-slate-500">[Ext: {p.colaboradoresExternos}]</span>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                          {p.lineaInvestigacion?.nombre || 'Línea UNT'}
                        </td>
                        <td className="py-3 px-4">
                          {p.evidencias?.length > 0 ? (
                            <div className="flex flex-col gap-1">
                              {p.evidencias.map((ev, i) => (
                                <a
                                  key={i}
                                  href={resolveFileUrl(ev.enlaceUrl)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[11px] text-unt-blue hover:underline flex items-center gap-1 truncate max-w-[150px]"
                                >
                                  <ExternalLink className="w-3 h-3 shrink-0" />
                                  <span className="truncate">{ev.nombreOriginal || 'Enlace'}</span>
                                </a>
                              ))}
                            </div>
                          ) : (
                            <span className="text-slate-400">Sin evidencias</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="card-unt text-center p-12">
          <p className="text-xs text-slate-500">Ingrese un DNI válido para ver la Ficha 360°</p>
        </div>
      )}
    </div>
  );
};

export default FichaInvestigadorView;
