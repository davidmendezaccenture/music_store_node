function normalizeText(text) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

(function () {
  let productos = [];
  let productosFiltrados = [];

  // --- INICIO CAMBIO PARA CATÁLOGO ÚNICO Y FAMILIA DINÁMICA ---
  // Variable global para la familia activa
  // Almacena la familia activa en localStorage para persistencia tras recarga
  // Si hay parámetro familia en la URL, úsalo como familia activa
function getFamiliaFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("familia");
}
let familiaActiva = getFamiliaFromURL() || "cuerda";
// Eliminado el uso de localStorage
/*   // Función para obtener familia desde la URL fea (?familia=...)
  function getFamiliaFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get("familia");
  }
  let familiaActiva =
    getFamiliaFromURL() ||
    localStorage.getItem("familiaCatalogoActiva") ||
    "cuerda";
  // Si viene por URL, actualiza el localStorage
  if (getFamiliaFromURL()) {
    localStorage.setItem("familiaCatalogoActiva", familiaActiva);
  } */

  // Diccionario de familias y sus categorías
const familias = {
  cuerda: [
    "acoustic-guitars",
    "electric-guitars",
    "classical-guitars",
    "basses"
  ],
  percusion: [
    "batería acústica",
    "batería electrónica",
    "platillos",
    "caja de madera",
    "pedal de bombo",
    "set de batería",
    "batería infantil",
    "bateria studio pro",
    "set de percusión",
    "caja",
    "batería jazz studio"
    // Añade aquí cualquier otra categoría real de percusión de tu JSON
  ],
  teclado: [
    "teclado digital",
    "sintetizador analógico",
    "workstation",
    "teclado compacto urbankeys",
    "sintetizador digital",
    "piano digital studio88",
    "teclado portátil easyplay",
    "teclado infantil funkkeys",
    "piano digital homeclassic",
    "keyboards",
    "teclado vintage",
    "sintetizador modular"
    // Añade aquí todas las categorías de teclado que existan en tu JSON
  ]
    // Puedes añadir más familias aquí
  };

  // Función para cambiar la familia activa (llámala desde la barra secundaria)
window.setFamilia = function (nuevaFamilia) {
  // Limpiar el parámetro category de la URL al cambiar de familia
  const params = new URLSearchParams(window.location.search);
  params.delete("category");
  params.delete("id");
  // Actualiza la URL sin recargar la página
  window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}${params.toString() ? '' : ''}`);

  familiaActiva = nuevaFamilia;
    

    // Cambiar la URL a formato feo: catalog.html?familia=[familia]
    const nuevaUrl = `catalog.html?familia=${nuevaFamilia}`;
    window.history.replaceState({}, '', nuevaUrl);

    // Quitar clase active de todos los enlaces en AMBAS barras
    document.querySelectorAll(".catalog-secondary-nav a").forEach((a) => {
      a.classList.remove("active");
      a.removeAttribute("aria-current");
    });

    // Añadir clase active al enlace correspondiente en la barra secundaria
    const enlaceSecundario = document.querySelector(
      `.catalog-secondary-nav a[onclick*="setFamilia('${nuevaFamilia}'"]`
    );
    if (enlaceSecundario) {
      enlaceSecundario.classList.add("active");
      enlaceSecundario.setAttribute("aria-current", "page");
    }

    // También activar el enlace correspondiente en el header si existe
    const enlaceHeader = document.querySelector(
      `.catalog-secondary-nav a[href*="familia=${nuevaFamilia}"]`
    );
    if (enlaceHeader) {
      enlaceHeader.classList.add("active");
      enlaceHeader.setAttribute("aria-current", "page");
    }

    if (typeof productos !== "undefined" && productos.length > 0) {
      poblarCategorias(productos);
      filtrarYMostrar();
    }
  };
  // --- FIN CAMBIO PARA CATÁLOGO ÚNICO Y FAMILIA DINÁMICA ---

  // 1. Cargar productos
  function cargarProductos() {
    $.getJSON("../assets/data/products.json", function (data) {
      productos = data;
      poblarCategorias(productos);

      // ANTES de mostrar, verificar parámetros URL
      const params = new URLSearchParams(window.location.search);
      const categoriaUrl = params.get("category");
      const searchUrl = params.get("search");

      // Si hay categoría, detectar y cambiar la familia PRIMERO
      if (categoriaUrl) {
        for (const [familia, cats] of Object.entries(familias)) {
          if (cats.includes(categoriaUrl)) {
            window.setFamilia(familia);
            break;
          }
        }
        $("#filtro-categoria").val(categoriaUrl);
      }

      if (searchUrl) {
        $("#search-input-guitar").val(searchUrl);
      }

      // Ahora sí filtrar y mostrar (ya con filtros aplicados)
      filtrarYMostrar();
      // Marcar la pestaña activa solo cuando los enlaces existen
      setTimeout(function () {
        document.querySelectorAll(".catalog-secondary-nav a").forEach((a) => {
          a.classList.remove("active");
          a.removeAttribute("aria-current");
        });
        const enlaceActivo = document.querySelector(
          `.catalog-secondary-nav a[onclick*="setFamilia('${familiaActiva}'"]`
        );
        if (enlaceActivo) {
          enlaceActivo.classList.add("active");
          enlaceActivo.setAttribute("aria-current", "page");
        }
      }, 0);
    });
  }

  // 2. Eventos con jQuery
  $(document).ready(function () {
    console.log("Catalog.js document ready ejecutado");
    console.log(
      "Elementos .catalog-secondary-nav encontrados:",
      document.querySelectorAll(".catalog-secondary-nav a").length
    );

    cargarProductos();

    // Eliminado el setTimeout de marcado de pestaña activa, ahora se hace tras cargarProductos

    $("#search-input-guitar").on("input", filtrarYMostrar);
    $("#filtro-categoria").on("change", filtrarYMostrar);
    $("#filtro-precio").on("change", filtrarYMostrar);
    $("#filtro-oferta").on("change", filtrarYMostrar);
    $("#ordenar-productos").on("change", filtrarYMostrar);
  });

  // 3. Poblar select de categorías dinámicamente
  function poblarCategorias(productos) {
    // --- INICIO CAMBIO: usar familia activa ---

    // const categoriasGuitarra = ['acoustic-guitars', 'electric-guitars', 'classical-guitars', 'basses'];
    const categoriasValidas = familias[familiaActiva] || [];

    // Extrae categorías únicas presentes en los productos
    const categorias = [
      ...new Set(
        productos
          .map((p) => p.category)
          .filter((cat) => cat && categoriasValidas.includes(cat))
      ),
    ];

    // Mapea a nombres legibles
    const nombres = {
      "acoustic-guitars": "Acústicas",
      "electric-guitars": "Eléctricas",
      "classical-guitars": "Clásicas",
      basses: "Bajos",
      "acoustic-drums": "Baterías acústicas",
      "electronic-drums": "Baterías electrónicas",
      "drum-accessories": "Accesorios",
      synths: "Sintetizadores",
      "digital-pianos": "Pianos digitales",
      keyboards: "Teclados",
    };
    let options = `<option value="">Todas las categorías</option>`;
    categorias.forEach((cat) => {
      options += `<option value="${cat}">${nombres[cat] || cat}</option>`;
    });
    $("#filtro-categoria").html(options);
  }

 // 4. Filtrar y mostrar productos
function filtrarYMostrar() {
  let query = ($("#search-input-guitar").val() || "").trim().toLowerCase();

  const params = new URLSearchParams(window.location.search);
  const idUrl = params.get("id");
  const categoriaUrl = params.get("category");

  if (idUrl) {
    // Si hay id en la URL, muestra solo ese producto
    productosFiltrados = productos.filter((p) => String(p.id) === String(idUrl));
  } else if (categoriaUrl) {
    // Si hay category en la URL, muestra productos de esa categoría
    productosFiltrados = productos.filter((p) => p.category === categoriaUrl);
  } else if (familiaActiva) {
    // Si no, filtra por familia
    productosFiltrados = productos.filter((p) => p.familia === familiaActiva);
  } else {
    // Fallback: categorías válidas por familia
    const categoriasValidas = familias[familiaActiva] || [];
    productosFiltrados = productos.filter((p) => categoriasValidas.includes(p.category));
  }

  // Filtro por búsqueda
  productosFiltrados = productosFiltrados.filter((p) =>
    normalizeText(p.name).includes(query)
  );

  // Filtro por categoría (select)
  let categoria = $("#filtro-categoria").val();
  if (categoria) {
    productosFiltrados = productosFiltrados.filter(
      (p) => p.category === categoria
    );
  }
  // Filtro por precio
  let precio = $("#filtro-precio").val();
  if (precio) {
    if (precio === "<300")
      productosFiltrados = productosFiltrados.filter((p) => p.price < 300);
    if (precio === "300-600")
      productosFiltrados = productosFiltrados.filter(
        (p) => p.price >= 300 && p.price <= 600
      );
    if (precio === ">600")
      productosFiltrados = productosFiltrados.filter((p) => p.price > 600);
  }
  // Filtro por oferta
  if ($("#filtro-oferta").is(":checked")) {
    productosFiltrados = productosFiltrados.filter(
      (p) => p.offerPrice < p.price
    );
  }

  // Ordenar
  let orden = $("#ordenar-productos").val();
  if (orden) {
    if (orden === "precio-asc")
      productosFiltrados.sort((a, b) => a.price - b.price);
    if (orden === "precio-desc")
      productosFiltrados.sort((a, b) => b.price - a.price);
    if (orden === "oferta")
      productosFiltrados.sort(
        (a, b) => (a.offerPrice || a.price) - (b.offerPrice || b.price)
      );
  }
  mostrarProductos(productosFiltrados);
}

  // 5. Mostrar productos
  function mostrarProductos(lista) {
    let $contenedor = $("#products-list");
    let $contador = $("#result-count");
    if ($contador.length)
      $contador.text(`${lista.length} resultados encontrados`);
    if (!lista.length) {
      $contenedor.html("<p>No se encontraron productos.</p>");
      return;
    }
    $contenedor.html(
      lista
        .map(
          (p) => `
        <div class="col-12 col-md-6 col-lg-3 d-flex mb-3">
          <div class="card flex-fill h-100">
            <div class="card-img-top-wrapper">
              <img src="${p.image}" class="card-img-top" alt="${p.name}" />
            </div>
            <div class="card-body d-flex flex-column">
              <h2 class="h5 card-title fw-bold">${p.name}</h2>
              <p class="card-text">${p.description}</p>
              <div class="mt-auto d-flex flex-column gap-2">
                <div class="d-block">
                  <p class="mb-2 mt-2">
                    ${p.offerPrice < p.price
              ? `<span class=\"text-decoration-line-through\">${p.price} €</span>
                         <span class=\"price-offer ms-2\">${p.offerPrice} €</span>`
              : `<span class=\"fw-bold\">${p.price} €</span>`
            }
                  </p>
                </div>
                <div class="d-flex justify-content-between gap-2">
                  <button class="btn btn-outline-secondary btn-detail" onclick="window.location.href='/pages/detail-product.html?id=${p.id
            }'" aria-label="Ver detalle">
                    ver detalle
                  </button>
                  <button class="btn btn-primary add-to-cart ms-auto btn-cart position-relative" data-id="${p.id
            }" aria-label="Añadir ${p.name} a la cesta">
                    <i class="bi bi-cart"></i>
                    <span class="cart-plus">+</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      `
        )
        .join("")
    );
  }
})();
// Guardar la última página de compras en sessionStorage
sessionStorage.setItem('lastShoppingPage', window.location.href);