import React, { useState } from 'react';
import { Zap, ArrowLeft, Mail, Lock, User as UserIcon, CheckCircle2, Sparkles } from 'lucide-react';
import { registerWithEmail, loginWithGoogle } from '../lib/firebase';
import Footer from './Footer';

export default function RegisterView({
  onBackToLanding,
  onOpenLogin,
  onAuthSuccess
}) {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const parseFirebaseError = (err) => {
    const code = err.code || err.message || '';
    if (code.includes('email-already-in-use')) return 'Este correo ya está registrado. Inicia sesión.';
    if (code.includes('weak-password')) return 'La contraseña debe tener al menos 6 caracteres.';
    if (code.includes('invalid-email')) return 'El correo electrónico no es válido.';
    if (code.includes('popup-closed-by-user')) return 'Ventana cerrada por el usuario.';
    if (code.includes('network-request-failed')) return 'Error de conexión a internet.';
    return err.message || 'Ocurrió un error. Revisa tus datos.';
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await registerWithEmail(email, password, displayName);
      if (onAuthSuccess) onAuthSuccess();
    } catch (err) {
      setError(parseFirebaseError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError(null);
    setLoading(true);

    try {
      await loginWithGoogle();
      if (onAuthSuccess) onAuthSuccess();
    } catch (err) {
      setError(parseFirebaseError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0A0A0D] text-white flex flex-col font-sans select-none justify-between selection:bg-emerald-500 selection:text-black">

      {/* 1. HEADER OSCURO MINIMALISTA */}
      <header className="w-full border-b border-[#222226] bg-[#0A0A0D]/90 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-black shadow-sm">
            <Zap className="w-4 h-4 text-black fill-black" />
          </div>
          <span className="text-xl sm:text-2xl font-black font-display tracking-tight text-white uppercase">
            MYPOWER<span className="text-emerald-500">UP</span>
          </span>
        </div>

        {/* Botones de navegación */}
        <div className="flex items-center gap-3 font-mono text-xs">
          <button
            type="button"
            onClick={onBackToLanding}
            className="px-3 py-2 text-zinc-400 hover:text-white font-bold uppercase transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Inicio</span>
          </button>

          <button
            type="button"
            onClick={onOpenLogin}
            className="px-4 py-2 bg-white hover:bg-zinc-200 text-black font-bold uppercase rounded-xl shadow-xs transition-all cursor-pointer"
          >
            Iniciar Sesión
          </button>
        </div>
      </header>

      {/* 2. CONTENIDO PRINCIPAL: 2 COLUMNAS EN FONDO NEGRO Y CAMPOS ABIERTOS SIN ENCAPSULAR */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-8 py-10 sm:py-16 flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">

          {/* COLUMNA IZQUIERDA: Marca, Bienvenida y los 3 Bloques sin encuadrar */}
          <div className="lg:col-span-6 space-y-6 sm:space-y-8 animate-fade-in text-left">

            {/* Encabezado Marca */}
            <div className="space-y-2">
              <span className="text-xs font-mono tracking-widest text-emerald-400 uppercase font-bold block flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                // PLATAFORMA DE RENDIMIENTO
              </span>
              <h1 className="text-4xl sm:text-6xl font-extrabold uppercase tracking-tight text-white font-display leading-tight">
                MYPOWER<span className="text-emerald-500">UP</span>
              </h1>
            </div>

            {/* Mensaje de Bienvenida */}
            <div className="space-y-2 max-w-lg">
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-display">
                Bienvenido a tu registro integral.
              </h2>
              <p className="text-zinc-400 text-sm font-sans leading-relaxed">
                Mypowerup centraliza tus cargas de gimnasio, macros con IA y evolución del peso corporal con sincronización automática en la nube.
              </p>
            </div>

            {/* 3 Bloques Abiertos y Fluidos (Sin cajas encapsuladas) */}
            <div className="space-y-4 pt-2 font-mono text-xs">
              <div className="border-l-2 border-emerald-500/70 pl-4 py-1">
                <span className="text-white font-extrabold block text-xs uppercase tracking-wider">
                  01 // GYM & CARGAS
                </span>
                <p className="text-zinc-400 text-xs font-sans mt-0.5 leading-snug">
                  Series, repeticiones, tonelaje total y 1RM en vivo.
                </p>
              </div>

              <div className="border-l-2 border-emerald-500/70 pl-4 py-1">
                <span className="text-white font-extrabold block text-xs uppercase tracking-wider">
                  02 // NUTRICIÓN IA
                </span>
                <p className="text-zinc-400 text-xs font-sans mt-0.5 leading-snug">
                  Estimación automática de calorías y proteínas en segundos.
                </p>
              </div>

              <div className="border-l-2 border-emerald-500/70 pl-4 py-1">
                <span className="text-white font-extrabold block text-xs uppercase tracking-wider">
                  03 // PESO CORPORAL
                </span>
                <p className="text-zinc-400 text-xs font-sans mt-0.5 leading-snug">
                  Gráfica evolutiva y modo oculto de privacidad.
                </p>
              </div>
            </div>

            {/* Beneficios */}
            <div className="pt-2 flex flex-wrap items-center gap-5 text-xs font-mono text-zinc-400">
              <span className="flex items-center gap-1.5 text-zinc-300 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Sincronización en tiempo real
              </span>
              <span className="flex items-center gap-1.5 text-zinc-300 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Acceso en cualquier dispositivo
              </span>
            </div>

          </div>

          {/* COLUMNA DERECHA: Formulario Abierto y Fluido sobre fondo negro (Sin encapsular) */}
          <div className="lg:col-span-6 w-full max-w-md mx-auto lg:mx-0 animate-fade-in-up">
            
            <div className="space-y-6">
              
              {/* Encabezado Formulario */}
              <div className="space-y-1 text-left border-b border-zinc-800 pb-4">
                <h3 className="text-3xl font-black text-white uppercase tracking-tight font-display">
                  Crear Cuenta
                </h3>
                <p className="text-xs font-mono text-zinc-400">
                  Regístrate para respaldar tu progreso en la nube.
                </p>
              </div>

              {/* Alerta de Error */}
              {error && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono">
                  {error}
                </div>
              )}

              {/* Formulario Fluido y Abierto (Lineal sin cápsulas) */}
              <form onSubmit={handleRegister} className="space-y-5 font-mono text-xs">
                
                {/* Campo Nombre */}
                <div className="space-y-1.5 text-left group">
                  <label className="block text-[11px] text-zinc-400 group-focus-within:text-emerald-400 uppercase tracking-wider font-bold transition-colors">
                    Nombre o Apodo
                  </label>
                  <div className="relative flex items-center border-b border-zinc-800 group-focus-within:border-emerald-500 pb-1.5 transition-colors">
                    <UserIcon className="w-4 h-4 text-zinc-500 group-focus-within:text-emerald-400 mr-2.5 shrink-0 transition-colors" />
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Ej. Alex"
                      className="w-full bg-transparent focus:outline-none text-white text-sm font-sans placeholder:text-zinc-600"
                    />
                  </div>
                </div>

                {/* Campo Correo */}
                <div className="space-y-1.5 text-left group">
                  <label className="block text-[11px] text-zinc-400 group-focus-within:text-emerald-400 uppercase tracking-wider font-bold transition-colors">
                    Correo Electrónico
                  </label>
                  <div className="relative flex items-center border-b border-zinc-800 group-focus-within:border-emerald-500 pb-1.5 transition-colors">
                    <Mail className="w-4 h-4 text-zinc-500 group-focus-within:text-emerald-400 mr-2.5 shrink-0 transition-colors" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                      className="w-full bg-transparent focus:outline-none text-white text-sm font-sans placeholder:text-zinc-600"
                    />
                  </div>
                </div>

                {/* Campo Contraseña */}
                <div className="space-y-1.5 text-left group">
                  <label className="block text-[11px] text-zinc-400 group-focus-within:text-emerald-400 uppercase tracking-wider font-bold transition-colors">
                    Contraseña
                  </label>
                  <div className="relative flex items-center border-b border-zinc-800 group-focus-within:border-emerald-500 pb-1.5 transition-colors">
                    <Lock className="w-4 h-4 text-zinc-500 group-focus-within:text-emerald-400 mr-2.5 shrink-0 transition-colors" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full bg-transparent focus:outline-none text-white text-sm font-sans placeholder:text-zinc-600"
                    />
                  </div>
                </div>

                {/* Botón Crear Cuenta */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 mt-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-extrabold uppercase rounded-xl shadow-lg shadow-emerald-500/20 transition-all text-xs tracking-wider disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'Creando cuenta...' : 'Crear Mi Cuenta'}
                </button>

              </form>

              {/* Divisor */}
              <div className="flex items-center gap-3 my-2">
                <div className="h-px flex-1 bg-zinc-800" />
                <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">
                  o regístrate con
                </span>
                <div className="h-px flex-1 bg-zinc-800" />
              </div>

              {/* Botón de Google */}
              <button
                type="button"
                onClick={handleGoogleSignup}
                disabled={loading}
                className="w-full py-3 px-3 bg-[#16161A] hover:bg-[#202026] text-white font-mono text-xs font-bold border border-zinc-800 rounded-xl transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50 shadow-sm"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.2c0 2.9.7 5.5 1.9 7.9l3.7-2.9z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16.5C3.7 20.2 7.5 23.5 12 23.5z"
                  />
                </svg>
                <span>Continuar con Google</span>
              </button>

              {/* Link para Iniciar Sesión */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={onOpenLogin}
                  className="text-xs font-mono text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  ¿Ya tienes cuenta? <span className="font-bold text-emerald-400 hover:underline">Iniciar Sesión</span>
                </button>
              </div>

            </div>

          </div>

        </div>
      </main>

      {/* 3. FOOTER */}
      <Footer onOpenAuth={onOpenLogin} />

    </div>
  );
}
