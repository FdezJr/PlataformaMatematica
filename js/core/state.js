/**
 * Estado Global Reactivo del Sistema
 */
export const ADMIN_PASSWORD = 'admin2024';
export const CIRC = 2 * Math.PI * 42;

export const state = {
    user: { nombre: '', edad: '', curso: '' },
    mem1: { numbers: [], correctOrder: [], userOrder: [], startTime: 0, elapsed: 0, interval: null },
    mem2: { trials: [], currentTrial: 0, results: [], startTime: 0, interval: null },
    att: { targetNum: 0, totalTarget: 10, gridNumbers: [], foundCount: 0, wrongClicks: 0, startTime: 0, elapsed: 0 },
    inh: { operations: [], startTime: 0, elapsed: 0 },
    inhB: { trials: [], current: 0, aciertos: 0, startTime: 0, elapsed: 0 },
    flex: { trials: [], current: 0, scoreR1: 0, scoreR2: 0, startTime: 0, elapsed: 0 }
};

export const practiceState = { 
    sequence: [], 
    userSequence: [], 
    level: 1, 
    maxLevels: 3, 
    canClick: false 
};

export const appControl = {
    allAdminData: [],
    profileChartInstance: null,
    isPaused: false,
    pauseStartTime: 0,
    currentChallengeContext: ''
};
