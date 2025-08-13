import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth";
import {getFirestore} from "firebase/firestore";
import {getStorage} from "firebase/storage";

const firebaseConfig = {
 apiKey: "AIzaSyAJa7h_K467bO2GOfZkyB1DU8wjVJa_gfc",
  authDomain: "mypic-social-3710b.firebaseapp.com",
  projectId: "mypic-social-3710b",
  storageBucket: "mypic-social-3710b.firebasestorage.app",
  messagingSenderId: "23107529173",
  appId: "1:23107529173:web:942eec6f37d30a7e41f55c",
  measurementId: "G-7KKZSGCD4C"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage (app);
 export {app, auth, firestore, storage};