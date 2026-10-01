import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Check,
  Dumbbell,
  Sparkles,
  Layers,
  Sliders,
  X
} from 'lucide-react';
import spriteSheetImg from '../assets/gym-exercises-spritesheet.png';

// 24 Ejercicios organizados en una cuadrícula de 4 filas x 6 columnas
export const GYM_EXERCISES_SPRITES = [
  // Fila 1
  { id: 'press_banca_plano', name: 'Press Banca Plano', category: 'Pecho', row: 0, col: 0, defaultWeight: 60, defaultReps: 10 },
  { id: 'jalon_pecho', name: 'Jalón al Pecho Polea', category: 'Espalda', row: 0, col: 1, defaultWeight: 50, defaultReps: 12 },
  { id: 'prensa_piernas', name: 'Prensa de Piernas', category: 'Piernas', row: 0, col: 2, defaultWeight: 120, defaultReps: 10 },
  { id: 'sentadilla_rack', name: 'Sentadilla en Rack', category: 'Piernas', row: 0, col: 3, defaultWeight: 70, defaultReps: 8 },
  { id: 'mancuernas_curl', name: 'Curl con Mancuernas', category: 'Bíceps', row: 0, col: 4, defaultWeight: 14, defaultReps: 12 },
  { id: 'peso_muerto', name: 'Peso Muerto Barra', category: 'Espalda / Piernas', row: 0, col: 5, defaultWeight: 80, defaultReps: 6 },
  
  // Fila 2
  { id: 'press_militar_maquina', name: 'Press Militar Hombros', category: 'Hombros', row: 1, col: 0, defaultWeight: 40, defaultReps: 10 },
  { id: 'extension_cuadriceps', name: 'Extensión Cuádriceps', category: 'Piernas', row: 1, col: 1, defaultWeight: 45, defaultReps: 12 },
  { id: 'curl_femoral_tumbado', name: 'Curl Femoral Tumbado', category: 'Piernas', row: 1, col: 2, defaultWeight: 40, defaultReps: 12 },
  { id: 'remo_barra_t', name: 'Remo Barra T / Inclinado', category: 'Espalda', row: 1, col: 3, defaultWeight: 50, defaultReps: 10 },
  { id: 'peck_deck_aperturas', name: 'Peck Deck (Mariposa)', category: 'Pecho', row: 1, col: 4, defaultWeight: 45, defaultReps: 12 },
  { id: 'curl_biceps_maquina', name: 'Curl Bíceps Máquina', category: 'Bíceps', row: 1, col: 5, defaultWeight: 35, defaultReps: 10 },

  // Fila 3
  { id: 'cinta_correr', name: 'Cinta de Correr', category: 'Cardio', row: 2, col: 0, defaultWeight: 0, defaultReps: 20 },
  { id: 'eliptica', name: 'Elíptica', category: 'Cardio', row: 2, col: 1, defaultWeight: 0, defaultReps: 20 },
  { id: 'bici_estatica', name: 'Bicicleta Estática', category: 'Cardio', row: 2, col: 2, defaultWeight: 0, defaultReps: 20 },
  { id: 'dominadas_barra', name: 'Dominadas en Barra', category: 'Espalda', row: 2, col: 3, defaultWeight: 0, defaultReps: 8 },
  { id: 'kettlebells_swing', name: 'Kettlebell / Rusas', category: 'Fullbody', row: 2, col: 4, defaultWeight: 16, defaultReps: 15 },
  { id: 'abdominales_declinado', name: 'Abdominales Banco', category: 'Core', row: 2, col: 5, defaultWeight: 0, defaultReps: 20 },

  // Fila 4
  { id: 'triceps_polea', name: 'Tríceps Polea Cuerda', category: 'Tríceps', row: 3, col: 0, defaultWeight: 25, defaultReps: 12 },
  { id: 'curl_barra_pie', name: 'Curl Bíceps Barra Pie', category: 'Bíceps', row: 3, col: 1, defaultWeight: 30, defaultReps: 10 },
  { id: 'elevacion_gemelos', name: 'Gemelos en Máquina', category: 'Piernas', row: 3, col: 2, defaultWeight: 60, defaultReps: 15 },
  { id: 'press_inclinado_barra', name: 'Press Inclinado Barra', category: 'Pecho', row: 3, col: 3, defaultWeight: 50, defaultReps: 10 },
  { id: 'remo_polea_baja', name: 'Remo Polea Baja', category: 'Espalda', row: 3, col: 4, defaultWeight: 55, defaultReps: 10 },
  { id: 'balon_medicinal', name: 'Balón Medicinal Slam', category: 'Core / Potencia', row: 3, col: 5, defaultWeight: 9, defaultReps: 15 }
];

// Placas de peso de la torre de placas (Weight Stack)
const WEIGHT_STACK_PLATES = [
  5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 110, 120
];

export default function VisualGymExercisePicker({
  onAddWorkout,
  onClose
}) {
  const [selectedExercise, setSelectedExercise] = useState(GYM_EXERCISES_SPRITES[0]);
  const [activeSetIndex, setActiveSetIndex] = useState(0);
  const [currentWeight, setCurrentWeight] = useState(GYM_EXERCISES_SPRITES[0].defaultWeight);
  const [currentReps, setCurrentReps] = useState(GYM_EXERCISES_SPRITES[0].defaultReps);
  
  // Lista de series configuradas
  const [seriesList, setSeriesList] = useState([
    { setNumber: 1, weight: GYM_EXERCISES_SPRITES[0].defaultWeight, reps: GYM_EXERCISES_SPRITES[0].defaultReps }
  ]);

  const carouselRef = useRef(null);
  const activePlateRef = useRef(null);

  // Al seleccionar un ejercicio nuevo del carrusel
  const handleSelectExercise = (exercise) => {
    setSelectedExercise(exercise);
    setCurrentWeight(exercise.defaultWeight);
    setCurrentReps(exercise.defaultReps);
    setSeriesList([
      { setNumber: 1, weight: exercise.defaultWeight, reps: exercise.defaultReps }
    ]);
    setActiveSetIndex(0);
  };

  const scrollCarousel = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -220 : 220;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Ajustar peso de la serie activa
  const handleWeightChange = (newWeight) => {
    const val = Math.max(0, Math.min(300, Math.round(newWeight * 10) / 10));
    setCurrentWeight(val);
    setSeriesList((prev) =>
      prev.map((s, idx) => (idx === activeSetIndex ? { ...s, weight: val } : s))
    );
  };

  // Ajustar repeticiones de la serie activa
  const handleRepsChange = (newReps) => {
    const val = Math.max(1, Math.min(200, parseInt(newReps, 10) || 1));
    setCurrentReps(val);
    setSeriesList((prev) =>
      prev.map((s, idx) => (idx === activeSetIndex ? { ...s, reps: val } : s))
    );
  };

  // Agregar nueva serie
  const handleAddNextSet = () => {
    const nextSetNumber = seriesList.length + 1;
    const newSet = {
      setNumber: nextSetNumber,
      weight: currentWeight,
      reps: currentReps
    };
    const updated = [...seriesList, newSet];
    setSeriesList(updated);
    setActiveSetIndex(updated.length - 1);
  };

  // Seleccionar una serie existente para editarla
  const handleSelectSetIndex = (idx) => {
    setActiveSetIndex(idx);
    const target = seriesList[idx];
    if (target) {
      setCurrentWeight(target.weight);
      setCurrentReps(target.reps);
    }
  };

  // Eliminar una serie
  const handleRemoveSet = (idxToRemove) => {
    if (seriesList.length <= 1) return;
    const filtered = seriesList
      .filter((_, idx) => idx !== idxToRemove)
      .map((s, idx) => ({ ...s, setNumber: idx + 1 }));
    setSeriesList(filtered);
    const newActiveIdx = Math.max(0, Math.min(activeSetIndex, filtered.length - 1));
    setActiveSetIndex(newActiveIdx);
    setCurrentWeight(filtered[newActiveIdx].weight);
    setCurrentReps(filtered[newActiveIdx].reps);
  };

  // Guardar ejercicio completo en la app
  const handleSaveCompleteWorkout = () => {
    if (!selectedExercise) return;

    const maxWeight = Math.max(...seriesList.map((s) => Number(s.weight) || 0));
    const firstReps = seriesList[0]?.reps || 10;

    const detailedSets = seriesList.map((s) => ({
      setNumber: s.setNumber,
      weight: Number(s.weight) || 0,
      reps: Number(s.reps) || 10
    }));

    onAddWorkout({
      name: selectedExercise.name,
      sets: seriesList.length,
      reps: firstReps,
      weight: maxWeight,
      detailedSets: detailedSets.length > 1 ? detailedSets : null
    });

    if (onClose) onClose();
  };

  // Calcular placa activa más cercana para el visual de la torre
  const activePlateIndex = useMemo(() => {
    let closestIdx = 0;
    let minDiff = Infinity;
    WEIGHT_STACK_PLATES.forEach((plate, idx) => {
      const diff = Math.abs(plate - currentWeight);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = idx;
      }
    });
    return closestIdx;
  }, [currentWeight]);

  return (
    <div className="w-full bg-white border border-zinc-300 rounded-3xl p-4 sm:p-6 shadow-md space-y-5 text-zinc-950 select-none">
      
      {/* 1. CABECERA */}
      <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 text-xs font-mono font-extrabold uppercase tracking-wider text-black">
            <Sparkles className="w-4 h-4 text-black" />
            <span>// SELECTOR VISUAL DE EJERCICIOS & CARGAS</span>
          </div>
          <h3 className="text-lg sm:text-xl font-black font-display tracking-tight text-black uppercase">
            Elige tu ejercicio y ajusta las placas
          </h3>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-zinc-600 hover:text-black hover:bg-zinc-100 rounded-xl transition-colors cursor-pointer"
            title="Cerrar selector visual"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* 2. CARRUSEL / RULETA HORIZONTAL COMPACTA DE EJERCICIOS */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-extrabold uppercase tracking-wider text-zinc-800 flex items-center gap-1.5">
            <Dumbbell className="w-3.5 h-3.5 text-black" />
            <span>1. Ejercicios & Máquinas ({GYM_EXERCISES_SPRITES.length})</span>
          </span>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => scrollCarousel('left')}
              className="p-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 text-black transition-colors cursor-pointer shadow-sm"
              title="Desplazar a la izquierda"
            >
              <ChevronLeft className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
            <button
              type="button"
              onClick={() => scrollCarousel('right')}
              className="p-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 text-black transition-colors cursor-pointer shadow-sm"
              title="Desplazar a la derecha"
            >
              <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Carrusel Deslizable Compacto */}
        <div
          ref={carouselRef}
          className="flex items-stretch gap-2.5 overflow-x-auto pb-2.5 pt-1 scroll-smooth snap-x snap-mandatory"
          style={{ scrollbarWidth: 'thin' }}
        >
          {GYM_EXERCISES_SPRITES.map((ex) => {
            const isSelected = selectedExercise?.id === ex.id;
            const posX = (ex.col / 5) * 100;
            const posY = (ex.row / 3) * 100;

            return (
              <button
                key={ex.id}
                type="button"
                onClick={() => handleSelectExercise(ex)}
                className={`flex-shrink-0 w-28 sm:w-32 snap-center p-2 rounded-2xl border transition-all flex flex-col items-center justify-between text-center cursor-pointer group select-none ${
                  isSelected
                    ? 'bg-zinc-950 text-white border-black shadow-md ring-2 ring-black scale-[1.02]'
                    : 'bg-zinc-50 hover:bg-white border-zinc-200 text-zinc-900 hover:border-zinc-400 shadow-sm'
                }`}
              >
                {/* Sprite isométrico */}
                <div className={`w-16 h-16 sm:w-18 sm:h-18 rounded-xl overflow-hidden flex items-center justify-center p-1 relative ${
                  isSelected ? 'bg-zinc-900' : 'bg-zinc-100 group-hover:bg-zinc-200/60'
                }`}>
                  <div
                    className="w-full h-full transform group-hover:scale-105 transition-transform duration-300"
                    style={{
                      backgroundImage: `url(${spriteSheetImg})`,
                      backgroundSize: '600% 400%',
                      backgroundPosition: `${posX}% ${posY}%`,
                      backgroundRepeat: 'no-repeat'
                    }}
                  />
                  {isSelected && (
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-white shadow-sm ring-1 ring-black animate-pulse" />
                  )}
                </div>

                <div className="mt-1.5 w-full space-y-0.5">
                  <span className={`text-[9px] font-mono uppercase tracking-wider block font-bold truncate ${
                    isSelected ? 'text-zinc-400' : 'text-zinc-500'
                  }`}>
                    {ex.category}
                  </span>
                  <h4 className={`text-[11px] font-black font-display tracking-tight leading-tight line-clamp-1 ${
                    isSelected ? 'text-white' : 'text-black'
                  }`}>
                    {ex.name}
                  </h4>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. PANEL DE CARGA DE SERIES & PESOS */}
      {selectedExercise && (
        <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 sm:p-5 space-y-4 shadow-inner">
          
          {/* Fila Superior: Ejercicio Activo + Pestañas de Series */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-zinc-200 pb-3">
            <div>
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">
                // CONFIGURANDO
              </span>
              <h4 className="text-base sm:text-lg font-black text-black uppercase tracking-tight font-display">
                {selectedExercise.name}
              </h4>
            </div>

            {/* Pestañas de Series */}
            <div className="flex flex-wrap items-center gap-1.5">
              {seriesList.map((s, idx) => {
                const isActive = activeSetIndex === idx;
                return (
                  <div key={idx} className="relative group">
                    <button
                      type="button"
                      onClick={() => handleSelectSetIndex(idx)}
                      className={`px-3 py-1 rounded-xl font-mono text-xs font-extrabold uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
                        isActive
                          ? 'bg-black text-white shadow-sm'
                          : 'bg-white text-zinc-800 hover:text-black border border-zinc-300'
                      }`}
                    >
                      <span>Serie {s.setNumber}</span>
                      <span className={`text-[10px] font-bold ${isActive ? 'text-zinc-300' : 'text-zinc-600'}`}>
                        ({s.weight}kg × {s.reps})
                      </span>
                    </button>

                    {seriesList.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveSet(idx);
                        }}
                        className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-zinc-300 hover:bg-rose-600 text-black hover:text-white flex items-center justify-center text-[9px] font-bold shadow-sm transition-colors"
                        title="Eliminar serie"
                      >
                        ×
                      </button>
                    )}
                  </div>
                );
              })}

              {/* Botón + Añadir Serie */}
              <button
                type="button"
                onClick={handleAddNextSet}
                className="px-2.5 py-1 rounded-xl bg-zinc-200 hover:bg-zinc-300 text-black font-mono text-xs font-extrabold uppercase transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                title="Agregar otra serie"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>+ Serie</span>
              </button>
            </div>
          </div>

          {/* CUADRÍCULA COMPACTA: TORRE DE PLACAS + BARRITA DESLIZANTE & REPETICIONES */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">

            {/* COLUMNA IZQUIERDA (6 COLS): TORRE DE PLACAS CON PALITO */}
            <div className="md:col-span-6 bg-white border border-zinc-200 rounded-2xl p-3.5 shadow-sm space-y-3">
              
              <div className="flex items-center justify-between border-b border-zinc-100 pb-1.5">
                <span className="text-[11px] font-mono font-extrabold uppercase text-zinc-800 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-black" />
                  <span>Torre de Placas & Clavija</span>
                </span>
                <span className="text-[10px] font-mono font-bold text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">
                  Serie {activeSetIndex + 1}/{seriesList.length}
                </span>
              </div>

              {/* MÁQUINA DE PLACAS */}
              <div className="relative bg-zinc-100 border border-zinc-300 rounded-xl p-3 flex flex-col items-center">
                
                {/* Polea y Cable Superior */}
                <div className="w-full flex flex-col items-center mb-1">
                  <div className="w-6 h-6 rounded-full border-2 border-zinc-800 bg-zinc-300 flex items-center justify-center shadow-inner relative">
                    <div className="w-2 h-2 rounded-full bg-zinc-900" />
                  </div>
                  <div className="w-0.5 h-4 bg-zinc-800" />
                </div>

                {/* Guías de Acero Laterales */}
                <div className="relative w-full max-w-xs flex items-center justify-between px-2">
                  <div className="absolute left-4 top-0 bottom-0 w-1 bg-gradient-to-r from-zinc-400 via-zinc-200 to-zinc-500 rounded-full shadow-sm" />
                  <div className="absolute right-4 top-0 bottom-0 w-1 bg-gradient-to-r from-zinc-400 via-zinc-200 to-zinc-500 rounded-full shadow-sm" />

                  {/* APILADO VERTICAL DE TABLITAS DE PESO */}
                  <div className="w-full space-y-1 py-1 z-10 max-h-56 overflow-y-auto pr-1 pl-1 scrollbar-thin">
                    {WEIGHT_STACK_PLATES.map((plateWeight, idx) => {
                      const isPinInserted = idx === activePlateIndex;
                      const isLifted = idx <= activePlateIndex;

                      return (
                        <div
                          key={plateWeight}
                          ref={isPinInserted ? activePlateRef : null}
                          onClick={() => handleWeightChange(plateWeight)}
                          className={`w-full py-1 px-2.5 rounded-md border flex items-center justify-between cursor-pointer transition-all duration-150 relative ${
                            isPinInserted
                              ? 'bg-black text-white border-black shadow-sm font-black scale-[1.01]'
                              : isLifted
                                ? 'bg-zinc-800 text-zinc-100 border-zinc-700'
                                : 'bg-white hover:bg-zinc-200 text-zinc-900 border-zinc-300'
                          }`}
                        >
                          <span className="text-[9px] font-mono uppercase tracking-wider font-bold">
                            #{idx + 1}
                          </span>

                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-mono font-extrabold">
                              {plateWeight} KG
                            </span>

                            {/* Orificio para el palito */}
                            <div className={`w-3 h-3 rounded-full border flex items-center justify-center ${
                              isPinInserted
                                ? 'bg-amber-400 border-amber-300 shadow-sm'
                                : 'bg-zinc-300 border-zinc-400 shadow-inner'
                            }`}>
                              {isPinInserted && (
                                <div className="w-1 h-1 rounded-full bg-black" />
                              )}
                            </div>
                          </div>

                          {/* PALITO / CLAVIJA SELECTOR */}
                          {isPinInserted && (
                            <div className="absolute -right-4 sm:-right-6 top-1/2 -translate-y-1/2 flex items-center z-20 animate-fade-in">
                              <div className="w-4 sm:w-6 h-2 bg-gradient-to-r from-amber-400 via-amber-200 to-zinc-800 rounded-l-sm border border-zinc-900 shadow-sm" />
                              <div className="w-3 h-3 bg-zinc-900 rounded-r-sm border border-zinc-700 flex items-center justify-center shadow-md">
                                <div className="w-1 h-1.5 bg-amber-400 rounded-sm" />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Base de la máquina */}
                <div className="w-full max-w-xs mt-1.5 h-2 bg-zinc-800 rounded shadow-md border-t border-zinc-700" />
              </div>

            </div>

            {/* COLUMNA DERECHA (6 COLS): BARRITA DESLIZANTE + REPETICIONES + REGISTRO */}
            <div className="md:col-span-6 bg-white border border-zinc-200 rounded-2xl p-4 shadow-sm space-y-4">
              
              {/* PESO ACTUAL DESTACADO */}
              <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-0.5 text-center">
                <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest font-extrabold block">
                  PESO SELECCIONADO (SERIE {activeSetIndex + 1})
                </span>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-3xl sm:text-4xl font-black font-mono text-black tracking-tight">
                    {currentWeight}
                  </span>
                  <span className="text-sm font-extrabold font-mono text-zinc-700 uppercase">
                    KG
                  </span>
                </div>
              </div>

              {/* BARRITA DESLIZANTE / SLIDER */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-mono font-bold text-zinc-800">
                  <span className="flex items-center gap-1 text-[11px]">
                    <Sliders className="w-3 h-3 text-black" />
                    <span>Barra de Ajuste de Placas:</span>
                  </span>
                  <span className="text-black font-extrabold text-[11px]">{currentWeight} kg</span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="160"
                  step="2.5"
                  value={currentWeight}
                  onChange={(e) => handleWeightChange(parseFloat(e.target.value))}
                  className="w-full h-2.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-black"
                />

                {/* Botones de incremento rápido */}
                <div className="grid grid-cols-4 gap-1 pt-0.5">
                  {[-5, -2.5, +2.5, +5].map((delta) => (
                    <button
                      key={delta}
                      type="button"
                      onClick={() => handleWeightChange(currentWeight + delta)}
                      className="py-1 px-1 bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 rounded-lg font-mono text-[11px] font-extrabold text-black transition-colors cursor-pointer text-center"
                    >
                      {delta > 0 ? `+${delta}` : delta}
                    </button>
                  ))}
                </div>
              </div>

              {/* SELECTOR DE REPETICIONES */}
              <div className="space-y-1.5 border-t border-zinc-100 pt-3">
                <div className="flex justify-between items-center text-xs font-mono font-bold text-zinc-800">
                  <span>Repeticiones:</span>
                  <span className="text-black font-extrabold text-xs">{currentReps} Reps</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleRepsChange(currentReps - 1)}
                    className="w-9 h-9 rounded-xl bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 text-black font-mono font-extrabold text-base flex items-center justify-center transition-colors cursor-pointer"
                  >
                    -
                  </button>

                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={currentReps}
                    onChange={(e) => handleRepsChange(e.target.value)}
                    className="flex-1 bg-zinc-50 border border-zinc-300 focus:border-black rounded-xl py-1.5 text-center text-base font-mono font-black text-black outline-none"
                  />

                  <button
                    type="button"
                    onClick={() => handleRepsChange(currentReps + 1)}
                    className="w-9 h-9 rounded-xl bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 text-black font-mono font-extrabold text-base flex items-center justify-center transition-colors cursor-pointer"
                  >
                    +
                  </button>
                </div>

                {/* Botones de Reps sugeridas */}
                <div className="flex items-center justify-between gap-1 pt-0.5">
                  {[6, 8, 10, 12, 15, 20].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => handleRepsChange(r)}
                      className={`flex-1 py-1 rounded-md text-[10px] font-mono font-extrabold transition-all cursor-pointer ${
                        currentReps === r
                          ? 'bg-black text-white shadow-sm'
                          : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-200'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* BOTONES DE ACCIÓN: GUARDAR / REGISTRAR */}
              <div className="pt-2 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={handleSaveCompleteWorkout}
                  className="w-full py-3 px-4 bg-black hover:bg-zinc-800 text-white font-mono text-xs font-black uppercase tracking-wider rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.99]"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Registrar Ejercicio ({seriesList.length} {seriesList.length === 1 ? 'Serie' : 'Series'})</span>
                </button>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
