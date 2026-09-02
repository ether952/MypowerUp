import React, { useState } from 'react';
import { X, Check } from 'lucide-react';

export default function GoalsModal({ isOpen, onClose, currentGoals, onSaveGoals }) {
  if (!isOpen) return null;

  const [calories, setCalories] = useState(currentGoals.calories || 2400);
  const [protein, setProtein] = useState(currentGoals.protein || 150);
  const [tonnage, setTonnage] = useState(currentGoals.tonnage || 100);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveGoals({
      calories: Number(calories) || 2400,
      protein: Number(protein) || 150,
      tonnage: Number(tonnage) || 100,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in-up">
      <div className="bg-space-900 border border-purple-500/30 w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-6 relative">
        
        {/* Cabecera */}
        <div className="flex justify-between items-center border-b border-white/10 pb-4">
          <div>
            <span className="text-[10px] font-mono text-neon-purple tracking-widest uppercase">// CONFIGURACIÓN</span>
            <h3 className="text-lg font-black text-white uppercase tracking-tight">Metas Diarias</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
          
          <div className="space-y-1.5">
            <label className="block uppercase text-neutral-400 tracking-wider">
              // Meta de Calorías (Kcal)
            </label>
            <input
              type="number"
              min="500"
              max="10000"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              className="w-full input-futuristic px-4 py-3 rounded-xl text-white font-bold"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block uppercase text-neutral-400 tracking-wider">
              // Meta de Proteína (g)
            </label>
            <input
              type="number"
              min="20"
              max="500"
              value={protein}
              onChange={(e) => setProtein(e.target.value)}
              className="w-full input-futuristic px-4 py-3 rounded-xl text-white font-bold"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block uppercase text-neutral-400 tracking-wider">
              // Meta de Peso Gym / Carga (Kg)
            </label>
            <input
              type="number"
              min="10"
              max="5000"
              step="5"
              value={tonnage}
              onChange={(e) => setTonnage(e.target.value)}
              className="w-full input-futuristic px-4 py-3 rounded-xl text-white font-bold"
              required
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-neutral-400 hover:text-white uppercase tracking-wider transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-neon-purple to-neon-violet text-white font-bold uppercase rounded-xl shadow-lg shadow-purple-600/30"
            >
              Guardar Metas
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
