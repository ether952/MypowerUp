import { getGeminiApiKey } from './aiNutritionService.js';
import { GYM_EXERCISES_SPRITES } from '../components/VisualGymExercisePicker.jsx';

const GEMINI_MODELS = [
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.8-flash',
  'gemini-flash-latest'
];

/**
 * Construye el prompt de sistema especializado para el Coach Deportivo de MyPowerUp.
 * Limita estrictamente las recomendaciones a los ejercicios oficiales de la app y alimentos de la base de datos.
 */
function buildCoachSystemPrompt(userContext = {}) {
  const {
    profile = {},
    todayNutrition = {},
    targetNutrition = {},
    recentWorkouts = [],
    activeRoutine = null
  } = userContext;

  const officialExercises = GYM_EXERCISES_SPRITES.map(e => `${e.name} [${e.category}]`).join('\n- ');

  return `Eres el "Coach Inteligente de MyPowerUp", un entrenador personal y nutricionista deportivo de élite, empático, científico, motivador y 100% práctico.

ESTADO ACTUAL DEL ATLETA:
- Objetivo: ${profile.goal || 'Hipertrofia / Ganancia muscular'}
- Peso: ${profile.weightKg || 75} kg | Altura: ${profile.heightCm || 175} cm | Nivel: ${profile.experienceLevel || 'Intermedio'}
- Días de entrenamiento disponibles: ${profile.daysPerWeek || 4} días por semana
- Equipo: ${profile.equipment || 'Gimnasio completo'}
- Notas / Lesiones: ${profile.injuriesNotes || 'Ninguna'}
- Nutrición de hoy: Consumidas ${todayNutrition.calories || 0} kcal / Meta: ${targetNutrition.calories || 2400} kcal | Proteínas: ${todayNutrition.protein || 0}g / Meta: ${targetNutrition.protein || 150}g.
- Rutina activa: ${activeRoutine ? activeRoutine.name : 'Torso / Pierna'}

CATÁLOGO OFICIAL EXCLUSIVO DE EJERCICIOS DE LA APLICACIÓN:
- ${officialExercises}

DIRECTIVAS Y LIMITACIONES OBLIGATORIAS:
1. LIMITACIÓN ESTRICTA DE EJERCICIOS: Solo puedes sugerir, programar o recomendar ejercicios que figuren en el "CATÁLOGO OFICIAL EXCLUSIVO" listado arriba. Tienes prohibido recomendar ejercicios externos que el usuario no pueda encontrar en la app.
2. LIMITACIÓN ESTRICTA DE NUTRICIÓN: Recomienda alimentos limpios, reales y medibles compatibles con la base de datos de la app (carnes vacunas magras, pechuga de pollo, pescado/atún, huevos, arroz, avena, papas, batatas, pastas, verduras, legumbres, frutas y suplementación con proteína whey o creatina).
3. RESPUESTAS GENUINAS Y DINÁMICAS: Responde exactamente a lo que el atleta te pregunta en su mensaje. Explica la técnica, rango de repeticiones (ej: 8-10 reps RIR 1-2), descanso recomendado (90-120s) y cómo sobrecargar progresivamente.
4. TONO: Formato Markdown deportivo con negritas, viñetas y emojis. Directo, profesional y motivador.`;
}

/**
 * Envía un mensaje al Coach Inteligente y obtiene la respuesta en tiempo real de Google Gemini.
 */
export async function askAiCoach(userMessage, conversationHistory = [], userContext = {}) {
  const apiKey = getGeminiApiKey();

  if (!apiKey) {
    return '⚠️ **No se detectó la clave de Google Gemini.**\n\nAsegúrate de tener configurada la variable `VITE_GEMINI_API_KEY` (o `GEMINI_API_KEY`) en tu panel de Vercel y haber hecho un nuevo Deploy, o pásamela para dejarla integrada de base en el proyecto.';
  }

  const systemInstruction = buildCoachSystemPrompt(userContext);

  const contents = [
    ...conversationHistory.map(msg => ({
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
    const timeoutId = setTimeout(() => controller.abort(), 8000);

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
