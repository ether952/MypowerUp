import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Dumbbell,
  Calendar,
  Layers,
  ArrowUp,
  ArrowDown,
  Trash2,
  Edit2,
  Plus,
  Check,
  CheckCircle2,
  Flame,
  Activity,
  Send,
  Bot,
  User as UserIcon,
  RefreshCw,
  Zap,
  Sliders,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  ShieldCheck,
  Info,
  Play,
  RotateCcw
} from 'lucide-react';
import {
  DEFAULT_ROUTINE_TEMPLATES,
  getSavedCoachProfile,
  saveCoachProfile,
  getSavedRoutines,
  saveRoutines,
  getActiveRoutineId,
  saveActiveRoutineId,
  getTodayWorkoutSchedule
} from '../utils/routineTemplates';
import { askAiCoach } from '../services/aiCoachService';
import { GYM_EXERCISES_SPRITES } from './VisualGymExercisePicker';
import powerUpLogoImg from '../assets/logo-mypowerup.png';

export default function CoachRoutinesView({
  onLoadWorkoutToDaily,
  todayNutrition = { calories: 0, protein: 0 },
  targetNutrition = { calories: 2400, protein: 150 },
  showToast = () => { }
}) {
  // Estado del perfil del usuario
  const [profile, setProfile] = useState(getSavedCoachProfile());

  // Escuchar actualizaciones del perfil desde el modal global de la tuerquita
  useEffect(() => {
    const handleProfileUpdate = (e) => {
      if (e.detail) {
        setProfile(e.detail);
        const newRoutines = getSavedRoutines(e.detail);
        setRoutines(newRoutines);
      }
    };
    window.addEventListener('mypowerup_coach_profile_updated', handleProfileUpdate);
    return () => window.removeEventListener('mypowerup_coach_profile_updated', handleProfileUpdate);
  }, []);

  // Rutinas guardadas y activa
  const [routines, setRoutines] = useState(() => getSavedRoutines(profile));
  const [activeRoutineId, setActiveRoutineId] = useState(() => getActiveRoutineId(routines));

  // Rutina actualmente seleccionada para visualizar/editar
  const activeRoutine = routines.find(r => r.id === activeRoutineId) || routines[0] || DEFAULT_ROUTINE_TEMPLATES.days_4;

  // Día seleccionado en el editor de rutina (índice 0..n dentro del array schedule)
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);

  // Modal para agregar ejercicios a la rutina
  const [isAddExerciseModalOpen, setIsAddExerciseModalOpen] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('Todos');

  // Modal para editar series/reps de un ejercicio
  const [editingExercise, setEditingExercise] = useState(null); // { dayIdx, exIdx, ... }

  // Chat con el Coach
  const [chatMessages, setChatMessages] = useState([
    {
      role: 'model',
      content: `¡Bienvenido a tu **Centro de Entrenamiento & Coach IA**! 

He configurado tu plan según tu objetivo de **${(profile.goal || 'hipertrofia').toUpperCase()}** y **${profile.daysPerWeek || 4} días semanales**. 

Puedes revisar qué te toca entrenar hoy, personalizar cada ejercicio o preguntarme cualquier duda sobre nutrición, descansos o sobrecarga progresiva.`
    }
  ]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [isCoachThinking, setIsCoachThinking] = useState(false);
  const chatEndRef = useRef(null);

  // Sincronizar perfiles y rutinas
  useEffect(() => {
    saveCoachProfile(profile);
  }, [profile]);

  useEffect(() => {
    saveRoutines(routines);
  }, [routines]);

  useEffect(() => {
    saveActiveRoutineId(activeRoutineId);
  }, [activeRoutineId]);

  // Información del entrenamiento de HOY
  const todayInfo = getTodayWorkoutSchedule(activeRoutine);

  // Categorías disponibles en el catálogo
  const exerciseCategories = ['Todos', 'Pecho', 'Espalda', 'Piernas', 'Hombros', 'Bíceps', 'Tríceps', 'Abdomen'];

  // Filtrar ejercicios en el modal
  const filteredCatalog = GYM_EXERCISES_SPRITES.filter(e => {
    if (selectedCategoryFilter === 'Todos') return true;
    return e.category.toLowerCase().includes(selectedCategoryFilter.toLowerCase());
  });

  // --- REORDENAR EJERCICIOS ---
  const handleMoveExercise = (dayIdx, exIdx, direction) => {
    const updatedRoutines = [...routines];
    const rIdx = updatedRoutines.findIndex(r => r.id === activeRoutine.id);
    if (rIdx === -1) return;

    const currentSchedule = [...updatedRoutines[rIdx].schedule];
    const dayExercises = [...currentSchedule[dayIdx].exercises];

    const targetIdx = direction === 'up' ? exIdx - 1 : exIdx + 1;
    if (targetIdx < 0 || targetIdx >= dayExercises.length) return;

    const [moved] = dayExercises.splice(exIdx, 1);
    dayExercises.splice(targetIdx, 0, moved);

    currentSchedule[dayIdx].exercises = dayExercises;
    updatedRoutines[rIdx].schedule = currentSchedule;

    setRoutines(updatedRoutines);
    showToast('Orden de ejercicio actualizado');
  };

  // --- ELIMINAR EJERCICIO ---
  const handleDeleteExercise = (dayIdx, exIdx) => {
    const updatedRoutines = [...routines];
    const rIdx = updatedRoutines.findIndex(r => r.id === activeRoutine.id);
    if (rIdx === -1) return;

    const currentSchedule = [...updatedRoutines[rIdx].schedule];
    const dayExercises = [...currentSchedule[dayIdx].exercises];

    dayExercises.splice(exIdx, 1);
    currentSchedule[dayIdx].exercises = dayExercises;
    updatedRoutines[rIdx].schedule = currentSchedule;

    setRoutines(updatedRoutines);
    showToast('Ejercicio eliminado de la rutina');
  };

  // --- AGREGAR EJERCICIO ---
  const handleAddExerciseToDay = (catalogItem) => {
    const updatedRoutines = [...routines];
    const rIdx = updatedRoutines.findIndex(r => r.id === activeRoutine.id);
    if (rIdx === -1) return;

    const currentSchedule = [...updatedRoutines[rIdx].schedule];
    const dayExercises = [...currentSchedule[selectedDayIdx].exercises];

    const newEx = {
      id: `${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: catalogItem.name,
      sets: 3,
      reps: 10,
      weight: catalogItem.defaultWeight || 20,
      restSeconds: 90,
      category: catalogItem.category || 'General',
      sprite: catalogItem.sprite || null,
      gifUrl: catalogItem.gifUrl || null
    };

    dayExercises.push(newEx);
    currentSchedule[selectedDayIdx].exercises = dayExercises;
    updatedRoutines[rIdx].schedule = currentSchedule;

    setRoutines(updatedRoutines);
    setIsAddExerciseModalOpen(false);
    showToast(`"${catalogItem.name}" agregado`);
  };

  // --- GUARDAR EDICIÓN DE EJERCICIO ---
  const handleSaveExerciseEdit = () => {
    if (!editingExercise) return;
    const { dayIdx, exIdx, sets, reps, weight, restSeconds } = editingExercise;

    const updatedRoutines = [...routines];
    const rIdx = updatedRoutines.findIndex(r => r.id === activeRoutine.id);
    if (rIdx === -1) return;

    const currentSchedule = [...updatedRoutines[rIdx].schedule];
    const dayExercises = [...currentSchedule[dayIdx].exercises];

    dayExercises[exIdx] = {
      ...dayExercises[exIdx],
      sets: Number(sets) || 3,
      reps: Number(reps) || 10,
      weight: Number(weight) || 0,
      restSeconds: Number(restSeconds) || 90
    };

    currentSchedule[dayIdx].exercises = dayExercises;
    updatedRoutines[rIdx].schedule = currentSchedule;

    setRoutines(updatedRoutines);
    setEditingExercise(null);
    showToast('Parámetros guardados');
  };

  // --- ENVIAR CONSULTA AL COACH ---
  const handleSendCoachQuestion = async (customQuestion = null) => {
    const textToSend = customQuestion || inputQuestion;
    if (!textToSend.trim() || isCoachThinking) return;

    const newMsg = { role: 'user', content: textToSend.trim() };
    const updated = [...chatMessages, newMsg];
    setChatMessages(updated);
    if (!customQuestion) setInputQuestion('');
    setIsCoachThinking(true);

    try {
      const userContext = {
        profile,
        todayNutrition,
        targetNutrition,
        activeRoutine: {
          name: activeRoutine.name,
          todayWorkout: todayInfo.scheduledWorkout ? {
            title: todayInfo.scheduledWorkout.title,
            targetMuscles: todayInfo.scheduledWorkout.targetMuscles,
            exercises: todayInfo.scheduledWorkout.exercises.map(e => `${e.name} (${e.sets}x${e.reps})`)
          } : 'Día de descanso'
        }
      };

      const responseText = await askAiCoach(textToSend, userContext, chatMessages);
      setChatMessages([...updated, { role: 'model', content: responseText }]);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (err) {
      console.warn('Error querying coach:', err);
      setChatMessages([
        ...updated,
        {
          role: 'model',
          content: 'No pude contactar con el servicio en este momento. Por favor verifica tu conexión o intenta nuevamente.'
        }
      ]);
    } finally {
      setIsCoachThinking(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-white font-sans selection:bg-emerald-500 selection:text-black">

      {/* ========================================================================= */}
      {/* 1. BANNER PRINCIPAL DE CABECERA (FULL WIDTH / EXTENDIDO A LOS LATERALES)  */}
      {/* ========================================================================= */}
      <div className="w-full bg-[#121214] border-b border-[#2E2E34] py-8 sm:py-10 px-4 sm:px-8 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight font-display">
              Tu Plan de Fuerza & Nutrición
            </h1>
            <p className="text-sm text-[#8A8F98] max-w-2xl leading-relaxed font-sans">
              Rutinas personalizadas, detección de lo que te toca entrenar hoy, editor libre de ejercicios y asistencia inteligente en tiempo real.
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. CONTENIDO PRINCIPAL ABIERTO / SUELTO (FONDO BLANCO, SIN ENCAPSULAR)     */}
      {/* ========================================================================= */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-12">

        {/* ----------------------------------------------------------------------- */}
        {/* SECCIÓN A: ¿QUÉ ME TOCA ENTRENAR HOY?                                   */}
        {/* ----------------------------------------------------------------------- */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-gradient-to-br from-zinc-50 to-white border border-zinc-200/90 rounded-3xl p-6 sm:p-8 shadow-xs">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-zinc-900 bg-zinc-100 px-3 py-1 rounded-full border border-zinc-200 uppercase flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  {todayInfo.todayName.toUpperCase()}
                </span>
                {!todayInfo.isRestDay ? (
                  <span className="text-xs font-mono font-bold text-white-950 bg-white-400 px-3 py-1 rounded-full uppercase shadow-xs">

                  </span>
                ) : (
                  <span className="text-xs font-mono font-bold text-zinc-600 bg-zinc-100 px-3 py-1 rounded-full uppercase border border-zinc-200">
                    💤 DÍA DE DESCANSO / RECUPERACIÓN
                  </span>
                )}
              </div>

              {!todayInfo.isRestDay && todayInfo.scheduledWorkout ? (
                <>
                  <h2 className="text-2xl sm:text-3xl font-black text-zinc-950 uppercase tracking-tight font-display">
                    {todayInfo.scheduledWorkout.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-zinc-600">
                    <span>Enfoque: <strong className="text-zinc-900">{todayInfo.scheduledWorkout.targetMuscles}</strong></span>
                    <span>•</span>
                    <span>Ejercicios programados: <strong className="text-emerald-600 font-bold">{todayInfo.scheduledWorkout.exercises.length}</strong></span>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-2xl sm:text-3xl font-black text-zinc-950 uppercase tracking-tight font-display">
                    Recuperación Activa & Nutrición
                  </h2>
                  <p className="text-xs text-zinc-600 max-w-xl leading-relaxed">
                    Hoy no tienes sesión pesada de pesas programada. Aprovecha para caminar, asegurar tus {targetNutrition.protein || 150}g de proteína y descansar para reparar fibras musculares.
                  </p>
                </>
              )}
            </div>

            {!todayInfo.isRestDay && todayInfo.scheduledWorkout && onLoadWorkoutToDaily && (
              <button
                type="button"
                onClick={() => onLoadWorkoutToDaily(todayInfo.scheduledWorkout.exercises)}
                className="w-full md:w-auto px-6 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold uppercase rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2.5 text-sm tracking-wide shadow-md hover:scale-[1.02] active:scale-95 shrink-0"
              >
                <Zap className="w-5 h-5 fill-black" />
                <span>Cargar entrenamiento</span>
              </button>
            )}
          </div>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* SECCIÓN B: ESTRUCTURA DEL PROGRAMA & EDITOR DE RUTINAS                  */}
        {/* ----------------------------------------------------------------------- */}
        <div className="space-y-6">

          {/* Barra de Título & Botón Agregar Ejercicio */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-200 pb-5">
            <div>
              <span className="text-xs font-mono text-zinc-400 font-bold uppercase tracking-wider block">
                ESTRUCTURA DE TU PROGRAMA
              </span>
              <h3 className="text-2xl font-black text-zinc-950 uppercase tracking-tight font-display">
                {activeRoutine.name}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsAddExerciseModalOpen(true)}
                className="px-4 py-2.5 bg-zinc-950 hover:bg-zinc-800 text-white rounded-2xl text-xs font-mono font-bold uppercase transition-all flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>Agregar Ejercicio</span>
              </button>
            </div>
          </div>

          {/* Pestañas de Días de la Rutina (Lunes, Martes, Jueves...) */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {activeRoutine.schedule.map((day, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedDayIdx(idx)}
                className={`px-4 py-2.5 rounded-2xl font-mono text-xs font-bold uppercase transition-all cursor-pointer shrink-0 flex items-center gap-2 ${selectedDayIdx === idx
                  ? 'bg-zinc-950 text-white shadow-sm scale-105'
                  : 'bg-zinc-100 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/80 border border-zinc-200'
                  }`}
              >
                <span>{day.dayName}</span>
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${selectedDayIdx === idx ? 'bg-emerald-500 text-black font-bold' : 'bg-zinc-200 text-zinc-600'}`}>
                  {day.exercises.length}
                </span>
              </button>
            ))}
          </div>

          {/* Cabecera del Día Seleccionado */}
          {activeRoutine.schedule[selectedDayIdx] && (
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2">
              <div>
                <span className="text-[11px] font-mono text-emerald-600 uppercase font-bold block">
                  {activeRoutine.schedule[selectedDayIdx].dayName} // {activeRoutine.schedule[selectedDayIdx].targetMuscles}
                </span>
                <h4 className="text-xl font-black text-zinc-950 uppercase font-display">
                  {activeRoutine.schedule[selectedDayIdx].title}
                </h4>
              </div>

              {onLoadWorkoutToDaily && (
                <button
                  type="button"
                  onClick={() => onLoadWorkoutToDaily(activeRoutine.schedule[selectedDayIdx].exercises)}
                  className="px-3.5 py-2 bg-zinc-100 hover:bg-emerald-500 hover:text-black text-zinc-800 font-mono text-xs font-bold uppercase rounded-xl transition-all cursor-pointer flex items-center gap-1.5 border border-zinc-200 shadow-xs"
                >
                  <Play className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Cargar Esta Sesión en Diario</span>
                </button>
              )}
            </div>
          )}

          {/* Listado Editable de Ejercicios del Día (Tarjetas sueltas y limpias) */}
          {activeRoutine.schedule[selectedDayIdx]?.exercises.length === 0 ? (
            <div className="py-12 text-center text-zinc-400 font-mono text-xs space-y-3 bg-zinc-50 rounded-3xl border border-dashed border-zinc-200">
              <Dumbbell className="w-8 h-8 mx-auto opacity-40 text-zinc-400" />
              <p>No hay ejercicios cargados para este día.</p>
              <button
                type="button"
                onClick={() => setIsAddExerciseModalOpen(true)}
                className="px-4 py-2 bg-emerald-500 text-black font-bold uppercase rounded-xl transition-all cursor-pointer inline-flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar tu primer ejercicio</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {activeRoutine.schedule[selectedDayIdx]?.exercises.map((ex, exIdx) => (
                <div
                  key={ex.id || exIdx}
                  className="bg-white hover:bg-zinc-50/70 border border-zinc-200/90 hover:border-emerald-500/40 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all shadow-xs group"
                >
                  {/* Visual Thumbnail & Nombre */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Número de orden */}
                    <span className="w-7 h-7 rounded-xl bg-zinc-100 text-zinc-700 text-xs font-mono font-bold flex items-center justify-center shrink-0 border border-zinc-200">
                      {exIdx + 1}
                    </span>

                    {/* Thumbnail GIF 3D si existe */}
                    {ex.gifUrl ? (
                      <img
                        src={ex.gifUrl}
                        alt={ex.name}
                        className="w-12 h-12 rounded-xl object-cover bg-zinc-950 border border-zinc-200 shrink-0"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center shrink-0">
                        <Dumbbell className="w-5 h-5 text-emerald-600" />
                      </div>
                    )}

                    {/* Nombre y Categoría */}
                    <div className="truncate">
                      <span className="text-[10px] font-mono text-emerald-600 uppercase font-bold block">
                        {ex.category || 'Fuerza'}
                      </span>
                      <h5 className="text-sm font-bold text-zinc-900 truncate max-w-sm sm:max-w-md">
                        {ex.name}
                      </h5>
                    </div>
                  </div>

                  {/* Series, Reps, Peso & Controles de Edición */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 font-mono text-xs shrink-0 border-t sm:border-t-0 border-zinc-100 pt-2 sm:pt-0">
                    <div className="flex items-center gap-2 bg-zinc-50 px-3 py-1.5 rounded-xl border border-zinc-200">
                      <span className="text-zinc-900 font-bold">{ex.sets} <span className="text-zinc-500 font-normal">series</span></span>
                      <span className="text-zinc-300">•</span>
                      <span className="text-emerald-600 font-bold">{ex.reps} <span className="text-zinc-500 font-normal">reps</span></span>
                      {ex.weight > 0 && (
                        <>
                          <span className="text-zinc-300">•</span>
                          <span className="text-zinc-900 font-bold">{ex.weight} <span className="text-zinc-500 font-normal">kg</span></span>
                        </>
                      )}
                    </div>

                    {/* Botones de Acción (Subir, Bajar, Editar, Eliminar) */}
                    <div className="flex items-center gap-1">
                      {/* Subir orden */}
                      <button
                        type="button"
                        onClick={() => handleMoveExercise(selectedDayIdx, exIdx, 'up')}
                        disabled={exIdx === 0}
                        title="Subir de orden"
                        className="p-2 bg-zinc-100 hover:bg-zinc-200 disabled:opacity-25 text-zinc-600 hover:text-zinc-900 rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>

                      {/* Bajar orden */}
                      <button
                        type="button"
                        onClick={() => handleMoveExercise(selectedDayIdx, exIdx, 'down')}
                        disabled={exIdx === activeRoutine.schedule[selectedDayIdx].exercises.length - 1}
                        title="Bajar de orden"
                        className="p-2 bg-zinc-100 hover:bg-zinc-200 disabled:opacity-25 text-zinc-600 hover:text-zinc-900 rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>

                      {/* Editar */}
                      <button
                        type="button"
                        onClick={() => setEditingExercise({ dayIdx: selectedDayIdx, exIdx, ...ex })}
                        title="Editar series, repeticiones y peso"
                        className="p-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 hover:text-emerald-600 rounded-lg transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Eliminar */}
                      <button
                        type="button"
                        onClick={() => handleDeleteExercise(selectedDayIdx, exIdx)}
                        title="Quitar ejercicio"
                        className="p-2 bg-zinc-100 hover:bg-rose-50 text-zinc-400 hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}

        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* SECCIÓN C: CONSULTORIO DEL COACH EN VIVO (CHAT COMPLETO)               */}
        {/* ----------------------------------------------------------------------- */}
        <div className="space-y-5 pt-4">
          <div className="flex items-center gap-3 border-b border-zinc-200 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <Bot className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-xl font-black text-zinc-950 uppercase tracking-tight font-display flex items-center gap-2">
                Consultorio
              </h3>
              <span className="text-xs font-mono text-zinc-500">
                Pregúntale sobre técnicas, reemplazos de ejercicios, ideas de comidas o estancamiento
              </span>
            </div>
          </div>

          {/* Área de Mensajes */}
          <div className="bg-zinc-50/80 border border-zinc-200 rounded-3xl p-4 sm:p-6 min-h-[300px] max-h-[480px] overflow-y-auto space-y-4 font-sans text-xs">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'model' && (
                  <div className="w-8 h-8 rounded-xl bg-zinc-900 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <Bot className="w-4 h-4 text-emerald-400" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] px-4 py-3 rounded-2xl leading-relaxed select-text ${msg.role === 'user'
                    ? 'bg-emerald-500 text-black font-semibold rounded-br-none shadow-sm'
                    : 'bg-white text-zinc-800 border border-zinc-200 rounded-bl-none shadow-xs'
                    }`}
                >
                  <div className="whitespace-pre-line text-xs space-y-1">
                    {msg.content}
                  </div>
                </div>

                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-xl bg-zinc-900 flex items-center justify-center shrink-0 mt-0.5 text-white">
                    <UserIcon className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isCoachThinking && (
              <div className="flex gap-3 justify-start items-center">
                <div className="w-8 h-8 rounded-xl bg-zinc-900 flex items-center justify-center shrink-0">
                  <RefreshCw className="w-4 h-4 text-emerald-400 animate-spin" />
                </div>
                <div className="bg-white text-zinc-600 px-4 py-2.5 rounded-2xl border border-zinc-200 text-xs font-mono flex items-center gap-2 shadow-xs">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                  <span>El Coach está formulando tu respuesta...</span>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Preguntas Sugeridas */}
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            <button
              type="button"
              onClick={() => handleSendCoachQuestion('¿Qué comida post-entreno me recomiendas para mi peso y meta?')}
              className="px-3.5 py-1.5 bg-white hover:bg-zinc-50 text-zinc-700 hover:text-zinc-900 rounded-xl border border-zinc-200 transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              Comida Post-Entreno
            </button>
            <button
              type="button"
              onClick={() => handleSendCoachQuestion('¿Cómo puedo aplicar sobrecarga progresiva si no puedo subir más de peso en Sentadilla?')}
              className="px-3.5 py-1.5 bg-white hover:bg-zinc-50 text-zinc-700 hover:text-zinc-900 rounded-xl border border-zinc-200 transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              Superar Estancamiento
            </button>
            <button
              type="button"
              onClick={() => handleSendCoachQuestion('¿Con qué ejercicio puedo reemplazar el Press Banca si siento molestia en el hombro?')}
              className="px-3.5 py-1.5 bg-white hover:bg-zinc-50 text-zinc-700 hover:text-zinc-900 rounded-xl border border-zinc-200 transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              Reemplazo Seguro de Ejercicio
            </button>
          </div>

          {/* Input de Pregunta */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendCoachQuestion();
            }}
            className="flex items-center gap-3"
          >
            <input
              type="text"
              value={inputQuestion}
              onChange={(e) => setInputQuestion(e.target.value)}
              placeholder="Escribe tu consulta deportiva o nutricional para el coach..."
              disabled={isCoachThinking}
              className="flex-1 bg-white border border-zinc-200 focus:border-emerald-500 rounded-2xl px-4 py-3 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none transition-colors font-sans shadow-xs"
            />
            <button
              type="submit"
              disabled={!inputQuestion.trim() || isCoachThinking}
              className="px-5 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-200 text-black disabled:text-zinc-400 font-extrabold uppercase rounded-2xl transition-all cursor-pointer disabled:cursor-not-allowed flex items-center gap-1.5 text-xs font-mono shadow-md"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Enviar</span>
            </button>
          </form>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* MODAL: SELECCIONAR Y AGREGAR EJERCICIO DESDE EL CATÁLOGO OFICIAL          */}
      {/* ========================================================================= */}
      {isAddExerciseModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#121214] border border-[#2E2E34] rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-fade-in-up">

            {/* Header Modal */}
            <div className="p-5 bg-[#18181B] border-b border-[#2E2E34] flex items-center justify-between shrink-0">
              <div>
                <h4 className="text-lg font-black text-white uppercase tracking-tight font-display">
                  Catálogo de Ejercicios MyPowerUp
                </h4>
                <span className="text-xs font-mono text-zinc-400">
                  Agregando a: <strong className="text-emerald-400">{activeRoutine.schedule[selectedDayIdx]?.dayName}</strong> ({activeRoutine.schedule[selectedDayIdx]?.title})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsAddExerciseModalOpen(false)}
                className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Selector de Categorías */}
            <div className="p-3 bg-[#141417] border-b border-[#2E2E34] flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
              {exerciseCategories.map((cat, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedCategoryFilter(cat)}
                  className={`px-3 py-1 rounded-xl text-xs font-mono font-bold uppercase transition-colors cursor-pointer shrink-0 ${selectedCategoryFilter === cat
                    ? 'bg-emerald-500 text-black'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Listado de Ejercicios */}
            <div className="p-4 overflow-y-auto space-y-2.5 flex-1">
              {filteredCatalog.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#18181B] hover:bg-[#1E1E24] border border-[#2E2E34] rounded-2xl p-3 flex items-center justify-between gap-3 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {item.gifUrl ? (
                      <img
                        src={item.gifUrl}
                        alt={item.name}
                        className="w-12 h-12 rounded-xl object-cover bg-black border border-[#2E2E34] shrink-0"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-black border border-[#2E2E34] flex items-center justify-center shrink-0">
                        <Dumbbell className="w-5 h-5 text-emerald-400" />
                      </div>
                    )}
                    <div className="truncate">
                      <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold block">
                        {item.category}
                      </span>
                      <h6 className="text-xs font-bold text-white truncate max-w-xs sm:max-w-md">
                        {item.name}
                      </h6>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAddExerciseToDay(item)}
                    className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-mono text-xs font-bold uppercase rounded-xl transition-all cursor-pointer flex items-center gap-1 shrink-0 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Agregar</span>
                  </button>
                </div>
              ))}
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDITAR SERIES, REPETICIONES Y PESO DE UN EJERCICIO                 */}
      {/* ========================================================================= */}
      {editingExercise && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#121214] border border-[#2E2E34] rounded-3xl w-full max-w-md p-6 space-y-5 shadow-2xl animate-fade-in-up font-mono text-xs">

            <div className="flex items-center justify-between border-b border-[#2E2E34] pb-3">
              <div>
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
                  Editar Parámetros
                </span>
                <h4 className="text-base font-black text-white uppercase font-display truncate max-w-[260px]">
                  {editingExercise.name}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setEditingExercise(null)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5 text-left">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-zinc-400 uppercase block text-[11px] font-bold">Series</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={editingExercise.sets}
                    onChange={(e) => setEditingExercise({ ...editingExercise, sets: e.target.value })}
                    className="w-full bg-[#18181B] border border-[#2E2E34] rounded-xl px-3 py-2 text-white font-bold focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-400 uppercase block text-[11px] font-bold">Reps Objetivo</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={editingExercise.reps}
                    onChange={(e) => setEditingExercise({ ...editingExercise, reps: e.target.value })}
                    className="w-full bg-[#18181B] border border-[#2E2E34] rounded-xl px-3 py-2 text-white font-bold focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-zinc-400 uppercase block text-[11px] font-bold">Peso Sugerido (kg)</label>
                  <input
                    type="number"
                    min="0"
                    max="500"
                    step="0.5"
                    value={editingExercise.weight}
                    onChange={(e) => setEditingExercise({ ...editingExercise, weight: e.target.value })}
                    className="w-full bg-[#18181B] border border-[#2E2E34] rounded-xl px-3 py-2 text-white font-bold focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-400 uppercase block text-[11px] font-bold">Descanso (seg)</label>
                  <input
                    type="number"
                    min="15"
                    max="300"
                    step="15"
                    value={editingExercise.restSeconds}
                    onChange={(e) => setEditingExercise({ ...editingExercise, restSeconds: e.target.value })}
                    className="w-full bg-[#18181B] border border-[#2E2E34] rounded-xl px-3 py-2 text-white font-bold focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#2E2E34] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingExercise(null)}
                className="px-4 py-2 text-zinc-400 hover:text-white uppercase transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveExerciseEdit}
                className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold uppercase rounded-xl transition-all cursor-pointer shadow-md"
              >
                Guardar Cambios
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
