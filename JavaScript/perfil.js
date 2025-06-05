// VARIABLES GLOBALES
let currentUser = {
    firstName: 'Juan',
    lastName: 'Pérez',
    email: 'juan.perez@email.com',
    phone: '+52 443 123 4567',
    address: 'Calle Principal #123, Col. Centro, Uruapan, Michoacán',
    birthdate: '1990-01-15',
    gender: 'M',
    memberSince: 'Enero 2024',
    avatar: 'avatar-default.png'
};

// INICIALIZAR CUANDO SE CARGA LA PÁGINA
document.addEventListener('DOMContentLoaded', function() {
    loadUserData();
    setupEventListeners();
});

// CARGAR DATOS DEL USUARIO
function loadUserData() {
    document.getElementById('userName').textContent = `${currentUser.firstName} ${currentUser.lastName}`;
    document.getElementById('userEmail').textContent = currentUser.email;
    document.getElementById('memberDate').textContent = currentUser.memberSince;
    
    // Llenar formulario
    document.getElementById('firstName').value = currentUser.firstName;
    document.getElementById('lastName').value = currentUser.lastName;
    document.getElementById('email').value = currentUser.email;
    document.getElementById('phone').value = currentUser.phone;
    document.getElementById('address').value = currentUser.address;
    document.getElementById('birthdate').value = currentUser.birthdate;
    document.getElementById('gender').value = currentUser.gender;
}

// CONFIGURAR EVENT LISTENERS
function setupEventListeners() {
    // Formulario de información personal
    document.getElementById('personalForm').addEventListener('submit', handlePersonalForm);
    
    // Formulario de seguridad
    document.getElementById('securityForm').addEventListener('submit', handleSecurityForm);
    
    // Input de avatar
    document.getElementById('avatarInput').addEventListener('change', handleAvatarChange);
}

// MANEJO DE PESTAÑAS
function showTab(tabName) {
    // Ocultar todas las pestañas
    const tabPanels = document.querySelectorAll('.tab-panel');
    tabPanels.forEach(panel => {
        panel.classList.remove('active');
    });
    
    // Desactivar todos los botones
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Mostrar la pestaña seleccionada
    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');
}

// MANEJO DEL FORMULARIO PERSONAL
function handlePersonalForm(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const updatedData = {};
    
    for (let [key, value] of formData.entries()) {
        updatedData[key] = value;
    }
    
    // Validar datos
    if (!validatePersonalData(updatedData)) {
        return;
    }
    
    // Actualizar datos del usuario
    Object.assign(currentUser, updatedData);
    
    // Actualizar interfaz
    document.getElementById('userName').textContent = `${currentUser.firstName} ${currentUser.lastName}`;
    document.getElementById('userEmail').textContent = currentUser.email;
    
    showAlert('Información actualizada correctamente', 'success');
}

// VALIDAR DATOS PERSONALES
function validatePersonalData(data) {
    const errors = [];
    
    if (!data.firstName.trim()) {
        errors.push('El nombre es requerido');
    }
    
    if (!data.lastName.trim()) {
        errors.push('El apellido es requerido');
    }
    
    if (!data.email.trim()) {
        errors.push('El email es requerido');
    } else if (!isValidEmail(data.email)) {
        errors.push('El email no es válido');
    }
    
    if (data.phone && !isValidPhone(data.phone)) {
        errors.push('El teléfono no es válido');
    }
    
    if (errors.length > 0) {
        showAlert(errors.join(', '), 'error');
        return false;
    }
    
    return true;
}

// VALIDAR EMAIL
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// VALIDAR TELÉFONO
function isValidPhone(phone) {
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
}

// MANEJO DEL FORMULARIO DE SEGURIDAD
function handleSecurityForm(e) {
    e.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Validar contraseñas
    if (!validatePasswords(currentPassword, newPassword, confirmPassword)) {
        return;
    }
    
    // Simular cambio de contraseña
    showAlert('Contraseña actualizada correctamente', 'success');
    
    // Limpiar formulario
    document.getElementById('securityForm').reset();
}

// VALIDAR CONTRASEÑAS
function validatePasswords(current, newPass, confirm) {
    const errors = [];
    
    if (!current.trim()) {
        errors.push('La contraseña actual es requerida');
    }
    
    if (!newPass.trim()) {
        errors.push('La nueva contraseña es requerida');
    } else if (newPass.length < 6) {
        errors.push('La nueva contraseña debe tener al menos 6 caracteres');
    }
    
    if (newPass !== confirm) {
        errors.push('Las contraseñas no coinciden');
    }
    
    if (errors.length > 0) {
        showAlert(errors.join(', '), 'error');
        return false;
    }
    
    return true;
}

// CAMBIAR AVATAR
function changeAvatar() {
    document.getElementById('avatarInput').click();
}

// MANEJO DEL CAMBIO DE AVATAR
function handleAvatarChange(e) {
    const file = e.target.files[0];
    if (file) {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                document.getElementById('avatarImg').src = e.target.result;
                currentUser.avatar = e.target.result;
                showAlert('Avatar actualizado correctamente', 'success');
            };
            reader.readAsDataURL(file);
        } else {
            showAlert('Por favor selecciona una imagen válida', 'error');
        }
    }
}

// VOLVER A PEDIR
function reorder(orderId) {
    showConfirmModal(
        'Confirmar Pedido',
        '¿Deseas volver a realizar este pedido?',
        () => {
            showAlert('Pedido agregado al carrito', 'success');
            // Aquí iría la lógica para agregar al carrito
            closeModal();
        }
    );
}

// RASTREAR PEDIDO
function trackOrder(orderId) {
    showAlert('Redirigiendo al seguimiento del pedido...', 'success');
    // Aquí iría la lógica para mostrar el tracking
}

// MODIFICAR RESERVACIÓN
function modifyReservation(reservationId) {
    showAlert('Redirigiendo a modificar reservación...', 'success');
    // Aquí iría la lógica para modificar la reservación
}

// CANCELAR RESERVACIÓN
function cancelReservation(reservationId) {
    showConfirmModal(
        'Cancelar Reservación',
        '¿Estás seguro de que deseas cancelar esta reservación?',
        () => {
            showAlert('Reservación cancelada correctamente', 'success');
            // Aquí iría la lógica para cancelar la reservación
            closeModal();
        }
    );
}

// MOSTRAR MODAL DE CONFIRMACIÓN
function showConfirmModal(title, message, onConfirm) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalMessage').textContent = message;
    document.getElementById('confirmBtn').onclick = onConfirm;
    document.getElementById('confirmModal').style.display = 'block';
}

// CERRAR MODAL
function closeModal() {
    document.getElementById('confirmModal').style.display = 'none';
}

// MOSTRAR ALERTAS
function showAlert(message, type) {
    // Crear elemento de alerta
    const alert = document.createElement('div');
    alert.className = `alert ${type}`;
    alert.textContent = message;
    
    // Agregar al body
    document.body.appendChild(alert);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        if (alert.parentNode) {
            alert.parentNode.removeChild(alert);
        }
    }, 3000);
}

// CERRAR MODAL AL HACER CLIC FUERA
window.onclick = function(event) {
    const modal = document.getElementById('confirmModal');
    if (event.target === modal) {
        closeModal();
    }
}

// DATOS DE EJEMPLO PARA PEDIDOS Y RESERVACIONES
const sampleOrders = [
    {
        id: 1,
        date: '15 Mayo 2024',
        status: 'delivered',
        total: '$450.00',
        items: 'Pizza Margherita, Pasta Carbonara, Bebidas'
    },
    {
        id: 2,
        date: '10 Mayo 2024',
        status: 'pending',
        total: '$320.00',
        items: 'Hamburguesa Clásica, Papas Fritas'
    }
];

const sampleReservations = [
    {
        id: 1,
        date: '20 Mayo 2024 - 19:30',
        status: 'confirmed',
        people: 4,
        occasion: 'Cena familiar'
    },
    {
        id: 2,
        date: '25 Mayo 2024 - 20:00',
        status: 'pending',
        people: 2,
        occasion: 'Cita romántica'
    }
];

// FUNCIONES AUXILIARES PARA FORMATO
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
    }).format(amount);
}