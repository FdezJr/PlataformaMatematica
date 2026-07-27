/**
 * tests/pruebas.js
 * Lógica de ejecución de tareas cognitivas: Memoria, Atención, Control Inhibitorio (incl. Intruso) y Flexibilidad
 */

import { db } from '../firebase.js';
import { state } from '../core/state.js';
import { showScreen } from '../ui/ui.js';
import { showToast, shuffleArray, getRandomInt } from '../utils/helpers.js';
import { finalizarTamizajeYGuardar } from '../auth/resultados.js';

/* ==========================================================================
   1. MEMORIA DE TRABAJO 1 (Ordenamiento Numérico)
   ========================================================================== */
export function startMemory1Test() {
    state.mem1.sequence = [];
    state.mem1.userSequence = [];
    state.mem1.errors = [];

    // Generar secuencia única de 5 dígitos
    while (state.mem1.sequence.length < 5) {
        const num = getRandomInt(1, 9);
        if (!state.mem1.sequence.includes(num)) {
            state.mem1.sequence.push(num);
        }
    }

    const displayElem = document.getElementById('mem1SequenceDisplay');
    if (displayElem) displayElem.innerText = state.mem1.sequence.join(' - ');

    showScreen('screenTestMemory1');
}

export function selectMemory1Number(num) {
    if (state.mem1.userSequence.length >= 5) return;
    state.mem1.userSequence.push(num);
    
    const inputDisplay = document.getElementById('mem1UserInput');
    if (inputDisplay) inputDisplay.innerText = state.mem1.userSequence.join(' - ');
}

export function clearMemory1Selection() {
    state.mem1.userSequence = [];
    const inputDisplay = document.getElementById('mem1UserInput');
    if (inputDisplay) inputDisplay.innerText = '-';
}

export function submitMemory1Answer() {
    if (state.mem1.userSequence.length < 5) {
        showToast("Debes seleccionar los 5 números.");
        return;
    }

    // Ordenamiento correcto esperado (ascendente)
    const sortedExpected = [...state.mem1.sequence].sort((a, b) => a - b);
    const errors = [];

    state.mem1.userSequence.forEach((val, idx) => {
        if (val !== sortedExpected[idx]) {
            errors.push({ posicion: idx + 1, elegido: val, correcto: sortedExpected[idx] });
        }
    });

    state.mem1.errors = errors;
    const esCorrecto = errors.length === 0;

    // Guardar resultado crudo de Memoria 1
    db.collection("resultados").add({
        nombre: state.user.nombre,
        curso: state.user.curso,
        subcategoria: "Memoria de Trabajo - Ordenar",
        esCorrecto: esCorrecto,
        errores: errors,
        fecha: new Date().toISOString()
    });

    // Avanzar a la instrucción de Memoria 2
    showScreen('screenInstrMemory2');
}

/* ==========================================================================
   2. MEMORIA DE TRABAJO 2 (Operaciones + Palabras / Operation Span)
   ========================================================================== */
const MEM2_TRIALS = [
    { math: "3 + 2 = 5", isMathCorrect: true, word: "Lápiz" },
    { math: "7 - 4 = 2", isMathCorrect: false, word: "Regla" },
    { math: "4 + 4 = 8", isMathCorrect: true, word: "Libro" },
    { math: "9 - 5 = 3", isMathCorrect: false, word: "Esfera" },
    { math: "5 + 3 = 8", isMathCorrect: true, word: "Ángulo" }
];

export function startMemory2Test() {
    state.mem2.currentTrial = 0;
    state.mem2.results = [];
    state.mem2.totalMathCorrect = 0;
    renderMemory2Trial();
    showScreen('screenTestMemory2');
}

function renderMemory2Trial() {
    const trial = MEM2_TRIALS[state.mem2.currentTrial];
    const mathElem = document.getElementById('mem2MathOp');
    const wordElem = document.getElementById('mem2WordDisplay');
    
    if (mathElem) mathElem.innerText = trial.math;
    if (wordElem) wordElem.innerText = trial.word;
}

export function processMemory2Response(userMathChoice, selectedWord) {
    const trial = MEM2_TRIALS[state.mem2.currentTrial];
    const isMathRight = (userMathChoice === trial.isMathCorrect);
    const isWordRight = (selectedWord === trial.word);

    if (isMathRight) state.mem2.totalMathCorrect++;
    state.mem2.results.push({ mathCorrect: isMathRight, wordCorrect: isWordRight });

    state.mem2.currentTrial++;

    if (state.mem2.currentTrial < MEM2_TRIALS.length) {
        renderMemory2Trial();
    } else {
        // Guardar resultados de Memoria 2
        const correctRecalls = state.mem2.results.filter(r => r.wordCorrect).length;
        db.collection("resultados").add({
            nombre: state.user.nombre,
            curso: state.user.curso,
            subcategoria: "Memoria de Trabajo - Distractor",
            metricas: {
                correctRecalls: correctRecalls,
                correctMath: state.mem2.totalMathCorrect
            },
            fecha: new Date().toISOString()
        });

        // Pasar a la instrucción de Atención Sostenida
        showScreen('screenInstrAttention');
    }
}

/* ==========================================================================
   3. ATENCIÓN SOSTENIDA (Cancelación de Estímulos / Target)
   ========================================================================== */
export function startAttentionTest() {
    state.att.foundCount = 0;
    state.att.wrongClicks = 0;
    state.att.startTime = Date.now();

    const grid = document.getElementById('attentionGrid');
    if (!grid) return;
    grid.innerHTML = '';

    // Generar un tablero de 64 ítems (10 objetivos "7", 54 distractores)
    const items = [];
    for (let i = 0; i < 10; i++) items.push({ type: 'target', val: '7' });
    const distractors = ['1', '3', '4', '8', '2', '9'];
    for (let i = 0; i < 54; i++) {
        const d = distractors[Math.floor(Math.random() * distractors.length)];
        items.push({ type: 'distractor', val: d });
    }

    const shuffled = shuffleArray(items);

    shuffled.forEach((item) => {
        const btn = document.createElement('button');
        btn.className = 'attention-btn p-3 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] font-mono font-bold text-lg hover:border-[var(--primary)] transition-all';
        btn.innerText = item.val;
        btn.onclick = () => handleAttentionClick(btn, item.type);
        grid.appendChild(btn);
    });

    showScreen('screenTestAttention');
}

function handleAttentionClick(buttonElem, type) {
    if (buttonElem.disabled) return;
    buttonElem.disabled = true;

    if (type === 'target') {
        buttonElem.classList.add('bg-emerald-500/20', 'border-emerald-500', 'text-emerald-400');
        state.att.foundCount++;
    } else {
        buttonElem.classList.add('bg-rose-500/20', 'border-rose-500', 'text-rose-400');
        state.att.wrongClicks++;
    }
}

export function finishAttentionTest() {
    const totalObjetivo = 10;
    const omisiones = Math.max(0, totalObjetivo - state.att.foundCount);

    db.collection("resultados").add({
        nombre: state.user.nombre,
        curso: state.user.curso,
        subcategoria: "Atención Sostenida",
        metricas: {
            aciertos: state.att.foundCount,
            falsasAlarmas: state.att.wrongClicks,
            omisiones: omisiones,
            totalObjetivo: totalObjetivo
        },
        fecha: new Date().toISOString()
    });

    showScreen('screenInstrInhibition');
}

/* ==========================================================================
   4. CONTROL INHIBITORIO 1 (Conflicto / Go-NoGo)
   ========================================================================== */
export function finishInhibition1Test(aciertos, falsasAlarmas, omisiones, rechazosCorrectos) {
    state.inh = { aciertos, falsasAlarmas, omisiones, rechazosCorrectos };

    db.collection("resultados").add({
        nombre: state.user.nombre,
        curso: state.user.curso,
        subcategoria: "Control Inhibitorio",
        metricas: state.inh,
        fecha: new Date().toISOString()
    });

    showScreen('screenInstrInhibitionB');
}

/* ==========================================================================
   5. CONTROL INHIBITORIO 2 (Interferencia Numérica)
   ========================================================================== */
export function finishInhibition2Test(aciertos) {
    state.inhB = { aciertos };

    db.collection("resultados").add({
        nombre: state.user.nombre,
        curso: state.user.curso,
        subcategoria: "Control Inhibitorio - Interferencia",
        metricas: { aciertos: aciertos, totalObjetivo: 8 },
        fecha: new Date().toISOString()
    });

    // Avanzar a la nueva actividad: El Intruso
    showScreen('screenInstrIntruso');
}

/* ==========================================================================
   6. CONTROL INHIBITORIO 3 (Prueba de "¡INTRUSO!")
   ========================================================================== */
const INTRUSO_TRIALS = [
    { options: ['2', '4', '6', '7'], correctIndex: 3, reason: "7 es impar" },
    { options: ['10', '15', '20', '23'], correctIndex: 3, reason: "23 no es múltiplo de 5" },
    { options: ['△', '□', '◯', '3'], correctIndex: 3, reason: "3 es un número, no una figura" },
    { options: ['1/2', '2/4', '3/6', '3/5'], correctIndex: 3, reason: "3/5 no es equivalente a 0.5" },
    { options: ['5', '11', '13', '16'], correctIndex: 3, reason: "16 no es número primo" },
    { options: ['+', '-', '×', 'A'], correctIndex: 3, reason: "A es una letra, no un operador" },
    { options: ['100', '200', '300', '350'], correctIndex: 3, reason: "350 no cambia de 100 en 100" },
    { options: ['9', '16', '25', '30'], correctIndex: 3, reason: "30 no es un cuadrado perfecto" }
];

let currentIntrusoTrial = 0;

export function startIntrusoTest() {
    currentIntrusoTrial = 0;
    state.intruso.aciertos = 0;
    renderIntrusoTrial();
    showScreen('screenTestIntruso');
}

function renderIntrusoTrial() {
    const trial = INTRUSO_TRIALS[currentIntrusoTrial];
    const container = document.getElementById('intrusoOptionsContainer');
    const counter = document.getElementById('intrusoTrialCounter');

    if (counter) counter.innerText = `Ensayo ${currentIntrusoTrial + 1} de ${INTRUSO_TRIALS.length}`;

    if (!container) return;
    container.innerHTML = '';

    // Preparar opciones mezcladas guardando la respuesta correcta
    const optionObjects = trial.options.map((opt, idx) => ({
        text: opt,
        isCorrect: idx === trial.correctIndex
    }));

    const shuffled = shuffleArray(optionObjects);

    shuffled.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'w-full p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] font-bold text-xl hover:border-[var(--purple)] hover:bg-purple-500/10 transition-all';
        btn.innerText = opt.text;
        btn.onclick = () => selectIntrusoAnswer(opt.isCorrect);
        container.appendChild(btn);
    });
}

function selectIntrusoAnswer(isCorrect) {
    if (isCorrect) {
        state.intruso.aciertos++;
    }

    currentIntrusoTrial++;

    if (currentIntrusoTrial < INTRUSO_TRIALS.length) {
        renderIntrusoTrial();
    } else {
        // Guardar resultado de Intruso en Firestore
        db.collection("resultados").add({
            nombre: state.user.nombre,
            curso: state.user.curso,
            subcategoria: "Control Inhibitorio - Intruso",
            metricas: { aciertos: state.intruso.aciertos, totalObjetivo: INTRUSO_TRIALS.length },
            fecha: new Date().toISOString()
        });

        // Avanzar a la instrucción de Flexibilidad Cognitiva
        showScreen('screenInstrFlexibility');
    }
}

/* ==========================================================================
   7. FLEXIBILIDAD COGNITIVA Y FINALIZACIÓN
   ========================================================================== */
export function finishFlexibilityTest(scoreR1, scoreR2) {
    state.flex.scoreR1 = scoreR1;
    state.flex.scoreR2 = scoreR2;

    const totalAciertos = scoreR1 + scoreR2;

    db.collection("resultados").add({
        nombre: state.user.nombre,
        curso: state.user.curso,
        subcategoria: "Flexibilidad Cognitiva",
        metricas: { aciertosR1: scoreR1, aciertosR2: scoreR2, totalAciertos: totalAciertos },
        fecha: new Date().toISOString()
    });

    // Consolidación final de todas las pruebas para el cálculo del Perfil Cognitivo
    const resultadosFinales = {
        mem1_aciertos: state.mem1.errors.length === 0 ? 5 : (5 - state.mem1.errors.length),
        mem2_aciertos: state.mem2.results.filter(r => r.wordCorrect).length,
        att_aciertos: state.att.foundCount,
        inh_aciertos: state.inh.aciertos,
        inh_totales: (state.inh.aciertos + state.inh.omisiones) || 10,
        inhB_aciertos: state.inhB.aciertos,
        intruso_aciertos: state.intruso.aciertos,
        flex_r1: scoreR1,
        flex_r2: scoreR2
    };

    finalizarTamizajeYGuardar(resultadosFinales);
}

// Registro global de funciones expuestas para botones del DOM
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
window.finishFlexibilityTest = finishFlexibilityTest;
