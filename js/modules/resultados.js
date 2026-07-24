/**
 * Lógica de Persistencia de Perfiles, Gráficos y Tablas
 */
import { db } from '../config/firebase.js';
import { state, appControl } from '../core/state.js';
import { showScreen } from './ui.js';
import { showToast, formatDate } from '../utils/helpers.js';

export function cargarPerfilExistenteLocal() { 
    if (!state.user || !state.user.nombre) return; 
    showToast("Recuperando tu plan de intervención..."); 
    db.collection("usuarios_intervencion")
      .where("estudiante.nombre", "==", state.user.nombre)
      .where("estudiante.curso", "==", state.user.curso)
      .get()
      .then((querySnapshot) => { 
        if (!querySnapshot.empty) { 
            let documentos = []; 
            querySnapshot.forEach(doc => documentos.push(doc.data())); 
            documentos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)); 
            const scores = documentos[0].perfil_cognitivo; 
            showScreen('screenFinal'); 
            setTimeout(() => { 
                const chartStatus = Chart.getChart("studentProfileChart"); 
                if (chartStatus != undefined) chartStatus.destroy(); 
                const ctx = document.getElementById('studentProfileChart').getContext('2d'); 
                new Chart(ctx, { 
                    type: 'radar', 
                    data: { 
                        labels: ['Memoria de Trabajo', 'Atención Sostenida', 'Control Inhibitorio', 'Flexibilidad Cognitiva'], 
                        datasets: [{ 
                            data: [scores.memoria_trabajo, scores.atencion_sostenida, scores.control_inhibitorio, scores.flexibilidad_cognitiva], 
                            backgroundColor: 'rgba(20, 184, 166, 0.2)', 
                            borderColor: '#14b8a6', 
                            pointBackgroundColor: '#14b8a6' 
                        }] 
                    }, 
                    options: { 
                        scales: { 
                            r: { 
                                min: 0, max: 100, 
                                ticks: { display: false }, 
                                grid: { color: 'rgba(255,255,255,0.1)' }, 
                                pointLabels: { color: '#7b8baa', font: { family: 'Space Grotesk', size: 12 } } 
                            } 
                        }, 
                        plugins: { legend: { display: false } } 
                    } 
                }); 
                generateInterventionPlan(scores); 
            }, 300); 
        } else { 
            showToast("No se encontraron registros en la nube."); 
            document.getElementById('returningUserBlock').style.display = 'none'; 
        } 
    }).catch((err) => { 
        console.error(err); 
        showToast("Error al recuperar datos."); 
    }); 
}

export function finalizarTamizajeYGuardar(resultadosFinales) { 
    const scoreInh1 = (resultadosFinales.inh_aciertos / resultadosFinales.inh_totales) * 100; 
    const scoreInh2 = (resultadosFinales.inhB_aciertos / 8) * 100; 
    
    const scores = { 
        memoria_trabajo: Math.round(((resultadosFinales.mem1_aciertos + resultadosFinales.mem2_aciertos) / 10) * 100), 
        atencion_sostenida: Math.round((resultadosFinales.att_aciertos / 10) * 100), 
        control_inhibitorio: Math.round((scoreInh1 + scoreInh2) / 2), 
        flexibilidad_cognitiva: Math.round(((resultadosFinales.flex_r1 + resultadosFinales.flex_r2) / 8) * 100) 
    }; 
    
    for (let key in scores) { 
        if (scores[key] > 100) scores[key] = 100; 
        if (scores[key] < 0) scores[key] = 0; 
    } 
    
    db.collection("usuarios_intervencion").add({ 
        estudiante: state.user, 
        fecha: new Date().toISOString(), 
        perfil_cognitivo: scores, 
        metricas_crudas: resultadosFinales 
    }).then(() => { 
        localStorage.setItem('math_therapy_user', JSON.stringify(state.user)); 
        showToast("¡Plan de intervención activado!"); 
        const ctx = document.getElementById('studentProfileChart').getContext('2d'); 
        new Chart(ctx, { 
            type: 'radar', 
            data: { 
                labels: ['Memoria de Trabajo', 'Atención Sostenida', 'Control Inhibitorio', 'Flexibilidad Cognitiva'], 
                datasets: [{ 
                    data: [scores.memoria_trabajo, scores.atencion_sostenida, scores.control_inhibitorio, scores.flexibilidad_cognitiva], 
                    backgroundColor: 'rgba(20, 184, 166, 0.2)', 
                    borderColor: '#14b8a6', 
                    pointBackgroundColor: '#14b8a6' 
                }] 
            }, 
            options: { 
                scales: { 
                    r: { 
                        min: 0, max: 100, 
                        ticks: { display: false }, 
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }, 
                        pointLabels: { color: '#7b8baa', font: { family: 'Space Grotesk', size: 12 } } 
                    } 
                }, 
                plugins: { legend: { display: false } } 
            } 
        }); 
        generateInterventionPlan(scores); 
    }).catch((error) => { 
        console.error(error); 
        showToast("Error de conexión al generar el plan."); 
    }); 
}

export function generateInterventionPlan(scores) { 
    let lowScore = 100; 
    let weakFunction = ''; 
    for (const [key, value] of Object.entries(scores)) { 
        if (value < lowScore) { 
            lowScore = value; 
            weakFunction = key; 
        } 
    } 
    
    const bibliotecaEstatica = { 
        memoria_trabajo: [{ titulo: "Cadenas Operativas Inversas", desc: "Resuelve sumas encadenadas reteniendo resultados parciales en mente.", icon: "fa-link" }, { titulo: "Matrices Numéricas Ocultas", desc: "Ubica coordenadas matemáticas en una cuadrícula que desaparece.", icon: "fa-table" }], 
        atencion_sostenida: [{ titulo: "Rastreador de Secuencias Simétricas", desc: "Encuentra patrones geométricos continuos sin perder la concentración.", icon: "fa-bullseye" }, { titulo: "Filtro Numérico Veloz", desc: "Detecta múltiplos específicos en ráfagas de números de alta velocidad.", icon: "fa-bolt" }], 
        control_inhibitorio: [{ titulo: "Cruces de Signos Conflictivos", desc: "Resuelve operaciones donde los signos cambian de color y significado.", icon: "fa-ban" }, { titulo: "Desafío Mayor a Veinte", desc: "Cálculo aritmético rápido ignorando distractores menores automatizados.", icon: "fa-hand" }], 
        flexibilidad_cognitiva: [{ titulo: "Alternador Aritmético Súbito", desc: "Cambia entre sumas y restas inmediatamente según la señal visual cambiante.", icon: "fa-shuffle" }, { titulo: "Clasificador de Polígonos Dinámico", desc: "Ordena figuras geométricas bajo reglas de clasificación mutables.", icon: "fa-shapes" }] 
    }; 
    
    const guiasDidacticas = { 
        memoria_trabajo: { diag: "Se observa una sobrecarga en la memoria de trabajo que afecta la retención de datos intermedios al procesar retos aritméticos.", strat: "Uso prioritario de la aproximación Concreta-Pictórica-Abstracta. Permitir andamiaje visual (anotar pasos intermedios) antes de automatizar el cálculo mental." }, 
        atencion_sostenida: { diag: "Presenta fluctuaciones en la atención sostenida que causan omisiones involuntarias en tareas de conteo masivo o verificación visual.", strat: "Dosificar las sesiones matemáticas en bloques de 10 minutos. Usar marcadores visuales para el seguimiento de lectura de problemas." }, 
        control_inhibitorio: { diag: "Dificultad en el control inhibitorio, manifestando respuestas impulsivas ante estímulos o distractores numéricos familiares.", strat: "Modelado cognitivo basado en autoinstrucciones ('Paro, Pienso, Actúo'). Trabajar la verificación explícita antes de dar por buena una respuesta." }, 
        flexibilidad_cognitiva: { diag: "Se evidencia rigidez procedimental al transicionar entre reglas o instrucciones operacionales alternadas.", strat: "Plantear problemas con múltiples vías de solución. Cambiar intencionalmente los contextos del problema para evitar la mecanización estricta." } 
    }; 
    
    const guia = guiasDidacticas[weakFunction] || guiasDidacticas['control_inhibitorio']; 
    document.getElementById('planDiagnostic').innerText = guia.diag; 
    document.getElementById('planStrategy').innerText = guia.strat; 
    
    const actividadesGrid = document.getElementById('recommendedActivitiesGrid'); 
    actividadesGrid.innerHTML = ''; 
    const actividadesAsignadas = bibliotecaEstatica[weakFunction] || bibliotecaEstatica['control_inhibitorio']; 
    
    actividadesAsignadas.forEach(act => { 
        const esRastreador = act.titulo === "Rastreador de Secuencias Simétricas"; 
        const clickAction = esRastreador ? `openPracticeGame()` : `showToast('Esta actividad estará disponible en la próxima actualización.')`; 
        
        actividadesGrid.innerHTML += `
            <div class="p-4 rounded-xl bg-[var(--bg-card-alt)] border border-[var(--border)] hover:border-[var(--purple)] transition-all">
                <div class="flex items-center gap-3 mb-2">
                    <div class="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-[var(--purple)]">
                        <i class="fa-solid ${act.icon} text-lg"></i>
                    </div>
                    <h4 class="font-bold text-sm text-[var(--text)]">${act.titulo}</h4>
                </div>
                <p class="text-xs text-[var(--text-muted)] mb-3">${act.desc}</p>
                <button class="text-xs font-semibold text-[var(--primary)] hover:underline flex items-center gap-1" onclick="${clickAction}">
                    Iniciar práctica <i class="fa-solid fa-arrow-right text-[10px]"></i>
                </button>
            </div>`; 
    }); 
}

export function resetTamizajeParaReevaluacion() { 
    if(confirm("¿Quieres iniciar un nuevo tamizaje de reevaluación?")) { 
        state.mem2.currentTrial = 0; 
        state.mem2.results = []; 
        state.att.foundCount = 0; 
        state.att.wrongClicks = 0; 
        state.flex.current = 0; 
        state.flex.scoreR1 = 0; 
        state.flex.scoreR2 = 0; 
        showScreen('screenInstrMemory1'); 
    } 
}

// --- PANEL DE ADMINISTRACIÓN ---
export async function loadAdminData() { 
    const snapshot = await db.collection("resultados").orderBy("fecha", "desc").get(); 
    appControl.allAdminData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })); 
    
    const mem1 = appControl.allAdminData.filter(r => r.subcategoria === "Memoria de Trabajo - Ordenar"); 
    const mem2 = appControl.allAdminData.filter(r => r.subcategoria === "Memoria de Trabajo - Distractor"); 
    const att = appControl.allAdminData.filter(r => r.subcategoria === "Atención Sostenida"); 
    const inh = appControl.allAdminData.filter(r => r.subcategoria === "Control Inhibitorio"); 
    const inhB = appControl.allAdminData.filter(r => r.subcategoria === "Control Inhibitorio - Interferencia"); 
    const flex = appControl.allAdminData.filter(r => r.subcategoria === "Flexibilidad Cognitiva"); 

    document.getElementById('tableMemory1').innerHTML = mem1.map(r => { 
        const b = r.esCorrecto ? '<span class="badge badge-success">Correcto</span>' : '<span class="badge badge-error">Incorrecto</span>'; 
        const e = r.errores.length === 0 ? 'Ninguno' : r.errores.map(e => `Pos.${e.posicion}: ${e.elegido} (Era ${e.correcto})`).join('<br>'); 
        return `<tr><td class="font-mono text-xs whitespace-nowrap">${formatDate(r.fecha)}</td><td><strong>${r.nombre}</strong></td><td>${r.curso}</td><td>${b}</td><td class="text-xs">${e}</td></tr>`; 
    }).join('') || `<tr><td colspan="5" class="text-center py-6" style="color: var(--text-muted);">Sin datos</td></tr>`; 
    
    document.getElementById('tableMemory2').innerHTML = mem2.map(r => `<tr><td class="font-mono text-xs whitespace-nowrap">${formatDate(r.fecha)}</td><td><strong>${r.nombre}</strong></td><td>${r.curso}</td><td><span class="badge badge-success">${r.metricas.correctRecalls} / 5</span></td><td><span class="badge badge-warning">${r.metricas.correctMath} / 5</span></td></tr>`).join('') || `<tr><td colspan="5" class="text-center py-6" style="color: var(--text-muted);">Sin datos</td></tr>`; 
    document.getElementById('tableAttention').innerHTML = att.map(r => `<tr><td class="font-mono text-xs whitespace-nowrap">${formatDate(r.fecha)}</td><td><strong>${r.nombre}</strong></td><td>${r.curso}</td><td><span class="badge badge-success">${r.metricas.aciertos} / ${r.metricas.totalObjetivo}</span></td><td><span class="badge badge-error">${r.metricas.falsasAlarmas}</span></td><td><span class="badge badge-warning">${r.metricas.omisiones}</span></td></tr>`).join('') || `<tr><td colspan="6" class="text-center py-6" style="color: var(--text-muted);">Sin datos</td></tr>`; 
    document.getElementById('tableInhibition').innerHTML = inh.map(r => `<tr><td class="font-mono text-xs whitespace-nowrap">${formatDate(r.fecha)}</td><td><strong>${r.nombre}</strong></td><td>${r.curso}</td><td><span class="badge badge-success">${r.metricas.aciertos}</span></td><td><span class="badge badge-error">${r.metricas.falsasAlarmas}</span></td><td><span class="badge badge-warning">${r.metricas.omisiones}</span></td></tr>`).join('') || `<tr><td colspan="6" class="text-center py-6" style="color: var(--text-muted);">Sin datos</td></tr>`; 
    document.getElementById('tableInhibitionB').innerHTML = inhB.map(r => `<tr><td class="font-mono text-xs whitespace-nowrap">${formatDate(r.fecha)}</td><td><strong>${r.nombre}</strong></td><td>${r.curso}</td><td><span class="badge badge-purple">${r.metricas.aciertos} / ${r.metricas.totalObjetivo}</span></td></tr>`).join('') || `<tr><td colspan="4" class="text-center py-6" style="color: var(--text-muted);">Sin datos</td></tr>`; 
    document.getElementById('tableFlex').innerHTML = flex.map(r => `<tr><td class="font-mono text-xs whitespace-nowrap">${formatDate(r.fecha)}</td><td><strong>${r.nombre}</strong></td><td>${r.curso}</td><td><span class="badge badge-success">${r.metricas.aciertosR1} / 4</span></td><td><span class="badge badge-pink">${r.metricas.aciertosR2} / 4</span></td><td><span class="badge badge-purple">${r.metricas.totalAciertos} / 8</span></td></tr>`).join('') || `<tr><td colspan="6" class="text-center py-6" style="color: var(--text-muted);">Sin datos</td></tr>`; 

    const users = [...new Set(appControl.allAdminData.map(r => r.nombre))].filter(Boolean); 
    const select = document.getElementById('chartUserSelect'); 
    select.innerHTML = '<option value="">Selecciona un usuario...</option>'; 
    users.forEach(u => { 
        const o = document.createElement('option'); 
        o.value = u; 
        o.textContent = u; 
        select.appendChild(o); 
    }); 
}

export function renderProfileChart() { 
    const userName = document.getElementById('chartUserSelect').value; 
    if (!userName) { 
        if(appControl.profileChartInstance) appControl.profileChartInstance.destroy(); 
        return; 
    } 
    const userData = appControl.allAdminData.filter(r => r.nombre === userName); 
    let memScore = 0, attScore = 0, inhScore = 0, flexScore = 0; 
    
    const m1 = userData.find(r => r.subcategoria === "Memoria de Trabajo - Ordenar"); 
    const m2 = userData.find(r => r.subcategoria === "Memoria de Trabajo - Distractor"); 
    let m1Score = m1 ? ((5 - m1.errores.length) / 5) * 100 : null; 
    let m2Score = m2 ? (m2.metricas.correctRecalls / 5) * 100 : null; 
    if (m1Score !== null && m2Score !== null) memScore = (m1Score + m2Score) / 2; 
    else if (m1Score !== null) memScore = m1Score; 
    else if (m2Score !== null) memScore = m2Score; 
    
    const att = userData.find(r => r.subcategoria === "Atención Sostenida"); 
    if (att) { 
        let hitScore = (att.metricas.aciertos / att.metricas.totalObjetivo) * 50; 
        let totalDistractors = 64 - att.metricas.totalObjetivo; 
        let correctIgnores = Math.max(0, totalDistractors - att.metricas.falsasAlarmas); 
        let ignoreScore = totalDistractors > 0 ? (correctIgnores / totalDistractors) * 50 : 50; 
        attScore = hitScore + ignoreScore; 
    } 
    
    const inh1 = userData.find(r => r.subcategoria === "Control Inhibitorio"); 
    const inh2 = userData.find(r => r.subcategoria === "Control Inhibitorio - Interferencia"); 
    let inh1Score = 0; 
    if (inh1) { 
        let totalPos = inh1.metricas.aciertos + inh1.metricas.omisiones; 
        let totalNeg = inh1.metricas.falsasAlarmas + inh1.metricas.rechazosCorrectos; 
        let hitScore = totalPos > 0 ? (inh1.metricas.aciertos / totalPos) * 50 : 0; 
        let ignoreScore = totalNeg > 0 ? (inh1.metricas.rechazosCorrectos / totalNeg) * 50 : 50; 
        inh1Score = hitScore + ignoreScore; 
    } 
    let inh2Score = inh2 ? (inh2.metricas.aciertos / inh2.metricas.totalObjetivo) * 100 : inh1Score; 
    if (inh1 && inh2) inhScore = (inh1Score + inh2Score) / 2; 
    else if (inh1) inhScore = inh1Score; 
    else if (inh2) inhScore = inh2Score; 
    
    const flex = userData.find(r => r.subcategoria === "Flexibilidad Cognitiva"); 
    if (flex && flex.metricas) { 
        let total = flex.metricas.totalAciertos !== undefined ? flex.metricas.totalAciertos : ((flex.metricas.aciertosR1 || 0) + (flex.metricas.aciertosR2 || 0)); 
        flexScore = (total / 8) * 100; 
    } 
    
    const data = { 
        labels: ['Memoria de Trabajo', 'Atención Sostenida', 'Control Inhibitorio', 'Flexibilidad Cognitiva'], 
        datasets: [{ 
            label: 'Nivel (%)', 
            data: [memScore.toFixed(1), attScore.toFixed(1), inhScore.toFixed(1), flexScore.toFixed(1)], 
            fill: true, 
            backgroundColor: 'rgba(20, 184, 166, 0.2)', 
            borderColor: 'rgb(20, 184, 166)', 
            pointBackgroundColor: 'rgb(20, 184, 166)', 
            pointBorderColor: '#fff', 
            pointHoverBackgroundColor: '#fff', 
            pointHoverBorderColor: 'rgb(20, 184, 166)' 
        }] 
    }; 
    
    if (appControl.profileChartInstance) appControl.profileChartInstance.destroy(); 
    const ctx = document.getElementById('profileChart').getContext('2d'); 
    appControl.profileChartInstance = new Chart(ctx, { 
        type: 'radar', 
        data: data, 
        options: { 
            elements: { line: { borderWidth: 2 } }, 
            scales: { 
                r: { 
                    angleLines: { color: 'rgba(123,139,170,0.2)' }, 
                    grid: { color: 'rgba(123,139,170,0.2)' }, 
                    pointLabels: { color: '#e8edf5', font: { family: 'Space Grotesk', size: 12 } }, 
                    ticks: { backdropColor: 'transparent', color: '#7b8baa', stepSize: 25 }, 
                    suggestedMin: 0, 
                    suggestedMax: 100 
                } 
            } 
        } 
    }); 
}
                          
