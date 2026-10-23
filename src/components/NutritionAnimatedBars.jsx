import React, { useState, useEffect } from 'react';
import { Dumbbell, Flame, Sparkles } from 'lucide-react';
import ButtonSparkles from './ButtonSparkles';

/**
 * Barras animadas secuenciales de Nutrición:
 * 1. Primero carga la barra de Proteínas con animación suave y conteo numérico.
 * 2. Al completar, brotan estrellitas verdes festejando.
 * 3. Inmediatamente después carga la barra de Calorías abajo con animación suave y conteo.
 * 4. Al completar, brotan estrellitas verdes festejando.
 */
export default function NutritionAnimatedBars({
  calories = 0,
  targetCalories = 2400,
  protein = 0,
  targetProtein = 150
}) {
  const [displayedProtein, setDisplayedProtein] = useState(0);
  const [displayedCalories, setDisplayedCalories] = useState(0);

  const [proteinBarWidth, setProteinBarWidth] = useState(0);
  const [caloriesBarWidth, setCaloriesBarWidth] = useState(0);

  const [sparkleProtein, setSparkleProtein] = useState(false);
  const [sparkleCalories, setSparkleCalories] = useState(false);

  useEffect(() => {
    // Reset para re-animar si cambian los valores
    setProteinBarWidth(0);
    setCaloriesBarWidth(0);
    setDisplayedProtein(0);
    setDisplayedCalories(0);

    const safeTargetProtein = targetProtein > 0 ? targetProtein : 150;
    const safeTargetCalories = targetCalories > 0 ? targetCalories : 2400;

    const finalProteinPercent = Math.min(100, Math.round((protein / safeTargetProtein) * 100));
    const finalCaloriesPercent = Math.min(100, Math.round((calories / safeTargetCalories) * 100));

    // PASO 1: Iniciar barra de Proteínas primero
    const timerStart = setTimeout(() => {
      setProteinBarWidth(finalProteinPercent);

      const durationP = 750;
      const startP = performance.now();

      const stepP = (now) => {
        const elapsed = now - startP;
        const progress = Math.min(1, elapsed / durationP);
        // Curva suave ease-out
        const ease = 1 - Math.pow(1 - progress, 3);
        setDisplayedProtein(Math.round(protein * ease * 10) / 10);

        if (progress < 1) {
          requestAnimationFrame(stepP);
        } else {
          setDisplayedProtein(protein);
          // Estrellitas al completar la barra 1
          setSparkleProtein(true);
          setTimeout(() => setSparkleProtein(false), 1200);

          // PASO 2: Cargar la barra 2 (Calorías) inmediatamente después
          setTimeout(() => {
            setCaloriesBarWidth(finalCaloriesPercent);

            const durationC = 850;
            const startC = performance.now();

            const stepC = (nowC) => {
              const elapsedC = nowC - startC;
              const progressC = Math.min(1, elapsedC / durationC);
              const easeC = 1 - Math.pow(1 - progressC, 3);
              setDisplayedCalories(Math.round(calories * easeC));

              if (progressC < 1) {
                requestAnimationFrame(stepC);
              } else {
                setDisplayedCalories(calories);
                // Estrellitas al completar la barra 2
                setSparkleCalories(true);
                setTimeout(() => setSparkleCalories(false), 1200);
              }
            };

            requestAnimationFrame(stepC);
          }, 180);
        }
      };

      requestAnimationFrame(stepP);
    }, 150);

    return () => clearTimeout(timerStart);
  }, [calories, protein, targetCalories, targetProtein]);

  const safeTargetProtein = targetProtein > 0 ? targetProtein : 150;
  const safeTargetCalories = targetCalories > 0 ? targetCalories : 2400;

  const proteinPercent = Math.round((protein / safeTargetProtein) * 100);
  const caloriesPercent = Math.round((calories / safeTargetCalories) * 100);

  return (
    <div className="w-full bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-lg backdrop-blur-sm space-y-4">
      {/* BARRA 1 (ARRIBA): PROTEÍNAS */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Dumbbell className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold uppercase tracking-wider text-zinc-300 text-[11px]">
              Proteínas
            </span>
          </div>

          <div className="relative overflow-visible flex items-center gap-1.5 font-mono">
            <ButtonSparkles active={sparkleProtein} count={20} />
            <span className="text-sm sm:text-base font-black text-emerald-400">
              {displayedProtein}g
            </span>
            <span className="text-[11px] text-zinc-400 font-semibold">
              / {safeTargetProtein}g ({proteinPercent}%)
            </span>
          </div>
        </div>

        {/* Pista de la barra */}
        <div className="relative w-full h-3 rounded-full bg-zinc-950 border border-zinc-800/80 overflow-hidden shadow-inner">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-300 shadow-[0_0_12px_rgba(16,185,129,0.5)] transition-all duration-700 ease-out"
            style={{ width: `${proteinBarWidth}%` }}
          />
        </div>
      </div>

      {/* BARRA 2 (ABAJO): CALORÍAS */}
      <div className="space-y-2 pt-1 border-t border-zinc-800/60">
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Flame className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <span className="font-bold uppercase tracking-wider text-zinc-300 text-[11px]">
              Calorías
            </span>
          </div>

          <div className="relative overflow-visible flex items-center gap-1.5 font-mono">
            <ButtonSparkles active={sparkleCalories} count={22} />
            <span className="text-sm sm:text-base font-black text-emerald-400">
              {displayedCalories.toLocaleString()}
            </span>
            <span className="text-[11px] text-zinc-400 font-semibold">
              / {safeTargetCalories.toLocaleString()} kcal ({caloriesPercent}%)
            </span>
          </div>
        </div>

        {/* Pista de la barra */}
        <div className="relative w-full h-3 rounded-full bg-zinc-950 border border-zinc-800/80 overflow-hidden shadow-inner">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-400 shadow-[0_0_14px_rgba(16,185,129,0.5)] transition-all duration-700 ease-out"
            style={{ width: `${caloriesBarWidth}%` }}
          />
        </div>
      </div>
    </div>
  );
}
