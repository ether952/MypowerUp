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

let sharedAudioCtx = null;

/**
 * Obtiene o inicializa la instancia compartida de AudioContext para evitar límites de instancias
 */
export function getSharedAudioContext() {
  try {
    if (typeof window === 'undefined') return null;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    if (!sharedAudioCtx || sharedAudioCtx.state === 'closed') {
      sharedAudioCtx = new AudioCtx();
    }
    if (sharedAudioCtx.state === 'suspended') {
      sharedAudioCtx.resume().catch(() => {});
    }
    return sharedAudioCtx;
  } catch (err) {
    return null;
  }
}

/**
 * Sonido satisfactorio de "check" más grave, cálido y con cuerpo (estilo gimnasio/tecnología moderna)
 * Diseñado con una base más grave (C4 - E4 - G4) y un "thock" táctil de 85Hz que combina
 * perfectamente con la estética oscura y deportiva de MyPowerUp.
 */
export function playSatisfyingCheckSound() {
  try {
    const ctx = getSharedAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // 1. Golpe de cuerpo táctil y grave ("thock" mecánico / peso encajado)
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(240, now);
    subOsc.frequency.exponentialRampToValueAtTime(75, now + 0.045);
    subGain.gain.setValueAtTime(0.2, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    subOsc.connect(subGain);
    subGain.connect(ctx.destination);
    subOsc.start(now);
    subOsc.stop(now + 0.055);

    // 2. Primera nota cálida y con cuerpo (Do4 / C4: 261.63 Hz subiendo a Mi4 / E4: 329.63 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(261.63, now + 0.012);
    osc1.frequency.exponentialRampToValueAtTime(329.63, now + 0.055);
    gain1.gain.setValueAtTime(0.001, now + 0.012);
    gain1.gain.linearRampToValueAtTime(0.24, now + 0.03);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.38);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now + 0.012);
    osc1.stop(now + 0.4);

    // 3. Segunda nota de confirmación y plenitud (Sol4 / G4: 392.00 Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    const t2 = now + 0.04;
    osc2.frequency.setValueAtTime(392.00, t2);
    gain2.gain.setValueAtTime(0.001, t2);
    gain2.gain.linearRampToValueAtTime(0.22, t2 + 0.025);
    gain2.gain.exponentialRampToValueAtTime(0.0001, t2 + 0.44);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(t2);
    osc2.stop(t2 + 0.46);

    // 4. Resonancia suave aterciopelada (Do5 / C5: 523.25 Hz, tipo piano eléctrico/tecnológico)
    const osc3 = ctx.createOscillator();
    const gain3 = ctx.createGain();
    osc3.type = 'triangle';
    const t3 = now + 0.07;
    osc3.frequency.setValueAtTime(523.25, t3);
    gain3.gain.setValueAtTime(0.001, t3);
    gain3.gain.linearRampToValueAtTime(0.12, t3 + 0.02);
    gain3.gain.exponentialRampToValueAtTime(0.0001, t3 + 0.35);
    osc3.connect(gain3);
    gain3.connect(ctx.destination);
    osc3.start(t3);
    osc3.stop(t3 + 0.38);

    // Feedback háptico en smartphones
    triggerHaptic([35, 20, 50]);
  } catch (err) {
    console.warn('Error reproduciendo sonido de check:', err);
  }
}

/**
 * Sintetizador Web Audio API para notificaciones sonoras sin archivos externos
 */
export function playChime(type = 'set_done') {
  if (type === 'check_success' || type === 'registration_success') {
    playSatisfyingCheckSound();
    return;
  }
  try {
    const ctx = getSharedAudioContext();
    if (!ctx) return;

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
