/**
 * Gestión de Perfiles de Usuario y Autenticación Admin
 */
import { state, ADMIN_PASSWORD } from '../core/state.js';
import { showScreen } from './ui.js';
import { loadAdminData } from './resultados.js';

export function setupAuthListeners() {
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
            state.user = { nombre: name, edad: age, curso: course }; 
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
    if (document.getElementById('adminPasswordInput').value === ADMIN_PASSWORD) { 
        document.getElementById('adminLogin').style.display = 'none'; 
        document.getElementById('adminDashboard').style.display = 'block'; 
        loadAdminData(); 
    } else { 
        document.getElementById('errorPassword').classList.add('visible'); 
        setTimeout(() => document.getElementById('errorPassword').classList.remove('visible'), 2000); 
    } 
}

export function logoutAdmin() { 
    document.getElementById('adminDashboard').style.display = 'none'; 
    document.getElementById('adminLogin').style.display = 'flex'; 
    document.getElementById('adminPasswordInput').value = ''; 
}
