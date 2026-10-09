import React, { useState } from 'react';
import {
  Zap,
  Dumbbell,
  Sparkles,
  Flame,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Smartphone,
  Activity,
  Award,
  Layers,
  LogOut
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import Footer from './Footer';
import powerUpLogoImg from '../assets/logo-mypowerup.png';

// Datos de ejemplo realistas para la semana completa
const SAMPLE_WEEK_NUTRITION = [
  { day: 'Lun', calories: 2360, protein: 155, mealsCount: 4, highlight: 'Pechuga con arroz, batido whey, avena' },
  { day: 'Mar', calories: 2420, protein: 162, mealsCount: 4, highlight: 'Milanesa con puré, huevos, yogur griego' },
  { day: 'Mié', calories: 2390, protein: 150, mealsCount: 5, highlight: 'Budín de café, carne magra, tostadas' },
  { day: 'Jue', calories: 2480, protein: 168, mealsCount: 4, highlight: 'Wok de pollo y arroz, queso, proteína' },
  { day: 'Vie', calories: 2310, protein: 148, mealsCount: 4, highlight: 'Atún con fideos, claras, frutos secos' },
  { day: 'Sáb', calories: 2540, protein: 158, mealsCount: 5, highlight: 'Hamburguesa casera, batido, frutas' },
  { day: 'Dom', calories: 2400, protein: 154, mealsCount: 4, highlight: 'Asado magro, ensalada, café con leche' },
];

export default function LandingView({ onOpenLogin, onOpenRegister, user, onGoToApp, onLogout }) {
  const [activeNutritionMetric, setActiveNutritionMetric] = useState('calories'); // 'calories' | 'protein'

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Tooltip limpio para el gráfico de ejemplo
  const CustomNutritionTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-zinc-900 text-white px-3.5 py-2.5 rounded-xl border border-zinc-700 shadow-2xl font-mono text-xs space-y-1">
          <div className="flex items-center justify-between gap-4 font-bold border-b border-zinc-800 pb-1">
            <span>Día: {item.day}</span>
            <span className="text-emerald-400 font-sans text-[10px]">{item.mealsCount} comidas</span>
          </div>
          <div className="space-y-0.5 pt-1">
            <p className="text-emerald-400 font-bold">
              Calorías: <span className="text-white">{item.calories.toLocaleString()} kcal</span>
            </p>
            <p className="text-cyan-400 font-bold">
              Proteína: <span className="text-white">{item.protein} g</span>
            </p>
          </div>
          <p className="text-[10px] text-zinc-400 font-sans pt-1 italic max-w-[200px]">
            {item.highlight}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen w-full bg-white text-zinc-900 flex flex-col font-sans select-none overflow-x-hidden">

      {/* ========================================================================= */}
      {/* 1. NAVBAR SUPERIOR                                                        */}
      {/* ========================================================================= */}
      <header className="w-full border-b border-zinc-200 bg-white/90 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-8 py-3.5 flex items-center justify-between">

        {/* Logo */}
        <div className="flex items-center gap-2.5 cursor-pointer select-none group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <img
            src={powerUpLogoImg}
            alt="MyPowerUp Logo"
            className="h-9 sm:h-10 w-auto object-contain shrink-0 group-hover:scale-105 transition-transform duration-200"
          />
          <span className="text-xl sm:text-2xl font-black font-display tracking-tight text-zinc-900 uppercase">
            MYPOWER<span className="text-emerald-500">UP</span>
          </span>
        </div>
        {/* Botones de Auth o Acceso a App si está logueado */}
        <div className="flex items-center gap-2 sm:gap-3 font-mono text-xs">
          {user ? (
            <>
              <button
                type="button"
                onClick={onGoToApp}
                className="px-3.5 py-2 text-zinc-800 hover:text-emerald-500 font-bold uppercase transition-colors cursor-pointer flex items-center gap-1.5 group"
              >
                <span>Mi perfil</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
              </button>
              <button
                type="button"
                onClick={onLogout}
                className="px-3.5 py-2 text-zinc-600 hover:text-red-600 font-bold uppercase transition-colors cursor-pointer flex items-center gap-1.5 group"
                title="Cerrar Sesión"
              >
                <LogOut className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
                <span className="hidden sm:inline">Cerrar Sesión</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onOpenLogin}
                className="px-3.5 py-2 text-zinc-700 hover:text-black font-bold uppercase transition-colors cursor-pointer"
              >
                Iniciar Sesión
              </button>
              <button
                type="button"
                onClick={onOpenRegister}
                className="px-4 py-2 bg-black hover:bg-zinc-800 text-white font-bold uppercase rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>Crear Cuenta</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. HERO SECTION (TÍTULO Y LLAMADO A LA ACCIÓN)                            */}
      {/* ========================================================================= */}
      <section className="relative w-full pt-12 pb-16 sm:pt-16 sm:pb-24 px-4 sm:px-8 overflow-hidden bg-white">

        {/* Glow decorativo suave */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-emerald-50/60 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-6xl mx-auto space-y-8 text-center">

          {/* Encabezado con Logo centrado grande ENCIMA del título */}
          <div className="space-y-6 max-w-4xl mx-auto flex flex-col items-center">
            
            {/* Logo en grande arriba del título */}
            <div className="flex items-center justify-center pt-2 pb-1">
              <img
                src={powerUpLogoImg}
                alt="MyPowerUp Logo"
                className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 object-contain select-none transition-transform duration-500 hover:scale-105 drop-shadow-md"
              />
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold uppercase tracking-tight text-zinc-900 font-display leading-[1.08] text-center">
              DOMINA TUS CARGAS. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-950 via-zinc-800 to-zinc-600">
                TRANSFORMA TU FÍSICO.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-zinc-600 font-sans max-w-3xl mx-auto leading-relaxed text-center">
              Mypowerup centraliza tus entrenamientos de gimnasio, estima calorías y proteínas con IA en segundos y analiza tu evolución con gráficos semanales automáticos.
            </p>

            {/* CTAs */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3.5 font-mono text-xs">
              {user ? (
                <>
                  <button
                    type="button"
                    onClick={onGoToApp}
                    className="w-full sm:w-auto px-6 py-4 text-zinc-900 hover:text-emerald-500 font-extrabold uppercase transition-all cursor-pointer flex items-center justify-center gap-2 text-sm tracking-wide group"
                  >
                    <span>Mi perfil</span>
                    <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </button>
                  <button
                    type="button"
                    onClick={onOpenRegister}
                    className="w-full sm:w-auto px-6 py-4 text-zinc-700 hover:text-black font-bold uppercase transition-all cursor-pointer flex items-center justify-center gap-2 text-sm tracking-wide group"
                  >
                    <span>Crear Cuenta</span>
                    <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={onOpenRegister}
                    className="w-full sm:w-auto px-8 py-4 bg-black hover:bg-zinc-800 text-white font-bold uppercase rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 text-sm tracking-wide"
                  >
                    <span>Crear Cuenta</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={onOpenLogin}
                    className="w-full sm:w-auto px-6 py-4 text-zinc-700 hover:text-black font-bold uppercase transition-all cursor-pointer flex items-center justify-center gap-1 text-sm tracking-wide hover:underline"
                  >
                    Ya tengo cuenta
                  </button>
                </>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2.1 SECCIÓN GRÁFICO NUTRICIONAL CON FONDO VERDE EMERALD                   */}
      {/* ========================================================================= */}
      <section id="nutrition-demo" className="w-full py-16 sm:py-24 px-4 sm:px-8 bg-emerald-500 text-black relative overflow-hidden">

        {/* Glows y reflejos decorativos */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-400/40 rounded-full blur-3xl pointer-events-none -z-0" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-600/40 rounded-full blur-3xl pointer-events-none -z-0" />

        <div className="max-w-5xl mx-auto text-left space-y-8 relative z-10">

          {/* Barra de Título y Selector de Métrica */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-black/15 pb-5">
            <div className="space-y-1.5">
              <span className="text-xs font-mono font-black text-black/80 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-black" />
                EJEMPLO REAL: EVOLUCIÓN NUTRICIONAL
              </span>
              <h3 className="text-2xl sm:text-4xl font-black text-black uppercase tracking-tight font-display">
                Semana Completa de Alimentación
              </h3>
            </div>

            {/* Botones de cambio de métrica */}
            <div className="flex items-center gap-2 font-mono text-xs">
              <button
                type="button"
                onClick={() => setActiveNutritionMetric('calories')}
                className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer ${activeNutritionMetric === 'calories'
                  ? 'bg-black text-white shadow-md'
                  : 'bg-black/10 text-black hover:bg-black/20'
                  }`}
              >
                Calorías (Kcal)
              </button>
              <button
                type="button"
                onClick={() => setActiveNutritionMetric('protein')}
                className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer ${activeNutritionMetric === 'protein'
                  ? 'bg-black text-white shadow-md'
                  : 'bg-black/10 text-black hover:bg-black/20'
                  }`}
              >
                Proteínas (g)
              </button>
            </div>
          </div>

          {/* Fila de métricas */}
          <div className="flex flex-wrap items-baseline justify-between gap-6 font-mono text-sm py-2">
            <div>
              <span className="text-[11px] text-black/70 uppercase tracking-wider block font-bold">Promedio Calorías</span>
              <span className="text-2xl sm:text-4xl font-black text-black font-display">
                2.414 <span className="text-xs text-black/70 font-normal font-mono">kcal/día</span>
              </span>
            </div>

            <div>
              <span className="text-[11px] text-black/70 uppercase tracking-wider block font-bold">Promedio Proteína</span>
              <span className="text-2xl sm:text-4xl font-black text-black font-display">
                157 <span className="text-xs text-black/70 font-normal font-mono">g/día</span>
              </span>
            </div>

            <div>
              <span className="text-[11px] text-black/70 uppercase tracking-wider block font-bold">Meta Diaria</span>
              <span className="text-2xl sm:text-4xl font-black text-black font-display">
                2.400 <span className="text-xs text-black/70 font-normal font-mono">kcal</span>
              </span>
            </div>

            <div>
              <span className="text-[11px] text-black/70 uppercase tracking-wider block font-bold">Adherencia</span>
              <span className="text-2xl sm:text-4xl font-black text-black font-display">
                100% <span className="text-xs text-black/70 font-normal font-mono">(7/7 días)</span>
              </span>
            </div>
          </div>

          {/* Gráfico Recharts Amplio y Nítido */}
          <div className="h-64 sm:h-80 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={SAMPLE_WEEK_NUTRITION} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="landingAreaCal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#000000" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#000000" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="landingAreaProt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#000000" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#000000" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 2" stroke="rgba(0, 0, 0, 0.12)" vertical={false} />
                <XAxis dataKey="day" stroke="#000000" fontSize={12} tickLine={false} axisLine={{ stroke: 'rgba(0, 0, 0, 0.25)' }} fontWeight="bold" />
                <YAxis stroke="#000000" fontSize={11} tickLine={false} axisLine={false} fontWeight="bold" domain={activeNutritionMetric === 'calories' ? [2000, 2700] : [120, 180]} />
                <Tooltip content={<CustomNutritionTooltip />} />

                {activeNutritionMetric === 'calories' ? (
                  <>
                    <ReferenceLine y={2400} stroke="#000000" strokeDasharray="4 4" label={{ value: 'Meta: 2.400 kcal', fill: '#000000', fontSize: 11, fontWeight: 'bold', position: 'insideTopRight' }} />
                    <Area
                      type="monotone"
                      dataKey="calories"
                      name="Calorías"
                      stroke="#000000"
                      strokeWidth={3}
                      fill="url(#landingAreaCal)"
                      dot={{ r: 4, fill: '#000000', stroke: '#FFFFFF', strokeWidth: 2 }}
                      activeDot={{ r: 6, fill: '#000000' }}
                    />
                  </>
                ) : (
                  <>
                    <ReferenceLine y={150} stroke="#000000" strokeDasharray="4 4" label={{ value: 'Meta: 150g P', fill: '#000000', fontSize: 11, fontWeight: 'bold', position: 'insideTopRight' }} />
                    <Area
                      type="monotone"
                      dataKey="protein"
                      name="Proteína"
                      stroke="#000000"
                      strokeWidth={3}
                      fill="url(#landingAreaProt)"
                      dot={{ r: 4, fill: '#000000', stroke: '#FFFFFF', strokeWidth: 2 }}
                      activeDot={{ r: 6, fill: '#000000' }}
                    />
                  </>
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Explicación Fluida y Concisa de la IA */}
          <div className="pt-4 border-t border-black/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-black/90">
            <p className="max-w-2xl leading-relaxed">
              <strong className="text-black font-extrabold">¿Cómo se generan estos gráficos?</strong> Tú solo escribes lo que comes en lenguaje natural (ej. <em>"1 porción de budín de café"</em> o <em>"2 milanesas con puré"</em>). La <strong>Inteligencia Artificial de Gemini</strong> calcula automáticamente las calorías y proteínas, integrándolas al instante en tus curvas de progresión.
            </p>
            <button
              type="button"
              onClick={onOpenRegister}
              className="shrink-0 px-5 py-2.5 bg-black hover:bg-zinc-800 text-white font-mono font-bold rounded-xl uppercase text-xs transition-all cursor-pointer shadow-md"
            >
              Probar en la app →
            </button>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. SECCIÓN DE FUNCIONALIDADES CLAVE (FEATURES)                            */}
      {/* ========================================================================= */}
      <section id="features" className="w-full py-16 sm:py-24 px-4 sm:px-8 border-t border-zinc-200 bg-[#FAFAFA]">
        <div className="max-w-5xl mx-auto space-y-12">

          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-widest">
              // POTENCIA SIN COMPLICACIONES
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold uppercase tracking-tight text-zinc-900 font-display">
              TODO LO QUE NECESITAS PARA PROGRESAR
            </h2>
            <p className="text-sm text-zinc-600 leading-relaxed">
              Diseñado minuciosamente para ser rápido mientras entrenas y no perder tiempo navegando menús complejos.
            </p>
          </div>

          {/* Grid de Features limpia y espaciosa */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center">
                <Dumbbell className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold font-display uppercase tracking-tight text-zinc-900">
                Selector Visual con Torre de Placas
              </h3>
              <p className="text-zinc-600 text-xs sm:text-sm leading-snug">
                Elige ejercicios con selector visual interactivo, ajusta los kilos con la barra continua y configura series con repeticiones y peso independiente.
              </p>
            </div>

            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold font-display uppercase tracking-tight text-zinc-900">
                Nutrición con Inteligencia Artificial
              </h3>
              <p className="text-zinc-600 text-xs sm:text-sm leading-snug">
                Escribe como hablas: <em>"2 porciones de budín de café"</em>, <em>"1 scoop de whey con leche"</em> o <em>"plato de pastas con tuco"</em>. La IA calcula calorías y proteínas en segundos.
              </p>
            </div>

            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center">
                <Flame className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold font-display uppercase tracking-tight text-zinc-900">
                Cardio, Pasos & Gasto Calórico
              </h3>
              <p className="text-zinc-600 text-xs sm:text-sm leading-snug">
                Registra caminatas, sesiones de cinta, running, ciclismo o elíptico. Estima el consumo calórico según tiempo, distancia e intensidad.
              </p>
            </div>

            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold font-display uppercase tracking-tight text-zinc-900">
                Historial, Gráficos & Modo Privacidad
              </h3>
              <p className="text-zinc-600 text-xs sm:text-sm leading-snug">
                Visualiza la tendencia de tu peso corporal y tonelaje en el tiempo con gráficos interactivos. Oculta tu peso con 1 clic si entrenas en público.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. CÓMO FUNCIONA EN 3 PASOS                                               */}
      {/* ========================================================================= */}
      <section id="how-it-works" className="w-full py-16 sm:py-20 px-4 sm:px-8 bg-white border-t border-zinc-200">
        <div className="max-w-5xl mx-auto space-y-10">

          <div className="text-center space-y-2 max-w-xl mx-auto">
            <span className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-widest">
              // FLUJO SENCILLO
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-zinc-900 font-display">
              EMPIEZA EN MENOS DE 1 MINUTO
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 font-mono text-xs">

            <div className="space-y-2.5">
              <span className="text-2xl font-black text-zinc-900 font-display">01.</span>
              <h4 className="text-sm font-bold text-zinc-900 uppercase">
                Crea tu cuenta gratuita
              </h4>
              <p className="text-zinc-600 font-sans leading-relaxed text-xs">
                Ingresa con tu correo o con 1 clic usando Google para tener sincronización ilimitada en la nube.
              </p>
            </div>

            <div className="space-y-2.5">
              <span className="text-2xl font-black text-zinc-900 font-display">02.</span>
              <h4 className="text-sm font-bold text-zinc-900 uppercase">
                Carga tus sesiones y comidas
              </h4>
              <p className="text-zinc-600 font-sans leading-relaxed text-xs">
                Usa el selector visual de gimnasio y el asistente IA de nutrición mientras transcurre tu día.
              </p>
            </div>

            <div className="space-y-2.5">
              <span className="text-2xl font-black text-zinc-900 font-display">03.</span>
              <h4 className="text-sm font-bold text-zinc-900 uppercase">
                Alcanza tus objetivos
              </h4>
              <p className="text-zinc-600 font-sans leading-relaxed text-xs">
                Supera tu tonelaje semanal, cumple tus metas calóricas y evalúa tu evolución corporal con datos precisos.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. BANNER CTA FINAL                                                       */}
      {/* ========================================================================= */}
      <section className="w-full py-16 sm:py-20 px-4 sm:px-8 bg-black text-white text-center relative overflow-hidden">
        <div className="max-w-3xl mx-auto space-y-6 relative z-10">
          <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest block">
            // LISTO PARA SUBIR DE NIVEL
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold uppercase tracking-tight font-display">
            COMIENZA A REGISTRAR TU PROGRESO HOY MISMO
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base font-sans max-w-xl mx-auto leading-relaxed">
            Sin suscripciones forzadas ni interfaces complejas. Solo tus datos, tus cargas y tu evolución.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 font-mono text-xs">
            <button
              type="button"
              onClick={onOpenRegister}
              className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-zinc-100 text-black font-bold uppercase rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 text-sm"
            >
              <span>Crear Cuenta Gratis</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onOpenLogin}
              className="w-full sm:w-auto px-6 py-4 bg-zinc-900 hover:bg-zinc-800 text-white font-bold uppercase border border-zinc-800 rounded-xl transition-all cursor-pointer"
            >
              Ya tengo cuenta (Entrar)
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. FOOTER                                                                 */}
      {/* ========================================================================= */}
      <Footer onOpenAuth={onOpenLogin} />

    </div>
  );
}
