/**
 * Lógica de Negocio de Retos Cognitivos y Práctica Interactiva
 */
import { db } from '../config/firebase.js';
import { state, practiceState, CIRC, appControl } from '../core/state.js';
import { showScreen } from './ui.js';
import { showToast } from '../utils/helpers.js';
import { finalizarTamizajeYGuardar } from './resultados.js';

// --- RETO 1: MEMORIA DE TRABAJO ---
export function startMemory1Display() { 
    state.mem1.numbers = []; 
    let a = 0; 
    while (state.mem1.numbers.length < 5 && a < 500) { 
        const n = Math.floor(Math.random() * 18) + 2; 
        if (!state.mem1.numbers.some(e => Math.abs(e - n) < 3)) state.mem1.numbers.push(n); 
        a++; 
    } 
    state.mem1.correctOrder = [...state.mem1.numbers].sort((a, b) => a - b); 
    state.mem1.userOrder = []; 
    const c = document.getElementById('flashcardNumbers1'); 
    c.innerHTML = ''; 
    state.mem1.numbers.forEach(n => { 
        const s = document.createElement('span'); 
        s.className = 'flashcard-num'; 
        s.textContent = n; 
        c.appendChild(s); 
    }); 
    showScreen('screenDisplayMemory1'); 
    
    const sT = Date.now(); 
    const p = document.getElementById('countdownProgress1'); 
    const tE = document.getElementById('countdownText1'); 
    p.style.strokeDashoffset = '0'; 
    p.style.stroke = 'var(--primary)'; 
    tE.textContent = '10'; 
    tE.style.fill = 'var(--text)'; 
    
    clearInterval(state.mem1.interval); 
    state.mem1.interval = setInterval(() => { 
        const e = (Date.now() - sT) / 1000; 
        const r = Math.max(0, 10 - e); 
        p.style.strokeDashoffset = CIRC * (1 - r / 10); 
        if (r <= 2) { 
            p.style.stroke = 'var(--error)'; 
            tE.style.fill = 'var(--error)'; 
        } else if (r <= 4) { 
            p.style.stroke = 'var(--accent)'; 
            tE.style.fill = 'var(--accent)'; 
        } 
        tE.textContent = Math.ceil(r); 
        if (r <= 0) { 
            clearInterval(state.mem1.interval); 
            startMemory1Sorting(); 
        } 
    }, 50); 
}

export function startMemory1Sorting() { 
    showScreen('screenSortingMemory1'); 
    const c = document.getElementById('inputCellsContainer1'); 
    c.innerHTML = ''; 
    document.getElementById('btnVerifyMemory1').disabled = false; 
    
    for (let i = 0; i < 5; i++) { 
        const inp = document.createElement('input'); 
        inp.type = 'text'; 
        inp.className = 'input-cell'; 
        inp.id = `cell-${i}`; 
        inp.maxLength = 2; 
        inp.placeholder = i + 1; 
        inp.setAttribute('inputmode', 'numeric'); 
        inp.addEventListener('input', (e) => { 
            e.target.value = e.target.value.replace(/[^0-9]/g, ''); 
            if (e.target.value.length >= 2) { 
                const n = document.getElementById(`cell-${i + 1}`); 
                if (n) n.focus(); 
                else e.target.blur(); 
            } 
        }); 
        c.appendChild(inp); 
    } 
    setTimeout(() => document.getElementById('cell-0').focus(), 100); 
    state.mem1.startTime = Date.now(); 
}

export async function verifyMemory1() { 
    const uO = []; 
    for (let i = 0; i < 5; i++) { 
        const inp = document.getElementById(`cell-${i}`); 
        const v = inp.value.trim(); 
        if (v === '') { 
            showToast('Completa todas las celdas.'); 
            inp.focus(); 
            return; 
        } 
        uO.push(parseInt(v)); 
    } 
    document.getElementById('btnVerifyMemory1').disabled = true; 
    state.mem1.userOrder = uO; 
    state.mem1.elapsed = Date.now() - state.mem1.startTime; 
    
    let aC = true; 
    const m = []; 
    for (let i = 0; i < 5; i++) { 
        if (state.mem1.userOrder[i] !== state.mem1.correctOrder[i]) { 
            aC = false; 
            m.push({ posicion: i + 1, elegido: state.mem1.userOrder[i], correcto: state.mem1.correctOrder[i] }); 
        } 
    } 
    
    const res = { 
        categoria: "Funciones Ejecutivas", 
        subcategoria: "Memoria de Trabajo - Ordenar", 
        nombre: state.user.nombre, 
        edad: state.user.edad, 
        curso: state.user.curso, 
        esCorrecto: aC, 
        errores: m, 
        tiempoMs: state.mem1.elapsed, 
        fecha: new Date().toISOString() 
    }; 
    
    try { 
        await db.collection("resultados").add(res); 
        showScreen('screenInstrMemory2'); 
    } catch (e) { 
        console.error(e); 
        showToast("Error al guardar."); 
        document.getElementById('btnVerifyMemory1').disabled = false; 
    } 
}

// --- RETO 2: MEMORIA DE TRABAJO / DISTRACTOR ---
export function startMemory2() { 
    state.mem2.trials = []; 
    state.mem2.results = []; 
    state.mem2.currentTrial = 0; 
    
    for (let i = 0; i < 5; i++) { 
        const n = Math.floor(Math.random() * 900) + 100; 
        const a = Math.floor(Math.random() * 15) + 2; 
        const b = Math.floor(Math.random() * 10) + 2; 
        const op = Math.random() > 0.5 ? '+' : '-'; 
        let mathText, mathResult; 
        if (op === '+') { 
            mathText = `${a} + ${b}`; 
            mathResult = a + b; 
        } else { 
            const max = Math.max(a, b), min = Math.min(a, b); 
            mathText = `${max} - ${min}`; 
            mathResult = max - min; 
        } 
        state.mem2.trials.push({ targetNum: n, mathText: mathText, mathResult: mathResult }); 
    } 
    showScreen('screenPlayMemory2'); 
    startMem2Trial(); 
}

export function startMem2Trial() { 
    const t = state.mem2.trials[state.mem2.currentTrial]; 
    document.getElementById('mem2Round').innerText = `${state.mem2.currentTrial + 1} / 5`; 
    document.getElementById('mem2NumberDisplay').innerText = t.targetNum; 
    document.getElementById('mem2Phase1').style.display = 'block'; 
    document.getElementById('mem2Phase2').style.display = 'none'; 
    document.getElementById('mem2Phase3').style.display = 'none'; 
    state.mem2.startTime = Date.now(); 
    
    const p = document.getElementById('countdownProgress2'); 
    const tE = document.getElementById('countdownText2'); 
    p.style.strokeDashoffset = '0'; 
    p.style.stroke = 'var(--primary)'; 
    tE.textContent = '5'; 
    tE.style.fill = 'var(--text)'; 
    
    clearInterval(state.mem2.interval); 
    state.mem2.interval = setInterval(() => { 
        if (appControl.isPaused) return; 
        const e = (Date.now() - state.mem2.startTime) / 1000; 
        const r = Math.max(0, 5 - e); 
        p.style.strokeDashoffset = CIRC * (1 - r / 5); 
        if (r <= 2) { 
            p.style.stroke = 'var(--error)'; 
            tE.style.fill = 'var(--error)'; 
        } 
        tE.textContent = Math.ceil(r); 
        if (r <= 0) { 
            clearInterval(state.mem2.interval); 
            showMem2Math(); 
        } 
    }, 50); 
}

export function showMem2Math() { 
    const t = state.mem2.trials[state.mem2.currentTrial]; 
    document.getElementById('mem2MathDisplay').innerText = t.mathText + " = ?"; 
    document.getElementById('mem2MathInput').value = ''; 
    document.getElementById('mem2Phase1').style.display = 'none'; 
    document.getElementById('mem2Phase2').style.display = 'block'; 
    document.getElementById('mem2Phase3').style.display = 'none'; 
    document.getElementById('mem2MathInput').focus(); 
}

export function submitMathMem2() { 
    const v = document.getElementById('mem2MathInput').value.trim(); 
    if (v === '') { 
        showToast('Escribe el resultado.'); 
        return; 
    } 
    state.mem2.results.push({ mathCorrect: parseInt(v) === state.mem2.trials[state.mem2.currentTrial].mathResult }); 
    document.getElementById('mem2RecallInput').value = ''; 
    document.getElementById('mem2Phase1').style.display = 'none'; 
    document.getElementById('mem2Phase2').style.display = 'none'; 
    document.getElementById('mem2Phase3').style.display = 'block'; 
    document.getElementById('mem2RecallInput').focus(); 
}

export function submitRecallMem2() { 
    const v = document.getElementById('mem2RecallInput').value.trim(); 
    if (v === '') { 
        showToast('Escribe el número.'); 
        return; 
    } 
    state.mem2.results[state.mem2.currentTrial].recallCorrect = parseInt(v) === state.mem2.trials[state.mem2.currentTrial].targetNum; 
    state.mem2.currentTrial++; 
    if (state.mem2.currentTrial < 5) { 
        startMem2Trial(); 
    } else { 
        finishMemory2(); 
    } 
}

async function finishMemory2() { 
    const res = { 
        categoria: "Funciones Ejecutivas", 
        subcategoria: "Memoria de Trabajo - Distractor", 
        nombre: state.user.nombre, 
        edad: state.user.edad, 
        curso: state.user.curso, 
        metricas: { 
            correctRecalls: state.mem2.results.filter(r => r.recallCorrect).length, 
            correctMath: state.mem2.results.filter(r => r.mathCorrect).length, 
            totalTrials: 5 
        }, 
        fecha: new Date().toISOString() 
    }; 
    try { 
        await db.collection("resultados").add(res); 
        showScreen('screenInstrAttention'); 
    } catch (e) { 
        console.error(e); 
    } 
}

// --- RETO 3: ATENCIÓN SOSTENIDA ---
export function startAttention() { 
    showScreen('screenPlayAttention'); 
    const gridContainer = document.getElementById('attentionGrid'); 
    gridContainer.innerHTML = ''; 
    state.att.foundCount = 0; 
    state.att.wrongClicks = 0; 
    document.getElementById('attFoundCount').innerText = '0'; 
    state.att.targetNum = Math.floor(Math.random() * 90) + 10; 
    document.getElementById('attTargetDisplay').innerText = state.att.targetNum; 
    document.getElementById('attTotalTarget').innerText = state.att.totalTarget; 
    state.att.gridNumbers = []; 
    
    for(let i=0; i<state.att.totalTarget; i++) state.att.gridNumbers.push(state.att.targetNum); 
    while(state.att.gridNumbers.length < 64) { 
        const d = Math.floor(Math.random() * 90) + 10; 
        if(d !== state.att.targetNum) state.att.gridNumbers.push(d); 
    } 
    state.att.gridNumbers.sort(() => Math.random() - 0.5); 
    
    state.att.gridNumbers.forEach((num) => { 
        const cell = document.createElement('div'); 
        cell.className = 'grid-cell'; 
        cell.textContent = num; 
        cell.onclick = () => handleCellClick(cell, num); 
        gridContainer.appendChild(cell); 
    }); 
    state.att.startTime = Date.now(); 
}

function handleCellClick(cell, num) { 
    if (appControl.isPaused) return; 
    if(cell.classList.contains('selected') || cell.classList.contains('wrong')) return; 
    if(num === state.att.targetNum) { 
        cell.classList.add('selected'); 
        state.att.foundCount++; 
        document.getElementById('attFoundCount').innerText = state.att.foundCount; 
        if(state.att.foundCount === state.att.totalTarget) { 
            setTimeout(() => verifyAttention(), 500); 
        } 
    } else { 
        cell.classList.add('wrong'); 
        state.att.wrongClicks++; 
        setTimeout(() => cell.classList.remove('wrong'), 500); 
    } 
}

export async function verifyAttention() { 
    state.att.elapsed = Date.now() - state.att.startTime; 
    const om = state.att.totalTarget - state.att.foundCount; 
    const res = { 
        categoria: "Funciones Ejecutivas", 
        subcategoria: "Atención Sostenida", 
        nombre: state.user.nombre, 
        edad: state.user.edad, 
        curso: state.user.curso, 
        metricas: { 
            aciertos: state.att.foundCount, 
            falsasAlarmas: state.att.wrongClicks, 
            omisiones: om, 
            totalObjetivo: state.att.totalTarget 
        }, 
        tiempoMs: state.att.elapsed, 
        fecha: new Date().toISOString() 
    }; 
    try { 
        await db.collection("resultados").add(res); 
        showScreen('screenInstrInhibition'); 
    } catch (e) { 
        console.error(e); 
    } 
}

// --- RETO 4: CONTROL INHIBITORIO ---
export function startInhibition() { 
    showScreen('screenOperationsInhibition'); 
    const c = document.getElementById('operationsContainer'); 
    c.innerHTML = ''; 
    state.inh.operations = []; 
    
    for (let i = 0; i < 8; i++) { 
        const iG = i < 4 ? true : Math.random() > 0.5; 
        const oT = Math.random() > 0.4 ? '+' : '-'; 
        let a, b, r, t; 
        if (oT === '+') { 
            if (iG) { 
                r = Math.floor(Math.random() * 30) + 21; 
                a = Math.floor(Math.random() * (r - 1)) + 1; 
                b = r - a; 
            } else { 
                r = Math.floor(Math.random() * 17) + 3; 
                a = Math.floor(Math.random() * (r - 1)) + 1; 
                b = r - a; 
            } 
            t = `${a} + ${b}`; 
        } else { 
            if (iG) { 
                b = Math.floor(Math.random() * 15) + 1; 
                r = Math.floor(Math.random() * 20) + 21; 
                a = r + b; 
            } else { 
                a = Math.floor(Math.random() * 17) + 3; 
                b = Math.floor(Math.random() * (a - 1)) + 1; 
                r = a - b; 
            } 
            t = `${a} - ${b}`; 
        } 
        state.inh.operations.push({ result: r, textOp: t, esMayor20: r > 20 }); 
    } 
    state.inh.operations.sort(() => Math.random() - 0.5); 
    
    state.inh.operations.forEach((op, i) => { 
        const r = document.createElement('div'); 
        r.className = 'op-row'; 
        r.innerHTML = `<span class="font-mono text-lg font-bold" style="color: var(--text); min-width: 120px;">${op.textOp} = </span><input type="number" class="op-input" id="op-input-${i}" placeholder="?" autocomplete="off">`; 
        c.appendChild(r); 
    }); 
    state.inh.startTime = Date.now(); 
}

export async function verifyInhibition() { 
    state.inh.elapsed = Date.now() - state.inh.startTime; 
    let a = 0, o = 0, f = 0, rC = 0; 
    state.inh.operations.forEach((op, i) => { 
        const inp = document.getElementById(`op-input-${i}`); 
        const v = inp.value.trim() !== '' ? parseInt(inp.value.trim()) : null; 
        if (op.esMayor20) { 
            if (v === op.result) a++; 
            else o++; 
        } else { 
            if (v === null) rC++; 
            else f++; 
        } 
    }); 
    const res = { 
        categoria: "Funciones Ejecutivas", 
        subcategoria: "Control Inhibitorio", 
        nombre: state.user.nombre, 
        edad: state.user.edad, 
        curso: state.user.curso, 
        metricas: { aciertos: a, omisiones: o, falsasAlarmas: f, rechazosCorrectos: rC }, 
        tiempoMs: state.inh.elapsed, 
        fecha: new Date().toISOString() 
    }; 
    try { 
        await db.collection("resultados").add(res); 
        showScreen('screenInstrInhibitionB'); 
    } catch (e) { 
        console.error(e); 
    } 
}

// --- RETO 4B: INTERFERENCIA ---
export function startInhibitionB() { 
    state.inhB = { trials: [], current: 0, aciertos: 0, startTime: Date.now(), elapsed: 0 }; 
    const operadores = [
        { signo: '+', palabra: 'SUMA', resolver: (a,b) => a+b }, 
        { signo: '-', palabra: 'RESTA', resolver: (a,b) => a-b }, 
        { signo: '×', palabra: 'MULTIPLICACIÓN', resolver: (a,b) => a*b }
    ]; 
    for (let i = 0; i < 8; i++) { 
        let opReal = operadores[Math.floor(Math.random() * operadores.length)]; 
        let opDistractor = operadores[Math.floor(Math.random() * operadores.length)]; 
        let a = Math.floor(Math.random() * 9) + 2; 
        let b = Math.floor(Math.random() * 8) + 2; 
        if (opReal.signo === '-') { a = Math.max(a, b); b = Math.min(a, b); } 
        let resCorrecto = opReal.resolver(a, b); 
        let textoOp = `${a} ${opReal.signo} ${b}`; 
        state.inhB.trials.push({ texto: textoOp, resultado: resCorrecto, distractorText: opDistractor.palabra }); 
    } 
    showScreen('screenPlayInhibitionB'); 
    renderInhibitionBTrial(); 
}

function renderInhibitionBTrial() { 
    let t = state.inhB.trials[state.inhB.current]; 
    document.getElementById('inhBRound').innerText = `${state.inhB.current + 1} / 8`; 
    document.getElementById('inhBDistractorText').innerText = t.distractorText; 
    document.getElementById('inhBOpText').innerText = t.texto + " = ?"; 
    document.getElementById('inhBInput').value = ''; 
    document.getElementById('inhBInput').focus(); 
}

export async function submitInhibitionB() { 
    if (appControl.isPaused) return; 
    const inputVal = document.getElementById('inhBInput').value.trim(); 
    if (inputVal === '') { 
        showToast('Por favor escribe tu respuesta.'); 
        return; 
    } 
    let t = state.inhB.trials[state.inhB.current]; 
    if (parseInt(inputVal) === t.resultado) { 
        state.inhB.aciertos++; 
    } 
    state.inhB.current++; 
    if (state.inhB.current < 8) { 
        renderInhibitionBTrial(); 
    } else { 
        state.inhB.elapsed = Date.now() - state.inhB.startTime; 
        const res = { 
            categoria: "Funciones Ejecutivas", 
            subcategoria: "Control Inhibitorio - Interferencia", 
            nombre: state.user.nombre, 
            edad: state.user.edad, 
            curso: state.user.curso, 
            metricas: { aciertos: state.inhB.aciertos, totalObjetivo: 8 }, 
            tiempoMs: state.inhB.elapsed, 
            fecha: new Date().toISOString() 
        }; 
        try { await db.collection("resultados").add(res); } catch(e) { console.error(e); } 
        showScreen('screenInstrFlex'); 
    } 
}

// --- RETO 5: FLEXIBILIDAD COGNITIVA ---
export function startFlexibility() { 
    state.flex = { trials: [], current: 0, scoreR1: 0, scoreR2: 0, startTime: Date.now(), elapsed: 0 }; 
    for (let i = 0; i < 8; i++) { 
        let a = Math.floor(Math.random() * 9) + 2; 
        let b = Math.floor(Math.random() * 9) + 2; 
        let op = Math.random() > 0.5 ? '+' : '-'; 
        let res, text; 
        if (op === '+') { 
            res = a + b; 
            text = `${a} + ${b}`; 
        } else { 
            let max = Math.max(a,b), min = Math.min(a,b); 
            res = max - min; 
            text = `${max} - ${min}`; 
        } 
        state.flex.trials.push({ text: text, result: res, isEven: res % 2 === 0, phase: i < 4 ? 1 : 2 }); 
    } 
    showScreen('screenPlayFlex'); 
    renderFlexTrial(); 
}

function renderFlexTrial() { 
    let t = state.flex.trials[state.flex.current]; 
    document.getElementById('flexOpText').innerText = t.text + " = ?"; 
    const badge = document.getElementById('flexRoundBadge'); 
    const ruleBox = document.getElementById('flexRuleBox'); 
    const ruleText = document.getElementById('flexRuleText'); 
    if (t.phase === 1) { 
        badge.innerText = `Ronda 1 - ${state.flex.current + 1} / 4`; 
        badge.style.background = 'var(--pink-glow)'; 
        badge.style.color = 'var(--pink)'; 
        ruleText.innerText = "P = Par | I = Impar"; 
        ruleText.style.color = "var(--pink)"; 
        ruleBox.style.borderColor = "var(--pink)"; 
    } else { 
        badge.innerText = `Ronda 2 - ${state.flex.current - 3} / 4`; 
        badge.style.background = 'rgba(239,68,68,0.15)'; 
        badge.style.color = 'var(--error)'; 
        ruleText.innerText = "¡CAMBIO! I = Par | P = Impar"; 
        ruleText.style.color = "var(--error)"; 
        ruleBox.style.borderColor = "var(--error)"; 
        ruleBox.classList.add('rule-shift'); 
        setTimeout(() => ruleBox.classList.remove('rule-shift'), 400); 
    } 
}

export function submitFlex(ans) { 
    if (appControl.isPaused) return; 
    let t = state.flex.trials[state.flex.current]; 
    let correctPar = t.isEven ? 'P' : 'I'; 
    let correctAns = t.phase === 1 ? correctPar : (correctPar === 'P' ? 'I' : 'P'); 
    if (ans === correctAns) { 
        if (t.phase === 1) state.flex.scoreR1++; 
        else state.flex.scoreR2++; 
    } 
    state.flex.current++; 
    if (state.flex.current < 8) { 
        renderFlexTrial(); 
    } else { 
        finishFlex(); 
    } 
}

async function finishFlex() { 
    state.flex.elapsed = Date.now() - state.flex.startTime; 
    let mem1Aciertos = 0; 
    if (state.mem1.userOrder && state.mem1.correctOrder) { 
        state.mem1.userOrder.forEach((num, idx) => { if (num === state.mem1.correctOrder[idx]) mem1Aciertos++; }); 
    } else { 
        mem1Aciertos = 5; 
    } 
    let mem2Aciertos = 0; 
    if (state.mem2.results && Array.isArray(state.mem2.results)) { 
        mem2Aciertos = state.mem2.results.filter(r => r.recallCorrect === true).length; 
    } 
    if (mem2Aciertos === 0 && state.mem2.currentTrial) { 
        mem2Aciertos = Math.min(state.mem2.currentTrial, 5); 
    } 
    let attNeto = state.att.foundCount || 0; 
    let aciertosInhibicion = 0; 
    let totalOperacionesEvaluadas = 0; 
    
    try { 
        const filasOp = document.querySelectorAll('#operationsContainer .op-row'); 
        if (filasOp.length > 0) { 
            totalOperacionesEvaluadas = filasOp.length; 
            filasOp.forEach(fila => { 
                const textoOp = fila.querySelector('span').innerText.replace(' = ', '').trim(); 
                const valorInput = fila.querySelector('.op-input').value.trim(); 
                const solucionReal = eval(textoOp); 
                if (solucionReal > 20) { 
                    if (parseInt(valorInput) === solucionReal) aciertosInhibicion++; 
                } else { 
                    if (valorInput === "") aciertosInhibicion++; 
                } 
            }); 
        } 
    } catch(err) { console.error(err); } 
    
    const resHistoricoFlex = { 
        categoria: "Funciones Ejecutivas", 
        subcategoria: "Flexibilidad Cognitiva", 
        nombre: state.user.nombre, 
        edad: state.user.edad, 
        curso: state.user.curso, 
        metricas: { 
            aciertosR1: state.flex.scoreR1 || 0, 
            aciertosR2: state.flex.scoreR2 || 0, 
            totalAciertos: (state.flex.scoreR1 || 0) + (state.flex.scoreR2 || 0) 
        }, 
        tiempoMs: state.flex.elapsed, 
        fecha: new Date().toISOString() 
    }; 
    
    const resultadosFinales = { 
        mem1_aciertos: mem1Aciertos, 
        mem2_aciertos: mem2Aciertos, 
        att_aciertos: attNeto, 
        inh_aciertos: aciertosInhibicion, 
        inh_totales: totalOperacionesEvaluadas || 8, 
        inhB_aciertos: state.inhB.aciertos || 0, 
        flex_r1: state.flex.scoreR1 || 0, 
        flex_r2: state.flex.scoreR2 || 0 
    }; 
    
    try { await db.collection("resultados").add(resHistoricoFlex); } catch(e) { console.error(e); } 
    showScreen('screenFinal'); 
    finalizarTamizajeYGuardar(resultadosFinales); 
}

// --- JUEGO INTERACTIVO DE PRÁCTICA ---
export function openPracticeGame() { 
    practiceState.level = 1; 
    practiceState.sequence = []; 
    practiceState.userSequence = []; 
    practiceState.canClick = false; 
    document.getElementById('practiceLevel').innerText = `1 / ${practiceState.maxLevels}`; 
    document.getElementById('practiceStatus').innerText = "¡Listo!"; 
    document.getElementById('practiceStatus').style.color = "var(--primary)"; 
    document.getElementById('btnStartPracticeSequence').style.display = "inline-flex"; 
    
    const board = document.getElementById('practiceGridBoard'); 
    board.innerHTML = ''; 
    for (let i = 0; i < 9; i++) { 
        const cell = document.createElement('div'); 
        cell.className = 'grid-cell text-xl font-bold select-none'; 
        cell.dataset.index = i; 
        cell.innerText = i + 1; 
        cell.onclick = () => handlePracticeCellClick(i, cell); 
        board.appendChild(cell); 
    } 
    const modal = document.getElementById('gamePracticeModal'); 
    modal.style.display = 'flex'; 
    modal.classList.remove('hidden'); 
}

export function closePracticeGame() { 
    const modal = document.getElementById('gamePracticeModal'); 
    modal.style.display = 'none'; 
    modal.classList.add('hidden'); 
}

export function startPracticeSequence() { 
    document.getElementById('btnStartPracticeSequence').style.display = "none"; 
    document.getElementById('practiceStatus').innerText = "Observa..."; 
    document.getElementById('practiceStatus').style.color = "var(--accent)"; 
    practiceState.userSequence = []; 
    practiceState.canClick = false; 
    practiceState.sequence = []; 
    
    const totalPasos = practiceState.level + 2; 
    for (let i = 0; i < totalPasos; i++) { 
        practiceState.sequence.push(Math.floor(Math.random() * 9)); 
    } 
    
    let index = 0; 
    const interval = setInterval(() => { 
        const cells = document.querySelectorAll('#practiceGridBoard .grid-cell'); 
        const targetCell = cells[practiceState.sequence[index]]; 
        targetCell.style.background = 'var(--purple)'; 
        targetCell.style.color = '#fff'; 
        targetCell.style.boxShadow = '0 0 15px var(--purple-glow)'; 
        
        setTimeout(() => { 
            targetCell.style.background = ''; 
            targetCell.style.color = ''; 
            targetCell.style.boxShadow = ''; 
        }, 600); 
        index++; 
        if (index >= practiceState.sequence.length) { 
            clearInterval(interval); 
            setTimeout(() => { 
                practiceState.canClick = true; 
                document.getElementById('practiceStatus').innerText = "¡Tu turno!"; 
                document.getElementById('practiceStatus').style.color = "var(--success)"; 
            }, 700); 
        } 
    }, 1000); 
}

function handlePracticeCellClick(clickedIndex, cellElement) { 
    if (!practiceState.canClick) return; 
    practiceState.userSequence.push(clickedIndex); 
    const currentCheckIdx = practiceState.userSequence.length - 1; 
    
    if (practiceState.userSequence[currentCheckIdx] !== practiceState.sequence[currentCheckIdx]) { 
        practiceState.canClick = false; 
        cellElement.classList.add('wrong'); 
        document.getElementById('practiceStatus').innerText = "Incorrecto"; 
        document.getElementById('practiceStatus').style.color = "var(--error)"; 
        setTimeout(() => { 
            cellElement.classList.remove('wrong'); 
            showToast("El patrón no coincide. ¡Inténtalo de nuevo!"); 
            document.getElementById('btnStartPracticeSequence').style.display = "inline-flex"; 
            document.getElementById('btnStartPracticeSequence').innerHTML = `<i class="fa-solid fa-rotate-left"></i> Repetir Nivel`; 
        }, 600); 
        return; 
    } 
    
    cellElement.style.background = 'var(--primary-glow)'; 
    setTimeout(() => { cellElement.style.background = ''; }, 200); 
    
    if (practiceState.userSequence.length === practiceState.sequence.length) { 
        practiceState.canClick = false; 
        if (practiceState.level < practiceState.maxLevels) { 
            document.getElementById('practiceStatus').innerText = "¡Nivel Superado!"; 
            document.getElementById('practiceStatus').style.color = "var(--success)"; 
            setTimeout(() => { 
                practiceState.level++; 
                document.getElementById('practiceLevel').innerText = `${practiceState.level} / ${practiceState.maxLevels}`; 
                document.getElementById('btnStartPracticeSequence').style.display = "inline-flex"; 
                document.getElementById('btnStartPracticeSequence').innerHTML = `<i class="fa-solid fa-arrow-right"></i> Ir al Nivel ${practiceState.level}`; 
            }, 1000); 
        } else { 
            document.getElementById('practiceStatus').innerText = "💥 ¡COMPLETADO! 💥"; 
            document.getElementById('practiceStatus').style.color = "var(--accent)"; 
            setTimeout(() => { 
                alert("¡Excelente trabajo! Has entrenado tu atención sostenida de forma exitosa hoy."); 
                closePracticeGame(); 
            }, 1200); 
        } 
    } 
}
