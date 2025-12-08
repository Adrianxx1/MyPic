import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAJa7h_K467bO2GOfZkyB1DU8wjVJa_gfc",
  authDomain: "mypic-social-3710b.firebaseapp.com",
  projectId: "mypic-social-3710b",
  storageBucket: "mypic-social-3710b.firebasestorage.app",
  messagingSenderId: "23107529173",
  appId: "1:23107529173:web:942eec6f37d30a7e41f55c",
  measurementId: "G-7KKZSGCD4C",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app);

// ========================================
// 🔥 PERSISTENCIA OFFLINE DE FIRESTORE
// ========================================
// Esto permite que Firestore guarde datos localmente y funcione sin conexión
enableIndexedDbPersistence(firestore, {
  // Sincronización de múltiples tabs (opcional, puede deshabilitarse si causa problemas)
  synchronizeTabs: true
})
  .then(() => {
    console.log("✅ Persistencia offline de Firestore habilitada");
  })
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      // Múltiples tabs abiertas, solo una puede tener persistencia
      console.warn("⚠️ Múltiples tabs detectadas. Solo la primera tab tendrá persistencia.");
    } else if (err.code === 'unimplemented') {
      // El navegador no soporta las características necesarias
      console.warn("⚠️ El navegador no soporta persistencia offline.");
    } else {
      console.error("❌ Error habilitando persistencia:", err);
    }
  });

export { app, auth, firestore, storage };