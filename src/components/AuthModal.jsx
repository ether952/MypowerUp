import React, { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  User,
  Sparkles,
  LogIn,
  UserPlus,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Cloud,
  ShieldCheck,
  Flame
} from 'lucide-react';
import {
  loginWithEmail,
  registerWithEmail,
  loginWithGoogle,
  resetPassword,
  isFirebaseConfigured
} from '../lib/firebase';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  if (!isOpen) return null;

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [isResetMode, setIsResetMode] = useState(false);

  // Formateador de errores de Firebase en Español amigable
  const parseFirebaseError = (err) => {
    const code = err.code || err.message || '';
    if (code.includes('user-not-found')) return 'No existe una cuenta registrada con este correo.';
    if (code.includes('wrong-password') || code.includes('invalid-credential')) return 'Contraseña o correo incorrectos.';
    if (code.includes('email-already-in-use')) return 'Este correo ya está registrado. Inicia sesión.';
    if (code.includes('weak-password')) return 'La contraseña debe tener al menos 6 caracteres.';
    if (code.includes('unauthorized-domain')) return 'Dominio no autorizado. Agrega tu enlace de Vercel en Firebase > Authentication > Configuración > Dominios autorizados.';
    if (code.includes('popup-closed-by-user')) return 'Ventana de inicio de sesión con Google cerrada.';
    if (code.includes('network-request-failed')) return 'Error de conexión a internet.';
    return err.message || 'Ocurrió un error inesperado. Revisa tus datos.';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      if (isResetMode) {
        if (!email) throw new Error('Ingresa tu correo para restablecer la contraseña');
        await resetPassword(email);
        setMessage('Te enviamos un correo para restablecer tu contraseña. Revisa tu bandeja.');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in-up">
      <div className="bg-space-900/95 border border-purple-500/30 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative backdrop-blur-xl">

        {/* Glow de fondo */}
        <div className="ambient-glow-purple -top-20 -left-20 w-48 h-48 opacity-40"></div>
        <div className="ambient-glow-cyan -bottom-20 -right-20 w-48 h-48 opacity-30"></div>

        {/* Cabecera HUD */}
        <div className="relative z-10 p-6 pb-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-neon-purple to-neon-cyan flex items-center justify-center text-white font-black text-lg shadow-md shadow-purple-500/30">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-neon-cyan tracking-widest uppercase">
                // SISTEMA CLOUD SYNC
              </span>
              <h3 className="text-lg font-black text-white uppercase tracking-tight font-display">
                {isResetMode
                  ? 'Recuperar Cuenta'
                  : isLogin
                    ? 'Acceso de Usuario'
                    : 'Registro de Atleta'}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Advertencia si Firebase aún no está configurado */}
        {!isFirebaseConfigured && (
          <div className="relative z-10 mx-6 mt-4 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">// MODO LOCAL ACTIVO</p>
              <p className="text-[11px] text-amber-200/80 mt-0.5">
                Error de conexion.
              </p>
            </div>
          </div>
        )}

        {/* Selector de Pestañas: Login vs Registro */}
        {!isResetMode && (
          <div className="relative z-10 grid grid-cols-2 p-1.5 mx-6 mt-4 bg-space-950/80 rounded-xl border border-white/5 font-mono text-xs">
            <button
              type="button"
              onClick={() => { setIsLogin(true); setError(null); }}
              className={`py-2 rounded-lg font-bold transition-all uppercase flex items-center justify-center gap-2 ${isLogin
                ? 'bg-gradient-to-r from-neon-purple to-neon-violet text-white shadow-md shadow-purple-600/30'
                : 'text-neutral-400 hover:text-white'
                }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Ingresar</span>
            </button>
            <button
              type="button"
              onClick={() => { setIsLogin(false); setError(null); }}
              className={`py-2 rounded-lg font-bold transition-all uppercase flex items-center justify-center gap-2 ${!isLogin
                ? 'bg-gradient-to-r from-neon-purple to-neon-violet text-white shadow-md shadow-purple-600/30'
                : 'text-neutral-400 hover:text-white'
                }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Registrarse</span>
            </button>
          </div>
        )}

        {/* Cuerpo del Formulario */}
        <div className="relative z-10 p-6 space-y-4">

          {/* Botón de Google */}
          {!isResetMode && isFirebaseConfigured && (
            <div>
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white font-mono text-xs font-bold border border-white/15 hover:border-white/30 transition-all flex items-center justify-center gap-3 shadow-lg disabled:opacity-50"
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

              <div className="flex items-center gap-3 my-4">
                <div className="h-px flex-1 bg-white/10" />
                <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">o con tu email</span>
                <div className="h-px flex-1 bg-white/10" />
              </div>
            </div>
          )}

          {/* Mensajes de Alerta / Éxito */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-start gap-2 animate-fade-in-up">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>// ERROR: {error}</span>
            </div>
          )}

          {message && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-start gap-2 animate-fade-in-up">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>// {message}</span>
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-3.5 font-mono text-xs">

            {/* Campo Nombre (Solo en Registro) */}
            {!isLogin && !isResetMode && (
              <div className="space-y-1">
                <label className="block text-[11px] text-neutral-400 uppercase tracking-wider">
                  Nombre o Apodo
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Ej. Alex Runner"
                    className="w-full input-futuristic pl-10 pr-4 py-2.5 rounded-xl text-white text-xs font-sans placeholder:text-neutral-600"
                  />
                </div>
              </div>
            )}

            {/* Campo Correo */}
            <div className="space-y-1">
              <label className="block text-[11px] text-neutral-400 uppercase tracking-wider">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="w-full input-futuristic pl-10 pr-4 py-2.5 rounded-xl text-white text-xs font-sans placeholder:text-neutral-600"
                />
              </div>
            </div>

            {/* Campo Contraseña */}
            {!isResetMode && (
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="block text-[11px] text-neutral-400 uppercase tracking-wider">
                    Contraseña
                  </label>
                  {isLogin && (
                    <button
                      type="button"
                      onClick={() => { setIsResetMode(true); setError(null); }}
                      className="text-[10px] text-neon-cyan hover:underline transition-colors"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full input-futuristic pl-10 pr-10 py-2.5 rounded-xl text-white text-xs font-sans placeholder:text-neutral-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Botón Principal de Envío */}
            <button
              type="submit"
              disabled={loading || !isFirebaseConfigured}
              className="w-full py-3.5 mt-2 bg-gradient-to-r from-neon-purple via-neon-violet to-neon-cyan text-white font-bold uppercase rounded-xl shadow-lg shadow-purple-600/30 hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                  <span>Procesando...</span>
                </span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-neon-cyan" />
                  <span>
                    {isResetMode
                      ? 'Enviar Correo de Recuperación'
                      : isLogin
                        ? 'Iniciar Sesión'
                        : 'Crear Mi Cuenta Cloud'}
                  </span>
                </>
              )}
            </button>

            {/* Volver desde modo reset */}
            {isResetMode && (
              <button
                type="button"
                onClick={() => { setIsResetMode(false); setError(null); setMessage(null); }}
                className="w-full text-center py-2 text-neutral-400 hover:text-white text-xs transition-colors"
              >
                ← Volver al inicio de sesión
              </button>
            )}

          </form>

          {/* Información de ventajas cloud */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-neutral-400">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              Sincronización segura
            </span>
            <span>Datos en tiempo real</span>
          </div>

        </div>

      </div>
    </div>
  );
}
