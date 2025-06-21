// app.js - Punto de entrada de la aplicación

// Espera a que el DOM esté listo
$(document).ready(function () {
  initNavbar();
  initNewsletterForm();
  initFeedbackSection();
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

  // Modo oscuro
  $("#darkModeToggle").on("click", function () {
    $("body").toggleClass("dark-mode");
    $(this).attr("aria-pressed", $("body").hasClass("dark-mode"));
  });
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

// Aquí va la lógica del carrusel
function initCarousel() {

  var images = [
    '/assets/images/guitar1.png',
    '/assets/images/drum2.png',
    '/assets/images/amp1.png'
  ];
  var current = 0;

function showImage(index) {
  $('.img-carrousel').attr('src', images[index]);
  $('.indicator').removeClass('active').attr('aria-selected', 'false').attr('tabindex', '0');
  $('.indicator').eq(index).addClass('active').attr('aria-selected', 'true').attr('tabindex', '0');
}

  $('.carrousel-control').eq(1).on('click', function() { // Botón derecho
    current = (current + 1) % images.length;
    showImage(current);
  });

  $('.carrousel-control').eq(0).on('click', function() { // Botón izquierdo
    current = (current - 1 + images.length) % images.length;
    showImage(current);
  });

  // Lógica para los indicadores
  $('.indicator').on('click', function() {
  var index = $(this).data('index');
  current = index;
  showImage(current);
});
}