/**
 * tests/pruebas.js
 * Lógica modular para todas las pruebas neurocognitivas
 */

import { state } from '../core/state.js';
import { showScreen } from '../ui/ui.js';
// Añadimos ?v=2 para romper la caché del navegador
import { generateRandomNumbers, showToast, shuffleArray } from '../utils/helpers.js?v=2';
import { renderFinalResults } from '../auth/resultados.js';

// Timer para la Prueba de Memoria 1
let mem1TimerInterval = null;

/* ==========================================================================
   1. MEMORIA DE TRABAJO 1 (Ordenamiento con exposición de 10s)
   ========================================================================== */

export function startMemory1Test() {
    state.memory1.sequence = generateRandomNumbers(5, 1, 9);
    state.memory1.userInput = [];

    showScreen('screenTestMemory1');

    const seqDisplay = document.getElementById('mem1SequenceDisplay');
    const inputDisplay = document.getElementById('mem1UserInput');
    const controlsContainer = document.getElementById('mem1ControlsContainer');
    const timerBadge = document.getElementById('mem1TimerBadge');
    const countdownEl = document.getElementById('mem1Countdown');

    seqDisplay.innerText = state.memory1.sequence.join(' - ');
    inputDisplay.innerText = '-';
    
    // Bloquear teclado y resetear colores del indicador
    controlsContainer.classList.add('opacity-40', 'pointer-events-none');
    timerBadge.className = "mb-4 py-2 px-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold inline-block transition-all";
    
    let timeLeft = 10;
    countdownEl.innerText = timeLeft;

    if (mem1TimerInterval) clearInterval(mem1TimerInterval);

    // Cuenta regresiva de 10 segundos
    mem1TimerInterval = setInterval(() => {
        timeLeft--;
        countdownEl.innerText = timeLeft;

        if (timeLeft <= 0) {
            clearInterval(mem1TimerInterval);

            // Ocultar la secuencia e instruir la respuesta
            seqDisplay.innerText = '❓ - ❓ - ❓ - ❓ - ❓';
            timerBadge.innerText = '✏️ ¡Ingresa los números de MENOR a MAYOR!';
            timerBadge.className = "mb-4 py-2 px-4 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-bold inline-block transition-all";

            // Activar el teclado numérico
            controlsContainer.classList.remove('opacity-40', 'pointer-events-none');
        }
    }, 1000);
}

export function selectMemory1Number(num) {
    if (state.memory1.userInput.length < 5) {
        state.memory1.userInput.push(num);
        document.getElementById('mem1UserInput').innerText = state.memory1.userInput.join(' - ');
    }
}

export function clearMemory1Selection() {
    state.memory1.userInput = [];
    document.getElementById('mem1UserInput').innerText = '-';
}

export function submitMemory1Answer() {
    if (state.memory1.userInput.length < 5) {
        showToast('Por favor ingresa los 5 números');
        return;
    }

    const sortedTarget = [...state.memory1.sequence].sort((a, b) => a - b);
    const isCorrect = JSON.stringify(state.memory1.userInput) === JSON.stringify(sortedTarget);

    state.memory1.score = isCorrect ? 10 : 0;
    state.memory1.completed = true;

    showToast(isCorrect ? '¡Excelente memoria!' : 'Respuesta registrada');
    showScreen('screenInstrMemory2');
}


/* ==========================================================================
   2. MEMORIA DE TRABAJO 2 (Operación con Distractor)
   ========================================================================== */

const MEMORY2_TRIALS = [
    { math: '4 + 3 = 7', isCorrect: true, word: 'ÁNGULO' },
    { math: '9 - 4 = 6', isCorrect: false, word: 'MATRIZ' },
    { math: '5 × 2 = 10', isCorrect: true, word: 'VECTOR' },
    { math: '12 ÷ 3 = 5', isCorrect: false, word: 'RADIO' }
];

let currentMem2Index = 0;

export function startMemory2Test() {
    currentMem2Index = 0;
    state.memory2.responses = [];
    showNextMemory2Trial();
    showScreen('screenTestMemory2');
}

function showNextMemory2Trial() {
    if (currentMem2Index < MEMORY2_TRIALS.length) {
        const trial = MEMORY2_TRIALS[currentMem2Index];
        document.getElementById('mem2MathOp').innerText = trial.math;
        document.getElementById('mem2WordDisplay').innerText = trial.word;
    } else {
        // Evaluar puntaje acumulado
        const correctCount = state.memory2.responses.filter(r => r.userEvaluatedMath === r.actualMathCorrect).length;
        state.memory2.score = Math.round((correctCount / MEMORY2_TRIALS.length) * 10);
        state.memory2.completed = true;

        showToast('Prueba de memoria completada');
        showScreen('screenInstrAttention');
    }
}

export function processMemory2Response(userAnswer) {
    const trial = MEMORY2_TRIALS[currentMem2Index];
    state.memory2.responses.push({
        word: trial.word,
        actualMathCorrect: trial.isCorrect,
        userEvaluatedMath: userAnswer
    });

    currentMem2Index++;
    showNextMemory2Trial();
}


/* ==========================================================================
   3. ATENCIÓN SOSTENIDA (Cancelación Numérica)
   ========================================================================== */

let attentionTargetsCount = 0;
let attentionSelectedCount = 0;
let attentionErrorsCount = 0;

export function startAttentionTest() {
    showScreen('screenTestAttention');
    const container = document.getElementById('attentionGrid');
    container.innerHTML = '';

    attentionTargetsCount = 0;
    attentionSelectedCount = 0;
    attentionErrorsCount = 0;

    // Genera 32 números aleatorios
    const numbers = [];
    for (let i = 0; i < 32; i++) {
        const val = Math.floor(Math.random() * 9) + 1;
        numbers.push(val);
        if (val === 7) attentionTargetsCount++;
    }

    numbers.forEach((val) => {
        const btn = document.createElement('button');
        btn.innerText = val;
        btn.className = 'p-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold text-white transition-colors text-base border border-[var(--border)]';
        
        btn.onclick = () => {
            if (btn.disabled) return;
            btn.disabled = true;

            if (val === 7) {
                btn.className = 'p-3 bg-teal-500/20 border border-teal-500 text-teal-300 rounded-xl font-bold text-base';
                attentionSelectedCount++;
            } else {
                btn.className = 'p-3 bg-rose-500/20 border border-rose-500 text-rose-300 rounded-xl font-bold text-base';
                attentionErrorsCount++;
            }
        };

        container.appendChild(btn);
    });
}

export function finishAttentionTest() {
    const totalFound = Math.min(attentionSelectedCount, attentionTargetsCount);
    const rawScore = totalFound - (attentionErrorsCount * 0.5);
    state.attention.score = Math.max(0, Math.min(10, Math.round((rawScore / (attentionTargetsCount || 1)) * 10)));
    state.attention.completed = true;

    showToast('Prueba de atención registrada');
    showScreen('screenInstrInhibition');
}


/* ==========================================================================
   4. CONTROL INHIBITORIO 1 y 2
   ========================================================================== */

export function finishInhibition1Test(aciertos, omisiones, comisiones, tiempo) {
    state.inhibition1.score = Math.round((aciertos / 10) * 10);
    state.inhibition1.completed = true;
    showScreen('screenInstrInhibitionB');
}

export function finishInhibition2Test(aciertos) {
    state.inhibition2.score = Math.round((aciertos / 10) * 10);
    state.inhibition2.completed = true;
    showScreen('screenInstrIntruso');
}


/* ==========================================================================
   5. CONTROL INHIBITORIO 3: EL INTRUSO
   ========================================================================== */

const INTRUSO_TRIALS = [
    { options: ['2', '4', '6', '7'], intruderIndex: 3, rule: 'Números Pares vs Impar' },
    { options: ['3', '6', '9', '11'], intruderIndex: 3, rule: 'Múltiplos de 3' },
    { options: ['5', '10', '15', '18'], intruderIndex: 3, rule: 'Múltiplos de 5' },
    { options: ['Cuadrado', 'Círculo', 'Triángulo', 'Cubo'], intruderIndex: 3, rule: 'Figuras 2D vs 3D' },
    { options: ['1/2', '2/4', '4/8', '1/3'], intruderIndex: 3, rule: 'Fracciones Equivalentes a 0.5' },
    { options: ['11', '13', '17', '21'], intruderIndex: 3, rule: 'Números Primos' },
    { options: ['1', '4', '9', '12'], intruderIndex: 3, rule: 'Cuadrados Perfectos' },
    { options: ['+5', '+10', '+15', 'x2'], intruderIndex: 3, rule: 'Operaciones Aditivas vs Multiplicativa' }
];

let currentIntrusoTrialIndex = 0;
let intrusoCorrectAnswersCount = 0;

export function startIntrusoTest() {
    currentIntrusoTrialIndex = 0;
    intrusoCorrectAnswersCount = 0;
    showScreen('screenTestIntruso');
    renderIntrusoTrial();
}

function renderIntrusoTrial() {
    const trial = INTRUSO_TRIALS[currentIntrusoTrialIndex];
    document.getElementById('intrusoTrialCounter').innerText = `Ensayo ${currentIntrusoTrialIndex + 1} de ${INTRUSO_TRIALS.length}`;

    const container = document.getElementById('intrusoOptionsContainer');
    container.innerHTML = '';

    trial.options.forEach((optText, index) => {
        const btn = document.createElement('button');
        btn.className = 'p-5 bg-slate-900 border border-[var(--border)] hover:border-purple-500 rounded-2xl text-lg font-bold text-white hover:text-purple-300 transition-all shadow-md';
        btn.innerText = optText;
        btn.onclick = () => selectIntrusoOption(index);
        container.appendChild(btn);
    });
}

export function selectIntrusoOption(selectedIndex) {
    const trial = INTRUSO_TRIALS[currentIntrusoTrialIndex];
    
    if (selectedIndex === trial.intruderIndex) {
        intrusoCorrectAnswersCount++;
    }

    currentIntrusoTrialIndex++;

    if (currentIntrusoTrialIndex < INTRUSO_TRIALS.length) {
        renderIntrusoTrial();
    } else {
        // Calcular resultado final del Intruso
        const score = Math.round((intrusoCorrectAnswersCount / INTRUSO_TRIALS.length) * 10);
        state.inhibition3 = {
            score: score,
            correct: intrusoCorrectAnswersCount,
            total: INTRUSO_TRIALS.length,
            completed: true
        };

        showToast('Prueba del Intruso completada');
        showScreen('screenInstrFlexibility');
    }
}


/* ==========================================================================
   6. FLEXIBILIDAD COGNITIVA Y CIERRE
   ========================================================================== */

export function finishFlexibilityTest(aciertos, perseveraciones) {
    state.flexibility.score = Math.round((aciertos / 10) * 10);
    state.flexibility.completed = true;

    showToast('¡Evaluación Neurocognitiva Completada!');
    renderFinalResults();
}


/* ==========================================================================
   ASIGNACIÓN AL OBJETO GLOBAL WINDOW (Para eventos inline de HTML)
   ========================================================================== */

window.startMemory1Test = startMemory1Test;
window.selectMemory1Number = selectMemory1Number;
window.clearMemory1Selection = clearMemory1Selection;
window.submitMemory1Answer = submitMemory1Answer;

window.startMemory2Test = startMemory2Test;
window.processMemory2Response = processMemory2Response;

window.startAttentionTest = startAttentionTest;
window.finishAttentionTest = finishAttentionTest;

window.finishInhibition1Test = finishInhibition1Test;
window.finishInhibition2Test = finishInhibition2Test;

window.startIntrusoTest = startIntrusoTest;
window.selectIntrusoOption = selectIntrusoOption;

window.finishFlexibilityTest = finishFlexibilityTest;
