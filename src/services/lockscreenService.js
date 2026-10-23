import { registerPlugin } from '@capacitor/core';

let LockscreenManager = null;
try {
  LockscreenManager = registerPlugin('LockscreenManager');
} catch (e) {
  console.warn('LockscreenManager no disponible:', e);
}

/**
 * Actualiza la notificación nativa interactiva en la pantalla de bloqueo de Android
 */
export async function updateNativeWorkoutNotification({
  exerciseName = 'Ejercicio',
  currentSet = 1,
  totalSets = 4,
  weight = 20,
  reps = 10,
  isResting = false,
  restSeconds = 0,
  imageUrl = null
}) {
  if (LockscreenManager && typeof LockscreenManager.updateNotification === 'function') {
    try {
      await LockscreenManager.updateNotification({
        exerciseName,
        currentSet,
        totalSets,
        weight: Number(weight) || 0,
        reps: Number(reps) || 0,
        isResting: Boolean(isResting),
        restSeconds: Number(restSeconds) || 0,
        imageUrl: imageUrl || ''
      });
    } catch (e) {
      console.warn('Error actualizando notificación nativa:', e);
    }
  }
}

/**
 * Cancela y oculta la notificación de la pantalla de bloqueo al terminar el entrenamiento
 */
export async function cancelNativeWorkoutNotification() {
  if (LockscreenManager && typeof LockscreenManager.cancelNotification === 'function') {
    try {
      await LockscreenManager.cancelNotification();
    } catch (e) {
      console.warn('Error cancelando notificación nativa:', e);
    }
  }
}

/**
 * Escucha las acciones ejecutadas por el usuario directamente desde los botones de la notificación
 * ("next_set", "add_weight", "sub_weight", "skip_rest", "stop_workout", etc.)
 */
export function subscribeToWorkoutActions(callback) {
  const handleCustomEvent = (event) => {
    if (event?.detail?.action) {
      callback(event.detail.action);
    }
  };

  window.addEventListener('workoutNativeAction', handleCustomEvent);

  let pluginListener = null;
  if (LockscreenManager && typeof LockscreenManager.addListener === 'function') {
    try {
      pluginListener = LockscreenManager.addListener('workoutAction', (data) => {
        if (data?.action) {
          callback(data.action);
        }
      });
    } catch (_) {}
  }

  return () => {
    window.removeEventListener('workoutNativeAction', handleCustomEvent);
    if (pluginListener && typeof pluginListener.remove === 'function') {
      pluginListener.remove();
    }
  };
}

/**
 * Configura la app para mostrarse sobre la pantalla de bloqueo sin requerir patrón/PIN
 */
export async function setLockscreenVisibility(enable = true) {
  if (LockscreenManager && typeof LockscreenManager.setLockscreenVisibility === 'function') {
    try {
      await LockscreenManager.setLockscreenVisibility({ enable: Boolean(enable) });
    } catch (e) {
      console.warn('Error configurando visibilidad de pantalla de bloqueo:', e);
    }
  }
}

/**
 * Emite una vibración física potente al terminar el tiempo de descanso
 */
export async function triggerNativeVibrate(pattern = [350, 150, 350, 150, 500]) {
  // 1. Intentar con vibrador nativo Android vía plugin Capacitor
  if (LockscreenManager && typeof LockscreenManager.vibrateAlert === 'function') {
    try {
      await LockscreenManager.vibrateAlert({ pattern });
      return;
    } catch (_) {}
  }

  // 2. Fallback a Web Vibration API si está disponible en navegador / WebView
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch (_) {}
  }
}

/**
 * Activa el modo flotante Picture-in-Picture en Android si es compatible
 */
export async function enterPictureInPicture() {
  if (LockscreenManager && typeof LockscreenManager.enterPip === 'function') {
    try {
      await LockscreenManager.enterPip();
    } catch (e) {
      console.warn('Error activando Picture-in-Picture:', e);
    }
  }
}

