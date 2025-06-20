// VARIABLES GLOBALES
let currentUser = null;

// INICIALIZAR CUANDO SE CARGA LA PÁGINA
document.addEventListener('DOMContentLoaded', function() {
    checkUserSession();
    setupEventListeners();
});

// VERIFICAR SESIÓN DE USUARIO
function checkUserSession() {
    // Buscar sesión activa (puede estar en localStorage o sessionStorage)
    const userSession = JSON.parse(localStorage.getItem('userSession') || sessionStorage.getItem('userSession') || 'null');
    
    if (!userSession) {
        // Si no hay usuario logueado, redirigir al login
        window.location.href = 'iniciarsesion.html';
        return;
    }
    
    // Buscar el usuario en la base de datos usando el sistema de iniciarsesion.js
    const users = JSON.parse(localStorage.getItem('restaurante_users_db') || '[]');
    currentUser = users.find(user => user.email === userSession.email);
    
    if (!currentUser) {
        // Si el usuario no existe en la BD, limpiar sesión y redirigir
        localStorage.removeItem('userSession');
        sessionStorage.removeItem('userSession');
        window.location.href = 'iniciarsesion.html';
        return;
    }
    
    // Guardar email original para actualizaciones futuras
    currentUser._originalEmail = currentUser.email;

    loadUserData();
}

// CARGAR DATOS DEL USUARIO
function loadUserData() {
     if (!currentUser) return;
    
    // Actualizar encabezado del perfil
    document.getElementById('userName').textContent = currentUser.nombre || `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim();
    document.getElementById('userEmail').textContent = currentUser.email;
    document.getElementById('memberDate').textContent = formatRegistrationDate(currentUser.fechaRegistro || currentUser.registrationDate);
    
    // Llenar formulario con datos del usuario
    // Usar nombres del sistema nuevo pero mantener compatibilidad
    const nombres = currentUser.nombre ? currentUser.nombre.split(' ') : [];
    document.getElementById('firstName').value = currentUser.firstName || nombres[0] || '';
    document.getElementById('lastName').value = currentUser.lastName || nombres.slice(1).join(' ') || '';
    document.getElementById('email').value = currentUser.email || '';
    document.getElementById('phone').value = currentUser.telefono || currentUser.phone || '';
    document.getElementById('address').value = currentUser.address || '';
    document.getElementById('birthdate').value = currentUser.fechaNacimiento || currentUser.birthdate || '';
    document.getElementById('gender').value = currentUser.gender || '';
    
    // Cargar avatar si existe
    if (currentUser.avatar) {
        document.getElementById('avatarImg').src = currentUser.avatar;
    }
    
    // Cargar configuraciones de seguridad
    document.getElementById('emailNotifications').checked = currentUser.emailNotifications !== false;
    document.getElementById('twoFactor').checked = currentUser.twoFactor === true;
    
    // Cargar pedidos del usuario
    loadUserOrders();
}

// FORMATEAR FECHA DE REGISTRO
function formatRegistrationDate(dateString) {
    if (!dateString) return 'Fecha no disponible';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

// CARGAR PEDIDOS DEL USUARIO
function loadUserOrders() {
    const users = JSON.parse(localStorage.getItem('restaurante_users_db') || '[]');
    const userSession = JSON.parse(localStorage.getItem('userSession') || sessionStorage.getItem('userSession') || 'null');
    if (!userSession) return;

    const currentUser = users.find(u => u.email === userSession.email);
    if (!currentUser || !currentUser.orders || currentUser.orders.length === 0) {
        document.getElementById('ordersList').innerHTML = `
            <div class="alert alert-info mt-3" role="alert">
                No tienes pedidos realizados.
            </div>`;
        return;
    }

    const ordersHTML = currentUser.orders.slice().reverse().map(order => {
    return `
    <div class="card mb-3 shadow-sm">
        <div class="card-header d-flex justify-content-between align-items-center bg-primary text-white">
            <h5 class="mb-0">Pedido #${order.id}</h5>
            <small>${new Date(order.date).toLocaleString('es-MX')}</small>
        </div>
        <div class="card-body">
            <p><strong>Total:</strong> ${formatCurrency(order.total)}</p>
            <p><strong>Estado:</strong> <span class="badge ${order.status === 'Entregado' ? 'bg-success' : 'bg-warning'}">${order.status}</span></p>
            <p><strong>Productos:</strong></p>
            <ul class="list-group list-group-flush mb-3">
                ${order.items.map(item => `<li class="list-group-item">${item.title} x${item.quantity}</li>`).join('')}
            </ul>
            <button class="btn btn-outline-primary btn-sm" onclick="reorder(${order.id})">
                <i class="bi bi-cart-plus"></i> Volver a pedir
            </button>
        </div>
    </div>`;
    }).join('');

    document.getElementById('ordersList').innerHTML = ordersHTML;
}

// FUNCIONALIDAD DE "VOLVER A PEDIR"
function reorder(orderId) {
    const users = JSON.parse(localStorage.getItem('restaurante_users_db') || '[]');
    const userSession = JSON.parse(localStorage.getItem('userSession') || sessionStorage.getItem('userSession') || 'null');
    if (!userSession) return;

    const currentUser = users.find(u => u.email === userSession.email);
    if (!currentUser) return;

    const pedido = currentUser.orders.find(p => p.id === orderId);
    if (!pedido || !pedido.items) return;

    let carrito = JSON.parse(localStorage.getItem('products')) || [];

    pedido.items.forEach(pedidoItem => {
        // Verifica que tenga ID válido
        if (!pedidoItem.id) return;

        const index = carrito.findIndex(item => item.id === pedidoItem.id);

        if (index !== -1) {
            carrito[index].quantity += pedidoItem.quantity || 1;
        } else {
            carrito.push({
                id: pedidoItem.id,
                title: pedidoItem.title,
                price: pedidoItem.price,
                img: pedidoItem.img || '',
                quantity: pedidoItem.quantity || 1
            });
        }
    });

    localStorage.setItem('products', JSON.stringify(carrito));
    showAlert('Productos agregados al carrito', 'success');
    console.log('Pedido items:', pedido.items);
    setTimeout(() => {
      window.location.href = 'menu.html';
    }, 1500); // para que alcance a ver la alerta
}

function showAlert(message, type) {
    const norepeat = document.querySelector('.alert');
    if (norepeat) norepeat.remove();

    const div = document.createElement('div');
    div.classList.add('alert', type);
    div.textContent = message;
    document.body.appendChild(div);

    setTimeout(() => div.remove(), 8000);
}


// CONFIGURAR EVENT LISTENERS
function setupEventListeners() {
    // Formulario de información personal
    document.getElementById('personalForm').addEventListener('submit', handlePersonalForm);
    
    // Formulario de seguridad
    document.getElementById('securityForm').addEventListener('submit', handleSecurityForm);
    
    // Input de avatar
    document.getElementById('avatarInput').addEventListener('change', handleAvatarChange);
    
    // Checkboxes de seguridad
    document.getElementById('emailNotifications').addEventListener('change', updateSecuritySettings);
    document.getElementById('twoFactor').addEventListener('change', updateSecuritySettings);
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
    
    // Actualizar datos del usuario manteniendo compatibilidad
    currentUser.firstName = updatedData.firstName;
    currentUser.lastName = updatedData.lastName;
    currentUser.nombre = `${updatedData.firstName} ${updatedData.lastName}`;
    currentUser.email = updatedData.email;
    currentUser.phone = updatedData.phone;
    currentUser.telefono = updatedData.phone;
    currentUser.address = updatedData.address;
    currentUser.birthdate = updatedData.birthdate;
    currentUser.fechaNacimiento = updatedData.birthdate;
    currentUser.gender = updatedData.gender;
    
    // Actualizar en localStorage
    updateUserInDatabase();
    
    // Actualizar interfaz
    document.getElementById('userName').textContent = currentUser.nombre;
    document.getElementById('userEmail').textContent = currentUser.email;
    
    showAlert('Información actualizada correctamente', 'success');
}

// ACTUALIZAR USUARIO EN BASE DE DATOS
function updateUserInDatabase() {
    const users = JSON.parse(localStorage.getItem('restaurante_users_db') || '[]');
    const userIndex = users.findIndex(user => user.email === currentUser._originalEmail);
    
    currentUser._originalEmail = currentUser.email;


    if (userIndex !== -1) {
        users[userIndex] = currentUser;
        localStorage.setItem('restaurante_users_db', JSON.stringify(users));
        
        // Actualizar también la sesión activa
        const currentSession = JSON.parse(localStorage.getItem('userSession') || sessionStorage.getItem('userSession') || 'null');
        if (currentSession) {
            const updatedSession = {
                ...currentSession,
                nombre: currentUser.nombre,
                email: currentUser.email
            };
            
            // Actualizar en el mismo lugar donde estaba guardada
            if (localStorage.getItem('userSession')) {
                localStorage.setItem('userSession', JSON.stringify(updatedSession));
            } else {
                sessionStorage.setItem('userSession', JSON.stringify(updatedSession));
            }
        }
    }
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
    
    // Verificar contraseña actual
    if (currentPassword !== currentUser.password) {
        showAlert('La contraseña actual no es correcta', 'error');
        return;
    }
    
    // Actualizar contraseña
    currentUser.password = newPassword;
    updateUserInDatabase();
    
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

// ACTUALIZAR CONFIGURACIONES DE SEGURIDAD
function updateSecuritySettings() {
    currentUser.emailNotifications = document.getElementById('emailNotifications').checked;
    currentUser.twoFactor = document.getElementById('twoFactor').checked;
    updateUserInDatabase();
    showAlert('Configuraciones de seguridad actualizadas', 'success');
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
                updateUserInDatabase();
                showAlert('Avatar actualizado correctamente', 'success');
            };
            reader.readAsDataURL(file);
        } else {
            showAlert('Por favor selecciona una imagen válida', 'error');
        }
    }
}

// CERRAR SESIÓN
function logout() {
    showConfirmModal(
        'Cerrar Sesión',
        '¿Estás seguro de que deseas cerrar sesión?',
        () => {
            localStorage.removeItem('userSession');
            sessionStorage.removeItem('userSession');
            window.location.href = 'index.html';
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
    
    // Estilos básicos para las alertas
    alert.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        z-index: 10000;
        font-weight: bold;
        max-width: 300px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        ${type === 'success' ? 
            'background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb;' :
            'background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb;'
        }
    `;
    
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