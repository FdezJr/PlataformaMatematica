/**
 * Gestión de Perfiles de Usuario y Autenticación Admin
 */
import { state, ADMIN_PASSWORD } from '../core/state.js';
import { showScreen } from './ui.js';
import { loadAdminData } from './resultados.js';

export function setupAuthListeners() {
    // Exponer funciones necesarias para los onclick del HTML
    window.cargarPerfilExistenteLocal = cargarPerfilExistenteLocal;
    window.verifyAdminPassword = verifyAdminPassword;
    window.logoutAdmin = logoutAdmin;

    const regForm = document.getElementById('registerForm');
    if (regForm) {
        regForm.addEventListener('submit', function(e) { 
            e.preventDefault(); 
            let valid = true; 
            const name = document.getElementById('inputName').value.trim(); 
            const age = parseInt(document.getElementById('inputAge').value); 
            const course = document.getElementById('inputCourse').value.trim(); 
            
            const t = (c, i, i2) => { 
                if(c) { 
                    document.getElementById(i).classList.add('visible'); 
                    document.getElementById(i2).classList.add('input-error'); 
                    valid = false; 
                } else { 
                    document.getElementById(i).classList.remove('visible'); 
                    document.getElementById(i2).classList.remove('input-error'); 
                } 
            }; 
            
            t(!name, 'errorName', 'inputName'); 
            t(!age || age < 3 || age > 99, 'errorAge', 'inputAge'); 
            t(!course, 'errorCourse', 'inputCourse'); 
            
            if (!valid) return; 
            
            // Guardar usuario en el estado
            state.user = { nombre: name, edad: age, curso: course }; 
            
            // Guardar en localStorage para visitas futuras
            localStorage.setItem('math_therapy_user', JSON.stringify(state.user));

            showScreen('screenInstrMemory1'); 
        });
    }

    const adminInput = document.getElementById('adminPasswordInput');
    if (adminInput) {
        adminInput.addEventListener('keydown', e => { 
            if(e.key === 'Enter') verifyAdminPassword(); 
        });
    }
}

export function verificarUsuarioExistente() { 
    const localUser = localStorage.getItem('math_therapy_user'); 
    if (localUser) { 
        const user = JSON.parse(localUser); 
        state.user = user; 
        document.getElementById('returningUserName').innerText = user.nombre; 
        document.getElementById('returningUserCourse').innerText = user.curso; 
        document.getElementById('returningUserBlock').style.display = 'block'; 
        document.getElementById('registerSubtitle').innerText = "O registra un nuevo perfil a continuación:"; 
    } 
}

export function verifyAdminPassword() { 
    const input = document.getElementById('adminPasswordInput');
    if (input && input.value === ADMIN_PASSWORD) { 
        document.getElementById('adminLogin').style.display = 'none'; 
        document.getElementById('adminDashboard').style.display = 'block'; 
        loadAdminData(); // Carga todas las tablas (incluyendo Intruso) desde resultados.js
    } else { 
        const err = document.getElementById('errorPassword');
        if (err) {
            err.classList.add('visible'); 
            setTimeout(() => err.classList.remove('visible'), 2000); 
        }
    } 
}

export function logoutAdmin() { 
    document.getElementById('adminDashboard').style.display = 'none'; 
    document.getElementById('adminLogin').style.display = 'flex'; 
    const input = document.getElementById('adminPasswordInput');
    if (input) input.value = ''; 
}

export function cargarPerfilExistenteLocal() {
    const localUser = localStorage.getItem('math_therapy_user'); 
    if (localUser) {
        state.user = JSON.parse(localUser);
        showScreen('screenFinal'); // Muestra la pantalla del perfil del estudiante
    }
}
