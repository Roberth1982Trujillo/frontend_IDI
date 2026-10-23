import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axiosClient from '../../api/axiosClient';
import {
  FileText,
  Award,
  BookMarked,
  GraduationCap,
  Presentation,
  Coins,
  CheckCircle,
  PlusCircle,
  ListOrdered,
  Sparkles,
  X,
  ExternalLink,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import FormArticulo from '../../components/docente/FormArticulo';
import FormPatente from '../../components/docente/FormPatente';
import FormLibroInv from '../../components/docente/FormLibroInv';
import FormLibroAcad from '../../components/docente/FormLibroAcad';
import FormPonencia from '../../components/docente/FormPonencia';
import FormProyecto from '../../components/docente/FormProyecto';
import FormEvaluacion from '../../components/docente/FormEvaluacion';
import useEscapeKey from '../../hooks/useEscapeKey';

const DocenteDashboardView = () => {
  const { user } = useAuth();
  const [catalogos, setCatalogos] = useState(null);
  const [activeModal, setActiveModal] = useState(null);
  const [totalRegistros, setTotalRegistros] = useState(0);

  useEscapeKey(() => setActiveModal(null), !!activeModal);

  useEffect(() => {
    // Load catalogs bundle once
    axiosClient.get('/catalogos/todos').then((res) => {
      const data = res.data;
      if (data) {
        data.lineas = data.lineasUnt || data.lineas || [];
        data.lineasUnt = data.lineasUnt || data.lineas || [];
      }
      setCatalogos(data);
    }).catch(() => {});

    // Load own count
    if (user?.dni) {
      axiosClient.get(`/producciones/mis-registros/${user.dni}`).then((res) => {
        setTotalRegistros(res.data?.length || 0);
      }).catch(() => {});
    }
  }, [user]);

  const produccionesConfig = [
    {
      id: 'articulo',
      titulo: 'Artículo Científico',
      subtitulo: 'Indizado en SciELO, Scopus, WoS u Otro',
      icono: FileText,
      color: 'from-blue-600 to-indigo-700',
      tag: 'SciELO / Scopus / WoS / Otro',
      component: FormArticulo,
    },
    {
      id: 'patente',
      titulo: 'Solicitud de Patente',
      subtitulo: 'Trámite INDECOPI (Invención o Utilidad)',
      icono: Award,
      color: 'from-amber-500 to-orange-600',
      tag: 'INDECOPI',
      component: FormPatente,
    },
    {
      id: 'libro_inv',
      titulo: 'Libro de Investigación',
      subtitulo: 'Obra con arbitraje y pares externos',
      icono: BookMarked,
      color: 'from-emerald-600 to-teal-700',
      tag: 'Con arbitraje',
      component: FormLibroInv,
    },
    {
      id: 'libro_acad',
      titulo: 'Libro Académico',
      subtitulo: 'Texto de docencia universitaria',
      icono: GraduationCap,
      color: 'from-purple-600 to-violet-700',
      tag: 'Docencia UNT',
      component: FormLibroAcad,
    },
    {
      id: 'ponencia',
      titulo: 'Ponencia Científica',
      subtitulo: 'Congresos y simposios internacionales',
      icono: Presentation,
      color: 'from-rose-500 to-pink-600',
      tag: 'Actas / Eventos',
      component: FormPonencia,
    },
    {
      id: 'proyecto',
      titulo: 'Proyecto Concursable',
      subtitulo: 'Fondos Prociencia, Canon o Extranjeros',
      icono: Coins,
      color: 'from-cyan-600 to-blue-700',
      tag: 'Fondos ganados',
      component: FormProyecto,
    },
    {
      id: 'evaluacion',
      titulo: 'Evaluación de Proyectos',
      subtitulo: 'Desempeño como evaluador o jurado',
      icono: CheckCircle,
      color: 'from-slate-700 to-slate-900',
      tag: 'Evaluador externo',
      component: FormEvaluacion,
    },
  ];

  const handleModalClose = () => {
    setActiveModal(null);
    if (user?.dni) {
      axiosClient.get(`/producciones/mis-registros/${user.dni}`).then((res) => {
        setTotalRegistros(res.data?.length || 0);
      });
    }
  };

  const currentConfig = produccionesConfig.find((p) => p.id === activeModal);
  const ActiveFormComponent = currentConfig?.component;

  return (
    <div className="space-y-6">
      {/* Header Welcome Card */}
      <div className="card-unt bg-gradient-to-r from-unt-blue via-unt-dark to-slate-900 text-white relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-unt-gold mb-1">
              <Sparkles className="w-4 h-4" /> Cuestionario Oficial de I+D+i
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              Bienvenido(a), {user?.nombres} {user?.apellidos}
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Seleccione la tipología de producción que desea declarar. Puede registrar artículos, patentes,
              libros, ponencias y proyectos con sus evidencias digitales asociadas.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/docente/mis-registros"
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-semibold flex items-center gap-2 transition-all backdrop-blur-md"
            >
              <ListOrdered className="w-4 h-4 text-unt-gold" />
              Mis Registros ({totalRegistros})
            </Link>
          </div>
        </div>
      </div>

      {/* Grid of the 7 Production Cards (Figma 3-47440) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900">
            Tipologías de Producción Científica y Académica
          </h2>
          <span className="text-xs text-slate-500 font-medium">7 Formularios Específicos</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {produccionesConfig.map((item) => {
            const Icon = item.icono;
            return (
              <div
                key={item.id}
                onClick={() => setActiveModal(item.id)}
                className="group card-unt hover:border-unt-blue/50 hover:shadow-elevated transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="badge-unt bg-slate-100 text-slate-600 text-[11px] font-semibold border border-slate-200">
                      {item.tag}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-unt-blue transition-colors">
                    {item.titulo}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.subtitulo}</p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-unt-blue">
                  <span>Registrar nuevo</span>
                  <PlusCircle className="w-4 h-4 transition-transform group-hover:rotate-90" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal with the selected form */}
      {activeModal && ActiveFormComponent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] shadow-2xl border border-slate-100 overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-lg bg-gradient-to-br ${currentConfig.color} text-white flex items-center justify-center`}
                >
                  {React.createElement(currentConfig.icono, { className: 'w-5 h-5' })}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{currentConfig.titulo}</h3>
                  <p className="text-xs text-slate-500">Formulario oficial de captura de producción UNT</p>
                </div>
              </div>
              <button
                onClick={handleModalClose}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                aria-label="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto">
              <ActiveFormComponent catalogos={catalogos} onSuccess={handleModalClose} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocenteDashboardView;
