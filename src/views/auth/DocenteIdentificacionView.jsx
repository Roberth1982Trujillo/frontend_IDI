import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useNavigate, Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import {
  GraduationCap,
  Search,
  CheckCircle2,
  AlertCircle,
  Building,
  Award,
  ArrowRight,
  Loader2,
  UserCheck,
} from 'lucide-react';

const DocenteIdentificacionView = () => {
  const [dni, setDni] = useState('');
  const [loading, setLoading] = useState(false);
  const [docenteData, setDocenteData] = useState(null);
  const [loginLoading, setLoginLoading] = useState(false);

  const { loginDocente } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const handleConsultarDni = async (e) => {
    e.preventDefault();

    if (!/^\d{8}$/.test(dni.trim())) {
      error('El DNI debe contener exactamente 8 dígitos numéricos.');
      return;
    }

    setLoading(true);
    setDocenteData(null);
    try {
      const res = await axiosClient.post('/auth/validar-dni', { dni: dni.trim() });
      setDocenteData(res.data);
      success('Docente identificado en el padrón institucional.');
    } catch (err) {
      error(
        err.response?.data?.message ||
          'DNI no encontrado en el padrón docente UNT. Por favor contacte al administrador.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmarIngreso = async () => {
    if (!docenteData) return;
    setLoginLoading(true);
    try {
      await loginDocente(docenteData.dni, docenteData);
      success(`¡Bienvenido(a), Prof. ${docenteData.nombres}!`);
      navigate('/docente/dashboard');
    } catch (err) {
      error('Error al generar la sesión. Verifique con el administrador.');
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-elevated border border-slate-200/90 overflow-hidden">
        {/* Banner Header */}
        <div className="bg-gradient-to-r from-unt-blue to-unt-dark p-8 text-white text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 mb-3 shadow-inner">
            <GraduationCap className="w-8 h-8 text-unt-gold" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Portal del Docente Investigador</h1>
          <p className="text-xs text-white/80 mt-1 max-w-md mx-auto">
            Identifíquese con su Documento Nacional de Identidad (DNI) para registrar y actualizar su
            producción de I+D+i.
          </p>
        </div>

        <div className="p-8">
          {/* Formulario de Consulta DNI */}
          <form onSubmit={handleConsultarDni} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Número de DNI (8 dígitos) <span className="text-rose-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  id="dni-input"
                  type="text"
                  maxLength={8}
                  value={dni}
                  onChange={(e) => setDni(e.target.value.replace(/\D/g, ''))}
                  placeholder="Ingrese su DNI..."
                  required
                  className="input-unt text-base tracking-wider font-mono font-medium"
                />
                <button
                  id="consultar-btn"
                  type="submit"
                  disabled={loading || dni.length !== 8}
                  className="btn-primary shrink-0 px-5 text-sm"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Search className="w-4 h-4" /> Consultar
                    </>
                  )}
                </button>
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5">
                Tip: Puede probar con el DNI de demostración precargado: <strong>12345678</strong>
              </p>
            </div>
          </form>

          {/* Ficha de Confirmación de Datos del Padrón */}
          {docenteData && (
            <div className="mt-6 p-5 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-4 animate-in fade-in duration-200">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide">
                      Datos Verificados en el Padrón UNT
                    </span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">
                    {docenteData.nombres} {docenteData.apellidos}
                  </h3>
                  <div className="text-xs text-slate-600">DNI: {docenteData.dni}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-emerald-200/70 text-xs">
                <div>
                  <span className="text-slate-500 block text-[11px]">Facultad:</span>
                  <span className="font-semibold text-slate-800">
                    {docenteData.facultad?.nombre || 'Facultad de Ingeniería'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Escuela Profesional:</span>
                  <span className="font-semibold text-slate-800">
                    {docenteData.escuela?.nombre || 'Ingeniería de Materiales'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Condición / Categoría:</span>
                  <span className="font-semibold text-slate-800">
                    {docenteData.condicion || 'Nombrado'} - {docenteData.categoria || 'Principal'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Nivel RENACYT:</span>
                  <span className="font-semibold text-emerald-700">
                    {docenteData.nivelRenacyt || 'Nivel I'}
                  </span>
                </div>
              </div>

              <button
                id="confirmar-ingreso-btn"
                onClick={handleConfirmarIngreso}
                disabled={loginLoading}
                className="btn-primary w-full py-3 text-sm mt-3 font-semibold shadow-md shadow-unt-blue/20"
              >
                {loginLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Iniciando cuestionario...
                  </>
                ) : (
                  <>
                    Confirmar e Ingresar al Cuestionario <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}

          {/* Enlace al login administrativo */}
          <div className="mt-6 text-center pt-4 border-t border-slate-100">
            <Link to="/login" className="text-xs text-slate-500 hover:text-unt-blue font-medium">
              ¿Personal administrativo o directivo? Iniciar sesión aquí
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocenteIdentificacionView;
