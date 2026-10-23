import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { GitCompare, Layers, ArrowRight, BarChart } from 'lucide-react';

const GraficosCruzadosView = () => {
  const { error } = useToast();
  const [loading, setLoading] = useState(false);
  const [dimX, setDimX] = useState('FACULTAD');
  const [dimY, setDimY] = useState('GENERO');
  const [tipoProd, setTipoProd] = useState('ARTICULO_CIENTIFICO');
  const [dataCruzada, setDataCruzada] = useState(null);

  const fetchCruzados = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.post('/reportes/cruzados', {
        tipoProduccion: tipoProd,
        dimensionPrincipal: dimX,
        dimensionSecundaria: dimY,
      });
      setDataCruzada(res.data);
    } catch {
      error('Error al generar la matriz de gráficos cruzados.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCruzados();
  }, [dimX, dimY, tipoProd]);

  const matriz = dataCruzada?.matriz || [];
  const columnasY = dataCruzada?.columnasY || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <GitCompare className="w-6 h-6 text-unt-blue" /> Matriz de Gráficos Cruzados (X vs Y)
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Tablas de contingencia y cruce bidimensional para análisis institucional avanzado (CU-15)
        </p>
      </div>

      {/* Selectors Bar */}
      <div className="card-unt p-5 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Tipología de Producción
          </label>
          <select
            value={tipoProd}
            onChange={(e) => setTipoProd(e.target.value)}
            className="input-unt text-xs py-2"
          >
            <option value="ARTICULO_CIENTIFICO">Artículo Científico</option>
            <option value="SOLICITUD_PATENTE">Solicitud de Patente</option>
            <option value="LIBRO_INVESTIGACION">Libro de Investigación</option>
            <option value="LIBRO_ACADEMICO">Libro Académico</option>
            <option value="PONENCIA_EVENTO">Ponencia Científica</option>
            <option value="PROYECTO_CONCURSABLE">Proyecto Concursable</option>
            <option value="EVALUACION_PROYECTO">Evaluación de Proyecto</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-unt-blue mb-1">
            Dimensión X (Filas de la Matriz)
          </label>
          <select
            value={dimX}
            onChange={(e) => setDimX(e.target.value)}
            className="input-unt text-xs py-2 font-semibold"
          >
            <option value="FACULTAD">Facultad</option>
            <option value="ESCUELA">Escuela Profesional</option>
            <option value="AREA_CONCYTEC">Área CONCYTEC</option>
            <option value="LINEA_UNT">Línea UNT</option>
            <option value="ODS">Objetivo ODS</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-unt-gold mb-1">
            Dimensión Y (Columnas de la Matriz)
          </label>
          <select
            value={dimY}
            onChange={(e) => setDimY(e.target.value)}
            className="input-unt text-xs py-2 font-semibold"
          >
            <option value="GENERO">Género (Masculino / Femenino)</option>
            <option value="CONDICION">Condición (Nombrado / Contratado)</option>
            <option value="CATEGORIA">Categoría Docente</option>
            <option value="NIVEL_RENACYT">Nivel RENACYT</option>
            <option value="RANGO_ETARIO">Rango Etario</option>
          </select>
        </div>
      </div>

      {/* Contingency Table Card */}
      {loading ? (
        <LoadingSpinner message="Calculando matriz de contingencia..." />
      ) : (
        <div className="card-unt p-0 overflow-hidden">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">
              Matriz Cruzada: {dimX} × {dimY}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Conteo total de producciones declaradas
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">{dimX}</th>
                  {columnasY.map((col, i) => (
                    <th key={i} className="py-3 px-4 text-center">
                      {col}
                    </th>
                  ))}
                  <th className="py-3 px-4 text-right bg-slate-200/50 font-bold">Total Fila</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {matriz.map((fila, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70">
                    <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                      {fila.etiquetaX}
                    </td>
                    {columnasY.map((col, i) => {
                      const val = fila.valores?.[col] || 0;
                      return (
                        <td key={i} className="py-3.5 px-4 text-center font-mono">
                          <span
                            className={`px-2 py-0.5 rounded ${
                              val > 0
                                ? 'bg-unt-light text-unt-blue font-bold'
                                : 'text-slate-400'
                            }`}
                          >
                            {val}
                          </span>
                        </td>
                      );
                    })}
                    <td className="py-3.5 px-4 text-right font-extrabold text-slate-900 bg-slate-50 font-mono">
                      {fila.totalFila || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default GraficosCruzadosView;
