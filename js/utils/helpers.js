/**
 * utils/helpers.js
 * Funciones de utilidad general: notificaciones, fechas y funciones matemáticas/arreglos
 */

/**
 * Muestra un mensaje flotante (Toast) en la pantalla
 * @param {string} message - Mensaje a desplegar
 */
export function showToast(message) {
    let toast = document.getElementById('toastNotification');
    
    // Si no existe el contenedor del toast en el DOM, lo crea dinámicamente
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toastNotification';
        toast.className = 'toast-notification';
        document.body.appendChild(toast);
    }
    
    toast.innerText = message;
    toast.classList.add('show');
    
    // Ocultar automáticamente después de 3 segundos
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

/**
 * Convierte una fecha ISO a un formato local accesible (DD/MM/AAAA, HH:MM)
 * @param {string} isoString - Cadena de fecha en formato ISO
 * @returns {string} Fecha formateada
 */
export function formatDate(isoString) {
    if (!isoString) return '-';
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '-';
    
    return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Mezcla aleatoriamente los elementos de un arreglo (Algoritmo Fisher-Yates)
 * Útil para aleatorizar la posición de los estímulos o ítems intrusos
 * @param {Array} array 
 * @returns {Array} Nueva copia del arreglo desordenado
 */
export function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

/**
 * Genera un número entero aleatorio entre min y max (ambos inclusive)
 */
export function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
