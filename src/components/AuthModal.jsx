import React, { useState, useEffect } from 'react';
import { Zap, X, ArrowLeft, Mail, Lock, User as UserIcon } from 'lucide-react';
import {
  loginWithEmail,
  registerWithEmail,
  loginWithGoogle,
  resetPassword
} from '../lib/firebase';

export default function AuthModal({
  isOpen,
  onClose,
  initialMode = 'login',
  onAuthSuccess
}) {
  if (!isOpen) return null;

  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [isResetMode, setIsResetMode] = useState(false);

  useEffect(() => {
    setIsLogin(initialMode === 'login');
    setError(null);
    setMessage(null);
    setIsResetMode(false);
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in select-none">
      
      {/* Fondo clickeable para cerrar */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Tarjeta Modal Principal */}
      <div className="relative w-full max-w-md bg-white border border-zinc-200 rounded-3xl shadow-2xl p-6 sm:p-8 z-10 text-zinc-900 animate-scale-up">
        
        {/* Botón de Cierre */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-500 hover:text-black flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Encabezado con Logo */}
        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-black flex items-center justify-center text-white shadow-sm">
              <Zap className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="text-xl font-black font-display tracking-tight text-zinc-900 uppercase select-none">
              MYPOWER<span className="text-emerald-500">UP</span>
            </span>
          </div>

          {/* Selector de Pestañas: Login vs Registro */}
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

          <div>
            <h3 className="text-2xl font-black text-zinc-900 uppercase tracking-tight font-display">
              {isResetMode
                ? 'Recuperar Contraseña'
                : isLogin
                  ? 'Bienvenido de vuelta'
                  : 'Crea tu Cuenta'}
            </h3>
            <p className="text-xs font-sans text-zinc-500 mt-1">
              {isResetMode
                ? 'Te enviaremos un correo para restablecer tu contraseña.'
                : isLogin
                  ? 'Ingresa tus credenciales para sincronizar tu progreso.'
                  : 'Regístrate para guardar tus entrenamientos y nutrición en la nube.'}
            </p>
          </div>
        </div>

        {/* Mensajes de Estado / Error */}
        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-mono">
            {error}
          </div>
        )}

        {message && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-mono">
            {message}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-3.5 font-mono text-xs">

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
            className="w-full py-3.5 mt-2 bg-black hover:bg-zinc-800 text-white font-bold uppercase rounded-xl shadow-md transition-all text-xs tracking-wider disabled:opacity-50 cursor-pointer"
          >
            {loading
              ? 'Procesando...'
              : isResetMode
                ? 'Enviar Enlace de Recuperación'
                : isLogin
                  ? 'Ingresar a mi Cuenta'
                  : 'Crear Mi Cuenta Gratis'}
          </button>

          {isResetMode && (
            <button
              type="button"
              onClick={() => { setIsResetMode(false); setError(null); setMessage(null); }}
              className="w-full text-center py-1 text-zinc-500 hover:text-black text-xs transition-colors cursor-pointer flex items-center justify-center gap-1 font-bold"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Volver a Iniciar Sesión</span>
            </button>
          )}

        </form>

        {/* Separador y Google Login */}
        {!isResetMode && (
          <>
            <div className="flex items-center gap-2 my-4">
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

    </div>
  );
}
