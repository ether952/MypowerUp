import React, { useState, useRef } from 'react';
import {
  Trophy,
  Flame,
  Dumbbell,
  Footprints,
  Bike,
  Shield,
  Award,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Sliders,
  Sparkles,
  ArrowRight,
  Gamepad2
} from 'lucide-react';
import { getLocalDateString } from '../utils/helpers';
import { calculateLevelProgress } from '../utils/levelSystem';
import { calculateCardioLevelProgress } from '../utils/cardioLevelSystem';
import ChallengeUnifiedModal from './ChallengeUnifiedModal';
import CityMiniGame from './CityMiniGame';
import {
  getStoredChallengeCalibration,
  saveStoredChallengeCalibration,
  getCalibratedMuscleLevels,
  getCalibratedCardioLevels,
  filterDataForChallenge
} from '../utils/challengeCalibration';

export default function MyPowerUpView({
  data = {},
  selectedDate,
  challengeCalibration,
  onUpdateChallengeCalibration
}) {
  // 'intro' | 'muscle' | 'cardio' | 'city'
  const [selectedChallenge, setSelectedChallenge] = useState('intro');

  // Calibración y modal
  const [localCalibrationProfile, setLocalCalibrationProfile] = useState(() => getStoredChallengeCalibration());
  const calibrationProfile = challengeCalibration !== undefined ? challengeCalibration : localCalibrationProfile;
  const [unifiedModalType, setUnifiedModalType] = useState(null); // 'muscle' | 'cardio' | null

  // Desafío de Resistencia - disciplina activa
  const [cardioDiscipline, setCardioDiscipline] = useState('running');

  // Ruletas de niveles
  const muscleRouletteRef = useRef(null);
  const cardioRouletteRef = useRef(null);

  const referenceDate = selectedDate || getLocalDateString();
  const isChallengeActive = Boolean(calibrationProfile && calibrationProfile.activatedAt);

  // Filtrar data para los desafíos
  const challengeData = isChallengeActive ? filterDataForChallenge(data, calibrationProfile) : {};

  const customMuscleLevels = isChallengeActive ? getCalibratedMuscleLevels(calibrationProfile) : null;
  const customCardioLevels = isChallengeActive ? getCalibratedCardioLevels(calibrationProfile, cardioDiscipline) : null;

  const levelProgress = isChallengeActive
    ? calculateLevelProgress(challengeData, referenceDate, customMuscleLevels)
    : null;

  const cardioProgress = isChallengeActive
    ? calculateCardioLevelProgress(challengeData, cardioDiscipline, referenceDate, customCardioLevels)
    : null;

  const handleCompleteUnifiedModal = (newProfile) => {
    setLocalCalibrationProfile(newProfile);
    saveStoredChallengeCalibration(newProfile);
    if (onUpdateChallengeCalibration) {
      onUpdateChallengeCalibration(newProfile);
    }
    if (unifiedModalType === 'muscle') {
      setSelectedChallenge('muscle');
    } else if (unifiedModalType === 'cardio') {
      setSelectedChallenge('cardio');
    }
    setUnifiedModalType(null);
  };

  const scrollMuscleRoulette = (direction) => {
    if (muscleRouletteRef.current) {
      const scrollAmount = direction === 'left' ? -220 : 220;
      muscleRouletteRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollCardioRoulette = (direction) => {
    if (cardioRouletteRef.current) {
      const scrollAmount = direction === 'left' ? -220 : 220;
      cardioRouletteRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full px-4 sm:px-8 py-6 space-y-8 animate-fade-in-up">
      {/* Modal Unificado */}
      <ChallengeUnifiedModal
        isOpen={Boolean(unifiedModalType)}
        onClose={() => setUnifiedModalType(null)}
        challengeType={unifiedModalType || 'muscle'}
        onComplete={handleCompleteUnifiedModal}
        currentProfile={calibrationProfile}
      />

      {/* CABECERA */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-200 pb-4">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase font-bold">
            SISTEMA DE DESAFÍOS & GAMIFICACIÓN
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight font-display mt-0.5 select-none">
            MYPOWER<span className="text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.35)]">UP</span>
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {isChallengeActive ? (
            <span className="text-xs font-mono text-zinc-900 bg-zinc-100 px-3 py-1 rounded-full border border-zinc-200 flex items-center gap-1.5 font-bold">
              <span className="w-2 h-2 rounded-full bg-black animate-pulse"></span>
              DESAFÍOS ACTIVOS
            </span>
          ) : (
            <span className="text-xs font-mono text-zinc-500">
              DESAFÍOS SIN CALIBRAR
            </span>
          )}
        </div>
      </div>

      {/* ESTRUCTURA: BARRA LATERAL + CONTENIDO */}
      <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-10 w-full">

        {/* BARRA LATERAL */}
        <aside className="w-full lg:w-56 xl:w-60 flex-shrink-0 space-y-2">
          <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest px-1 font-bold">
            Desafíos
          </div>

          <div className="flex flex-col gap-1.5">
            {/* Botón 1: Guía */}
            <button
              type="button"
              onClick={() => setSelectedChallenge('intro')}
              className={`w-full py-2.5 px-3 rounded-xl text-left transition-all flex items-center gap-2.5 cursor-pointer select-none ${
                selectedChallenge === 'intro'
                  ? 'bg-black text-white font-bold shadow-sm'
                  : 'text-zinc-600 hover:text-black hover:bg-zinc-100'
              }`}
            >
              <Sparkles className={`w-4 h-4 flex-shrink-0 ${selectedChallenge === 'intro' ? 'text-white' : 'text-zinc-500'}`} />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-mono tracking-wide truncate">
                  ¿Qué es MyPowerUp?
                </div>
              </div>
            </button>

            {/* Botón 2: Musculación */}
            <button
              type="button"
              onClick={() => setSelectedChallenge('muscle')}
              className={`w-full py-2.5 px-3 rounded-xl text-left transition-all flex items-center gap-2.5 cursor-pointer select-none ${
                selectedChallenge === 'muscle'
                  ? 'bg-black text-white font-bold shadow-sm'
                  : 'text-zinc-600 hover:text-black hover:bg-zinc-100'
              }`}
            >
              <Trophy className={`w-4 h-4 flex-shrink-0 ${selectedChallenge === 'muscle' ? 'text-white' : 'text-zinc-500'}`} />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-mono tracking-wide truncate flex items-center justify-between">
                  <span>Musculación</span>
                  {isChallengeActive && levelProgress && (
                    <span className={`text-[10px] font-bold ${selectedChallenge === 'muscle' ? 'text-zinc-300' : 'text-zinc-900'}`}>
                      L{levelProgress.currentLevel.level}
                    </span>
                  )}
                </div>
                <div className={`text-[10px] truncate ${selectedChallenge === 'muscle' ? 'text-zinc-300' : 'text-zinc-500'}`}>
                  {isChallengeActive && levelProgress ? (
                    `${levelProgress.currentWeekTonnage.toLocaleString()} kg`
                  ) : (
                    'Sin calibrar'
                  )}
                </div>
              </div>
            </button>

            {/* Botón 3: Resistencia */}
            <button
              type="button"
              onClick={() => setSelectedChallenge('cardio')}
              className={`w-full py-2.5 px-3 rounded-xl text-left transition-all flex items-center gap-2.5 cursor-pointer select-none ${
                selectedChallenge === 'cardio'
                  ? 'bg-black text-white font-bold shadow-sm'
                  : 'text-zinc-600 hover:text-black hover:bg-zinc-100'
              }`}
            >
              <Flame className={`w-4 h-4 flex-shrink-0 ${selectedChallenge === 'cardio' ? 'text-white' : 'text-zinc-500'}`} />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-mono tracking-wide truncate flex items-center justify-between">
                  <span>Resistencia</span>
                  {isChallengeActive && cardioProgress && (
                    <span className={`text-[10px] font-bold ${selectedChallenge === 'cardio' ? 'text-zinc-300' : 'text-zinc-900'}`}>
                      L{cardioProgress.currentLevel.level}
                    </span>
                  )}
                </div>
                <div className={`text-[10px] truncate ${selectedChallenge === 'cardio' ? 'text-zinc-300' : 'text-zinc-500'}`}>
                  {isChallengeActive && cardioProgress ? (
                    `${cardioProgress.currentWeekKm} km`
                  ) : (
                    'Sin calibrar'
                  )}
                </div>
              </div>
            </button>

            {/* Botón 4: Minijuego Ciudad */}
            <button
              type="button"
              onClick={() => setSelectedChallenge('city')}
              className={`w-full py-2.5 px-3 rounded-xl text-left transition-all flex items-center gap-2.5 cursor-pointer select-none ${
                selectedChallenge === 'city'
                  ? 'bg-black text-white font-bold shadow-sm'
                  : 'text-zinc-600 hover:text-black hover:bg-zinc-100'
              }`}
            >
              <Gamepad2 className={`w-4 h-4 flex-shrink-0 ${selectedChallenge === 'city' ? 'text-white' : 'text-zinc-500'}`} />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-mono tracking-wide truncate flex items-center justify-between">
                  <span>PowerUp City</span>
                  <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold ${
                    selectedChallenge === 'city' ? 'bg-zinc-800 text-white' : 'bg-zinc-100 text-zinc-900'
                  }`}>
                    JUEGO
                  </span>
                </div>
                <div className={`text-[10px] truncate ${selectedChallenge === 'city' ? 'text-zinc-300' : 'text-zinc-500'}`}>
                  Ciudad & Rutas
                </div>
              </div>
            </button>
          </div>

          {/* Mini Nota Informativa */}
          <div className="pt-4 border-t border-zinc-200 text-[11px] font-sans text-zinc-500 space-y-1">
            <p className="flex items-center gap-1.5 text-zinc-900 font-mono text-[10px] font-bold">
              <Shield className="w-3 h-3 text-zinc-900" />
              <span>NIVELES PERMANENTES</span>
            </p>
            <p className="leading-tight text-zinc-500">
              Tu rango nunca baja. Cada lunes inicia un nuevo intento limpio.
            </p>
          </div>
        </aside>

        {/* CONTENIDO CENTRAL */}
        <main className="flex-1 min-w-0 space-y-8">

          {/* VISTA 1: INTRO */}
          {selectedChallenge === 'intro' && (
            <div className="space-y-8 animate-fade-in">

              <div className="space-y-3">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold">
                  GUÍA DE FUNCIONAMIENTO
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 uppercase font-display tracking-tight leading-tight">
                  Entrena, supera tus marcas y sube de nivel
                </h3>
                <p className="text-zinc-600 font-sans text-sm sm:text-base leading-relaxed max-w-3xl">
                  <strong className="text-zinc-900 font-bold">MyPowerUp</strong> convierte el esfuerzo de tus registros diarios en metas semanales dinámicas. Acompaña tu progresión con sobrecarga lógica sin presiones ni frustración.
                </p>
              </div>

              {/* 3 PILARES */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6 border-y border-zinc-200">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-900">
                    <span>01.</span>
                    <span>AUTOMÁTICO</span>
                  </div>
                  <h4 className="font-display font-bold text-zinc-900 text-sm sm:text-base">
                    Registro en Tiempo Real
                  </h4>
                  <p className="text-xs text-zinc-500 font-sans leading-relaxed">
                    Cada serie, repetición y kilómetro registrado en tu día suma automáticamente a tu objetivo semanal.
                  </p>
                </div>

                <div className="space-y-2 md:border-l md:border-zinc-200 md:pl-6">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-900">
                    <span>02.</span>
                    <span>SIN FRUSTRACIÓN</span>
                  </div>
                  <h4 className="font-display font-bold text-zinc-900 text-sm sm:text-base">
                    Tu Nivel Nunca Baja
                  </h4>
                  <p className="text-xs text-zinc-500 font-sans leading-relaxed">
                    Si viajas o descansas una semana, mantienes tu rango intacto. Cada lunes se reinicia el contador limpiamente.
                  </p>
                </div>

                <div className="space-y-2 md:border-l md:border-zinc-200 md:pl-6">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-900">
                    <span>03.</span>
                    <span>PROGRESIÓN +20%</span>
                  </div>
                  <h4 className="font-display font-bold text-zinc-900 text-sm sm:text-base">
                    Ascenso Adaptativo
                  </h4>
                  <p className="text-xs text-zinc-500 font-sans leading-relaxed">
                    Al conquistar tu meta semanal, avanzas de rango con un incremento del 20% adaptado a la fisiología humana.
                  </p>
                </div>
              </div>

              {/* ACCESOS DIRECTOS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
                {/* Desafío de Musculación */}
                <div className="space-y-3 bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center gap-2 text-zinc-900">
                    <Trophy className="w-5 h-5 text-black" />
                    <span className="text-xs font-mono font-bold uppercase tracking-wider">
                      FUERZA & TONELAJE
                    </span>
                  </div>
                  <div>
                    <h4 className="text-lg font-extrabold text-zinc-900 uppercase font-display">
                      Desafío de Musculación
                    </h4>
                    <p className="text-xs text-zinc-500 font-sans mt-1 leading-relaxed">
                      Calcula el tonelaje acumulado (<span className="text-zinc-900 font-mono font-semibold">Series × Reps × Peso</span>). Metas desde Iniciado hasta Titán de Cargas.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (!isChallengeActive) {
                        setUnifiedModalType('muscle');
                      } else {
                        setSelectedChallenge('muscle');
                      }
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-black hover:bg-zinc-800 text-white font-mono text-xs font-bold uppercase transition-all shadow-sm cursor-pointer"
                  >
                    <span>{isChallengeActive ? 'Ver Musculación' : 'Calibrar Musculación'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Desafío de Resistencia */}
                <div className="space-y-3 bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center gap-2 text-zinc-900">
                    <Flame className="w-5 h-5 text-black" />
                    <span className="text-xs font-mono font-bold uppercase tracking-wider">
                      RESISTENCIA & CARDIO
                    </span>
                  </div>
                  <div>
                    <h4 className="text-lg font-extrabold text-zinc-900 uppercase font-display">
                      Desafío de Resistencia
                    </h4>
                    <p className="text-xs text-zinc-500 font-sans mt-1 leading-relaxed">
                      Suma kilómetros en Caminata, Running o Bicicleta con metas calibradas según la disciplina elegida.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (!isChallengeActive) {
                        setUnifiedModalType('cardio');
                      } else {
                        setSelectedChallenge('cardio');
                      }
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-black hover:bg-zinc-800 text-white font-mono text-xs font-bold uppercase transition-all shadow-sm cursor-pointer"
                  >
                    <span>{isChallengeActive ? 'Ver Resistencia' : 'Calibrar Resistencia'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* BANNER ACCESO A POWERUP CITY */}
              <div className="pt-4 border-t border-zinc-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-zinc-900 font-mono text-xs font-bold">
                    <Gamepad2 className="w-4 h-4 text-black" />
                    <span>MINIJUEGO INTERACTIVO</span>
                  </div>
                  <h4 className="font-display font-extrabold text-zinc-900 text-base">
                    PowerUp City: Tu avatar y mapa de entrenamiento
                  </h4>
                  <p className="text-xs text-zinc-500 font-sans max-w-xl">
                    Recorre la ciudad con tu personaje, visita el Gimnasio, las pistas de running, ciclovías o descansa en tu casa.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedChallenge('city')}
                  className="px-4 py-2.5 rounded-xl bg-black hover:bg-zinc-800 text-white font-mono text-xs font-bold uppercase transition-all shadow-sm cursor-pointer flex-shrink-0 flex items-center gap-2"
                >
                  <span>Explorar Ciudad</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          )}

          {/* VISTA 2: MUSCULACIÓN */}
          {selectedChallenge === 'muscle' && (
            <div className="space-y-8 animate-fade-in">

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold">
                    DESAFÍO DE TONELAJE & VOLUMEN
                  </span>
                  <div className="flex items-center gap-3">
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 uppercase font-display">
                      Desafío de Musculación
                    </h3>
                    {isChallengeActive && levelProgress && (
                      <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-900 border border-zinc-200">
                        NIVEL {levelProgress.currentLevel.level}: {levelProgress.currentLevel.name.toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setUnifiedModalType('muscle')}
                    className="px-3.5 py-1.5 rounded-xl border border-zinc-300 hover:border-black text-zinc-800 hover:text-black text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer bg-white shadow-sm"
                  >
                    <Sliders className="w-3.5 h-3.5 text-zinc-900" />
                    <span>{isChallengeActive ? 'Ajustar Medidor' : 'Calibrar Nivel'}</span>
                  </button>
                </div>
              </div>

              {!isChallengeActive && (
                <div className="py-8 space-y-4 bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
                  <p className="text-sm text-zinc-600 font-sans max-w-lg">
                    Aún no has calibrado tu nivel de inicio. Responde 3 preguntas rápidas sobre tu experiencia y días de entreno para fijar tu meta semanal.
                  </p>
                  <button
                    type="button"
                    onClick={() => setUnifiedModalType('muscle')}
                    className="px-5 py-2.5 rounded-xl bg-black hover:bg-zinc-800 text-white font-mono text-xs font-bold uppercase transition-all shadow-sm cursor-pointer"
                  >
                    Comenzar Calibración de Musculación →
                  </button>
                </div>
              )}

              {isChallengeActive && levelProgress && (
                <div className="space-y-8">

                  {/* MÉTRICAS */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 py-4 border-b border-zinc-200">
                    <div className="space-y-1">
                      <span className="text-xs font-mono text-zinc-500 uppercase">Levantado esta semana</span>
                      <div className="text-3xl sm:text-4xl font-extrabold font-mono text-zinc-900">
                        {levelProgress.currentWeekTonnage.toLocaleString()} <span className="text-xs font-mono text-zinc-500 font-normal">KG</span>
                      </div>
                    </div>

                    <div className="space-y-1 sm:border-l sm:border-zinc-200 sm:pl-8">
                      <span className="text-xs font-mono text-zinc-500 uppercase">Meta Reto Semanal ({levelProgress.progressPercent}%)</span>
                      <div className="text-3xl sm:text-4xl font-extrabold font-mono text-black">
                        {levelProgress.weeklyGoal.toLocaleString()} <span className="text-xs font-mono text-zinc-500 font-normal">KG</span>
                      </div>
                    </div>
                  </div>

                  {/* BARRA DE PROGRESO */}
                  <div className="space-y-2">
                    <div className="w-full bg-zinc-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-black h-full rounded-full transition-all duration-700 ease-out"
                        style={{ width: `${levelProgress.progressPercent}%` }}
                      />
                    </div>

                    <div className="text-xs font-mono text-zinc-500 pt-1">
                      {levelProgress.isGoalAchieved ? (
                        <span className="text-zinc-900 font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-zinc-900" />
                          ¡Reto semanal conquistado! Has superado el tonelaje de tu nivel.
                        </span>
                      ) : (
                        <span>
                          Faltan <strong className="text-zinc-900">{levelProgress.remainingKg.toLocaleString()} kg</strong> esta semana para subir al siguiente nivel.
                        </span>
                      )}
                    </div>
                  </div>

                  {/* RULETA DE RANGOS */}
                  <div className="space-y-3 pt-2">
                    <div className="flex justify-between items-center font-mono text-xs text-zinc-500">
                      <span className="text-zinc-900 font-bold">
                        RULETA DE RANGOS SEMANALES
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => scrollMuscleRoulette('left')}
                          className="p-1 rounded-lg hover:bg-zinc-100 text-zinc-500 hover:text-black transition-colors cursor-pointer"
                          title="Anterior"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => scrollMuscleRoulette('right')}
                          className="p-1 rounded-lg hover:bg-zinc-100 text-zinc-500 hover:text-black transition-colors cursor-pointer"
                          title="Siguiente"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div
                      ref={muscleRouletteRef}
                      className="flex items-stretch gap-3 overflow-x-auto pb-3 pt-1 scroll-smooth snap-x snap-mandatory"
                    >
                      {levelProgress.levels.map((lvl) => {
                        const isCurrent = lvl.level === levelProgress.currentLevel.level;
                        const isUnlocked = lvl.level <= levelProgress.currentLevel.level;
                        return (
                          <div
                            key={lvl.level}
                            className={`flex-shrink-0 w-44 sm:w-48 snap-center p-4 rounded-2xl border transition-all flex flex-col justify-between select-none bg-white shadow-sm ${
                              isCurrent
                                ? 'border-zinc-900 ring-2 ring-black text-zinc-900'
                                : isUnlocked
                                  ? 'border-zinc-200 text-zinc-800'
                                  : 'border-zinc-200 text-zinc-400 opacity-60'
                            }`}
                          >
                            <div>
                              <div className="flex justify-between items-center mb-1 text-xs font-mono">
                                <span className={`font-bold ${isCurrent ? 'text-black font-extrabold' : 'text-zinc-500'}`}>
                                  LVL {lvl.level}
                                </span>
                                {isCurrent ? (
                                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-black text-white font-sans uppercase">
                                    ACTUAL
                                  </span>
                                ) : isUnlocked ? (
                                  <span className="text-zinc-900 font-bold text-xs">✓</span>
                                ) : (
                                  <span className="text-zinc-400 text-xs">🔒</span>
                                )}
                              </div>
                              <h4 className="font-display font-extrabold text-sm text-zinc-900 tracking-tight truncate">
                                {lvl.name}
                              </h4>
                              <p className="text-[11px] text-zinc-500 font-sans line-clamp-1">
                                {lvl.title}
                              </p>
                            </div>

                            <div className="mt-3 pt-2 border-t border-zinc-100">
                              <span className="text-[10px] font-mono text-zinc-400 uppercase block">Meta Semanal</span>
                              <span className="font-mono font-bold text-sm text-zinc-900">
                                {lvl.weeklyGoalKg.toLocaleString()} <span className="text-xs font-sans text-zinc-500 font-normal">kg</span>
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* NOTA DE CONSEJO */}
                  <div className="flex items-start gap-2.5 text-xs text-zinc-500 font-sans pt-2">
                    <Shield className="w-4 h-4 text-zinc-900 flex-shrink-0 mt-0.5" />
                    <p>
                      <strong className="text-zinc-800">Técnica y constancia ante todo:</strong> Avanza a tu ritmo cuidando la recuperación. El tonelaje subirá naturalmente semana a semana.
                    </p>
                  </div>

                </div>
              )}

            </div>
          )}

          {/* VISTA 3: RESISTENCIA */}
          {selectedChallenge === 'cardio' && (
            <div className="space-y-8 animate-fade-in">

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold">
                    DESAFÍO DE DISTANCIA & CARDIO
                  </span>
                  <div className="flex items-center gap-3">
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 uppercase font-display">
                      Desafío de Resistencia
                    </h3>
                    {isChallengeActive && cardioProgress && (
                      <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-900 border border-zinc-200 uppercase">
                        NIVEL {cardioProgress.currentLevel.level}: {cardioProgress.currentLevel.name}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setUnifiedModalType('cardio')}
                    className="px-3.5 py-1.5 rounded-xl border border-zinc-300 hover:border-black text-zinc-800 hover:text-black text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer bg-white shadow-sm"
                  >
                    <Sliders className="w-3.5 h-3.5 text-zinc-900" />
                    <span>{isChallengeActive ? 'Ajustar Medidor' : 'Calibrar Nivel'}</span>
                  </button>
                </div>
              </div>

              {/* SELECTOR DE DISCIPLINA */}
              <div className="flex items-center gap-3 font-mono text-xs">
                <span className="text-zinc-500 uppercase text-[11px] font-bold">Disciplina:</span>
                <div className="flex items-center gap-1">
                  {[
                    { id: 'caminata', label: 'Caminata', icon: Footprints },
                    { id: 'running', label: 'Running', icon: Flame },
                    { id: 'bicicleta', label: 'Bicicleta', icon: Bike }
                  ].map((d) => {
                    const IconComp = d.icon;
                    const isActive = cardioDiscipline === d.id;
                    return (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => setCardioDiscipline(d.id)}
                        className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer uppercase text-xs ${
                          isActive
                            ? 'bg-black text-white shadow-sm'
                            : 'text-zinc-600 hover:text-black hover:bg-zinc-100'
                        }`}
                      >
                        <IconComp className="w-3.5 h-3.5" />
                        <span>{d.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {!isChallengeActive && (
                <div className="py-8 space-y-4 bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
                  <p className="text-sm text-zinc-600 font-sans max-w-lg">
                    Aún no has calibrado tu nivel de inicio. Responde 3 preguntas rápidas para adaptar las metas de distancia a tu condición física.
                  </p>
                  <button
                    type="button"
                    onClick={() => setUnifiedModalType('cardio')}
                    className="px-5 py-2.5 rounded-xl bg-black hover:bg-zinc-800 text-white font-mono text-xs font-bold uppercase transition-all shadow-sm cursor-pointer"
                  >
                    Comenzar Calibración de Resistencia →
                  </button>
                </div>
              )}

              {isChallengeActive && cardioProgress && (
                <div className="space-y-8">

                  {/* MÉTRICAS */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 py-4 border-b border-zinc-200">
                    <div className="space-y-1">
                      <span className="text-xs font-mono text-zinc-500 uppercase">
                        Recorrido en {cardioProgress.disciplineInfo.name}
                      </span>
                      <div className="text-3xl sm:text-4xl font-extrabold font-mono text-zinc-900">
                        {cardioProgress.currentWeekKm} <span className="text-xs font-mono text-zinc-500 font-normal">KM</span>
                      </div>
                    </div>

                    <div className="space-y-1 sm:border-l sm:border-zinc-200 sm:pl-8">
                      <span className="text-xs font-mono text-zinc-500 uppercase">Meta Reto Semanal ({cardioProgress.progressPercent}%)</span>
                      <div className="text-3xl sm:text-4xl font-extrabold font-mono text-black">
                        {cardioProgress.weeklyGoal} <span className="text-xs font-mono text-zinc-500 font-normal">KM</span>
                      </div>
                    </div>
                  </div>

                  {/* BARRA DE PROGRESO */}
                  <div className="space-y-2">
                    <div className="w-full bg-zinc-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-black h-full rounded-full transition-all duration-700 ease-out"
                        style={{ width: `${cardioProgress.progressPercent}%` }}
                      />
                    </div>

                    <div className="text-xs font-mono text-zinc-500 pt-1">
                      {cardioProgress.isGoalAchieved ? (
                        <span className="text-zinc-900 font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-zinc-900" />
                          ¡Reto semanal de resistencia conquistado! Has superado la distancia de tu nivel.
                        </span>
                      ) : (
                        <span>
                          Faltan <strong className="text-zinc-900">{cardioProgress.remainingKm} km</strong> esta semana para subir al siguiente nivel.
                        </span>
                      )}
                    </div>
                  </div>

                  {/* RULETA DE RANGOS */}
                  <div className="space-y-3 pt-2">
                    <div className="flex justify-between items-center font-mono text-xs text-zinc-500">
                      <span className="flex items-center gap-1.5 text-zinc-900 font-bold">
                        <Award className="w-4 h-4 text-black" />
                        // RULETA DE RANGOS: {cardioProgress.disciplineInfo.name.toUpperCase()}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => scrollCardioRoulette('left')}
                          className="p-1 rounded-lg hover:bg-zinc-100 text-zinc-500 hover:text-black transition-colors cursor-pointer"
                          title="Anterior"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => scrollCardioRoulette('right')}
                          className="p-1 rounded-lg hover:bg-zinc-100 text-zinc-500 hover:text-black transition-colors cursor-pointer"
                          title="Siguiente"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div
                      ref={cardioRouletteRef}
                      className="flex items-stretch gap-3 overflow-x-auto pb-3 pt-1 scroll-smooth snap-x snap-mandatory"
                    >
                      {cardioProgress.levels.map((lvl) => {
                        const isCurrent = lvl.level === cardioProgress.currentLevel.level;
                        const isUnlocked = lvl.level <= cardioProgress.currentLevel.level;
                        return (
                          <div
                            key={lvl.level}
                            className={`flex-shrink-0 w-44 sm:w-48 snap-center p-4 rounded-2xl border transition-all flex flex-col justify-between select-none bg-white shadow-sm ${
                              isCurrent
                                ? 'border-zinc-900 ring-2 ring-black text-zinc-900'
                                : isUnlocked
                                  ? 'border-zinc-200 text-zinc-800'
                                  : 'border-zinc-200 text-zinc-400 opacity-60'
                            }`}
                          >
                            <div>
                              <div className="flex justify-between items-center mb-1 text-xs font-mono">
                                <span className={`font-bold ${isCurrent ? 'text-black font-extrabold' : 'text-zinc-500'}`}>
                                  LVL {lvl.level}
                                </span>
                                {isCurrent ? (
                                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-black text-white font-sans uppercase">
                                    ACTUAL
                                  </span>
                                ) : isUnlocked ? (
                                  <span className="text-zinc-900 font-bold text-xs">✓</span>
                                ) : (
                                  <span className="text-zinc-400 text-xs">🔒</span>
                                )}
                              </div>
                              <h4 className="font-display font-extrabold text-sm text-zinc-900 tracking-tight truncate">
                                {lvl.name}
                              </h4>
                              <p className="text-[11px] text-zinc-500 font-sans line-clamp-1">
                                {lvl.title}
                              </p>
                            </div>

                            <div className="mt-3 pt-2 border-t border-zinc-100">
                              <span className="text-[10px] font-mono text-zinc-400 uppercase block">Meta Semanal</span>
                              <span className="font-mono font-bold text-sm text-zinc-900">
                                {lvl.weeklyGoalKm} <span className="text-xs font-sans text-zinc-500 font-normal">km</span>
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* NOTA DE CONSEJO */}
                  <div className="flex items-start gap-2.5 text-xs text-zinc-500 font-sans pt-2">
                    <Shield className="w-4 h-4 text-zinc-900 flex-shrink-0 mt-0.5" />
                    <p>
                      <strong className="text-zinc-800">Resistencia aeróbica progresiva:</strong> Aumenta los kilómetros gradualmente y dale prioridad al descanso adecuado.
                    </p>
                  </div>

                </div>
              )}

            </div>
          )}

          {/* VISTA 4: MINIJUEGO POWERUP CITY */}
          {selectedChallenge === 'city' && (
            <CityMiniGame data={data} selectedDate={referenceDate} />
          )}

        </main>
      </div>
    </div>
  );
}
