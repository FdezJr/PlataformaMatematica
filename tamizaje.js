/**
 * tamizaje.js
 * Punto de entrada principal de la aplicación (ES Module)
 */

// Cargamos los módulos para que registren sus funciones globales (window) y la lógica de eventos
import './ui/ui.js';
import './tests/pruebas.js';
import './auth/resultados.js';
import { setupAuthListeners, verificarUsuarioExistente } from './auth/auth.js';

// Inicialización de la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Escuchadores de eventos para formularios y autenticación docente
    setupAuthListeners();
    
    // Verificación de datos de perfil previo almacenados localmente
    verificarUsuarioExistente();
});
