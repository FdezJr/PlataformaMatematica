/**
 * utils/helpers.js
 * Funciones auxiliares globales para la plataforma
 */

/**
 * Muestra una notificación flotante (Toast)
 * @param {string} message - Texto a mostrar en la notificación
 */
export function showToast(message) {
    const toast = document.getElementById('toastNotification');
    if (!toast) return;

    toast.innerText = message;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

/**
 * Genera un array de N números aleatorios únicos en un rango [min, max]
 * @param {number} count - Cantidad de números a generar
 * @param {number} min - Valor mínimo
 * @param {number} max - Valor máximo
 * @returns {number[]} Array con números aleatorios únicos
 */
export function generateRandomNumbers(count, min, max) {
    const numbers = new Set();
    while (numbers.size < count) {
        const randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
        numbers.add(randomNum);
    }
    return Array.from(numbers);
}

/**
 * Mezcla aleatoriamente los elementos de un array (Algoritmo Fisher-Yates)
 * @param {Array} array - Array original
 * @returns {Array} Nuevo array mezclado
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
 * Formatea una fecha al estándar local
 * @param {Date} date - Objeto fecha
 * @returns {string} Fecha formateada
 */
export function formatDate(date = new Date()) {
    return new Intl.DateTimeFormat('es-DO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}
