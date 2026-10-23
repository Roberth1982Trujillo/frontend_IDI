import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { useToast } from '../../context/ToastContext';
import ExportModal from '../../components/directivo/ExportModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  BarChart2,
  Filter,
  Download,
  RotateCcw,
  Sparkles,
  PieChart as PieIcon,
  ChevronDown,
  Layers,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const COLORS = [
  '#003B70',
  '#0D9488',
  '#C59B27',
  '#6366F1',
  '#EC4899',
  '#F59E0B',
  '#10B981',
  '#8B5CF6',
  '#3B82F6',
];

const IndicadoresBiView = () => {
  const { error } = useToast();
  const [catalogos, setCatalogos] = useState(null);
  const [dataReporte, setDataReporte] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalExportOpen, setModalExportOpen] = useState(false);
  const [sidebarFiltersOpen, setSidebarFiltersOpen] = useState(true);

  // 16 Filtros combinables (RN-09)
  const initialFiltros = {
    tipoProduccion: 'ARTICULO_CIENTIFICO',
    dimensionPrincipal: 'FACULTAD',
    facultadId: '',
    escuelaId: '',
    docenteDni: '',
    genero: '',
    rangoEtario: '',
    nivelRenacyt: '',
    condicion: '',
    categoria: '',
    modalidad: '',
    areaConcytecId: '',
    lineaUntId: '',
    sublinea: '',
    odsId: '',
    ultimos5Anios: false,
  };

  const [filtros, setFiltros] = useState(initialFiltros);

  useEffect(() => {
    axiosClient.get('/catalogos/todos').then((res) => {
      setCatalogos(res.data);
    }).catch(() => {});
  }, []);

  const fetchIndicadores = async (currentFiltros = filtros) => {
    setLoading(true);
    try {
      const payload = { ...currentFiltros };
      // Limpiar campos vacíos
      Object.keys(payload).forEach((k) => {
        if (payload[k] === '' || payload[k] === null) delete payload[k];
      });

      const res = await axiosClient.post('/reportes/indicadores', payload);
      setDataReporte(res.data);
    } catch {
      error('Error al calcular los indicadores multidimensionales.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIndicadores();
  }, [filtros.dimensionPrincipal, filtros.tipoProduccion, filtros.ultimos5Anios]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFiltros((prev) => {
      const updated = { ...prev, [name]: type === 'checkbox' ? checked : value };
      if (name === 'facultadId') updated.escuelaId = '';
      return updated;
    });
  };

  const handleResetFilters = () => {
    setFiltros(initialFiltros);
    fetchIndicadores(initialFiltros);
  };

  const chartData = dataReporte?.items?.map((item) => ({
    etiqueta: item.etiqueta || 'Sin asignar',
    total: item.total || 0,
    porcentaje: item.porcentaje || 0,
  })) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart2 className="w-6 h-6 text-unt-blue" /> Tablero de Indicadores Institucionales
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Motor analítico multidimensional con 16 filtros combinables en simultáneo (CU-14, RN-09)
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setSidebarFiltersOpen((prev) => !prev)}
            className="btn-secondary text-xs py-2 lg:hidden"
          >
            <Filter className="w-4 h-4" /> Filtros
          </button>
          <button
            onClick={() => setModalExportOpen(true)}
            className="btn-primary text-xs py-2"
          >
            <Download className="w-4 h-4" /> Exportar Reporte
          </button>
        </div>
      </div>

      {/* Main Layout: Sidebar 16 Filtros + Analytics Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Barra lateral de los 16 Filtros (RN-09) */}
        <div
          className={`card-unt p-5 space-y-4 lg:col-span-1 ${
            sidebarFiltersOpen ? 'block' : 'hidden lg:block'
          }`}
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-unt-blue" /> 16 Filtros Combinables
            </span>
            <button
              onClick={handleResetFilters}
              className="text-[11px] text-unt-blue hover:underline flex items-center gap-1"
              title="Restablecer filtros"
            >
              <RotateCcw className="w-3 h-3" /> Limpiar
            </button>
          </div>

          <div className="space-y-3 text-xs">
            {/* 1. Tipo Producción */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                1. Tipo de Producción
              </label>
              <select
                name="tipoProduccion"
                value={filtros.tipoProduccion}
                onChange={handleChange}
                className="input-unt text-xs py-1.5"
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

            {/* 2. Dimensión Principal */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                2. Dimensión Principal (Eje X)
              </label>
              <select
                name="dimensionPrincipal"
                value={filtros.dimensionPrincipal}
                onChange={handleChange}
                className="input-unt text-xs py-1.5 font-bold text-unt-blue"
              >
                <option value="FACULTAD">Por Facultad</option>
                <option value="ESCUELA">Por Escuela Profesional</option>
                <option value="GENERO">Por Género</option>
                <option value="RANGO_ETARIO">Por Rango Etario</option>
                <option value="NIVEL_RENACYT">Por Nivel RENACYT</option>
                <option value="CONDICION">Por Condición (Nombrado/Contratado)</option>
                <option value="CATEGORIA">Por Categoría Docente</option>
                <option value="MODALIDAD">Por Modalidad de Trabajo</option>
                <option value="AREA_CONCYTEC">Por Área CONCYTEC</option>
                <option value="LINEA_UNT">Por Línea de Investigación</option>
                <option value="ODS">Por Objetivo ODS</option>
              </select>
            </div>

            {/* 3. Facultad */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                3. Filtrar por Facultad
              </label>
              <select
                name="facultadId"
                value={filtros.facultadId}
                onChange={handleChange}
                className="input-unt text-xs py-1.5"
              >
                <option value="">Todas las Facultades</option>
                {catalogos?.facultades?.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Escuela */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                4. Filtrar por Escuela
              </label>
              <select
                name="escuelaId"
                value={filtros.escuelaId}
                onChange={handleChange}
                disabled={!filtros.facultadId}
                className="input-unt text-xs py-1.5 disabled:bg-slate-100"
              >
                <option value="">Todas las Escuelas</option>
                {catalogos?.escuelas
                  ?.filter((e) => e.facultad?.id === parseInt(filtros.facultadId, 10))
                  .map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.nombre}
                    </option>
                  ))}
              </select>
            </div>

            {/* 5. Género */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                5. Género Docente
              </label>
              <select
                name="genero"
                value={filtros.genero}
                onChange={handleChange}
                className="input-unt text-xs py-1.5"
              >
                <option value="">Cualquiera</option>
                <option value="MASCULINO">Masculino</option>
                <option value="FEMENINO">Femenino</option>
              </select>
            </div>

            {/* 6. Renacyt */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                6. Nivel RENACYT
              </label>
              <select
                name="nivelRenacyt"
                value={filtros.nivelRenacyt}
                onChange={handleChange}
                className="input-unt text-xs py-1.5"
              >
                <option value="">Todos los niveles</option>
                <option value="DISTINGUIDO">Distinguido</option>
                <option value="NIVEL_I">Nivel I</option>
                <option value="NIVEL_II">Nivel II</option>
                <option value="NIVEL_III">Nivel III</option>
                <option value="NO_RENACYT">No RENACYT</option>
              </select>
            </div>

            {/* 7. Condición */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                7. Condición Laboral
              </label>
              <select
                name="condicion"
                value={filtros.condicion}
                onChange={handleChange}
                className="input-unt text-xs py-1.5"
              >
                <option value="">Todas</option>
                <option value="NOMBRADO">Nombrado</option>
                <option value="CONTRATADO">Contratado</option>
              </select>
            </div>

            {/* 8. Línea UNT */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                8. Línea de Investigación UNT
              </label>
              <select
                name="lineaUntId"
                value={filtros.lineaUntId}
                onChange={handleChange}
                className="input-unt text-xs py-1.5"
              >
                <option value="">Todas las 50 líneas</option>
                {catalogos?.lineas?.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* 9. ODS */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                9. Objetivo ODS
              </label>
              <select
                name="odsId"
                value={filtros.odsId}
                onChange={handleChange}
                className="input-unt text-xs py-1.5"
              >
                <option value="">Todos los ODS</option>
                {catalogos?.ods?.map((o) => (
                  <option key={o.id} value={o.id}>
                    ODS {o.numero}: {o.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* 10. Checkbox Últimos 5 Años (RN-12) */}
            <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
              <input
                type="checkbox"
                id="ultimos5Anios"
                name="ultimos5Anios"
                checked={filtros.ultimos5Anios}
                onChange={handleChange}
                className="w-4 h-4 rounded text-unt-blue focus:ring-unt-blue"
              />
              <label htmlFor="ultimos5Anios" className="text-xs font-bold text-unt-blue">
                Solo últimos 5 años (RN-12)
              </label>
            </div>

            <button
              onClick={() => fetchIndicadores()}
              className="btn-primary w-full text-xs py-2 mt-2"
            >
              Aplicar Filtros Combinados
            </button>
          </div>
        </div>

        {/* Analytics Canvas */}
        <div className="lg:col-span-3 space-y-6">
          {/* Top Counters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="card-unt p-4">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Total Producciones Filtradas
              </span>
              <span className="text-2xl font-extrabold text-unt-blue">
                {dataReporte?.totalProducciones || 0}
              </span>
            </div>

            <div className="card-unt p-4">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Dimensión Activa
              </span>
              <span className="text-base font-bold text-slate-800">
                {filtros.dimensionPrincipal.replace(/_/g, ' ')}
              </span>
            </div>

            <div className="card-unt p-4">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Categorías Resultantes
              </span>
              <span className="text-2xl font-extrabold text-slate-800">
                {chartData.length}
              </span>
            </div>
          </div>

          {/* Recharts Bar Chart */}
          <div className="card-unt p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Distribución Gráfica por {filtros.dimensionPrincipal.replace(/_/g, ' ')}
                </h3>
                <p className="text-[11px] text-slate-500">
                  Totales agregados según la tipología "{filtros.tipoProduccion.replace(/_/g, ' ')}"
                </p>
              </div>
            </div>

            {loading ? (
              <LoadingSpinner message="Calculando agregaciones..." />
            ) : chartData.length === 0 ? (
              <div className="text-center p-12 text-xs text-slate-400">
                No hay producciones que cumplan con la combinación de filtros seleccionada.
              </div>
            ) : (
              <div className="h-80 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis
                      dataKey="etiqueta"
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                      angle={-25}
                      textAnchor="end"
                    />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#002244',
                        color: '#fff',
                        borderRadius: '12px',
                        fontSize: '12px',
                        border: 'none',
                      }}
                      formatter={(value) => [`${value} trabajos`, 'Total']}
                    />
                    <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                      {chartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Breakdown Table */}
          {chartData.length > 0 && (
            <div className="card-unt p-0 overflow-hidden">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  Tabla Desglosada de Métricas
                </span>
                <span className="text-[11px] text-slate-500">{chartData.length} grupos</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/50 text-slate-500 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-6">Etiqueta / Dimensión</th>
                      <th className="py-2.5 px-6 text-right">Cantidad de Producciones</th>
                      <th className="py-2.5 px-6 text-right">Porcentaje del Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {chartData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/70">
                        <td className="py-3 px-6 font-semibold text-slate-800 flex items-center gap-2">
                          <div
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                          />
                          {row.etiqueta}
                        </td>
                        <td className="py-3 px-6 text-right font-bold text-slate-900">
                          {row.total}
                        </td>
                        <td className="py-3 px-6 text-right font-mono text-slate-500">
                          {row.porcentaje ? `${row.porcentaje.toFixed(1)}%` : '0%'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Exportación */}
      <ExportModal
        isOpen={modalExportOpen}
        onClose={() => setModalExportOpen(false)}
        filtroActual={filtros}
      />
    </div>
  );
};

export default IndicadoresBiView;
