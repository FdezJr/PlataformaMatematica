/**
 * Control de Navegación, Modales y Pestañas UI
 */
import { appControl, state } from '../core/state.js';
import { textosInstrucciones } from '../utils/helpers.js';

export function initRouter() { 
    const urlParams = new URLSearchParams(window.location.search); 
    if (urlParams.has('admin')) { 
        document.getElementById('userApp').style.display = 'none'; 
        document.getElementById('adminApp').classList.add('active'); 
    } else { 
        document.getElementById('userApp').style.display = 'block'; 
        document.getElementById('adminApp').style.display = 'none'; 
    } 
}

export function showScreen(id) { 
    document.querySelectorAll('#userApp .screen').forEach(s => s.classList.remove('active')); 
    document.getElementById(id).classList.add('active'); 
}

export function openInstructionModal(challengeKey) { 
    appControl.isPaused = true; 
    appControl.pauseStartTime = Date.now(); 
    appControl.currentChallengeContext = challengeKey; 
    const info = textosInstrucciones[challengeKey]; 
    document.getElementById('modalInstructionTitle').innerText = info.title; 
    document.getElementById('modalInstructionBody').innerHTML = info.body; 
    const modal = document.getElementById('instructionModal'); 
    modal.style.display = 'flex'; 
    modal.classList.remove('hidden'); 
}

export function closeInstructionModal() { 
    const modal = document.getElementById('instructionModal'); 
    modal.style.display = 'none'; 
    modal.classList.add('hidden'); 
    const d = Date.now() - appControl.pauseStartTime; 
    
    if (appControl.currentChallengeContext === 'mem2' && state.mem2.interval) { 
        state.mem2.startTime += d; 
    } else if (appControl.currentChallengeContext === 'att') { 
        state.att.startTime += d; 
    } else if (appControl.currentChallengeContext === 'inh') { 
        state.inh.startTime += d; 
    } else if (appControl.currentChallengeContext === 'inhB') { 
        state.inhB.startTime += d; 
    } else if (appControl.currentChallengeContext === 'flex') { 
        state.flex.startTime += d; 
    } 
    appControl.isPaused = false; 
}

export function switchEstTab(panelId, event) { 
    document.querySelectorAll('.est-panel').forEach(p => p.style.display = 'none'); 
    document.getElementById(panelId).style.display = 'block'; 
    const container = document.getElementById('btnTabPerfilEst').parentElement; 
    container.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active')); 
    if (event && event.target) {
        event.target.classList.add('active'); 
    }
}

export function switchTab(tabId, btn) { 
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active')); 
    btn.classList.add('active'); 
    ['tabMem', 'tabAtt', 'tabInh', 'tabFlex', 'tabChart'].forEach(id => document.getElementById(id).style.display = 'none'); 
    document.getElementById(tabId).style.display = 'block'; 
}
