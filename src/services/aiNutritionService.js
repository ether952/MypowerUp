import { estimateNutrition, NUTRITIONAL_DATABASE } from '../utils/nutritionDb.js';

// Cache en memoria para respuestas de IA de alimentos ya consultados
const nutritionCache = new Map();

// Modelos Gemini estables y soportados en orden de prioridad
const GEMINI_MODELS = [
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.8-flash',
  'gemini-flash-latest'
];

export const BUILTIN_GEMINI_KEY = '';

/**
 * Obtiene la API Key de Gemini desde variables de entorno o localStorage.
 */
export function getGeminiApiKey() {
  let buildKey = '';
  try {
    if (typeof __APP_GEMINI_KEY__ !== 'undefined' && __APP_GEMINI_KEY__) {
      buildKey = __APP_GEMINI_KEY__;
    }
  } catch (_) {}

  return (
    buildKey ||
    import.meta.env.VITE_GEMINI_API_KEY ||
    import.meta.env.GEMINI_API_KEY ||
    import.meta.env.GEMINI_KEY ||
    import.meta.env.key ||
    import.meta.env.KEY ||
    import.meta.env.GOOGLE_API_KEY ||
    import.meta.env.GOOGLE_GEMINI_API_KEY ||
    (typeof window !== 'undefined' ? localStorage.getItem('mypowerup_gemini_api_key') : '') ||
    BUILTIN_GEMINI_KEY
  ).trim();
}

/**
 * Guarda o actualiza la API Key de Gemini en localStorage.
 */
export function setGeminiApiKey(key) {
  if (typeof window === 'undefined') return;
  if (key && key.trim()) {
    localStorage.setItem('mypowerup_gemini_api_key', key.trim());
  } else {
    localStorage.removeItem('mypowerup_gemini_api_key');
  }
}

function parseJsonSafely(text) {
  if (!text || typeof text !== 'string') return null;
  let cleaned = text.trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      try {
        return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

/**
 * Estimador semántico inteligente offline para cuando no hay internet o API Key.
 * Reconoce multiplicadores, platos típicos y macronutrientes aproximados sin dar 0.
 */
export function estimateNutritionOfflineSmart(cleanText) {
  const text = cleanText.toLowerCase();

  // Multiplicadores numéricos (ej: "2 empanadas", "3 huevos", "200g")
  let quantity = 1;
  const numMatch = text.match(/(\d+(?:[.,]\d+)?)\s*(?:unidades|unidad|u|und|porciones|porcion|huevos|empanadas|rebanadas|bifes|platos)?/);
  if (numMatch && !text.includes('g ') && !text.includes('gr ') && !text.includes('ml')) {
    const parsed = parseFloat(numMatch[1].replace(',', '.'));
    if (parsed > 0 && parsed <= 20) quantity = parsed;
  }

  // Gramajes (ej: "200g de pollo", "150 gr")
  let gramsMultiplier = null;
  const gramsMatch = text.match(/(\d+)\s*(?:g|gr|gramos)\b/);
  if (gramsMatch) {
    const grams = parseInt(gramsMatch[1], 10);
    if (grams > 0) gramsMultiplier = grams / 100;
  }

  // Intentar primero con la base de datos local exacta
  const localMatch = estimateNutrition(cleanText);
  if (localMatch && localMatch.matched && localMatch.calories > 0) {
    return {
      calories: Math.round(localMatch.calories * (gramsMultiplier ? gramsMultiplier : 1)),
      protein: Math.round(localMatch.protein * (gramsMultiplier ? gramsMultiplier : 1) * 10) / 10,
      suggestedMealType: localMatch.defaultMealType || 'almuerzo',
      summary: cleanText,
      source: 'local'
    };
  }

  // Diccionario inteligente de platos comunes para respuesta realista inmediata
  const DISH_PRESETS = [
    { keys: ['milanesa', 'mila'], cal: 450, prot: 32, meal: 'almuerzo' },
    { keys: ['empanada'], cal: 260, prot: 10, meal: 'cena' },
    { keys: ['pizza'], cal: 270, prot: 11, meal: 'cena' },
    { keys: ['hamburguesa', 'burger'], cal: 620, prot: 34, meal: 'cena' },
    { keys: ['arroz', 'fideos', 'pasta'], cal: 350, prot: 9, meal: 'almuerzo' },
    { keys: ['pollo', 'suprema', 'pechuga'], cal: 220, prot: 38, meal: 'almuerzo' },
    { keys: ['carne', 'bife', 'asado', 'lomo'], cal: 320, prot: 36, meal: 'almuerzo' },
    { keys: ['huevo', 'huevos', 'omelet'], cal: 85, prot: 7, meal: 'desayuno' },
    { keys: ['atun', 'pescado', 'merluza'], cal: 180, prot: 32, meal: 'cena' },
    { keys: ['ensalada'], cal: 180, prot: 5, meal: 'almuerzo' },
    { keys: ['yogur', 'yogurt'], cal: 140, prot: 12, meal: 'merienda' },
    { keys: ['avena', 'porridge'], cal: 240, prot: 9, meal: 'desayuno' },
    { keys: ['proteina', 'whey', 'batido'], cal: 160, prot: 26, meal: 'suplementacion' },
    { keys: ['banana', 'platano'], cal: 105, prot: 1.3, meal: 'snack' },
    { keys: ['manzana', 'pera'], cal: 75, prot: 0.5, meal: 'snack' },
    { keys: ['tostada', 'pan'], cal: 120, prot: 4, meal: 'desayuno' },
    { keys: ['cafe con leche', 'cafe'], cal: 90, prot: 4, meal: 'desayuno' },
    { keys: ['budin', 'torta', 'alfajor'], cal: 320, prot: 5, meal: 'merienda' }
  ];

  for (const preset of DISH_PRESETS) {
    if (preset.keys.some(k => text.includes(k))) {
      const mult = gramsMultiplier || quantity;
      return {
        calories: Math.round(preset.cal * mult),
        protein: Math.round(preset.prot * mult * 10) / 10,
        suggestedMealType: preset.meal,
        summary: cleanText,
        source: 'local'
      };
    }
  }

  // Estimación genérica balanceada si no reconoce el plato específico
  const wordsCount = text.split(' ').length;
  const baseCalories = Math.min(850, Math.max(180, wordsCount * 120));
  const baseProtein = Math.min(45, Math.max(6, Math.round(baseCalories * 0.05)));

  return {
    calories: Math.round(baseCalories * (gramsMultiplier || quantity)),
    protein: Math.round(baseProtein * (gramsMultiplier || quantity) * 10) / 10,
    suggestedMealType: text.includes('desayun') ? 'desayuno' : text.includes('cen') ? 'cena' : 'almuerzo',
    summary: cleanText,
    source: 'local'
  };
}

/**
 * Consulta a la IA de Gemini para estimar calorías y proteínas en base a un texto natural de comida o plato.
 */
export async function estimateNutritionWithAI(foodText) {
  if (!foodText || typeof foodText !== 'string') {
    return { calories: 0, protein: 0, source: 'local' };
  }

  const cleanText = foodText.trim();
  if (cleanText.length < 2) {
    return { calories: 0, protein: 0, source: 'local' };
  }

  const cacheKey = cleanText.toLowerCase();
  if (nutritionCache.has(cacheKey)) {
    return { ...nutritionCache.get(cacheKey), cached: true };
  }

  const apiKey = getGeminiApiKey();

  // Si no hay API Key configurada, usar el estimador heurístico inteligente
  if (!apiKey) {
    const offlineResult = estimateNutritionOfflineSmart(cleanText);
    nutritionCache.set(cacheKey, offlineResult);
    return offlineResult;
  }

  const prompt = `Actúa como un nutricionista y experto en macronutrientes deportivos.
Analiza la siguiente comida, alimento o plato ingresado por el usuario:
"${cleanText}"

REGLAS DE CÁLCULO Y ESTIMACIÓN:
1. Cantidades y Multiplicadores:
   - Interpreta con máxima exactitud números, unidades, porciones y medidas (ejemplos: "2 und de...", "2 unidades", "3 rebanadas", "1 porción", "200g", "1 taza", "medio plato").
   - Si se indican 2 o más unidades (ej: "2 huevos", "2 porciones de budin"), calcula la suma total correspondiente al número indicado.
   - Si no se especifica cantidad, asume 1 porción estándar individual habitual.
2. Comprensión de modismos, errores de tipeo y recetas:
   - Tolera errores de tipeo comunes (ej: "mila" = milanesa, "budin de cafe" = budín dulce, "porcio" = porción).
3. Exactitud en calorías y proteínas:
   - NUNCA devuelvas 0 calorías ni 0g de proteína si el alimento contiene masa o nutrientes calóricos reales.
4. Tipo de comida sugerido:
   - Debe ser uno de: "desayuno", "almuerzo", "merienda", "cena", "snack" o "suplementacion".

Responde OBLIGATORIAMENTE con un objeto JSON plano sin texto adicional con esta estructura:
{
  "calories": 280,
  "protein": 5.2,
  "suggestedMealType": "merienda",
  "summary": "1 porción de budín de café"
}`;

  for (const modelName of GEMINI_MODELS) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    try {
      const cleanModel = modelName.replace(/^models\//, '');
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${cleanModel}:generateContent?key=${apiKey}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ],
          generationConfig: {
            temperature: 0.1
          }
        })
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        continue;
      }

      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!rawText) continue;

      const parsed = parseJsonSafely(rawText);
      if (!parsed) continue;

      const calories = Math.max(0, Math.round(Number(parsed.calories) || 0));
      const protein = Math.max(0, Math.round((Number(parsed.protein) || 0) * 10) / 10);

      const result = {
        calories,
        protein,
        suggestedMealType: parsed.suggestedMealType || undefined,
        summary: parsed.summary || cleanText,
        source: 'ai'
      };

      nutritionCache.set(cacheKey, result);
      return result;
    } catch (err) {
      clearTimeout(timeoutId);
      console.warn(`[MyPowerUp AI] Modelo ${modelName} no completado:`, err.message || err);
    }
  }

  // Fallback inteligente offline si fallaron los modelos de internet
  const fallback = estimateNutritionOfflineSmart(cleanText);
  nutritionCache.set(cacheKey, fallback);
  return fallback;
}
