import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

const NotFoundView = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
      <div className="w-16 h-16 rounded-2xl bg-unt-light text-unt-blue flex items-center justify-center text-2xl font-black mb-4">
        404
      </div>
      <h1 className="text-2xl font-extrabold text-slate-900">Página No Encontrada</h1>
      <p className="text-xs text-slate-500 max-w-sm mt-1.5 mb-6">
        La ruta a la que intenta acceder no existe o fue reubicada dentro del sistema de I+D+i.
      </p>
      <Link to="/" className="btn-primary text-xs py-2.5 px-4">
        <Home className="w-4 h-4" /> Volver al Inicio
      </Link>
    </div>
  );
};

export default NotFoundView;
