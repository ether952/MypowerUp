import { getGeminiApiKey } from './aiNutritionService.js';
import { GYM_EXERCISES_SPRITES } from '../components/VisualGymExercisePicker.jsx';
import { getLocalDateString, calculate1RM } from '../utils/helpers.js';
import {
  getSavedCoachProfile,
  getSavedRoutines,
  getActiveRoutineId,
  getTodayWorkoutSchedule
} from '../utils/routineTemplates.js';

const GEMINI_MODELS = [
  'gemini-3-flash-preview',
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-3.1-flash-lite',
  'gemini-flash-latest'
];

/**
 * Calcula el volumen de carga (tonelaje) de un ejercicio considerando series personalizadas o fijas.
 */
function calculateWorkoutVolume(w) {
  const detailed = (Array.isArray(w?.detailedSets) && w.detailedSets.length > 0)
    ? w.detailedSets
    : (Array.isArray(w?.setsDetails) && w.setsDetails.length > 0 ? w.setsDetails : null);

  if (detailed) {
    return detailed.reduce((sum, s) => sum + (Number(s.weight) || 0) * (Number(s.reps) || 0), 0);
  }
  const weight = Number(w?.weight) || 0;
  const sets = Number(w?.sets) || 1;
  const reps = Number(w?.reps) || 1;
  return weight * sets * reps;
}

/**
 * Formatea el listado de ejercicios cargados hoy para que el Coach tenga visibilidad exacta.
 */
function formatWorkoutsForPrompt(workouts = []) {
  if (!Array.isArray(workouts) || workouts.length === 0) {
    return '*(El atleta aún no ha registrado ejercicios de fuerza hoy)*';
  }

  let totalVolume = 0;
  let totalSets = 0;

  const lines = workouts.map((w, idx) => {
    const sets = Number(w.sets) || (w.detailedSets?.length || w.setsDetails?.length || 1);
    const reps = Number(w.reps) || 10;
    const weight = Number(w.weight) || 0;
    totalSets += sets;

    const volume = calculateWorkoutVolume(w);
    totalVolume += volume;

    // 1RM estimado
    let rmText = '';
    if (weight > 0 && reps > 0) {
      const rm = calculate1RM(weight, reps);
      if (rm > 0) rmText = ` | 1RM est: ~${rm} kg`;
    }

    // Detalle de series
    const detailed = (Array.isArray(w.detailedSets) && w.detailedSets.length > 0)
      ? w.detailedSets
      : (Array.isArray(w.setsDetails) && w.setsDetails.length > 0 ? w.setsDetails : null);

    let setsDetailText = '';
    if (detailed && detailed.length > 0) {
      const seriesStr = detailed.map((s, i) => `S${i + 1}: ${s.weight || 0}kg x ${s.reps || 0}r`).join(', ');
      setsDetailText = ` [Series: ${seriesStr}]`;
    } else {
      setsDetailText = ` [${sets} series x ${reps} reps @ ${weight} kg]`;
    }

    const catText = w.category ? ` (${w.category})` : '';
    const volText = volume > 0 ? ` | Vol: ${volume.toLocaleString()} kg` : '';

    return `${idx + 1}. **${w.name}**${catText}: ${setsDetailText}${volText}${rmText}`;
  });

  return `${lines.join('\n')}
=> Total Sesión de Fuerza Hoy: ${workouts.length} ejercicios, ${totalSets} series efectivas, ${totalVolume.toLocaleString()} kg de volumen total levantado.`;
}

/**
 * Formatea el listado de cardio cargado hoy.
 */
function formatCardioForPrompt(cardios = []) {
  if (!Array.isArray(cardios) || cardios.length === 0) {
    return '*(No hay ejercicios de cardio registrados para hoy)*';
  }

  return cardios.map((c, idx) => {
    const parts = [];
    if (c.duration) parts.push(`${c.duration} min`);
    if (c.distance) parts.push(`${c.distance} km`);
    if (c.calories || c.caloriesBurned) parts.push(`${c.calories || c.caloriesBurned} kcal quemadas`);
    if (c.intensity) parts.push(`Intensidad: ${c.intensity}`);
    return `${idx + 1}. **${c.name}**: ${parts.join(', ')}`;
  }).join('\n');
}

/**
 * Formatea los alimentos consumidos en el día.
 */
function formatFoodsForPrompt(foods = []) {
  if (!Array.isArray(foods) || foods.length === 0) {
    return '*(No hay comidas registradas para hoy aún)*';
  }

  return foods.map((f, idx) => {
    const meal = f.mealType ? `[${f.mealType.toUpperCase()}] ` : '';
    const macros = [];
    if (f.calories !== undefined) macros.push(`${f.calories} kcal`);
    if (f.protein !== undefined) macros.push(`${f.protein}g prot`);
    if (f.carbs !== undefined) macros.push(`${f.carbs}g carb`);
    if (f.fat !== undefined) macros.push(`${f.fat}g grasa`);
    const portion = f.portionGrams ? ` (${f.portionGrams}g)` : '';
    return `${idx + 1}. ${meal}**${f.name}**${portion}: ${macros.join(', ')}`;
  }).join('\n');
}

/**
 * Formatea el historial de los días previos (últimos 6 días).
 */
function formatRecentHistoryForPrompt(data = {}, targetDateStr) {
  if (!data || typeof data !== 'object') {
    return '*(Sin historial previo disponible)*';
  }

  const parts = targetDateStr.split('-').map(Number);
  if (parts.length !== 3) return '*(Sin historial previo disponible)*';

  const baseDate = new Date(parts[0], parts[1] - 1, parts[2]);
  const historyEntries = [];
  const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  for (let i = 1; i <= 6; i++) {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() - i);
    const dateStr = getLocalDateString(d);
    const dayData = data[dateStr];
    if (!dayData) continue;

    const workouts = dayData.workouts || [];
    const cardios = dayData.cardios || [];
    if (workouts.length === 0 && cardios.length === 0) continue;

    const dayName = dayNames[d.getDay()];
    const exList = workouts.map(w => {
      const sets = Number(w.sets) || (w.detailedSets?.length || w.setsDetails?.length || 1);
      const reps = Number(w.reps) || 10;
      const weight = Number(w.weight) || 0;
      return `${w.name} (${sets}x${reps}${weight > 0 ? ` @ ${weight}kg` : ''})`;
    });

    const cardioList = cardios.map(c => `${c.name} (${c.duration || 0}m)`);
    const allActivities = [...exList, ...cardioList].join(', ');
    const dayVol = workouts.reduce((sum, w) => sum + calculateWorkoutVolume(w), 0);
    const volStr = dayVol > 0 ? ` | Vol: ${dayVol.toLocaleString()} kg` : '';

    historyEntries.push(`- **${dateStr} (${dayName})**: ${allActivities}${volStr}`);
  }

  if (historyEntries.length === 0) {
    return '*(No hay entrenamientos registrados en los días previos de esta semana)*';
  }

  return historyEntries.join('\n');
}

/**
 * Formatea la rutina activa y el plan programado para hoy.
 */
function formatRoutineScheduleForPrompt(activeRoutine) {
  if (!activeRoutine) return 'Sin rutina activa asignada.';
  const scheduleInfo = getTodayWorkoutSchedule(activeRoutine);
  if (!scheduleInfo) return `Rutina: ${activeRoutine.name || 'Personalizada'}`;

  if (scheduleInfo.isRestDay) {
    return `Rutina: "${activeRoutine.name}"\nHoy (${scheduleInfo.todayName}): Día de Descanso programado / Recuperación activa.`;
  }

  const w = scheduleInfo.scheduledWorkout;
  const exList = (w.exercises || []).map(e => `- ${e.name} (${e.sets}x${e.reps}${e.weight ? ` @ ${e.weight}kg` : ''})`).join('\n');
  return `Rutina: "${activeRoutine.name}"\nHoy (${scheduleInfo.todayName}): Sesión programada "${w.title}" (Músculos: ${w.targetMuscles || 'Varios'}).\nEjercicios programados en la rutina:\n${exList}`;
}

/**
 * Construye el prompt de sistema especializado para el Coach Deportivo de MyPowerUp.
 * Provee acceso completo en tiempo real a los ejercicios cargados hoy, cardio, nutrición, historial y rutina.
 */
function buildCoachSystemPrompt(userContext = {}) {
  // 1. Resolver fechas
  const todayStr = getLocalDateString();
  const selectedDate = userContext.selectedDate || todayStr;

  // 2. Resolver data (desde contexto o localStorage de respaldo)
  let data = userContext.data;
  if ((!data || Object.keys(data).length === 0) && typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('mypowerup_data');
      if (raw) data = JSON.parse(raw);
    } catch (e) {
      console.warn('Error reading mypowerup_data for coach:', e);
    }
  }
  data = data || {};

  // 3. Resolver perfil
  let profile = userContext.profile;
  if ((!profile || Object.keys(profile).length === 0) && typeof window !== 'undefined') {
    profile = getSavedCoachProfile();
  }
  profile = profile || {};

  // 4. Resolver metas nutricionales y de tonelaje
  let targetNutrition = userContext.targetNutrition || userContext.goals;
  if (!targetNutrition && typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('mypowerup_goals');
      if (raw) targetNutrition = JSON.parse(raw);
    } catch (e) { }
  }
  targetNutrition = targetNutrition || { calories: 2400, protein: 150, tonnage: 100 };

  // 5. Resolver rutina activa
  let activeRoutine = userContext.activeRoutine;
  if (!activeRoutine && typeof window !== 'undefined') {
    try {
      const routines = getSavedRoutines(profile);
      const activeId = getActiveRoutineId(routines);
      activeRoutine = routines.find(r => r.id === activeId) || routines[0];
    } catch (e) { }
  }

  // 6. Obtener datos del día activo (priorizando selectedDate y hoy)
  const currentDay = data[selectedDate] || { foods: [], workouts: [], cardios: [] };

  const workoutsToUse = userContext.todayWorkouts || currentDay.workouts || [];
  const cardiosToUse = userContext.todayCardio || currentDay.cardios || [];
  const foodsToUse = userContext.todayFoods || currentDay.foods || [];

  // Calcular totales nutricionales
  const calcCal = foodsToUse.reduce((acc, f) => acc + (Number(f.calories) || 0), 0);
  const calcProt = foodsToUse.reduce((acc, f) => acc + (Number(f.protein) || 0), 0);
  const calcCarbs = foodsToUse.reduce((acc, f) => acc + (Number(f.carbs) || 0), 0);
  const calcFat = foodsToUse.reduce((acc, f) => acc + (Number(f.fat) || 0), 0);

  const consumedCalories = userContext.todayNutrition?.calories ?? calcCal;
  const consumedProtein = userContext.todayNutrition?.protein ?? calcProt;

  const formattedWorkouts = formatWorkoutsForPrompt(workoutsToUse);
  const formattedCardio = formatCardioForPrompt(cardiosToUse);
  const formattedFoods = formatFoodsForPrompt(foodsToUse);
  const formattedRecent = formatRecentHistoryForPrompt(data, selectedDate);
  const formattedRoutine = formatRoutineScheduleForPrompt(activeRoutine);

  const officialExercises = GYM_EXERCISES_SPRITES.map(e => `${e.name} [${e.category}]`).join('\n- ');

  return `Eres el "Coach Inteligente de MyPowerUp", un entrenador personal y nutricionista deportivo de élite, empático, científico, motivador y 100% práctico.

ACCESO TOTAL A LOS DATOS EN TIEMPO REAL DEL ATLETA:
Tienes ACCESO DIRECTO, COMPLETO Y EN TIEMPO REAL a todos los ejercicios, series, repeticiones, kilos levantados, cardio y alimentos que el atleta tiene cargados en la aplicación MyPowerUp. Toda la información a continuación representa el estado exacto de su diario:
- NUNCA digas que no puedes ver sus ejercicios o que no tienes acceso en tiempo real a su diario de entrenamiento; tienes el desglose exacto a continuación.
- Si el atleta te pregunta qué opinas de sus ejercicios, cómo los ves, qué tal su entrenamiento o qué debería mejorar, responde analizando punto por punto los ejercicios que figuran en "EJERCICIOS REGISTRADOS PARA HOY", evaluando las series, pesos en kg, volumen total y selección de ejercicios.
- Si no ha cargado ejercicios hoy aún, puedes indicarle qué le toca según su "PLAN / RUTINA PROGRAMADA" o sugerirle un entrenamiento basado en el catálogo oficial.

ESTADO Y PERFIL DEL ATLETA:
- Objetivo principal: ${profile.goal || 'Hipertrofia / Ganancia muscular'}
- Peso corporal: ${profile.weightKg || 75} kg | Altura: ${profile.heightCm || 175} cm | Nivel: ${profile.experienceLevel || 'Intermedio'}
- Días de entrenamiento disponibles: ${profile.daysPerWeek || 4} días por semana
- Equipo disponible: ${profile.equipment || 'Gimnasio completo'}
- Notas / Lesiones: ${profile.injuriesNotes || 'Ninguna'}
- Metas diarias: ${targetNutrition.calories || 2400} kcal | ${targetNutrition.protein || 150}g proteína | Meta Tonelaje: ${targetNutrition.tonnage || 100} kgs

EJERCICIOS REGISTRADOS PARA HOY (${selectedDate}):
${formattedWorkouts}

CARDIO REGISTRADO PARA HOY:
${formattedCardio}

NUTRICIÓN Y COMIDAS DE HOY:
- Totales: Consumidas ${consumedCalories} kcal / Meta: ${targetNutrition.calories || 2400} kcal | Proteína: ${consumedProtein}g / Meta: ${targetNutrition.protein || 150}g | Carbohidratos: ${calcCarbs}g | Grasas: ${calcFat}g
- Alimentos registrados hoy:
${formattedFoods}

HISTORIAL DE ENTRENAMIENTO DE DÍAS ANTERIORES:
${formattedRecent}

PLAN / RUTINA PROGRAMADA:
${formattedRoutine}

CATÁLOGO OFICIAL EXCLUSIVO DE EJERCICIOS DE LA APLICACIÓN:
- ${officialExercises}

DIRECTIVAS Y LIMITACIONES OBLIGATORIAS:
1. ANÁLISIS DE EJERCICIOS REALES: Cuando el atleta te pregunte por su entrenamiento o los ejercicios cargados, nómbralos exactamente con sus series y kilos levantados. Analiza si la distribución es equilibrada, felicítalo por las marcas y dale consejos de técnica o de esfuerzo (RIR 1-2).
2. RECOMENDACIONES DE NUEVOS EJERCICIOS: Cuando propongas nuevos ejercicios o cambios para futuras sesiones, utiliza ÚNICAMENTE los ejercicios listados en el "CATÁLOGO OFICIAL EXCLUSIVO" para que el usuario pueda seleccionarlos directamente en la app.
3. NUTRICIÓN DE APOYO: Cruza el entrenamiento con la nutrición. Si entrenó pesado y lleva pocas calorías o proteínas, recuérdale cerrar el día con una comida post-entreno óptima (ej: pollo con arroz o batido de proteína).
4. TONO: Formato Markdown deportivo con negritas, viñetas estructuradas y emojis. Directo, motivador, con base científica pero sin rodeos aburridos.`;
}

/**
 * Envía un mensaje al Coach Inteligente y obtiene la respuesta en tiempo real de Google Gemini.
 */
export async function askAiCoach(userMessage, conversationHistory = [], userContext = {}) {
  // Manejo defensivo en caso de que history y context vengan invertidos
  let history = Array.isArray(conversationHistory) ? conversationHistory : [];
  let context = (typeof userContext === 'object' && !Array.isArray(userContext)) ? userContext : {};

  if (Array.isArray(userContext) && typeof conversationHistory === 'object' && !Array.isArray(conversationHistory)) {
    history = userContext;
    context = conversationHistory;
  }

  const apiKey = getGeminiApiKey();

  if (!apiKey) {
    return '⚠️ **No se detectó la clave de Google Gemini.**\n\nAsegúrate de tener configurada la variable `VITE_GEMINI_API_KEY` (o `GEMINI_API_KEY`) en tu panel de Vercel y haber hecho un nuevo Deploy, o pásamela para dejarla integrada de base en el proyecto.';
  }

  const systemInstruction = buildCoachSystemPrompt(context);

  const contents = [
    ...history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    })),
    {
      role: 'user',
      parts: [{ text: userMessage }]
    }
  ];

  let lastErrorDetail = '';

  for (const model of GEMINI_MODELS) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(new Error('TIMEOUT')), 15000);

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          signal: controller.signal,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents,
            systemInstruction: {
              parts: [{ text: systemInstruction }]
            },
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1200
            }
          })
        }
      );

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        const candidate = data.candidates?.[0];
        const text = candidate?.content?.parts?.[0]?.text;
        if (text) {
          return text.trim();
        }
      } else {
        const errJson = await response.json().catch(() => ({}));
        lastErrorDetail = errJson.error?.message || `Status ${response.status}`;
        console.warn(`[MyPowerUp Coach] Error modelo ${model}:`, lastErrorDetail);
      }
    } catch (err) {
      clearTimeout(timeoutId);
      lastErrorDetail = err.message || 'Error de conexión';
      console.warn(`[MyPowerUp Coach] Falla consultando ${model}:`, err.message || err);
    }
  }

  return `⚠️ **Error de conexión con Google Gemini.**\n\nEl servidor respondió: *${lastErrorDetail || 'No se pudo obtener respuesta del modelo'}*.\n\nVerifica que la clave en Vercel tenga habilitada la API Generative Language en Google Cloud o que no tenga restricciones de dominio.`;
}
