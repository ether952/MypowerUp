import React, { useState, useEffect, useRef } from 'react';
import {
  Home,
  Dumbbell,
  Footprints,
  Flame,
  Bike,
  Heart,
  Shield,
  Sparkles,
  MapPin,
  Activity,
  Zap,
  RotateCcw,
  Navigation,
  CheckCircle2,
  Sun,
  Moon,
  Clock,
  User,
  Calendar,
  Award,
  AlertTriangle,
  Play,
  TrendingUp,
  Battery,
  Trophy,
  ArrowRight,
  HelpCircle,
  X,
  Compass,
  Smile,
  AlertCircle,
  ShoppingBag,
  Coins,
  Utensils,
  Dices,
  DollarSign
} from 'lucide-react';
import { getCurrentWeekRange } from '../utils/levelSystem';
import { getLocalDateString } from '../utils/helpers';
import cityDayImg from '../assets/city-isometric-day.png';
import cityNightImg from '../assets/city-isometric-night.png';

// Puntos de interés mapeados sobre la ilustración isométrica
const CITY_LOCATIONS = {
  home: {
    id: 'home',
    name: 'Casa del Atleta',
    category: 'Descanso',
    type: 'home',
    x: 20,
    y: 71,
    color: '#A855F7',
    badgeColor: 'border-violet-400 bg-violet-950/90 text-violet-300',
    icon: Home,
    desc: 'Descanso profundo, comida casera y recuperación de estamina'
  },
  shop: {
    id: 'shop',
    name: 'Tienda & Nutrición',
    category: 'Comercio',
    type: 'shop',
    x: 38,
    y: 36,
    color: '#EC4899',
    badgeColor: 'border-pink-400 bg-pink-950/90 text-pink-300',
    icon: ShoppingBag,
    desc: 'Compra viandas, bebidas isotónicas, suplementos y calzado'
  },
  gym: {
    id: 'gym',
    name: 'Gimnasio Central (GYM)',
    category: 'Musculación',
    type: 'muscle',
    x: 50.5,
    y: 46,
    color: '#8B5CF6',
    badgeColor: 'border-violet-400 bg-violet-950/90 text-white',
    icon: Dumbbell,
    desc: 'Fuerza de piernas y core (consume menos estamina que correr)'
  },
  running: {
    id: 'running',
    name: 'Pista de Atletismo',
    category: 'Running',
    type: 'cardio',
    x: 64,
    y: 53,
    color: '#06B6D4',
    badgeColor: 'border-cyan-400 bg-cyan-950/90 text-cyan-300',
    icon: Flame,
    desc: 'Series de velocidad y fondo (alto gasto de estamina)'
  },
  walk: {
    id: 'walk',
    name: 'Paseo Peatonal & Parque',
    category: 'Caminata',
    type: 'cardio',
    x: 35,
    y: 56,
    color: '#10B981',
    badgeColor: 'border-emerald-400 bg-emerald-950/90 text-emerald-300',
    icon: Footprints,
    desc: 'Marcha activa de bajo impacto para sumar fondo'
  },
  bike: {
    id: 'bike',
    name: 'Ciclovía Perimetral',
    category: 'Bicicleta',
    type: 'cardio',
    x: 55,
    y: 82,
    color: '#10B981',
    badgeColor: 'border-emerald-400 bg-emerald-950/90 text-emerald-300',
    icon: Bike,
    desc: 'Cardio aeróbico cruzado sin impacto articular'
  }
};

// Metas y Maratones Progresivas
const MARATHON_GOALS = [
  {
    level: 1,
    name: 'Maratón Urbana 5K',
    distanceKm: 5,
    targetTop: 20,
    requiredEndurance: 25,
    requiredSpeed: 20,
    desc: 'Tu debut competitivo. Debes quedar entre los 20 mejores para clasificar al siguiente reto.',
    badgeColor: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/30'
  },
  {
    level: 2,
    name: 'Gran Carrera 10K',
    distanceKm: 10,
    targetTop: 15,
    requiredEndurance: 45,
    requiredSpeed: 38,
    desc: 'Doble de distancia. Exige buen ritmo y estrategia. Clasifica entre los 15 primeros.',
    badgeColor: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/30'
  },
  {
    level: 3,
    name: 'Media Maratón 21K',
    distanceKm: 21,
    targetTop: 10,
    requiredEndurance: 70,
    requiredSpeed: 60,
    desc: 'Prueba de resistencia pura. Exige fondo sólido y fuerza muscular. Top 10 necesario.',
    badgeColor: 'text-violet-400 border-violet-500/40 bg-violet-950/30'
  },
  {
    level: 4,
    name: 'Gran Maratón Legendaria 42K',
    distanceKm: 42,
    targetTop: 3,
    requiredEndurance: 95,
    requiredSpeed: 85,
    desc: 'El desafío definitivo del running. Debes subir al podio (Top 3) para ganar la corona mundial.',
    badgeColor: 'text-neon-cyan border-neon-cyan/50 bg-cyan-950/40'
  }
];

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

// Artículos de la Tienda
const SHOP_ITEMS = [
  {
    id: 'food_lunch',
    name: 'Vianda Saludable Equilibrada',
    category: 'Comida',
    cost: 20,
    icon: '🥗',
    desc: '+40% de Comida / Nutrición',
    effect: { food: 40, stamina: 15, message: '¡Comiste una deliciosa vianda de arroz, pollo y palta! +40% Comida' }
  },
  {
    id: 'isotonic_drink',
    name: 'Bebida Isotónica Rehidratante',
    category: 'Estamina',
    cost: 25,
    icon: '⚡',
    desc: '+35% de Estamina y +15% Comida',
    effect: { stamina: 35, food: 15, message: '¡Electrolitos al 100%! Recuperas +35% Estamina' }
  },
  {
    id: 'protein_powder',
    name: 'Batido de Proteína & Creatina',
    category: 'Fuerza',
    cost: 35,
    icon: '🥛',
    desc: '+5 de Fuerza y +20% Comida',
    effect: { strength: 5, food: 20, stamina: 10, message: '¡Excelente síntesis proteica! +5 Fuerza' }
  },
  {
    id: 'pro_shoes',
    name: 'Zapatillas Placa de Carbono',
    category: 'Calzado',
    cost: 65,
    icon: '👟',
    desc: '+8 Resistencia y +6 Velocidad',
    effect: { endurance: 8, speed: 6, message: '¡Zapatillas voladoras de élite! +8 Resistencia, +6 Velocidad' }
  },
  {
    id: 'massage_therapy',
    name: 'Sesión de Fisioterapia & Descarga',
    category: 'Salud',
    cost: 45,
    icon: '💆',
    desc: 'Estamina al 100% y previene lesiones',
    effect: { stamina: 60, message: 'Masaje descontracturante completo. ¡Estamina recuperada!' }
  }
];

// Eventos Aleatorios y Situaciones Urbanas entre Turnos
const RANDOM_EVENTS = [
  {
    id: 'dog',
    title: '¡Un Perrito Perdido en la Calle!',
    icon: '🐕',
    desc: 'Mientras cruzas la calle hacia tu destino, ves a un perrito desorientado entre los autos.',
    options: [
      {
        text: 'Ayudar al perrito y llevarlo a casa',
        effectText: '+30% Estamina, +15% Comida, pierdes la sesión de entreno',
        effect: { endurance: 0, stamina: 30, food: 15, message: 'Llevaste al perrito a salvo a casa. Descansas con paz mental.' }
      },
      {
        text: 'Avisar a un vecino y seguir con el entrenamiento',
        effectText: '+5 Resistencia, -20% Estamina',
        effect: { endurance: 5, stamina: -20, message: 'Un vecino se hizo cargo. Pudiste completar tu entrenamiento.' }
      }
    ]
  },
  {
    id: 'rain',
    title: 'Tormenta Eléctrica Repentina',
    icon: '🌧️',
    desc: 'El cielo se pone negro y cae un diluvio con viento en contra sobre la pista.',
    options: [
      {
        text: 'Correr bajo la tormenta con valentía',
        effectText: '+10 Resistencia, -40% Estamina (Alto desgaste)',
        effect: { endurance: 10, stamina: -40, message: '¡Entrenamiento épico bajo la lluvia! Tu mente y resistencia son de acero.' }
      },
      {
        text: 'Refugiarte y hacer movilidad en el techo',
        effectText: '+4 Fuerza, +10% Estamina',
        effect: { strength: 4, stamina: 10, message: 'Hiciste ejercicios de prevención y estiramientos.' }
      }
    ]
  },
  {
    id: 'mentor',
    title: 'Consejos de un Maratonista Campeón',
    icon: '🏆',
    desc: 'En el parque te cruzas con un ex-campeón de 42K que te enseña a regular tu ritmo y zancada.',
    options: [
      {
        text: 'Escuchar atentamente sus consejos',
        effectText: '+8 Velocidad, +8 Resistencia',
        effect: { speed: 8, endurance: 8, stamina: 5, message: 'Aprendiste a correr con máxima eficiencia biomecánica.' }
      },
      {
        text: 'Agradecer y seguir tu rutina de inmediato',
        effectText: '+4 Fuerza, -15% Estamina',
        effect: { strength: 4, stamina: -15, message: 'Mantuviste el foco sin pausas.' }
      }
    ]
  }
];

/**
 * Componente Sprite de Persona (Hombre / Mujer) a escala del mapa
 */
function HumanCharacterSprite({ gender = 'male', isWalking = false, direction = 'right' }) {
  const isFemale = gender === 'female';

  return (
    <div
      className={`relative flex flex-col items-center select-none transition-transform duration-150 ${
        direction === 'left' ? '-scale-x-100' : 'scale-x-100'
      }`}
      style={{ width: '22px', height: '32px' }}
    >
      {/* Sombra en el suelo */}
      <div className="absolute -bottom-1 w-4 h-1.5 bg-black/70 rounded-full blur-[0.6px]" />

      {/* Cuerpo de la persona animado */}
      <div className={`relative flex flex-col items-center w-full h-full ${isWalking ? 'animate-bounce' : ''}`}>
        
        {/* CABEZA & CABELLO */}
        <div className="relative z-20 flex flex-col items-center">
          {isFemale ? (
            <div className="relative">
              <div className="w-3.5 h-3.5 bg-[#4A2810] rounded-full relative">
                <div className="absolute top-1.5 inset-x-0 h-0.5 bg-neon-cyan" />
              </div>
              <div className="absolute -left-1.5 top-0.5 w-2 h-2.5 bg-[#4A2810] rounded-full transform -rotate-12" />
            </div>
          ) : (
            <div className="relative w-3.5 h-3.5 bg-[#2E1A0F] rounded-full">
              <div className="absolute top-1.5 inset-x-0 h-0.5 bg-neon-purple" />
            </div>
          )}

          <div className="w-3 h-2 bg-[#FBD38D] rounded-b-md relative flex items-center justify-end pr-0.5 -mt-1 shadow-sm">
            <div className="w-0.5 h-0.5 bg-[#1A202C] rounded-full" />
          </div>
        </div>

        {/* TORSO / ROPA DEPORTIVA */}
        <div className="relative z-10 -mt-0.5 flex flex-col items-center">
          <div
            className={`w-4 h-3.5 rounded-t-sm relative flex items-center justify-between px-0.5 ${
              isFemale
                ? 'bg-gradient-to-b from-purple-500 to-violet-600'
                : 'bg-gradient-to-b from-violet-600 to-indigo-700'
            }`}
          >
            <div
              className={`w-1 h-3 bg-[#FBD38D] rounded-full -ml-0.5 transition-transform origin-top ${
                isWalking ? 'rotate-12' : ''
              }`}
            />
            <div className={`w-1.5 h-1.5 rounded-full ${isFemale ? 'bg-neon-cyan/80' : 'bg-emerald-400/80'}`} />
            <div
              className={`w-1 h-3 bg-[#FBD38D] rounded-full -mr-0.5 transition-transform origin-top ${
                isWalking ? '-rotate-12' : ''
              }`}
            />
          </div>

          <div className="w-3.5 h-1.5 bg-[#1E1B4B] rounded-b-xs" />
        </div>

        {/* PIERNAS & ZAPATILLAS */}
        <div className="flex items-center gap-1 -mt-0.2 z-0">
          <div
            className={`flex flex-col items-center transition-transform origin-top ${
              isWalking ? '-translate-y-0.5 rotate-6' : ''
            }`}
          >
            <div className="w-1 h-2 bg-[#FBD38D]" />
            <div className={`w-1.5 h-1 rounded-xs ${isFemale ? 'bg-neon-cyan' : 'bg-emerald-400'}`} />
          </div>

          <div
            className={`flex flex-col items-center transition-transform origin-top ${
              isWalking ? 'translate-y-0.5 -rotate-6' : ''
            }`}
          >
            <div className="w-1 h-2 bg-[#FBD38D]" />
            <div className={`w-1.5 h-1 rounded-xs ${isFemale ? 'bg-neon-cyan' : 'bg-emerald-400'}`} />
          </div>
        </div>

      </div>
    </div>
  );
}

export default function CityMiniGame({ data = {}, selectedDate }) {
  // 1. Estado del Atleta (Hombre / Mujer)
  const [characterGender, setCharacterGender] = useState(() => {
    return localStorage.getItem('mypowerup_character_gender') || null;
  });
  const [isGenderModalOpen, setIsGenderModalOpen] = useState(() => {
    return !localStorage.getItem('mypowerup_character_gender');
  });

  // 2. Sistema de Campaña y Progresión por Turnos & Meses
  const [goalIndex, setGoalIndex] = useState(() => {
    const saved = localStorage.getItem('mypowerup_game_goal_idx');
    return saved ? Number(saved) : 0;
  });
  const currentGoal = MARATHON_GOALS[goalIndex] || MARATHON_GOALS[0];

  const [currentMonth, setCurrentMonth] = useState(() => {
    const saved = localStorage.getItem('mypowerup_game_month');
    return saved ? Number(saved) : 1; // 1 to 12
  });

  const [currentTurn, setCurrentTurn] = useState(() => {
    const saved = localStorage.getItem('mypowerup_game_turn');
    return saved ? Number(saved) : 1;
  });

  const [maxTurnsInMonth, setMaxTurnsInMonth] = useState(() => {
    const saved = localStorage.getItem('mypowerup_game_max_turns');
    return saved ? Number(saved) : 2;
  });

  // 3. Atributos: Resistencia, Velocidad, Fuerza, Estamina (0-100%), Comida (0-100%), Dinero ($)
  const [stats, setStats] = useState(() => {
    const saved = localStorage.getItem('mypowerup_game_stats_v2');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      endurance: 15,   // Resistencia (fondo)
      speed: 12,       // Velocidad (ritmo)
      strength: 10,    // Fuerza (prevención de lesión y potencia)
      stamina: 100,    // Estamina / Energía (100% = a tope, 0% = exhausto)
      food: 85,        // Comida / Nutrición (0 - 100%)
      money: 100       // Dinero inicial ($100)
    };
  });

  // Estadísticas acumuladas en el mes actual para el resumen de fin de mes
  const [monthGains, setMonthGains] = useState({
    endurance: 0,
    speed: 0,
    strength: 0,
    money: 0
  });

  // Modales de juego
  const [isShopModalOpen, setIsShopModalOpen] = useState(false);
  const [isMonthSummaryOpen, setIsMonthSummaryOpen] = useState(false);
  const [activeEvent, setActiveEvent] = useState(null);
  const [streetLootNotice, setStreetLootNotice] = useState(null);
  const [raceDayResult, setRaceDayResult] = useState(null);
  const [isInjured, setIsInjured] = useState(false);
  const [injuryMessage, setInjuryMessage] = useState(null);

  // Estado del dado interactivo de fin de mes
  const [diceRolling, setDiceRolling] = useState(false);
  const [diceResult, setDiceResult] = useState(null);
  const [diceSummaryEffect, setDiceSummaryEffect] = useState(null);

  // Posición del personaje (inicia en casa)
  const [characterPos, setCharacterPos] = useState({
    x: CITY_LOCATIONS.home.x,
    y: CITY_LOCATIONS.home.y
  });
  const [targetLocationId, setTargetLocationId] = useState('home');
  const [currentLocationId, setCurrentLocationId] = useState('home');
  const [isWalking, setIsWalking] = useState(false);
  const [walkDirection, setWalkDirection] = useState('right');
  const [actionStatus, setActionStatus] = useState('En casa descansando');
  const animationFrameRef = useRef(null);

  // Modo de hora (Auto / Día / Noche)
  const [timeMode, setTimeMode] = useState('day');
  const [currentHour, setCurrentHour] = useState(() => new Date().getHours());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHour(new Date().getHours());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const isNightRealTime = currentHour >= 20 || currentHour < 7;
  const isNight = timeMode === 'night';

  // Guardar estado del juego
  useEffect(() => {
    localStorage.setItem('mypowerup_game_goal_idx', String(goalIndex));
    localStorage.setItem('mypowerup_game_month', String(currentMonth));
    localStorage.setItem('mypowerup_game_turn', String(currentTurn));
    localStorage.setItem('mypowerup_game_max_turns', String(maxTurnsInMonth));
    localStorage.setItem('mypowerup_game_stats_v2', JSON.stringify(stats));
  }, [goalIndex, currentMonth, currentTurn, maxTurnsInMonth, stats]);

  // Vidas según días de entrenamiento
  const todayStr = selectedDate || getLocalDateString();
  const { startOfWeek, endOfWeek } = getCurrentWeekRange(todayStr);

  const trainedDaysThisWeek = Object.keys(data).filter((dateStr) => {
    if (dateStr < startOfWeek || dateStr > endOfWeek) return false;
    const day = data[dateStr];
    return (day?.workouts || []).length > 0 || (day?.cardios || []).length > 0;
  }).length;

  const totalLives = Math.min(Math.max(2 + trainedDaysThisWeek, 1), 5);
  const [currentLives, setCurrentLives] = useState(totalLives);

  useEffect(() => {
    setCurrentLives(totalLives);
  }, [totalLives]);

  const selectGender = (gender) => {
    setCharacterGender(gender);
    localStorage.setItem('mypowerup_character_gender', gender);
    setIsGenderModalOpen(false);
  };

  // Procesar compras en la Tienda
  const handleBuyShopItem = (item) => {
    if (stats.money < item.cost) {
      alert('No tienes suficiente dinero para esta compra.');
      return;
    }

    setStats((prev) => {
      const newMoney = prev.money - item.cost;
      const newFood = Math.min(100, prev.food + (item.effect.food || 0));
      const newStamina = Math.min(100, Math.max(0, prev.stamina + (item.effect.stamina || 0)));
      const newEndurance = prev.endurance + (item.effect.endurance || 0);
      const newSpeed = prev.speed + (item.effect.speed || 0);
      const newStrength = prev.strength + (item.effect.strength || 0);

      return {
        ...prev,
        money: newMoney,
        food: newFood,
        stamina: newStamina,
        endurance: newEndurance,
        speed: newSpeed,
        strength: newStrength
      };
    });

    setActionStatus(item.effect.message || `Compraste ${item.name}`);
  };

  // Función para procesar la acción del turno tras llegar al lugar
  const processTurnAction = (locationId) => {
    if (locationId === 'shop') {
      setIsShopModalOpen(true);
      setActionStatus('En la Tienda Deportiva revisando suplementos.');
      return;
    }

    let statChanges = { endurance: 0, speed: 0, strength: 0, stamina: 0, food: 0 };
    let statusText = '';

    // Factor multiplicador de cansancio si la comida está muy baja (<20%)
    const hungerMultiplier = stats.food <= 20 ? 1.4 : 1.0;

    if (locationId === 'home') {
      // Quedarse en casa: Recupera mucha estamina y comida casera
      statChanges.stamina = +60;
      statChanges.food = +25;
      statChanges.endurance = 1;
      statusText = 'Descanso en casa: +60% Estamina, +25% Comida y bienestar.';
    } else if (locationId === 'running') {
      // Correr: Gasta MUCHA estamina (desafiante: ~45% a 50%)
      statChanges.endurance = 7;
      statChanges.speed = 5;
      statChanges.stamina = -Math.round(48 * hungerMultiplier);
      statChanges.food = -20;
      statusText = `Series de Running intensas: +7 Resistencia, +5 Velocidad, -${Math.round(48 * hungerMultiplier)}% Estamina.`;
    } else if (locationId === 'gym') {
      // Gimnasio: Gasta MENOS estamina que correr (~22% a 25%)
      statChanges.strength = 8;
      statChanges.speed = 2;
      statChanges.stamina = -Math.round(24 * hungerMultiplier);
      statChanges.food = -15;
      statusText = `Entrenamiento de GYM: +8 Fuerza, +2 Velocidad, -${Math.round(24 * hungerMultiplier)}% Estamina.`;
    } else if (locationId === 'walk') {
      // Caminata: bajo gasto de estamina
      statChanges.endurance = 3;
      statChanges.stamina = -12;
      statChanges.food = -8;
      statusText = 'Caminata en el parque: +3 Resistencia, -12% Estamina.';
    } else if (locationId === 'bike') {
      // Bicicleta: gasto medio
      statChanges.endurance = 5;
      statChanges.speed = 3;
      statChanges.strength = 2;
      statChanges.stamina = -Math.round(30 * hungerMultiplier);
      statChanges.food = -15;
      statusText = `Ciclovía: +5 Resistencia, +3 Velocidad, -${Math.round(30 * hungerMultiplier)}% Estamina.`;
    }

    // Actualizar estadísticas
    setStats((prev) => {
      const newStamina = Math.max(0, Math.min(100, prev.stamina + statChanges.stamina));
      const newFood = Math.max(0, Math.min(100, prev.food + statChanges.food));
      const newEndurance = Math.max(0, prev.endurance + statChanges.endurance);
      const newSpeed = Math.max(0, prev.speed + statChanges.speed);
      const newStrength = Math.max(0, prev.strength + statChanges.strength);

      // Comprobar desmayo/lesión por estamina en 0
      if (newStamina <= 0 && locationId !== 'home') {
        setIsInjured(true);
        setInjuryMessage('¡Colapso por agotamiento extremo! Tu estamina llegó a 0% y sufres una contractura severa.');
      }

      return {
        ...prev,
        stamina: newStamina,
        food: newFood,
        endurance: newEndurance,
        speed: newSpeed,
        strength: newStrength
      };
    });

    // Acumular ganancias del mes
    setMonthGains((prev) => ({
      endurance: prev.endurance + statChanges.endurance,
      speed: prev.speed + statChanges.speed,
      strength: prev.strength + statChanges.strength,
      money: prev.money
    }));

    setActionStatus(statusText);

    // Posibilidad de encontrar dinero en la calle al trasladarse (12% de probabilidad baja)
    const findMoneyRoll = Math.random();
    if (findMoneyRoll < 0.12 && locationId !== 'home') {
      const foundAmount = Math.floor(Math.random() * 20) + 10; // $10 a $30
      setStats((prev) => ({ ...prev, money: prev.money + foundAmount }));
      setStreetLootNotice(`¡Encontraste $${foundAmount} tirados en la vereda mientras cruzabas la calle!`);
      setTimeout(() => setStreetLootNotice(null), 4500);
    }

    // Posibilidad de disparar evento aleatorio (30% de chance)
    const shouldTriggerEvent = Math.random() < 0.30 && locationId !== 'home';
    if (shouldTriggerEvent) {
      const randomEvt = RANDOM_EVENTS[Math.floor(Math.random() * RANDOM_EVENTS.length)];
      setActiveEvent(randomEvt);
      return;
    }

    advanceTurn();
  };

  // Avanzar turno en el calendario
  const advanceTurn = () => {
    if (currentTurn < maxTurnsInMonth) {
      setCurrentTurn((prev) => prev + 1);
    } else {
      // ¡TERMINÓ EL MES!
      // 1. Regresa automáticamente a casa
      setCharacterPos({ x: CITY_LOCATIONS.home.x, y: CITY_LOCATIONS.home.y });
      setCurrentLocationId('home');
      setTargetLocationId('home');
      setIsWalking(false);

      // 2. Pasa a ser de noche al completar los turnos
      setTimeMode('night');

      // 3. Ganancia mensual de dinero por patrocinio (+$50)
      const monthlyIncome = 50;
      setStats((prev) => ({
        ...prev,
        money: prev.money + monthlyIncome
      }));
      setMonthGains((prev) => ({
        ...prev,
        money: prev.money + monthlyIncome
      }));

      // 4. Abrir modal de Resumen de Fin de Mes con la tirada de dado
      setDiceResult(null);
      setDiceSummaryEffect(null);
      setIsMonthSummaryOpen(true);
    }
  };

  // Tirar el Dado interactivo al final del mes
  const handleRollDice = () => {
    if (diceRolling) return;
    setDiceRolling(true);

    setTimeout(() => {
      // FÓRMULA DEL DADO:
      // Cuanta más resistencia tenés con respecto a fuerza => bonificación para sacar 5 o 6 y menos lesión
      // Si la fuerza es mucho mayor a la resistencia => mayor probabilidad de sacar 1 o 2 (lesión/sobrecarga)
      const enduranceAdvantage = stats.endurance - stats.strength;
      
      let roll = Math.floor(Math.random() * 6) + 1; // 1 a 6

      // Modificador de probabilidad según balance físico
      if (enduranceAdvantage >= 10 && roll < 5 && Math.random() < 0.45) {
        roll = Math.min(6, roll + 2); // Beneficio por resistencia alta
      } else if (enduranceAdvantage < -5 && roll > 2 && Math.random() < 0.45) {
        roll = Math.max(1, roll - 2); // Desventaja por primordiar solo fuerza
      }

      setDiceResult(roll);
      setDiceRolling(false);

      // Efectos según el número del dado
      if (roll === 6) {
        // 6: Mes Dorado
        setDiceSummaryEffect({
          title: '🎲 ¡DADO 6: Racha Imparable & Patrocinador!',
          badge: 'text-neon-cyan border-cyan-400 bg-cyan-950/40',
          desc: 'Tu resistencia aeróbica es brillante. Un sponsor te premia con +$35 extra y ganas +5 Resistencia.',
          apply: () => {
            setStats((prev) => ({
              ...prev,
              money: prev.money + 35,
              endurance: prev.endurance + 5,
              stamina: 100
            }));
          }
        });
      } else if (roll >= 4) {
        // 4 o 5: Mes Sólido
        setDiceSummaryEffect({
          title: `🎲 ¡DADO ${roll}: Adaptación Óptima!`,
          badge: 'text-emerald-400 border-emerald-400 bg-emerald-950/40',
          desc: 'Excelente asimilación del entrenamiento. Inicias el próximo mes con 100% de estamina y sin molestias.',
          apply: () => {
            setStats((prev) => ({ ...prev, stamina: 100 }));
          }
        });
      } else if (roll === 3) {
        // 3: Mes Estable
        setDiceSummaryEffect({
          title: '🎲 DADO 3: Mes Equilibrado',
          badge: 'text-violet-300 border-violet-400 bg-violet-950/40',
          desc: 'Ritmo constante. Recuperación estándar de estamina para comenzar el próximo mes.',
          apply: () => {
            setStats((prev) => ({ ...prev, stamina: 85 }));
          }
        });
      } else if (roll === 2) {
        // 2: Fatiga Muscular
        setDiceSummaryEffect({
          title: '🎲 DADO 2: Fatiga Muscular Residual',
          badge: 'text-amber-400 border-amber-400 bg-amber-950/40',
          desc: 'Tus músculos acumulan tensión. Comenzarás el próximo mes con 25% menos de estamina inicial.',
          apply: () => {
            setStats((prev) => ({ ...prev, stamina: 65 }));
          }
        });
      } else {
        // 1: Sobrecarga / Riesgo de Lesión
        setDiceSummaryEffect({
          title: '🎲 DADO 1: ¡Sobrecarga por exceso de Fuerza!',
          badge: 'text-rose-400 border-rose-400 bg-rose-950/40',
          desc: 'La falta de balance aeróbico te pasa factura: una contractura te costará 1 turno de reposo en el próximo mes.',
          apply: () => {
            setStats((prev) => ({ ...prev, stamina: 50 }));
          }
        });
      }
    }, 1000);
  };

  // Confirmar y avanzar al siguiente mes tras el resumen
  const handleProceedToNextMonth = () => {
    if (diceSummaryEffect?.apply) {
      diceSummaryEffect.apply();
    }

    setIsMonthSummaryOpen(false);
    setDiceResult(null);
    setDiceSummaryEffect(null);

    // Reiniciar ganancias del mes
    setMonthGains({ endurance: 0, speed: 0, strength: 0, money: 0 });

    if (currentMonth < 12) {
      setCurrentMonth((prev) => prev + 1);
      setCurrentTurn(1);
      // Probabilidad aleatoria de 2 o 3 turnos (30% chance de 3 turnos)
      const nextMonthMaxTurns = Math.random() < 0.30 ? 3 : 2;
      setMaxTurnsInMonth(nextMonthMaxTurns);
      // De día para el nuevo mes
      setTimeMode('day');
    } else {
      // ¡Fin del año (Mes 12 completado) => Gran Maratón!
      simulateMarathonRace();
    }
  };

  // Simular la Gran Carrera al final del año (Mes 12)
  const simulateMarathonRace = () => {
    const baseScore = stats.endurance * 0.45 + stats.speed * 0.35 + stats.strength * 0.20;
    const staminaFactor = (stats.stamina / 100) * 15;
    const finalScore = Math.max(10, baseScore + staminaFactor + (Math.random() * 10 - 5));

    let position = 1;
    if (finalScore >= 95) position = Math.floor(Math.random() * 3) + 1; // Top 1-3
    else if (finalScore >= 80) position = Math.floor(Math.random() * 5) + 4; // Top 4-8
    else if (finalScore >= 65) position = Math.floor(Math.random() * 7) + 9; // Top 9-15
    else if (finalScore >= 50) position = Math.floor(Math.random() * 10) + 16; // Top 16-25
    else if (finalScore >= 35) position = Math.floor(Math.random() * 20) + 26; // Top 26-45
    else position = Math.floor(Math.random() * 40) + 46; // Top 46-85

    const isQualified = position <= currentGoal.targetTop;

    setRaceDayResult({
      position,
      isQualified,
      finalScore: Math.round(finalScore),
      goal: currentGoal
    });
  };

  // Continuar tras el resultado de la carrera
  const handleFinishRaceModal = () => {
    if (raceDayResult?.isQualified) {
      if (goalIndex < MARATHON_GOALS.length - 1) {
        setGoalIndex((prev) => prev + 1);
      }
    }
    setCurrentMonth(1);
    setCurrentTurn(1);
    setMaxTurnsInMonth(2);
    setTimeMode('day');
    setStats((prev) => ({
      ...prev,
      stamina: 100,
      food: 90
    }));
    setRaceDayResult(null);
  };

  // Resolver evento aleatorio
  const handleResolveEvent = (option) => {
    if (option.effect) {
      setStats((prev) => ({
        ...prev,
        endurance: Math.max(0, prev.endurance + (option.effect.endurance || 0)),
        speed: Math.max(0, prev.speed + (option.effect.speed || 0)),
        strength: Math.max(0, prev.strength + (option.effect.strength || 0)),
        stamina: Math.max(0, Math.min(100, prev.stamina + (option.effect.stamina || 0))),
        food: Math.max(0, Math.min(100, prev.food + (option.effect.food || 0)))
      }));
      setActionStatus(option.effect.message || 'Decisión tomada.');
    }
    setActiveEvent(null);
    advanceTurn();
  };

  // Manejo del desplazamiento animado del personaje
  const moveToLocation = (locId) => {
    const destination = CITY_LOCATIONS[locId];
    if (!destination) return;
    if (isWalking) return;

    setTargetLocationId(locId);
    setIsWalking(true);
    setActionStatus(`Caminando hacia ${destination.name}...`);

    if (destination.x >= characterPos.x) {
      setWalkDirection('right');
    } else {
      setWalkDirection('left');
    }
  };

  // Bucle de animación de movimiento
  useEffect(() => {
    if (!isWalking) return;

    const target = CITY_LOCATIONS[targetLocationId];
    if (!target) return;

    let posX = characterPos.x;
    let posY = characterPos.y;
    const speed = 0.55;

    const step = () => {
      const dx = target.x - posX;
      const dy = target.y - posY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 0.8) {
        setCharacterPos({ x: target.x, y: target.y });
        setIsWalking(false);
        setCurrentLocationId(targetLocationId);
        processTurnAction(targetLocationId);
      } else {
        const moveAngle = Math.atan2(dy, dx);
        posX += Math.cos(moveAngle) * speed;
        posY += Math.sin(moveAngle) * speed;
        setCharacterPos({ x: posX, y: posY });
        animationFrameRef.current = requestAnimationFrame(step);
      }
    };

    animationFrameRef.current = requestAnimationFrame(step);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isWalking, targetLocationId]);

  const activeLoc = CITY_LOCATIONS[currentLocationId] || CITY_LOCATIONS.home;

  return (
    <div className="space-y-6 animate-fade-in relative">
      
      {/* NOTIFICACIÓN FLOTANTE DE DINERO ENCONTRADO EN LA CALLE */}
      {streetLootNotice && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-2xl bg-[#0D0824] border border-cyan-400/60 shadow-2xl shadow-cyan-950/80 text-white font-mono text-xs flex items-center gap-3 animate-bounce">
          <div className="p-2 rounded-xl bg-cyan-500/20 text-neon-cyan border border-cyan-500/40">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-neon-cyan uppercase">¡SUERTE EN LA CALLE!</div>
            <div className="text-neutral-300">{streetLootNotice}</div>
          </div>
        </div>
      )}

      {/* 1. MODAL DE SELECCIÓN DE PERSONAJE (HOMBRE / MUJER) */}
      {isGenderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="bg-[#0D0824] border border-purple-500/30 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl shadow-purple-950/80 relative">
            <div className="text-center space-y-1.5 border-b border-white/10 pb-4">
              <span className="text-[10px] font-mono text-neon-cyan uppercase tracking-widest font-bold block">
                // PREPARACIÓN DE CAMPAÑA
              </span>
              <h3 className="text-2xl font-black text-white uppercase font-display tracking-tight">
                Elige a tu Atleta
              </h3>
              <p className="text-xs text-neutral-300 font-sans">
                ¿Con quién deseas entrenar rumbo a la Gran Maratón?
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => selectGender('male')}
                className="group p-5 rounded-2xl bg-space-900/80 hover:bg-violet-950/60 border border-white/10 hover:border-violet-400 transition-all flex flex-col items-center gap-3 cursor-pointer text-center shadow-lg hover:scale-105"
              >
                <div className="w-14 h-14 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center group-hover:shadow-[0_0_15px_rgba(139,92,246,0.5)]">
                  <HumanCharacterSprite gender="male" isWalking={false} direction="right" />
                </div>
                <div>
                  <div className="font-display font-bold text-white text-sm">Atleta Hombre</div>
                  <div className="text-[10px] text-violet-300 font-mono mt-0.5">Musculación & Running</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => selectGender('female')}
                className="group p-5 rounded-2xl bg-space-900/80 hover:bg-violet-950/60 border border-white/10 hover:border-violet-400 transition-all flex flex-col items-center gap-3 cursor-pointer text-center shadow-lg hover:scale-105"
              >
                <div className="w-14 h-14 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center group-hover:shadow-[0_0_15px_rgba(139,92,246,0.5)]">
                  <HumanCharacterSprite gender="female" isWalking={false} direction="right" />
                </div>
                <div>
                  <div className="font-display font-bold text-white text-sm">Atleta Mujer</div>
                  <div className="text-[10px] text-neon-cyan font-mono mt-0.5">Musculación & Running</div>
                </div>
              </button>
            </div>

            <p className="text-[11px] text-center font-mono text-neutral-400">
              Podrás alternar de atleta en cualquier momento desde el menú superior.
            </p>
          </div>
        </div>
      )}

      {/* 2. MODAL DE LA TIENDA DEPORTIVA & NUTRICIÓN */}
      {isShopModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="bg-[#0D0824] border border-pink-500/40 rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-5 shadow-2xl shadow-pink-950/80 relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-pink-500/20 text-pink-400 border border-pink-500/30">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white uppercase font-display">Tienda Deportiva & Nutrición</h3>
                  <span className="text-[10px] font-mono text-pink-300">Suplementos, viandas saludables y calzado</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsShopModalOpen(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Billetera del Atleta */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-space-900 border border-white/10 font-mono text-xs">
              <span className="text-neutral-400">Tu Presupuesto Disponible:</span>
              <span className="text-base font-black text-neon-cyan flex items-center gap-1">
                <Coins className="w-4 h-4 text-cyan-400" />
                ${stats.money} USD
              </span>
            </div>

            {/* Lista de Productos */}
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {SHOP_ITEMS.map((item) => {
                const canAfford = stats.money >= item.cost;
                return (
                  <div
                    key={item.id}
                    className="p-3 rounded-2xl bg-space-900/70 border border-white/5 hover:border-pink-500/30 flex items-center justify-between gap-3 transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl p-1.5 rounded-xl bg-space-850 border border-white/5">{item.icon}</span>
                      <div>
                        <div className="font-display font-bold text-white text-xs">{item.name}</div>
                        <div className="text-[10px] text-pink-300 font-mono">{item.desc}</div>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={!canAfford}
                      onClick={() => handleBuyShopItem(item)}
                      className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
                        canAfford
                          ? 'bg-pink-600 hover:bg-pink-500 text-white shadow-md shadow-pink-900/40'
                          : 'bg-white/5 text-neutral-500 border border-white/5 cursor-not-allowed'
                      }`}
                    >
                      ${item.cost}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-white/10 pt-3">
              <button
                type="button"
                onClick={() => setIsShopModalOpen(false)}
                className="w-full py-2.5 rounded-xl bg-space-900 hover:bg-space-850 border border-white/10 text-neutral-300 font-mono text-xs font-bold uppercase transition-all"
              >
                Volver a la Ciudad
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. MODAL DE RESUMEN DEL MES Y TIRADA DE DADO INTERACTIVO */}
      {isMonthSummaryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg animate-fade-in">
          <div className="bg-[#0D0824] border border-violet-500/40 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl shadow-violet-950/80 text-center">
            
            <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-violet-600 to-neon-cyan p-0.5 mx-auto flex items-center justify-center shadow-xl shadow-purple-900/50">
              <div className="w-full h-full bg-[#0D0824] rounded-[22px] flex items-center justify-center">
                <Calendar className="w-7 h-7 text-neon-cyan" />
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono text-violet-400 uppercase tracking-widest font-bold block">
                // FIN DE CICLO MENSUAL
              </span>
              <h3 className="text-2xl font-black text-white uppercase font-display tracking-tight">
                Resumen de {MONTH_NAMES[currentMonth - 1]}
              </h3>
              <p className="text-xs text-neutral-300 font-sans">
                Has completado todos los turnos del mes y regresas a casa a descansar.
              </p>
            </div>

            {/* Tarjeta de Ganancias del Mes */}
            <div className="grid grid-cols-4 gap-2 py-3 px-4 rounded-2xl bg-space-900/80 border border-white/10 font-mono text-center">
              <div>
                <span className="text-[9px] text-neutral-400 uppercase block">Resistencia</span>
                <span className="text-sm font-black text-neon-cyan">+{monthGains.endurance}</span>
              </div>
              <div>
                <span className="text-[9px] text-neutral-400 uppercase block">Velocidad</span>
                <span className="text-sm font-black text-violet-300">+{monthGains.speed}</span>
              </div>
              <div>
                <span className="text-[9px] text-neutral-400 uppercase block">Fuerza</span>
                <span className="text-sm font-black text-emerald-400">+{monthGains.strength}</span>
              </div>
              <div>
                <span className="text-[9px] text-neutral-400 uppercase block">Sponsor</span>
                <span className="text-sm font-black text-cyan-300">+$50</span>
              </div>
            </div>

            {/* SECCIÓN DEL DADO DEL DESTINO */}
            <div className="p-4 rounded-2xl bg-[#140D36] border border-violet-500/30 space-y-3">
              <div className="flex items-center justify-between text-left">
                <div>
                  <div className="font-display font-bold text-white text-xs flex items-center gap-1.5">
                    <Dices className="w-4 h-4 text-neon-purple" />
                    <span>Tirada del Dado del Destino</span>
                  </div>
                  <div className="text-[10px] text-neutral-300 font-mono">
                    {stats.endurance > stats.strength
                      ? 'Mayor resistencia (+Probabilidad de sacar 5 o 6 y evitar lesiones)'
                      : 'Mayor fuerza que fondo (+Riesgo de sobrecarga en el dado)'}
                  </div>
                </div>
              </div>

              {/* Botón o Visual del Dado */}
              {!diceResult && (
                <button
                  type="button"
                  disabled={diceRolling}
                  onClick={handleRollDice}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-purple-900/50 cursor-pointer disabled:opacity-50"
                >
                  {diceRolling ? '🎲 Tirando el Dado...' : '🎲 Tirar Dado del Mes'}
                </button>
              )}

              {/* Resultado del Dado */}
              {diceResult && diceSummaryEffect && (
                <div className="p-3 rounded-xl bg-space-900/90 border border-white/10 space-y-2 text-left animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md border ${diceSummaryEffect.badge}`}>
                      {diceSummaryEffect.title}
                    </span>
                    <span className="text-xl font-black text-white font-mono">🎲 {diceResult}</span>
                  </div>
                  <p className="text-xs text-neutral-300 font-sans leading-relaxed">
                    {diceSummaryEffect.desc}
                  </p>
                </div>
              )}
            </div>

            {/* Botón para pasar al siguiente mes */}
            <button
              type="button"
              disabled={!diceResult}
              onClick={handleProceedToNextMonth}
              className={`w-full py-3.5 px-4 rounded-xl font-bold font-sans text-xs uppercase tracking-wider transition-all ${
                diceResult
                  ? 'bg-gradient-to-r from-purple-600 to-neon-cyan text-white shadow-lg shadow-purple-900/50 hover:brightness-110 cursor-pointer'
                  : 'bg-white/5 text-neutral-500 border border-white/5 cursor-not-allowed'
              }`}
            >
              Comenzar Siguiente Mes ({currentMonth < 12 ? MONTH_NAMES[currentMonth] : 'Gran Maratón'}) →
            </button>
          </div>
        </div>
      )}

      {/* 4. MODAL DE SITUACIONES Y EVENTOS ALEATORIOS ENTRE TURNOS */}
      {activeEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="bg-[#0e0a26] border border-cyan-500/30 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl shadow-cyan-950/60 relative">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <span className="text-3xl p-2 rounded-2xl bg-space-900 border border-white/10">
                {activeEvent.icon}
              </span>
              <div>
                <span className="text-[10px] font-mono text-neon-cyan uppercase tracking-widest font-bold block">
                  // SITUACIÓN EN LA CIUDAD
                </span>
                <h3 className="text-xl font-black text-white uppercase font-display tracking-tight">
                  {activeEvent.title}
                </h3>
              </div>
            </div>

            <p className="text-neutral-300 font-sans text-xs sm:text-sm leading-relaxed">
              {activeEvent.desc}
            </p>

            <div className="space-y-3 pt-2">
              <span className="text-[10px] font-mono text-neutral-400 uppercase font-bold block">
                ¿Qué decisión tomas?
              </span>

              {activeEvent.options.map((opt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleResolveEvent(opt)}
                  className="w-full p-4 rounded-2xl bg-space-900/90 hover:bg-violet-950/60 border border-white/10 hover:border-neon-cyan text-left transition-all flex flex-col gap-1 cursor-pointer group"
                >
                  <div className="font-display font-bold text-white text-sm group-hover:text-neon-cyan transition-colors">
                    {opt.text}
                  </div>
                  <div className="font-mono text-[11px] text-neutral-400">
                    {opt.effectText}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. MODAL DE RESULTADO DE LA GRAN MARATÓN (DÍA DE CARRERA) */}
      {raceDayResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg animate-fade-in">
          <div className="bg-[#0D0824] border border-violet-500/40 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl shadow-violet-950/80 text-center">
            
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-violet-600 to-neon-cyan p-0.5 mx-auto flex items-center justify-center shadow-xl shadow-purple-900/50">
              <div className="w-full h-full bg-[#0D0824] rounded-[22px] flex items-center justify-center">
                <Trophy className={`w-8 h-8 ${raceDayResult.isQualified ? 'text-amber-400 animate-bounce' : 'text-neutral-400'}`} />
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono text-neon-cyan uppercase tracking-widest font-bold">
                // RESULTADO DE TEMPORADA
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white uppercase font-display tracking-tight">
                {raceDayResult.goal.name}
              </h3>
              <p className="text-xs text-neutral-300 font-sans">
                Distancia: {raceDayResult.goal.distanceKm} km | Meta requerida: Top {raceDayResult.goal.targetTop}
              </p>
            </div>

            {/* Posición Final */}
            <div className="py-4 px-6 rounded-2xl bg-space-900/80 border border-white/10 space-y-2">
              <span className="text-xs font-mono text-neutral-400 uppercase">Posición en la Carrera</span>
              <div className="text-4xl sm:text-5xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-neon-purple via-violet-400 to-neon-cyan">
                #{raceDayResult.position} <span className="text-sm font-sans text-neutral-400 font-normal">/ 100</span>
              </div>
              <div className="text-xs font-mono">
                {raceDayResult.isQualified ? (
                  <span className="text-emerald-400 font-bold flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    ¡CLASIFICADO AL SIGUIENTE DESAFÍO!
                  </span>
                ) : (
                  <span className="text-rose-400 font-bold flex items-center justify-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    No alcanzaste el Top {raceDayResult.goal.targetTop}. ¡Puedes reintentar la temporada!
                  </span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={handleFinishRaceModal}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold font-sans text-sm uppercase tracking-wider transition-all shadow-lg shadow-purple-900/40 cursor-pointer"
            >
              {raceDayResult.isQualified ? 'Avanzar al Siguiente Objetivo →' : 'Comenzar Nueva Temporada →'}
            </button>
          </div>
        </div>
      )}

      {/* 6. MODAL DE LESIÓN */}
      {isInjured && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="bg-[#180a14] border border-rose-500/40 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl shadow-rose-950/80 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-black text-white uppercase font-display">
                ¡Lesión por Sobrecarga!
              </h3>
              <p className="text-xs text-neutral-300 font-sans leading-relaxed">
                {injuryMessage}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsInjured(false);
                setInjuryMessage(null);
                if (currentMonth < 12) setCurrentMonth((prev) => prev + 1);
                setCurrentTurn(1);
                setStats((prev) => ({ ...prev, stamina: 60 }));
              }}
              className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold uppercase transition-all cursor-pointer"
            >
              Reposo Médico & Continuar (+1 Mes)
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* HUD SUPERIOR: OBJETIVO, CALENDARIO, DINERO, COMIDA & ATRIBUTOS            */}
      {/* ========================================================================= */}
      <div className="space-y-4 border-b border-white/5 pb-4">
        
        {/* FILA 1: TÍTULO, OBJETIVO, BILLETERA, HORA Y ATLETA */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono tracking-widest text-neon-cyan uppercase font-bold">
                // CAMPAÑA DE RUNNING // TEMPORADA RUMBO AL MARATÓN
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white uppercase font-display tracking-tight mt-0.5 flex items-center gap-2">
              <span>{currentGoal.name}</span>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-neon-cyan border border-cyan-500/30">
                META: TOP {currentGoal.targetTop}
              </span>
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Dinero / Billetera */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-space-900/90 border border-cyan-500/30 text-neon-cyan font-mono text-xs font-bold shadow-sm">
              <Coins className="w-3.5 h-3.5 text-cyan-400" />
              <span>${stats.money} USD</span>
            </div>

            {/* Barra de Comida */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-space-900/90 border border-emerald-500/30 text-emerald-300 font-mono text-xs font-bold shadow-sm" title="Nivel de Nutrición / Comida">
              <Utensils className="w-3.5 h-3.5 text-emerald-400" />
              <span>Comida: {stats.food}%</span>
            </div>

            {/* Botón de Selección de Atleta */}
            <button
              type="button"
              onClick={() => setIsGenderModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-space-900/80 hover:bg-space-850 border border-purple-500/30 text-purple-300 hover:text-white font-mono text-xs font-bold transition-all cursor-pointer shadow-sm"
              title="Cambiar Atleta"
            >
              <User className="w-3.5 h-3.5 text-neon-cyan" />
              <span>Atleta: {characterGender === 'female' ? 'Mujer' : 'Hombre'}</span>
            </button>

            {/* Selector Día / Noche */}
            <div className="flex items-center gap-1 bg-space-900/80 p-1 rounded-xl border border-white/10 font-mono text-xs">
              <button
                type="button"
                onClick={() => setTimeMode('day')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  timeMode === 'day'
                    ? 'bg-amber-500/20 text-yellow-300 border border-yellow-500/40'
                    : 'text-neutral-400 hover:text-white'
                }`}
                title="Modo Día"
              >
                <Sun className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setTimeMode('night')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  timeMode === 'night'
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                    : 'text-neutral-400 hover:text-white'
                }`}
                title="Modo Noche"
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* FILA 2: CALENDARIO DE MESES & TURNOS + ESTADÍSTICAS DEL ATLETA */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          
          {/* PANEL DE TIEMPO (MES Y TURNO ACTUAL) */}
          <div className="md:col-span-5 p-3.5 rounded-2xl bg-space-900/70 border border-white/10 flex items-center justify-between font-mono">
            <div className="space-y-0.5">
              <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">
                Calendario de Preparación
              </span>
              <div className="text-base font-black text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-neon-cyan" />
                <span>Mes {currentMonth}/12: <strong className="text-neon-cyan">{MONTH_NAMES[currentMonth - 1]}</strong></span>
              </div>
            </div>

            <div className="text-right space-y-0.5 border-l border-white/10 pl-3">
              <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Turno del Mes</span>
              <div className="text-sm font-bold text-violet-300 bg-violet-950/60 px-2.5 py-0.5 rounded-lg border border-violet-500/30">
                TURNO {currentTurn} / {maxTurnsInMonth}
              </div>
            </div>
          </div>

          {/* PANEL DE ATRIBUTOS (RESISTENCIA, VELOCIDAD, FUERZA, ESTAMINA) */}
          <div className="md:col-span-7 grid grid-cols-4 gap-2 font-mono text-center">
            
            {/* Resistencia */}
            <div className="p-2.5 rounded-2xl bg-space-900/70 border border-cyan-500/20">
              <span className="text-[9px] text-neutral-400 uppercase block">Resistencia</span>
              <div className="text-base font-black text-neon-cyan">{stats.endurance}</div>
              <span className="text-[9px] text-neutral-400">Fondo</span>
            </div>

            {/* Velocidad */}
            <div className="p-2.5 rounded-2xl bg-space-900/70 border border-violet-500/20">
              <span className="text-[9px] text-neutral-400 uppercase block">Velocidad</span>
              <div className="text-base font-black text-violet-300">{stats.speed}</div>
              <span className="text-[9px] text-neutral-400">Ritmo</span>
            </div>

            {/* Fuerza */}
            <div className="p-2.5 rounded-2xl bg-space-900/70 border border-emerald-500/20">
              <span className="text-[9px] text-neutral-400 uppercase block">Fuerza</span>
              <div className="text-base font-black text-emerald-400">{stats.strength}</div>
              <span className="text-[9px] text-neutral-400">Potencia</span>
            </div>

            {/* Estamina % */}
            <div className={`p-2.5 rounded-2xl bg-space-900/70 border ${
              stats.stamina <= 25 ? 'border-rose-500 text-rose-400 animate-pulse' : 'border-purple-500/30 text-purple-300'
            }`}>
              <span className="text-[9px] text-neutral-400 uppercase block">Estamina</span>
              <div className="text-base font-black">{stats.stamina}%</div>
              <span className="text-[9px] text-neutral-400">{stats.stamina <= 25 ? '¡Agotado!' : 'Energía'}</span>
            </div>

          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* 5. VISUAL CENTRAL: ISLA ISOMÉTRICA + BARRA LATERAL VIOLETA DE ESTAMINA    */}
      {/* ========================================================================= */}
      <div className="relative w-full py-2 flex items-center justify-center gap-3 select-none">
        
        {/* BARRA VERTICAL VIOLETA DE ESTAMINA AL LADO DEL MAPA */}
        <div className="hidden sm:flex flex-col items-center justify-between p-2 rounded-2xl bg-space-900/80 border border-purple-500/40 shadow-xl shadow-purple-950/60 h-80 w-14 font-mono">
          <div className="text-center">
            <Zap className="w-4 h-4 text-purple-400 mx-auto animate-pulse" />
            <span className="text-[8px] uppercase tracking-wider text-purple-300 font-bold block mt-0.5">EST</span>
          </div>

          {/* Tubo / Barra de Progreso Vertical Violeta */}
          <div className="relative w-4 h-48 bg-space-950 rounded-full border border-purple-500/40 overflow-hidden flex flex-col justify-end p-0.5">
            <div
              className="w-full rounded-full transition-all duration-500 bg-gradient-to-t from-violet-700 via-purple-500 to-fuchsia-400 shadow-[0_0_12px_rgba(168,85,247,0.8)]"
              style={{ height: `${stats.stamina}%` }}
            />
          </div>

          <span className="text-[10px] font-black text-white font-mono">
            {stats.stamina}%
          </span>
        </div>

        {/* CONTENEDOR DE LA ISLA ISOMÉTRICA */}
        <div className="relative flex-1 max-w-4xl flex flex-col items-center justify-center overflow-hidden">
          
          {/* Sombra / Reflejo en el suelo de la isla flotante */}
          <div className={`absolute bottom-2 w-3/4 max-w-2xl h-10 blur-2xl rounded-full animate-shadow-island pointer-events-none transition-colors duration-1000 ${
            isNight
              ? 'bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-blue-900/40'
              : 'bg-gradient-to-r from-purple-600/30 via-cyan-500/20 to-emerald-600/30'
          }`} />

          {/* CONTENEDOR FLOTANTE CON ANIMACIÓN */}
          <div className="relative w-full aspect-[16/9] animate-float-island flex items-center justify-center">
            
            {/* Imagen Isométrica con fondo transparente recortado */}
            <img
              src={isNight ? cityNightImg : cityDayImg}
              alt={isNight ? 'PowerUp Night City' : 'PowerUp Day City'}
              className="w-full h-full object-contain filter drop-shadow-[0_25px_35px_rgba(0,0,0,0.85)] pointer-events-none transition-all duration-700 ease-in-out"
            />

            {/* PUNTOS DE ENTRENAMIENTO Y TIENDA MARCADOS EN EL DIBUJO */}

            {/* 1. CASA DEL JUGADOR */}
            <div
              onClick={() => moveToLocation('home')}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group flex flex-col items-center z-20 transition-transform hover:scale-110"
              style={{ left: `${CITY_LOCATIONS.home.x}%`, top: `${CITY_LOCATIONS.home.y}%` }}
            >
              <div className="relative p-1.5 rounded-xl bg-purple-950/90 border border-purple-400 text-purple-300 shadow-xl group-hover:border-neon-purple group-hover:shadow-[0_0_15px_rgba(168,85,247,0.7)] transition-all">
                <Home className="w-3.5 h-3.5" />
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-neon-purple animate-ping" />
              </div>
              <span className="font-mono text-[8px] font-bold text-white bg-purple-950/90 px-1.5 py-0.2 rounded border border-purple-400/50 mt-1 uppercase tracking-wider shadow-sm whitespace-nowrap">
                Mi Casa
              </span>
            </div>

            {/* 2. TIENDA DEPORTIVA & NUTRICIÓN (EDIFICIO TRASERO) */}
            <div
              onClick={() => moveToLocation('shop')}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group flex flex-col items-center z-20 transition-transform hover:scale-110"
              style={{ left: `${CITY_LOCATIONS.shop.x}%`, top: `${CITY_LOCATIONS.shop.y}%` }}
            >
              <div className="relative p-1.5 rounded-xl bg-pink-950/90 border border-pink-400 text-pink-300 shadow-xl group-hover:shadow-[0_0_15px_rgba(236,72,153,0.7)] transition-all">
                <ShoppingBag className="w-3.5 h-3.5" />
              </div>
              <span className="font-mono text-[8px] font-bold text-white bg-pink-950/90 px-1.5 py-0.2 rounded border border-pink-400/50 mt-1 uppercase tracking-wider shadow-sm whitespace-nowrap">
                Tienda $
              </span>
            </div>

            {/* 3. GIMNASIO CENTRAL */}
            <div
              onClick={() => moveToLocation('gym')}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group flex flex-col items-center z-20 transition-transform hover:scale-110"
              style={{ left: `${CITY_LOCATIONS.gym.x}%`, top: `${CITY_LOCATIONS.gym.y}%` }}
            >
              <div className="relative p-2 rounded-xl bg-violet-950/95 border-2 border-violet-400 text-white shadow-2xl group-hover:shadow-[0_0_25px_rgba(139,92,246,0.9)] transition-all">
                <Dumbbell className="w-4 h-4 text-violet-300 animate-pulse" />
                <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.2 rounded-full bg-neon-purple text-[7px] font-mono font-bold text-white uppercase shadow-sm">
                  GYM
                </span>
              </div>
              <span className="font-mono text-[9px] font-black text-white bg-violet-950/95 px-2 py-0.5 rounded border border-violet-400 mt-1 uppercase tracking-wider shadow-md whitespace-nowrap">
                Gimnasio
              </span>
            </div>

            {/* 4. PISTA DE ATLETISMO */}
            <div
              onClick={() => moveToLocation('running')}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group flex flex-col items-center z-20 transition-transform hover:scale-110"
              style={{ left: `${CITY_LOCATIONS.running.x}%`, top: `${CITY_LOCATIONS.running.y}%` }}
            >
              <div className="relative p-1.5 rounded-xl bg-cyan-950/90 border border-cyan-400 text-cyan-300 shadow-xl group-hover:shadow-[0_0_15px_rgba(6,182,212,0.7)] transition-all">
                <Flame className="w-3.5 h-3.5" />
              </div>
              <span className="font-mono text-[8px] font-bold text-white bg-cyan-950/90 px-2 py-0.5 rounded border border-cyan-400/50 mt-1 uppercase tracking-wider shadow-sm whitespace-nowrap">
                Pista Running
              </span>
            </div>

            {/* 5. PASEO PEATONAL & PARQUE */}
            <div
              onClick={() => moveToLocation('walk')}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group flex flex-col items-center z-20 transition-transform hover:scale-110"
              style={{ left: `${CITY_LOCATIONS.walk.x}%`, top: `${CITY_LOCATIONS.walk.y}%` }}
            >
              <div className="relative p-1.5 rounded-xl bg-emerald-950/90 border border-emerald-400 text-emerald-300 shadow-xl group-hover:shadow-[0_0_15px_rgba(16,185,129,0.7)] transition-all">
                <Footprints className="w-3.5 h-3.5" />
              </div>
              <span className="font-mono text-[8px] font-bold text-white bg-emerald-950/90 px-2 py-0.5 rounded border border-emerald-400/50 mt-1 uppercase tracking-wider shadow-sm whitespace-nowrap">
                Caminata
              </span>
            </div>

            {/* 6. BICISENDA */}
            <div
              onClick={() => moveToLocation('bike')}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group flex flex-col items-center z-20 transition-transform hover:scale-110"
              style={{ left: `${CITY_LOCATIONS.bike.x}%`, top: `${CITY_LOCATIONS.bike.y}%` }}
            >
              <div className="relative p-1.5 rounded-xl bg-emerald-950/90 border border-emerald-400 text-emerald-300 shadow-xl group-hover:shadow-[0_0_15px_rgba(16,185,129,0.7)] transition-all">
                <Bike className="w-3.5 h-3.5" />
              </div>
              <span className="font-mono text-[8px] font-bold text-white bg-emerald-950/90 px-2 py-0.5 rounded border border-emerald-400/50 mt-1 uppercase tracking-wider shadow-sm whitespace-nowrap">
                Ciclovía
              </span>
            </div>

            {/* PERSONA HUMANA ANIMADA */}
            <div
              className="absolute z-30 pointer-events-none transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-100 ease-linear"
              style={{
                left: `${characterPos.x}%`,
                top: `${characterPos.y}%`
              }}
            >
              <div className="relative flex flex-col items-center">
                <HumanCharacterSprite
                  gender={characterGender || 'male'}
                  isWalking={isWalking}
                  direction={walkDirection}
                />
                <div className="absolute -inset-1 bg-neon-cyan/30 rounded-full blur-[2px] pointer-events-none" />
                <span className="font-mono text-[7px] font-bold text-white bg-black/90 px-1 py-0.2 rounded border border-white/20 -mt-0.5 shadow-md uppercase whitespace-nowrap">
                  {isWalking ? 'Caminando...' : (characterGender === 'female' ? 'Atleta (M)' : 'Atleta (H)')}
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 6. BOTONERA DE CONTROL Y DECISIÓN DE TURNO                                */}
      {/* ========================================================================= */}
      <div className="space-y-4 pt-1">
        
        {/* Barra de estado y efecto de la última acción */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-2xl bg-space-900/60 border border-white/5 font-mono text-xs">
          <div className="flex items-center gap-2 text-neutral-300">
            <Navigation className={`w-4 h-4 text-neon-cyan ${isWalking ? 'animate-spin' : ''}`} />
            <span>
              Última acción: <strong className="text-white">{actionStatus}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2 text-neutral-400 text-[11px]">
            <span>Ubicación:</span>
            <span className="text-neon-cyan font-bold uppercase">{activeLoc.name}</span>
          </div>
        </div>

        {/* BOTONES DE ACCIÓN POR TURNO */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5">
          
          {/* Botón: Mi Casa (Descanso) */}
          <button
            type="button"
            onClick={() => moveToLocation('home')}
            disabled={isWalking}
            className={`py-3 px-3 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
              currentLocationId === 'home' && !isWalking
                ? 'bg-purple-950/40 border-purple-400 text-white shadow-lg shadow-purple-950/50 ring-1 ring-purple-400/40'
                : 'bg-space-900/70 hover:bg-space-850 border-white/10 text-neutral-300 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <Home className="w-5 h-5 text-purple-400" />
              <span className="text-[9px] font-mono text-purple-300 uppercase font-bold">+60% Est</span>
            </div>
            <div>
              <div className="font-display font-bold text-xs text-white">Quedarse en Casa</div>
              <div className="text-[10px] text-neutral-400 font-sans truncate">Descanso & Comida</div>
            </div>
          </button>

          {/* Botón: Tienda & Nutrición */}
          <button
            type="button"
            onClick={() => moveToLocation('shop')}
            disabled={isWalking}
            className={`py-3 px-3 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
              currentLocationId === 'shop' && !isWalking
                ? 'bg-pink-950/40 border-pink-400 text-white shadow-lg shadow-pink-950/50 ring-1 ring-pink-400/40'
                : 'bg-space-900/70 hover:bg-space-850 border-white/10 text-neutral-300 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <ShoppingBag className="w-5 h-5 text-pink-400" />
              <span className="text-[9px] font-mono text-pink-300 uppercase font-bold">Comprar $</span>
            </div>
            <div>
              <div className="font-display font-bold text-xs text-white">Tienda & Suplementos</div>
              <div className="text-[10px] text-neutral-400 font-sans truncate">Viandas & Bebidas</div>
            </div>
          </button>

          {/* Botón: Gimnasio (Fuerza - Gasta MENOS estamina) */}
          <button
            type="button"
            onClick={() => moveToLocation('gym')}
            disabled={isWalking}
            className={`py-3 px-3 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
              currentLocationId === 'gym' && !isWalking
                ? 'bg-violet-950/40 border-violet-400 text-white shadow-lg shadow-violet-950/50 ring-1 ring-violet-400/40'
                : 'bg-space-900/70 hover:bg-space-850 border-white/10 text-neutral-300 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <Dumbbell className="w-5 h-5 text-violet-400" />
              <span className="text-[9px] font-mono text-violet-300 uppercase font-bold">+8 Fue / -24% Est</span>
            </div>
            <div>
              <div className="font-display font-bold text-xs text-white">Gimnasio</div>
              <div className="text-[10px] text-neutral-400 font-sans truncate">Fuerza Muscular</div>
            </div>
          </button>

          {/* Botón: Running (Pista de Carrera - Gasta MUCHA estamina) */}
          <button
            type="button"
            onClick={() => moveToLocation('running')}
            disabled={isWalking}
            className={`py-3 px-3 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
              currentLocationId === 'running' && !isWalking
                ? 'bg-cyan-950/40 border-cyan-400 text-white shadow-lg shadow-cyan-950/50 ring-1 ring-cyan-400/40'
                : 'bg-space-900/70 hover:bg-space-850 border-white/10 text-neutral-300 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <Flame className="w-5 h-5 text-cyan-400" />
              <span className="text-[9px] font-mono text-cyan-300 uppercase font-bold">+7 Res / -48% Est</span>
            </div>
            <div>
              <div className="font-display font-bold text-xs text-white">Running (Pista)</div>
              <div className="text-[10px] text-neutral-400 font-sans truncate">Fondo & Velocidad</div>
            </div>
          </button>

          {/* Botón: Caminata (Recuperación Activa) */}
          <button
            type="button"
            onClick={() => moveToLocation('walk')}
            disabled={isWalking}
            className={`py-3 px-3 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
              currentLocationId === 'walk' && !isWalking
                ? 'bg-emerald-950/40 border-emerald-400 text-white shadow-lg shadow-emerald-950/50 ring-1 ring-emerald-400/40'
                : 'bg-space-900/70 hover:bg-space-850 border-white/10 text-neutral-300 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <Footprints className="w-5 h-5 text-emerald-400" />
              <span className="text-[9px] font-mono text-emerald-300 uppercase font-bold">+3 Res / -12% Est</span>
            </div>
            <div>
              <div className="font-display font-bold text-xs text-white">Caminata Suave</div>
              <div className="text-[10px] text-neutral-400 font-sans truncate">Parque & Movilidad</div>
            </div>
          </button>

          {/* Botón: Bicicleta (Ciclovía) */}
          <button
            type="button"
            onClick={() => moveToLocation('bike')}
            disabled={isWalking}
            className={`py-3 px-3 rounded-2xl border text-left transition-all flex items-center justify-between flex-col gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
              currentLocationId === 'bike' && !isWalking
                ? 'bg-emerald-950/40 border-emerald-400 text-white shadow-lg shadow-emerald-950/50 ring-1 ring-emerald-400/40'
                : 'bg-space-900/70 hover:bg-space-850 border-white/10 text-neutral-300 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <Bike className="w-5 h-5 text-emerald-400" />
              <span className="text-[9px] font-mono text-emerald-300 uppercase font-bold">+5 Res / -30% Est</span>
            </div>
            <div className="w-full">
              <div className="font-display font-bold text-xs text-white">Bicicleta</div>
              <div className="text-[10px] text-neutral-400 font-sans truncate">Cardio Cruzado</div>
            </div>
          </button>

        </div>

      </div>

    </div>
  );
}
