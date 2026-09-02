import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft,
  ChevronRight,
  Download, 
  Upload, 
  Trash2,
  Sliders,
  Sparkles
} from 'lucide-react';

import DailyView from './components/DailyView';
import ChartsView from './components/ChartsView';
import HistoryView from './components/HistoryView';
import GoalsModal from './components/GoalsModal';
import { 
  getLocalDateString, 
  formatDisplayDate, 
  shiftDate 
} from './utils/helpers';

export default function App() {
  const [selectedDate, setSelectedDate] = useState(() => getLocalDateString());
  const [activeTab, setActiveTab] = useState('daily');

  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem('mypowerup_data');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading data', e);
    }
    return {};
  });

  const [goals, setGoals] = useState(() => {
    try {
      const saved = localStorage.getItem('mypowerup_goals');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading goals', e);
    }
    return { calories: 2400, protein: 150, tonnage: 5000 };
  });

  const [isGoalsOpen, setIsGoalsOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const fileInputRef = useRef(null);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    localStorage.setItem('mypowerup_data', JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    localStorage.setItem('mypowerup_goals', JSON.stringify(goals));
  }, [goals]);

  const currentDay = data[selectedDate] || { foods: [], workouts: [] };

  const handleAddFood = (food) => {
    const newFood = { id: Date.now(), ...food };
    setData((prev) => ({
      ...prev,
      [selectedDate]: {
        ...currentDay,
        foods: [...(currentDay.foods || []), newFood],
      },
    }));
    showToast(`Guardado: ${food.name}`);
  };

  const handleDeleteFood = (id) => {
    setData((prev) => ({
      ...prev,
      [selectedDate]: {
        ...currentDay,
        foods: (currentDay.foods || []).filter((item) => item.id !== id),
      },
    }));
    showToast('Registro eliminado');
  };

  const handleAddWorkout = (workout) => {
    const newWorkout = { id: Date.now(), ...workout };
    setData((prev) => ({
      ...prev,
      [selectedDate]: {
        ...currentDay,
        workouts: [...(currentDay.workouts || []), newWorkout],
      },
    }));
    showToast(`Guardado: ${workout.name}`);
  };

  const handleDeleteWorkout = (id) => {
    setData((prev) => ({
      ...prev,
      [selectedDate]: {
        ...currentDay,
        workouts: (currentDay.workouts || []).filter((item) => item.id !== id),
      },
    }));
    showToast('Ejercicio eliminado');
  };

  const handleClearAllData = () => {
    if (window.confirm('¿Vaciar todos los datos de la aplicación?')) {
      setData({});
      localStorage.removeItem('mypowerup_data');
      showToast('Todos los datos han sido borrados');
    }
  };

  const handleExportData = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify({ data, goals, version: '3.0' }, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `mypowerup_${getLocalDateString()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Backup exportado');
  };

  const handleImportData = (e) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target.result);
          if (parsed.data) {
            setData(parsed.data);
            if (parsed.goals) setGoals(parsed.goals);
          } else {
            setData(parsed);
          }
          showToast('Backup restaurado correctamente');
        } catch (err) {
          showToast('Error al importar archivo');
        }
      };
    }
  };

  const handleSelectDateFromHistory = (dateStr) => {
    setSelectedDate(dateStr);
    setActiveTab('daily');
  };

  return (
    <div className="min-h-screen bg-space-950 text-neutral-100 flex flex-col font-sans selection:bg-neon-purple selection:text-white relative">
      
      {/* Toast HUD */}
      {toast && (
        <div className="fixed bottom-8 right-8 z-50 px-5 py-3 rounded-xl bg-neon-purple/90 text-white font-mono text-xs font-bold tracking-wider shadow-2xl backdrop-blur-md animate-fade-in-up border border-neon-violet">
          <span>// {toast}</span>
        </div>
      )}

      {/* HEADER HUD FUTURISTA */}
      <header className="sticky top-0 z-40 bg-space-950/80 backdrop-blur-2xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Logo & Marca */}
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-neon-purple to-neon-cyan flex items-center justify-center text-white font-black text-xl shadow-lg shadow-purple-500/20">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black tracking-tight text-white uppercase font-display">
                  MYPOWERUP
                </h1>
                <span className="text-[10px] font-mono tracking-widest text-neon-cyan px-2 py-0.5 rounded bg-neon-cyan/10 border border-neon-cyan/20">
                  SYSTEM v3
                </span>
              </div>
            </div>
          </div>

          {/* Navegación de Pestañas HUD */}
          <nav className="flex items-center gap-1 sm:gap-2 bg-space-900/90 border border-white/10 p-1.5 rounded-xl font-mono text-xs">
            <button
              onClick={() => setActiveTab('daily')}
              className={`px-4 py-2 rounded-lg font-bold tracking-wider transition-all uppercase ${
                activeTab === 'daily'
                  ? 'bg-gradient-to-r from-neon-purple to-neon-violet text-white shadow-md shadow-purple-600/30'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              01 // REGISTRO
            </button>

            <button
              onClick={() => setActiveTab('charts')}
              className={`px-4 py-2 rounded-lg font-bold tracking-wider transition-all uppercase ${
                activeTab === 'charts'
                  ? 'bg-gradient-to-r from-neon-purple to-neon-violet text-white shadow-md shadow-purple-600/30'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              02 // GRÁFICOS
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 rounded-lg font-bold tracking-wider transition-all uppercase ${
                activeTab === 'history'
                  ? 'bg-gradient-to-r from-neon-purple to-neon-violet text-white shadow-md shadow-purple-600/30'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              03 // HISTORIAL
            </button>
          </nav>

          {/* Selector de Fecha & Controles */}
          <div className="flex items-center gap-3">
            
            {/* Control de Fecha */}
            <div className="flex items-center bg-space-900 border border-white/10 rounded-xl p-1 text-xs font-mono">
              <button
                onClick={() => setSelectedDate(shiftDate(selectedDate, -1))}
                className="p-1.5 hover:text-neon-cyan transition-colors"
                title="Día anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={() => setSelectedDate(getLocalDateString())}
                className="px-2 py-1 text-neutral-400 hover:text-white uppercase font-bold text-[11px]"
              >
                Hoy
              </button>

              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-white px-2 py-1 focus:outline-none cursor-pointer text-xs font-mono font-bold"
              />

              <button
                onClick={() => setSelectedDate(shiftDate(selectedDate, 1))}
                className="p-1.5 hover:text-neon-cyan transition-colors"
                title="Día siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Acciones */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsGoalsOpen(true)}
                className="p-2.5 bg-space-900 hover:bg-space-850 text-neutral-300 hover:text-neon-purple rounded-xl border border-white/10 transition-colors"
                title="Configurar Metas"
              >
                <Sliders className="w-4 h-4" />
              </button>

              <button
                onClick={handleExportData}
                className="p-2.5 bg-space-900 hover:bg-space-850 text-neutral-300 hover:text-white rounded-xl border border-white/10 transition-colors"
                title="Exportar Backup"
              >
                <Download className="w-4 h-4" />
              </button>

              <label
                className="p-2.5 bg-space-900 hover:bg-space-850 text-neutral-300 hover:text-white rounded-xl border border-white/10 transition-colors cursor-pointer"
                title="Importar Backup"
              >
                <Upload className="w-4 h-4" />
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImportData} 
                  accept=".json" 
                  className="hidden" 
                />
              </label>

              {Object.keys(data).length > 0 && (
                <button
                  onClick={handleClearAllData}
                  className="p-2.5 bg-space-900 hover:bg-space-850 text-neutral-500 hover:text-rose-400 rounded-xl border border-white/10 transition-colors"
                  title="Vaciar Datos"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

          </div>

        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="w-full flex-1">
        {activeTab === 'daily' && (
          <DailyView
            currentDay={currentDay}
            selectedDate={selectedDate}
            onAddFood={handleAddFood}
            onDeleteFood={handleDeleteFood}
            onAddWorkout={handleAddWorkout}
            onDeleteWorkout={handleDeleteWorkout}
          />
        )}

        {activeTab === 'charts' && (
          <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8">
            <ChartsView
              data={data}
              goals={goals}
              onSelectDate={handleSelectDateFromHistory}
            />
          </div>
        )}

        {activeTab === 'history' && (
          <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8">
            <HistoryView
              data={data}
              goals={goals}
              onSelectDate={handleSelectDateFromHistory}
            />
          </div>
        )}
      </main>

      {/* Modal de Metas */}
      <GoalsModal
        isOpen={isGoalsOpen}
        onClose={() => setIsGoalsOpen(false)}
        currentGoals={goals}
        onSaveGoals={(newGoals) => {
          setGoals(newGoals);
          showToast('Metas guardadas');
        }}
      />

    </div>
  );
}
