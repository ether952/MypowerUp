// Base de datos nutricional oficial MyPowerUp y motor de cálculo inteligente offline & online

export const NUTRITIONAL_DATABASE = [
  // =========================================================================
  // 1. PROTEÍNAS & CARNES
  // =========================================================================
  {
    id: 'pechuga_pollo',
    category: 'Proteínas',
    name: 'Pechuga de pollo (cocida)',
    calories: 165,
    protein: 31,
    baseGrams: 100,
    unitType: 'grams',
    servingNote: '100g cocida',
    defaultMealType: 'almuerzo',
    aliases: [
      'pechuga de pollo', 'pechuga de pollo cocida', 'pechuga', 'pechugas',
      'pollo cocido', 'pollo a la plancha', 'pollo al horno', 'pechuga a la plancha',
      'pollo', 'suprema de pollo', 'suprema'
    ]
  },
  {
    id: 'pata_muslo_pollo',
    category: 'Proteínas',
    name: 'Pata y muslo de pollo (sin piel)',
    calories: 180,
    protein: 24,
    baseGrams: 100,
    unitType: 'unit',
    unitName: 'pata muslo',
    unitWeight: 150,
    servingNote: '1 unidad (~150g)',
    defaultMealType: 'almuerzo',
    aliases: ['pata muslo', 'pata y muslo', 'muslo de pollo', 'pata de pollo', 'muslo']
  },
  {
    id: 'carne_vacuna_magra',
    category: 'Proteínas',
    name: 'Carne vacuna magra (Lomo / Cuadril / Nalga)',
    calories: 170,
    protein: 26,
    baseGrams: 100,
    unitType: 'grams',
    servingNote: '100g cocido',
    defaultMealType: 'almuerzo',
    aliases: [
      'carne magra', 'carne vacuna', 'lomo', 'bife de lomo', 'cuadril', 'bife de cuadril',
      'nalga', 'bife', 'bifes', 'carne picada especial', 'peceto', 'bife de chorizo'
    ]
  },
  {
    id: 'carne_picada_comun',
    category: 'Proteínas',
    name: 'Carne picada / Hamburguesa casera',
    calories: 230,
    protein: 22,
    baseGrams: 100,
    unitType: 'unit',
    unitName: 'hamburguesa',
    unitWeight: 120,
    servingNote: '100g',
    defaultMealType: 'almuerzo',
    aliases: ['carne picada', 'carne molida', 'hamburguesa', 'paty', 'medallon de carne']
  },
  {
    id: 'milanesa_carne',
    category: 'Proteínas',
    name: 'Milanesa de carne (al horno)',
    calories: 220,
    protein: 22,
    baseGrams: 100,
    unitType: 'unit',
    unitName: 'milanesa',
    unitWeight: 120,
    servingNote: '1 unidad (~120g)',
    defaultMealType: 'almuerzo',
    aliases: ['milanesa de carne', 'milanesa', 'milanesa de ternera', 'milanesa al horno']
  },
  {
    id: 'milanesa_pollo',
    category: 'Proteínas',
    name: 'Milanesa de pollo (al horno)',
    calories: 200,
    protein: 24,
    baseGrams: 100,
    unitType: 'unit',
    unitName: 'milanesa',
    unitWeight: 120,
    servingNote: '1 unidad (~120g)',
    defaultMealType: 'almuerzo',
    aliases: ['milanesa de pollo', 'suprema napolitana', 'milanesa de suprema', 'suprema al horno']
  },
  {
    id: 'cerdo_bondiola',
    category: 'Proteínas',
    name: 'Carne de cerdo / Bondiola / Solomillo',
    calories: 190,
    protein: 24,
    baseGrams: 100,
    unitType: 'grams',
    servingNote: '100g',
    defaultMealType: 'cena',
    aliases: ['cerdo', 'solomillo de cerdo', 'carne de cerdo', 'bondiola', 'pechito de cerdo', 'costillita de cerdo']
  },
  {
    id: 'atun_lata_agua',
    category: 'Proteínas',
    name: 'Atún al natural (en agua)',
    calories: 110,
    protein: 24,
    baseGrams: 100,
    unitType: 'unit',
    unitName: 'lata',
    unitWeight: 120,
    servingNote: '1 lata escurrida (~120g)',
    defaultMealType: 'almuerzo',
    aliases: ['atun al natural', 'atún al natural', 'atun', 'atún', 'lata de atun', 'lata de atún', 'atun en lata']
  },
  {
    id: 'salmon_pescado',
    category: 'Proteínas',
    name: 'Salmón rosado / Pescado azul',
    calories: 208,
    protein: 20,
    baseGrams: 100,
    unitType: 'grams',
    servingNote: '100g cocido',
    defaultMealType: 'cena',
    aliases: ['salmon', 'salmón', 'salmon rosado', 'filet de salmon']
  },
  {
    id: 'merluza_pescado_blanco',
    category: 'Proteínas',
    name: 'Filet de merluza / Pescado blanco',
    calories: 90,
    protein: 19,
    baseGrams: 100,
    unitType: 'unit',
    unitName: 'filet',
    unitWeight: 150,
    servingNote: '1 filet (~150g)',
    defaultMealType: 'almuerzo',
    aliases: ['merluza', 'filet de merluza', 'pescado', 'pescado blanco', 'corvina', 'lenguado']
  },

  // =========================================================================
  // 2. HUEVOS & LÁCTEOS
  // =========================================================================
  {
    id: 'huevo_entero',
    category: 'Proteínas',
    name: 'Huevo entero',
    calories: 155,
    protein: 13,
    baseGrams: 100,
    unitType: 'unit',
    unitName: 'huevo',
    unitWeight: 50,
    servingNote: '1 huevo mediano (~50g, 78 kcal, 6.5g P)',
    defaultMealType: 'desayuno',
    aliases: [
      'huevo entero', 'huevos enteros', 'huevo', 'huevos', 'huevo duro', 'huevos duros',
      'huevo revuelto', 'huevos revueltos', 'huevo frito', 'huevos fritos', 'omelette', 'omelet', 'huevos pasados por agua'
    ]
  },
  {
    id: 'claras_huevo',
    category: 'Proteínas',
    name: 'Clara de huevo',
    calories: 52,
    protein: 11,
    baseGrams: 100,
    unitType: 'unit',
    unitName: 'clara',
    unitWeight: 33,
    servingNote: '1 clara (~33g, 17 kcal, 3.6g P)',
    defaultMealType: 'desayuno',
    aliases: ['clara de huevo', 'claras de huevo', 'clara', 'claras', 'claras revueltas']
  },
  {
    id: 'leche_descremada',
    category: 'Lácteos',
    name: 'Leche descremada',
    calories: 45,
    protein: 3.4,
    baseGrams: 100,
    unitType: 'unit',
    unitName: 'vaso',
    unitWeight: 200,
    servingNote: '1 vaso (200ml)',
    defaultMealType: 'desayuno',
    aliases: ['leche descremada', 'leche desc', 'leche 0%', 'vaso de leche']
  },
  {
    id: 'leche_entera',
    category: 'Lácteos',
    name: 'Leche entera',
    calories: 62,
    protein: 3.2,
    baseGrams: 100,
    unitType: 'unit',
    unitName: 'vaso',
    unitWeight: 200,
    servingNote: '1 vaso (200ml)',
    defaultMealType: 'desayuno',
    aliases: ['leche entera', 'leche', 'vaso de leche entera']
  },
  {
    id: 'yogur_griego',
    category: 'Lácteos',
    name: 'Yogur Griego / Proteico',
    calories: 80,
    protein: 10,
    baseGrams: 100,
    unitType: 'unit',
    unitName: 'pote',
    unitWeight: 150,
    servingNote: '1 pote (~150g)',
    defaultMealType: 'merienda',
    aliases: ['yogur griego', 'yogurt griego', 'yogur proteico', 'yogur natural', 'yogur firme', 'yogur', 'yogurt']
  },
  {
    id: 'queso_cremoso',
    category: 'Lácteos',
    name: 'Queso cremoso / Por Salut / Mozzarella',
    calories: 290,
    protein: 22,
    baseGrams: 100,
    unitType: 'grams',
    unitName: 'feta',
    unitWeight: 25,
    servingNote: '100g',
    defaultMealType: 'desayuno',
    aliases: [
      'queso cremoso', 'queso por salut', 'queso cuartirolo', 'queso fresco',
      'queso mantecoso', 'queso port salut', 'queso mozzarella', 'muzzarella', 'queso', 'queso feta'
    ]
  },
  {
    id: 'queso_untable_descremado',
    category: 'Lácteos',
    name: 'Queso untable descremado / Casancrem Light',
    calories: 90,
    protein: 9,
    baseGrams: 100,
    unitType: 'unit',
    unitName: 'cucharada',
    unitWeight: 25,
    servingNote: '1 cucharada (~25g)',
    defaultMealType: 'desayuno',
    aliases: ['queso untable', 'queso blanco', 'casancrem', 'casancrem light', 'queso crema light', 'philadelphia light', 'queso cottage', 'cottage']
  },
  {
    id: 'lomito_horneado',
    category: 'Proteínas',
    name: 'Lomito horneado / Jamón cocido',
    calories: 110,
    protein: 19,
    baseGrams: 100,
    unitType: 'unit',
    unitName: 'feta',
    unitWeight: 20,
    servingNote: '1 feta (~20g)',
    defaultMealType: 'desayuno',
    aliases: [
      'lomito horneado', 'lomito', 'lomito en fetas', 'fetas de lomito',
      'feta de lomito', 'lomo horneado', 'jamon cocido', 'jamón cocido', 'jamon', 'jamón', 'feta de jamon'
    ]
  },

  // =========================================================================
  // 3. CARBOHIDRATOS & GRANOS
  // =========================================================================
  {
    id: 'arroz_blanco',
    category: 'Carbohidratos',
    name: 'Arroz blanco cocido',
    calories: 130,
    protein: 2.7,
    baseGrams: 100,
    unitType: 'grams',
    servingNote: '100g cocido (1 plato ~200g)',
    defaultMealType: 'almuerzo',
    aliases: [
      'arroz blanco', 'arroz cocido', 'arroz', 'arroz blanco cocido', 'plato de arroz',
      'arroz con queso', 'taza de arroz'
    ]
  },
  {
    id: 'arroz_integral',
    category: 'Carbohidratos',
    name: 'Arroz integral cocido',
    calories: 125,
    protein: 3.0,
    baseGrams: 100,
    unitType: 'grams',
    servingNote: '100g cocido',
    defaultMealType: 'almuerzo',
    aliases: ['arroz integral', 'arroz yamaní', 'arroz yamani']
  },
  {
    id: 'avena_tradicional',
    category: 'Carbohidratos',
    name: 'Avena (en copos / instantánea)',
    calories: 389,
    protein: 17,
    baseGrams: 100,
    unitType: 'grams',
    servingNote: '100g seca (porción ~40-50g)',
    defaultMealType: 'desayuno',
    aliases: [
      'avena tradicional', 'avena', 'avena en copos', 'copos de avena',
      'avena instantanea', 'avena instantánea', 'porridge', 'harina de avena'
    ]
  },
  {
    id: 'fideos_pasta',
    category: 'Carbohidratos',
    name: 'Fideos / Pasta cocida',
    calories: 155,
    protein: 5.5,
    baseGrams: 100,
    unitType: 'grams',
    servingNote: '100g cocidos (1 plato ~220g)',
    defaultMealType: 'almuerzo',
    aliases: [
      'fideos', 'fideo', 'pasta seca', 'pasta cocida', 'pasta', 'pastas',
      'tallarines', 'espaguetis', 'spaghetti', 'macarrones', 'tirabuzones', 'moñitos', 'ñoquis', 'ravioles'
    ]
  },
  {
    id: 'papa_hervida',
    category: 'Carbohidratos',
    name: 'Papa (hervida / al horno)',
    calories: 87,
    protein: 2.0,
    baseGrams: 100,
    unitType: 'unit',
    unitName: 'papa',
    unitWeight: 150,
    servingNote: '1 papa mediana (~150g)',
    defaultMealType: 'almuerzo',
    aliases: [
      'papa hervida', 'papas hervidas', 'papa cocida', 'papas cocidas', 'papa al horno',
      'papas al horno', 'papa', 'papas', 'pure de papa', 'puré de papa', 'patatas'
    ]
  },
  {
    id: 'batata_al_horno',
    category: 'Carbohidratos',
    name: 'Batata / Camote / Boniato',
    calories: 90,
    protein: 1.6,
    baseGrams: 100,
    unitType: 'unit',
    unitName: 'batata',
    unitWeight: 150,
    servingNote: '1 batata mediana (~150g)',
    defaultMealType: 'almuerzo',
    aliases: ['batata', 'batatas', 'camote', 'boniato', 'batata al horno', 'pure de batata']
  },
  {
    id: 'pan_lactal',
    category: 'Carbohidratos',
    name: 'Pan lactal común / integral',
    calories: 260,
    protein: 8.5,
    baseGrams: 100,
    unitType: 'unit',
    unitName: 'rodaja',
    unitWeight: 25,
    servingNote: '1 rodaja (~25g, 65 kcal)',
    defaultMealType: 'desayuno',
    aliases: [
      'pan lactal', 'pan lactal comun', 'pan lactal común', 'pan blanco', 'pan de molde',
      'tostadas de pan lactal', 'rodaja de pan', 'rodajas de pan', 'tostada', 'tostadas', 'pan', 'pan integral'
    ]
  },
  {
    id: 'pan_masa_madre',
    category: 'Carbohidratos',
    name: 'Pan de masa madre / Pan francés',
    calories: 270,
    protein: 10,
    baseGrams: 100,
    unitType: 'unit',
    unitName: 'rebanada',
    unitWeight: 45,
    servingNote: '1 rebanada (~45g, 120 kcal)',
    defaultMealType: 'desayuno',
    aliases: ['pan de masa madre', 'pan masa madre', 'masa madre', 'tostada de masa madre', 'pan frances', 'pan francés', 'flautita', 'mignon']
  },
  {
    id: 'tostadas_arroz',
    category: 'Carbohidratos',
    name: 'Tostadas de arroz / Galletas de arroz',
    calories: 380,
    protein: 8.0,
    baseGrams: 100,
    unitType: 'unit',
    unitName: 'galleta',
    unitWeight: 10,
    servingNote: '1 galleta (~10g, 38 kcal)',
    defaultMealType: 'merienda',
    aliases: ['tostadas de arroz', 'galletas de arroz', 'galleta de arroz', 'tostada de arroz']
  },
  {
    id: 'lentejas_legumbres',
    category: 'Carbohidratos',
    name: 'Lentejas / Garbanzos cocidos',
    calories: 120,
    protein: 9.0,
    baseGrams: 100,
    unitType: 'grams',
    servingNote: '100g cocidos',
    defaultMealType: 'almuerzo',
    aliases: ['lentejas', 'lenteja', 'garbanzos', 'garbanzo', 'legumbres', 'porotos', 'frijoles']
  },

  // =========================================================================
  // 4. FRUTAS & VEGETALES
  // =========================================================================
  {
    id: 'banana',
    category: 'Frutas',
    name: 'Banana / Plátano',
    calories: 89,
    protein: 1.1,
    baseGrams: 100,
    unitType: 'unit',
    unitName: 'banana',
    unitWeight: 100,
    servingNote: '1 banana mediana (~100g, 89 kcal)',
    defaultMealType: 'desayuno',
    aliases: ['banana', 'bananas', 'platano', 'plátano', 'platanos', 'plátanos']
  },
  {
    id: 'manzana',
    category: 'Frutas',
    name: 'Manzana',
    calories: 52,
    protein: 0.3,
    baseGrams: 100,
    unitType: 'unit',
    unitName: 'manzana',
    unitWeight: 150,
    servingNote: '1 manzana (~150g, 78 kcal)',
    defaultMealType: 'snack',
    aliases: ['manzana', 'manzanas', 'manzana roja', 'manzana verde']
  },
  {
    id: 'naranja_mandarina',
    category: 'Frutas',
    name: 'Naranja / Mandarina',
    calories: 47,
    protein: 0.9,
    baseGrams: 100,
    unitType: 'unit',
    unitName: 'naranja',
    unitWeight: 150,
    servingNote: '1 unidad (~150g)',
    defaultMealType: 'snack',
    aliases: ['naranja', 'naranjas', 'mandarina', 'mandarinas', 'jugo de naranja']
  },
  {
    id: 'frutillas_berries',
    category: 'Frutas',
    name: 'Frutillas / Frutos rojos / Arándanos',
    calories: 33,
    protein: 0.7,
    baseGrams: 100,
    unitType: 'grams',
    servingNote: '100g',
    defaultMealType: 'desayuno',
    aliases: ['frutillas', 'frutilla', 'fresas', 'fresa', 'arandanos', 'arándanos', 'frutos rojos', 'moras']
  },
  {
    id: 'palta_aguacate',
    category: 'Grasas',
    name: 'Palta / Aguacate',
    calories: 160,
    protein: 2.0,
    baseGrams: 100,
    unitType: 'unit',
    unitName: 'media palta',
    unitWeight: 75,
    servingNote: '1/2 palta (~75g, 120 kcal)',
    defaultMealType: 'desayuno',
    aliases: ['palta', 'paltas', 'aguacate', 'media palta', 'guacamole']
  },
  {
    id: 'ensalada_mixta',
    category: 'Vegetales',
    name: 'Ensalada mixta (Lechuga, tomate, zanahoria)',
    calories: 25,
    protein: 1.2,
    baseGrams: 100,
    unitType: 'unit',
    unitName: 'plato',
    unitWeight: 150,
    servingNote: '1 plato (~150g)',
    defaultMealType: 'almuerzo',
    aliases: [
      'ensalada mixta', 'ensalada de lechuga y tomate', 'ensalada', 'lechuga y tomate',
      'tomate', 'lechuga', 'zanahoria', 'espinaca', 'brocoli', 'brócoli', 'rucula', 'rúcula'
    ]
  },

  // =========================================================================
  // 5. GRASAS, ACEITES & FRUTOS SECOS
  // =========================================================================
  {
    id: 'mantequilla_mani',
    category: 'Grasas',
    name: 'Mantequilla de maní',
    calories: 588,
    protein: 25,
    baseGrams: 100,
    unitType: 'unit',
    unitName: 'cucharada',
    unitWeight: 15,
    servingNote: '1 cucharada (~15g, 88 kcal, 3.8g P)',
    defaultMealType: 'desayuno',
    aliases: [
      'mantequilla de mani', 'mantequilla de maní', 'pasta de mani', 'pasta de maní',
      'crema de mani', 'crema de maní', 'mantequilla mani', 'peanut butter'
    ]
  },
  {
    id: 'aceite_oliva',
    category: 'Grasas',
    name: 'Aceite de oliva / Aceite de girasol',
    calories: 884,
    protein: 0,
    baseGrams: 100,
    unitType: 'unit',
    unitName: 'cucharada',
    unitWeight: 12,
    servingNote: '1 cucharada sopera (~12g, 105 kcal)',
    defaultMealType: 'almuerzo',
    aliases: ['aceite de oliva', 'aceite', 'oliva', 'aceite de girasol', 'cucharada de aceite']
  },
  {
    id: 'frutos_secos',
    category: 'Grasas',
    name: 'Frutos secos (Almendras / Nueces / Maní)',
    calories: 600,
    protein: 20,
    baseGrams: 100,
    unitType: 'unit',
    unitName: 'puñado',
    unitWeight: 30,
    servingNote: '1 puñado (~30g, 180 kcal, 6g P)',
    defaultMealType: 'snack',
    aliases: ['frutos secos', 'almendras', 'nueces', 'mani', 'maní', 'castañas de caju', 'mix de frutos secos']
  },

  // =========================================================================
  // 6. PLATOS PREPARADOS & FAST FOOD
  // =========================================================================
  {
    id: 'empanada_carne',
    category: 'Platos',
    name: 'Empanada de carne / Jamón y queso',
    calories: 250,
    protein: 9.0,
    baseGrams: 100,
    unitType: 'unit',
    unitName: 'empanada',
    unitWeight: 100,
    servingNote: '1 empanada (~250 kcal, 9g P)',
    defaultMealType: 'cena',
    aliases: ['empanada', 'empanadas', 'empanada de carne', 'empanadas de carne', 'empanada de pollo', 'empanada de jamon y queso']
  },
  {
    id: 'pizza_mozzarella',
    category: 'Platos',
    name: 'Porción de pizza (Muzzarella)',
    calories: 270,
    protein: 11,
    baseGrams: 100,
    unitType: 'unit',
    unitName: 'porcion',
    unitWeight: 100,
    servingNote: '1 porción (~270 kcal, 11g P)',
    defaultMealType: 'cena',
    aliases: ['pizza', 'porcion de pizza', 'porciones de pizza', 'pizza de muzzarella', 'pizza muzza', 'pizza mozzarella']
  },
  {
    id: 'hamburguesa_completa',
    category: 'Platos',
    name: 'Hamburguesa completa con queso',
    calories: 550,
    protein: 30,
    baseGrams: 220,
    unitType: 'unit',
    unitName: 'hamburguesa',
    unitWeight: 220,
    servingNote: '1 hamburguesa completa (~550 kcal, 30g P)',
    defaultMealType: 'almuerzo',
    aliases: ['hamburguesa completa', 'hamburguesa con queso', 'cheeseburger', 'hamburguesa con papas']
  },
  {
    id: 'arroz_con_pollo',
    category: 'Platos',
    name: 'Arroz con pollo (Plato combinado)',
    calories: 450,
    protein: 38,
    baseGrams: 300,
    unitType: 'unit',
    unitName: 'plato',
    unitWeight: 300,
    servingNote: '1 plato (~450 kcal, 38g P)',
    defaultMealType: 'almuerzo',
    aliases: ['arroz con pollo', 'pollo con arroz', 'risotto de pollo', 'wok de pollo y arroz']
  },
  {
    id: 'fideos_con_tuco',
    category: 'Platos',
    name: 'Fideos con tuco y carne',
    calories: 480,
    protein: 26,
    baseGrams: 300,
    unitType: 'unit',
    unitName: 'plato',
    unitWeight: 300,
    servingNote: '1 plato (~480 kcal, 26g P)',
    defaultMealType: 'almuerzo',
    aliases: ['fideos con tuco', 'pastas con salsa', 'fideos con bolognesa', 'pasta con tuco', 'tallarines con tuco']
  },
  {
    id: 'cafe_con_leche',
    category: 'Bebidas',
    name: 'Café con leche',
    calories: 90,
    protein: 5.0,
    baseGrams: 200,
    unitType: 'unit',
    unitName: 'taza',
    unitWeight: 200,
    servingNote: '1 taza (~200ml)',
    defaultMealType: 'desayuno',
    aliases: ['cafe con leche', 'café con leche', 'latte', 'capuchino', 'cappuccino', 'cortado', 'taza de cafe con leche']
  },
  {
    id: 'medialuna',
    category: 'Platos',
    name: 'Medialuna / Factura de manteca',
    calories: 180,
    protein: 3.5,
    baseGrams: 50,
    unitType: 'unit',
    unitName: 'medialuna',
    unitWeight: 50,
    servingNote: '1 medialuna (~180 kcal)',
    defaultMealType: 'desayuno',
    aliases: ['medialuna', 'medialunas', 'factura', 'facturas', 'croissant']
  },

  // =========================================================================
  // 7. SUPLEMENTOS & BATIDOS
  // =========================================================================
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
    servingNote: '1 scoop (30g, 120 kcal, 24g P)',
    defaultMealType: 'suplementacion',
    aliases: [
      'whey protein', 'whey', 'proteina whey', 'proteína whey', 'proteina en polvo',
      'proteína en polvo', 'scoop de proteina', 'scoop de whey', 'scoop whey', 'proteina isolate', 'proteína isolate'
    ]
  },
  {
    id: 'creatina',
    category: 'Suplemento',
    name: 'Creatina Monohidrato (5g)',
    calories: 0,
    protein: 0,
    baseGrams: 5,
    unitType: 'portion',
    unitName: 'scoop',
    unitWeight: 5,
    servingNote: '5g (0 kcal)',
    defaultMealType: 'suplementacion',
    aliases: ['creatina', 'creatine', 'creatina monohidrato', 'creatina creapure', 'scoop de creatina']
  },
  {
    id: 'batido_basico',
    category: 'Batido',
    name: 'Batido Básico (250ml leche desc. + 1 scoop)',
    calories: 210,
    protein: 32,
    baseGrams: 280,
    unitType: 'portion',
    unitName: 'batido',
    unitWeight: 280,
    servingNote: '250ml leche desc. + 1 scoop',
    defaultMealType: 'suplementacion',
    aliases: ['batido basico', 'batido básico', 'batido con leche', 'batido proteina leche', 'batido con leche descremada', 'shake basico']
  },
  {
    id: 'batido_volumen',
    category: 'Batido',
    name: 'Batido Volumen (1 scoop + leche + banana + avena)',
    calories: 380,
    protein: 36,
    baseGrams: 400,
    unitType: 'portion',
    unitName: 'batido',
    unitWeight: 400,
    servingNote: '1 scoop + 250ml leche + 1 banana + 30g avena',
    defaultMealType: 'suplementacion',
    aliases: ['batido volumen', 'batido de volumen', 'batido hipercalorico', 'batido hipercalórico', 'shake volumen', 'licuado de banana con proteina']
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
 * Analiza un único alimento/componente individual
 */
function estimateSingleItem(cleanPart = '') {
  if (!cleanPart) return null;

  // 1. Extraer cantidad en gramos si existe (ej: "200g", "200 gr", "150 gramos", "0.5kg")
  let grams = null;
  const kgMatch = cleanPart.match(/(?:^|\s)(\d+(?:[.,]\d+)?)\s*(?:kg|kilos?)\b/);
  if (kgMatch) {
    grams = parseFloat(kgMatch[1].replace(',', '.')) * 1000;
  } else {
    const gramMatch = cleanPart.match(/(?:^|\s)(\d+(?:[.,]\d+)?)\s*(?:g|gr|grs|gramos?)\b/);
    if (gramMatch) {
      grams = parseFloat(gramMatch[1].replace(',', '.'));
    }
  }

  // 2. Extraer unidades específicas si existen
  let units = null;
  const unitMatch = cleanPart.match(/(?:^|\s)(\d+(?:[.,]\d+)?)\s*(?:huevos?|claras?|bananas?|manzanas?|naranjas?|platanos?|scoops?|fetas?|rodajas?|rebanadas?|cucharadas?|cdas?|porciones?|empanadas?|medialunas?|unidades?|u|vasos?|tazas?|latas?|potes?|platos?|filets?)\b/);
  if (unitMatch) {
    units = parseFloat(unitMatch[1].replace(',', '.'));
  } else {
    // Si empieza con un número
    const leadingNumMatch = cleanPart.match(/^(\d+(?:[.,]\d+)?)\s+([a-z].*)/);
    if (leadingNumMatch) {
      units = parseFloat(leadingNumMatch[1].replace(',', '.'));
    }
  }

  // 3. Buscar mejor coincidencia
  let bestMatch = null;
  let highestScore = 0;

  for (const item of NUTRITIONAL_DATABASE) {
    for (const alias of item.aliases) {
      const normAlias = normalizeStr(alias);

      if (cleanPart === normAlias) {
        const score = 1000 + normAlias.length;
        if (score > highestScore) {
          highestScore = score;
          bestMatch = item;
        }
      } else if (cleanPart.includes(normAlias)) {
        const score = 500 + normAlias.length;
        if (score > highestScore) {
          highestScore = score;
          bestMatch = item;
        }
      } else if (cleanPart.length >= 4 && normAlias.includes(cleanPart)) {
        const score = 200 + cleanPart.length;
        if (score > highestScore) {
          highestScore = score;
          bestMatch = item;
        }
      }
    }
  }

  if (!bestMatch) return null;

  // 4. Calcular según gramos, unidades o porción base
  let calculatedCalories = 0;
  let calculatedProtein = 0;

  if (grams && grams > 0) {
    const ratio = grams / bestMatch.baseGrams;
    calculatedCalories = Math.round(bestMatch.calories * ratio);
    calculatedProtein = Math.round(bestMatch.protein * ratio * 10) / 10;
  } else if (units && units > 0) {
    if (bestMatch.unitType === 'unit' && bestMatch.unitWeight) {
      const totalGrams = units * bestMatch.unitWeight;
      const ratio = totalGrams / bestMatch.baseGrams;
      calculatedCalories = Math.round(bestMatch.calories * ratio);
      calculatedProtein = Math.round(bestMatch.protein * ratio * 10) / 10;
    } else {
      calculatedCalories = Math.round(units * bestMatch.calories);
      calculatedProtein = Math.round(units * bestMatch.protein * 10) / 10;
    }
  } else {
    // Porción por defecto
    calculatedCalories = bestMatch.calories;
    calculatedProtein = bestMatch.protein;
  }

  return {
    item: bestMatch,
    calories: calculatedCalories,
    protein: calculatedProtein,
    defaultMealType: bestMatch.defaultMealType
  };
}

/**
 * Analiza el texto ingresado por el usuario con soporte para frases compuestas ("arroz 150g con pollo 200g y 1 huevo")
 */
export function estimateNutrition(rawText = '') {
  if (!rawText || typeof rawText !== 'string') {
    return { matched: false, calories: 0, protein: 0 };
  }

  const clean = normalizeStr(rawText);
  if (!clean || clean.length < 2) {
    return { matched: false, calories: 0, protein: 0 };
  }

  // 1. Primero intentar como frase completa
  const directMatch = estimateSingleItem(clean);
  if (directMatch) {
    return {
      matched: true,
      calories: directMatch.calories,
      protein: directMatch.protein,
      defaultMealType: directMatch.defaultMealType,
      originalName: directMatch.item.name
    };
  }

  // 2. Si contiene separadores (con, +, y, e, comma), separar en componentes y sumar
  const parts = clean
    .split(/\s+(?:con|\+|\by\b|\be\b|,)\s+/)
    .map(p => p.trim())
    .filter(Boolean);

  if (parts.length > 1) {
    let totalCalories = 0;
    let totalProtein = 0;
    let matchedAny = false;
    let suggestedMeal = 'almuerzo';

    for (const part of parts) {
      const match = estimateSingleItem(part);
      if (match) {
        matchedAny = true;
        totalCalories += match.calories;
        totalProtein += match.protein;
        if (match.defaultMealType) suggestedMeal = match.defaultMealType;
      }
    }

    if (matchedAny) {
      return {
        matched: true,
        calories: totalCalories,
        protein: Math.round(totalProtein * 10) / 10,
        defaultMealType: suggestedMeal,
        originalName: rawText.trim()
      };
    }
  }

  return { matched: false, calories: 0, protein: 0 };
}
