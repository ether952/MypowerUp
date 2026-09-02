import { getCurrentWeekRange } from './levelSystem.js';

export const CARDIO_DISCIPLINES = {
  caminata: {
    id: 'caminata',
    name: 'Caminata',
    icon: 'Footprints',
    unit: 'km',
    badgeColor: 'text-emerald-400',
    borderColor: 'border-emerald-500/40',
    bgGradient: 'from-emerald-500/15 via-[#0e1f1c] to-teal-950/30',
    levels: [
      { level: 1, name: 'Paseante Urbano', weeklyGoalKm: 7, title: 'Iniciación en pasos activos' },
      { level: 2, name: 'Caminante Activo', weeklyGoalKm: 10, title: 'Hábito de marcha diaria' },
      { level: 3, name: 'Explorador Constante', weeklyGoalKm: 14, title: 'Resistencia podal sostenida' },
      { level: 4, name: 'Marchador Imparable', weeklyGoalKm: 19, title: 'Capacidad aeróbica firme' },
      { level: 5, name: 'Senderista de Hierro', weeklyGoalKm: 25, title: 'Distancias medias constantes' },
      { level: 6, name: 'Nómada de Fondo', weeklyGoalKm: 32, title: 'Alto volumen de marcha' },
      { level: 7, name: 'Guerrero de Kilómetros', weeklyGoalKm: 40, title: 'Fondo pedestre avanzado' },
      { level: 8, name: 'Titán del Asfalto', weeklyGoalKm: 50, title: 'Volumen diario intenso' },
      { level: 9, name: 'Ultra Caminante', weeklyGoalKm: 62, title: 'Resistencia pedestre extrema' },
      { level: 10, name: 'MyPowerUp Trekker Élite', weeklyGoalKm: 75, title: 'Récord supremo de caminata' }
    ]
  },
  running: {
    id: 'running',
    name: 'Running',
    icon: 'Flame',
    unit: 'km',
    badgeColor: 'text-amber-400',
    borderColor: 'border-amber-500/40',
    bgGradient: 'from-amber-500/15 via-[#23150d] to-orange-950/30',
    levels: [
      { level: 1, name: 'Corredor Iniciado', weeklyGoalKm: 10, title: 'Adaptación cardiovascular básica' },
      { level: 2, name: 'Trotador Consistente', weeklyGoalKm: 15, title: 'Frecuencia de trote semanal' },
      { level: 3, name: 'Runner Callejero', weeklyGoalKm: 22, title: 'Fondo medio y control de ritmo' },
      { level: 4, name: 'Fuerza Aeróbica', weeklyGoalKm: 30, title: 'Consistencia de 30k semanales' },
      { level: 5, name: 'Medio Maratonista', weeklyGoalKm: 38, title: 'Volumen previo a media maratón' },
      { level: 6, name: 'Ritmo Constante', weeklyGoalKm: 48, title: 'Capacidad de absorción de lactato' },
      { level: 7, name: 'Fondo Inquebrantable', weeklyGoalKm: 58, title: 'Entrenamiento de alto kilometraje' },
      { level: 8, name: 'Velocidad y Pulmón', weeklyGoalKm: 70, title: 'Atleta de fondo consolidado' },
      { level: 9, name: 'Maratonista Experto', weeklyGoalKm: 85, title: 'Volumen previo a maratón completa' },
      { level: 10, name: 'MyPowerUp Runner Élite', weeklyGoalKm: 100, title: 'Élite de resistencia humana' }
    ]
  },
  bicicleta: {
    id: 'bicicleta',
    name: 'Bicicleta',
    icon: 'Bike',
    unit: 'km',
    badgeColor: 'text-cyan-400',
    borderColor: 'border-cyan-500/40',
    bgGradient: 'from-cyan-500/15 via-[#0c1c2b] to-blue-950/30',
    levels: [
      { level: 1, name: 'Ciclista Urbano', weeklyGoalKm: 25, title: 'Desplazamientos y paseos cortos' },
      { level: 2, name: 'Pedal Constante', weeklyGoalKm: 40, title: 'Resistencia sobre ruedas' },
      { level: 3, name: 'Rodador de Asfalto', weeklyGoalKm: 60, title: 'Salidas de media distancia' },
      { level: 4, name: 'Cadencia de Acero', weeklyGoalKm: 85, title: 'Potencia aeróbica en bicicleta' },
      { level: 5, name: 'Gran Fondo Inicial', weeklyGoalKm: 115, title: 'Superación de 100 km semanales' },
      { level: 6, name: 'Pelotón Avanzado', weeklyGoalKm: 150, title: 'Ritmo y resistencia sostenida' },
      { level: 7, name: 'Resistencia de Ruta', weeklyGoalKm: 190, title: 'Salidas largas de fin de semana' },
      { level: 8, name: 'Contrarrelojista', weeklyGoalKm: 240, title: 'Alto volumen ciclístico' },
      { level: 9, name: 'Etapa Reina', weeklyGoalKm: 300, title: 'Intensidad de competencia' },
      { level: 10, name: 'MyPowerUp Ciclista Élite', weeklyGoalKm: 370, title: 'Élite absoluta sobre dos ruedas' }
    ]
  }
};

/**
 * Calcula el total de km de cardio realizados en un día para una disciplina específica
 */
export function getDayCardioKm(dayData, discipline = 'all') {
  const cardios = dayData?.cardios || [];
  return cardios.reduce((acc, c) => {
    if (discipline === 'all' || c.type === discipline) {
      return acc + (Number(c.distance) || 0);
    }
    return acc;
  }, 0);
}

/**
 * Calcula el progreso de nivel semanal de cardio para una disciplina dada
 */
export function calculateCardioLevelProgress(data = {}, discipline = 'running', referenceDateStr = null) {
  const currentDiscipline = CARDIO_DISCIPLINES[discipline] || CARDIO_DISCIPLINES.running;
  const levels = currentDiscipline.levels;

  const allDates = Object.keys(data);
  const weekInfo = getCurrentWeekRange(referenceDateStr);

  // 1. Km acumulados en la semana actual para esta disciplina
  let currentWeekKm = 0;
  weekInfo.datesInWeek.forEach(dateStr => {
    if (data[dateStr]) {
      currentWeekKm += getDayCardioKm(data[dateStr], discipline);
    }
  });

  // Redondear a 1 decimal
  currentWeekKm = Math.round(currentWeekKm * 10) / 10;

  // 2. Histórico por semanas para calcular el nivel alcanzado
  const weeklyTotals = {};
  allDates.forEach(dateStr => {
    const w = getCurrentWeekRange(dateStr);
    weeklyTotals[w.mondayStr] = (weeklyTotals[w.mondayStr] || 0) + getDayCardioKm(data[dateStr], discipline);
  });

  const bestWeekKm = Object.values(weeklyTotals).reduce((max, val) => Math.max(max, val), currentWeekKm);

  // 3. Determinar el nivel actual
  let currentLevelIndex = 0;
  for (let i = 0; i < levels.length; i++) {
    if (bestWeekKm >= levels[i].weeklyGoalKm) {
      currentLevelIndex = i;
    }
  }

  const currentLevel = levels[currentLevelIndex];
  const nextLevel = levels[currentLevelIndex + 1] || null;

  const activeTargetLevel = (currentWeekKm >= currentLevel.weeklyGoalKm && nextLevel)
    ? nextLevel
    : currentLevel;

  const weeklyGoal = activeTargetLevel.weeklyGoalKm;
  const progressPercent = Math.min(Math.round((currentWeekKm / weeklyGoal) * 100), 100);
  const remainingKm = Math.max(Math.round((weeklyGoal - currentWeekKm) * 10) / 10, 0);
  const isGoalAchieved = currentWeekKm >= weeklyGoal;

  // Total histórico acumulado
  let allTimeKm = 0;
  allDates.forEach(d => {
    allTimeKm += getDayCardioKm(data[d], discipline);
  });
  allTimeKm = Math.round(allTimeKm * 10) / 10;

  return {
    disciplineInfo: currentDiscipline,
    currentLevel,
    nextLevel,
    activeTargetLevel,
    currentWeekKm,
    weeklyGoal,
    progressPercent,
    remainingKm,
    isGoalAchieved,
    allTimeKm,
    bestWeekKm: Math.round(bestWeekKm * 10) / 10,
    weekLabel: weekInfo.label,
    levels
  };
}
