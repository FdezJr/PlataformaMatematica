/**
 * Bootstrapper y Vinculación Global
 */
import { initRouter, openInstructionModal, closeInstructionModal, switchEstTab, switchTab } from './modules/ui.js';
import { setupAuthListeners, verificarUsuarioExistente, cargarPerfilExistenteLocal, verifyAdminPassword, logoutAdmin } from './modules/auth.js';
import { 
    startMemory1Display, verifyMemory1, 
    startMemory2, submitMathMem2, submitRecallMem2, 
    startAttention, verifyAttention, 
    startInhibition, verifyInhibition, 
    startInhibitionB, submitInhibitionB, 
    startFlexibility, submitFlex, 
    openPracticeGame, closePracticeGame, startPracticeSequence 
} from './modules/tamizaje.js';
import { renderProfileChart, resetTamizajeParaReevaluacion } from './modules/resultados.js';

// Exponer funciones necesarias al scope global (window) para los eventos inline del HTML
Object.assign(window, {
    openInstructionModal,
    closeInstructionModal,
    switchEstTab,
    switchTab,
    cargarPerfilExistenteLocal,
    verifyAdminPassword,
    logoutAdmin,
    startMemory1Display,
    verifyMemory1,
    startMemory2,
    submitMathMem2,
    submitRecallMem2,
    startAttention,
    verifyAttention,
    startInhibition,
    verifyInhibition,
    startInhibitionB,
    submitInhibitionB,
    startFlexibility,
    submitFlex,
    openPracticeGame,
    closePracticeGame,
    startPracticeSequence,
    renderProfileChart,
    resetTamizajeParaReevaluacion
});

// Inicialización de la aplicación
document.addEventListener('DOMContentLoaded', () => {
    initRouter();
    setupAuthListeners();
    setTimeout(verificarUsuarioExistente, 500);
});
