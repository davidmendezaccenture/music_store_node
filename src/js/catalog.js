let productos = [];
let productosFiltrados = [];

// 1. Cargar productos
function cargarProductos() {
  $.getJSON('../assets/data/products.json', function(data) {
    productos = data;
    filtrarYMostrar();
  });
}

// 2. Eventos con jQuery
$(document).ready(function() {
  cargarProductos();

  $('#search-input').on('input', filtrarYMostrar);
  $('#filtro-categoria').on('change', filtrarYMostrar);
  $('#filtro-precio').on('change', filtrarYMostrar);
  $('#filtro-oferta').on('change', filtrarYMostrar);
  $('#ordenar-productos').on('change', filtrarYMostrar);
});

// 3. Filtrar y mostrar productos
function filtrarYMostrar() {
  let query = ($('#search-input').val() || '').trim().toLowerCase();
  productosFiltrados = productos.filter(p =>
    p.name.toLowerCase().includes(query)
  );

  // Filtro por categoría
  let categoria = $('#filtro-categoria').val();
  if (categoria) {
    productosFiltrados = productosFiltrados.filter(p => p.category === categoria);
  }
  // Filtro por precio
  let precio = $('#filtro-precio').val();
  if (precio) {
    if (precio === '<300') productosFiltrados = productosFiltrados.filter(p => p.price < 300);
    if (precio === '300-600') productosFiltrados = productosFiltrados.filter(p => p.price >= 300 && p.price <= 600);
    if (precio === '>600') productosFiltrados = productosFiltrados.filter(p => p.price > 600);
  }
  // Filtro por oferta
  if ($('#filtro-oferta').is(':checked')) {
    productosFiltrados = productosFiltrados.filter(p => p.offerPrice < p.price);
  }
  // Ordenar
  let orden = $('#ordenar-productos').val();
  if (orden) {
    if (orden === 'precio-asc') productosFiltrados.sort((a, b) => a.price - b.price);
    if (orden === 'precio-desc') productosFiltrados.sort((a, b) => b.price - a.price);
    if (orden === 'oferta') productosFiltrados.sort((a, b) => (a.offerPrice || a.price) - (b.offerPrice || b.price));
  }
  mostrarProductos(productosFiltrados);
}

// 4. Mostrar productos
function mostrarProductos(lista) {
  let $contenedor = $('#products-list');
  let $contador = $('#result-count');
  if ($contador.length) $contador.text(`${lista.length} resultados encontrados`);
  if (!lista.length) {
    $contenedor.html('<p>No se encontraron productos.</p>');
    return;
  }
  $contenedor.html(lista.map(p => `
    <div class="card mb-3 product-card" tabindex="0" aria-label="${p.name}">
      <img src="${p.image}" class="card-img-top" alt="${p.name}">
      <div class="card-body">
        <h5 class="card-title">${p.name}</h5>
        <p class="card-text">${p.description}</p>
        <p class="card-text">
          <span class="fw-bold">${p.offerPrice < p.price ? p.offerPrice + ' € <del>' + p.price + ' €</del>' : p.price + ' €'}</span>
        </p>
        <button class="btn btn-primary btn-add-cart" data-product="${p.id}" aria-label="Añadir ${p.name} a la cesta">Añadir a la cesta</button>
      </div>
    </div>
  `).join(''));
}