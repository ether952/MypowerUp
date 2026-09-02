import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine 
} from 'recharts';
import { getDaysRangeData, getLocalDateString } from '../utils/helpers';

export default function ChartsView({ data, goals }) {
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

  return (
    <div className="space-y-12 animate-slide-up">
      
      {/* Cabecera & Selector de Rango */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-purple-500/20 pb-6">
        <div>
          <span className="text-xs font-mono tracking-widest text-neon-purple uppercase">// RENDIMIENTO & PROGRESIÓN</span>
          <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
            GRÁFICOS & <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-neon-cyan">EVOLUCIÓN</span>
          </h2>
        </div>

        <div className="flex items-center gap-2 bg-space-900 p-1.5 rounded-xl border border-white/10 font-mono text-xs">
          {[7, 14, 30].map(days => (
            <button
              key={days}
              type="button"
              onClick={() => setRangeDays(days)}
              className={`px-4 py-2 rounded-lg font-bold transition-all uppercase ${
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

      {/* KPI HUD - TODOS DEL MISMO COLOR UNIFICADO */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 bg-space-900/50 border-l-2 border-neon-purple rounded-xl">
          <span className="block text-[11px] font-mono text-neutral-400 uppercase">Días Entrenados</span>
          <span className="text-2xl sm:text-3xl font-black font-mono text-white mt-1 block">
            {activeGymDays} <span className="text-xs text-neutral-500 font-normal">/ {rangeDays}</span>
          </span>
        </div>

        <div className="p-5 bg-space-900/50 border-l-2 border-neon-purple rounded-xl">
          <span className="block text-[11px] font-mono text-neutral-400 uppercase">Peso Total</span>
          <span className="text-2xl sm:text-3xl font-black font-mono text-white mt-1 block">
            {totalPeriodTonnage.toLocaleString()} <span className="text-xs text-neon-cyan font-normal">kg</span>
          </span>
        </div>

        <div className="p-5 bg-space-900/50 border-l-2 border-neon-purple rounded-xl">
          <span className="block text-[11px] font-mono text-neutral-400 uppercase">Promedio Kcal</span>
          <span className="text-2xl sm:text-3xl font-black font-mono text-white mt-1 block">
            {avgCalories.toLocaleString()} <span className="text-xs text-neon-cyan font-normal">kcal</span>
          </span>
        </div>

        <div className="p-5 bg-space-900/50 border-l-2 border-neon-purple rounded-xl">
          <span className="block text-[11px] font-mono text-neutral-400 uppercase">Promedio Proteína</span>
          <span className="text-2xl sm:text-3xl font-black font-mono text-white mt-1 block">
            {avgProtein} <span className="text-xs text-neon-cyan font-normal">g</span>
          </span>
        </div>
      </div>

      {/* Gráfico 1: Peso y Carga */}
      <div className="p-6 bg-space-900/40 border border-white/5 rounded-2xl space-y-4">
        <div className="flex justify-between items-center border-b border-white/5 pb-3">
          <h3 className="font-mono font-bold text-sm uppercase tracking-wider text-neon-purple">
            // PESO & CARGA EN GIMNASIO (KG)
          </h3>
          <span className="text-xs font-mono text-neutral-500">Peso levantado por día</span>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="purpleBar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8B5CF6" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#3B2F7E" stopOpacity={0.5}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 2" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="shortLabel" stroke="#64748B" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748B" fontSize={11} tickLine={false} tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(1)}k` : v} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={goals?.tonnage || 100} stroke="#06B6D4" strokeDasharray="3 3" />
              <Bar dataKey="tonnage" name="Peso Total" unit="kg" fill="url(#purpleBar)" radius={[4, 4, 0, 0]} maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráficos de Nutrición */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Calorías */}
        <div className="p-6 bg-space-900/40 border border-white/5 rounded-2xl space-y-4">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <h3 className="font-mono font-bold text-sm uppercase text-neon-purple">
              // CALORÍAS DIARIAS (KCAL)
            </h3>
            <span className="text-xs font-mono text-neutral-500">Meta: {goals?.calories || 2400}</span>
          </div>

          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="purpleAreaCal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 2" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="shortLabel" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={goals?.calories || 2400} stroke="#06B6D4" strokeDasharray="3 3" />
                <Area type="monotone" dataKey="calories" name="Calorías" unit="kcal" stroke="#8B5CF6" strokeWidth={2} fill="url(#purpleAreaCal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Proteína */}
        <div className="p-6 bg-space-900/40 border border-white/5 rounded-2xl space-y-4">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <h3 className="font-mono font-bold text-sm uppercase text-neon-purple">
              // PROTEÍNA DIARIA (G)
            </h3>
            <span className="text-xs font-mono text-neutral-500">Meta: {goals?.protein || 150}g</span>
          </div>

          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="purpleAreaProt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 2" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="shortLabel" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={goals?.protein || 150} stroke="#06B6D4" strokeDasharray="3 3" />
                <Area type="monotone" dataKey="protein" name="Proteína" unit="g" stroke="#8B5CF6" strokeWidth={2} fill="url(#purpleAreaProt)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}
