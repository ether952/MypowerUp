import { getGeminiApiKey, setGeminiApiKey } from './aiNutritionService.js';

// Modelos Gemini con soporte de visión multimodal en orden de prioridad y velocidad
const VISION_MODELS = [
  'gemini-3-flash-preview',
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-3.1-flash-lite',
  'gemini-flash-latest'
];

/**
 * Comprime y redimensiona una imagen (File o Blob) en el cliente usando HTML5 Canvas.
 * Reduce fotos pesadas de cámara (15-20MB) a ~80-120KB en formato JPEG optimizado.
 * Retorna { dataUrl, cleanBase64, mimeType, width, height }
 */
export async function compressImageForAI(file, maxDimension = 900, quality = 0.80) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('No se pudo inicializar el contexto de imagen.'));
          return;
        }

        // Fondo blanco para imágenes con transparencia
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        const mimeType = 'image/jpeg';
        const dataUrl = canvas.toDataURL(mimeType, quality);
        const cleanBase64 = dataUrl.replace(/^data:image\/\w+;base64,/, '');

        resolve({
          dataUrl,
          cleanBase64,
          mimeType,
          width,
          height
        });
      };

      img.onerror = () => reject(new Error('Error al decodificar la imagen seleccionada.'));
      img.src = event.target.result;
    };

    reader.onerror = () => reject(new Error('Error al leer el archivo de la cámara.'));
    reader.readAsDataURL(file);
  });
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
 * Envía una imagen a Gemini Vision para identificar alimentos y calcular macronutrientes.
 */
export async function scanFoodWithGemini(cleanBase64, mimeType = 'image/jpeg') {
  const apiKey = getGeminiApiKey();

  if (!apiKey) {
    return {
      success: false,
      errorType: 'KEY_REQUIRED',
      message: 'Se requiere una API Key de Google Gemini para escanear alimentos con la cámara.'
    };
  }

  const prompt = `Actúa como un nutricionista y experto en análisis visual de alimentos para atletas y fitness.
Analiza con máxima atención la imagen adjunta.

REGLAS DE ANÁLISIS:
1. Si la imagen NO contiene alimentos ni bebidas (por ejemplo objetos, personas, paisajes, fondo vacío o imágenes sin comida), responde con:
   {"isFood": false, "error": "No se detectó ningún alimento ni plato reconocible en la foto"}

2. Si es un plato servido o preparación:
   - Identifica el plato o los alimentos principales presentes (ej: "Pechuga de pollo a la plancha con arroz blanco y ensalada").
   - Estima el peso total aproximado de la porción en gramos estándar de comida servida (ej: 350g).
   - Calcula las calorías totales del plato completo (suma de todos los ingredientes visibles).
   - Calcula las proteínas (g), carbohidratos (g) y grasas (g) totales.
   - Indica el momento ideal sugerido del día ("desayuno", "almuerzo", "merienda", "cena", "snack" o "suplementacion").

3. Si es un producto envasado (yogur, lata de atún, paquete):
   - Si la etiqueta o tabla nutricional es legible, extrae los datos exactos.
   - Si no es legible pero se reconoce la marca/producto, estima los valores de la porción habitual.

Responde OBLIGATORIAMENTE con un único objeto JSON plano sin texto adicional con esta estructura:
{
  "isFood": true,
  "foodName": "Pechuga de pollo con puré de papas",
  "calories": 420,
  "protein": 38.5,
  "carbs": 34.0,
  "fat": 9.5,
  "portionGrams": 320,
  "portionDescription": "1 plato mediano (~320g)",
  "suggestedMealType": "almuerzo",
  "confidence": "alta",
  "notes": "Estimación basada en pechuga ~160g y puré ~160g",
  "ingredients": ["Pechuga de pollo", "Puré de papas"]
}`;

  let lastErrorMessage = '';
  let isKeyIssue = false;

  for (const modelName of VISION_MODELS) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(new Error('TIMEOUT')), 25000);

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
              parts: [
                { text: prompt },
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: cleanBase64
                  }
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.15
          }
        })
      });

      clearTimeout(timeoutId);

      if (response.status === 403 || response.status === 401) {
        isKeyIssue = true;
        const errJson = await response.json().catch(() => null);
        lastErrorMessage = errJson?.error?.message || 'API Key de Gemini no autorizada o expirada.';
        break; // No tiene sentido probar otros modelos si la key fue rechazada
      }

      if (!response.ok) {
        const errJson = await response.json().catch(() => null);
        lastErrorMessage = errJson?.error?.message || `Error HTTP ${response.status}`;
        continue;
      }

      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!rawText) continue;

      const parsed = parseJsonSafely(rawText);
      if (!parsed) continue;

      if (parsed.isFood === false) {
        return {
          success: false,
          errorType: 'NOT_FOOD',
          message: parsed.error || 'No se detectó ningún alimento en la imagen tomada.'
        };
      }

      const calories = Math.max(0, Math.round(Number(parsed.calories) || 0));
      const protein = Math.max(0, Math.round((Number(parsed.protein) || 0) * 10) / 10);
      const carbs = Math.max(0, Math.round((Number(parsed.carbs) || 0) * 10) / 10);
      const fat = Math.max(0, Math.round((Number(parsed.fat) || 0) * 10) / 10);
      const portionGrams = Math.max(1, Math.round(Number(parsed.portionGrams) || 100));

      return {
        success: true,
        data: {
          foodName: parsed.foodName || 'Alimento detectado',
          calories,
          protein,
          carbs,
          fat,
          portionGrams,
          portionDescription: parsed.portionDescription || `${portionGrams}g`,
          suggestedMealType: parsed.suggestedMealType || 'almuerzo',
          confidence: parsed.confidence || 'media',
          notes: parsed.notes || '',
          ingredients: Array.isArray(parsed.ingredients) ? parsed.ingredients : [],
          source: 'gemini-vision',
          modelUsed: cleanModel
        }
      };
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError' || err.message === 'TIMEOUT' || err.message?.includes('aborted') || err.message?.includes('abort')) {
        lastErrorMessage = 'El análisis de la imagen tardó demasiado. Por favor intenta de nuevo con el plato centrado.';
      } else {
        lastErrorMessage = err.message || 'Error de red al conectar con Gemini';
      }
    }
  }

  if (isKeyIssue) {
    return {
      success: false,
      errorType: 'KEY_INVALID',
      message: lastErrorMessage || 'Tu clave de Google Gemini no es válida o necesita ser renovada.'
    };
  }

  return {
    success: false,
    errorType: 'SERVER_ERROR',
    message: lastErrorMessage || 'No se pudo procesar la imagen con Gemini Vision. Verifica tu conexión a internet.'
  };
}

/**
 * Alimentos de muestra precargados para testeo rápido o demostración sin cámara.
 */
export const SAMPLE_FOOD_SCANS = [
  {
    foodName: 'Pechuga de Pollo con Arroz y Brócoli',
    calories: 460,
    protein: 44,
    carbs: 48,
    fat: 6.5,
    portionGrams: 350,
    portionDescription: '1 plato mediano completo (~350g)',
    suggestedMealType: 'almuerzo',
    ingredients: ['Pechuga de pollo a la plancha 180g', 'Arroz blanco cocido 120g', 'Brócoli al vapor 50g'],
    notes: 'Excelente relación proteica y bajo en grasas saturadas.'
  },
  {
    foodName: 'Huevos Revueltos con Tostadas Integrales y Palta',
    calories: 390,
    protein: 22,
    carbs: 28,
    fat: 21,
    portionGrams: 220,
    portionDescription: 'Desayuno estándar (3 huevos + 2 tostadas)',
    suggestedMealType: 'desayuno',
    ingredients: ['3 huevos revueltos', '2 tostadas de pan integral', '1/4 de palta'],
    notes: 'Rico en grasas saludables y colina.'
  },
  {
    foodName: 'Bife de Carne Vacuna con Ensalada Mixta',
    calories: 520,
    protein: 48,
    carbs: 8,
    fat: 32,
    portionGrams: 300,
    portionDescription: '1 bife mediano (~200g) + ensalada',
    suggestedMealType: 'cena',
    ingredients: ['Bife de cuadril / lomo 200g', 'Lechuga, tomate y cebolla 100g', 'Aceite de oliva 1 cda'],
    notes: 'Aporte alto de hierro hemo y creatina natural.'
  }
];
