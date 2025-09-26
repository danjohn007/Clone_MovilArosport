// Importar Firebase
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Configuración de Firebase extraída de google-services.json
const firebaseConfig = {
  apiKey: "AIzaSyDkUEJI7uDT0_UBDFXiY2ZFeES5-oh6FdE",
  authDomain: "arosports-3bcf3.firebaseapp.com",
  projectId: "arosports-3bcf3",
  storageBucket: "arosports-3bcf3.firebasestorage.app",
  messagingSenderId: "234548754338",
  appId: "1:234548754338:web:68205b78d5872247ab24fb",
  measurementId: "G-707EDYX7YH"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, db, auth, storage };
