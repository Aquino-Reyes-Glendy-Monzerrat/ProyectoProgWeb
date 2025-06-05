// iniciarsesion.js - Sistema con Base de Datos JSON

// Clase para manejar la base de datos de usuarios
class UserDatabase {
    constructor() {
        this.dbKey = 'restaurante_users_db';
    }

    getAllUsers() {
        return JSON.parse(localStorage.getItem(this.dbKey) || '[]');
    }

    findUserByEmail(email) {
        const users = this.getAllUsers();
        return users.find(user => user.email.toLowerCase() === email.toLowerCase());
    }

    validateCredentials(email, password) {
        const user = this.findUserByEmail(email);
        return user && user.password === password ? user : null;
    }

    updateLastLogin(userId) {
        const users = this.getAllUsers();
        const userIndex = users.findIndex(user => user.id === userId);
        if (userIndex !== -1) {
            users[userIndex].ultimoAcceso = new Date().toISOString();
            localStorage.setItem(this.dbKey, JSON.stringify(users));
        }
    }
}

// Variables globales
const userDB = new UserDatabase();
const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const rememberCheckbox = document.getElementById('remember');
const forgotPasswordLink = document.getElementById('forgotPasswordLink');
const forgotPasswordModal = document.getElementById('forgotPasswordModal');
const closeModal = document.getElementById('closeModal');
const forgotPasswordForm = document.getElementById('forgotPasswordForm');

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Verificar si hay sesión guardada
    checkSavedSession();
    
    // Validación en tiempo real
    emailInput.addEventListener('input', validateEmail);
    passwordInput.addEventListener('input', validatePassword);
    
    // Envío del formulario
    loginForm.addEventListener('submit', handleLogin);
    
    // Modal de recuperar contraseña
    forgotPasswordLink.addEventListener('click', openForgotPasswordModal);
    closeModal.addEventListener('click', closeForgotPasswordModal);
    forgotPasswordModal.addEventListener('click', function(e) {
        if (e.target === forgotPasswordModal) {
            closeForgotPasswordModal();
        }
    });
    
    // Formulario de recuperación
    forgotPasswordForm.addEventListener('submit', handlePasswordRecovery);
});

// Validación de email
function validateEmail() {
    const email = emailInput.value.trim();
    const emailError = document.getElementById('emailError');
    
    if (email === '') {
        setInputState(emailInput, 'normal');
        hideError(emailError);
        return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(email)) {
        setInputState(emailInput, 'invalid');
        showError(emailError, 'Por favor ingresa un email válido');
        return false;
    }
    
    setInputState(emailInput, 'valid');
    hideError(emailError);
    return true;
}

// Validación de contraseña
function validatePassword() {
    const password = passwordInput.value;
    const passwordError = document.getElementById('passwordError');
    
    if (password === '') {
        setInputState(passwordInput, 'normal');
        hideError(passwordError);
        return false;
    }
    
    if (password.length < 6) {
        setInputState(passwordInput, 'invalid');
        showError(passwordError, 'La contraseña debe tener al menos 6 caracteres');
        return false;
    }
    
    setInputState(passwordInput, 'valid');
    hideError(passwordError);
    return true;
}

// Establecer estado visual del input
function setInputState(input, state) {
    input.classList.remove('valid', 'invalid');
    if (state !== 'normal') {
        input.classList.add(state);
    }
}

// Mostrar error
function showError(errorElement, message) {
    errorElement.textContent = message;
    errorElement.classList.add('show');
}

// Ocultar error
function hideError(errorElement) {
    errorElement.classList.remove('show');
}

// Manejar inicio de sesión
function handleLogin(e) {
    e.preventDefault();
    
    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value;
    
    // Validar campos
    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();
    
    if (!isEmailValid || !isPasswordValid) {
        showAlert('Por favor corrige los errores en el formulario', 'error');
        return;
    }
    
    // Deshabilitar botón mientras se procesa
    const loginBtn = document.querySelector('.btn-login');
    loginBtn.disabled = true;
    loginBtn.textContent = 'Iniciando sesión...';
    
    // Simular tiempo de procesamiento
    setTimeout(() => {
        // Verificar credenciales con la base de datos
        const user = userDB.validateCredentials(email, password);
        
        if (user) {
            // Login exitoso
            showAlert('¡Inicio de sesión exitoso! Bienvenido/a ' + user.nombre, 'success');
            
            // Actualizar último acceso
            userDB.updateLastLogin(user.id);
            
            // Crear datos de sesión
            const userSession = {
                id: user.id,
                email: user.email,
                nombre: user.nombre,
                telefono: user.telefono,
                fechaNacimiento: user.fechaNacimiento,
                fechaRegistro: user.fechaRegistro,
                role: user.role || 'user',
                loginTime: new Date().toISOString()
            };
            
            // Guardar sesión según la opción de recordar
            if (rememberCheckbox.checked) {
                localStorage.setItem('userSession', JSON.stringify(userSession));
            } else {
                sessionStorage.setItem('userSession', JSON.stringify(userSession));
            }
            
            // Redireccionar después de 2 segundos
            setTimeout(() => {
                if (user.role === 'admin') {
                    window.location.href = 'perfilusuario.html';
                } else {
                    window.location.href = 'index.html';
                }
            }, 2000);
            
        } else {
            // Credenciales incorrectas
            showAlert('Email o contraseña incorrectos', 'error');
            setInputState(emailInput, 'invalid');
            setInputState(passwordInput, 'invalid');
            
            // Rehabilitar botón
            loginBtn.disabled = false;
            loginBtn.textContent = 'Iniciar Sesión';
        }
    }, 1000);
}

// Verificar sesión guardada
function checkSavedSession() {
    const savedSession = localStorage.getItem('userSession') || sessionStorage.getItem('userSession');
    
    if (savedSession) {
        const session = JSON.parse(savedSession);
        // Si ya hay una sesión activa, preguntar si quiere continuar
        if (confirm(`¡Hola ${session.nombre}! ¿Quieres continuar con tu sesión actual?`)) {
            window.location.href = 'index.html';
        } else {
            // Limpiar sesión
            localStorage.removeItem('userSession');
            sessionStorage.removeItem('userSession');
        }
    }
}

// Abrir modal de recuperar contraseña
function openForgotPasswordModal(e) {
    e.preventDefault();
    forgotPasswordModal.style.display = 'block';
}

// Cerrar modal de recuperar contraseña
function closeForgotPasswordModal() {
    forgotPasswordModal.style.display = 'none';
    document.getElementById('recoveryEmail').value = '';
}

// Manejar recuperación de contraseña
function handlePasswordRecovery(e) {
    e.preventDefault();
    
    const recoveryEmail = document.getElementById('recoveryEmail').value.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(recoveryEmail)) {
        showAlert('Por favor ingresa un email válido', 'error');
        return;
    }
    
    // Verificar si el email existe en la base de datos
    const user = userDB.findUserByEmail(recoveryEmail);
    
    if (user) {
        showAlert('Se han enviado las instrucciones de recuperación a tu email', 'success');
        closeForgotPasswordModal();
        
        // En un sistema real, aquí se enviaría un email
        console.log(`Email de recuperación enviado a: ${recoveryEmail}`);
        console.log(`Contraseña temporal: ${user.password} (solo para desarrollo)`);
    } else {
        showAlert('No se encontró una cuenta con ese email', 'error');
    }
}

// Mostrar alertas
function showAlert(message, type) {
    // Remover alerta existente si la hay
    const existingAlert = document.querySelector('.alert');
    if (existingAlert) {
        existingAlert.remove();
    }
    
    const alert = document.createElement('div');
    alert.className = `alert ${type}`;
    alert.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: bold;
        z-index: 1000;
        max-width: 400px;
        word-wrap: break-word;
        animation: slideIn 0.3s ease-out;
    `;
    
    if (type === 'success') {
        alert.style.backgroundColor = '#4CAF50';
    } else if (type === 'error') {
        alert.style.backgroundColor = '#f44336';
    }
    
    alert.textContent = message;
    document.body.appendChild(alert);
    
    // Añadir animación CSS si no existe
    if (!document.querySelector('#alertStyles')) {
        const style = document.createElement('style');
        style.id = 'alertStyles';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Remover alerta después de 4 segundos
    setTimeout(() => {
        if (alert.parentNode) {
            alert.remove();
        }
    }, 4000);
}

// Función auxiliar para obtener la sesión actual (para usar en otras páginas)
function getCurrentSession() {
    const session = localStorage.getItem('userSession') || sessionStorage.getItem('userSession');
    return session ? JSON.parse(session) : null;
}

// Función para cerrar sesión (para usar en otras páginas)
function logout() {
    localStorage.removeItem('userSession');
    sessionStorage.removeItem('userSession');
    window.location.href = 'iniciarsesion.html';
}

// Exportar funciones para uso global
window.getCurrentSession = getCurrentSession;
window.logout = logout;