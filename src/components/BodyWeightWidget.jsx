import React, { useState, useEffect, useRef } from 'react';
import {
  Scale,
  Eye,
  EyeOff,
  Edit3,
  Plus,
  TrendingDown,
  TrendingUp,
  Minus,
  Sparkles,
  Info,
  X,
  HelpCircle,
  Clock
} from 'lucide-react';
import WeightModal from './WeightModal';
import { getWeightHistory, calculateWeightStats, getWeightRecommendation } from '../utils/weightAnalytics';

export default function BodyWeightWidget({
  currentDay,
  selectedDate,
  data = {},
  goals = {},
  isWeightVisible,
  onToggleVisibility,
  onUpdateWeight,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showRecommendationModal, setShowRecommendationModal] = useState(false);
  const widgetRef = useRef(null);

  const currentWeight = currentDay?.weight !== undefined && currentDay?.weight !== null && currentDay?.weight !== ''
    ? parseFloat(currentDay.weight)
    : null;

  // Cargar si ya vio el globito de bienvenida inicial
  useEffect(() => {
    try {
      const dismissed = localStorage.getItem('mypowerup_weight_tooltip_dismissed');
      if (!dismissed) {
        // Mostrar globito tras un breve instante para llamar la atención suavemente
        const timer = setTimeout(() => {
          setShowTooltip(true);
        }, 800);
        return () => clearTimeout(timer);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleDismissTooltip = (e) => {
    if (e) e.stopPropagation();
    setShowTooltip(false);
    try {
      localStorage.setItem('mypowerup_weight_tooltip_dismissed', 'true');
    } catch (err) {
      // ignore
    }
  };

  // Historial y análisis de peso
  const weightLogs = getWeightHistory(data);
  const stats = calculateWeightStats(weightLogs);
  const recommendation = getWeightRecommendation(weightLogs, currentWeight || stats.currentWeight, goals);

  // Calcular diferencia con el último peso anterior registrado (si el día de hoy no es el único)
  const previousLogs = weightLogs.filter((l) => l.dateStr < selectedDate);
  const lastPreviousLog = previousLogs.length > 0 ? previousLogs[previousLogs.length - 1] : null;

  let deltaWithPrevious = null;
  if (currentWeight && lastPreviousLog) {
    deltaWithPrevious = Math.round((currentWeight - lastPreviousLog.weight) * 10) / 10;
  }

  return (
    <div ref={widgetRef} className="relative w-full">
      {/* ========================================================================= */}
      {/* GLOBITO DE TEXTO INICIAL (CALLOUT TOOLTIP)                                */}
      {/* ========================================================================= */}
      {showTooltip && (
        <div className="absolute -top-24 sm:-top-20 left-4 sm:left-8 z-50 animate-bounce duration-1000 max-w-xs sm:max-w-sm">
          <div className="bg-gradient-to-r from-neon-purple via-violet-600 to-neon-cyan p-[1.5px] rounded-2xl shadow-[0_15px_35px_rgba(168,85,247,0.5)]">
            <div className="bg-[#0b051e] p-3.5 sm:p-4 rounded-[15px] relative">
              <div className="flex items-start justify-between gap-2.5">
                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 rounded-lg bg-neon-purple/20 text-neon-cyan shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4 animate-pulse" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white leading-snug">
                      Acá está tu peso, lo podés ver y editar cuando prefieras.
                    </p>
                    <p className="text-[10px] text-neutral-400 mt-1 font-mono">
                      // De base está protegido y oculto. Toca el ojo para revelarlo.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleDismissTooltip}
                  className="p-1 text-neutral-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                  title="Cerrar sugerencia"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-2.5 flex items-center justify-end">
                <button
                  type="button"
                  onClick={handleDismissTooltip}
                  className="px-3 py-1 bg-neon-purple/30 hover:bg-neon-purple/50 border border-neon-purple text-white text-[10px] font-mono font-bold rounded-lg transition-all"
                >
                  ¡Entendido!
                </button>
              </div>

              {/* Flecha apuntando al widget de peso */}
              <div className="absolute -bottom-2 left-8 w-4 h-4 bg-[#0b051e] border-r-[1.5px] border-b-[1.5px] border-neon-cyan rotate-45 transform"></div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* BARRA / TARJETA HUD DEL PESO CORPORAL                                     */}
      {/* ========================================================================= */}
      <div className="relative group bg-[#090518]/90 hover:bg-[#0d0722]/95 border border-purple-500/25 hover:border-purple-500/40 rounded-2xl p-3.5 sm:p-4 backdrop-blur-xl transition-all duration-300 shadow-xl overflow-hidden">
        
        {/* Glow sutil */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-neon-purple/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 relative z-10">
          
          {/* LADO IZQUIERDO: Ícono + Título + Valor de Peso */}
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-neon-purple/30 to-neon-cyan/20 border border-neon-purple/40 flex items-center justify-center text-neon-cyan shrink-0 shadow-md shadow-purple-900/20">
              <Scale className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase">
                  // PESO CORPORAL DEL DÍA
                </span>

                {/* Badge de recomendación de pesaje */}
                <button
                  type="button"
                  onClick={() => setShowRecommendationModal(true)}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-purple-950/60 hover:bg-purple-900/70 text-violet-300 border border-purple-500/30 transition-colors"
                  title="Ver recomendación inteligente de pesaje"
                >
                  <Sparkles className="w-2.5 h-2.5 text-neon-cyan" />
                  <span>{recommendation.frequencyBadge}</span>
                </button>
              </div>

              {/* Valor del Peso (Oculto o Visible) */}
              <div className="flex items-baseline gap-2 mt-0.5">
                {currentWeight !== null ? (
                  isWeightVisible ? (
                    <div className="flex items-baseline gap-1.5 animate-fade-in-up">
                      <span className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight">
                        {currentWeight.toFixed(1)}
                      </span>
                      <span className="text-xs font-mono font-bold text-neon-cyan uppercase">KG</span>

                      {/* Delta con pesaje previo */}
                      {deltaWithPrevious !== null && (
                        <span
                          className={`ml-1 text-[11px] font-mono font-bold flex items-center gap-0.5 ${
                            deltaWithPrevious < 0
                              ? 'text-emerald-400'
                              : deltaWithPrevious > 0
                              ? 'text-amber-400'
                              : 'text-neutral-400'
                          }`}
                        >
                          {deltaWithPrevious < 0 ? (
                            <TrendingDown className="w-3 h-3" />
                          ) : deltaWithPrevious > 0 ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <Minus className="w-3 h-3" />
                          )}
                          {deltaWithPrevious > 0 ? `+${deltaWithPrevious}` : deltaWithPrevious} kg
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-lg sm:text-xl font-mono font-bold text-neutral-400 tracking-widest bg-white/5 px-2.5 py-0.5 rounded-lg border border-white/10 select-none">
                        •••• <span className="text-xs font-normal">KG</span>
                      </span>
                      <span className="text-[10px] font-mono text-neutral-500">
                        (Oculto)
                      </span>
                    </div>
                  )
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono text-neutral-400">
                      Sin registrar hoy
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* LADO DERECHO: Acciones (Ocultar/Mostrar + Cargar/Editar + Info) */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 border-white/5 pt-2 sm:pt-0">
            
            {/* Botón de Ocultar / Mostrar Peso (Eye / EyeOff) */}
            <button
              type="button"
              onClick={onToggleVisibility}
              className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                isWeightVisible
                  ? 'bg-white/10 hover:bg-white/15 text-neutral-200 border border-white/15'
                  : 'bg-purple-950/60 hover:bg-purple-900/80 text-neon-purple border border-purple-500/40 shadow-[0_0_10px_rgba(168,85,247,0.15)]'
              }`}
              title={isWeightVisible ? 'Ocultar peso en la pantalla' : 'Mostrar peso'}
            >
              {isWeightVisible ? (
                <>
                  <EyeOff className="w-3.5 h-3.5 text-neutral-400" />
                  <span className="hidden xs:inline">Ocultar</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5 text-neon-cyan" />
                  <span className="hidden xs:inline">Revelar</span>
                </>
              )}
            </button>

            {/* Botón Cargar / Editar Peso */}
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="px-3.5 py-1.5 bg-gradient-to-r from-neon-purple to-neon-violet hover:from-purple-500 hover:to-violet-500 text-white font-mono text-xs font-bold rounded-xl shadow-md shadow-purple-600/30 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              {currentWeight !== null ? (
                <>
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Editar Peso</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Cargar Peso</span>
                </>
              )}
            </button>

            {/* Botón Consejero inteligente */}
            <button
              type="button"
              onClick={() => setShowRecommendationModal(true)}
              className="p-1.5 text-neutral-400 hover:text-neon-cyan hover:bg-white/5 rounded-xl transition-colors"
              title="¿Cada cuánto debería pesarme?"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

      {/* MODAL DE CARGA / EDICIÓN DE PESO */}
      <WeightModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentWeight={currentWeight}
        selectedDate={selectedDate}
        onSaveWeight={onUpdateWeight}
      />

      {/* MODAL DE RECOMENDACIÓN INTELIGENTE DE FRECUENCIA */}
      {showRecommendationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in-up">
          <div className="bg-space-900 border border-purple-500/30 w-full max-w-lg rounded-2xl shadow-2xl p-6 relative overflow-hidden backdrop-blur-xl">
            {/* Glow */}
            <div className="ambient-glow-purple -top-20 -left-20 w-48 h-48 opacity-40"></div>

            <div className="flex justify-between items-center border-b border-white/10 pb-4 relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-neon-purple/20 text-neon-cyan flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-neon-purple tracking-widest uppercase">
                    // GUÍA INTELIGENTE
                  </span>
                  <h3 className="text-base font-black text-white uppercase tracking-tight">
                    ¿Cada cuánto deberías pesarte?
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setShowRecommendationModal(false)}
                className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 pt-4 font-mono text-xs relative z-10">
              {/* Sugerencia Principal */}
              <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-neon-cyan font-bold uppercase tracking-wider">
                    Frecuencia Sugerida Para Ti
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-neon-purple/30 text-white font-bold text-[10px] border border-neon-purple/50">
                    {recommendation.frequencyBadge}
                  </span>
                </div>
                <p className="text-sm font-bold text-white">
                  {recommendation.frequencyTitle}
                </p>
                <p className="text-neutral-300 text-[11px] leading-relaxed font-sans">
                  {recommendation.reasoning}
                </p>
              </div>

              {/* Condiciones óptimas */}
              <div className="p-3.5 rounded-xl bg-space-950/80 border border-white/10 space-y-2">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-[11px]">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Condiciones ideales de medición:</span>
                </div>
                <p className="text-neutral-300 text-[11px] font-sans">
                  {recommendation.bestConditions}
                </p>
                <ul className="space-y-1 pt-1 text-[11px] text-neutral-400 font-sans list-disc list-inside">
                  {recommendation.tips.map((tip, idx) => (
                    <li key={idx}>{tip}</li>
                  ))}
                </ul>
              </div>

              {/* Botón cerrar */}
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowRecommendationModal(false)}
                  className="px-5 py-2 bg-gradient-to-r from-neon-purple to-neon-violet text-white font-bold uppercase rounded-xl transition-all"
                >
                  Entendido
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
