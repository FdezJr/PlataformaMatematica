/**
 * Funciones Auxiliares, Formateadores y Textos del Sistema
 */
export function formatTime(ms) { 
    if(!ms) return '-'; 
    const s = Math.floor(ms / 1000); 
    const t = Math.floor((ms % 1000) / 100); 
    return `${s}.${t}s`; 
}

export function formatDate(iso) { 
    const d = new Date(iso); 
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' + 
           d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }); 
}

export function showToast(message) { 
    const existing = document.querySelector('.toast'); 
    if(existing) existing.remove(); 
    const toast = document.createElement('div'); 
    toast.className = 'toast'; 
    toast.textContent = message; 
    document.body.appendChild(toast); 
    setTimeout(() => toast.remove(), 3000); 
}

export const textosInstrucciones = {
    mem2: { 
        title: "Reto 2: Número y Distractor", 
        body: `<p>1. Estás viendo un número de <strong>3 dígitos</strong> para memorizarlo.</p><p>2. Luego debes resolver una operación matemática intermedia rápida.</p><p>3. Finalmente, escribe el número inicial de 3 dígitos.</p>` 
    },
    att: { 
        title: "Reto 3: Búsqueda Visual", 
        body: `<p>1. Busca en la cuadrícula el número objetivo resaltado en morado.</p><p>2. Haz clic en él <strong>todas las veces</strong> que aparezca en la pantalla.</p><p>3. El reto terminará automáticamente al encontrarlos todos.</p>` 
    },
    inh: { 
        title: "Reto 4: Operaciones Selectivas", 
        body: `<p>1. Analiza las operaciones aritméticas presentadas.</p><p>2. Escribe el resultado matemático <strong>SOLO si el valor final supera a 20</strong>.</p><p>3. Si el resultado es igual o menor a 20, déjalo completamente en blanco.</p>` 
    },
    inhB: { 
        title: "Reto 4B: Ignora la Palabra", 
        body: `<p>1. Aparece una operación matemática simple y una palabra grande de distracción.</p><p>2. <strong class="text-rose-400">¡Ignora por completo la palabra en rojo!</strong> (Aunque diga RESTA o MULTIPLICACIÓN).</p><p>3. Guíate únicamente por el operador aritmético central de la ecuación.</p>` 
    },
    flex: { 
        title: "Reto 5: Cambio de Regla", 
        body: `<p>1. Resuelve mentalmente la operación en pantalla.</p><p>2. <strong>Ronda 1:</strong> Presiona <span class="text-pink-400 font-bold">P</span> si el resultado es Par, o <span class="text-teal-400 font-bold">I</span> si es Impar.</p><p>3. <strong>Ronda 2:</strong> ¡La regla se invierte! Presiona <span class="text-teal-400 font-bold">I</span> si es Par, o <span class="text-pink-400 font-bold">P</span> si es Impar.</p>` 
    }
};
