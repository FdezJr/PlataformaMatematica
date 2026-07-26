/**
 * Módulo de Inicialización de Firebase (Importación CDN para navegador)
 */
import firebase from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js";
import "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore-compat.js";

const firebaseConfig = { 
    apiKey: "AIzaSyBPvo4UAztPUKREsXaG0dbwKE-nrldlJPk", 
    authDomain: "tamizajefuncionesejecutivas.firebaseapp.com", 
    projectId: "tamizajefuncionesejecutivas", 
    storageBucket: "tamizajefuncionesejecutivas.firebasestorage.app", 
    messagingSenderId: "730702504761", 
    appId: "1:730702504761:web:bb21db2ec770e06af4fee8", 
    measurementId: "G-8ZRJM1XBBZ" 
};

if (!firebase.apps.length) { 
    firebase.initializeApp(firebaseConfig); 
}

export const db = firebase.firestore();
