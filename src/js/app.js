// app.js - Punto de entrada de la aplicación

// Espera a que el DOM esté listo
$(document).ready(function () {
  let headerLoaded = false;
  let modalLoaded = false;

  // Carga dinámica del header y asigna eventos dependientes
  $("#header").load("/pages/header.html", function () {
    console.log("✅ Header cargado");
    headerLoaded = true;

    // Asigna el evento de dark mode después de cargar el header
    $("#darkModeToggle").on("click", function () {
      $("body").toggleClass("dark-mode");
      var isDark = $("body").hasClass("dark-mode");
      $(this).attr("aria-pressed", isDark);

      // Cambiar el icono según el estado
      const $icon = $(this).find("i");
      if (isDark) {
        // Modo oscuro activado - mostrar icono de sol/bombilla
        $icon.removeClass("bi-moon").addClass("bi-sun");
        localStorage.setItem("darkMode", "enabled");
      } else {
        // Modo claro - mostrar icono de luna
        $icon.removeClass("bi-sun").addClass("bi-moon");
        localStorage.setItem("darkMode", "disabled");
      }
    });

    // Estado inicial del botón
    if (localStorage.getItem("darkMode") === "enabled") {
      $("body").addClass("dark-mode");
      $("#darkModeToggle").attr("aria-pressed", "true");
      // Asegurar que el icono sea correcto al cargar
      $("#darkModeToggle i").removeClass("bi-moon").addClass("bi-sun");
    } else {
      $("#darkModeToggle").attr("aria-pressed", "false");
      // Asegurar que el icono sea correcto al cargar
      $("#darkModeToggle i").removeClass("bi-sun").addClass("bi-moon");
    }

    // --- GESTIÓN DE ACTIVE EN NAVBAR ---
    $(".navbar-nav .nav-link").removeClass("active");
    $("#carritoButton").removeClass("active"); // Quitar active del carrito
    var path = window.location.pathname;
    if (path.includes("index.html") || path === "/" || path === "/pages/") {
      $('.navbar-nav .nav-link[href$="index.html"]').addClass("active");
    } else if (path.includes("guitar.html")) {
      $('.navbar-nav .nav-link[href$="guitar.html"]').addClass("active");
    } else if (path.includes("contact.html")) {
      $('.navbar-nav .nav-link[href$="contact.html"]').addClass("active");
    } else if (path.includes("services.html")) {
      // href="#" asique buscamos por texto directo
      $('.navbar-nav .nav-link:contains("Servicios")').addClass("active");
    } else if (path.includes("cart.html")) {
      $("#carritoButton").addClass("active"); // Activar carrito
    } else if (path.includes("sobre") || path.includes("about")) {
      $('.navbar-nav .nav-link:contains("Sobre nosotros")').addClass("active");
    } else if (path.includes("faq.html")) {
      // Por si se mete faq en la navbar
      // $('.navbar-nav .nav-link[href$="faq.html"]').addClass("active");
    }

    // --- GESTIÓN DE ACTIVE EN OFFCANVAS ---
    $(".offcanvas-body .list-group-item").removeClass("active");
    if (path.includes("services.html")) {
      $('.offcanvas-body .list-group-item[href$="services.html"]').addClass(
        "active"
      );
    } else if (path.includes("contact.html")) {
      $('.offcanvas-body .list-group-item[href$="contact.html"]').addClass(
        "active"
      );
    } else if (path.includes("newsletter.html")) {
      $('.offcanvas-body .list-group-item[href$="newsletter.html"]').addClass(
        "active"
      );
    } else if (path.includes("media.html")) {
      $('.offcanvas-body .list-group-item[href$="media.html"]').addClass(
        "active"
      );
    } else if (path.includes("faq.html")) {
      $('.offcanvas-body .list-group-item[href$="faq.html"]').addClass(
        "active"
      );
    }

    //----------------------Test mover menu hamburguesaa ------------------//
    $(".navbar-toggler").on("click", function () {
      // Usa los eventos nativos de Bootstrap en lugar de setTimeout
      $("#navbarSupportedContent").on(
        "shown.bs.collapse hidden.bs.collapse",
        function () {
          const isOpen = $(this).hasClass("show");
          console.log("Menú abierto:", isOpen);

          // Altura del menú desplegable
          const menuHeight = isOpen ? $(this).outerHeight() : 0;
          console.log("Altura del menú:", menuHeight);

          // Calcular el margen total
          if (isOpen) {
            // Si el menú está abierto, añadir un atributo data que usaremos en el CSS
            $("body").attr("data-menu-open", "true");
            $(".catalog-secondary-nav").attr(
              "style",
              "margin-top: " + menuHeight + "px !important"
            );
            const windowWidth = $(window).width();
            if (windowWidth <= 770) {
              // (media  770px)
              $("main").attr(
                "style",
                "margin-top: " + (menuHeight + 190) + "px !important"
              );
              $("main.c-main").attr(
                "style",
                "margin-top: " + (menuHeight + 195) + "px !important"
              );
            } else {
              // ( Media 991.98px)
              $("main").attr(
                "style",
                "margin-top: " + (menuHeight + 190) + "px !important"
              );
              $("main.c-main").attr(
                "style",
                "margin-top: " + (menuHeight + 195) + "px !important"
              );
            }
          } else {
            // Si está cerrado, quitar el atributo
            $("body").removeAttr("data-menu-open");
            // Remover el estilo de margin-top de la navbar secundaria
            $(".catalog-secondary-nav").removeAttr("style");
            // Remover los estilos inline para volver a los valores CSS
            $("main, main.c-main").removeAttr("style");
          }
        }
      );

      // Disparar manualmente la primera vez
      setTimeout(function () {
        const isOpen = $("#navbarSupportedContent").hasClass("show");
        if (isOpen) {
          $("#navbarSupportedContent").trigger("shown.bs.collapse");
        } else {
          $("#navbarSupportedContent").trigger("hidden.bs.collapse");
        }
      }, 100);
    });
    //----------------------Transicion suave entre páginas ------------------//
    // --- Animaciones de entrada suaves del header y main tras carga ---
    const header = document.querySelector("#header");
    const main = document.querySelector("main");

    if (header) {
      header.classList.add("slide-in-header");
      setTimeout(() => {
        header.classList.remove("slide-in-header");
      }, 450);
    }

    if (main) {
      main.classList.add("slide-in-main");
      setTimeout(() => {
        main.classList.remove("slide-in-main");
      }, 400);
    }

    // Verificar si ya podemos inicializar el login
    checkAndInitLogin();
  });

  initNavbar();
  initNewsletterForm();
  initFeedbackSection();
  initFooter();

  // ...carga dinámica del modal de login...
  // Cuando el modal esté cargado, asigna el evento al botón de login
  if ($("#loginModal").length === 0) {
    $.get("/pages/login-modal.html", function (data) {
      $("body").append(data);
      console.log("✅ Login cargado dinámicamente");
      modalLoaded = true;
      // Verificar si ya podemos inicializar el login
      checkAndInitLogin();
    });
  } else {
    console.log("✅ Login ya existe");
    modalLoaded = true;
    // Verificar si ya podemos inicializar el login
    checkAndInitLogin();
  }

  // ...carga dinámica del modal de logout...
  // Cargar modal de confirmación de logout
  if ($("#logoutConfirmModal").length === 0) {
    $.get("/pages/logout-confirm-modal.html", function (data) {
      $("body").append(data);
      console.log("✅ Logout confirm modal cargado dinámicamente");
      // Inicializar eventos del modal de logout
      initLogoutConfirmModal();
    });
  } else {
    console.log("✅ Logout confirm modal ya existe");
    // Inicializar eventos del modal de logout
    initLogoutConfirmModal();
  }

  function checkAndInitLogin() {
    console.log("🔍 Verificando condiciones para inicializar login:", {
      headerLoaded,
      modalLoaded,
      modalExists: $("#loginModal").length > 0,
    });

    if (headerLoaded && (modalLoaded || $("#loginModal").length > 0)) {
      console.log("🚀 Inicializando login - Todo listo");
      initLoginModal();
    } else {
      console.log("⏳ Esperando carga completa...", {
        headerLoaded,
        modalLoaded,
      });
    }
  }

  // --- Lógica para copiar el código promocional ---
  $("#copyPromoBtn").on("click", function () {
    const code = $("#promoCodeText").text();
    navigator.clipboard.writeText(code).then(function () {
      // Mostrar mensaje de copiado
      const $msg = $("#promoCopiedMsg");
      $msg.removeClass("d-none");
      setTimeout(() => $msg.addClass("d-none"), 1500);
    });
  });

  /* // Cargar el chatbot dinámicamente al final del body
  $("body").append('<div id="chatbot-placeholder"></div>');
  $("#chatbot-placeholder").load("/pages/chatbot.html", function () {
    if (typeof initChatbot === "function") {
      initChatbot();
    }
  }); */
});

/* Funcion on click para no repetir código */
function initLoginModal() {
  console.log("🔍 Iniciando initLoginModal...");

  // Verificar que los elementos existen
  const $loginButtons = $("#loginButton, #loginButtonFooter");
  console.log("📊 Botones de login encontrados:", $loginButtons.length);

  if ($loginButtons.length === 0) {
    console.warn("⚠️ No se encontraron botones de login");
    return;
  }

  // Remover eventos anteriores para evitar duplicados
  $loginButtons.off("click.loginModal");

  $loginButtons.on("click.loginModal", function (e) {
    console.log("🖱️ Click en botón de login detectado");

    const isUserLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    console.log("👤 Usuario logueado:", isUserLoggedIn);

    if (!isUserLoggedIn) {
      e.preventDefault();

      const modalElement = document.getElementById("loginModal");
      console.log("🔍 Modal encontrado:", !!modalElement);

      if (modalElement) {
        var modal = new bootstrap.Modal(modalElement);
        modal.show();
        console.log("✅ Modal mostrado");
      } else {
        console.error("❌ Modal no encontrado");
      }
    }
    // Si está logueado, no hace nada (permite que funcionen los clicks internos como logout)
  });

  console.log("✅ Eventos de login asignados correctamente");
}

/* Función para modal de confirmación de logout */
function initLogoutConfirmModal() {
  console.log("🔍 Iniciando initLogoutConfirmModal...");

  // Event listener para el botón de confirmación dentro del modal
  $("#confirmLogoutBtn").off("click.logoutConfirm").on("click.logoutConfirm", function () {
    console.log("✅ Logout confirmado - ejecutando logout");

    // Cerrar el modal primero
    const modal = bootstrap.Modal.getInstance(document.getElementById('logoutConfirmModal'));
    if (modal) {
      modal.hide();
    }

    // Ejecutar logout real
    if (typeof logout === "function") {
      logout();
    }
  });

  console.log("✅ Eventos de logout confirm modal asignados correctamente");
}

function initNavbar() {
  // Lógica de la navbar
}

function initNewsletterForm() {
  // Lógica del formulario de newsletter
}

function initFeedbackSection() {
  // Lógica de la sección de feedback
}

function initFooter() {
  // Lógica del footer
  $("#footer").load("/pages/footer.html");
}
// Aquí va la lógica del carrusel de Productos en el Main
// function initCarousel() {
//   var images = [
//     "/assets/images/bg-carrusel-1.png",
//     "/assets/images/bg-carrusel-2.png",
//     "/assets/images/bg-carrusel-3.png",
//     "/assets/images/bg-carrusel-4.png",
//   ];
//   var current = 0;

// Generar indicadores dinámicamente
// var $indicatorsContainer = $(".carousel-indicators-custom");
// $indicatorsContainer.empty(); // Limpia los indicadores existentes
// images.forEach(function (_, idx) {
//   $indicatorsContainer.append(
//     `<span class="indicator${
//       idx === 0 ? " active" : ""
//     }" data-index="${idx}" role="tab" aria-selected="${
//       idx === 0
//     }" tabindex="0" aria-label="Imagen ${idx + 1}"></span>`
//   );
// });

// function showImage(index) {
//   $(".img-carrousel").attr("src", images[index]);
//   $(".indicator")
//     .removeClass("active")
//     .attr("aria-selected", "false")
//     .attr("tabindex", "0");
//   $(".indicator")
//     .eq(index)
//     .addClass("active")
//     .attr("aria-selected", "true")
//     .attr("tabindex", "0");
// }

// $(".product-carousel-arrow.right").on("click", function () {
//   current = (current + 1) % images.length;
//   showImage(current);
// });

// $(".product-carousel-arrow.left").on("click", function () {
//   current = (current - 1 + images.length) % images.length;
//   showImage(current);
// });

// Lógica para los indicadores
// $indicatorsContainer.on("click", ".indicator", function () {
//   var index = $(this).data("index");
//   current = index;
//   showImage(current);
// });

// Inicializa el carrusel en la primera imagen
// showImage(current);

// Lógica para el carrusel de opiniones de clientes
$(function () {
  // Número de cards a mostrar a la vez
  // Suponiendo 3 visibles
  const visibleCards = 3;
  const $row = $(".opinion-carousel-row");
  const $cards = $(".opinion-carousel-card");
  const totalCards = $cards.length;
  let currentStart = 0;

  function updateCarousel() {
    const cardWidth = 200 + 12; // ancho card + gap
    const offset = currentStart * cardWidth;
    $row.css("transform", `translateX(-${offset}px)`);
    $(".opinion-carousel-arrow.left").prop("disabled", currentStart === 0);
    $(".opinion-carousel-arrow.right").prop(
      "disabled",
      currentStart >= totalCards - visibleCards
    );
  }

  $(".opinion-carousel-arrow.left").click(function () {
    if (currentStart > 0) {
      currentStart--;
      updateCarousel();
    }
  });

  $(".opinion-carousel-arrow.right").click(function () {
    if (currentStart < totalCards - visibleCards) {
      currentStart++;
      updateCarousel();
    }
  });

  updateCarousel();

  // Función para cargar el contenido de la navegación de productos
  // filepath: c:\Users\Usuaria\OneDrive\Escritorio\FRONTEND ACCENTURE\musicstore\src\js\app.js
  document.addEventListener("DOMContentLoaded", function () {
    const placeholder = document.getElementById("nav-secundaria-placeholder");
    if (placeholder) {
      fetch("../pages/nav-products.html")
        .then((res) => res.text())
        .then((html) => {
          placeholder.innerHTML = html;
        });
    }
  });
}); // <-- Cierra la función jQuery $(function () { ... )
