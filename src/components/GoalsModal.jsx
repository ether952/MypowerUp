import React, { useState, useEffect } from 'react';
import { X, Sliders, User, Sparkles, Activity, Dumbbell, Flame, Check } from 'lucide-react';
import { getSavedCoachProfile, saveCoachProfile } from '../utils/routineTemplates';

export default function GoalsModal({ isOpen, onClose, currentGoals, onSaveGoals }) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'nutrition'

  // Metas Diarias
  const [calories, setCalories] = useState(currentGoals.calories || 2400);
  const [protein, setProtein] = useState(currentGoals.protein || 150);
  const [tonnage, setTonnage] = useState(currentGoals.tonnage || 100);

  // Perfil del Atleta
  const [profile, setProfile] = useState(() => getSavedCoachProfile());

  // Cálculos de métricas sugeridas
  const heightM = (profile.heightCm || 175) / 100;
  const imc = (profile.weightKg / (heightM * heightM)).toFixed(1);
  const tmb = Math.round(
    profile.gender === 'mujer'
      ? 10 * profile.weightKg + 6.25 * profile.heightCm - 5 * profile.age - 161
      : 10 * profile.weightKg + 6.25 * profile.heightCm - 5 * profile.age + 5
  );

  const suggestedCalories = Math.round(
    profile.goal === 'definicion'
      ? tmb * 1.4 - 400
      : profile.goal === 'hipertrofia'
      ? tmb * 1.5 + 300
      : tmb * 1.45
  );
  const suggestedProtein = Math.round(profile.weightKg * 2.0);

  const handleApplySuggestedMacros = () => {
    setCalories(suggestedCalories);
    setProtein(suggestedProtein);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Guardar perfil del Coach
    saveCoachProfile(profile);

    // Disparar evento para que otras vistas se enteren si cambiaron los días/objetivo
    window.dispatchEvent(new CustomEvent('mypowerup_coach_profile_updated', { detail: profile }));

    // Guardar Metas
    onSaveGoals({
      calories: Number(calories) || 2400,
      protein: Number(protein) || 150,
      tonnage: Number(tonnage) || 100,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in font-sans">
      <div className="bg-[#121214] border border-[#2E2E34] w-full max-w-lg rounded-3xl shadow-2xl p-6 sm:p-7 space-y-5 relative text-white animate-fade-in-up">
        
        {/* Cabecera */}
        <div className="flex justify-between items-center border-b border-[#2E2E34] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-emerald-400 tracking-widest uppercase font-bold px-2 py-0.5 bg-emerald-500/10 rounded-md border border-emerald-500/20">
                CONFIGURACIÓN
              </span>
            </div>
            <h3 className="text-xl font-extrabold text-white uppercase tracking-tight font-display mt-1">
              Perfil de Atleta & Metas
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="text-[#8A8F98] hover:text-white p-2 rounded-xl hover:bg-[#222226] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selector de Pestañas */}
        <div className="flex items-center gap-1.5 p-1 bg-[#18181B] border border-[#2E2E34] rounded-2xl font-mono text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-2 rounded-xl font-bold uppercase transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-emerald-500 text-black shadow-sm'
                : 'text-[#8A8F98] hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Perfil & Rutinas</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('nutrition')}
            className={`flex-1 py-2 rounded-xl font-bold uppercase transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'nutrition'
                ? 'bg-emerald-500 text-black shadow-sm'
                : 'text-[#8A8F98] hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Metas Diarias</span>
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
          
          {/* TAB 1: PERFIL DEL ATLETA */}
          {activeTab === 'profile' && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Objetivo Principal */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="block uppercase text-zinc-400 font-bold text-[11px]">
                    Objetivo Principal
                  </label>
                  <select
                    value={profile.goal}
                    onChange={(e) => setProfile({ ...profile, goal: e.target.value })}
                    className="w-full bg-[#18181B] border border-[#2E2E34] focus:border-emerald-500 px-3.5 py-2.5 rounded-xl text-white font-bold outline-none transition-colors"
                  >
                    <option value="hipertrofia">Hipertrofia (Ganar Masa Muscular)</option>
                    <option value="definicion">Definición (Perder Grasa / Definir)</option>
                    <option value="fuerza">Fuerza Máxima (Powerlifting / Básicos)</option>
                    <option value="salud">Salud & Recomposición Corporal</option>
                  </select>
                </div>

                {/* Días Semanales */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="block uppercase text-zinc-400 font-bold text-[11px]">
                    Días de Entrenamiento Semanal
                  </label>
                  <select
                    value={profile.daysPerWeek}
                    onChange={(e) => setProfile({ ...profile, daysPerWeek: Number(e.target.value) })}
                    className="w-full bg-[#18181B] border border-[#2E2E34] focus:border-emerald-500 px-3.5 py-2.5 rounded-xl text-white font-bold outline-none transition-colors"
                  >
                    <option value={3}>3 Días (Full Body Completo)</option>
                    <option value={4}>4 Días (Torso / Pierna Frecuencia 2)</option>
                    <option value={5}>5 Días (Push / Pull / Legs / Torso / Pierna)</option>
                  </select>
                </div>

                {/* Peso (kg) */}
                <div className="space-y-1.5">
                  <label className="block uppercase text-zinc-400 font-bold text-[11px]">
                    Peso Corporal (Kg)
                  </label>
                  <input
                    type="number"
                    min="30"
                    max="300"
                    step="0.1"
                    value={profile.weightKg}
                    onChange={(e) => setProfile({ ...profile, weightKg: Number(e.target.value) || 0 })}
                    className="w-full bg-[#18181B] border border-[#2E2E34] focus:border-emerald-500 px-3.5 py-2.5 rounded-xl text-white font-bold outline-none transition-colors"
                    required
                  />
                </div>

                {/* Altura (cm) */}
                <div className="space-y-1.5">
                  <label className="block uppercase text-zinc-400 font-bold text-[11px]">
                    Altura (cm)
                  </label>
                  <input
                    type="number"
                    min="100"
                    max="250"
                    value={profile.heightCm}
                    onChange={(e) => setProfile({ ...profile, heightCm: Number(e.target.value) || 0 })}
                    className="w-full bg-[#18181B] border border-[#2E2E34] focus:border-emerald-500 px-3.5 py-2.5 rounded-xl text-white font-bold outline-none transition-colors"
                    required
                  />
                </div>

                {/* Nivel */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="block uppercase text-zinc-400 font-bold text-[11px]">
                    Nivel de Experiencia
                  </label>
                  <select
                    value={profile.experienceLevel}
                    onChange={(e) => setProfile({ ...profile, experienceLevel: e.target.value })}
                    className="w-full bg-[#18181B] border border-[#2E2E34] focus:border-emerald-500 px-3.5 py-2.5 rounded-xl text-white font-bold outline-none transition-colors"
                  >
                    <option value="principiante">Principiante (0 - 1 año de gym)</option>
                    <option value="intermedio">Intermedio (1 - 3 años de gym)</option>
                    <option value="avanzado">Avanzado (+3 años de entrenamiento serio)</option>
                  </select>
                </div>
              </div>

              {/* HUD de Métricas Calculadas */}
              <div className="bg-[#18181B] border border-[#2E2E34] rounded-2xl p-3.5 space-y-2.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-zinc-400">IMC: <strong className="text-white">{imc} kg/m²</strong></span>
                  <span className="text-zinc-400">Tasa Metabólica: <strong className="text-white">{tmb} kcal</strong></span>
                </div>
                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-[#2E2E34]">
                  <span className="text-emerald-400">Sugerido: <strong>{suggestedCalories} kcal</strong> / <strong>{suggestedProtein}g prot</strong></span>
                  <button
                    type="button"
                    onClick={handleApplySuggestedMacros}
                    className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold underline cursor-pointer"
                  >
                    Aplicar a mis Metas
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: METAS NUTRICIONALES & CARGAS */}
          {activeTab === 'nutrition' && (
            <div className="space-y-4 animate-fade-in">
              <div className="space-y-1.5">
                <label className="block uppercase text-zinc-400 font-bold text-[11px]">
                  Meta Diaria de Calorías (Kcal)
                </label>
                <input
                  type="number"
                  min="500"
                  max="10000"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  className="w-full bg-[#18181B] border border-[#2E2E34] focus:border-emerald-500 px-3.5 py-2.5 rounded-xl text-white font-bold outline-none transition-colors"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block uppercase text-zinc-400 font-bold text-[11px]">
                  Meta Diaria de Proteína (g)
                </label>
                <input
                  type="number"
                  min="20"
                  max="500"
                  value={protein}
                  onChange={(e) => setProtein(e.target.value)}
                  className="w-full bg-[#18181B] border border-[#2E2E34] focus:border-emerald-500 px-3.5 py-2.5 rounded-xl text-white font-bold outline-none transition-colors"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block uppercase text-zinc-400 font-bold text-[11px]">
                  Meta Diaria de Carga / Tonnage Gym (Kg)
                </label>
                <input
                  type="number"
                  min="10"
                  max="5000"
                  step="5"
                  value={tonnage}
                  onChange={(e) => setTonnage(e.target.value)}
                  className="w-full bg-[#18181B] border border-[#2E2E34] focus:border-emerald-500 px-3.5 py-2.5 rounded-xl text-white font-bold outline-none transition-colors"
                  required
                />
              </div>
            </div>
          )}

          {/* Botones Inferiores */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#2E2E34]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[#8A8F98] hover:text-white uppercase tracking-wider transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold uppercase rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Guardar Configuración</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
