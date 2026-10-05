// Servicio para consultar y cachear ejercicios de ExerciseDB OSS
// https://oss.exercisedb.dev/api/v1/exercises

const API_BASE_URL = 'https://oss.exercisedb.dev/api/v1';

// Mapeo amigable de partes del cuerpo a español
export const BODY_PARTS_ES = [
  { id: 'all', label: 'Todos', apiName: null },
  { id: 'chest', label: 'Pecho', apiName: 'chest' },
  { id: 'back', label: 'Espalda', apiName: 'back' },
  { id: 'upper legs', label: 'Piernas', apiName: 'upper legs' },
  { id: 'upper arms', label: 'Brazos', apiName: 'upper arms' },
  { id: 'shoulders', label: 'Hombros', apiName: 'shoulders' },
  { id: 'waist', label: 'Core / Abdomen', apiName: 'waist' },
  { id: 'cardio', label: 'Cardio', apiName: 'cardio' },
];

// Colección curada de respaldo instantáneo con GIFs directos
export const CURATED_FALLBACK_EXERCISES = [
  {
    exerciseId: '0CXGHya',
    name: 'Cable Crossover (Cruces en Polea)',
    gifUrl: 'https://static.exercisedb.dev/media/0CXGHya.gif',
    bodyParts: ['chest'],
    equipments: ['cable'],
    targetMuscles: ['pectorals'],
    secondaryMuscles: ['deltoids', 'biceps'],
    instructions: [
      'Colócate en el centro de la máquina de poleas altas con un agarre en cada mano.',
      'Da un paso hacia adelante con una pierna para mantener la estabilidad.',
      'Con una leve flexión en los codos, junta las manos frente al pecho describiendo un arco amplio.',
      'Aprieta los pectorales al final del movimiento y regresa lentamente a la posición inicial.'
    ]
  },
  {
    exerciseId: '0dCyly0',
    name: 'Barbell Bradford Press (Press Militar Barra)',
    gifUrl: 'https://static.exercisedb.dev/media/0dCyly0.gif',
    bodyParts: ['shoulders'],
    equipments: ['barbell'],
    targetMuscles: ['deltoids'],
    secondaryMuscles: ['triceps'],
    instructions: [
      'Sujeta la barra a la altura de los hombros con agarre prono.',
      'Empuja la barra sobre la cabeza y pásala justo por detrás de la nuca sin extender los codos por completo.',
      'Vuelve a pasar la barra al frente de forma controlada repitiendo el ciclo.'
    ]
  },
  {
    exerciseId: '0IgNjSM',
    name: 'Dumbbell Reverse Curl (Curl Invertido Mancuernas)',
    gifUrl: 'https://static.exercisedb.dev/media/0IgNjSM.gif',
    bodyParts: ['upper arms'],
    equipments: ['dumbbell'],
    targetMuscles: ['biceps'],
    secondaryMuscles: ['forearms'],
    instructions: [
      'De pie con una mancuerna en cada mano usando agarre en pronación (palmas hacia abajo).',
      'Flexiona los codos levantando las mancuernas hacia los hombros sin mover los codos del torso.',
      'Baja lentamente resistiendo la carga.'
    ]
  },
  {
    exerciseId: '01qpYSe',
    name: 'Upward Facing Dog (Extensión Espalda)',
    gifUrl: 'https://static.exercisedb.dev/media/01qpYSe.gif',
    bodyParts: ['back'],
    equipments: ['bodyweight'],
    targetMuscles: ['erector spinae'],
    secondaryMuscles: ['deltoids', 'pectorals'],
    instructions: [
      'Túmbate boca abajo con las palmas apoyadas al lado del pecho.',
      'Extiende los brazos elevando el torso y la pelvis del suelo.',
      'Mantén los hombros relajados y la mirada al frente.'
    ]
  },
  {
    exerciseId: '03lzqwk',
    name: 'Assisted Hanging Knee Raise (Elevación de Rodillas)',
    gifUrl: 'https://static.exercisedb.dev/media/03lzqwk.gif',
    bodyParts: ['waist'],
    equipments: ['assisted'],
    targetMuscles: ['abdominals'],
    secondaryMuscles: ['hip flexors'],
    instructions: [
      'Cuélgate de la barra con los brazos estirados.',
      'Eleva las rodillas hacia el pecho contrayendo el abdomen sin balancear el cuerpo.',
      'Desciende de forma controlada hasta la posición inicial.'
    ]
  },
  {
    exerciseId: '05Cf2v8',
    name: 'Parallel Bar Dips (Fondos en Paralelas)',
    gifUrl: 'https://static.exercisedb.dev/media/05Cf2v8.gif',
    bodyParts: ['upper arms'],
    equipments: ['bodyweight'],
    targetMuscles: ['triceps'],
    secondaryMuscles: ['pectorals', 'deltoids'],
    instructions: [
      'Apóyate sobre las barras paralelas con los brazos extendidos.',
      'Flexiona los codos bajando el cuerpo hasta formar un ángulo de 90 grados en los brazos.',
      'Empuja con fuerza a través de las palmas para volver arriba.'
    ]
  },
  {
    exerciseId: '0jp9Rlz',
    name: 'Single-Leg Floor Calf Raise (Gemelos a una pierna)',
    gifUrl: 'https://static.exercisedb.dev/media/0jp9Rlz.gif',
    bodyParts: ['lower legs'],
    equipments: ['bodyweight'],
    targetMuscles: ['calves'],
    secondaryMuscles: [],
    instructions: [
      'De pie sobre una sola pierna con apoyo en la pared para equilibrio.',
      'Eleva el talón lo más alto posible contrayendo el gemelo.',
      'Baja lentamente hasta apoyar el talón y repite.'
    ]
  },
  {
    exerciseId: '0JtKWum',
    name: 'Dumbbell Burpee (Burpee con Mancuernas)',
    gifUrl: 'https://static.exercisedb.dev/media/0JtKWum.gif',
    bodyParts: ['cardio'],
    equipments: ['dumbbell'],
    targetMuscles: ['cardiovascular'],
    secondaryMuscles: ['quadriceps', 'pectorals'],
    instructions: [
      'De pie sujetando dos mancuernas ligeras a los costados.',
      'Agáchate colocando las mancuernas en el suelo y salta con los pies hacia atrás en posición de plancha.',
      'Regresa de un salto a la posición de cuclillas y ponte de pie impulsando con las piernas.'
    ]
  }
];

// Cache en memoria durante la sesión
let memoryCache = null;

/**
 * Obtiene la lista de ejercicios de ExerciseDB con caché y fallback
 */
export async function getExerciseDbList(limit = 40) {
  if (memoryCache && memoryCache.length > 0) {
    return memoryCache;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/exercises?limit=${limit}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (json.data && Array.isArray(json.data) && json.data.length > 0) {
      memoryCache = json.data;
      return json.data;
    }
    return CURATED_FALLBACK_EXERCISES;
  } catch (err) {
    console.warn('Usando lista curada de ejercicios ExerciseDB (offline/fallback):', err);
    return CURATED_FALLBACK_EXERCISES;
  }
}
