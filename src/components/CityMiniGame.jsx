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

// Metas y Maratones Progresivas (Números balanceados)
const MARATHON_GOALS = [
  {
    level: 1,
    name: 'Maratón Urbana 5K',
    distanceKm: 5,
    targetTop: 20,
    requiredEndurance: 22,
    requiredSpeed: 18,
    desc: 'Tu debut competitivo. Debes quedar entre los 20 mejores para clasificar al siguiente reto.',
    badgeColor: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/30'
  },
  {
    level: 2,
    name: 'Gran Carrera 10K',
    distanceKm: 10,
    targetTop: 15,
    requiredEndurance: 38,
    requiredSpeed: 30,
    desc: 'Doble de distancia. Exige buen ritmo y estrategia. Clasifica entre los 15 primeros.',
    badgeColor: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/30'
  },
  {
    level: 3,
    name: 'Media Maratón 21K',
    distanceKm: 21,
    targetTop: 10,
    requiredEndurance: 58,
    requiredSpeed: 48,
    desc: 'Prueba de resistencia pura. Exige fondo sólido y fuerza muscular. Top 10 necesario.',
    badgeColor: 'text-violet-400 border-violet-500/40 bg-violet-950/30'
  },
  {
    level: 4,
    name: 'Gran Maratón Legendaria 42K',
    distanceKm: 42,
    targetTop: 3,
    requiredEndurance: 80,
    requiredSpeed: 68,
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
    cost: 15,
    icon: '🥗',
    desc: '+35% de Comida / Nutrición',
    effect: { food: 35, stamina: 15, message: '¡Comiste una deliciosa vianda de arroz, pollo y palta! +35% Comida' }
  },
  {
    id: 'isotonic_drink',
    name: 'Bebida Isotónica Rehidratante',
    category: 'Estamina',
    cost: 20,
    icon: '⚡',
    desc: '+30% de Estamina y +15% Comida',
    effect: { stamina: 30, food: 15, message: '¡Electrolitos al 100%! Recuperas +30% Estamina' }
  },
  {
    id: 'extra_turn_planner',
    name: 'Planificación de Tiempo Extra',
    category: 'Turnos',
    cost: 30,
    icon: '⏳',
    desc: '+1 Turno extra en el mes (Activa sesión de entrenamiento nocturno)',
    effect: { extraTurns: 1, message: '¡Excelente gestión del tiempo! Has ganado +1 Turno extra (Sesión Nocturna).' }
  },
  {
    id: 'protein_powder',
    name: 'Batido de Proteína & Creatina',
    category: 'Fuerza',
    cost: 25,
    icon: '🥛',
    desc: '+2 de Fuerza y +15% Comida',
    effect: { strength: 2, food: 15, stamina: 10, message: '¡Excelente síntesis proteica! +2 Fuerza' }
  },
  {
    id: 'pro_shoes',
    name: 'Zapatillas Placa de Carbono',
    category: 'Calzado',
    cost: 45,
    icon: '👟',
    desc: '+3 Resistencia y +2 Velocidad',
    effect: { endurance: 3, speed: 2, message: '¡Zapatillas voladoras de élite! +3 Resistencia, +2 Velocidad' }
  },
  {
    id: 'massage_therapy',
    name: 'Sesión de Fisioterapia & Descarga',
    category: 'Salud',
    cost: 35,
    icon: '💆',
    desc: 'Estamina al 100% y previene lesiones',
    effect: { stamina: 60, message: 'Masaje descontracturante completo. ¡Estamina recuperada!' }
  }
];

// Lesiones deportivas realistas y contextuales según el lugar y tipo de entrenamiento
const ACTIVITY_INJURIES = {
  running: [
    {
      title: '¡Esguince de Tobillo en la Pista!',
      desc: 'Al cambiar de ritmo en la última curva, pisaste en falso el borde de la pista y sufriste una torcedura de tobillo de grado 1.'
    },
    {
      title: '¡Tirón en el Isquiotibial!',
      desc: 'En plena serie de velocidad de 400 metros sentiste un pinchazo agudo en la parte posterior del muslo.'
    },
    {
      title: '¡Fascitis Plantar & Sobrecarga de Aquiles!',
      desc: 'El impacto repetitivo sobre el asfalto provocó una inflamación aguda en la fascia plantar de tu pie de apoyo.'
    },
    {
      title: '¡Desgarro Fibrilar en el Gemelo!',
      desc: 'Un cambio brusco de cadencia provocó una microrrotura muscular en el gemelo interno por falta de calentamiento.'
    }
  ],
  gym: [
    {
      title: '¡Pellizco Lumbar en Sentadillas!',
      desc: 'En la última repetición pesada, la fatiga desestabilizó tu zona media provocando un pinzamiento lumbar agudo.'
    },
    {
      title: '¡Sobrecarga en el Manguito Rotador!',
      desc: 'Al empujar con fatiga en press de banca, sentiste un tirón punzante en el hombro derecho.'
    },
    {
      title: '¡Pinzamiento de Menisco!',
      desc: 'Una flexión profunda con carga desalineada provocó una molestia articular severa en la rodilla.'
    },
    {
      title: '¡Contractura Cervico-Dorsal!',
      desc: 'El exceso de tensión en trapecios y cuello durante el entrenamiento de fuerza te causó un espasmo muscular rígido.'
    }
  ],
  bike: [
    {
      title: '¡Caída en Curva Resbalosa!',
      desc: 'Una mancha de aceite y humedad en la ciclovía provocó un derrape. Sufriste raspones y un fuerte golpe en la cadera.'
    },
    {
      title: '¡Tendinitis Rotuliana por Sobrecarga!',
      desc: 'El pedaleo constante contra viento en contra provocó una sobrecarga inflamatoria en el tendón rotuliano.'
    }
  ],
  walk: [
    {
      title: '¡Ampolla Abierta y Contractura!',
      desc: 'El roce continuo del calzado provocó una ampolla dolorosa y una marcha compensatoria que sobrecargó el sóleo.'
    },
    {
      title: '¡Distensión en el Psoas!',
      desc: 'Un tropiezo con una raíz en el sendero del parque te provocó un tirón en el flexor de cadera.'
    }
  ],
  default: [
    {
      title: '¡Sobrecarga Muscular Aguda!',
      desc: 'La acumulación de esfuerzo sin la debida recuperación provocó una contractura generalizada.'
    }
  ]
};

// Eventos Aleatorios y Situaciones Urbanas entre Turnos (Variadas y Dinámicas)
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
        effectText: '+1 Resistencia, -10% Estamina',
        effect: { endurance: 1, stamina: -10, message: 'Un vecino se hizo cargo. Pudiste completar tu entrenamiento.' }
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
        effectText: '+2 Resistencia, +1 Velocidad, -20% Estamina',
        effect: { endurance: 2, speed: 1, stamina: -20, message: '¡Entrenamiento épico bajo la lluvia! Tu mente y resistencia son de acero.' }
      },
      {
        text: 'Refugiarte y hacer movilidad en el techo',
        effectText: '+1 Fuerza, +15% Estamina',
        effect: { strength: 1, stamina: 15, message: 'Hiciste ejercicios de prevención y estiramientos.' }
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
        effectText: '+2 Velocidad, +2 Resistencia',
        effect: { speed: 2, endurance: 2, stamina: 5, message: 'Aprendiste a correr con máxima eficiencia biomecánica.' }
      },
      {
        text: 'Agradecer y seguir tu rutina de inmediato',
        effectText: '+1 Fuerza, -8% Estamina',
        effect: { strength: 1, stamina: -8, message: 'Mantuviste el foco sin pausas.' }
      }
    ]
  },
  {
    id: 'isotonic_stand',
    title: 'Puesto de Degustación Isotónica',
    icon: '🥤',
    desc: 'Una marca de nutrición deportiva está regalando muestras de su nueva bebida rehidratante con electrolitos.',
    options: [
      {
        text: 'Probar la bebida isotónica fría',
        effectText: '+30% Estamina, +15% Comida',
        effect: { stamina: 30, food: 15, message: '¡Gran golpe de hidratación! Electrolitos recuperados al instante.' }
      },
      {
        text: 'Pedir muestras de geles para tu mochila',
        effectText: '+$15 USD de ahorro, +1 Fuerza',
        effect: { money: 15, strength: 1, message: 'Guardaste suplementos de calidad para tus próximos días.' }
      }
    ]
  },
  {
    id: 'elderly_help',
    title: 'Una Vecina Necesita Ayuda',
    icon: '👵',
    desc: 'Ves a una abuelita con pesadas bolsas de compras intentando subir una escalera empinada.',
    options: [
      {
        text: 'Cargar sus bolsas hasta su puerta',
        effectText: '+2 Fuerza, +$20 USD de propina agradecida',
        effect: { strength: 2, money: 20, stamina: -8, message: '¡Entrenamiento de fuerza funcional y una gran sonrisa de agradecimiento!' }
      },
      {
        text: 'Acompañarla del brazo con cuidado',
        effectText: '+15% Estamina (Paz mental)',
        effect: { stamina: 15, message: 'La ayudaste a cruzar segura y seguiste tu camino.' }
      }
    ]
  },
  {
    id: 'street_fair',
    title: 'Feria Barrial Cortando la Avenida',
    icon: '🎪',
    desc: 'Una feria de artesanos y comida callejera bloquea tu trayecto habitual con mucha gente.',
    options: [
      {
        text: 'Esquivar a la multitud con cambios de ritmo y saltos',
        effectText: '+2 Velocidad, +1 Fuerza, -12% Estamina',
        effect: { speed: 2, strength: 1, stamina: -12, message: '¡Excelente agilidad y cambios de dirección entre la gente!' }
      },
      {
        text: 'Dar la vuelta larga por la avenida perimetral',
        effectText: '+2 Resistencia (Más distancia)',
        effect: { endurance: 2, stamina: -10, message: 'Sumaste kilómetros de fondo extra bordeando la feria.' }
      }
    ]
  },
  {
    id: 'street_musician',
    title: 'Músico Callejero con Ritmo Pegadizo',
    icon: '🎶',
    desc: 'Un baterista callejero está tocando un ritmo enérgico y acelerado que resuena en toda la plaza.',
    options: [
      {
        text: 'Sincronizar tus zancadas al compás de la música',
        effectText: '+2 Velocidad (Cadencia de 180 ppm)',
        effect: { speed: 2, stamina: -8, message: '¡Sincronizaste tu zancada con el beat a máxima velocidad!' }
      },
      {
        text: 'Dejarle $10 USD de propina y respirar hondo',
        effectText: '+$25% Estamina, -$10 USD',
        effect: { stamina: 25, money: -10, message: 'Disfrutaste la melodía y cargaste energía mental.' }
      }
    ]
  },
  {
    id: 'fan_runner',
    title: 'Corredor Principiante Pide Consejos',
    icon: '👟',
    desc: 'Un vecino que recién empieza a trotar te reconoce y te pregunta qué zapatillas y ritmo usar.',
    options: [
      {
        text: 'Explicarle técnica de respiración y apoyos',
        effectText: '+1 Resistencia, +1 Fuerza',
        effect: { endurance: 1, strength: 1, message: 'Compartir conocimientos te motivó a entrenar aún mejor.' }
      },
      {
        text: 'Invitarlo a hacer series suaves a tu lado',
        effectText: '+1 Velocidad, +15% Estamina',
        effect: { speed: 1, stamina: 15, message: 'Hicieron una sesión de compañerismo muy gratificante.' }
      }
    ]
  },
  {
    id: 'botanical_shortcut',
    title: 'Atajo por el Parque Botánico',
    icon: '🌿',
    desc: 'Ves una puerta abierta que conecta directo a través de un sendero de tierra y pendientes boscosas.',
    options: [
      {
        text: 'Tomar el sendero con cuestas de tierra',
        effectText: '+2 Resistencia, +1 Fuerza, -15% Estamina',
        effect: { endurance: 2, strength: 1, stamina: -15, message: '¡Gran trabajo de fuerza y propiocepción en subidas de tierra!' }
      },
      {
        text: 'Seguir por la vereda asfaltada plana',
        effectText: '+1 Resistencia, -6% Estamina',
        effect: { endurance: 1, stamina: -6, message: 'Mantuviste el ritmo constante sin arriesgar en desniveles.' }
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

// Dilemas Tácticos de la Maratón según la distancia del Objetivo actual
const MARATHON_TACTICAL_DILEMMAS_BY_DISTANCE = {
  5: [
    {
      id: 'dilemma_5k_1',
      title: '🌧️ Viento en Contra en la Salida (5K Urbana)',
      desc: 'Ráfagas de viento frío frenan la zancada en el kilómetro 1 de la prueba de 5K. ¿Cómo encaras el inicio?',
      options: [
        {
          title: '🛡️ Resguardarte en el Pelotón Líder',
          subtitle: 'Corres detrás de los punteros para cortar el viento y ahorrar energía.',
          bonusScore: 8,
          bonusStamina: 15,
          message: '¡Ahorraste valiosa energía para el sprint del último kilómetro!'
        },
        {
          title: '⚡ Cambio de Ritmo Temprano',
          subtitle: 'Aceleras desde el inicio para cortar el pelotón y tomar la punta.',
          bonusScore: 16,
          bonusStamina: -15,
          message: '¡Ataque agresivo! Te colocas entre los primeros pero con desgaste.'
        }
      ]
    },
    {
      id: 'dilemma_5k_2',
      title: '🔥 Ataque del Puntero en el Km 3.5',
      desc: 'El favorito a la medalla sube el ritmo a 3:20 min/km a falta de 1.5 km para el final.',
      options: [
        {
          title: '🏃‍♂️ Responder y Pegarte a su Zancada',
          subtitle: 'Sprint inmediato codo a codo para pelear la punta de la carrera.',
          bonusScore: 18,
          bonusStamina: -20,
          message: '¡Respuesta letal! Entras al último kilómetro peleando el 1º puesto.'
        },
        {
          title: '⏱️ Mantener Cadencia Constante',
          subtitle: 'Regulas el esfuerzo para no fundirte antes del sprint final.',
          bonusScore: 10,
          bonusStamina: 10,
          message: '¡Cabeza fría! Guardas piernas para el último kilómetro.'
        }
      ]
    }
  ],
  10: [
    {
      id: 'dilemma_10k_1',
      title: '🌧️ Lluvia y Asfalto Resbaladizo en el Km 4 (10K)',
      desc: 'El piso mojado exige máxima concentración en las curvas rápidas de los 10K.',
      options: [
        {
          title: '🛡️ Trazada Segura y Cadencia Alta',
          subtitle: 'Pasos cortos y control para evitar derrapes y fatiga articular.',
          bonusScore: 10,
          bonusStamina: 15,
          message: '¡Gran estabilidad! Pasaste el tramo difícil sin caídas.'
        },
        {
          title: '⚡ Cortar Curvas al Límite',
          subtitle: 'Arriesgas buscando la cuerda interna para ganar metros de ventaja.',
          bonusScore: 18,
          bonusStamina: -18,
          message: '¡Ganaste valiosos segundos de ventaja!'
        }
      ]
    },
    {
      id: 'dilemma_10k_2',
      title: '🔥 Subida del Puente en el Km 7.5',
      desc: 'Una pendiente empinada quiebra a varios corredores a 2.5 km de la meta.',
      options: [
        {
          title: '🏃‍♂️ Atacar en la Cuesta con Fuerza',
          subtitle: 'Usas tu potencia muscular para rebasar al grupo en subida.',
          bonusScore: 20,
          bonusStamina: -22,
          message: '¡Demolición en subida! Llegas en el lote de punta.'
        },
        {
          title: '⏱️ Acortar Zancada y Coronar Arriba',
          subtitle: 'Mantienes pulsaciones controladas y aceleras en la bajada.',
          bonusScore: 12,
          bonusStamina: 10,
          message: '¡Economía de carrera perfecta para el último kilómetro!'
        }
      ]
    }
  ],
  21: [
    {
      id: 'dilemma_21k_1',
      title: '🔥 Quiebre del Pelotón en el Km 14 (21K)',
      desc: 'Los atletas africanos aceleran el ritmo en la mitad de la Media Maratón.',
      options: [
        {
          title: '🏃‍♂️ Aguantar el Ritmo del Lote de Honor',
          subtitle: 'Corres al límite aeróbico para mantenerte con chances de podio.',
          bonusScore: 22,
          bonusStamina: -25,
          message: '¡Estás en la pelea directa por las medallas!'
        },
        {
          title: '⏱️ Grupo Perseguidor Progresivo',
          subtitle: 'Lideras el segundo pelotón para cazar rezagados en el tramo final.',
          bonusScore: 14,
          bonusStamina: 12,
          message: '¡Estrategia inteligente de menor a mayor!'
        }
      ]
    },
    {
      id: 'dilemma_21k_2',
      title: '💧 Puesto de Hidratación Crítico en el Km 18',
      desc: 'El glucógeno baja drásticamente a 3 km del final de los 21K.',
      options: [
        {
          title: '⚡ Gel Doble & Rehidratación Rápida',
          subtitle: 'Recuperas electrolitos para lanzar el sprint final.',
          bonusScore: 16,
          bonusStamina: 18,
          message: '¡Energía recargada para el último kilómetro!'
        },
        {
          title: '🥇 Acelerar sin Parar por el Agua',
          subtitle: 'No pierdes ni una milésima de segundo y atacas a fondo.',
          bonusScore: 24,
          bonusStamina: -22,
          message: '¡Ataque a pura adrenalina rumbo al último kilómetro!'
        }
      ]
    }
  ],
  42: [
    {
      id: 'dilemma_42k_1',
      title: '🧱 El Mítico "Muro" de los 32 Km (42K Legendaria)',
      desc: 'La fatiga metabólica golpea al cuerpo en la Gran Maratón de 42K.',
      options: [
        {
          title: '🧠 Fortaleza Mental & Ritmo Crucero',
          subtitle: 'Controlas la respiración y vences el muro con concentración.',
          bonusScore: 18,
          bonusStamina: 15,
          message: '¡Superaste el muro como un auténtico maratonista de élite!'
        },
        {
          title: '⚡ Cambio de Cadencia y Ataque Solitario',
          subtitle: 'Ignoras el dolor y lanzas un zarpazo para quebrar a tus rivales.',
          bonusScore: 28,
          bonusStamina: -28,
          message: '¡Ataque legendario! Llegas al tramo final con ventaja.'
        }
      ]
    },
    {
      id: 'dilemma_42k_2',
      title: '💧 Deshidratación Crítica en el Km 38',
      desc: 'Quedan 4 km para la gloria máxima de 42K y las piernas arden.',
      options: [
        {
          title: '⚡ Gel Isotónico & Estabilización',
          subtitle: 'Glucógeno al máximo para el sprint de los últimos 1000m.',
          bonusScore: 20,
          bonusStamina: 20,
          message: '¡Piernas listas para el sprint del último kilómetro!'
        },
        {
          title: '🥇 Coraje Total y Todo al Podio',
          subtitle: 'Apretas los dientes a fondo rumbo a la corona mundial.',
          bonusScore: 30,
          bonusStamina: -25,
          message: '¡Corazón de campeón! Entras al último kilómetro con todo.'
        }
      ]
    }
  ]
};

/**
 * Minijuego de Carrera Arcade de 3 Carriles (ÚLTIMO KILÓMETRO: Vallas, Adelantamiento de Corredores y Puesto Real)
 */
function LaneRunnerArcade({
  gender = 'male',
  raceTitle = 'Maratón de Campeonato',
  targetDistanceKm = 10,
  targetTop = 20,
  initialPosition = 8,
  tacticalBonus = 0,
  tacticalMessage = '',
  onFinishRace,
  onCancel
}) {
  const [playerLane, setPlayerLane] = useState(1); // 0: Izquierda, 1: Centro, 2: Derecha
  const [progressMeters, setProgressMeters] = useState(0); // 0 a 1000m (Último 1 km)
  const [currentPosition, setCurrentPosition] = useState(initialPosition);
  const [overtakesCount, setOvertakesCount] = useState(0);
  const [hurdlesHitCount, setHurdlesHitCount] = useState(0);
  const [energy, setEnergy] = useState(100);
  const [obstacles, setObstacles] = useState([]);
  const [bannerAlert, setBannerAlert] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [currentSpeed, setCurrentSpeed] = useState(1.0);

  const obstacleIdRef = useRef(0);
  const lastSpawnRef = useRef(0);

  // Cantidad de rivales necesarios para alcanzar el 1º puesto
  const rivalsToSpawnTotal = Math.max(initialPosition - 1, 1);
  const rivalsSpawnedRef = useRef(0);

  // Controles de teclado (Flechas Izquierda / Derecha o A / D)
  useEffect(() => {
    const handleKey = (e) => {
      if (isCompleted) return;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        setPlayerLane((prev) => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        setPlayerLane((prev) => Math.min(2, prev + 1));
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isCompleted]);

  // Bucle de animación del sprint final de 1 km
  useEffect(() => {
    let animId;
    let localDist = 0;
    let tickCount = 0;

    const step = () => {
      tickCount++;

      // Aceleración continua del sprint: de 1.0x hasta 2.3x
      const speed = 1.0 + (localDist / 1000) * 1.3;
      setCurrentSpeed(speed);

      localDist += 1.75 * speed;
      setProgressMeters(Math.min(1000, Math.round(localDist)));

      // Generación de obstáculos: Vallas constantes, Corredores a superar y Power-ups
      const spawnInterval = Math.max(22, Math.round(36 / speed));
      if (tickCount - lastSpawnRef.current >= spawnInterval && localDist < 940) {
        lastSpawnRef.current = tickCount;
        obstacleIdRef.current++;

        const randomLane = Math.floor(Math.random() * 3);
        const randRoll = Math.random();

        let item = null;
        // Priorizar corredores que están por delante para poder alcanzar el 1º puesto
        if (randRoll < 0.44 && rivalsSpawnedRef.current < rivalsToSpawnTotal + 2) {
          rivalsSpawnedRef.current++;
          item = {
            type: 'rival',
            icon: '🏃‍♂️',
            name: 'Corredor Adelante',
            isRival: true
          };
        } else if (randRoll < 0.84) {
          // Muchas Vallas de carrera
          item = {
            type: 'hurdle',
            icon: '🚧',
            name: 'Valla de Carrera',
            isHurdle: true
          };
        } else {
          // Gels de estamina o puestos de agua
          item = randRoll < 0.92
            ? { type: 'gel', icon: '⚡', name: 'Gel Turbo', isGood: true, bonusEnergy: 10 }
            : { type: 'water', icon: '💧', name: 'Puesto de Agua', isGood: true, bonusEnergy: 8 };
        }

        setObstacles((prev) => [
          ...prev,
          {
            id: obstacleIdRef.current,
            lane: randomLane,
            y: 0,
            ...item,
            processed: false
          }
        ]);
      }

      // Descenso de obstáculos y detección de adelantamientos / choques
      setObstacles((prev) => {
        const nextObstacles = [];
        for (const obs of prev) {
          const nextY = obs.y + 1.5 * speed;

          // Ventana de interacción en la altura del jugador (68% - 88%)
          if (nextY >= 68 && nextY <= 88 && !obs.processed) {
            if (obs.isRival) {
              if (obs.lane !== playerLane) {
                // ¡ADELANTASTE AL CORREDOR EXITOSAMENTE! (Subes 1 puesto)
                obs.processed = true;
                setCurrentPosition((prevPos) => {
                  const newPos = Math.max(1, prevPos - 1);
                  setBannerAlert({
                    text: newPos === 1 ? '🥇 ¡ADELANTASTE AL LÍDER! ¡VAS EN 1º PUESTO!' : `⚡ ¡Adelantaste a un corredor! Subes al puesto #${newPos}`,
                    isGood: true
                  });
                  return newPos;
                });
                setOvertakesCount((c) => c + 1);
                setTimeout(() => setBannerAlert(null), 1200);
              } else {
                // CHOQUE FRONTAL CON EL CORREDOR (Pierdes 1 puesto)
                obs.processed = true;
                setCurrentPosition((prevPos) => {
                  const newPos = prevPos + 1;
                  setBannerAlert({
                    text: `💥 ¡Choque con corredor! Caes al puesto #${newPos}`,
                    isGood: false
                  });
                  return newPos;
                });
                setEnergy((e) => Math.max(10, e - 8));
                setTimeout(() => setBannerAlert(null), 1200);
              }
            } else if (obs.isHurdle) {
              if (obs.lane === playerLane) {
                // TROPIEZO CON VALLA (Pierdes 1 puesto)
                obs.processed = true;
                setCurrentPosition((prevPos) => {
                  const newPos = prevPos + 1;
                  setBannerAlert({
                    text: `⚠️ ¡Tropezaste con una valla! Caes al puesto #${newPos}`,
                    isGood: false
                  });
                  return newPos;
                });
                setHurdlesHitCount((h) => h + 1);
                setEnergy((e) => Math.max(10, e - 12));
                setTimeout(() => setBannerAlert(null), 1200);
              }
            } else if (obs.isGood) {
              if (obs.lane === playerLane) {
                obs.processed = true;
                setEnergy((e) => Math.min(100, e + obs.bonusEnergy));
                setBannerAlert({ text: `+${obs.bonusEnergy}% Estamina ¡${obs.name}!`, isGood: true });
                setTimeout(() => setBannerAlert(null), 1200);
              }
            }
          }

          if (nextY < 105) {
            nextObstacles.push({ ...obs, y: nextY });
          }
        }
        return nextObstacles;
      });

      // Llegada a la meta tras 1000m
      if (localDist >= 1000) {
        setIsCompleted(true);
        return;
      }

      animId = requestAnimationFrame(step);
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [playerLane, currentPosition]);

  const handleFinish = () => {
    onFinishRace({
      finalPosition: currentPosition,
      energy,
      distanceKm: targetDistanceKm
    });
  };

  const laneXPos = ['18%', '50%', '82%'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/95 backdrop-blur-xl animate-fade-in">
      <div className="bg-[#0b071e] border-2 border-cyan-400/50 rounded-3xl max-w-xl w-full p-4 sm:p-6 space-y-3.5 shadow-2xl shadow-cyan-950/80 text-center relative overflow-hidden">
        
        {/* Cabecera del Minijuego Arcade */}
        <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
          <div className="text-left">
            <span className="text-[10px] font-mono text-neon-cyan uppercase tracking-widest font-black flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 animate-pulse" /> SPRINT FINAL // ÚLTIMO 1 KM
            </span>
            <h3 className="text-lg sm:text-xl font-black text-white uppercase font-display tracking-tight">
              {raceTitle}
            </h3>
          </div>
          <div className="text-right font-mono">
            <span className="text-[9px] text-neutral-400 uppercase block">Velocidad</span>
            <span className="text-sm font-black text-neon-cyan">{(currentSpeed * 18).toFixed(1)} km/h</span>
          </div>
        </div>

        {/* BANNER PRINCIPAL DE CONDICIÓN: 1 KM DE LA META Y CHANCES DE 1º PUESTO */}
        <div className="p-3 rounded-2xl bg-gradient-to-r from-cyan-950/90 via-[#0e0828] to-purple-950/90 border border-cyan-400/40 text-left font-mono space-y-1 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-neon-cyan uppercase tracking-wider flex items-center gap-1.5">
              🏁 ¡ESTÁS A 1 KM DEL FINAL!
            </span>
            <span className="text-[10px] text-amber-300 font-bold bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-400/40">
              Sprint Decisivo
            </span>
          </div>
          <p className="text-[11px] text-neutral-300 font-sans leading-snug">
            Inicias este último km en el <strong className="text-neon-cyan">Puesto #{initialPosition}</strong>. ¡Esquiva las vallas y supera a los <strong className="text-amber-300">{initialPosition - 1} corredores</strong> que tienes delante para quedar en el <strong className="text-neon-cyan">1º Puesto</strong>!
          </p>
        </div>

        {/* HUD EN TIEMPO REAL: PUESTO ACTUAL, CORREDORES RESTANTES PARA 1º, DISTANCIA Y ESTAMINA */}
        <div className="grid grid-cols-4 gap-2 py-2 px-3 rounded-2xl bg-space-950/80 border border-white/10 font-mono text-center">
          <div className="p-1.5 rounded-xl bg-space-900 border border-cyan-500/30">
            <span className="text-[8px] text-neutral-400 uppercase block">Puesto Actual</span>
            <span className={`text-sm sm:text-base font-black ${currentPosition === 1 ? 'text-amber-300 animate-pulse' : 'text-neon-cyan'}`}>
              #{currentPosition} {currentPosition === 1 ? '🥇' : ''}
            </span>
          </div>
          <div className="p-1.5 rounded-xl bg-space-900 border border-purple-500/30">
            <span className="text-[8px] text-neutral-400 uppercase block">Faltan para 1º</span>
            <span className="text-sm sm:text-base font-black text-purple-300">
              {currentPosition > 1 ? `${currentPosition - 1} rivales` : '¡LÍDER!'}
            </span>
          </div>
          <div className="p-1.5 rounded-xl bg-space-900 border border-white/10">
            <span className="text-[8px] text-neutral-400 uppercase block">Distancia</span>
            <span className="text-sm sm:text-base font-black text-white">{progressMeters}m / 1000m</span>
          </div>
          <div className="p-1.5 rounded-xl bg-space-900 border border-white/10">
            <span className="text-[8px] text-neutral-400 uppercase block">Estamina</span>
            <span className="text-sm sm:text-base font-black text-fuchsia-400">{energy}%</span>
          </div>
        </div>

        {/* BARRA DE PROGRESO DE LOS 1000 METROS */}
        <div className="w-full bg-space-900 rounded-full h-2 border border-white/10 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-neon-purple via-violet-500 to-neon-cyan transition-all duration-150"
            style={{ width: `${(progressMeters / 1000) * 100}%` }}
          />
        </div>

        {/* PISTA DE 3 CARRILES INTERACTIVA */}
        <div className="relative w-full h-80 sm:h-96 rounded-2xl bg-gradient-to-b from-[#160e36] via-[#0f0927] to-[#080415] border border-cyan-500/30 overflow-hidden shadow-inner flex justify-center select-none">
          
          {/* Líneas divisorias de carriles */}
          <div className="absolute inset-y-0 left-1/3 w-0.5 border-r border-dashed border-cyan-500/30" />
          <div className="absolute inset-y-0 left-2/3 w-0.5 border-r border-dashed border-cyan-500/30" />

          {/* Marcas de asfalto */}
          <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />

          {/* Banner flotante de impacto */}
          {bannerAlert && (
            <div
              className={`absolute top-4 inset-x-6 z-30 py-1.5 px-3 rounded-xl font-mono text-xs font-bold uppercase tracking-wider animate-bounce ${
                bannerAlert.isGood
                  ? 'bg-emerald-500/95 text-white border border-emerald-300 shadow-lg shadow-emerald-950/80'
                  : 'bg-rose-600/95 text-white border border-rose-300 shadow-lg shadow-rose-950/80'
              }`}
            >
              {bannerAlert.text}
            </div>
          )}

          {/* Obstáculos (Vallas), Corredores y Power-ups cayendo */}
          {obstacles.map((obs) => (
            <div
              key={obs.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-75 text-2xl sm:text-3xl filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]"
              style={{
                left: laneXPos[obs.lane],
                top: `${obs.y}%`
              }}
            >
              <div className={obs.isGood ? 'animate-pulse scale-110' : (obs.isRival ? 'scale-105 filter drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]' : '')}>
                {obs.icon}
              </div>
            </div>
          ))}

          {/* Sprite del Atleta en su carril */}
          <div
            className="absolute bottom-6 transform -translate-x-1/2 transition-all duration-150 z-20"
            style={{ left: laneXPos[playerLane] }}
          >
            <div className="flex flex-col items-center">
              <HumanCharacterSprite gender={gender} isWalking={true} direction="right" />
              <div className="w-8 h-2 bg-neon-cyan/40 rounded-full blur-[2px] -mt-1" />
            </div>
          </div>

          {/* Mensaje de Meta al finalizar el 1 km */}
          {isCompleted && (
            <div className="absolute inset-0 z-40 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center space-y-3 p-4 animate-fade-in text-center">
              <div className={`w-16 h-16 rounded-full border-2 flex items-center justify-center animate-bounce ${currentPosition === 1 ? 'bg-amber-500/20 border-amber-400 shadow-xl shadow-amber-950/80' : 'bg-neon-cyan/20 border-neon-cyan'}`}>
                <Trophy className={`w-8 h-8 ${currentPosition === 1 ? 'text-amber-300' : 'text-cyan-300'}`} />
              </div>
              <h4 className="text-2xl font-black text-white uppercase font-display tracking-tight">
                {currentPosition === 1 ? '🥇 ¡CRUZASTE EN 1º PUESTO! (CAMPEÓN)' : `¡LÍNEA DE META CRUZADA! (#${currentPosition})`}
              </h4>
              <p className="text-xs font-mono text-neutral-300">
                Superaste a <strong className="text-neon-cyan">{overtakesCount} corredores</strong> y esquivaste obstáculos en el último kilómetro.
              </p>
              <button
                type="button"
                onClick={handleFinish}
                className="py-3 px-6 rounded-xl bg-gradient-to-r from-neon-purple to-neon-cyan text-white font-mono text-xs font-black uppercase tracking-wider shadow-xl shadow-purple-900/60 hover:scale-105 transition-transform cursor-pointer"
              >
                Ver Clasificación Final →
              </button>
            </div>
          )}

        </div>

        {/* BOTONES TÁCTILES DE CONTROL (IZQUIERDA / DERECHA) */}
        {!isCompleted && (
          <div className="flex items-center justify-between gap-3 pt-1">
            <button
              type="button"
              onClick={() => setPlayerLane((prev) => Math.max(0, prev - 1))}
              disabled={playerLane === 0}
              className="flex-1 py-3 rounded-2xl bg-space-900/90 hover:bg-space-850 active:scale-95 border border-cyan-500/40 text-cyan-300 font-mono text-xs font-black uppercase flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
            >
              ⬅️ Mover Izquierda (A / ◀)
            </button>

            <button
              type="button"
              onClick={() => setPlayerLane((prev) => Math.min(2, prev + 1))}
              disabled={playerLane === 2}
              className="flex-1 py-3 rounded-2xl bg-space-900/90 hover:bg-space-850 active:scale-95 border border-cyan-500/40 text-cyan-300 font-mono text-xs font-black uppercase flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
            >
              Mover Derecha (D / ▶) ➡️
            </button>
          </div>
        )}

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
    return saved ? Number(saved) : 1; // 1 a 12
  });

  const [extraTurns, setExtraTurns] = useState(() => {
    const saved = localStorage.getItem('mypowerup_game_extra_turns');
    return saved ? Number(saved) : 0;
  });

  const [currentTurn, setCurrentTurn] = useState(() => {
    const saved = localStorage.getItem('mypowerup_game_turn');
    return saved ? Number(saved) : 1;
  });

  const maxTurnsInMonth = 5 + extraTurns; // 5 turnos base por mes + turnos extras

  // Artículos comprados en el mes actual (máximo 1 de cada por mes)
  const [boughtShopItems, setBoughtShopItems] = useState(() => {
    const saved = localStorage.getItem('mypowerup_game_bought_items');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });

  // 3. Atributos: Resistencia, Velocidad, Fuerza, Estamina (0-100%), Comida (0-100%), Dinero ($)
  const [stats, setStats] = useState(() => {
    const saved = localStorage.getItem('mypowerup_game_stats_v2');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      endurance: 10,   // Resistencia (fondo)
      speed: 8,        // Velocidad (ritmo)
      strength: 6,     // Fuerza (prevención de lesión y potencia)
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
  const [injuryTitle, setInjuryTitle] = useState('¡Lesión Deportiva!');
  const [injuryMessage, setInjuryMessage] = useState(null);

  // Estados del Minijuego de 3 Carriles, Dilemas Tácticos y Desafíos Relámpago
  const [activeTacticalDilemma, setActiveTacticalDilemma] = useState(null);
  const [isLaneRaceActive, setIsLaneRaceActive] = useState(false);
  const [raceMode, setRaceMode] = useState('marathon'); // 'marathon' o 'flash'
  const [tacticalBonus, setTacticalBonus] = useState(0);
  const [tacticalMessage, setTacticalMessage] = useState('');
  const [flashRaceInvitation, setFlashRaceInvitation] = useState(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

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

  // Al estar en el Turno 6 (Turno extra nocturno), la ciudad pasa automáticamente al modo noche
  useEffect(() => {
    if (currentTurn >= 6) {
      setTimeMode('night');
    }
  }, [currentTurn]);

  // Guardar estado del juego
  useEffect(() => {
    localStorage.setItem('mypowerup_game_goal_idx', String(goalIndex));
    localStorage.setItem('mypowerup_game_month', String(currentMonth));
    localStorage.setItem('mypowerup_game_extra_turns', String(extraTurns));
    localStorage.setItem('mypowerup_game_turn', String(currentTurn));
    localStorage.setItem('mypowerup_game_stats_v2', JSON.stringify(stats));
    localStorage.setItem('mypowerup_game_bought_items', JSON.stringify(boughtShopItems));
  }, [goalIndex, currentMonth, extraTurns, currentTurn, stats, boughtShopItems]);

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

  // Función de Reinicio de Partida Completa
  const handleResetGame = () => {
    localStorage.removeItem('mypowerup_game_goal_idx');
    localStorage.removeItem('mypowerup_game_month');
    localStorage.removeItem('mypowerup_game_extra_turns');
    localStorage.removeItem('mypowerup_game_turn');
    localStorage.removeItem('mypowerup_game_stats_v2');
    localStorage.removeItem('mypowerup_game_bought_items');

    setGoalIndex(0);
    setCurrentMonth(1);
    setExtraTurns(0);
    setCurrentTurn(1);
    setStats({
      endurance: 10,
      speed: 8,
      strength: 6,
      stamina: 100,
      food: 85,
      money: 100
    });
    setBoughtShopItems([]);
    setIsResetConfirmOpen(false);
    setActionStatus('Partida reiniciada. ¡Comienzas tu camino hacia la Gran Maratón!');
  };

  // Procesar compras en la Tienda (Límite: 1 de cada producto por mes)
  const handleBuyShopItem = (item) => {
    if (boughtShopItems.includes(item.id)) {
      alert('Ya compraste este artículo en este mes. Solo puedes comprar 1 unidad de cada producto por mes.');
      return;
    }

    if (stats.money < item.cost) {
      alert('No tienes suficiente dinero para esta compra.');
      return;
    }

    setBoughtShopItems((prev) => {
      const updated = [...prev, item.id];
      localStorage.setItem('mypowerup_game_bought_items', JSON.stringify(updated));
      return updated;
    });

    if (item.effect?.extraTurns) {
      setExtraTurns((prev) => {
        const updated = prev + item.effect.extraTurns;
        localStorage.setItem('mypowerup_game_extra_turns', String(updated));
        return updated;
      });
      // Si ya está en el turno 5 o posterior, activar inmediatamente el modo noche
      if (currentTurn >= 5) {
        setTimeMode('night');
      }
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
      statChanges.endurance = 0;
      statusText = 'Descanso en casa: +60% Estamina, +25% Comida y bienestar.';
    } else if (locationId === 'running') {
      // Correr: Gasta estamina balanceada (-32%)
      statChanges.endurance = 2;
      statChanges.speed = 1;
      statChanges.stamina = -Math.round(32 * hungerMultiplier);
      statChanges.food = -18;
      statusText = `Series de Running: +2 Resistencia, +1 Velocidad, -${Math.round(32 * hungerMultiplier)}% Estamina.`;
    } else if (locationId === 'gym') {
      // Gimnasio: Gasta MENOS estamina que correr (-18%)
      statChanges.strength = 2;
      statChanges.speed = 0;
      statChanges.stamina = -Math.round(18 * hungerMultiplier);
      statChanges.food = -14;
      statusText = `Entrenamiento de GYM: +2 Fuerza, -${Math.round(18 * hungerMultiplier)}% Estamina.`;
    } else if (locationId === 'walk') {
      // Caminata: bajo gasto de estamina (-8%)
      statChanges.endurance = 1;
      statChanges.stamina = -8;
      statChanges.food = -6;
      statusText = 'Caminata en el parque: +1 Resistencia, -8% Estamina.';
    } else if (locationId === 'bike') {
      // Bicicleta: gasto moderado (-24%)
      statChanges.endurance = 1;
      statChanges.speed = 1;
      statChanges.strength = 0;
      statChanges.stamina = -Math.round(24 * hungerMultiplier);
      statChanges.food = -12;
      statusText = `Ciclovía: +1 Resistencia, +1 Velocidad, -${Math.round(24 * hungerMultiplier)}% Estamina.`;
    }

    // Actualizar estadísticas
    setStats((prev) => {
      const newStamina = Math.max(0, Math.min(100, prev.stamina + statChanges.stamina));
      const newFood = Math.max(0, Math.min(100, prev.food + statChanges.food));
      const newEndurance = Math.max(0, prev.endurance + statChanges.endurance);
      const newSpeed = Math.max(0, prev.speed + statChanges.speed);
      const newStrength = Math.max(0, prev.strength + statChanges.strength);

      // Comprobar lesión contextual según el lugar si la estamina llega a 0
      if (newStamina <= 0 && locationId !== 'home') {
        const injuryList = ACTIVITY_INJURIES[locationId] || ACTIVITY_INJURIES.default;
        const pickedInjury = injuryList[Math.floor(Math.random() * injuryList.length)];
        setIsInjured(true);
        setInjuryTitle(pickedInjury.title);
        setInjuryMessage(pickedInjury.desc);
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

    // DESAFÍO RELÁMPAGO / CARRERA SORPRESA (Camino a los 10K / 21K / 42K)
    // 14% de probabilidad si ya superó los 5K
    const shouldTriggerFlashRace = goalIndex >= 1 && Math.random() < 0.14 && locationId !== 'home';
    if (shouldTriggerFlashRace) {
      setFlashRaceInvitation({
        title: '⚡ ¡Desafío Callejero Relámpago (7K Nocturno)!',
        desc: 'Un grupo de corredores de élite de la ciudad te invita a una carrera no oficial de 7K. ¿Deseas correrla ahora mismo?',
        reward: '+4 Resistencia, +3 Velocidad, +$40 USD y experiencia de carrera',
        risk: '-35% Estamina (Riesgo de lesión si te quedas sin energía)'
      });
      return;
    }

    // Eventos aleatorios urbanos periódicos (~28% de probabilidad al ir de un punto a otro)
    const shouldTriggerEvent = Math.random() < 0.28 && locationId !== 'home';
    if (shouldTriggerEvent) {
      const randomEvt = RANDOM_EVENTS[Math.floor(Math.random() * RANDOM_EVENTS.length)];
      setActiveEvent(randomEvt);
      return;
    }

    advanceTurn();
  };

  // Avanzar turno en el calendario (5 turnos por mes + turnos extras)
  const advanceTurn = () => {
    if (currentTurn < maxTurnsInMonth) {
      const nextTurn = currentTurn + 1;
      setCurrentTurn(nextTurn);
      // Al entrar al turno 6 (turno extra), la ciudad pasa automáticamente a modo noche
      if (nextTurn >= 6) {
        setTimeMode('night');
      }
    } else {
      // ¡TERMINÓ EL MES (Turnos completados)!
      // 1. Regresa automáticamente a casa
      setCharacterPos({ x: CITY_LOCATIONS.home.x, y: CITY_LOCATIONS.home.y });
      setCurrentLocationId('home');
      setTargetLocationId('home');
      setIsWalking(false);

      // 2. Pasa a ser de noche al completar el mes
      setTimeMode('night');

      // 3. Ganancia por patrocinio al completar el mes (+$50 por mes)
      const periodIncome = 50;
      setStats((prev) => ({
        ...prev,
        money: prev.money + periodIncome
      }));
      setMonthGains((prev) => ({
        ...prev,
        money: prev.money + periodIncome
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
          title: '🎲 ¡DADO 6: Mes Imparable & Patrocinador!',
          badge: 'text-neon-cyan border-cyan-400 bg-cyan-950/40',
          desc: 'Tu resistencia aeróbica es brillante. Un sponsor te premia con +$25 extra y ganas +1 Resistencia.',
          apply: () => {
            setStats((prev) => ({
              ...prev,
              money: prev.money + 25,
              endurance: prev.endurance + 1,
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
          desc: 'La falta de balance aeróbico te pasa factura: una contractura te dejará con 50% de estamina inicial.',
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

    // Reiniciar ganancias y turnos extras del mes
    setMonthGains({ endurance: 0, speed: 0, strength: 0, money: 0 });
    setExtraTurns(0);
    localStorage.removeItem('mypowerup_game_extra_turns');

    // Reiniciar artículos comprados en la tienda para el nuevo mes
    setBoughtShopItems([]);
    localStorage.setItem('mypowerup_game_bought_items', JSON.stringify([]));

    if (currentMonth < 12) {
      setCurrentMonth((prev) => prev + 1);
      setCurrentTurn(1);
      setTimeMode('day');
    } else {
      // ¡Fin de año (Diciembre completado) => Iniciar Flujo de la Gran Maratón!
      startMarathonRaceFlow();
    }
  };

  // Iniciar la Gran Maratón con el Dilema Táctico previo según la distancia
  const startMarathonRaceFlow = () => {
    const dilemmas = MARATHON_TACTICAL_DILEMMAS_BY_DISTANCE[currentGoal.distanceKm] || MARATHON_TACTICAL_DILEMMAS_BY_DISTANCE[5];
    const randomDilemma = dilemmas[Math.floor(Math.random() * dilemmas.length)];
    setRaceMode('marathon');
    setActiveTacticalDilemma(randomDilemma);
  };

  // Calcular posición inicial para el último 1 km según rendimiento físico acumulado
  const calculateInitialPosition = () => {
    if (raceMode === 'flash') return 8; // En carrera relámpago arrancas en el puesto 8
    const endRatio = Math.min(1.4, stats.endurance / (currentGoal.requiredEndurance || 22));
    const spdRatio = Math.min(1.4, stats.speed / (currentGoal.requiredSpeed || 18));
    const strRatio = Math.min(1.4, stats.strength / 15);
    const physicalScore = (endRatio * 0.45 + spdRatio * 0.35 + strRatio * 0.20) * 80;
    const preScore = physicalScore + (stats.stamina / 100) * 15 + (tacticalBonus / 25) * 10;

    if (preScore >= 95) {
      // ¡Atleta de élite! A tiro del 1º puesto (puesto #3 o #4)
      return Math.floor(Math.random() * 2) + 3;
    } else if (preScore >= 80) {
      return Math.floor(Math.random() * 3) + 5; // #5 a #7
    } else if (preScore >= 65) {
      return Math.floor(Math.random() * 4) + 8; // #8 a #11
    } else if (preScore >= 50) {
      return Math.floor(Math.random() * 5) + 12; // #12 a #16
    } else {
      return Math.floor(Math.random() * 8) + 17; // #17 a #24
    }
  };

  // Elegir opción táctica previa a la carrera
  const handleSelectTacticalOption = (option) => {
    setTacticalBonus(option.bonusScore || 0);
    setTacticalMessage(option.message || option.title);

    // Aplicar ajuste de estamina táctico
    if (option.bonusStamina) {
      setStats((prev) => ({
        ...prev,
        stamina: Math.max(10, Math.min(100, prev.stamina + option.bonusStamina))
      }));
    }

    setActiveTacticalDilemma(null);
    // Iniciar el Minijuego de 3 Carriles (Sprint del Último 1 Km)
    setIsLaneRaceActive(true);
  };

  // Aceptar la Carrera Relámpago (Desafío sorpresa)
  const handleAcceptFlashRace = () => {
    setFlashRaceInvitation(null);
    setRaceMode('flash');
    setTacticalBonus(10);
    setTacticalMessage('¡Adrenalina de Carrera Callejera no oficial!');
    setIsLaneRaceActive(true);
  };

  // Finalizar el Minijuego de 3 Carriles y registrar la posición cruzada en meta
  const handleFinishLaneRace = ({ finalPosition, energy }) => {
    setIsLaneRaceActive(false);

    if (raceMode === 'flash') {
      // Recompensas y desgaste de la Carrera Relámpago
      const newStamina = Math.max(0, stats.stamina - 35);
      setStats((prev) => ({
        ...prev,
        endurance: prev.endurance + 4,
        speed: prev.speed + 3,
        money: prev.money + 40,
        stamina: newStamina
      }));

      if (newStamina <= 0) {
        setIsInjured(true);
        setInjuryTitle('¡Tirón Muscular en Carrera Relámpago!');
        setInjuryMessage('La intensidad de la carrera relámpago sin suficiente estamina previa provocó una sobrecarga aguda en tus gemelos.');
      } else {
        setActionStatus(`¡Completaste el Desafío 7K! Llegaste en el puesto #${finalPosition}. Ganaste +4 Resistencia, +3 Velocidad y +$40 USD.`);
      }

      advanceTurn();
      return;
    }

    // Modo Gran Maratón Oficial (Fin de año / Temporada): El puesto final es el alcanzado en meta
    const isQualified = finalPosition <= currentGoal.targetTop;

    setRaceDayResult({
      position: finalPosition,
      isQualified,
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
    setExtraTurns(0);
    localStorage.removeItem('mypowerup_game_extra_turns');
    setCurrentTurn(1);
    setTimeMode('day');
    setBoughtShopItems([]);
    localStorage.setItem('mypowerup_game_bought_items', JSON.stringify([]));
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
                  <span className="text-[10px] font-mono text-pink-300">Máximo 1 compra de cada artículo por período</span>
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
                const isAlreadyBought = boughtShopItems.includes(item.id);
                const canAfford = stats.money >= item.cost;
                const canBuy = canAfford && !isAlreadyBought;

                return (
                  <div
                    key={item.id}
                    className={`p-3 rounded-2xl bg-space-900/70 border flex items-center justify-between gap-3 transition-all ${
                      isAlreadyBought ? 'border-white/5 opacity-70' : 'border-white/5 hover:border-pink-500/30'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl p-1.5 rounded-xl bg-space-850 border border-white/5">{item.icon}</span>
                      <div>
                        <div className="font-display font-bold text-white text-xs flex items-center gap-2">
                          <span>{item.name}</span>
                          {isAlreadyBought && (
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-pink-950/80 text-pink-300 border border-pink-500/40 font-bold">
                              ✓ Comprado (1/1)
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-pink-300 font-mono">{item.desc}</div>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={!canBuy}
                      onClick={() => handleBuyShopItem(item)}
                      className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all ${
                        isAlreadyBought
                          ? 'bg-neutral-800 text-neutral-400 border border-neutral-700 cursor-not-allowed'
                          : canAfford
                          ? 'bg-pink-600 hover:bg-pink-500 text-white shadow-md shadow-pink-900/40 cursor-pointer'
                          : 'bg-white/5 text-neutral-500 border border-white/5 cursor-not-allowed'
                      }`}
                    >
                      {isAlreadyBought ? 'Agotado' : `$${item.cost}`}
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
                // FIN DE MES // {MONTH_NAMES[currentMonth - 1].toUpperCase()}
              </span>
              <h3 className="text-2xl font-black text-white uppercase font-display tracking-tight">
                Resumen de {MONTH_NAMES[currentMonth - 1]}
              </h3>
              <p className="text-xs text-neutral-300 font-sans">
                Has completado los turnos de {MONTH_NAMES[currentMonth - 1]} y regresas a casa a descansar.
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

      {/* 4. MINIJUEGO DE 3 CARRILES ARCADE (SPRINT FINAL DE 1 KM) */}
      {isLaneRaceActive && (
        <LaneRunnerArcade
          gender={characterGender || 'male'}
          raceTitle={raceMode === 'flash' ? '⚡ Desafío Callejero 7K' : `🏆 ${currentGoal.name}`}
          targetDistanceKm={raceMode === 'flash' ? 7 : currentGoal.distanceKm}
          targetTop={currentGoal.targetTop}
          initialPosition={calculateInitialPosition()}
          tacticalBonus={tacticalBonus}
          tacticalMessage={tacticalMessage}
          onFinishRace={handleFinishLaneRace}
          onCancel={() => setIsLaneRaceActive(false)}
        />
      )}

      {/* 5. MODAL DE DILEMA TÁCTICO DE CARRERA (ANTES DE LA MARATÓN) */}
      {activeTacticalDilemma && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg animate-fade-in">
          <div className="bg-[#0e0828] border-2 border-violet-500/50 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl shadow-purple-950/80 text-left relative">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-violet-600 to-neon-cyan text-white shadow-lg">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-neon-cyan uppercase tracking-widest font-black block">
                  // ESTRATEGIA // DÍA DE CARRERA
                </span>
                <h3 className="text-xl font-black text-white uppercase font-display tracking-tight">
                  {activeTacticalDilemma.title}
                </h3>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-neutral-300 font-sans leading-relaxed">
              {activeTacticalDilemma.desc}
            </p>

            <div className="space-y-3 pt-2">
              <span className="text-[10px] font-mono text-neutral-400 uppercase font-bold block">
                Selecciona tu Estrategia de Carrera:
              </span>

              {activeTacticalDilemma.options.map((opt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectTacticalOption(opt)}
                  className="w-full p-4 rounded-2xl bg-space-900/90 hover:bg-violet-950/70 border border-white/10 hover:border-neon-cyan text-left transition-all flex flex-col gap-1 cursor-pointer group shadow-md"
                >
                  <div className="font-display font-black text-white text-sm group-hover:text-neon-cyan transition-colors flex items-center justify-between">
                    <span>{opt.title}</span>
                    <span className="text-xs font-mono font-bold text-neon-cyan">+{opt.bonusScore} Pts</span>
                  </div>
                  <div className="font-sans text-xs text-neutral-400">
                    {opt.subtitle}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAL DE DESAFÍO RELÁMPAGO / CARRERA SORPRESA */}
      {flashRaceInvitation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg animate-fade-in">
          <div className="bg-[#0e0828] border-2 border-cyan-400/50 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl shadow-cyan-950/80 text-left relative">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-neon-cyan border border-cyan-500/40">
                <Zap className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-neon-cyan uppercase tracking-widest font-black block">
                  // DESAFÍO RELÁMPAGO // 7K
                </span>
                <h3 className="text-xl font-black text-white uppercase font-display tracking-tight">
                  {flashRaceInvitation.title}
                </h3>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-neutral-300 font-sans leading-relaxed">
              {flashRaceInvitation.desc}
            </p>

            <div className="space-y-2 p-3 rounded-2xl bg-space-950/80 border border-white/10 font-mono text-xs">
              <div className="text-emerald-400 font-bold flex items-center gap-2">
                <span>🎁 {flashRaceInvitation.reward}</span>
              </div>
              <div className="text-rose-400 font-bold flex items-center gap-2">
                <span>⚠️ {flashRaceInvitation.risk}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={handleAcceptFlashRace}
                className="py-3 px-4 rounded-xl bg-gradient-to-r from-neon-purple to-neon-cyan text-white font-mono text-xs font-black uppercase tracking-wider shadow-lg shadow-purple-900/50 hover:scale-105 transition-transform cursor-pointer"
              >
                🏃‍♂️ Correr Desafío
              </button>

              <button
                type="button"
                onClick={() => {
                  setFlashRaceInvitation(null);
                  advanceTurn();
                }}
                className="py-3 px-4 rounded-xl bg-space-900 hover:bg-space-850 border border-white/10 text-neutral-400 hover:text-white font-mono text-xs font-bold uppercase transition-all cursor-pointer"
              >
                Declinar & Seguir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. MODAL DE CONFIRMACIÓN DE REINICIO DE PARTIDA */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg animate-fade-in">
          <div className="bg-[#180a14] border border-rose-500/40 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl shadow-rose-950/80 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 mx-auto flex items-center justify-center">
              <RotateCcw className="w-6 h-6 animate-spin" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-black text-white uppercase font-display">
                ¿Reiniciar Toda la Campaña?
              </h3>
              <p className="text-xs text-neutral-300 font-sans leading-relaxed">
                Se restablecerá todo el progreso al <strong>Nivel 1 (Maratón Urbana 5K)</strong>, Mes 1 Enero Inicio, estadísticas base y $100 USD.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={handleResetGame}
                className="py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-black uppercase transition-all cursor-pointer shadow-lg shadow-rose-950/60"
              >
                Sí, Reiniciar
              </button>
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="py-3 px-4 rounded-xl bg-space-900 hover:bg-space-850 border border-white/10 text-neutral-300 font-mono text-xs font-bold uppercase transition-all cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. MODAL DE SITUACIONES Y EVENTOS ALEATORIOS ENTRE TURNOS */}
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

      {/* 9. MODAL DE RESULTADO DE LA GRAN MARATÓN (DÍA DE CARRERA) */}
      {raceDayResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg animate-fade-in">
          <div className="bg-[#0D0824] border border-violet-500/40 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl shadow-violet-950/80 text-center">
            
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-violet-600 to-neon-cyan p-0.5 mx-auto flex items-center justify-center shadow-xl shadow-purple-900/50">
              <div className="w-full h-full bg-[#0D0824] rounded-[22px] flex items-center justify-center">
                <Trophy className={`w-8 h-8 ${raceDayResult.position === 1 ? 'text-amber-300 animate-bounce' : (raceDayResult.isQualified ? 'text-cyan-300' : 'text-neutral-400')}`} />
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono text-neon-cyan uppercase tracking-widest font-bold">
                // RESULTADO FINAL // {raceDayResult.goal.name}
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white uppercase font-display tracking-tight">
                {raceDayResult.position === 1 ? '🥇 ¡CAMPEÓN ABSOLUTO! (1º PUESTO)' : (raceDayResult.position <= 3 ? '🥈 PODIO DE HONOR' : raceDayResult.goal.name)}
              </h3>
              <p className="text-xs text-neutral-300 font-sans">
                Distancia: {raceDayResult.goal.distanceKm} km | Meta requerida: Top {raceDayResult.goal.targetTop}
              </p>
            </div>

            {/* Posición Final */}
            <div className="py-4 px-6 rounded-2xl bg-space-900/80 border border-white/10 space-y-2">
              <span className="text-xs font-mono text-neutral-400 uppercase">Posición Oficial en la Carrera</span>
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

      {/* 10. MODAL DE LESIÓN */}
      {isInjured && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="bg-[#180a14] border border-rose-500/40 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl shadow-rose-950/80 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-black text-white uppercase font-display">
                {injuryTitle || '¡Lesión Deportiva!'}
              </h3>
              <p className="text-xs text-neutral-300 font-sans leading-relaxed">
                {injuryMessage}
              </p>
              <p className="text-[11px] font-mono text-rose-300/90 pt-2 font-bold">
                ⚠️ Requiere rehabilitación integral: Se saltea el mes entero en curso.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsInjured(false);
                setInjuryTitle('¡Lesión Deportiva!');
                setInjuryMessage(null);
                setExtraTurns(0);
                localStorage.removeItem('mypowerup_game_extra_turns');
                setBoughtShopItems([]);
                localStorage.setItem('mypowerup_game_bought_items', JSON.stringify([]));

                // Saltear el mes entero
                if (currentMonth < 12) {
                  setCurrentMonth((prev) => prev + 1);
                } else {
                  setCurrentMonth(1);
                }
                setCurrentTurn(1);
                setTimeMode('day');
                setStats((prev) => ({ ...prev, stamina: 70, food: 75 }));
                setActionStatus('Mes de reposo médico completado. Inicias el nuevo mes rehabilitado.');
              }}
              className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold uppercase transition-all cursor-pointer shadow-lg shadow-rose-950/80"
            >
              Reposo Médico & Saltear Mes (+1 Mes)
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* HUD SUPERIOR REDISEÑADO: SIN ENCAPSULAMIENTOS, FLUIDO & CONTINUO          */}
      {/* ========================================================================= */}
      <div className="space-y-4 border-b border-white/5 pb-4">
        
        {/* FILA 1: TÍTULO, OBJETIVO, BILLETERA, HORA, ATLETA Y REINICIO */}
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

            {/* Botón de Reinicio de Partida */}
            <button
              type="button"
              onClick={() => setIsResetConfirmOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 text-rose-300 hover:text-white font-mono text-xs font-bold transition-all cursor-pointer shadow-sm"
              title="Reiniciar Campaña desde Nivel 1"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">Reiniciar</span>
            </button>
          </div>
        </div>

        {/* FILA 2 REDISEÑADA: CONTINUA, INTEGRADA Y SIN CAJAS ENCAPSULADAS */}
        <div className="py-3 px-4 sm:px-6 rounded-2xl bg-gradient-to-r from-space-950/90 via-[#100a26]/80 to-space-950/90 border border-white/10 backdrop-blur-md shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 font-mono">
          
          {/* SECCIÓN CALENDARIO & TURNO (LADO IZQUIERDO) */}
          <div className="flex items-center gap-3.5 w-full md:w-auto">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-neon-cyan shadow-sm">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold">
                CALENDARIO // TEMPORADA ANUAL
              </div>
              <div className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                <span>Mes {currentMonth}/12:</span>
                <span className="text-neon-cyan">{MONTH_NAMES[currentMonth - 1]}</span>
              </div>
            </div>
            <div className="ml-auto md:ml-3 px-2.5 py-1 rounded-lg bg-violet-950/80 border border-violet-500/40 text-violet-300 text-xs font-black tracking-wider shadow-sm">
              TURNO {currentTurn} / {maxTurnsInMonth}
            </div>
          </div>

          {/* DIVISOR VERTICAL ELEGANTE */}
          <div className="hidden md:block w-px h-10 bg-white/10" />

          {/* SECCIÓN ATRIBUTOS ABIERTOS Y LIGEROS (SIN CAJAS RECTANGULARES) */}
          <div className="grid grid-cols-4 gap-4 sm:gap-8 w-full md:w-auto text-center items-center">
            
            {/* Resistencia */}
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">Resistencia</span>
              <span className="text-xl sm:text-2xl font-black text-neon-cyan drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]">
                {stats.endurance}
              </span>
              <span className="text-[9px] text-neutral-400 font-sans">Fondo</span>
            </div>

            {/* Velocidad */}
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">Velocidad</span>
              <span className="text-xl sm:text-2xl font-black text-violet-300 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]">
                {stats.speed}
              </span>
              <span className="text-[9px] text-neutral-400 font-sans">Ritmo</span>
            </div>

            {/* Fuerza */}
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">Fuerza</span>
              <span className="text-xl sm:text-2xl font-black text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]">
                {stats.strength}
              </span>
              <span className="text-[9px] text-neutral-400 font-sans">Potencia</span>
            </div>

            {/* Estamina */}
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">Estamina</span>
              <span className={`text-xl sm:text-2xl font-black ${stats.stamina <= 25 ? 'text-rose-400 animate-pulse' : 'text-fuchsia-400 drop-shadow-[0_0_8px_rgba(217,70,239,0.5)]'}`}>
                {stats.stamina}%
              </span>
              <span className="text-[9px] text-neutral-400 font-sans">
                {stats.stamina <= 25 ? '¡Fatiga!' : 'Energía'}
              </span>
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
                ? 'bg-violet-950/40 border-violet-400 text-white shadow-lg shadow-purple-950/50 ring-1 ring-violet-400/40'
                : 'bg-space-900/70 hover:bg-space-850 border-white/10 text-neutral-300 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <Dumbbell className="w-5 h-5 text-violet-400" />
              <span className="text-[9px] font-mono text-violet-300 uppercase font-bold">+2 Fue / -18% Est</span>
            </div>
            <div>
              <div className="font-display font-bold text-xs text-white">Gimnasio</div>
              <div className="text-[10px] text-neutral-400 font-sans truncate">Fuerza Muscular</div>
            </div>
          </button>

          {/* Botón: Running (Pista de Carrera - Gasta estamina) */}
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
              <span className="text-[9px] font-mono text-cyan-300 uppercase font-bold">+2 Res / -32% Est</span>
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
              <span className="text-[9px] font-mono text-emerald-300 uppercase font-bold">+1 Res / -8% Est</span>
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
              <span className="text-[9px] font-mono text-emerald-300 uppercase font-bold">+1 Res / -24% Est</span>
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
