import React, { useState, useEffect } from 'react';
import { X, Scale, Check, Trash2, Calendar } from 'lucide-react';
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

  const quickAdjust = (delta) => {
    const base = parseFloat(weightValue) || currentWeight || 70;
    const next = Math.round((base + delta) * 10) / 10;
    setWeightValue(next.toString());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-[#18181B] border border-[#2E2E34] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative text-white">

        {/* Cabecera */}
        <div className="p-6 pb-4 border-b border-[#2E2E34] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#222226] border border-[#2E2E34] flex items-center justify-center text-emerald-400 font-bold shadow-sm">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-[#8A8F98] tracking-widest uppercase font-bold">
                CONTROL CORPORAL
              </span>
              <h3 className="text-lg font-extrabold text-white uppercase tracking-tight font-display">
                {currentWeight ? 'Actualizar Peso' : 'Registrar Peso'}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-[#8A8F98] hover:text-white p-1.5 rounded-lg hover:bg-[#222226] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Fecha activa */}
        <div className="px-6 pt-4 flex items-center gap-2 text-xs font-mono text-[#8A8F98]">
          <Calendar className="w-3.5 h-3.5 text-emerald-400" />
          <span>Fecha: <strong className="text-white">{formatDisplayDate(selectedDate)}</strong></span>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 font-mono text-xs">
          <div className="space-y-2">
            <label className="block uppercase text-[#8A8F98] tracking-wider text-[11px] font-bold">
              Peso Corporal (en Kilogramos)
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
                className="w-full bg-[#222226] border border-[#2E2E34] focus:border-emerald-500 px-4 py-3 rounded-xl text-white text-xl font-mono font-bold tracking-wider placeholder:text-[#52525B] outline-none shadow-sm transition-colors"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-extrabold text-[#8A8F98]">
                KG
              </span>
            </div>
          </div>

          {/* Ajustes rápidos */}
          <div className="flex items-center gap-2 pt-1 flex-wrap">
            <span className="text-[10px] text-[#8A8F98] uppercase tracking-widest font-bold">Ajuste rápido:</span>
            {[-1, -0.5, +0.5, +1].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => quickAdjust(d)}
                className="px-2.5 py-1 bg-[#222226] hover:bg-[#2E2E34] border border-[#2E2E34] text-white rounded-lg font-mono text-[11px] font-bold transition-all cursor-pointer"
              >
                {d > 0 ? `+${d}` : d}
              </button>
            ))}
          </div>

          <p className="text-[11px] text-[#8A8F98] leading-relaxed">
            Consejo: Pésate por la mañana, en ayunas y después de ir al baño para obtener el dato más preciso.
          </p>

          {/* Botones */}
          <div className="pt-3 border-t border-[#2E2E34] flex items-center justify-between gap-3">
            {currentWeight ? (
              <button
                type="button"
                onClick={handleClear}
                className="px-3.5 py-2.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer font-bold"
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
                className="px-4 py-2.5 text-[#8A8F98] hover:text-white uppercase tracking-wider transition-colors cursor-pointer font-bold"
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold uppercase rounded-xl shadow-lg transition-colors flex items-center gap-2 cursor-pointer"
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
