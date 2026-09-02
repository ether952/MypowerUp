import React, { useState, useMemo, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  AreaChart, 
  Area, 
  PieChart,
  Pie,
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine 
} from 'recharts';
import { 
  Dumbbell, 
  TrendingUp, 
  PieChart as PieIcon, 
  Sparkles,
  Award,
  Zap,
  ChevronDown
} from 'lucide-react';
import { getDaysRangeData, getLocalDateString } from '../utils/helpers';

// Paleta futurista para gráfico circular de distribución
const PIE_COLORS = [
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#3B82F6', // Blue
  '#A855F7', // Violet
  '#14B8A6'  // Teal
];

export default function ChartsView({ data = {}, goals = {} }) {
  const [rangeDays, setRangeDays] = useState(7);
  const chartData = getDaysRangeData(data, rangeDays, getLocalDateString());

  const totalPeriodTonnage = chartData.reduce((acc, d) => acc + d.tonnage, 0);
  const totalPeriodCalories = chartData.reduce((acc, d) => acc + d.calories, 0);
  const totalPeriodProtein = chartData.reduce((acc, d) => acc + d.protein, 0);

  const activeGymDays = chartData.filter(d => d.tonnage > 0).length;
  const activeFoodDays = chartData.filter(d => d.calories > 0).length;

  const avgCalories = activeFoodDays > 0 ? Math.round(totalPeriodCalories / activeFoodDays) : 0;
  const avgProtein = activeFoodDays > 0 ? Math.round(totalPeriodProtein / activeFoodDays) : 0;
  const avgTonnage = activeGymDays > 0 ? Math.round(totalPeriodTonnage / activeGymDays) : 0;

  // =========================================================================
  // 1. DISTRIBUCIÓN DE FRECUENCIA DE EJERCICIOS (% DE VECES REALIZADOS)
  // =========================================================================
  const exerciseDistribution = useMemo(() => {
    const counts = {};
    const dates = Object.keys(data);

    dates.forEach(d => {
      const workouts = data[d]?.workouts || [];
      workouts.forEach(w => {
        const name = (w.name || '').trim();
        if (name) {
          // Contabilizamos las series / veces realizadas
          const setsCount = Number(w.sets) || 1;
          counts[name] = (counts[name] || 0) + setsCount;
        }
      });
    });

    const totalSets = Object.values(counts).reduce((a, b) => a + b, 0);
    if (totalSets === 0) return [];

    const sorted = Object.entries(counts)
      .map(([name, count]) => ({
        name,
        count,
        percentage: Math.round((count / totalSets) * 100)
      }))
      .sort((a, b) => b.count - a.count);

    return sorted;
  }, [data]);

  // =========================================================================
  // 2. PROGRESIÓN DE PESOS POR EJERCICIO (SUBIDA DE CARGAS EN EL TIEMPO)
  // =========================================================================
  const availableExercises = useMemo(() => {
    const set = new Set();
    Object.values(data).forEach(day => {
      (day.workouts || []).forEach(w => {
        if (w.name) set.add(w.name.trim());
      });
    });
    return Array.from(set);
  }, [data]);

  const [selectedExercise, setSelectedExercise] = useState(() => availableExercises[0] || '');

  useEffect(() => {
    if ((!selectedExercise || !availableExercises.includes(selectedExercise)) && availableExercises.length > 0) {
      setSelectedExercise(availableExercises[0]);
    }
  }, [availableExercises, selectedExercise]);

  const exerciseProgressionData = useMemo(() => {
    if (!selectedExercise) return [];
    const points = [];
    const sortedDates = Object.keys(data).sort((a, b) => new Date(a) - new Date(b));

    sortedDates.forEach(dateStr => {
      const dayWorkouts = (data[dateStr]?.workouts || []).filter(
        w => (w.name || '').trim().toLowerCase() === selectedExercise.toLowerCase()
      );
      if (dayWorkouts.length > 0) {
        // Encontrar el peso máximo levantado en ese día para este ejercicio
        const maxWeight = Math.max(...dayWorkouts.map(w => Number(w.weight) || 0));
        const totalVolume = dayWorkouts.reduce(
          (acc, w) => acc + (Number(w.weight) || 0) * (Number(w.sets) || 1) * (Number(w.reps) || 1), 
          0
        );
        const bestSets = dayWorkouts[0]?.sets || 1;
        const bestReps = dayWorkouts[0]?.reps || 1;

        const [y, m, d] = dateStr.split('-').map(Number);
        const dateObj = new Date(y, m - 1, d);
        const label = `${dateObj.getDate()}/${dateObj.getMonth() + 1}`;

        points.push({
          dateStr,
          label,
          weight: maxWeight,
          volume: totalVolume,
          sets: bestSets,
          reps: bestReps,
        });
      }
    });

    return points;
  }, [data, selectedExercise]);

  // Estadísticas del ejercicio seleccionado
  const initialWeight = exerciseProgressionData[0]?.weight || 0;
  const currentMaxWeight = exerciseProgressionData.length > 0
    ? Math.max(...exerciseProgressionData.map(p => p.weight))
    : 0;
  const latestWeight = exerciseProgressionData[exerciseProgressionData.length - 1]?.weight || 0;
  const netWeightGain = latestWeight - initialWeight;
  const percentGain = initialWeight > 0 ? Math.round(((latestWeight - initialWeight) / initialWeight) * 100) : 0;

  // Tooltips personalizados
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-space-900/95 border border-purple-500/30 p-3 rounded-xl shadow-2xl backdrop-blur-md text-xs font-mono space-y-1">
          <p className="font-bold text-white border-b border-white/10 pb-1">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-4 py-0.5">
              <span className="font-medium text-neon-cyan">
                {entry.name}:
              </span>
              <span className="font-bold text-white">
                {Number(entry.value).toLocaleString()} {entry.unit || ''}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const ProgressionTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-[#0E0926]/95 border border-cyan-500/40 p-3.5 rounded-xl shadow-2xl backdrop-blur-md text-xs font-mono space-y-1">
          <p className="font-bold text-white border-b border-white/10 pb-1 flex items-center justify-between gap-3">
            <span>{label} ({d.dateStr})</span>
            <span className="text-neon-cyan font-bold">{d.weight} kg</span>
          </p>
          <p className="text-neutral-300">
            Series × Reps: <strong className="text-white">{d.sets} × {d.reps}</strong>
          </p>
          <p className="text-neutral-400 text-[11px]">
            Volumen acumulado: <strong className="text-neon-purple">{d.volume.toLocaleString()} kg</strong>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-12 animate-slide-up">
      
      {/* Cabecera & Selector de Rango */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-purple-500/20 pb-6">
        <div>
          <span className="text-xs font-mono tracking-widest text-neon-purple uppercase">// RENDIMIENTO & PROGRESIÓN</span>
          <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight font-display">
            GRÁFICOS & <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-purple via-neon-cyan to-neon-mint">EVOLUCIÓN</span>
          </h2>
        </div>

        <div className="flex items-center gap-2 bg-space-900 p-1.5 rounded-xl border border-white/10 font-mono text-xs">
          {[7, 14, 30].map(days => (
            <button
              key={days}
              type="button"
              onClick={() => setRangeDays(days)}
              className={`px-4 py-2 rounded-lg font-bold transition-all uppercase cursor-pointer ${
                rangeDays === days 
                  ? 'bg-gradient-to-r from-neon-purple to-neon-violet text-white shadow-md shadow-purple-600/30' 
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {days === 7 ? '7 DÍAS' : `${days} DÍAS`}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* KPI HUD - DISEÑO ABIERTO, ELEGANTE Y SIN CAJAS                            */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-6 border-y border-white/10">
        <div className="space-y-1 group">
          <div className="flex items-center gap-2 text-xs font-mono text-neutral-400 uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-neon-purple animate-pulse"></span>
            <span>Días Entrenados</span>
          </div>
          <div className="text-3xl sm:text-5xl font-black font-display text-white tracking-tight">
            {activeGymDays} <span className="text-xs font-mono text-neutral-500 font-normal uppercase">/ {rangeDays} DÍAS</span>
          </div>
        </div>

        <div className="space-y-1 group sm:border-l sm:border-white/10 sm:pl-6">
          <div className="flex items-center gap-2 text-xs font-mono text-neutral-400 uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            <span>Promedio Kcal</span>
          </div>
          <div className="text-3xl sm:text-5xl font-black font-display text-white tracking-tight">
            {avgCalories.toLocaleString()} <span className="text-xs font-mono text-amber-400 font-normal uppercase">KCAL</span>
          </div>
        </div>

        <div className="space-y-1 group sm:border-l sm:border-white/10 sm:pl-6">
          <div className="flex items-center gap-2 text-xs font-mono text-neutral-400 uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-neon-mint"></span>
            <span>Promedio Proteína</span>
          </div>
          <div className="text-3xl sm:text-5xl font-black font-display text-white tracking-tight">
            {avgProtein} <span className="text-xs font-mono text-neon-mint font-normal uppercase">G</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECCIÓN: PROGRESIÓN DE FUERZA (CÓMO EL USUARIO VA SUBIENDO LOS PESOS)    */}
      {/* ========================================================================= */}
      <div className="space-y-6 pt-4 border-b border-white/10 pb-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono text-neon-cyan uppercase tracking-wider">
              <TrendingUp className="w-4 h-4 text-neon-cyan" />
              <span>// SOBRECARGA PROGRESIVA & FUERZA</span>
            </div>
            <h3 className="text-2xl font-black text-white uppercase tracking-tight font-display">
              SUBIDA DE PESOS <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-purple">POR EJERCICIO</span>
            </h3>
          </div>

          {/* Selector interactivo de ejercicio */}
          {availableExercises.length > 0 && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <label className="text-xs font-mono text-neutral-400 uppercase whitespace-nowrap">Ejercicio:</label>
              <select
                value={selectedExercise}
                onChange={(e) => setSelectedExercise(e.target.value)}
                className="bg-[#0E0926] border border-cyan-500/40 text-white px-3.5 py-2 rounded-xl text-xs font-mono focus:border-neon-cyan outline-none w-full sm:w-auto cursor-pointer"
              >
                {availableExercises.map((ex) => (
                  <option key={ex} value={ex} className="bg-[#0E0926] text-white">
                    {ex}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {availableExercises.length === 0 ? (
          <div className="py-12 text-center text-neutral-500 font-mono text-sm border-t border-b border-white/5">
            Registra ejercicios en la vista de Diario para comenzar a visualizar la curva de subida de pesos.
          </div>
        ) : exerciseProgressionData.length <= 1 ? (
          <div className="py-8 px-6 bg-space-900/30 border border-white/5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-neon-cyan" />
              <div>
                <p className="text-white font-bold">{selectedExercise}: {currentMaxWeight} kg registrados.</p>
                <p className="text-neutral-400 text-[11px]">Registra este ejercicio en más sesiones para dibujar la curva de progresión de fuerza.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Medidores de Progresión y Récord */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-3 border-b border-white/5 font-mono">
              <div>
                <span className="text-[10px] text-neutral-400 uppercase block">Peso Inicial</span>
                <span className="text-xl font-black text-neutral-300">{initialWeight} kg</span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 uppercase block">Peso Actual</span>
                <span className="text-xl font-black text-white">{latestWeight} kg</span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 uppercase block">PR Máximo</span>
                <span className="text-xl font-black text-neon-cyan">{currentMaxWeight} kg</span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 uppercase block">Ganancia de Fuerza</span>
                <span className={`text-xl font-black ${netWeightGain >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {netWeightGain >= 0 ? `+${netWeightGain}` : netWeightGain} kg ({percentGain >= 0 ? `+${percentGain}` : percentGain}%)
                </span>
              </div>
            </div>

            {/* Gráfico de Progresión de Peso */}
            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={exerciseProgressionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="cyanAreaProgression" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.45}/>
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="2 2" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="label" stroke="#64748B" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={11} tickLine={false} unit="kg" domain={['auto', 'auto']} />
                  <Tooltip content={<ProgressionTooltip />} />
                  <ReferenceLine y={initialWeight} stroke="#8B5CF6" strokeDasharray="3 3" label={{ value: 'Base', fill: '#8B5CF6', fontSize: 10 }} />
                  <Area
                    type="monotone"
                    dataKey="weight"
                    name="Carga Máxima"
                    unit="kg"
                    stroke="#06B6D4"
                    strokeWidth={3}
                    dot={{ fill: '#06B6D4', stroke: '#FFFFFF', strokeWidth: 2, r: 4 }}
                    activeDot={{ fill: '#00F5A0', stroke: '#FFFFFF', strokeWidth: 2, r: 6 }}
                    fill="url(#cyanAreaProgression)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SECCIÓN: % DE VECES QUE SE HICIERON CADA EJERCICIO (GRÁFICO DE DISTRIBUCIÓN) */}
      {/* ========================================================================= */}
      <div className="space-y-6 pt-4 border-b border-white/10 pb-12">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-neon-purple uppercase tracking-wider">
            <PieIcon className="w-4 h-4 text-neon-purple" />
            <span>// FRECUENCIA & DISTRIBUCIÓN MUSCULAR</span>
          </div>
          <h3 className="text-2xl font-black text-white uppercase tracking-tight font-display">
            % DE VECES QUE SE HICIERON <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-neon-cyan">CADA EJERCICIO</span>
          </h3>
        </div>

        {exerciseDistribution.length === 0 ? (
          <div className="py-12 text-center text-neutral-500 font-mono text-sm border-t border-b border-white/5">
            No hay suficientes registros de ejercicios para calcular los porcentajes.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-2">
            
            {/* Gráfico Donut Recharts */}
            <div className="lg:col-span-5 h-72 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={exerciseDistribution}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={3}
                    stroke="rgba(0,0,0,0.5)"
                    strokeWidth={2}
                  >
                    {exerciseDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-[#0E0926]/95 border border-purple-500/40 p-2.5 rounded-xl shadow-xl text-xs font-mono">
                            <p className="font-bold text-white">{d.name}</p>
                            <p className="text-neon-cyan font-bold">{d.percentage}% del total</p>
                            <p className="text-neutral-400 text-[10px]">{d.count} series / veces</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Centro de información del Donut */}
              <div className="absolute flex flex-col items-center justify-center pointer-events-none text-center">
                <span className="text-2xl sm:text-3xl font-black font-mono text-white">
                  {exerciseDistribution.length}
                </span>
                <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">
                  Ejercicios
                </span>
              </div>
            </div>

            {/* Listado con barras de porcentaje detalladas */}
            <div className="lg:col-span-7 space-y-3">
              <div className="text-xs font-mono text-neutral-400 uppercase pb-1 flex justify-between border-b border-white/5">
                <span>Ejercicio</span>
                <span>Frecuencia / %</span>
              </div>

              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-2 divide-y divide-white/5">
                {exerciseDistribution.map((item, idx) => {
                  const color = PIE_COLORS[idx % PIE_COLORS.length];
                  return (
                    <div key={item.name} className="pt-2.5 space-y-1">
                      <div className="flex justify-between items-center text-xs font-mono">
                        <span className="font-bold text-white truncate max-w-[220px] sm:max-w-xs flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                          {item.name}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-neutral-400 text-[11px] font-normal">{item.count} veces</span>
                          <span className="font-bold px-2 py-0.5 rounded-md text-[11px]" style={{ backgroundColor: `${color}20`, color }}>
                            {item.percentage}%
                          </span>
                        </div>
                      </div>

                      {/* Barra de progreso de porcentaje */}
                      <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700 ease-out"
                          style={{
                            width: `${item.percentage}%`,
                            backgroundColor: color
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SECCIÓN: GRÁFICOS DE NUTRICIÓN (CALORÍAS Y PROTEÍNAS)                     */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
        
        {/* Calorías */}
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <h3 className="font-mono font-bold text-sm uppercase text-amber-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              // CALORÍAS DIARIAS (KCAL)
            </h3>
            <span className="text-xs font-mono text-neutral-400">Meta: {goals?.calories || 2400}</span>
          </div>

          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="amberAreaCal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 2" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="shortLabel" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={goals?.calories || 2400} stroke="#06B6D4" strokeDasharray="3 3" />
                <Area type="monotone" dataKey="calories" name="Calorías" unit="kcal" stroke="#F59E0B" strokeWidth={2} fill="url(#amberAreaCal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Proteína */}
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <h3 className="font-mono font-bold text-sm uppercase text-neon-mint flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-neon-mint" />
              // PROTEÍNA DIARIA (G)
            </h3>
            <span className="text-xs font-mono text-neutral-400">Meta: {goals?.protein || 150}g</span>
          </div>

          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="mintAreaProt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00F5A0" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#00F5A0" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 2" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="shortLabel" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={goals?.protein || 150} stroke="#06B6D4" strokeDasharray="3 3" />
                <Area type="monotone" dataKey="protein" name="Proteína" unit="g" stroke="#00F5A0" strokeWidth={2} fill="url(#mintAreaProt)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}
