import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

// --- PASTE CONFIG DARI FIREBASE CONSOLE DI SINI ---
const firebaseConfig = {
  apiKey: "AIzaSyB2s8l7JCWzcnF6mdwK0Epr4Sx7rqjtI20",
  authDomain: "keuangan-apps-7316rlr.firebaseapp.com",
  projectId: "keuangan-apps-7316rlr",
  storageBucket: "keuangan-apps-7316rlr.firebasestorage.app",
  messagingSenderId: "355494630806",
  appId: "1:355494630806:web:fc1c35fdff95502caaf9b7"
};
// --------------------------------------------------

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = async () => {
  try {
    await signInWithPopup(auth, googleProvider);
  } catch (error) {
    console.error("Login gagal:", error);
    alert("Login gagal. Cek popup browser Anda.");
  }
};

export const logout = async () => {
  await signOut(auth);
};
