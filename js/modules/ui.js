/**
 * ui/ui.js
 * Control de navegación entre pantallas, visibilidad del DOM y modales de práctica
 */

import { showToast } from '../utils/helpers.js';

/**
 * Muestra la pantalla indicada por su ID y oculta todas las demás
 * @param {string} screenId - ID del elemento contenedor de la pantalla
 */
export function showScreen(screenId) {
    const screens = document.querySelectorAll('.screen');
    let targetFound = false;

    screens.forEach(screen => {
        if (screen.id === screenId) {
            screen.classList.add('active');
            screen.style.display = 'block';
            targetFound = true;
        } else {
            screen.classList.remove('active');
            screen.style.display = 'none';
        }
    });

    if (!targetFound) {
        console.warn(`[ui.js] No se encontró ninguna pantalla con el ID: "${screenId}"`);
        return;
    }

    // Desplaza la vista suavemente al inicio superior de la pantalla
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Abre la actividad o modal de práctica de reforzamiento
 */
export function openPracticeGame() {
    const modal = document.getElementById('practiceGameModal');
    if (modal) {
        modal.style.display = 'flex';
        modal.classList.add('active');
    } else {
        showToast("Iniciando actividad de práctica...");
    }
}

/**
 * Cierra el modal de práctica
 */
export function closePracticeGame() {
    const modal = document.getElementById('practiceGameModal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('active');
    }
}

// Asignación al objeto global window para permitir llamadas desde atributos HTML (ej. onclick="showScreen('screenInstrMemory1')")
window.showScreen = showScreen;
window.openPracticeGame = openPracticeGame;
window.closePracticeGame = closePracticeGame;
