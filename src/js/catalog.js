(function () {
  let productos = [];
  let productosFiltrados = [];

  // 1. Cargar productos
  function cargarProductos() {
    $.getJSON('../assets/data/products.json', function (data) {
      productos = data;
      poblarCategorias(productos); // <-- Llama aquí
      filtrarYMostrar();
    });
  }

  // 2. Eventos con jQuery
  $(document).ready(function () {
    cargarProductos();

    $('#search-input-guitar').on('input', filtrarYMostrar);
    $('#filtro-categoria').on('change', filtrarYMostrar);
    $('#filtro-precio').on('change', filtrarYMostrar);
    $('#filtro-oferta').on('change', filtrarYMostrar);
    $('#ordenar-productos').on('change', filtrarYMostrar);
  });

  // 3. Poblar select de categorías dinámicamente
  function poblarCategorias(productos) {
    // Solo categorías de guitarras
    const categoriasGuitarra = ['acoustic-guitars', 'electric-guitars', 'classical-guitars', 'basses'];
    // Extrae categorías únicas presentes en los productos
    const categorias = [...new Set(
      productos
        .map(p => p.category)
        .filter(cat => cat && categoriasGuitarra.includes(cat))
    )];

    // Mapea a nombres legibles
    const nombres = {
      "acoustic-guitars": "Acústicas",
      "electric-guitars": "Eléctricas",
      "classical-guitars": "Clásicas",
      "basses": "Bajos"
    };

    let options = `<option value="">Todas las categorías</option>`;
    categorias.forEach(cat => {
      options += `<option value="${cat}">${nombres[cat] || cat}</option>`;
    });

    $('#filtro-categoria').html(options);
  }

  // 4. Filtrar y mostrar productos
  function filtrarYMostrar() {
    let query = ($('#search-input-guitar').val() || '').trim().toLowerCase();

    // Solo guitarras: ajusta los nombres de categoría según tu JSON
    const categoriasGuitarra = ['acoustic-guitars', 'electric-guitars', 'classical-guitars', 'basses'];

    productosFiltrados = productos
      .filter(p => categoriasGuitarra.includes(p.category)) // Solo guitarras
      .filter(p => p.name.toLowerCase().includes(query));

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

  // 5. Mostrar productos
function mostrarProductos(lista) {
  let $contenedor = $('#products-list');
  let $contador = $('#result-count');
  if ($contador.length) $contador.text(`${lista.length} resultados encontrados`);
  if (!lista.length) {
    $contenedor.html('<p>No se encontraron productos.</p>');
    return;
  }
  $contenedor.empty();
  const template = document.getElementById('product-card-template');
  lista.forEach(p => {
    const clone = template.content.cloneNode(true);
    const card = clone.querySelector('.card');
    clone.querySelector('.card-img-top').src = p.image;
    clone.querySelector('.card-img-top').alt = p.name;
    clone.querySelector('.card-title').textContent = p.name;
    clone.querySelector('.card-text').textContent = p.description;
    // Precio/oferta
    const priceBlock = clone.querySelector('.price-block');
    if (p.offerPrice < p.price) {
      priceBlock.innerHTML = `<span class="text-muted text-decoration-line-through">${p.price} €</span>
        <span class="fw-bold text-danger ms-2">${p.offerPrice} €</span>`;
    } else {
      priceBlock.innerHTML = `<span class="fw-bold">${p.price} €</span>`;
    }
    // Botón
    const btn = clone.querySelector('.add-to-cart');
    btn.setAttribute('data-id', p.id);
    btn.setAttribute('aria-label', `Añadir ${p.name} a la cesta`);
    $contenedor.append(clone);
  });
}
})();