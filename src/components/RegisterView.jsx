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
    <div className="min-h-screen w-full bg-[#FAFAFA] text-zinc-900 flex flex-col font-sans select-none justify-between">

      {/* 1. HEADER MINIMALISTA */}
      <header className="w-full border-b border-zinc-200 bg-white/90 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-black flex items-center justify-center text-white shadow-sm">
            <Zap className="w-4 h-4 text-white fill-white" />
          </div>
          <span className="text-xl sm:text-2xl font-black font-display tracking-tight text-zinc-900 uppercase">
            MYPOWER<span className="text-emerald-500">UP</span>
          </span>
        </div>

        {/* Botones de navegación */}
        <div className="flex items-center gap-3 font-mono text-xs">
          <button
            type="button"
            onClick={onBackToLanding}
            className="px-3 py-2 text-zinc-600 hover:text-black font-bold uppercase transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Inicio</span>
          </button>

          <button
            type="button"
            onClick={onOpenLogin}
            className="px-4 py-2 bg-black hover:bg-zinc-800 text-white font-bold uppercase rounded-xl shadow-xs transition-all cursor-pointer"
          >
            Iniciar Sesión
          </button>
        </div>
      </header>

      {/* 2. CONTENIDO PRINCIPAL: 2 COLUMNAS (IZQUIERDA: BLOQUES MINIMALISTAS / DERECHA: REGISTRO) */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-8 py-8 sm:py-12 flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

          {/* COLUMNA IZQUIERDA: Marca, Bienvenida y los 3 Bloques Minimalistas */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8 animate-fade-in text-left">

            {/* Encabezado Marca */}
            <div className="space-y-2">
              <span className="text-xs font-mono tracking-widest text-emerald-600 uppercase font-bold block flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                // PLATAFORMA DE RENDIMIENTO
              </span>
              <h1 className="text-4xl sm:text-6xl font-extrabold uppercase tracking-tight text-zinc-900 font-display leading-tight">
                MYPOWER<span className="text-emerald-500">UP</span>
              </h1>
            </div>

            {/* Mensaje de Bienvenida */}
            <div className="space-y-2 max-w-xl">
              <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight font-display">
                Bienvenido a tu registro integral.
              </h2>
              <p className="text-zinc-600 text-sm font-sans leading-relaxed">
                Mypowerup centraliza tus cargas de gimnasio, macros con IA y evolución del peso corporal con sincronización automática en la nube.
              </p>
            </div>

            {/* Los 3 Bloques Minimalistas Alineados */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 font-mono text-xs">
              <div className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-xs flex flex-col justify-between hover:border-zinc-300 transition-colors">
                <span className="text-zinc-900 font-extrabold block text-xs uppercase tracking-wider">
                  01 // GYM & CARGAS
                </span>
                <p className="text-zinc-600 text-xs font-sans mt-2 leading-snug">
                  Series, repeticiones, tonelaje total y 1RM en vivo.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-xs flex flex-col justify-between hover:border-zinc-300 transition-colors">
                <span className="text-zinc-900 font-extrabold block text-xs uppercase tracking-wider">
                  02 // NUTRICIÓN IA
                </span>
                <p className="text-zinc-600 text-xs font-sans mt-2 leading-snug">
                  Estimación automática de calorías y proteínas.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-xs flex flex-col justify-between hover:border-zinc-300 transition-colors">
                <span className="text-zinc-900 font-extrabold block text-xs uppercase tracking-wider">
                  03 // PESO CORPORAL
                </span>
                <p className="text-zinc-600 text-xs font-sans mt-2 leading-snug">
                  Gráfica evolutiva y modo oculto de privacidad.
                </p>
              </div>
            </div>

            {/* Beneficios de sincronización rápida */}
            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-mono text-zinc-500">
              <span className="flex items-center gap-1.5 text-zinc-700 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Sincronización en tiempo real
              </span>
              <span className="flex items-center gap-1.5 text-zinc-700 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Acceso en cualquier dispositivo
              </span>
            </div>

          </div>

          {/* COLUMNA DERECHA: Formulario Directo de Registro & Google Auth */}
          <div className="lg:col-span-5 w-full max-w-md mx-auto lg:mx-0 bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 shadow-xl animate-fade-in-up">
            
            <div className="space-y-5">
              
              {/* Encabezado Formulario */}
              <div>
                <h3 className="text-2xl font-extrabold text-zinc-900 uppercase tracking-tight font-display">
                  Crear Cuenta
                </h3>
                <p className="text-xs font-mono text-zinc-500 mt-1">
                  Regístrate para respaldar tu progreso en la nube.
                </p>
              </div>

              {/* Alerta de Error */}
              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-mono">
                  {error}
                </div>
              )}

              {/* Formulario */}
              <form onSubmit={handleRegister} className="space-y-3.5 font-mono text-xs">
                
                <div className="space-y-1 text-left">
                  <label className="block text-[10px] text-zinc-700 uppercase tracking-wider font-bold">
                    Nombre o Apodo
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Ej. Alex"
                      className="w-full bg-white border border-zinc-300 focus:border-black focus:outline-none pl-9 pr-3 py-2.5 rounded-xl text-zinc-900 text-xs font-sans placeholder:text-zinc-400 shadow-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1 text-left">
                  <label className="block text-[10px] text-zinc-700 uppercase tracking-wider font-bold">
                    Correo Electrónico
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                      className="w-full bg-white border border-zinc-300 focus:border-black focus:outline-none pl-9 pr-3 py-2.5 rounded-xl text-zinc-900 text-xs font-sans placeholder:text-zinc-400 shadow-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1 text-left">
                  <label className="block text-[10px] text-zinc-700 uppercase tracking-wider font-bold">
                    Contraseña
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full bg-white border border-zinc-300 focus:border-black focus:outline-none pl-9 pr-3 py-2.5 rounded-xl text-zinc-900 text-xs font-sans placeholder:text-zinc-400 shadow-xs"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-black hover:bg-zinc-800 text-white font-bold uppercase rounded-xl shadow-md transition-all text-xs tracking-wider disabled:opacity-50 cursor-pointer mt-1"
                >
                  {loading ? 'Creando cuenta...' : 'Crear Mi Cuenta'}
                </button>

              </form>

              {/* Divisor */}
              <div className="flex items-center gap-2 my-2">
                <div className="h-px flex-1 bg-zinc-200" />
                <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest">
                  o regístrate con
                </span>
                <div className="h-px flex-1 bg-zinc-200" />
              </div>

              {/* Botón de Google */}
              <button
                type="button"
                onClick={handleGoogleSignup}
                disabled={loading}
                className="w-full py-3 px-3 bg-zinc-50 hover:bg-zinc-100 text-zinc-800 font-mono text-xs font-bold border border-zinc-200 rounded-xl transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50 shadow-xs"
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
                  className="text-xs font-mono text-zinc-600 hover:text-black transition-colors cursor-pointer"
                >
                  ¿Ya tienes cuenta? <span className="font-bold underline text-black">Iniciar Sesión</span>
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
