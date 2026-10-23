import React, { useState, useRef } from 'react';
import {
  Camera,
  Upload,
  Sparkles,
  X,
  Check,
  RotateCcw,
  AlertCircle,
  Info
} from 'lucide-react';
import {
  compressImageForAI,
  scanFoodWithGemini
} from '../services/foodScannerService';
import { playSatisfyingCheckSound } from '../services/audioFeedbackService';
import NutritionAnimatedBars from './NutritionAnimatedBars';
import ButtonSparkles from './ButtonSparkles';

export default function FoodScannerModal({
  isOpen,
  onClose,
  onApplyFood,
  goals = { calories: 2400, protein: 150 }
}) {
  const [imagePreview, setImagePreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [multiplier, setMultiplier] = useState(1);
  const [error, setError] = useState(null);

  // Campos editables del resultado
  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [mealType, setMealType] = useState('almuerzo');
  const [portionGrams, setPortionGrams] = useState(100);

  // Feedback de éxito al guardar
  const [isApplying, setIsApplying] = useState(false);

  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  if (!isOpen) return null;

  // Procesar imagen seleccionada (desde cámara o galería)
  const handleProcessFile = async (file) => {
    if (!file) return;

    setError(null);
    setScanResult(null);
    setMultiplier(1);
    setIsAnalyzing(true);

    try {
      const compressed = await compressImageForAI(file, 1024, 0.82);
      setImagePreview(compressed.dataUrl);

      const result = await scanFoodWithGemini(compressed.cleanBase64, compressed.mimeType);

      if (result.success && result.data) {
        populateResult(result.data);
      } else {
        setError(result.message || 'No se pudo analizar el alimento de la foto.');
      }
    } catch (err) {
      console.error('Error al procesar imagen:', err);
      setError(err.message || 'Error al capturar la imagen de la cámara.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const populateResult = (data) => {
    setScanResult(data);
    setFoodName(data.foodName || 'Alimento detectado');
    setCalories(String(data.calories || 0));
    setProtein(String(data.protein || 0));
    setCarbs(String(data.carbs || 0));
    setFat(String(data.fat || 0));
    setPortionGrams(data.portionGrams || 100);
    setMealType(data.suggestedMealType || 'almuerzo');
    setMultiplier(1);
  };

  // Ajustar multiplicador de porción (ej: 0.5x, 1x, 1.5x, 2x)
  const handleMultiplierChange = (newMult) => {
    if (!scanResult) return;
    setMultiplier(newMult);
    setCalories(String(Math.round(scanResult.calories * newMult)));
    setProtein(String(Math.round(scanResult.protein * newMult * 10) / 10));
    setCarbs(String(Math.round(scanResult.carbs * newMult * 10) / 10));
    setFat(String(Math.round(scanResult.fat * newMult * 10) / 10));
    setPortionGrams(Math.round(scanResult.portionGrams * newMult));
  };

  // Aplicar datos y registrar en el día
  const handleConfirm = () => {
    if (!foodName.trim()) return;

    setIsApplying(true);
    playSatisfyingCheckSound();

    const payload = {
      name: foodName.trim(),
      calories: Math.max(0, Number(calories) || 0),
      protein: Math.max(0, Number(protein) || 0),
      carbs: Math.max(0, Number(carbs) || 0),
      fat: Math.max(0, Number(fat) || 0),
      mealType: mealType || 'almuerzo',
      portionGrams: Number(portionGrams) || 100,
      source: 'scanner-ai'
    };

    setTimeout(() => {
      onApplyFood(payload);
      onClose();
      setIsApplying(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      {/* Inputs ocultos para Cámara y Galería */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.[0]) handleProcessFile(e.target.files[0]);
          e.target.value = '';
        }}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.[0]) handleProcessFile(e.target.files[0]);
          e.target.value = '';
        }}
      />

      <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.85)] overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Cabecera Limpia sin Llaves ni configuraciones */}
        <div className="px-5 py-4 border-b border-zinc-800/80 bg-zinc-900/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-1.5 font-display">
                ESCANEAR ALIMENTO
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold uppercase">
                  Cámara IA
                </span>
              </h3>
              <p className="text-[11px] font-mono text-zinc-400">
                Apunta al plato o alimento para calcular calorías y proteínas
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800/80 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Contenido scrolleable */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 custom-scrollbar">

          {/* Visor de Cámara / Foto Capturada */}
          <div className="relative rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900 aspect-video flex items-center justify-center group">
            {imagePreview ? (
              <>
                <img
                  src={imagePreview}
                  alt="Alimento escaneado"
                  className="w-full h-full object-cover"
                />

                {/* Láser de escaneo animado cuando isAnalyzing es true */}
                {isAnalyzing && (
                  <div className="absolute inset-0 bg-emerald-950/20 backdrop-blur-[1px] flex flex-col items-center justify-center">
                    <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10b981] animate-pulse top-1/2 -translate-y-1/2" />
                    <div className="relative z-10 px-4 py-2 rounded-full bg-black/80 border border-emerald-500/40 text-emerald-400 font-mono text-xs font-bold flex items-center gap-2 shadow-xl">
                      <Sparkles className="w-3.5 h-3.5 animate-spin" />
                      <span>Analizando comida y calculando macros...</span>
                    </div>
                  </div>
                )}

                {/* Botón flotante para cambiar foto */}
                {!isAnalyzing && (
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="absolute bottom-2.5 right-2.5 px-3 py-1.5 rounded-xl bg-black/75 hover:bg-black text-white border border-zinc-700/80 text-[11px] font-mono flex items-center gap-1.5 backdrop-blur-md transition-all cursor-pointer shadow-lg"
                  >
                    <RotateCcw className="w-3 h-3 text-emerald-400" />
                    <span>Tomar Otra</span>
                  </button>
                )}
              </>
            ) : (
              <div className="text-center p-6 space-y-4">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center text-zinc-400 group-hover:text-emerald-400 group-hover:border-emerald-500/40 transition-all">
                  <Camera className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-200 font-mono uppercase tracking-wider">
                    Toma una foto de tu plato o alimento
                  </p>
                  <p className="text-[11px] text-zinc-400 mt-1 max-w-xs mx-auto">
                    La IA calculará automáticamente las proteínas y calorías con barras animadas.
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs font-mono rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-lg hover:shadow-emerald-500/20 active:scale-95"
                  >
                    <Camera className="w-4 h-4" />
                    <span>ABRIR CÁMARA</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs font-mono rounded-xl flex items-center gap-2 transition-all cursor-pointer border border-zinc-700 active:scale-95"
                  >
                    <Upload className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Galería</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mensaje de error si la imagen no se reconoció */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1 space-y-1">
                <p className="font-semibold">{error}</p>
                <p className="text-[11px] text-rose-300/80 font-mono">
                  Prueba tomando la foto de nuevo con buena luz y el plato enfocado de frente.
                </p>
              </div>
            </div>
          )}

          {/* BARRAS ANIMADAS DE NUTRICIÓN + RESULTADO DETECTADO */}
          {scanResult && !isAnalyzing && (
            <div className="space-y-4 pt-1 animate-fade-in-up">
              
              {/* BARRAS ANIMADAS: Proteínas arriba (primero), Calorías abajo (después) + Estrellitas */}
              <NutritionAnimatedBars
                calories={Number(calories) || 0}
                targetCalories={goals?.calories || 2400}
                protein={Number(protein) || 0}
                targetProtein={goals?.protein || 150}
              />

              {/* Nombre y Tipo de Comida */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold block">
                  Alimento Detectado
                </label>
                <input
                  type="text"
                  value={foodName}
                  onChange={(e) => setFoodName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700/80 text-white text-sm font-semibold focus:outline-none focus:border-emerald-500 transition-colors"
                  placeholder="Nombre del alimento"
                />
              </div>

              {/* Selector de Momento del Día */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold block">
                  Momento del día
                </label>
                <div className="grid grid-cols-5 gap-1 font-mono text-[11px]">
                  {['desayuno', 'almuerzo', 'merienda', 'cena', 'snack'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setMealType(type)}
                      className={`py-1.5 px-1 rounded-lg text-center uppercase font-bold transition-all cursor-pointer ${
                        mealType === type
                          ? 'bg-emerald-500 text-black shadow-sm'
                          : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ajuste Rápido de Porción */}
              <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-400 font-bold uppercase text-[10px]">
                    Tamaño de porción:
                  </span>
                  <span className="text-emerald-400 font-bold">
                    ~{portionGrams}g ({scanResult.portionDescription || 'plato'})
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-1.5 font-mono text-[11px]">
                  {[
                    { mult: 0.5, label: '0.5x Media' },
                    { mult: 1, label: '1x Estándar' },
                    { mult: 1.5, label: '1.5x Grande' },
                    { mult: 2, label: '2x Doble' }
                  ].map(({ mult, label }) => (
                    <button
                      key={mult}
                      type="button"
                      onClick={() => handleMultiplierChange(mult)}
                      className={`py-1.5 rounded-xl text-center font-bold transition-all cursor-pointer ${
                        multiplier === mult
                          ? 'bg-zinc-200 text-black shadow-sm'
                          : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notas de la IA */}
              {scanResult.notes && (
                <div className="text-[11px] font-mono text-zinc-400 bg-zinc-900/40 border border-zinc-800/60 p-2.5 rounded-xl flex items-start gap-2">
                  <Info className="w-3.5 h-3.5 text-zinc-500 shrink-0 mt-0.5" />
                  <span>{scanResult.notes}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pie de Página con Botones de Acción */}
        <div className="p-4 border-t border-zinc-800/80 bg-zinc-900/60 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-mono font-bold text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            Cancelar
          </button>

          {scanResult ? (
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isApplying}
              className={`relative overflow-visible px-6 py-2.5 font-bold text-xs tracking-wider uppercase rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer font-mono ${
                isApplying
                  ? 'bg-emerald-600 text-white shadow-emerald-500/40 ring-2 ring-emerald-400'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20'
              }`}
            >
              <ButtonSparkles active={isApplying} />
              {isApplying ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>¡REGISTRADO!</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>REGISTRAR ALIMENTO</span>
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs font-mono rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-lg active:scale-95"
            >
              <Camera className="w-4 h-4" />
              <span>TOMAR FOTO</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
