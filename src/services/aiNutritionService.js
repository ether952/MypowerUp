import { estimateNutrition } from '../utils/nutritionDb.js';

// Cache en memoria para respuestas de IA de alimentos ya consultados
const nutritionCache = new Map();

// Modelos Gemini en orden de prioridad
const GEMINI_MODELS = [
  'models/gemini-3.5-flash-lite',
  'models/gemini-3.5-flash',
  'models/gemini-flash-latest',
  'models/gemini-flash-lite-latest',
  'models/gemini-3-flash-preview'
];

/**
 * Obtiene la API Key de Gemini desde variables de entorno o localStorage.
 */
export function getGeminiApiKey() {
  return (
    import.meta.env.VITE_GEMINI_API_KEY ||
    localStorage.getItem('mypowerup_gemini_api_key') ||
    ''
  ).trim();
}

/**
 * Guarda o actualiza la API Key de Gemini en localStorage (opcional para el usuario).
 */
export function setGeminiApiKey(key) {
  if (key) {
    localStorage.setItem('mypowerup_gemini_api_key', key.trim());
  } else {
    localStorage.removeItem('mypowerup_gemini_api_key');
  }
}

/**
 * Consulta a la IA de Gemini para estimar calorías y proteínas en base a un texto natural de comida o plato.
 * Si falla o no hay key, recurre a la base de datos local (fallback).
 * 
 * @param {string} foodText Descripción del plato (ej: "Hamburguesa con doble carne y cheddar + bacon y papas fritas")
 * @returns {Promise<{ calories: number, protein: number, suggestedMealType?: string, summary?: string, source: 'ai' | 'local' }>}
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

  if (!apiKey) {
    // Si no hay API key configurada, usar el estimador local
    const local = estimateNutrition(cleanText);
    return {
      calories: local.calories || 0,
      protein: local.protein || 0,
      suggestedMealType: local.defaultMealType,
      source: 'local'
    };
  }

  const prompt = `Actúa como un nutricionista y experto en macronutrientes.
Analiza la siguiente comida, plato o alimento ingresado por el usuario:
"${cleanText}"

Calcula una estimación realista y precisa de:
1. Calorías totales (kcal, número entero).
2. Proteínas totales (g, número entero o con 1 decimal).
3. Tipo de comida sugerido ("desayuno", "almuerzo", "merienda", "cena", "snack" o "suplementacion").
4. Breve resumen de lo detectado (máx 6 palabras).

Ten en cuenta los ingredientes, tamaños de porción estándar, guarniciones y agregados habituales (aceites, salsas, pan, etc.).
Responde OBLIGATORIAMENTE en formato JSON exacto con la siguiente estructura:
{
  "calories": 1150,
  "protein": 55,
  "suggestedMealType": "almuerzo",
  "summary": "Hamburguesa doble con bacon y papas"
}`;

  for (const modelName of GEMINI_MODELS) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent?key=${apiKey}`;
      const response = await fetch(endpoint, {
        method: 'POST',
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
            responseMimeType: 'application/json',
            temperature: 0.1
          }
        })
      });

      if (!response.ok) {
        // Si el modelo da 503 o 404, intentar con el siguiente modelo de la lista
        continue;
      }

      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!rawText) continue;

      const parsed = JSON.parse(rawText);
      const calories = Math.max(0, Math.round(Number(parsed.calories) || 0));
      const protein = Math.max(0, Math.round((Number(parsed.protein) || 0) * 10) / 10);

      const result = {
        calories,
        protein,
        suggestedMealType: parsed.suggestedMealType || undefined,
        summary: parsed.summary || cleanText,
        source: 'ai'
      };

      // Guardar en cache para evitar reconsultas innecesarias
      nutritionCache.set(cacheKey, result);
      return result;
    } catch (err) {
      console.warn(`Error consultando ${modelName}:`, err);
      // Continuar con el siguiente modelo
    }
  }

  // Si todos los modelos de IA fallaron, fallback local transparente
  const local = estimateNutrition(cleanText);
  return {
    calories: local.calories || 0,
    protein: local.protein || 0,
    suggestedMealType: local.defaultMealType,
    source: 'local'
  };
}
