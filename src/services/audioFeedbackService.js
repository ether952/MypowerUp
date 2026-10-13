/**
 * Servicio de Audio en Segundo Plano, Síntesis de Sonido, Feedback Háptico y Notificaciones Nativas para MyPowerUp
 * Permite mantener activa la sesión multimedia en la pantalla de bloqueo (iOS y Android)
 * y emitir notificaciones nativas con botones interactivos.
 */

let bgAudioInstance = null;
let screenWakeLock = null;

/**
 * Inicia el audio en segundo plano con una pista real de 10s en bucle (/workout-silence.wav)
 * Necesario para que iOS Safari y Android Chrome activen y mantengan el reproductor en la pantalla de bloqueo.
 */
export function startBackgroundAudio() {
  try {
    if (!bgAudioInstance) {
      const audioUrl = typeof window !== 'undefined'
        ? new URL('/workout-silence.wav', window.location.href).href
        : '/workout-silence.wav';
      bgAudioInstance = new Audio(audioUrl);
      bgAudioInstance.loop = true;
      bgAudioInstance.volume = 0.1;
    }
    const playPromise = bgAudioInstance.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn('Auto-play restringido hasta interacción táctil del usuario:', err);
      });
    }
  } catch (err) {
    console.warn('Error al iniciar audio en segundo plano:', err);
  }
}

/**
 * Detiene el audio silencioso.
 */
export function stopBackgroundAudio() {
  try {
    if (bgAudioInstance) {
      bgAudioInstance.pause();
      bgAudioInstance.currentTime = 0;
    }
  } catch (err) {
    console.warn('Error al detener audio:', err);
  }
}

/**
 * Sintetizador Web Audio API para notificaciones sonoras sin archivos externos
 */
export function playChime(type = 'set_done') {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (type === 'set_done') {
      // Doble campana energética de serie completada
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now); // Re5
      osc1.frequency.setValueAtTime(880, now + 0.08); // La5
      gain1.gain.setValueAtTime(0.2, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.35);
    } else if (type === 'rest_end') {
      // 3 pitidos de alerta: descanso finalizado
      const now = ctx.currentTime;
      [0, 0.12, 0.24].forEach((delay, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(idx === 2 ? 1318.51 : 1046.5, now + delay);
        gain.gain.setValueAtTime(0.25, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.09);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + delay);
        osc.stop(now + delay + 0.09);
      });
    } else if (type === 'workout_complete') {
      // Acorde triunfal de fin de rutina
      const now = ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0.2, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.5);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.5);
      });
    }
  } catch (err) {
    console.warn('No se pudo reproducir tono:', err);
  }
}

/**
 * Respuesta táctil / vibración háptica del dispositivo
 */
export function triggerHaptic(pattern = [80]) {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  } catch (_) {}
}

/**
 * Mantiene la pantalla encendida mientras dura el entrenamiento si el usuario la deja en soporte
 */
export async function requestScreenWakeLock() {
  try {
    if (typeof navigator !== 'undefined' && 'wakeLock' in navigator) {
      screenWakeLock = await navigator.wakeLock.request('screen');
    }
  } catch (_) {}
}

export function releaseScreenWakeLock() {
  try {
    if (screenWakeLock) {
      screenWakeLock.release();
      screenWakeLock = null;
    }
  } catch (_) {}
}

/**
 * Registra el Service Worker de MyPowerUp para soportar notificaciones nativas en segundo plano y lockscreen
 */
export async function registerWorkoutServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker MyPowerUp registrado:', reg);
      return reg;
    } catch (e) {
      console.warn('Error registrando Service Worker:', e);
    }
  }
  return null;
}

/**
 * Emite o actualiza una notificación nativa interactiva en Android (Barra de estado & Pantalla de bloqueo)
 */
export async function showOrUpdateNativeNotification({
  exerciseName = 'Ejercicio',
  currentSet = 1,
  totalSets = 4,
  reps = 10,
  weight = 20,
  isResting = false,
  restSeconds = 0,
  gifUrl = null
}) {
  if (typeof window === 'undefined') return;
  if (!('Notification' in window) || Notification.permission !== 'granted') return;

  const title = isResting
    ? `⏱ Descanso: ${restSeconds}s • ${exerciseName}`
    : `🏋️ ${exerciseName} (Serie ${currentSet}/${totalSets})`;

  const body = isResting
    ? `Siguiente: ${reps} reps × ${weight} kg • Toca para saltar`
    : `${reps} Reps × ${weight} kg  [✔ = Serie Lista]`;

  const iconUrl = gifUrl || (window.location.origin + '/logo-mypowerup.png');

  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready;
      if (reg && reg.showNotification) {
        await reg.showNotification(title, {
          body,
          icon: iconUrl,
          badge: window.location.origin + '/logo-mypowerup.png',
          tag: 'mypowerup-active-workout',
          renotify: false,
          silent: true,
          requireInteraction: true,
          actions: [
            { action: 'next_set', title: '✔ Serie Lista' },
            { action: 'cycle_reps', title: '🔄 + Reps' },
            { action: 'add_weight', title: '⚖ +2.5kg' }
          ]
        });
      }
    }
  } catch (err) {
    console.warn('Error mostrando notificación nativa:', err);
  }
}

/**
 * Cierra la notificación activa al finalizar la sesión de entrenamiento
 */
export async function closeNativeNotification() {
  try {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready;
      if (reg && reg.getNotifications) {
        const notifs = await reg.getNotifications({ tag: 'mypowerup-active-workout' });
        notifs.forEach((n) => n.close());
      }
    }
  } catch (_) {}
}
