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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in">
      <div
        className="bg-[#18181B] border border-[#2E2E34] w-full max-w-lg rounded-2xl shadow-2xl p-6 space-y-5 relative text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="flex justify-between items-center border-b border-[#2E2E34] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#222226] text-emerald-400 border border-[#2E2E34]">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-widest uppercase block font-bold text-[#8A8F98]">
                MODIFICAR REGISTRO
              </span>
              <h3 className="text-lg font-extrabold text-white uppercase tracking-tight font-display">
                Editar {isSupp ? 'Suplemento' : 'Alimento / Comida'}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#8A8F98] hover:text-white p-1.5 rounded-lg hover:bg-[#222226] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
          {/* Selector de Tipo de Comida */}
          <div className="space-y-2">
            <label className="block uppercase text-[#8A8F98] tracking-wider text-[11px] font-bold">
              Momento del Día / Tipo
            </label>
            <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-[#222226] border border-[#2E2E34]">
              {MEAL_TYPES.map((type) => {
                const isSelected = mealType === type.id;

                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setMealType(type.id)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-mono font-bold tracking-wider transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500 text-black shadow-sm'
                        : 'text-[#8A8F98] hover:text-white hover:bg-[#18181B]'
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
              <label className="block uppercase text-[#8A8F98] tracking-wider text-[11px] font-bold">
                Horario
              </label>
              <input
                type="time"
                value={mealTime}
                onChange={(e) => setMealTime(e.target.value)}
                className="w-full bg-[#222226] border border-[#2E2E34] focus:border-emerald-500 px-3 py-2 text-xs text-center text-white rounded-xl font-mono cursor-pointer outline-none shadow-sm"
                required
              />
            </div>

            {/* Nombre del Alimento o Suplemento */}
            <div className="md:col-span-8 space-y-1.5">
              <label className="block uppercase text-[#8A8F98] font-bold tracking-wider text-[11px]">
                {isSupp ? 'Nombre del Suplemento' : 'Nombre del Alimento'}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#222226] border border-[#2E2E34] focus:border-emerald-500 px-4 py-2 text-xs text-white rounded-xl font-medium outline-none shadow-sm"
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
              <label className="block uppercase text-amber-400 tracking-wider text-[11px] font-extrabold">
                Calorías (Kcal)
              </label>
              <input
                type="number"
                min="0"
                max="10000"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                className="w-full bg-[#222226] border border-[#2E2E34] focus:border-emerald-500 px-3 py-2 rounded-xl text-white font-black text-center text-sm outline-none shadow-sm"
                required
              />
            </div>

            {/* Proteína */}
            <div className="space-y-1.5">
              <label className="block uppercase text-cyan-400 tracking-wider text-[11px] font-extrabold">
                Proteína (G)
              </label>
              <input
                type="number"
                min="0"
                max="1000"
                step="0.5"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                className="w-full bg-[#222226] border border-[#2E2E34] focus:border-emerald-500 px-3 py-2 rounded-xl text-white font-black text-center text-sm outline-none shadow-sm"
              />
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#2E2E34]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[#8A8F98] hover:text-white uppercase tracking-wider transition-colors cursor-pointer font-bold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold uppercase rounded-xl shadow-lg flex items-center gap-2 cursor-pointer transition-all"
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
