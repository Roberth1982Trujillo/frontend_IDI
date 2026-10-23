import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FileText,
  ListOrdered,
  Users,
  FolderTree,
  CheckSquare,
  BarChart2,
  GitCompare,
  UserCheck,
  ChevronRight,
  Sparkles,
  BookOpen,
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  if (!user) return null;

  const isDocente = user.rol === 'ROLE_DOCENTE' || user.rol === 'DOCENTE';
  const isAdmin = user.rol === 'ROLE_ADMIN' || user.rol === 'ADMIN';
  const isDirectivo = user.rol === 'ROLE_DIRECTIVO' || user.rol === 'DIRECTIVO';

  const docenteLinks = [
    {
      to: '/docente/dashboard',
      label: 'Cuestionario I+D+i',
      icon: FileText,
      description: 'Registrar producciones',
    },
    {
      to: '/docente/mis-registros',
      label: 'Mis Registros',
      icon: ListOrdered,
      description: 'Consultar y gestionar',
    },
  ];

  const adminLinks = [
    {
      to: '/admin/docentes',
      label: 'Padrón de Docentes',
      icon: Users,
      description: 'Gestión y carga masiva',
    },
    {
      to: '/admin/catalogos',
      label: 'Catálogos UNT',
      icon: FolderTree,
      description: 'Facultades, Escuelas, ODS',
    },
    {
      to: '/supervision',
      label: 'Supervisión de Registros',
      icon: CheckSquare,
      description: 'Auditoría y corrección',
    },
  ];

  const biLinks = [
    {
      to: '/reportes/indicadores',
      label: 'Tablero de Indicadores',
      icon: BarChart2,
      description: '16 filtros multidimensionales',
    },
    {
      to: '/reportes/cruzados',
      label: 'Gráficos Cruzados (X vs Y)',
      icon: GitCompare,
      description: 'Matrices de contingencia',
    },
    {
      to: '/reportes/investigador',
      label: 'Ficha del Investigador',
      icon: UserCheck,
      description: 'Perfil 360° por docente',
    },
  ];

  const renderNavGroup = (title, links) => (
    <div className="mb-6">
      <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
        {title}
      </div>
      <nav className="space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={onClose}
              className={({ isActive }) =>
                `group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-unt-blue text-white shadow-sm shadow-unt-blue/30 font-semibold'
                    : 'text-slate-600 hover:text-unt-blue hover:bg-slate-100/80'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-unt-blue'
                      }`}
                    />
                    <div>
                      <div className="leading-tight">{link.label}</div>
                      <div
                        className={`text-[11px] font-normal leading-tight mt-0.5 ${
                          isActive ? 'text-white/80' : 'text-slate-400'
                        }`}
                      >
                        {link.description}
                      </div>
                    </div>
                  </div>
                  <ChevronRight
                    className={`w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 ${
                      isActive ? 'text-white/80' : 'text-slate-300'
                    }`}
                  />
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-72 bg-white border-r border-slate-200/90 overflow-y-auto p-4 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Docente links */}
        {isDocente && renderNavGroup('Cuestionario Docente', docenteLinks)}

        {/* Admin links */}
        {isAdmin && renderNavGroup('Administración Institucional', adminLinks)}

        {/* Directivo only supervision */}
        {isDirectivo && !isAdmin && (
          <div className="mb-6">
            <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Supervisión
            </div>
            <nav className="space-y-1">
              <NavLink
                to="/supervision"
                onClick={onClose}
                className={({ isActive }) =>
                  `group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-unt-blue text-white shadow-sm font-semibold'
                      : 'text-slate-600 hover:text-unt-blue hover:bg-slate-100/80'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <CheckSquare className="w-4 h-4 text-slate-400" />
                  <div>
                    <div className="leading-tight">Supervisión de Registros</div>
                    <div className="text-[11px] text-slate-400">Auditoría y corrección</div>
                  </div>
                </div>
              </NavLink>
            </nav>
          </div>
        )}

        {/* BI & Analytics for Admin and Directivo */}
        {(isAdmin || isDirectivo) && renderNavGroup('Inteligencia Institucional (BI)', biLinks)}

        {/* Help / Institutional Banner at bottom */}
        <div className="mt-8 p-3.5 rounded-xl bg-gradient-to-br from-unt-light to-white border border-unt-blue/15 text-xs text-unt-dark shadow-xs">
          <div className="flex items-center gap-2 font-bold text-unt-blue mb-1">
            <Sparkles className="w-3.5 h-3.5 text-unt-gold" />
            <span>Oficina de Investigación</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Plataforma oficial para la captura y monitoreo de la producción de investigación UNT.
          </p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
