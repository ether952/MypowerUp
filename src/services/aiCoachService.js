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

CATÁLOGO DE EJERCICIOS OFICIALES DE LA APP:
${exerciseNames}

REGLAS DE RESPUESTA:
1. Respuestas directas, concisas, estructuradas y con formato Markdown limpio (viñetas, negritas, emojis deportivos).
2. Si te preguntan sobre qué entrenar hoy o sobre un músculo, da una respuesta personalizada con series, repeticiones sugeridas y técnica.
3. Si te preguntan sobre qué comer, sugiere comidas reales con cantidades que se adapten a sus calorías y proteínas restantes.
4. Mantén un tono enérgico, profesional y enfocado en la sobrecarga progresiva sin lesiones.`;
}

/**
 * Envía un mensaje al Coach Inteligente y obtiene la respuesta en tiempo real.
 */
export async function askAiCoach(userMessage, conversationHistory = [], userContext = {}) {
  const apiKey = getGeminiApiKey();

  // Si hay API Key de Gemini configurada, consultar a los modelos de Gemini
  if (apiKey) {
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

    for (const model of GEMINI_MODELS) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7000);

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
                maxOutputTokens: 1000
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
        }
      } catch (err) {
        clearTimeout(timeoutId);
        console.warn(`[MyPowerUp Coach] Error con modelo ${model}:`, err.message || err);
      }
    }
  }

  // Motor Inteligente Heurístico Offline (Dinámico y adaptado al mensaje del usuario)
  return generateDynamicOfflineCoachResponse(userMessage, userContext);
}

/**
 * Motor de respuestas inteligentes offline del Coach MyPowerUp.
 * Analiza la intención semántica del usuario y responde con datos reales y variados.
 */
function generateDynamicOfflineCoachResponse(message, context = {}) {
  const text = (message || '').toLowerCase();
  const profile = context.profile || {};
  const todayNut = context.todayNutrition || { calories: 0, protein: 0 };
  const targetNut = context.targetNutrition || { calories: 2400, protein: 150 };

  const calLeft = Math.max(0, (targetNut.calories || 2400) - (todayNut.calories || 0));
  const protLeft = Math.max(0, (targetNut.protein || 150) - (todayNut.protein || 0));
  const weight = profile.weightKg || 75;

  // 1. Preguntas sobre MÚSCULOS ESPECÍFICOS
  if (text.includes('pecho') || text.includes('pectoral')) {
    return `### 🏋️ Consejos para Pecho & Hipertrofia
Para desarrollar pectorales con tu nivel actual:
* **Ejercicio Clave:** Press Banca Plano con barra (4 series × 6-8 reps pesadas con parada de 1 seg en el pecho).
* **Aislamiento Superior:** Cruces en polea a 30° o Press Inclinado con mancuernas (3 series × 10-12 reps buscando estiramiento profundo).
* **Foco técnico:** Retrae las escápulas y mantén los codos a 45-60 grados respecto al torso para proteger los hombros.`;
  }

  if (text.includes('espalda') || text.includes('dorsal') || text.includes('remo')) {
    return `### 🦅 Enfoque para Espalda Ancha y Densa
* **Amplitud (Dorsal ancho):** Jalón al pecho con agarre neutro o dominadas (4 series × 8-10 reps, enfocándote en llevar los codos hacia los bolsillos).
* **Densidad (Trapecios y Romboides):** Remo con barra o remo en polea baja con agarre prono (3 series × 8-10 reps con 1 segundo de contracción).
* **Tip del Coach:** Usa correas (straps) si el agarre de tus antebrazos te limita antes de fatigar la espalda.`;
  }

  if (text.includes('pierna') || text.includes('cuadriz') || text.includes('sentadilla') || text.includes('glute')) {
    return `### 🦵 Protocolo de Piernas de Alto Impacto
* **Cuádriceps:** Sentadilla Hack o Sentadilla con barra libre (4 series × 6-8 reps bajando profundo hasta romper el paralelo).
* **Cadena Posterior:** Prensa inclinada 45° con pies arriba + Curl femoral acostado (3 series × 10-12 reps controlando 3 segundos la bajada).
* **Gemelos:** Elevación de talones de pie (4 series × 12-15 reps con 2 seg de pausa abajo para eliminar el rebote del tendón).`;
  }

  if (text.includes('brazo') || text.includes('bicep') || text.includes('tricep')) {
    return `### 💪 Claves de Brazos (Bíceps & Tríceps)
* **Tríceps (60% del brazo):** Extensiones en polea con cuerda (3×12) + Press Francés con barra Z (3×8-10).
* **Bíceps:** Curl con barra recta de pie (3×8 pesadas) + Curl Inclinado con mancuernas a 45° (3×10-12 para estirar la cabeza larga).
* **Frecuencia:** Los brazos responden genial a frecuencia 2 por semana con volumen moderado.`;
  }

  // 2. Preguntas sobre NUTRICIÓN / COMIDAS ESPECÍFICAS
  if (text.includes('desayun')) {
    return `### 🍳 Desayuno Recomendado para ${profile.goal || 'Fuerza'}
* **Opción A (Rápida):** 3 huevos enteros revueltos con 2 rebanadas de pan integral tostado y café solo (*~360 kcal | 24g prot*).
* **Opción B (Energética):** 60g de avena cocida con leche, 1 scoop de Whey Protein (30g) y 1 banana cortada (*~460 kcal | 36g prot*).`;
  }

  if (text.includes('cen') || text.includes('noche')) {
    return `### 🌙 Cena Equilibrada para Recuperación Nocturna
Estado de hoy: Te quedan **${calLeft} kcal** y **${protLeft}g de proteína**.
* **Plato Sugerido:** 200g de pechuga de pollo, lomo magro o merluza a la plancha con una porción de papas al horno o batata y ensalada con una cucharadita de aceite de oliva (*~480 kcal | 42g prot*).
* **Beneficio:** Aporta aminoácidos de lenta absorción para favorecer la reparación de fibras mientras duermes.`;
  }

  if (text.includes('post') || text.includes('despues de entrenar')) {
    return `### ⚡ Nutrición Post-Entrenamiento
La ventana anabólica es flexible, pero comer dentro de las 2 horas post-sesión optimiza el glucógeno:
* **Batido Rápido:** 30g de proteína en polvo con agua o leche descremada + 1 banana o manzana (*~250 kcal | 26g prot*).
* **Comida Sólida:** 1 lata de atún al natural con 150g de arroz blanco o puré de papas (*~340 kcal | 32g prot*).`;
  }

  if (text.includes('comer') || text.includes('comida') || text.includes('hambre') || text.includes('dieta')) {
    return `### 🥗 Sugerencia Nutricional MyPowerUp
Para tu meta de **${profile.goal || 'Hipertrofia'}** y peso de **${weight} kg**:
* **Estado diario:** Te restan aprox. **${calLeft} kcal** y **${protLeft}g de proteína**.
* **Estrategia:** Divide tu proteína en 3 a 4 comidas de 30-40g.
* **Opciones recomendadas:** Pollo, carne vacuna magra, huevos, atún, yogur griego y legumbres combinadas con arroz.`;
  }

  // 3. SUPLEMENTOS
  if (text.includes('creatina')) {
    return `### 🔬 Guía de Creatina Monohidrato
* **Dosis diaria:** Toma **${Math.round(weight * 0.08 * 10) / 10}g** diarios (la regla general es 5g por día).
* **Momento:** Tómala todos los días, incluso los días que no entrenas. El momento no es crítico (lo importante es la constancia para saturar los depósitos de fosfocreatina).
* **Fase de carga:** No es necesaria; con 5g diarios tus depósitos se saturan en 3 semanas sin malestar estomacal.`;
  }

  // 4. SOBRECARGA / SERIES / ESTANCAMIENTO
  if (text.includes('peso') || text.includes('serie') || text.includes('repe') || text.includes('sobrecarga') || text.includes('estancad')) {
    return `### 📈 Cómo Progresar sin Estancarte
1. **Regla de Doble Progresión:** Si tu rango es de 8 a 10 reps, mantén el peso hasta que logres 10 reps en TODAS las series con buena técnica.
2. **Incrementos Pequeños:** Una vez que domines las repeticiones, sube **1.25 a 2.5 kg** totales.
3. **Descanso Real:** En ejercicios compuestos pesados, descansa al menos **90 a 120 segundos** para permitir la resíntesis de ATP.`;
  }

  // 5. RESPUESTA GENERAL
  return `### 🤖 Asesoría Personalizada MyPowerUp
Analicé tu consulta sobre **"${message.trim()}"**. 

Teniendo en cuenta tus datos (**${profile.goal || 'Fuerza'}**, **${weight} kg**, **${profile.daysPerWeek || 4} días/sem**):
* **Recomendación inmediata:** Enfócate en ejecutar cada serie con rango de movimiento completo y registrarla en tu **Diario** o en el modo **En Vivo**.
* **Nutrición:** Te quedan **${calLeft} kcal** y **${protLeft}g de proteína** para completar el día con éxito.

¿Quieres que profundicemos en algún músculo específico, que te arme un menú para hoy o que analicemos tu progreso de fuerza?`;
}
