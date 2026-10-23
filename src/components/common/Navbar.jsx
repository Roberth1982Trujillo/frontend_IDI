import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User, GraduationCap, ShieldCheck, BarChart3, Menu } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadge = (rol) => {
    if (rol === 'ROLE_ADMIN' || rol === 'ADMIN') {
      return (
        <span className="badge-unt bg-purple-100 text-purple-700 border border-purple-200">
          <ShieldCheck className="w-3.5 h-3.5" /> Administrador
        </span>
      );
    }
    if (rol === 'ROLE_DIRECTIVO' || rol === 'DIRECTIVO') {
      return (
        <span className="badge-unt bg-amber-100 text-amber-700 border border-amber-200">
          <BarChart3 className="w-3.5 h-3.5" /> Directivo
        </span>
      );
    }
    return (
      <span className="badge-unt bg-unt-light text-unt-blue border border-unt-blue/20">
        <GraduationCap className="w-3.5 h-3.5" /> Docente Investigador
      </span>
    );
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Mobile Toggle & Brand */}
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Abrir menú"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-unt-blue to-unt-dark flex items-center justify-center text-white font-bold shadow-md shadow-unt-blue/20 group-hover:scale-105 transition-transform">
              <span className="text-sm font-extrabold tracking-wider">UNT</span>
            </div>
            <div>
              <div className="text-base font-bold text-unt-dark leading-tight flex items-center gap-2">
                Gestión y Calidad de la I+D+i
                <span className="text-[10px] font-semibold bg-unt-goldLight text-unt-gold px-1.5 py-0.5 rounded border border-unt-gold/30">
                  UNT
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">
                Vicerrectorado de Investigación – Universidad Nacional de Trujillo
              </p>
            </div>
          </Link>
        </div>

        {/* Right: User Profile & Actions */}
        {user ? (
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-semibold text-slate-900 leading-tight">
                {user.nombres ? `${user.nombres} ${user.apellidos || ''}` : user.usuario}
              </span>
              <div className="mt-0.5">{getRoleBadge(user.rol)}</div>
            </div>

            <div className="h-8 w-px bg-slate-200 hidden sm:block" />

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 px-3 py-2 rounded-lg transition-colors border border-transparent hover:border-rose-100"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link to="/identificacion-docente" className="btn-outline-unt text-xs py-2">
              Soy Docente
            </Link>
            <Link to="/login" className="btn-primary text-xs py-2">
              Acceso Administrativo
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
