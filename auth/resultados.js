/**
 * auth/resultados.js
 * Cálculo del Perfil Cognitivo, renderizado de Radar Chart,
 * generación del Plan de Intervención y Panel Docente.
 */

import { db } from '../firebase.js';
import { state, appControl } from '../core/state.js';
import { showScreen } from '../ui/ui.js';
import { showToast, formatDate } from '../utils/helpers.js';

/* ==========================================================================
   1. CÁLCULO DE PERFIL Y CONSOLIDACIÓN EN FIRESTORE
   ========================================================================== */
export function finalizarTamizajeYGuardar(raw) {
    showToast("Procesando perfil cognitivo...");

    // Estandarización a escala 0 - 100

    // 1. Memoria de Trabajo (Memoria 1 max: 5, Memoria 2 max: 5 -> Total 10)
    const memTotal = (raw.mem1_aciertos || 0) + (raw.mem2_aciertos || 0);
    const scoreMemoria = Math.min(100, Math.round((memTotal / 10) * 100));

    // 2. Atención Sostenida (Objetivo: 10)
    const scoreAtencion = Math.min(100, Math.round(((raw.att_aciertos || 0) / 10) * 100));

    // 3. Control Inhibitorio (Inh1: 10, InhB: 8, Intruso: 8 -> Total 26)
    const inhTotal = (raw.inh_aciertos || 0) + (raw.inhB_aciertos || 0) + (raw.intruso_aciertos || 0);
    const scoreInhibicion = Math.min(100, Math.round((inhTotal / 26) * 100));

    // 4. Flexibilidad Cognitiva (R1: 5, R2: 5 -> Total 10)
    const flexTotal = (raw.flex_r1 || 0) + (raw.flex_r2 || 0);
    const scoreFlexibilidad = Math.min(100, Math.round((flexTotal / 10) * 100));

    const perfilCognitivo = {
        memoria_trabajo: scoreMemoria,
        atencion_sostenida: scoreAtencion,
        control_inhibitorio: scoreInhibicion,
        flexibilidad_cognitiva: scoreFlexibilidad
    };

    const payload = {
        estudiante: {
            nombre: state.user.nombre,
            edad: state.user.edad,
            curso: state.user.curso
        },
        perfil_cognitivo: perfilCognitivo,
        metricas_crudas: raw,
        fecha: new Date().toISOString()
    };

    // Guardar informe completo en Firestore
    db.collection("usuarios_intervencion").add(payload)
      .then(() => {
          showScreen('screenFinal');
          renderProfileChart(perfilCognitivo);
          generateInterventionPlan(perfilCognitivo);
      })
      .catch((err) => {
          console.error("Error al guardar informe final:", err);
          showToast("Error al conectar con el servidor. Mostrando resultados locales.");
          showScreen('screenFinal');
          renderProfileChart(perfilCognitivo);
          generateInterventionPlan(perfilCognitivo);
      });
}

/* ==========================================================================
   2. GRÁFICO TIPO RADAR (Chart.js)
   ========================================================================== */
function renderProfileChart(scores) {
    setTimeout(() => {
        const chartCanvas = document.getElementById('studentProfileChart');
        if (!chartCanvas) return;

        // Destruir instancia previa si existe
        if (appControl.profileChartInstance) {
            appControl.profileChartInstance.destroy();
        }

        const ctx = chartCanvas.getContext('2d');
        appControl.profileChartInstance = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: [
                    'Memoria de Trabajo',
                    'Atención Sostenida',
                    'Control Inhibitorio',
                    'Flexibilidad Cognitiva'
                ],
                datasets: [{
                    label: 'Puntuación %',
                    data: [
                        scores.memoria_trabajo,
                        scores.atencion_sostenida,
                        scores.control_inhibitorio,
                        scores.flexibilidad_cognitiva
                    ],
                    backgroundColor: 'rgba(20, 184, 166, 0.25)',
                    borderColor: '#14b8a6',
                    pointBackgroundColor: '#14b8a6',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: '#14b8a6'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        min: 0,
                        max: 100,
                        ticks: { display: false, stepSize: 20 },
                        grid: { color: 'rgba(255,255,255,0.1)' },
                        angleLines: { color: 'rgba(255,255,255,0.15)' },
                        pointLabels: {
                            color: '#94a3b8',
                            font: { family: 'Space Grotesk', size: 12, weight: '600' }
                        }
                    }
                },
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }, 200);
}

/* ==========================================================================
   3. GENERACIÓN DINÁMICA DEL PLAN DE INTERVENCIÓN
   ========================================================================== */
function generateInterventionPlan(scores) {
    const container = document.getElementById('interventionPlanContainer');
    if (!container) return;

    container.innerHTML = '';
    const estrategias = [];

    if (scores.memoria_trabajo < 70) {
        estrategias.push({
            titulo: "Reforzamiento de Memoria de Trabajo",
            icono: "🧠",
            recomendacion: "Descomponer problemas matemáticos multipaso en listas de cotejo visuales. Permitir el uso de borradores intermedios o tablas de apoyo."
        });
    }

    if (scores.atencion_sostenida < 70) {
        estrategias.push({
            titulo: "Atención y Enfoque Sostenido",
            icono: "🎯",
            recomendacion: "Implementar la técnica Pomodoro adaptada (15 min de trabajo enfocado por 3 de descanso). Reducir distractores visuales en las guías de estudio."
        });
    }

    if (scores.control_inhibitorio < 70) {
        estrategias.push({
            titulo: "Control de Impulsividad e Inhibición",
            icono: "🛡️",
            recomendacion: "Fomentar la pausa metacognitiva ('Parar, Leer, Planificar') antes de responder. Usar la técnica del Intruso para aprender a descartar datos irrelevantes en enunciados matemáticos."
        });
    }

    if (scores.flexibilidad_cognitiva < 70) {
        estrategias.push({
            titulo: "Flexibilidad Metodológica",
            icono: "🔄",
            recomendacion: "Presentar ejercicios que puedan resolverse por más de un camino (ej. gráfico vs. numérico) para evitar el bloqueo ante cambios de procedimiento."
        });
    }

    if (estrategias.length === 0) {
        container.innerHTML = `
            <div class="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm">
                🌟 <strong>¡Perfil Desempeñado con Excelencia!</strong> El estudiante muestra un sólido equilibrio en sus funciones ejecutivas. Se recomienda continuar con desafíos matemáticos de enriquecimiento.
            </div>
        `;
        return;
    }

    estrategias.forEach(est => {
        const card = document.createElement('div');
        card.className = "p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] mb-3 flex items-start gap-3";
        card.innerHTML = `
            <span class="text-2xl">${est.icono}</span>
            <div>
                <h4 class="font-bold text-white text-sm mb-1">${est.titulo}</h4>
                <p class="text-xs text-[var(--text-muted)] leading-relaxed">${est.recomendacion}</p>
            </div>
        `;
        container.appendChild(card);
    });
}

/* ==========================================================================
   4. RECUPERACIÓN DE PERFIL EXISTENTE (Para usuarios recurrentes)
   ========================================================================== */
export function cargarPerfilExistenteLocal() {
    if (!state.user || !state.user.nombre) {
        const localUser = localStorage.getItem('math_therapy_user');
        if (localUser) {
            state.user = JSON.parse(localUser);
        } else {
            showToast("No se encontró un perfil guardado en este dispositivo.");
            return;
        }
    }

    showToast("Recuperando tu plan de intervención...");

    db.collection("usuarios_intervencion")
      .where("estudiante.nombre", "==", state.user.nombre)
      .where("estudiante.curso", "==", state.user.curso)
      .get()
      .then((querySnapshot) => {
          if (!querySnapshot.empty) {
              let documentos = [];
              querySnapshot.forEach(doc => documentos.push(doc.data()));
              
              // Ordenar por fecha descendente
              documentos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
              
              const scores = documentos[0].perfil_cognitivo;
              showScreen('screenFinal');
              renderProfileChart(scores);
              generateInterventionPlan(scores);
          } else {
              showToast("No se encontraron registros previos en la nube.");
          }
      })
      .catch((err) => {
          console.error("Error al consultar el perfil:", err);
          showToast("Error al conectar con la base de datos.");
      });
}

/* ==========================================================================
   5. PANEL DE ADMINISTRACIÓN DOCENTE
   ========================================================================== */
export function loadAdminData() {
    const tableBody = document.getElementById('adminTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = `<tr><td colspan="7" class="text-center p-4 text-xs text-[var(--text-muted)]">Cargando registros...</td></tr>`;

    db.collection("usuarios_intervencion")
      .get()
      .then((querySnapshot) => {
          appControl.allAdminData = [];
          querySnapshot.forEach(doc => {
              appControl.allAdminData.push({ id: doc.id, ...doc.data() });
          });

          // Ordenar por fecha más reciente
          appControl.allAdminData.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
          renderAdminTable(appControl.allAdminData);
      })
      .catch((err) => {
          console.error("Error al cargar panel docente:", err);
          tableBody.innerHTML = `<tr><td colspan="7" class="text-center p-4 text-xs text-rose-400">Error al obtener los datos.</td></tr>`;
      });
}

function renderAdminTable(data) {
    const tableBody = document.getElementById('adminTableBody');
    if (!tableBody) return;

    if (data.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="7" class="text-center p-4 text-xs text-[var(--text-muted)]">No hay informes registrados.</td></tr>`;
        return;
    }

    tableBody.innerHTML = '';
    data.forEach(item => {
        const est = item.estudiante || {};
        const p = item.perfil_cognitivo || {};
        const tr = document.createElement('tr');
        tr.className = "border-b border-[var(--border)] hover:bg-white/5 transition-colors text-xs";

        tr.innerHTML = `
            <td class="p-3 font-medium text-white">${est.nombre || '-'}</td>
            <td class="p-3 text-[var(--text-muted)]">${est.curso || '-'}</td>
            <td class="p-3 text-center ${p.memoria_trabajo < 70 ? 'text-amber-400 font-bold' : 'text-slate-300'}">${p.memoria_trabajo ?? '-'}%</td>
            <td class="p-3 text-center ${p.atencion_sostenida < 70 ? 'text-amber-400 font-bold' : 'text-slate-300'}">${p.atencion_sostenida ?? '-'}%</td>
            <td class="p-3 text-center ${p.control_inhibitorio < 70 ? 'text-amber-400 font-bold' : 'text-slate-300'}">${p.control_inhibitorio ?? '-'}%</td>
            <td class="p-3 text-center ${p.flexibilidad_cognitiva < 70 ? 'text-amber-400 font-bold' : 'text-slate-300'}">${p.flexibilidad_cognitiva ?? '-'}%</td>
            <td class="p-3 text-right text-[var(--text-muted)]">${formatDate(item.fecha)}</td>
        `;
        tableBody.appendChild(tr);
    });
}

// Funciones globales expuestas
window.cargarPerfilExistenteLocal = cargarPerfilExistenteLocal;
window.loadAdminData = loadAdminData;
