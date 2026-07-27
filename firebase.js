/**
 * firebase.js
 * Configuración e inicialización de Firebase Firestore
 */

// Cargamos los scripts de Firebase desde la CDN de Google
import "https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js";
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

// Accedemos a la instancia global que crea la CDN
const firebase = window.firebase;

if (!firebase.apps.length) { 
    firebase.initializeApp(firebaseConfig); 
}

// Exportamos la referencia a Firestore para usarla en los demás módulos
export const db = firebase.firestore();
