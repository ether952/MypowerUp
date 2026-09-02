// Utilidades y cálculos para MyPowerUp

export const MEAL_TYPES = [
  { id: 'desayuno', label: 'Desayuno', tag: '01' },
  { id: 'almuerzo', label: 'Almuerzo', tag: '02' },
  { id: 'merienda', label: 'Merienda', tag: '03' },
  { id: 'cena', label: 'Cena', tag: '04' },
  { id: 'tentenpie', label: 'Tentempié', tag: '05' },
  { id: 'suplementacion', label: 'Suplementos', tag: 'SUPP' },
];

export const QUICK_SUPPLEMENTS = [
  { name: 'Creatina Monohidrato (5g)', calories: 0, protein: 0, mealType: 'suplementacion' },
  { name: 'Proteína Whey (1 scoop / 30g)', calories: 125, protein: 25, mealType: 'suplementacion' },
  { name: 'Proteína Isolate (30g)', calories: 110, protein: 27, mealType: 'suplementacion' },
  { name: 'Pre-Entreno (1 scoop)', calories: 10, protein: 0, mealType: 'suplementacion' },
  { name: 'Glutamina (5g)', calories: 20, protein: 5, mealType: 'suplementacion' },
  { name: 'BCAA / EAA (10g)', calories: 38, protein: 8, mealType: 'suplementacion' },
  { name: 'Multivitamínico + Omega 3', calories: 15, protein: 0, mealType: 'suplementacion' },
];

/**
 * Obtiene la fecha en formato YYYY-MM-DD en la zona horaria local
 */
export function getLocalDateString(d = new Date()) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Obtiene la hora actual en formato HH:mm
 */
export function getCurrentTimeString() {
  const d = new Date();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Formatea una fecha YYYY-MM-DD a un texto legible en español
 */
export function formatDisplayDate(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  
  const todayStr = getLocalDateString();
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = getLocalDateString(yesterdayDate);

  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowStr = getLocalDateString(tomorrowDate);

  if (dateStr === todayStr) return 'Hoy, ' + date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
  if (dateStr === yesterdayStr) return 'Ayer, ' + date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
  if (dateStr === tomorrowStr) return 'Mañana, ' + date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });

  return date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

/**
 * Desplaza una fecha X días
 */
export function shiftDate(dateStr, days) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  return getLocalDateString(date);
}

/**
 * Cálculo estimado de 1RM (Fórmula de Epley)
 */
export function calculate1RM(weight, reps) {
  if (!weight || !reps || reps <= 0) return 0;
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30) * 10) / 10;
}

/**
 * Genera datos de los últimos N días para los gráficos
 */
export function getDaysRangeData(data, numDays = 7, endDateStr = getLocalDateString()) {
  const [year, month, day] = endDateStr.split('-').map(Number);
  const endDate = new Date(year, month - 1, day);
  const result = [];

  for (let i = numDays - 1; i >= 0; i--) {
    const current = new Date(endDate);
    current.setDate(endDate.getDate() - i);
    const dateStr = getLocalDateString(current);
    const dayData = data[dateStr] || { foods: [], workouts: [] };

    const totalCalories = (dayData.foods || []).reduce((acc, f) => acc + (Number(f.calories) || 0), 0);
    const totalProtein = (dayData.foods || []).reduce((acc, f) => acc + (Number(f.protein) || 0), 0);
    const totalTonnage = (dayData.workouts || []).reduce((acc, w) => acc + (Number(w.weight) || 0), 0);

    const dayName = current.toLocaleDateString('es-ES', { weekday: 'short' });
    const formattedDay = `${current.getDate()}/${current.getMonth() + 1}`;

    result.push({
      dateStr,
      label: `${dayName.toUpperCase()} ${formattedDay}`,
      shortLabel: dayName.toUpperCase(),
      calories: totalCalories,
      protein: totalProtein,
      tonnage: totalTonnage,
      workoutsCount: (dayData.workouts || []).length,
      foodsCount: (dayData.foods || []).length,
    });
  }

  return result;
}

// Opciones rápidas de alimentos frecuentes
export const QUICK_FOODS = [
  { name: 'Pechuga de pollo (150g)', calories: 245, protein: 46 },
  { name: 'Huevos enteros (3u)', calories: 215, protein: 18 },
  { name: 'Arroz blanco cocido (150g)', calories: 195, protein: 4 },
  { name: 'Avena en copos (80g)', calories: 300, protein: 11 },
  { name: 'Lata de atún al natural (120g)', calories: 135, protein: 30 },
  { name: 'Carne vacuna magra (200g)', calories: 420, protein: 44 },
  { name: 'Yogur griego natural (200g)', calories: 140, protein: 20 },
  { name: 'Papas al horno (200g)', calories: 170, protein: 4 },
];

// Opciones rápidas de ejercicios comunes
export const QUICK_EXERCISES = [
  'Press de banca plano',
  'Sentadilla trasera',
  'Peso muerto convencional',
  'Press militar con barra',
  'Dominadas con lastre',
  'Remo con barra (Pendlay)',
  'Press inclinado con mancuernas',
  'Prensa de piernas 45°',
  'Elevaciones laterales en polea',
  'Curl de bíceps con barra Z',
  'Fondos en paralelas (Dips)',
  'Extensiones de tríceps en polea',
  'Hip Thrust',
  'Jalón al pecho en polea'
];
