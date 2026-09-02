// Motor de Calibración Personalizada de Desafíos Semanales
// Adapta las metas de musculación y resistencia al nivel real del usuario (novatos hasta atletas élite)

export const CALIBRATION_EXPERIENCE_OPTIONS = [
  { id: 'beginner', label: 'Menos de 6 meses', subtitle: 'Principiante / Retomando', expFactor: 0.72 },
  { id: 'intermediate', label: '6 meses a 2 años', subtitle: 'Intermedio constante', expFactor: 1.2 },
  { id: 'advanced', label: '2 a 5 años', subtitle: 'Avanzado regular', expFactor: 2.1 },
  { id: 'elite', label: 'Más de 5 años', subtitle: 'Atleta experimentado / Élite', expFactor: 3.4 }
];

export const CALIBRATION_DAYS_OPTIONS = [
  { id: '2-3', label: '2 a 3 días', subtitle: 'Frecuencia moderada', daysFactor: 0.9 },
  { id: '4-5', label: '4 a 5 días', subtitle: 'Frecuencia estándar gym', daysFactor: 1.1 },
  { id: '6+', label: '6 o más días', subtitle: 'Alta dedicación semanal', daysFactor: 1.35 }
];

const STORAGE_KEY = 'mypowerup_challenge_calibration';

/**
 * Interpreta la respuesta escrita libre del usuario para tiempo de entrenamiento
 */
export function parseExperienceInput(text) {
  if (!text) return 'beginner';
  const t = String(text).toLowerCase();

  // Semanas, días o inicio reciente
  if (t.includes('semana') || t.includes('dia') || t.includes('día') || t.includes('recien') || t.includes('recién') || t.includes('arranc') || t.includes('empez') || t.includes('novat') || t.includes('poco')) {
    return 'beginner';
  }

  const numMatch = t.match(/\d+/);
  const num = numMatch ? parseInt(numMatch[0], 10) : null;

  if (t.includes('año') || t.includes('ano')) {
    if (!num || num <= 1) return 'intermediate';
    if (num >= 5) return 'elite';
    if (num >= 2) return 'advanced';
    return 'intermediate';
  }

  if (t.includes('mes')) {
    if (num && num > 24) return 'advanced';
    if (num && num > 6) return 'intermediate';
    return 'beginner';
  }

  if (num !== null) {
    if (num >= 5) return 'elite';
    if (num >= 2) return 'advanced';
    return 'intermediate';
  }

  return 'beginner';
}

/**
 * Interpreta la respuesta escrita libre del usuario para días por semana
 */
export function parseDaysInput(text) {
  if (!text) return '2-3';
  const numMatch = String(text).match(/\d+/);
  if (!numMatch) return '2-3';
  const days = parseInt(numMatch[0], 10);
  if (days >= 6) return '6+';
  if (days >= 4) return '4-5';
  return '2-3';
}

/**
 * Calcula el factor multiplicador según las respuestas del medidor
 */
export function calculateCalibrationMultiplier(profile) {
  if (!profile) return 1.0;

  const expObj = CALIBRATION_EXPERIENCE_OPTIONS.find(e => e.id === profile.experience) || CALIBRATION_EXPERIENCE_OPTIONS[0];
  const daysObj = CALIBRATION_DAYS_OPTIONS.find(d => d.id === profile.daysPerWeek) || CALIBRATION_DAYS_OPTIONS[1];
  const proximity = Number(profile.goalProximity) || 5;

  // Proximity factor (1 = 0.85, 5 = 1.0, 10 = 1.25)
  const proxFactor = 0.8 + (proximity / 10) * 0.45;

  const rawMultiplier = expObj.expFactor * daysObj.daysFactor * proxFactor;
  // Limitar entre 0.6 y 5.5
  return Math.min(Math.max(Math.round(rawMultiplier * 100) / 100, 0.6), 5.5);
}

/**
 * Genera la escalera calibrada de 10 niveles de Musculación (tonelaje en kg)
 * Cada nivel incrementa aproximadamente un 20% respecto al anterior.
 * Un novato que levanta ~6.000-7.500 kg por día tardará un mínimo de 3 días para conquistar el Nivel 1 (~18.000 kg).
 */
export function getCalibratedMuscleLevels(profile) {
  const mult = calculateCalibrationMultiplier(profile);

  // Escala base (+20% progresivo por nivel)
  const baseLadder = [
    { level: 1, name: 'Bronce I', title: 'Iniciado de Fuerza (Meta 3 días)', baseKg: 22500 },
    { level: 2, name: 'Bronce II', title: 'Novato Consistente (+20%)', baseKg: 27000 },
    { level: 3, name: 'Plata I', title: 'Levantador Activo (+20%)', baseKg: 32500 },
    { level: 4, name: 'Plata II', title: 'Fuerza en Progreso (+20%)', baseKg: 39500 },
    { level: 5, name: 'Oro I', title: 'Atleta de Hierro (+20%)', baseKg: 47500 },
    { level: 6, name: 'Oro II', title: 'Potencia Imparable (+20%)', baseKg: 57000 },
    { level: 7, name: 'Platino I', title: 'Titán de Cargas (+20%)', baseKg: 68500 },
    { level: 8, name: 'Platino II', title: 'Coloso de Acero (+20%)', baseKg: 82000 },
    { level: 9, name: 'Diamante', title: 'Bestia del Levantamiento (+20%)', baseKg: 98500 },
    { level: 10, name: 'MyPowerUp Élite', title: 'Leyenda de la Fuerza (+20%)', baseKg: 119000 }
  ];

  return baseLadder.map(lvl => {
    // Redondear a múltiplos lógicos de 500 kg
    const rawKg = lvl.baseKg * mult;
    const roundedKg = Math.max(Math.round(rawKg / 500) * 500, 5000);

    return {
      level: lvl.level,
      name: lvl.name,
      title: lvl.title,
      weeklyGoalKg: roundedKg,
      color: lvl.level <= 2 ? '#CD7F32' : lvl.level <= 4 ? '#94A3B8' : lvl.level <= 6 ? '#F59E0B' : lvl.level <= 8 ? '#06B6D4' : lvl.level === 9 ? '#A855F7' : '#EC4899',
      accentColor: lvl.level <= 2 ? 'text-amber-500' : lvl.level <= 4 ? 'text-slate-300' : lvl.level <= 6 ? 'text-yellow-400' : lvl.level <= 8 ? 'text-cyan-400' : lvl.level === 9 ? 'text-purple-400' : 'text-pink-400',
      borderColor: lvl.level <= 2 ? 'border-amber-500/40' : lvl.level <= 4 ? 'border-slate-300/40' : lvl.level <= 6 ? 'border-yellow-400/40' : lvl.level <= 8 ? 'border-cyan-400/40' : lvl.level === 9 ? 'border-purple-400/40' : 'border-pink-400/40',
      bgGradient: lvl.level <= 2 ? 'from-amber-900/30' : lvl.level <= 4 ? 'from-slate-700/30' : lvl.level <= 6 ? 'from-yellow-700/30' : lvl.level <= 8 ? 'from-cyan-900/30' : lvl.level === 9 ? 'from-purple-900/30' : 'from-pink-900/30'
    };
  });
}

/**
 * Genera la escalera calibrada de 10 niveles de Resistencia con progresión de ~20%
 */
export function getCalibratedCardioLevels(profile, discipline = 'running') {
  const mult = calculateCalibrationMultiplier(profile);

  // Bases para cada disciplina (+20% aprox por nivel)
  const baseCardioData = {
    caminata: {
      step: 1,
      baseLadder: [
        { level: 1, name: 'Paseante Urbano', title: 'Iniciación activa (3 días mín)', baseKm: 12 },
        { level: 2, name: 'Caminante Activo', title: 'Hábito de marcha (+20%)', baseKm: 14 },
        { level: 3, name: 'Explorador Constante', title: 'Resistencia podal (+20%)', baseKm: 17 },
        { level: 4, name: 'Marchador Imparable', title: 'Capacidad aeróbica (+20%)', baseKm: 21 },
        { level: 5, name: 'Senderista de Hierro', title: 'Distancias medias (+20%)', baseKm: 25 },
        { level: 6, name: 'Nómada de Fondo', title: 'Alto volumen (+20%)', baseKm: 30 },
        { level: 7, name: 'Guerrero de Kilómetros', title: 'Fondo avanzado (+20%)', baseKm: 36 },
        { level: 8, name: 'Titán del Asfalto', title: 'Volumen intenso (+20%)', baseKm: 44 },
        { level: 9, name: 'Ultra Caminante', title: 'Resistencia pedestre (+20%)', baseKm: 53 },
        { level: 10, name: 'MyPowerUp Trekker Élite', title: 'Récord supremo (+20%)', baseKm: 64 }
      ]
    },
    running: {
      step: 1,
      baseLadder: [
        { level: 1, name: 'Corredor Iniciado', title: 'Adaptación cardiovascular (3 salidas)', baseKm: 15 },
        { level: 2, name: 'Trotador Consistente', title: 'Frecuencia semanal (+20%)', baseKm: 18 },
        { level: 3, name: 'Runner Callejero', title: 'Fondo medio (+20%)', baseKm: 22 },
        { level: 4, name: 'Fuerza Aeróbica', title: 'Kilometraje sostenido (+20%)', baseKm: 26 },
        { level: 5, name: 'Medio Maratonista', title: 'Volumen aeróbico (+20%)', baseKm: 32 },
        { level: 6, name: 'Ritmo Constante', title: 'Capacidad de fondo (+20%)', baseKm: 38 },
        { level: 7, name: 'Fondo Inquebrantable', title: 'Alto fondo (+20%)', baseKm: 46 },
        { level: 8, name: 'Velocidad y Pulmón', title: 'Atleta consolidado (+20%)', baseKm: 55 },
        { level: 9, name: 'Maratonista Experto', title: 'Gran resistencia (+20%)', baseKm: 66 },
        { level: 10, name: 'MyPowerUp Runner Élite', title: 'Élite de resistencia (+20%)', baseKm: 80 }
      ]
    },
    bicicleta: {
      step: 5,
      baseLadder: [
        { level: 1, name: 'Ciclista Urbano', title: 'Salidas iniciales (3 salidas)', baseKm: 40 },
        { level: 2, name: 'Pedal Constante', title: 'Resistencia sobre ruedas (+20%)', baseKm: 48 },
        { level: 3, name: 'Rodador de Asfalto', title: 'Media distancia (+20%)', baseKm: 58 },
        { level: 4, name: 'Cadencia de Acero', title: 'Potencia aeróbica (+20%)', baseKm: 70 },
        { level: 5, name: 'Gran Fondo Inicial', title: 'Superación ciclística (+20%)', baseKm: 85 },
        { level: 6, name: 'Pelotón Avanzado', title: 'Ritmo sostenido (+20%)', baseKm: 105 },
        { level: 7, name: 'Resistencia de Ruta', title: 'Salidas largas (+20%)', baseKm: 125 },
        { level: 8, name: 'Contrarrelojista', title: 'Alto volumen (+20%)', baseKm: 150 },
        { level: 9, name: 'Etapa Reina', title: 'Intensidad de fondo (+20%)', baseKm: 180 },
        { level: 10, name: 'MyPowerUp Ciclista Élite', title: 'Élite sobre dos ruedas (+20%)', baseKm: 220 }
      ]
    }
  };

  const disciplineConfig = baseCardioData[discipline] || baseCardioData.running;
  const step = disciplineConfig.step;

  return disciplineConfig.baseLadder.map(lvl => {
    const rawKm = lvl.baseKm * mult;
    const roundedKm = Math.max(Math.round(rawKm / step) * step, step);
    return {
      level: lvl.level,
      name: lvl.name,
      title: lvl.title,
      weeklyGoalKm: roundedKm
    };
  });
}

/**
 * Obtener perfil de calibración guardado
 */
export function getStoredChallengeCalibration() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (e) {
    return null;
  }
}

/**
 * Guardar perfil de calibración
 */
export function saveStoredChallengeCalibration(profile) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Filtra los datos de entrenamiento y cardio para que el desafío
 * SOLO empiece a contar desde el momento exacto en que se le dio a "Jugar".
 * Todo lo realizado antes de la activación se ignora para el desafío.
 */
export function filterDataForChallenge(data = {}, calibrationProfile = null) {
  if (!calibrationProfile || !calibrationProfile.activatedAt) {
    return {};
  }

  const activatedAt = Number(calibrationProfile.activatedAt) || 0;
  const startDate = calibrationProfile.startDate || '';

  const filtered = {};

  Object.entries(data).forEach(([dateStr, dayData]) => {
    // Si la fecha es anterior al día de inicio de juego, no cuenta
    if (startDate && dateStr < startDate) {
      return;
    }

    const dayWorkouts = dayData?.workouts || [];
    const dayCardios = dayData?.cardios || [];

    const validWorkouts = dayWorkouts.filter(w => {
      // Si tiene id numérico generado por Date.now()
      if (typeof w.id === 'number') {
        return w.id >= activatedAt;
      }
      return dateStr >= startDate;
    });

    const validCardios = dayCardios.filter(c => {
      if (typeof c.id === 'number') {
        return c.id >= activatedAt;
      }
      return dateStr >= startDate;
    });

    filtered[dateStr] = {
      ...dayData,
      workouts: validWorkouts,
      cardios: validCardios
    };
  });

  return filtered;
}
