import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Lock, User, ArrowRight, Loader2, KeyRound } from 'lucide-react';

/**
 * Traduce un error de la petición de login a un mensaje claro.
 * Evita mostrar "credenciales incorrectas" cuando el problema es de
 * conexión, configuración del despliegue o del servidor.
 */
const getLoginErrorMessage = (err) => {
  const status = err.response?.status;

  if (!err.response) {
    return 'No se pudo conectar con el servidor. Verifique su conexión e intente nuevamente.';
  }
  if (status === 401) {
    return 'Usuario o contraseña incorrectos. Verifique su acceso.';
  }
  if (status === 403) {
    return 'Acceso denegado: no dispone de permisos para ingresar.';
  }
  if (status === 404 || status === 405) {
    return 'No se pudo comunicar con el servicio de autenticación. Contacte al administrador del sistema.';
  }
  if (status >= 500) {
    return 'El servidor no pudo procesar la solicitud. Intente nuevamente en unos minutos.';
  }
  return err.response?.data?.message || 'No se pudo iniciar sesión. Intente nuevamente.';
};

const LoginAdminView = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('expired') === 'true') {
      error('Su sesión institucional ha expirado. Por favor, vuelva a iniciar sesión.');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      error('Ingrese usuario y contraseña');
      return;
    }

    setLoading(true);
    try {
      const user = await login(username.trim(), password);
      success(`¡Bienvenido al sistema, ${user.nombres || user.usuario}!`);
      if (user.rol === 'ROLE_DOCENTE') {
        navigate('/docente/dashboard');
      } else if (user.rol === 'ROLE_ADMIN') {
        navigate('/admin/docentes');
      } else {
        navigate('/reportes/indicadores');
      }
    } catch (err) {
      error(getLoginErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (u, p) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-elevated border border-slate-200/90 overflow-hidden">
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-unt-blue to-unt-dark p-8 text-white text-center relative overflow-hidden">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 mb-3 shadow-inner">
            <ShieldCheck className="w-8 h-8 text-unt-gold" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Acceso Administrativo</h1>
          <p className="text-xs text-white/80 mt-1 max-w-xs mx-auto">
            Plataforma de Gestión y Calidad de la I+D+i – Universidad Nacional de Trujillo
          </p>
        </div>

        {/* Login Form */}
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Usuario Institucional
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="username-input"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ej. admin o directivo"
                  required
                  className="input-unt pl-10 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="password-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="input-unt pl-10 text-sm"
                />
              </div>
            </div>

            <button
              id="admin-login-btn"
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 mt-2 font-semibold shadow-md shadow-unt-blue/20"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Verificando...
                </>
              ) : (
                <>
                  Ingresar al Sistema <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Access Bar */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2.5 text-center">
              Accesos Rápidos de Prueba
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                id="btn-demo-admin"
                type="button"
                onClick={() => handleDemoFill('admin', 'admin123')}
                className="text-xs py-2 px-2.5 rounded-lg border border-purple-200 bg-purple-50/70 text-purple-700 hover:bg-purple-100 font-medium transition-colors text-center"
              >
                Admin (Catálogos)
              </button>
              <button
                id="btn-demo-directivo"
                type="button"
                onClick={() => handleDemoFill('directivo', 'directivo123')}
                className="text-xs py-2 px-2.5 rounded-lg border border-amber-200 bg-amber-50/70 text-amber-700 hover:bg-amber-100 font-medium transition-colors text-center"
              >
                Directivo (Reportes)
              </button>
            </div>
          </div>

          {/* Link to Docente portal */}
          <div className="mt-6 text-center">
            <Link
              to="/identificacion-docente"
              className="text-xs font-semibold text-unt-blue hover:underline inline-flex items-center gap-1"
            >
              ¿Eres Docente Investigador? Ingresa con tu DNI aquí <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginAdminView;
