import React, { useState, useEffect } from 'react';
import { X, Sparkles, Check, Key, ShieldCheck, Trash2, Cpu } from 'lucide-react';
import { getGeminiApiKey, setGeminiApiKey, estimateNutritionWithAI } from '../services/aiNutritionService';

export default function GeminiApiKeyModal({ isOpen, onClose, onToast }) {
  const [apiKey, setApiKey] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [savedKeyExists, setSavedKeyExists] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const current = getGeminiApiKey();
      setApiKey(current);
      setSavedKeyExists(!!current);
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    setGeminiApiKey(apiKey.trim());
    setSavedKeyExists(!!apiKey.trim());
    if (onToast) onToast(apiKey.trim() ? 'Clave de IA Gemini guardada con éxito' : 'Clave de IA eliminada');
    onClose();
  };

  const handleTestKey = async () => {
    if (!apiKey.trim()) {
      setTestResult({ success: false, msg: 'Ingresa una clave para probar.' });
      return;
    }
    setIsTesting(true);
    setTestResult(null);
    try {
      // Guardar temporalmente para la prueba
      const prevKey = getGeminiApiKey();
      setGeminiApiKey(apiKey.trim());
      const res = await estimateNutritionWithAI('2 huevos revueltos con tostadas');
      setGeminiApiKey(prevKey); // restaurar hasta que guarde

      if (res && res.calories > 0 && res.source === 'ai') {
        setTestResult({
          success: true,
          msg: `¡Conexión Exitosa! Detectado: "${res.summary || 'Comida'}" (${res.calories} kcal, ${res.protein}g P)`
        });
      } else {
        setTestResult({
          success: false,
          msg: 'No se pudo conectar con Gemini con esta clave. Verifica que sea válida.'
        });
      }
    } catch (err) {
      setTestResult({
        success: false,
        msg: `Error de conexión: ${err.message || 'Error desconocido'}`
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleClear = () => {
    setApiKey('');
    setGeminiApiKey('');
    setSavedKeyExists(false);
    setTestResult({ success: true, msg: 'Se restableció al motor inteligente integrado.' });
    if (onToast) onToast('Clave removida. Usando motor integrado.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-[#18181B] border border-[#2E2E34] rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-scale-up">
        {/* Encabezado */}
        <div className="flex items-center justify-between p-6 border-b border-[#2E2E34] bg-[#121214]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white uppercase tracking-wide font-display">
                Inteligencia Artificial Gemini
              </h3>
              <p className="text-xs font-mono text-[#8A8F98]">Estimación inteligente de calorías y proteínas</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-[#8A8F98] hover:text-white hover:bg-[#222226] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-5">
          <div className="p-4 rounded-2xl bg-[#121214] border border-[#2E2E34] text-xs font-mono text-[#8A8F98] space-y-2">
            <div className="flex items-center gap-2 text-white font-bold">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <span>Motor Híbrido Inteligente</span>
            </div>
            <p className="leading-relaxed">
              MyPowerUp cuenta con un <span className="text-emerald-400 font-bold">motor offline de alta velocidad</span> con más de 120 alimentos y platos. Si configuras tu clave gratuita de <span className="text-amber-400 font-bold">Google Gemini AI</span>, analizará recetas complejas, platos de restaurantes y combinaciones personalizadas al escribir.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-[#8A8F98] flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-400" />
                API Key de Google Gemini
              </span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-amber-400 hover:text-amber-300 underline font-normal lowercase"
              >
                [ obtener clave gratis ]
              </a>
            </label>

            <div className="relative">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Pega aquí tu clave (AIzaSy...)"
                className="w-full bg-[#121214] border border-[#2E2E34] focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-xl px-4 py-3 text-sm text-white font-mono placeholder-[#52525B] outline-none transition-all"
              />
            </div>
          </div>

          {/* Resultado de prueba */}
          {testResult && (
            <div
              className={`p-3.5 rounded-xl border text-xs font-mono flex items-start gap-2.5 ${
                testResult.success
                  ? 'bg-emerald-950/30 border-emerald-800 text-emerald-300'
                  : 'bg-rose-950/30 border-rose-800 text-rose-300'
              }`}
            >
              {testResult.success ? (
                <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
              ) : (
                <X className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              )}
              <span className="leading-relaxed">{testResult.msg}</span>
            </div>
          )}
        </div>

        {/* Botones de acción */}
        <div className="p-6 border-t border-[#2E2E34] bg-[#121214] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            {savedKeyExists && (
              <button
                type="button"
                onClick={handleClear}
                className="text-xs font-mono text-rose-400 hover:text-rose-300 flex items-center gap-1.5 transition-colors cursor-pointer py-2"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Eliminar Clave</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleTestKey}
              disabled={isTesting || !apiKey.trim()}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-[#2E2E34] text-xs font-mono font-bold text-white hover:bg-[#222226] transition-colors cursor-pointer disabled:opacity-50"
            >
              {isTesting ? 'Probando...' : 'Probar Clave'}
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-mono font-black text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Guardar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
