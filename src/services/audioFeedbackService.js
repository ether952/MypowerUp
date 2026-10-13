/**
 * Servicio de Audio en Segundo Plano, Síntesis de Sonido y Feedback Háptico para MyPowerUp
 * Permite mantener activa la sesión multimedia en la pantalla de bloqueo (iOS y Android)
 * y brindar respuestas sonoras y de vibración sin dependencias externas.
 */

// Audio WAV de 1 segundo de silencio absoluto (PCM 8-bit mono)
const SILENT_WAV_BASE64 =
  'data:audio/wav;base64,UklGRjIAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YRAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==';

let bgAudioInstance = null;
let screenWakeLock = null;

/**
 * Inicia el audio silencioso en segundo plano.
 * Crítico para que iOS Safari y Android Chrome reconozcan el reproductor en la pantalla de bloqueo.
 */
export function startBackgroundAudio() {
  try {
    if (!bgAudioInstance) {
      bgAudioInstance = new Audio(SILENT_WAV_BASE64);
      bgAudioInstance.loop = true;
      bgAudioInstance.volume = 0.05; // Mínimo para que el SO no lo silencie como inactivo
    }
    const playPromise = bgAudioInstance.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn('Auto-play en segundo plano restringido hasta interacción de usuario:', err);
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
      // Doble campana energética de serie completada (estilo Apple/Nike)
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
      // 3 pitidos de alerta: ¡Tu descanso terminó, a levantar!
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
