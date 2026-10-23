import React, { useState } from 'react';
import {
  X,
  Clock,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  Maximize2,
  Tv,
  Check,
  Flame,
  Minus,
  Plus
} from 'lucide-react';
import { useActiveWorkout } from '../context/ActiveWorkoutContext';
import { resolveExerciseGifUrl } from '../utils/routineTemplates';
import { ExerciseThumbnail } from './CoachRoutinesView';
import { enterPictureInPicture } from '../services/lockscreenService';

// Mancuernas y pesos estándar comunes en gimnasios
const DUMBBELL_PRESETS = [4, 6, 7, 7.5, 8, 9, 10, 12, 14, 15, 16, 18, 20, 22.5, 25, 27.5, 30];
const REP_PRESETS = [6, 8, 10, 12, 15, 20];

export default function LockscreenWidget() {
  const {
    isActive,
    currentExercise,
    workoutQueue,
    currentExerciseIndex,
    currentSetIndex,
    currentWeight,
    currentReps,
    isResting,
    restSecondsLeft,
    totalRestDuration = 90,
    addRestSeconds,
    completedSets,
    adjustWeight,
    setWeightDirectly,
    adjustReps,
    setRepsDirectly,
    completeCurrentSet,
    skipRest,
    skipToNextExercise,
    goToPreviousExercise,
    stopWorkout,
    isLockscreenMode,
    setIsLockscreenMode
  } = useActiveWorkout();

  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  const [pulse, setPulse] = useState(false);
  const [weightStep, setWeightStep] = useState(1); // Paso predeterminado 1kg (fácil para 7kg -> 8kg -> 9kg)
  const [showWeightPicker, setShowWeightPicker] = useState(false);
  const [showRepsPicker, setShowRepsPicker] = useState(false);
  const [customWeightInput, setCustomWeightInput] = useState('');
  const [customRepsInput, setCustomRepsInput] = useState('');

  // El widget flotante se muestra mientras haya entrenamiento activo y esté en modo widget
  if (!isActive || !currentExercise || !isLockscreenMode) {
    return null;
  }

  const resolvedImg = resolveExerciseGifUrl(currentExercise) || currentExercise.gifUrl || currentExercise.image;

  // Manejar el clic en '+' para agregar / registrar serie
  const handleAddSeriesClick = () => {
    setPulse(true);
    setTimeout(() => setPulse(false), 300);

    if (isResting) {
      skipRest();
    }
    completeCurrentSet();
  };

  // Números de series completadas (ej: [1, 2])
  const completedNumbers = completedSets.map((s) => s.setNumber);

  // Progreso circular del descanso (0 a 1)
  const restProgress = totalRestDuration > 0
    ? Math.min(1, Math.max(0, (totalRestDuration - restSecondsLeft) / totalRestDuration))
    : 0;

  // Circunferencia del círculo SVG (radio 20 => ~125.66)
  const circleRadius = 20;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const strokeOffset = circleCircumference * (1 - restProgress);

  return (
    <>
      {/* CONTENEDOR FLOTANTE TIPO GLOBITO/WIDGET */}
      <aside
        aria-label="Widget Flotante de Entrenamiento MyPowerUp"
        className="fixed bottom-20 md:bottom-8 left-3 right-3 md:left-auto md:right-8 z-50 flex items-center justify-center pointer-events-none animate-in fade-in slide-in-from-bottom-4 duration-300"
      >
        <div
          className={`w-full max-w-[400px] bg-[#1c1d22]/98 backdrop-blur-2xl border border-zinc-700/80 rounded-[26px] p-4 sm:p-5 shadow-[0_24px_60px_rgba(0,0,0,0.85)] pointer-events-auto flex flex-col gap-3 relative select-none touch-manipulation transition-transform duration-200 ${
            pulse ? 'scale-[1.02] border-emerald-500 shadow-[0_0_25px_rgba(34,197,94,0.35)]' : ''
          }`}
        >
          {/* BOTONES SUPERIORES: PIP + MINIMIZAR */}
          <div className="absolute -top-3 right-2 flex items-center gap-1.5 z-10">
            {/* Botón Picture-in-Picture nativo Android si está disponible */}
            <button
              type="button"
              onClick={() => enterPictureInPicture()}
              className="w-7 h-7 rounded-full bg-[#202124] border border-zinc-700 text-zinc-400 hover:text-emerald-400 flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95 cursor-pointer"
              title="Flotar como ventana Picture-in-Picture"
            >
              <Tv className="w-3.5 h-3.5" />
            </button>

            {/* Botón Minimizar widget a barra de entrenamiento */}
            <button
              type="button"
              onClick={() => setIsLockscreenMode(false)}
              className="w-7 h-7 rounded-full bg-[#202124] border border-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95 cursor-pointer"
              title="Minimizar widget"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* CABECERA: LOGO MYUP + NOMBRE DEL EJERCICIO */}
          <div className="flex items-start justify-between gap-3 pt-0.5">
            {/* Logo MyUP */}
            <div className="flex items-baseline shrink-0 leading-none">
              <span className="text-2xl sm:text-3xl font-black text-white tracking-tight select-none font-display">
                My
              </span>
              <span className="text-2xl sm:text-3xl font-black text-[#22c55e] tracking-tight select-none font-display">
                UP
              </span>
            </div>

            {/* Nombre del Ejercicio */}
            <div className="min-w-0 flex-1 text-right">
              <h3 className="text-sm sm:text-base font-bold text-white leading-tight line-clamp-1 tracking-tight" title={currentExercise.name}>
                {currentExercise.name}
              </h3>
              <span className="text-[10px] font-mono font-medium text-emerald-400 uppercase tracking-wider block">
                Widget en Vivo
              </span>
            </div>
          </div>

          {/* NAVEGACIÓN RÁPIDA ENTRE EJERCICIOS */}
          {workoutQueue.length > 1 && (
            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 px-1 -mt-1 bg-zinc-900/60 py-1 rounded-xl border border-zinc-800/80">
              <button
                type="button"
                onClick={goToPreviousExercise}
                disabled={currentExerciseIndex === 0}
                className="flex items-center gap-1 hover:text-white disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed px-1.5"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Anterior</span>
              </button>
              <span className="text-emerald-400 font-bold">
                {currentExerciseIndex + 1}/{workoutQueue.length}
              </span>
              <button
                type="button"
                onClick={skipToNextExercise}
                disabled={currentExerciseIndex === workoutQueue.length - 1}
                className="flex items-center gap-1 hover:text-white disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed px-1.5"
              >
                <span>Siguiente</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* CUERPO: MINIATURA BLANCA + PÍLDORAS (SERIE, REPES Y PESO) */}
          <div className="flex items-stretch gap-3">
            {/* Miniatura Cuadrada Blanca */}
            <div className="w-24 sm:w-26 rounded-2xl bg-white p-1.5 flex items-center justify-center shrink-0 shadow-md border border-zinc-200/20 overflow-hidden self-center aspect-square">
              <ExerciseThumbnail
                src={resolvedImg}
                alt={currentExercise.name}
                className="w-full h-full object-contain"
                fallbackContainerClass="w-full h-full bg-zinc-100 flex items-center justify-center"
                iconClass="w-10 h-10 text-emerald-600"
              />
            </div>

            {/* Columna de Píldoras de Control */}
            <div className="flex-1 flex flex-col justify-between gap-1.5 min-w-0">

              {/* PÍLDORA 1: SERIE: 1 2 + */}
              <div className="bg-[#2f3036] hover:bg-[#37383f] transition-colors rounded-xl px-3 py-1.5 flex items-center justify-between text-white shadow-inner border border-zinc-700/50">
                <span className="font-black text-xs sm:text-sm text-zinc-300 select-none uppercase tracking-wider">
                  Serie:
                </span>

                <div className="flex items-center gap-1.5 font-black text-sm sm:text-base">
                  {completedNumbers.length > 0 ? (
                    completedNumbers.map((num) => (
                      <span key={num} className="text-white font-mono select-none px-1 bg-zinc-800/80 rounded-md text-xs sm:text-sm border border-zinc-700">
                        {num}
                      </span>
                    ))
                  ) : (
                    <span className="text-zinc-500 font-mono text-xs select-none">
                      1
                    </span>
                  )}

                  {/* Botón '+' verde para completar serie */}
                  <button
                    type="button"
                    onClick={handleAddSeriesClick}
                    className="text-[#22c55e] hover:text-[#16a34a] active:scale-75 transition-transform text-2xl font-black cursor-pointer leading-none px-1.5 py-0.5 ml-1"
                    title="Registrar serie completada"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* PÍLDORA 2: REPES: - 10 + */}
              <div className="bg-[#2f3036] hover:bg-[#37383f] transition-colors rounded-xl px-3 py-1.5 flex items-center justify-between text-white shadow-inner border border-zinc-700/50">
                <span className="font-black text-xs sm:text-sm text-zinc-300 select-none uppercase tracking-wider">
                  Repes:
                </span>

                <div className="flex items-center gap-1.5 font-black text-sm sm:text-base">
                  {/* Botón '-' */}
                  <button
                    type="button"
                    onClick={() => adjustReps(-1)}
                    className="text-[#22c55e] hover:text-[#16a34a] active:scale-75 transition-transform text-xl font-black cursor-pointer leading-none px-1.5"
                    title="-1 rep"
                  >
                    -
                  </button>

                  {/* Repeticiones actuales (Toca para desplegar presets rápidos) */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowRepsPicker(!showRepsPicker);
                      setShowWeightPicker(false);
                    }}
                    className="text-white hover:text-emerald-400 font-mono select-none px-1.5 py-0.5 bg-zinc-800/90 rounded-md border border-zinc-700 hover:border-emerald-500/50 transition-all cursor-pointer text-xs sm:text-sm"
                    title="Toca para cambiar repeticiones directamente"
                  >
                    {currentReps}
                  </button>

                  {/* Botón '+' */}
                  <button
                    type="button"
                    onClick={() => adjustReps(1)}
                    className="text-[#22c55e] hover:text-[#16a34a] active:scale-75 transition-transform text-xl font-black cursor-pointer leading-none px-1.5"
                    title="+1 rep"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* PÍLDORA 3: PESO: - 8kg + */}
              <div className="bg-[#2f3036] hover:bg-[#37383f] transition-colors rounded-xl px-3 py-1.5 flex items-center justify-between text-white shadow-inner border border-zinc-700/50">
                <span className="font-black text-xs sm:text-sm text-zinc-300 select-none uppercase tracking-wider">
                  Peso:
                </span>

                <div className="flex items-center gap-1.5 font-black text-sm sm:text-base">
                  {/* Botón '-' con el paso configurado */}
                  <button
                    type="button"
                    onClick={() => adjustWeight(-weightStep)}
                    className="text-[#22c55e] hover:text-[#16a34a] active:scale-75 transition-transform text-xl font-black cursor-pointer leading-none px-1.5"
                    title={`-${weightStep} kg`}
                  >
                    -
                  </button>

                  {/* Peso actual (Toca para ingresar 8kg u otro valor directo) */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowWeightPicker(!showWeightPicker);
                      setShowRepsPicker(false);
                    }}
                    className="text-white hover:text-emerald-400 font-mono select-none px-1.5 py-0.5 bg-zinc-800/90 rounded-md border border-zinc-700 hover:border-emerald-500/50 transition-all cursor-pointer text-xs sm:text-sm font-bold"
                    title="Toca para seleccionar peso exacto (ej: 8kg)"
                  >
                    {currentWeight}kg
                  </button>

                  {/* Botón '+' con el paso configurado */}
                  <button
                    type="button"
                    onClick={() => adjustWeight(weightStep)}
                    className="text-[#22c55e] hover:text-[#16a34a] active:scale-75 transition-transform text-xl font-black cursor-pointer leading-none px-1.5"
                    title={`+${weightStep} kg`}
                  >
                    +
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* SELECTOR RÁPIDO DE PASO DE PESO (0.5kg, 1kg, 2.5kg) */}
          <div className="flex items-center justify-between px-1 text-[10px] font-mono text-zinc-400 bg-zinc-900/40 py-1 rounded-lg">
            <span>Paso de ajuste:</span>
            <div className="flex items-center gap-1">
              {[0.5, 1, 2.5].map((step) => (
                <button
                  key={step}
                  type="button"
                  onClick={() => setWeightStep(step)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                    weightStep === step
                      ? 'bg-emerald-500 text-black shadow-xs'
                      : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  }`}
                  title={`Ajustar de a ${step}kg`}
                >
                  ±{step}kg
                </button>
              ))}
            </div>
          </div>

          {/* POPOVER RÁPIDO: PESO DIRECTO (SELECCIONAR 8KG O CUALQUIER VALOR EN 1 TOQUE) */}
          {showWeightPicker && (
            <div className="bg-[#24252b] border border-emerald-500/40 rounded-2xl p-3 shadow-2xl animate-in zoom-in-95 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white font-mono">
                  Seleccionar Peso Rápido:
                </span>
                <button
                  type="button"
                  onClick={() => setShowWeightPicker(false)}
                  className="text-zinc-400 hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Chips de mancuernas (incluyendo 8kg destacado) */}
              <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
                {DUMBBELL_PRESETS.map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => {
                      setWeightDirectly(w);
                      setShowWeightPicker(false);
                    }}
                    className={`px-2 py-1 rounded-lg text-xs font-mono font-bold cursor-pointer transition-all ${
                      currentWeight === w
                        ? 'bg-emerald-500 text-black ring-2 ring-emerald-300'
                        : w === 8
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 hover:bg-emerald-800'
                          : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
                    }`}
                  >
                    {w}kg
                  </button>
                ))}
              </div>

              {/* Entrada personalizada libre */}
              <div className="flex items-center gap-2 pt-1 border-t border-zinc-800">
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="500"
                  placeholder="Otro peso (ej: 8)"
                  value={customWeightInput}
                  onChange={(e) => setCustomWeightInput(e.target.value)}
                  className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customWeightInput !== '') {
                      setWeightDirectly(Number(customWeightInput));
                      setCustomWeightInput('');
                      setShowWeightPicker(false);
                    }
                  }}
                  className="px-3 py-1 bg-emerald-500 text-black font-bold text-xs rounded-lg hover:bg-emerald-400 cursor-pointer font-mono"
                >
                  Fijar
                </button>
              </div>
            </div>
          )}

          {/* POPOVER RÁPIDO: REPETICIONES DIRECTAS */}
          {showRepsPicker && (
            <div className="bg-[#24252b] border border-emerald-500/40 rounded-2xl p-3 shadow-2xl animate-in zoom-in-95 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white font-mono">
                  Seleccionar Repeticiones:
                </span>
                <button
                  type="button"
                  onClick={() => setShowRepsPicker(false)}
                  className="text-zinc-400 hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {REP_PRESETS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      setRepsDirectly(r);
                      setShowRepsPicker(false);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-bold cursor-pointer transition-all ${
                      currentReps === r
                        ? 'bg-emerald-500 text-black ring-2 ring-emerald-300'
                        : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
                    }`}
                  >
                    {r} reps
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-1 border-t border-zinc-800">
                <input
                  type="number"
                  min="1"
                  max="100"
                  placeholder="Otras reps (ej: 12)"
                  value={customRepsInput}
                  onChange={(e) => setCustomRepsInput(e.target.value)}
                  className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customRepsInput !== '') {
                      setRepsDirectly(Number(customRepsInput));
                      setCustomRepsInput('');
                      setShowRepsPicker(false);
                    }
                  }}
                  className="px-3 py-1 bg-emerald-500 text-black font-bold text-xs rounded-lg hover:bg-emerald-400 cursor-pointer font-mono"
                >
                  Fijar
                </button>
              </div>
            </div>
          )}

          {/* CRONÓMETRO DE DESCANSO: CIRCULITO QUE SE VA LLENANDO Y AL LADO LOS SEGUNDOS */}
          {isResting && (
            <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-2xl p-2.5 flex items-center justify-between gap-3 shadow-inner">
              {/* Círculo de progreso que se va llenando */}
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                  <svg className="w-12 h-12 -rotate-90 transform" viewBox="0 0 48 48">
                    {/* Círculo base de fondo */}
                    <circle
                      cx="24"
                      cy="24"
                      r={circleRadius}
                      stroke="#27272a"
                      strokeWidth="3.5"
                      fill="transparent"
                    />
                    {/* Círculo animado de progreso que se va llenando */}
                    <circle
                      cx="24"
                      cy="24"
                      r={circleRadius}
                      stroke="#22c55e"
                      strokeWidth="3.5"
                      strokeDasharray={circleCircumference}
                      strokeDashoffset={strokeOffset}
                      strokeLinecap="round"
                      fill="transparent"
                      className="transition-all duration-300 ease-linear"
                    />
                  </svg>
                  {/* Ícono central */}
                  <Flame className="w-4 h-4 text-emerald-400 absolute" />
                </div>

                {/* Segundos al lado del círculo */}
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl sm:text-2xl font-black font-mono text-white tracking-tight">
                      {restSecondsLeft}
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      seg
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block -mt-0.5">
                    Descanso activo
                  </span>
                </div>
              </div>

              {/* Botones rápidos de descanso (+15s / -15s / Saltar) */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => addRestSeconds(-15)}
                  disabled={restSecondsLeft <= 15}
                  className="px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-20 text-zinc-300 text-[11px] font-mono font-bold cursor-pointer"
                  title="-15 segundos"
                >
                  -15s
                </button>
                <button
                  type="button"
                  onClick={() => addRestSeconds(15)}
                  className="px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] font-mono font-bold cursor-pointer"
                  title="+15 segundos"
                >
                  +15s
                </button>
                <button
                  type="button"
                  onClick={skipRest}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-[11px] font-mono font-bold cursor-pointer"
                  title="Saltar descanso y continuar"
                >
                  Listo ⏭
                </button>
              </div>
            </div>
          )}

          {/* PIE DEL WIDGET: BOTÓN TERMINAR */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] font-mono text-zinc-500">
              {completedSets.length} {completedSets.length === 1 ? 'serie registrada' : 'series registradas'}
            </span>

            <button
              type="button"
              onClick={() => setShowFinishConfirm(true)}
              className="bg-[#202124] hover:bg-rose-950/40 border border-zinc-700 hover:border-rose-800 px-4 py-1.5 rounded-xl text-[#22c55e] hover:text-rose-400 font-black text-xs sm:text-sm tracking-wider uppercase font-mono shadow-md active:scale-95 transition-all cursor-pointer"
            >
              TERMINAR
            </button>
          </div>

        </div>
      </aside>

      {/* MODAL DE CONFIRMACIÓN PARA TERMINAR SESIÓN */}
      {showFinishConfirm && (
        <div className="fixed inset-0 z-60 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#24252a] border border-zinc-700 rounded-3xl p-5 max-w-xs w-full text-center space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h4 className="text-base font-bold text-white font-display">
              ¿Finalizar entrenamiento?
            </h4>
            <p className="text-xs text-zinc-400 font-mono">
              Se guardarán todas las series completadas en tu diario de hoy.
            </p>

            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  stopWorkout();
                  setShowFinishConfirm(false);
                  setIsLockscreenMode(false);
                }}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase rounded-xl transition-all cursor-pointer shadow-md font-mono"
              >
                Terminar Entrenamiento
              </button>

              <button
                type="button"
                onClick={() => setShowFinishConfirm(false)}
                className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs uppercase rounded-xl transition-all cursor-pointer font-mono"
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
