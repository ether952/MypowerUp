import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Dumbbell,
  Sparkles,
  Plus,
  Check,
  Zap,
  Layers,
  ChevronRight,
  Info,
  Flame,
  Activity,
  RotateCcw
} from 'lucide-react';
import {
  getExerciseDbList,
  BODY_PARTS_ES,
  CURATED_FALLBACK_EXERCISES
} from '../services/exerciseDbService';

export default function ExerciseDbPicker({ onAddWorkout }) {
  const [exercises, setExercises] = useState(CURATED_FALLBACK_EXERCISES);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBodyPart, setSelectedBodyPart] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExercise, setSelectedExercise] = useState(CURATED_FALLBACK_EXERCISES[0]);

  // Estados del formulario de carga rápida
  const [sets, setSets] = useState('4');
  const [reps, setReps] = useState('10');
  const [weight, setWeight] = useState('40');
  const [isAddedSuccess, setIsAddedSuccess] = useState(false);

  // Cargar ejercicios desde la API de ExerciseDB
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setIsLoading(true);
      try {
        const list = await getExerciseDbList(50);
        if (isMounted && list && list.length > 0) {
          setExercises(list);
          setSelectedExercise(list[0]);
        }
      } catch (err) {
        console.error('Error cargando ExerciseDB:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, []);

  // Filtrar ejercicios por categoría y buscador
  const filteredExercises = useMemo(() => {
    return exercises.filter((ex) => {
      const matchCategory =
        selectedBodyPart === 'all' ||
        (ex.bodyParts && ex.bodyParts.some(bp => bp.toLowerCase().includes(selectedBodyPart.toLowerCase()))) ||
        (ex.targetMuscles && ex.targetMuscles.some(tm => tm.toLowerCase().includes(selectedBodyPart.toLowerCase())));

      const query = searchQuery.trim().toLowerCase();
      const matchSearch =
        !query ||
        ex.name.toLowerCase().includes(query) ||
        (ex.targetMuscles && ex.targetMuscles.some(m => m.toLowerCase().includes(query))) ||
        (ex.equipments && ex.equipments.some(e => e.toLowerCase().includes(query)));

      return matchCategory && matchSearch;
    });
  }, [exercises, selectedBodyPart, searchQuery]);

  // Manejar envío al entrenamiento del día
  const handleAdd = (e) => {
    e?.preventDefault();
    if (!selectedExercise) return;

    const numSets = parseInt(sets, 10) || 4;
    const numReps = parseInt(reps, 10) || 10;
    const numWeight = parseFloat(weight) || 0;

    const workoutPayload = {
      name: selectedExercise.name,
      sets: numSets,
      reps: numReps,
      weight: numWeight,
      bodyPart: selectedExercise.bodyParts?.[0] || 'gym',
      exerciseId: selectedExercise.exerciseId || '',
      gifUrl: selectedExercise.gifUrl || ''
    };

    if (onAddWorkout) {
      onAddWorkout(workoutPayload);
      setIsAddedSuccess(true);
      setTimeout(() => setIsAddedSuccess(false), 2000);
    }
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-3xl p-4 sm:p-7 shadow-xs space-y-6">

      {/* Cabecera & Selector de Categorías */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-100 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-600 font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>CATÁLOGO GIF ANIMADO • EXERCISEDB</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-zinc-900 uppercase font-display tracking-tight">
            EJERCICIOS CON MOVIMIENTO EN VIVO
          </h3>
        </div>

        {/* Buscador de ejercicios */}
        <div className="relative w-full lg:w-72">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar ejercicio o músculo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-50 border border-zinc-200 focus:border-zinc-900 pl-10 pr-4 py-2 text-xs text-zinc-900 rounded-xl font-mono placeholder-zinc-400 outline-none transition-all shadow-xs"
          />
        </div>
      </div>

      {/* Píldoras de Categorías Musculares */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
        {BODY_PARTS_ES.map((part) => (
          <button
            key={part.id}
            type="button"
            onClick={() => setSelectedBodyPart(part.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold uppercase whitespace-nowrap transition-all cursor-pointer ${
              selectedBodyPart === part.id
                ? 'bg-zinc-900 text-white shadow-xs'
                : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'
            }`}
          >
            {part.label}
          </button>
        ))}
      </div>

      {/* Grid Principal: Lista con GIF a la izquierda y Vista en Detalle a la derecha */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* COLUMNA IZQUIERDA: Tarjetas de Ejercicios */}
        <div className="lg:col-span-7 space-y-3 max-h-[520px] overflow-y-auto pr-1 custom-scrollbar">
          {isLoading ? (
            <div className="py-20 text-center text-zinc-400 font-mono text-xs flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
              <span>Conectando con ExerciseDB...</span>
            </div>
          ) : filteredExercises.length === 0 ? (
            <div className="py-20 text-center text-zinc-400 font-mono text-xs border border-dashed border-zinc-200 rounded-2xl">
              No se encontraron ejercicios con ese criterio.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredExercises.map((ex) => {
                const isSelected = selectedExercise?.exerciseId === ex.exerciseId;
                return (
                  <div
                    key={ex.exerciseId || ex.name}
                    onClick={() => setSelectedExercise(ex)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 group relative overflow-hidden ${
                      isSelected
                        ? 'bg-zinc-900 text-white border-zinc-900 shadow-md ring-2 ring-emerald-400/50'
                        : 'bg-zinc-50 hover:bg-white text-zinc-900 border-zinc-200 hover:border-zinc-300 hover:shadow-sm'
                    }`}
                  >
                    {/* Vista previa miniatura del GIF */}
                    <div className="w-full h-32 rounded-xl bg-white overflow-hidden flex items-center justify-center border border-zinc-200/80 relative">
                      <img
                        src={ex.gifUrl}
                        alt={ex.name}
                        loading="lazy"
                        className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-md text-[9px] font-mono uppercase font-bold ${
                        isSelected ? 'bg-zinc-900 text-emerald-400 border border-zinc-700' : 'bg-zinc-100 text-zinc-700 border border-zinc-200'
                      }`}>
                        {ex.bodyParts?.[0] || 'gym'}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-xs uppercase font-sans line-clamp-1 group-hover:text-emerald-500 transition-colors">
                        {ex.name}
                      </h4>
                      <p className={`text-[10px] font-mono mt-0.5 ${isSelected ? 'text-zinc-400' : 'text-zinc-500'}`}>
                        {ex.targetMuscles?.join(', ') || ex.equipments?.[0] || 'General'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* COLUMNA DERECHA: Detalle del Ejercicio Seleccionado con GIF Animado Grande & Carga de Peso */}
        <div className="lg:col-span-5 bg-zinc-50 border border-zinc-200 rounded-2xl p-5 space-y-5 sticky top-20 shadow-xs">
          {selectedExercise ? (
            <>
              {/* Contenedor del GIF Animado en Grande */}
              <div className="w-full h-64 rounded-xl bg-white border border-zinc-200 overflow-hidden flex items-center justify-center p-2 relative shadow-xs">
                <img
                  src={selectedExercise.gifUrl}
                  alt={selectedExercise.name}
                  className="w-full h-full object-contain mix-blend-multiply"
                />
                <div className="absolute bottom-2 left-2 flex gap-1">
                  {selectedExercise.equipments?.map((eq, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-md bg-zinc-900 text-white text-[9px] font-mono uppercase font-bold shadow-xs">
                      {eq}
                    </span>
                  ))}
                </div>
              </div>

              {/* Título & Músculos */}
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-emerald-600 font-bold uppercase tracking-wider">
                  EJERCICIO SELECCIONADO
                </span>
                <h4 className="text-base font-extrabold text-zinc-900 uppercase tracking-tight leading-tight">
                  {selectedExercise.name}
                </h4>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {selectedExercise.targetMuscles?.map((tm, idx) => (
                    <span key={idx} className="text-[10px] font-mono bg-white text-zinc-700 px-2 py-0.5 rounded-md border border-zinc-200">
                      Músculo: {tm}
                    </span>
                  ))}
                </div>
              </div>

              {/* Formulario de Series, Repeticiones y Peso */}
              <form onSubmit={handleAdd} className="space-y-4 pt-2 border-t border-zinc-200">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono text-zinc-500 uppercase font-semibold">Series</label>
                    <input
                      type="number"
                      min="1"
                      value={sets}
                      onChange={(e) => setSets(e.target.value)}
                      className="w-full bg-white border border-zinc-200 focus:border-zinc-900 py-1.5 text-xs text-center text-zinc-900 rounded-lg font-mono font-bold outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono text-zinc-500 uppercase font-semibold">Reps</label>
                    <input
                      type="number"
                      min="1"
                      value={reps}
                      onChange={(e) => setReps(e.target.value)}
                      className="w-full bg-white border border-zinc-200 focus:border-zinc-900 py-1.5 text-xs text-center text-zinc-900 rounded-lg font-mono font-bold outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono text-zinc-500 uppercase font-semibold">Peso (kg)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="w-full bg-white border border-zinc-200 focus:border-zinc-900 py-1.5 text-xs text-center text-zinc-900 rounded-lg font-mono font-bold outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Botón de Carga Directa */}
                <button
                  type="submit"
                  className={`w-full py-3 rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-98 ${
                    isAddedSuccess
                      ? 'bg-emerald-500 text-black'
                      : 'bg-zinc-900 hover:bg-black text-white'
                  }`}
                >
                  {isAddedSuccess ? (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>¡EJERCICIO AGREGADO!</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 stroke-[3]" />
                      <span>AGREGAR A MI ENTRENAMIENTO</span>
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="py-24 text-center text-xs font-mono text-zinc-400">
              Selecciona un ejercicio de la lista para ver su GIF y cargarlo.
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
