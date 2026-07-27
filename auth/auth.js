/**
 * auth/auth.js
 * Autenticación de administradores y registro / verificación de estudiantes
 */

import { state, ADMIN_PASSWORD } from '../core/state.js';
import { showScreen } from '../ui/ui.js';
import { loadAdminData, cargarPerfilExistenteLocal } from './resultados.js';

/**
 * Configura los listeners de eventos para el registro e inicio de sesión de admin
 */
export function setupAuthListeners() {
    // Exponer funciones en window para que estén disponibles ante eventos HTML
    window.cargarPerfilExistenteLocal = cargarPerfilExistenteLocal;
    window.verifyAdminPassword = verifyAdminPassword;
    window.logoutAdmin = logoutAdmin;

    // Listener del Formulario de Registro de Estudiante
    const regForm = document.getElementById('registerForm');
    if (regForm) {
        regForm.addEventListener('submit', function(e) {
            e.preventDefault();
            let valid = true;

            const nameElem = document.getElementById('inputName');
            const ageElem = document.getElementById('inputAge');
            const courseElem = document.getElementById('inputCourse');

            if (!nameElem || !ageElem || !courseElem) return;

            const name = nameElem.value.trim();
            const age = parseInt(ageElem.value);
            const course = courseElem.value.trim();

            const toggleError = (isError, errorId, inputId) => {
                const err = document.getElementById(errorId);
                const inp = document.getElementById(inputId);
                if (isError) {
                    if (err) err.classList.add('visible');
                    if (inp) inp.classList.add('input-error');
                    valid = false;
                } else {
                    if (err) err.classList.remove('visible');
                    if (inp) inp.classList.remove('input-error');
                }
            };

            // Validaciones de campos
            toggleError(!name, 'errorName', 'inputName');
            toggleError(!age || age < 3 || age > 99, 'errorAge', 'inputAge');
            toggleError(!course, 'errorCourse', 'inputCourse');

            if (!valid) return;

            // Guardar en el estado global y en la memoria local del navegador
            state.user = { nombre: name, edad: age, curso: course };
            localStorage.setItem('math_therapy_user', JSON.stringify(state.user));

            // Transición a la primera pantalla de instrucciones de las pruebas
            showScreen('screenInstrMemory1');
        });
    }

    // Listener para presionar "Enter" en el campo de contraseña de Admin
    const adminInput = document.getElementById('adminPasswordInput');
    if (adminInput) {
        adminInput.addEventListener('keydown', e => {
            if (e.key === 'Enter') verifyAdminPassword();
        });
    }
}

/**
 * Verifica si existe un perfil guardado previamente en este navegador
 */
export function verificarUsuarioExistente() {
    const localUser = localStorage.getItem('math_therapy_user');
    if (localUser) {
        try {
            const user = JSON.parse(localUser);
            state.user = user;

            const nameElem = document.getElementById('returningUserName');
            const courseElem = document.getElementById('returningUserCourse');
            const blockElem = document.getElementById('returningUserBlock');
            const subtitleElem = document.getElementById('registerSubtitle');

            if (nameElem) nameElem.innerText = user.nombre;
            if (courseElem) courseElem.innerText = user.curso;
            if (blockElem) blockElem.style.display = 'block';
            if (subtitleElem) subtitleElem.innerText = "O registra un nuevo perfil a continuación:";
        } catch (e) {
            console.error("Error al parsear el usuario almacenado:", e);
        }
    }
}

/**
 * Valida la contraseña e ingresa al panel docente
 */
export function verifyAdminPassword() {
    const input = document.getElementById('adminPasswordInput');
    if (input && input.value === ADMIN_PASSWORD) {
        const loginElem = document.getElementById('adminLogin');
        const dashElem = document.getElementById('adminDashboard');
        
        if (loginElem) loginElem.style.display = 'none';
        if (dashElem) dashElem.style.display = 'block';
        
        loadAdminData();
    } else {
        const err = document.getElementById('errorPassword');
        if (err) {
            err.classList.add('visible');
            setTimeout(() => err.classList.remove('visible'), 2000);
        }
    }
}

/**
 * Cierra la sesión del administrador
 */
export function logoutAdmin() {
    const loginElem = document.getElementById('adminLogin');
    const dashElem = document.getElementById('adminDashboard');
    
    if (dashElem) dashElem.style.display = 'none';
    if (loginElem) loginElem.style.display = 'flex';
    
    const input = document.getElementById('adminPasswordInput');
    if (input) input.value = '';
}
