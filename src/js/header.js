let allProducts = [];

$(document).ready(function () {
  // Cargar productos globales solo una vez
  $.getJSON("../assets/data/products.json", function (data) {
    allProducts = data;
  });

  // Buscar en todos los productos al escribir
  $(document).on("input", "#search-input-global", function () {
    const query = $(this).val().trim().toLowerCase();
    if (query.length > 1) {
      const queryNorm = normalizeText(query);
      const $input = $(this);
      const offset = $input.offset();
      const width = $input.outerWidth();

      $("#globalSearchDropdown").css({
        top: offset.top + $input.outerHeight(),
        left: offset.left,
        width: width,
        display: "block",
      });

      let resultados = allProducts.filter(
        (p) =>
          normalizeText(p.name).includes(query) ||
          (p.category && normalizeText(p.category).includes(query))
      );
      renderGlobalResults(resultados, query);
    } else {
      $("#globalSearchDropdown").hide();
      $("#global-search-results").html("");
    }
  });

  // Cerrar el dropdown al hacer click fuera
  $(document).on("mousedown", function (e) {
    if (
      !$(e.target).closest("#globalSearchDropdown, #search-input-global").length
    ) {
      $("#globalSearchDropdown").hide();
    }
  });
});

// Renderizar resultados en texto tipo lista
function renderGlobalResults(lista, query) {
  const $res = $("#global-search-results");
  if (query && lista.length > 0) {
    $res.html(`
      <ul class="list-group list-group-flush">
        ${lista
          .map(
            (p) => `
          <li class="list-group-item">
            <a href="/pages/catalog.html?category=${encodeURIComponent(
              p.category || ""
            )}" class="text-decoration-none global-search-link">
              <strong>${highlight(p.name, query)}</strong>
              <span class="text-muted small ms-2">${p.category || ""}</span>
            </a>
          </li>
        `
          )
          .join("")}
      </ul>
    `);
  } else if (query) {
    $res.html(
      '<div class="text-muted px-3 py-2">No se encontraron productos.</div>'
    );
  } else {
    $res.html("");
  }

  // Limpiar input y ocultar modal al hacer click en un resultado
  $(".global-search-link").on("click", function () {
    $("#search-input-global").val("");
    $("#globalSearchDropdown").hide();
  });
}

function normalizeText(text) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function highlight(text, query) {
  if (!query) return text;
  // Normaliza ambos
  const normText = text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  const normQuery = query
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  const idx = normText.indexOf(normQuery);
  if (idx === -1) return text;
  // Resalta en el texto original la parte correspondiente
  const end = idx + normQuery.length;
  return (
    text.slice(0, idx) +
    "<mark>" +
    text.slice(idx, end) +
    "</mark>" +
    text.slice(end)
  );
}
