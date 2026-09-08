import React, { useState, useEffect } from 'react';
import { X, Check, Utensils } from 'lucide-react';
import { MEAL_TYPES, getCurrentTimeString } from '../utils/helpers';

export default function EditFoodModal({
  isOpen,
  onClose,
  food,
  onSave,
}) {
  const [mealType, setMealType] = useState('almuerzo');
  const [mealTime, setMealTime] = useState(() => getCurrentTimeString());
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');

  useEffect(() => {
    if (food) {
      setMealType(food.mealType || 'almuerzo');
      setMealTime(food.time || getCurrentTimeString());
      setName(food.name || '');
      setCalories(food.calories !== undefined ? String(food.calories) : '0');
      setProtein(food.protein !== undefined ? String(food.protein) : '0');
    }
  }, [food]);

  if (!isOpen || !food) return null;

  const isSupp = mealType === 'suplementacion';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      ...food,
      name: name.trim(),
      mealType,
      time: mealTime,
      calories: Math.max(0, parseInt(calories, 10) || 0),
      protein: Math.max(0, parseFloat(protein) || 0),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in-up">
      <div
        className="bg-[#0E0926] border border-cyan-500/40 w-full max-w-lg rounded-2xl shadow-2xl p-6 space-y-5 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="flex justify-between items-center border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl border ${isSupp ? 'bg-neon-mint/20 text-neon-mint border-neon-mint/40' : 'bg-neon-cyan/20 text-neon-cyan border-neon-cyan/40'}`}>
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <span className={`text-[10px] font-mono tracking-widest uppercase block ${isSupp ? 'text-neon-mint' : 'text-neon-cyan'}`}>
                // MODIFICAR REGISTRO
              </span>
              <h3 className="text-lg font-black text-white uppercase tracking-tight font-display">
                Editar {isSupp ? 'Suplemento' : 'Alimento / Comida'}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
          {/* Selector de Tipo de Comida / Suplemento */}
          <div className="space-y-2">
            <label className="block uppercase text-neutral-400 tracking-wider text-[11px]">
              Momento del Día / Tipo
            </label>
            <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-[#080419] border border-white/10">
              {MEAL_TYPES.map((type) => {
                const isSelected = mealType === type.id;
                const isTypeSupp = type.id === 'suplementacion';

                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setMealType(type.id)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-mono font-bold tracking-wider transition-all cursor-pointer ${
                      isSelected
                        ? isTypeSupp
                          ? 'bg-neon-mint text-space-950 font-black shadow-md shadow-emerald-500/30'
                          : 'bg-gradient-to-r from-neon-cyan to-neon-blue text-space-950 font-black shadow-md shadow-cyan-500/30'
                        : 'text-neutral-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {type.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Horario */}
            <div className="md:col-span-4 space-y-1.5">
              <label className="block uppercase text-neutral-400 tracking-wider text-[11px]">
                Horario
              </label>
              <input
                type="time"
                value={mealTime}
                onChange={(e) => setMealTime(e.target.value)}
                className="w-full input-futuristic-cyan px-3 py-2.5 text-xs text-center text-white rounded-xl font-mono cursor-pointer"
                required
              />
            </div>

            {/* Nombre del Alimento o Suplemento */}
            <div className="md:col-span-8 space-y-1.5">
              <label className="block uppercase text-neutral-300 font-bold tracking-wider text-[11px]">
                {isSupp ? 'Nombre del Suplemento' : 'Nombre del Alimento o Plato'}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full input-futuristic-cyan px-4 py-2.5 text-xs text-white rounded-xl font-medium"
                placeholder={isSupp ? 'Ej: Proteína Whey 30g' : 'Ej: Pechuga de pollo 200g'}
                required
                autoFocus
              />
            </div>
          </div>

          {/* Calorías y Proteínas */}
          <div className="grid grid-cols-2 gap-4">
            {/* Calorías */}
            <div className="space-y-1.5">
              <label className="block uppercase text-neon-cyan tracking-wider text-[11px] font-bold">
                Calorías (Kcal)
              </label>
              <input
                type="number"
                min="0"
                max="10000"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                className="w-full input-futuristic-cyan px-3 py-2.5 rounded-xl text-neon-cyan font-black text-center text-sm"
                required
              />
            </div>

            {/* Proteína */}
            <div className="space-y-1.5">
              <label className="block uppercase text-neon-mint tracking-wider text-[11px] font-bold">
                Proteína (G)
              </label>
              <input
                type="number"
                min="0"
                max="1000"
                step="0.5"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                className="w-full input-futuristic-cyan px-3 py-2.5 rounded-xl text-neon-mint font-black text-center text-sm"
              />
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-neutral-400 hover:text-white uppercase tracking-wider transition-colors cursor-pointer font-bold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-neon-cyan to-neon-blue hover:from-neon-blue hover:to-neon-purple text-white font-bold uppercase rounded-xl shadow-lg shadow-cyan-600/30 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Guardar Cambios</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
