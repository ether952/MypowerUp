import React, { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  getWeightHistory,
  calculateWeightStats,
  getWeightRecommendation,
} from '../utils/weightAnalytics';
import WeightModal from './WeightModal';
import { getLocalDateString } from '../utils/helpers';
import { Scale, ChevronDown, Sparkles } from 'lucide-react';

export default function WeightEvolutionChart({
  data = {},
  isWeightVisible = false,
  onToggleVisibility,
  onUpdateWeight,
}) {
  const [isChartOpen, setIsChartOpen] = useState(false);
  const [isTipsOpen, setIsTipsOpen] = useState(false);
  const [rangeFilter, setRangeFilter] = useState('30'); // '7' | '30' | 'all'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalDate, setModalDate] = useState(() => getLocalDateString());

  // Objetivo del usuario: 'bajar' | 'mantener' | 'subir'
  const [goalType, setGoalType] = useState(() => {
    try {
      return localStorage.getItem('mypowerup_weight_goal_type') || 'bajar';
    } catch (e) {
      return 'bajar';
    }
  });

  const handleSelectGoal = (type) => {
    setGoalType(type);
    try {
      localStorage.setItem('mypowerup_weight_goal_type', type);
    } catch (e) {}
  };

  const allLogs = useMemo(() => getWeightHistory(data), [data]);
  const stats = useMemo(() => calculateWeightStats(allLogs), [allLogs]);
  const recommendation = useMemo(
    () => getWeightRecommendation(allLogs, stats.currentWeight, goalType),
    [allLogs, stats.currentWeight, goalType]
  );

  // Filtrado según rango seleccionado
  const filteredData = useMemo(() => {
    if (rangeFilter === 'all') return allLogs;
    const days = parseInt(rangeFilter, 10);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return allLogs.filter((log) => log.dateObj >= cutoffDate);
  }, [allLogs, rangeFilter]);

  // Cálculo de dominios Y con holgura para visualización óptima
  const yDomain = useMemo(() => {
    if (filteredData.length === 0) return [50, 100];
    const values = filteredData.map((d) => d.weight);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const padding = Math.max(1, (max - min) * 0.2);
    return [Math.floor(min - padding), Math.ceil(max + padding)];
  }, [filteredData]);

  // Tooltip minimalista Light
  const CustomWeightTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-white border border-zinc-200 p-2.5 rounded-xl shadow-xl text-xs font-mono space-y-0.5 text-zinc-900">
          <p className="text-zinc-500 text-[10px]">{d.dateStr}</p>
          <p className="text-emerald-600 font-extrabold text-sm">
            {isWeightVisible ? `${d.weight} kg` : '•••• kg'}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full pt-2 font-mono select-none">
      
      {/* BOTÓN PRINCIPAL LIGHT */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-white hover:bg-zinc-50 border border-zinc-200 transition-all duration-300 shadow-xs">
        <button
          type="button"
          onClick={() => setIsChartOpen(!isChartOpen)}
          className="flex-1 flex items-center justify-between text-left cursor-pointer group"
        >
          <div className="space-y-0.5">
            <span className="text-[10px] text-emerald-600 tracking-widest uppercase font-bold block">
              MÉTRICA CORPORAL
            </span>
            <span className="text-sm sm:text-base font-extrabold text-zinc-900 tracking-tight uppercase font-display group-hover:text-emerald-600 transition-colors">
              Evolución Corporal & Consejos
            </span>
          </div>

          <div className="flex items-center gap-3">
            {stats.hasData && (
              <span className="text-xs text-zinc-500 font-bold hidden sm:inline">
                {isWeightVisible ? `${stats.currentWeight} kg` : '•••• kg'}
              </span>
            )}
            <span
              className={`text-xs px-2.5 py-1 rounded-lg bg-zinc-100 border border-zinc-200 text-zinc-600 transition-transform duration-300 ${
                isChartOpen ? 'rotate-180 text-emerald-600 border-emerald-500/50' : ''
              }`}
            >
              ▼
            </span>
          </div>
        </button>
      </div>

      {/* CONTENIDO DESPLEGABLE LIGHT */}
      <div
        className={`overflow-hidden transition-all duration-500 ease-out ${
          isChartOpen ? 'max-h-[1400px] opacity-100 mt-4' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="p-4 sm:p-6 rounded-2xl bg-white border border-zinc-200 space-y-6 shadow-xs">
          
          {/* Barra de Controles Minimalistas */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs border-b border-zinc-200 pb-4">
            
            {/* Stats Rápidas */}
            <div className="flex items-center gap-4">
              <div>
                <span className="text-[10px] text-zinc-500 uppercase block">Actual</span>
                <span className="font-extrabold text-zinc-900 text-base">
                  {stats.hasData ? (isWeightVisible ? `${stats.currentWeight} kg` : '••••') : '--'}
                </span>
              </div>

              {stats.hasData && stats.deltaTotal !== 0 && (
                <div className="border-l border-zinc-200 pl-4">
                  <span className="text-[10px] text-zinc-500 uppercase block">Variación</span>
                  <span
                    className={`font-bold text-sm ${
                      stats.deltaTotal < 0 ? 'text-emerald-600' : 'text-amber-600'
                    }`}
                  >
                    {isWeightVisible
                      ? `${stats.deltaTotal > 0 ? `+${stats.deltaTotal}` : stats.deltaTotal} kg`
                      : '••••'}
                  </span>
                </div>
              )}
            </div>

            {/* Acciones */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Ocultar / Revelar */}
              <button
                type="button"
                onClick={onToggleVisibility}
                className="px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-200 text-xs font-bold transition-all cursor-pointer"
              >
                {isWeightVisible ? 'Ocultar' : 'Revelar'}
              </button>

              {/* Rango */}
              <div className="flex items-center bg-zinc-100 p-0.5 rounded-lg border border-zinc-200">
                {['7', '30', 'all'].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRangeFilter(r)}
                    className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                      rangeFilter === r
                        ? 'bg-zinc-900 text-white shadow-xs'
                        : 'text-zinc-600 hover:text-zinc-900'
                    }`}
                  >
                    {r === 'all' ? 'TODO' : `${r}D`}
                  </button>
                ))}
              </div>

              {/* Registrar */}
              <button
                type="button"
                onClick={() => {
                  setModalDate(getLocalDateString());
                  setIsModalOpen(true);
                }}
                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-lg shadow-xs text-xs transition-all cursor-pointer"
              >
                + Registrar
              </button>
            </div>

          </div>

          {/* Gráfico Minimalista */}
          <div className="relative">
            {filteredData.length > 0 ? (
              <div
                className={`h-56 w-full transition-all duration-300 ${
                  !isWeightVisible ? 'blur-sm select-none pointer-events-none opacity-50' : ''
                }`}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={filteredData}
                    margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="weightGradLight" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E4E4E7" vertical={false} />
                    <XAxis
                      dataKey="label"
                      stroke="#71717A"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      fontFamily="monospace"
                    />
                    <YAxis
                      domain={yDomain}
                      stroke="#71717A"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      fontFamily="monospace"
                    />
                    <Tooltip content={<CustomWeightTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="weight"
                      stroke="#10B981"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#weightGradLight)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-zinc-500 font-mono border border-dashed border-zinc-200 rounded-xl">
                Sin registros en este período. Toca en + Registrar.
              </div>
            )}
          </div>

          {/* PANEL DE CONSEJOS & RECOMENDACIONES */}
          <div className="pt-2 border-t border-zinc-100">
            <button
              type="button"
              onClick={() => setIsTipsOpen(!isTipsOpen)}
              className="w-full py-2.5 px-4 rounded-xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 flex items-center justify-between text-xs font-bold text-zinc-900 transition-all cursor-pointer"
            >
              <span>Consejos & Frecuencia Recomendada</span>
              <span className="text-zinc-500 text-[11px] font-mono">
                {isTipsOpen ? 'Ocultar ▲' : 'Ver Consejos ▼'}
              </span>
            </button>

            {/* Panel de Consejos Desplegable */}
            <div
              className={`overflow-hidden transition-all duration-500 ease-out ${
                isTipsOpen ? 'max-h-[600px] opacity-100 mt-3' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-4 text-xs">
                
                {/* 1. Pregunta de Objetivo */}
                <div className="space-y-2">
                  <span className="text-[11px] text-zinc-600 font-bold block">
                    ¿Cuál es tu objetivo actual?
                  </span>
                  <div className="grid grid-cols-3 gap-2 text-[11px]">
                    {[
                      { id: 'bajar', label: 'Bajar / Definición' },
                      { id: 'mantener', label: 'Mantener / Salud' },
                      { id: 'subir', label: 'Subir / Masa' },
                    ].map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => handleSelectGoal(g.id)}
                        className={`py-2 px-2 rounded-lg font-bold transition-all text-center cursor-pointer ${
                          goalType === g.id
                            ? 'bg-zinc-900 text-white shadow-xs font-black'
                            : 'bg-white text-zinc-600 hover:text-zinc-900 border border-zinc-200'
                        }`}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Recomendación Personalizada */}
                <div className="p-3.5 rounded-lg bg-white border border-zinc-200 space-y-1.5 shadow-xs">
                  <div className="flex items-center justify-between text-zinc-500">
                    <span className="text-[10px] text-zinc-900 uppercase font-bold">
                      Frecuencia Sugerida
                    </span>
                    <span className="text-[10px] text-emerald-600 font-mono font-bold">
                      {recommendation.frequencyBadge}
                    </span>
                  </div>
                  <p className="text-zinc-900 font-extrabold text-xs">
                    {recommendation.frequencyTitle}
                  </p>
                  <p className="text-zinc-600 text-[11px] font-sans leading-relaxed">
                    {recommendation.reasoning}
                  </p>
                </div>

                {/* Tips Rápidos */}
                <ul className="space-y-1 text-[11px] text-zinc-600 font-sans list-disc list-inside">
                  {recommendation.tips.map((t, idx) => (
                    <li key={idx}>{t}</li>
                  ))}
                </ul>

              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Modal para Registrar/Editar */}
      <WeightModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentWeight={data[modalDate]?.weight ? parseFloat(data[modalDate].weight) : null}
        selectedDate={modalDate}
        onSaveWeight={onUpdateWeight}
      />

    </div>
  );
}
