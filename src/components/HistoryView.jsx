import React, { useState } from 'react';
import { 
  ChevronRight, 
  ChevronDown, 
  Search, 
  Sparkles,
  Calendar,
  Flame,
  Dumbbell,
  Zap,
  Activity
} from 'lucide-react';
import { formatDisplayDate, getLocalDateString } from '../utils/helpers';

export default function HistoryView({ data, goals, onSelectDate }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedDate, setExpandedDate] = useState(null);
  const [selectedHistoryDate, setSelectedHistoryDate] = useState(() => getLocalDateString());

  // Ordenar fechas descendente
  const allDates = Object.keys(data).sort((a, b) => new Date(b) - new Date(a));

  // Filtrado por buscador
  const filteredDates = allDates.filter(dateStr => {
    const dayData = data[dateStr] || { foods: [], workouts: [] };
    const query = searchTerm.toLowerCase();
    
    const matchesDate = dateStr.includes(query) || formatDisplayDate(dateStr).toLowerCase().includes(query);
    const matchesFood = (dayData.foods || []).some(f => f.name.toLowerCase().includes(query));
    const matchesWorkout = (dayData.workouts || []).some(w => w.name.toLowerCase().includes(query));

    return matchesDate || matchesFood || matchesWorkout;
  });

  const toggleExpand = (dateStr) => {
    setExpandedDate(expandedDate === dateStr ? null : dateStr);
  };

  // Datos del día seleccionado en el panel superior
  const currentDayStats = data[selectedHistoryDate] || { foods: [], workouts: [] };
  const dayCalories = (currentDayStats.foods || []).reduce((acc, f) => acc + (Number(f.calories) || 0), 0);
  const dayProtein = (currentDayStats.foods || []).reduce((acc, f) => acc + (Number(f.protein) || 0), 0);
  const dayTonnage = (currentDayStats.workouts || []).reduce(
    (acc, w) => acc + (Number(w.sets) || 0) * (Number(w.reps) || 0) * (Number(w.weight) || 0), 
    0
  );

  const calGoal = goals?.calories || 2400;
  const protGoal = goals?.protein || 150;
  const tonGoal = goals?.tonnage || 5000;

  const calPercent = Math.min(Math.round((dayCalories / calGoal) * 100), 100);
  const protPercent = Math.min(Math.round((dayProtein / protGoal) * 100), 100);
  const tonPercent = Math.min(Math.round((dayTonnage / tonGoal) * 100), 100);

  return (
    <div className="space-y-12 animate-slide-up">
      
      {/* Cabecera Principal */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-purple-500/20 pb-6">
        <div>
          <span className="text-xs font-mono tracking-widest text-neon-purple uppercase">// BASE DE DATOS DIARIA</span>
          <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
            HISTORIAL & <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-neon-cyan">REGISTROS</span>
          </h2>
        </div>

        <div className="text-xs font-mono text-neutral-400 bg-space-900 px-4 py-2 rounded-xl border border-white/10">
          Total días registrados: <strong className="text-white">{allDates.length}</strong>
        </div>
      </div>

      {/* RESUMEN DEL DÍA SELECCIONADO - DISEÑO MODERNO Y SUELTO (SIN CUADROS QUE LIMITEN) */}
      <div className="space-y-6 pt-2">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-[10px] font-mono text-neon-purple tracking-widest uppercase">// RESUMEN DEL DÍA</span>
            <h3 className="text-lg font-black text-white uppercase tracking-tight font-display">
              {formatDisplayDate(selectedHistoryDate)}
            </h3>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
            <span>FECHA:</span>
            <input
              type="date"
              value={selectedHistoryDate}
              onChange={(e) => setSelectedHistoryDate(e.target.value)}
              className="bg-space-900 border border-white/10 text-white px-3 py-1.5 rounded-lg text-xs font-mono focus:border-neon-purple outline-none"
            />
          </div>
        </div>

        {/* MÉTRICAS SUELTAS Y MODERNAS CON COLOR UNIFICADO */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 py-4 border-y border-white/5">
          
          {/* 1. Calorías Totales */}
          <div className="space-y-3 relative group">
            <div className="flex items-center justify-between text-xs font-mono tracking-wider text-neutral-400 uppercase">
              <span className="text-neutral-300 font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-neon-purple"></span>
                CALORÍAS TOTALES
              </span>
              <span className="text-neon-cyan font-bold">{calPercent}% DE {calGoal}</span>
            </div>
            
            <div className="text-3xl sm:text-4xl font-black font-mono text-white tracking-tight">
              {dayCalories.toLocaleString()} <span className="text-xs font-mono text-neon-cyan font-normal uppercase">KCAL</span>
            </div>

            {/* Barra de progreso minimalista */}
            <div className="w-full bg-white/5 rounded-full h-1 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-neon-purple to-neon-cyan h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${calPercent}%` }}
              />
            </div>
          </div>

          {/* 2. Proteínas Totales */}
          <div className="space-y-3 relative group md:border-l md:border-white/5 md:pl-8">
            <div className="flex items-center justify-between text-xs font-mono tracking-wider text-neutral-400 uppercase">
              <span className="text-neutral-300 font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-neon-purple"></span>
                PROTEÍNAS TOTALES
              </span>
              <span className="text-neon-cyan font-bold">{protPercent}% DE {protGoal}G</span>
            </div>
            
            <div className="text-3xl sm:text-4xl font-black font-mono text-white tracking-tight">
              {dayProtein} <span className="text-xs font-mono text-neon-cyan font-normal uppercase">G PROT</span>
            </div>

            {/* Barra de progreso minimalista */}
            <div className="w-full bg-white/5 rounded-full h-1 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-neon-purple to-neon-cyan h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${protPercent}%` }}
              />
            </div>
          </div>

          {/* 3. Volumen de Carga */}
          <div className="space-y-3 relative group md:border-l md:border-white/5 md:pl-8">
            <div className="flex items-center justify-between text-xs font-mono tracking-wider text-neutral-400 uppercase">
              <span className="text-neutral-300 font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-neon-purple"></span>
                VOLUMEN DE CARGA
              </span>
              <span className="text-neon-cyan font-bold">{tonPercent}% DE {tonGoal}KG</span>
            </div>
            
            <div className="text-3xl sm:text-4xl font-black font-mono text-white tracking-tight">
              {dayTonnage.toLocaleString()} <span className="text-xs font-mono text-neon-cyan font-normal uppercase">KG TOT.</span>
            </div>

            {/* Barra de progreso minimalista */}
            <div className="w-full bg-white/5 rounded-full h-1 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-neon-purple to-neon-cyan h-full rounded-full transition-all duration-700 ease-out"
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
                        <span className="text-white font-bold">{totalTonnage.toLocaleString()} kg</span>
                        <span className="text-neutral-600">•</span>
                        <span className="text-neon-cyan">{totalCalories} kcal</span>
                        <span className="text-neutral-600">•</span>
                        <span className="text-neon-purple">{totalProtein}g prot</span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectDate(dateStr);
                        }}
                        className="px-4 py-2 bg-gradient-to-r from-neon-purple to-neon-violet text-white text-xs font-mono font-bold uppercase rounded-lg hover:opacity-90 transition-opacity shadow-sm"
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
                                    {w.sets}×{w.reps} con <strong className="text-neon-cyan">{w.weight}kg</strong> <span className="text-neutral-400 font-normal">({vol}kg)</span>
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
                                      isSupp ? 'bg-neon-purple/10 text-neon-purple' : 'bg-neon-cyan/10 text-neon-cyan'
                                    }`}>
                                      {f.mealType || 'item'}
                                    </span>
                                    <span className="text-white font-bold">{f.name}</span>
                                    {f.time && <span className="text-neutral-500 text-[10px]">({f.time})</span>}
                                  </div>
                                  <span className="text-neutral-400">
                                    <span className="text-neon-cyan">{f.calories} kcal</span> • <span className="text-neon-purple">{f.protein}g</span>
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
