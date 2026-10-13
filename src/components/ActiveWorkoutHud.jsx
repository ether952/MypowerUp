import React from 'react';
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
  RotateCcw
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
    skipRest,
    stopWorkout
  } = useActiveWorkout();

  if (!isActive || !currentExercise) return null;

  const currentSetDisplay = currentSetIndex + 1;
  const resolvedImg = resolveExerciseGifUrl(currentExercise) || currentExercise.gifUrl;

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. MINI-PLAYER FLOTANTE (ESTILO SPOTIFY - SIEMPRE ACCESIBLE EN PANTALLA)  */}
      {/* ========================================================================= */}
      {!isHudExpanded && (
        <aside
          aria-label="Controles del entrenamiento activo"
          className="fixed bottom-[4.2rem] md:bottom-6 left-2 right-2 md:left-auto md:right-6 md:w-[450px] z-50 animate-in fade-in slide-in-from-bottom-4 duration-300"
        >
          <div className="bg-zinc-950/95 backdrop-blur-2xl border border-emerald-500/50 rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.6)] p-2.5 text-white flex items-center justify-between gap-2.5">

            {/* Thumbnail + Info del Ejercicio */}
            <button
              type="button"
              onClick={() => setIsHudExpanded(true)}
              className="flex items-center gap-2.5 min-w-0 text-left cursor-pointer group flex-1"
              title="Expandir modo pantalla completa"
            >
              <div className="relative shrink-0">
                <ExerciseThumbnail
                  src={resolvedImg}
                  alt={currentExercise.name}
                  className="w-11 h-11 rounded-xl object-cover bg-zinc-900 border border-emerald-500/30"
                  fallbackContainerClass="w-11 h-11 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center"
                  iconClass="w-5 h-5 text-emerald-400"
                />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full" />
              </div>

              <div className="min-w-0 truncate">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Serie {currentSetDisplay}/{totalSets}
                  </span>
                  {workoutQueue.length > 1 && (
                    <span className="text-[9px] font-mono text-zinc-400">
                      ({currentExerciseIndex + 1}/{workoutQueue.length})
                    </span>
                  )}
                </div>
                <h4 className="text-xs font-bold truncate text-zinc-100 group-hover:text-emerald-400 transition-colors">
                  {currentExercise.name}
                </h4>
                <p className="text-[10px] font-mono text-zinc-400">
                  {currentWeight} kg • {currentReps} reps
                </p>
              </div>
            </button>

            {/* Micro Steppers de Peso & Reps (Sin teclado) */}
            <div className="flex items-center gap-1 bg-zinc-900/90 p-1 rounded-xl border border-zinc-800 shrink-0">
              {/* Peso rápido */}
              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => adjustWeight(-2.5)}
                  className="w-6 h-6 rounded-lg bg-zinc-800 hover:bg-zinc-700 active:scale-90 flex items-center justify-center text-zinc-300 font-bold text-xs cursor-pointer"
                  title="Restar 2.5kg"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="text-[11px] font-mono font-bold text-zinc-200 px-1">
                  {currentWeight}k
                </span>
                <button
                  type="button"
                  onClick={() => adjustWeight(2.5)}
                  className="w-6 h-6 rounded-lg bg-zinc-800 hover:bg-zinc-700 active:scale-90 flex items-center justify-center text-zinc-300 font-bold text-xs cursor-pointer"
                  title="Sumar 2.5kg"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              <span className="text-zinc-700">|</span>

              {/* Reps rápidas */}
              <button
                type="button"
                onClick={cycleReps}
                className="px-1.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 active:scale-90 text-[11px] font-mono font-bold text-emerald-400 cursor-pointer"
                title="Toca para cambiar repeticiones"
              >
                {currentReps}r
              </button>
            </div>

            {/* Botón Principal: Registrar Serie o Descanso */}
            {isResting ? (
              <button
                type="button"
                onClick={skipRest}
                className="px-3 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-mono font-bold flex items-center gap-1 shrink-0 cursor-pointer active:scale-95"
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

            {/* Botón Expandir / Cerrar */}
            <div className="flex items-center gap-0.5 shrink-0">
              <button
                type="button"
                onClick={() => setIsHudExpanded(true)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Expandir modo pantalla completa"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </aside>
      )}

      {/* ========================================================================= */}
      {/* 2. MODO ENFOQUE PANTALLA COMPLETA (MODO GIMNASIO SIN DISTRACCIONES)       */}
      {/* ========================================================================= */}
      {isHudExpanded && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl text-white flex flex-col justify-between p-4 sm:p-6 overflow-y-auto">

          {/* Encabezado Superior */}
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">
                Sesión de Entrenamiento Activa
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsHudExpanded(false)}
                className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 cursor-pointer"
                title="Minimizar"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('¿Deseas finalizar este entrenamiento?')) {
                    stopWorkout();
                    setIsHudExpanded(false);
                  }
                }}
                className="p-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-800/50 text-rose-300 cursor-pointer"
                title="Finalizar entrenamiento"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mensaje Recordatorio Pantalla de Bloqueo */}
          <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-2xl p-3 my-2 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <p className="text-xs text-zinc-300 leading-snug">
              <strong className="text-emerald-400 font-semibold">¡Podés bloquear el celu!</strong> El ejercicio aparece en la pantalla de bloqueo como un reproductor de música. Tocando <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-emerald-300 font-mono text-[11px]">⏭ Siguiente</kbd> completas la serie y tocando <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-emerald-300 font-mono text-[11px]">⏮ Anterior</kbd> cambias las repes sin desbloquear.
            </p>
          </div>

          {/* Cuerpo Central: Imagen + Ejercicio + Serie */}
          <div className="flex-1 flex flex-col items-center justify-center my-4 space-y-5 text-center">

            {/* Visual GIF */}
            <div className="relative">
              <ExerciseThumbnail
                src={resolvedImg}
                alt={currentExercise.name}
                className="w-48 h-48 sm:w-56 sm:h-56 rounded-3xl object-cover bg-zinc-900 border-2 border-emerald-500/40 shadow-2xl"
                fallbackContainerClass="w-48 h-48 sm:w-56 sm:h-56 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-center"
                iconClass="w-16 h-16 text-emerald-400"
              />
              <span className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-mono font-bold text-emerald-400 border border-zinc-700">
                Serie {currentSetDisplay} de {totalSets}
              </span>
            </div>

            {/* Nombre del Ejercicio */}
            <div>
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider block">
                {currentExercise.category || 'Fuerza'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight font-display mt-0.5">
                {currentExercise.name}
              </h2>
            </div>

            {/* Controles Gigantes de Peso y Repeticiones */}
            <div className="grid grid-cols-2 gap-4 w-full max-w-sm">

              {/* Ajuste de Peso (KG) */}
              <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 flex flex-col items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold tracking-wider">
                  Peso (KG)
                </span>
                <span className="text-3xl font-black font-mono text-white my-2">
                  {currentWeight}
                </span>
                <div className="flex items-center gap-2 w-full justify-center">
                  <button
                    type="button"
                    onClick={() => adjustWeight(-2.5)}
                    className="w-10 h-10 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:scale-90 flex items-center justify-center font-bold text-base cursor-pointer"
                  >
                    -
                  </button>
                  <button
                    type="button"
                    onClick={() => adjustWeight(2.5)}
                    className="w-10 h-10 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:scale-90 flex items-center justify-center font-bold text-base cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Ajuste de Repeticiones */}
              <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 flex flex-col items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold tracking-wider">
                  Repeticiones
                </span>
                <span className="text-3xl font-black font-mono text-emerald-400 my-2">
                  {currentReps}
                </span>
                <div className="flex items-center gap-2 w-full justify-center">
                  <button
                    type="button"
                    onClick={() => adjustReps(-1)}
                    className="w-10 h-10 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:scale-90 flex items-center justify-center font-bold text-base cursor-pointer"
                  >
                    -
                  </button>
                  <button
                    type="button"
                    onClick={() => adjustReps(1)}
                    className="w-10 h-10 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:scale-90 flex items-center justify-center font-bold text-base cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

            </div>

            {/* Temporizador de Descanso si está activo */}
            {isResting && (
              <div className="bg-amber-950/40 border border-amber-500/50 rounded-2xl p-4 max-w-sm w-full animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <span className="text-[10px] font-mono uppercase text-amber-400 font-bold block">
                      Descanso Activo
                    </span>
                    <span className="text-2xl font-black font-mono text-white">
                      {restSecondsLeft}s restantes
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={skipRest}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase rounded-xl cursor-pointer"
                  >
                    Saltar
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Botón Gigante de Acción Inferior */}
          <div className="pt-2">
            {!isResting ? (
              <button
                type="button"
                onClick={completeCurrentSet}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase text-base tracking-wide rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-[0_4px_25px_rgba(16,185,129,0.4)] active:scale-95"
              >
                <Check className="w-6 h-6 stroke-[3]" />
                <span>Registrar Serie {currentSetDisplay} ({currentWeight}kg × {currentReps}r)</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={skipRest}
                className="w-full py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-bold uppercase text-sm rounded-2xl cursor-pointer"
              >
                Terminar Descanso Ahora & Empezar Serie {currentSetDisplay}
              </button>
            )}
          </div>

        </div>
      )}
    </>
  );
}
