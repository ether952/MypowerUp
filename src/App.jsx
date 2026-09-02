import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft,
  ChevronRight,
  Download, 
  Upload, 
  Trash2,
  Sliders,
  Sparkles,
  LogIn,
  LogOut,
  Cloud,
  CheckCircle2,
  RefreshCw,
  User as UserIcon,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

import DailyView from './components/DailyView';
import ChartsView from './components/ChartsView';
import HistoryView from './components/HistoryView';
import GoalsModal from './components/GoalsModal';
import AuthModal from './components/AuthModal';
import { 
  getLocalDateString, 
  formatDisplayDate, 
  shiftDate 
} from './utils/helpers';
import {
  subscribeToAuthChanges,
  logoutUser,
  getUserCloudData,
  saveUserCloudData,
  isFirebaseConfigured
} from './lib/firebase';

export default function App() {
  const [selectedDate, setSelectedDate] = useState(() => getLocalDateString());
  const [activeTab, setActiveTab] = useState('daily');

  // === ESTADO DE AUTENTICACIÓN Y NUBE ===
  const [user, setUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState(isFirebaseConfigured ? 'syncing' : 'local'); // 'local' | 'syncing' | 'synced' | 'error'
  const isInitialLoadRef = useRef(true);
  const saveTimeoutRef = useRef(null);

  // === ESTADOS DE DATOS (Con fallback a LocalStorage) ===
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

  const [rememberedWorkouts, setRememberedWorkouts] = useState(() => {
    try {
      const saved = localStorage.getItem('mypowerup_remembered_workouts');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      return {};
    }
    return {};
  });

  const [rememberedFoods, setRememberedFoods] = useState(() => {
    try {
      const saved = localStorage.getItem('mypowerup_remembered_foods');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      return {};
    }
    return {};
  });

  const [isGoalsOpen, setIsGoalsOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const fileInputRef = useRef(null);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  // 1. Guardar siempre en LocalStorage como caché offline rápido
  useEffect(() => {
    localStorage.setItem('mypowerup_data', JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    localStorage.setItem('mypowerup_goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('mypowerup_remembered_workouts', JSON.stringify(rememberedWorkouts));
  }, [rememberedWorkouts]);

  useEffect(() => {
    localStorage.setItem('mypowerup_remembered_foods', JSON.stringify(rememberedFoods));
  }, [rememberedFoods]);

  // 2. Suscripción al estado de Autenticación de Firebase
  useEffect(() => {
    if (!isFirebaseConfigured) {
      setSyncStatus('local');
      return;
    }

    const unsubscribe = subscribeToAuthChanges(async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setSyncStatus('syncing');
        try {
          const cloudData = await getUserCloudData(currentUser.uid);
          if (cloudData) {
            // Cargar datos de la nube
            if (cloudData.data) setData(cloudData.data);
            if (cloudData.goals) setGoals(cloudData.goals);
            if (cloudData.rememberedWorkouts) setRememberedWorkouts(cloudData.rememberedWorkouts);
            if (cloudData.rememberedFoods) setRememberedFoods(cloudData.rememberedFoods);
            showToast(`Bienvenido ${currentUser.displayName || currentUser.email.split('@')[0]} // Datos sincronizados`);
          } else {
            // Primer login: subir datos locales actuales a la nube
            await saveUserCloudData(currentUser.uid, {
              data,
              goals,
              rememberedWorkouts,
              rememberedFoods
            });
            showToast(`Cuenta inicializada en la nube`);
          }
          setSyncStatus('synced');
        } catch (err) {
          console.error('Error al sincronizar con la nube:', err);
          setSyncStatus('error');
          showToast('Modo sin conexión');
        }
      } else {
        setSyncStatus('local');
      }
      isInitialLoadRef.current = false;
    });

    return () => unsubscribe();
  }, []);

  // 3. Auto-guardado en Firestore (Cloud Sync) al detectar cambios
  useEffect(() => {
    if (!user || isInitialLoadRef.current) return;

    setSyncStatus('syncing');
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await saveUserCloudData(user.uid, {
          data,
          goals,
          rememberedWorkouts,
          rememberedFoods
        });
        setSyncStatus('synced');
      } catch (err) {
        console.error('Error auto-guardando en la nube:', err);
        setSyncStatus('error');
      }
    }, 1200); // 1.2 segundos de debounce

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [data, goals, rememberedWorkouts, rememberedFoods, user]);

  const handleLogout = async () => {
    if (window.confirm('¿Deseas cerrar tu sesión actual?')) {
      try {
        await logoutUser();
        showToast('Sesión cerrada');
      } catch (err) {
        showToast('Error al cerrar sesión');
      }
    }
  };

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
      if (user) {
        saveUserCloudData(user.uid, { data: {} });
      }
      showToast('Todos los datos han sido borrados');
    }
  };

  const handleExportData = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify({ data, goals, rememberedWorkouts, rememberedFoods, version: '3.1' }, null, 2)
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
            if (parsed.rememberedWorkouts) setRememberedWorkouts(parsed.rememberedWorkouts);
            if (parsed.rememberedFoods) setRememberedFoods(parsed.rememberedFoods);
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
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Logo, Marca & Estado de Sincronización */}
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
                  SYSTEM v3.1
                </span>
              </div>
              
              {/* Indicador de Nube / Sincronización */}
              <div className="flex items-center gap-2 mt-0.5 text-[10px] font-mono">
                {syncStatus === 'synced' && (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    CLOUD SYNC: CONECTADO
                  </span>
                )}
                {syncStatus === 'syncing' && (
                  <span className="text-amber-400 flex items-center gap-1">
                    <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                    SINCRONIZANDO NUBE...
                  </span>
                )}
                {syncStatus === 'local' && (
                  <span className="text-neutral-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-500"></span>
                    MODO LOCAL (OFFLINE)
                  </span>
                )}
                {syncStatus === 'error' && (
                  <span className="text-rose-400 flex items-center gap-1">
                    <AlertCircle className="w-2.5 h-2.5" />
                    ERROR NUBE (REINTENTANDO)
                  </span>
                )}
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

          {/* Selector de Fecha & Controles de Usuario HUD */}
          <div className="flex items-center gap-2.5">
            
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

            {/* Acciones Rápidas */}
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

            {/* SECCIÓN USUARIO / LOGIN HUD */}
            <div className="pl-2 border-l border-white/10 flex items-center">
              {user ? (
                <div className="flex items-center gap-2 bg-space-900/90 border border-purple-500/30 rounded-xl p-1 pr-2 text-xs font-mono">
                  {user.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt="avatar" 
                      className="w-7 h-7 rounded-lg object-cover border border-neon-cyan/40"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-neon-purple to-neon-violet flex items-center justify-center text-white font-bold text-[11px] shadow-sm">
                      {(user.displayName || user.email || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  
                  <div className="hidden sm:block text-left">
                    <p className="text-[11px] font-bold text-white leading-tight truncate max-w-[100px]">
                      {user.displayName || user.email.split('@')[0]}
                    </p>
                    <p className="text-[9px] text-emerald-400 leading-tight">
                      ● CLOUD ACTIVO
                    </p>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="p-1.5 hover:bg-white/10 text-neutral-400 hover:text-rose-400 rounded-lg transition-colors ml-1"
                    title="Cerrar Sesión"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="group relative p-2.5 rounded-xl bg-space-900/90 hover:bg-space-850 border border-purple-500/40 hover:border-neon-cyan/70 shadow-[0_0_15px_rgba(139,92,246,0.25)] hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all duration-300 flex items-center justify-center active:scale-95"
                  title="Iniciar Sesión / Cloud Sync"
                >
                  <div className="relative flex items-center justify-center">
                    <UserIcon className="w-4 h-4 text-neutral-200 group-hover:text-white transition-colors" />
                    <span className="absolute -top-1.5 -right-1.5 w-2 h-2 rounded-full bg-gradient-to-r from-neon-purple to-neon-cyan shadow-[0_0_8px_#06B6D4] animate-pulse"></span>
                  </div>
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
            rememberedWorkouts={rememberedWorkouts}
            onUpdateRememberedWorkouts={setRememberedWorkouts}
            rememberedFoods={rememberedFoods}
            onUpdateRememberedFoods={setRememberedFoods}
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

      {/* Modal de Login / Registro Cloud */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={() => {
          showToast('Sesión iniciada con éxito');
        }}
      />

    </div>
  );
}
