/**
 * Módulo de Inicialización de Firebase (Sintaxis Modular v9+)
 */
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = { 
    apiKey: "AIzaSyBPvo4UAztPUKREsXaG0dbwKE-nrldlJPk", 
    authDomain: "tamizajefuncionesejecutivas.firebaseapp.com", 
    projectId: "tamizajefuncionesejecutivas", 
    storageBucket: "tamizajefuncionesejecutivas.firebasestorage.app", 
    messagingSenderId: "730702504761", 
    appId: "1:730702504761:web:bb21db2ec770e06af4fee8", 
    measurementId: "G-8ZRJM1XBBZ" 
};

// Reutiliza la app si ya fue inicializada o crea una nueva
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);
