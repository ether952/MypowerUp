import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import {
  startBackgroundAudio,
  stopBackgroundAudio,
  playChime,
  triggerHaptic,
  requestScreenWakeLock,
  releaseScreenWakeLock,
  registerWorkoutServiceWorker,
  showOrUpdateNativeNotification,
  closeNativeNotification
} from '../services/audioFeedbackService';
import { resolveExerciseGifUrl } from '../utils/routineTemplates';

const ActiveWorkoutContext = createContext(null);

export function useActiveWorkout() {
  const context = useContext(ActiveWorkoutContext);
  if (!context) {
    throw new Error('useActiveWorkout debe usarse dentro de un ActiveWorkoutProvider');
  }
  return context;
}

// Rangos comunes de repeticiones para ciclar fácilmente desde la pantalla de bloqueo (⏮)
const REP_CYCLE_PRESETS = [6, 8, 10, 12, 15, 20];

export function ActiveWorkoutProvider({ children, onLogSet }) {
  // Estado de la sesión activa
  const [isActive, setIsActive] = useState(false);
  const [workoutQueue, setWorkoutQueue] = useState([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [totalSets, setTotalSets] = useState(4);
  const [currentWeight, setCurrentWeight] = useState(20);
  const [currentReps, setCurrentReps] = useState(10);
  const [targetRestSeconds, setTargetRestSeconds] = useState(90);

  // Estado del temporizador de descanso
  const [isResting, setIsResting] = useState(false);
  const [restSecondsLeft, setRestSecondsLeft] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Registro de series completadas en la sesión actual
  const [completedSets, setCompletedSets] = useState([]);
  const [isHudExpanded, setIsHudExpanded] = useState(false);

  // Referencias mutables para que los callbacks de MediaSession y SW siempre tengan datos frescos
  const stateRef = useRef({
    isActive: false,
    workoutQueue: [],
    currentExerciseIndex: 0,
    currentSetIndex: 0,
    totalSets: 4,
    currentWeight: 20,
    currentReps: 10,
    isResting: false,
    restSecondsLeft: 0,
    isPaused: false,
    completedSets: []
  });

  // Mantener sincronizado stateRef
  useEffect(() => {
    stateRef.current = {
      isActive,
      workoutQueue,
      currentExerciseIndex,
      currentSetIndex,
      totalSets,
      currentWeight,
      currentReps,
      isResting,
      restSecondsLeft,
      isPaused,
      completedSets
    };
  }, [
    isActive,
    workoutQueue,
    currentExerciseIndex,
    currentSetIndex,
    totalSets,
    currentWeight,
    currentReps,
    isResting,
    restSecondsLeft,
    isPaused,
    completedSets
  ]);

  const currentExercise = workoutQueue[currentExerciseIndex] || null;

  /**
   * Sincroniza la Pantalla de Bloqueo (Media Session API) Y Notificación Nativa Android
   */
  const syncMediaSession = useCallback(() => {
    const curr = stateRef.current;
    if (!curr.isActive || !curr.workoutQueue[curr.currentExerciseIndex]) {
      if (typeof window !== 'undefined' && 'mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'none';
      }
      closeNativeNotification();
      return;
    }

    const ex = curr.workoutQueue[curr.currentExerciseIndex];
    const resolvedImg = resolveExerciseGifUrl(ex) || ex.gifUrl || ex.image || (window.location.origin + '/logo-mypowerup.png');

    const title = `${ex.name} • Serie ${curr.currentSetIndex + 1}/${curr.totalSets}`;
    const artist = `${curr.currentReps} Reps × ${curr.currentWeight} kg`;
    const album = curr.isResting
      ? `⏱ DESCANSO: ${curr.restSecondsLeft}s  [⏭ = Listo]`
      : `MyPowerUp Gym • [⏭ = Guardar Serie] [⏮ = Reps]`;

    // 1. Media Session API (iOS & Android lock screen music widget)
    if (typeof window !== 'undefined' && 'mediaSession' in navigator) {
      navigator.mediaSession.playbackState = curr.isPaused ? 'paused' : 'playing';

      try {
        navigator.mediaSession.metadata = new MediaMetadata({
          title,
          artist,
          album,
          artwork: [
            { src: resolvedImg, sizes: '512x512', type: 'image/png' },
            { src: resolvedImg, sizes: '256x256', type: 'image/png' },
            { src: resolvedImg, sizes: '128x128', type: 'image/png' },
            { src: window.location.origin + '/logo-mypowerup.png', sizes: '192x192', type: 'image/png' }
          ]
        });
      } catch (e) {
        console.warn('Error configurando MediaMetadata:', e);
      }
    }

    // 2. Notificación Nativa persistente con botones interactivos (Android)
    showOrUpdateNativeNotification({
      exerciseName: ex.name,
      currentSet: curr.currentSetIndex + 1,
      totalSets: curr.totalSets,
      reps: curr.currentReps,
      weight: curr.currentWeight,
      isResting: curr.isResting,
      restSeconds: curr.restSecondsLeft,
      gifUrl: resolvedImg
    });
  }, []);

  /**
   * Completar Serie Actual (Mapeado a ⏭ Siguiente Pista en pantalla de bloqueo o acción de notificación)
   */
  const completeCurrentSet = useCallback(() => {
    const curr = stateRef.current;
    if (!curr.isActive || !curr.workoutQueue[curr.currentExerciseIndex]) return;

    const ex = curr.workoutQueue[curr.currentExerciseIndex];
    const completedSetNumber = curr.currentSetIndex + 1;
    const completedSetData = {
      setNumber: completedSetNumber,
      weight: curr.currentWeight,
      reps: curr.currentReps,
      completedAt: new Date().toISOString()
    };

    // Feedback inmediato
    triggerHaptic([90, 50, 90]);
    playChime('set_done');

    // Notificar al guardado diario de App.jsx
    if (onLogSet) {
      onLogSet({
        exercise: ex,
        setNumber: completedSetNumber,
        weight: curr.currentWeight,
        reps: curr.currentReps,
        totalSets: curr.totalSets
      });
    }

    const nextCompletedList = [...curr.completedSets, completedSetData];
    setCompletedSets(nextCompletedList);

    // ¿Quedan más series de este ejercicio?
    if (completedSetNumber < curr.totalSets) {
      setCurrentSetIndex(completedSetNumber);
      // Iniciar descanso
      const restDuration = ex.restSeconds || targetRestSeconds || 90;
      setRestSecondsLeft(restDuration);
      setIsResting(true);
    } else {
      // Ejercicio completado: pasar al siguiente en cola o finalizar
      const nextExIdx = curr.currentExerciseIndex + 1;
      if (nextExIdx < curr.workoutQueue.length) {
        const nextEx = curr.workoutQueue[nextExIdx];
        setCurrentExerciseIndex(nextExIdx);
        setCurrentSetIndex(0);
        setTotalSets(nextEx.sets || 4);
        setCurrentWeight(Number(nextEx.weight) || 20);
        setCurrentReps(Number(nextEx.reps) || 10);
        setCompletedSets([]);
        // Descanso de transición entre ejercicios
        const restDuration = nextEx.restSeconds || targetRestSeconds || 90;
        setRestSecondsLeft(restDuration);
        setIsResting(true);
      } else {
        // Rutina / Circuito completo finalizado con éxito
        triggerHaptic([150, 100, 200, 100, 300]);
        playChime('workout_complete');
        setIsActive(false);
        stopBackgroundAudio();
        releaseScreenWakeLock();
        closeNativeNotification();
        return;
      }
    }
  }, [onLogSet, targetRestSeconds]);

  /**
   * Ciclar / Cambiar Repeticiones (Mapeado a ⏮ Pista Anterior en pantalla de bloqueo o acción de notificación)
   */
  const cycleReps = useCallback(() => {
    const curr = stateRef.current;
    if (!curr.isActive) return;

    triggerHaptic([40]);
    let nextReps;
    const currentIdx = REP_CYCLE_PRESETS.indexOf(curr.currentReps);
    if (currentIdx !== -1 && currentIdx < REP_CYCLE_PRESETS.length - 1) {
      nextReps = REP_CYCLE_PRESETS[currentIdx + 1];
    } else if (currentIdx === REP_CYCLE_PRESETS.length - 1) {
      nextReps = REP_CYCLE_PRESETS[0];
    } else {
      nextReps = curr.currentReps + 2;
      if (nextReps > 20) nextReps = 6;
    }

    setCurrentReps(nextReps);
  }, []);

  /**
   * Ajustar peso (+ / - kg)
   */
  const adjustWeight = useCallback((delta) => {
    const curr = stateRef.current;
    if (!curr.isActive) return;

    triggerHaptic([35]);
    const nextVal = Math.max(0, Math.min(400, Math.round((curr.currentWeight + delta) * 10) / 10));
    setCurrentWeight(nextVal);
  }, []);

  /**
   * Ajustar repeticiones (+ / - 1 rep)
   */
  const adjustReps = useCallback((delta) => {
    const curr = stateRef.current;
    if (!curr.isActive) return;

    triggerHaptic([30]);
    const nextVal = Math.max(1, Math.min(100, curr.currentReps + delta));
    setCurrentReps(nextVal);
  }, []);

  /**
   * Agregar una serie extra al ejercicio actual
   */
  const addTotalSet = useCallback(() => {
    triggerHaptic([40]);
    setTotalSets((prev) => Math.min(20, prev + 1));
  }, []);

  /**
   * Quitar una serie del ejercicio actual
   */
  const removeTotalSet = useCallback(() => {
    triggerHaptic([40]);
    setTotalSets((prev) => Math.max(currentSetIndex + 1, prev - 1));
  }, [currentSetIndex]);

  /**
   * Saltar al siguiente ejercicio de la cola
   */
  const skipToNextExercise = useCallback(() => {
    const curr = stateRef.current;
    if (curr.currentExerciseIndex + 1 < curr.workoutQueue.length) {
      triggerHaptic([50]);
      const nextIdx = curr.currentExerciseIndex + 1;
      const nextEx = curr.workoutQueue[nextIdx];
      setCurrentExerciseIndex(nextIdx);
      setCurrentSetIndex(0);
      setTotalSets(nextEx.sets || 4);
      setCurrentWeight(Number(nextEx.weight) || 20);
      setCurrentReps(Number(nextEx.reps) || 10);
      setCompletedSets([]);
      setIsResting(false);
      setRestSecondsLeft(0);
    }
  }, []);

  /**
   * Volver al ejercicio anterior de la cola
   */
  const goToPreviousExercise = useCallback(() => {
    const curr = stateRef.current;
    if (curr.currentExerciseIndex > 0) {
      triggerHaptic([50]);
      const prevIdx = curr.currentExerciseIndex - 1;
      const prevEx = curr.workoutQueue[prevIdx];
      setCurrentExerciseIndex(prevIdx);
      setCurrentSetIndex(0);
      setTotalSets(prevEx.sets || 4);
      setCurrentWeight(Number(prevEx.weight) || 20);
      setCurrentReps(Number(prevEx.reps) || 10);
      setCompletedSets([]);
      setIsResting(false);
      setRestSecondsLeft(0);
    }
  }, []);

  /**
   * Iniciar un entrenamiento (ejercicio único o lista completa de rutina)
   */
  const startWorkout = useCallback((exerciseOrQueue, startIndex = 0) => {
    let queue = [];
    if (Array.isArray(exerciseOrQueue)) {
      queue = exerciseOrQueue.filter(Boolean);
    } else if (exerciseOrQueue && typeof exerciseOrQueue === 'object') {
      queue = [exerciseOrQueue];
    }

    if (queue.length === 0) return;

    const initialIdx = Math.min(startIndex, queue.length - 1);
    const firstEx = queue[initialIdx];

    setWorkoutQueue(queue);
    setCurrentExerciseIndex(initialIdx);
    setCurrentSetIndex(0);
    setTotalSets(firstEx.sets || 4);
    setCurrentWeight(Number(firstEx.weight) || 20);
    setCurrentReps(Number(firstEx.reps) || 10);
    setTargetRestSeconds(firstEx.restSeconds || 90);
    setIsResting(false);
    setRestSecondsLeft(0);
    setIsPaused(false);
    setCompletedSets([]);
    setIsActive(true);

    // Audio en segundo plano y bloqueo de pantalla activo
    startBackgroundAudio();
    requestScreenWakeLock();
    triggerHaptic([60, 40, 60]);
    playChime('set_done');

    // Solicitar permiso de notificaciones en Android explícitamente si aún no se solicitó
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().then((perm) => {
          if (perm === 'granted') {
            syncMediaSession();
          }
        }).catch(() => {});
      } else if (Notification.permission === 'granted') {
        syncMediaSession();
      }
    }
  }, [syncMediaSession]);

  /**
   * Detener / Cancelar sesión
   */
  const stopWorkout = useCallback(() => {
    setIsActive(false);
    setIsResting(false);
    stopBackgroundAudio();
    releaseScreenWakeLock();
    closeNativeNotification();

    if (typeof window !== 'undefined' && 'mediaSession' in navigator) {
      navigator.mediaSession.playbackState = 'none';
    }
  }, []);

  /**
   * Saltar descanso anticipadamente
   */
  const skipRest = useCallback(() => {
    setIsResting(false);
    setRestSecondsLeft(0);
    triggerHaptic([40]);
  }, []);

  // Registrar Service Worker al montar y escuchar acciones de notificaciones
  useEffect(() => {
    registerWorkoutServiceWorker();

    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const handleSwMessage = (event) => {
        if (event.data?.type === 'MYPOWERUP_WORKOUT_ACTION') {
          const action = event.data.action;
          if (action === 'next_set') {
            completeCurrentSet();
          } else if (action === 'cycle_reps') {
            cycleReps();
          } else if (action === 'add_weight') {
            adjustWeight(2.5);
          }
        }
      };

      navigator.serviceWorker.addEventListener('message', handleSwMessage);
      return () => {
        try {
          navigator.serviceWorker.removeEventListener('message', handleSwMessage);
        } catch (_) {}
      };
    }
  }, [completeCurrentSet, cycleReps, adjustWeight]);

  // Temporizador de descanso (segundo a segundo)
  useEffect(() => {
    if (!isActive || !isResting || isPaused) return;

    const interval = setInterval(() => {
      setRestSecondsLeft((prev) => {
        if (prev <= 1) {
          setIsResting(false);
          triggerHaptic([150, 80, 150]);
          playChime('rest_end');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, isResting, isPaused]);

  // Sincronizar MediaSession y Notificación nativa cada vez que cambia el estado relevante
  useEffect(() => {
    syncMediaSession();
  }, [
    isActive,
    currentExerciseIndex,
    currentSetIndex,
    totalSets,
    currentWeight,
    currentReps,
    isResting,
    restSecondsLeft,
    isPaused,
    syncMediaSession
  ]);

  // Registrar handlers de MediaSession una sola vez mientras esté activo
  useEffect(() => {
    if (typeof window === 'undefined' || !('mediaSession' in navigator)) return;

    if (!isActive) {
      navigator.mediaSession.playbackState = 'none';
      return;
    }

    try {
      navigator.mediaSession.setActionHandler('nexttrack', () => {
        completeCurrentSet();
      });

      navigator.mediaSession.setActionHandler('previoustrack', () => {
        cycleReps();
      });

      navigator.mediaSession.setActionHandler('seekforward', () => {
        adjustWeight(2.5);
      });

      navigator.mediaSession.setActionHandler('seekbackward', () => {
        adjustWeight(-2.5);
      });

      navigator.mediaSession.setActionHandler('play', () => {
        setIsPaused(false);
      });

      navigator.mediaSession.setActionHandler('pause', () => {
        setIsPaused(true);
      });
    } catch (err) {
      console.warn('Error registrando MediaSession handlers:', err);
    }

    return () => {
      try {
        navigator.mediaSession.setActionHandler('nexttrack', null);
        navigator.mediaSession.setActionHandler('previoustrack', null);
        navigator.mediaSession.setActionHandler('seekforward', null);
        navigator.mediaSession.setActionHandler('seekbackward', null);
        navigator.mediaSession.setActionHandler('play', null);
        navigator.mediaSession.setActionHandler('pause', null);
      } catch (_) {}
    };
  }, [isActive, completeCurrentSet, cycleReps, adjustWeight]);

  return (
    <ActiveWorkoutContext.Provider
      value={{
        isActive,
        workoutQueue,
        currentExerciseIndex,
        currentExercise,
        currentSetIndex,
        totalSets,
        currentWeight,
        currentReps,
        isResting,
        restSecondsLeft,
        isPaused,
        completedSets,
        isHudExpanded,
        setIsHudExpanded,
        startWorkout,
        stopWorkout,
        completeCurrentSet,
        cycleReps,
        adjustWeight,
        adjustReps,
        addTotalSet,
        removeTotalSet,
        skipToNextExercise,
        goToPreviousExercise,
        skipRest,
        setCurrentWeight,
        setCurrentReps
      }}
    >
      {children}
    </ActiveWorkoutContext.Provider>
  );
}
