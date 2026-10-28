import React from 'react';

/**
 * Banner superior estandarizado con fondo negro para todas las vistas principales de la app.
 * Garantiza medidas, tipografía, espaciado y glow ambiental 100% idénticos en todas las vistas.
 */
export default function ViewHeaderBanner({
  title,
  subtitle,
  children
}) {
  return (
    <div className="w-full bg-[#121214] border-b border-[#2E2E34] py-8 sm:py-10 px-4 sm:px-8 relative overflow-hidden">
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight font-display">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-[#8A8F98] max-w-2xl leading-relaxed font-sans">
              {subtitle}
            </p>
          )}
        </div>
        {children && (
          <div className="flex items-center gap-3 shrink-0">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
