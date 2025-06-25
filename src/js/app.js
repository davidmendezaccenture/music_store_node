// app.js - Punto de entrada de la aplicación

// Espera a que el DOM esté listo
$(document).ready(function () {
  // Carga dinámica del header y asigna eventos dependientes
  $("#header").load("/pages/header.html", function () {
    // Asigna el evento de dark mode después de cargar el header
    $("#darkModeToggle").on("click", function () {
      $("body").toggleClass("dark-mode");
      var isDark = $("body").hasClass("dark-mode");
      $(this).attr("aria-pressed", isDark);
      // Guardar preferencia
      if (isDark) {
        localStorage.setItem("darkMode", "enabled");
      } else {
        localStorage.setItem("darkMode", "disabled");
      }
    });
    // Estado inicial del botón
    if (localStorage.getItem("darkMode") === "enabled") {
      $("body").addClass("dark-mode");
      $("#darkModeToggle").attr("aria-pressed", "true");
    } else {
      $("#darkModeToggle").attr("aria-pressed", "false");
    }

    // --- GESTIÓN DE ACTIVE EN NAVBAR ---
    $(".navbar-nav .nav-link").removeClass("active");
    var path = window.location.pathname;
    if (path.includes("index.html") || path === "/" || path === "/pages/") {
      $('.navbar-nav .nav-link[href$="index.html"]').addClass("active");
    } else if (path.includes("guitar.html")) {
      $('.navbar-nav .nav-link[href$="guitar.html"]').addClass("active");
    } else if (path.includes("contact.html")) {
      $('.navbar-nav .nav-link[href$="contact.html"]').addClass("active");
    } else if (path.includes("sobre") || path.includes("about")) {
      $('.navbar-nav .nav-link:contains("Sobre nosotros")').addClass("active");
    }
  });

  initNavbar();
  initNewsletterForm();
  initFeedbackSection();
  initFooter();
  initCarousel(); // Inicializa el carrusel de imágenes

  // ...carga dinámica del modal...
  // Cuando el modal esté cargado, asigna el evento al botón de login
  if ($("#loginModal").length === 0) {
    $.get("/pages/login-modal.html", function (data) {
      $("body").append(data);
      // Asigna el evento después de cargar el modal
      initLoginModal();
    });
  } else {
    // Si el modal ya está presente, asigna el evento directamente
    initLoginModal();
  }
});

/* Funcion on click para no repetir código */
function initLoginModal() {
  $("#loginButton").on("click", function (e) {
    e.preventDefault();
    var modal = new bootstrap.Modal(document.getElementById("loginModal"));
    modal.show();
  });
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
// Aquí va la lógica del carrusel
function initCarousel() {
  var images = [
    "/assets/images/guitar1.png",
    "/assets/images/drum2.png",
    "/assets/images/amp1.png",
    "/assets/images/bass1.png",
  ];
  var current = 0;

  // Generar indicadores dinámicamente
  var $indicatorsContainer = $(".carousel-indicators-custom");
  $indicatorsContainer.empty(); // Limpia los indicadores existentes
  images.forEach(function (_, idx) {
    $indicatorsContainer.append(
      `<span class="indicator${
        idx === 0 ? " active" : ""
      }" data-index="${idx}" role="tab" aria-selected="${
        idx === 0
      }" tabindex="0" aria-label="Imagen ${idx + 1}"></span>`
    );
  });

  function showImage(index) {
    $(".img-carrousel").attr("src", images[index]);
    $(".indicator")
      .removeClass("active")
      .attr("aria-selected", "false")
      .attr("tabindex", "0");
    $(".indicator")
      .eq(index)
      .addClass("active")
      .attr("aria-selected", "true")
      .attr("tabindex", "0");
  }

  $(".product-carousel-arrow.right").on("click", function () {
    current = (current + 1) % images.length;
    showImage(current);
  });

  $(".product-carousel-arrow.left").on("click", function () {
    current = (current - 1 + images.length) % images.length;
    showImage(current);
  });

  // Lógica para los indicadores
  $indicatorsContainer.on("click", ".indicator", function () {
    var index = $(this).data("index");
    current = index;
    showImage(current);
  });

  // Inicializa el carrusel en la primera imagen
  showImage(current);

  //Lógica para la transición de las cards "Opinión de clientes"

  //Lógica para la transición de las cards "Opinión de clientes"

  $(function () {
    // Número de cards a mostrar a la vez
    var visibleCards = 3;
    var $cards = $(".opinion-carousel-card");
    var totalCards = $cards.length;
    var currentStart = 0;

    function showCards(start) {
      $cards.removeClass("active");
      for (let i = 0; i < visibleCards; i++) {
        let idx = start + i;
        if (idx < totalCards) {
          $cards.eq(idx).addClass("active");
        }
      }
      // Deshabilita los botones si corresponde
      $(".opinion-carousel-arrow.left").prop("disabled", start === 0);
      $(".opinion-carousel-arrow.right").prop(
        "disabled",
        start >= totalCards - visibleCards
      );
    }

    $(".opinion-carousel-arrow.left").click(function () {
      if (currentStart > 0) {
        currentStart--;
        showCards(currentStart);
      }
    });

    $(".opinion-carousel-arrow.right").click(function () {
      if (currentStart < totalCards - visibleCards) {
        currentStart++;
        showCards(currentStart);
      }
    });

    // Inicializa mostrando la primera
    showCards(currentStart);
  });
}
