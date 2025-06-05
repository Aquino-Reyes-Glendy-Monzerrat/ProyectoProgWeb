// registro.js - Sistema con Base de Datos JSON

// Simulación de base de datos usando localStorage
class UserDatabase {
    constructor() {
        this.dbKey = 'restaurante_users_db';
        this.initDatabase();
    }

    initDatabase() {
        if (!localStorage.getItem(this.dbKey)) {
            // Crear base de datos inicial con algunos usuarios de ejemplo
            const initialUsers = [
                {
                    id: 1,
                    nombre: 'Admin Restaurante',
                    email: 'admin@restaurante.com',
                    telefono: '4431234567',
                    password: 'admin123',
                    fechaNacimiento: '1990-01-01',
                    fechaRegistro: '2024-01-01T00:00:00.000Z',
                    role: 'admin'
                }
            ];
            localStorage.setItem(this.dbKey, JSON.stringify(initialUsers));
        }
    }

    getAllUsers() {
        return JSON.parse(localStorage.getItem(this.dbKey) || '[]');
    }

    saveUsers(users) {
        localStorage.setItem(this.dbKey, JSON.stringify(users));
    }

    addUser(userData) {
        const users = this.getAllUsers();
        const newUser = {
            id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
            ...userData,
            fechaRegistro: new Date().toISOString(),
            role: 'user'
        };
        users.push(newUser);
        this.saveUsers(users);
        return newUser;
    }

    findUserByEmail(email) {
        const users = this.getAllUsers();
        return users.find(user => user.email.toLowerCase() === email.toLowerCase());
    }

    emailExists(email) {
        return this.findUserByEmail(email) !== undefined;
    }
}

// Instancia de la base de datos
const userDB = new UserDatabase();

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('registroForm');
    const fields = {
        nombre: document.getElementById('nombre'),
        email: document.getElementById('email'),
        telefono: document.getElementById('telefono'),
        password: document.getElementById('password'),
        confirmPassword: document.getElementById('confirmPassword'),
        fechaNacimiento: document.getElementById('fechaNacimiento'),
        terminos: document.getElementById('terminos')
    };

    // Configurar fecha máxima (debe ser mayor de 18 años)
    const today = new Date();
    const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    fields.fechaNacimiento.max = maxDate.toISOString().split('T')[0];

    // Validación en tiempo real
    fields.nombre.addEventListener('input', validateNombre);
    fields.email.addEventListener('input', validateEmail);
    fields.telefono.addEventListener('input', validateTelefono);
    fields.password.addEventListener('input', validatePassword);
    fields.confirmPassword.addEventListener('input', validateConfirmPassword);
    fields.fechaNacimiento.addEventListener('change', validateFecha);

    // Solo números en teléfono
    fields.telefono.addEventListener('keypress', function(e) {
        if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Enter'].includes(e.key)) {
            e.preventDefault();
        }
    });

    // Envío del formulario
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        if (validateForm()) {
            registerUser();
        }
    });

    function validateNombre() {
        const nombre = fields.nombre.value.trim();
        
        fields.nombre.classList.remove('valid', 'invalid');
        hideError('nombreError');
        
        if (!nombre) {
            showError('nombreError', 'El nombre es requerido');
            fields.nombre.classList.add('invalid');
            return false;
        }
        
        if (nombre.length < 2) {
            showError('nombreError', 'El nombre debe tener al menos 2 caracteres');
            fields.nombre.classList.add('invalid');
            return false;
        }
        
        if (/\d/.test(nombre)) {
            showError('nombreError', 'El nombre no puede contener números');
            fields.nombre.classList.add('invalid');
            return false;
        }
        
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(nombre)) {
            showError('nombreError', 'El nombre solo puede contener letras y espacios');
            fields.nombre.classList.add('invalid');
            return false;
        }
        
        fields.nombre.classList.add('valid');
        return true;
    }

    function validateEmail() {
        const email = fields.email.value.trim();
        
        fields.email.classList.remove('valid', 'invalid');
        hideError('emailError');
        
        if (!email) {
            showError('emailError', 'El correo electrónico es requerido');
            fields.email.classList.add('invalid');
            return false;
        }
        
        if (!email.includes('@')) {
            showError('emailError', 'El correo debe contener @');
            fields.email.classList.add('invalid');
            return false;
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showError('emailError', 'Formato de correo inválido');
            fields.email.classList.add('invalid');
            return false;
        }

        // Verificar si el email ya existe
        if (userDB.emailExists(email)) {
            showError('emailError', 'Este correo ya está registrado');
            fields.email.classList.add('invalid');
            return false;
        }
        
        fields.email.classList.add('valid');
        return true;
    }

    function validateTelefono() {
        const telefono = fields.telefono.value.trim();
        
        fields.telefono.classList.remove('valid', 'invalid');
        hideError('telefonoError');
        
        if (!telefono) {
            showError('telefonoError', 'El teléfono es requerido');
            fields.telefono.classList.add('invalid');
            return false;
        }
        
        if (!/^\d+$/.test(telefono)) {
            showError('telefonoError', 'El teléfono solo puede contener números');
            fields.telefono.classList.add('invalid');
            return false;
        }
        
        if (telefono.length !== 10) {
            showError('telefonoError', 'El teléfono debe tener exactamente 10 dígitos');
            fields.telefono.classList.add('invalid');
            return false;
        }
        
        fields.telefono.classList.add('valid');
        return true;
    }

    function validatePassword() {
        const password = fields.password.value;
        
        fields.password.classList.remove('valid', 'invalid');
        hideError('passwordError');
        
        if (!password) {
            showError('passwordError', 'La contraseña es requerida');
            fields.password.classList.add('invalid');
            return false;
        }
        
        if (password.length < 6) {
            showError('passwordError', 'La contraseña debe tener al menos 6 caracteres');
            fields.password.classList.add('invalid');
            return false;
        }
        
        fields.password.classList.add('valid');
        return true;
    }

    function validateConfirmPassword() {
        const password = fields.password.value;
        const confirmPassword = fields.confirmPassword.value;
        
        fields.confirmPassword.classList.remove('valid', 'invalid');
        hideError('confirmPasswordError');
        
        if (!confirmPassword) {
            showError('confirmPasswordError', 'Confirma tu contraseña');
            fields.confirmPassword.classList.add('invalid');
            return false;
        }
        
        if (password !== confirmPassword) {
            showError('confirmPasswordError', 'Las contraseñas no coinciden');
            fields.confirmPassword.classList.add('invalid');
            return false;
        }
        
        fields.confirmPassword.classList.add('valid');
        return true;
    }

    function validateFecha() {
        const fecha = fields.fechaNacimiento.value;
        
        hideError('fechaError');
        
        if (!fecha) {
            showError('fechaError', 'La fecha de nacimiento es requerida');
            return false;
        }
        
        const fechaNac = new Date(fecha);
        const hoy = new Date();
        const edad = hoy.getFullYear() - fechaNac.getFullYear();
        const mesActual = hoy.getMonth();
        const diaActual = hoy.getDate();
        const mesNac = fechaNac.getMonth();
        const diaNac = fechaNac.getDate();
        
        let edadReal = edad;
        if (mesActual < mesNac || (mesActual === mesNac && diaActual < diaNac)) {
            edadReal--;
        }
        
        if (edadReal < 18) {
            showError('fechaError', 'Debes ser mayor de 18 años');
            return false;
        }
        
        return true;
    }

    function validateTerminos() {
        hideError('terminosError');
        
        if (!fields.terminos.checked) {
            showError('terminosError', 'Debes aceptar los términos y condiciones');
            return false;
        }
        
        return true;
    }

    function validateForm() {
        let isValid = true;
        
        if (!validateNombre()) isValid = false;
        if (!validateEmail()) isValid = false;
        if (!validateTelefono()) isValid = false;
        if (!validatePassword()) isValid = false;
        if (!validateConfirmPassword()) isValid = false;
        if (!validateFecha()) isValid = false;
        if (!validateTerminos()) isValid = false;
        
        return isValid;
    }

    function registerUser() {
        const submitBtn = document.querySelector('.btn-registro');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Procesando...';
        
        // Preparar datos del usuario
        const userData = {
            nombre: fields.nombre.value.trim(),
            email: fields.email.value.trim().toLowerCase(),
            telefono: fields.telefono.value.trim(),
            password: fields.password.value,
            fechaNacimiento: fields.fechaNacimiento.value
        };

        try {
            // Registrar usuario en la base de datos
            const newUser = userDB.addUser(userData);
            
            // Simular tiempo de procesamiento
            setTimeout(() => {
                showAlert('¡Registro exitoso! Bienvenido a nuestro restaurante. Serás redirigido a la página principal.', 'success');
                
                // Crear sesión automáticamente
                const userSession = {
                    id: newUser.id,
                    email: newUser.email,
                    nombre: newUser.nombre,
                    role: newUser.role,
                    loginTime: new Date().toISOString()
                };
                
                // Guardar sesión
                sessionStorage.setItem('userSession', JSON.stringify(userSession));
                
                // Redirigir a index después de 2 segundos
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);
                
            }, 1500);
            
        } catch (error) {
            console.error('Error al registrar usuario:', error);
            showAlert('Error al procesar el registro. Inténtalo de nuevo.', 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Crear Cuenta';
        }
    }

    function showError(elementId, message) {
        const errorElement = document.getElementById(elementId);
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }

    function hideError(elementId) {
        const errorElement = document.getElementById(elementId);
        errorElement.textContent = '';
        errorElement.classList.remove('show');
    }

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
        
        // Remover alerta después de 5 segundos
        setTimeout(() => {
            if (alert.parentNode) {
                alert.remove();
            }
        }, 5000);
    }
});