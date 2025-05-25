import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";


const firebaseConfig = {
  apiKey: "AIzaSyAXRF8VlEyA77hRWTYV9t6bqrlpXc6NCb4",
  authDomain: "proyectofinal-web-18365.firebaseapp.com",
  projectId: "proyectofinal-web-18365",
  storageBucket: "proyectofinal-web-18365.firebasestorage.app",
  messagingSenderId: "737119676966",
  appId: "1:737119676966:web:760757e57b0c32073714e7"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar servicios de Firebase
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;