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
      activatedAt: Date.now(), // Momento exacto en que se le da a Jugar
      startDate: getLocalDateString() // Fecha de activación
    };
    onComplete(finalProfile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-[#0D0824] border border-purple-500/30 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl shadow-purple-950/60 relative">
        
        {/* Botón cerrar minimalista */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-neutral-400 hover:text-white text-lg font-mono px-2 py-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
        >
          ✕
        </button>

        {/* Cabecera */}
        <div className="border-b border-white/10 pb-4 pr-8">
          <span className="text-[10px] font-mono text-neon-purple uppercase tracking-widest block font-bold">
            // GUÍA RÁPIDA & CALIBRACIÓN
          </span>
          <h3 className="text-2xl font-black text-white uppercase font-display tracking-tight mt-0.5">
            {isMuscle ? '¡Desafío de Musculación!' : '¡Desafío de Resistencia!'}
          </h3>
        </div>

        {/* 1. TEXTO EXPLICATIVO (PRIMERO EL TEXTO) */}
        <div className="font-sans text-neutral-300 text-xs sm:text-sm leading-relaxed">
          {isMuscle ? (
            <p>
              El <strong className="text-white font-semibold">Desafío de Musculación</strong> suma automáticamente el volumen total que levantas en la semana (<span className="text-neon-cyan font-mono">Series × Reps × Peso</span>). Si antes del domingo completas la meta de tu nivel, conquistas el reto y subes al siguiente rango con una progresión lógica de un 20% más. Tu nivel <strong className="text-purple-300 font-semibold">nunca baja</strong> si una semana descansas o no alcanzas el peso; cada lunes comienza un nuevo ciclo limpio para avanzar a tu propio ritmo, cuidando la técnica y articulaciones.
            </p>
          ) : (
            <p>
              El <strong className="text-white font-semibold">Desafío de Resistencia</strong> calcula automáticamente los kilómetros acumulados durante la semana en caminata, running o bicicleta. Cada disciplina cuenta con metas adaptadas a la fisiología humana (menos en caminata, más en running y mucho más en bicicleta). Al completar la meta semanal subes de nivel con una exigencia del 20% más. Tu nivel <strong className="text-purple-300 font-semibold">nunca baja</strong> si una semana descansas; cada lunes inicia un intento limpio.
            </p>
          )}
        </div>

        {/* 2. PREGUNTAS ABAJO (PASANDO UNA POR UNA CON FLECHA) */}
        <div className="pt-2 border-t border-white/10 space-y-4">
          
          <div className="flex items-center justify-between text-[10px] font-mono text-purple-300 uppercase tracking-wider font-bold">
            <span>// CALIBRACIÓN DE NIVEL</span>
            <span>PASO {step} DE 3</span>
          </div>

          {/* PASO 1: Hace cuanto tiempo entrena */}
          {step === 1 && (
            <form onSubmit={handleNext} className="space-y-4 animate-fade-in">
              <label className="block text-sm font-sans font-bold text-white">
                ¿Hace cuánto tiempo entrenas con regularidad?
              </label>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  autoFocus
                  placeholder="Escribe tu tiempo (ej: 2 semanas, 6 meses, 3 años...)"
                  value={expText}
                  onChange={(e) => setExpText(e.target.value)}
                  className="w-full bg-[#060314] border border-purple-500/30 focus:border-neon-purple rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 font-sans outline-none transition-colors"
                  required
                />

                <button
                  type="submit"
                  disabled={expText.trim().length === 0}
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-mono font-bold text-lg transition-all cursor-pointer shadow-md shadow-purple-900/30 flex-shrink-0"
                  title="Siguiente"
                >
                  →
                </button>
              </div>
            </form>
          )}

          {/* PASO 2: Cuantos dias a la semana */}
          {step === 2 && (
            <form onSubmit={handleNext} className="space-y-4 animate-fade-in">
              <label className="block text-sm font-sans font-bold text-white">
                ¿Cuántos días a la semana sueles entrenar?
              </label>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  autoFocus
                  placeholder="Escribe la cantidad de días (ej: 3, 4, 5 días...)"
                  value={daysText}
                  onChange={(e) => setDaysText(e.target.value)}
                  className="w-full bg-[#060314] border border-purple-500/30 focus:border-neon-purple rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 font-sans outline-none transition-colors"
                  required
                />

                <button
                  type="submit"
                  disabled={daysText.trim().length === 0}
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-mono font-bold text-lg transition-all cursor-pointer shadow-md shadow-purple-900/30 flex-shrink-0"
                  title="Siguiente"
                >
                  →
                </button>
              </div>
            </form>
          )}

          {/* PASO 3: Del 1 al 10 que tan cerca estas de tu objetivo */}
          {step === 3 && (
            <form onSubmit={handleFinish} className="space-y-4 animate-fade-in">
              <div className="flex justify-between items-center">
                <label className="text-sm font-sans font-bold text-white">
                  ¿Qué tan cerca estás de tu objetivo físico?
                </label>
                <span className="font-mono text-sm font-bold text-purple-300 bg-purple-950/60 px-2.5 py-0.5 rounded-lg border border-purple-500/30">
                  {goalProximity} / 10
                </span>
              </div>

              {/* Barra unificada en un solo color violeta sin iconos ni arcoíris */}
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={goalProximity}
                onChange={(e) => setGoalProximity(Number(e.target.value))}
                className="w-full h-2.5 bg-[#060314] rounded-lg appearance-none cursor-pointer accent-purple-500 border border-purple-500/30"
              />

              <div className="flex justify-between text-[10px] font-mono text-neutral-400 px-0.5">
                <span>1: Muy lejos</span>
                <span>5: En camino</span>
                <span>10: Muy cerca</span>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold font-sans text-sm uppercase tracking-wider transition-all shadow-lg shadow-purple-900/40 cursor-pointer"
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
