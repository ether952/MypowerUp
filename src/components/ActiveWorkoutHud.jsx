import React, { useState } from 'react';
import {
  Play,
  Pause,
  Check,
  Plus,
  Minus,
  Maximize2,
  Minimize2,
  X,
  Lock,
  Flame,
  Clock,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Volume2,
  VolumeX,
  Layers,
  Dumbbell
} from 'lucide-react';
import { useActiveWorkout } from '../context/ActiveWorkoutContext';
import { resolveExerciseGifUrl } from '../utils/routineTemplates';
import { ExerciseThumbnail } from './CoachRoutinesView';

export default function ActiveWorkoutHud() {
  const {
    isActive,
    workoutQueue,
    currentExerciseIndex,
    currentExercise,
    currentSetIndex,
    totalSets,
    currentWeight,
    currentReps,
    isResting,
    restSecondsLeft,
    isPaused,
    completedSets,
    isHudExpanded,
    setIsHudExpanded,
    completeCurrentSet,
    cycleReps,
    adjustWeight,
    adjustReps,
    addTotalSet,
    removeTotalSet,
    skipToNextExercise,
    goToPreviousExercise,
    skipRest,
    setCurrentWeight,
    setCurrentReps,
    stopWorkout
  } = useActiveWorkout();

  const [soundEnabled, setSoundEnabled] = useState(true);

  if (!isActive || !currentExercise) return null;

  const currentSetDisplay = currentSetIndex + 1;
  const resolvedImg = resolveExerciseGifUrl(currentExercise) || currentExercise.gifUrl;

  // Acceso rápido a discos de peso típicos de gimnasio (+ / - kg)
  const QUICK_WEIGHT_OFFSETS = [-10, -5, -2.5, 2.5, 5, 10];
  const COMMON_REP_PILLS = [6, 8, 10, 12, 15, 20];

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. MINI-PLAYER STICKY FLOTANTE (ESTILO SPOTIFY - NUNCA MOLESTA, SIEMPRE A MANO) */}
      {/* ========================================================================= */}
      {!isHudExpanded && (
        <aside
          aria-label="Controles del entrenamiento activo"
          className="fixed bottom-[4.2rem] md:bottom-6 left-2 right-2 md:left-auto md:right-6 md:w-[460px] z-50 animate-in fade-in slide-in-from-bottom-4 duration-300"
        >
          <div className="bg-[#121316]/95 backdrop-blur-2xl border border-emerald-500/40 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.7)] p-2.5 text-white flex items-center justify-between gap-2">

            {/* Thumbnail + Info del Ejercicio (Toca para expandir vista completa) */}
            <button
              type="button"
              onClick={() => setIsHudExpanded(true)}
              className="flex items-center gap-2.5 min-w-0 text-left cursor-pointer group flex-1"
              title="Toca para abrir la pantalla completa de entrenamiento"
            >
              <div className="relative shrink-0">
                <ExerciseThumbnail
                  src={resolvedImg}
                  alt={currentExercise.name}
                  className="w-11 h-11 rounded-xl object-cover bg-zinc-900 border border-emerald-500/30 shadow-sm"
                  fallbackContainerClass="w-11 h-11 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center"
                  iconClass="w-5 h-5 text-emerald-400"
                />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full shadow-xs" />
              </div>

              <div className="min-w-0 truncate">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono font-black uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Serie {currentSetDisplay}/{totalSets}
                  </span>
                  {workoutQueue.length > 1 && (
                    <span className="text-[10px] font-mono text-zinc-400">
                      Ex {currentExerciseIndex + 1}/{workoutQueue.length}
                    </span>
                  )}
                </div>
                <h4 className="text-xs font-bold truncate text-zinc-100 group-hover:text-emerald-400 transition-colors mt-0.5">
                  {currentExercise.name}
                </h4>
                <p className="text-[10px] font-mono text-zinc-400">
                  <strong className="text-zinc-200">{currentWeight} kg</strong> • <strong className="text-emerald-400">{currentReps} reps</strong>
                </p>
              </div>
            </button>

            {/* Micro Steppers de Peso Rápido */}
            <div className="flex items-center gap-1 bg-zinc-900/90 px-1.5 py-1 rounded-xl border border-zinc-800 shrink-0">
              <button
                type="button"
                onClick={() => adjustWeight(-2.5)}
                className="w-6 h-6 rounded-lg bg-zinc-800 hover:bg-zinc-700 active:scale-90 flex items-center justify-center text-zinc-300 font-bold text-xs cursor-pointer"
                title="-2.5kg"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="text-[11px] font-mono font-black text-zinc-100 px-1">
                {currentWeight}k
              </span>
              <button
                type="button"
                onClick={() => adjustWeight(2.5)}
                className="w-6 h-6 rounded-lg bg-zinc-800 hover:bg-zinc-700 active:scale-90 flex items-center justify-center text-zinc-300 font-bold text-xs cursor-pointer"
                title="+2.5kg"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>

            {/* Botón Principal: Registrar Serie o Descanso */}
            {isResting ? (
              <button
                type="button"
                onClick={skipRest}
                className="px-3 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95"
                title="Toca para saltar descanso"
              >
                <Clock className="w-3.5 h-3.5 animate-spin" />
                <span>{restSecondsLeft}s</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={completeCurrentSet}
                className="px-3.5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black rounded-xl text-xs uppercase flex items-center gap-1.5 shrink-0 cursor-pointer shadow-md hover:scale-105 active:scale-90 transition-all"
                title="Registrar serie actual (1 solo toque)"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span className="hidden xs:inline">Listo</span>
              </button>
            )}

            {/* Botón Expandir a Pantalla Completa */}
            <button
              type="button"
              onClick={() => setIsHudExpanded(true)}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
              title="Abrir pantalla de entrenamiento en grande"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

          </div>
        </aside>
      )}

      {/* ========================================================================= */}
      {/* 2. PANTALLA COMPLETA DE ENTRENAMIENTO (MODERNA, CÓMODA Y ULTRA PRÁCTICA)  */}
      {/* ========================================================================= */}
      {isHudExpanded && (
        <div className="fixed inset-0 z-50 bg-[#0B0C0E] text-white flex flex-col justify-between p-4 sm:p-6 overflow-y-auto selection:bg-emerald-500">

          {/* BARRA SUPERIOR DE LA SESIÓN */}
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3 shrink-0">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.8)]" />
              <div>
                <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 font-black block">
                  MODO ENTRENAMIENTO EN VIVO
                </span>
                {workoutQueue.length > 1 && (
                  <span className="text-[10px] font-mono text-zinc-400">
                    Ejercicio {currentExerciseIndex + 1} de {workoutQueue.length}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Botón Minimizar */}
              <button
                type="button"
                onClick={() => setIsHudExpanded(false)}
                className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                title="Minimizar a barra flotante"
              >
                <Minimize2 className="w-4 h-4" />
              </button>

              {/* Botón Finalizar */}
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('¿Deseas finalizar la sesión de entrenamiento?')) {
                    stopWorkout();
                    setIsHudExpanded(false);
                  }
                }}
                className="p-2 rounded-xl bg-rose-950/40 hover:bg-rose-900 border border-rose-800/40 text-rose-300 hover:text-rose-100 transition-colors cursor-pointer"
                title="Terminar entrenamiento"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* CUERPO CENTRAL DE LA PANTALLA */}
          <div className="flex-1 flex flex-col items-center justify-center py-4 space-y-6 max-w-xl mx-auto w-full">

            {/* Miniatura Animada del Ejercicio + Categoría */}
            <div className="relative group">
              <ExerciseThumbnail
                src={resolvedImg}
                alt={currentExercise.name}
                className="w-36 h-36 sm:w-44 sm:h-44 rounded-3xl object-cover bg-zinc-900 border-2 border-emerald-500/40 shadow-2xl"
                fallbackContainerClass="w-36 h-36 sm:w-44 sm:h-44 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-center"
                iconClass="w-14 h-14 text-emerald-400"
              />
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-black/90 backdrop-blur-md px-3 py-0.5 rounded-full text-[10px] font-mono font-bold text-emerald-400 border border-zinc-700 uppercase tracking-wider">
                {currentExercise.category || 'Fuerza'}
              </span>
            </div>

            {/* Nombre del Ejercicio */}
            <div className="text-center space-y-1">
              <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight font-display">
                {currentExercise.name}
              </h2>

              {/* Navegación entre ejercicios de la cola */}
              {workoutQueue.length > 1 && (
                <div className="flex items-center justify-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={goToPreviousExercise}
                    disabled={currentExerciseIndex === 0}
                    className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 disabled:opacity-30 text-zinc-300 text-xs font-mono flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Anterior</span>
                  </button>
                  <span className="text-[11px] font-mono text-zinc-500">
                    {currentExerciseIndex + 1} / {workoutQueue.length}
                  </span>
                  <button
                    type="button"
                    onClick={skipToNextExercise}
                    disabled={currentExerciseIndex === workoutQueue.length - 1}
                    className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 disabled:opacity-30 text-zinc-300 text-xs font-mono flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed"
                  >
                    <span>Siguiente</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* SELECCIÓN Y GESTIÓN DE SERIES (AGREGAR / QUITAR SERIES) */}
            <div className="w-full bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Series Programadas:</span>
                  <strong className="text-white text-sm">{totalSets}</strong>
                </span>

                {/* Botones para Agregar o Quitar Series en vivo */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={removeTotalSet}
                    disabled={totalSets <= currentSetIndex + 1}
                    className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-25 text-zinc-200 text-xs font-bold transition-all cursor-pointer disabled:cursor-not-allowed"
                    title="Quitar una serie"
                  >
                    - Serie
                  </button>
                  <button
                    type="button"
                    onClick={addTotalSet}
                    className="px-3 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                    title="Agregar una serie más"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Agregar Serie</span>
                  </button>
                </div>
              </div>

              {/* Pills visuales de todas las series */}
              <div className="flex items-center gap-2 overflow-x-auto py-1 custom-scrollbar">
                {Array.from({ length: totalSets }, (_, idx) => {
                  const setNum = idx + 1;
                  const isDone = idx < currentSetIndex;
                  const isCurrent = idx === currentSetIndex;
                  const logged = completedSets.find((s) => s.setNumber === setNum);

                  return (
                    <div
                      key={setNum}
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 shrink-0 transition-all ${
                        isDone
                          ? 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-300'
                          : isCurrent
                          ? 'bg-emerald-500 text-black shadow-md ring-2 ring-emerald-400 font-black'
                          : 'bg-zinc-800/80 border border-zinc-700/60 text-zinc-400'
                      }`}
                    >
                      {isDone ? (
                        <>
                          <Check className="w-3 h-3 stroke-[3]" />
                          <span>S{setNum}: {logged?.weight || currentWeight}k</span>
                        </>
                      ) : isCurrent ? (
                        <>
                          <span>⚡ Serie {setNum}</span>
                        </>
                      ) : (
                        <span>Serie {setNum}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* PANELES DE CONTROL: PESO (KG) Y REPETICIONES */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">

              {/* 1. CONTROL DE PESO (KG) CON CHIPS RÁPIDOS */}
              <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase text-zinc-400 font-bold tracking-wider flex items-center gap-1">
                    <Dumbbell className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Peso de la Serie</span>
                  </span>
                  <span className="text-xs font-mono text-zinc-500">kg</span>
                </div>

                {/* Display Central de Peso */}
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => adjustWeight(-2.5)}
                    className="w-12 h-12 rounded-2xl bg-zinc-800 hover:bg-zinc-700 active:scale-90 flex items-center justify-center font-bold text-xl cursor-pointer shadow-sm text-zinc-200"
                    title="-2.5 kg"
                  >
                    -
                  </button>
                  <div className="text-center min-w-[100px]">
                    <span className="text-4xl font-black font-mono text-white tracking-tight">
                      {currentWeight}
                    </span>
                    <span className="block text-[10px] font-mono text-zinc-500 uppercase">Kilos</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => adjustWeight(2.5)}
                    className="w-12 h-12 rounded-2xl bg-zinc-800 hover:bg-zinc-700 active:scale-90 flex items-center justify-center font-bold text-xl cursor-pointer shadow-sm text-zinc-200"
                    title="+2.5 kg"
                  >
                    +
                  </button>
                </div>

                {/* Chips de Ajuste Rápido de Peso */}
                <div className="grid grid-cols-6 gap-1 pt-1">
                  {QUICK_WEIGHT_OFFSETS.map((offset) => (
                    <button
                      key={offset}
                      type="button"
                      onClick={() => adjustWeight(offset)}
                      className="py-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 active:scale-90 text-[10px] font-mono font-bold text-zinc-300 hover:text-white transition-all cursor-pointer text-center"
                    >
                      {offset > 0 ? `+${offset}` : offset}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. CONTROL DE REPETICIONES CON CHIPS RÁPIDOS */}
              <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase text-zinc-400 font-bold tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Repeticiones</span>
                  </span>
                  <span className="text-xs font-mono text-zinc-500">reps</span>
                </div>

                {/* Display Central de Repeticiones */}
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => adjustReps(-1)}
                    className="w-12 h-12 rounded-2xl bg-zinc-800 hover:bg-zinc-700 active:scale-90 flex items-center justify-center font-bold text-xl cursor-pointer shadow-sm text-zinc-200"
                    title="-1 rep"
                  >
                    -
                  </button>
                  <div className="text-center min-w-[100px]">
                    <span className="text-4xl font-black font-mono text-emerald-400 tracking-tight">
                      {currentReps}
                    </span>
                    <span className="block text-[10px] font-mono text-zinc-500 uppercase">Reps</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => adjustReps(1)}
                    className="w-12 h-12 rounded-2xl bg-zinc-800 hover:bg-zinc-700 active:scale-90 flex items-center justify-center font-bold text-xl cursor-pointer shadow-sm text-zinc-200"
                    title="+1 rep"
                  >
                    +
                  </button>
                </div>

                {/* Chips de Repeticiones Estándar */}
                <div className="grid grid-cols-6 gap-1 pt-1">
                  {COMMON_REP_PILLS.map((repsVal) => (
                    <button
                      key={repsVal}
                      type="button"
                      onClick={() => setCurrentReps(repsVal)}
                      className={`py-1.5 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer text-center ${
                        currentReps === repsVal
                          ? 'bg-emerald-500 text-black font-black'
                          : 'bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300'
                      }`}
                    >
                      {repsVal}r
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* CRONÓMETRO DE DESCANSO SI ESTÁ ACTIVO */}
            {isResting && (
              <div className="w-full bg-amber-950/40 border border-amber-500/50 rounded-2xl p-4 flex items-center justify-between animate-pulse shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
                    <Clock className="w-6 h-6 animate-spin" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase text-amber-400 font-bold block">
                      Descanso entre series
                    </span>
                    <span className="text-3xl font-black font-mono text-white">
                      {restSecondsLeft}s
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={skipRest}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase rounded-xl transition-all cursor-pointer shadow-md active:scale-95"
                >
                  Saltar Descanso
                </button>
              </div>
            )}

          </div>

          {/* BOTÓN GIGANTE INFERIOR: 1 TOQUE PARA CONFIRMAR SERIE */}
          <div className="pt-3 max-w-xl mx-auto w-full shrink-0">
            {!isResting ? (
              <button
                type="button"
                onClick={completeCurrentSet}
                className="w-full py-4.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase text-base tracking-wide rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2.5 shadow-[0_4px_30px_rgba(16,185,129,0.5)] active:scale-95"
              >
                <Check className="w-6 h-6 stroke-[3]" />
                <span>CONFIRMAR SERIE {currentSetDisplay} ({currentWeight}kg × {currentReps}r)</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={skipRest}
                className="w-full py-4.5 bg-zinc-800 hover:bg-zinc-700 text-white font-black uppercase text-sm tracking-wide rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md"
              >
                <span>EMPEZAR SERIE {currentSetDisplay} AHORA ({currentWeight}kg × {currentReps}r)</span>
              </button>
            )}
          </div>

        </div>
      )}
    </>
  );
}
