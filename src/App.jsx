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
  AlertCircle,
  MoreVertical
} from 'lucide-react';

import DailyView from './components/DailyView';
import ChartsView from './components/ChartsView';
import HistoryView from './components/HistoryView';
import MyPowerUpView from './components/MyPowerUpView';
import GoalsModal from './components/GoalsModal';
import AuthModal from './components/AuthModal';
import HeaderLoginDropdown from './components/HeaderLoginDropdown';
import Footer from './components/Footer';
import {
  getLocalDateString,
  formatDisplayDate,
  shiftDate,
  estimateNutrition
} from './utils/helpers';
import { estimateNutritionWithAI } from './services/aiNutritionService';
import {
  getStoredChallengeCalibration,
  saveStoredChallengeCalibration
} from './utils/challengeCalibration';
import {
  subscribeToAuthChanges,
  logoutUser,
  getUserCloudData,
  saveUserCloudData,
  subscribeToUserCloudData,
  isFirebaseConfigured
} from './lib/firebase';

export default function App() {
  const [selectedDate, setSelectedDate] = useState(() => getLocalDateString());
  const [activeTab, setActiveTab] = useState('daily');

  // === ESTADO DE AUTENTICACIÓN Y NUBE ===
  const [user, setUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('register'); // 'register' | 'login'
  const [isLoginDropdownOpen, setIsLoginDropdownOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState(isFirebaseConfigured ? 'syncing' : 'local'); // 'local' | 'syncing' | 'synced' | 'error'
  const isInitialLoadRef = useRef(true);
  const saveTimeoutRef = useRef(null);
  const lastSyncedPayloadRef = useRef(null);

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
    return { calories: 2400, protein: 150, tonnage: 100 };
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

  const [challengeCalibration, setChallengeCalibration] = useState(() => {
    return getStoredChallengeCalibration();
  });

  // === PRIVACIDAD Y VISIBILIDAD DEL PESO (Oculto de base por defecto) ===
  const [isWeightVisible, setIsWeightVisible] = useState(() => {
    try {
      const saved = localStorage.getItem('mypowerup_show_weight');
      return saved !== null ? JSON.parse(saved) : false; // Oculto de base
    } catch (e) {
      return false;
    }
  });

  const toggleWeightVisibility = () => {
    setIsWeightVisible((prev) => {
      const next = !prev;
      localStorage.setItem('mypowerup_show_weight', JSON.stringify(next));
      return next;
    });
  };

  const [isGoalsOpen, setIsGoalsOpen] = useState(false);
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const fileInputRef = useRef(null);
  const actionsMenuRef = useRef(null);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  // 0. Auto-abrir login para usuarios nuevos al iniciar la app
  useEffect(() => {
    const prompted = localStorage.getItem('mypowerup_auth_prompted');
    const guestSession = localStorage.getItem('mypowerup_guest_session');
    if (!prompted && !guestSession) {
      const timer = setTimeout(() => {
        setIsAuthModalOpen(true);
        localStorage.setItem('mypowerup_auth_prompted', 'true');
      }, 700);
      return () => clearTimeout(timer);
    }
  }, []);

  // Cerrar menú de 3 puntitos al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (actionsMenuRef.current && !actionsMenuRef.current.contains(e.target)) {
        setIsActionsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  useEffect(() => {
    if (challengeCalibration) {
      saveStoredChallengeCalibration(challengeCalibration);
    } else {
      localStorage.removeItem('mypowerup_challenge_calibration');
    }
  }, [challengeCalibration]);

  // 2. Suscripción a Autenticación y Sincronización en Tiempo Real con Firebase Firestore
  useEffect(() => {
    if (!isFirebaseConfigured) {
      setSyncStatus('local');
      return;
    }

    let cloudDataUnsubscribe = null;

    const authUnsubscribe = subscribeToAuthChanges((currentUser) => {
      setUser(currentUser);
      if (cloudDataUnsubscribe) {
        cloudDataUnsubscribe();
        cloudDataUnsubscribe = null;
      }

      if (currentUser) {
        setSyncStatus('syncing');

        // Escuchar datos de Firestore en tiempo real para sincronización instantánea entre celular y PC
        cloudDataUnsubscribe = subscribeToUserCloudData(
          currentUser.uid,
          async (cloudData) => {
            if (cloudData) {
              // Si la nube ya contiene datos, sincronizarlos
              if (cloudData.data !== undefined) setData(cloudData.data);
              if (cloudData.goals !== undefined) setGoals(cloudData.goals);
              if (cloudData.rememberedWorkouts !== undefined) setRememberedWorkouts(cloudData.rememberedWorkouts);
              if (cloudData.rememberedFoods !== undefined) setRememberedFoods(cloudData.rememberedFoods);

              if (cloudData.challengeCalibration !== undefined) {
                setChallengeCalibration(cloudData.challengeCalibration);
                if (cloudData.challengeCalibration) {
                  saveStoredChallengeCalibration(cloudData.challengeCalibration);
                }
              }

              // Si en la nube no había calibración pero localmente sí tenemos (ej: hecha en este celu antes de sincronizar)
              if (challengeCalibration && !cloudData.challengeCalibration) {
                saveUserCloudData(currentUser.uid, { challengeCalibration });
              }

              const mergedPayload = {
                data: cloudData.data !== undefined ? cloudData.data : data,
                goals: cloudData.goals !== undefined ? cloudData.goals : goals,
                rememberedWorkouts: cloudData.rememberedWorkouts !== undefined ? cloudData.rememberedWorkouts : rememberedWorkouts,
                rememberedFoods: cloudData.rememberedFoods !== undefined ? cloudData.rememberedFoods : rememberedFoods,
                challengeCalibration: cloudData.challengeCalibration !== undefined ? cloudData.challengeCalibration : challengeCalibration
              };
              lastSyncedPayloadRef.current = JSON.stringify(mergedPayload);

              if (isInitialLoadRef.current) {
                showToast(`Bienvenido ${currentUser.displayName || currentUser.email.split('@')[0]} // Sincronizado en tiempo real`);
                isInitialLoadRef.current = false;
              }
              setSyncStatus('synced');
            } else {
              // Primer login: subir datos locales actuales a la nube
              const initialPayload = {
                data,
                goals,
                rememberedWorkouts,
                rememberedFoods,
                challengeCalibration: challengeCalibration || null
              };
              lastSyncedPayloadRef.current = JSON.stringify(initialPayload);
              await saveUserCloudData(currentUser.uid, initialPayload);
              showToast('Cuenta inicializada en la nube');
              isInitialLoadRef.current = false;
              setSyncStatus('synced');
            }
          },
          (err) => {
            console.error('Error al sincronizar con la nube:', err);
            setSyncStatus('error');
            if (isInitialLoadRef.current) {
              showToast('Modo sin conexión');
              isInitialLoadRef.current = false;
            }
          }
        );
      } else {
        setSyncStatus('local');
        isInitialLoadRef.current = false;
      }
    });

    return () => {
      if (cloudDataUnsubscribe) cloudDataUnsubscribe();
      authUnsubscribe();
    };
  }, []);

  // 3. Auto-guardado en Firestore (Cloud Sync) al detectar cambios locales
  useEffect(() => {
    if (!user || isInitialLoadRef.current) return;

    const currentPayload = {
      data,
      goals,
      rememberedWorkouts,
      rememberedFoods,
      challengeCalibration: challengeCalibration || null
    };

    const serialized = JSON.stringify(currentPayload);
    // Si coincide con lo último sincronizado, omitir re-guardado
    if (serialized === lastSyncedPayloadRef.current) return;

    setSyncStatus('syncing');
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await saveUserCloudData(user.uid, currentPayload);
        lastSyncedPayloadRef.current = serialized;
        setSyncStatus('synced');
      } catch (err) {
        console.error('Error auto-guardando en la nube:', err);
        setSyncStatus('error');
      }
    }, 1000); // 1 segundo de debounce

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [data, goals, rememberedWorkouts, rememberedFoods, challengeCalibration, user]);

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

  const handleAddFood = async (food) => {
    let finalFood = { ...food };
    // Si no se proveyeron calorías o proteínas, resolver con IA o base nutricional
    if ((!finalFood.calories || Number(finalFood.calories) === 0) && (!finalFood.protein || Number(finalFood.protein) === 0)) {
      try {
        const aiEst = await estimateNutritionWithAI(finalFood.name);
        if (aiEst.calories > 0) finalFood.calories = aiEst.calories;
        if (aiEst.protein > 0) finalFood.protein = aiEst.protein;
        if (aiEst.suggestedMealType && (!finalFood.mealType || finalFood.mealType === 'almuerzo')) {
          finalFood.mealType = aiEst.suggestedMealType;
        }
      } catch (e) {
        const estimated = estimateNutrition(finalFood.name);
        if (estimated.matched) {
          finalFood.calories = estimated.calories;
          finalFood.protein = estimated.protein;
          if (estimated.defaultMealType && (!finalFood.mealType || finalFood.mealType === 'almuerzo')) {
            finalFood.mealType = estimated.defaultMealType;
          }
        }
      }
    }

    const newFood = { id: Date.now(), ...finalFood };
    setData((prev) => ({
      ...prev,
      [selectedDate]: {
        ...currentDay,
        foods: [...(currentDay.foods || []), newFood],
      },
    }));

    const macroTag = (finalFood.calories > 0 || finalFood.protein > 0)
      ? ` (${finalFood.calories} kcal • ${finalFood.protein}g prot)`
      : '';
    showToast(`Guardado: ${finalFood.name}${macroTag}`);
  };

  const handleDeleteFood = (id, targetDate = selectedDate) => {
    setData((prev) => {
      const day = prev[targetDate] || { foods: [], workouts: [], cardios: [] };
      return {
        ...prev,
        [targetDate]: {
          ...day,
          foods: (day.foods || []).filter((item) => item.id !== id),
        },
      };
    });
    showToast('Registro eliminado');
  };

  const handleUpdateFood = (id, updatedFood, targetDate = selectedDate) => {
    setData((prev) => {
      const day = prev[targetDate] || { foods: [], workouts: [], cardios: [] };
      return {
        ...prev,
        [targetDate]: {
          ...day,
          foods: (day.foods || []).map((item) => (item.id === id ? { ...item, ...updatedFood } : item)),
        },
      };
    });
    showToast(`Actualizado: ${updatedFood.name}`);
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

  const handleDeleteWorkout = (id, targetDate = selectedDate) => {
    setData((prev) => {
      const day = prev[targetDate] || { foods: [], workouts: [], cardios: [] };
      return {
        ...prev,
        [targetDate]: {
          ...day,
          workouts: (day.workouts || []).filter((item) => item.id !== id),
        },
      };
    });
    showToast('Ejercicio eliminado');
  };

  const handleUpdateWorkout = (id, updatedWorkout, targetDate = selectedDate) => {
    setData((prev) => {
      const day = prev[targetDate] || { foods: [], workouts: [], cardios: [] };
      return {
        ...prev,
        [targetDate]: {
          ...day,
          workouts: (day.workouts || []).map((item) => (item.id === id ? { ...item, ...updatedWorkout } : item)),
        },
      };
    });
    showToast(`Actualizado: ${updatedWorkout.name}`);
  };

  const handleAddCardio = (cardio) => {
    const newCardio = { id: Date.now(), ...cardio };
    setData((prev) => ({
      ...prev,
      [selectedDate]: {
        ...currentDay,
        cardios: [...(currentDay.cardios || []), newCardio],
      },
    }));
    showToast(`Cardio registrado: ${cardio.distance} km (~${cardio.caloriesBurned} kcal)`);
  };

  const handleDeleteCardio = (id, targetDate = selectedDate) => {
    setData((prev) => {
      const day = prev[targetDate] || { foods: [], workouts: [], cardios: [] };
      return {
        ...prev,
        [targetDate]: {
          ...day,
          cardios: (day.cardios || []).filter((item) => item.id !== id),
        },
      };
    });
    showToast('Cardio eliminado');
  };

  const handleUpdateWeight = (newWeight, targetDate = selectedDate) => {
    setData((prev) => {
      const day = prev[targetDate] || { foods: [], workouts: [], cardios: [] };
      const val = newWeight === '' || newWeight === null ? null : parseFloat(newWeight);
      return {
        ...prev,
        [targetDate]: {
          ...day,
          weight: isNaN(val) ? null : val,
        },
      };
    });
    if (newWeight !== '' && newWeight !== null && !isNaN(parseFloat(newWeight))) {
      showToast(`Peso corporal guardado: ${parseFloat(newWeight).toFixed(1)} kg`);
    } else {
      showToast('Registro de peso eliminado');
    }
  };

  const handleClearAllData = () => {
    if (window.confirm('¿Vaciar todos los datos de la aplicación?')) {
      setData({});
      setChallengeCalibration(null);
      localStorage.removeItem('mypowerup_data');
      localStorage.removeItem('mypowerup_challenge_calibration');
      if (user) {
        saveUserCloudData(user.uid, { data: {}, challengeCalibration: null });
      }
      showToast('Todos los datos han sido borrados');
    }
  };

  const handleExportData = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify({ 
        data, 
        goals, 
        rememberedWorkouts, 
        rememberedFoods, 
        challengeCalibration,
        version: '3.2' 
      }, null, 2)
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
            if (parsed.challengeCalibration !== undefined) {
              setChallengeCalibration(parsed.challengeCalibration);
              if (parsed.challengeCalibration) {
                saveStoredChallengeCalibration(parsed.challengeCalibration);
              }
            }
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
    <div className="min-h-screen bg-[#FAFAFA] text-zinc-900 flex flex-col font-sans selection:bg-black selection:text-white relative">

      {/* Toast HUD Minimalist */}
      {toast && (
        <div className="fixed bottom-8 right-8 z-50 px-5 py-3 rounded-xl bg-zinc-900 text-white font-mono text-xs font-semibold tracking-wider shadow-2xl backdrop-blur-md animate-fade-in-up border border-zinc-700">
          <span>// {toast}</span>
        </div>
      )}

      {/* HEADER MINIMALISTA MONOCROMÁTICO */}
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-zinc-200/80 transition-all">
        <div className="w-full px-4 sm:px-8 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">

          {/* GRUPO IZQUIERDO: Marca & Pestañas de Navegación */}
          <div className="flex flex-wrap items-center gap-6 lg:gap-10">
            {/* Nombre Marca */}
            <div className="flex items-center">
              <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-zinc-900 uppercase font-display">
                MYPOWERUP
              </h1>
            </div>

            {/* Navegación de Pestañas */}
            <nav className="flex items-center gap-1 sm:gap-1.5 font-mono text-xs">
              <button
                onClick={() => setActiveTab('daily')}
                className={`px-3.5 py-1.5 rounded-lg font-bold tracking-wider transition-all uppercase ${activeTab === 'daily'
                    ? 'bg-black text-white shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
                  }`}
              >
                01 // REGISTRO
              </button>

              <button
                onClick={() => setActiveTab('charts')}
                className={`px-3.5 py-1.5 rounded-lg font-bold tracking-wider transition-all uppercase ${activeTab === 'charts'
                    ? 'bg-black text-white shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
                  }`}
              >
                02 // GRÁFICOS
              </button>

              <button
                onClick={() => setActiveTab('history')}
                className={`px-3.5 py-1.5 rounded-lg font-bold tracking-wider transition-all uppercase ${activeTab === 'history'
                    ? 'bg-black text-white shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
                  }`}
              >
                03 // HISTORIAL
              </button>

              <button
                onClick={() => setActiveTab('mypowerup')}
                className={`px-3.5 py-1.5 rounded-lg font-bold tracking-wider transition-all uppercase flex items-center gap-1.5 ${activeTab === 'mypowerup'
                    ? 'bg-black text-white shadow-sm'
                    : 'text-zinc-700 hover:text-black border border-zinc-200 bg-zinc-50 hover:bg-zinc-100'
                  }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse"></span>
                <span>04 // MYPOWERUP</span>
              </button>
            </nav>
          </div>

          {/* GRUPO DERECHO: Selector de Fecha, 3 Puntitos & Usuario */}
          <div className="flex items-center gap-3 sm:gap-4">

            {/* Control de Fecha */}
            <div className="flex items-center gap-1 text-xs font-mono">
              <button
                onClick={() => setSelectedDate(shiftDate(selectedDate, -1))}
                className="p-1 text-zinc-400 hover:text-black transition-colors"
                title="Día anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={() => setSelectedDate(getLocalDateString())}
                className="px-2 py-0.5 text-zinc-500 hover:text-black uppercase font-bold text-[11px] transition-colors"
              >
                Hoy
              </button>

              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-zinc-900 px-1 py-0.5 focus:outline-none cursor-pointer text-xs font-mono font-bold border-b border-transparent focus:border-black transition-colors"
              />

              <button
                onClick={() => setSelectedDate(shiftDate(selectedDate, 1))}
                className="p-1 text-zinc-400 hover:text-black transition-colors"
                title="Día siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Botón de 3 Puntitos */}
            <div className="relative" ref={actionsMenuRef}>
              <button
                onClick={() => setIsActionsOpen(!isActionsOpen)}
                className="p-2 text-zinc-500 hover:text-black hover:bg-zinc-100 rounded-xl transition-all"
                title="Más opciones"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {isActionsOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white/95 border border-zinc-200 rounded-xl shadow-xl py-2 z-50 backdrop-blur-xl font-mono text-xs divide-y divide-zinc-100 animate-fade-in-up">
                  <button
                    onClick={() => { setIsGoalsOpen(true); setIsActionsOpen(false); }}
                    className="w-full px-4 py-2.5 text-left text-zinc-700 hover:text-black hover:bg-zinc-50 flex items-center gap-2.5 transition-colors"
                  >
                    <Sliders className="w-4 h-4 text-zinc-900" />
                    <span>Configurar Metas</span>
                  </button>

                  <button
                    onClick={() => { handleExportData(); setIsActionsOpen(false); }}
                    className="w-full px-4 py-2.5 text-left text-zinc-700 hover:text-black hover:bg-zinc-50 flex items-center gap-2.5 transition-colors"
                  >
                    <Download className="w-4 h-4 text-zinc-900" />
                    <span>Exportar Backup</span>
                  </button>

                  <label
                    className="w-full px-4 py-2.5 text-left text-zinc-700 hover:text-black hover:bg-zinc-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <Upload className="w-4 h-4 text-zinc-900" />
                    <span>Importar Backup</span>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={(e) => { handleImportData(e); setIsActionsOpen(false); }}
                      accept=".json"
                      className="hidden"
                    />
                  </label>

                  {Object.keys(data).length > 0 && (
                    <button
                      onClick={() => { handleClearAllData(); setIsActionsOpen(false); }}
                      className="w-full px-4 py-2.5 text-left text-rose-600 hover:text-rose-700 hover:bg-rose-50 flex items-center gap-2.5 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Vaciar Todos los Datos</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* SECCIÓN USUARIO */}
            <div className="flex items-center">
              {user ? (
                <div className="flex items-center gap-2 bg-zinc-100 border border-zinc-200 rounded-xl p-1 pr-2 text-xs font-mono">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt="avatar"
                      className="w-7 h-7 rounded-lg object-cover border border-zinc-300"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-lg bg-zinc-900 flex items-center justify-center text-white font-bold text-[11px] shadow-sm">
                      {(user.displayName || user.email || 'U')[0].toUpperCase()}
                    </div>
                  )}

                  <div className="hidden sm:block text-left">
                    <p className="text-[11px] font-bold text-zinc-900 leading-tight truncate max-w-[100px]">
                      {user.displayName || user.email.split('@')[0]}
                    </p>
                    <p className="text-[9px] text-emerald-600 font-bold leading-tight">
                      ● CLOUD ACTIVO
                    </p>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="p-1.5 hover:bg-zinc-200 text-zinc-500 hover:text-rose-600 rounded-lg transition-colors ml-1"
                    title="Cerrar Sesión"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <button
                    onClick={() => setIsLoginDropdownOpen(!isLoginDropdownOpen)}
                    className="group relative p-2 rounded-xl hover:bg-zinc-100 transition-all duration-300 flex items-center justify-center active:scale-95 cursor-pointer"
                    title="Iniciar Sesión / Acceso Rápido"
                  >
                    <div className="relative flex items-center justify-center">
                      <UserIcon className="w-4 h-4 text-zinc-700 group-hover:text-black transition-colors" />
                      <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-black shadow-sm animate-pulse"></span>
                    </div>
                  </button>

                  {/* Desplegable de Login Rápido debajo del botón de la personita */}
                  <HeaderLoginDropdown
                    isOpen={isLoginDropdownOpen}
                    onClose={() => setIsLoginDropdownOpen(false)}
                    onOpenRegisterScreen={() => {
                      setAuthModalMode('register');
                      setIsAuthModalOpen(true);
                    }}
                    onAuthSuccess={() => {
                      showToast('Sesión iniciada con éxito');
                    }}
                  />
                </div>
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
            data={data}
            goals={goals}
            isWeightVisible={isWeightVisible}
            onToggleWeightVisibility={toggleWeightVisibility}
            onUpdateWeight={handleUpdateWeight}
            onAddFood={handleAddFood}
            onUpdateFood={handleUpdateFood}
            onDeleteFood={handleDeleteFood}
            onAddWorkout={handleAddWorkout}
            onUpdateWorkout={handleUpdateWorkout}
            onDeleteWorkout={handleDeleteWorkout}
            onAddCardio={handleAddCardio}
            onDeleteCardio={handleDeleteCardio}
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
              isWeightVisible={isWeightVisible}
              onToggleVisibility={toggleWeightVisibility}
              onUpdateWeight={handleUpdateWeight}
              onSelectDate={handleSelectDateFromHistory}
            />
          </div>
        )}

        {activeTab === 'history' && (
          <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8">
            <HistoryView
              data={data}
              goals={goals}
              isWeightVisible={isWeightVisible}
              onToggleVisibility={toggleWeightVisibility}
              onUpdateWeight={handleUpdateWeight}
              onSelectDate={handleSelectDateFromHistory}
              onUpdateWorkout={handleUpdateWorkout}
              onDeleteWorkout={handleDeleteWorkout}
              onUpdateFood={handleUpdateFood}
              onDeleteFood={handleDeleteFood}
            />
          </div>
        )}

        {activeTab === 'mypowerup' && (
          <MyPowerUpView
            data={data}
            selectedDate={selectedDate}
            challengeCalibration={challengeCalibration}
            onUpdateChallengeCalibration={setChallengeCalibration}
          />
        )}
      </main>

      {/* Footer Global de la Plataforma */}
      <Footer onOpenAuth={() => { setAuthModalMode('login'); setIsAuthModalOpen(true); }} />

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

      {/* Pantalla Completa de Bienvenida / Registro Cloud */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialMode={authModalMode}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={() => {
          showToast('Sesión iniciada con éxito');
        }}
      />

    </div>
  );
}
