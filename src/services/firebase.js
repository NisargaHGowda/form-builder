import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// ✅ Paste your config here
const firebaseConfig = {
    apiKey: "AIzaSyDoHi6JIR-N7QgMyAjtTEk6JjmzXwHgVh4",
    authDomain: "form-builder-app-4cbdd.firebaseapp.com",
    projectId: "form-builder-app-4cbdd",
    storageBucket: "form-builder-app-4cbdd.firebasestorage.app",
    messagingSenderId: "212517535780",
    appId: "1:212517535780:web:296da5582cdb198d4998b1"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Connect Firestore
export const db = getFirestore(app);

/** For help links (e.g. Firestore Rules in console). */
export const firebaseProjectId = firebaseConfig.projectId;