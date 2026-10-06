import React, { useState, useEffect } from 'react';
import { Mail, Lock, X, ArrowLeft, Zap } from 'lucide-react';
import {
  loginWithEmail,
  loginWithGoogle,
  resetPassword
} from '../lib/firebase';

export default function LoginDrawer({
  isOpen,
  onClose,
  onSwitchToRegister,
  onAuthSuccess
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [isResetMode, setIsResetMode] = useState(false);

  // Reset errors and fields when drawer state changes
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setMessage(null);
      setIsResetMode(false);
    }
  }, [isOpen]);

  const parseFirebaseError = (err) => {
    const code = err.code || err.message || '';
    if (code.includes('user-not-found')) return 'No existe una cuenta con este correo.';
    if (code.includes('wrong-password') || code.includes('invalid-credential')) return 'Contraseña o correo incorrectos.';
    if (code.includes('weak-password')) return 'La contraseña debe tener al menos 6 caracteres.';
    if (code.includes('popup-closed-by-user')) return 'Ventana cerrada por el usuario.';
    if (code.includes('network-request-failed')) return 'Error de conexión a internet.';
    return err.message || 'Ocurrió un error. Revisa tus datos.';
  };

  const handleLoginSubmit = async (e) => {
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

      await loginWithEmail(email, password);
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

  return (
    <>
      {/* Backdrop con desvanecimiento suave */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/60 backdrop-blur-xs z-50 transition-opacity duration-400 ease-out ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Drawer deslizante oscuro desde la derecha */}
      <div
        className={`fixed top-0 right-0 bottom-0 w-full sm:w-[420px] bg-[#0E0E12] border-l border-[#222226] z-50 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto shadow-2xl transition-transform duration-500 text-white selection:bg-emerald-500 selection:text-black ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
      >
        <div className="space-y-6">

          {/* Cabecera del Drawer */}
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-white flex items-center justify-center text-black">
                <Zap className="w-3.5 h-3.5 text-black fill-black" />
              </div>
              <span className="font-extrabold font-display tracking-tight text-white uppercase text-sm">
                MYPOWER<span className="text-emerald-500">UP</span>
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Cerrar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Título & Subtítulo */}
          <div className="space-y-1 text-left">
            <h3 className="text-2xl font-black text-white uppercase tracking-tight font-display">
              {isResetMode ? 'Recuperar Clave' : 'Iniciar Sesión'}
            </h3>
            <p className="text-xs font-mono text-zinc-400">
              {isResetMode
                ? 'Ingresa tu email para recibir el enlace de recuperación.'
                : 'Ingresa a tu cuenta para sincronizar tus datos en la nube.'}
            </p>
          </div>

          {/* Mensajes de Alerta */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono">
              {error}
            </div>
          )}

          {message && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
              {message}
            </div>
          )}

          {/* Formulario Abierto sin encapsular */}
          <form onSubmit={handleLoginSubmit} className="space-y-5 font-mono text-xs">

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
            {!isResetMode && (
              <div className="space-y-1.5 text-left group">
                <div className="flex justify-between items-center">
                  <label className="block text-[11px] text-zinc-400 group-focus-within:text-emerald-400 uppercase tracking-wider font-bold transition-colors">
                    Contraseña
                  </label>
                  <button
                    type="button"
                    onClick={() => { setIsResetMode(true); setError(null); setMessage(null); }}
                    className="text-[10px] text-zinc-400 hover:text-emerald-400 underline cursor-pointer"
                  >
                    ¿Olvidaste?
                  </button>
                </div>
                <div className="relative flex items-center border-b border-zinc-800 group-focus-within:border-emerald-500 pb-1.5 transition-colors">
                  <Lock className="w-4 h-4 text-zinc-500 group-focus-within:text-emerald-400 mr-2.5 shrink-0 transition-colors" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-transparent focus:outline-none text-white text-sm font-sans placeholder:text-zinc-600"
                  />
                </div>
              </div>
            )}

            {/* Botón Ingresar */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 mt-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-extrabold uppercase rounded-xl shadow-lg shadow-emerald-500/20 transition-all text-xs tracking-wider disabled:opacity-50 cursor-pointer"
            >
              {loading
                ? 'Procesando...'
                : isResetMode
                  ? 'Enviar Enlace'
                  : 'Ingresar'}
            </button>

            {isResetMode && (
              <button
                type="button"
                onClick={() => { setIsResetMode(false); setError(null); setMessage(null); }}
                className="w-full text-center py-1 text-zinc-400 hover:text-white text-xs transition-colors cursor-pointer flex items-center justify-center gap-1 font-bold"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Volver a Iniciar Sesión</span>
              </button>
            )}

          </form>

          {/* Separador y Google */}
          {!isResetMode && (
            <>
              <div className="flex items-center gap-3 my-2">
                <div className="h-px flex-1 bg-zinc-800" />
                <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">
                  o ingresa con
                </span>
                <div className="h-px flex-1 bg-zinc-800" />
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
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

              {/* Botón para cambiar a Crear Cuenta */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onSwitchToRegister) onSwitchToRegister();
                  }}
                  className="text-xs font-mono text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  ¿No tienes cuenta? <span className="font-bold text-emerald-400 hover:underline">Crear Cuenta</span>
                </button>
              </div>
            </>
          )}

        </div>

        {/* Footer del Drawer */}
        <div className="pt-4 border-t border-zinc-800 text-center text-[10px] font-mono text-zinc-500">
          <span>MyPowerUp • Sincronización en Tiempo Real</span>
        </div>

      </div>
    </>
  );
}
