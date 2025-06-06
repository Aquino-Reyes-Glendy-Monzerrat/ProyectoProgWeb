document.addEventListener('DOMContentLoaded', () => {
    configurarPago();
    cargarCarritoEnPago();
});

function configurarPago() {
    const botonesPagar = document.querySelectorAll('.btn-pagar');
    botonesPagar.forEach(boton => {
        boton.addEventListener('click', procesarPago);
    });

    const radios = document.querySelectorAll('input[name="payment"]');
    radios.forEach(radio => {
        radio.addEventListener('change', function () {
            mostrarFormularioPago(this.value);
        });
    });
}

function procesarPago() {
    const carrito = JSON.parse(localStorage.getItem('products')) || [];
    if (carrito.length === 0) {
        alert('El carrito está vacío.');
        return;
    }

    const total = carrito.reduce((acc, prod) => acc + prod.price * prod.quantity, 0);
    const metodo = document.querySelector('input[name="payment"]:checked');
    if (!metodo) {
        alert('Selecciona un método de pago');
        return;
    }

    const userSession = JSON.parse(localStorage.getItem('userSession') || sessionStorage.getItem('userSession') || 'null');
    if (!userSession) {
        alert("No hay sesión activa.");
        window.location.href = "../HTML/iniciarsesion.html";
        return;
    }

    const pedido = {
        id: Date.now(),
        date: new Date().toISOString(),
        total: total,
        status: 'Pendiente',
        items: carrito.map(p => ({
            id: p.id,
            title: p.title,
            price: p.price,
            quantity: p.quantity,
            img: p.img
        }))
    };

    const users = JSON.parse(localStorage.getItem('restaurante_users_db') || '[]');
    const currentUserIndex = users.findIndex(u => u.email === userSession.email);

    if (currentUserIndex === -1) {
        alert("Usuario no encontrado.");
        return;
    }

    const currentUser = users[currentUserIndex];
    currentUser.orders = currentUser.orders || [];
    currentUser.orders.push(pedido);

    // Guardar cambios
    users[currentUserIndex] = currentUser;
    localStorage.setItem('restaurante_users_db', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    // Limpiar carrito
    localStorage.removeItem('products');
    localStorage.removeItem('totalCarrito');

    // Redirigir
    window.location.href = '../HTML/confirmacionPedido.html';
}

function cargarCarritoEnPago() {
    const carrito = JSON.parse(localStorage.getItem('products')) || [];
    const tbody = document.getElementById('contentProducts');
    const totalElement = document.getElementById('total');
    const mostrarTotal = document.querySelectorAll('.mostrar-total');
    let total = 0;

    if (!tbody) return;

    tbody.innerHTML = '';
    carrito.forEach((producto, index) => {
        const subtotal = producto.price * producto.quantity;
        total += subtotal;

        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td><img src="${producto.img}" style="width: 50px;"></td>
            <td>${producto.title}</td>
            <td>$${producto.price.toFixed(2)}</td>
            <td><input type="number" min="1" value="${producto.quantity}" data-index="${index}" class="cantidad-input"></td>
            <td><button onclick="eliminarDelCarrito(${index})">X</button></td>
        `;
        tbody.appendChild(fila);
    });

    if (totalElement) totalElement.textContent = `$${total.toFixed(2)}`;
    mostrarTotal.forEach(span => span.textContent = `$${total.toFixed(2)}`);
    localStorage.setItem('totalCarrito', `$${total.toFixed(2)}`);

    document.querySelectorAll('.cantidad-input').forEach(input => {
        input.addEventListener('input', actualizarCantidad);
    });
}

function mostrarFormularioPago(valor) {
    const formE = document.querySelector('#formEfectivo');
    const formT = document.querySelector('#formTransferencia');
    if (formE) formE.classList.add('hidden');
    if (formT) formT.classList.add('hidden');

    if (valor === 'cash' && formE) {
        formE.classList.remove('hidden');
    } else if (valor === 'transfer' && formT) {
        formT.classList.remove('hidden');
    }
}