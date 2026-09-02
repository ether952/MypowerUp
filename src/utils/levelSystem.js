// Sistema de Retos Semanales y Niveles de Progresión Humana por Tonelaje Levantado

export const TONNAGE_LEVELS = [
  {
    level: 1,
    name: 'Bronce I',
    title: 'Iniciado de Fuerza (Meta 3 días)',
    weeklyGoalKg: 18000, // ~18.000 kg por semana (al menos 3 entrenamientos de ~6.000-7.000 kg)
    color: '#CD7F32',
    accentColor: 'text-amber-500',
    borderColor: 'border-amber-500/40',
    bgGradient: 'from-amber-900/30 to-amber-700/10',
    desc: 'Construcción del hábito semanal: al menos 3 sesiones de trabajo muscular'
  },
  {
    level: 2,
    name: 'Bronce II',
    title: 'Novato Consistente',
    weeklyGoalKg: 21500, // +19.4%
    color: '#D97706',
    accentColor: 'text-amber-400',
    borderColor: 'border-amber-400/40',
    bgGradient: 'from-amber-800/30 to-amber-600/10',
    desc: 'Consolidación de hábitos y volumen muscular progresivo (+20%)'
  },
  {
    level: 3,
    name: 'Plata I',
    title: 'Levantador Activo',
    weeklyGoalKg: 26000, // +20.9%
    color: '#94A3B8',
    accentColor: 'text-slate-300',
    borderColor: 'border-slate-300/40',
    bgGradient: 'from-slate-700/30 to-slate-500/10',
    desc: 'Hipertrofia sostenida y aumento de tonelaje semanal (+20%)'
  },
  {
    level: 4,
    name: 'Plata II',
    title: 'Guerrero de Cargas',
    weeklyGoalKg: 31500, // +21.1%
    color: '#CBD5E1',
    accentColor: 'text-slate-200',
    borderColor: 'border-slate-200/40',
    bgGradient: 'from-slate-600/30 to-slate-400/10',
    desc: 'Sobrecarga progresiva sólida en ejercicios principales (+20%)'
  },
  {
    level: 5,
    name: 'Oro I',
    title: 'Atleta de Hierro',
    weeklyGoalKg: 38000, // +20.6%
    color: '#F59E0B',
    accentColor: 'text-yellow-400',
    borderColor: 'border-yellow-400/40',
    bgGradient: 'from-yellow-700/30 to-amber-500/10',
    desc: 'Fuerza avanzada, densidad de repeticiones y regularidad (+20%)'
  },
  {
    level: 6,
    name: 'Oro II',
    title: 'Potencia Imparable',
    weeklyGoalKg: 45500, // +19.7%
    color: '#FBBF24',
    accentColor: 'text-yellow-300',
    borderColor: 'border-yellow-300/40',
    bgGradient: 'from-yellow-600/30 to-amber-400/10',
    desc: 'Capacidad de trabajo muscular de alto rendimiento (+20%)'
  },
  {
    level: 7,
    name: 'Platino I',
    title: 'Titán del Gimnasio',
    weeklyGoalKg: 54500, // +19.8%
    color: '#06B6D4',
    accentColor: 'text-cyan-400',
    borderColor: 'border-cyan-400/40',
    bgGradient: 'from-cyan-900/30 to-cyan-600/10',
    desc: 'Nivel avanzado con cargas pesadas en banca, sentadilla y tracción (+20%)'
  },
  {
    level: 8,
    name: 'Platino II',
    title: 'Coloso de Acero',
    weeklyGoalKg: 65500, // +20.2%
    color: '#38BDF8',
    accentColor: 'text-sky-400',
    borderColor: 'border-sky-400/40',
    bgGradient: 'from-sky-900/30 to-sky-600/10',
    desc: 'Volumen y fuerza superior para levantadores dedicados (+20%)'
  },
  {
    level: 9,
    name: 'Diamante',
    title: 'Bestia del Levantamiento',
    weeklyGoalKg: 78500, // +19.8%
    color: '#A855F7',
    accentColor: 'text-purple-400',
    borderColor: 'border-purple-400/40',
    bgGradient: 'from-purple-900/30 to-violet-600/10',
    desc: 'Élite de fuerza, recuperación y tonelaje masivo (+20%)'
  },
  {
    level: 10,
    name: 'MyPowerUp Élite',
    title: 'Leyenda del Tonelaje',
    weeklyGoalKg: 95000, // +21.0%
    color: '#EC4899',
    accentColor: 'text-pink-400',
    borderColor: 'border-pink-400/40',
    bgGradient: 'from-pink-900/30 to-rose-600/10',
    desc: 'Pico supremo de tonelaje y resistencia física en la aplicación (+20%)'
  }
];

/**
 * Calcula el volumen real de un ejercicio (peso * series * repeticiones)
 */
export function getExerciseVolume(workout) {
  const weight = Number(workout?.weight) || 0;
  const sets = Number(workout?.sets) || 1;
  const reps = Number(workout?.reps) || 1;
  return weight * sets * reps;
}

/**
 * Calcula el tonelaje total de un día
 */
export function getDayTotalVolume(dayData) {
  return (dayData?.workouts || []).reduce((acc, w) => acc + getExerciseVolume(w), 0);
}

/**
 * Obtiene el rango de fechas de la semana actual (Lunes a Domingo)
 */
export function getCurrentWeekRange(referenceDateStr) {
  let refDate;
  if (referenceDateStr) {
    const [year, month, day] = referenceDateStr.split('-').map(Number);
    refDate = new Date(year, month - 1, day);
  } else {
    refDate = new Date();
  }

  const dayOfWeek = refDate.getDay(); // 0 = Domingo, 1 = Lunes, ...
  const diffToMonday = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek;

  const monday = new Date(refDate);
  monday.setDate(refDate.getDate() + diffToMonday);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const formatStr = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const datesInWeek = [];
  for (let i = 0; i < 7; i++) {
    const curr = new Date(monday);
    curr.setDate(monday.getDate() + i);
    datesInWeek.push(formatStr(curr));
  }

  return {
    mondayStr: formatStr(monday),
    sundayStr: formatStr(sunday),
    datesInWeek,
    label: `${monday.getDate()} ${monday.toLocaleDateString('es-ES', { month: 'short' })} - ${sunday.getDate()} ${sunday.toLocaleDateString('es-ES', { month: 'short' })}`
  };
}

/**
 * Calcula el estado de nivel, tonelaje semanal y progreso hacia el siguiente nivel
 */
export function calculateLevelProgress(data = {}, referenceDateStr = null, customLevels = null) {
  const levels = customLevels && customLevels.length > 0 ? customLevels : TONNAGE_LEVELS;
  const allDates = Object.keys(data);
  
  // 1. Tonelaje total acumulado histórico
  let allTimeTonnage = 0;
  allDates.forEach(d => {
    allTimeTonnage += getDayTotalVolume(data[d]);
  });

  // 2. Tonelaje de la semana actual
  const weekInfo = getCurrentWeekRange(referenceDateStr);
  let currentWeekTonnage = 0;
  weekInfo.datesInWeek.forEach(dateStr => {
    if (data[dateStr]) {
      currentWeekTonnage += getDayTotalVolume(data[dateStr]);
    }
  });

  // 3. Determinar el nivel alcanzado en base a semanas históricas o volumen
  // Buscamos el mayor nivel superado en cualquier semana registrada
  // Agrupamos todo el historial por semanas para ver el récord semanal del usuario
  const weeklyTotals = {};
  allDates.forEach(dateStr => {
    const w = getCurrentWeekRange(dateStr);
    weeklyTotals[w.mondayStr] = (weeklyTotals[w.mondayStr] || 0) + getDayTotalVolume(data[dateStr]);
  });

  const bestWeekTonnage = Object.values(weeklyTotals).reduce((max, val) => Math.max(max, val), currentWeekTonnage);

  // Determinamos el nivel actual del usuario:
  // Se desbloquea un nivel si en la semana actual o en alguna semana previa alcanzó el objetivo de dicho nivel
  let currentLevelIndex = 0;
  for (let i = 0; i < levels.length; i++) {
    if (bestWeekTonnage >= levels[i].weeklyGoalKg) {
      currentLevelIndex = i;
    }
  }

  const currentLevel = levels[currentLevelIndex];
  const nextLevel = levels[currentLevelIndex + 1] || null;

  // Meta del reto para la semana actual:
  // Si ya superó el nivel actual en esta semana, el reto apunta al siguiente
  const activeTargetLevel = (currentWeekTonnage >= currentLevel.weeklyGoalKg && nextLevel) 
    ? nextLevel 
    : currentLevel;

  const weeklyGoal = activeTargetLevel.weeklyGoalKg;
  const progressPercent = Math.min(Math.round((currentWeekTonnage / weeklyGoal) * 100), 100);
  const remainingKg = Math.max(weeklyGoal - currentWeekTonnage, 0);
  const isGoalAchieved = currentWeekTonnage >= weeklyGoal;

  return {
    currentLevel,
    nextLevel,
    activeTargetLevel,
    currentWeekTonnage,
    weeklyGoal,
    progressPercent,
    remainingKg,
    isGoalAchieved,
    allTimeTonnage,
    bestWeekTonnage,
    weekLabel: weekInfo.label,
    levels
  };
}
