const botones = document.querySelectorAll('.btn-add');
let productsArray = [];
const contentproducts = document.querySelector('#contentProducts');
const emptyCart=document.querySelector('#emptyCart');



document.addEventListener('DOMContentLoaded', function () {
    eventListeners();
});

function eventListeners() {
    botones.forEach(boton => {
        boton.addEventListener('click', getDataElements);
    });

    emptyCart.addEventListener('click',function(){

        productsArray=[];
        productsHtml();
        updatecartcount();
        updateTotal();

    });

    const loadProd=localStorage.getItem('products');

    if (loadProd){
        productsArray=JSON.parse(loadProd);
        productsHtml();
        updatecartcount();
        
    }else{
        productsArray=[];
    }

}


function updatecartcount(){
    const cuentacart=document.querySelector('#cuentacart');
    cuentacart.textContent=productsArray.length;
}


function updateTotal(){
    const total=document.querySelector('#total');
    let totalprodcut=productsArray.reduce((total,prod) =>total +prod.price*prod.quantity,0);

total.textContent=`$${totalprodcut.toFixed(2)}`;

}





function getDataElements(e) {
    if (e.target.classList.contains('btn-add')) {
        const elementHtml = e.target.closest('.product'); // Aquí subes hasta el contenedor completo
        selectData(elementHtml);
    }
}

function selectData(prod) {
    const productObj = {
        img: prod.querySelector('img').src,
        title: prod.querySelector('.product-txt h4').textContent,
        price: parseFloat(prod.querySelector('.price').textContent.replace('$', '')),
        id: parseInt(prod.querySelector('.btn-add').dataset.id, 10),
        quantity: 1
    };


    const exists  = productsArray.some(prod => prod.id=== productObj.id);

    if(exists){

        showAlert('El producto ya está en el carrito','error')
        return;
    }


    productsArray = [...productsArray, productObj];
   showAlert('Producto añadido','success');
    productsHtml();
    updatecartcount();
    updateTotal();
}


function productsHtml(){

    clearHtml();

productsArray.forEach(prod=>{

    const {img,title,price,quantity,id}=prod;

    const tr=document.createElement('tr');

    const tdimg=document.createElement('td');

    const prodimg=document.createElement('img');
    
    prodimg.src=img;
    prodimg.alt='image product'

    tdimg.appendChild(prodimg);

    const tdtitle = document.createElement('td');
    const prodttitle=document.createElement('p');
    prodttitle.textContent=title;
    tdtitle.appendChild(prodttitle);

    const tdprecio = document.createElement('td');
    const prodprecio=document.createElement('p');
    const newPrecio = price*quantity;
    prodprecio.textContent=`$${newPrecio.toFixed(2)}`;
    tdprecio.appendChild(prodprecio);

    const tdcant = document.createElement('td');
    const prodcant=document.createElement('input');
    prodcant.type='number';
    prodcant.min='1';
    prodcant.value=quantity;
    prodcant.dataset.id=id;
    prodcant.oninput=updateCantidad;
    tdcant.appendChild(prodcant);

    const tdEliminar = document.createElement('td');
    const prodEliminar=document.createElement('button');
    prodEliminar.type='button';
    prodEliminar.textContent='X';
    prodEliminar.onclick=()=>destroyProduct(id);
    tdEliminar.appendChild(prodEliminar);



    tr.append(tdimg,tdtitle,tdprecio,prodcant,tdEliminar);
    
    contentproducts.appendChild(tr);
});
savelocal();
}

function destroyProduct(idProd){

    productsArray =productsArray.filter(prod =>prod.id!==idProd);
    showAlert('Producto eliminado','success');
    productsHtml();
    updatecartcount();
    updateTotal();
    savelocal();
}


function clearHtml(){

   while(contentproducts.firstChild){

    contentproducts.removeChild(contentproducts.firstChild);

   }

}


function showAlert(message,type){
    const norepeat =document.querySelector('.alert');
    if(norepeat) norepeat.remove();


    const div=document.createElement('div');
    div.classList.add('alert',type);
    div.textContent=message;

    document.body.appendChild(div);

    setTimeout(() =>div.remove(),1000);
}

function updateCantidad(e){

    const newCantidad= parseInt(e.target.value,10);
    const idProd=parseInt(e.target.dataset.id,10);
    const product=productsArray.find(prod=>prod.id===idProd);
    if(product && newCantidad>0){
        product.quantity=newCantidad;
    }
    productsHtml();
    updateTotal();
    savelocal();
}

function savelocal(){

    localStorage.setItem('products',JSON.stringify(productsArray));
}