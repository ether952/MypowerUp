import { estimateNutrition } from '../utils/nutritionDb.js';

// Cache en memoria para respuestas de IA de alimentos ya consultados
const nutritionCache = new Map();

// Modelos Gemini estables y soportados en orden de prioridad
const GEMINI_MODELS = [
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-2.0-flash-lite',
  'gemini-1.5-flash-8b',
  'gemini-1.5-pro'
];

/**
 * Obtiene la API Key de Gemini desde variables de entorno o localStorage.
 */
export function getGeminiApiKey() {
  return (
    import.meta.env.VITE_GEMINI_API_KEY ||
    import.meta.env.GEMINI_API_KEY ||
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
Analiza la siguiente comida, alimento o plato ingresado por el usuario:
"${cleanText}"

REGLAS DE CÁLCULO Y ESTIMACIÓN:
1. Cantidades y Multiplicadores:
   - Interpreta con máxima exactitud números, unidades, porciones y medidas (ejemplos: "2 und de...", "2 unidades", "3 rebanadas", "1 porción", "200g", "1 taza", "medio plato").
   - Si se indican 2 o más unidades (ej: "2 huevos", "2 porciones de budin"), calcula la suma total correspondiente al número indicado.
   - Si no se especifica cantidad, asume 1 porción estándar individual habitual.
2. Comprensión de modismos, errores de tipeo (typos) y platos:
   - Tolera errores de tipeo comunes (ej: "porcio" = porción, "budin de cafe" = budín dulce con sabor a café que contiene harina, azúcar, grasa/manteca y huevo).
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
            responseMimeType: 'application/json',
            temperature: 0.1
          }
        })
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        // Si el modelo falla por rate-limit (429) o no disponible (503/404), intentar con el siguiente modelo
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

      // Guardar en cache para evitar reconsultas idénticas
      nutritionCache.set(cacheKey, result);
      return result;
    } catch (err) {
      clearTimeout(timeoutId);
      console.warn(`Intento con modelo ${modelName} no completado:`, err.message || err);
      // Continuar con el siguiente modelo
    }
  }

  // Si todos los modelos de IA fallaron, fallback local
  const local = estimateNutrition(cleanText);
  return {
    calories: local.calories || 0,
    protein: local.protein || 0,
    suggestedMealType: local.defaultMealType,
    source: 'local'
  };
}

