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
  // Cargar productos desde el JSON (si es necesario en otras partes)
  $.getJSON("../assets/data/products.json", function (data) {
    allProducts = data;
  });


  // Buscar solo en las categorías permitidas al escribir
  $(document).on("input", "#search-input-global", function () {
    const query = $(this).val().trim();
    const $form = $(this).closest('.buscador-form');
    if (query.length > 0) {
      $form.addClass('has-text');
    } else {
      $form.removeClass('has-text');
    }
    // ...resto del código existente...
    console.log("allProducts:", allProducts);
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

      // Filtrar productos
      const matchedProducts = allProducts.filter(prod =>
        normalizeText(prod.name).includes(queryNorm)
      ).map(prod => ({
        name: prod.name,
        url: `/pages/catalog.html?familia=${encodeURIComponent(prod.familia || '')}&category=${encodeURIComponent(prod.category || '')}&id=${prod.id}`
      }));

      // Filtrar categorías permitidas
      const matchedCategories = allowedCategories.filter(cat =>
        normalizeText(cat.name).includes(queryNorm) ||
        (cat.keywords && cat.keywords.some(kw => normalizeText(kw).includes(queryNorm)))
      );

      renderGlobalSearchResults(matchedProducts, matchedCategories, query);

      // Cambiar color de la lupa según si hay sugerencias válidas
      const $lupa = $(".lupa-inside-input");
      if (matchedProducts.length > 0 || matchedCategories.length > 0) {
        $lupa.addClass("has-suggestions");
      } else {
        $lupa.removeClass("has-suggestions");
      }
    } else {
      $("#globalSearchDropdown").hide();
      $("#global-search-results").html("");
      // Quitar clase de sugerencias cuando no hay texto
      $(".lupa-inside-input").removeClass("has-suggestions");
    }
  });

  // Mantener expandido si hay texto, aunque pierda el foco
  $(document).on("blur", "#search-input-global", function () {
    const $form = $(this).closest('.buscador-form');
    const query = $(this).val().trim();
    // Solo quitar la clase si está vacío
    if (query.length === 0) {
      $form.removeClass('has-text');
    }
    // Si hay texto, no se quita la clase y se mantiene expandido
  });


  // Asocia aquí el evento de búsqueda global
  // $(document).on("input", "#search-input-global", function () {
  //   $("#globalSearchDropdown").show();
  //   const query = $(this).val().trim().toLowerCase();
  //   let resultados = [];
  //   if (query.length > 1) {
  //     const queryNorm = normalizeText(query);
  //     resultados = allProducts.filter(
  //       (p) =>
  //         normalizeText(p.name).includes(query) ||
  //         (p.category && normalizeText(p.category).includes(query))
  //     );
  //   }
  //   renderGlobalSearchResults(resultados, [], query);
  // });

  // Cerrar el dropdown al hacer click fuera
  $(document).on("mousedown", function (e) {
    if (
      !$(e.target).closest("#globalSearchDropdown, #search-input-global").length
    ) {
      $("#globalSearchDropdown").hide();
    }
  });


  // Renderizar resultados SOLO de categorías permitidas
  function renderGlobalSearchResults(matchedProducts, matchedCategories, query) {
    const $res = $("#global-search-results");
    let html = "";

    // Categorías
    if (query && matchedCategories.length > 0) {
      html += `<div class="text-uppercase small text-muted mb-2">CATEGORÍAS</div>
      <ul class="list-group list-group-flush">
        ${matchedCategories.map(cat => `
          <li class="list-group-item">
            <a href="${cat.url}" class="text-decoration-none global-search-link" tabindex="0">
              <strong>${highlight(cat.name, query)}</strong>
            </a>
          </li>
        `).join("")}
      </ul>`;
    }

    // Línea de separación si hay productos y categorías
    if (matchedProducts.length > 0 && matchedCategories.length > 0) {
      html += `<hr class="my-2">`;
    }

    // Productos
    if (query && matchedProducts.length > 0) {
      html += `<div class="text-uppercase small text-muted mb-2">PRODUCTOS</div>
      <ul class="list-group list-group-flush mb-3">
        ${matchedProducts.map(prod => `
          <li class="list-group-item">
            <a href="${prod.url}" class="text-decoration-none global-search-link" tabindex="0">
              ${highlight(prod.name, query)}
            </a>
          </li>
        `).join("")}
      </ul>`;
    }

    if (!html && query) {
      html = '<div class="text-muted px-3 py-2">No se encontraron resultados.</div>';
    }

    $res.html(html);

    // Limpiar input y ocultar modal al hacer click en un resultado
    $(".global-search-link").on("click", function () {
      $("#search-input-global").val("");
      $("#globalSearchDropdown").hide();
    });
  }

  // Navegación con flechas arriba/abajo en los resultados del buscador global y seleccion con Enter
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
    } else if (e.key === "Enter") {
      e.preventDefault();
      if ($(document.activeElement).hasClass("global-search-link")) {
        // Si está sobre un resultado, navega a su enlace
        window.location.href = $(document.activeElement).attr("href");
      } else if ($(document.activeElement).is("#search-input-global")) {
        // Si está en el input, navega a la primera coincidencia si existe
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
    }
  });

  $(document).on("keydown", "#search-input-global", function (e) {
    if (e.key === "Tab" && !e.shiftKey) {
      const $links = $(".global-search-link");
      if ($links.length > 0) {
        e.preventDefault();
        $links.first().focus();
      }
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

  // Hacer que hacer clic en la lupa sea equivalente a pulsar intro
  $(document).on("click", ".lupa-inside-input", function (e) {
    e.preventDefault();
    const $input = $(this).closest('.buscador-input-wrapper').find('#search-input-global');
    if ($input.length) {
      const query = $input.val().trim();
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

}); 
