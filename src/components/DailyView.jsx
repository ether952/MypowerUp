import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Trash2,
  ArrowDown,
  ChevronDown,
  Clock,
  Dumbbell,
  Zap,
  Check
} from 'lucide-react';
import {
  calculate1RM,
  QUICK_FOODS,
  QUICK_EXERCISES,
  QUICK_SUPPLEMENTS,
  MEAL_TYPES,
  getCurrentTimeString
} from '../utils/helpers';

// Helper para animación suave de scroll
function ScrollReveal({ children, className = '', delay = 0 }) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`reveal-hidden ${isVisible ? 'reveal-visible' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

export default function DailyView({
  currentDay,
  selectedDate,
  onAddFood,
  onDeleteFood,
  onAddWorkout,
  onDeleteWorkout,
  rememberedWorkouts: propRememberedWorkouts,
  onUpdateRememberedWorkouts,
  rememberedFoods: propRememberedFoods,
  onUpdateRememberedFoods
}) {
  // === ESTADOS GYM ===
  const [exerciseName, setExerciseName] = useState('');
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');
  const [showQuickExercises, setShowQuickExercises] = useState(false);
  const [exerciseSuggestions, setExerciseSuggestions] = useState([]);
  const [showExerciseSuggestions, setShowExerciseSuggestions] = useState(false);

  // === ESTADOS COMIDAS & SUPLEMENTOS ===
  const [mealType, setMealType] = useState('almuerzo');
  const [mealTime, setMealTime] = useState(() => getCurrentTimeString());
  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [showQuickFoods, setShowQuickFoods] = useState(false);
  const [showQuickSupps, setShowQuickSupps] = useState(false);
  const [foodSuggestions, setFoodSuggestions] = useState([]);
  const [showFoodSuggestions, setShowFoodSuggestions] = useState(false);

  // === BASE DE MEMORIA (Persiste en LocalStorage y Firebase) ===
  const [localRememberedWorkouts, setLocalRememberedWorkouts] = useState(() => {
    try {
      const saved = localStorage.getItem('mypowerup_remembered_workouts');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  const [localRememberedFoods, setLocalRememberedFoods] = useState(() => {
    try {
      const saved = localStorage.getItem('mypowerup_remembered_foods');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  const rememberedWorkouts = propRememberedWorkouts !== undefined ? propRememberedWorkouts : localRememberedWorkouts;
  const rememberedFoods = propRememberedFoods !== undefined ? propRememberedFoods : localRememberedFoods;

  const foodSectionRef = useRef(null);
  const exerciseContainerRef = useRef(null);
  const foodContainerRef = useRef(null);

  // Cerrar dropdowns si se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (exerciseContainerRef.current && !exerciseContainerRef.current.contains(event.target)) {
        setShowQuickExercises(false);
        setShowExerciseSuggestions(false);
      }
      if (foodContainerRef.current && !foodContainerRef.current.contains(event.target)) {
        setShowQuickFoods(false);
        setShowQuickSupps(false);
        setShowFoodSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Totales
  const totalCalories = (currentDay.foods || []).reduce((acc, curr) => acc + (Number(curr.calories) || 0), 0);
  const totalProtein = (currentDay.foods || []).reduce((acc, curr) => acc + (Number(curr.protein) || 0), 0);
  const totalTonnage = (currentDay.workouts || []).reduce(
    (acc, curr) => acc + (Number(curr.weight) || 0), 
    0
  );

  const live1RM = calculate1RM(Number(weight), Number(reps));

  // ==========================================
  // AUTORRELLENADO & MEMORIA PARA EJERCICIOS
  // ==========================================
  const handleExerciseNameChange = (e) => {
    const val = e.target.value;
    setExerciseName(val);

    if (!val || val.trim().length === 0) {
      setExerciseSuggestions([]);
      setShowExerciseSuggestions(false);
      return;
    }

    const query = val.toLowerCase().trim();

    // Buscar en memoria aprendida
    const rememberedMatches = Object.values(rememberedWorkouts).filter(item =>
      item.name.toLowerCase().includes(query)
    );

    // Buscar en ejercicios rápidos
    const presetMatches = QUICK_EXERCISES.filter(name =>
      name.toLowerCase().includes(query) && !rememberedMatches.some(r => r.name.toLowerCase() === name.toLowerCase())
    ).map(name => ({ name, isPreset: true }));

    const combined = [...rememberedMatches, ...presetMatches].slice(0, 6);
    setExerciseSuggestions(combined);
    setShowExerciseSuggestions(combined.length > 0);
  };

  const handleSelectExerciseSuggestion = (item) => {
    setExerciseName(item.name);
    if (item.sets) setSets(item.sets);
    if (item.reps) setReps(item.reps);
    if (item.weight) setWeight(item.weight);
    setShowExerciseSuggestions(false);
  };

  // ==========================================
  // AUTORRELLENADO & MEMORIA PARA COMIDAS
  // ==========================================
  const handleFoodNameChange = (e) => {
    const val = e.target.value;
    setFoodName(val);

    if (!val || val.trim().length === 0) {
      setFoodSuggestions([]);
      setShowFoodSuggestions(false);
      return;
    }

    const query = val.toLowerCase().trim();

    // Buscar en memoria aprendida
    const rememberedMatches = Object.values(rememberedFoods).filter(item =>
      item.name.toLowerCase().includes(query)
    );

    // Buscar en alimentos frecuentes
    const presetFoods = QUICK_FOODS.filter(f =>
      f.name.toLowerCase().includes(query) && !rememberedMatches.some(r => r.name.toLowerCase() === f.name.toLowerCase())
    );

    // Buscar en suplementos
    const presetSupps = QUICK_SUPPLEMENTS.filter(s =>
      s.name.toLowerCase().includes(query) && !rememberedMatches.some(r => r.name.toLowerCase() === s.name.toLowerCase())
    );

    const combined = [...rememberedMatches, ...presetFoods, ...presetSupps].slice(0, 6);
    setFoodSuggestions(combined);
    setShowFoodSuggestions(combined.length > 0);
  };

  const handleSelectFoodSuggestion = (item) => {
    setFoodName(item.name);
    if (item.calories !== undefined) setCalories(item.calories);
    if (item.protein !== undefined) setProtein(item.protein);
    if (item.mealType) setMealType(item.mealType);
    setShowFoodSuggestions(false);
  };

  // Guardar ejercicio + actualizar memoria
  const handleSubmitWorkout = (e) => {
    e.preventDefault();
    if (!exerciseName || !weight) return;

    const workoutPayload = {
      name: exerciseName.trim(),
      sets: Number(sets) || 1,
      reps: Number(reps) || 1,
      weight: Number(weight) || 0,
    };

    onAddWorkout(workoutPayload);

    // Guardar en memoria
    const key = exerciseName.trim().toLowerCase();
    const updated = {
      ...rememberedWorkouts,
      [key]: {
        name: exerciseName.trim(),
        sets: Number(sets) || 1,
        reps: Number(reps) || 1,
        weight: Number(weight) || 0,
        lastUsed: Date.now()
      }
    };
    if (onUpdateRememberedWorkouts) {
      onUpdateRememberedWorkouts(updated);
    } else {
      setLocalRememberedWorkouts(updated);
      localStorage.setItem('mypowerup_remembered_workouts', JSON.stringify(updated));
    }

    setExerciseName('');
    setSets('');
    setReps('');
    setWeight('');
    setShowExerciseSuggestions(false);
    setShowQuickExercises(false);
  };

  // Guardar comida + actualizar memoria
  const handleSubmitFood = (e) => {
    e.preventDefault();
    if (!foodName) return;

    const foodPayload = {
      name: foodName.trim(),
      calories: Number(calories) || 0,
      protein: Number(protein) || 0,
      mealType: mealType || 'almuerzo',
      time: mealTime || getCurrentTimeString(),
    };

    onAddFood(foodPayload);

    // Guardar en memoria
    const key = foodName.trim().toLowerCase();
    const updated = {
      ...rememberedFoods,
      [key]: {
        name: foodName.trim(),
        calories: Number(calories) || 0,
        protein: Number(protein) || 0,
        mealType: mealType || 'almuerzo',
        lastUsed: Date.now()
      }
    };
    if (onUpdateRememberedFoods) {
      onUpdateRememberedFoods(updated);
    } else {
      setLocalRememberedFoods(updated);
      localStorage.setItem('mypowerup_remembered_foods', JSON.stringify(updated));
    }

    setFoodName('');
    setCalories('');
    setProtein('');
    setShowFoodSuggestions(false);
    setShowQuickFoods(false);
    setShowQuickSupps(false);
  };

  const scrollToFood = () => {
    foodSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="w-full space-y-24 pb-32">

      {/* ========================================================================= */}
      {/* 01. SECCIÓN SUPERIOR: ENTRENAMIENTO & GIMNASIO (OCUPA TODO EL ESPACIO)    */}
      {/* ========================================================================= */}
      <section className="min-h-[82vh] flex flex-col justify-between py-6 px-4 sm:px-8 border-b border-purple-500/20 relative">

        {/* Glows ambientales */}
        <div className="ambient-glow-purple w-96 h-96 -top-10 -left-10 opacity-30" />
        <div className="ambient-glow-cyan w-80 h-80 top-1/2 -right-10 opacity-25" />

        <div className="space-y-10 relative z-10 max-w-6xl mx-auto w-full">

          {/* Cabecera Principal */}
          <ScrollReveal delay={0}>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-xs tracking-[0.25em] text-neon-purple font-mono uppercase">
                  <span className="inline-block w-2 h-2 rounded-full bg-neon-purple animate-ping"></span>
                  <span>01 // GIMNASIO & CARGAS</span>
                </div>
                <h2 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white uppercase font-display">
                  REGISTRA TU <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-purple via-neon-cyan to-neon-mint">SESIÓN</span>
                </h2>
              </div>

              {/* Tonelaje Total en Vivo */}
              <div className="flex items-center gap-6 border-l-2 border-neon-purple/40 pl-6">
                <div>
                  <span className="block text-[11px] uppercase tracking-widest text-neutral-400 font-mono">Peso Total</span>
                  <span className="text-3xl sm:text-4xl font-black font-mono text-neon-cyan">
                    {totalTonnage.toLocaleString()} <span className="text-sm font-sans text-neutral-400">KG</span>
                  </span>
                </div>
                <div>
                  <span className="block text-[11px] uppercase tracking-widest text-neutral-400 font-mono">Ejercicios</span>
                  <span className="text-3xl sm:text-4xl font-black font-mono text-white">
                    {currentDay.workouts?.length || 0}
                  </span>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Formulario de Carga de Ejercicios */}
          <ScrollReveal delay={100}>
            <form onSubmit={handleSubmitWorkout} className="space-y-6 pt-2 relative">

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                {/* Ejercicio con Dropdown 100% Opaco y sin solapamiento */}
                <div ref={exerciseContainerRef} className="md:col-span-6 space-y-2 relative">
                  <div className="flex justify-between items-center text-xs tracking-wider uppercase text-neutral-400 font-mono">
                    <label className="flex items-center gap-1.5">
                      <span>Nombre del Ejercicio</span>
                      {Object.keys(rememberedWorkouts).length > 0 && (
                        <span className="text-[10px] text-neon-cyan lowercase font-normal">(con memoria)</span>
                      )}
                    </label>

                    {/* Botón sugerencias */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => {
                          setShowQuickExercises(!showQuickExercises);
                          setShowExerciseSuggestions(false);
                        }}
                        className="text-neon-purple hover:text-white transition-colors flex items-center gap-1 lowercase text-[11px] font-bold"
                      >
                        [ sugerencias + ]
                      </button>

                      {/* Dropdown de Sugerencias con FONDO 100% OPACO SÓLIDO */}
                      {showQuickExercises && (
                        <div className="absolute right-0 mt-3 w-80 bg-[#0E0926] border-2 border-neon-purple/70 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.9)] py-2.5 z-50 max-h-64 overflow-y-auto divide-y divide-white/10">
                          <div className="px-4 py-2 text-[10px] font-mono text-neon-purple uppercase font-bold tracking-wider">
                            Ejercicios Frecuentes
                          </div>
                          {QUICK_EXERCISES.map((name, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setExerciseName(name);
                                setShowQuickExercises(false);
                              }}
                              className="w-full text-left px-4 py-2.5 text-xs text-white hover:bg-[#231B54] hover:text-neon-cyan transition-colors font-medium"
                            >
                              {name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <input
                    type="text"
                    placeholder="Ej: Press banca, Sentadilla, Dominadas..."
                    value={exerciseName}
                    onChange={handleExerciseNameChange}
                    onFocus={() => {
                      if (exerciseName.trim().length > 0 && exerciseSuggestions.length > 0) {
                        setShowExerciseSuggestions(true);
                      }
                    }}
                    className="w-full input-futuristic px-5 py-4 text-lg text-white placeholder-neutral-500 rounded-xl font-medium"
                    required
                  />

                  {/* Dropdown de Autocompletado / Memoria inteligente con FONDO SÓLIDO */}
                  {showExerciseSuggestions && exerciseSuggestions.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-2 bg-[#0E0926] border-2 border-neon-purple/80 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.95)] z-50 overflow-hidden divide-y divide-white/10 animate-fade-in-up">
                      <div className="px-4 py-2 bg-[#080419] text-[10px] font-mono text-neon-purple uppercase tracking-wider flex items-center justify-between font-bold">
                        <span>Memoria Inteligente</span>
                        <span className="text-neutral-400 font-normal">Click para autorrellenar</span>
                      </div>
                      {exerciseSuggestions.map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectExerciseSuggestion(item)}
                          className="w-full text-left px-5 py-3 hover:bg-[#231B54] flex items-center justify-between text-xs transition-colors group cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5">
                            {item.sets ? (
                              <Zap className="w-3.5 h-3.5 text-neon-cyan" />
                            ) : (
                              <Dumbbell className="w-3.5 h-3.5 text-neutral-400 group-hover:text-neon-purple" />
                            )}
                            <span className="font-bold text-white group-hover:text-neon-cyan transition-colors">
                              {item.name}
                            </span>
                          </div>

                          {item.sets ? (
                            <span className="font-mono text-neon-mint text-[11px] font-bold">
                              {item.sets}s × {item.reps}r @ <strong className="text-neon-cyan">{item.weight}kg</strong>
                            </span>
                          ) : (
                            <span className="text-neutral-400 text-[10px] font-mono">Ejercicio sugerido</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Series */}
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-xs tracking-wider uppercase text-neutral-400 font-mono">Series</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="4"
                    value={sets}
                    onChange={(e) => setSets(e.target.value)}
                    className="w-full input-futuristic px-4 py-4 text-lg text-center text-white placeholder-neutral-500 rounded-xl font-mono font-bold"
                    required
                  />
                </div>

                {/* Repeticiones */}
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-xs tracking-wider uppercase text-neutral-400 font-mono">Reps</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="8"
                    value={reps}
                    onChange={(e) => setReps(e.target.value)}
                    className="w-full input-futuristic px-4 py-4 text-lg text-center text-white placeholder-neutral-500 rounded-xl font-mono font-bold"
                    required
                  />
                </div>

                {/* Peso */}
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-xs tracking-wider uppercase text-neutral-400 font-mono">Peso (Kg)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    placeholder="80"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full input-futuristic px-4 py-4 text-lg text-center text-neon-cyan placeholder-neutral-500 rounded-xl font-mono font-bold"
                    required
                  />
                </div>

              </div>

              {/* Fila de acción & cálculo en tiempo real */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                <div className="text-xs font-mono text-neutral-400">
                  {Number(weight) > 0 ? (
                    <div className="flex items-center gap-4 text-sm">
                      <span>Peso: <strong className="text-neon-cyan font-bold">{Number(weight)} KG</strong></span>
                      {Number(reps) > 0 && live1RM > 0 && (
                        <>
                          <span className="text-neutral-600">//</span>
                          <span>1RM Estimado: <strong className="text-neon-mint font-bold">{live1RM} KG</strong></span>
                        </>
                      )}
                    </div>
                  ) : (
                    <span className="text-neutral-500">Completa los datos para registrar tu ejercicio.</span>
                  )}
                </div>

                <button
                  type="submit"
                  className="px-8 py-4 bg-gradient-to-r from-neon-purple to-neon-violet hover:from-neon-violet hover:to-neon-fuchsia text-white font-black text-sm tracking-wider uppercase rounded-xl transition-all shadow-lg shadow-purple-600/30 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus className="w-5 h-5 stroke-[3]" /> AGREGAR EJERCICIO
                </button>
              </div>

            </form>
          </ScrollReveal>

          {/* Listado de Ejercicios del Día */}
          <ScrollReveal delay={150}>
            <div className="space-y-3 pt-6">
              <div className="text-xs font-mono tracking-widest text-neutral-400 uppercase flex items-center gap-2">
                <span>// REGISTROS DE ENTRENAMIENTO DE HOY</span>
                <span className="text-neon-purple">({currentDay.workouts?.length || 0})</span>
              </div>

              {(!currentDay.workouts || currentDay.workouts.length === 0) ? (
                <div className="py-12 text-center text-neutral-600 font-mono text-sm border-t border-b border-purple-500/10">
                  No hay series registradas aún. Agrega tu primer ejercicio arriba.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentDay.workouts.map((w) => {
                    const rm = calculate1RM(Number(w.weight), Number(w.reps));

                    return (
                      <div
                        key={w.id}
                        className="flex justify-between items-center p-5 bg-[#0E0926] hover:bg-[#150F38] border-l-4 border-neon-purple border-t border-r border-b border-white/5 rounded-xl transition-all hover:translate-x-1"
                      >
                        <div className="space-y-1">
                          <h4 className="font-bold text-white text-base tracking-tight">{w.name}</h4>
                          <div className="flex items-center gap-3 text-xs font-mono text-neutral-400">
                            <span className="text-white font-semibold">{w.sets} series × {w.reps} reps</span>
                            <span>•</span>
                            <span className="text-neon-cyan font-bold">{w.weight} KG</span>
                            {rm > 0 && (
                              <>
                                <span>•</span>
                                <span className="text-neutral-400 font-mono font-medium">({rm}k 1RM)</span>
                              </>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => onDeleteWorkout(w.id)}
                          className="text-neutral-500 hover:text-rose-400 p-2 transition-colors cursor-pointer"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </ScrollReveal>

        </div>

        {/* Botón para scrolear a comidas */}
        <div className="flex justify-center pt-8 pb-4">
          <button
            type="button"
            onClick={scrollToFood}
            className="group flex flex-col items-center gap-2 text-xs font-mono tracking-widest text-neutral-400 hover:text-neon-cyan transition-colors cursor-pointer"
          >
            <span>SCROLL PARA NUTRICIÓN & SUPLEMENTOS</span>
            <ArrowDown className="w-4 h-4 text-neon-purple group-hover:translate-y-1 transition-transform animate-bounce" />
          </button>
        </div>

      </section>


      {/* ========================================================================= */}
      {/* 02. SECCIÓN INFERIOR: NUTRICIÓN & SUPLEMENTOS (SCROLL REVEAL ANIMADO)     */}
      {/* ========================================================================= */}
      <section
        ref={foodSectionRef}
        className="min-h-[85vh] py-12 px-4 sm:px-8 relative"
      >
        <div className="ambient-glow-cyan w-96 h-96 top-10 right-10 opacity-25" />
        <div className="ambient-glow-mint w-80 h-80 bottom-10 left-10 opacity-20" />

        <div className="space-y-12 relative z-10 max-w-6xl mx-auto w-full">

          {/* Cabecera Nutrición con Reveal */}
          <ScrollReveal delay={0}>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-cyan-500/20 pb-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-xs tracking-[0.25em] text-neon-cyan font-mono uppercase">
                  <span className="inline-block w-2 h-2 rounded-full bg-neon-cyan animate-ping"></span>
                  <span>02 // DIETA & SUPLEMENTACIÓN</span>
                </div>
                <h2 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white uppercase font-display">
                  COMIDAS & <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan via-neon-mint to-neon-purple">SUPLEMENTOS</span>
                </h2>
              </div>

              {/* Totales Nutricionales */}
              <div className="flex items-center gap-6 border-l-2 border-neon-cyan/40 pl-6">
                <div>
                  <span className="block text-[11px] uppercase tracking-widest text-neutral-400 font-mono">Calorías Totales</span>
                  <span className="text-3xl sm:text-4xl font-black font-mono text-neon-blue">
                    {totalCalories.toLocaleString()} <span className="text-sm font-sans text-neutral-400">KCAL</span>
                  </span>
                </div>
                <div>
                  <span className="block text-[11px] uppercase tracking-widest text-neutral-400 font-mono">Proteínas</span>
                  <span className="text-3xl sm:text-4xl font-black font-mono text-neon-white">
                    {totalProtein} <span className="text-sm font-sans text-neutral-400">G</span>
                  </span>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Selector de Momentos & Suplementos con Contraste y Brillo Perfecto */}
          <ScrollReveal delay={100}>
            <div className="space-y-3">
              <div className="text-xs font-mono tracking-wider text-neutral-400 uppercase">
                // TIPO DE REGISTRO
              </div>

              <div className="flex flex-wrap gap-2.5 sm:gap-3">
                {MEAL_TYPES.map((type) => {
                  const isSelected = mealType === type.id;
                  const isSupp = type.id === 'suplementacion';

                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setMealType(type.id)}
                      className={`px-5 py-3.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer relative ${isSelected
                        ? isSupp
                          ? 'bg-neon-mint text-space-950 font-black shadow-[0_0_25px_rgba(0,245,160,0.5)] border-2 border-neon-mint scale-105'
                          : 'bg-neon-cyan text-space-950 font-black shadow-[0_0_25px_rgba(6,182,212,0.5)] border-2 border-neon-cyan scale-105'
                        : 'bg-[#0E0926] text-neutral-300 hover:text-white hover:bg-[#1A1242] border border-white/10 hover:border-neon-cyan/40'
                        }`}
                    >
                      <span className="flex items-center gap-2">
                        {isSelected && <span className="inline-block w-2 h-2 rounded-full bg-space-950 animate-pulse"></span>}
                        {type.tag} // {type.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </ScrollReveal>

          {/* Formulario de Carga de Comida o Suplemento con Reveal y Memoria */}
          <ScrollReveal delay={200}>
            <form onSubmit={handleSubmitFood} className="space-y-6 relative">

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                {/* Horario */}
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-xs tracking-wider uppercase text-neutral-400 font-mono">Horario</label>
                  <input
                    type="time"
                    value={mealTime}
                    onChange={(e) => setMealTime(e.target.value)}
                    className="w-full input-futuristic-cyan px-4 py-4 text-base text-center text-white rounded-xl font-mono cursor-pointer"
                    required
                  />
                </div>

                {/* Nombre Alimento / Suplemento con Dropdown 100% Opaco */}
                <div ref={foodContainerRef} className="md:col-span-5 space-y-2 relative">
                  <div className="flex justify-between items-center text-xs tracking-wider uppercase text-neutral-400 font-mono">
                    <label className="flex items-center gap-1.5">
                      <span>{mealType === 'suplementacion' ? 'Suplemento' : 'Alimento o Plato'}</span>
                      {Object.keys(rememberedFoods).length > 0 && (
                        <span className="text-[10px] text-neon-mint lowercase font-normal">(con memoria)</span>
                      )}
                    </label>

                    <div className="relative">
                      {mealType === 'suplementacion' ? (
                        <button
                          type="button"
                          onClick={() => {
                            setShowQuickSupps(!showQuickSupps);
                            setShowFoodSuggestions(false);
                          }}
                          className="text-neon-mint hover:text-white transition-colors flex items-center gap-1 lowercase text-[11px] font-bold"
                        >
                          [ suplementos + ]
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setShowQuickFoods(!showQuickFoods);
                            setShowFoodSuggestions(false);
                          }}
                          className="text-neon-cyan hover:text-white transition-colors flex items-center gap-1 lowercase text-[11px] font-bold"
                        >
                          [ alimentos frecuentes + ]
                        </button>
                      )}

                      {/* Menú de suplementos con FONDO 100% OPACO SÓLIDO */}
                      {showQuickSupps && (
                        <div className="absolute right-0 mt-3 w-80 bg-[#0E0926] border-2 border-emerald-500/70 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.9)] py-2.5 z-50 max-h-64 overflow-y-auto divide-y divide-white/10">
                          <div className="px-4 py-2 text-[10px] font-mono text-neon-mint uppercase font-bold tracking-wider">
                            Suplementación Deportiva
                          </div>
                          {QUICK_SUPPLEMENTS.map((item, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setFoodName(item.name);
                                setCalories(item.calories);
                                setProtein(item.protein);
                                setShowQuickSupps(false);
                              }}
                              className="w-full text-left px-4 py-2.5 text-xs text-white hover:bg-[#231B54] hover:text-neon-mint transition-colors flex justify-between items-center font-medium"
                            >
                              <span>{item.name}</span>
                              <span className="text-neon-mint font-mono text-[11px] font-bold">{item.protein}g prot</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Menú de alimentos con FONDO 100% OPACO SÓLIDO */}
                      {showQuickFoods && (
                        <div className="absolute right-0 mt-3 w-80 bg-[#0E0926] border-2 border-cyan-500/70 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.9)] py-2.5 z-50 max-h-64 overflow-y-auto divide-y divide-white/10">
                          <div className="px-4 py-2 text-[10px] font-mono text-neon-cyan uppercase font-bold tracking-wider">
                            Alimentos Frecuentes
                          </div>
                          {QUICK_FOODS.map((item, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setFoodName(item.name);
                                setCalories(item.calories);
                                setProtein(item.protein);
                                setShowQuickFoods(false);
                              }}
                              className="w-full text-left px-4 py-2.5 text-xs text-white hover:bg-[#231B54] hover:text-neon-cyan transition-colors flex justify-between items-center font-medium"
                            >
                              <span>{item.name}</span>
                              <span className="text-neon-cyan font-mono text-[11px] font-bold">{item.calories} kcal</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <input
                    type="text"
                    placeholder={
                      mealType === 'suplementacion'
                        ? 'Ej: Creatina Creapure 5g, Proteína Whey 30g...'
                        : 'Escribe para buscar o agregar (ej: Pollo con papas, Avena...)'
                    }
                    value={foodName}
                    onChange={handleFoodNameChange}
                    onFocus={() => {
                      if (foodName.trim().length > 0 && foodSuggestions.length > 0) {
                        setShowFoodSuggestions(true);
                      }
                    }}
                    className="w-full input-futuristic-cyan px-5 py-4 text-lg text-white placeholder-neutral-500 rounded-xl font-medium"
                    required
                  />

                  {/* Dropdown de Autocompletado / Memoria inteligente con FONDO 100% OPACO */}
                  {showFoodSuggestions && foodSuggestions.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-2 bg-[#0E0926] border-2 border-neon-cyan/80 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.95)] z-50 overflow-hidden divide-y divide-white/10 animate-fade-in-up">
                      <div className="px-4 py-2 bg-[#080419] text-[10px] font-mono text-neon-cyan uppercase tracking-wider flex items-center justify-between font-bold">
                        <span>Memoria Inteligente</span>
                        <span className="text-neutral-400 font-normal">Click para autorrellenar</span>
                      </div>
                      {foodSuggestions.map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectFoodSuggestion(item)}
                          className="w-full text-left px-5 py-3 hover:bg-[#231B54] flex items-center justify-between text-xs transition-colors group cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5">
                            <Zap className="w-3.5 h-3.5 text-neon-mint" />
                            <span className="font-bold text-white group-hover:text-neon-mint transition-colors">
                              {item.name}
                            </span>
                            {item.mealType && (
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-neutral-300 capitalize">
                                {item.mealType}
                              </span>
                            )}
                          </div>

                          <div className="font-mono text-[11px] text-neutral-200 font-bold">
                            <span className="text-neon-yellow">{item.calories || 0} kcal</span>
                            <span className="mx-1">•</span>
                            <span className="text-neon-mint">{item.protein || 0}g prot</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Calorías */}
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-xs tracking-wider uppercase text-neutral-400 font-mono">Calorías (Kcal)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="450"
                    value={calories}
                    onChange={(e) => setCalories(e.target.value)}
                    className="w-full input-futuristic-cyan px-4 py-4 text-lg text-center text-neon-yellow placeholder-neutral-500 rounded-xl font-mono font-bold"
                  />
                </div>

                {/* Proteína */}
                <div className="md:col-span-3 space-y-2">
                  <label className="block text-xs tracking-wider uppercase text-neutral-400 font-mono">Proteína (G)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    placeholder="35"
                    value={protein}
                    onChange={(e) => setProtein(e.target.value)}
                    className="w-full input-futuristic-cyan px-4 py-4 text-lg text-center text-neon-mint placeholder-neutral-500 rounded-xl font-mono font-bold"
                  />
                </div>

              </div>

              {/* Botón de envío */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-8 py-4 bg-gradient-to-r from-neon-cyan to-neon-blue hover:from-neon-blue hover:to-neon-purple text-white font-black text-sm tracking-wider uppercase rounded-xl transition-all shadow-lg shadow-cyan-600/30 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus className="w-5 h-5 stroke-[3]" /> AGREGAR {mealType === 'suplementacion' ? 'SUPLEMENTO' : 'COMIDA'}
                </button>
              </div>

            </form>
          </ScrollReveal>

          {/* Listado de Comidas y Suplementos con Reveal */}
          <ScrollReveal delay={250}>
            <div className="space-y-3 pt-6">
              <div className="text-xs font-mono tracking-widest text-neutral-400 uppercase flex items-center gap-2">
                <span>// REGISTROS NUTRICIONALES DE HOY</span>
                <span className="text-neon-cyan">({currentDay.foods?.length || 0})</span>
              </div>

              {(!currentDay.foods || currentDay.foods.length === 0) ? (
                <div className="py-12 text-center text-neutral-600 font-mono text-sm border-t border-b border-cyan-500/10">
                  No hay comidas o suplementos registrados hoy. Agrega uno arriba.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentDay.foods.map((f) => {
                    const mealMeta = MEAL_TYPES.find(m => m.id === f.mealType) || { label: f.mealType || 'Comida', tag: '00' };
                    const isSupp = f.mealType === 'suplementacion';

                    return (
                      <div
                        key={f.id}
                        className={`flex justify-between items-center p-5 bg-[#0E0926] hover:bg-[#150F38] border-t border-r border-b border-white/5 rounded-xl transition-all hover:translate-x-1 ${isSupp ? 'border-l-4 border-neon-mint' : 'border-l-4 border-neon-cyan'
                          }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded tracking-wider uppercase font-bold ${isSupp ? 'bg-neon-mint/10 text-neon-mint border border-neon-mint/30' : 'bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30'
                              }`}>
                              {mealMeta.label}
                            </span>
                            {f.time && (
                              <span className="text-xs font-mono text-neutral-400">{f.time}</span>
                            )}
                          </div>

                          <h4 className="font-bold text-white text-base tracking-tight">{f.name}</h4>

                          <div className="flex items-center gap-3 text-xs font-mono text-neutral-400">
                            <span className="text-neon-yellow font-semibold">{f.calories} kcal</span>
                            <span>•</span>
                            <span className="text-neon-mint font-bold">{f.protein || 0}g proteína</span>
                          </div>
                        </div>

                        <button
                          onClick={() => onDeleteFood(f.id)}
                          className="text-neutral-500 hover:text-rose-400 p-2 transition-colors cursor-pointer"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </ScrollReveal>

        </div>
      </section>

    </div>
  );
}
