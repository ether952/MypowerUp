import React, { useState } from 'react';
import { 
  ChevronRight, 
  ChevronDown, 
  ArrowUpRight, 
  Trash2, 
  Search,
  Flame,
  Sparkles,
  Zap
} from 'lucide-react';
import { formatDisplayDate, MEAL_TYPES, getLocalDateString } from '../utils/helpers';

export default function HistoryView({ data, goals, onSelectDate }) {
  const [expandedDate, setExpandedDate] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHistoryDate, setSelectedHistoryDate] = useState(() => getLocalDateString());

  const sortedDates = Object.keys(data).sort((a, b) => b.localeCompare(a));

  const activeDayData = data[selectedHistoryDate] || { foods: [], workouts: [] };
  const dayCalories = (activeDayData.foods || []).reduce((acc, f) => acc + (Number(f.calories) || 0), 0);
  const dayProtein = (activeDayData.foods || []).reduce((acc, f) => acc + (Number(f.protein) || 0), 0);
  const dayTonnage = (activeDayData.workouts || []).reduce(
    (acc, w) => acc + (Number(w.sets) || 0) * (Number(w.reps) || 0) * (Number(w.weight) || 0), 
    0
  );

  const calGoal = goals?.calories || 2400;
  const protGoal = goals?.protein || 150;
  const tonGoal = goals?.tonnage || 5000;

  const calPercent = Math.min(100, Math.round((dayCalories / calGoal) * 100));
  const protPercent = Math.min(100, Math.round((dayProtein / protGoal) * 100));
  const tonPercent = Math.min(100, Math.round((dayTonnage / tonGoal) * 100));

  const filteredDates = sortedDates.filter(dateStr => {
    const dayData = data[dateStr] || { foods: [], workouts: [] };
    const hasData = (dayData.foods && dayData.foods.length > 0) || (dayData.workouts && dayData.workouts.length > 0);
    if (!hasData) return false;

    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    
    const dateMatch = dateStr.includes(term) || formatDisplayDate(dateStr).toLowerCase().includes(term);
    const foodMatch = (dayData.foods || []).some(f => f.name.toLowerCase().includes(term));
    const workoutMatch = (dayData.workouts || []).some(w => w.name.toLowerCase().includes(term));

    return dateMatch || foodMatch || workoutMatch;
  });

  const toggleExpand = (dateStr) => {
    setExpandedDate(expandedDate === dateStr ? null : dateStr);
    setSelectedHistoryDate(dateStr);
  };

  return (
    <div className="space-y-12 animate-slide-up">
      
      {/* ========================================================= */}
      {/* 3 TARJETAS DE MÉTRICAS (SOLICITADAS EN HISTORIAL)         */}
      {/* ========================================================= */}
      <div className="space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-500/20 pb-4">
          <div>
            <span className="text-xs font-mono tracking-widest text-neon-purple uppercase">// ANÁLISIS DEL DÍA</span>
            <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
              MÉTRICAS: <span className="text-neon-cyan">{formatDisplayDate(selectedHistoryDate)}</span>
            </h3>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
            <span>FECHA:</span>
            <input
              type="date"
              value={selectedHistoryDate}
              onChange={(e) => setSelectedHistoryDate(e.target.value)}
              className="bg-space-900 border border-white/10 text-white px-3 py-1.5 rounded-lg text-xs font-mono"
            />
          </div>
        </div>

        {/* Las 3 tarjetas de la imagen adaptadas a la nueva estética */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Calorías Totales */}
          <div className="p-6 bg-space-900/60 border-t-2 border-neon-yellow rounded-xl shadow-xl space-y-4 relative overflow-hidden backdrop-blur-xl">
            <div className="flex items-center justify-between text-xs font-mono font-bold tracking-wider text-neutral-400 uppercase">
              <span className="text-white">CALORÍAS TOTALES</span>
              <span className="text-neon-yellow">{calPercent}% DE {calGoal}</span>
            </div>
            <div className="text-4xl font-black font-mono text-white">
              {dayCalories.toLocaleString()} <span className="text-sm font-sans text-neon-yellow">KCAL</span>
            </div>
            <div className="w-full bg-space-950 rounded-full h-2 overflow-hidden border border-white/5">
              <div 
                className="bg-neon-yellow h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${calPercent}%` }}
              />
            </div>
          </div>

          {/* Proteínas Totales */}
          <div className="p-6 bg-space-900/60 border-t-2 border-neon-cyan rounded-xl shadow-xl space-y-4 relative overflow-hidden backdrop-blur-xl">
            <div className="flex items-center justify-between text-xs font-mono font-bold tracking-wider text-neutral-400 uppercase">
              <span className="text-white">PROTEÍNAS TOTALES</span>
              <span className="text-neon-cyan">{protPercent}% DE {protGoal}G</span>
            </div>
            <div className="text-4xl font-black font-mono text-white">
              {dayProtein} <span className="text-sm font-sans text-neon-cyan">G PROT</span>
            </div>
            <div className="w-full bg-space-950 rounded-full h-2 overflow-hidden border border-white/5">
              <div 
                className="bg-neon-cyan h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${protPercent}%` }}
              />
            </div>
          </div>

          {/* Volumen de Carga */}
          <div className="p-6 bg-space-900/60 border-t-2 border-neon-mint rounded-xl shadow-xl space-y-4 relative overflow-hidden backdrop-blur-xl">
            <div className="flex items-center justify-between text-xs font-mono font-bold tracking-wider text-neutral-400 uppercase">
              <span className="text-white">VOLUMEN DE CARGA</span>
              <span className="text-neon-mint">{tonPercent}% DE {tonGoal}KG</span>
            </div>
            <div className="text-4xl font-black font-mono text-white">
              {dayTonnage.toLocaleString()} <span className="text-sm font-sans text-neon-mint">KG TOT.</span>
            </div>
            <div className="w-full bg-space-950 rounded-full h-2 overflow-hidden border border-white/5">
              <div 
                className="bg-neon-mint h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${tonPercent}%` }}
              />
            </div>
          </div>

        </section>
      </div>

      {/* Buscador & Lista de Días */}
      <div className="space-y-6">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="text-xs font-mono tracking-widest text-neutral-400 uppercase">
            // REGISTRO CRONOLÓGICO DE DÍAS
          </div>

          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Buscar ejercicio, comida, fecha..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full input-futuristic px-4 py-3 text-xs text-white rounded-xl font-mono placeholder-neutral-500"
            />
          </div>
        </div>

        {filteredDates.length === 0 ? (
          <div className="py-16 text-center text-neutral-600 font-mono text-sm border-t border-b border-purple-500/10">
            No hay registros disponibles en el historial todavía.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDates.map((dateStr) => {
              const dayData = data[dateStr] || { foods: [], workouts: [] };
              const foods = dayData.foods || [];
              const workouts = dayData.workouts || [];

              const totalCalories = foods.reduce((acc, f) => acc + (Number(f.calories) || 0), 0);
              const totalProtein = foods.reduce((acc, f) => acc + (Number(f.protein) || 0), 0);
              const totalTonnage = workouts.reduce((acc, w) => {
                return acc + (Number(w.sets) || 0) * (Number(w.reps) || 0) * (Number(w.weight) || 0);
              }, 0);

              const isExpanded = expandedDate === dateStr;
              const isSelected = selectedHistoryDate === dateStr;

              return (
                <div 
                  key={dateStr} 
                  className={`bg-space-900/50 border-l-4 transition-all overflow-hidden rounded-xl ${
                    isSelected ? 'border-neon-purple bg-space-900/80 shadow-lg shadow-purple-600/10' : 'border-neutral-800 hover:border-neutral-600'
                  }`}
                >
                  <div 
                    onClick={() => toggleExpand(dateStr)}
                    className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer select-none hover:bg-space-850/50 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-3">
                        <h4 className="font-bold text-lg text-white capitalize">{formatDisplayDate(dateStr)}</h4>
                        <span className="text-[11px] font-mono text-neon-purple px-2 py-0.5 rounded bg-neon-purple/10">
                          {dateStr}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs font-mono text-neutral-400 mt-1">
                        <span>{workouts.length} ejercicios</span>
                        <span>•</span>
                        <span>{foods.length} alimentos/suplementos</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-3 text-xs font-mono">
                        <span className="text-neon-mint">{totalTonnage.toLocaleString()} kg</span>
                        <span>•</span>
                        <span className="text-neon-yellow">{totalCalories} kcal</span>
                        <span>•</span>
                        <span className="text-neon-cyan">{totalProtein}g prot</span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectDate(dateStr);
                        }}
                        className="px-4 py-2 bg-gradient-to-r from-neon-purple to-neon-violet text-white text-xs font-mono font-bold uppercase rounded-lg hover:opacity-90 transition-opacity"
                      >
                        Cargar Día
                      </button>

                      <div className="text-neutral-400">
                        {isExpanded ? <ChevronDown className="w-5 h-5 text-neon-purple" /> : <ChevronRight className="w-5 h-5" />}
                      </div>
                    </div>
                  </div>

                  {/* Desglose Expandible */}
                  {isExpanded && (
                    <div className="p-6 border-t border-white/5 bg-space-950/80 grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in-up">
                      
                      {/* Ejercicios */}
                      <div className="space-y-3">
                        <div className="text-xs font-mono text-neon-purple uppercase tracking-wider">
                          // ENTRENAMIENTOS ({workouts.length})
                        </div>
                        {workouts.length === 0 ? (
                          <p className="text-xs font-mono text-neutral-600">Sin ejercicios registrados.</p>
                        ) : (
                          <div className="space-y-2">
                            {workouts.map(w => {
                              const vol = (Number(w.sets) || 0) * (Number(w.reps) || 0) * (Number(w.weight) || 0);
                              return (
                                <div key={w.id} className="p-3 bg-space-900/60 border border-white/5 rounded-lg flex justify-between items-center text-xs font-mono">
                                  <span className="text-white font-bold">{w.name}</span>
                                  <span className="text-neutral-400">
                                    {w.sets}×{w.reps} con <strong className="text-neon-cyan">{w.weight}kg</strong> <span className="text-neon-mint">({vol}kg)</span>
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Comidas y Suplementos */}
                      <div className="space-y-3">
                        <div className="text-xs font-mono text-neon-cyan uppercase tracking-wider">
                          // NUTRICIÓN & SUPLEMENTOS ({foods.length})
                        </div>
                        {foods.length === 0 ? (
                          <p className="text-xs font-mono text-neutral-600">Sin alimentos registrados.</p>
                        ) : (
                          <div className="space-y-2">
                            {foods.map(f => {
                              const isSupp = f.mealType === 'suplementacion';
                              return (
                                <div key={f.id} className="p-3 bg-space-900/60 border border-white/5 rounded-lg flex justify-between items-center text-xs font-mono">
                                  <div className="flex items-center gap-2">
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase ${
                                      isSupp ? 'bg-neon-mint/10 text-neon-mint' : 'bg-neon-cyan/10 text-neon-cyan'
                                    }`}>
                                      {f.mealType || 'item'}
                                    </span>
                                    <span className="text-white font-bold">{f.name}</span>
                                    {f.time && <span className="text-neutral-500 text-[10px]">({f.time})</span>}
                                  </div>
                                  <span className="text-neutral-400">
                                    <span className="text-neon-yellow">{f.calories} kcal</span> • <span className="text-neon-mint">{f.protein}g</span>
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </div>

    </div>
  );
}
