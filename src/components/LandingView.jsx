import React, { useState } from 'react';
import {
  Zap,
  Dumbbell,
  Sparkles,
  Flame,
  TrendingUp,
  Cloud,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Smartphone,
  ChevronRight,
  Layers,
  Activity,
  Award,
  Calendar,
  PieChart as PieIcon,
  Target
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import Footer from './Footer';

// Datos de ejemplo realistas para la semana completa
const SAMPLE_WEEK_NUTRITION = [
  { day: 'Lun 29', shortDay: 'Lun', calories: 2360, protein: 155, mealsCount: 4, highlight: 'Pechuga con arroz, batido whey, avena' },
  { day: 'Mar 30', shortDay: 'Mar', calories: 2420, protein: 162, mealsCount: 4, highlight: 'Milanesa con puré, huevos, yogur griego' },
  { day: 'Mié 01', shortDay: 'Mié', calories: 2390, protein: 150, mealsCount: 5, highlight: 'Budín de café, carne magra, tostadas' },
  { day: 'Jue 02', shortDay: 'Jue', calories: 2480, protein: 168, mealsCount: 4, highlight: 'Wok de pollo y arroz, queso, proteína' },
  { day: 'Vie 03', shortDay: 'Vie', calories: 2310, protein: 148, mealsCount: 4, highlight: 'Atún con fideos, claras, frutos secos' },
  { day: 'Sáb 04', shortDay: 'Sáb', calories: 2540, protein: 158, mealsCount: 5, highlight: 'Hamburguesa casera, batido, frutas' },
  { day: 'Dom 05', shortDay: 'Dom', calories: 2400, protein: 154, mealsCount: 4, highlight: 'Asado magro, ensalada, café con leche' },
];

export default function LandingView({ onOpenLogin, onOpenRegister }) {
  const [activeNutritionMetric, setActiveNutritionMetric] = useState('calories'); // 'calories' | 'protein'

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Tooltip personalizado para el gráfico de ejemplo
  const CustomNutritionTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-zinc-900 text-white p-3 rounded-xl border border-zinc-700 shadow-2xl font-mono text-xs space-y-1 z-50">
          <p className="font-bold text-zinc-300 border-b border-zinc-800 pb-1 flex justify-between gap-4">
            <span>{data.day}</span>
            <span className="text-[10px] text-emerald-400 font-sans">{data.mealsCount} comidas</span>
          </p>
          <div className="pt-1 space-y-0.5">
            <p className="text-amber-400 font-bold">
              Calorías: <span className="text-white">{data.calories.toLocaleString()} kcal</span>
            </p>
            <p className="text-cyan-400 font-bold">
              Proteína: <span className="text-white">{data.protein} g</span>
            </p>
          </div>
          <p className="text-[10px] text-zinc-400 font-sans pt-1 border-t border-zinc-800/80 italic max-w-[200px]">
            {data.highlight}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen w-full bg-[#FAFAFA] text-zinc-900 flex flex-col font-sans select-none overflow-x-hidden">

      {/* ========================================================================= */}
      {/* 1. NAVBAR SUPERIOR FIJO                                                   */}
      {/* ========================================================================= */}
      <header className="w-full border-b border-zinc-200 bg-white/90 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
        
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-black flex items-center justify-center text-white shadow-sm">
            <Zap className="w-4 h-4 text-white fill-white" />
          </div>
          <span className="text-xl sm:text-2xl font-black font-display tracking-tight text-zinc-900 uppercase">
            MYPOWERUP
          </span>
        </div>

        {/* Links de Navegación (Desktop) */}
        <nav className="hidden md:flex items-center gap-6 font-mono text-xs font-bold text-zinc-600">
          <button
            type="button"
            onClick={() => scrollToSection('features')}
            className="hover:text-black transition-colors cursor-pointer"
          >
            Funciones
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('how-it-works')}
            className="hover:text-black transition-colors cursor-pointer"
          >
            Cómo Funciona
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('benefits')}
            className="hover:text-black transition-colors cursor-pointer"
          >
            Ventajas
          </button>
        </nav>

        {/* Botones de Auth */}
        <div className="flex items-center gap-2.5 font-mono text-xs">
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
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. HERO SECTION                                                           */}
      {/* ========================================================================= */}
      <section className="relative w-full pt-10 pb-16 sm:pt-16 sm:pb-24 px-4 sm:px-8 overflow-hidden border-b border-zinc-200 bg-white">
        {/* Glows decorativos de fondo */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-100/50 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-cyan-100/50 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-8 relative z-10">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-800 text-xs font-mono font-bold tracking-wide shadow-xs animate-fade-in">
            <Sparkles className="w-3.5 h-3.5 text-black fill-black" />
            <span>PLATAFORMA INTEGRAL DE ENTRENAMIENTO & NUTRICIÓN CON IA</span>
          </div>

          {/* Título Principal */}
          <div className="space-y-3 max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold uppercase tracking-tight text-zinc-900 font-display leading-[1.08]">
              DOMINA TUS CARGAS. <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-950 via-zinc-800 to-zinc-600">
                TRANSFORMA TU FÍSICO.
              </span>
            </h1>
            <p className="text-base sm:text-lg text-zinc-600 font-sans max-w-2xl mx-auto leading-relaxed">
              Registra series y repeticiones con una torre interactiva de cargas, calcula macros al instante con Inteligencia Artificial y analiza tu evolución con gráficos semanales reales.
            </p>
          </div>

          {/* Botones de Acción (CTA) */}
          <div className="pt-1 flex flex-col sm:flex-row items-center justify-center gap-3.5 font-mono text-xs">
            <button
              type="button"
              onClick={onOpenRegister}
              className="w-full sm:w-auto px-8 py-4 bg-black hover:bg-zinc-800 text-white font-bold uppercase rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2 text-sm tracking-wide"
            >
              <span>Comenzar Gratis</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('nutrition-demo')}
              className="w-full sm:w-auto px-6 py-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-bold uppercase border border-zinc-200 rounded-xl transition-all cursor-pointer"
            >
              Ver Gráfico Nutricional
            </button>
          </div>

          {/* Puntos destacados de confianza */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-zinc-500 font-mono text-[11px] font-bold">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Sincronización en la Nube
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Estimador Nutricional IA
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 100% Gratuito
            </span>
          </div>

          {/* ========================================================================= */}
          {/* EJEMPLO REAL DE LA APP: GRÁFICO NUTRICIONAL DE UNA SEMANA COMPLETA       */}
          {/* ========================================================================= */}
          <div id="nutrition-demo" className="pt-6 max-w-4xl mx-auto text-left">
            <div className="bg-white border border-zinc-200 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-xl space-y-6">
              
              {/* Encabezado del Módulo Nutricional */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-100 pb-5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-extrabold text-amber-600 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      SEGUIMIENTO NUTRICIONAL EN VIVO
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-mono font-bold border border-emerald-200">
                      7 DÍAS COMPLETOS
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-zinc-900 uppercase tracking-tight font-display">
                    PROGRESIÓN SEMANAL DE CALORÍAS & PROTEÍNAS
                  </h3>
                </div>

                {/* Selector de Métrica */}
                <div className="flex items-center gap-1.5 bg-zinc-100 p-1 rounded-xl border border-zinc-200 font-mono text-xs">
                  <button
                    type="button"
                    onClick={() => setActiveNutritionMetric('calories')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer uppercase ${
                      activeNutritionMetric === 'calories'
                        ? 'bg-amber-500 text-black shadow-xs'
                        : 'text-zinc-600 hover:text-black'
                    }`}
                  >
                    Calorías (Kcal)
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveNutritionMetric('protein')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer uppercase ${
                      activeNutritionMetric === 'protein'
                        ? 'bg-cyan-500 text-white shadow-xs'
                        : 'text-zinc-600 hover:text-black'
                    }`}
                  >
                    Proteína (g)
                  </button>
                </div>
              </div>

              {/* Medidores de Resumen Semanal */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
                <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-xl space-y-0.5">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-bold">Promedio Calorías</span>
                  <span className="text-xl font-black text-amber-600 font-display">2.414 <span className="text-xs text-zinc-500 font-normal">kcal</span></span>
                </div>
                <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-xl space-y-0.5">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-bold">Promedio Proteína</span>
                  <span className="text-xl font-black text-cyan-600 font-display">157 <span className="text-xs text-zinc-500 font-normal">g</span></span>
                </div>
                <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-xl space-y-0.5">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-bold">Meta Diaria</span>
                  <span className="text-xl font-black text-zinc-900 font-display">2.400 <span className="text-xs text-zinc-500 font-normal">kcal</span></span>
                </div>
                <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-xl space-y-0.5">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-bold">Cumplimiento</span>
                  <span className="text-xl font-black text-emerald-600 font-display">100% <span className="text-xs text-zinc-500 font-normal">(7/7)</span></span>
                </div>
              </div>

              {/* Gráfico Recharts Interactivo */}
              <div className="h-64 sm:h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={SAMPLE_WEEK_NUTRITION} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="landingAreaCal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="landingAreaProt" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="2 2" stroke="#E4E4E7" vertical={false} />
                    <XAxis dataKey="shortDay" stroke="#71717A" fontSize={11} tickLine={false} />
                    <YAxis stroke="#71717A" fontSize={11} tickLine={false} domain={activeNutritionMetric === 'calories' ? [2000, 2700] : [120, 180]} />
                    <Tooltip content={<CustomNutritionTooltip />} />
                    
                    {activeNutritionMetric === 'calories' ? (
                      <>
                        <ReferenceLine y={2400} stroke="#F59E0B" strokeDasharray="3 3" label={{ value: 'Meta: 2.400 kcal', fill: '#B45309', fontSize: 10, position: 'insideTopRight' }} />
                        <Area
                          type="monotone"
                          dataKey="calories"
                          name="Calorías"
                          stroke="#F59E0B"
                          strokeWidth={2.5}
                          fill="url(#landingAreaCal)"
                          dot={{ r: 4, fill: '#F59E0B', stroke: '#FFFFFF', strokeWidth: 2 }}
                          activeDot={{ r: 6, fill: '#000000' }}
                        />
                      </>
                    ) : (
                      <>
                        <ReferenceLine y={150} stroke="#06B6D4" strokeDasharray="3 3" label={{ value: 'Meta: 150g P', fill: '#0E7490', fontSize: 10, position: 'insideTopRight' }} />
                        <Area
                          type="monotone"
                          dataKey="protein"
                          name="Proteína"
                          stroke="#06B6D4"
                          strokeWidth={2.5}
                          fill="url(#landingAreaProt)"
                          dot={{ r: 4, fill: '#06B6D4', stroke: '#FFFFFF', strokeWidth: 2 }}
                          activeDot={{ r: 6, fill: '#000000' }}
                        />
                      </>
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Explicación breve y concisa de cómo funciona en la app */}
              <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <p className="font-bold text-zinc-900 font-sans">
                    💡 ¿Cómo recopila la app estos datos?
                  </p>
                  <p className="text-zinc-600 font-sans leading-relaxed">
                    Escribes tus comidas en lenguaje natural (ej: <em>"1 porción de budín de café con leche"</em>) y la <strong>Inteligencia Artificial</strong> calcula los macronutrientes al instante, sumándolos a tu balance diario y graficando tu evolución semanal automáticamente.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onOpenRegister}
                  className="shrink-0 px-4 py-2 bg-black hover:bg-zinc-800 text-white font-mono font-bold rounded-xl uppercase text-[11px] transition-all cursor-pointer shadow-sm"
                >
                  Probar en Vivo
                </button>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. SECCIÓN DE FUNCIONALIDADES CLAVE (FEATURES)                            */}
      {/* ========================================================================= */}
      <section id="features" className="w-full py-16 sm:py-24 px-4 sm:px-8 bg-[#FAFAFA]">
        <div className="max-w-5xl mx-auto space-y-12">
          
          <div className="text-center space-y-2.5 max-w-2xl mx-auto">
            <span className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-widest">
              // POTENCIA SIN COMPLICACIONES
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold uppercase tracking-tight text-zinc-900 font-display">
              TODO LO QUE NECESITAS PARA PROGRESAR
            </h2>
            <p className="text-sm text-zinc-600 font-sans leading-relaxed">
              Diseñado minuciosamente para ser rápido mientras entrenas y no perder tiempo navegando menús complejos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Feature 1: Torre de Placas & Ejercicios */}
            <div className="p-6 sm:p-8 bg-white border border-zinc-200 rounded-3xl shadow-sm space-y-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-black">
                <Dumbbell className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-xl font-bold font-display uppercase tracking-tight text-zinc-900">
                  Selector Visual con Torre de Placas
                </h3>
                <p className="text-zinc-600 text-xs sm:text-sm leading-relaxed font-sans">
                  Elige ejercicios con selector visual interactivo, ajusta los kilos con la barra continua y configura series con repeticiones y peso independiente.
                </p>
              </div>
              <div className="pt-2 text-xs font-mono font-bold text-zinc-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Cálculo de 1RM y tonelaje acumulado al instante</span>
              </div>
            </div>

            {/* Feature 2: Nutrición con IA */}
            <div className="p-6 sm:p-8 bg-white border border-zinc-200 rounded-3xl shadow-sm space-y-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-black">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-xl font-bold font-display uppercase tracking-tight text-zinc-900">
                  Cálculo de Comidas con Inteligencia Artificial
                </h3>
                <p className="text-zinc-600 text-xs sm:text-sm leading-relaxed font-sans">
                  Escribe como hablas: <em>"2 porciones de budín de café"</em>, <em>"1 scoop de whey con 200ml de leche"</em> o <em>"plato de pastas con tuco"</em>. La IA calcula calorías y proteínas en segundos.
                </p>
              </div>
              <div className="pt-2 text-xs font-mono font-bold text-zinc-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Memoria de alimentos frecuentes y atajos rápidos</span>
              </div>
            </div>

            {/* Feature 3: Cardio y Desplazamientos */}
            <div className="p-6 sm:p-8 bg-white border border-zinc-200 rounded-3xl shadow-sm space-y-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-black">
                <Flame className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-xl font-bold font-display uppercase tracking-tight text-zinc-900">
                  Cardio, Pasos & Gasto Calórico
                </h3>
                <p className="text-zinc-600 text-xs sm:text-sm leading-relaxed font-sans">
                  Registra caminatas, sesiones de cinta, running, ciclismo o elíptico. Estima el consumo calórico según tiempo, distancia e intensidad.
                </p>
              </div>
              <div className="pt-2 text-xs font-mono font-bold text-zinc-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Objetivo diario de calorías de cardio integradas</span>
              </div>
            </div>

            {/* Feature 4: Gráficos de Progresión y Peso */}
            <div className="p-6 sm:p-8 bg-white border border-zinc-200 rounded-3xl shadow-sm space-y-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-black">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-xl font-bold font-display uppercase tracking-tight text-zinc-900">
                  Historial, Gráficos & Modo Privacidad
                </h3>
                <p className="text-zinc-600 text-xs sm:text-sm leading-relaxed font-sans">
                  Visualiza la tendencia de tu peso corporal y tonelaje en el tiempo con gráficos interactivos. Oculta tu peso con 1 clic si entrenas en público.
                </p>
              </div>
              <div className="pt-2 text-xs font-mono font-bold text-zinc-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Modo incógnito para peso corporal</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. CÓMO FUNCIONA EN 3 PASOS                                               */}
      {/* ========================================================================= */}
      <section id="how-it-works" className="w-full py-16 sm:py-24 px-4 sm:px-8 bg-white border-y border-zinc-200">
        <div className="max-w-5xl mx-auto space-y-12">
          
          <div className="text-center space-y-2.5 max-w-xl mx-auto">
            <span className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-widest">
              // FLUJO SENCILLO
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-zinc-900 font-display">
              EMPIEZA EN MENOS DE 1 MINUTO
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
            
            <div className="p-6 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3 relative">
              <span className="w-8 h-8 rounded-xl bg-black text-white font-bold flex items-center justify-center text-sm">
                1
              </span>
              <h4 className="text-base font-bold text-zinc-900 font-display uppercase">
                Crea tu cuenta gratuita
              </h4>
              <p className="text-zinc-600 font-sans leading-relaxed">
                Ingresa con tu correo o con 1 clic usando Google para tener sincronización ilimitada en la nube.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3 relative">
              <span className="w-8 h-8 rounded-xl bg-black text-white font-bold flex items-center justify-center text-sm">
                2
              </span>
              <h4 className="text-base font-bold text-zinc-900 font-display uppercase">
                Carga tus sesiones y comidas
              </h4>
              <p className="text-zinc-600 font-sans leading-relaxed">
                Usa el selector visual de gimnasio y el asistente IA de nutrición mientras transcurre tu día.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3 relative">
              <span className="w-8 h-8 rounded-xl bg-black text-white font-bold flex items-center justify-center text-sm">
                3
              </span>
              <h4 className="text-base font-bold text-zinc-900 font-display uppercase">
                Alcanza tus objetivos
              </h4>
              <p className="text-zinc-600 font-sans leading-relaxed">
                Supera tu tonelaje semanal, cumple tus metas calóricas y evalúa tu evolución corporal con datos precisos.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. BANNER CTA FINAL                                                       */}
      {/* ========================================================================= */}
      <section id="benefits" className="w-full py-16 sm:py-20 px-4 sm:px-8 bg-black text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/20 via-transparent to-cyan-950/20 pointer-events-none" />

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
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 font-mono text-xs">
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
