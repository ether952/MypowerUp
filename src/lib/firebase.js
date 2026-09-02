import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  onSnapshot 
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || import.meta.env.FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || import.meta.env.FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || import.meta.env.FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || import.meta.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || import.meta.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || import.meta.env.FIREBASE_APP_ID
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && 
  firebaseConfig.projectId && 
  firebaseConfig.apiKey !== 'TU_API_KEY'
);

let app = null;
let auth = null;
let db = null;
let googleProvider = null;

if (isFirebaseConfigured) {
  try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();
  } catch (err) {
    console.error('Error initializing Firebase:', err);
  }
}

// === AUTHENTICATION SERVICES ===

export const loginWithEmail = async (email, password) => {
  if (!auth) throw new Error('Firebase no está configurado. Agrega tus credenciales en el archivo .env');
  return await signInWithEmailAndPassword(auth, email, password);
};

export const registerWithEmail = async (email, password, displayName = '') => {
  if (!auth) throw new Error('Firebase no está configurado. Agrega tus credenciales en el archivo .env');
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName && userCredential.user) {
    await updateProfile(userCredential.user, { displayName });
  }
  return userCredential;
};

export const loginWithGoogle = async () => {
  if (!auth || !googleProvider) throw new Error('Firebase no está configurado. Agrega tus credenciales en el archivo .env');
  return await signInWithPopup(auth, googleProvider);
};

export const logoutUser = async () => {
  if (!auth) return;
  return await signOut(auth);
};

export const resetPassword = async (email) => {
  if (!auth) throw new Error('Firebase no está configurado');
  return await sendPasswordResetEmail(auth, email);
};

export const subscribeToAuthChanges = (callback) => {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
};

// === FIRESTORE DATABASE SERVICES ===

export const getUserCloudData = async (userId) => {
  if (!db || !userId) return null;
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (error) {
    console.error('Error loading cloud data:', error);
    throw error;
  }
};

export const saveUserCloudData = async (userId, payload) => {
  if (!db || !userId) return;
  try {
    const docRef = doc(db, 'users', userId);
    await setDoc(docRef, {
      ...payload,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    console.error('Error saving cloud data:', error);
    throw error;
  }
};

export const subscribeToUserCloudData = (userId, onDataUpdate, onError) => {
  if (!db || !userId) return () => {};
  const docRef = doc(db, 'users', userId);
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      onDataUpdate(docSnap.data());
    }
  }, (err) => {
    if (onError) onError(err);
    console.error('Snapshot error:', err);
  });
};

export { auth, db };
