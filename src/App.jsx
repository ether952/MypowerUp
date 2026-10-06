import React, { useState, useEffect, useRef } from 'react';
import {
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
  Settings,
  Zap
} from 'lucide-react';

import DailyView from './components/DailyView';
import ChartsView from './components/ChartsView';
import HistoryView from './components/HistoryView';
import MyPowerUpView from './components/MyPowerUpView';
import GoalsModal from './components/GoalsModal';
import LandingView from './components/LandingView';
import RegisterView from './components/RegisterView';
import LoginDrawer from './components/LoginDrawer';
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

/**
 * Fusiona de forma inteligente los datos locales con los datos remotos de la nube.
 * Evita que un documento vacío o desactualizado de Firestore borre registros locales.
 */
function mergeDaysData(localData = {}, cloudData = {}) {
  if (!cloudData || Object.keys(cloudData).length === 0) {
    return localData || {};
  }
  if (!localData || Object.keys(localData).length === 0) {
    return cloudData || {};
  }

  const merged = { ...cloudData };

  for (const date of Object.keys(localData)) {
    if (!merged[date]) {
      merged[date] = localData[date];
      continue;
    }

    const localDay = localData[date] || {};
    const cloudDay = merged[date] || {};

    // Alimentos: preservar los que no estén en la nube
    const cloudFoodIds = new Set((cloudDay.foods || []).map((f) => String(f.id || f.name)));
    const missingFoods = (localDay.foods || []).filter((f) => !cloudFoodIds.has(String(f.id || f.name)));
    const mergedFoods = [...(cloudDay.foods || []), ...missingFoods];

    // Entrenamientos: preservar los que no estén en la nube
    const cloudWorkoutIds = new Set((cloudDay.workouts || []).map((w) => String(w.id || w.name)));
    const missingWorkouts = (localDay.workouts || []).filter((w) => !cloudWorkoutIds.has(String(w.id || w.name)));
    const mergedWorkouts = [...(cloudDay.workouts || []), ...missingWorkouts];

    // Cardios: preservar los que no estén en la nube
    const cloudCardioIds = new Set((cloudDay.cardios || []).map((c) => String(c.id || `${c.type}_${c.distance}`)));
    const missingCardios = (localDay.cardios || []).filter((c) => !cloudCardioIds.has(String(c.id || `${c.type}_${c.distance}`)));
    const mergedCardios = [...(cloudDay.cardios || []), ...missingCardios];

    merged[date] = {
      foods: mergedFoods,
      workouts: mergedWorkouts,
      cardios: mergedCardios,
      weight: localDay.weight || cloudDay.weight || ''
    };
  }

  return merged;
}

export default function App() {
  const [selectedDate, setSelectedDate] = useState(() => getLocalDateString());
  const [activeTab, setActiveTab] = useState('daily');

  // === ESTADO DE AUTENTICACIÓN Y VISTAS PÚBLICAS ===
  const [user, setUser] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(!isFirebaseConfigured);
  const [publicView, setPublicView] = useState('landing'); // 'landing' | 'register'
  const [isLoginDrawerOpen, setIsLoginDrawerOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState(isFirebaseConfigured ? 'syncing' : 'local'); // 'local' | 'syncing' | 'synced' | 'error'
  const isInitialLoadRef = useRef(true);
  const isRemoteUpdateRef = useRef(false);
  const saveTimeoutRef = useRef(null);
  const lastLocalUpdateTimestampRef = useRef(Date.now());

  // Escuchar cambios de sesión de Firebase
  useEffect(() => {
    if (!isFirebaseConfigured) {
      setIsAuthReady(true);
      return;
    }

    const unsubscribe = subscribeToAuthChanges((currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
      if (currentUser) {
        setSyncStatus('syncing');
      } else {
        setSyncStatus('local');
      }
    });

    return () => unsubscribe();
  }, []);

  // Suscripción en tiempo real a cambios remotos de Firestore
  useEffect(() => {
    if (!user || !isFirebaseConfigured) return;

    const unsubscribe = subscribeToUserCloudData(user.uid, (cloudDoc, hasPendingWrites) => {
      if (hasPendingWrites) return;

      if (!cloudDoc) {
        // El documento en la nube aún no existe para este usuario
        if (isInitialLoadRef.current) {
          isInitialLoadRef.current = false;
          flushCloudSave();
        }
        setSyncStatus('synced');
        return;
      }

      if (isInitialLoadRef.current) {
        isInitialLoadRef.current = false;
        isRemoteUpdateRef.current = true;
        setData((prevLocalData) => {
          const merged = mergeDaysData(prevLocalData, cloudDoc.data);
          try {
            localStorage.setItem('mypowerup_data', JSON.stringify(merged));
          } catch (e) {}
          return merged;
        });
        if (cloudDoc.goals) setGoals(cloudDoc.goals);
        if (cloudDoc.rememberedWorkouts) {
          setRememberedWorkouts((prev) => ({ ...cloudDoc.rememberedWorkouts, ...(prev || {}) }));
        }
        if (cloudDoc.rememberedFoods) {
          setRememberedFoods((prev) => ({ ...cloudDoc.rememberedFoods, ...(prev || {}) }));
        }
        if (cloudDoc.challengeCalibration !== undefined) {
          setChallengeCalibration(cloudDoc.challengeCalibration);
          if (cloudDoc.challengeCalibration) {
            saveStoredChallengeCalibration(cloudDoc.challengeCalibration);
          }
        }
        if (cloudDoc.updatedAt) {
          lastLocalUpdateTimestampRef.current = new Date(cloudDoc.updatedAt).getTime();
        }
        setSyncStatus('synced');
        return;
      }

      // Sincronización en tiempo real entre múltiples dispositivos abiertos
      const remoteTime = cloudDoc.updatedAt ? new Date(cloudDoc.updatedAt).getTime() : 0;
      if (remoteTime > lastLocalUpdateTimestampRef.current) {
        isRemoteUpdateRef.current = true;
        setData((prevLocalData) => {
          const merged = mergeDaysData(prevLocalData, cloudDoc.data);
          try {
            localStorage.setItem('mypowerup_data', JSON.stringify(merged));
          } catch (e) {}
          return merged;
        });
        if (cloudDoc.goals) setGoals(cloudDoc.goals);
        if (cloudDoc.rememberedWorkouts) {
          setRememberedWorkouts((prev) => ({ ...cloudDoc.rememberedWorkouts, ...(prev || {}) }));
        }
        if (cloudDoc.rememberedFoods) {
          setRememberedFoods((prev) => ({ ...cloudDoc.rememberedFoods, ...(prev || {}) }));
        }
        if (cloudDoc.challengeCalibration !== undefined) {
          setChallengeCalibration(cloudDoc.challengeCalibration);
          if (cloudDoc.challengeCalibration) {
            saveStoredChallengeCalibration(cloudDoc.challengeCalibration);
          }
        }
        lastLocalUpdateTimestampRef.current = remoteTime;
      }
      setSyncStatus('synced');
    });

    return () => unsubscribe();
  }, [user]);

  // === ESTADO PRINCIPAL DE LA APLICACIÓN ===
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem('mypowerup_data');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  const [goals, setGoals] = useState(() => {
    try {
      const saved = localStorage.getItem('mypowerup_goals');
      return saved ? JSON.parse(saved) : { calories: 2400, protein: 150, tonnage: 100 };
    } catch (e) {
      return { calories: 2400, protein: 150, tonnage: 100 };
    }
  });

  const [rememberedWorkouts, setRememberedWorkouts] = useState(() => {
    try {
      const saved = localStorage.getItem('mypowerup_remembered_workouts');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  const [rememberedFoods, setRememberedFoods] = useState(() => {
    try {
      const saved = localStorage.getItem('mypowerup_remembered_foods');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  // Estado del perfil de calibración MyPowerUp
  const [challengeCalibration, setChallengeCalibration] = useState(() => {
    return getStoredChallengeCalibration();
  });

  // Modal de metas, menú de acciones
  const [isGoalsOpen, setIsGoalsOpen] = useState(false);
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [isWeightVisible, setIsWeightVisible] = useState(false);
  const [toast, setToast] = useState('');

  const actionsMenuRef = useRef(null);
  const fileInputRef = useRef(null);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (actionsMenuRef.current && !actionsMenuRef.current.contains(event.target)) {
        setIsActionsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Función para guardar datos inmediatamente en Firebase
  const flushCloudSave = async () => {
    if (!user || !isFirebaseConfigured) return;
    try {
      const nowISO = new Date().toISOString();
      lastLocalUpdateTimestampRef.current = new Date(nowISO).getTime();
      await saveUserCloudData(user.uid, {
        data,
        goals,
        rememberedWorkouts,
        rememberedFoods,
        challengeCalibration,
        updatedAt: nowISO
      });
      setSyncStatus('synced');
    } catch (error) {
      console.error('Error guardando en la nube:', error);
      setSyncStatus('error');
    }
  };

  // Guardar en LocalStorage y Cloud con debounce rápido (300ms)
  useEffect(() => {
    try {
      localStorage.setItem('mypowerup_data', JSON.stringify(data));
    } catch (e) {}

    // Si el cambio proviene de una actualización remota en vivo de Firestore, no re-enviar
    if (isRemoteUpdateRef.current) {
      isRemoteUpdateRef.current = false;
      return;
    }

    if (user && isFirebaseConfigured) {
      setSyncStatus('syncing');
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

      saveTimeoutRef.current = setTimeout(() => {
        flushCloudSave();
      }, 300);
    }
  }, [data, user, goals, rememberedWorkouts, rememberedFoods, challengeCalibration]);

  // Garantizar que no se pierdan datos si el usuario recarga la página
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        flushCloudSave();
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [data, user, goals, rememberedWorkouts, rememberedFoods, challengeCalibration]);

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
    }
  }, [challengeCalibration]);

  // Mensaje Toast
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => {
      setToast('');
    }, 3000);
  };

  // Visibilidad de peso
  const toggleWeightVisibility = () => {
    setIsWeightVisible((prev) => !prev);
  };

  // Día activo
  const currentDay = data[selectedDate] || { foods: [], workouts: [], cardios: [] };

  // Handlers para Alimentos
  const handleAddFood = (food) => {
    lastLocalUpdateTimestampRef.current = Date.now();
    const newId = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    setData((prevData) => {
      const day = prevData[selectedDate] || { foods: [], workouts: [], cardios: [] };
      const newFoods = [...(day.foods || []), { ...food, id: newId }];
      return {
        ...prevData,
        [selectedDate]: { ...day, foods: newFoods },
      };
    });
    showToast('Alimento registrado');
  };

  const handleUpdateFood = (foodId, updatedFood, targetDate = selectedDate) => {
    lastLocalUpdateTimestampRef.current = Date.now();
    setData((prevData) => {
      const day = prevData[targetDate] || { foods: [], workouts: [], cardios: [] };
      const newFoods = (day.foods || []).map((f) => (String(f.id) === String(foodId) ? { ...f, ...updatedFood } : f));
      return {
        ...prevData,
        [targetDate]: { ...day, foods: newFoods },
      };
    });
    showToast('Alimento actualizado');
  };

  const handleDeleteFood = (foodId, targetDate = selectedDate) => {
    lastLocalUpdateTimestampRef.current = Date.now();
    setData((prevData) => {
      const day = prevData[targetDate] || { foods: [], workouts: [], cardios: [] };
      const newFoods = (day.foods || []).filter((f) => String(f.id) !== String(foodId));
      return {
        ...prevData,
        [targetDate]: { ...day, foods: newFoods },
      };
    });
    showToast('Alimento eliminado');
  };

  // Handlers para Entrenamientos
  const handleAddWorkout = (workout) => {
    lastLocalUpdateTimestampRef.current = Date.now();
    const newId = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    setData((prevData) => {
      const day = prevData[selectedDate] || { foods: [], workouts: [], cardios: [] };
      const newWorkouts = [...(day.workouts || []), { ...workout, id: newId }];
      return {
        ...prevData,
        [selectedDate]: { ...day, workouts: newWorkouts },
      };
    });
    showToast('Ejercicio registrado');
  };

  const handleUpdateWorkout = (workoutId, updatedWorkout, targetDate = selectedDate) => {
    lastLocalUpdateTimestampRef.current = Date.now();
    setData((prevData) => {
      const day = prevData[targetDate] || { foods: [], workouts: [], cardios: [] };
      const newWorkouts = (day.workouts || []).map((w) => (String(w.id) === String(workoutId) ? { ...w, ...updatedWorkout } : w));
      return {
        ...prevData,
        [targetDate]: { ...day, workouts: newWorkouts },
      };
    });
    showToast('Ejercicio actualizado');
  };

  const handleDeleteWorkout = (workoutId, targetDate = selectedDate) => {
    lastLocalUpdateTimestampRef.current = Date.now();
    setData((prevData) => {
      const day = prevData[targetDate] || { foods: [], workouts: [], cardios: [] };
      const newWorkouts = (day.workouts || []).filter((w) => String(w.id) !== String(workoutId));
      return {
        ...prevData,
        [targetDate]: { ...day, workouts: newWorkouts },
      };
    });
    showToast('Ejercicio eliminado');
  };

  // Handlers para Cardio
  const handleAddCardio = (cardioItem) => {
    lastLocalUpdateTimestampRef.current = Date.now();
    const newId = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    setData((prevData) => {
      const day = prevData[selectedDate] || { foods: [], workouts: [], cardios: [] };
      const newCardios = [...(day.cardios || []), { ...cardioItem, id: newId }];
      return {
        ...prevData,
        [selectedDate]: { ...day, cardios: newCardios }
      };
    });
    showToast('Cardio registrado');
  };

  const handleDeleteCardio = (cardioId, targetDate = selectedDate) => {
    lastLocalUpdateTimestampRef.current = Date.now();
    setData((prevData) => {
      const day = prevData[targetDate] || { foods: [], workouts: [], cardios: [] };
      const newCardios = (day.cardios || []).filter((c) => String(c.id) !== String(cardioId));
      return {
        ...prevData,
        [targetDate]: { ...day, cardios: newCardios }
      };
    });
    showToast('Cardio eliminado');
  };

  // Handler de Peso
  const handleUpdateWeight = (newWeight, targetDate = selectedDate) => {
    lastLocalUpdateTimestampRef.current = Date.now();
    setData((prevData) => {
      const day = prevData[targetDate] || { foods: [], workouts: [], cardios: [] };
      return {
        ...prevData,
        [targetDate]: { ...day, weight: newWeight !== null ? newWeight.toString() : '' },
      };
    });
    showToast('Peso corporal actualizado');
  };

  // Autenticación Logout
  const handleLogout = async () => {
    try {
      await logoutUser();
      setUser(null);
      setIsActionsOpen(false);
      showToast('Sesión cerrada');
    } catch (e) {
      showToast('Error al cerrar sesión');
    }
  };

  // Backup & Limpieza
  const handleClearAllData = () => {
    if (window.confirm('¿Seguro que deseas eliminar todos los datos locales? Esta acción no se puede deshacer.')) {
      setData({});
      setRememberedWorkouts({});
      setRememberedFoods({});
      localStorage.removeItem('mypowerup_data');
      localStorage.removeItem('mypowerup_remembered_workouts');
      localStorage.removeItem('mypowerup_remembered_foods');
      showToast('Datos reiniciados');
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
        exportDate: new Date().toISOString(),
        version: '1.0'
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

  // 1. Pantalla de carga inicial mientras Firebase verifica la sesión existente
  if (!isAuthReady) {
    return (
      <div className="min-h-screen w-full bg-[#FAFAFA] flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3 animate-pulse">
          <div className="w-10 h-10 rounded-2xl bg-black flex items-center justify-center text-white shadow-md">
            <Zap className="w-5 h-5 text-white fill-white" />
          </div>
          <span className="font-display font-extrabold tracking-tight text-zinc-900 uppercase text-sm select-none">
            MYPOWER<span className="text-emerald-500">UP</span>
          </span>
        </div>
      </div>
    );
  }

  // 2. Si el usuario NO está autenticado, alternar entre Landing Page y Registro Minimalista
  if (!user) {
    return (
      <>
        {/* Toast HUD */}
        {toast && (
          <div className="fixed bottom-8 right-8 z-50 px-5 py-3 rounded-xl bg-zinc-900 text-white font-mono text-xs font-semibold tracking-wider shadow-2xl backdrop-blur-md animate-fade-in-up border border-zinc-800">
            <span>{toast}</span>
          </div>
        )}

        {publicView === 'register' ? (
          <RegisterView
            onBackToLanding={() => setPublicView('landing')}
            onOpenLogin={() => setIsLoginDrawerOpen(true)}
            onAuthSuccess={() => {
              showToast('Cuenta creada con éxito');
            }}
          />
        ) : (
          <LandingView
            onOpenLogin={() => setIsLoginDrawerOpen(true)}
            onOpenRegister={() => setPublicView('register')}
          />
        )}

        {/* Drawer de Iniciar Sesión con animación suave desde el lateral */}
        <LoginDrawer
          isOpen={isLoginDrawerOpen}
          onClose={() => setIsLoginDrawerOpen(false)}
          onSwitchToRegister={() => {
            setIsLoginDrawerOpen(false);
            setPublicView('register');
          }}
          onAuthSuccess={() => {
            setIsLoginDrawerOpen(false);
            showToast('Sesión iniciada con éxito');
          }}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-zinc-900 flex flex-col font-sans selection:bg-emerald-500 selection:text-white relative">

      {/* Toast HUD Minimalist */}
      {toast && (
        <div className="fixed bottom-8 right-8 z-50 px-5 py-3 rounded-xl bg-zinc-900 text-white font-mono text-xs font-semibold tracking-wider shadow-2xl backdrop-blur-md animate-fade-in-up border border-zinc-800">
          <span>{toast}</span>
        </div>
      )}

      {/* HEADER ELEGANTE OSCURO (IGUAL AL TONO DEL FOOTER) */}
      <header className="sticky top-0 z-40 bg-[#121214]/95 backdrop-blur-xl border-b border-[#2E2E34] transition-all shadow-md">
        <div className="w-full pl-3 sm:pl-6 pr-1 sm:pr-2 py-2 flex items-center justify-between gap-3">

          {/* GRUPO IZQUIERDO: Marca & Pestañas de Navegación */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 lg:gap-8">
            {/* Nombre Marca */}
            <div className="flex items-center">
              <h1 className="text-lg sm:text-xl font-black tracking-tight text-white uppercase font-display select-none">
                MYPOWER<span className="text-emerald-500 drop-shadow-xs">UP</span>
              </h1>
            </div>

            {/* Navegación de Pestañas */}
            <nav className="flex items-center gap-1 sm:gap-1.5 font-mono text-xs">
              <button
                onClick={() => setActiveTab('daily')}
                className={`px-3.5 py-1.5 rounded-lg font-bold tracking-wider transition-all uppercase cursor-pointer ${
                  activeTab === 'daily'
                    ? 'bg-white text-zinc-950 shadow-sm'
                    : 'text-[#8A8F98] hover:text-white hover:bg-[#222226]'
                }`}
              >
                REGISTRO
              </button>

              <button
                onClick={() => setActiveTab('history')}
                className={`px-3.5 py-1.5 rounded-lg font-bold tracking-wider transition-all uppercase cursor-pointer ${
                  activeTab === 'history' || activeTab === 'charts'
                    ? 'bg-white text-zinc-950 shadow-sm'
                    : 'text-[#8A8F98] hover:text-white hover:bg-[#222226]'
                }`}
              >
                HISTORIAL & GRÁFICOS
              </button>

              <button
                onClick={() => setActiveTab('mypowerup')}
                className={`px-3.5 py-1.5 rounded-lg font-bold tracking-wider transition-all uppercase flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'mypowerup'
                    ? 'bg-white text-zinc-950 shadow-sm'
                    : 'text-[#8A8F98] hover:text-white border border-[#2E2E34] bg-[#18181B] hover:bg-[#222226]'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${activeTab === 'mypowerup' ? 'bg-emerald-500' : 'bg-zinc-500'} animate-pulse`}></span>
                <span>MY<span className="text-emerald-500 font-extrabold">UP</span></span>
              </button>
            </nav>
          </div>

          {/* GRUPO DERECHO: Botón de Usuario con Tuerquita & Menú desplegable pegado al lateral */}
          <div className="flex items-center justify-end">
            {user ? (
              <div className="relative" ref={actionsMenuRef}>
                {/* Botón de Usuario con tuerquita */}
                <button
                  type="button"
                  onClick={() => setIsActionsOpen(!isActionsOpen)}
                  className="flex items-center gap-2 bg-[#18181B] hover:bg-[#222226] border border-[#2E2E34] hover:border-[#3E3E48] rounded-2xl p-1 pr-2 text-xs font-mono transition-all shadow-sm cursor-pointer select-none group"
                  title="Opciones de cuenta y configuración"
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt="avatar"
                      className="w-7 h-7 rounded-xl object-cover border border-[#2E2E34] group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-xl bg-zinc-800 flex items-center justify-center text-emerald-400 font-bold text-xs shadow-sm">
                      {(user.displayName || user.email || 'U')[0].toUpperCase()}
                    </div>
                  )}

                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-bold text-white leading-tight truncate max-w-[140px]">
                      {user.displayName || user.email.split('@')[0]}
                    </p>
                  </div>

                  {/* Icono de Tuerquita que despliega el menú */}
                  <div className="p-1 rounded-lg text-[#8A8F98] group-hover:text-white group-hover:bg-[#2E2E34] transition-colors">
                    <Settings className={`w-3.5 h-3.5 transition-transform duration-300 ${isActionsOpen ? 'rotate-90 text-white' : ''}`} />
                  </div>
                </button>

                {/* Desplegable Suave pegado al lateral derecho sin duplicar info de usuario */}
                {isActionsOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-[#18181B] border border-[#2E2E34] rounded-2xl shadow-2xl py-1.5 z-50 font-mono text-xs divide-y divide-[#2E2E34] animate-fade-in-up">
                    {/* Opciones de Configuración */}
                    <div className="py-1">
                      <button
                        onClick={() => { setIsGoalsOpen(true); setIsActionsOpen(false); }}
                        className="w-full px-4 py-2.5 text-left text-[#8A8F98] hover:text-white hover:bg-[#222226] flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <Sliders className="w-4 h-4 text-emerald-400" />
                        <span>Configurar Metas</span>
                      </button>

                      <button
                        onClick={() => { handleExportData(); setIsActionsOpen(false); }}
                        className="w-full px-4 py-2.5 text-left text-[#8A8F98] hover:text-white hover:bg-[#222226] flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <Download className="w-4 h-4 text-emerald-400" />
                        <span>Exportar Backup</span>
                      </button>

                      <label
                        className="w-full px-4 py-2.5 text-left text-[#8A8F98] hover:text-white hover:bg-[#222226] flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <Upload className="w-4 h-4 text-emerald-400" />
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
                          className="w-full px-4 py-2.5 text-left text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 flex items-center gap-2.5 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Vaciar Todos los Datos</span>
                        </button>
                      )}
                    </div>

                    {/* Botón Cerrar Sesión abajo de todo */}
                    <div className="pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2.5 text-left text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 flex items-center gap-2.5 transition-colors cursor-pointer font-bold"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Cerrar Sesión</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2" ref={actionsMenuRef}>
                {/* Botón de Tuerquita para no autenticados */}
                <div className="relative">
                  <button
                    onClick={() => setIsActionsOpen(!isActionsOpen)}
                    className="p-2 text-[#8A8F98] hover:text-white hover:bg-[#222226] rounded-xl border border-[#2E2E34] transition-all cursor-pointer"
                    title="Opciones de datos"
                  >
                    <Settings className="w-4 h-4" />
                  </button>

                  {isActionsOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-[#18181B] border border-[#2E2E34] rounded-2xl shadow-2xl py-2 z-50 font-mono text-xs divide-y divide-[#2E2E34] animate-fade-in-up">
                      <button
                        onClick={() => { setIsGoalsOpen(true); setIsActionsOpen(false); }}
                        className="w-full px-4 py-2.5 text-left text-[#8A8F98] hover:text-white hover:bg-[#222226] flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <Sliders className="w-4 h-4 text-emerald-400" />
                        <span>Configurar Metas</span>
                      </button>

                      <button
                        onClick={() => { handleExportData(); setIsActionsOpen(false); }}
                        className="w-full px-4 py-2.5 text-left text-[#8A8F98] hover:text-white hover:bg-[#222226] flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <Download className="w-4 h-4 text-emerald-400" />
                        <span>Exportar Backup</span>
                      </button>

                      <label
                        className="w-full px-4 py-2.5 text-left text-[#8A8F98] hover:text-white hover:bg-[#222226] flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <Upload className="w-4 h-4 text-emerald-400" />
                        <span>Importar Backup</span>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={(e) => { handleImportData(e); setIsActionsOpen(false); }}
                          accept=".json"
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}
                </div>

                {/* Botón Entrar */}
                <div className="relative">
                  <button
                    onClick={() => setIsLoginDropdownOpen(!isLoginDropdownOpen)}
                    className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-md"
                    title="Iniciar Sesión / Acceso Rápido"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-black" />
                    <span>Entrar</span>
                  </button>

                  <HeaderLoginDropdown
                    isOpen={isLoginDropdownOpen}
                    onClose={() => setIsLoginDropdownOpen(false)}
                    onOpenRegisterScreen={() => {
                      setPublicView('register');
                    }}
                    onAuthSuccess={() => {
                      showToast('Sesión iniciada con éxito');
                    }}
                  />
                </div>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="w-full flex-1">
        {activeTab === 'daily' && (
          <DailyView
            currentDay={currentDay}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
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

        {(activeTab === 'history' || activeTab === 'charts') && (
          <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-12">
            {/* 1. SECCIÓN DE GRÁFICOS & PROGRESIÓN (ARRIBA) */}
            <ChartsView
              data={data}
              goals={goals}
              isWeightVisible={isWeightVisible}
              onToggleVisibility={toggleWeightVisibility}
              onUpdateWeight={handleUpdateWeight}
              onSelectDate={handleSelectDateFromHistory}
            />

            {/* DIVISOR ELEGANTE */}
            <div className="border-t border-zinc-200 pt-2" />

            {/* 2. SECCIÓN DE HISTORIAL & REGISTROS (ABAJO) */}
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
      <Footer onOpenAuth={() => {}} />

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
