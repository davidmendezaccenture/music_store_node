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
    $("#carritoButton").removeClass("active"); // Quitar active del carrito
    var path = window.location.pathname;
    if (path.includes("index.html") || path === "/" || path === "/pages/") {
      $('.navbar-nav .nav-link[href$="index.html"]').addClass("active");
    } else if (path.includes("guitar.html")) {
      $('.navbar-nav .nav-link[href$="guitar.html"]').addClass("active");
    } else if (path.includes("contact.html")) {
      $('.navbar-nav .nav-link[href$="contact.html"]').addClass("active");
    } else if (path.includes("services.html")) {
      $('.navbar-nav .nav-link:contains("Servicios")').addClass("active");
    } else if (path.includes("cart.html")) {
      $("#carritoButton").addClass("active");
    } else if (path.includes("sobre") || path.includes("about")) {
      $('.navbar-nav .nav-link:contains("Sobre nosotros")').addClass("active");
    } else if (path.includes("faq.html")) {
      // $('.navbar-nav .nav-link[href$="faq.html"]').addClass("active");
    }

    // --- GESTIÓN DE ACTIVE EN OFFCANVAS ---
    $(".offcanvas-body .list-group-item").removeClass("active");
    if (path.includes("services.html")) {
      $('.offcanvas-body .list-group-item[href$="services.html"]').addClass("active");
    } else if (path.includes("contact.html")) {
      $('.offcanvas-body .list-group-item[href$="contact.html"]').addClass("active");
    } else if (path.includes("faq.html")) {
      $('.offcanvas-body .list-group-item[href$="faq.html"]').addClass("active");
    }
  });

  initNavbar();
  initNewsletterForm();
  initFeedbackSection();
  initFooter();

  renderBootstrapCarousel(); // Nuevo carrusel Bootstrap

  // ...carga dinámica del modal...
  if ($("#loginModal").length === 0) {
    $.get("/pages/login-modal.html", function (data) {
      $("body").append(data);
      initLoginModal();
    });
  } else {
    initLoginModal();
  }

  // Carrusel de opiniones (cards)
  (function () {
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

    showCards(currentStart);
  })();
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
  $("#footer").load("/pages/footer.html");
}

// Carrusel de imágenes productos destacados
function renderBootstrapCarousel() {
  const images = [
    {
      src: "/assets/images/guitar1.png",
      alt: "Guitarra eléctrica"
    },
    {
      src: "/assets/images/drum2.png",
      alt: "Batería"
    },
    {
      src: "/assets/images/amp1.png",
      alt: "Amplificador"
    },
    {
      src: "/assets/images/bass1.png",
      alt: "Bajo eléctrico"
    }
    // Añade más imágenes si lo deseas
  ];

  // Agrupa las imágenes de 3 en 3 para cada slide
  const slides = [];
  for (let i = 0; i < images.length; i += 3) {
    slides.push(images.slice(i, i + 3));
  }

  const $carousel = $("#carouselProductos");
  const $indicators = $carousel.find(".carousel-indicators");
  const $inner = $carousel.find(".carousel-inner");

  $indicators.empty();
  $inner.empty();

  slides.forEach((slideImages, idx) => {
    $indicators.append(`
      <button type="button" data-bs-target="#carouselProductos" data-bs-slide-to="${idx}" ${idx === 0 ? 'class="active" aria-current="true"' : ''} aria-label="Slide ${idx + 1}"></button>
    `);

    // Solo la imagen, sin captions
    let imagesHtml = slideImages.map(img => `
      <div class="col-12 col-md-4 d-flex flex-column align-items-center">
        <img src="${img.src}" class="d-block w-100" alt="${img.alt}">
      </div>
    `).join("");

    $inner.append(`
      <div class="carousel-item${idx === 0 ? " active" : ""}">
        <div class="row justify-content-center">${imagesHtml}</div>
      </div>
    `);
  });
}

// Carga dinámica de la navegación de productos
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
