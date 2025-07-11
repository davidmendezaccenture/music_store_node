$(document).ready(function () {
  let cartItems = [];
  let promoDiscount = 0;
  let idToDelete = null;

  // Obtener usuario y carrito
  function getCurrentUser() {
    return fetch("/api/current-user")
      .then((res) => res.json())
      .then((data) => (data.isLoggedIn && data.usuario ? data.usuario : null));
  }

  function fetchCart(user) {
    return $.get(`/api/cart?user=${encodeURIComponent(user.email)}`);
  }

  // Renderizar resumen del pedido
  function renderCartSummary() {
    const $list = $("#cart-summary ul.list-group");
    $list.empty();
    let subtotal = 0;

    cartItems.forEach((item) => {
      let imgSrc = item.image;
      if (imgSrc) {
        if (imgSrc.startsWith("..")) imgSrc = imgSrc.replace("..", "");
        if (!imgSrc.startsWith("/"))
          imgSrc = "/" + imgSrc.replace(/^(\.\/|\/)/, "");
        imgSrc = imgSrc.replace(/\.(png|jpg|jpeg)$/i, ".webp");
      } else {
        imgSrc = "/assets/images/default.webp";
      }

      const price = item.offerPrice || item.price;
      subtotal += price * (item.quantity || 1);

      const $li = $(`
      <li class="list-group-item d-flex align-items-center caja-card" data-id="${
        item.id
      }">
        <img src="${imgSrc}" alt="${
        item.name
      }" class="rounded me-2" width="48" height="48">
        <div class="flex-grow-1">
          <div>${item.name}</div>
          <small class="text-muted">Cantidad: ${item.quantity || 1}</small>
        </div>
        <span class="me-3">${(price * (item.quantity || 1)).toFixed(2)} €</span>
        <button class="btn btn-link text-danger p-0 btn-remove" title="Eliminar">
          <i class="bi bi-trash"></i>
        </button>
      </li>
    `);
      $list.append($li);
    });

    // Mostrar totales y descuento solo si hay código válido
    let resumenHtml = "";
    if (promoDiscount > 0) {
      const descuento = subtotal * promoDiscount;
      const total = subtotal - descuento;
      resumenHtml += `
      <div class="d-flex justify-content-between">
        <span>Subtotal:</span>
        <span>${subtotal.toFixed(2)} €</span>
      </div>
      <div class="d-flex justify-content-between">
        <span>Descuento (${(promoDiscount * 100).toFixed(0)}%):</span>
        <span class="text-success">-${descuento.toFixed(2)} €</span>
      </div>
      <div class="d-flex justify-content-between mb-3 fw-bold">
        <span>Total:</span>
        <span>${total.toFixed(2)} €</span>
      </div>
    `;
    } else {
      resumenHtml += `
      <div class="d-flex justify-content-between mb-3 fw-bold">
        <span>Total:</span>
        <span>${subtotal.toFixed(2)} €</span>
      </div>
    `;
    }
    // Inserta el resumen debajo de la lista
    $list.parent().find(".resumen-totales").remove();
    $list.after(`<div class="resumen-totales">${resumenHtml}</div>`);
  }

  // Eliminar producto del resumen
  // Al pulsar el icono de eliminar, muestra el modal
  $(document).on("click", ".btn-remove", function () {
    idToDelete = $(this).closest("li").data("id");
    const modal = new bootstrap.Modal(
      document.getElementById("deleteConfirmModal")
    );
    modal.show();
  });

  // Al confirmar en el modal, elimina el producto
  $("#deleteConfirmModal").on("click", "#confirmDeleteBtn", function () {
    if (idToDelete !== null) {
      cartItems = cartItems.filter((item) => item.id !== idToDelete);
      updateCartBackend();
      renderCartSummary();
      idToDelete = null;
      // Oculta el modal
      const modal = bootstrap.Modal.getInstance(
        document.getElementById("deleteConfirmModal")
      );
      modal.hide();
    }
  });

  // Actualizar carrito en backend tras eliminar
  function updateCartBackend() {
    getCurrentUser().then((user) => {
      if (user) {
        $.ajax({
          url: "/api/cart",
          method: "POST",
          contentType: "application/json",
          data: JSON.stringify({ user: user.email, items: cartItems }),
        });
      }
    });
  }

  // Aplicar código promocional al hacer click en el botón
  $("#apply-promo").on("click", function () {
    aplicarCodigoPromocional();
  });

  // Aplicar código promocional al pulsar Enter en el input
  $("#promo-code").on("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      aplicarCodigoPromocional();
    }
  });

  // Función para aplicar el código promocional
  function aplicarCodigoPromocional() {
    const code = $("#promo-code").val().trim().toUpperCase();
    const $feedback = $("#promo-feedback");
    if (code === "SUMMERTIME") {
      promoDiscount = 0.05;
      $feedback.addClass("d-none").text("");
    } else {
      promoDiscount = 0;
      $feedback
        .removeClass("d-none")
        .text("El código promocional es incorrecto");
    }
    renderCartSummary();
  }

  // Oculta el mensaje al cambiar el input
  $("#promo-code").on("input", function () {
    $("#promo-feedback").addClass("d-none").text("");
  });

  // Inicialización
  getCurrentUser().then((user) => {
    if (!user) {
      // Si no hay usuario logueado, redirige o muestra mensaje
      window.location.href = "/pages/register.html";
      return;
    }
    fetchCart(user).then((cartData) => {
      cartItems = cartData.items || [];
      renderCartSummary();
    });
  });
});

// Botón cancelar redirige a carrito
$("#cart-summary").on("click", ".btn-cancel", function () {
  window.location.href = "/pages/cart.html";
});

// Mostrar modal al confirmar pago
// $('#checkout-form').on('submit', function(e) {
//   e.preventDefault();
//   const modal = new bootstrap.Modal(document.getElementById('paymentSuccessModal'));
//   modal.show();
// });

// Botón "Seguir comprando"
$("#paymentSuccessModal").on("click", "#seguirComprandoBtn", function () {
  const lastPage =
    sessionStorage.getItem("lastShoppingPage") || "/pages/index.html";
  window.location.href = lastPage;
});

// Validación dinámica en cada campo
$("#full-name").on("input", function () {
  const nombre = $(this).val().trim();
  if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{2,}$/.test(nombre)) {
    setError(
      "#full-name",
      "Introduce un nombre válido (solo letras, mínimo 2 caracteres)."
    );
  } else {
    clearError("#full-name");
  }
});

$("#email").on("input", function () {
  const email = $(this).val().trim();
  if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
    setError("#email", "Introduce un correo electrónico válido.");
  } else {
    clearError("#email");
  }
});

$("#street").on("input", function () {
  const street = $(this).val().trim();
  if (street.length < 2) {
    setError("#street", "Introduce una calle válida.");
  } else {
    clearError("#street");
  }
});

$("#number").on("input", function () {
  const number = $(this).val().trim();
  if (!/^\d+[A-Za-z]?$/.test(number)) {
    setError("#number", "Introduce un número válido.");
  } else {
    clearError("#number");
  }
});

$("#city").on("input", function () {
  const city = $(this).val().trim();
  if (city.length < 2) {
    setError("#city", "Introduce una ciudad válida.");
  } else {
    clearError("#city");
  }
});

$("#postal-code").on("input", function () {
  const postal = $(this).val().trim();
  if (!/^\d{4,6}$/.test(postal)) {
    setError("#postal-code", "Introduce un código postal válido.");
  } else {
    clearError("#postal-code");
  }
});

$("#province").on("input", function () {
  const province = $(this).val().trim();
  if (province.length < 2) {
    setError("#province", "Introduce una provincia válida.");
  } else {
    clearError("#province");
  }
});

$("#country").on("input", function () {
  const country = $(this).val().trim();
  if (country.length < 2) {
    setError("#country", "Introduce un país válido.");
  } else {
    clearError("#country");
  }
});

$("#phone").on("input", function () {
  const phone = $(this).val().trim();
  if (
    phone &&
    (!/^[\d\s\-\(\)]{7,9}$/.test(phone) || phone.replace(/\D/g, "").length > 9)
  ) {
    setError(
      "#phone",
      "Introduce un teléfono válido (7-9 caracteres, solo números y símbolos)."
    );
  } else {
    clearError("#phone");
  }
});

$("#payment-method").on("change", function () {
  const payment = $(this).val();
  if (!payment) {
    setError("#payment-method", "Selecciona un método de pago.");
  } else {
    clearError("#payment-method");
  }
});

// Validación personalizada del formulario de checkout en el submit
$("#checkout-form").on("submit", function (e) {
  e.preventDefault();
  let valid = true;

  // Nombre completo
  const nombre = $("#full-name").val().trim();
  if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{2,}$/.test(nombre)) {
    setError(
      "#full-name",
      "Introduce un nombre válido (solo letras, mínimo 2 caracteres)."
    );
    valid = false;
  } else {
    clearError("#full-name");
  }

  // Email
  const email = $("#email").val().trim();
  if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
    setError("#email", "Introduce un correo electrónico válido.");
    valid = false;
  } else {
    clearError("#email");
  }

  // Calle
  const street = $("#street").val().trim();
  if (street.length < 2) {
    setError("#street", "Introduce una calle válida.");
    valid = false;
  } else {
    clearError("#street");
  }

  // Número
  const number = $("#number").val().trim();
  if (!/^\d+[A-Za-z]?$/.test(number)) {
    setError("#number", "Introduce un número válido.");
    valid = false;
  } else {
    clearError("#number");
  }

  // Ciudad
  const city = $("#city").val().trim();
  if (city.length < 2) {
    setError("#city", "Introduce una ciudad válida.");
    valid = false;
  } else {
    clearError("#city");
  }

  // Código Postal
  const postal = $("#postal-code").val().trim();
  if (!/^\d{4,6}$/.test(postal)) {
    setError("#postal-code", "Introduce un código postal válido.");
    valid = false;
  } else {
    clearError("#postal-code");
  }

  // Provincia
  const province = $("#province").val().trim();
  if (province.length < 2) {
    setError("#province", "Introduce una provincia válida.");
    valid = false;
  } else {
    clearError("#province");
  }

  // País
  const country = $("#country").val().trim();
  if (country.length < 2) {
    setError("#country", "Introduce un país válido.");
    valid = false;
  } else {
    clearError("#country");
  }

  // Teléfono (opcional, pero si se rellena debe ser válido)
  const phone = $("#phone").val().trim();
  if (
    phone &&
    (!/^[\d\s\-\(\)]{7,9}$/.test(phone) || phone.replace(/\D/g, "").length > 9)
  ) {
    setError(
      "#phone",
      "Introduce un teléfono válido (7-9 caracteres, solo números y símbolos)."
    );
    valid = false;
  } else {
    clearError("#phone");
  }

  // Método de pago
  const payment = $("#payment-method").val();
  if (!payment) {
    setError("#payment-method", "Selecciona un método de pago.");
    valid = false;
  } else {
    clearError("#payment-method");
  }

  if (valid) {
    const modal = new bootstrap.Modal(
      document.getElementById("paymentSuccessModal")
    );
    modal.show();

    // Vaciar carrito con el modal
    if (typeof clearCart === "function") {
      clearCart()
        .then(() => {
          /* console.log("Carrito off"); */
          // Actualizar el contador del carrito a 0
          if (typeof updateCartCount === "function") {
            updateCartCount([]);
          }
          // Limpiar el array local de items del checkout
          cartItems = [];
          renderCartSummary();
        })
        .catch((error) => {
          console.error("Error al limpiar el carrito:", error);
        });
    }
  }
});

// Funciones auxiliares para mostrar/ocultar errores
function setError(selector, message) {
  $(selector).addClass("is-invalid").next(".invalid-feedback").text(message);
}
function clearError(selector) {
  $(selector).removeClass("is-invalid").next(".invalid-feedback").text("");
}

// // Limpia el error al modificar el campo
// $(
//   "#full-name, #email, #street, #number, #city, #postal-code, #province, #country, #phone, #payment-method"
// ).on("input change", function () {
//   clearError("#" + this.id);
// });
