import React, { useState, useRef, useEffect } from 'react';
import {
  loginWithEmail,
  loginWithGoogle,
  resetPassword,
  isFirebaseConfigured
} from '../lib/firebase';

export default function HeaderLoginDropdown({
  isOpen,
  onClose,
  onOpenRegisterScreen,
  onAuthSuccess
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [isResetMode, setIsResetMode] = useState(false);
  const dropdownRef = useRef(null);

  // Cerrar al hacer clic afuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const parseFirebaseError = (err) => {
    const code = err.code || err.message || '';
    if (code.includes('user-not-found')) return 'No existe usuario con este correo.';
    if (code.includes('wrong-password') || code.includes('invalid-credential')) return 'Contraseña o email incorrectos.';
    if (code.includes('weak-password')) return 'La contraseña debe tener al menos 6 caracteres.';
    if (code.includes('popup-closed-by-user')) return 'Ventana cerrada.';
    if (code.includes('network-request-failed')) return 'Error de conexión.';
    return err.message || 'Error al iniciar sesión.';
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      if (isResetMode) {
        if (!email) throw new Error('Ingresa tu correo para recuperar');
        await resetPassword(email);
        setMessage('Correo de recuperación enviado.');
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

  const handleGoogleSubmit = async () => {
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
    <div
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-[#070318]/95 border border-purple-500/35 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.85)] p-4 z-50 backdrop-blur-2xl font-mono text-xs animate-fade-in select-none"
    >
      {/* Glow */}
      <div className="ambient-glow-purple -top-10 -right-10 w-24 h-24 opacity-20 pointer-events-none"></div>

      {/* Cabecera */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2.5 mb-3">
        <div>
          <span className="text-[9px] text-neon-purple uppercase tracking-widest block font-bold">
            // ACCESO RÁPIDO
          </span>
          <h4 className="text-white font-bold text-xs uppercase tracking-tight">
            {isResetMode ? 'Recuperar Cuenta' : 'Iniciar Sesión'}
          </h4>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-neutral-500 hover:text-white text-[11px] p-1 transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Mensajes */}
      {error && (
        <div className="p-2 mb-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px]">
          {error}
        </div>
      )}
      {message && (
        <div className="p-2 mb-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px]">
          {message}
        </div>
      )}

      {/* Formulario */}
      <form onSubmit={handleLoginSubmit} className="space-y-2.5">
        <div>
          <label className="block text-[10px] text-neutral-400 uppercase tracking-wider mb-1 font-bold">
            Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            className="w-full bg-space-950 border border-white/15 focus:border-neon-purple focus:outline-none px-3 py-2 rounded-xl text-white text-xs font-sans placeholder:text-neutral-600"
          />
        </div>

        {!isResetMode && (
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-[10px] text-neutral-400 uppercase tracking-wider font-bold">
                Contraseña
              </label>
              <button
                type="button"
                onClick={() => { setIsResetMode(true); setError(null); }}
                className="text-[9px] text-neon-cyan hover:underline"
              >
                ¿Olvidaste?
              </button>
            </div>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-space-950 border border-white/15 focus:border-neon-purple focus:outline-none px-3 py-2 rounded-xl text-white text-xs font-sans placeholder:text-neutral-600"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-gradient-to-r from-neon-purple to-neon-violet hover:opacity-95 text-white font-bold uppercase rounded-xl shadow-md shadow-purple-600/30 transition-all text-xs tracking-wider disabled:opacity-50 cursor-pointer"
        >
          {loading
            ? 'Procesando...'
            : isResetMode
            ? 'Enviar Email'
            : 'Ingresar'}
        </button>

        {isResetMode && (
          <button
            type="button"
            onClick={() => { setIsResetMode(false); setError(null); setMessage(null); }}
            className="w-full text-center py-1 text-neutral-400 hover:text-white text-[11px] transition-colors"
          >
            ← Volver a ingresar
          </button>
        )}
      </form>

      {/* Google Sign-in */}
      {!isResetMode && isFirebaseConfigured && (
        <div className="pt-2">
          <button
            type="button"
            onClick={handleGoogleSubmit}
            disabled={loading}
            className="w-full py-2 px-3 bg-white/5 hover:bg-white/10 text-neutral-200 hover:text-white border border-white/10 rounded-xl transition-all flex items-center justify-center gap-2 text-xs font-bold disabled:opacity-50 cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
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
            <span>Google</span>
          </button>
        </div>
      )}

      {/* Enlace para Crear Cuenta (Abre pantalla completa de bienvenida / registro) */}
      <div className="border-t border-white/10 mt-3 pt-2.5 text-center">
        <button
          type="button"
          onClick={() => {
            onClose();
            onOpenRegisterScreen();
          }}
          className="text-[11px] text-neon-cyan hover:text-white font-bold transition-colors cursor-pointer"
        >
          ¿No tienes cuenta? <span className="underline">Crear Cuenta</span>
        </button>
      </div>
    </div>
  );
}
