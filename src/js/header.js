let allProducts = [];

$(document).ready(function () {
  // Cargar productos globales solo una vez
  $.getJSON('../assets/data/products.json', function (data) {
    allProducts = data;
  });

  // Mostrar el dropdown al hacer click en el input
$(document).on('click', '#search-input-global', function (e) {
  e.preventDefault();
  const $input = $(this);
  const offset = $input.offset();
  const width = $input.outerWidth();
  const height = $input.outerHeight();

  $('#globalSearchDropdown').css({
    top: offset.top,
    left: offset.left,
    width: width,
    display: 'block'
  });
  $('#global-search-input').val('').focus();
  $('#global-search-results').empty();
});

  // Cerrar el dropdown al hacer click fuera
  $(document).on('mousedown', function(e) {
    if (!$(e.target).closest('#globalSearchDropdown, #search-input-global').length) {
      $('#globalSearchDropdown').hide();
    }
  });

  // Buscar en todos los productos al escribir
  $('#global-search-input').on('input', function () {
    const query = $(this).val().trim().toLowerCase();
    let resultados = [];
    if (query.length > 1) {
      resultados = allProducts.filter(p =>
        p.name.toLowerCase().includes(query) ||
        (p.category && p.category.toLowerCase().includes(query))
      );
    }
    renderGlobalResults(resultados, query);
  });
});

// Renderizar resultados en texto tipo lista
function renderGlobalResults(lista, query) {
    const $res = $('#global-search-results');
  if (!query || lista.length === 0) {
    $res.html('<div class="text-center py-3 not-found-message">No se encontraron resultados.</div>');
    return;
  }
  $res.html(`
    <ul class="list-group list-group-flush">
      ${lista.map(p => `
        <li class="list-group-item">
          <a href="/pages/catalog.html?category=${encodeURIComponent(p.category || '')}" class="text-decoration-none">
            <strong>${highlight(p.name, query)}</strong>
            <span class="text-muted small ms-2">${p.category || ''}</span>
          </a>
        </li>
      `).join('')}
    </ul>
  `);
}

// Resalta el texto buscado
function highlight(text, query) {
  const re = new RegExp(`(${query})`, 'gi');
  return text.replace(re, '<mark>$1</mark>');
}