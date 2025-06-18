// app.js - Punto de entrada de la aplicación

// Espera a que el DOM esté listo
$(document).ready(function () {
  initNavbar();
  initNewsletterForm();
  initFeedbackSection();
  $("#darkModeToggle").on("click", function () {
    $("body").toggleClass("dark-mode");
    $(this).attr("aria-pressed", $("body").hasClass("dark-mode"));
  });
});

function initNavbar() {
  // Lógica de la navbar
}

function initNewsletterForm() {
  // Lógica del formulario de newsletter
}

function initFeedbackSection() {
  // Lógica de la sección de feedback
}
