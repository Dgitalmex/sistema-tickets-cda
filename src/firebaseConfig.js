import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// 🔥 INSTRUCCIONES: Reemplaza estos valores con los de tu proyecto Firebase
// Los encuentras en: Firebase Console → Project Settings → Your apps → SDK setup and configuration

const firebaseConfig = {
  apiKey: "AIzaSyBSu7T2ISG4RJ4ZvLow16Z-4w0jCdTL0M4",
  authDomain: "system-corps.firebaseapp.com",
  databaseURL: "https://system-corps-default-rtdb.firebaseio.com",
  projectId: "system-corps",
  storageBucket: "system-corps.firebasestorage.app",
  messagingSenderId: "1068874311915",
  appId: "1:1068874311915:web:ff855d462be8e3b25f76ae"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database };
