import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut,
  createUserWithEmailAndPassword, // Tambahan untuk Sign Up
  signInWithEmailAndPassword    // Tambahan untuk Sign In
} from "firebase/auth";

// --- PASTE CONFIG FIREBASE ASLI ANDA DI BAWAH INI ---
const firebaseConfig = {
  apiKey: "AIzaSyB2s8l7JCWzcnF6mdwK0Epr4Sx7rqjtI20",
  authDomain: "keuangan-apps-7316rlr.firebaseapp.com",
  projectId: "keuangan-apps-7316rlr",
  storageBucket: "keuangan-apps-7316rlr.firebasestorage.app",
  messagingSenderId: "355494630806",
  appId: "1:355494630806:web:fc1c35fdff95502caaf9b7"
};
// ----------------------------------------------------

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = async () => {
  try {
    await signInWithPopup(auth, googleProvider);
  } catch (error) {
    console.error(error);
    alert(error.message);
  }
};

// Fungsi Register Email
export const registerWithEmail = async (email, password) => {
  try {
    await createUserWithEmailAndPassword(auth, email, password);
  } catch (error) {
    throw error;
  }
};

// Fungsi Login Email
export const loginWithEmail = async (email, password) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    throw error;
  }
};

export const logout = async () => {
  await signOut(auth);
};
