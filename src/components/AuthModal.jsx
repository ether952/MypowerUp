import React, { useState, useEffect } from 'react';
import {
  loginWithEmail,
  registerWithEmail,
  loginWithGoogle,
  resetPassword,
  isFirebaseConfigured
} from '../lib/firebase';

export default function AuthModal({
  isOpen,
  onClose,
  initialMode = 'register',
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

  useEffect(() => {
    setIsLogin(initialMode === 'login');
  }, [initialMode, isOpen]);

  const parseFirebaseError = (err) => {
    const code = err.code || err.message || '';
    if (code.includes('user-not-found')) return 'No existe una cuenta con este correo.';
    if (code.includes('wrong-password') || code.includes('invalid-credential')) return 'Contraseña o correo incorrectos.';
    if (code.includes('email-already-in-use')) return 'Este correo ya está registrado. Inicia sesión.';
    if (code.includes('weak-password')) return 'La contraseña debe tener al menos 6 caracteres.';
    if (code.includes('popup-closed-by-user')) return 'Ventana cerrada.';
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
        setMessage('Correo de recuperación enviado.');
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

  const handleContinueAsGuest = () => {
    try {
      localStorage.setItem('mypowerup_guest_session', 'true');
    } catch (e) { }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#02000A] text-white flex flex-col items-center justify-center p-4 sm:p-8 overflow-hidden animate-fade-in select-none">

      {/* Glows ambientales de fondo */}
      <div className="ambient-glow-purple -top-32 left-1/2 -translate-x-1/2 w-[550px] h-[550px] opacity-20 pointer-events-none"></div>
      <div className="ambient-glow-cyan -bottom-32 right-10 w-96 h-96 opacity-15 pointer-events-none"></div>

      {/* ========================================================================= */}
      {/* BOTÓN SUPERIOR DERECHO: INICIAR SESIÓN / REGISTRO                         */}
      {/* ========================================================================= */}
      <div className="absolute top-5 right-5 sm:top-8 sm:right-8 z-30 flex items-center gap-3">
        <button
          type="button"
          onClick={() => {
            setIsLogin(true);
            setIsDrawerOpen(true);
          }}
          className="px-4 py-2 bg-gradient-to-r from-neon-purple to-neon-violet hover:opacity-95 text-white font-mono text-xs font-bold uppercase rounded-xl shadow-lg shadow-purple-600/30 transition-all cursor-pointer active:scale-95"
        >
          Iniciar Sesión
        </button>
      </div>

      {/* ========================================================================= */}
      {/* VISTA PRINCIPAL DE BIENVENIDA CENTRADA EN TODA LA PANTALLA                */}
      {/* ========================================================================= */}
      <div className="w-full max-w-3xl mx-auto text-center space-y-6 sm:space-y-8 relative z-10 animate-fade-in-up">

        {/* Encabezado Marca */}
        <div className="space-y-2">
          <span className="text-[11px] font-mono tracking-widest text-neon-purple uppercase block font-bold">
            // PLATAFORMA DE RENDIMIENTO
          </span>
          <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-wider text-white font-display">
            MYPOWER<span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-neon-cyan">UP</span>
          </h1>
        </div>

        {/* Mensaje de Bienvenida Centrado */}
        <div className="space-y-2.5 max-w-xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-display">
            Bienvenido a tu registro integral.
          </h2>
          <p className="text-neutral-400 text-xs sm:text-sm font-sans leading-relaxed">
            Mypowerup centraliza tus cargas de gimnasio, macros con IA y evolución del peso corporal con sincronización automática en la nube.
          </p>
        </div>

        {/* Cuadrícula de 3 Bloques Equilibrados */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-left font-mono text-xs">
          <div className="p-4 rounded-2xl bg-[#060218]/90 border border-purple-500/25 backdrop-blur-md hover:border-purple-500/40 transition-colors flex flex-col justify-between">
            <div>
              <span className="text-neon-purple font-bold block text-xs uppercase tracking-wider">
                01 // GYM & CARGAS
              </span>
              <p className="text-neutral-400 text-xs font-sans mt-1 leading-snug">
                Series, repeticiones, tonelaje total y 1RM en vivo.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#060218]/90 border border-purple-500/25 backdrop-blur-md hover:border-purple-500/40 transition-colors flex flex-col justify-between">
            <div>
              <span className="text-neon-cyan font-bold block text-xs uppercase tracking-wider">
                02 // NUTRICIÓN IA
              </span>
              <p className="text-neutral-400 text-xs font-sans mt-1 leading-snug">
                Estimación automática de calorías y proteínas.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#060218]/90 border border-purple-500/25 backdrop-blur-md hover:border-purple-500/40 transition-colors flex flex-col justify-between">
            <div>
              <span className="text-violet-400 font-bold block text-xs uppercase tracking-wider">
                03 // PESO CORPORAL
              </span>
              <p className="text-neutral-400 text-xs font-sans mt-1 leading-snug">
                Gráfica evolutiva y modo oculto de privacidad.
              </p>
            </div>
          </div>
        </div>

        {/* Acciones de Entrada */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 font-mono text-xs">
          <button
            type="button"
            onClick={() => {
              setIsLogin(false);
              setIsDrawerOpen(true);
            }}
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-neon-purple to-neon-violet hover:opacity-95 text-white font-bold uppercase rounded-xl shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
          >
            Crear Cuenta
          </button>

          <button
            type="button"
            onClick={handleContinueAsGuest}
            className="w-full sm:w-auto px-5 py-3 bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 rounded-xl transition-all cursor-pointer"
          >
            Continuar en Modo Local
          </button>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* PANEL DESLIZABLE LATERAL (SIDE DRAWER CON ANIMACIÓN SUAVE)                 */}
      {/* ========================================================================= */}
      {/* Backdrop oscuro cuando el panel lateral está abierto */}
      <div
        onClick={() => setIsDrawerOpen(false)}
        className={`fixed inset-0 bg-black/70 backdrop-blur-sm z-40 transition-opacity duration-300 ${isDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
      />

      {/* Cajón lateral con animación suave de deslizamiento desde la derecha */}
      <div
        className={`fixed top-0 right-0 bottom-0 w-full sm:w-[420px] bg-[#050114] border-l border-purple-500/30 z-50 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto shadow-[0_0_60px_rgba(0,0,0,0.9)] transform transition-transform duration-500 ease-out ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        <div className="space-y-5">

          {/* Cabecera del Panel */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <button
              type="button"
              onClick={() => setIsDrawerOpen(false)}
              className="text-neutral-400 hover:text-white font-mono text-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              ← Volver
            </button>
          </div>

          {/* Selector de Pestañas */}
          {!isResetMode && (
            <div className="grid grid-cols-2 p-1 bg-space-950 rounded-xl border border-white/10 font-mono text-xs">
              <button
                type="button"
                onClick={() => { setIsLogin(true); setError(null); setMessage(null); }}
                className={`py-2 rounded-lg font-bold transition-all uppercase cursor-pointer ${isLogin
                    ? 'bg-gradient-to-r from-neon-purple to-neon-violet text-white shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                  }`}
              >
                Iniciar Sesión
              </button>

              <button
                type="button"
                onClick={() => { setIsLogin(false); setError(null); setMessage(null); }}
                className={`py-2 rounded-lg font-bold transition-all uppercase cursor-pointer ${!isLogin
                    ? 'bg-gradient-to-r from-neon-purple to-neon-violet text-white shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                  }`}
              >
                Crear Cuenta
              </button>
            </div>
          )}

          {/* Título */}
          <div>
            <h3 className="text-xl font-black text-white uppercase tracking-tight font-display">
              {isResetMode
                ? 'Recuperar Contraseña'
                : isLogin
                  ? 'Ingresa a tu Cuenta'
                  : 'Crear Cuenta'}
            </h3>
            <p className="text-xs font-mono text-neutral-400 mt-0.5">
              {isResetMode
                ? 'Ingresa tu email para restablecer la contraseña.'
                : isLogin
                  ? 'Ingresa tus credenciales para sincronizar.'
                  : 'Regístrate para respaldar tu progreso en la nube.'}
            </p>
          </div>

          {/* Alertas */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono">
              {error}
            </div>
          )}

          {message && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono">
              {message}
            </div>
          )}

          {/* Formulario (1. Email y Contraseña PRIMERO) */}
          <form onSubmit={handleSubmit} className="space-y-3.5 font-mono text-xs">

            {!isLogin && !isResetMode && (
              <div className="space-y-1 text-left">
                <label className="block text-[10px] text-neutral-300 uppercase tracking-wider font-bold">
                  Nombre o Apodo
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Ej. Alex"
                  className="w-full bg-[#08031C] border border-white/15 focus:border-neon-purple focus:outline-none px-3.5 py-2.5 rounded-xl text-white text-xs font-sans placeholder:text-neutral-600 transition-colors"
                />
              </div>
            )}

            <div className="space-y-1 text-left">
              <label className="block text-[10px] text-neutral-300 uppercase tracking-wider font-bold">
                Correo Electrónico
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full bg-[#08031C] border border-white/15 focus:border-neon-purple focus:outline-none px-3.5 py-2.5 rounded-xl text-white text-xs font-sans placeholder:text-neutral-600 transition-colors"
              />
            </div>

            {!isResetMode && (
              <div className="space-y-1 text-left">
                <div className="flex justify-between items-center">
                  <label className="block text-[10px] text-neutral-300 uppercase tracking-wider font-bold">
                    Contraseña
                  </label>
                  {isLogin && (
                    <button
                      type="button"
                      onClick={() => { setIsResetMode(true); setError(null); setMessage(null); }}
                      className="text-[10px] text-neon-cyan hover:underline"
                    >
                      ¿Olvidaste?
                    </button>
                  )}
                </div>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#08031C] border border-white/15 focus:border-neon-purple focus:outline-none px-3.5 py-2.5 rounded-xl text-white text-xs font-sans placeholder:text-neutral-600 transition-colors"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 mt-1 bg-gradient-to-r from-neon-purple to-neon-violet hover:opacity-95 text-white font-bold uppercase rounded-xl shadow-md shadow-purple-600/30 transition-all text-xs tracking-wider disabled:opacity-50 cursor-pointer"
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
                className="w-full text-center py-1 text-neutral-400 hover:text-white text-xs transition-colors cursor-pointer"
              >
                ← Volver al login
              </button>
            )}

          </form>

          {/* Separador y Google */}
          {!isResetMode && (
            <>
              <div className="flex items-center gap-2 my-3">
                <div className="h-px flex-1 bg-white/10" />
                <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest">
                  o continúa con
                </span>
                <div className="h-px flex-1 bg-white/10" />
              </div>

              {/* Botón Google con el único ícono */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full py-3 px-3 bg-space-950 hover:bg-space-900 text-white font-mono text-xs font-bold border border-white/15 hover:border-purple-500/40 rounded-xl transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
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
        <div className="pt-4 border-t border-white/10 text-center text-[10px] font-mono text-neutral-500">
          <span>MyPowerUp</span>
        </div>

      </div>

    </div>
  );
}
