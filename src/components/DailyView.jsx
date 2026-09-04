import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Plus,
  Trash2,
  ArrowDown,
  ArrowUp,
  ChevronDown,
  Clock,
  Dumbbell,
  Zap,
  Check,
  Footprints,
  Bike,
  Flame,
  MapPin,
  Route
} from 'lucide-react';
import {
  calculate1RM,
  QUICK_FOODS,
  QUICK_EXERCISES,
  EXERCISES_BY_MUSCLE,
  QUICK_SUPPLEMENTS,
  MEAL_TYPES,
  getCurrentTimeString,
  estimateNutrition,
  CARDIO_TYPES,
  calculateCardioCalories
} from '../utils/helpers';
import bgMusculacion from '../assets/bg-musculacion-hd.png';
import bgAlimentos from '../assets/bg-alimentos-hd.png';
import bgCardio from '../assets/bg-cardio-hd.png';

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
      { threshold: 0.05, rootMargin: '0px 0px -20px 0px' }
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
  onAddCardio,
  onDeleteCardio,
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
  const [expandedMuscle, setExpandedMuscle] = useState(null);
  const [exerciseSuggestions, setExerciseSuggestions] = useState([]);
  const [showExerciseSuggestions, setShowExerciseSuggestions] = useState(false);

  // === ESTADOS COMIDAS & SUPLEMENTOS ===
  const [mealType, setMealType] = useState('almuerzo');
  const [mealTime, setMealTime] = useState(() => getCurrentTimeString());
  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const currentNutritionEst = useMemo(() => estimateNutrition(foodName), [foodName]);
  const [showQuickFoods, setShowQuickFoods] = useState(false);
  const [showQuickSupps, setShowQuickSupps] = useState(false);
  const [foodSuggestions, setFoodSuggestions] = useState([]);
  const [showFoodSuggestions, setShowFoodSuggestions] = useState(false);

  // === ESTADOS CARDIO & ACTIVIDAD AERÓBICA ===
  const [cardioType, setCardioType] = useState('caminata');
  const [cardioFrom, setCardioFrom] = useState('');
  const [cardioTo, setCardioTo] = useState('');
  const [cardioDistance, setCardioDistance] = useState('');
  const [cardioTime, setCardioTime] = useState(() => getCurrentTimeString());
  
  const sec1Ref = useRef(null);
  const sec2Ref = useRef(null);
  const sec3Ref = useRef(null);
  const sec1ContentRef = useRef(null);
  const sec2ContentRef = useRef(null);

  // Animación suave de solapamiento: solo se eleva cuando la siguiente tarjeta entra en pantalla
  useEffect(() => {
    let rafId = null;
    const handleScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        const y = window.scrollY;
        const vh = window.innerHeight || 800;

        // Tarjeta 1: se mantiene intacta y solo asciende suavemente cuando Tarjeta 2 sube a cubrirla
        if (sec1ContentRef.current && sec2Ref.current) {
          const sec2Top = sec2Ref.current.offsetTop;
          const startTrigger = Math.max(0, sec2Top - vh * 0.8);
          const endTrigger = sec2Top - 68;
          const range = Math.max(150, endTrigger - startTrigger);
          const p1 = Math.min(1, Math.max(0, (y - startTrigger) / range));
          
          sec1ContentRef.current.style.transform = `translate3d(0, ${-p1 * 50}px, 0)`;
          sec1ContentRef.current.style.opacity = `${1 - p1 * 0.35}`;
        }

        // Tarjeta 2: se mantiene intacta y solo asciende suavemente cuando Tarjeta 3 sube a cubrirla
        if (sec2ContentRef.current && sec3Ref.current) {
          const sec3Top = sec3Ref.current.offsetTop;
          const startTrigger = Math.max(0, sec3Top - vh * 0.8);
          const endTrigger = sec3Top - 68;
          const range = Math.max(150, endTrigger - startTrigger);
          const p2 = Math.min(1, Math.max(0, (y - startTrigger) / range));
          
          sec2ContentRef.current.style.transform = `translate3d(0, ${-p2 * 50}px, 0)`;
          sec2ContentRef.current.style.opacity = `${1 - p2 * 0.35}`;
        }

        rafId = null;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  const estimatedCardioBurn = useMemo(() => {
    return calculateCardioCalories(cardioType, cardioDistance);
  }, [cardioType, cardioDistance]);

  const totalCardioKm = (currentDay.cardios || []).reduce((acc, curr) => acc + (Number(curr.distance) || 0), 0);
  const totalCardioBurned = (currentDay.cardios || []).reduce((acc, curr) => acc + (Number(curr.caloriesBurned) || 0), 0);

  const handleSubmitCardio = (e) => {
    e.preventDefault();
    if (!cardioDistance || parseFloat(cardioDistance) <= 0) return;

    const payload = {
      type: cardioType,
      from: cardioFrom.trim() || 'Inicio',
      to: cardioTo.trim() || 'Destino',
      distance: parseFloat(cardioDistance),
      caloriesBurned: estimatedCardioBurn,
      time: cardioTime || getCurrentTimeString(),
    };

    if (onAddCardio) {
      onAddCardio(payload);
    }

    setCardioFrom('');
    setCardioTo('');
    setCardioDistance('');
  };

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
    if (!foodName || !foodName.trim()) return;

    let finalCalories = Number(calories) || 0;
    let finalProtein = Number(protein) || 0;

    // Si el usuario no ingresó calorías o proteínas, resolver en el "back"
    const estimated = estimateNutrition(foodName);
    if (estimated.matched) {
      if (!calories || finalCalories === 0) {
        finalCalories = estimated.calories;
      }
      if (!protein || finalProtein === 0) {
        finalProtein = estimated.protein;
      }
    }

    const finalMealType = (estimated.matched && estimated.defaultMealType && mealType === 'almuerzo')
      ? estimated.defaultMealType
      : (mealType || 'almuerzo');

    const foodPayload = {
      name: foodName.trim(),
      calories: finalCalories,
      protein: finalProtein,
      mealType: finalMealType,
      time: mealTime || getCurrentTimeString(),
    };

    onAddFood(foodPayload);

    // Guardar en memoria inteligente aprendida
    const key = foodName.trim().toLowerCase();
    const updated = {
      ...rememberedFoods,
      [key]: {
        name: foodName.trim(),
        calories: finalCalories,
        protein: finalProtein,
        mealType: finalMealType,
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
    if (sec2Ref.current) {
      const top = sec2Ref.current.offsetTop - 68;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  const scrollToCardio = () => {
    if (sec3Ref.current) {
      const top = sec3Ref.current.offsetTop - 68;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="w-full relative pb-32">

      {/* ========================================================================= */}
      {/* 01. SECCIÓN SUPERIOR: ENTRENAMIENTO & GIMNASIO                            */}
      {/* ========================================================================= */}
      <section
        ref={sec1Ref}
        className="sticky top-[68px] z-10 min-h-[85vh] pb-16 sm:pb-24 flex flex-col justify-between py-6 px-4 sm:px-8 border-b border-purple-500/20 bg-[#050210] relative overflow-hidden"
      >

        {/* Glows ambientales */}
        <div className="ambient-glow-purple w-96 h-96 -top-10 -left-10 opacity-30" />
        <div className="ambient-glow-cyan w-80 h-80 top-1/2 -right-10 opacity-25" />

        {/* Imagen de fondo decorativa con transparencia real, oscurecida y difuminada */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden z-0 select-none">
          <img
            src={bgMusculacion}
            alt=""
            aria-hidden="true"
            className="w-[340px] sm:w-[500px] md:w-[640px] lg:w-[740px] max-w-none opacity-10 brightness-75 filter blur-[5px] drop-shadow-[0_0_30px_rgba(168,85,247,0.3)] object-contain select-none transform-gpu"
          />
        </div>

        <div ref={sec1ContentRef} className="space-y-10 relative z-10 max-w-6xl mx-auto w-full will-change-transform">

          {/* Cabecera Principal */}
          <ScrollReveal delay={0}>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-xs tracking-[0.25em] text-neon-purple font-mono uppercase">
                  <span>GIMNASIO & CARGAS</span>
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
          <ScrollReveal delay={100} className="relative z-30">
            <form onSubmit={handleSubmitWorkout} className="space-y-6 pt-2 relative">

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                {/* Ejercicio con Dropdown 100% Opaco y sin solapamiento */}
                <div ref={exerciseContainerRef} className="md:col-span-6 space-y-2 relative z-40">
                  <div className="flex justify-between items-center text-xs tracking-wider uppercase text-neutral-400 font-mono">
                    <label className="flex items-center gap-1.5">
                      <span>Nombre del Ejercicio</span>
                      {Object.keys(rememberedWorkouts).length > 0 && (
                        <span className="text-[10px] text-neon-cyan lowercase font-normal">(con memoria)</span>
                      )}
                    </label>

                    {/* Botón sugerencias */}
                    <div className="relative z-50">
                      <button
                        type="button"
                        onClick={() => {
                          setShowQuickExercises(!showQuickExercises);
                          setShowExerciseSuggestions(false);
                        }}
                        className="text-neon-purple hover:text-white transition-colors flex items-center gap-1 lowercase text-[11px] font-bold cursor-pointer"
                      >
                        [ Sugerencias ]
                      </button>

                      {/* Dropdown de Sugerencias con Acordeón y Encabezado Fijo Superior */}
                      {showQuickExercises && (
                        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-[#0E0926] border-2 border-neon-purple/80 rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.98)] z-50 overflow-hidden flex flex-col">
                          {/* Encabezado Fijo Superior - Nada se solapa ni se ve por detrás */}
                          <div className="px-4 py-3 bg-[#080419] border-b border-white/10 flex items-center justify-between text-[11px] font-mono text-neon-purple uppercase font-bold tracking-wider select-none shrink-0">
                            <span className="flex items-center gap-2">
                              <Dumbbell className="w-3.5 h-3.5 text-neon-purple" />
                              <span>Ejercicios por Músculo</span>
                            </span>
                            <span className="text-[10px] text-gray-400 font-mono font-normal">
                              {Object.keys(EXERCISES_BY_MUSCLE).length} categorías
                            </span>
                          </div>

                          {/* Lista scrolleable con categorías en acordeón */}
                          <div className="max-h-80 overflow-y-auto divide-y divide-white/10 custom-scrollbar">
                            {Object.entries(EXERCISES_BY_MUSCLE).map(([muscle, exercises]) => {
                              const isExpanded = expandedMuscle === muscle;
                              return (
                                <div key={muscle} className="transition-colors">
                                  {/* Botón de cada músculo para abrir/cerrar */}
                                  <button
                                    type="button"
                                    onClick={() => setExpandedMuscle(isExpanded ? null : muscle)}
                                    className={`w-full px-4 py-2.5 flex items-center justify-between text-left transition-colors cursor-pointer select-none ${
                                      isExpanded
                                        ? 'bg-[#1D1445] text-neon-cyan font-bold'
                                        : 'text-neutral-300 hover:bg-[#18113A] hover:text-white font-medium'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <span
                                        className={`w-2 h-2 rounded-full transition-all ${
                                          isExpanded
                                            ? 'bg-neon-cyan shadow-[0_0_8px_rgba(0,243,255,0.8)]'
                                            : 'bg-neon-purple/60'
                                        }`}
                                      />
                                      <span className="text-xs font-semibold">{muscle}</span>
                                      <span className="text-[10px] font-mono text-neutral-400">({exercises.length})</span>
                                    </div>
                                    <ChevronDown
                                      className={`w-4 h-4 transition-transform duration-200 ${
                                        isExpanded ? 'rotate-180 text-neon-cyan' : 'text-neutral-400'
                                      }`}
                                    />
                                  </button>

                                  {/* Lista de ejercicios desplegada al hacer clic */}
                                  {isExpanded && (
                                    <div className="bg-[#080419] py-1 border-t border-white/5 divide-y divide-white/5">
                                      {exercises.map((name, idx) => (
                                        <button
                                          key={idx}
                                          type="button"
                                          onClick={() => {
                                            setExerciseName(name);
                                            setShowQuickExercises(false);
                                          }}
                                          className="w-full text-left px-5 py-2.5 text-xs text-white/90 hover:bg-[#231B54] hover:text-neon-cyan transition-colors font-medium flex items-center justify-between group cursor-pointer"
                                        >
                                          <span className="group-hover:translate-x-0.5 transition-transform">{name}</span>
                                          <span className="text-[10px] text-white/30 group-hover:text-neon-cyan/80 transition-colors font-mono">
                                            elegir +
                                          </span>
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
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
                    className="w-full input-futuristic px-4 py-2.5 text-sm text-white placeholder-neutral-500 rounded-xl font-medium"
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
                <div className="md:col-span-2 space-y-1.5">
                  <label className="block text-xs tracking-wider uppercase text-neutral-400 font-mono">Series</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="4"
                    value={sets}
                    onChange={(e) => setSets(e.target.value)}
                    className="w-full input-futuristic px-3 py-2.5 text-sm text-center text-white placeholder-neutral-500 rounded-xl font-mono font-bold"
                    required
                  />
                </div>

                {/* Repeticiones */}
                <div className="md:col-span-2 space-y-1.5">
                  <label className="block text-xs tracking-wider uppercase text-neutral-400 font-mono">Reps</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="8"
                    value={reps}
                    onChange={(e) => setReps(e.target.value)}
                    className="w-full input-futuristic px-3 py-2.5 text-sm text-center text-white placeholder-neutral-500 rounded-xl font-mono font-bold"
                    required
                  />
                </div>

                {/* Peso */}
                <div className="md:col-span-2 space-y-1.5">
                  <label className="block text-xs tracking-wider uppercase text-neutral-400 font-mono">Peso (Kg)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    placeholder="80"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full input-futuristic px-3 py-2.5 text-sm text-center text-neon-cyan placeholder-neutral-500 rounded-xl font-mono font-bold"
                    required
                  />
                </div>

              </div>

              {/* Fila de acción & cálculo en tiempo real */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                <div className="text-xs font-mono text-neutral-400">
                  {Number(weight) > 0 ? (
                    <div className="flex items-center gap-4 text-xs">
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
                  className="px-6 py-2.5 bg-gradient-to-r from-neon-purple to-neon-violet hover:from-neon-violet hover:to-neon-fuchsia text-white font-black text-xs tracking-wider uppercase rounded-xl transition-all shadow-md shadow-purple-600/25 active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[3]" /> AGREGAR EJERCICIO
                </button>
              </div>

            </form>
          </ScrollReveal>

          {/* Listado de Ejercicios del Día */}
          <ScrollReveal delay={150} className="relative z-10">
            <div className="space-y-3 pt-6">
              <div className="text-xs font-mono tracking-widest text-neutral-400 uppercase flex items-center gap-2">
                <span>REGISTROS DE ENTRENAMIENTO DE HOY</span>
                <span className="text-neon-purple">({currentDay.workouts?.length || 0})</span>
              </div>

              {(!currentDay.workouts || currentDay.workouts.length === 0) ? (
                <div className="py-12 text-center text-neutral-600 font-mono text-sm border-t border-b border-purple-500/10">
                  No hay series registradas aún. Agrega tu primer ejercicio arriba.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-1">
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
      {/* 02. SECCIÓN INFERIOR: NUTRICIÓN & SUPLEMENTOS                             */}
      {/* ========================================================================= */}
      <section
        ref={sec2Ref}
        className="sticky top-[68px] z-20 min-h-[85vh] pb-16 sm:pb-24 py-10 px-4 sm:px-8 border-t border-cyan-500/20 bg-[#050210] shadow-[0_-25px_50px_rgba(5,2,16,0.95)] relative overflow-hidden"
      >
        <div className="ambient-glow-cyan w-96 h-96 top-10 right-10 opacity-25" />
        <div className="ambient-glow-mint w-80 h-80 bottom-10 left-10 opacity-20" />

        {/* Imagen de fondo decorativa con transparencia real, oscurecida y difuminada */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden z-0 select-none">
          <img
            src={bgAlimentos}
            alt=""
            aria-hidden="true"
            className="w-[340px] sm:w-[500px] md:w-[640px] lg:w-[740px] max-w-none opacity-10 brightness-75 filter blur-[5px] drop-shadow-[0_0_30px_rgba(6,182,212,0.3)] object-contain select-none transform-gpu"
          />
        </div>

        <div ref={sec2ContentRef} className="space-y-12 relative z-10 max-w-6xl mx-auto w-full will-change-transform">

          {/* Cabecera Nutrición con Reveal */}
          <ScrollReveal delay={0}>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-cyan-500/20 pb-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-xs tracking-[0.25em] text-neon-cyan font-mono uppercase">
                  <span>DIETA & SUPLEMENTACIÓN</span>
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
                TIPO DE REGISTRO
              </div>

              {/* Selector Unificado estilo Cápsula (como barra de navegación) */}
              <div className="inline-flex items-center gap-1.5 p-1.5 rounded-full bg-[#0E0926]/90 border border-white/10 flex-wrap max-w-full shadow-inner">
                {MEAL_TYPES.map((type) => {
                  const isSelected = mealType === type.id;
                  const isSupp = type.id === 'suplementacion';

                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setMealType(type.id)}
                      className={`px-4 py-2 rounded-full text-xs font-mono font-bold tracking-wider transition-all cursor-pointer select-none ${isSelected
                        ? isSupp
                          ? 'bg-neon-mint text-space-950 font-black shadow-md shadow-emerald-500/30'
                          : 'bg-gradient-to-r from-neon-cyan to-neon-blue text-space-950 font-black shadow-md shadow-cyan-500/30'
                        : 'text-neutral-400 hover:text-white hover:bg-white/5'
                        }`}
                    >
                      {type.tag} // {type.label.toUpperCase()}
                    </button>
                  );
                })}
              </div>
            </div>
          </ScrollReveal>

          {/* Formulario de Carga de Comida o Suplemento con Reveal y Memoria */}
          <ScrollReveal delay={200} className="relative z-30">
            <form onSubmit={handleSubmitFood} className="space-y-5 relative">

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">

                {/* Horario */}
                <div className="md:col-span-2 space-y-1.5">
                  <label className="block text-xs tracking-wider uppercase text-neutral-400 font-mono">Horario</label>
                  <input
                    type="time"
                    value={mealTime}
                    onChange={(e) => setMealTime(e.target.value)}
                    className="w-full input-futuristic-cyan px-3 py-2 text-xs text-center text-white rounded-xl font-mono cursor-pointer"
                    required
                  />
                </div>

                {/* Nombre Alimento / Suplemento con Dropdown 100% Opaco */}
                <div ref={foodContainerRef} className="md:col-span-5 space-y-1.5 relative z-40">
                  <div className="flex justify-between items-center text-xs tracking-wider uppercase text-neutral-400 font-mono">
                    <label className="flex items-center gap-1.5">
                      <span>{mealType === 'suplementacion' ? 'Suplemento' : 'Alimento o Plato'}</span>
                      {Object.keys(rememberedFoods).length > 0 && (
                        <span className="text-[10px] text-neon-mint lowercase font-normal">(con memoria)</span>
                      )}
                    </label>

                    <div className="relative z-50">
                      {mealType === 'suplementacion' ? (
                        <button
                          type="button"
                          onClick={() => {
                            setShowQuickSupps(!showQuickSupps);
                            setShowFoodSuggestions(false);
                          }}
                          className="text-neon-mint hover:text-white transition-colors flex items-center gap-1 lowercase text-[11px] font-bold cursor-pointer"
                        >
                          [ suplementos ]
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setShowQuickFoods(!showQuickFoods);
                            setShowFoodSuggestions(false);
                          }}
                          className="text-neon-cyan hover:text-white transition-colors flex items-center gap-1 lowercase text-[11px] font-bold cursor-pointer"
                        >
                          [ alimentos frecuentes  ]
                        </button>
                      )}

                      {/* Menú de suplementos con FONDO 100% OPACO SÓLIDO */}
                      {showQuickSupps && (
                        <div className="absolute right-0 top-full mt-2 w-80 bg-[#0E0926] border-2 border-emerald-500/80 rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.98)] z-50 overflow-hidden flex flex-col">
                          <div className="px-4 py-2.5 bg-[#080419] border-b border-white/10 text-[10px] font-mono text-neon-mint uppercase font-bold tracking-wider select-none shrink-0">
                            Suplementación Deportiva
                          </div>
                          <div className="max-h-72 overflow-y-auto divide-y divide-white/10 custom-scrollbar">
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
                                className="w-full text-left px-4 py-2.5 text-xs text-white hover:bg-[#231B54] hover:text-neon-mint transition-colors flex justify-between items-center font-medium cursor-pointer"
                              >
                                <span>{item.name}</span>
                                <span className="text-neon-mint font-mono text-[11px] font-bold">{item.protein}g prot</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Menú de alimentos con FONDO 100% OPACO SÓLIDO */}
                      {showQuickFoods && (
                        <div className="absolute right-0 top-full mt-2 w-80 bg-[#0E0926] border-2 border-cyan-500/80 rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.98)] z-50 overflow-hidden flex flex-col">
                          <div className="px-4 py-2.5 bg-[#080419] border-b border-white/10 text-[10px] font-mono text-neon-cyan uppercase font-bold tracking-wider select-none shrink-0">
                            Alimentos Frecuentes
                          </div>
                          <div className="max-h-72 overflow-y-auto divide-y divide-white/10 custom-scrollbar">
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
                                className="w-full text-left px-4 py-2.5 text-xs text-white hover:bg-[#231B54] hover:text-neon-cyan transition-colors flex justify-between items-center font-medium cursor-pointer"
                              >
                                <span>{item.name}</span>
                                <span className="text-neon-cyan font-mono text-[11px] font-bold">{item.calories} kcal</span>
                              </button>
                            ))}
                          </div>
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
                    className="w-full input-futuristic-cyan px-4 py-2.5 text-sm text-white placeholder-neutral-500 rounded-xl font-medium"
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
                <div className="md:col-span-2 space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="block text-xs tracking-wider uppercase text-neutral-400 font-mono">Calorías (Kcal)</label>
                    {currentNutritionEst.matched && !calories && (
                      <span className="text-[10px] font-mono text-neon-yellow/90 font-bold">
                        Auto: {currentNutritionEst.calories}
                      </span>
                    )}
                  </div>
                  <input
                    type="number"
                    min="0"
                    placeholder={currentNutritionEst.matched ? String(currentNutritionEst.calories) : "450"}
                    value={calories}
                    onChange={(e) => setCalories(e.target.value)}
                    className="w-full input-futuristic-cyan px-3 py-2.5 text-sm text-center text-neon-yellow placeholder-neutral-500 rounded-xl font-mono font-bold"
                  />
                </div>

                {/* Proteína */}
                <div className="md:col-span-3 space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="block text-xs tracking-wider uppercase text-neutral-400 font-mono">Proteína (G)</label>
                    {currentNutritionEst.matched && !protein && (
                      <span className="text-[10px] font-mono text-neon-mint/90 font-bold">
                        Auto: {currentNutritionEst.protein}g
                      </span>
                    )}
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    placeholder={currentNutritionEst.matched ? String(currentNutritionEst.protein) : "35"}
                    value={protein}
                    onChange={(e) => setProtein(e.target.value)}
                    className="w-full input-futuristic-cyan px-3 py-2.5 text-sm text-center text-neon-mint placeholder-neutral-500 rounded-xl font-mono font-bold"
                  />
                </div>

              </div>

              {/* Botón de envío */}
              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-neon-cyan to-neon-blue hover:from-neon-blue hover:to-neon-purple text-white font-black text-xs tracking-wider uppercase rounded-xl transition-all shadow-md shadow-cyan-600/25 active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[3]" /> AGREGAR {mealType === 'suplementacion' ? 'SUPLEMENTO' : 'COMIDA'}
                </button>
              </div>

            </form>
          </ScrollReveal>

          {/* Listado de Comidas y Suplementos con Reveal */}
          <ScrollReveal delay={250} className="relative z-10">
            <div className="space-y-3 pt-6">
              <div className="text-xs font-mono tracking-widest text-neutral-400 uppercase flex items-center gap-2">
                <span>REGISTROS NUTRICIONALES DE HOY</span>
                <span className="text-neon-cyan">({currentDay.foods?.length || 0})</span>
              </div>

              {(!currentDay.foods || currentDay.foods.length === 0) ? (
                <div className="py-12 text-center text-neutral-600 font-mono text-sm border-t border-b border-cyan-500/10">
                  No hay comidas o suplementos registrados hoy. Agrega uno arriba.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-1">
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

        {/* Botón para scrolear a cardio */}
        <div className="flex justify-center pt-8 pb-4">
          <button
            type="button"
            onClick={scrollToCardio}
            className="group flex flex-col items-center gap-2 text-xs font-mono tracking-widest text-neutral-400 hover:text-emerald-400 transition-colors cursor-pointer"
          >
            <span>SCROLL PARA CARDIO & DESPLAZAMIENTOS</span>
            <ArrowDown className="w-4 h-4 text-emerald-400 group-hover:translate-y-1 transition-transform animate-bounce" />
          </button>
        </div>

      </section>

      {/* ========================================================================= */}
      {/* 03. SECCIÓN INFERIOR: CARDIO & ACTIVIDAD AERÓBICA                         */}
      {/* ========================================================================= */}
      <section
        ref={sec3Ref}
        className="sticky top-[68px] z-30 min-h-[85vh] pb-16 sm:pb-24 py-10 px-4 sm:px-8 border-t border-emerald-500/20 bg-[#050210] shadow-[0_-25px_50px_rgba(5,2,16,0.95)] relative overflow-hidden"
      >
        <div className="ambient-glow-mint w-96 h-96 top-10 right-10 opacity-20" />
        <div className="ambient-glow-cyan w-80 h-80 bottom-10 left-10 opacity-15" />

        {/* Imagen de fondo decorativa con transparencia real, oscurecida y difuminada */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden z-0 select-none">
          <img
            src={bgCardio}
            alt=""
            aria-hidden="true"
            className="w-[340px] sm:w-[500px] md:w-[640px] lg:w-[740px] max-w-none opacity-10 brightness-75 filter blur-[5px] drop-shadow-[0_0_30px_rgba(16,185,129,0.3)] object-contain select-none transform-gpu"
          />
        </div>

        <div className="space-y-12 relative z-10 max-w-6xl mx-auto w-full">

          {/* Cabecera Cardio con Reveal */}
          <ScrollReveal delay={0}>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-emerald-500/20 pb-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-xs tracking-[0.25em] text-emerald-400 font-mono uppercase">
                  <span>ACTIVIDAD & DESPLAZAMIENTOS</span>
                </div>
                <h2 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white uppercase font-display">
                  CARDIO & <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">DISTANCIA</span>
                </h2>
              </div>

              {/* Totales de Cardio */}
              <div className="flex items-center gap-6 border-l-2 border-emerald-500/40 pl-6">
                <div>
                  <span className="block text-[11px] uppercase tracking-widest text-neutral-400 font-mono">Distancia Total</span>
                  <span className="text-3xl sm:text-4xl font-black font-mono text-emerald-400">
                    {Math.round(totalCardioKm * 10) / 10} <span className="text-sm font-sans text-neutral-400">KM</span>
                  </span>
                </div>
                <div>
                  <span className="block text-[11px] uppercase tracking-widest text-neutral-400 font-mono">Gasto Estimado</span>
                  <span className="text-3xl sm:text-4xl font-black font-mono text-amber-400">
                    {totalCardioBurned.toLocaleString()} <span className="text-sm font-sans text-neutral-400">KCAL</span>
                  </span>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Selector de Actividad (Caminata, Running, Bicicleta) */}
          <ScrollReveal delay={100}>
            <div className="space-y-3">
              <div className="text-xs font-mono tracking-wider text-neutral-400 uppercase">
                TIPO DE CARDIO
              </div>

              {/* Selector Unificado estilo Cápsula (como barra de navegación) */}
              <div className="inline-flex items-center gap-1.5 p-1.5 rounded-full bg-[#0E0926]/90 border border-white/10 flex-wrap max-w-full shadow-inner">
                {CARDIO_TYPES.map((c) => {
                  const isSelected = cardioType === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCardioType(c.id)}
                      className={`px-4 py-2 rounded-full text-xs font-mono font-bold tracking-wider transition-all cursor-pointer select-none flex items-center gap-2 ${isSelected
                        ? 'bg-gradient-to-r from-emerald-400 to-teal-400 text-space-950 font-black shadow-md shadow-emerald-500/25'
                        : 'text-neutral-400 hover:text-white hover:bg-white/5'
                        }`}
                    >
                      {c.id === 'caminata' && <Footprints className="w-3.5 h-3.5" />}
                      {c.id === 'running' && <Flame className="w-3.5 h-3.5" />}
                      {c.id === 'bicicleta' && <Bike className="w-3.5 h-3.5" />}
                      <span>{c.label.toUpperCase()}</span>
                      <span className={`text-[10px] ${isSelected ? 'text-black/75 font-semibold' : 'text-neutral-500'}`}>
                        ({c.desc})
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </ScrollReveal>

          {/* Formulario de Carga de Cardio */}
          <ScrollReveal delay={150}>
            <form onSubmit={handleSubmitCardio} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">

                {/* Desde donde (Origen) */}
                <div className="md:col-span-4 space-y-1.5">
                  <label className="block text-xs tracking-wider uppercase text-neutral-400 font-mono flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Desde dónde (Origen)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Casa, Gimnasio, Costanera..."
                    value={cardioFrom}
                    onChange={(e) => setCardioFrom(e.target.value)}
                    className="w-full input-futuristic-emerald px-4 py-2.5 text-sm text-white placeholder-neutral-500 rounded-xl font-medium"
                    required
                  />
                </div>

                {/* Hasta donde (Destino) */}
                <div className="md:col-span-4 space-y-1.5">
                  <label className="block text-xs tracking-wider uppercase text-neutral-400 font-mono flex items-center gap-1.5">
                    <Route className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Hasta dónde (Destino)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Parque, Trabajo, Vuelta al dique..."
                    value={cardioTo}
                    onChange={(e) => setCardioTo(e.target.value)}
                    className="w-full input-futuristic-emerald px-4 py-2.5 text-sm text-white placeholder-neutral-500 rounded-xl font-medium"
                    required
                  />
                </div>

                {/* Distancia en Kilómetros */}
                <div className="md:col-span-2 space-y-1.5">
                  <label className="block text-xs tracking-wider uppercase text-neutral-400 font-mono text-center">
                    Distancia (KM)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    placeholder="5.0"
                    value={cardioDistance}
                    onChange={(e) => setCardioDistance(e.target.value)}
                    className="w-full input-futuristic-emerald px-3 py-2.5 text-sm text-center text-emerald-400 placeholder-neutral-500 rounded-xl font-mono font-bold"
                    required
                  />
                </div>

                {/* Gasto calórico calculado dinámicamente en tiempo real */}
                <div className="md:col-span-2 space-y-1.5">
                  <label className="block text-xs tracking-wider uppercase text-neutral-400 font-mono text-center">
                    Gasto Est. (Kcal)
                  </label>
                  <div className="w-full h-[42px] bg-[#0E0926]/80 border border-amber-500/30 rounded-xl flex items-center justify-center gap-1.5 px-2">
                    <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                    <span className="font-mono font-bold text-sm text-amber-400">
                      {estimatedCardioBurn > 0 ? `~${estimatedCardioBurn}` : '0'}
                    </span>
                    <span className="text-[10px] font-mono text-neutral-400 uppercase">kcal</span>
                  </div>
                </div>

              </div>

              {/* Botón de Guardar Cardio */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-1">
                <div className="text-xs font-mono text-neutral-400 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>Cálculo automático: {cardioType === 'caminata' ? '~55' : cardioType === 'running' ? '~75' : '~35'} kcal quemadas por km</span>
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-teal-500 hover:to-emerald-500 text-white font-black text-xs tracking-wider uppercase rounded-xl transition-all shadow-md shadow-emerald-600/25 active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[3]" /> AGREGAR SESIÓN DE CARDIO
                </button>
              </div>
            </form>
          </ScrollReveal>

          {/* Listado de Sesiones de Cardio de Hoy */}
          <ScrollReveal delay={250}>
            <div className="space-y-3 pt-6">
              <div className="text-xs font-mono tracking-widest text-neutral-400 uppercase flex items-center gap-2">
                <span>// SESIONES DE CARDIO DE HOY</span>
                <span className="text-emerald-400">({currentDay.cardios?.length || 0})</span>
              </div>

              {(!currentDay.cardios || currentDay.cardios.length === 0) ? (
                <div className="py-12 text-center text-neutral-600 font-mono text-sm border-t border-b border-emerald-500/10">
                  No hay sesiones de cardio registradas hoy. Agrega una arriba.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-1">
                  {currentDay.cardios.map((c) => {
                    const isRun = c.type === 'running';
                    const isBike = c.type === 'bicicleta';

                    return (
                      <div
                        key={c.id}
                        className={`flex justify-between items-center p-5 bg-[#0E0926] hover:bg-[#150F38] border-t border-r border-b border-white/5 rounded-xl transition-all hover:translate-x-1 ${isRun
                          ? 'border-l-4 border-amber-400'
                          : isBike
                            ? 'border-l-4 border-cyan-400'
                            : 'border-l-4 border-emerald-400'
                          }`}
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] font-mono px-2 py-0.5 rounded tracking-wider uppercase font-bold flex items-center gap-1.5 ${isRun
                                ? 'bg-amber-400/10 text-amber-400 border border-amber-400/30'
                                : isBike
                                  ? 'bg-cyan-400/10 text-cyan-400 border border-cyan-400/30'
                                  : 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/30'
                                }`}
                            >
                              {c.type === 'caminata' && <Footprints className="w-3 h-3" />}
                              {c.type === 'running' && <Flame className="w-3 h-3" />}
                              {c.type === 'bicicleta' && <Bike className="w-3 h-3" />}
                              {c.type.toUpperCase()}
                            </span>
                            {c.time && (
                              <span className="text-xs font-mono text-neutral-400">{c.time}</span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-white font-bold text-base tracking-tight">
                            <span>{c.from}</span>
                            <span className="text-neutral-500 font-normal text-xs">➔</span>
                            <span className="text-emerald-300">{c.to}</span>
                          </div>

                          <div className="flex items-center gap-3 text-xs font-mono text-neutral-400">
                            <span className="text-white font-bold">{c.distance} km</span>
                            <span>•</span>
                            <span className="text-amber-400 font-semibold flex items-center gap-1">
                              <Flame className="w-3.5 h-3.5 inline" /> ~{c.caloriesBurned} kcal quemadas
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => onDeleteCardio && onDeleteCardio(c.id)}
                          className="text-neutral-500 hover:text-rose-400 p-2 transition-colors cursor-pointer"
                          title="Eliminar sesión de cardio"
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

        {/* Botón para volver arriba */}
        <div className="flex justify-center pt-8 pb-4">
          <button
            type="button"
            onClick={scrollToTop}
            className="group flex flex-col items-center gap-2 text-xs font-mono tracking-widest text-neutral-400 hover:text-neon-purple transition-colors cursor-pointer"
          >
            <ArrowUp className="w-4 h-4 text-emerald-400 group-hover:-translate-y-1 transition-transform animate-bounce" />
            <span>VOLVER AL INICIO</span>
          </button>
        </div>

      </section>

    </div>
  );
}
