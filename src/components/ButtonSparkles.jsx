import React, { useEffect, useState } from 'react';

/**
 * Componente de estrellitas verdes que brotan directamente del botón de Registrar.
 * Al activarse, genera una ráfaga de estrellas y destellos con animación suave hacia afuera y arriba.
 */
export default function ButtonSparkles({ active, count = 24 }) {
  const [particles, setParticles] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!active) return;

    const greenShades = [
      '#10B981', // Emerald 500
      '#34D399', // Emerald 400
      '#00F59B', // Electric Neon Green
      '#22C55E', // Vibrant Green
      '#6EE7B7', // Mint 300
      '#A7F3D0', // Pale Mint
      '#FFFFFF', // White star center
    ];

    const newParticles = [];

    for (let i = 0; i < count; i++) {
      // Ángulo de dispersión: ráfaga omnidireccional con preferencia hacia arriba
      const angle = (i / count) * 2 * Math.PI + (Math.random() - 0.5) * 0.35;
      
      // Distancia de explosión (40px a 110px desde el botón)
      const distance = 45 + Math.random() * 65;
      const tx = Math.cos(angle) * distance;
      // Tendencia vertical (flotan hacia arriba)
      const ty = Math.sin(angle) * (distance * 0.85);
      const drift = -(25 + Math.random() * 40);

      // Tamaño de la estrellita (de 10px a 22px)
      const size = 11 + Math.random() * 12;
      const scale = 1 + Math.random() * 0.6;

      // Rotación
      const rotMid = (Math.random() - 0.5) * 120;
      const rotEnd = (Math.random() - 0.5) * 360;

      // Duración suave y ligera variación de delay
      const delay = Math.random() * 120;
      const duration = 800 + Math.random() * 350;

      // Variedad de forma: estrella de 4 puntas, estrella de 5 puntas y estrella diamante
      const typeRand = Math.random();
      const shape = typeRand > 0.6 ? 'star5' : typeRand > 0.25 ? 'star4' : 'star8';

      const color = greenShades[Math.floor(Math.random() * greenShades.length)];

      newParticles.push({
        id: `${Date.now()}_${i}_${Math.random()}`,
        tx: `${tx.toFixed(1)}px`,
        ty: `${ty.toFixed(1)}px`,
        drift: `${drift.toFixed(1)}px`,
        size: `${size.toFixed(1)}px`,
        scale,
        rotMid: `${rotMid.toFixed(1)}deg`,
        rotEnd: `${rotEnd.toFixed(1)}deg`,
        delay: `${delay.toFixed(0)}ms`,
        duration: `${duration.toFixed(0)}ms`,
        color,
        shape,
      });
    }

    setParticles(newParticles);
    setIsAnimating(true);

    const timer = setTimeout(() => {
      setIsAnimating(false);
      setParticles([]);
    }, 1250);

    return () => clearTimeout(timer);
  }, [active, count]);

  if (!isAnimating || particles.length === 0) return null;

  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-visible flex items-center justify-center z-40"
      aria-hidden="true"
    >
      {/* Resplandor verde suave en el botón */}
      <span className="absolute -inset-1 rounded-xl bg-emerald-500/25 blur-sm animate-pulse pointer-events-none" />
      
      {/* Anillo de onda expansiva verde en los bordes del botón */}
      <span className="absolute -inset-1 rounded-xl border border-emerald-400 animate-ring-pulse pointer-events-none opacity-80" />

      {/* Partículas de Estrellitas Verdes */}
      {particles.map((p) => (
        <span
          key={p.id}
          className="sparkle-particle"
          style={{
            '--tx': p.tx,
            '--ty': p.ty,
            '--drift': p.drift,
            '--scale': p.scale,
            '--rot-mid': p.rotMid,
            '--rot-end': p.rotEnd,
            color: p.color,
            width: p.size,
            height: p.size,
            animationDelay: p.delay,
            animationDuration: p.duration,
          }}
        >
          {p.shape === 'star5' ? (
            /* Estrella clásica de 5 puntas ★ */
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
              <polygon points="12,1 15.2,8.5 23.3,9.2 17.2,14.6 19,22.6 12,18.4 5,22.6 6.8,14.6 0.7,9.2 8.8,8.5" />
            </svg>
          ) : p.shape === 'star4' ? (
            /* Estrella de destello de 4 puntas ✦ */
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
              <path d="M12 0C12 6.5 6.5 12 0 12C6.5 12 12 17.5 12 24C12 17.5 17.5 12 24 12C17.5 12 12 6.5 12 0Z" />
            </svg>
          ) : (
            /* Estrella diamante de 8 puntas ✧ */
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
              <polygon points="12,0 14.5,8 22.5,9.5 16.5,14.5 18,22.5 12,18 6,22.5 7.5,14.5 1.5,9.5 9.5,8" />
            </svg>
          )}
        </span>
      ))}
    </div>
  );
}
