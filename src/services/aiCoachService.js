import { getGeminiApiKey } from './aiNutritionService.js';
import { GYM_EXERCISES_SPRITES } from '../components/VisualGymExercisePicker.jsx';

const GEMINI_MODELS = [
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-2.0-flash-lite',
  'gemini-1.5-pro'
];

/**
 * Construye el prompt de sistema especializado para el Coach Deportivo de MyPowerUp.
 */
function buildCoachSystemPrompt(userContext = {}) {
  const {
    profile = {},
    todayNutrition = {},
    targetNutrition = {},
    recentWorkouts = [],
    activeRoutine = null
  } = userContext;

  const exerciseNames = GYM_EXERCISES_SPRITES.map(e => `${e.name} (${e.category})`).join(', ');

  return `Eres el "Coach Inteligente de MyPowerUp", un entrenador personal y nutricionista deportivo de élite, empático, motivador, científico y altamente práctico.

ESTADO ACTUAL DEL ATLETA:
- Objetivo: ${profile.goal || 'Hipertrofia / Ganancia muscular'}
- Peso: ${profile.weightKg || 75} kg | Altura: ${profile.heightCm || 175} cm | Nivel: ${profile.experienceLevel || 'Intermedio'}
- Días de entrenamiento disponibles: ${profile.daysPerWeek || 4} días por semana
- Equipo: ${profile.equipment || 'Gimnasio completo'}
- Notas / Lesiones: ${profile.injuriesNotes || 'Ninguna'}
- Nutrición de hoy: Consumidas ${todayNutrition.calories || 0} kcal / Meta: ${targetNutrition.calories || 2400} kcal | Proteínas: ${todayNutrition.protein || 0}g / Meta: ${targetNutrition.protein || 150}g.
- Rutina activa: ${activeRoutine ? activeRoutine.name : 'Torso / Pierna'}

CATÁLOGO DE EJERCICIOS OFICIALES DE LA APP (Recomienda preferentemente estos para que el usuario pueda registrarlos y ver sus animaciones 3D):
${exerciseNames}

REGLAS DE RESPUESTA:
1. Respuestas concisas, estructuradas y con formato Markdown limpio (viñetas, negritas, emojis deportivos).
2. Si te preguntan sobre qué entrenar hoy, analiza el día y recomienda la sesión con series, repeticiones efectivas (RIR 1-2) y descansos.
3. Si te preguntan sobre qué comer, sugiere alimentos reales y recetas rápidas que encajen en sus calorías y proteínas restantes.
4. Siempre da alternativas a ejercicios si el usuario siente dolor o una máquina está ocupada.
5. Mantén un tono enérgico, profesional y enfocado en el progreso continuo y sobrecarga progresiva sin lesiones.`;
}

/**
 * Envía un mensaje al Coach Inteligente y obtiene la respuesta en tiempo real.
 */
export async function askAiCoach(userMessage, conversationHistory = [], userContext = {}) {
  const apiKey = getGeminiApiKey();

  // Si hay API Key de Gemini configurada, consultar a los modelos de Gemini
  if (apiKey) {
    const systemInstruction = buildCoachSystemPrompt(userContext);

    // Preparar historial de chat en formato Gemini contents
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

    for (const model of GEMINI_MODELS) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
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

        if (response.ok) {
          const data = await response.json();
          const candidate = data.candidates?.[0];
          const text = candidate?.content?.parts?.[0]?.text;
          if (text) {
            return text.trim();
          }
        }
      } catch (err) {
        console.warn(`[MyPowerUp Coach] Error con modelo ${model}:`, err);
      }
    }
  }

  // Fallback Inteligente Offline del Coach MyPowerUp
  return generateOfflineCoachResponse(userMessage, userContext);
}

/**
 * Motor de respuestas inteligentes offline del Coach para cuando no hay conexión a API.
 */
function generateOfflineCoachResponse(message, context = {}) {
  const text = (message || '').toLowerCase();
  const profile = context.profile || {};
  const todayNut = context.todayNutrition || { calories: 0, protein: 0 };
  const targetNut = context.targetNutrition || { calories: 2400, protein: 150 };

  const calLeft = Math.max(0, (targetNut.calories || 2400) - (todayNut.calories || 0));
  const protLeft = Math.max(0, (targetNut.protein || 150) - (todayNut.protein || 0));

  // 1. Nutrición / Qué comer
  if (text.includes('comer') || text.includes('alimento') || text.includes('hambre') || text.includes('cena') || text.includes('desayuno') || text.includes('merienda') || text.includes('post') || text.includes('pre')) {
    return `### 🥗 Sugerencia Nutricional MyPowerUp

Para tu objetivo de **${profile.goal || 'Hipertrofia'}** (${profile.weightKg || 75} kg):

* **Estado de hoy:** Te faltan aprox. **${calLeft} kcal** y **${protLeft}g de proteína** para completar tu meta.

#### Opciones ideales:
1. **Opción Rápida Post-Entreno:** Batido de proteína Whey (30g) con 1 banana y 40g de avena (*~380 kcal | 32g prot*).
2. **Comida Completa:** 200g de pechuga de pollo o carne magra con 150g de arroz integral o papa al horno y ensalada verde con aceite de oliva (*~550 kcal | 46g prot*).
3. **Snack Proteico Nocturno:** 200g de yogur griego natural con un puñado de nueces y frutos rojos (*~240 kcal | 20g prot*).

> **Consejo del Coach:** Distribuye la proteína en 3 a 5 tomas diarias de 25-40g para maximizar la síntesis proteica muscular.`;
  }

  // 2. Qué me toca hoy / Rutina
  if (text.includes('hoy') || text.includes('rutina') || text.includes('entren') || text.includes('toca') || text.includes('ejercicio')) {
    return `### ⚡ Plan de Entrenamiento Recomendado

Basado en tu frecuencia de **${profile.daysPerWeek || 4} días semanales** y nivel **${profile.experienceLevel || 'Intermedio'}**:

#### 🏋️‍♂️ Estructura Clave de la Sesión:
1. **Calentamiento (5-8 min):** Movilidad articular de hombros/caderas y 2 series de aproximación con barra vacía.
2. **Básicos Pesados:** 4 series de 6-8 repeticiones con RIR 1-2 (descanso 2-3 min).
3. **Accesorios & Aislamiento:** 3 series de 10-12 reps buscando bombeo muscular y tensión mecánica (descanso 60-90s).

> **Enfoque de Sobrecarga:** Si en la última serie completaste el rango alto de repeticiones con buena técnica, sube **1.25 a 2.5 kg** la próxima semana. Puedes ver y editar tus ejercicios en la sección de **Rutinas**.`;
  }

  // 3. Sobrecarga / Estancamiento / Fuerza
  if (text.includes('fuerza') || text.includes('estancad') || text.includes('peso') || text.includes('progres') || text.includes('1rm')) {
    return `### 📈 Claves para Superar el Estancamiento

1. **Microcargas:** Sube el peso de a 1 kg a 2.5 kg totales. Los saltos de 5-10 kg fatigan el sistema nervioso antes de tiempo.
2. **Progresión Doble:** Primero domina las repeticiones (ej: pasar de 4x8 a 4x10 con el mismo peso) y recién luego aumenta la carga.
3. **Descanso entre series:** No te apures. En sentadilla, press banca y peso muerto, descansa **2 a 3 minutos completos** para recuperar ATP.
4. **Deload / Semana de descarga:** Cada 6 a 8 semanas, reduce el volumen a la mitad para disipar fatiga y regresar con nuevos récords personales.`;
  }

  // 4. Dolor / Molestia / Reemplazo
  if (text.includes('dolor') || text.includes('molestia') || text.includes('hombro') || text.includes('espalda') || text.includes('rodilla') || text.includes('reemplaz')) {
    return `### 🛡️ Recomendación de Cuidado Articular & Reemplazos

* **Regla de Oro:** Nunca entrenes a través de un dolor punzante o articular.
* **Si te molesta el Press Banca con Barra:** Cambia a **Press con Mancuernas con agarre neutro** o **Cruces en Poleas**, que permiten una trayectoria libre para los hombros.
* **Si te molestan las rodillas en Sentadilla:** Reemplaza temporalmente por **Prensa Inclinada 45°** o **Zancadas**, controlando el descenso en 3 segundos.
* **Calentamiento de manguito rotador:** Agrega 2 series de rotaciones externas en polea o con mancuerna ligera antes de empujes.`;
  }

  // Respuesta general de motivación y guía
  return `### 🤖 Coach MyPowerUp a tu servicio

¡Excelente pregunta! Estoy analizando tu perfil actual (**${profile.goal || 'Hipertrofia'}** | **${profile.weightKg || 75} kg** | **${profile.daysPerWeek || 4} días/sem**).

Recuerda que los 3 pilares del progreso son:
1. **Tensión Mecánica:** Registrar tus series y repeticiones en el **Diario** para asegurar sobrecarga progresiva.
2. **Nutrición Precisa:** Cumplir tus gramos diarios de proteína (*${targetNut.protein || 150}g*).
3. **Descanso de Calidad:** 7-8 horas de sueño profundo para permitir la hipertrofia.

¿Quieres que te arme una recomendación específica de comidas para hoy, que te ayude a ajustar un ejercicio o que analicemos tu rutina actual?`;
}
