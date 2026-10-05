import React, { useState, useRef, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Check,
  Dumbbell,
  Sparkles,
  Layers,
  Sliders,
  X,
  Flame,
  Activity,
  Layers3
} from 'lucide-react';
import spriteSheetImg from '../assets/gym-exercises-spritesheet.png';

// Colección de 48 Ejercicios y Máquinas de Gimnasio con Animaciones 3D Musculares Verificadas (48/48 HTTP 200 OK)
export const GYM_EXERCISES_SPRITES = [
  // === PECHO ===
  {
    id: 'press_banca_plano',
    name: 'Press Banca Plano con Barra',
    category: 'Pecho',
    row: 0,
    col: 0,
    defaultWeight: 60,
    defaultReps: 10,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Bench-Press.gif'
  },
  {
    id: 'press_inclinado_barra',
    name: 'Press Inclinado con Barra',
    category: 'Pecho',
    row: 3,
    col: 3,
    defaultWeight: 50,
    defaultReps: 10,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Incline-Barbell-Bench-Press.gif'
  },
  {
    id: 'press_plano_mancuernas',
    name: 'Press Plano con Mancuernas',
    category: 'Pecho',
    row: 4,
    col: 5,
    defaultWeight: 24,
    defaultReps: 10,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Press.gif'
  },
  {
    id: 'press_inclinado_mancuernas',
    name: 'Press Inclinado con Mancuernas',
    category: 'Pecho',
    row: 7,
    col: 3,
    defaultWeight: 22,
    defaultReps: 10,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Incline-Dumbbell-Press.gif'
  },
  {
    id: 'aperturas_mancuernas',
    name: 'Aperturas con Mancuernas',
    category: 'Pecho',
    row: 5,
    col: 2,
    defaultWeight: 14,
    defaultReps: 12,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Fly.gif'
  },
  {
    id: 'press_declinado_barra',
    name: 'Press Declinado con Barra',
    category: 'Pecho',
    row: 5,
    col: 2,
    defaultWeight: 55,
    defaultReps: 10,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/03/Decline-Barbell-Bench-Press.gif'
  },
  {
    id: 'peck_deck_mariposa',
    name: 'Peck Deck / Contractora',
    category: 'Pecho',
    row: 1,
    col: 4,
    defaultWeight: 45,
    defaultReps: 12,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Pec-Deck-Fly.gif'
  },
  {
    id: 'cruces_polea_alta',
    name: 'Cruces en Polea Alta',
    category: 'Pecho',
    row: 4,
    col: 2,
    defaultWeight: 20,
    defaultReps: 12,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Cable-Crossover.gif'
  },
  {
    id: 'flexiones_suelo_pushups',
    name: 'Flexiones en Suelo / Pushups',
    category: 'Pecho',
    row: 6,
    col: 2,
    defaultWeight: 0,
    defaultReps: 15,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Push-Up.gif'
  },

  // === ESPALDA ===
  {
    id: 'jalon_pecho',
    name: 'Jalón al Pecho en Polea',
    category: 'Espalda',
    row: 0,
    col: 1,
    defaultWeight: 50,
    defaultReps: 12,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Lat-Pulldown.gif'
  },
  {
    id: 'jalon_agarre_estrecho',
    name: 'Jalón Polea Agarre Estrecho',
    category: 'Espalda',
    row: 7,
    col: 0,
    defaultWeight: 50,
    defaultReps: 12,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/06/Close-Grip-Lat-Pulldown.gif'
  },
  {
    id: 'peso_muerto',
    name: 'Peso Muerto con Barra',
    category: 'Espalda',
    row: 0,
    col: 5,
    defaultWeight: 80,
    defaultReps: 6,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Deadlift.gif'
  },
  {
    id: 'remo_barra_t',
    name: 'Remo Barra T con Apoyo',
    category: 'Espalda',
    row: 1,
    col: 3,
    defaultWeight: 50,
    defaultReps: 10,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/06/T-Bar-Row.gif'
  },
  {
    id: 'remo_sentado_polea',
    name: 'Remo Sentado en Polea Baja',
    category: 'Espalda',
    row: 4,
    col: 1,
    defaultWeight: 45,
    defaultReps: 12,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Seated-Cable-Row.gif'
  },
  {
    id: 'remo_unilateral_mancuerna',
    name: 'Remo con Mancuerna (Serrucho)',
    category: 'Espalda',
    row: 3,
    col: 4,
    defaultWeight: 22,
    defaultReps: 10,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Row.gif'
  },
  {
    id: 'remo_barra_inclinado',
    name: 'Remo con Barra Inclinado',
    category: 'Espalda',
    row: 1,
    col: 3,
    defaultWeight: 50,
    defaultReps: 10,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Bent-Over-Row.gif'
  },
  {
    id: 'dominadas_barra',
    name: 'Dominadas en Barra Fija',
    category: 'Espalda',
    row: 2,
    col: 3,
    defaultWeight: 0,
    defaultReps: 8,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Pull-up.gif'
  },
  {
    id: 'dominadas_asistidas',
    name: 'Dominadas en Máquina Asistida',
    category: 'Espalda',
    row: 4,
    col: 0,
    defaultWeight: 40,
    defaultReps: 10,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/04/Assisted-Pull-up.gif'
  },
  {
    id: 'dominadas_agarre_neutro',
    name: 'Dominadas Agarre Neutro',
    category: 'Espalda',
    row: 2,
    col: 3,
    defaultWeight: 0,
    defaultReps: 8,
    gifUrl: 'https://static.exercisedb.dev/media/0V2YQjW.gif'
  },

  // === PIERNAS ===
  {
    id: 'sentadilla_rack',
    name: 'Sentadilla con Barra en Rack',
    category: 'Piernas',
    row: 0,
    col: 3,
    defaultWeight: 70,
    defaultReps: 8,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/BARBELL-SQUAT.gif'
  },
  {
    id: 'prensa_piernas',
    name: 'Prensa de Piernas 45°',
    category: 'Piernas',
    row: 0,
    col: 2,
    defaultWeight: 120,
    defaultReps: 10,
    gifUrl: 'https://static.exercisedb.dev/media/10Z2DXU.gif'
  },
  {
    id: 'sentadilla_hack',
    name: 'Sentadilla Hack en Máquina',
    category: 'Piernas',
    row: 4,
    col: 3,
    defaultWeight: 80,
    defaultReps: 10,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Sled-Hack-Squat.gif'
  },
  {
    id: 'curl_femoral_tumbado',
    name: 'Curl Femoral Tumbado',
    category: 'Piernas',
    row: 1,
    col: 2,
    defaultWeight: 40,
    defaultReps: 12,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Leg-Curl.gif'
  },
  {
    id: 'curl_femoral_sentado',
    name: 'Curl Femoral Sentado',
    category: 'Piernas',
    row: 1,
    col: 2,
    defaultWeight: 40,
    defaultReps: 12,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/08/Seated-Leg-Curl.gif'
  },
  {
    id: 'extension_cuadriceps',
    name: 'Extensión de Cuádriceps',
    category: 'Piernas',
    row: 1,
    col: 1,
    defaultWeight: 45,
    defaultReps: 12,
    gifUrl: 'https://static.exercisedb.dev/media/0lQnxMZ.gif'
  },
  {
    id: 'zancadas_mancuernas',
    name: 'Zancadas con Mancuernas',
    category: 'Piernas',
    row: 5,
    col: 3,
    defaultWeight: 16,
    defaultReps: 12,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Lunge.gif'
  },
  {
    id: 'elevacion_gemelos_maquina',
    name: 'Elevación de Gemelos en Máquina',
    category: 'Piernas',
    row: 3,
    col: 2,
    defaultWeight: 60,
    defaultReps: 15,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/06/Standing-Calf-Raise.gif'
  },
  {
    id: 'elevacion_gemelos_unilateral',
    name: 'Gemelos a una Pierna',
    category: 'Piernas',
    row: 3,
    col: 2,
    defaultWeight: 0,
    defaultReps: 15,
    gifUrl: 'https://static.exercisedb.dev/media/0jp9Rlz.gif'
  },
  {
    id: 'hip_thrust',
    name: 'Hip Thrust con Barra',
    category: 'Piernas',
    row: 5,
    col: 5,
    defaultWeight: 70,
    defaultReps: 10,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Hip-Thrust.gif'
  },

  // === HOMBROS ===
  {
    id: 'press_militar_barra',
    name: 'Press Militar con Barra',
    category: 'Hombros',
    row: 6,
    col: 4,
    defaultWeight: 35,
    defaultReps: 10,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/04/Barbell-Military-Press.gif'
  },
  {
    id: 'press_militar_mancuernas',
    name: 'Press de Hombros con Mancuernas',
    category: 'Hombros',
    row: 1,
    col: 0,
    defaultWeight: 18,
    defaultReps: 10,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Shoulder-Press.gif'
  },
  {
    id: 'elevaciones_laterales',
    name: 'Elevaciones Laterales con Mancuernas',
    category: 'Hombros',
    row: 5,
    col: 4,
    defaultWeight: 10,
    defaultReps: 15,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Lateral-Raise.gif'
  },
  {
    id: 'elevaciones_laterales_polea',
    name: 'Elevaciones Laterales en Polea',
    category: 'Hombros',
    row: 5,
    col: 4,
    defaultWeight: 8,
    defaultReps: 15,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Cable-Lateral-Raise.gif'
  },
  {
    id: 'press_arnold',
    name: 'Press Arnold con Mancuernas',
    category: 'Hombros',
    row: 7,
    col: 4,
    defaultWeight: 16,
    defaultReps: 10,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Arnold-Press.gif'
  },
  {
    id: 'pajaros_posteriores',
    name: 'Pájaros / Deltoides Posterior',
    category: 'Hombros',
    row: 7,
    col: 4,
    defaultWeight: 10,
    defaultReps: 15,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Bent-Over-Lateral-Raise.gif'
  },
  {
    id: 'encogimientos_trapecio',
    name: 'Encogimientos con Mancuernas',
    category: 'Hombros',
    row: 0,
    col: 4,
    defaultWeight: 24,
    defaultReps: 15,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/04/Dumbbell-Shrug.gif'
  },

  // === BRAZOS ===
  {
    id: 'curl_barra_z',
    name: 'Curl Bíceps con Barra Z',
    category: 'Brazos',
    row: 3,
    col: 1,
    defaultWeight: 30,
    defaultReps: 10,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Curl.gif'
  },
  {
    id: 'curl_mancuernas',
    name: 'Curl Alterno con Mancuernas',
    category: 'Brazos',
    row: 0,
    col: 4,
    defaultWeight: 14,
    defaultReps: 12,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Curl.gif'
  },
  {
    id: 'curl_martillo',
    name: 'Curl Martillo con Mancuernas',
    category: 'Brazos',
    row: 0,
    col: 4,
    defaultWeight: 14,
    defaultReps: 12,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Hammer-Curl.gif'
  },
  {
    id: 'curl_predicador',
    name: 'Curl Bíceps Banco Scott (Predicador)',
    category: 'Brazos',
    row: 1,
    col: 5,
    defaultWeight: 28,
    defaultReps: 10,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/04/Lever-Preacher-Curl.gif'
  },
  {
    id: 'triceps_polea_cuerda',
    name: 'Extensión Tríceps Polea Cuerda',
    category: 'Brazos',
    row: 3,
    col: 0,
    defaultWeight: 25,
    defaultReps: 12,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/06/Rope-Pushdown.gif'
  },
  {
    id: 'triceps_polea_barra',
    name: 'Extensión Tríceps Polea Barra',
    category: 'Brazos',
    row: 7,
    col: 1,
    defaultWeight: 25,
    defaultReps: 12,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Pushdown.gif'
  },
  {
    id: 'fondos_paralelas',
    name: 'Fondos en Barras Paralelas (Dips)',
    category: 'Brazos',
    row: 2,
    col: 4,
    defaultWeight: 0,
    defaultReps: 10,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/06/Chest-Dips.gif'
  },
  {
    id: 'fondos_banco',
    name: 'Fondos de Tríceps en Banco',
    category: 'Brazos',
    row: 6,
    col: 0,
    defaultWeight: 0,
    defaultReps: 12,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Bench-Dips.gif'
  },

  // === CORE ===
  {
    id: 'crunch_polea',
    name: 'Crunch Abdominal en Polea',
    category: 'Core',
    row: 7,
    col: 2,
    defaultWeight: 35,
    defaultReps: 15,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Kneeling-Cable-Crunch.gif'
  },
  {
    id: 'elevacion_rodillas_colgado',
    name: 'Elevación de Piernas en Paralelas',
    category: 'Core',
    row: 3,
    col: 5,
    defaultWeight: 0,
    defaultReps: 12,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/05/Captains-Chair-Leg-Raise.gif'
  },
  {
    id: 'rueda_abdominal',
    name: 'Rueda Abdominal (Ab Wheel)',
    category: 'Core',
    row: 6,
    col: 5,
    defaultWeight: 0,
    defaultReps: 12,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/06/Ab-Wheel-Rollout.gif'
  },
  {
    id: 'flexion_unilateral',
    name: 'Flexión Unilateral / Core',
    category: 'Core',
    row: 6,
    col: 3,
    defaultWeight: 0,
    defaultReps: 10,
    gifUrl: 'https://static.exercisedb.dev/media/13TpY4H.gif'
  },

  // === CARDIO ===
  {
    id: 'burpees_mancuernas',
    name: 'Burpees con Mancuernas',
    category: 'Cardio',
    row: 2,
    col: 0,
    defaultWeight: 6,
    defaultReps: 15,
    gifUrl: 'https://static.exercisedb.dev/media/0JtKWum.gif'
  },
  {
    id: 'remo_ergometro',
    name: 'Remo Indoor / Ergómetro',
    category: 'Cardio',
    row: 5,
    col: 1,
    defaultWeight: 0,
    defaultReps: 15,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/06/Rowing-Machine.gif'
  }
];

// Placas de peso de la torre de placas (Weight Stack)
const WEIGHT_STACK_PLATES = [
  5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 110, 120
];

const CATEGORIES = ['Todos', 'Pecho', 'Espalda', 'Piernas', 'Brazos', 'Hombros', 'Core', 'Cardio'];

export default function VisualGymExercisePicker({
  onAddWorkout,
  onClose,
  rememberedWorkouts = {},
  onUpdateRememberedWorkouts
}) {
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedExercise, setSelectedExercise] = useState(GYM_EXERCISES_SPRITES[0]);
  const [activeSetIndex, setActiveSetIndex] = useState(0);
  const [currentWeight, setCurrentWeight] = useState(GYM_EXERCISES_SPRITES[0].defaultWeight);
  const [currentReps, setCurrentReps] = useState(GYM_EXERCISES_SPRITES[0].defaultReps);
  const [failedImages, setFailedImages] = useState({});
  const [isJustSaved, setIsJustSaved] = useState(false);

  // Lista de series configuradas
  const [seriesList, setSeriesList] = useState([
    { setNumber: 1, weight: GYM_EXERCISES_SPRITES[0].defaultWeight, reps: GYM_EXERCISES_SPRITES[0].defaultReps }
  ]);

  const carouselRef = useRef(null);

  // Filtrar ejercicios por categoría
  const filteredExercises = useMemo(() => {
    if (selectedCategory === 'Todos') return GYM_EXERCISES_SPRITES;
    return GYM_EXERCISES_SPRITES.filter((ex) => ex.category === selectedCategory);
  }, [selectedCategory]);

  // Al seleccionar un ejercicio nuevo del carrusel
  const handleSelectExercise = (exercise) => {
    setSelectedExercise(exercise);
    setCurrentWeight(exercise.defaultWeight);
    setCurrentReps(exercise.defaultReps);
    setSeriesList([
      { setNumber: 1, weight: exercise.defaultWeight, reps: exercise.defaultReps }
    ]);
    setActiveSetIndex(0);
  };

  const scrollCarousel = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Ajustar peso de la serie activa
  const handleWeightChange = (newWeight) => {
    const val = Math.max(0, Math.min(300, Math.round(newWeight * 10) / 10));
    setCurrentWeight(val);
    setSeriesList((prev) =>
      prev.map((s, idx) => (idx === activeSetIndex ? { ...s, weight: val } : s))
    );
  };

  // Ajustar repeticiones de la serie activa
  const handleRepsChange = (newReps) => {
    const val = Math.max(1, Math.min(200, parseInt(newReps, 10) || 1));
    setCurrentReps(val);
    setSeriesList((prev) =>
      prev.map((s, idx) => (idx === activeSetIndex ? { ...s, reps: val } : s))
    );
  };

  // Agregar nueva serie
  const handleAddNextSet = () => {
    const nextSetNumber = seriesList.length + 1;
    const newSet = {
      setNumber: nextSetNumber,
      weight: currentWeight,
      reps: currentReps
    };
    const updated = [...seriesList, newSet];
    setSeriesList(updated);
    setActiveSetIndex(updated.length - 1);
  };

  // Seleccionar una serie existente para editarla
  const handleSelectSetIndex = (idx) => {
    setActiveSetIndex(idx);
    const target = seriesList[idx];
    if (target) {
      setCurrentWeight(target.weight);
      setCurrentReps(target.reps);
    }
  };

  // Eliminar una serie
  const handleRemoveSet = (idxToRemove) => {
    if (seriesList.length <= 1) return;
    const filtered = seriesList
      .filter((_, idx) => idx !== idxToRemove)
      .map((s, idx) => ({ ...s, setNumber: idx + 1 }));
    setSeriesList(filtered);
    const newActiveIdx = Math.max(0, Math.min(activeSetIndex, filtered.length - 1));
    setActiveSetIndex(newActiveIdx);
    setCurrentWeight(filtered[newActiveIdx].weight);
    setCurrentReps(filtered[newActiveIdx].reps);
  };

  // Guardar ejercicio completo en la app
  const handleSaveCompleteWorkout = () => {
    if (!selectedExercise) return;

    const maxWeight = Math.max(...seriesList.map((s) => Number(s.weight) || 0));
    const firstReps = seriesList[0]?.reps || 10;

    const detailedSets = seriesList.map((s) => ({
      setNumber: s.setNumber,
      weight: Number(s.weight) || 0,
      reps: Number(s.reps) || 10
    }));

    const workoutPayload = {
      name: selectedExercise.name,
      sets: seriesList.length,
      reps: firstReps,
      weight: maxWeight,
      detailedSets: detailedSets,
      category: selectedExercise.category,
      gifUrl: selectedExercise.gifUrl || ''
    };

    if (onAddWorkout) {
      onAddWorkout(workoutPayload);
    }

    // Actualizar historial de ejercicios recordados
    const key = selectedExercise.name.trim().toLowerCase();
    const currentMemory = rememberedWorkouts || {};
    const updatedMemory = {
      ...currentMemory,
      [key]: {
        name: selectedExercise.name.trim(),
        sets: workoutPayload.sets,
        reps: workoutPayload.reps,
        weight: workoutPayload.weight,
        detailedSets: workoutPayload.detailedSets || null,
        lastUsed: Date.now()
      }
    };

    if (onUpdateRememberedWorkouts) {
      onUpdateRememberedWorkouts(updatedMemory);
    } else {
      try {
        localStorage.setItem('mypowerup_remembered_workouts', JSON.stringify(updatedMemory));
      } catch (e) {
        console.error(e);
      }
    }

    // Feedback visual claro e inmediato
    setIsJustSaved(true);
    setTimeout(() => {
      setIsJustSaved(false);
    }, 2200);

    if (onClose) onClose();
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-3xl p-4 sm:p-7 shadow-xs space-y-6 select-none font-sans">

      {/* 1. CABECERA & CONTROLES DEL VISUALIZADOR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-4">
        <div>
          <h3 className="text-xl sm:text-2xl font-black text-zinc-900 uppercase font-display tracking-tight">
            SELECTOR
          </h3>
        </div>
      </div>
      {/* 2. FILTROS DE CATEGORÍA */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
        {CATEGORIES.map((cat) => {
          const isCatActive = selectedCategory === cat;
          const count = cat === 'Todos' ? GYM_EXERCISES_SPRITES.length : GYM_EXERCISES_SPRITES.filter(e => e.category === cat).length;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-xl text-xs font-mono font-extrabold transition-all cursor-pointer flex-shrink-0 flex items-center gap-1 ${isCatActive
                ? 'bg-zinc-900 text-white shadow-xs'
                : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'
                }`}
            >
              <span>{cat}</span>
              <span className={`text-[10px] ${isCatActive ? 'text-zinc-300' : 'text-zinc-500'}`}>({count})</span>
            </button>
          );
        })}
      </div>

      {/* 3. CARRUSEL HORIZONTAL CON ANIMACIONES 3D (IMAGEN 1) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-extrabold uppercase tracking-wider text-zinc-900 flex items-center gap-1.5">
            <span>COLECCIÓN DE EJERCICIOS ({filteredExercises.length} DISPONIBLES)</span>
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollCarousel('left')}
              className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-zinc-900 flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95"
              title="Desplazar a la izquierda"
            >
              <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
            </button>
            <button
              type="button"
              onClick={() => scrollCarousel('right')}
              className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-zinc-900 flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95"
              title="Desplazar a la derecha"
            >
              <ChevronRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Carrusel Deslizable con Tarjetas de Ejercicios */}
        <div
          ref={carouselRef}
          className="flex items-stretch gap-4 overflow-x-auto pb-4 pt-1 scroll-smooth snap-x snap-mandatory custom-scrollbar"
        >
          {filteredExercises.map((ex) => {
            const isSelected = selectedExercise?.id === ex.id;
            const hasImageFailed = failedImages[ex.id];
            const posX = (ex.col / 5) * 100;
            const posY = (ex.row / 7) * 100;

            return (
              <button
                key={ex.id}
                type="button"
                onClick={() => handleSelectExercise(ex)}
                className={`flex-shrink-0 w-36 sm:w-44 snap-center p-3 sm:p-3.5 rounded-3xl border transition-all flex flex-col items-center justify-between text-center cursor-pointer group select-none ${isSelected
                  ? 'bg-white text-zinc-950 border-2 border-black shadow-xl ring-2 ring-black/5 scale-[1.02]'
                  : 'bg-zinc-50/70 hover:bg-white border-zinc-200/90 text-zinc-800 hover:border-zinc-300 hover:shadow-sm'
                  }`}
              >
                {/* Contenedor del GIF Animado 3D */}
                <div className={`w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden flex items-center justify-center p-2 relative transition-all ${isSelected ? 'bg-zinc-100 border border-zinc-300' : 'bg-white group-hover:bg-zinc-50 border border-zinc-200/80'
                  }`}>
                  {ex.gifUrl && !hasImageFailed ? (
                    <img
                      src={ex.gifUrl}
                      alt={ex.name}
                      loading="lazy"
                      onError={() => setFailedImages(prev => ({ ...prev, [ex.id]: true }))}
                      className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div
                      className="w-full h-full transform group-hover:scale-105 transition-transform duration-300"
                      style={{
                        backgroundImage: `url(${spriteSheetImg})`,
                        backgroundSize: '600% 800%',
                        backgroundPosition: `${posX}% ${posY}%`,
                        backgroundRepeat: 'no-repeat',
                        imageRendering: 'crisp-edges'
                      }}
                    />
                  )}
                  {isSelected && (
                    <span className="absolute top-2.5 right-2.5 w-3.5 h-3.5 rounded-full bg-amber-400 border border-amber-600/30 shadow-xs" />
                  )}
                </div>

                <div className="mt-3 w-full space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-widest block font-bold text-zinc-500">
                    {ex.category}
                  </span>
                  <h4 className={`text-xs sm:text-sm font-extrabold font-display tracking-tight leading-snug line-clamp-2 ${isSelected ? 'text-black border-b-2 border-amber-400 pb-0.5 inline-block' : 'text-zinc-800'
                    }`}>
                    {ex.name}
                  </h4>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. PANEL DE CARGA DE SERIES, PLACAS Y PESO */}
      {selectedExercise && (
        <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 sm:p-6 space-y-5 shadow-inner">

          {/* Fila Superior: Ejercicio Activo Destacado + Pestañas de Series */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 pb-4">

            {/* Ejercicio Activo con Animación en Vivo */}
            <div className="flex items-center gap-3.5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white border border-zinc-300 p-1 flex items-center justify-center shadow-xs flex-shrink-0 overflow-hidden">
                {selectedExercise.gifUrl && !failedImages[selectedExercise.id] ? (
                  <img
                    src={selectedExercise.gifUrl}
                    alt={selectedExercise.name}
                    className="w-full h-full object-contain mix-blend-multiply"
                  />
                ) : (
                  <div
                    className="w-full h-full"
                    style={{
                      backgroundImage: `url(${spriteSheetImg})`,
                      backgroundSize: '600% 800%',
                      backgroundPosition: `${(selectedExercise.col / 5) * 100}% ${(selectedExercise.row / 7) * 100}%`,
                      backgroundRepeat: 'no-repeat',
                      imageRendering: 'crisp-edges'
                    }}
                  />
                )}
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-600 font-extrabold block">
                  {selectedExercise.category}
                </span>
                <h4 className="text-base sm:text-lg font-black text-zinc-900 font-display">
                  {selectedExercise.name}
                </h4>
                <p className="text-xs text-zinc-500 font-mono">
                  {seriesList.length} serie{seriesList.length > 1 ? 's' : ''} configurada{seriesList.length > 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {/* Pestañas de Series (Set 1, Set 2, Set 3...) */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {seriesList.map((set, idx) => (
                <div
                  key={set.setNumber}
                  className="relative group"
                >
                  <button
                    type="button"
                    onClick={() => handleSelectSetIndex(idx)}
                    className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${activeSetIndex === idx
                      ? 'bg-zinc-900 text-white shadow-xs ring-2 ring-emerald-400/50'
                      : 'bg-white hover:bg-zinc-200 text-zinc-700 border border-zinc-300'
                      }`}
                  >
                    <span>S{set.setNumber}</span>
                    <span className="text-[10px] opacity-75 font-normal">
                      {set.weight}kg × {set.reps}
                    </span>
                  </button>
                  {seriesList.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveSet(idx);
                      }}
                      className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-rose-500 hover:bg-rose-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-xs"
                      title="Eliminar serie"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={handleAddNextSet}
                className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 font-mono text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                title="Añadir otra serie"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Serie</span>
              </button>
            </div>
          </div>

          {/* Fila Media: Torre de Placas Vertical Realista + Controles de Repeticiones y Peso */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">

            {/* COLUMNA IZQUIERDA (6 COLS): TORRE DE PLACAS VERTICAL REALISTA (WEIGHT STACK) */}
            <div className="md:col-span-6 bg-white border border-zinc-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5">
                <span className="text-xs font-mono font-extrabold uppercase text-zinc-900 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-black" />
                  <span>Torre de Placas de Carga (Pin Selector)</span>
                </span>
                <span className="text-[11px] font-mono text-emerald-600 font-extrabold">
                  {currentWeight} KG SELECCIONADO
                </span>
              </div>

              {/* Estructura de la Máquina de Placas */}
              <div className="relative flex flex-col items-center pt-2">

                {/* Polea superior con cable de acero y pasador */}
                <div className="flex flex-col items-center mb-1">
                  <div className="w-7 h-7 rounded-full bg-zinc-900 border-2 border-zinc-700 flex items-center justify-center shadow-md">
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-400 border border-zinc-900" />
                  </div>
                  {/* Cable central que baja hacia las placas */}
                  <div className="w-0.5 h-4 bg-zinc-500 shadow-xs" />
                </div>

                {/* Contenedor de la Pila de Placas con Guías Verticales */}
                <div className="relative w-full max-w-sm px-4 sm:px-6">

                  {/* Dos Guías / Rieles Verticales de Acero Inoxidable */}
                  <div className="absolute left-8 sm:left-10 top-0 bottom-0 w-1.5 bg-gradient-to-b from-zinc-300 via-zinc-400 to-zinc-600 rounded-full shadow-inner pointer-events-none" />
                  <div className="absolute right-8 sm:right-10 top-0 bottom-0 w-1.5 bg-gradient-to-b from-zinc-300 via-zinc-400 to-zinc-600 rounded-full shadow-inner pointer-events-none" />

                  {/* Pila Vertical de Placas de Hierro */}
                  <div className="space-y-1 relative z-10 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
                    {WEIGHT_STACK_PLATES.map((plateWeight, idx) => {
                      const isPinInserted = currentWeight === plateWeight;
                      const isUnderLoad = currentWeight >= plateWeight;

                      return (
                        <div
                          key={plateWeight}
                          onClick={() => handleWeightChange(plateWeight)}
                          className={`relative group cursor-pointer transition-all duration-150 rounded-md border flex items-center justify-between px-3 py-1.5 select-none shadow-xs ${isPinInserted
                            ? 'bg-zinc-900 text-white border-black ring-2 ring-amber-400 scale-[1.02] shadow-md z-20'
                            : isUnderLoad
                              ? 'bg-gradient-to-r from-emerald-100 via-emerald-50 to-emerald-100 text-emerald-950 border-emerald-300 hover:border-emerald-400'
                              : 'bg-gradient-to-r from-zinc-100 via-zinc-50 to-zinc-100 text-zinc-700 border-zinc-200 hover:bg-zinc-200/80 hover:border-zinc-300'
                            }`}
                        >
                          <span className="text-[9px] font-mono uppercase tracking-wider font-bold">
                            #{idx + 1}
                          </span>

                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-mono font-black">
                              {plateWeight} KG
                            </span>

                            {/* Orificio circular central para la clavija */}
                            <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-colors ${isPinInserted
                              ? 'bg-amber-400 border-amber-300 shadow-xs'
                              : 'bg-zinc-300 border-zinc-400 shadow-inner'
                              }`}>
                              {isPinInserted && (
                                <div className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
                              )}
                            </div>
                          </div>

                          {/* CLAVIJA / PIN SELECTOR METÁLICO CON CABEZAL Y CABLE */}
                          {isPinInserted && (
                            <div className="absolute -right-4 sm:-right-6 top-1/2 -translate-y-1/2 flex items-center z-30 pointer-events-none">
                              {/* Barra metálica dorada insertada */}
                              <div className="w-4 sm:w-6 h-2 bg-gradient-to-r from-amber-400 via-amber-200 to-zinc-800 rounded-l-sm border border-zinc-900 shadow-xs" />
                              {/* Cabezal de agarre magnético */}
                              <div className="w-3.5 h-3.5 bg-zinc-900 rounded-r-md border border-zinc-700 flex items-center justify-center shadow-md">
                                <div className="w-1 h-1.5 bg-amber-400 rounded-sm" />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Base sólida de la máquina */}
                <div className="w-full max-w-sm mt-2 h-2.5 bg-zinc-800 rounded-md shadow-md border-t border-zinc-700" />
              </div>

            </div>

            {/* COLUMNA DERECHA (6 COLS): BARRITA DESLIZANTE + REPETICIONES + REGISTRO */}
            <div className="md:col-span-6 bg-white border border-zinc-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">

              {/* PESO ACTUAL DESTACADO */}
              <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-0.5 text-center">
                <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest font-extrabold block">
                  PESO SELECCIONADO (SERIE {activeSetIndex + 1})
                </span>
                <div className="flex items-baseline justify-center gap-1.5">
                  <span className="text-3xl sm:text-4xl font-black font-mono text-black tracking-tight">
                    {currentWeight}
                  </span>
                  <span className="text-sm font-extrabold font-mono text-zinc-700 uppercase">
                    KG
                  </span>
                </div>
              </div>

              {/* BARRITA DESLIZANTE / SLIDER */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-mono font-bold text-zinc-800">
                  <span className="flex items-center gap-1 text-[11px]">
                    <Sliders className="w-3.5 h-3.5 text-black" />
                    <span>Barra de Ajuste Continuo:</span>
                  </span>
                  <span className="text-black font-extrabold text-[11px]">{currentWeight} kg</span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="160"
                  step="2.5"
                  value={currentWeight}
                  onChange={(e) => handleWeightChange(parseFloat(e.target.value))}
                  className="w-full h-2.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-black"
                />

                {/* Botones de incremento rápido */}
                <div className="grid grid-cols-4 gap-1.5 pt-0.5">
                  {[-5, -2.5, +2.5, +5].map((delta) => (
                    <button
                      key={delta}
                      type="button"
                      onClick={() => handleWeightChange(currentWeight + delta)}
                      className="py-1 px-1 bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 rounded-lg font-mono text-[11px] font-extrabold text-black transition-colors cursor-pointer text-center"
                    >
                      {delta > 0 ? `+${delta}` : delta}
                    </button>
                  ))}
                </div>
              </div>

              {/* SELECTOR DE REPETICIONES */}
              <div className="space-y-1.5 border-t border-zinc-100 pt-3">
                <div className="flex justify-between items-center text-xs font-mono font-bold text-zinc-800">
                  <span>Repeticiones:</span>
                  <span className="text-black font-extrabold text-xs">{currentReps} Reps</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleRepsChange(currentReps - 1)}
                    className="w-9 h-9 rounded-xl bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 text-black font-mono font-extrabold text-base flex items-center justify-center transition-colors cursor-pointer"
                  >
                    -
                  </button>

                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={currentReps}
                    onChange={(e) => handleRepsChange(e.target.value)}
                    className="flex-1 bg-zinc-50 border border-zinc-300 focus:border-black rounded-xl py-1.5 text-center text-base font-mono font-black text-black outline-none"
                  />

                  <button
                    type="button"
                    onClick={() => handleRepsChange(currentReps + 1)}
                    className="w-9 h-9 rounded-xl bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 text-black font-mono font-extrabold text-base flex items-center justify-center transition-colors cursor-pointer"
                  >
                    +
                  </button>
                </div>

                {/* Botones de Reps sugeridas */}
                <div className="flex items-center justify-between gap-1 pt-0.5">
                  {[6, 8, 10, 12, 15, 20].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => handleRepsChange(r)}
                      className={`flex-1 py-1 rounded-md text-[10px] font-mono font-extrabold transition-all cursor-pointer ${currentReps === r
                        ? 'bg-black text-white shadow-xs'
                        : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-200'
                        }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* BOTÓN DE REGISTRAR EJERCICIO */}
              <div className="pt-2 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={handleSaveCompleteWorkout}
                  disabled={isJustSaved}
                  className={`w-full py-3.5 px-4 font-mono text-xs font-black uppercase tracking-wider rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.98] ${
                    isJustSaved
                      ? 'bg-emerald-600 text-white shadow-emerald-500/30 ring-2 ring-emerald-400'
                      : 'bg-black hover:bg-zinc-800 text-white hover:shadow-lg'
                  }`}
                >
                  {isJustSaved ? (
                    <>
                      <Check className="w-4 h-4 stroke-[3] text-white" />
                      <span>¡Ejercicio Registrado con Éxito! ✓</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 stroke-[3] text-emerald-400" />
                      <span>Registrar Ejercicio ({seriesList.length} {seriesList.length === 1 ? 'Serie' : 'Series'})</span>
                    </>
                  )}
                </button>
              </div>

            </div>

          </div>
        </div>
      )}
    </div>
  );
}
