// modules/intruso.js

import { state } from '../core/state.js'; // Ajusta la ruta a tu state.js si es necesario
import { showScreen } from './ui.js';       // Ajusta la ruta a tu ui.js si es necesario

// Configuración de la actividad
const INTRUSO_CONFIG = {
    durationMs: 180000,       // 3 minutos
    stimulusIntervalMs: 2000, // Cada número dura 2 segundos
    targetProbability: 0.3,   // 30% de probabilidad de ser doble/mitad
    minNum: 2,
    maxNum: 60
};

let intrusoState = {
    timer: null,
    interval: null,
    history: [],
    prevNumber: null,
    currNumber: null,
    isTarget: false,
    stimulusStartTime: 0,
    hasRespondedCurrent: false
};

// Función de inicialización para exponer las funciones al ámbito global (window)
export function initIntruso() {
    window.startIntruso = startIntruso;
    window.registerIntrusoClick = registerIntrusoClick;
}

function startIntruso() {
    showScreen('screenPlayIntruso');
    intrusoState.history = [];
    intrusoState.prevNumber = null;
    intrusoState.currNumber = null;
    intrusoState.hasRespondedCurrent = true; // Deshabilita clics antes de la cuenta regresiva
    
    const btn = document.getElementById('btnIntruso');
    const display = document.getElementById('intrusoNumberDisplay');
    
    if (btn) btn.disabled = true;
    if (display) display.innerText = "3";
    
    // Cuenta regresiva visual (3, 2, 1)
    setTimeout(() => { if (display) display.innerText = "2"; }, 1000);
    setTimeout(() => { if (display) display.innerText = "1"; }, 2000);
    
    setTimeout(() => {
        if (btn) btn.disabled = false;
        showNextNumber();
        
        // Intervalo que cambia el número cada 2 segundos
        intrusoState.interval = setInterval(showNextNumber, INTRUSO_CONFIG.stimulusIntervalMs);
        
        // Temporizador total de 3 minutos
        intrusoState.timer = setTimeout(endIntruso, INTRUSO_CONFIG.durationMs);
    }, 3000);
}

function showNextNumber() {
    // Si no respondió al número anterior, registra la omisión/paso
    if (intrusoState.currNumber !== null && !intrusoState.hasRespondedCurrent) {
        saveStimulusResult(false, 0);
    }

    intrusoState.prevNumber = intrusoState.currNumber;
    intrusoState.hasRespondedCurrent = false;
    
    // Decidir si este número será un objetivo (doble o mitad)
    intrusoState.isTarget = Math.random() < INTRUSO_CONFIG.targetProbability;
    
    if (!intrusoState.prevNumber) {
        // Primer número: aleatorio par entre minNum y maxNum
        intrusoState.currNumber = Math.floor(Math.random() * ((INTRUSO_CONFIG.maxNum / 2) - 1)) * 2 + 2;
        intrusoState.isTarget = false; 
    } else if (intrusoState.isTarget) {
        // Generar Doble o Mitad
        const options = [];
        if (intrusoState.prevNumber * 2 <= INTRUSO_CONFIG.maxNum) {
            options.push(intrusoState.prevNumber * 2);
        }
        if (intrusoState.prevNumber % 2 === 0 && (intrusoState.prevNumber / 2) >= INTRUSO_CONFIG.minNum) {
            options.push(intrusoState.prevNumber / 2);
        }
        
        if (options.length > 0) {
            intrusoState.currNumber = options[Math.floor(Math.random() * options.length)];
        } else {
            // Fallback si no hay opción válida de doble/mitad
            intrusoState.isTarget = false;
            intrusoState.currNumber = getRandomNonTarget(intrusoState.prevNumber);
        }
    } else {
        intrusoState.currNumber = getRandomNonTarget(intrusoState.prevNumber);
    }

    // Dibujar en pantalla
    const display = document.getElementById('intrusoNumberDisplay');
    if (display) {
        display.innerText = intrusoState.currNumber;
        display.classList.remove('scale-110');
        void display.offsetWidth; // Reinicia animación CSS
        display.classList.add('scale-110');
    }
    
    intrusoState.stimulusStartTime = performance.now();
}

function getRandomNonTarget(prev) {
    let next;
    do {
        next = Math.floor(Math.random() * (INTRUSO_CONFIG.maxNum - INTRUSO_CONFIG.minNum + 1)) + INTRUSO_CONFIG.minNum;
    } while (next === prev * 2 || (prev % 2 === 0 && next === prev / 2) || next === prev);
    return next;
}

function registerIntrusoClick() {
    if (intrusoState.hasRespondedCurrent || intrusoState.prevNumber === null) return;
    
    intrusoState.hasRespondedCurrent = true;
    const rt = performance.now() - intrusoState.stimulusStartTime;
    const isCorrect = intrusoState.isTarget;
    
    saveStimulusResult(true, rt);
    flashScreen(isCorrect);
}

function saveStimulusResult(responded, rt) {
    if (intrusoState.prevNumber !== null) {
        intrusoState.history.push({
            prev: intrusoState.prevNumber,
            curr: intrusoState.currNumber,
            isTarget: intrusoState.isTarget,
            responded: responded,
            isCorrect: responded ? intrusoState.isTarget : !intrusoState.isTarget,
            rt: responded ? Math.round(rt) : null
        });
    }
}

function flashScreen(isCorrect) {
    const card = document.getElementById('intrusoCard');
    if (!card) return;
    
    const color = isCorrect ? 'rgba(34, 197, 94, 0.25)' : 'rgba(239, 68, 68, 0.25)';
    const border = isCorrect ? '2px solid rgb(34, 197, 94)' : '2px solid rgb(239, 68, 68)';
    
    card.style.backgroundColor = color;
    card.style.border = border;
    
    setTimeout(() => {
        card.style.backgroundColor = '';
        card.style.border = '';
    }, 200);
}

async function endIntruso() {
    clearInterval(intrusoState.interval);
    clearTimeout(intrusoState.timer);
    
    // Registrar el último ítem si no se respondió
    if (!intrusoState.hasRespondedCurrent) {
        saveStimulusResult(false, 0);
    }

    // Cálculos de métricas
    const targets = intrusoState.history.filter(h => h.isTarget);
    const nonTargets = intrusoState.history.filter(h => !h.isTarget);
    
    const aciertos = targets.filter(h => h.responded).length;
    const omisiones = targets.filter(h => !h.responded).length;
    const falsasAlarmas = nonTargets.filter(h => h.responded).length;
    
    const rts = targets.filter(h => h.responded).map(h => h.rt);
    const meanRt = rts.length > 0 ? rts.reduce((a, b) => a + b, 0) / rts.length : 0;
    
    // Variabilidad / Estabilidad (Desviación estándar)
    const variance = rts.length > 1 ? rts.reduce((a, b) => a + Math.pow(b - meanRt, 2), 0) / rts.length : 0;
    const rtStability = Math.sqrt(variance);

    // Guardar en el objeto global de estado
    if (!state.resultados) state.resultados = {};
    state.resultados.intruso = {
        aciertos,
        omisiones,
        falsasAlarmas,
        totalObjetivos: targets.length,
        meanRt: Math.round(meanRt),
        rtStability: Math.round(rtStability),
        rawHistory: intrusoState.history
    };

    // Lógica para enviar a Firebase si tienes una función centralizada (ej: guardarResultadoFirebase)
    if (typeof window.guardarResultadoFirebase === 'function') {
        await window.guardarResultadoFirebase();
    }

    // Pasar a la pantalla final o al siguiente reto
    showScreen('screenFinal'); 
}
