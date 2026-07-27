/**
 * core/state.js
 * Estado global de la aplicación, constantes y reinicio de métricas
 */

// Contraseña por defecto para ingresar al panel docente/administrador
export const ADMIN_PASSWORD = "admin"; 

// Objeto de estado reactivo global
export const state = {
    // Datos del usuario actual { nombre, edad, curso }
    user: null, 

    // Pruebas de Memoria de Trabajo
    mem1: {
        sequence: [],
        userSequence: [],
        errors: []
    },
    mem2: {
        currentTrial: 0,
        results: [],
        totalMathCorrect: 0
    },

    // Prueba de Atención Sostenida
    att: {
        foundCount: 0,
        wrongClicks: 0,
        startTime: null,
        timer: null
    },

    // Pruebas de Control Inhibitorio
    inh: {
        aciertos: 0,
        falsasAlarmas: 0,
        omisiones: 0,
        rechazosCorrectos: 0
    },
    inhB: {
        aciertos: 0
    },
    intruso: {
        aciertos: 0 // Nueva actividad integrada
    },

    // Prueba de Flexibilidad Cognitiva
    flex: {
        current: 0,
        scoreR1: 0,
        scoreR2: 0
    }
};

// Objeto de control para renderizado de gráficos y panel de administración
export const appControl = {
    allAdminData: [],
    profileChartInstance: null
};

/**
 * Restablece todos los valores de las pruebas a cero para una reevaluación limpia
 */
export function resetState() {
    state.mem1 = { sequence: [], userSequence: [], errors: [] };
    state.mem2 = { currentTrial: 0, results: [], totalMathCorrect: 0 };
    state.att = { foundCount: 0, wrongClicks: 0, startTime: null, timer: null };
    state.inh = { aciertos: 0, falsasAlarmas: 0, omisiones: 0, rechazosCorrectos: 0 };
    state.inhB = { aciertos: 0 };
    state.intruso = { aciertos: 0 };
    state.flex = { current: 0, scoreR1: 0, scoreR2: 0 };
}
