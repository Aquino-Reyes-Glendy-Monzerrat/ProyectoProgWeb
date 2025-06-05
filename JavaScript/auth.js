// ========================================
// SISTEMA DE AUTENTICACIÓN GLOBAL MEJORADO
// ========================================

// Variables globales
let currentUser = null;
let isAuthRequired = false;

// ========================================
// INICIALIZACIÓN
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    initializeAuth();
    setupAuthEventListeners();
    updateNavigation();
    addCustomStyles();
});

// ========================================
// CONFIGURACIÓN DE PÁGINAS
// ========================================
// Páginas que requieren autenticación
const protectedPages = [
    'perfilusuario.html',
    'perfil.html',
    'pedidos.html',
    'reservas.html',
    'admin.html'
];

// Verificar si la página actual requiere autenticación
function checkIfAuthRequired() {
    const currentPage = window.location.pathname.split('/').pop();
    return protectedPages.includes(currentPage);
}

// ========================================
// INICIALIZACIÓN DE AUTENTICACIÓN
// ========================================
function initializeAuth() {
    isAuthRequired = checkIfAuthRequired();
    checkUserSession();
}

// ========================================
// VERIFICACIÓN DE SESIÓN
// ========================================
function checkUserSession() {
    // Buscar sesión activa
    const userSession = JSON.parse(
        localStorage.getItem('userSession') || 
        sessionStorage.getItem('userSession') || 
        'null'
    );
    
    if (!userSession) {
        if (isAuthRequired) {
            redirectToLogin();
            return;
        }
        currentUser = null;
        updateNavigation();
        return;
    }
    
    // Verificar que el usuario existe en la base de datos
    const users = JSON.parse(localStorage.getItem('restaurante_users_db') || '[]');
    currentUser = users.find(user => user.email === userSession.email);
    
    if (!currentUser) {
        // Usuario no existe, limpiar sesión
        clearUserSession();
        if (isAuthRequired) {
            redirectToLogin();
            return;
        }
    }
    
    updateNavigation();
}

// ========================================
// NAVEGACIÓN DINÁMICA
// ========================================
function updateNavigation() {
    const loginLink = document.querySelector('a[href*="iniciarsesion"]');
    const profileLink = document.querySelector('a[href*="perfilusuario"]');
    
    if (!loginLink && !profileLink) return;
    
    if (currentUser) {
        // Usuario logueado
        if (loginLink) {
            // Cambiar "Iniciar Sesión" por dropdown de usuario
            const userDropdown = createUserDropdown();
            loginLink.parentNode.replaceChild(userDropdown, loginLink);
        }
        
        if (profileLink) {
            profileLink.style.display = 'block';
        }
    } else {
        // Usuario no logueado
        if (loginLink) {
            loginLink.style.display = 'block';
            loginLink.textContent = 'Iniciar Sesión';
            loginLink.style.color = '#ffffff';
        }
        
        if (profileLink) {
            profileLink.style.display = 'none';
        }
    }
}

// ========================================
// CREAR DROPDOWN DE USUARIO
// ========================================
function createUserDropdown() {
    const dropdown = document.createElement('li');
    dropdown.className = 'user-dropdown';
    dropdown.innerHTML = `
        <a href="#" class="user-toggle">
            <span class="user-name">${getUserDisplayName()}</span>
            <span class="dropdown-arrow">▼</span>
        </a>
        <ul class="dropdown-menu">
            <li><a href="../HTML/perfilusuario.html">
                <i class="icon-user">👤</i> Mi Perfil
            </a></li>
            <li><a href="#" onclick="logout()" class="logout-btn">
                <i class="icon-logout">🚪</i> Cerrar Sesión
            </a></li>
        </ul>
    `;
    
    // Event listeners para el dropdown
    const toggle = dropdown.querySelector('.user-toggle');
    const menu = dropdown.querySelector('.dropdown-menu');
    
    toggle.addEventListener('click', function(e) {
        e.preventDefault();
        const isVisible = menu.style.display === 'block';
        closeAllDropdowns();
        if (!isVisible) {
            menu.style.display = 'block';
            dropdown.classList.add('active');
        }
    });
    
    // Cerrar dropdown al hacer clic fuera
    document.addEventListener('click', function(e) {
        if (!dropdown.contains(e.target)) {
            menu.style.display = 'none';
            dropdown.classList.remove('active');
        }
    });
    
    return dropdown;
}

// ========================================
// CERRAR TODOS LOS DROPDOWNS
// ========================================
function closeAllDropdowns() {
    const dropdowns = document.querySelectorAll('.user-dropdown');
    dropdowns.forEach(dropdown => {
        const menu = dropdown.querySelector('.dropdown-menu');
        if (menu) {
            menu.style.display = 'none';
            dropdown.classList.remove('active');
        }
    });
}

// ========================================
// OBTENER NOMBRE DE USUARIO
// ========================================
function getUserDisplayName() {
    if (!currentUser) return 'Usuario';
    
    return currentUser.nombre || 
           `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() ||
           currentUser.email.split('@')[0];
}

// ========================================
// ESTILOS PERSONALIZADOS
// ========================================
function addCustomStyles() {
    if (document.getElementById('auth-custom-styles')) return;
    
    const styles = document.createElement('style');
    styles.id = 'auth-custom-styles';
    styles.textContent = `
        /* Dropdown de Usuario */
        .user-dropdown {
            position: relative;
        }
        
        .user-dropdown .user-toggle {
            font-size: 18px;
            padding: 20px;
            color: #ffffff !important;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: color 0.3s ease;
        }
        
        .user-dropdown .user-toggle:hover {
            color: #db241b !important;
        }
        
        .user-dropdown.active .user-toggle {
            color: #db241b !important;
        }
        
        .user-dropdown .dropdown-arrow {
            font-size: 0.8em;
            transition: transform 0.3s ease;
        }
        
        .user-dropdown.active .dropdown-arrow {
            transform: rotate(180deg);
        }
        
        .dropdown-menu {
            display: none;
            position: absolute;
            top: 100%;
            right: 0;
            background: linear-gradient(145deg, #1a1a1a, #0d0d0d);
            border: 2px solid #db241b;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(219, 36, 27, 0.3);
            min-width: 200px;
            z-index: 1000;
            margin-top: 10px;
            padding: 15px 0;
            backdrop-filter: blur(10px);
        }
        
        .dropdown-menu::before {
            content: '';
            position: absolute;
            top: -8px;
            right: 20px;
            width: 0;
            height: 0;
            border-left: 8px solid transparent;
            border-right: 8px solid transparent;
            border-bottom: 8px solid #db241b;
        }
        
        .dropdown-menu li {
            list-style: none;
            margin: 0;
        }
        
        .dropdown-menu a {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 12px 20px;
            color: #ffffff;
            text-decoration: none;
            font-size: 16px;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 1px;
            transition: all 0.3s ease;
            border-left: 3px solid transparent;
        }
        
        .dropdown-menu a:hover {
            background-color: rgba(219, 36, 27, 0.1);
            border-left-color: #db241b;
            color: #db241b;
            transform: translateX(5px);
        }
        
        .dropdown-menu .logout-btn:hover {
            background-color: rgba(255, 0, 0, 0.1);
            color: #ff4444;
            border-left-color: #ff4444;
        }
        
        /* Modal de Confirmación */
        .auth-modal {
            display: none;
            position: fixed;
            z-index: 10000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(5px);
            animation: fadeIn 0.3s ease;
        }
        
        .modal-content {
            background: linear-gradient(145deg, #1a1a1a, #0d0d0d);
            margin: 10% auto;
            padding: 40px;
            border: 2px solid #db241b;
            border-radius: 15px;
            width: 90%;
            max-width: 450px;
            text-align: center;
            box-shadow: 0 20px 60px rgba(219, 36, 27, 0.4);
            position: relative;
            animation: slideIn 0.4s ease;
        }
        
        .modal-content::before {
            content: '';
            position: absolute;
            top: -2px;
            left: -2px;
            right: -2px;
            bottom: -2px;
            background: linear-gradient(45deg, #db241b, #fd10ca, #db241b);
            border-radius: 15px;
            z-index: -1;
            filter: blur(1px);
        }
        
        .modal-content h3 {
            color: #ffffff;
            font-size: 24px;
            margin-bottom: 20px;
            text-transform: uppercase;
            font-weight: 800;
            letter-spacing: 2px;
        }
        
        .modal-content p {
            color: #a7a7a7;
            font-size: 16px;
            margin-bottom: 30px;
            line-height: 1.6;
        }
        
        .modal-buttons {
            display: flex;
            justify-content: center;
            gap: 15px;
            flex-wrap: wrap;
        }
        
        .btn-confirm, .btn-cancel {
            padding: 15px 30px;
            border: none;
            border-radius: 50px;
            cursor: pointer;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-size: 14px;
            transition: all 0.3s ease;
            min-width: 120px;
        }
        
        .btn-confirm {
            background-color: #db241b;
            color: white;
            border: 2px solid #db241b;
        }
        
        .btn-cancel {
            background-color: transparent;
            color: #ffffff;
            border: 2px solid #ffffff;
        }
        
        .btn-confirm:hover {
            background-color: #fd10ca;
            border-color: #fd10ca;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(219, 36, 27, 0.4);
        }
        
        .btn-cancel:hover {
            background-color: #ffffff;
            color: #080202;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(255, 255, 255, 0.2);
        }
        
        /* Alertas Personalizadas */
        .auth-alert {
            position: fixed;
            top: 30px;
            right: 30px;
            padding: 20px 25px;
            border-radius: 10px;
            z-index: 10000;
            font-weight: 600;
            max-width: 350px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            animation: slideInRight 0.4s ease;
            border-left: 5px solid;
            backdrop-filter: blur(10px);
        }
        
        .auth-alert.success {
            background: linear-gradient(135deg, rgba(76, 175, 80, 0.9), rgba(56, 142, 60, 0.9));
            color: #ffffff;
            border-left-color: #4caf50;
        }
        
        .auth-alert.error {
            background: linear-gradient(135deg, rgba(244, 67, 54, 0.9), rgba(211, 47, 47, 0.9));
            color: #ffffff;
            border-left-color: #f44336;
        }
        
        .auth-alert.info {
            background: linear-gradient(135deg, rgba(33, 150, 243, 0.9), rgba(25, 118, 210, 0.9));
            color: #ffffff;
            border-left-color: #2196f3;
        }
        
        /* Botón de Pago Mejorado */
        #pagar {
            display: inline-block;
            padding: 15px 35px;
            background: linear-gradient(45deg, #db241b, #fd10ca);
            color: #ffffff;
            font-weight: 800;
            text-transform: uppercase;
            border: none;
            border-radius: 50px;
            cursor: pointer;
            font-size: 16px;
            letter-spacing: 2px;
            margin: 20px auto;
            transition: all 0.3s ease;
            box-shadow: 0 5px 15px rgba(219, 36, 27, 0.3);
        }
        
        #pagar:hover {
            transform: translateY(-3px);
            box-shadow: 0 10px 25px rgba(219, 36, 27, 0.5);
            background: linear-gradient(45deg, #fd10ca, #db241b);
        }
        
        #pagar:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
        }
        
        /* Animaciones */
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @keyframes slideIn {
            from {
                transform: translateY(-50px);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }
        
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        /* Responsive */
        @media (max-width: 991px) {
            .dropdown-menu {
                position: fixed;
                top: 80px;
                right: 20px;
                left: 20px;
                width: auto;
                margin-top: 0;
            }
            
            .dropdown-menu::before {
                display: none;
            }
            
            .modal-content {
                margin: 20% auto;
                padding: 30px 20px;
            }
            
            .modal-buttons {
                flex-direction: column;
                align-items: center;
            }
            
            .btn-confirm, .btn-cancel {
                width: 200px;
            }
            
            .auth-alert {
                top: 20px;
                right: 20px;
                left: 20px;
                max-width: none;
            }
        }
        
        /* Loader para procesos */
        .auth-loader {
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 3px solid rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            border-top-color: #ffffff;
            animation: spin 1s ease-in-out infinite;
            margin-right: 10px;
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
    `;
    
    document.head.appendChild(styles);
}

// ========================================
// CERRAR SESIÓN
// ========================================
function logout() {
    showConfirmModal(
        '🚪 Cerrar Sesión',
        '¿Estás seguro de que deseas cerrar sesión?',
        () => {
            // Mostrar loader
            const confirmBtn = document.getElementById('confirmBtn');
            confirmBtn.innerHTML = '<span class="auth-loader"></span>Cerrando...';
            confirmBtn.disabled = true;
            
            setTimeout(() => {
                clearUserSession();
                currentUser = null;
                
                // Redirigir a la página principal
                window.location.href = '../HTML/index.html';
                
                showAlert('✅ Sesión cerrada correctamente', 'success');
                closeModal();
            }, 1500);
        }
    );
}

// ========================================
// LIMPIAR SESIÓN
// ========================================
function clearUserSession() {
    localStorage.removeItem('userSession');
    sessionStorage.removeItem('userSession');
}

// ========================================
// REDIRECCIONAR AL LOGIN
// ========================================
function redirectToLogin() {
    // Guardar la página actual para redirigir después del login
    const currentPage = window.location.href;
    sessionStorage.setItem('redirectAfterLogin', currentPage);
    
    showAlert('🔐 Debes iniciar sesión para acceder', 'info');
    
    setTimeout(() => {
        window.location.href = '../HTML/iniciarsesion.html';
    }, 2000);
}

// ========================================
// VERIFICAR AUTORIZACIÓN PARA FUNCIONES
// ========================================
function requireAuth(callback) {
    if (!currentUser) {
        showAlert('🔒 Debes iniciar sesión para realizar esta acción', 'error');
        setTimeout(() => {
            redirectToLogin();
        }, 2000);
        return false;
    }
    
    if (callback && typeof callback === 'function') {
        callback();
    }
    
    return true;
}

// ========================================
// CONFIGURAR EVENT LISTENERS
// ========================================
function setupAuthEventListeners() {
    // Interceptar clics en enlaces que requieren autenticación
    document.addEventListener('click', function(e) {
        const link = e.target.closest('a');
        if (!link) return;
        
        const href = link.getAttribute('href');
        if (!href) return;
        
        // Verificar si el enlace requiere autenticación
        const requiresAuth = protectedPages.some(page => href.includes(page));
        
        if (requiresAuth && !currentUser) {
            e.preventDefault();
            showAlert('🔐 Debes iniciar sesión para acceder a esta sección', 'error');
            setTimeout(() => {
                redirectToLogin();
            }, 2000);
        }
    });
    
    // Interceptar botón de pago
    const pagarBtn = document.getElementById('pagar');
    if (pagarBtn) {
        pagarBtn.addEventListener('click', function(e) {
            if (!requireAuth()) {
                e.preventDefault();
                return;
            }
            
            handlePayment();
        });
    }
}

// ========================================
// MANEJO DE PAGO MEJORADO
// ========================================
function handlePayment() {
    // Verificar que hay productos en el carrito
    const productsArray = JSON.parse(localStorage.getItem('products') || '[]');
    
    if (productsArray.length === 0) {
        showAlert('🛒 Tu carrito está vacío', 'error');
        return;
    }
    
    // Deshabilitar botón de pago
    const pagarBtn = document.getElementById('pagar');
    if (pagarBtn) {
        pagarBtn.innerHTML = '<span class="auth-loader"></span>Procesando...';
        pagarBtn.disabled = true;
    }
    
    // Simular proceso de pago
    showAlert('💳 Procesando pago...', 'info');
    
    setTimeout(() => {
        // Crear orden
        const order = {
            id: Date.now(),
            date: new Date().toISOString(),
            status: 'pending',
            items: productsArray.length,
            total: productsArray.reduce((total, prod) => total + prod.price * prod.quantity, 0),
            products: [...productsArray]
        };
        
        // Agregar orden al usuario
        if (!currentUser.orders) {
            currentUser.orders = [];
        }
        currentUser.orders.push(order);
        
        // Actualizar usuario en la base de datos
        updateUserInDatabase();
        
        // Limpiar carrito
        localStorage.removeItem('products');
        
        // Actualizar interfaz del carrito si existe
        if (typeof productsHtml === 'function') {
            productsHtml();
        }
        if (typeof updatecartcount === 'function') {
            updatecartcount();
        }
        if (typeof updateTotal === 'function') {
            updateTotal();
        }
        
        // Restaurar botón de pago
        if (pagarBtn) {
            pagarBtn.innerHTML = 'Pagar';
            pagarBtn.disabled = false;
        }
        
        showAlert(`✅ ¡Pago realizado exitosamente! Pedido #${order.id}`, 'success');
        
        // Opcional: redirigir a pedidos después de unos segundos
        setTimeout(() => {
            if (confirm('¿Deseas ver tu pedido?')) {
                window.location.href = '../HTML/pedidos.html';
            }
        }, 3000);
        
    }, 3000);
}

// ========================================
// ACTUALIZAR USUARIO EN BASE DE DATOS
// ========================================
function updateUserInDatabase() {
    if (!currentUser) return;
    
    const users = JSON.parse(localStorage.getItem('restaurante_users_db') || '[]');
    const userIndex = users.findIndex(user => user.email === currentUser.email);
    
    if (userIndex !== -1) {
        users[userIndex] = currentUser;
        localStorage.setItem('restaurante_users_db', JSON.stringify(users));
        
        // Actualizar también la sesión activa
        const currentSession = JSON.parse(
            localStorage.getItem('userSession') || 
            sessionStorage.getItem('userSession') || 
            'null'
        );
        
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

// ========================================
// MODAL DE CONFIRMACIÓN
// ========================================
function showConfirmModal(title, message, onConfirm) {
    // Crear modal si no existe
    let modal = document.getElementById('confirmModal');
    if (!modal) {
        modal = createConfirmModal();
        document.body.appendChild(modal);
    }
    
    document.getElementById('modalTitle').innerHTML = title;
    document.getElementById('modalMessage').textContent = message;
    
    const confirmBtn = document.getElementById('confirmBtn');
    confirmBtn.innerHTML = 'Confirmar';
    confirmBtn.disabled = false;
    confirmBtn.onclick = onConfirm;
    
    modal.style.display = 'block';
    
    // Enfocar el modal para accesibilidad
    modal.focus();
}

// ========================================
// CREAR MODAL DE CONFIRMACIÓN
// ========================================
function createConfirmModal() {
    const modal = document.createElement('div');
    modal.id = 'confirmModal';
    modal.className = 'auth-modal';
    modal.setAttribute('tabindex', '-1');
    modal.innerHTML = `
        <div class="modal-content">
            <h3 id="modalTitle"></h3>
            <p id="modalMessage"></p>
            <div class="modal-buttons">
                <button id="confirmBtn" class="btn-confirm">Confirmar</button>
                <button onclick="closeModal()" class="btn-cancel">Cancelar</button>
            </div>
        </div>
    `;
    
    return modal;
}

// ========================================
// CERRAR MODAL
// ========================================
function closeModal() {
    const modal = document.getElementById('confirmModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// ========================================
// MOSTRAR ALERTAS MEJORADAS
// ========================================
function showAlert(message, type = 'info') {
    // Remover alerta anterior si existe
    const existingAlert = document.querySelector('.auth-alert');
    if (existingAlert) {
        existingAlert.remove();
    }
    
    // Crear nueva alerta
    const alert = document.createElement('div');
    alert.className = `auth-alert ${type}`;
    alert.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 18px;">
                ${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}
            </span>
            <span>${message}</span>
        </div>
    `;
    
    // Agregar al body
    document.body.appendChild(alert);
    
    // Remover después de 4 segundos
    setTimeout(() => {
        if (alert.parentNode) {
            alert.style.animation = 'slideInRight 0.4s ease reverse';
            setTimeout(() => {
                alert.parentNode.removeChild(alert);
            }, 400);
        }
    }, 4000);
}

// ========================================
// CERRAR MODAL AL HACER CLIC FUERA
// ========================================
window.addEventListener('click', function(event) {
    const modal = document.getElementById('confirmModal');
    if (event.target === modal) {
        closeModal();
    }
});

// Cerrar modal con ESC
window.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeModal();
    }
});

// ========================================
// FUNCIONES UTILITARIAS
// ========================================

// Verificar si el usuario es administrador
function isAdmin() {
    return currentUser && currentUser.role === 'admin';
}

// Obtener información del usuario actual
function getCurrentUser() {
    return currentUser;
}

// Verificar si el usuario está logueado
function isLoggedIn() {
    return currentUser !== null;
}

// ========================================
// EXPORTAR FUNCIONES PARA USO GLOBAL
// ========================================
window.logout = logout;
window.requireAuth = requireAuth;
window.showConfirmModal = showConfirmModal;
window.closeModal = closeModal;
window.showAlert = showAlert;
window.isAdmin = isAdmin;
window.getCurrentUser = getCurrentUser;
window.isLoggedIn = isLoggedIn;
window.currentUser = currentUser;