import React, { useState, useRef, useEffect, useMemo } from 'react';
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
  Activity
} from 'lucide-react';
import spriteSheetImg from '../assets/gym-exercises-spritesheet.png';

// Colección completa de 48 Ejercicios e Ilustraciones Isométricas HD (8 Filas x 6 Columnas)
export const GYM_EXERCISES_SPRITES = [
  // --- HOJA 1 (Filas 0 a 3) ---
  // Fila 0
  { id: 'press_banca_plano', name: 'Press Banca Plano', category: 'Pecho', row: 0, col: 0, defaultWeight: 60, defaultReps: 10 },
  { id: 'jalon_pecho', name: 'Jalón al Pecho Polea', category: 'Espalda', row: 0, col: 1, defaultWeight: 50, defaultReps: 12 },
  { id: 'prensa_piernas', name: 'Prensa de Piernas', category: 'Piernas', row: 0, col: 2, defaultWeight: 120, defaultReps: 10 },
  { id: 'sentadilla_rack', name: 'Sentadilla en Rack', category: 'Piernas', row: 0, col: 3, defaultWeight: 70, defaultReps: 8 },
  { id: 'rack_mancuernas', name: 'Rack con Mancuernas', category: 'Brazos', row: 0, col: 4, defaultWeight: 14, defaultReps: 12 },
  { id: 'peso_muerto', name: 'Peso Muerto Barra', category: 'Espalda', row: 0, col: 5, defaultWeight: 80, defaultReps: 6 },
  
  // Fila 1
  { id: 'press_militar_maquina', name: 'Press Militar Hombros', category: 'Hombros', row: 1, col: 0, defaultWeight: 40, defaultReps: 10 },
  { id: 'extension_cuadriceps', name: 'Extensión Cuádriceps', category: 'Piernas', row: 1, col: 1, defaultWeight: 45, defaultReps: 12 },
  { id: 'curl_femoral_tumbado', name: 'Curl Femoral Tumbado', category: 'Piernas', row: 1, col: 2, defaultWeight: 40, defaultReps: 12 },
  { id: 'remo_barra_t', name: 'Remo Barra T / Apoyo', category: 'Espalda', row: 1, col: 3, defaultWeight: 50, defaultReps: 10 },
  { id: 'peck_deck_mariposa', name: 'Peck Deck (Mariposa)', category: 'Pecho', row: 1, col: 4, defaultWeight: 45, defaultReps: 12 },
  { id: 'curl_biceps_maquina', name: 'Curl Bíceps Máquina', category: 'Brazos', row: 1, col: 5, defaultWeight: 35, defaultReps: 10 },

  // Fila 2
  { id: 'cinta_correr', name: 'Cinta de Correr', category: 'Cardio', row: 2, col: 0, defaultWeight: 0, defaultReps: 20 },
  { id: 'eliptica', name: 'Elíptica', category: 'Cardio', row: 2, col: 1, defaultWeight: 0, defaultReps: 20 },
  { id: 'bici_estatica', name: 'Bicicleta Estática', category: 'Cardio', row: 2, col: 2, defaultWeight: 0, defaultReps: 20 },
  { id: 'dominadas_barra', name: 'Dominadas en Barra', category: 'Espalda', row: 2, col: 3, defaultWeight: 0, defaultReps: 8 },
  { id: 'kettlebells_swing', name: 'Kettlebell / Rusas', category: 'Fullbody', row: 2, col: 4, defaultWeight: 16, defaultReps: 15 },
  { id: 'abdominales_declinado', name: 'Abdominales Declinado', category: 'Core', row: 2, col: 5, defaultWeight: 0, defaultReps: 20 },

  // Fila 3
  { id: 'triceps_polea_cuerda', name: 'Tríceps Polea Cuerda', category: 'Brazos', row: 3, col: 0, defaultWeight: 25, defaultReps: 12 },
  { id: 'curl_barra_pie', name: 'Curl Bíceps Barra Pie', category: 'Brazos', row: 3, col: 1, defaultWeight: 30, defaultReps: 10 },
  { id: 'elevacion_gemelos', name: 'Gemelos en Máquina', category: 'Piernas', row: 3, col: 2, defaultWeight: 60, defaultReps: 15 },
  { id: 'press_inclinado_barra', name: 'Press Inclinado Barra', category: 'Pecho', row: 3, col: 3, defaultWeight: 50, defaultReps: 10 },
  { id: 'remo_polea_baja', name: 'Remo Polea Baja', category: 'Espalda', row: 3, col: 4, defaultWeight: 55, defaultReps: 10 },
  { id: 'balon_medicinal', name: 'Balón Medicinal Slam', category: 'Core', row: 3, col: 5, defaultWeight: 9, defaultReps: 15 },

  // --- HOJA 2 (Filas 4 a 7) ---
  // Fila 4
  { id: 'dominadas_asistidas', name: 'Dominadas Asistidas', category: 'Espalda', row: 4, col: 0, defaultWeight: 40, defaultReps: 10 },
  { id: 'remo_sentado_polea', name: 'Remo Sentado Polea', category: 'Espalda', row: 4, col: 1, defaultWeight: 45, defaultReps: 12 },
  { id: 'peck_deck_aperturas_2', name: 'Aperturas Peck Deck', category: 'Pecho', row: 4, col: 2, defaultWeight: 40, defaultReps: 12 },
  { id: 'prensa_sentado_cuadriceps', name: 'Prensa Sentado Cuádriceps', category: 'Piernas', row: 4, col: 3, defaultWeight: 80, defaultReps: 10 },
  { id: 'sentadillas_frontales_rack', name: 'Sentadillas Frontales', category: 'Piernas', row: 4, col: 4, defaultWeight: 60, defaultReps: 10 },
  { id: 'press_plano_mancuernas', name: 'Press Plano Mancuernas', category: 'Pecho', row: 4, col: 5, defaultWeight: 24, defaultReps: 10 },

  // Fila 5
  { id: 'stairmaster_escalera', name: 'Escalera Sinfín', category: 'Cardio', row: 5, col: 0, defaultWeight: 0, defaultReps: 15 },
  { id: 'ergometro_remo_indoor', name: 'Ergómetro / Remo Indoor', category: 'Cardio', row: 5, col: 1, defaultWeight: 0, defaultReps: 15 },
  { id: 'press_banca_declinado', name: 'Press Declinado Barra', category: 'Pecho', row: 5, col: 2, defaultWeight: 55, defaultReps: 10 },
  { id: 'zancadas_estocadas', name: 'Zancadas con Mancuernas', category: 'Piernas', row: 5, col: 3, defaultWeight: 16, defaultReps: 12 },
  { id: 'elevaciones_laterales', name: 'Elevaciones Laterales', category: 'Hombros', row: 5, col: 4, defaultWeight: 10, defaultReps: 15 },
  { id: 'extension_piernas_sentado', name: 'Extensión Piernas Sentado', category: 'Piernas', row: 5, col: 5, defaultWeight: 40, defaultReps: 12 },

  // Fila 6
  { id: 'salto_comba_soga', name: 'Salto a la Comba / Soga', category: 'Cardio', row: 6, col: 0, defaultWeight: 0, defaultReps: 10 },
  { id: 'dominadas_pronas_barra', name: 'Dominadas Pronas Barra', category: 'Espalda', row: 6, col: 1, defaultWeight: 0, defaultReps: 8 },
  { id: 'flexiones_suelo_pushups', name: 'Flexiones de Brazos / Pushups', category: 'Pecho', row: 6, col: 2, defaultWeight: 0, defaultReps: 15 },
  { id: 'trx_suspension', name: 'TRX / Suspensión', category: 'Fullbody', row: 6, col: 3, defaultWeight: 0, defaultReps: 12 },
  { id: 'press_militar_fitball', name: 'Press Militar en Fitball', category: 'Hombros', row: 6, col: 4, defaultWeight: 14, defaultReps: 12 },
  { id: 'rack_discos_olimpicos', name: 'Power Rack & Discos', category: 'Fullbody', row: 6, col: 5, defaultWeight: 80, defaultReps: 5 },

  // Fila 7
  { id: 'remo_polea_estrecho', name: 'Remo Polea Agarre Estrecho', category: 'Espalda', row: 7, col: 0, defaultWeight: 50, defaultReps: 10 },
  { id: 'triceps_polea_barra', name: 'Tríceps Polea Barra', category: 'Brazos', row: 7, col: 1, defaultWeight: 25, defaultReps: 12 },
  { id: 'crunch_abdominal_maquina', name: 'Crunch Abdominal Máquina', category: 'Core', row: 7, col: 2, defaultWeight: 35, defaultReps: 15 },
  { id: 'press_inclinado_mancuernas', name: 'Press Inclinado Mancuernas', category: 'Pecho', row: 7, col: 3, defaultWeight: 22, defaultReps: 10 },
  { id: 'bandas_elasticas', name: 'Bandas de Resistencia', category: 'Fullbody', row: 7, col: 4, defaultWeight: 0, defaultReps: 15 },
  { id: 'foam_roller_estiramientos', name: 'Foam Roller & Estiramientos', category: 'Core', row: 7, col: 5, defaultWeight: 0, defaultReps: 10 }
];

// Placas de peso de la torre de placas (Weight Stack)
const WEIGHT_STACK_PLATES = [
  5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 110, 120
];

const CATEGORIES = ['Todos', 'Pecho', 'Espalda', 'Piernas', 'Brazos', 'Hombros', 'Cardio', 'Core', 'Fullbody'];

export default function VisualGymExercisePicker({
  onAddWorkout,
  onClose
}) {
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedExercise, setSelectedExercise] = useState(GYM_EXERCISES_SPRITES[0]);
  const [activeSetIndex, setActiveSetIndex] = useState(0);
  const [currentWeight, setCurrentWeight] = useState(GYM_EXERCISES_SPRITES[0].defaultWeight);
  const [currentReps, setCurrentReps] = useState(GYM_EXERCISES_SPRITES[0].defaultReps);
  
  // Lista de series configuradas
  const [seriesList, setSeriesList] = useState([
    { setNumber: 1, weight: GYM_EXERCISES_SPRITES[0].defaultWeight, reps: GYM_EXERCISES_SPRITES[0].defaultReps }
  ]);

  const carouselRef = useRef(null);
  const activePlateRef = useRef(null);

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
      const scrollAmount = direction === 'left' ? -280 : 280;
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

    onAddWorkout({
      name: selectedExercise.name,
      sets: seriesList.length,
      reps: firstReps,
      weight: maxWeight,
      detailedSets: detailedSets.length > 1 ? detailedSets : null
    });

    if (onClose) onClose();
  };

  // Calcular placa activa más cercana para el visual de la torre
  const activePlateIndex = useMemo(() => {
    let closestIdx = 0;
    let minDiff = Infinity;
    WEIGHT_STACK_PLATES.forEach((plate, idx) => {
      const diff = Math.abs(plate - currentWeight);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = idx;
      }
    });
    return closestIdx;
  }, [currentWeight]);

  return (
    <div className="w-full bg-white border border-zinc-300 rounded-3xl p-4 sm:p-7 shadow-lg space-y-6 text-zinc-950 select-none">
      
      {/* 1. CABECERA PRINCIPAL */}
      <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono font-black uppercase tracking-wider text-black">
            <Sparkles className="w-4 h-4 text-black" />
            <span>// SELECTOR VISUAL DE EJERCICIOS & MÁQUINAS</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black font-display tracking-tight text-black uppercase">
            Elige tu ejercicio y ajusta las placas
          </h3>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-zinc-600 hover:text-black hover:bg-zinc-100 rounded-xl transition-colors cursor-pointer"
            title="Cerrar selector visual"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        )}
      </div>

      {/* 2. FILTROS DE CATEGORÍA */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const isCatActive = selectedCategory === cat;
          const count = cat === 'Todos' ? GYM_EXERCISES_SPRITES.length : GYM_EXERCISES_SPRITES.filter(e => e.category === cat).length;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-mono font-extrabold transition-all cursor-pointer flex-shrink-0 flex items-center gap-1 ${
                isCatActive
                  ? 'bg-black text-white shadow-sm'
                  : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-200'
              }`}
            >
              <span>{cat}</span>
              <span className={`text-[10px] ${isCatActive ? 'text-zinc-300' : 'text-zinc-500'}`}>({count})</span>
            </button>
          );
        })}
      </div>

      {/* 3. CARRUSEL / RULETA HORIZONTAL GRANDE & NÍTIDA */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-extrabold uppercase tracking-wider text-zinc-900 flex items-center gap-1.5">
            <Dumbbell className="w-4 h-4 text-black" />
            <span>Colección de Ejercicios ({filteredExercises.length} disponibles)</span>
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => scrollCarousel('left')}
              className="p-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 text-black transition-colors cursor-pointer shadow-sm active:scale-95"
              title="Desplazar a la izquierda"
            >
              <ChevronLeft className="w-4 h-4 stroke-[3]" />
            </button>
            <button
              type="button"
              onClick={() => scrollCarousel('right')}
              className="p-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 text-black transition-colors cursor-pointer shadow-sm active:scale-95"
              title="Desplazar a la derecha"
            >
              <ChevronRight className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        </div>

        {/* Carrusel Deslizable con Tarjetas Grandes y Nítidas */}
        <div
          ref={carouselRef}
          className="flex items-stretch gap-3.5 overflow-x-auto pb-4 pt-1 scroll-smooth snap-x snap-mandatory"
          style={{ scrollbarWidth: 'thin' }}
        >
          {filteredExercises.map((ex) => {
            const isSelected = selectedExercise?.id === ex.id;
            const posX = (ex.col / 5) * 100;
            const posY = (ex.row / 7) * 100;

            return (
              <button
                key={ex.id}
                type="button"
                onClick={() => handleSelectExercise(ex)}
                className={`flex-shrink-0 w-36 sm:w-44 snap-center p-3 rounded-2xl border transition-all flex flex-col items-center justify-between text-center cursor-pointer group select-none ${
                  isSelected
                    ? 'bg-zinc-950 text-white border-black shadow-xl ring-2 ring-black scale-[1.03]'
                    : 'bg-zinc-50 hover:bg-white border-zinc-200 text-zinc-900 hover:border-zinc-400 hover:shadow-md'
                }`}
              >
                {/* Contenedor del Sprite Isométrico Ampliado & Nítido */}
                <div className={`w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden flex items-center justify-center p-2 relative transition-all ${
                  isSelected ? 'bg-zinc-900 shadow-inner' : 'bg-white group-hover:bg-zinc-100 border border-zinc-100'
                }`}>
                  <div
                    className="w-full h-full transform group-hover:scale-110 transition-transform duration-300"
                    style={{
                      backgroundImage: `url(${spriteSheetImg})`,
                      backgroundSize: '600% 800%',
                      backgroundPosition: `${posX}% ${posY}%`,
                      backgroundRepeat: 'no-repeat',
                      imageRendering: 'crisp-edges'
                    }}
                  />
                  {isSelected && (
                    <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-yellow-400 shadow-md ring-2 ring-black animate-pulse" />
                  )}
                </div>

                <div className="mt-2.5 w-full space-y-1">
                  <span className={`text-[10px] font-mono uppercase tracking-wider block font-extrabold truncate ${
                    isSelected ? 'text-zinc-400' : 'text-zinc-500'
                  }`}>
                    {ex.category}
                  </span>
                  <h4 className={`text-xs sm:text-sm font-black font-display tracking-tight leading-snug line-clamp-2 ${
                    isSelected ? 'text-white' : 'text-black'
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
            
            {/* Ejercicio Activo con Miniatura Nítida */}
            <div className="flex items-center gap-3.5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white border border-zinc-300 p-1.5 flex items-center justify-center shadow-sm flex-shrink-0">
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
              </div>

              <div>
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block font-extrabold">
                  // EJERCICIO SELECCIONADO
                </span>
                <h4 className="text-lg sm:text-2xl font-black text-black uppercase tracking-tight font-display">
                  {selectedExercise.name}
                </h4>
                <span className="text-xs font-mono font-bold text-zinc-600 uppercase">
                  Categoría: {selectedExercise.category}
                </span>
              </div>
            </div>

            {/* Pestañas de Series */}
            <div className="flex flex-wrap items-center gap-1.5">
              {seriesList.map((s, idx) => {
                const isActive = activeSetIndex === idx;
                return (
                  <div key={idx} className="relative group">
                    <button
                      type="button"
                      onClick={() => handleSelectSetIndex(idx)}
                      className={`px-3.5 py-1.5 rounded-xl font-mono text-xs font-extrabold uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
                        isActive
                          ? 'bg-black text-white shadow-md'
                          : 'bg-white text-zinc-800 hover:text-black border border-zinc-300 hover:border-zinc-400'
                      }`}
                    >
                      <span>Serie {s.setNumber}</span>
                      <span className={`text-[10px] font-bold ${isActive ? 'text-zinc-300' : 'text-zinc-600'}`}>
                        ({s.weight}kg × {s.reps})
                      </span>
                    </button>

                    {seriesList.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveSet(idx);
                        }}
                        className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-zinc-300 hover:bg-rose-600 text-black hover:text-white flex items-center justify-center text-[9px] font-bold shadow-sm transition-colors cursor-pointer"
                        title="Eliminar serie"
                      >
                        ×
                      </button>
                    )}
                  </div>
                );
              })}

              {/* Botón + Añadir Serie */}
              <button
                type="button"
                onClick={handleAddNextSet}
                className="px-3 py-1.5 rounded-xl bg-zinc-200 hover:bg-zinc-300 text-black font-mono text-xs font-black uppercase transition-all cursor-pointer flex items-center gap-1 shadow-sm active:scale-95"
                title="Agregar otra serie"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>+ Serie</span>
              </button>
            </div>
          </div>

          {/* CUADRÍCULA: TORRE DE PLACAS + BARRITA DESLIZANTE & REPETICIONES */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">

            {/* COLUMNA IZQUIERDA (6 COLS): TORRE DE PLACAS CON PALITO */}
            <div className="md:col-span-6 bg-white border border-zinc-200 rounded-2xl p-4 shadow-sm space-y-3">
              
              <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                <span className="text-xs font-mono font-extrabold uppercase text-zinc-900 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-black" />
                  <span>Torre de Placas & Clavija Metálica</span>
                </span>
                <span className="text-[10px] font-mono font-bold text-zinc-600 bg-zinc-100 px-2.5 py-0.5 rounded-lg border border-zinc-200">
                  Serie {activeSetIndex + 1} de {seriesList.length}
                </span>
              </div>

              {/* MÁQUINA DE PLACAS */}
              <div className="relative bg-zinc-100 border border-zinc-300 rounded-xl p-3 flex flex-col items-center">
                
                {/* Polea y Cable Superior */}
                <div className="w-full flex flex-col items-center mb-1">
                  <div className="w-6 h-6 rounded-full border-2 border-zinc-800 bg-zinc-300 flex items-center justify-center shadow-inner relative">
                    <div className="w-2 h-2 rounded-full bg-zinc-900" />
                  </div>
                  <div className="w-0.5 h-4 bg-zinc-800" />
                </div>

                {/* Guías de Acero Laterales */}
                <div className="relative w-full max-w-xs flex items-center justify-between px-2">
                  <div className="absolute left-4 top-0 bottom-0 w-1 bg-gradient-to-r from-zinc-400 via-zinc-200 to-zinc-500 rounded-full shadow-sm" />
                  <div className="absolute right-4 top-0 bottom-0 w-1 bg-gradient-to-r from-zinc-400 via-zinc-200 to-zinc-500 rounded-full shadow-sm" />

                  {/* APILADO VERTICAL DE TABLITAS DE PESO */}
                  <div className="w-full space-y-1 py-1 z-10 max-h-60 overflow-y-auto pr-1 pl-1 scrollbar-thin">
                    {WEIGHT_STACK_PLATES.map((plateWeight, idx) => {
                      const isPinInserted = idx === activePlateIndex;
                      const isLifted = idx <= activePlateIndex;

                      return (
                        <div
                          key={plateWeight}
                          ref={isPinInserted ? activePlateRef : null}
                          onClick={() => handleWeightChange(plateWeight)}
                          className={`w-full py-1.5 px-3 rounded-lg border flex items-center justify-between cursor-pointer transition-all duration-150 relative ${
                            isPinInserted
                              ? 'bg-black text-white border-black shadow-md font-black scale-[1.01]'
                              : isLifted
                                ? 'bg-zinc-800 text-zinc-100 border-zinc-700 font-bold'
                                : 'bg-white hover:bg-zinc-200 text-zinc-900 border-zinc-300'
                          }`}
                        >
                          <span className="text-[10px] font-mono uppercase tracking-wider font-bold">
                            #{idx + 1}
                          </span>

                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-black">
                              {plateWeight} KG
                            </span>

                            {/* Orificio para el palito */}
                            <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                              isPinInserted
                                ? 'bg-amber-400 border-amber-300 shadow-sm'
                                : 'bg-zinc-300 border-zinc-400 shadow-inner'
                            }`}>
                              {isPinInserted && (
                                <div className="w-1.5 h-1.5 rounded-full bg-black" />
                              )}
                            </div>
                          </div>

                          {/* PALITO / CLAVIJA SELECTOR METÁLICO */}
                          {isPinInserted && (
                            <div className="absolute -right-5 sm:-right-7 top-1/2 -translate-y-1/2 flex items-center z-20 animate-fade-in">
                              <div className="w-5 sm:w-7 h-2 bg-gradient-to-r from-amber-400 via-amber-200 to-zinc-800 rounded-l-sm border border-zinc-900 shadow-sm" />
                              <div className="w-3.5 h-3.5 bg-zinc-900 rounded-r-sm border border-zinc-700 flex items-center justify-center shadow-md">
                                <div className="w-1.5 h-2 bg-amber-400 rounded-sm" />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Base de la máquina */}
                <div className="w-full max-w-xs mt-2 h-2.5 bg-zinc-800 rounded shadow-md border-t border-zinc-700" />
              </div>

            </div>

            {/* COLUMNA DERECHA (6 COLS): BARRITA DESLIZANTE + REPETICIONES + REGISTRO */}
            <div className="md:col-span-6 bg-white border border-zinc-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
              
              {/* PESO ACTUAL DESTACADO */}
              <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-xl space-y-0.5 text-center">
                <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest font-extrabold block">
                  PESO SELECCIONADO (SERIE {activeSetIndex + 1})
                </span>
                <div className="flex items-baseline justify-center gap-1.5">
                  <span className="text-4xl sm:text-5xl font-black font-mono text-black tracking-tight">
                    {currentWeight}
                  </span>
                  <span className="text-base font-extrabold font-mono text-zinc-700 uppercase">
                    KG
                  </span>
                </div>
              </div>

              {/* BARRITA DESLIZANTE / SLIDER */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-mono font-bold text-zinc-800">
                  <span className="flex items-center gap-1 text-[11px]">
                    <Sliders className="w-3.5 h-3.5 text-black" />
                    <span>Barra de Ajuste de Placas:</span>
                  </span>
                  <span className="text-black font-extrabold text-xs">{currentWeight} kg</span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="160"
                  step="2.5"
                  value={currentWeight}
                  onChange={(e) => handleWeightChange(parseFloat(e.target.value))}
                  className="w-full h-3 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-black"
                />

                {/* Botones de incremento rápido */}
                <div className="grid grid-cols-4 gap-1.5 pt-0.5">
                  {[-5, -2.5, +2.5, +5].map((delta) => (
                    <button
                      key={delta}
                      type="button"
                      onClick={() => handleWeightChange(currentWeight + delta)}
                      className="py-1.5 px-1 bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 rounded-lg font-mono text-xs font-extrabold text-black transition-colors cursor-pointer text-center active:scale-95"
                    >
                      {delta > 0 ? `+${delta}` : delta}
                    </button>
                  ))}
                </div>
              </div>

              {/* SELECTOR DE REPETICIONES */}
              <div className="space-y-2 border-t border-zinc-100 pt-3.5">
                <div className="flex justify-between items-center text-xs font-mono font-bold text-zinc-800">
                  <span>Repeticiones:</span>
                  <span className="text-black font-extrabold text-xs">{currentReps} Reps</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleRepsChange(currentReps - 1)}
                    className="w-10 h-10 rounded-xl bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 text-black font-mono font-black text-lg flex items-center justify-center transition-colors cursor-pointer active:scale-95"
                  >
                    -
                  </button>

                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={currentReps}
                    onChange={(e) => handleRepsChange(e.target.value)}
                    className="flex-1 bg-zinc-50 border border-zinc-300 focus:border-black rounded-xl py-2 text-center text-lg font-mono font-black text-black outline-none"
                  />

                  <button
                    type="button"
                    onClick={() => handleRepsChange(currentReps + 1)}
                    className="w-10 h-10 rounded-xl bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 text-black font-mono font-black text-lg flex items-center justify-center transition-colors cursor-pointer active:scale-95"
                  >
                    +
                  </button>
                </div>

                {/* Botones de Reps sugeridas */}
                <div className="flex items-center justify-between gap-1.5 pt-0.5">
                  {[6, 8, 10, 12, 15, 20].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => handleRepsChange(r)}
                      className={`flex-1 py-1.5 rounded-lg text-[11px] font-mono font-extrabold transition-all cursor-pointer ${
                        currentReps === r
                          ? 'bg-black text-white shadow-sm'
                          : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-200'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* BOTONES DE ACCIÓN: GUARDAR / REGISTRAR */}
              <div className="pt-2.5 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={handleSaveCompleteWorkout}
                  className="w-full py-3.5 px-4 bg-black hover:bg-zinc-800 text-white font-mono text-xs sm:text-sm font-black uppercase tracking-wider rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.99]"
                >
                  <Check className="w-5 h-5 stroke-[3]" />
                  <span>Registrar Ejercicio ({seriesList.length} {seriesList.length === 1 ? 'Serie' : 'Series'})</span>
                </button>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
