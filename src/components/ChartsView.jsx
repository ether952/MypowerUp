import React, { useState, useMemo } from 'react';
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
  ChevronDown,
  Scale,
  Activity,
  Flame
} from 'lucide-react';
import { getDaysRangeData, getLocalDateString } from '../utils/helpers';
import WeightEvolutionChart from './WeightEvolutionChart';

// Paleta minimalista monocromática refinada para distribución
const PIE_COLORS = [
  '#09090B', // Negro puro
  '#27272A', // Zinc 800
  '#3F3F46', // Zinc 700
  '#52525B', // Zinc 600
  '#71717A', // Zinc 500
  '#A1A1AA', // Zinc 400
  '#18181B', // Zinc 900
  '#D4D4D8'  // Zinc 300
];

export default function ChartsView({
  data = {},
  goals = {},
  isWeightVisible = false,
  onToggleVisibility,
  onUpdateWeight,
}) {
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
    const setEx = new Set();
    Object.keys(data).forEach(d => {
      (data[d]?.workouts || []).forEach(w => {
        const name = (w.name || '').trim();
        if (name) setEx.add(name);
      });
    });
    return Array.from(setEx).sort();
  }, [data]);

  const [selectedExercise, setSelectedExercise] = useState('');

  // Sincronizar selección inicial
  React.useEffect(() => {
    if (!selectedExercise && availableExercises.length > 0) {
      setSelectedExercise(availableExercises[0]);
    }
  }, [availableExercises, selectedExercise]);

  const exerciseProgressionData = useMemo(() => {
    if (!selectedExercise) return [];

    const dates = Object.keys(data).sort((a, b) => new Date(a) - new Date(b));
    const points = [];

    dates.forEach(dateStr => {
      const dayWorkouts = data[dateStr]?.workouts || [];
      const matches = dayWorkouts.filter(w => (w.name || '').trim().toLowerCase() === selectedExercise.toLowerCase());

      if (matches.length > 0) {
        let maxWeight = 0;
        let totalVolume = 0;
        let bestSets = 0;
        let bestReps = 0;

        matches.forEach(m => {
          const w = Number(m.weight) || 0;
          const s = Number(m.sets) || 1;
          const r = Number(m.reps) || 1;
          if (w > maxWeight) {
            maxWeight = w;
            bestSets = s;
            bestReps = r;
          }
          totalVolume += (w * s * r);
        });

        const dParts = dateStr.split('-');
        const label = `${dParts[2]}/${dParts[1]}`;

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

  const initialWeight = exerciseProgressionData[0]?.weight || 0;
  const currentMaxWeight = exerciseProgressionData.length > 0
    ? Math.max(...exerciseProgressionData.map(p => p.weight))
    : 0;
  const latestWeight = exerciseProgressionData[exerciseProgressionData.length - 1]?.weight || 0;
  const netWeightGain = latestWeight - initialWeight;
  const percentGain = initialWeight > 0 ? Math.round(((latestWeight - initialWeight) / initialWeight) * 100) : 0;

  // Tooltips personalizados Minimalistas Monocromáticos
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-zinc-200 p-3 rounded-xl shadow-xl font-mono text-xs space-y-1.5">
          <p className="font-bold text-zinc-900 border-b border-zinc-100 pb-1">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-4 py-0.5">
              <span className="font-medium text-zinc-600">
                {entry.name}:
              </span>
              <span className="font-bold text-zinc-900">
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
        <div className="bg-white border border-zinc-200 p-3.5 rounded-xl shadow-xl font-mono text-xs space-y-1">
          <p className="font-bold text-zinc-900 border-b border-zinc-100 pb-1 flex items-center justify-between gap-3">
            <span>{label} ({d.dateStr})</span>
            <span className="text-black font-extrabold">{d.weight} kg</span>
          </p>
          <p className="text-zinc-600">
            Series × Reps: <strong className="text-zinc-900">{d.sets} × {d.reps}</strong>
          </p>
          <p className="text-zinc-500 text-[11px]">
            Volumen acumulado: <strong className="text-zinc-900">{d.volume.toLocaleString()} kg</strong>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-10 animate-fade-in-up">
      
      {/* Cabecera & Selector de Rango */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-200 pb-6">
        <div>
          <span className="text-xs font-mono tracking-widest text-zinc-500 uppercase">// RENDIMIENTO & PROGRESIÓN</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 uppercase tracking-tight font-display mt-0.5">
            GRÁFICOS & EVOLUCIÓN
          </h2>
        </div>

        {/* Selector de Rango de Días */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-zinc-200 shadow-sm font-mono text-xs">
          {[7, 14, 30].map(days => (
            <button
              key={days}
              type="button"
              onClick={() => setRangeDays(days)}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition-all uppercase cursor-pointer ${
                rangeDays === days 
                  ? 'bg-black text-white shadow-sm' 
                  : 'text-zinc-500 hover:text-black hover:bg-zinc-100'
              }`}
            >
              {days === 7 ? '7 DÍAS' : `${days} DÍAS`}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 01. SECCIÓN DE RENDIMIENTO, GIMNASIO & NUTRICIÓN                          */}
      {/* ========================================================================= */}
      <div className="space-y-12">

        {/* KPI HUD - DISEÑO ABIERTO Y ELEGANTE */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-6 border-y border-zinc-200">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-black"></span>
              <span>Días Entrenados</span>
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold font-display text-zinc-900 tracking-tight">
              {activeGymDays} <span className="text-xs font-mono text-zinc-500 font-normal uppercase">/ {rangeDays} DÍAS</span>
            </div>
          </div>

          <div className="space-y-1 sm:border-l sm:border-zinc-200 sm:pl-6">
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-700"></span>
              <span>Promedio Kcal</span>
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold font-display text-zinc-900 tracking-tight">
              {avgCalories.toLocaleString()} <span className="text-xs font-mono text-zinc-500 font-normal uppercase">KCAL</span>
            </div>
          </div>

          <div className="space-y-1 sm:border-l sm:border-zinc-200 sm:pl-6">
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-900"></span>
              <span>Promedio Proteína</span>
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold font-display text-zinc-900 tracking-tight">
              {avgProtein} <span className="text-xs font-mono text-zinc-500 font-normal uppercase">G</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECCIÓN: PROGRESIÓN DE FUERZA (SUBIDA DE PESOS)                           */}
        {/* ========================================================================= */}
        <div className="space-y-6 pt-2 border-b border-zinc-200 pb-12">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 uppercase tracking-wider">
                <TrendingUp className="w-4 h-4 text-zinc-900" />
                <span>// SOBRECARGA PROGRESIVA & FUERZA</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-zinc-900 uppercase tracking-tight font-display">
                SUBIDA DE PESOS POR EJERCICIO
              </h3>
            </div>

            {/* Selector de ejercicio */}
            {availableExercises.length > 0 && (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <label className="text-xs font-mono text-zinc-500 uppercase whitespace-nowrap">Ejercicio:</label>
                <select
                  value={selectedExercise}
                  onChange={(e) => setSelectedExercise(e.target.value)}
                  className="bg-white border border-zinc-300 text-zinc-900 px-3.5 py-2 rounded-xl text-xs font-mono focus:border-black outline-none w-full sm:w-auto cursor-pointer shadow-sm"
                >
                  {availableExercises.map((ex) => (
                    <option key={ex} value={ex} className="bg-white text-zinc-900">
                      {ex}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {availableExercises.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 font-mono text-sm border-t border-b border-zinc-200">
              Registra ejercicios en la vista de Diario para comenzar a visualizar la curva de subida de pesos.
            </div>
          ) : exerciseProgressionData.length <= 1 ? (
            <div className="py-8 px-6 bg-white border border-zinc-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs shadow-sm">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-zinc-900" />
                <div>
                  <p className="text-zinc-900 font-bold">{selectedExercise}: {currentMaxWeight} kg registrados.</p>
                  <p className="text-zinc-500 text-[11px]">Registra este ejercicio en más sesiones para dibujar la curva de progresión de fuerza.</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Medidores de Progresión */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 bg-white border border-zinc-200 rounded-2xl p-4 shadow-sm font-mono">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase block">Peso Inicial</span>
                  <span className="text-lg sm:text-xl font-extrabold text-zinc-800">{initialWeight} kg</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase block">Peso Actual</span>
                  <span className="text-lg sm:text-xl font-extrabold text-zinc-900">{latestWeight} kg</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase block">PR Máximo</span>
                  <span className="text-lg sm:text-xl font-extrabold text-black">{currentMaxWeight} kg</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase block">Ganancia</span>
                  <span className={`text-lg sm:text-xl font-extrabold ${netWeightGain >= 0 ? 'text-zinc-900' : 'text-zinc-600'}`}>
                    {netWeightGain >= 0 ? `+${netWeightGain}` : netWeightGain} kg ({percentGain >= 0 ? `+${percentGain}` : percentGain}%)
                  </span>
                </div>
              </div>

              {/* Gráfico de Progresión Monocromático */}
              <div className="h-72 w-full pt-4 bg-white border border-zinc-200 rounded-2xl p-4 shadow-sm">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={exerciseProgressionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="monoAreaProgression" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#09090B" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#09090B" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="2 2" stroke="#E4E4E7" vertical={false} />
                    <XAxis dataKey="label" stroke="#71717A" fontSize={11} tickLine={false} />
                    <YAxis stroke="#71717A" fontSize={11} tickLine={false} unit="kg" domain={['auto', 'auto']} />
                    <Tooltip content={<ProgressionTooltip />} />
                    <ReferenceLine y={initialWeight} stroke="#A1A1AA" strokeDasharray="3 3" label={{ value: 'Base', fill: '#71717A', fontSize: 10 }} />
                    <Area
                      type="monotone"
                      dataKey="weight"
                      name="Carga Máxima"
                      unit="kg"
                      stroke="#09090B"
                      strokeWidth={2.5}
                      dot={{ fill: '#09090B', stroke: '#FFFFFF', strokeWidth: 2, r: 4 }}
                      activeDot={{ fill: '#000000', stroke: '#FFFFFF', strokeWidth: 2, r: 6 }}
                      fill="url(#monoAreaProgression)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* SECCIÓN: FRECUENCIA Y DISTRIBUCIÓN (% DE EJERCICIOS)                     */}
        {/* ========================================================================= */}
        <div className="space-y-6 pt-2 border-b border-zinc-200 pb-12">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 uppercase tracking-wider">
              <PieIcon className="w-4 h-4 text-zinc-900" />
              <span>// FRECUENCIA & DISTRIBUCIÓN MUSCULAR</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-zinc-900 uppercase tracking-tight font-display">
              % DE VECES QUE SE HICIERON CADA EJERCICIO
            </h3>
          </div>

          {exerciseDistribution.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 font-mono text-sm border-t border-b border-zinc-200">
              No hay suficientes registros de ejercicios para calcular los porcentajes.
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-2 bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
              
              {/* Gráfico Donut Minimalista */}
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
                      stroke="#FFFFFF"
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
                            <div className="bg-white border border-zinc-200 p-2.5 rounded-xl shadow-xl text-xs font-mono">
                              <p className="font-bold text-zinc-900">{d.name}</p>
                              <p className="text-black font-extrabold">{d.percentage}% del total</p>
                              <p className="text-zinc-500 text-[10px]">{d.count} series / veces</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div className="absolute flex flex-col items-center justify-center pointer-events-none text-center">
                  <span className="text-2xl sm:text-3xl font-extrabold font-mono text-zinc-900">
                    {exerciseDistribution.length}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                    Ejercicios
                  </span>
                </div>
              </div>

              {/* Listado de Porcentajes */}
              <div className="lg:col-span-7 space-y-3">
                <div className="text-xs font-mono text-zinc-500 uppercase pb-1 flex justify-between border-b border-zinc-200">
                  <span>Ejercicio</span>
                  <span>Frecuencia / %</span>
                </div>

                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-2 divide-y divide-zinc-100">
                  {exerciseDistribution.map((item, idx) => {
                    const color = PIE_COLORS[idx % PIE_COLORS.length];
                    return (
                      <div key={item.name} className="pt-2.5 space-y-1">
                        <div className="flex justify-between items-center text-xs font-mono">
                          <span className="font-bold text-zinc-900 truncate max-w-[220px] sm:max-w-xs flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                            {item.name}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-zinc-500 text-[11px] font-normal">{item.count} veces</span>
                            <span className="font-bold px-2 py-0.5 rounded-md text-[11px] bg-zinc-100 text-zinc-900">
                              {item.percentage}%
                            </span>
                          </div>
                        </div>

                        <div className="w-full bg-zinc-100 rounded-full h-1.5 overflow-hidden">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
          
          {/* Calorías */}
          <div className="space-y-3 bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between items-center border-b border-zinc-100 pb-2">
              <h3 className="font-mono font-bold text-sm uppercase text-zinc-900 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-black" />
                // CALORÍAS DIARIAS (KCAL)
              </h3>
              <span className="text-xs font-mono text-zinc-500">Meta: {goals?.calories || 2400}</span>
            </div>

            <div className="h-60 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="monoAreaCal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#09090B" stopOpacity={0.12}/>
                      <stop offset="95%" stopColor="#09090B" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="2 2" stroke="#E4E4E7" vertical={false} />
                  <XAxis dataKey="shortLabel" stroke="#71717A" fontSize={11} tickLine={false} />
                  <YAxis stroke="#71717A" fontSize={11} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine y={goals?.calories || 2400} stroke="#71717A" strokeDasharray="3 3" />
                  <Area type="monotone" dataKey="calories" name="Calorías" unit="kcal" stroke="#09090B" strokeWidth={2} fill="url(#monoAreaCal)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Proteína */}
          <div className="space-y-3 bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between items-center border-b border-zinc-100 pb-2">
              <h3 className="font-mono font-bold text-sm uppercase text-zinc-900 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-black" />
                // PROTEÍNA DIARIA (G)
              </h3>
              <span className="text-xs font-mono text-zinc-500">Meta: {goals?.protein || 150}g</span>
            </div>

            <div className="h-60 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="monoAreaProt" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#27272A" stopOpacity={0.12}/>
                      <stop offset="95%" stopColor="#27272A" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="2 2" stroke="#E4E4E7" vertical={false} />
                  <XAxis dataKey="shortLabel" stroke="#71717A" fontSize={11} tickLine={false} />
                  <YAxis stroke="#71717A" fontSize={11} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine y={goals?.protein || 150} stroke="#71717A" strokeDasharray="3 3" />
                  <Area type="monotone" dataKey="protein" name="Proteína" unit="g" stroke="#27272A" strokeWidth={2} fill="url(#monoAreaProt)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 02. EVOLUCIÓN CORPORAL & CONSEJOS (ÚLTIMO GRÁFICO / DESPLEGABLE)          */}
      {/* ========================================================================= */}
      <div className="pt-6 border-t border-zinc-200">
        <WeightEvolutionChart
          data={data}
          goals={goals}
          isWeightVisible={isWeightVisible}
          onToggleVisibility={onToggleVisibility}
          onUpdateWeight={onUpdateWeight}
        />
      </div>

    </div>
  );
}
