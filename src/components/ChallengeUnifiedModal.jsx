import React, { useState } from 'react';
import { parseExperienceInput, parseDaysInput } from '../utils/challengeCalibration.js';
import { getLocalDateString } from '../utils/helpers.js';

export default function ChallengeUnifiedModal({ 
  isOpen, 
  onClose, 
  challengeType = 'muscle', // 'muscle' | 'cardio'
  onComplete,
  currentProfile 
}) {
  const [step, setStep] = useState(1);
  const [expText, setExpText] = useState('');
  const [daysText, setDaysText] = useState('');
  const [goalProximity, setGoalProximity] = useState(currentProfile?.goalProximity || 5);

  if (!isOpen) return null;

  const isMuscle = challengeType === 'muscle';

  const handleNext = (e) => {
    if (e) e.preventDefault();
    if (step === 1 && expText.trim().length > 0) {
      setStep(2);
    } else if (step === 2 && daysText.trim().length > 0) {
      setStep(3);
    }
  };

  const handleFinish = (e) => {
    if (e) e.preventDefault();
    const finalProfile = {
      experience: parseExperienceInput(expText),
      daysPerWeek: parseDaysInput(daysText),
      goalProximity: Number(goalProximity),
      rawExpText: expText.trim(),
      rawDaysText: daysText.trim(),
      activatedAt: Date.now(),
      startDate: getLocalDateString()
    };
    onComplete(finalProfile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="bg-white border border-zinc-200 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative text-zinc-900">
        
        {/* Botón cerrar */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-400 hover:text-black text-lg font-mono px-2 py-1 rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer"
        >
          ✕
        </button>

        {/* Cabecera */}
        <div className="border-b border-zinc-200 pb-4 pr-8">
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">
            GUÍA RÁPIDA & CALIBRACIÓN
          </span>
          <h3 className="text-xl sm:text-2xl font-extrabold text-zinc-900 uppercase font-display tracking-tight mt-0.5">
            {isMuscle ? '¡Desafío de Musculación!' : '¡Desafío de Resistencia!'}
          </h3>
        </div>

        {/* 1. TEXTO EXPLICATIVO */}
        <div className="font-sans text-zinc-600 text-xs sm:text-sm leading-relaxed">
          {isMuscle ? (
            <p>
              El <strong className="text-zinc-900 font-bold">Desafío de Musculación</strong> suma automáticamente el volumen total que levantas en la semana (<span className="text-zinc-900 font-mono font-semibold">Series × Reps × Peso</span>). Si antes del domingo completas la meta de tu nivel, conquistas el reto y subes al siguiente rango con una progresión lógica de un 20% más. Tu nivel <strong className="text-zinc-900 font-bold">nunca baja</strong> si una semana descansas; cada lunes comienza un nuevo ciclo limpio.
            </p>
          ) : (
            <p>
              El <strong className="text-zinc-900 font-bold">Desafío de Resistencia</strong> calcula automáticamente los kilómetros acumulados durante la semana en caminata, running o bicicleta. Al completar la meta semanal subes de nivel con una exigencia del 20% más. Tu nivel <strong className="text-zinc-900 font-bold">nunca baja</strong> si una semana descansas.
            </p>
          )}
        </div>

        {/* 2. PREGUNTAS ABAJO */}
        <div className="pt-2 border-t border-zinc-200 space-y-4">
          
          <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 uppercase tracking-wider font-bold">
            <span>CALIBRACIÓN DE NIVEL</span>
            <span>PASO {step} DE 3</span>
          </div>

          {/* PASO 1 */}
          {step === 1 && (
            <form onSubmit={handleNext} className="space-y-4 animate-fade-in">
              <label className="block text-sm font-sans font-bold text-zinc-900">
                ¿Hace cuánto tiempo entrenas con regularidad?
              </label>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  autoFocus
                  placeholder="Escribe tu tiempo (ej: 2 semanas, 6 meses, 3 años...)"
                  value={expText}
                  onChange={(e) => setExpText(e.target.value)}
                  className="w-full bg-white border border-zinc-300 focus:border-black rounded-xl px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 font-sans outline-none transition-colors shadow-sm"
                  required
                />

                <button
                  type="submit"
                  disabled={expText.trim().length === 0}
                  className="px-5 py-3 rounded-xl bg-black hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-mono font-bold text-lg transition-all cursor-pointer shadow-md flex-shrink-0"
                  title="Siguiente"
                >
                  →
                </button>
              </div>
            </form>
          )}

          {/* PASO 2 */}
          {step === 2 && (
            <form onSubmit={handleNext} className="space-y-4 animate-fade-in">
              <label className="block text-sm font-sans font-bold text-zinc-900">
                ¿Cuántos días a la semana sueles entrenar?
              </label>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  autoFocus
                  placeholder="Escribe la cantidad de días (ej: 3, 4, 5 días...)"
                  value={daysText}
                  onChange={(e) => setDaysText(e.target.value)}
                  className="w-full bg-white border border-zinc-300 focus:border-black rounded-xl px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 font-sans outline-none transition-colors shadow-sm"
                  required
                />

                <button
                  type="submit"
                  disabled={daysText.trim().length === 0}
                  className="px-5 py-3 rounded-xl bg-black hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-mono font-bold text-lg transition-all cursor-pointer shadow-md flex-shrink-0"
                  title="Siguiente"
                >
                  →
                </button>
              </div>
            </form>
          )}

          {/* PASO 3 */}
          {step === 3 && (
            <form onSubmit={handleFinish} className="space-y-4 animate-fade-in">
              <div className="flex justify-between items-center">
                <label className="text-sm font-sans font-bold text-zinc-900">
                  ¿Qué tan cerca estás de tu objetivo físico?
                </label>
                <span className="font-mono text-sm font-bold text-zinc-900 bg-zinc-100 px-2.5 py-0.5 rounded-lg border border-zinc-200">
                  {goalProximity} / 10
                </span>
              </div>

              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={goalProximity}
                onChange={(e) => setGoalProximity(Number(e.target.value))}
                className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-black"
              />

              <div className="flex justify-between text-[10px] font-mono text-zinc-500 px-0.5">
                <span>1: Muy lejos</span>
                <span>5: En camino</span>
                <span>10: Muy cerca</span>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-xl bg-black hover:bg-zinc-800 text-white font-bold font-sans text-sm uppercase tracking-wider transition-all shadow-md cursor-pointer"
              >
                Comenzar Desafío →
              </button>
            </form>
          )}

        </div>

      </div>
    </div>
  );
}
