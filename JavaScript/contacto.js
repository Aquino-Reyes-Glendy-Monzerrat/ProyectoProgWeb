// Variables globales
const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const rememberCheckbox = document.getElementById('remember');
const forgotPasswordLink = document.getElementById('forgotPasswordLink');
const forgotPasswordModal = document.getElementById('forgotPasswordModal');
const closeModal = document.getElementById('closeModal');
const forgotPasswordForm = document.getElementById('forgotPasswordForm');

// Usuarios de ejemplo (simulando base de datos)
const users = [
    {
        email: 'admin@restaurante.com',
        password: 'admin123',
        name: 'Administrador',
        role: 'admin'
    },
    {
        email: 'usuario@email.com',
        password: 'user123',
        name: 'Usuario Demo',
        role: 'user'
    }
];

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
    
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    
    // Validar campos
    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();
    
    if (!isEmailValid || !isPasswordValid) {
        showAlert('Por favor corrige los errores en el formulario', 'error');
        return;
    }
    
    // Simular verificación de credenciales
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        // Login exitoso
        showAlert('¡Inicio de sesión exitoso! Bienvenido ' + user.name, 'success');
        
        // Guardar sesión si se marcó "recordar"
        if (rememberCheckbox.checked) {
            localStorage.setItem('userSession', JSON.stringify({
                email: user.email,
                name: user.name,
                role: user.role,
                loginTime: new Date().toISOString()
            }));
        } else {
            sessionStorage.setItem('userSession', JSON.stringify({
                email: user.email,
                name: user.name,
                role: user.role,
                loginTime: new Date().toISOString()
            }));
        }
        
        // Redireccionar después de 2 segundos
        setTimeout(() => {
            if (user.role === 'admin') {
                window.location.href = 'perfilusuario.html'; // O página de admin
            } else {
                window.location.href = 'index.html';
            }
        }, 2000);
        
    } else {
        // Credenciales incorrectas
        showAlert('Email o contraseña incorrectos', 'error');
        setInputState(emailInput, 'invalid');
        setInputState(passwordInput, 'invalid');
    }
}

// Verificar sesión guardada
function checkSavedSession() {
    const savedSession = localStorage.getItem('userSession') || sessionStorage.getItem('userSession');
    
    if (savedSession) {
        const session = JSON.parse(savedSession);
        // Si ya hay una sesión activa, preguntar si quiere continuar
        if (confirm(`¡Hola ${session.name}! ¿Quieres continuar con tu sesión actual?`)) {
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
    
    const recoveryEmail = document.getElementById('recoveryEmail').value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(recoveryEmail)) {
        showAlert('Por favor ingresa un email válido', 'error');
        return;
    }
    
    // Verificar si el email existe en la "base de datos"
    const userExists = users.some(user => user.email === recoveryEmail);
    
    if (userExists) {
        showAlert('Se han enviado las instrucciones de recuperación a tu email', 'success');
        closeForgotPasswordModal();
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
    alert.textContent = message;
    
    document.body.appendChild(alert);
    
    // Remover alerta después de la animación
    setTimeout(() => {
        if (alert.parentNode) {
            alert.remove();
        }
    }, 3000);
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