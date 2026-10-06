import React from 'react';
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
  Award
} from 'lucide-react';
import Footer from './Footer';

export default function LandingView({ onOpenLogin, onOpenRegister }) {
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
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
      <section className="relative w-full pt-12 pb-16 sm:pt-20 sm:pb-24 px-4 sm:px-8 overflow-hidden border-b border-zinc-200 bg-white">
        {/* Glows decorativos de fondo */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-100/60 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-cyan-100/60 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-8 relative z-10">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-800 text-xs font-mono font-bold tracking-wide shadow-xs animate-fade-in">
            <Sparkles className="w-3.5 h-3.5 text-black fill-black" />
            <span>PLATAFORMA INTEGRAL DE ENTRENAMIENTO & NUTRICIÓN CON IA</span>
          </div>

          {/* Título Principal */}
          <div className="space-y-4 max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold uppercase tracking-tight text-zinc-900 font-display leading-[1.08]">
              DOMINA TUS CARGAS. <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-950 via-zinc-800 to-zinc-600">
                TRANSFORMA TU FÍSICO.
              </span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-zinc-600 font-sans max-w-2xl mx-auto leading-relaxed">
              Registra series y repeticiones con una torre interactiva de cargas, calcula macros al instante con Inteligencia Artificial y sincroniza tu progreso en tiempo real.
            </p>
          </div>

          {/* Botones de Acción (CTA) */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5 font-mono text-xs">
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
              onClick={() => scrollToSection('features')}
              className="w-full sm:w-auto px-6 py-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-bold uppercase border border-zinc-200 rounded-xl transition-all cursor-pointer"
            >
              Ver Demostración
            </button>
          </div>

          {/* Puntos destacados de confianza */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-zinc-500 font-mono text-[11px] font-bold">
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

          {/* Previsualización visual simulada */}
          <div className="pt-8 max-w-4xl mx-auto">
            <div className="p-3 sm:p-4 bg-zinc-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-zinc-800 text-white">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3 px-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <span className="text-[11px] font-mono text-zinc-400">MYPOWERUP APP DASHBOARD</span>
                <div className="w-12" />
              </div>

              {/* Grid representativa de módulos */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 sm:p-4 text-left font-mono text-xs">
                
                {/* Tarjeta Gym */}
                <div className="bg-zinc-800/80 border border-zinc-700/80 p-4 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400 text-[10px] uppercase font-bold tracking-wider">Gym & Cargas</span>
                    <Dumbbell className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-xl font-black font-display text-white">PRESS DE BANCA</div>
                  <div className="text-xs text-zinc-300">4 series × 80 kg (10 reps)</div>
                  <div className="text-[10px] text-emerald-400 font-bold font-mono">1RM Est.: 106.7 kg</div>
                </div>

                {/* Tarjeta Nutrición */}
                <div className="bg-zinc-800/80 border border-zinc-700/80 p-4 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400 text-[10px] uppercase font-bold tracking-wider">Nutrición IA</span>
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="text-xl font-black font-display text-white">2.450 KCAL</div>
                  <div className="text-xs text-zinc-300">Proteína: 165g / 150g meta</div>
                  <div className="text-[10px] text-cyan-400 font-bold font-mono">"Budín de café" detectado</div>
                </div>

                {/* Tarjeta Cardio & Metas */}
                <div className="bg-zinc-800/80 border border-zinc-700/80 p-4 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400 text-[10px] uppercase font-bold tracking-wider">Cardio & Metas</span>
                    <Flame className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-xl font-black font-display text-white">RUNNING 5.2 KM</div>
                  <div className="text-xs text-zinc-300">Tiempo: 28 min • 380 kcal</div>
                  <div className="text-[10px] text-amber-400 font-bold font-mono">Objetivo diario cumplido</div>
                </div>

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
                  Elige ejercicios con selector visual interactivo, ajusta los kilos con la barra continua o clic directo en las placas y configura series con peso independiente.
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
