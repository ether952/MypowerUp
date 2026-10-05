import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Plus,
  Trash2,
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  Dumbbell,
  Zap,
  Check,
  Footprints,
  Bike,
  Flame,
  MapPin,
  Route,
  Sparkles,
  Sliders,
  Layers,
  XCircle
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
  calculateCardioCalories,
  getLocalDateString,
  formatDisplayDate
} from '../utils/helpers';
import { estimateNutritionWithAI } from '../services/aiNutritionService';
import ItemActionMenu from './ItemActionMenu';
import EditWorkoutModal from './EditWorkoutModal';
import EditFoodModal from './EditFoodModal';
import VisualGymExercisePicker from './VisualGymExercisePicker';
import ExerciseDbPicker from './ExerciseDbPicker';
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
  onSelectDate,
  data = {},
  goals = {},
  isWeightVisible = false,
  onToggleWeightVisibility,
  onUpdateWeight,
  onAddFood,
  onUpdateFood,
  onDeleteFood,
  onAddWorkout,
  onUpdateWorkout,
  onDeleteWorkout,
  onAddCardio,
  onDeleteCardio,
  rememberedWorkouts: propRememberedWorkouts,
  onUpdateRememberedWorkouts,
  rememberedFoods: propRememberedFoods,
  onUpdateRememberedFoods
}) {
  // === MANEJO DE FECHAS ===
  const isToday = selectedDate === getLocalDateString();
  const displayFormattedDate = useMemo(() => {
    if (!selectedDate) return '';
    const parts = selectedDate.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return selectedDate;
  }, [selectedDate]);

  const handlePrevDay = () => {
    if (!selectedDate) return;
    const [y, m, d] = selectedDate.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() - 1);
    onSelectDate && onSelectDate(getLocalDateString(date));
  };

  const handleNextDay = () => {
    if (!selectedDate) return;
    const [y, m, d] = selectedDate.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + 1);
    onSelectDate && onSelectDate(getLocalDateString(date));
  };

  const handleToday = () => {
    onSelectDate && onSelectDate(getLocalDateString());
  };
  // === ESTADOS GYM ===
  const [gymInputMode, setGymInputMode] = useState('visual'); // 'visual' | 'manual'
  const [exerciseName, setExerciseName] = useState('');
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');
  const [showQuickExercises, setShowQuickExercises] = useState(false);
  const [expandedMuscle, setExpandedMuscle] = useState(null);
  const [exerciseSuggestions, setExerciseSuggestions] = useState([]);
  const [showExerciseSuggestions, setShowExerciseSuggestions] = useState(false);
  const [isWorkoutFormOpen, setIsWorkoutFormOpen] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState(null);
  const [useCustomSets, setUseCustomSets] = useState(false);
  const [customSets, setCustomSets] = useState([
    { setNumber: 1, reps: '10', weight: '' },
    { setNumber: 2, reps: '10', weight: '' },
    { setNumber: 3, reps: '10', weight: '' },
    { setNumber: 4, reps: '10', weight: '' }
  ]);

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

  // === ESTADOS COMIDAS & SUPLEMENTOS ===
  const [mealType, setMealType] = useState('almuerzo');
  const [mealTime, setMealTime] = useState(() => getCurrentTimeString());
  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [isEstimatingAI, setIsEstimatingAI] = useState(false);
  const [editingFood, setEditingFood] = useState(null);
  const [lastEstimatedFood, setLastEstimatedFood] = useState('');
  const aiDebounceTimerRef = useRef(null);
  const aiRequestIdRef = useRef(0);
  const currentNutritionEst = useMemo(() => estimateNutrition(foodName), [foodName]);
  const [showQuickFoods, setShowQuickFoods] = useState(false);
  const [showQuickSupps, setShowQuickSupps] = useState(false);
  const [foodSuggestions, setFoodSuggestions] = useState([]);
  const [showFoodSuggestions, setShowFoodSuggestions] = useState(false);
  const [showAiInfoTooltip, setShowAiInfoTooltip] = useState(false);
  const [isFoodFormOpen, setIsFoodFormOpen] = useState(false);

  // === ESTADOS CARDIO & ACTIVIDAD AERÓBICA ===
  const [cardioType, setCardioType] = useState('caminata');
  const [cardioFrom, setCardioFrom] = useState('');
  const [cardioTo, setCardioTo] = useState('');
  const [cardioDistance, setCardioDistance] = useState('');
  const [cardioTime, setCardioTime] = useState(() => getCurrentTimeString());
  const [isCardioFormOpen, setIsCardioFormOpen] = useState(false);
  const cardioSectionRef = useRef(null);
  const sec1ContentRef = useRef(null);
  const sec2ContentRef = useRef(null);

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
  const aiInfoRef = useRef(null);

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
      if (aiInfoRef.current && !aiInfoRef.current.contains(event.target)) {
        setShowAiInfoTooltip(false);
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
    if (item.detailedSets && Array.isArray(item.detailedSets) && item.detailedSets.length > 0) {
      setUseCustomSets(true);
      setCustomSets(item.detailedSets.map((s, idx) => ({
        setNumber: idx + 1,
        reps: String(s.reps || '10'),
        weight: String(s.weight || '')
      })));
    } else {
      setUseCustomSets(false);
      if (item.sets) setSets(String(item.sets));
      if (item.reps) setReps(String(item.reps));
      if (item.weight) setWeight(String(item.weight));
    }
    setShowExerciseSuggestions(false);
  };

  // ==========================================
  // AUTORRELLENADO & ESTIMACIÓN CON IA PARA COMIDAS
  // ==========================================
  const triggerAiEstimation = async (textToEstimate) => {
    if (!textToEstimate || textToEstimate.trim().length < 2) return;
    const clean = textToEstimate.trim();
    const query = clean.toLowerCase();

    // 1. Si ya existe en la memoria aprendida del usuario, reutilizar y no gastar tokens
    const exactRemembered = rememberedFoods[query] || Object.values(rememberedFoods).find(
      item => item.name.toLowerCase() === query
    );
    if (exactRemembered) {
      if (exactRemembered.calories !== undefined) setCalories(String(exactRemembered.calories));
      if (exactRemembered.protein !== undefined) setProtein(String(exactRemembered.protein));
      if (exactRemembered.mealType) setMealType(exactRemembered.mealType);
      setIsEstimatingAI(false);
      return;
    }

    const currentReqId = ++aiRequestIdRef.current;
    setIsEstimatingAI(true);

    try {
      const result = await estimateNutritionWithAI(clean);
      if (currentReqId === aiRequestIdRef.current && result) {
        if (result.calories !== undefined && result.calories !== null) {
          setCalories(String(result.calories));
        }
        if (result.protein !== undefined && result.protein !== null) {
          setProtein(String(result.protein));
        }
        if (result.suggestedMealType && (mealType === 'almuerzo' || mealType === 'comida')) {
          setMealType(result.suggestedMealType);
        }
        setLastEstimatedFood(clean);
      }
    } catch (e) {
      console.warn('Error al estimar con IA:', e);
    } finally {
      if (currentReqId === aiRequestIdRef.current) {
        setIsEstimatingAI(false);
      }
    }
  };

  const handleFoodNameChange = (e) => {
    const val = e.target.value;
    setFoodName(val);

    if (aiDebounceTimerRef.current) {
      clearTimeout(aiDebounceTimerRef.current);
    }

    if (!val || val.trim().length === 0) {
      setFoodSuggestions([]);
      setShowFoodSuggestions(false);
      return;
    }

    const clean = val.trim();
    const query = clean.toLowerCase();

    // 1. Verificar si coincide exactamente con la memoria aprendida
    const exactRemembered = rememberedFoods[query] || Object.values(rememberedFoods).find(
      item => item.name.toLowerCase() === query
    );

    if (exactRemembered) {
      // Si ya está en la memoria, autorrellenar al instante sin gastar tokens
      if (exactRemembered.calories !== undefined) setCalories(String(exactRemembered.calories));
      if (exactRemembered.protein !== undefined) setProtein(String(exactRemembered.protein));
      if (exactRemembered.mealType) setMealType(exactRemembered.mealType);
      setIsEstimatingAI(false);
    } else {
      // Disparar estimación inteligente tras una pausa de tipeo (450ms)
      if (clean.length >= 2) {
        aiDebounceTimerRef.current = setTimeout(() => {
          triggerAiEstimation(clean);
        }, 450);
      }
    }

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
    if (aiDebounceTimerRef.current) {
      clearTimeout(aiDebounceTimerRef.current);
    }
    aiRequestIdRef.current++;
    setIsEstimatingAI(false);
    setFoodName(item.name);
    if (item.calories !== undefined) setCalories(String(item.calories));
    if (item.protein !== undefined) setProtein(String(item.protein));
    if (item.mealType) setMealType(item.mealType);
    setLastEstimatedFood(item.name);
    setShowFoodSuggestions(false);
  };

  const handleSelectQuickFood = (item) => {
    handleSelectFoodSuggestion(item);
    setShowQuickFoods(false);
  };

  const handleSelectQuickSupp = (item) => {
    handleSelectFoodSuggestion(item);
    setShowQuickSupps(false);
  };

  // Guardar ejercicio + actualizar memoria
  const handleSubmitWorkout = (e) => {
    e.preventDefault();
    if (!exerciseName || !exerciseName.trim()) return;

    let workoutPayload;

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

      workoutPayload = {
        name: exerciseName.trim(),
        sets: validSets.length,
        reps: primaryReps,
        weight: maxWeight,
        detailedSets: validSets
      };
    } else {
      if (!weight && weight !== 0) return;
      workoutPayload = {
        name: exerciseName.trim(),
        sets: Number(sets) || 1,
        reps: Number(reps) || 1,
        weight: Number(weight) || 0
      };
    }

    onAddWorkout(workoutPayload);

    // Guardar en memoria
    const key = exerciseName.trim().toLowerCase();
    const updated = {
      ...rememberedWorkouts,
      [key]: {
        name: exerciseName.trim(),
        sets: workoutPayload.sets,
        reps: workoutPayload.reps,
        weight: workoutPayload.weight,
        detailedSets: workoutPayload.detailedSets || null,
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
    setUseCustomSets(false);
    setCustomSets([
      { setNumber: 1, reps: '10', weight: '' },
      { setNumber: 2, reps: '10', weight: '' },
      { setNumber: 3, reps: '10', weight: '' },
      { setNumber: 4, reps: '10', weight: '' }
    ]);
    setShowExerciseSuggestions(false);
    setShowQuickExercises(false);
  };

  // Guardar comida + actualizar memoria
  const handleSubmitFood = async (e) => {
    e.preventDefault();
    if (!foodName || !foodName.trim()) return;

    if (aiDebounceTimerRef.current) {
      clearTimeout(aiDebounceTimerRef.current);
    }

    let finalCalories = Number(calories) || 0;
    let finalProtein = Number(protein) || 0;

    // Si el usuario no ingresó calorías o proteínas, resolver con IA antes de guardar
    if (finalCalories === 0 && finalProtein === 0) {
      setIsEstimatingAI(true);
      const estimated = await estimateNutritionWithAI(foodName.trim());
      setIsEstimatingAI(false);
      if (estimated.calories) finalCalories = estimated.calories;
      if (estimated.protein) finalProtein = estimated.protein;
    }

    const finalMealType = mealType || 'almuerzo';

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
    setLastEstimatedFood('');
    setIsEstimatingAI(false);
    setShowFoodSuggestions(false);
    setShowQuickFoods(false);
    setShowQuickSupps(false);
  };

  const scrollToFood = () => {
    foodSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="w-full relative pb-4">

      {/* BARRA DE SELECCIÓN DE FECHA - LIGHT THEME */}
      <div className="bg-white/90 backdrop-blur-md border-b border-zinc-200 sticky top-14 z-20 px-3 sm:px-8 py-2.5 shadow-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={handlePrevDay}
              className="p-1.5 text-zinc-600 hover:text-black hover:bg-zinc-100 rounded-lg border border-zinc-200 transition-colors cursor-pointer"
              title="Día anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleToday}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${isToday
                ? 'bg-emerald-500 text-black shadow-xs'
                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                }`}
            >
              HOY
            </button>

            {/* Selector interactivo con calendario */}
            <div className="relative flex items-center">
              <label className="flex items-center gap-2 px-3 py-1 bg-zinc-50 border border-zinc-200 hover:border-zinc-300 rounded-lg text-xs font-mono font-bold text-zinc-900 cursor-pointer transition-colors shadow-xs">
                <span>{displayFormattedDate}</span>
                <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                <input
                  type="date"
                  value={selectedDate || getLocalDateString()}
                  onChange={(e) => onSelectDate && onSelectDate(e.target.value)}
                  className="sr-only"
                />
              </label>
            </div>

            <button
              type="button"
              onClick={handleNextDay}
              className="p-1.5 text-zinc-600 hover:text-black hover:bg-zinc-100 rounded-lg border border-zinc-200 transition-colors cursor-pointer"
              title="Día siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono font-semibold text-zinc-400 uppercase tracking-wider">
            <span>Registro Diario</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 01. SECCIÓN SUPERIOR: ENTRENAMIENTO & GIMNASIO                            */}
      {/* ========================================================================= */}
      <section className="relative w-full py-6 sm:py-10 px-3 sm:px-8 border-b border-zinc-200 bg-[#FAFAFA] overflow-hidden">

        {/* Glows ambientales sutiles */}
        <div className="ambient-glow-purple w-96 h-96 -top-10 -left-10 opacity-40 pointer-events-none" />
        <div className="ambient-glow-cyan w-80 h-80 top-1/2 -right-10 opacity-30 pointer-events-none" />

        {/* Imagen de fondo decorativa temática HD sutil */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden z-0 select-none"
          style={{
            maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 45%, rgba(0,0,0,0) 95%)',
            WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 45%, rgba(0,0,0,0) 95%)'
          }}
        >
          <img
            src={bgMusculacion}
            alt=""
            aria-hidden="true"
            className="w-[340px] sm:w-[520px] md:w-[680px] lg:w-[820px] max-w-none opacity-5 grayscale object-contain select-none transform-gpu"
          />
        </div>

        {/* Difuminado suave inferior */}
        <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-[#FAFAFA] via-[#FAFAFA]/80 to-transparent pointer-events-none z-1" />

        <div ref={sec1ContentRef} className="space-y-4 sm:space-y-6 md:space-y-8 relative z-10 max-w-6xl mx-auto w-full will-change-transform">

          {/* Cabecera Principal */}
          <ScrollReveal delay={0}>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-2">
              <div className="space-y-1">
                <div className="flex items-center gap-3 text-xs tracking-[0.25em] text-zinc-500 font-mono uppercase font-semibold">
                  <span>GIMNASIO & CARGAS</span>
                </div>
                <h2 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-zinc-900 uppercase font-display">
                  REGISTRA TU <span className="text-black underline decoration-zinc-300 underline-offset-8">SESIÓN</span>
                </h2>
              </div>

              {/* Tonelaje Total en Vivo & Botón Móvil */}
              <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-6 border-l-0 md:border-l-2 border-zinc-300 md:pl-6">
                <div className="flex items-center gap-4 sm:gap-6">
                  <div>
                    <span className="block text-[10px] uppercase tracking-widest text-zinc-500 font-mono font-semibold">Peso Total</span>
                    <span className="text-xl sm:text-3xl font-black font-mono text-zinc-900">
                      {totalTonnage.toLocaleString()} <span className="text-xs font-sans text-zinc-500">KG</span>
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase tracking-widest text-zinc-500 font-mono font-semibold">Ejercicios</span>
                    <span className="text-xl sm:text-3xl font-black font-mono text-zinc-900">
                      {currentDay.workouts?.length || 0}
                    </span>
                  </div>
                </div>

                {/* Botón para desplegar / plegar (SOLO en mobile) */}
                <button
                  type="button"
                  onClick={() => setIsWorkoutFormOpen(!isWorkoutFormOpen)}
                  className="md:hidden px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 rounded-lg text-xs font-mono font-bold text-zinc-900 tracking-wider transition-all cursor-pointer flex items-center gap-1.5 select-none shrink-0"
                >
                  <Plus className={`w-3.5 h-3.5 transition-transform duration-200 ${isWorkoutFormOpen ? 'rotate-45 text-rose-600' : 'rotate-0 text-zinc-900'}`} />
                  <span>{isWorkoutFormOpen ? 'Cerrar' : 'Cargar'}</span>
                </button>
              </div>
            </div>
          </ScrollReveal>

          {/* Toggle de Modo de Carga: Visual con GIFs vs Manual */}
          <ScrollReveal delay={50} className="relative z-30">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2.5 rounded-2xl border border-zinc-200 shadow-sm font-mono text-xs">
              <span className="text-zinc-800 font-extrabold uppercase text-[11px] flex items-center gap-1.5 pl-1">
                <span>Carga tu rutina:</span>
              </span>

              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setGymInputMode('visual')}
                  className={`px-3.5 py-1.5 rounded-xl font-extrabold uppercase transition-all cursor-pointer flex items-center gap-1.5 ${gymInputMode === 'visual'
                    ? 'bg-black text-white shadow-md'
                    : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-300'
                    }`}
                  title="Colección Visual de Ejercicios y GIFs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                </button>

                <button
                  type="button"
                  onClick={() => setGymInputMode('manual')}
                  className={`px-3.5 py-1.5 rounded-xl font-extrabold uppercase transition-all cursor-pointer flex items-center gap-1.5 ${gymInputMode === 'manual'
                    ? 'bg-black text-white shadow-md'
                    : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-300'
                    }`}
                  title="Formulario Manual"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Manual</span>
                </button>
              </div>
            </div>
          </ScrollReveal>

          {/* RENDERIZADO SEGÚN EL MODO ELEGIDO */}
          {gymInputMode === 'visual' && (
            <ScrollReveal delay={100} className="relative z-30">
              <VisualGymExercisePicker
                onAddWorkout={onAddWorkout}
                onUpdateRememberedWorkouts={onUpdateRememberedWorkouts}
                rememberedWorkouts={propRememberedWorkouts || localRememberedWorkouts}
              />
            </ScrollReveal>
          )}

          {gymInputMode === 'manual' && (
            <div className={`${isWorkoutFormOpen ? 'block' : 'hidden'} md:block`}>
              <ScrollReveal delay={100} className="relative z-30">
                <form onSubmit={handleSubmitWorkout} className="space-y-4 sm:space-y-5 pt-1 relative bg-white border border-zinc-200 rounded-3xl p-5 sm:p-7 shadow-sm">

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-5">

                    {/* Ejercicio con Dropdown */}
                    <div ref={exerciseContainerRef} className="md:col-span-12 space-y-1.5 relative z-40">
                      <div className="flex justify-between items-center text-xs tracking-wider uppercase text-zinc-500 font-mono font-semibold">
                        <label className="flex items-center gap-1.5">
                          <span>Nombre del Ejercicio</span>
                        </label>

                        {/* Botón sugerencias */}
                        <div className="relative z-50">
                          <button
                            type="button"
                            onClick={() => {
                              setShowQuickExercises(!showQuickExercises);
                              setShowExerciseSuggestions(false);
                            }}
                            className="text-zinc-800 hover:text-black hover:underline transition-colors flex items-center gap-1 lowercase text-[11px] font-bold cursor-pointer"
                          >
                            [ Sugerencias ]
                          </button>

                          {/* Dropdown de Sugerencias con Acordeón */}
                          {showQuickExercises && (
                            <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white border border-zinc-200 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col">
                              {/* Encabezado Fijo Superior */}
                              <div className="px-4 py-3 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between text-[11px] font-mono text-zinc-900 uppercase font-bold tracking-wider select-none shrink-0">
                                <span className="flex items-center gap-2">
                                  <Dumbbell className="w-3.5 h-3.5 text-zinc-900" />
                                  <span>Ejercicios por Músculo</span>
                                </span>
                                <span className="text-[10px] text-zinc-500 font-mono font-normal">
                                  {Object.keys(EXERCISES_BY_MUSCLE).length} categorías
                                </span>
                              </div>

                              {/* Lista scrolleable con categorías en acordeón */}
                              <div className="max-h-80 overflow-y-auto divide-y divide-zinc-100 custom-scrollbar">
                                {Object.entries(EXERCISES_BY_MUSCLE).map(([muscle, exercises]) => {
                                  const isExpanded = expandedMuscle === muscle;
                                  return (
                                    <div key={muscle} className="transition-colors">
                                      <button
                                        type="button"
                                        onClick={() => setExpandedMuscle(isExpanded ? null : muscle)}
                                        className={`w-full px-4 py-2.5 flex items-center justify-between text-left transition-colors cursor-pointer select-none ${isExpanded
                                          ? 'bg-zinc-100 text-black font-bold'
                                          : 'text-zinc-700 hover:bg-zinc-50 hover:text-black font-medium'
                                          }`}
                                      >
                                        <div className="flex items-center gap-2">
                                          <span
                                            className={`w-2 h-2 rounded-full transition-all ${isExpanded
                                              ? 'bg-black shadow-sm'
                                              : 'bg-zinc-400'
                                              }`}
                                          />
                                          <span className="text-xs font-semibold">{muscle}</span>
                                          <span className="text-[10px] font-mono text-zinc-400">({exercises.length})</span>
                                        </div>
                                        <ChevronDown
                                          className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-black' : 'text-zinc-400'
                                            }`}
                                        />
                                      </button>

                                      {/* Lista de ejercicios desplegada al hacer clic */}
                                      {isExpanded && (
                                        <div className="bg-zinc-50/50 py-1 border-t border-zinc-100 divide-y divide-zinc-100">
                                          {exercises.map((name, idx) => (
                                            <button
                                              key={idx}
                                              type="button"
                                              onClick={() => {
                                                setExerciseName(name);
                                                setShowQuickExercises(false);
                                              }}
                                              className="w-full text-left px-5 py-2.5 text-xs text-zinc-700 hover:bg-zinc-100 hover:text-black transition-colors font-medium flex items-center justify-between group cursor-pointer"
                                            >
                                              <span className="group-hover:translate-x-0.5 transition-transform">{name}</span>
                                              <span className="text-[10px] text-zinc-400 group-hover:text-black transition-colors font-mono">
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
                        placeholder="Ej: Press banca plano con barra, Sentadilla..."
                        value={exerciseName}
                        onChange={handleExerciseNameChange}
                        onFocus={() => {
                          if (exerciseName.trim().length > 0 && exerciseSuggestions.length > 0) {
                            setShowExerciseSuggestions(true);
                          }
                        }}
                        className="w-full input-futuristic px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 rounded-xl font-medium"
                        required
                      />

                      {/* Dropdown de Autocompletado */}
                      {showExerciseSuggestions && exerciseSuggestions.length > 0 && (
                        <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-zinc-200 rounded-2xl shadow-2xl z-50 overflow-hidden divide-y divide-zinc-100 animate-fade-in-up">
                          <div className="px-4 py-2 bg-zinc-50 text-[10px] font-mono text-zinc-600 uppercase tracking-wider flex items-center justify-between font-bold">
                            <span>Memoria Inteligente</span>
                            <span className="text-zinc-400 font-normal">Click para autorrellenar</span>
                          </div>
                          {exerciseSuggestions.map((item, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleSelectExerciseSuggestion(item)}
                              className="w-full text-left px-5 py-3 hover:bg-zinc-50 flex items-center justify-between text-xs transition-colors group cursor-pointer"
                            >
                              <div className="flex items-center gap-2.5">
                                {item.sets ? (
                                  <Zap className="w-3.5 h-3.5 text-black" />
                                ) : (
                                  <Dumbbell className="w-3.5 h-3.5 text-zinc-400 group-hover:text-black" />
                                )}
                                <span className="font-bold text-zinc-900 group-hover:text-black transition-colors">
                                  {item.name}
                                </span>
                              </div>

                              {item.sets ? (
                                <span className="font-mono text-zinc-900 text-[11px] font-bold">
                                  {item.sets}s × {item.reps}r @ <strong className="text-black">{item.weight}kg</strong>
                                </span>
                              ) : (
                                <span className="text-zinc-400 text-[10px] font-mono">Ejercicio sugerido</span>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* ETAPA 2 Y 3: REVELADO PROGRESIVO SUAVE AL COMPLETAR EL NOMBRE DEL EJERCICIO */}
                    <div
                      className={`md:col-span-12 overflow-hidden transition-all duration-500 ease-out space-y-4 ${exerciseName.trim().length > 0
                        ? 'max-h-[1000px] opacity-100 translate-y-0 pt-1'
                        : 'max-h-0 opacity-0 -translate-y-3 pointer-events-none'
                        }`}
                    >
                      {/* Botón Diferente peso */}
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
                          className={`px-3.5 py-1 rounded-full text-xs font-mono font-bold tracking-wider transition-all duration-200 cursor-pointer select-none flex items-center gap-2 active:scale-95 ${useCustomSets
                            ? 'bg-black text-white shadow-sm font-black'
                            : 'bg-zinc-100 text-zinc-600 hover:text-black border border-zinc-200 hover:bg-zinc-200'
                            }`}
                        >
                          <span>Diferentes pesos</span>
                        </button>
                      </div>

                      {!useCustomSets ? (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5 animate-fade-in">
                          {/* Series */}
                          <div className="space-y-1.5">
                            <label className="block text-xs tracking-wider uppercase text-zinc-500 font-mono font-semibold">Series</label>
                            <input
                              type="number"
                              min="1"
                              placeholder="4"
                              value={sets}
                              onChange={(e) => setSets(e.target.value)}
                              className="w-full input-futuristic px-3 py-2 text-sm text-center text-zinc-900 placeholder-zinc-400 rounded-xl font-mono font-bold"
                              required={!useCustomSets && exerciseName.trim().length > 0}
                            />
                          </div>

                          {/* Repeticiones */}
                          <div className="space-y-1.5">
                            <label className="block text-xs tracking-wider uppercase text-zinc-500 font-mono font-semibold">Reps</label>
                            <input
                              type="number"
                              min="1"
                              placeholder="8"
                              value={reps}
                              onChange={(e) => setReps(e.target.value)}
                              className="w-full input-futuristic px-3 py-2 text-sm text-center text-zinc-900 placeholder-zinc-400 rounded-xl font-mono font-bold"
                              required={!useCustomSets && exerciseName.trim().length > 0}
                            />
                          </div>

                          {/* Peso */}
                          <div className="space-y-1.5">
                            <label className="block text-xs tracking-wider uppercase text-zinc-500 font-mono font-semibold">Peso (Kg)</label>
                            <input
                              type="number"
                              min="0"
                              step="0.5"
                              placeholder="80"
                              value={weight}
                              onChange={(e) => setWeight(e.target.value)}
                              className="w-full input-futuristic px-3 py-2 text-sm text-center text-zinc-900 placeholder-zinc-400 rounded-xl font-mono font-bold"
                              required={!useCustomSets && exerciseName.trim().length > 0}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3 animate-fade-in">
                          <div className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-wider">
                            Series ({customSets.length})
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 max-h-64 overflow-y-auto custom-scrollbar p-1">
                            {customSets.map((item, idx) => (
                              <div
                                key={idx}
                                className="p-3 bg-white border border-zinc-200 rounded-xl flex items-center justify-between gap-2.5 hover:border-zinc-300 transition-colors shadow-sm"
                              >
                                <span className="text-xs font-mono font-black text-zinc-900 shrink-0">
                                  #{idx + 1}
                                </span>

                                <div className="flex items-center gap-2 flex-1">
                                  <div className="flex-1">
                                    <div className="text-[9px] font-mono text-zinc-500 uppercase">Reps</div>
                                    <input
                                      type="number"
                                      min="1"
                                      value={item.reps}
                                      onChange={(e) => handleCustomSetChange(idx, 'reps', e.target.value)}
                                      className="w-full input-futuristic px-2 py-1 text-xs text-center text-zinc-900 rounded-lg font-mono font-bold"
                                      placeholder="10"
                                      required={useCustomSets}
                                    />
                                  </div>

                                  <div className="flex-1">
                                    <div className="text-[9px] font-mono text-zinc-700 uppercase font-bold">Kg</div>
                                    <input
                                      type="number"
                                      min="0"
                                      step="0.5"
                                      value={item.weight}
                                      onChange={(e) => handleCustomSetChange(idx, 'weight', e.target.value)}
                                      className="w-full input-futuristic px-2 py-1 text-xs text-center text-zinc-900 rounded-lg font-mono font-bold"
                                      placeholder="80"
                                      required={useCustomSets}
                                    />
                                  </div>
                                </div>

                                {customSets.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveCustomSet(idx)}
                                    className="p-1 text-zinc-400 hover:text-rose-600 transition-colors cursor-pointer"
                                    title="Eliminar esta serie"
                                  >
                                    <XCircle className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>

                          {/* Botón + para agregar serie */}
                          <div className="flex justify-center pt-1">
                            <button
                              type="button"
                              onClick={handleAddCustomSet}
                              className="w-9 h-9 rounded-full bg-black hover:bg-zinc-800 text-white flex items-center justify-center transition-all duration-200 shadow-md hover:scale-105 active:scale-95 cursor-pointer group"
                              title="Agregar serie"
                              aria-label="Agregar serie"
                            >
                              <Plus className="w-5 h-5 stroke-[3] group-hover:rotate-90 transition-transform duration-200" />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Fila de acción & cálculo en tiempo real */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-zinc-100">
                        <div className="text-xs font-mono text-zinc-600">
                          {Number(weight) > 0 ? (
                            <div className="flex items-center gap-3 text-xs">
                              <span>Peso: <strong className="text-zinc-900 font-bold">{Number(weight)} KG</strong></span>
                              {Number(reps) > 0 && live1RM > 0 && (
                                <>
                                  <span className="text-zinc-300">•</span>
                                  <span>1RM: <strong className="text-zinc-900 font-bold">{live1RM} KG</strong></span>
                                </>
                              )}
                            </div>
                          ) : (
                            <span className="text-zinc-500 text-xs">Completa los datos para registrar tu ejercicio.</span>
                          )}
                        </div>

                        <button
                          type="submit"
                          className="px-5 py-2.5 bg-black hover:bg-zinc-800 text-white font-bold text-xs tracking-wider uppercase rounded-xl transition-all shadow-sm active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer shrink-0 font-mono"
                        >
                          <Plus className="w-4 h-4 stroke-[3]" /> AGREGAR EJERCICIO
                        </button>
                      </div>

                    </div>

                  </div>

                </form>
              </ScrollReveal>
            </div>
          )}

          {/* Listado de Ejercicios del Día */}
          <ScrollReveal delay={150} className="relative z-10">
            <div className="space-y-2 pt-2 sm:pt-4">
              <div className="text-xs font-mono tracking-widest text-zinc-500 uppercase flex items-center gap-2 font-semibold">
                <span>REGISTROS DE ENTRENAMIENTO DE HOY</span>
                <span className="text-zinc-900 font-bold">({currentDay.workouts?.length || 0})</span>
              </div>

              {(!currentDay.workouts || currentDay.workouts.length === 0) ? (
                <div className="py-6 text-center text-zinc-400 font-mono text-xs border-t border-b border-zinc-200">
                  No hay series registradas aún. Agrega tu primer ejercicio arriba.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[180px] sm:max-h-[240px] md:max-h-[280px] overflow-y-auto custom-scrollbar pr-1 pb-4">
                  {currentDay.workouts.map((w) => {
                    const rm = calculate1RM(Number(w.weight), Number(w.reps));

                    return (
                      <div
                        key={w.id}
                        className="flex justify-between items-center p-3.5 bg-white hover:bg-zinc-50 border-l-4 border-l-black border-t border-r border-b border-zinc-200 rounded-xl transition-all hover:translate-x-0.5 shadow-sm"
                      >
                        <div className="space-y-0.5">
                          <h4 className="font-bold text-zinc-900 text-sm tracking-tight">{w.name}</h4>
                          {w.detailedSets && Array.isArray(w.detailedSets) && w.detailedSets.length > 0 ? (
                            <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono text-zinc-500 pt-0.5">
                              <span className="text-zinc-900 font-semibold">{w.sets} series:</span>
                              {w.detailedSets.map((s, i) => (
                                <span key={i} className="px-1.5 py-0.5 rounded bg-zinc-100 border border-zinc-200 text-zinc-900 font-bold text-[11px]">
                                  {s.reps}×<span className="text-black font-extrabold">{s.weight}kg</span>
                                </span>
                              ))}
                              {rm > 0 && (
                                <span className="text-zinc-500 font-mono font-medium text-[11px]">({rm}k 1RM)</span>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center gap-2.5 text-xs font-mono text-zinc-500">
                              <span className="text-zinc-900 font-semibold">{w.sets}s × {w.reps}r</span>
                              <span>•</span>
                              <span className="text-zinc-900 font-bold">{w.weight} KG</span>
                              {rm > 0 && (
                                <>
                                  <span>•</span>
                                  <span className="text-zinc-500 font-mono font-medium">({rm}k 1RM)</span>
                                </>
                              )}
                            </div>
                          )}
                        </div>

                        <ItemActionMenu
                          onEdit={() => setEditingWorkout(w)}
                          onDelete={() => onDeleteWorkout(w.id)}
                          variant="purple"
                          itemName={w.name}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </ScrollReveal>

        </div>

        {/* Botón para scrolear a comidas */}
        <div className="flex justify-center pt-4 pb-3">
          <button
            type="button"
            onClick={scrollToFood}
            className="group flex flex-col items-center gap-1.5 text-xs font-mono tracking-widest text-zinc-500 hover:text-black transition-colors cursor-pointer font-semibold"
          >
            <span>SCROLL PARA NUTRICIÓN & SUPLEMENTOS</span>
            <ArrowDown className="w-3.5 h-3.5 text-zinc-900 group-hover:translate-y-1 transition-transform animate-bounce" />
          </button>
        </div>

      </section>


      {/* ========================================================================= */}
      {/* 02. SECCIÓN INFERIOR: NUTRICIÓN & SUPLEMENTOS                             */}
      {/* ========================================================================= */}
      <section
        ref={foodSectionRef}
        className="relative w-full py-8 sm:py-12 px-3 sm:px-8 border-t border-zinc-200 bg-white shadow-sm overflow-hidden"
      >
        <div className="ambient-glow-cyan w-96 h-96 top-10 right-10 opacity-30 pointer-events-none" />
        <div className="ambient-glow-mint w-80 h-80 bottom-10 left-10 opacity-25 pointer-events-none" />

        {/* Imagen de fondo decorativa temática HD sutil */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden z-0 select-none"
          style={{
            maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 45%, rgba(0,0,0,0) 95%)',
            WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 45%, rgba(0,0,0,0) 95%)'
          }}
        >
          <img
            src={bgAlimentos}
            alt=""
            aria-hidden="true"
            className="w-[340px] sm:w-[520px] md:w-[680px] lg:w-[820px] max-w-none opacity-5 grayscale object-contain select-none transform-gpu"
          />
        </div>

        {/* Difuminado suave inferior */}
        <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none z-1" />

        <div ref={sec2ContentRef} className="space-y-4 sm:space-y-6 md:space-y-8 relative z-10 max-w-6xl mx-auto w-full will-change-transform">

          {/* Cabecera Nutrición con Reveal */}
          <ScrollReveal delay={0}>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-200 pb-3">
              <div className="space-y-1">
                <div className="flex items-center gap-3 text-xs tracking-[0.25em] text-zinc-500 font-mono uppercase font-semibold">
                  <span>DIETA & SUPLEMENTACIÓN</span>
                </div>
                <h2 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-zinc-900 uppercase font-display">
                  COMIDAS & <span className="text-black underline decoration-zinc-300 underline-offset-8">MACROS</span>
                </h2>
              </div>

              {/* Totales Nutricionales & Botón Móvil */}
              <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-6 border-l-0 md:border-l-2 border-zinc-300 md:pl-6">
                <div className="flex items-center gap-4 sm:gap-6">
                  <div>
                    <span className="block text-[10px] uppercase tracking-widest text-zinc-500 font-mono font-semibold">Calorías Totales</span>
                    <span className="text-xl sm:text-3xl font-black font-mono text-zinc-900">
                      {totalCalories.toLocaleString()} <span className="text-xs font-sans text-zinc-500">KCAL</span>
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase tracking-widest text-zinc-500 font-mono font-semibold">Proteínas</span>
                    <span className="text-xl sm:text-3xl font-black font-mono text-zinc-900">
                      {totalProtein} <span className="text-xs font-sans text-zinc-500">G</span>
                    </span>
                  </div>
                </div>

                {/* Botón para desplegar / plegar en mobile */}
                <button
                  type="button"
                  onClick={() => setIsFoodFormOpen(!isFoodFormOpen)}
                  className="md:hidden px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 rounded-lg text-xs font-mono font-bold text-zinc-900 tracking-wider transition-all cursor-pointer flex items-center gap-1.5 select-none shrink-0"
                >
                  <Plus className={`w-3.5 h-3.5 transition-transform duration-200 ${isFoodFormOpen ? 'rotate-45 text-rose-600' : 'rotate-0 text-zinc-900'}`} />
                  <span>{isFoodFormOpen ? 'Cerrar' : 'Cargar'}</span>
                </button>
              </div>
            </div>
          </ScrollReveal>

          {/* Selector de Momentos & Formulario */}
          <div className={`${isFoodFormOpen ? 'block' : 'hidden'} md:block space-y-3 sm:space-y-4 pt-1`}>
            <ScrollReveal delay={100}>
              <div className="space-y-2">
                <div className="text-[11px] font-mono tracking-wider text-zinc-500 uppercase font-semibold">
                  TIPO DE REGISTRO
                </div>

                {/* Selector Unificado estilo Cápsula */}
                <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-zinc-100 border border-zinc-200 flex-wrap max-w-full">
                  {MEAL_TYPES.map((type) => {
                    const isSelected = mealType === type.id;

                    return (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setMealType(type.id)}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold tracking-wider transition-all cursor-pointer select-none ${isSelected
                          ? 'bg-black text-white font-bold shadow-sm'
                          : 'text-zinc-600 hover:text-black hover:bg-zinc-200'
                          }`}
                      >
                        {type.tag} // {type.label.toUpperCase()}
                      </button>
                    );
                  })}
                </div>
              </div>
            </ScrollReveal>

            {/* Formulario de Carga de Comida o Suplemento */}
            <ScrollReveal delay={200} className="relative z-30">
              <form onSubmit={handleSubmitFood} className="space-y-3 sm:space-y-4 relative">

                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4">

                  {/* Horario */}
                  <div className="md:col-span-2 space-y-1">
                    <label className="block text-xs tracking-wider uppercase text-zinc-500 font-mono font-semibold">Horario</label>
                    <input
                      type="time"
                      value={mealTime}
                      onChange={(e) => setMealTime(e.target.value)}
                      className="w-full input-futuristic px-3 py-2 text-xs text-center text-zinc-900 rounded-xl font-mono cursor-pointer"
                      required
                    />
                  </div>

                  {/* Nombre Alimento / Suplemento */}
                  <div ref={foodContainerRef} className="md:col-span-5 space-y-1 relative z-40">
                    <div className="flex justify-between items-center text-xs tracking-wider uppercase text-zinc-500 font-mono font-semibold">
                      <label className="flex items-center gap-1.5">
                        <span>{mealType === 'suplementacion' ? 'Suplemento' : 'Alimento o Plato'}</span>
                        {isEstimatingAI ? (
                          <span className="text-[10px] text-zinc-800 font-mono animate-pulse lowercase font-normal flex items-center gap-1">
                            ✨ estimando macros con ia...
                          </span>
                        ) : null}
                      </label>

                      <div className="relative z-50">
                        {mealType === 'suplementacion' ? (
                          <button
                            type="button"
                            onClick={() => {
                              setShowQuickSupps(!showQuickSupps);
                              setShowFoodSuggestions(false);
                            }}
                            className="text-zinc-800 hover:text-black hover:underline transition-colors flex items-center gap-1 lowercase text-[11px] font-bold cursor-pointer"
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
                            className="text-zinc-800 hover:text-black hover:underline transition-colors flex items-center gap-1 lowercase text-[11px] font-bold cursor-pointer"
                          >
                            [ alimentos ]
                          </button>
                        )}

                        {/* Dropdown de Alimentos Rápidos */}
                        {showQuickFoods && (
                          <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white border border-zinc-200 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col">
                            <div className="px-4 py-3 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between text-[11px] font-mono text-zinc-900 uppercase font-bold tracking-wider select-none shrink-0">
                              <span>Base de Alimentos</span>
                              <span className="text-[10px] text-zinc-500 font-mono font-normal">
                                {Object.keys(QUICK_FOODS).length} categorías
                              </span>
                            </div>

                            <div className="max-h-72 overflow-y-auto divide-y divide-zinc-100 custom-scrollbar">
                              {Object.entries(QUICK_FOODS).map(([category, items]) => (
                                <div key={category} className="py-2">
                                  <div className="px-4 py-1 text-[10px] font-mono uppercase tracking-wider text-zinc-600 font-bold bg-zinc-50">
                                    {category}
                                  </div>
                                  <div className="divide-y divide-zinc-100">
                                    {items.map((item, idx) => (
                                      <button
                                        key={idx}
                                        type="button"
                                        onClick={() => handleSelectQuickFood(item)}
                                        className="w-full text-left px-5 py-2 hover:bg-zinc-50 flex items-center justify-between text-xs text-zinc-700 hover:text-black transition-colors font-medium cursor-pointer"
                                      >
                                        <span>{item.name}</span>
                                        <span className="text-[10px] font-mono text-zinc-600 font-bold">
                                          {item.calories} kcal ({item.protein}g P)
                                        </span>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Dropdown de Suplementos */}
                        {showQuickSupps && (
                          <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white border border-zinc-200 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col">
                            <div className="px-4 py-3 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between text-[11px] font-mono text-zinc-900 uppercase font-bold tracking-wider select-none shrink-0">
                              <span>Base de Suplementación</span>
                              <span className="text-[10px] text-zinc-500 font-mono font-normal">
                                {Object.keys(QUICK_SUPPLEMENTS).length} categorías
                              </span>
                            </div>

                            <div className="max-h-72 overflow-y-auto divide-y divide-zinc-100 custom-scrollbar">
                              {Object.entries(QUICK_SUPPLEMENTS).map(([category, items]) => (
                                <div key={category} className="py-2">
                                  <div className="px-4 py-1 text-[10px] font-mono uppercase tracking-wider text-zinc-600 font-bold bg-zinc-50">
                                    {category}
                                  </div>
                                  <div className="divide-y divide-zinc-100">
                                    {items.map((item, idx) => (
                                      <button
                                        key={idx}
                                        type="button"
                                        onClick={() => handleSelectQuickSupp(item)}
                                        className="w-full text-left px-5 py-2 hover:bg-zinc-50 flex items-center justify-between text-xs text-zinc-700 hover:text-black transition-colors font-medium cursor-pointer"
                                      >
                                        <span>{item.name}</span>
                                        <span className="text-[10px] font-mono text-zinc-600 font-bold">
                                          {item.calories} kcal ({item.protein}g P)
                                        </span>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <input
                      type="text"
                      placeholder={mealType === 'suplementacion' ? "Ej: Proteína Whey 30g, Creatina 5g..." : "Ej: Pechuga de pollo 200g, Arroz con huevo..."}
                      value={foodName}
                      onChange={handleFoodNameChange}
                      onBlur={() => {
                        if (foodName && foodName.trim().length >= 3) {
                          triggerAiEstimation(foodName);
                        }
                      }}
                      onFocus={() => {
                        if (foodName.trim().length > 0 && foodSuggestions.length > 0) {
                          setShowFoodSuggestions(true);
                        }
                      }}
                      className="w-full input-futuristic px-4 py-2 text-sm text-zinc-900 placeholder-zinc-400 rounded-xl font-medium"
                      required
                    />

                    {/* Dropdown de Autocompletado */}
                    {showFoodSuggestions && foodSuggestions.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-zinc-200 rounded-2xl shadow-2xl z-50 overflow-hidden divide-y divide-zinc-100 animate-fade-in-up">
                        <div className="px-4 py-2 bg-zinc-50 text-[10px] font-mono text-zinc-600 uppercase tracking-wider flex items-center justify-between font-bold">
                          <span>Memoria Nutricional Inteligente</span>
                          <span className="text-zinc-400 font-normal">Click para autorrellenar</span>
                        </div>
                        {foodSuggestions.map((item, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSelectFoodSuggestion(item)}
                            className="w-full text-left px-5 py-3 hover:bg-zinc-50 flex items-center justify-between text-xs transition-colors group cursor-pointer"
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="font-bold text-zinc-900 group-hover:text-black transition-colors">
                                {item.name}
                              </span>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 text-zinc-600 uppercase">
                                {item.mealType || 'comida'}
                              </span>
                            </div>

                            <span className="font-mono text-zinc-900 text-[11px] font-bold">
                              {item.calories} kcal • {item.protein}g P
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Calorías */}
                  <div className="md:col-span-2 space-y-1">
                    <div className="flex justify-between items-center text-xs tracking-wider uppercase text-zinc-500 font-mono font-semibold">
                      <label>Calorías</label>
                      {isEstimatingAI ? (
                        <span className="text-[10px] text-zinc-800 font-mono animate-pulse font-bold">[✨ IA...]</span>
                      ) : currentNutritionEst.matched ? (
                        <span className="text-[10px] text-zinc-600 font-mono font-bold">[Auto: ~{currentNutritionEst.calories}]</span>
                      ) : null}
                    </div>
                    <input
                      type="number"
                      min="0"
                      placeholder={isEstimatingAI ? "..." : (currentNutritionEst.matched ? String(currentNutritionEst.calories) : "350")}
                      value={calories}
                      onChange={(e) => setCalories(e.target.value)}
                      className="w-full input-futuristic px-3 py-2 text-sm text-center text-zinc-900 placeholder-zinc-400 rounded-xl font-mono font-bold"
                      required
                    />
                  </div>

                  {/* Proteína */}
                  <div ref={aiInfoRef} className="md:col-span-3 space-y-1 relative">
                    <div className="flex justify-between items-center text-xs tracking-wider uppercase text-zinc-500 font-mono font-semibold">
                      <label className="flex items-center gap-1.5 select-none">
                        <span>Proteína (g)</span>
                        <button
                          type="button"
                          onClick={() => setShowAiInfoTooltip(!showAiInfoTooltip)}
                          className="w-4 h-4 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 hover:text-black border border-zinc-300 inline-flex items-center justify-center text-[10px] font-black font-mono transition-all active:scale-90 cursor-pointer"
                          title="Información sobre la estimación de IA"
                          aria-label="Información sobre cálculo automático"
                        >
                          ?
                        </button>
                      </label>
                      {isEstimatingAI ? (
                        <span className="text-[10px] text-zinc-800 font-mono animate-pulse font-bold">[✨ IA...]</span>
                      ) : currentNutritionEst.matched ? (
                        <span className="text-[10px] text-zinc-600 font-mono font-bold">[Auto: ~{currentNutritionEst.protein}g]</span>
                      ) : null}
                    </div>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      placeholder={isEstimatingAI ? "..." : (currentNutritionEst.matched ? String(currentNutritionEst.protein) : "35")}
                      value={protein}
                      onChange={(e) => setProtein(e.target.value)}
                      className="w-full input-futuristic px-3 py-2 text-sm text-center text-zinc-900 placeholder-zinc-400 rounded-xl font-mono font-bold"
                    />

                    {/* Popover explicativo */}
                    {showAiInfoTooltip && (
                      <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 p-3.5 bg-white border border-zinc-200 rounded-2xl shadow-2xl z-50 text-xs text-zinc-700">
                        <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-zinc-100">
                          <span className="font-mono font-bold text-zinc-900 text-[11px] flex items-center gap-1.5 uppercase">
                            <Sparkles className="w-3.5 h-3.5 text-black inline" />
                            <span>Cálculo con Inteligencia Artificial</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => setShowAiInfoTooltip(false)}
                            className="text-zinc-400 hover:text-black text-xs font-mono px-1 py-0.5 rounded cursor-pointer transition-colors"
                          >
                            ✕
                          </button>
                        </div>
                        <p className="text-[11px] leading-relaxed text-zinc-600">
                          Al escribir el nombre de tu comida, la IA calcula las calorías y proteínas de forma aproximada según ingredientes estándar.
                        </p>
                        <div className="mt-2 pt-2 border-t border-zinc-100 text-[10px] font-mono text-zinc-500 flex items-start gap-1.5">
                          <span className="shrink-0 text-xs">⚠️</span>
                          <span>Ten en cuenta que el valor puede no ser 100% exacto. Puedes ajustarlo manualmente cuando quieras.</span>
                        </div>
                      </div>
                    )}
                  </div>

                </div>

                {/* Botón de envío */}
                <div className="flex justify-end pt-0.5">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-black hover:bg-zinc-800 text-white font-bold text-xs tracking-wider uppercase rounded-xl transition-all shadow-sm active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer font-mono"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" /> AGREGAR {mealType === 'suplementacion' ? 'SUPLEMENTO' : 'COMIDA'}
                  </button>
                </div>

              </form>
            </ScrollReveal>
          </div>

          {/* Listado de Comidas y Suplementos */}
          <ScrollReveal delay={250} className="relative z-10">
            <div className="space-y-2 pt-2 sm:pt-4">
              <div className="text-xs font-mono tracking-widest text-zinc-500 uppercase flex items-center gap-2 font-semibold">
                <span>REGISTROS NUTRICIONALES DE HOY</span>
                <span className="text-zinc-900 font-bold">({currentDay.foods?.length || 0})</span>
              </div>

              {(!currentDay.foods || currentDay.foods.length === 0) ? (
                <div className="py-6 text-center text-zinc-400 font-mono text-xs border-t border-b border-zinc-200">
                  No hay comidas o suplementos registrados hoy. Agrega uno arriba.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[180px] sm:max-h-[240px] md:max-h-[280px] overflow-y-auto custom-scrollbar pr-1 pb-4">
                  {currentDay.foods.map((f) => {
                    const mealMeta = MEAL_TYPES.find(m => m.id === f.mealType) || { label: f.mealType || 'Comida', tag: '00' };

                    return (
                      <div
                        key={f.id}
                        className="flex justify-between items-center p-3.5 bg-white hover:bg-zinc-50 border-l-4 border-l-black border-t border-r border-b border-zinc-200 rounded-xl transition-all hover:translate-x-0.5 shadow-sm"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded tracking-wider uppercase font-bold bg-zinc-100 text-zinc-700 border border-zinc-200">
                              {mealMeta.label}
                            </span>
                            {f.time && (
                              <span className="text-xs font-mono text-zinc-400">{f.time}</span>
                            )}
                          </div>

                          <h4 className="font-bold text-zinc-900 text-sm tracking-tight">{f.name}</h4>

                          <div className="flex items-center gap-2.5 text-xs font-mono text-zinc-500">
                            <span className="text-zinc-900 font-semibold">{f.calories} kcal</span>
                            <span>•</span>
                            <span className="text-zinc-900 font-bold">{f.protein || 0}g proteína</span>
                          </div>
                        </div>

                        <ItemActionMenu
                          onEdit={() => setEditingFood(f)}
                          onDelete={() => onDeleteFood(f.id)}
                          variant="cyan"
                          itemName={f.name}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </ScrollReveal>

        </div>

        {/* Botón para scrolear a cardio */}
        <div className="flex justify-center pt-4 pb-3">
          <button
            type="button"
            onClick={() => cardioSectionRef.current?.scrollIntoView({ behavior: 'smooth' })}
            className="group flex flex-col items-center gap-1.5 text-xs font-mono tracking-widest text-zinc-500 hover:text-black transition-colors cursor-pointer font-semibold"
          >
            <span>SCROLL PARA CARDIO & DESPLAZAMIENTOS</span>
            <ArrowDown className="w-3.5 h-3.5 text-zinc-900 group-hover:translate-y-1 transition-transform animate-bounce" />
          </button>
        </div>

      </section>

      {/* ========================================================================= */}
      {/* 03. SECCIÓN INFERIOR: CARDIO & ACTIVIDAD AERÓBICA                         */}
      {/* ========================================================================= */}
      <section
        ref={cardioSectionRef}
        className="relative w-full py-8 sm:py-12 px-3 sm:px-8 border-t border-zinc-200 bg-[#FAFAFA] shadow-sm overflow-hidden"
      >
        <div className="ambient-glow-mint w-96 h-96 top-10 right-10 opacity-25 pointer-events-none" />
        <div className="ambient-glow-cyan w-80 h-80 bottom-10 left-10 opacity-20 pointer-events-none" />

        {/* Imagen de fondo decorativa temática HD sutil */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden z-0 select-none"
          style={{
            maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 45%, rgba(0,0,0,0) 95%)',
            WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 45%, rgba(0,0,0,0) 95%)'
          }}
        >
          <img
            src={bgCardio}
            alt=""
            aria-hidden="true"
            className="w-[340px] sm:w-[520px] md:w-[680px] lg:w-[820px] max-w-none opacity-5 grayscale object-contain select-none transform-gpu"
          />
        </div>

        {/* Difuminado suave inferior */}
        <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-[#FAFAFA] via-[#FAFAFA]/80 to-transparent pointer-events-none z-1" />

        <div className="space-y-4 sm:space-y-6 md:space-y-8 relative z-10 max-w-6xl mx-auto w-full">

          {/* Cabecera Cardio con Reveal */}
          <ScrollReveal delay={0}>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-200 pb-3">
              <div className="space-y-1">
                <div className="flex items-center gap-3 text-xs tracking-[0.25em] text-zinc-500 font-mono uppercase font-semibold">
                  <span>ACTIVIDAD & DESPLAZAMIENTOS</span>
                </div>
                <h2 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-zinc-900 uppercase font-display">
                  CARDIO & <span className="text-black underline decoration-zinc-300 underline-offset-8">DISTANCIA</span>
                </h2>
              </div>

              {/* Totales de Cardio & Botón Móvil */}
              <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-6 border-l-0 md:border-l-2 border-zinc-300 md:pl-6">
                <div className="flex items-center gap-4 sm:gap-6">
                  <div>
                    <span className="block text-[10px] uppercase tracking-widest text-zinc-500 font-mono font-semibold">Distancia Total</span>
                    <span className="text-xl sm:text-3xl font-black font-mono text-zinc-900">
                      {Math.round(totalCardioKm * 10) / 10} <span className="text-xs font-sans text-zinc-500">KM</span>
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase tracking-widest text-zinc-500 font-mono font-semibold">Gasto Estimado</span>
                    <span className="text-xl sm:text-3xl font-black font-mono text-zinc-900">
                      {totalCardioBurned.toLocaleString()} <span className="text-xs font-sans text-zinc-500">KCAL</span>
                    </span>
                  </div>
                </div>

                {/* Botón para desplegar / plegar en mobile */}
                <button
                  type="button"
                  onClick={() => setIsCardioFormOpen(!isCardioFormOpen)}
                  className="md:hidden px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 rounded-lg text-xs font-mono font-bold text-zinc-900 tracking-wider transition-all cursor-pointer flex items-center gap-1.5 select-none shrink-0"
                >
                  <Plus className={`w-3.5 h-3.5 transition-transform duration-200 ${isCardioFormOpen ? 'rotate-45 text-rose-600' : 'rotate-0 text-zinc-900'}`} />
                  <span>{isCardioFormOpen ? 'Cerrar' : 'Cargar'}</span>
                </button>
              </div>
            </div>
          </ScrollReveal>

          {/* Selector de Actividad & Formulario */}
          <div className={`${isCardioFormOpen ? 'block' : 'hidden'} md:block space-y-3 sm:space-y-4 pt-1`}>
            {/* Selector de Actividad */}
            <ScrollReveal delay={100}>
              <div className="space-y-2">
                <div className="text-[11px] font-mono tracking-wider text-zinc-500 uppercase font-semibold">
                  TIPO DE CARDIO
                </div>

                {/* Selector Unificado estilo Cápsula */}
                <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-zinc-100 border border-zinc-200 flex-wrap max-w-full">
                  {CARDIO_TYPES.map((c) => {
                    const isSelected = cardioType === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setCardioType(c.id)}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold tracking-wider transition-all cursor-pointer select-none flex items-center gap-2 ${isSelected
                          ? 'bg-black text-white font-bold shadow-sm'
                          : 'text-zinc-600 hover:text-black hover:bg-zinc-200'
                          }`}
                      >
                        {c.id === 'caminata' && <Footprints className="w-3.5 h-3.5" />}
                        {c.id === 'running' && <Flame className="w-3.5 h-3.5" />}
                        {c.id === 'bicicleta' && <Bike className="w-3.5 h-3.5" />}
                        <span>{c.label.toUpperCase()}</span>
                        <span className={`text-[10px] ${isSelected ? 'text-zinc-300 font-semibold' : 'text-zinc-500'}`}>
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
              <form onSubmit={handleSubmitCardio} className="space-y-3 sm:space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4">

                  {/* Desde donde (Origen) */}
                  <div className="md:col-span-4 space-y-1">
                    <label className="block text-xs tracking-wider uppercase text-zinc-500 font-mono font-semibold flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-zinc-900" />
                      <span>Desde dónde (Origen)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Casa, Gimnasio, Costanera..."
                      value={cardioFrom}
                      onChange={(e) => setCardioFrom(e.target.value)}
                      className="w-full input-futuristic px-4 py-2 text-sm text-zinc-900 placeholder-zinc-400 rounded-xl font-medium"
                      required
                    />
                  </div>

                  {/* Hasta donde (Destino) */}
                  <div className="md:col-span-4 space-y-1">
                    <label className="block text-xs tracking-wider uppercase text-zinc-500 font-mono font-semibold flex items-center gap-1.5">
                      <Route className="w-3.5 h-3.5 text-zinc-900" />
                      <span>Hasta dónde (Destino)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Parque, Trabajo, Vuelta al dique..."
                      value={cardioTo}
                      onChange={(e) => setCardioTo(e.target.value)}
                      className="w-full input-futuristic px-4 py-2 text-sm text-zinc-900 placeholder-zinc-400 rounded-xl font-medium"
                      required
                    />
                  </div>

                  {/* Distancia en Kilómetros */}
                  <div className="md:col-span-2 space-y-1">
                    <label className="block text-xs tracking-wider uppercase text-zinc-500 font-mono font-semibold text-center">
                      Distancia (KM)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      placeholder="5.0"
                      value={cardioDistance}
                      onChange={(e) => setCardioDistance(e.target.value)}
                      className="w-full input-futuristic px-3 py-2 text-sm text-center text-zinc-900 placeholder-zinc-400 rounded-xl font-mono font-bold"
                      required
                    />
                  </div>

                  {/* Gasto calórico */}
                  <div className="md:col-span-2 space-y-1">
                    <label className="block text-xs tracking-wider uppercase text-zinc-500 font-mono font-semibold text-center">
                      Gasto Est. (Kcal)
                    </label>
                    <div className="w-full h-[38px] bg-zinc-100 border border-zinc-200 rounded-xl flex items-center justify-center gap-1.5 px-2">
                      <Flame className="w-3.5 h-3.5 text-zinc-900" />
                      <span className="font-mono font-bold text-sm text-zinc-900">
                        {estimatedCardioBurn > 0 ? `~${estimatedCardioBurn}` : '0'}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500 uppercase">kcal</span>
                    </div>
                  </div>

                </div>

                {/* Botón de Guardar Cardio */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-0.5">
                  <div className="text-xs font-mono text-zinc-500 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-black"></span>
                    <span>Cálculo auto: {cardioType === 'caminata' ? '~55' : cardioType === 'running' ? '~75' : '~35'} kcal/km</span>
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-black hover:bg-zinc-800 text-white font-bold text-xs tracking-wider uppercase rounded-xl transition-all shadow-sm active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer font-mono"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" /> AGREGAR SESIÓN DE CARDIO
                  </button>
                </div>
              </form>
            </ScrollReveal>
          </div>

          {/* Listado de Sesiones de Cardio de Hoy */}
          <ScrollReveal delay={250}>
            <div className="space-y-2 pt-2 sm:pt-4">
              <div className="text-xs font-mono tracking-widest text-zinc-500 uppercase flex items-center gap-2 font-semibold">
                <span>// SESIONES DE CARDIO DE HOY</span>
                <span className="text-zinc-900 font-bold">({currentDay.cardios?.length || 0})</span>
              </div>

              {(!currentDay.cardios || currentDay.cardios.length === 0) ? (
                <div className="py-6 text-center text-zinc-400 font-mono text-xs border-t border-b border-zinc-200">
                  No hay sesiones de cardio registradas hoy. Agrega una arriba.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[140px] sm:max-h-[180px] md:max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
                  {currentDay.cardios.map((c) => {
                    return (
                      <div
                        key={c.id}
                        className="flex justify-between items-center p-3.5 bg-white hover:bg-zinc-50 border-l-4 border-l-black border-t border-r border-b border-zinc-200 rounded-xl transition-all hover:translate-x-0.5 shadow-sm"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span
                              className="text-[10px] font-mono px-2 py-0.5 rounded tracking-wider uppercase font-bold flex items-center gap-1.5 bg-zinc-100 text-zinc-700 border border-zinc-200"
                            >
                              {c.type === 'caminata' && <Footprints className="w-3 h-3" />}
                              {c.type === 'running' && <Flame className="w-3 h-3" />}
                              {c.type === 'bicicleta' && <Bike className="w-3 h-3" />}
                              {c.type.toUpperCase()}
                            </span>
                            {c.time && (
                              <span className="text-xs font-mono text-zinc-400">{c.time}</span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-zinc-900 font-bold text-sm tracking-tight">
                            <span>{c.from}</span>
                            <span className="text-zinc-400 font-normal text-xs">➔</span>
                            <span className="text-zinc-700">{c.to}</span>
                          </div>

                          <div className="flex items-center gap-3 text-xs font-mono text-zinc-500">
                            <span className="text-zinc-900 font-bold">{c.distance} km</span>
                            <span>•</span>
                            <span className="text-zinc-900 font-semibold flex items-center gap-1">
                              <Flame className="w-3.5 h-3.5 inline text-black" /> ~{c.caloriesBurned} kcal quemadas
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => onDeleteCardio && onDeleteCardio(c.id)}
                          className="text-zinc-400 hover:text-rose-600 p-1.5 transition-colors cursor-pointer"
                          title="Eliminar sesión de cardio"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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
        <div className="flex justify-center pt-4 pb-3">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="group flex flex-col items-center gap-1.5 text-xs font-mono tracking-widest text-zinc-500 hover:text-black transition-colors cursor-pointer font-semibold"
          >
            <ArrowUp className="w-3.5 h-3.5 text-zinc-900 group-hover:-translate-y-1 transition-transform animate-bounce" />
            <span>VOLVER AL INICIO</span>
          </button>
        </div>

      </section>

      {/* Modales de Edición */}
      <EditWorkoutModal
        isOpen={!!editingWorkout}
        workout={editingWorkout}
        onClose={() => setEditingWorkout(null)}
        onSave={(updated) => {
          if (onUpdateWorkout) {
            onUpdateWorkout(updated.id, updated, selectedDate);
          }
        }}
      />

      <EditFoodModal
        isOpen={!!editingFood}
        food={editingFood}
        onClose={() => setEditingFood(null)}
        onSave={(updated) => {
          if (onUpdateFood) {
            onUpdateFood(updated.id, updated, selectedDate);
          }
        }}
      />

    </div>
  );
}
