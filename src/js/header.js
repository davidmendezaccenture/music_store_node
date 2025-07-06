// --- Buscador global solo por páginas principales (cuerda, percusión, teclado, dj) ---

// Puedes dejar esto si lo usas en otras partes, pero ya no se usa para el buscador global
let allProducts = [];

// Define las páginas principales permitidas
const allowedCategories = [
  {
    name: "cuerda",
    url: "/pages/catalog.html?familia=cuerda",
    keywords: ["guitarra", "guitarras", "bajo", "bajos", "acústica", "eléctrica", "clasica", "clásica", "bass", "string"]
  },
  {
    name: "percusión",
    url: "/pages/catalog.html?familia=percusion",
    keywords: ["batería", "baterias", "bateria", "percusion", "percusión", "cajón", "cajon", "conga", "congas", "drum", "drums"]
  },
  {
    name: "teclado",
    url: "/pages/catalog.html?familia=teclado",
    keywords: ["piano", "teclado", "sintetizador", "sinte", "keyboard", "synth"]
  },
  {
    name: "dj",
    url: "/pages/catalog.html?familia=dj",
    keywords: ["dj", "controladora", "mezclador", "turntable", "vinilo", "vinilos", "plato", "platos"]
  }
];

$(document).ready(function () {
  // Si necesitas cargar productos para otras funciones, puedes dejar esto
  $.getJSON("../assets/data/products.json", function (data) {
    allProducts = data;
  });

  // Buscar solo en las categorías permitidas al escribir
  $(document).on("input", "#search-input-global", function () {
    const query = $(this).val().trim();
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

      // Filtrar solo las categorías permitidas (nombre o keywords)
      const matchedCategories = allowedCategories.filter(cat =>
        normalizeText(cat.name).includes(queryNorm) ||
        (cat.keywords && cat.keywords.some(kw => normalizeText(kw).includes(queryNorm)))
      );
      renderGlobalCategoryResults(matchedCategories, query);
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

// Renderizar resultados SOLO de categorías permitidas
function renderGlobalCategoryResults(categories, query) {
  const $res = $("#global-search-results");
  if (query && categories.length > 0) {
    $res.html(`
      <ul class="list-group list-group-flush">
        ${categories
          .map(
            (cat) => `
          <li class="list-group-item">
            <a href="${cat.url}" class="text-decoration-none global-search-link" tabindex="0">
              <strong>${highlight(cat.name, query)}</strong>
            </a>
          </li>
        `
          )
          .join("")}
      </ul>
    `);
    // Mover el foco al primer resultado
    setTimeout(() => {
      $(".global-search-link").first().focus();
    }, 0);
  } else if (query) {
    $res.html(
      '<div class="text-muted px-3 py-2">No se encontraron categorías.</div>'
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

// Navegación con flechas arriba/abajo en los resultados del buscador global
$(document).on("keydown", "#search-input-global, .global-search-link", function (e) {
  const $links = $(".global-search-link");
  let idx = $links.index(document.activeElement);

  if (e.key === "ArrowDown") {
    e.preventDefault();
    if (idx === -1) {
      $links.first().focus();
    } else if (idx < $links.length - 1) {
      $links.eq(idx + 1).focus();
    }
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    if (idx > 0) {
      $links.eq(idx - 1).focus();
    } else {
      $("#search-input-global").focus();
    }
  } else if (e.key === "Enter" && $(document.activeElement).hasClass("global-search-link")) {
    window.location.href = $(document.activeElement).attr("href");
  }
});

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

// Prevenir submit del formulario
$(document).on("submit", ".buscador-form", function (e) {
  e.preventDefault();
});

// Manejar Enter en el input de búsqueda SOLO para categorías permitidas y keywords
$(document).on("keydown", "#search-input-global", function (e) {
  if (e.key === "Enter") {
    e.preventDefault();
    const query = $(this).val().trim();
    if (query.length > 1) {
      const queryNorm = normalizeText(query);
      const matchedCategories = allowedCategories.filter(cat =>
        normalizeText(cat.name).includes(queryNorm) ||
        (cat.keywords && cat.keywords.some(kw => normalizeText(kw).includes(queryNorm)))
      );
      if (matchedCategories.length > 0) {
        window.location.href = matchedCategories[0].url;
      }
    }
  }
});