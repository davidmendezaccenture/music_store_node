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

    // Asunto
    const asunto = $("#asunto").val().trim();
    if (asunto.length < 3) {
      valid = false;
      setError("#asunto", "El asunto debe tener al menos 3 caracteres.");
    } else {
      clearError("#asunto");
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
      // Enviar datos al backend
      const formData = {
        nombre: nombre,
        email: email,
        asunto: asunto,
        mensaje: mensaje,
        telefono: telefono || null,
      };

      // Mostrar loading
      const submitBtn = $("#contactForm button[type='submit']");
      const originalText = submitBtn.text();
      submitBtn.prop("disabled", true).text("Enviando...");

      // Enviar al backend
      $.ajax({
        url: "/api/contact",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify(formData),
        success: function (response) {
          $("#formSuccess").removeClass("d-none");
          $("#formError").addClass("d-none");
          $("#contactForm")[0].reset();
          console.log("Mensaje enviado:", response);
        },
        error: function (xhr) {
          $("#formError").removeClass("d-none");
          $("#formSuccess").addClass("d-none");
          const errorMsg =
            xhr.responseJSON?.error || "Error al enviar el mensaje";
          $("#formError").text(errorMsg);
          console.error("Error:", errorMsg);
        },
        complete: function () {
          // Restaurar botón
          submitBtn.prop("disabled", false).text(originalText);
        },
      });
    } else {
      $("#formSuccess").addClass("d-none");
      $("#formError").addClass("d-none");
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

// Autocompletar email si hay usuario logueado
$(document).ready(function () {
  $.get("/api/current-user", function (data) {
    if (data && data.isLoggedIn && data.usuario && data.usuario.email) {
      $("#email").val(data.usuario.email).prop("readonly", true);
    }
  });
});
