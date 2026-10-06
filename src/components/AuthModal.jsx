import React, { useState, useEffect } from 'react';
import { Zap, ArrowLeft, Mail, Lock, User as UserIcon, X } from 'lucide-react';
import {
  loginWithEmail,
  registerWithEmail,
  loginWithGoogle,
  resetPassword
} from '../lib/firebase';
import Footer from './Footer';

export default function AuthModal({
  isOpen,
  onClose,
  initialMode = 'login',
  onAuthSuccess
}) {
  if (!isOpen) return null;

  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [isResetMode, setIsResetMode] = useState(false);

  // Al abrirse con modo 'login' o 'register', abrir automáticamente el drawer si se especificó, o dejar listo
  useEffect(() => {
    setIsLogin(initialMode === 'login');
    setError(null);
    setMessage(null);
    setIsResetMode(false);
    // Abrir el cajón lateral con una pequeña pausa para permitir que la animación CSS se ejecute suavemente
    const timer = setTimeout(() => {
      setIsDrawerOpen(true);
    }, 50);
    return () => clearTimeout(timer);
  }, [initialMode, isOpen]);

  const parseFirebaseError = (err) => {
    const code = err.code || err.message || '';
    if (code.includes('user-not-found')) return 'No existe una cuenta con este correo.';
    if (code.includes('wrong-password') || code.includes('invalid-credential')) return 'Contraseña o correo incorrectos.';
    if (code.includes('email-already-in-use')) return 'Este correo ya está registrado. Inicia sesión.';
    if (code.includes('weak-password')) return 'La contraseña debe tener al menos 6 caracteres.';
    if (code.includes('popup-closed-by-user')) return 'Ventana cerrada por el usuario.';
    if (code.includes('network-request-failed')) return 'Error de conexión a internet.';
    return err.message || 'Ocurrió un error. Revisa tus datos.';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      if (isResetMode) {
        if (!email) throw new Error('Ingresa tu correo');
        await resetPassword(email);
        setMessage('Correo de recuperación enviado con éxito.');
        setLoading(false);
        return;
      }

      if (isLogin) {
        await loginWithEmail(email, password);
      } else {
        await registerWithEmail(email, password, displayName);
      }

      if (onAuthSuccess) onAuthSuccess();
      onClose();
    } catch (err) {
      setError(parseFirebaseError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      await loginWithGoogle();
      if (onAuthSuccess) onAuthSuccess();
      onClose();
    } catch (err) {
      setError(parseFirebaseError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    // Esperar a que termine la animación de deslizamiento antes de cerrar la pantalla
    setTimeout(() => {
      onClose();
    }, 350);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#FAFAFA] text-zinc-900 overflow-y-auto overflow-x-hidden animate-fade-in select-none flex flex-col">

      {/* 1. BARRA SUPERIOR (HEADER) */}
      <header className="w-full border-b border-zinc-200 bg-white/90 backdrop-blur-md sticky top-0 z-30 px-6 sm:px-12 py-4 flex items-center justify-between shrink-0">
        
        {/* Logo de la web */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-black flex items-center justify-center text-white shadow-sm">
            <Zap className="w-4 h-4 text-white fill-white" />
          </div>
          <span className="text-xl sm:text-2xl font-extrabold font-display tracking-tight text-zinc-900 uppercase">
            MYPOWER<span className="text-emerald-500">UP</span>
          </span>
        </div>

        {/* Botones de acción Header */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-mono font-bold text-zinc-500 hover:text-black uppercase transition-colors cursor-pointer flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Inicio</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsLogin(true);
              setIsDrawerOpen(true);
            }}
            className="px-4 py-2 bg-black hover:bg-zinc-800 text-white font-mono text-xs font-bold uppercase rounded-xl shadow-sm transition-all cursor-pointer"
          >
            Iniciar Sesión
          </button>
        </div>
      </header>

      {/* 2. VISTA PRINCIPAL MINIMALISTA DE BIENVENIDA */}
      <section className="min-h-[calc(100vh-73px)] w-full flex-1 flex flex-col justify-center items-center px-4 sm:px-8 py-10 relative z-10">
        
        <div className="w-full max-w-3xl mx-auto text-center space-y-6 sm:space-y-8 animate-fade-in-up">

          {/* Encabezado Marca */}
          <div className="space-y-2">
            <span className="text-[11px] font-mono tracking-widest text-zinc-500 uppercase block font-bold">
              // PLATAFORMA DE RENDIMIENTO
            </span>
            <h1 className="text-4xl sm:text-6xl font-extrabold uppercase tracking-tight text-zinc-900 font-display">
              MYPOWER<span className="text-emerald-500">UP</span>
            </h1>
          </div>

          {/* Mensaje de Bienvenida Centrado */}
          <div className="space-y-2.5 max-w-xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight font-display">
              Bienvenido a tu registro integral.
            </h2>
            <p className="text-zinc-600 text-xs sm:text-sm font-sans leading-relaxed">
              Mypowerup centraliza tus cargas de gimnasio, macros con IA y evolución del peso corporal con sincronización automática en la nube.
            </p>
          </div>

          {/* Cuadrícula de 3 Bloques Equilibrados */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left font-mono text-xs">
            <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-zinc-900 font-extrabold block text-xs uppercase tracking-wider">
                  01 // GYM & CARGAS
                </span>
                <p className="text-zinc-600 text-xs font-sans mt-1.5 leading-snug">
                  Series, repeticiones, tonelaje total y 1RM en vivo.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-zinc-900 font-extrabold block text-xs uppercase tracking-wider">
                  02 // NUTRICIÓN IA
                </span>
                <p className="text-zinc-600 text-xs font-sans mt-1.5 leading-snug">
                  Estimación automática de calorías y proteínas.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-zinc-900 font-extrabold block text-xs uppercase tracking-wider">
                  03 // PESO CORPORAL
                </span>
                <p className="text-zinc-600 text-xs font-sans mt-1.5 leading-snug">
                  Gráfica evolutiva y modo oculto de privacidad.
                </p>
              </div>
            </div>
          </div>

          {/* Acción Principal */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 font-mono text-xs">
            <button
              type="button"
              onClick={() => {
                setIsLogin(false);
                setIsDrawerOpen(true);
              }}
              className="w-full sm:w-auto px-8 py-3.5 bg-black hover:bg-zinc-800 text-white font-bold uppercase rounded-xl shadow-md transition-all cursor-pointer text-sm"
            >
              Crear Cuenta
            </button>
          </div>

        </div>

      </section>

      {/* 3. FOOTER COMPLETO */}
      <Footer onOpenAuth={() => { setIsLogin(true); setIsDrawerOpen(true); }} />

      {/* ========================================================================= */}
      {/* 4. CAJÓN LATERAL DESLIZABLE (DRAWER) CON TRANSICIÓN SUAVE                 */}
      {/* ========================================================================= */}
      <div
        onClick={handleCloseDrawer}
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-500 ease-in-out ${
          isDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      <div
        className={`fixed top-0 right-0 bottom-0 w-full sm:w-[430px] bg-white border-l border-zinc-200 z-50 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto shadow-2xl transition-transform duration-500 ease-out text-zinc-900 ${
          isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
      >
        <div className="space-y-5">

          {/* Cabecera del Panel */}
          <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
            <button
              type="button"
              onClick={handleCloseDrawer}
              className="text-zinc-500 hover:text-black font-mono text-xs transition-colors cursor-pointer flex items-center gap-1.5 font-bold"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Volver</span>
            </button>

            <button
              type="button"
              onClick={handleCloseDrawer}
              className="w-7 h-7 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-500 hover:text-black flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Selector de Pestañas */}
          {!isResetMode && (
            <div className="grid grid-cols-2 p-1 bg-zinc-100 rounded-xl border border-zinc-200 font-mono text-xs">
              <button
                type="button"
                onClick={() => { setIsLogin(true); setError(null); setMessage(null); }}
                className={`py-2 rounded-lg font-bold transition-all uppercase cursor-pointer ${
                  isLogin
                    ? 'bg-black text-white shadow-sm'
                    : 'text-zinc-600 hover:text-black'
                }`}
              >
                Iniciar Sesión
              </button>

              <button
                type="button"
                onClick={() => { setIsLogin(false); setError(null); setMessage(null); }}
                className={`py-2 rounded-lg font-bold transition-all uppercase cursor-pointer ${
                  !isLogin
                    ? 'bg-black text-white shadow-sm'
                    : 'text-zinc-600 hover:text-black'
                }`}
              >
                Crear Cuenta
              </button>
            </div>
          )}

          {/* Título */}
          <div>
            <h3 className="text-xl font-extrabold text-zinc-900 uppercase tracking-tight font-display">
              {isResetMode
                ? 'Recuperar Contraseña'
                : isLogin
                  ? 'Ingresa a tu Cuenta'
                  : 'Crear Cuenta'}
            </h3>
            <p className="text-xs font-mono text-zinc-500 mt-0.5">
              {isResetMode
                ? 'Ingresa tu email para restablecer la contraseña.'
                : isLogin
                  ? 'Ingresa tus credenciales para sincronizar.'
                  : 'Regístrate para respaldar tu progreso en la nube.'}
            </p>
          </div>

          {/* Alertas */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-mono">
              {error}
            </div>
          )}

          {message && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-mono">
              {message}
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-3.5 font-mono text-xs">

            {!isLogin && !isResetMode && (
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
                    className="w-full bg-white border border-zinc-300 focus:border-black focus:outline-none pl-9 pr-3 py-2.5 rounded-xl text-zinc-900 text-xs font-sans placeholder:text-zinc-400 shadow-sm"
                  />
                </div>
              </div>
            )}

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
                  className="w-full bg-white border border-zinc-300 focus:border-black focus:outline-none pl-9 pr-3 py-2.5 rounded-xl text-zinc-900 text-xs font-sans placeholder:text-zinc-400 shadow-sm"
                />
              </div>
            </div>

            {!isResetMode && (
              <div className="space-y-1 text-left">
                <div className="flex justify-between items-center">
                  <label className="block text-[10px] text-zinc-700 uppercase tracking-wider font-bold">
                    Contraseña
                  </label>
                  {isLogin && (
                    <button
                      type="button"
                      onClick={() => { setIsResetMode(true); setError(null); setMessage(null); }}
                      className="text-[10px] text-zinc-600 hover:text-black underline cursor-pointer"
                    >
                      ¿Olvidaste?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white border border-zinc-300 focus:border-black focus:outline-none pl-9 pr-3 py-2.5 rounded-xl text-zinc-900 text-xs font-sans placeholder:text-zinc-400 shadow-sm"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 mt-1 bg-black hover:bg-zinc-800 text-white font-bold uppercase rounded-xl shadow-md transition-all text-xs tracking-wider disabled:opacity-50 cursor-pointer"
            >
              {loading
                ? 'Procesando...'
                : isResetMode
                  ? 'Enviar Email de Recuperación'
                  : isLogin
                    ? 'Ingresar'
                    : 'Crear Mi Cuenta'}
            </button>

            {isResetMode && (
              <button
                type="button"
                onClick={() => { setIsResetMode(false); setError(null); setMessage(null); }}
                className="w-full text-center py-1 text-zinc-500 hover:text-black text-xs transition-colors cursor-pointer flex items-center justify-center gap-1 font-bold"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Volver al login</span>
              </button>
            )}

          </form>

          {/* Separador y Google */}
          {!isResetMode && (
            <>
              <div className="flex items-center gap-2 my-3">
                <div className="h-px flex-1 bg-zinc-200" />
                <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest">
                  o continúa con
                </span>
                <div className="h-px flex-1 bg-zinc-200" />
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full py-3 px-3 bg-zinc-50 hover:bg-zinc-100 text-zinc-800 font-mono text-xs font-bold border border-zinc-200 rounded-xl transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50 shadow-sm"
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
            </>
          )}

        </div>

        {/* Footer del Cajón */}
        <div className="pt-4 border-t border-zinc-200 text-center text-[10px] font-mono text-zinc-400">
          <span>MyPowerUp • Sincronización en la Nube</span>
        </div>

      </div>

    </div>
  );
}
