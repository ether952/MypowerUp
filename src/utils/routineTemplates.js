import { GYM_EXERCISES_SPRITES } from '../components/VisualGymExercisePicker.jsx';

/**
 * Plantillas de rutinas prediseñadas por frecuencia semanal y objetivo.
 */
export const DEFAULT_ROUTINE_TEMPLATES = {
  // 3 DÍAS: FULL BODY A / B / A
  days_3: {
    id: 'fullbody_3days',
    name: 'Full Body Frecuencia 2 (3 Días)',
    description: 'Ideal para construir fuerza y masa muscular estimulando todo el cuerpo 3 veces por semana con recuperación óptima.',
    daysPerWeek: 3,
    schedule: [
      {
        dayIndex: 1, // Lunes
        dayName: 'Lunes',
        title: 'Full Body A - Fuerza & Empujes',
        targetMuscles: 'Pecho, Cuádriceps, Espalda, Hombro',
        exercises: [
          { id: 'sentadilla_trasera', name: 'Sentadilla Trasera con Barra', category: 'Piernas', sets: 4, reps: 8, weight: 60, restSec: 120, gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/BARBELL-SQUAT.gif' },
          { id: 'press_banca_plano', name: 'Press Banca Plano con Barra', category: 'Pecho', sets: 4, reps: 8, weight: 50, restSec: 120, gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Bench-Press.gif' },
          { id: 'remo_barra_prono', name: 'Remo con Barra', category: 'Espalda', sets: 4, reps: 10, weight: 45, restSec: 90, gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Bent-Over-Row.gif' },
          { id: 'press_militar_barra', name: 'Press Militar de Pie con Barra', category: 'Hombros', sets: 3, reps: 10, weight: 30, restSec: 90, gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Shoulder-Press.gif' },
          { id: 'curl_biceps_barra', name: 'Curl de Bíceps con Barra Recta', category: 'Bíceps', sets: 3, reps: 12, weight: 20, restSec: 60, gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Curl.gif' },
          { id: 'extensiones_triceps_polea', name: 'Extensiones de Tríceps en Polea', category: 'Tríceps', sets: 3, reps: 12, weight: 25, restSec: 60, gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Pushdown.gif' }
        ]
      },
      {
        dayIndex: 3, // Miércoles
        dayName: 'Miércoles',
        title: 'Full Body B - Cadena Posterior & Tracciones',
        targetMuscles: 'Espalda, Isquios, Pecho, Hombro Lateral',
        exercises: [
          { id: 'peso_muerto_convencional', name: 'Peso Muerto Convencional con Barra', category: 'Piernas', sets: 4, reps: 6, weight: 70, restSec: 150, gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Deadlift.gif' },
          { id: 'dominadas_pronadas', name: 'Dominadas Pronadas', category: 'Espalda', sets: 4, reps: 8, weight: 0, restSec: 120, gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Pull-up.gif' },
          { id: 'press_inclinado_mancuernas', name: 'Press Inclinado con Mancuernas', category: 'Pecho', sets: 4, reps: 10, weight: 22, restSec: 90, gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Incline-Dumbbell-Press.gif' },
          { id: 'elevaciones_laterales_mancuernas', name: 'Elevaciones Laterales con Mancuernas', category: 'Hombros', sets: 4, reps: 15, weight: 10, restSec: 60, gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Lateral-Raise.gif' },
          { id: 'curl_femoral_tumbado', name: 'Curl Femoral Tumbado en Máquina', category: 'Piernas', sets: 3, reps: 12, weight: 35, restSec: 60, gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Leg-Curl.gif' },
          { id: 'crunch_polea_alta', name: 'Crunch Abdominal en Polea Alta', category: 'Abdomen', sets: 3, reps: 15, weight: 30, restSec: 60, gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Cable-Crunch.gif' }
        ]
      },
      {
        dayIndex: 5, // Viernes
        dayName: 'Viernes',
        title: 'Full Body C - Hipertrofia & Bombeo',
        targetMuscles: 'Piernas, Pecho, Espalda, Brazos',
        exercises: [
          { id: 'prensa_45_piernas', name: 'Prensa Inclinada 45°', category: 'Piernas', sets: 4, reps: 12, weight: 120, restSec: 90, gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Leg-Press.gif' },
          { id: 'cruces_poleas_pecho', name: 'Cruces en Poleas para Pecho', category: 'Pecho', sets: 3, reps: 12, weight: 15, restSec: 60, gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Cable-Crossover.gif' },
          { id: 'jalon_pecho_polea', name: 'Jalón al Pecho en Polea Alta', category: 'Espalda', sets: 4, reps: 10, weight: 50, restSec: 90, gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Lat-Pulldown.gif' },
          { id: 'fondos_paralelas', name: 'Fondos en Paralelas (Dips)', category: 'Tríceps', sets: 3, reps: 10, weight: 0, restSec: 90, gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/06/Chest-Dips.gif' },
          { id: 'curl_martillo_mancuernas', name: 'Curl Martillo con Mancuernas', category: 'Bíceps', sets: 3, reps: 12, weight: 14, restSec: 60, gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Hammer-Curl.gif' },
          { id: 'elevacion_talones_gemelos', name: 'Elevación de Talones de Pie', category: 'Piernas', sets: 4, reps: 15, weight: 40, restSec: 60, gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Standing-Calf-Raise.gif' }
        ]
      }
    ]
  },

  // 4 DÍAS: TORSO / PIERNA
  days_4: {
    id: 'upper_lower_4days',
    name: 'Torso / Pierna Frecuencia 2 (4 Días)',
    description: 'La división más equilibrada para hipertrofia y fuerza estética. Entrena cada músculo 2 veces por semana con alto rendimiento.',
    daysPerWeek: 4,
    schedule: [
      {
        dayIndex: 1, // Lunes
        dayName: 'Lunes',
        title: 'Torso A - Potencia & Grosor',
        targetMuscles: 'Pecho, Espalda, Hombro, Brazos',
        exercises: [
          { id: 'press_banca_plano', name: 'Press Banca Plano con Barra', category: 'Pecho', sets: 4, reps: 6, weight: 60, restSec: 120, gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Bench-Press.gif' },
          { id: 'remo_barra_prono', name: 'Remo con Barra', category: 'Espalda', sets: 4, reps: 8, weight: 50, restSec: 90, gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Bent-Over-Row.gif' },
          { id: 'press_inclinado_mancuernas', name: 'Press Inclinado con Mancuernas', category: 'Pecho', sets: 3, reps: 10, weight: 24, restSec: 90, gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Incline-Dumbbell-Press.gif' },
          { id: 'jalon_pecho_polea', name: 'Jalón al Pecho en Polea Alta', category: 'Espalda', sets: 3, reps: 10, weight: 55, restSec: 90, gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Lat-Pulldown.gif' },
          { id: 'elevaciones_laterales_mancuernas', name: 'Elevaciones Laterales con Mancuernas', category: 'Hombros', sets: 4, reps: 15, weight: 10, restSec: 60, gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Lateral-Raise.gif' },
          { id: 'press_frances_barra_z', name: 'Press Francés con Barra Z', category: 'Tríceps', sets: 3, reps: 10, weight: 25, restSec: 60, gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Lying-Triceps-Extension.gif' },
          { id: 'curl_biceps_inclinado_mancuernas', name: 'Curl Inclinado con Mancuernas', category: 'Bíceps', sets: 3, reps: 12, weight: 12, restSec: 60, gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Seated-Incline-Dumbbell-Curl.gif' }
        ]
      },
      {
        dayIndex: 2, // Martes
        dayName: 'Martes',
        title: 'Pierna A - Enfoque Cuádriceps',
        targetMuscles: 'Cuádriceps, Isquios, Glúteos, Gemelos',
        exercises: [
          { id: 'sentadilla_trasera', name: 'Sentadilla Trasera con Barra', category: 'Piernas', sets: 4, reps: 8, weight: 70, restSec: 120, gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/BARBELL-SQUAT.gif' },
          { id: 'prensa_45_piernas', name: 'Prensa Inclinada 45°', category: 'Piernas', sets: 4, reps: 10, weight: 130, restSec: 90, gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Leg-Press.gif' },
          { id: 'extensiones_cuadriceps_maquina', name: 'Extensiones de Cuádriceps', category: 'Piernas', sets: 3, reps: 12, weight: 45, restSec: 60, gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/LEG-EXTENSION.gif' },
          { id: 'curl_femoral_tumbado', name: 'Curl Femoral Tumbado en Máquina', category: 'Piernas', sets: 4, reps: 10, weight: 35, restSec: 60, gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Leg-Curl.gif' },
          { id: 'elevacion_talones_gemelos', name: 'Elevación de Talones de Pie', category: 'Piernas', sets: 4, reps: 15, weight: 45, restSec: 60, gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Standing-Calf-Raise.gif' },
          { id: 'plancha_abdominal_frontal', name: 'Plancha Abdominal Frontal', category: 'Abdomen', sets: 3, reps: 45, weight: 0, restSec: 60, gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Plank.gif' }
        ]
      },
      {
        dayIndex: 4, // Jueves
        dayName: 'Jueves',
        title: 'Torso B - Densidad & Aislamiento',
        targetMuscles: 'Pecho, Espalda, Hombro, Brazos',
        exercises: [
          { id: 'press_militar_barra', name: 'Press Militar de Pie con Barra', category: 'Hombros', sets: 4, reps: 8, weight: 35, restSec: 120, gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Shoulder-Press.gif' },
          { id: 'dominadas_pronadas', name: 'Dominadas Pronadas', category: 'Espalda', sets: 4, reps: 8, weight: 0, restSec: 120, gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Pull-up.gif' },
          { id: 'press_plano_mancuernas', name: 'Press Plano con Mancuernas', category: 'Pecho', sets: 4, reps: 10, weight: 26, restSec: 90, gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Press.gif' },
          { id: 'remo_unilateral_mancuerna', name: 'Remo con Mancuerna Unilateral', category: 'Espalda', sets: 3, reps: 10, weight: 24, restSec: 60, gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Bent-Over-Row.gif' },
          { id: 'pajaros_posteriores_mancuernas', name: 'Pájaros para Deltoides Posterior', category: 'Hombros', sets: 4, reps: 15, weight: 8, restSec: 60, gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Rear-Delt-Raise.gif' },
          { id: 'extensiones_triceps_polea', name: 'Extensiones de Tríceps en Polea', category: 'Tríceps', sets: 3, reps: 12, weight: 30, restSec: 60, gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Pushdown.gif' },
          { id: 'curl_martillo_mancuernas', name: 'Curl Martillo con Mancuernas', category: 'Bíceps', sets: 3, reps: 12, weight: 14, restSec: 60, gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Hammer-Curl.gif' }
        ]
      },
      {
        dayIndex: 5, // Viernes
        dayName: 'Viernes',
        title: 'Pierna B - Enfoque Glúteo & Femoral',
        targetMuscles: 'Isquios, Glúteos, Aductores, Gemelos',
        exercises: [
          { id: 'peso_muerto_rumano_barra', name: 'Peso Muerto Rumano', category: 'Piernas', sets: 4, reps: 8, weight: 65, restSec: 120, gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Romanian-Deadlift.gif' },
          { id: 'hip_thrust_barra', name: 'Hip Thrust con Barra', category: 'Piernas', sets: 4, reps: 10, weight: 80, restSec: 90, gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Hip-Thrust.gif' },
          { id: 'zancadas_caminando_mancuernas', name: 'Zancadas Caminando con Mancuernas', category: 'Piernas', sets: 3, reps: 12, weight: 16, restSec: 90, gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Lunges.gif' },
          { id: 'curl_femoral_sentado', name: 'Curl Femoral Sentado', category: 'Piernas', sets: 3, reps: 12, weight: 40, restSec: 60, gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Seated-Leg-Curl.gif' },
          { id: 'elevacion_talones_sentado', name: 'Elevación de Talones Sentado', category: 'Piernas', sets: 4, reps: 15, weight: 35, restSec: 60, gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Seated-Calf-Raise.gif' },
          { id: 'crunch_polea_alta', name: 'Crunch Abdominal en Polea Alta', category: 'Abdomen', sets: 3, reps: 15, weight: 35, restSec: 60, gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Cable-Crunch.gif' }
        ]
      }
    ]
  },

  // 5 DÍAS: PUSH / PULL / LEGS / UPPER / LOWER
  days_5: {
    id: 'ppl_upper_lower_5days',
    name: 'Push / Pull / Legs + Torso / Pierna (5 Días)',
    description: 'Máximo volumen hipertrófico estructurado para atletas intermedios y avanzados.',
    daysPerWeek: 5,
    schedule: [
      {
        dayIndex: 1, // Lunes
        dayName: 'Lunes',
        title: 'Push - Pecho, Hombro & Tríceps',
        targetMuscles: 'Pecho, Hombro Anterior/Lateral, Tríceps',
        exercises: [
          { id: 'press_banca_plano', name: 'Press Banca Plano con Barra', category: 'Pecho', sets: 4, reps: 8, weight: 60, restSec: 120, gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Bench-Press.gif' },
          { id: 'press_inclinado_mancuernas', name: 'Press Inclinado con Mancuernas', category: 'Pecho', sets: 3, reps: 10, weight: 24, restSec: 90, gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Incline-Dumbbell-Press.gif' },
          { id: 'press_militar_mancuernas', name: 'Press de Hombros con Mancuernas', category: 'Hombros', sets: 3, reps: 10, weight: 18, restSec: 90, gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Shoulder-Press.gif' },
          { id: 'elevaciones_laterales_mancuernas', name: 'Elevaciones Laterales con Mancuernas', category: 'Hombros', sets: 4, reps: 15, weight: 10, restSec: 60, gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Lateral-Raise.gif' },
          { id: 'extensiones_triceps_polea', name: 'Extensiones de Tríceps en Polea', category: 'Tríceps', sets: 3, reps: 12, weight: 30, restSec: 60, gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Pushdown.gif' },
          { id: 'cruces_poleas_pecho', name: 'Cruces en Poleas para Pecho', category: 'Pecho', sets: 3, reps: 12, weight: 15, restSec: 60, gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Cable-Crossover.gif' }
        ]
      },
      {
        dayIndex: 2, // Martes
        dayName: 'Martes',
        title: 'Pull - Espalda, Deltoides Posterior & Bíceps',
        targetMuscles: 'Espalda, Trapecio, Deltoides Post, Bíceps',
        exercises: [
          { id: 'dominadas_pronadas', name: 'Dominadas Pronadas', category: 'Espalda', sets: 4, reps: 8, weight: 0, restSec: 120, gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Pull-up.gif' },
          { id: 'remo_barra_prono', name: 'Remo con Barra', category: 'Espalda', sets: 4, reps: 8, weight: 50, restSec: 90, gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Bent-Over-Row.gif' },
          { id: 'jalon_pecho_polea', name: 'Jalón al Pecho en Polea Alta', category: 'Espalda', sets: 3, reps: 10, weight: 55, restSec: 90, gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Lat-Pulldown.gif' },
          { id: 'pajaros_posteriores_mancuernas', name: 'Pájaros para Deltoides Posterior', category: 'Hombros', sets: 4, reps: 15, weight: 8, restSec: 60, gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Rear-Delt-Raise.gif' },
          { id: 'curl_biceps_barra', name: 'Curl de Bíceps con Barra Recta', category: 'Bíceps', sets: 3, reps: 10, weight: 25, restSec: 60, gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Curl.gif' },
          { id: 'curl_martillo_mancuernas', name: 'Curl Martillo con Mancuernas', category: 'Bíceps', sets: 3, reps: 12, weight: 14, restSec: 60, gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Hammer-Curl.gif' }
        ]
      },
      {
        dayIndex: 3, // Miércoles
        dayName: 'Miércoles',
        title: 'Legs - Pierna Completa',
        targetMuscles: 'Cuádriceps, Isquios, Glúteos, Gemelos',
        exercises: [
          { id: 'sentadilla_trasera', name: 'Sentadilla Trasera con Barra', category: 'Piernas', sets: 4, reps: 8, weight: 70, restSec: 120, gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/BARBELL-SQUAT.gif' },
          { id: 'peso_muerto_rumano_barra', name: 'Peso Muerto Rumano', category: 'Piernas', sets: 4, reps: 8, weight: 65, restSec: 120, gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Romanian-Deadlift.gif' },
          { id: 'prensa_45_piernas', name: 'Prensa Inclinada 45°', category: 'Piernas', sets: 3, reps: 10, weight: 130, restSec: 90, gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Leg-Press.gif' },
          { id: 'curl_femoral_tumbado', name: 'Curl Femoral Tumbado en Máquina', category: 'Piernas', sets: 3, reps: 12, weight: 35, restSec: 60, gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Leg-Curl.gif' },
          { id: 'elevacion_talones_gemelos', name: 'Elevación de Talones de Pie', category: 'Piernas', sets: 4, reps: 15, weight: 45, restSec: 60, gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Standing-Calf-Raise.gif' }
        ]
      },
      {
        dayIndex: 5, // Viernes
        dayName: 'Viernes',
        title: 'Torso - Hipertrofia Superior',
        targetMuscles: 'Pecho, Espalda, Hombros',
        exercises: [
          { id: 'press_plano_mancuernas', name: 'Press Plano con Mancuernas', category: 'Pecho', sets: 4, reps: 10, weight: 26, restSec: 90, gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Press.gif' },
          { id: 'remo_unilateral_mancuerna', name: 'Remo con Mancuerna Unilateral', category: 'Espalda', sets: 4, reps: 10, weight: 26, restSec: 90, gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Bent-Over-Row.gif' },
          { id: 'press_inclinado_barra', name: 'Press Inclinado con Barra', category: 'Pecho', sets: 3, reps: 10, weight: 45, restSec: 90, gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Incline-Barbell-Bench-Press.gif' },
          { id: 'elevaciones_laterales_polea', name: 'Elevaciones Laterales en Polea', category: 'Hombros', sets: 4, reps: 15, weight: 7, restSec: 60, gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Cable-Lateral-Raise.gif' },
          { id: 'fondos_paralelas', name: 'Fondos en Paralelas (Dips)', category: 'Tríceps', sets: 3, reps: 10, weight: 0, restSec: 90, gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/06/Chest-Dips.gif' }
        ]
      },
      {
        dayIndex: 6, // Sábado
        dayName: 'Sábado',
        title: 'Pierna & Core - Énfasis Posterior',
        targetMuscles: 'Glúteos, Isquios, Abdomen',
        exercises: [
          { id: 'hip_thrust_barra', name: 'Hip Thrust con Barra', category: 'Piernas', sets: 4, reps: 10, weight: 80, restSec: 90, gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Hip-Thrust.gif' },
          { id: 'zancadas_caminando_mancuernas', name: 'Zancadas Caminando con Mancuernas', category: 'Piernas', sets: 3, reps: 12, weight: 16, restSec: 90, gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Lunges.gif' },
          { id: 'extensiones_cuadriceps_maquina', name: 'Extensiones de Cuádriceps', category: 'Piernas', sets: 3, reps: 15, weight: 40, restSec: 60, gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/LEG-EXTENSION.gif' },
          { id: 'crunch_polea_alta', name: 'Crunch Abdominal en Polea Alta', category: 'Abdomen', sets: 3, reps: 15, weight: 35, restSec: 60, gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Cable-Crunch.gif' },
          { id: 'plancha_abdominal_frontal', name: 'Plancha Abdominal Frontal', category: 'Abdomen', sets: 3, reps: 60, weight: 0, restSec: 60, gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Plank.gif' }
        ]
      }
    ]
  }
};

const STORAGE_KEY_PROFILE = 'mypowerup_coach_profile';
const STORAGE_KEY_ROUTINES = 'mypowerup_custom_routines';
const STORAGE_KEY_ACTIVE_ROUTINE_ID = 'mypowerup_active_routine_id';

/**
 * Obtiene el perfil de entrenamiento del usuario guardado.
 */
export function getSavedCoachProfile() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROFILE);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Error reading coach profile:', e);
  }
  return {
    goal: 'hipertrofia', // 'hipertrofia' | 'definicion' | 'fuerza' | 'salud'
    weightKg: 75,
    heightCm: 175,
    age: 26,
    gender: 'hombre', // 'hombre' | 'mujer'
    daysPerWeek: 4,
    experienceLevel: 'intermedio', // 'principiante' | 'intermedio' | 'avanzado'
    equipment: 'gimnasio_completo', // 'gimnasio_completo' | 'mancuernas' | 'casa'
    injuriesNotes: ''
  };
}

/**
 * Guarda el perfil del usuario.
 */
export function saveCoachProfile(profile) {
  try {
    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.warn('Error saving coach profile:', e);
  }
}

/**
 * Obtiene las rutinas guardadas del usuario o genera la recomendada por defecto.
 */
export function getSavedRoutines(profile = getSavedCoachProfile()) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ROUTINES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Error reading custom routines:', e);
  }

  // Generar rutina recomendada según días
  const key = `days_${profile.daysPerWeek || 4}`;
  const defaultRoutine = DEFAULT_ROUTINE_TEMPLATES[key] || DEFAULT_ROUTINE_TEMPLATES.days_4;
  return [JSON.parse(JSON.stringify(defaultRoutine))];
}

/**
 * Guarda el listado de rutinas personalizadas.
 */
export function saveRoutines(routines) {
  try {
    localStorage.setItem(STORAGE_KEY_ROUTINES, JSON.stringify(routines));
  } catch (e) {
    console.warn('Error saving custom routines:', e);
  }
}

/**
 * Obtiene el ID de la rutina activa actualmente.
 */
export function getActiveRoutineId(routines = []) {
  try {
    const active = localStorage.getItem(STORAGE_KEY_ACTIVE_ROUTINE_ID);
    if (active && routines.some(r => r.id === active)) return active;
  } catch (e) {
    console.warn('Error reading active routine id:', e);
  }
  return routines[0]?.id || 'upper_lower_4days';
}

/**
 * Guarda el ID de la rutina activa.
 */
export function saveActiveRoutineId(id) {
  try {
    localStorage.setItem(STORAGE_KEY_ACTIVE_ROUTINE_ID, id);
  } catch (e) {
    console.warn('Error saving active routine id:', e);
  }
}

/**
 * Detecta qué le toca entrenar al usuario HOY según el día de la semana (0=Domingo, 1=Lunes, ...).
 */
export function getTodayWorkoutSchedule(routine) {
  if (!routine || !routine.schedule) return null;

  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 (Dom), 1 (Lun), 2 (Mar), 3 (Mié), 4 (Jue), 5 (Vie), 6 (Sáb)
  
  const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const todayName = dayNames[dayOfWeek];

  // Buscar coincidencia directa por dayIndex
  const scheduledToday = routine.schedule.find(s => s.dayIndex === dayOfWeek);

  return {
    todayName,
    dayOfWeek,
    isRestDay: !scheduledToday,
    scheduledWorkout: scheduledToday || null,
    allDays: routine.schedule
  };
}
