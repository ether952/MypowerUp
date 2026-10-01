import React, { useState } from 'react';
import { X } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-white border border-zinc-200 w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-6 relative text-zinc-900">
        
        {/* Cabecera */}
        <div className="flex justify-between items-center border-b border-zinc-200 pb-4">
          <div>
            <span className="text-[10px] font-mono text-zinc-500 tracking-widest uppercase font-bold">// CONFIGURACIÓN</span>
            <h3 className="text-lg font-extrabold text-zinc-900 uppercase tracking-tight">Metas Diarias</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-zinc-400 hover:text-black p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
          
          <div className="space-y-1.5">
            <label className="block uppercase text-zinc-600 tracking-wider font-bold">
              // Meta de Calorías (Kcal)
            </label>
            <input
              type="number"
              min="500"
              max="10000"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              className="w-full bg-white border border-zinc-300 focus:border-black px-4 py-2.5 rounded-xl text-zinc-900 font-bold outline-none shadow-sm transition-colors"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block uppercase text-zinc-600 tracking-wider font-bold">
              // Meta de Proteína (g)
            </label>
            <input
              type="number"
              min="20"
              max="500"
              value={protein}
              onChange={(e) => setProtein(e.target.value)}
              className="w-full bg-white border border-zinc-300 focus:border-black px-4 py-2.5 rounded-xl text-zinc-900 font-bold outline-none shadow-sm transition-colors"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block uppercase text-zinc-600 tracking-wider font-bold">
              // Meta de Peso Gym / Carga (Kg)
            </label>
            <input
              type="number"
              min="10"
              max="5000"
              step="5"
              value={tonnage}
              onChange={(e) => setTonnage(e.target.value)}
              className="w-full bg-white border border-zinc-300 focus:border-black px-4 py-2.5 rounded-xl text-zinc-900 font-bold outline-none shadow-sm transition-colors"
              required
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-zinc-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-zinc-500 hover:text-black uppercase tracking-wider transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-black hover:bg-zinc-800 text-white font-bold uppercase rounded-xl shadow-md transition-colors cursor-pointer"
            >
              Guardar Metas
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
