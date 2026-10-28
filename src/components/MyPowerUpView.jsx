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
  Sparkles
} from 'lucide-react';
import { getLocalDateString } from '../utils/helpers';
import { calculateLevelProgress } from '../utils/levelSystem';
import { calculateCardioLevelProgress } from '../utils/cardioLevelSystem';
import ChallengeUnifiedModal from './ChallengeUnifiedModal';
import ViewHeaderBanner from './ViewHeaderBanner';
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
  // 'muscle' (Peso) | 'cardio' (Distancia)
  const [selectedChallenge, setSelectedChallenge] = useState('muscle');

  // Calibración y modal
  const [localCalibrationProfile, setLocalCalibrationProfile] = useState(() => getStoredChallengeCalibration());
  const calibrationProfile = challengeCalibration !== undefined ? challengeCalibration : localCalibrationProfile;
  const [unifiedModalType, setUnifiedModalType] = useState(null); // 'muscle' | 'cardio' | null

  // Desafío de Distancia - disciplina activa
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
    <div className="w-full animate-fade-in-up">
      {/* Modal Unificado de Calibración */}
      <ChallengeUnifiedModal
        isOpen={Boolean(unifiedModalType)}
        onClose={() => setUnifiedModalType(null)}
        challengeType={unifiedModalType || 'muscle'}
        onComplete={handleCompleteUnifiedModal}
        currentProfile={calibrationProfile}
      />

      {/* BANNER PRINCIPAL DE CABECERA */}
      <ViewHeaderBanner
        title="Desafíos MyPowerUp"
        subtitle="Supera tus metas semanales de peso levantado y distancia recorrida para subir de nivel de forma permanente."
      >
      </ViewHeaderBanner>

      {/* CONTENEDOR PRINCIPAL: DESAFÍOS AL COSTADO + INFO A LA DERECHA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row items-start gap-6">

          {/* ========================================================================= */}
          {/* COLUMNA LATERAL (IZQUIERDA): DESAFÍOS UNO ABAJO DEL OTRO                  */}
          {/* ========================================================================= */}
          <aside className="w-full lg:w-80 xl:w-88 shrink-0 flex flex-col gap-3.5">
            <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest px-1 font-bold">
              Seleccionar Desafío
            </div>

            {/* CARD 1: DESAFÍO DE PESO */}
            <button
              type="button"
              onClick={() => setSelectedChallenge('muscle')}
              className={`w-full p-4 sm:p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex items-center justify-between gap-3.5 group ${selectedChallenge === 'muscle'
                ? 'bg-black text-white border-black shadow-lg ring-2 ring-emerald-500/30'
                : 'bg-white text-zinc-800 border-zinc-200 hover:border-zinc-400 hover:shadow-md'
                }`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${selectedChallenge === 'muscle'
                    ? 'bg-zinc-800 text-white'
                    : 'bg-zinc-100 text-zinc-800 group-hover:bg-zinc-200'
                    }`}
                >
                  <Dumbbell className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-500">
                      Fuerza
                    </span>
                    {isChallengeActive && levelProgress && (
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${selectedChallenge === 'muscle'
                          ? 'bg-zinc-800 text-emerald-400 border border-zinc-700'
                          : 'bg-zinc-100 text-zinc-800 border border-zinc-200'
                          }`}
                      >
                        LVL {levelProgress.currentLevel.level}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base sm:text-lg font-black tracking-tight uppercase font-display truncate">
                    Desafío de Peso
                  </h3>
                  <p
                    className={`text-xs truncate ${selectedChallenge === 'muscle' ? 'text-zinc-400' : 'text-zinc-500'
                      }`}
                  >
                    {isChallengeActive && levelProgress
                      ? `${levelProgress.currentWeekTonnage.toLocaleString()} kg esta semana`
                      : 'Tonelaje acumulado'}
                  </p>
                </div>
              </div>
              <Trophy
                className={`w-5 h-5 shrink-0 ${selectedChallenge === 'muscle' ? 'text-amber-400' : 'text-zinc-300'
                  }`}
              />
            </button>

            {/* CARD 2: DESAFÍO DE DISTANCIA */}
            <button
              type="button"
              onClick={() => setSelectedChallenge('cardio')}
              className={`w-full p-4 sm:p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex items-center justify-between gap-3.5 group ${selectedChallenge === 'cardio'
                ? 'bg-black text-white border-black shadow-lg ring-2 ring-emerald-500/30'
                : 'bg-white text-zinc-800 border-zinc-200 hover:border-zinc-400 hover:shadow-md'
                }`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${selectedChallenge === 'cardio'
                    ? 'bg-zinc-800 text-white'
                    : 'bg-zinc-100 text-zinc-800 group-hover:bg-zinc-200'
                    }`}
                >
                  <Flame className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-500">
                      Resistencia
                    </span>
                    {isChallengeActive && cardioProgress && (
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${selectedChallenge === 'cardio'
                          ? 'bg-zinc-800 text-emerald-400 border border-zinc-700'
                          : 'bg-zinc-100 text-zinc-800 border border-zinc-200'
                          }`}
                      >
                        LVL {cardioProgress.currentLevel.level}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base sm:text-lg font-black tracking-tight uppercase font-display truncate">
                    Desafío de Distancia
                  </h3>
                  <p
                    className={`text-xs truncate ${selectedChallenge === 'cardio' ? 'text-zinc-400' : 'text-zinc-500'
                      }`}
                  >
                    {isChallengeActive && cardioProgress
                      ? `${cardioProgress.currentWeekKm} km en ${cardioProgress.disciplineInfo.name}`
                      : 'Kilómetros recorridos'}
                  </p>
                </div>
              </div>
              <Award
                className={`w-5 h-5 shrink-0 ${selectedChallenge === 'cardio' ? 'text-amber-400' : 'text-zinc-300'
                  }`}
              />
            </button>

            {/* NOTA DE NIVELES PERMANENTES EN LA BARRA LATERAL */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-zinc-900 font-mono text-[11px] font-bold">
                <span>NIVELES PERMANENTES</span>
              </div>
              <p className="text-[11px] text-zinc-500 leading-relaxed font-sans">
                Tu rango conquistado nunca baja. Cada lunes se reinicia el progreso semanal para un nuevo intento.
              </p>
            </div>
          </aside>

          {/* ========================================================================= */}
          {/* COLUMNA PRINCIPAL (DERECHA): INFO DETALLADA DEL DESAFÍO SELECCIONADO       */}
          {/* ========================================================================= */}
          <main className="flex-1 min-w-0 w-full space-y-5">
            {/* ----------------------------------------------------------------------- */}
            {/* VISTA 1: DESAFÍO DE PESO (FUERZA & MUSCULACIÓN)                         */}
            {/* ----------------------------------------------------------------------- */}
            {selectedChallenge === 'muscle' && (
              <div className="space-y-5 animate-fade-in">
                {/* Cabecera del desafío */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 pb-3.5">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold">
                      DESAFÍO DE TONELAJE & VOLUMEN
                    </span>
                    <div className="flex items-center gap-2.5">
                      <h2 className="text-xl sm:text-2xl font-black text-zinc-900 uppercase font-display">
                        Desafío de Peso
                      </h2>
                      {isChallengeActive && levelProgress && (
                        <span className="text-xs font-mono font-bold px-2.5 py-0.5 text-zinc-900">
                          NIVEL {levelProgress.currentLevel.level}: {levelProgress.currentLevel.name.toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setUnifiedModalType('muscle')}
                      className="px-3 py-1.5 rounded-xl border border-zinc-300 hover:border-black text-zinc-800 hover:text-black text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer bg-white shadow-2xs"
                    >
                      <Sliders className="w-3.5 h-3.5 text-zinc-900" />
                      <span>{isChallengeActive ? '' : 'Calibrar Nivel'}</span>
                    </button>
                  </div>
                </div>

                {!isChallengeActive && (
                  <div className="py-6 space-y-3.5 bg-white border border-zinc-200 rounded-2xl p-5 sm:p-6 shadow-sm">
                    <div className="flex items-center gap-2 text-emerald-600 font-mono text-xs font-bold uppercase tracking-wider">
                      <Sparkles className="w-4 h-4" />
                      <span>Configuración Inicial</span>
                    </div>
                    <h3 className="text-lg font-black text-zinc-900 uppercase font-display">
                      Comienza tu progresión de fuerza
                    </h3>
                    <p className="text-xs sm:text-sm text-zinc-600 font-sans max-w-xl leading-relaxed">
                      Aún no has calibrado tu nivel de inicio. Responde 3 preguntas rápidas sobre tu experiencia y días de entreno para fijar tu meta semanal personalizada.
                    </p>
                    <button
                      type="button"
                      onClick={() => setUnifiedModalType('muscle')}
                      className="px-4 py-2 rounded-xl bg-black hover:bg-zinc-800 text-white font-mono text-xs font-bold uppercase transition-all shadow-sm cursor-pointer"
                    >
                      Comenzar Calibración de Peso →
                    </button>
                  </div>
                )}

                {isChallengeActive && levelProgress && (
                  <div className="space-y-4">
                    {/* MÉTRICAS SEMANALES */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-0.5">
                        <span className="text-[11px] font-mono text-zinc-500 uppercase">Levantado esta semana</span>
                        <div className="text-2xl sm:text-3xl font-black font-mono text-zinc-900">
                          {levelProgress.currentWeekTonnage.toLocaleString()}{' '}
                          <span className="text-xs font-mono text-zinc-500 font-normal">KG</span>
                        </div>
                      </div>

                      <div className="space-y-0.5 sm:border-l sm:border-zinc-200 sm:pl-5">
                        <span className="text-[11px] font-mono text-zinc-500 uppercase">
                          Meta Reto Semanal ({levelProgress.progressPercent}%)
                        </span>
                        <div className="text-2xl sm:text-3xl font-black font-mono text-black">
                          {levelProgress.weeklyGoal.toLocaleString()}{' '}
                          <span className="text-xs font-mono text-zinc-500 font-normal">KG</span>
                        </div>
                      </div>
                    </div>

                    {/* BARRA DE PROGRESO */}
                    <div className="space-y-2 bg-white border border-zinc-200 rounded-2xl p-4 sm:p-5 shadow-sm">
                      <div className="flex justify-between items-center text-xs font-mono font-bold">
                        <span className="text-zinc-600 uppercase">Progreso semanal de peso</span>
                        <span className="text-black font-extrabold">{levelProgress.progressPercent}%</span>
                      </div>

                      <div className="w-full bg-zinc-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-black h-full rounded-full transition-all duration-700 ease-out"
                          style={{ width: `${levelProgress.progressPercent}%` }}
                        />
                      </div>

                      <div className="text-xs font-mono text-zinc-500 pt-0.5">
                        {levelProgress.isGoalAchieved ? (
                          <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            ¡Reto semanal conquistado! Has superado el tonelaje de tu nivel.
                          </span>
                        ) : (
                          <span>
                            Faltan{' '}
                            <strong className="text-zinc-900 font-bold">
                              {levelProgress.remainingKg.toLocaleString()} kg
                            </strong>{' '}
                            esta semana para subir al siguiente nivel.
                          </span>
                        )}
                      </div>
                    </div>

                    {/* RULETA DE RANGOS */}
                    <div className="space-y-2.5 pt-1">
                      <div className="flex justify-between items-center font-mono text-xs text-zinc-500">
                        <span className="text-zinc-900 font-bold uppercase tracking-wider text-[11px]">
                          RULETA DE RANGOS SEMANALES
                        </span>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => scrollMuscleRoulette('left')}
                            className="p-1 rounded-lg hover:bg-zinc-100 text-zinc-500 hover:text-black transition-colors cursor-pointer border border-zinc-200"
                            title="Anterior"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => scrollMuscleRoulette('right')}
                            className="p-1 rounded-lg hover:bg-zinc-100 text-zinc-500 hover:text-black transition-colors cursor-pointer border border-zinc-200"
                            title="Siguiente"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div
                        ref={muscleRouletteRef}
                        className="flex items-stretch gap-3 overflow-x-auto pb-2 pt-0.5 scroll-smooth snap-x snap-mandatory"
                      >
                        {levelProgress.levels.map((lvl) => {
                          const isCurrent = lvl.level === levelProgress.currentLevel.level;
                          const isUnlocked = lvl.level <= levelProgress.currentLevel.level;
                          return (
                            <div
                              key={lvl.level}
                              className={`flex-shrink-0 w-40 sm:w-44 snap-center p-3.5 rounded-2xl border transition-all flex flex-col justify-between select-none bg-white shadow-2xs ${isCurrent
                                ? 'border-zinc-900 ring-2 ring-black text-zinc-900'
                                : isUnlocked
                                  ? 'border-zinc-200 text-zinc-800'
                                  : 'border-zinc-200 text-zinc-400 opacity-60'
                                }`}
                            >
                              <div>
                                <div className="flex justify-between items-center mb-1 text-[11px] font-mono">
                                  <span
                                    className={`font-bold ${isCurrent ? 'text-black font-extrabold' : 'text-zinc-500'
                                      }`}
                                  >
                                    LVL {lvl.level}
                                  </span>
                                  {isCurrent ? (
                                    <span className="text-[8px] font-bold px-1.5 py-0.2 rounded bg-black text-white font-sans uppercase">
                                      ACTUAL
                                    </span>
                                  ) : isUnlocked ? (
                                    <span className="text-zinc-900 font-bold text-xs">✓</span>
                                  ) : (
                                    <span className="text-zinc-400 text-xs">🔒</span>
                                  )}
                                </div>
                                <h4 className="font-display font-extrabold text-xs sm:text-sm text-zinc-900 tracking-tight truncate">
                                  {lvl.name}
                                </h4>
                                <p className="text-[10px] text-zinc-500 font-sans line-clamp-1">
                                  {lvl.title}
                                </p>
                              </div>

                              <div className="mt-2.5 pt-2 border-t border-zinc-100">
                                <span className="text-[9px] font-mono text-zinc-400 uppercase block">
                                  Meta Semanal
                                </span>
                                <span className="font-mono font-bold text-xs sm:text-sm text-zinc-900">
                                  {lvl.weeklyGoalKg.toLocaleString()}{' '}
                                  <span className="text-[10px] font-sans text-zinc-500 font-normal">kg</span>
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* NOTA DE CONSEJO */}
                    <div className="flex items-start gap-2 text-xs text-zinc-500 font-sans bg-zinc-50 ">
                      <p>
                        <strong className="text-zinc-800 font-bold">Sobrecarga progresiva:</strong> Avanza a tu ritmo cuidando la recuperación. El tonelaje subirá naturalmente semana a semana.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ----------------------------------------------------------------------- */}
            {/* VISTA 2: DESAFÍO DE DISTANCIA (CARDIO / RESISTENCIA)                     */}
            {/* ----------------------------------------------------------------------- */}
            {selectedChallenge === 'cardio' && (
              <div className="space-y-5 animate-fade-in">
                {/* Cabecera del desafío */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 pb-3.5">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold">
                      DESAFÍO DE DISTANCIA & RESISTENCIA
                    </span>
                    <div className="flex items-center gap-2.5">
                      <h2 className="text-xl sm:text-2xl font-black text-zinc-900 uppercase font-display">
                        Desafío de Distancia
                      </h2>
                      {isChallengeActive && cardioProgress && (
                        <span className="text-xs font-mono font-bold px-2.5 py-0.5 text-zinc-900 uppercase">
                          NIVEL {cardioProgress.currentLevel.level}: {cardioProgress.currentLevel.name}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setUnifiedModalType('cardio')}
                      className="px-3 py-1.5 rounded-xl border border-zinc-300 hover:border-black text-zinc-800 hover:text-black text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer bg-white shadow-2xs"
                    >
                      <Sliders className="w-3.5 h-3.5 text-zinc-900" />
                      <span>{isChallengeActive ? '' : 'Calibrar Nivel'}</span>
                    </button>
                  </div>
                </div>

                {/* SELECTOR DE DISCIPLINA */}
                <div className="flex flex-wrap items-center gap-2.5 font-mono text-xs">
                  <span className="text-zinc-500 uppercase text-[10px] font-bold">Disciplina:</span>
                  <div className="flex items-center gap-1.5">
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
                          className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer uppercase text-xs ${isActive
                            ? 'bg-black text-white shadow-sm ring-1 ring-black'
                            : 'bg-white text-zinc-600 hover:text-black hover:bg-zinc-100 border border-zinc-200'
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
                  <div className="py-6 space-y-3.5 bg-white border border-zinc-200 rounded-2xl p-5 sm:p-6 shadow-sm">
                    <div className="flex items-center gap-2 text-emerald-600 font-mono text-xs font-bold uppercase tracking-wider">
                      <Sparkles className="w-4 h-4" />
                      <span>Configuración Inicial</span>
                    </div>
                    <h3 className="text-lg font-black text-zinc-900 uppercase font-display">
                      Comienza tu progresión de resistencia
                    </h3>
                    <p className="text-xs sm:text-sm text-zinc-600 font-sans max-w-xl leading-relaxed">
                      Aún no has calibrado tu nivel de inicio. Responde 3 preguntas rápidas para adaptar las metas de distancia en Caminata, Running o Bicicleta a tu condición física actual.
                    </p>
                    <button
                      type="button"
                      onClick={() => setUnifiedModalType('cardio')}
                      className="px-4 py-2 rounded-xl bg-black hover:bg-zinc-800 text-white font-mono text-xs font-bold uppercase transition-all shadow-sm cursor-pointer"
                    >
                      Comenzar Calibración de Distancia →
                    </button>
                  </div>
                )}

                {isChallengeActive && cardioProgress && (
                  <div className="space-y-4">
                    {/* MÉTRICAS SEMANALES */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-0.5">
                        <span className="text-[11px] font-mono text-zinc-500 uppercase">
                          Recorrido en {cardioProgress.disciplineInfo.name}
                        </span>
                        <div className="text-2xl sm:text-3xl font-black font-mono text-zinc-900">
                          {cardioProgress.currentWeekKm}{' '}
                          <span className="text-xs font-mono text-zinc-500 font-normal">KM</span>
                        </div>
                      </div>

                      <div className="space-y-0.5 sm:border-l sm:border-zinc-200 sm:pl-5">
                        <span className="text-[11px] font-mono text-zinc-500 uppercase">
                          Meta Reto Semanal ({cardioProgress.progressPercent}%)
                        </span>
                        <div className="text-2xl sm:text-3xl font-black font-mono text-black">
                          {cardioProgress.weeklyGoal}{' '}
                          <span className="text-xs font-mono text-zinc-500 font-normal">KM</span>
                        </div>
                      </div>
                    </div>

                    {/* BARRA DE PROGRESO */}
                    <div className="space-y-2 bg-white border border-zinc-200 rounded-2xl p-4 sm:p-5 shadow-sm">
                      <div className="flex justify-between items-center text-xs font-mono font-bold">
                        <span className="text-zinc-600 uppercase">
                          Progreso semanal en {cardioProgress.disciplineInfo.name}
                        </span>
                        <span className="text-black font-extrabold">{cardioProgress.progressPercent}%</span>
                      </div>

                      <div className="w-full bg-zinc-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-black h-full rounded-full transition-all duration-700 ease-out"
                          style={{ width: `${cardioProgress.progressPercent}%` }}
                        />
                      </div>

                      <div className="text-xs font-mono text-zinc-500 pt-0.5">
                        {cardioProgress.isGoalAchieved ? (
                          <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            ¡Reto semanal de resistencia conquistado! Has superado la distancia de tu nivel.
                          </span>
                        ) : (
                          <span>
                            Faltan{' '}
                            <strong className="text-zinc-900 font-bold">{cardioProgress.remainingKm} km</strong>{' '}
                            esta semana para subir al siguiente nivel.
                          </span>
                        )}
                      </div>
                    </div>

                    {/* RULETA DE RANGOS */}
                    <div className="space-y-2.5 pt-1">
                      <div className="flex justify-between items-center font-mono text-xs text-zinc-500">
                        <span className="flex items-center gap-1.5 text-zinc-900 font-bold uppercase tracking-wider text-[11px]">
                          <Award className="w-3.5 h-3.5 text-black" />
                          <span>RANGOS: {cardioProgress.disciplineInfo.name.toUpperCase()}</span>
                        </span>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => scrollCardioRoulette('left')}
                            className="p-1 rounded-lg hover:bg-zinc-100 text-zinc-500 hover:text-black transition-colors cursor-pointer border border-zinc-200"
                            title="Anterior"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => scrollCardioRoulette('right')}
                            className="p-1 rounded-lg hover:bg-zinc-100 text-zinc-500 hover:text-black transition-colors cursor-pointer border border-zinc-200"
                            title="Siguiente"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div
                        ref={cardioRouletteRef}
                        className="flex items-stretch gap-3 overflow-x-auto pb-2 pt-0.5 scroll-smooth snap-x snap-mandatory"
                      >
                        {cardioProgress.levels.map((lvl) => {
                          const isCurrent = lvl.level === cardioProgress.currentLevel.level;
                          const isUnlocked = lvl.level <= cardioProgress.currentLevel.level;
                          return (
                            <div
                              key={lvl.level}
                              className={`flex-shrink-0 w-40 sm:w-44 snap-center p-3.5 rounded-2xl border transition-all flex flex-col justify-between select-none bg-white shadow-2xs ${isCurrent
                                ? 'border-zinc-900 ring-2 ring-black text-zinc-900'
                                : isUnlocked
                                  ? 'border-zinc-200 text-zinc-800'
                                  : 'border-zinc-200 text-zinc-400 opacity-60'
                                }`}
                            >
                              <div>
                                <div className="flex justify-between items-center mb-1 text-[11px] font-mono">
                                  <span
                                    className={`font-bold ${isCurrent ? 'text-black font-extrabold' : 'text-zinc-500'
                                      }`}
                                  >
                                    LVL {lvl.level}
                                  </span>
                                  {isCurrent ? (
                                    <span className="text-[8px] font-bold px-1.5 py-0.2 rounded bg-black text-white font-sans uppercase">
                                      ACTUAL
                                    </span>
                                  ) : isUnlocked ? (
                                    <span className="text-zinc-900 font-bold text-xs">✓</span>
                                  ) : (
                                    <span className="text-zinc-400 text-xs">🔒</span>
                                  )}
                                </div>
                                <h4 className="font-display font-extrabold text-xs sm:text-sm text-zinc-900 tracking-tight truncate">
                                  {lvl.name}
                                </h4>
                                <p className="text-[10px] text-zinc-500 font-sans line-clamp-1">
                                  {lvl.title}
                                </p>
                              </div>

                              <div className="mt-2.5 pt-2 border-t border-zinc-100">
                                <span className="text-[9px] font-mono text-zinc-400 uppercase block">
                                  Meta Semanal
                                </span>
                                <span className="font-mono font-bold text-xs sm:text-sm text-zinc-900">
                                  {lvl.weeklyGoalKm}{' '}
                                  <span className="text-[10px] font-sans text-zinc-500 font-normal">km</span>
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* NOTA DE CONSEJO */}
                    <div className="flex items-start gap-2 text-xs text-zinc-500 font-sans bg-zinc-50">
                      <p>
                        <strong className="text-zinc-800 font-bold">Resistencia aeróbica progresiva:</strong> Aumenta los kilómetros gradualmente y dale prioridad al descanso adecuado.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </main>

        </div>
      </div>
    </div>
  );
}
