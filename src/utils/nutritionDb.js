// Base de datos nutricional oficial MyPowerUp y motor de cálculo automático en segundo plano

export const NUTRITIONAL_DATABASE = [
  // --- PROTEÍNAS (Por cada 100g) ---
  {
    id: 'pechuga_pollo',
    category: 'Proteínas',
    name: 'Pechuga de pollo (cocida)',
    calories: 165,
    protein: 31,
    baseGrams: 100,
    unitType: 'grams',
    servingNote: '100g cocida',
    aliases: [
      'pechuga de pollo',
      'pechuga de pollo cocida',
      'pechuga',
      'pechugas',
      'pollo cocido',
      'pollo a la plancha',
      'pollo al horno',
      'pechuga a la plancha',
      'pollo'
    ]
  },
  {
    id: 'huevo_entero',
    category: 'Proteínas',
    name: 'Huevo entero (aprox. 2 medianos)',
    calories: 155,
    protein: 13,
    baseGrams: 100,
    unitType: 'unit',
    unitName: 'huevo',
    unitWeight: 50, // 50g por huevo aprox -> 2 huevos = 100g = 155 kcal / 13g prot
    servingNote: '2 huevos (~100g)',
    aliases: [
      'huevo entero',
      'huevos enteros',
      'huevo',
      'huevos',
      'huevo duro',
      'huevos duros',
      'huevo revuelto',
      'huevos revueltos',
      'huevo frito',
      'huevos fritos',
      'omelette',
      'omelet'
    ]
  },
  {
    id: 'lomito_horneado',
    category: 'Proteínas',
    name: 'Lomito horneado (fetas)',
    calories: 120,
    protein: 20,
    baseGrams: 100,
    unitType: 'grams',
    unitName: 'feta',
    unitWeight: 20, // ~20g por feta
    servingNote: '100g (fetas)',
    aliases: [
      'lomito horneado',
      'lomito',
      'lomito en fetas',
      'fetas de lomito',
      'feta de lomito',
      'lomo horneado'
    ]
  },
  {
    id: 'queso_cremoso',
    category: 'Proteínas',
    name: 'Queso cremoso',
    calories: 300,
    protein: 22,
    baseGrams: 100,
    unitType: 'grams',
    servingNote: '100g',
    aliases: [
      'queso cremoso',
      'queso por salut',
      'queso cuartirolo',
      'queso fresco',
      'queso mantecoso',
      'queso port salut',
      'queso mozzarella',
      'muzzarella',
      'queso'
    ]
  },

  // --- CARBOHIDRATOS (Por cada 100g) ---
  {
    id: 'avena_tradicional',
    category: 'Carbohidratos',
    name: 'Avena (tradicional)',
    calories: 389,
    protein: 17,
    baseGrams: 100,
    unitType: 'grams',
    servingNote: '100g tradicional',
    aliases: [
      'avena tradicional',
      'avena',
      'avena en copos',
      'copos de avena',
      'avena instantanea',
      'avena instantánea',
      'porridge'
    ]
  },
  {
    id: 'fideos_pasta',
    category: 'Carbohidratos',
    name: 'Fideos / Pasta seca (crudos)',
    calories: 350,
    protein: 12,
    baseGrams: 100,
    unitType: 'grams',
    servingNote: '100g crudos',
    aliases: [
      'fideos',
      'fideo',
      'pasta seca',
      'pasta cruda',
      'pasta',
      'pastas',
      'tallarines',
      'espaguetis',
      'spaghetti',
      'macarrones',
      'tirabuzones',
      'moñitos'
    ]
  },
  {
    id: 'papa_hervida',
    category: 'Carbohidratos',
    name: 'Papa (hervida)',
    calories: 87,
    protein: 2,
    baseGrams: 100,
    unitType: 'grams',
    servingNote: '100g hervida',
    aliases: [
      'papa hervida',
      'papas hervidas',
      'papa cocida',
      'papas cocidas',
      'papa al horno',
      'papas al horno',
      'papa',
      'papas',
      'patata hervida',
      'patatas hervidas',
      'patata',
      'patatas',
      'pure de papa',
      'puré de papa'
    ]
  },
  {
    id: 'pan_masa_madre',
    category: 'Carbohidratos',
    name: 'Pan de masa madre',
    calories: 270,
    protein: 11,
    baseGrams: 100,
    unitType: 'grams',
    unitName: 'rebanada',
    unitWeight: 50,
    servingNote: '100g',
    aliases: [
      'pan de masa madre',
      'pan masa madre',
      'masa madre',
      'tostada de masa madre'
    ]
  },
  {
    id: 'pan_lactal',
    category: 'Carbohidratos',
    name: 'Pan lactal común',
    calories: 260,
    protein: 8,
    baseGrams: 100,
    unitType: 'grams',
    unitName: 'rodaja',
    unitWeight: 25, // 2 rodajas = ~50g
    servingNote: '100g',
    aliases: [
      'pan lactal comun',
      'pan lactal común',
      'pan lactal',
      'pan blanco',
      'pan de molde',
      'tostadas de pan lactal',
      'rodaja de pan',
      'rodajas de pan',
      'tostada',
      'tostadas',
      'pan'
    ]
  },
  {
    id: 'banana',
    category: 'Carbohidratos',
    name: 'Banana',
    calories: 89,
    protein: 1,
    baseGrams: 100,
    unitType: 'unit',
    unitName: 'banana',
    unitWeight: 100, // 1 banana mediana ~100g -> 89 kcal / 1g prot
    servingNote: '1 banana (~100g)',
    aliases: [
      'banana',
      'bananas',
      'platano',
      'plátano',
      'platanos',
      'plátanos'
    ]
  },

  // --- GRASAS (Por cada 100g) ---
  {
    id: 'mantequilla_mani',
    category: 'Grasas',
    name: 'Mantequilla de maní',
    calories: 588,
    protein: 25,
    baseGrams: 100,
    unitType: 'grams',
    unitName: 'cucharada',
    unitWeight: 15, // ~15g por cucharada -> ~88 kcal / 3.8g prot
    servingNote: '100g',
    aliases: [
      'mantequilla de mani',
      'mantequilla de maní',
      'pasta de mani',
      'pasta de maní',
      'crema de mani',
      'crema de maní',
      'mantequilla mani',
      'peanut butter'
    ]
  },

  // --- BATIDOS Y SUPLEMENTOS (Por porción) ---
  {
    id: 'whey_protein',
    category: 'Suplemento',
    name: 'Whey Protein (1 scoop de 30g)',
    calories: 120,
    protein: 24,
    baseGrams: 30,
    unitType: 'portion',
    unitName: 'scoop',
    unitWeight: 30,
    servingNote: '1 scoop (30g)',
    defaultMealType: 'suplementacion',
    aliases: [
      'whey protein',
      'whey',
      'proteina whey',
      'proteína whey',
      'proteina en polvo',
      'proteína en polvo',
      'scoop de proteina',
      'scoop de whey',
      'scoop whey',
      'proteina isolate',
      'proteína isolate',
      'suplemento proteico'
    ]
  },
  {
    id: 'batido_basico',
    category: 'Batido',
    name: 'Batido Básico (250ml leche desc. + 1 scoop)',
    calories: 205,
    protein: 32,
    baseGrams: 280,
    unitType: 'portion',
    unitName: 'batido',
    unitWeight: 280,
    servingNote: '250ml leche desc. + 1 scoop',
    defaultMealType: 'suplementacion',
    aliases: [
      'batido basico',
      'batido básico',
      'batido con leche',
      'batido proteina leche',
      'batido con leche descremada',
      'batido de proteina con leche',
      'shake basico',
      'shake básico'
    ]
  },
  {
    id: 'batido_volumen',
    category: 'Batido',
    name: 'Batido Volumen (1 scoop + leche + 1 banana)',
    calories: 295,
    protein: 33,
    baseGrams: 380,
    unitType: 'portion',
    unitName: 'batido',
    unitWeight: 380,
    servingNote: '1 scoop + leche + 1 banana',
    defaultMealType: 'suplementacion',
    aliases: [
      'batido volumen',
      'batido de volumen',
      'batido hipercalorico',
      'batido hipercalórico',
      'batido banana proteina',
      'shake volumen'
    ]
  }
];

/**
 * Normaliza una cadena quitando tildes, signos y convirtiendo a minúsculas
 */
function normalizeStr(str = '') {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Analiza el texto ingresado por el usuario en segundo plano (Back)
 * Detecta alimento de la base de datos y calcula calorías y proteínas proporcionales.
 * 
 * Ejemplos admitidos:
 * - "Pechuga de pollo" -> 165 kcal, 31g prot (base 100g)
 * - "200g pechuga de pollo" o "pechuga 200g" -> 330 kcal, 62g prot
 * - "3 huevos" o "huevos 3" -> 232 kcal, 19.5g prot (3 * 77.5 kcal, 3 * 6.5g)
 * - "2 bananas" -> 178 kcal, 2g prot
 * - "Avena 50g" -> 195 kcal, 8.5g prot
 * - "1 scoop de whey protein" o "2 scoops whey" -> 240 kcal, 48g prot
 * - "Batido volumen" -> 295 kcal, 33g prot
 * - "Mantequilla de maní 30g" -> 176 kcal, 7.5g prot
 */
export function estimateNutrition(rawText = '') {
  if (!rawText || typeof rawText !== 'string') {
    return { matched: false, calories: 0, protein: 0 };
  }

  const clean = normalizeStr(rawText);
  if (!clean) return { matched: false, calories: 0, protein: 0 };

  // 1. Extraer cantidad en gramos si existe (ej: "200g", "200 gr", "150 gramos", "0.5kg")
  let grams = null;
  const kgMatch = clean.match(/(?:^|\s)(\d+(?:[.,]\d+)?)\s*(?:kg|kilos?)\b/);
  if (kgMatch) {
    grams = parseFloat(kgMatch[1].replace(',', '.')) * 1000;
  } else {
    const gramMatch = clean.match(/(?:^|\s)(\d+(?:[.,]\d+)?)\s*(?:g|gr|grs|gramos?)\b/);
    if (gramMatch) {
      grams = parseFloat(gramMatch[1].replace(',', '.'));
    }
  }

  // 2. Extraer unidades específicas si existen (ej: "3 huevos", "2 bananas", "2 scoops", "2 fetas", "1 batido")
  let units = null;
  const unitMatch = clean.match(/(?:^|\s)(\d+(?:[.,]\d+)?)\s*(?:huevos?|bananas?|platanos?|scoops?|fetas?|rodajas?|rebanadas?|cucharadas?|porciones?|unidades?|u)\b/);
  if (unitMatch) {
    units = parseFloat(unitMatch[1].replace(',', '.'));
  } else {
    // Verificar si empieza con un número (ej: "2 huevos", "3 bananas", "1 pechuga")
    const leadingNumMatch = clean.match(/^(\d+(?:[.,]\d+)?)\s+([a-z].*)/);
    if (leadingNumMatch) {
      units = parseFloat(leadingNumMatch[1].replace(',', '.'));
    }
  }

  // 3. Buscar el mejor ítem coincidente en la base de datos
  let bestMatch = null;
  let highestScore = 0;

  for (const item of NUTRITIONAL_DATABASE) {
    for (const alias of item.aliases) {
      const normAlias = normalizeStr(alias);

      // Coincidencia exacta
      if (clean === normAlias) {
        const score = 1000 + normAlias.length;
        if (score > highestScore) {
          highestScore = score;
          bestMatch = item;
        }
      } 
      // Alias contenido como palabra clave completa
      else if (clean.includes(normAlias)) {
        const score = 500 + normAlias.length;
        if (score > highestScore) {
          highestScore = score;
          bestMatch = item;
        }
      }
      // O el texto del usuario está dentro del alias (si tiene más de 3 letras)
      else if (clean.length >= 4 && normAlias.includes(clean)) {
        const score = 200 + clean.length;
        if (score > highestScore) {
          highestScore = score;
          bestMatch = item;
        }
      }
    }
  }

  if (!bestMatch) {
    return { matched: false, calories: 0, protein: 0 };
  }

  // 4. Calcular calorías y proteínas proporcionales
  let calculatedCalories = 0;
  let calculatedProtein = 0;
  let calculationNote = '';

  // Caso A: Se especificaron gramos
  if (grams && grams > 0) {
    const ratio = grams / bestMatch.baseGrams;
    calculatedCalories = Math.round(bestMatch.calories * ratio);
    calculatedProtein = Math.round(bestMatch.protein * ratio * 10) / 10;
    calculationNote = `${grams}g calculados proporcionalmente`;
  }
  // Caso B: Se especificaron unidades/porciones
  else if (units && units > 0) {
    if (bestMatch.id === 'huevo_entero') {
      // 2 huevos = 155 kcal / 13g prot -> 1 huevo = 77.5 kcal / 6.5g prot
      calculatedCalories = Math.round(units * (155 / 2));
      calculatedProtein = Math.round(units * (13 / 2) * 10) / 10;
      calculationNote = `${units} ${units === 1 ? 'huevo' : 'huevos'}`;
    } else if (bestMatch.id === 'banana') {
      // 1 banana = 89 kcal / 1g prot
      calculatedCalories = Math.round(units * 89);
      calculatedProtein = Math.round(units * 1 * 10) / 10;
      calculationNote = `${units} ${units === 1 ? 'banana' : 'bananas'}`;
    } else if (bestMatch.id === 'whey_protein') {
      // 1 scoop = 120 kcal / 24g prot
      calculatedCalories = Math.round(units * 120);
      calculatedProtein = Math.round(units * 24 * 10) / 10;
      calculationNote = `${units} ${units === 1 ? 'scoop' : 'scoops'}`;
    } else if (bestMatch.id === 'pan_lactal' || bestMatch.id === 'pan_masa_madre') {
      const sliceWeight = bestMatch.unitWeight || 35;
      const totalGrams = units * sliceWeight;
      const ratio = totalGrams / bestMatch.baseGrams;
      calculatedCalories = Math.round(bestMatch.calories * ratio);
      calculatedProtein = Math.round(bestMatch.protein * ratio * 10) / 10;
      calculationNote = `${units} rodajas (~${totalGrams}g)`;
    } else if (bestMatch.id === 'lomito_horneado') {
      const sliceWeight = bestMatch.unitWeight || 20;
      const totalGrams = units * sliceWeight;
      const ratio = totalGrams / bestMatch.baseGrams;
      calculatedCalories = Math.round(bestMatch.calories * ratio);
      calculatedProtein = Math.round(bestMatch.protein * ratio * 10) / 10;
      calculationNote = `${units} fetas (~${totalGrams}g)`;
    } else if (bestMatch.id === 'mantequilla_mani') {
      const spoonWeight = bestMatch.unitWeight || 15;
      const totalGrams = units * spoonWeight;
      const ratio = totalGrams / bestMatch.baseGrams;
      calculatedCalories = Math.round(bestMatch.calories * ratio);
      calculatedProtein = Math.round(bestMatch.protein * ratio * 10) / 10;
      calculationNote = `${units} cdas (~${totalGrams}g)`;
    } else {
      // Multiplicador directo de porción
      calculatedCalories = Math.round(units * bestMatch.calories);
      calculatedProtein = Math.round(units * bestMatch.protein * 10) / 10;
      calculationNote = `${units} porciones`;
    }
  } 
  // Caso C: No se especificó cantidad -> usar porción por defecto de la base de datos
  else {
    calculatedCalories = bestMatch.calories;
    calculatedProtein = bestMatch.protein;
    calculationNote = bestMatch.servingNote || 'Porción estándar';
  }

  return {
    matched: true,
    item: bestMatch,
    calories: calculatedCalories,
    protein: calculatedProtein,
    category: bestMatch.category,
    defaultMealType: bestMatch.defaultMealType,
    calculationNote,
    originalName: bestMatch.name
  };
}
