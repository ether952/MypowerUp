import React, { useState, useEffect } from 'react';
import { X, Check, Dumbbell, Plus, XCircle } from 'lucide-react';
import { calculate1RM } from '../utils/helpers';

export default function EditWorkoutModal({
  isOpen,
  onClose,
  workout,
  onSave,
}) {
  const [name, setName] = useState('');
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');
  const [useCustomSets, setUseCustomSets] = useState(false);
  const [customSets, setCustomSets] = useState([]);

  useEffect(() => {
    if (workout) {
      setName(workout.name || '');
      setSets(workout.sets !== undefined ? String(workout.sets) : '4');
      setReps(workout.reps !== undefined ? String(workout.reps) : '10');
      setWeight(workout.weight !== undefined ? String(workout.weight) : '0');

      if (workout.detailedSets && Array.isArray(workout.detailedSets) && workout.detailedSets.length > 0) {
        setUseCustomSets(true);
        setCustomSets(workout.detailedSets.map((s, idx) => ({
          setNumber: idx + 1,
          reps: String(s.reps || '10'),
          weight: String(s.weight || '')
        })));
      } else {
        setUseCustomSets(false);
        setCustomSets([]);
      }
    }
  }, [workout]);

  if (!isOpen || !workout) return null;

  const handleCustomSetChange = (index, field, value) => {
    setCustomSets(prev => prev.map((item, idx) => idx === index ? { ...item, [field]: value } : item));
  };

  const handleAddCustomSet = () => {
    setCustomSets(prev => {
      const last = prev[prev.length - 1] || { reps: '10', weight: '' };
      return [...prev, { setNumber: prev.length + 1, reps: last.reps || '10', weight: last.weight || '' }];
    });
  };

  const handleRemoveCustomSet = (index) => {
    if (customSets.length <= 1) return;
    setCustomSets(prev => prev.filter((_, idx) => idx !== index).map((item, idx) => ({ ...item, setNumber: idx + 1 })));
  };

  const estimated1RM = useCustomSets && customSets.length > 0
    ? Math.max(...customSets.map(s => calculate1RM(Number(s.weight) || 0, Number(s.reps) || 0)))
    : calculate1RM(Number(weight) || 0, Number(reps) || 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (useCustomSets) {
      const validSets = customSets
        .filter((s) => Number(s.weight) >= 0 && Number(s.reps) > 0)
        .map((s, idx) => ({
          setNumber: idx + 1,
          reps: Math.max(1, parseInt(s.reps, 10) || 1),
          weight: Math.max(0, parseFloat(s.weight) || 0)
        }));

      if (validSets.length === 0) return;

      const maxWeight = Math.max(...validSets.map((s) => s.weight));
      const primaryReps = validSets[0]?.reps || 10;

      onSave({
        ...workout,
        name: name.trim(),
        sets: validSets.length,
        reps: primaryReps,
        weight: maxWeight,
        detailedSets: validSets
      });
    } else {
      onSave({
        ...workout,
        name: name.trim(),
        sets: Math.max(1, parseInt(sets, 10) || 1),
        reps: Math.max(1, parseInt(reps, 10) || 1),
        weight: Math.max(0, parseFloat(weight) || 0),
        detailedSets: null
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in">
      <div
        className="bg-white border border-zinc-200 w-full max-w-lg rounded-2xl shadow-2xl p-6 space-y-5 relative text-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="flex justify-between items-center border-b border-zinc-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-zinc-100 text-zinc-900 border border-zinc-200">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-zinc-500 tracking-widest uppercase block font-bold">
                // MODIFICAR REGISTRO
              </span>
              <h3 className="text-lg font-extrabold text-zinc-900 uppercase tracking-tight font-display">
                Editar Ejercicio
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-black p-1.5 rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
          {/* Nombre del Ejercicio */}
          <div className="space-y-1.5">
            <label className="block uppercase text-zinc-700 font-bold tracking-wider">
              Nombre del Ejercicio
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white border border-zinc-300 focus:border-black px-4 py-2.5 rounded-xl text-zinc-900 font-bold text-sm outline-none shadow-sm transition-colors"
              placeholder="Ej: Press Banca Plano"
              required
              autoFocus
            />
          </div>

          {/* Toggle Modo Diferentes Pesos por Serie */}
          <div className="flex items-center pt-0.5">
            <button
              type="button"
              onClick={() => {
                if (!useCustomSets) {
                  const num = Math.max(1, parseInt(sets, 10) || 4);
                  const initial = Array.from({ length: num }, (_, i) => ({
                    setNumber: i + 1,
                    reps: reps || '10',
                    weight: weight || ''
                  }));
                  setCustomSets(initial);
                }
                setUseCustomSets(!useCustomSets);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-bold tracking-wider transition-all duration-200 cursor-pointer select-none flex items-center gap-2 ${
                useCustomSets
                  ? 'bg-black text-white shadow-sm font-black'
                  : 'bg-zinc-100 text-zinc-600 hover:text-black border border-zinc-200'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${useCustomSets ? 'bg-white' : 'bg-zinc-400'}`}></span>
              <span>Diferente peso</span>
            </button>
          </div>

          {!useCustomSets ? (
            <div className="grid grid-cols-3 gap-3">
              {/* Series */}
              <div className="space-y-1.5">
                <label className="block uppercase text-zinc-600 tracking-wider text-[11px] font-bold">
                  Series
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={sets}
                  onChange={(e) => setSets(e.target.value)}
                  className="w-full bg-white border border-zinc-300 focus:border-black px-3 py-2 rounded-xl text-zinc-900 font-bold text-center text-sm outline-none shadow-sm"
                  required={!useCustomSets}
                />
              </div>

              {/* Repeticiones */}
              <div className="space-y-1.5">
                <label className="block uppercase text-zinc-600 tracking-wider text-[11px] font-bold">
                  Reps
                </label>
                <input
                  type="number"
                  min="1"
                  max="200"
                  value={reps}
                  onChange={(e) => setReps(e.target.value)}
                  className="w-full bg-white border border-zinc-300 focus:border-black px-3 py-2 rounded-xl text-zinc-900 font-bold text-center text-sm outline-none shadow-sm"
                  required={!useCustomSets}
                />
              </div>

              {/* Peso (kg) */}
              <div className="space-y-1.5">
                <label className="block uppercase text-zinc-900 tracking-wider text-[11px] font-extrabold">
                  Peso (KG)
                </label>
                <input
                  type="number"
                  min="0"
                  max="1000"
                  step="0.5"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full bg-white border border-zinc-300 focus:border-black px-3 py-2 rounded-xl text-zinc-900 font-black text-center text-sm outline-none shadow-sm"
                  required={!useCustomSets}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              <div className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-wider">
                // Series ({customSets.length})
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
                {customSets.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center justify-between gap-2 shadow-sm"
                  >
                    <span className="text-xs font-mono font-black text-zinc-900 shrink-0">
                      #{idx + 1}
                    </span>

                    <div className="flex items-center gap-1.5 flex-1">
                      <div className="flex-1">
                        <div className="text-[8px] font-mono text-zinc-500 uppercase">Reps</div>
                        <input
                          type="number"
                          min="1"
                          value={item.reps}
                          onChange={(e) => handleCustomSetChange(idx, 'reps', e.target.value)}
                          className="w-full bg-white border border-zinc-300 focus:border-black px-2 py-1 text-xs text-center text-zinc-900 rounded-lg font-mono font-bold outline-none"
                          placeholder="10"
                          required
                        />
                      </div>

                      <div className="flex-1">
                        <div className="text-[8px] font-mono text-zinc-900 uppercase font-bold">Kg</div>
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          value={item.weight}
                          onChange={(e) => handleCustomSetChange(idx, 'weight', e.target.value)}
                          className="w-full bg-white border border-zinc-300 focus:border-black px-2 py-1 text-xs text-center text-zinc-900 rounded-lg font-mono font-bold outline-none"
                          placeholder="80"
                          required
                        />
                      </div>
                    </div>

                    {customSets.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveCustomSet(idx)}
                        className="p-1 text-zinc-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Eliminar serie"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-center pt-1">
                <button
                  type="button"
                  onClick={handleAddCustomSet}
                  className="w-8 h-8 rounded-full bg-black hover:bg-zinc-800 text-white flex items-center justify-center transition-all shadow-md cursor-pointer"
                  title="Agregar serie"
                  aria-label="Agregar serie"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                </button>
              </div>
            </div>
          )}

          {/* Indicador de 1RM Estimado */}
          {estimated1RM > 0 && (
            <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center justify-between">
              <span className="text-zinc-500 text-[11px]">1RM Estimado (Fuerza Máx):</span>
              <span className="text-zinc-900 font-extrabold text-sm">~{estimated1RM} KG</span>
            </div>
          )}

          {/* Botones de Acción */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-zinc-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-zinc-500 hover:text-black uppercase tracking-wider transition-colors cursor-pointer font-bold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-black hover:bg-zinc-800 text-white font-bold uppercase rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all"
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
