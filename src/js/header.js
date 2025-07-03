let allProducts = [];

$(document).ready(function () {
  // Cargar productos globales solo una vez
  $.getJSON("../assets/data/products.json", function (data) {
    allProducts = data;
  });

  // Mostrar el dropdown al hacer click en el input
  $(document).on("click", "#search-input-global", function (e) {
    console.log("Evento input disparado");
    console.log("allProducts:", allProducts);
    e.preventDefault();
    const $input = $(this);
    const offset = $input.offset();
    const width = $input.outerWidth();

    $("#globalSearchDropdown").css({
      top: offset.top + $input.outerHeight(),
      left: offset.left,
      width: width,
      display: "block",
    });

    $("#global-search-results").html("");
  });

  // Cerrar el dropdown al hacer click fuera
  $(document).on("mousedown", function (e) {
    if (
      !$(e.target).closest("#globalSearchDropdown, #search-input-global").length
    ) {
      $("#globalSearchDropdown").hide();
    }
  });
  console.log("Buscador:", $("#search-input-global").length);
  // Buscar en todos los productos al escribir
  $("#search-input-global").on("input", function () {
    console.log("Evento input disparado");
    $("#globalSearchDropdown").show();
    const query = $(this).val().trim().toLowerCase();
    let resultados = [];
    if (query.length > 1) {
      const queryNorm = normalizeText(query);
      resultados = allProducts.filter(
        (p) =>
          normalizeText(p.name).includes(queryNorm) ||
          (p.category && normalizeText(p.category).includes(queryNorm))
      );
    }
    renderGlobalResults(resultados, query);
  });
});

// Renderizar resultados en texto tipo lista
function renderGlobalResults(lista, query) {
  console.log("Renderizando resultados:", lista, query);
  const $res = $("#global-search-results");
  if (!query) {
    $res.html("");
    return;
  }
  if (lista.length === 0) {
    $res.html(
      '<div class="text-center py-3 not-found-message">No se encontraron resultados.</div>'
    );
    return;
  }
  $res.html(`
    <ul class="list-group list-group-flush">
      ${lista
        .map(
          (p) => `
        <li class="list-group-item">
          <a href="/pages/catalog.html?category=${encodeURIComponent(
            p.category || ""
          )}" class="text-decoration-none">
            <strong>${highlight(p.name, query)}</strong>
            <span class="text-muted small ms-2">${p.category || ""}</span>
          </a>
        </li>
      `
        )
        .join("")}
    </ul>
  `);
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
