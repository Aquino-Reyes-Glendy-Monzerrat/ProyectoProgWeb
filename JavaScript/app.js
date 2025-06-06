let productsArray = [];
const botones = document.querySelectorAll('.btn-add');
const contentproducts = document.querySelector('#contentProducts');
const emptyCart = document.querySelector('#emptyCart');

document.addEventListener('DOMContentLoaded', () => {
    cargarProductosGuardados();
    eventListeners();
    configurarPago();
});

// Carga productos guardados del localStorage
function cargarProductosGuardados() {
    const loadProd = localStorage.getItem('products');
    if (loadProd) {
        productsArray = JSON.parse(loadProd);
        productsHtml();
        updatecartcount();
        updateTotal();
    }
}

// Configura los listeners de botones
function eventListeners() {
    botones.forEach(boton => {
        boton.addEventListener('click', getDataElements);
    });

    if (emptyCart) {
        emptyCart.addEventListener('click', function () {
            productsArray = [];
            productsHtml();
            updatecartcount();
            updateTotal();
            localStorage.removeItem('products');
            showAlert('Carrito Vaciado', 'error');
        });
    }
}

// Configura el botón de pagar
function configurarPago() {
    const btnPagar = document.getElementById('pagar');
    if (btnPagar) {
        btnPagar.addEventListener('click', () => {
            const totalElement = document.getElementById('total');
            if (totalElement) {
                const total = totalElement.textContent;
                localStorage.setItem('totalCarrito', total); // Guarda el total
                window.location.href = "../HTML/pago.html"; // Redirige
            }
        });
    }
}

// Actualiza el número del carrito
function updatecartcount() {
    const cuentacart = document.querySelector('#cuentacart');
    if (cuentacart) cuentacart.textContent = productsArray.length;
}

// Actualiza el total del carrito
function updateTotal() {
    const totalElement = document.getElementById("total");
    const totalAmount = productsArray.reduce((total, prod) => total + prod.price * prod.quantity, 0);
    if (totalElement) {
        totalElement.textContent = `$${totalAmount.toFixed(2)}`;
    }
}

// Toma los datos del producto
function getDataElements(e) {
    if (e.target.classList.contains('btn-add')) {
        const elementHtml = e.target.closest('.product');
        selectData(elementHtml);
    }
}

// Agrega un producto
function selectData(prod) {
    const productObj = {
        img: prod.querySelector('img').src,
        title: prod.querySelector('.product-txt h4').textContent,
        price: parseFloat(prod.querySelector('.price').textContent.replace('$', '')),
        id: parseInt(prod.querySelector('.btn-add').dataset.id, 10),
        quantity: 1
    };

    // Buscar si ya está el producto
    const existingProduct = productsArray.find(p => p.id === productObj.id);

    if (existingProduct) {
        showAlert('Producto ya añadido', 'warning');
    } else {
        productsArray.push(productObj);
        showAlert('Producto añadido', 'success');
    }

    productsHtml();
    updatecartcount();
    updateTotal();
}

// Genera el HTML del carrito
function productsHtml() {
    clearHtml();

    productsArray.forEach(prod => {
        const { img, title, price, quantity, id } = prod;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><img src="${img}" alt="image product" style="width:50px;"></td>
            <td><p>${title}</p></td>
            <td><p>$${(price * quantity).toFixed(2)}</p></td>
            <td><input type="number" min="1" value="${quantity}" data-id="${id}" oninput="updateCantidad(event)"></td>
            <td><button type="button" onclick="destroyProduct(${id})">X</button></td>
        `;
        contentproducts.appendChild(tr);
    });

    console.log(productsArray.map(p => p.id));

    savelocal();
}

// Elimina un producto
function destroyProduct(idProd) {
    productsArray = productsArray.filter(prod => prod.id !== idProd);
    showAlert('Producto eliminado', 'success');
    productsHtml();
    updatecartcount();
    updateTotal();
    savelocal();
}

// Limpia el contenido del carrito
function clearHtml() {
    while (contentproducts.firstChild) {
        contentproducts.removeChild(contentproducts.firstChild);
    }
}

// Muestra alertas temporales
function showAlert(message, type) {
    const norepeat = document.querySelector('.alert');
    if (norepeat) norepeat.remove();

    const div = document.createElement('div');
    div.classList.add('alert', type);
    div.textContent = message;
    document.body.appendChild(div);

    setTimeout(() => div.remove(), 2000);
}

// Actualiza la cantidad de un producto
function updateCantidad(e) {
    const newCantidad = parseInt(e.target.value, 10);
    const idProd = e.target.dataset.id;

    const product = productsArray.find(prod => String(prod.id) === String(idProd));

    if (product && newCantidad > 0) {
        product.quantity = newCantidad;
        savelocal();
        updateTotal();
        updatecartcount(); // si quieres actualizar contador también
    }
    // NO llamar productsHtml() aquí
}

// Guarda productos en localStorage
function savelocal() {
    localStorage.setItem('products', JSON.stringify(productsArray));
}
