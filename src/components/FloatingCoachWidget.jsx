import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Sparkles,
  X,
  Send,
  Bot,
  User as UserIcon,
  ChevronDown,
  RefreshCw,
  Zap,
  Dumbbell,
  Utensils,
  Maximize2,
  KeyRound
} from 'lucide-react';
import { askAiCoach } from '../services/aiCoachService';
import { getGeminiApiKey, setGeminiApiKey } from '../services/aiNutritionService';
import { getSavedCoachProfile } from '../utils/routineTemplates';
import powerUpLogoImg from '../assets/logo-mypowerup.png';

export default function FloatingCoachWidget({
  data = {},
  selectedDate = null,
  todayNutrition = { calories: 0, protein: 0 },
  targetNutrition = { calories: 2400, protein: 150 },
  activeRoutine = null,
  onNavigateToRoutines = null
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'model',
      content: '¡Hola! Soy tu **Coach MyPowerUp**. ¿En qué puedo ayudarte hoy? Tengo acceso completo a tus ejercicios cargados, series, pesos y nutrición diaria. ¡Pregúntame lo que necesites!'
    }
  ]);

  const messagesEndRef = useRef(null);

  const [hideForScanner, setHideForScanner] = useState(false);

  // Escuchar si el modal de escaneo con IA de alimentos se abre/cierra para ocultar este widget flotante
  useEffect(() => {
    const handleScannerState = (e) => {
      setHideForScanner(Boolean(e.detail?.open));
    };

    window.addEventListener('mypowerup_scanner_modal_change', handleScannerState);
    return () => {
      window.removeEventListener('mypowerup_scanner_modal_change', handleScannerState);
    };
  }, []);

  // Auto-scroll al final de mensajes
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (customText = null) => {
    const textToSend = customText || inputMessage;
    if (!textToSend.trim() || loading) return;

    const newMsg = { role: 'user', content: textToSend.trim() };
    const updatedHistory = [...messages, newMsg];
    setMessages(updatedHistory);
    if (!customText) setInputMessage('');
    setLoading(true);

    try {
      const profile = getSavedCoachProfile();
      const userContext = {
        data,
        selectedDate,
        profile,
        todayNutrition,
        targetNutrition,
        activeRoutine
      };

      const aiResponse = await askAiCoach(textToSend.trim(), updatedHistory, userContext);
      setMessages([...updatedHistory, { role: 'model', content: aiResponse }]);
    } catch (err) {
      console.warn('Error querying Coach:', err);
      setMessages([
        ...updatedHistory,
        {
          role: 'model',
          content: 'Disculpa, ocurrió un error temporal al conectar con el servidor. Pero recuerda: mantén tu ingesta de proteínas alta y entrena con sobrecarga controlada.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    { text: '¿Qué opinas de mis ejercicios de hoy?', icon: <Dumbbell className="w-3 h-3 text-emerald-400" /> },
    { text: '¿Qué puedo comer post-entreno?', icon: <Utensils className="w-3 h-3 text-emerald-400" /> },
    { text: '¿Qué me toca entrenar hoy?', icon: <Zap className="w-3 h-3 text-cyan-400" /> }
  ];

  if (hideForScanner) {
    return null;
  }

  return (
    <>
      {/* Botón Flotante en la esquina inferior derecha (FAB) */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Abrir Coach Inteligente"
          title="Coach"
          className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-50 w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center bg-zinc-900 hover:bg-black text-white rounded-full border border-emerald-500/40 shadow-[0_8px_30px_rgb(0,0,0,0.35)] hover:shadow-[0_8px_30px_rgba(16,185,129,0.35)] transition-all duration-300 cursor-pointer group hover:scale-110 active:scale-95 select-none"
        >
          <div className="relative flex items-center justify-center">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center">
              <img
                src={powerUpLogoImg}
                alt="Coach"
                className="w-5 h-5 sm:w-6 sm:h-6 object-contain group-hover:rotate-12 transition-transform duration-300"
              />
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-zinc-900" />
          </div>
        </button>
      )}

      {/* Ventana Flotante / Popover del Coach */}
      {isOpen && (
        <div className="fixed bottom-20 right-3 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-1.5rem)] sm:w-[420px] max-h-[75vh] sm:max-h-[85vh] h-[580px] bg-[#121214] border border-[#2E2E34] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-fade-in-up font-sans select-none">

          {/* Header del Chat */}
          <div className="px-4 py-3.5 bg-[#18181B] border-b border-[#2E2E34] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                <img src={powerUpLogoImg} alt="Coach Logo" className="w-5 h-5 object-contain" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold font-display text-white text-sm uppercase tracking-tight">
                    Coach MyUp
                  </span>
                </div>
                <span className="text-[10px] font-mono text-zinc-400 block">
                  Entrenamiento & Nutrición de Precisión
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {onNavigateToRoutines && (
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onNavigateToRoutines();
                  }}
                  title="Abrir Vista Completa de Rutinas & Coach"
                  className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Minimizar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mini HUD de Estado Rápido del Usuario */}
          <div className="px-4 py-2 bg-[#18181B]/60 border-b border-[#2E2E34] font-mono text-[10px] text-zinc-400 flex items-center justify-between shrink-0">
            <span>
              Kcal: <strong className="text-white">{todayNutrition.calories || 0}</strong> / {targetNutrition.calories || 2400}
            </span>
            <span>
              Prot: <strong className="text-emerald-400">{todayNutrition.protein || 0}g</strong> / {targetNutrition.protein || 150}g
            </span>
            <span className="text-zinc-500 truncate max-w-[120px]">
              {activeRoutine ? activeRoutine.name.split('(')[0] : 'Rutina Activa'}
            </span>
          </div>

          {/* Cuerpo de Mensajes */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 font-sans text-xs bg-[#0E0E11]/80">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'model' && (
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl leading-relaxed select-text ${msg.role === 'user'
                    ? 'bg-emerald-500 text-black font-semibold rounded-br-none shadow-md'
                    : 'bg-[#18181B] text-zinc-200 border border-[#2E2E34] rounded-bl-none shadow-sm'
                    }`}
                >
                  <div className="whitespace-pre-line prose-invert text-xs space-y-1">
                    {msg.content}
                  </div>
                </div>

                {msg.role === 'user' && (
                  <div className="w-6 h-6 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0 mt-0.5 text-zinc-300">
                    <UserIcon className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-2.5 justify-start items-center">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <RefreshCw className="w-3 h-3 text-emerald-400 animate-spin" />
                </div>
                <div className="bg-[#18181B] text-zinc-400 px-3.5 py-2 rounded-2xl border border-[#2E2E34] text-xs font-mono flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                  <span className="ml-1 text-[10px]">El Coach está analizando...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Sugerencias Rápidas */}
          <div className="px-3 py-2 bg-[#141417] border-t border-[#222226] flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(p.text)}
                disabled={loading}
                className="px-2.5 py-1 bg-[#1E1E24] hover:bg-[#282830] text-zinc-300 hover:text-white rounded-lg text-[10px] font-mono whitespace-nowrap border border-[#2E2E34] flex items-center gap-1 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
              >
                {p.icon}
                <span>{p.text}</span>
              </button>
            ))}
          </div>

          {/* Input de Mensaje */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-[#18181B] border-t border-[#2E2E34] flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Pregúntale a tu coach (ej: ¿Qué cenar alto en proteína?)..."
              disabled={loading}
              className="flex-1 bg-[#0E0E12] border border-[#2E2E34] focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || loading}
              className="p-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-800 text-black disabled:text-zinc-600 rounded-xl transition-all cursor-pointer disabled:cursor-not-allowed shadow-md"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}
    </>
  );
}
