import React, { useState, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Search,
  Sparkles,
  Calendar,
  Flame,
  Dumbbell,
  Zap,
  Activity,
  Footprints,
  Bike,
  Trophy,
  Award,
  CheckCircle2,
  Shield,
  Info,
  HelpCircle,
  X,
  Gauge
} from 'lucide-react';
import { formatDisplayDate, getLocalDateString } from '../utils/helpers';
import { calculateLevelProgress } from '../utils/levelSystem';
import { calculateCardioLevelProgress } from '../utils/cardioLevelSystem';
import ChallengeUnifiedModal from './ChallengeUnifiedModal';
import {
  getStoredChallengeCalibration,
  saveStoredChallengeCalibration,
  getCalibratedMuscleLevels,
  getCalibratedCardioLevels,
  filterDataForChallenge
} from '../utils/challengeCalibration';

export default function HistoryView({
  data,
  goals,
  onSelectDate,
  challengeCalibration,
  onUpdateChallengeCalibration
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedDate, setExpandedDate] = useState(null);

  // Calibrador / Medidor de Desafíos y Modal Unificado (sincronizado con Cloud/App o fallback local)
  const [localCalibrationProfile, setLocalCalibrationProfile] = useState(() => getStoredChallengeCalibration());
  const calibrationProfile = challengeCalibration !== undefined ? challengeCalibration : localCalibrationProfile;
  const [unifiedModalType, setUnifiedModalType] = useState(null); // 'muscle' | 'cardio' | null

  // Desafío de Musculación
  const [isChallengeOpen, setIsChallengeOpen] = useState(false);
  const rouletteRef = useRef(null);

  // Desafío de Resistencia
  const [isCardioChallengeOpen, setIsCardioChallengeOpen] = useState(false);
  const [cardioDiscipline, setCardioDiscipline] = useState('running');
  const cardioRouletteRef = useRef(null);

  const [selectedHistoryDate, setSelectedHistoryDate] = useState(() => getLocalDateString());

  const handleCompleteUnifiedModal = (newProfile) => {
    setLocalCalibrationProfile(newProfile);
    saveStoredChallengeCalibration(newProfile);
    if (onUpdateChallengeCalibration) {
      onUpdateChallengeCalibration(newProfile);
    }
    if (unifiedModalType === 'muscle') {
      setIsChallengeOpen(true);
    } else if (unifiedModalType === 'cardio') {
      setIsCardioChallengeOpen(true);
    }
    setUnifiedModalType(null);
  };

  const scrollRoulette = (direction) => {
    if (rouletteRef.current) {
      const scrollAmount = direction === 'left' ? -220 : 220;
      rouletteRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollCardioRoulette = (direction) => {
    if (cardioRouletteRef.current) {
      const scrollAmount = direction === 'left' ? -220 : 220;
      cardioRouletteRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Ordenar fechas descendente
  const allDates = Object.keys(data).sort((a, b) => new Date(b) - new Date(a));

  // Filtrado por buscador
  const filteredDates = allDates.filter(dateStr => {
    const dayData = data[dateStr] || { foods: [], workouts: [], cardios: [] };
    const query = searchTerm.toLowerCase();

    const matchesDate = dateStr.includes(query) || formatDisplayDate(dateStr).toLowerCase().includes(query);
    const matchesFood = (dayData.foods || []).some(f => f.name.toLowerCase().includes(query));
    const matchesWorkout = (dayData.workouts || []).some(w => w.name.toLowerCase().includes(query));
    const matchesCardio = (dayData.cardios || []).some(c =>
      (c.from || '').toLowerCase().includes(query) ||
      (c.to || '').toLowerCase().includes(query) ||
      (c.type || '').toLowerCase().includes(query)
    );

    return matchesDate || matchesFood || matchesWorkout || matchesCardio;
  });

  const toggleExpand = (dateStr) => {
    setExpandedDate(expandedDate === dateStr ? null : dateStr);
  };

  // Datos del día seleccionado en el panel superior
  const currentDayStats = data[selectedHistoryDate] || { foods: [], workouts: [], cardios: [] };
  const dayCalories = (currentDayStats.foods || []).reduce((acc, f) => acc + (Number(f.calories) || 0), 0);
  const dayProtein = (currentDayStats.foods || []).reduce((acc, f) => acc + (Number(f.protein) || 0), 0);
  const dayTonnage = (currentDayStats.workouts || []).reduce(
    (acc, w) => acc + (Number(w.weight) || 0),
    0
  );
  const dayCardios = currentDayStats.cardios || [];
  const dayCardioKm = dayCardios.reduce((acc, c) => acc + (Number(c.distance) || 0), 0);
  const dayCardioBurned = dayCardios.reduce((acc, c) => acc + (Number(c.caloriesBurned) || 0), 0);

  const calGoal = goals?.calories || 2400;
  const protGoal = goals?.protein || 150;
  const tonGoal = goals?.tonnage || 5000;

  const calPercent = Math.min(Math.round((dayCalories / calGoal) * 100), 100);
  const protPercent = Math.min(Math.round((dayProtein / protGoal) * 100), 100);
  const tonPercent = Math.min(Math.round((dayTonnage / tonGoal) * 100), 100);

  const isChallengeActive = Boolean(calibrationProfile && calibrationProfile.activatedAt);

  // Filtrar data: el juego y control del reto SOLO cuenta a partir del momento en que se le da a "Jugar"
  const challengeData = isChallengeActive ? filterDataForChallenge(data, calibrationProfile) : {};

  const customMuscleLevels = isChallengeActive ? getCalibratedMuscleLevels(calibrationProfile) : null;
  const customCardioLevels = isChallengeActive ? getCalibratedCardioLevels(calibrationProfile, cardioDiscipline) : null;

  const levelProgress = isChallengeActive ? calculateLevelProgress(challengeData, selectedHistoryDate, customMuscleLevels) : null;
  const cardioProgress = isChallengeActive ? calculateCardioLevelProgress(challengeData, cardioDiscipline, selectedHistoryDate, customCardioLevels) : null;

  return (
    <div className="space-y-12 animate-slide-up">

      {/* Modal Unificado: Explicación + Preguntas Paso a Paso */}
      <ChallengeUnifiedModal
        isOpen={Boolean(unifiedModalType)}
        onClose={() => setUnifiedModalType(null)}
        challengeType={unifiedModalType || 'muscle'}
        onComplete={handleCompleteUnifiedModal}
        currentProfile={calibrationProfile}
      />

      {/* Cabecera Principal */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-purple-500/20 pb-6">
        <div>
          <span className="text-xs font-mono tracking-widest text-neon-purple uppercase">// BASE DE DATOS DIARIA</span>
          <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight font-display">
            HISTORIAL & <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-neon-cyan">REGISTROS</span>
          </h2>
        </div>

        <div className="text-xs font-mono text-neutral-400 bg-space-900 px-4 py-2 rounded-xl border border-white/10">
          Total días registrados: <strong className="text-white">{allDates.length}</strong>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* BOTÓN DESPLEGABLE MINIMIZADO: ¡DESAFÍO DE MUSCULACIÓN!                    */}
      {/* ========================================================================= */}
      <div className="pt-1 border-b border-white/10 pb-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-purple-600/15 via-[#130B2E] to-indigo-950/25 border border-purple-500/30 shadow-lg shadow-purple-950/40">
          <div
            onClick={() => {
              if (!isChallengeActive) {
                setUnifiedModalType('muscle');
                return;
              }
              setIsChallengeOpen(!isChallengeOpen);
            }}
            className="flex items-center gap-3 text-left group cursor-pointer hover:opacity-95 transition-opacity flex-1"
          >
            <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 group-hover:scale-105 transition-transform flex-shrink-0">
              <Trophy className="w-5 h-5 text-purple-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-display font-black text-base sm:text-lg text-white uppercase tracking-tight">
                  ¡Desafío de Musculación!
                </span>
                {isChallengeActive ? (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-400/30 font-bold">
                    NIVEL {levelProgress.currentLevel.level}: {levelProgress.currentLevel.name.toUpperCase()}
                  </span>
                ) : (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400 border border-white/10 font-bold">
                    DESAFÍO INACTIVO
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-400 font-sans mt-0.5">
                {isChallengeActive ? (
                  <>
                    Semana: <strong className="text-white font-mono">{levelProgress.currentWeekTonnage.toLocaleString()} kg</strong> / {levelProgress.weeklyGoal.toLocaleString()} kg ({levelProgress.progressPercent}%)
                  </>
                ) : (
                  'Presiona "Jugar" para calibrar tu nivel y activar tus metas semanales.'
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            {isChallengeActive ? (
              <>
                <button
                  type="button"
                  onClick={() => setUnifiedModalType('muscle')}
                  className="px-3 py-2 rounded-xl bg-space-900/90 hover:bg-space-850 border border-purple-500/30 text-purple-300 hover:text-white text-[11px] font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Ajustar Medidor de Nivel"
                >
                  <span>Medidor</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsChallengeOpen(!isChallengeOpen)}
                  className={`px-5 py-2.5 rounded-xl font-bold font-sans text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-md ${!isChallengeOpen
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-900/30 hover:scale-[1.02]'
                    : 'bg-space-900/80 hover:bg-space-850 text-neutral-300 border border-white/10'
                    }`}
                >
                  <span>{isChallengeOpen ? 'Ocultar' : 'Ver Reto'}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isChallengeOpen ? 'rotate-180 text-purple-300' : ''}`} />
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setUnifiedModalType('muscle')}
                className="px-5 py-2.5 rounded-xl font-bold font-sans text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-md bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-900/30 hover:scale-[1.02]"
              >
                <span>Jugar</span>
                <span>→</span>
              </button>
            )}
          </div>
        </div>

        {/* CONTENIDO DESPLEGABLE DEL DESAFÍO */}
        {isChallengeActive && isChallengeOpen && (
          <div className="space-y-4 animate-fade-in-up pt-2">

            {/* Barra de Progreso del Reto Semanal */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-neutral-400">
                  Levantado esta semana: <strong className="text-white text-sm">{levelProgress.currentWeekTonnage.toLocaleString()} kg</strong>
                </span>
                <span className="text-amber-400 font-bold">
                  Meta Reto: {levelProgress.weeklyGoal.toLocaleString()} kg ({levelProgress.progressPercent}%)
                </span>
              </div>

              <div className="w-full bg-white/5 rounded-full h-2.5 overflow-hidden p-0.5 border border-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.5)] transition-all duration-700 ease-out"
                  style={{ width: `${levelProgress.progressPercent}%` }}
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] font-mono text-neutral-400 gap-1 pt-1">
                <div>
                  {levelProgress.isGoalAchieved ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      ¡Reto semanal conquistado! Has superado el tonelaje y alcanzado este rango.
                    </span>
                  ) : (
                    <span>
                      Faltan <strong className="text-amber-400">{levelProgress.remainingKg.toLocaleString()} kg</strong> esta semana para subir al siguiente nivel.
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* RULETA DE RANGOS & OBJETIVOS (UNO AL LADO DEL OTRO EN MODO RULETA) */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between items-center font-mono text-xs text-neutral-400">
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 text-neutral-300">
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                    // RULETA DE RANGOS & OBJETIVOS SEMANALES
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => scrollRoulette('left')}
                    className="p-1.5 rounded-lg bg-space-900 hover:bg-space-850 border border-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                    title="Anterior"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollRoulette('right')}
                    className="p-1.5 rounded-lg bg-space-900 hover:bg-space-850 border border-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                    title="Siguiente"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Contenedor Ruleta Horizontal */}
              <div
                ref={rouletteRef}
                className="flex items-stretch gap-3 overflow-x-auto pb-3 pt-1 scroll-smooth snap-x snap-mandatory scrollbar-none"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {levelProgress.levels.map((lvl) => {
                  const isCurrent = lvl.level === levelProgress.currentLevel.level;
                  const isUnlocked = lvl.level <= levelProgress.currentLevel.level;
                  return (
                    <div
                      key={lvl.level}
                      className={`flex-shrink-0 w-44 sm:w-48 snap-center p-4 rounded-2xl border transition-all flex flex-col justify-between select-none ${isCurrent
                        ? 'border-amber-400 bg-gradient-to-b from-amber-500/20 via-[#181133] to-black/60 shadow-[0_0_20px_rgba(245,158,11,0.25)] ring-1 ring-amber-400'
                        : isUnlocked
                          ? 'border-white/10 bg-space-900/60 hover:border-white/20 text-neutral-300'
                          : 'border-white/5 bg-black/40 text-neutral-600 opacity-60'
                        }`}
                    >
                      <div>
                        <div className="flex justify-between items-center mb-1.5 text-xs font-mono">
                          <span className={`font-bold ${isCurrent ? 'text-amber-400' : 'text-neutral-400'}`}>
                            LVL {lvl.level}
                          </span>
                          {isCurrent ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400 text-black font-sans uppercase shadow-sm">
                              ACTUAL
                            </span>
                          ) : isUnlocked ? (
                            <span className="text-emerald-400 font-bold text-xs">✓</span>
                          ) : (
                            <span className="text-neutral-600 text-xs">🔒</span>
                          )}
                        </div>
                        <h4 className="font-display font-black text-sm text-white tracking-tight truncate">
                          {lvl.name}
                        </h4>
                        <p className="text-[11px] text-neutral-400 font-sans mt-0.5 line-clamp-1">
                          {lvl.title}
                        </p>
                      </div>

                      <div className="mt-4 pt-2.5 border-t border-white/5">
                        <span className="text-[10px] font-mono text-neutral-400 uppercase block">Meta Semanal</span>
                        <span className="font-mono font-bold text-base text-amber-300">
                          {lvl.weeklyGoalKg.toLocaleString()} <span className="text-xs font-sans text-neutral-400 font-normal">kg</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CUADRO REDISEÑADO: RECOMENDACIÓN DE AVANCE & FUENTE MODERNA */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-[#150F2C] to-transparent border border-amber-500/25 backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4 font-sans shadow-lg shadow-black/20">
              <div className="flex items-start sm:items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/25 flex-shrink-0">
                  <Shield className="w-5 h-5 text-amber-400" />
                </div>
                <p className="text-neutral-200 text-xs sm:text-sm leading-relaxed font-sans font-normal">
                  <strong className="text-amber-400 font-semibold">Progreso a tu propio ritmo:</strong> Ve despacio y prioriza siempre la técnica y la recuperación antes que el peso. El tonelaje subirá solo con la constancia; no te apresures ni sacrifiques la forma.
                </p>
              </div>

              <div className="flex items-center gap-2.5 text-xs text-neutral-300 bg-space-900/90 px-4 py-2.5 rounded-xl border border-cyan-500/25 flex-shrink-0 font-sans shadow-inner">
                <Info className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <span>¿No llegaste a la meta esta semana? <strong className="text-white font-semibold">Tu nivel nunca baja</strong>; cada lunes tienes un nuevo intento limpio.</span>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* BOTÓN DESPLEGABLE MINIMIZADO: ¡DESAFÍO DE RESISTENCIA!                   */}
      {/* ========================================================================= */}
      <div className="pt-1 border-b border-white/10 pb-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-indigo-600/15 via-[#0F0E2C] to-purple-950/25 border border-indigo-500/30 shadow-lg shadow-purple-950/40">
          <div
            onClick={() => {
              if (!isChallengeActive) {
                setUnifiedModalType('cardio');
                return;
              }
              setIsCardioChallengeOpen(!isCardioChallengeOpen);
            }}
            className="flex items-center gap-3 text-left group cursor-pointer hover:opacity-95 transition-opacity flex-1"
          >
            <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 group-hover:scale-105 transition-transform flex-shrink-0">
              <Footprints className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-display font-black text-base sm:text-lg text-white uppercase tracking-tight">
                  ¡Desafío de Resistencia!
                </span>
                {isChallengeActive ? (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-400/30 font-bold uppercase">
                    NIVEL {cardioProgress.currentLevel.level}: {cardioProgress.currentLevel.name} ({cardioProgress.disciplineInfo.name})
                  </span>
                ) : (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400 border border-white/10 font-bold">
                    DESAFÍO INACTIVO
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-400 font-sans mt-0.5">
                {isChallengeActive ? (
                  <>
                    Semana: <strong className="text-white font-mono">{cardioProgress.currentWeekKm} km</strong> / {cardioProgress.weeklyGoal} km ({cardioProgress.progressPercent}%)
                  </>
                ) : (
                  'Presiona "Jugar" para calibrar tu nivel y activar tus metas semanales.'
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            {isChallengeActive ? (
              <>
                <button
                  type="button"
                  onClick={() => setUnifiedModalType('cardio')}
                  className="px-3 py-2 rounded-xl bg-space-900/90 hover:bg-space-850 border border-purple-500/30 text-purple-300 hover:text-white text-[11px] font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Ajustar Medidor de Nivel"
                >
                  <span>Medidor</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsCardioChallengeOpen(!isCardioChallengeOpen)}
                  className={`px-5 py-2.5 rounded-xl font-bold font-sans text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-md ${!isCardioChallengeOpen
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-900/30 hover:scale-[1.02]'
                    : 'bg-space-900/80 hover:bg-space-850 text-neutral-300 border border-white/10'
                    }`}
                >
                  <span>{isCardioChallengeOpen ? 'Ocultar' : 'Ver Reto'}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isCardioChallengeOpen ? 'rotate-180 text-purple-300' : ''}`} />
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setUnifiedModalType('cardio')}
                className="px-5 py-2.5 rounded-xl font-bold font-sans text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-md bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-900/30 hover:scale-[1.02]"
              >
                <span>Jugar</span>
                <span>→</span>
              </button>
            )}
          </div>
        </div>

        {/* CONTENIDO DESPLEGABLE DEL DESAFÍO DE RESISTENCIA */}
        {isChallengeActive && isCardioChallengeOpen && (
          <div className="space-y-4 animate-fade-in-up pt-2">

            {/* Selector de Disciplina: Caminata, Running, Bicicleta */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-space-900/60 border border-white/5 font-sans">
              <span className="text-xs font-mono text-neutral-400 uppercase">
                // Elige tu disciplina para el reto:
              </span>
              <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/10 text-xs font-mono">
                {[
                  { id: 'caminata', label: 'Caminata', icon: Footprints, color: 'text-emerald-400' },
                  { id: 'running', label: 'Running', icon: Flame, color: 'text-amber-400' },
                  { id: 'bicicleta', label: 'Bicicleta', icon: Bike, color: 'text-cyan-400' }
                ].map((d) => {
                  const IconComp = d.icon;
                  const isActive = cardioDiscipline === d.id;
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setCardioDiscipline(d.id)}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer uppercase text-xs ${isActive
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-black shadow-md shadow-emerald-500/20'
                        : 'text-neutral-400 hover:text-white'
                        }`}
                    >
                      <IconComp className="w-3.5 h-3.5" />
                      <span>{d.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Barra de Progreso Semanal */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-neutral-400">
                  Recorrido esta semana en {cardioProgress.disciplineInfo.name}: <strong className="text-white text-sm">{cardioProgress.currentWeekKm} km</strong>
                </span>
                <span className="text-emerald-400 font-bold">
                  Meta Reto: {cardioProgress.weeklyGoal} km ({cardioProgress.progressPercent}%)
                </span>
              </div>

              <div className="w-full bg-white/5 rounded-full h-2.5 overflow-hidden p-0.5 border border-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 shadow-[0_0_12px_rgba(16,185,129,0.5)] transition-all duration-700 ease-out"
                  style={{ width: `${cardioProgress.progressPercent}%` }}
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] font-mono text-neutral-400 gap-1 pt-1">
                <div>
                  {cardioProgress.isGoalAchieved ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      ¡Reto semanal de resistencia conquistado! Has superado la distancia y alcanzado este rango.
                    </span>
                  ) : (
                    <span>
                      Faltan <strong className="text-emerald-400">{cardioProgress.remainingKm} km</strong> esta semana para subir al siguiente nivel.
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* RULETA DE RANGOS & METAS SEMANALES DE CARDIO */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between items-center font-mono text-xs text-neutral-400">
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 text-neutral-300">
                    <Award className="w-3.5 h-3.5 text-emerald-400" />
                    // RULETA DE RANGOS: {cardioProgress.disciplineInfo.name.toUpperCase()}
                  </span>
                  <span className="text-[10px] text-neutral-500 hidden sm:inline">
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => scrollCardioRoulette('left')}
                    className="p-1.5 rounded-lg bg-space-900 hover:bg-space-850 border border-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                    title="Anterior"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollCardioRoulette('right')}
                    className="p-1.5 rounded-lg bg-space-900 hover:bg-space-850 border border-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                    title="Siguiente"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Contenedor Ruleta Horizontal */}
              <div
                ref={cardioRouletteRef}
                className="flex items-stretch gap-3 overflow-x-auto pb-3 pt-1 scroll-smooth snap-x snap-mandatory scrollbar-none"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {cardioProgress.levels.map((lvl) => {
                  const isCurrent = lvl.level === cardioProgress.currentLevel.level;
                  const isUnlocked = lvl.level <= cardioProgress.currentLevel.level;
                  return (
                    <div
                      key={lvl.level}
                      className={`flex-shrink-0 w-44 sm:w-48 snap-center p-4 rounded-2xl border transition-all flex flex-col justify-between select-none ${isCurrent
                        ? 'border-emerald-400 bg-gradient-to-b from-emerald-500/20 via-[#0d211d] to-black/60 shadow-[0_0_20px_rgba(16,185,129,0.25)] ring-1 ring-emerald-400'
                        : isUnlocked
                          ? 'border-white/10 bg-space-900/60 hover:border-white/20 text-neutral-300'
                          : 'border-white/5 bg-black/40 text-neutral-600 opacity-60'
                        }`}
                    >
                      <div>
                        <div className="flex justify-between items-center mb-1.5 text-xs font-mono">
                          <span className={`font-bold ${isCurrent ? 'text-emerald-400' : 'text-neutral-400'}`}>
                            LVL {lvl.level}
                          </span>
                          {isCurrent ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-400 text-black font-sans uppercase shadow-sm">
                              ACTUAL
                            </span>
                          ) : isUnlocked ? (
                            <span className="text-emerald-400 font-bold text-xs">✓</span>
                          ) : (
                            <span className="text-neutral-600 text-xs">🔒</span>
                          )}
                        </div>
                        <h4 className="font-display font-black text-sm text-white tracking-tight truncate">
                          {lvl.name}
                        </h4>
                        <p className="text-[11px] text-neutral-400 font-sans mt-0.5 line-clamp-1">
                          {lvl.title}
                        </p>
                      </div>

                      <div className="mt-4 pt-2.5 border-t border-white/5">
                        <span className="text-[10px] font-mono text-neutral-400 uppercase block">Meta Semanal</span>
                        <span className="font-mono font-bold text-base text-emerald-300">
                          {lvl.weeklyGoalKm} <span className="text-xs font-sans text-neutral-400 font-normal">km</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CUADRO REDISEÑADO: RECOMENDACIÓN DE AVANCE AERÓBICO */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-[#0d211d] to-transparent border border-emerald-500/25 backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4 font-sans shadow-lg shadow-black/20">
              <div className="flex items-start sm:items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 flex-shrink-0">
                  <Shield className="w-5 h-5 text-emerald-400" />
                </div>
                <p className="text-neutral-200 text-xs sm:text-sm leading-relaxed font-sans font-normal">
                  <strong className="text-emerald-400 font-semibold">Resistencia a tu propio ritmo:</strong> Incrementa los kilómetros gradualmente y escucha a tu cuerpo. La capacidad aeróbica se construye con regularidad y descanso adecuado.
                </p>
              </div>

              <div className="flex items-center gap-2.5 text-xs text-neutral-300 bg-space-900/90 px-4 py-2.5 rounded-xl border border-teal-500/25 flex-shrink-0 font-sans shadow-inner">
                <Info className="w-4 h-4 text-teal-400 flex-shrink-0" />
                <span>¿No llegaste a la meta esta semana? <strong className="text-white font-semibold">Tu nivel nunca baja</strong>; cada lunes tienes un nuevo intento limpio.</span>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* RESUMEN DEL DÍA SELECCIONADO - DISEÑO MODERNO Y SUELTO (SIN CUADROS QUE LIMITEN) */}
      <div className="space-y-6 pt-2">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-[10px] font-mono text-neon-purple tracking-widest uppercase">// RESUMEN DEL DÍA</span>
            <h3 className="text-lg font-black text-white uppercase tracking-tight font-display">
              {formatDisplayDate(selectedHistoryDate)}
            </h3>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
            <span>FECHA:</span>
            <input
              type="date"
              value={selectedHistoryDate}
              onChange={(e) => setSelectedHistoryDate(e.target.value)}
              className="bg-space-900 border border-white/10 text-white px-3 py-1.5 rounded-lg text-xs font-mono focus:border-neon-purple outline-none"
            />
          </div>
        </div>

        {/* MÉTRICAS SUELTAS Y MODERNAS CON COLOR UNIFICADO */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 py-4 border-y border-white/5">

          {/* 1. Calorías Totales */}
          <div className="space-y-3 relative group">
            <div className="flex items-center justify-between text-xs font-mono tracking-wider text-neutral-400 uppercase">
              <span className="text-neutral-300 font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-neon-purple"></span>
                CALORÍAS TOTALES
              </span>
              <span className="text-neon-cyan font-bold">{calPercent}% DE {calGoal}</span>
            </div>

            <div className="text-3xl sm:text-4xl font-black font-mono text-white tracking-tight">
              {dayCalories.toLocaleString()} <span className="text-xs font-mono text-neon-cyan font-normal uppercase">KCAL</span>
            </div>

            {/* Barra de progreso minimalista */}
            <div className="w-full bg-white/5 rounded-full h-1 overflow-hidden">
              <div
                className="bg-gradient-to-r from-neon-purple to-neon-cyan h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${calPercent}%` }}
              />
            </div>
          </div>

          {/* 2. Proteínas Totales */}
          <div className="space-y-3 relative group md:border-l md:border-white/5 md:pl-8">
            <div className="flex items-center justify-between text-xs font-mono tracking-wider text-neutral-400 uppercase">
              <span className="text-neutral-300 font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-neon-purple"></span>
                PROTEÍNAS TOTALES
              </span>
              <span className="text-neon-cyan font-bold">{protPercent}% DE {protGoal}G</span>
            </div>

            <div className="text-3xl sm:text-4xl font-black font-mono text-white tracking-tight">
              {dayProtein} <span className="text-xs font-mono text-neon-cyan font-normal uppercase">G PROT</span>
            </div>

            {/* Barra de progreso minimalista */}
            <div className="w-full bg-white/5 rounded-full h-1 overflow-hidden">
              <div
                className="bg-gradient-to-r from-neon-purple to-neon-cyan h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${protPercent}%` }}
              />
            </div>
          </div>

          {/* 3. Peso Total */}
          <div className="space-y-3 relative group md:border-l md:border-white/5 md:pl-8">
            <div className="flex items-center justify-between text-xs font-mono tracking-wider text-neutral-400 uppercase">
              <span className="text-neutral-300 font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-neon-purple"></span>
                PESO TOTAL
              </span>
              <span className="text-neon-cyan font-bold">{tonPercent}% DE {tonGoal}KG</span>
            </div>

            <div className="text-3xl sm:text-4xl font-black font-mono text-white tracking-tight">
              {dayTonnage.toLocaleString()} <span className="text-xs font-mono text-neon-cyan font-normal uppercase">KG TOT.</span>
            </div>

            {/* Barra de progreso minimalista */}
            <div className="w-full bg-white/5 rounded-full h-1 overflow-hidden">
              <div
                className="bg-gradient-to-r from-neon-purple to-neon-cyan h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${tonPercent}%` }}
              />
            </div>
          </div>

        </section>

        {/* Banner de Cardio del día - SOLO SI SE CARGÓ ALGO */}
        {dayCardios.length > 0 && (
          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-transparent border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in-up">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                <Footprints className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider block">
                  // CARDIO & DESPLAZAMIENTOS ({dayCardios.length} {dayCardios.length === 1 ? 'SESIÓN' : 'SESIONES'})
                </span>
                <p className="text-white font-black text-base font-mono">
                  {Math.round(dayCardioKm * 10) / 10} <span className="text-xs text-neutral-400 font-sans">KM</span> • <span className="text-amber-400">~{dayCardioBurned}</span> <span className="text-xs text-neutral-400 font-sans">KCAL QUEMADAS</span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {dayCardios.map((c) => (
                <span key={c.id} className="text-xs font-mono px-2.5 py-1 rounded-lg bg-[#0E0926] text-neutral-200 border border-emerald-500/30 flex items-center gap-1.5">
                  <span className="text-emerald-400 font-bold uppercase">{c.type}:</span>
                  <span>{c.from} ➔ {c.to}</span>
                  <span className="text-white font-bold">({c.distance}km)</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Buscador & Lista de Días */}
      <div className="space-y-6">

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="text-xs font-mono tracking-widest text-neutral-400 uppercase">
            // REGISTRO CRONOLÓGICO DE DÍAS
          </div>

          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Buscar ejercicio, comida, fecha..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full input-futuristic px-4 py-3 text-xs text-white rounded-xl font-mono placeholder-neutral-500"
            />
          </div>
        </div>

        {filteredDates.length === 0 ? (
          <div className="py-16 text-center text-neutral-600 font-mono text-sm border-t border-b border-purple-500/10">
            No hay registros disponibles en el historial todavía.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDates.map((dateStr) => {
              const dayData = data[dateStr] || { foods: [], workouts: [], cardios: [] };
              const foods = dayData.foods || [];
              const workouts = dayData.workouts || [];
              const cardios = dayData.cardios || [];

              const totalCalories = foods.reduce((acc, f) => acc + (Number(f.calories) || 0), 0);
              const totalProtein = foods.reduce((acc, f) => acc + (Number(f.protein) || 0), 0);
              const totalTonnage = workouts.reduce((acc, w) => acc + (Number(w.weight) || 0), 0);
              const totalCardioKm = cardios.reduce((acc, c) => acc + (Number(c.distance) || 0), 0);
              const totalCardioBurned = cardios.reduce((acc, c) => acc + (Number(c.caloriesBurned) || 0), 0);

              const isExpanded = expandedDate === dateStr;
              const isSelected = selectedHistoryDate === dateStr;

              return (
                <div
                  key={dateStr}
                  className={`bg-space-900/50 border-l-4 transition-all overflow-hidden rounded-xl ${isSelected ? 'border-neon-purple bg-space-900/80 shadow-lg shadow-purple-600/10' : 'border-neutral-800 hover:border-neutral-600'
                    }`}
                >
                  <div
                    onClick={() => toggleExpand(dateStr)}
                    className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer select-none hover:bg-space-850/50 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-3">
                        <h4 className="font-bold text-lg text-white capitalize">{formatDisplayDate(dateStr)}</h4>
                        <span className="text-[11px] font-mono text-neon-purple px-2 py-0.5 rounded bg-neon-purple/10">
                          {dateStr}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs font-mono text-neutral-400 mt-1 flex-wrap">
                        <span>{workouts.length} ejercicios</span>
                        <span>•</span>
                        <span>{foods.length} alimentos/suplementos</span>
                        {cardios.length > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-emerald-400 font-bold flex items-center gap-1">
                              <Footprints className="w-3.5 h-3.5" />
                              {Math.round(totalCardioKm * 10) / 10} km cardio
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-3 text-xs font-mono">
                        <span className="text-white font-bold">{totalTonnage.toLocaleString()} kg</span>
                        <span className="text-neutral-600">•</span>
                        <span className="text-neon-cyan">{totalCalories} kcal</span>
                        <span className="text-neutral-600">•</span>
                        <span className="text-neon-purple">{totalProtein}g prot</span>
                        {cardios.length > 0 && (
                          <>
                            <span className="text-neutral-600">•</span>
                            <span className="text-amber-400 font-semibold">~{totalCardioBurned} kcal quemadas</span>
                          </>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectDate(dateStr);
                        }}
                        className="px-4 py-2 bg-gradient-to-r from-neon-purple to-neon-violet text-white text-xs font-mono font-bold uppercase rounded-lg hover:opacity-90 transition-opacity shadow-sm"
                      >
                        Cargar Día
                      </button>

                      <div className="text-neutral-400">
                        {isExpanded ? <ChevronDown className="w-5 h-5 text-neon-purple" /> : <ChevronRight className="w-5 h-5" />}
                      </div>
                    </div>
                  </div>

                  {/* Desglose Expandible */}
                  {isExpanded && (
                    <div className={`p-6 border-t border-white/5 bg-space-950/80 grid grid-cols-1 ${cardios.length > 0 ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-6 animate-fade-in-up`}>

                      {/* Ejercicios */}
                      <div className="space-y-3">
                        <div className="text-xs font-mono text-neon-purple uppercase tracking-wider">
                          // ENTRENAMIENTOS ({workouts.length})
                        </div>
                        {workouts.length === 0 ? (
                          <p className="text-xs font-mono text-neutral-600">Sin ejercicios registrados.</p>
                        ) : (
                          <div className="space-y-2">
                            {workouts.map(w => {
                              return (
                                <div key={w.id} className="p-3 bg-space-900/60 border border-white/5 rounded-lg flex justify-between items-center text-xs font-mono">
                                  <span className="text-white font-bold">{w.name}</span>
                                  <span className="text-neutral-400">
                                    {w.sets}×{w.reps} con <strong className="text-neon-cyan">{w.weight}kg</strong>
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Comidas y Suplementos */}
                      <div className="space-y-3">
                        <div className="text-xs font-mono text-neon-cyan uppercase tracking-wider">
                          // NUTRICIÓN & SUPLEMENTOS ({foods.length})
                        </div>
                        {foods.length === 0 ? (
                          <p className="text-xs font-mono text-neutral-600">Sin alimentos registrados.</p>
                        ) : (
                          <div className="space-y-2">
                            {foods.map(f => {
                              const isSupp = f.mealType === 'suplementacion';
                              return (
                                <div key={f.id} className="p-3 bg-space-900/60 border border-white/5 rounded-lg flex justify-between items-center text-xs font-mono">
                                  <div className="flex items-center gap-2">
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase ${isSupp ? 'bg-neon-purple/10 text-neon-purple' : 'bg-neon-cyan/10 text-neon-cyan'
                                      }`}>
                                      {f.mealType || 'item'}
                                    </span>
                                    <span className="text-white font-bold">{f.name}</span>
                                    {f.time && <span className="text-neutral-500 text-[10px]">({f.time})</span>}
                                  </div>
                                  <span className="text-neutral-400">
                                    <span className="text-neon-cyan">{f.calories} kcal</span> • <span className="text-neon-purple">{f.protein}g</span>
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Sesiones de Cardio - SOLO SI SE CARGÓ ALGO */}
                      {cardios.length > 0 && (
                        <div className="space-y-3">
                          <div className="text-xs font-mono text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Footprints className="w-3.5 h-3.5" />
                            <span>// CARDIO & DISTANCIA ({cardios.length})</span>
                          </div>
                          <div className="space-y-2">
                            {cardios.map((c) => {
                              const isRun = c.type === 'running';
                              const isBike = c.type === 'bicicleta';
                              return (
                                <div key={c.id} className="p-3 bg-space-900/60 border border-emerald-500/20 rounded-lg flex flex-col justify-between gap-1 text-xs font-mono">
                                  <div className="flex justify-between items-center">
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold ${isRun
                                      ? 'bg-amber-400/10 text-amber-400 border border-amber-400/30'
                                      : isBike
                                        ? 'bg-cyan-400/10 text-cyan-400 border border-cyan-400/30'
                                        : 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/30'
                                      }`}>
                                      {c.type}
                                    </span>
                                    {c.time && <span className="text-neutral-500 text-[10px]">({c.time})</span>}
                                  </div>

                                  <div className="text-white font-semibold flex items-center gap-1">
                                    <span>{c.from}</span>
                                    <span className="text-neutral-500 text-[10px]">➔</span>
                                    <span className="text-emerald-300">{c.to}</span>
                                  </div>

                                  <div className="flex justify-between items-center text-neutral-400 text-[11px] pt-0.5">
                                    <span className="text-white font-bold">{c.distance} km</span>
                                    <span className="text-amber-400">~{c.caloriesBurned} kcal quemadas</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </div>

    </div>
  );
}
