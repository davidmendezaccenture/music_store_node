// app.js - Punto de entrada de la aplicación

// Espera a que el DOM esté listo
$(document).ready(function () {
  initNavbar();
  initNewsletterForm();
  initFeedbackSection();

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
