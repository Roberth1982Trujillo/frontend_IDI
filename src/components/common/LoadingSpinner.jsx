import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ message = 'Cargando información...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <Loader2 className="w-8 h-8 text-unt-blue animate-spin mb-3" />
      <span className="text-sm font-medium text-slate-500">{message}</span>
    </div>
  );
};

export default LoadingSpinner;
