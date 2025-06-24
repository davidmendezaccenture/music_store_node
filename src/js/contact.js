//logica pagina de contacto

$(function () {
  $("#contactForm").on("submit", function (e) {
    e.preventDefault();
    let valid = true;

    // Nombre
    const nombre = $("#nombre").val().trim();
    /* // Validacion solo letras y mínimo 2 caracteres, permite acentos y espacios
    Expresión regular: ^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{2,}$
    - ^ indica el inicio de la cadena
    - [A-Za-zÁÉÍÓÚáéíóúÑñ\s] permite letras (mayúsculas y minúsculas), acentos y espacios
    - {2,} indica que debe haber al menos 2 caracteres
    - $ indica el final de la cadena */

    if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{2,}$/.test(nombre)) {
      valid = false;
      setError(
        "#nombre",
        "Introduce un nombre válido (SOLO letras, mínimo 2 caracteres)."
      );
    } else {
      clearError("#nombre");
    }

    // Email
    const email = $("#email").val().trim();
    /* Expresion mejorada respecto a regular : /^[\w\.-]+@[\w\.-]+\.\w{2,}$/ */
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      valid = false;
      setError("#email", "Introduce un correo electrónico válido.");
    } else {
      clearError("#email");
    }

    // Mensaje
    const mensaje = $("#mensaje").val().trim();
    if (mensaje.length < 10) {
      valid = false;
      setError("#mensaje", "El mensaje debe tener al menos 10 caracteres.");
    } else {
      clearError("#mensaje");
    }

    // Teléfono
    const telefono = $("#telefono").val().trim();
    if (telefono && !/^[\d\s\-\(\)]{7,}$/.test(telefono)) {
      valid = false;
      setError(
        "#telefono",
        "Introduce un teléfono válido (mínimo 7 dígitos, solo números y símbolos)."
      );
    } else {
      clearError("#telefono");
    }

    if (valid) {
      $("#formSuccess").removeClass("d-none");
      this.reset();
    } else {
      $("#formSuccess").addClass("d-none");
    }
  });

  // Añade is-invalid a los campos que no seaan validos. Busca elemento con clase .invalid-feedbacak y le pone el texto del mensaje de error
  function setError(selector, message) {
    $(selector).addClass("is-invalid").next(".invalid-feedback").text(message);
  }
  function clearError(selector) {
    $(selector).removeClass("is-invalid").next(".invalid-feedback").text("");
  }
});
