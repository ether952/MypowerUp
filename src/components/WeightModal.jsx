import React, { useState, useEffect } from 'react';
import { X, Scale, Check, Trash2, Calendar, Sparkles } from 'lucide-react';
import { formatDisplayDate } from '../utils/helpers';

export default function WeightModal({
  isOpen,
  onClose,
  currentWeight,
  selectedDate,
  onSaveWeight,
}) {
  if (!isOpen) return null;

  const [weightValue, setWeightValue] = useState(
    currentWeight !== null && currentWeight !== undefined ? currentWeight.toString() : ''
  );

  useEffect(() => {
    setWeightValue(
      currentWeight !== null && currentWeight !== undefined ? currentWeight.toString() : ''
    );
  }, [currentWeight, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (weightValue === '' || isNaN(parseFloat(weightValue))) {
      onSaveWeight(null, selectedDate);
    } else {
      onSaveWeight(parseFloat(weightValue), selectedDate);
    }
    onClose();
  };

  const handleClear = () => {
    onSaveWeight(null, selectedDate);
    onClose();
  };

  // Sugerencias rápidas basadas en el valor actual o promedio
  const quickAdjust = (delta) => {
    const base = parseFloat(weightValue) || currentWeight || 70;
    const next = Math.round((base + delta) * 10) / 10;
    setWeightValue(next.toString());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in-up">
      <div className="bg-space-900 border border-purple-500/30 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative backdrop-blur-xl">
        {/* Glows */}
        <div className="ambient-glow-purple -top-20 -left-20 w-48 h-48 opacity-40 pointer-events-none"></div>
        <div className="ambient-glow-cyan -bottom-20 -right-20 w-48 h-48 opacity-30 pointer-events-none"></div>

        {/* Cabecera */}
        <div className="relative z-10 p-6 pb-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-neon-purple to-neon-cyan flex items-center justify-center text-white font-bold shadow-md shadow-purple-500/30">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-neon-cyan tracking-widest uppercase">
                // CONTROL CORPORAL
              </span>
              <h3 className="text-lg font-black text-white uppercase tracking-tight font-display">
                {currentWeight ? 'Actualizar Peso' : 'Registrar Peso'}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Fecha activa */}
        <div className="relative z-10 px-6 pt-4 flex items-center gap-2 text-xs font-mono text-neutral-400">
          <Calendar className="w-3.5 h-3.5 text-neon-purple" />
          <span>Fecha: <strong className="text-white">{formatDisplayDate(selectedDate)}</strong></span>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="relative z-10 p-6 space-y-5 font-mono text-xs">
          <div className="space-y-2">
            <label className="block uppercase text-neutral-300 tracking-wider text-[11px]">
              // Peso Corporal (en Kilogramos)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                min="20"
                max="300"
                autoFocus
                placeholder="Ej. 74.5"
                value={weightValue}
                onChange={(e) => setWeightValue(e.target.value)}
                className="w-full input-futuristic px-4 py-3.5 rounded-xl text-white text-xl font-mono font-bold tracking-wider placeholder:text-neutral-600 focus:border-neon-cyan"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-neutral-400">
                KG
              </span>
            </div>
          </div>

          {/* Ajustes rápidos */}
          <div className="flex items-center gap-2 pt-1">
            <span className="text-[10px] text-neutral-400 uppercase tracking-widest">Ajuste rápido:</span>
            {[-1, -0.5, +0.5, +1].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => quickAdjust(d)}
                className="px-2.5 py-1 bg-white/5 hover:bg-white/15 border border-white/10 rounded-lg text-neutral-300 hover:text-white font-mono text-[11px] transition-all"
              >
                {d > 0 ? `+${d}` : d}
              </button>
            ))}
          </div>

          <p className="text-[11px] text-neutral-400/80 leading-relaxed">
            💡 Consejo: Pésate por la mañana, en ayunas y después de ir al baño para obtener el dato más preciso.
          </p>

          {/* Botones */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3">
            {currentWeight ? (
              <button
                type="button"
                onClick={handleClear}
                className="px-3.5 py-2.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors flex items-center gap-1.5"
                title="Eliminar registro de peso de este día"
              >
                <Trash2 className="w-4 h-4" />
                <span>Borrar</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-neutral-400 hover:text-white uppercase tracking-wider transition-colors"
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 bg-gradient-to-r from-neon-purple to-neon-violet text-white font-bold uppercase rounded-xl shadow-lg shadow-purple-600/30 hover:opacity-95 active:scale-[0.99] transition-all flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Guardar</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
