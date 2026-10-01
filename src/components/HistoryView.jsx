import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Search,
  Sparkles,
  Calendar,
  Flame,
  Dumbbell,
  Zap,
  Activity,
  Footprints,
  Scale,
  Eye,
  EyeOff,
  Plus
} from 'lucide-react';
import { formatDisplayDate, getLocalDateString } from '../utils/helpers';
import ItemActionMenu from './ItemActionMenu';
import EditWorkoutModal from './EditWorkoutModal';
import EditFoodModal from './EditFoodModal';
import WeightModal from './WeightModal';

export default function HistoryView({
  data = {},
  goals = {},
  isWeightVisible = false,
  onToggleVisibility,
  onUpdateWeight,
  onSelectDate,
  onUpdateWorkout,
  onDeleteWorkout,
  onUpdateFood,
  onDeleteFood
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedDate, setExpandedDate] = useState(null);
  const [editingWorkoutItem, setEditingWorkoutItem] = useState(null);
  const [editingFoodItem, setEditingFoodItem] = useState(null);
  const [editingWeightDate, setEditingWeightDate] = useState(null);
  const [selectedHistoryDate, setSelectedHistoryDate] = useState(() => getLocalDateString());

  // Ordenar fechas descendente
  const allDates = Object.keys(data).sort((a, b) => new Date(b) - new Date(a));

  // Filtrado por buscador
  const filteredDates = allDates.filter(dateStr => {
    const dayData = data[dateStr] || { foods: [], workouts: [], cardios: [] };
    const query = searchTerm.toLowerCase();

    const matchesDate = dateStr.includes(query) || formatDisplayDate(dateStr).toLowerCase().includes(query);
    const matchesFood = (dayData.foods || []).some(f => f.name.toLowerCase().includes(query));
    const matchesWorkout = (dayData.workouts || []).some(w => w.name.toLowerCase().includes(query));
    const matchesCardio = (dayData.cardios || []).some(c =>
      (c.from || '').toLowerCase().includes(query) ||
      (c.to || '').toLowerCase().includes(query) ||
      (c.type || '').toLowerCase().includes(query)
    );

    return matchesDate || matchesFood || matchesWorkout || matchesCardio;
  });

  const toggleExpand = (dateStr) => {
    setExpandedDate(expandedDate === dateStr ? null : dateStr);
  };

  // Datos del día seleccionado en el panel superior
  const currentDayStats = data[selectedHistoryDate] || { foods: [], workouts: [], cardios: [] };
  const dayCalories = (currentDayStats.foods || []).reduce((acc, f) => acc + (Number(f.calories) || 0), 0);
  const dayProtein = (currentDayStats.foods || []).reduce((acc, f) => acc + (Number(f.protein) || 0), 0);
  const dayTonnage = (currentDayStats.workouts || []).reduce(
    (acc, w) => acc + (Number(w.weight) || 0),
    0
  );
  const dayCardios = currentDayStats.cardios || [];
  const dayCardioKm = dayCardios.reduce((acc, c) => acc + (Number(c.distance) || 0), 0);
  const dayCardioBurned = dayCardios.reduce((acc, c) => acc + (Number(c.caloriesBurned) || 0), 0);

  const calGoal = goals?.calories || 2400;
  const protGoal = goals?.protein || 150;
  const tonGoal = goals?.tonnage || 5000;

  const calPercent = Math.min(Math.round((dayCalories / calGoal) * 100), 100);
  const protPercent = Math.min(Math.round((dayProtein / protGoal) * 100), 100);
  const tonPercent = Math.min(Math.round((dayTonnage / tonGoal) * 100), 100);

  return (
    <div className="space-y-10 animate-fade-in-up">

      {/* Cabecera Principal */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-200 pb-6">
        <div>
          <span className="text-xs font-mono tracking-widest text-zinc-500 uppercase">// BASE DE DATOS DIARIA</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 uppercase tracking-tight font-display mt-0.5">
            HISTORIAL & REGISTROS
          </h2>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Botón Ocultar / Mostrar Peso */}
          <button
            type="button"
            onClick={onToggleVisibility}
            className="px-3.5 py-2 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer bg-white hover:bg-zinc-50 text-zinc-800 border border-zinc-200 shadow-sm"
            title={isWeightVisible ? 'Ocultar peso en el historial' : 'Mostrar peso'}
          >
            {isWeightVisible ? (
              <>
                <EyeOff className="w-3.5 h-3.5 text-zinc-500" />
                <span>Ocultar Peso</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5 text-zinc-900" />
                <span>Revelar Peso</span>
              </>
            )}
          </button>

          <div className="text-xs font-mono text-zinc-600 bg-white px-3.5 py-2 rounded-xl border border-zinc-200 shadow-sm">
            Total días: <strong className="text-zinc-900">{allDates.length}</strong>
          </div>
        </div>
      </div>

      {/* RESUMEN DEL DÍA SELECCIONADO */}
      <div className="space-y-6 pt-2">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-[10px] font-mono text-zinc-500 tracking-widest uppercase">// RESUMEN DEL DÍA</span>
            <h3 className="text-lg font-extrabold text-zinc-900 uppercase tracking-tight font-display">
              {formatDisplayDate(selectedHistoryDate)}
            </h3>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
            <span>FECHA:</span>
            <input
              type="date"
              value={selectedHistoryDate}
              onChange={(e) => setSelectedHistoryDate(e.target.value)}
              className="bg-white border border-zinc-300 text-zinc-900 px-3 py-1.5 rounded-lg text-xs font-mono focus:border-black outline-none cursor-pointer shadow-sm"
            />
          </div>
        </div>

        {/* MÉTRICAS SUELTAS Y MODERNAS */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 py-4 border-y border-zinc-200 font-mono">

          {/* 1. Calorías Totales */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs tracking-wider uppercase">
              <span className="text-zinc-600 font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-black"></span>
                CALORÍAS
              </span>
              <span className="text-zinc-900 font-extrabold">{calPercent}%</span>
            </div>

            <div className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
              {dayCalories.toLocaleString()} <span className="text-xs font-normal text-zinc-500 uppercase">KCAL</span>
            </div>

            {/* Barra de progreso minimalista */}
            <div className="w-full bg-zinc-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-black h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${calPercent}%` }}
              />
            </div>
          </div>

          {/* 2. Proteínas Totales */}
          <div className="space-y-2 sm:border-l sm:border-zinc-200 sm:pl-6">
            <div className="flex items-center justify-between text-xs tracking-wider uppercase">
              <span className="text-zinc-600 font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-700"></span>
                PROTEÍNAS
              </span>
              <span className="text-zinc-900 font-extrabold">{protPercent}%</span>
            </div>

            <div className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
              {dayProtein} <span className="text-xs font-normal text-zinc-500 uppercase">G PROT</span>
            </div>

            {/* Barra de progreso minimalista */}
            <div className="w-full bg-zinc-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-zinc-800 h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${protPercent}%` }}
              />
            </div>
          </div>

          {/* 3. Peso Total Cargas Gym */}
          <div className="space-y-2 lg:border-l lg:border-zinc-200 lg:pl-6">
            <div className="flex items-center justify-between text-xs tracking-wider uppercase">
              <span className="text-zinc-600 font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-900"></span>
                CARGA GYM
              </span>
              <span className="text-zinc-900 font-extrabold">{tonPercent}%</span>
            </div>

            <div className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
              {dayTonnage.toLocaleString()} <span className="text-xs font-normal text-zinc-500 uppercase">KG</span>
            </div>

            {/* Barra de progreso minimalista */}
            <div className="w-full bg-zinc-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-zinc-900 h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${tonPercent}%` }}
              />
            </div>
          </div>

          {/* 4. Peso Corporal del Día */}
          <div className="space-y-2 lg:border-l lg:border-zinc-200 lg:pl-6">
            <div className="flex items-center justify-between text-xs tracking-wider uppercase">
              <span className="text-zinc-600 font-bold flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-zinc-900" />
                PESO CORPORAL
              </span>
              <button
                type="button"
                onClick={() => setEditingWeightDate(selectedHistoryDate)}
                className="text-[10px] text-zinc-900 hover:text-black uppercase font-bold transition-colors underline cursor-pointer"
              >
                {currentDayStats.weight !== undefined && currentDayStats.weight !== null ? 'Editar' : '+ Cargar'}
              </button>
            </div>

            <div className="flex items-baseline gap-1.5">
              {currentDayStats.weight !== undefined && currentDayStats.weight !== null && currentDayStats.weight !== '' ? (
                isWeightVisible ? (
                  <>
                    <span className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
                      {parseFloat(currentDayStats.weight).toFixed(1)}
                    </span>
                    <span className="text-xs font-bold text-zinc-500 uppercase">KG</span>
                  </>
                ) : (
                  <span className="text-xl sm:text-2xl font-bold text-zinc-400 tracking-widest">
                    •••• <span className="text-xs font-normal">KG</span>
                  </span>
                )
              ) : (
                <span className="text-sm text-zinc-400 italic">
                  Sin registrar
                </span>
              )}
            </div>

            <div className="text-[10px] text-zinc-500 truncate">
              {currentDayStats.weight !== undefined && currentDayStats.weight !== null
                ? isWeightVisible
                  ? 'Peso corporal guardado'
                  : 'Valor protegido'
                : 'Toca en + Cargar para registrar'}
            </div>
          </div>

        </section>

        {/* Banner de Cardio del día */}
        {dayCardios.length > 0 && (
          <div className="p-4 rounded-2xl bg-white border border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-zinc-100 text-zinc-900">
                <Footprints className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider block">
                  // CARDIO & DESPLAZAMIENTOS ({dayCardios.length} {dayCardios.length === 1 ? 'SESIÓN' : 'SESIONES'})
                </span>
                <p className="text-zinc-900 font-extrabold text-base font-mono">
                  {Math.round(dayCardioKm * 10) / 10} <span className="text-xs text-zinc-500 font-sans">KM</span> • <span>~{dayCardioBurned}</span> <span className="text-xs text-zinc-500 font-sans">KCAL QUEMADAS</span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {dayCardios.map((c) => (
                <span key={c.id} className="text-xs font-mono px-2.5 py-1.5 rounded-lg bg-zinc-50 text-zinc-800 border border-zinc-200 flex items-center gap-1.5">
                  <span className="text-black font-bold uppercase">{c.type}:</span>
                  <span>{c.from} ➔ {c.to}</span>
                  <span className="text-zinc-900 font-bold">({c.distance}km)</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Buscador & Lista de Días */}
      <div className="space-y-6">

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="text-xs font-mono tracking-widest text-zinc-500 uppercase">
            // REGISTRO CRONOLÓGICO DE DÍAS
          </div>

          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Buscar ejercicio, comida, fecha..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-zinc-300 focus:border-black px-4 py-2.5 text-xs text-zinc-900 rounded-xl font-mono placeholder-zinc-400 outline-none shadow-sm transition-all"
            />
          </div>
        </div>

        {filteredDates.length === 0 ? (
          <div className="py-16 text-center text-zinc-500 font-mono text-sm border-t border-b border-zinc-200">
            No hay registros disponibles en el historial todavía.
          </div>
        ) : (
          <div className="space-y-3.5">
            {filteredDates.map((dateStr) => {
              const dayData = data[dateStr] || { foods: [], workouts: [], cardios: [] };
              const foods = dayData.foods || [];
              const workouts = dayData.workouts || [];
              const cardios = dayData.cardios || [];

              const totalCalories = foods.reduce((acc, f) => acc + (Number(f.calories) || 0), 0);
              const totalProtein = foods.reduce((acc, f) => acc + (Number(f.protein) || 0), 0);
              const totalTonnage = workouts.reduce((acc, w) => acc + (Number(w.weight) || 0), 0);
              const totalCardioKm = cardios.reduce((acc, c) => acc + (Number(c.distance) || 0), 0);
              const totalCardioBurned = cardios.reduce((acc, c) => acc + (Number(c.caloriesBurned) || 0), 0);

              const isExpanded = expandedDate === dateStr;
              const isSelected = selectedHistoryDate === dateStr;

              return (
                <div
                  key={dateStr}
                  className={`bg-white border rounded-2xl transition-all shadow-sm relative ${
                    isExpanded ? 'overflow-visible z-20 border-zinc-300 shadow-md' : 'overflow-hidden z-0 border-zinc-200 hover:border-zinc-300'
                  } ${
                    isSelected ? 'ring-1 ring-black' : ''
                  }`}
                >
                  <div
                    onClick={() => toggleExpand(dateStr)}
                    className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer select-none hover:bg-zinc-50/70 transition-colors rounded-t-2xl"
                  >
                    <div>
                      <div className="flex items-center gap-3">
                        <h4 className="font-extrabold text-base sm:text-lg text-zinc-900 capitalize">{formatDisplayDate(dateStr)}</h4>
                        <span className="text-[11px] font-mono text-zinc-700 px-2 py-0.5 rounded-md bg-zinc-100 border border-zinc-200">
                          {dateStr}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs font-mono text-zinc-500 mt-1 flex-wrap">
                        <span>{workouts.length} ejercicios</span>
                        <span>•</span>
                        <span>{foods.length} alimentos</span>
                        {cardios.length > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-zinc-900 font-bold flex items-center gap-1">
                              <Footprints className="w-3.5 h-3.5" />
                              {Math.round(totalCardioKm * 10) / 10} km cardio
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-2.5 text-xs font-mono flex-wrap">
                        <span className="text-zinc-900 font-extrabold">{totalTonnage.toLocaleString()} kg gym</span>
                        <span className="text-zinc-300">•</span>
                        <span className="text-zinc-700 font-semibold">{totalCalories} kcal</span>
                        <span className="text-zinc-300">•</span>
                        <span className="text-zinc-700 font-semibold">{totalProtein}g prot</span>

                        {/* Tag de Peso del Día */}
                        {dayData.weight !== undefined && dayData.weight !== null && dayData.weight !== '' ? (
                          <>
                            <span className="text-zinc-300">•</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingWeightDate(dateStr);
                              }}
                              className="text-zinc-900 font-bold bg-zinc-100 hover:bg-zinc-200 px-2.5 py-1 rounded-lg border border-zinc-200 flex items-center gap-1 transition-colors cursor-pointer"
                              title="Editar peso corporal de este día"
                            >
                              <Scale className="w-3 h-3 text-zinc-700" />
                              <span>{isWeightVisible ? `${parseFloat(dayData.weight).toFixed(1)} kg` : '•••• kg'}</span>
                            </button>
                          </>
                        ) : (
                          <>
                            <span className="text-zinc-300">•</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingWeightDate(dateStr);
                              }}
                              className="text-zinc-500 hover:text-black text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                              title="Cargar peso para este día"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Peso</span>
                            </button>
                          </>
                        )}

                        {cardios.length > 0 && (
                          <>
                            <span className="text-zinc-300">•</span>
                            <span className="text-zinc-600 font-medium">~{totalCardioBurned} kcal cardio</span>
                          </>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectDate(dateStr);
                        }}
                        className="px-3.5 py-1.5 bg-black text-white text-xs font-mono font-bold uppercase rounded-lg hover:bg-zinc-800 transition-colors shadow-sm cursor-pointer"
                      >
                        Cargar Día
                      </button>

                      <div className="text-zinc-400">
                        {isExpanded ? <ChevronDown className="w-5 h-5 text-black" /> : <ChevronRight className="w-5 h-5" />}
                      </div>
                    </div>
                  </div>

                  {/* Desglose Expandible */}
                  {isExpanded && (
                    <div className={`p-6 border-t border-zinc-200 bg-zinc-50/60 grid grid-cols-1 ${cardios.length > 0 ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-6 animate-fade-in-up overflow-visible rounded-b-2xl`}>

                      {/* Ejercicios */}
                      <div className="space-y-3">
                        <div className="text-xs font-mono text-zinc-900 uppercase font-bold tracking-wider">
                          // ENTRENAMIENTOS ({workouts.length})
                        </div>
                        {workouts.length === 0 ? (
                          <p className="text-xs font-mono text-zinc-500">Sin ejercicios registrados.</p>
                        ) : (
                          <div className="space-y-2">
                            {workouts.map(w => {
                              return (
                                <div key={w.id} className="p-3 bg-white border border-zinc-200 rounded-xl flex justify-between items-center text-xs font-mono shadow-sm">
                                  <div className="space-y-1">
                                    <div className="text-zinc-900 font-bold">{w.name}</div>
                                    {w.detailedSets && Array.isArray(w.detailedSets) && w.detailedSets.length > 0 ? (
                                      <div className="flex flex-wrap items-center gap-1.5 text-zinc-500">
                                        <span className="text-zinc-700 font-semibold">{w.sets} series:</span>
                                        {w.detailedSets.map((s, i) => (
                                          <span key={i} className="px-1.5 py-0.5 rounded bg-zinc-100 border border-zinc-200 text-zinc-900 font-bold text-[10px]">
                                            {s.reps}×<span>{s.weight}kg</span>
                                          </span>
                                        ))}
                                      </div>
                                    ) : (
                                      <div className="text-zinc-500">
                                        {w.sets}×{w.reps} con <strong className="text-zinc-900">{w.weight}kg</strong>
                                      </div>
                                    )}
                                  </div>
                                  <ItemActionMenu
                                    onEdit={() => setEditingWorkoutItem({ workout: w, dateStr })}
                                    onDelete={() => onDeleteWorkout && onDeleteWorkout(w.id, dateStr)}
                                    itemName={w.name}
                                  />
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Comidas y Suplementos */}
                      <div className="space-y-3">
                        <div className="text-xs font-mono text-zinc-900 uppercase font-bold tracking-wider">
                          // NUTRICIÓN & SUPLEMENTOS ({foods.length})
                        </div>
                        {foods.length === 0 ? (
                          <p className="text-xs font-mono text-zinc-500">Sin alimentos registrados.</p>
                        ) : (
                          <div className="space-y-2">
                            {foods.map(f => {
                              const isSupp = f.mealType === 'suplementacion';
                              return (
                                <div key={f.id} className="p-3 bg-white border border-zinc-200 rounded-xl flex justify-between items-center text-xs font-mono shadow-sm">
                                  <div className="space-y-0.5">
                                    <div className="flex items-center gap-2">
                                      <span className="text-[10px] px-1.5 py-0.5 rounded uppercase font-bold bg-zinc-100 text-zinc-800 border border-zinc-200">
                                        {f.mealType || 'item'}
                                      </span>
                                      <span className="text-zinc-900 font-bold">{f.name}</span>
                                      {f.time && <span className="text-zinc-400 text-[10px]">({f.time})</span>}
                                    </div>
                                    <div className="text-zinc-500">
                                      <span className="text-zinc-900 font-semibold">{f.calories} kcal</span> • <span>{f.protein}g</span>
                                    </div>
                                  </div>
                                  <ItemActionMenu
                                    onEdit={() => setEditingFoodItem({ food: f, dateStr })}
                                    onDelete={() => onDeleteFood && onDeleteFood(f.id, dateStr)}
                                    itemName={f.name}
                                  />
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Sesiones de Cardio */}
                      {cardios.length > 0 && (
                        <div className="space-y-3">
                          <div className="text-xs font-mono text-zinc-900 uppercase font-bold tracking-wider flex items-center gap-1.5">
                            <Footprints className="w-3.5 h-3.5" />
                            <span>// CARDIO & DISTANCIA ({cardios.length})</span>
                          </div>
                          <div className="space-y-2">
                            {cardios.map((c) => {
                              return (
                                <div key={c.id} className="p-3 bg-white border border-zinc-200 rounded-xl flex flex-col justify-between gap-1 text-xs font-mono shadow-sm">
                                  <div className="flex justify-between items-center">
                                    <span className="text-[10px] px-1.5 py-0.5 rounded uppercase font-bold bg-zinc-100 text-zinc-900 border border-zinc-200">
                                      {c.type}
                                    </span>
                                    {c.time && <span className="text-zinc-400 text-[10px]">({c.time})</span>}
                                  </div>

                                  <div className="text-zinc-900 font-semibold flex items-center gap-1">
                                    <span>{c.from}</span>
                                    <span className="text-zinc-400 text-[10px]">➔</span>
                                    <span>{c.to}</span>
                                  </div>

                                  <div className="flex justify-between items-center text-zinc-500 text-[11px] pt-0.5">
                                    <span className="text-zinc-900 font-bold">{c.distance} km</span>
                                    <span>~{c.caloriesBurned} kcal</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Modales de Edición */}
      <EditWorkoutModal
        isOpen={!!editingWorkoutItem}
        workout={editingWorkoutItem?.workout}
        onClose={() => setEditingWorkoutItem(null)}
        onSave={(updated) => {
          if (onUpdateWorkout && editingWorkoutItem?.dateStr) {
            onUpdateWorkout(updated.id, updated, editingWorkoutItem.dateStr);
          }
        }}
      />

      <EditFoodModal
        isOpen={!!editingFoodItem}
        food={editingFoodItem?.food}
        onClose={() => setEditingFoodItem(null)}
        onSave={(updated) => {
          if (onUpdateFood && editingFoodItem?.dateStr) {
            onUpdateFood(updated.id, updated, editingFoodItem.dateStr);
          }
        }}
      />

      {/* Modal para Cargar o Modificar Peso */}
      <WeightModal
        isOpen={!!editingWeightDate}
        currentWeight={editingWeightDate && data[editingWeightDate]?.weight ? parseFloat(data[editingWeightDate].weight) : null}
        selectedDate={editingWeightDate || selectedHistoryDate}
        onClose={() => setEditingWeightDate(null)}
        onSaveWeight={(newWeight, targetDate) => {
          if (onUpdateWeight) {
            onUpdateWeight(newWeight, targetDate);
          }
        }}
      />

    </div>
  );
}
