let productos = [];

// Muestra Mensaje de alerta si hay producto añadido al carrito
let addToCartAlertTimeout;

function showAddToCartAlert(msg = "¡Producto añadido a la cesta!") {
  $("#addToCartAlert").text(msg).stop(true, true).fadeIn(200);

  if (addToCartAlertTimeout) clearTimeout(addToCartAlertTimeout);

  addToCartAlertTimeout = setTimeout(() => {
    $("#addToCartAlert").fadeOut(400);
  }, 2000);
}

// Cargar productos desde el backend
function cargarProductos() {
  return $.get("/api/products", function (data) {
    productos = data;
  });
}

// Obtener usuario actual (o guest)
function getCurrentUser() {
  return fetch("/api/current-user")
    .then((res) => res.json())
    .then((data) => {
      if (data.isLoggedIn && data.usuario) {
        return data.usuario; // Usuario logueado (objeto usuario sin password)
      } else {
        return "guest"; // No hay usuario logueado
      }
    });
}

// function getCurrentUser() {
//   return Promise.resolve('guest');
// }

// Obtener carrito
function fetchCart() {
  return getCurrentUser().then((user) => {
    if (user === "guest") {
      // Invitado: usa localStorage
      const items = JSON.parse(localStorage.getItem("cart")) || [];
      return { items };
    } else {
      // Logueado: usa backend
      return $.get(`/api/cart?user=${encodeURIComponent(user.email)}`);
    }
  });
}

// Guardar carrito
function saveCart(items) {
  return getCurrentUser().then((user) => {
    if (user === "guest") {
      localStorage.setItem("cart", JSON.stringify(items));
      return;
    } else {
      return $.ajax({
        url: "/api/cart",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify({ user: user.email, items }),
      });
    }
  });
}

// Vaciar carrito completamente
function clearCart() {
  return getCurrentUser().then((user) => {
    if (user === "guest") {
      // Para invitados: limpiar localStorage (funcion para un futuro, actualmente no se usa, ya que no podemos comprar en modo invitado)
      localStorage.removeItem("cart");
      return Promise.resolve();
    } else {
      // If loged , llamamos server.js
      return $.ajax({
        url: "/api/cart",
        method: "DELETE",
        contentType: "application/json",
        data: JSON.stringify({ user: user.email }),
      });
    }
  });
}

// Actualizar contador del carrito
function updateCartCount(items) {
  const count = items.reduce((acc, item) => acc + (item.quantity || 1), 0);
  const badge = $("#cart-count");
  if (count > 0) {
    badge.text(count).show();
  } else {
    badge.hide();
  }
}

// Añadir producto al carrito

function addToCartById(id) {
  cargarProductos().then(function () {
    fetchCart().then(function (cartData) {
      let items = cartData.items || [];
      const producto = productos.find((p) => p.id === id);
      if (!producto) return;

      let found = items.find((item) => item.id === id);
      if (found) {
        found.quantity = (found.quantity || 1) + 1;
      } else {
        items.push({ ...producto, quantity: 1 });
      }
      saveCart(items).then(function () {
        updateCartCount(items);
        showAddToCartAlert(); // Muestra el mensaje de éxito al añadir al carrito
        // Si estamos en cart.html, actualiza la vista del carrito
        if ($("#cart-content").length) renderCart(items);
      });
    });
  });
}

// Renderizar carrito en cart.html
function renderCart(items) {
  $("#cart-loader").hide(); // Oculta el loader al renderizar el carrito
  const $cartEmpty = $("#cart-empty");
  const $cartContent = $("#cart-content");
  const $colLeft = $(".col-lg-8"); // Selecciona la columna izquierda

  $cartContent.empty();

  if (!items.length) {
    $cartEmpty.show();
    $cartContent.hide();
    $colLeft.removeClass("col-lg-8").addClass("col-lg-12"); // Ocupa todo el ancho
    renderCartSummary(items);
    return;
  }

  $cartEmpty.hide();
  $cartContent.show();
  $colLeft.removeClass("col-lg-12").addClass("col-lg-8"); // Vuelve a su tamaño normal

  let total = 0;
  items.forEach((item) => {
    const price = item.offerPrice || item.price;
    total += price * (item.quantity || 1);

    // Ajusta la ruta de la imagen a .webp y asegúrate de que sea absoluta
    let imgSrc = item.image;
    if (imgSrc) {
      if (imgSrc.startsWith("..")) {
        imgSrc = imgSrc.replace("..", "");
      }
      if (!imgSrc.startsWith("/")) {
        imgSrc = "/" + imgSrc.replace(/^(\.\/|\/)/, "");
      }
      imgSrc = imgSrc.replace(/\.(png|jpg|jpeg)$/i, ".webp");
    } else {
      imgSrc = "/assets/images/default.webp"; // Imagen por defecto si falta
    }

    // Clonar template
    const $tpl = $($("#cart-item-template").prop("content"))
      .children()
      .first()
      .clone();
    $tpl.attr("data-id", item.id);

    // Crea el enlace con la imagen dentro
    const $imgLink = $(`
  <a href="/pages/detail-product.html?id=${item.id}" target="_blank" aria-label="Ver detalle de ${item.name}">
    <img src="${imgSrc}" class="img-fluid rounded" alt="${item.name}" style="max-width: 80px" />
  </a>
`);

    // Sustituye el div de la imagen por el enlace con la imagen
    $tpl.find(".col-3.col-md-2.text-center").empty().append($imgLink);

    $tpl.find(".card-title").text(item.name);
    $tpl.find(".card-text").text(item.description || "");
    $tpl.find(".price").text(`${price} €`);
    $tpl.find(".cart-qty-input").val(item.quantity || 1);

    $cartContent.append($tpl);
  });

  $cartContent.append(`
    <div class="text-end fw-bold fs-5 mt-3 mb-5">
      Total: ${total} €
    </div>
  `);
  renderCartSummary(items);
}

// Mostrar resumen y total del carrito
function renderCartSummary(items) {
  if (!items.length) {
    $("#cart-summary").empty();
    $("#cart-summary-col").hide(); // Oculta la columna de la derecha
    return;
  }
  $("#cart-summary-col").show(); // Muestra la columna si hay productos

  const total = items.reduce(
    (acc, item) => acc + (item.quantity || 1) * (item.offerPrice || item.price),
    0
  );
  const $tpl = $($("#cart-summary-template").prop("content"))
    .children()
    .first()
    .clone();
  $tpl.find(".total").text(`Total ${total} €`);
  $("#cart-summary").html($tpl);
}

// Eventos para botones de cantidad y eliminar
$(document).on("click", ".btn-increase", function () {
  const $item = $(this).closest(".cart-item");
  const id = parseInt($item.data("id"));
  fetchCart().then(function (cartData) {
    let items = cartData.items || [];
    let found = items.find((item) => item.id === id);
    if (found) found.quantity = (found.quantity || 1) + 1;
    saveCart(items).then(function () {
      updateCartCount(items);
      renderCart(items);
    });
  });
});

$(document).on("click", ".btn-decrease", function () {
  const $item = $(this).closest(".cart-item");
  const id = parseInt($item.data("id"));
  fetchCart().then(function (cartData) {
    let items = cartData.items || [];
    let found = items.find((item) => item.id === id);
    if (found && found.quantity > 1) found.quantity -= 1;
    saveCart(items).then(function () {
      updateCartCount(items);
      renderCart(items);
    });
  });
});

// Eliminar producto del carrito sin modal
// Comentado para evitar conflictos con el modal de confirmación
// $(document).on('click', '.btn-remove', function () {
//   const $item = $(this).closest('.cart-item');
//   const id = parseInt($item.data('id'));
//   fetchCart().then(function (cartData) {
//     let items = cartData.items || [];
//     items = items.filter(item => item.id !== id);
//     saveCart(items).then(function () {
//       updateCartCount(items);
//       renderCart(items);
//     });
//   });
// });

// Eliminar producto del carrito con modal de confirmación
let idToDelete = null;

$("#cart-content").on("click", ".btn-remove", function () {
  const $item = $(this).closest(".cart-item");
  idToDelete = parseInt($item.data("id"));
  const modal = new bootstrap.Modal(
    document.getElementById("deleteConfirmModal")
  );
  modal.show();
});

$("#confirmDeleteBtn").on("click", function () {
  if (idToDelete !== null) {
    fetchCart().then(function (cartData) {
      let items = cartData.items || [];
      items = items.filter((item) => item.id !== idToDelete);
      saveCart(items).then(function () {
        updateCartCount(items);
        renderCart(items);
        idToDelete = null;
        // Oculta el modal
        const modal = bootstrap.Modal.getInstance(
          document.getElementById("deleteConfirmModal")
        );
        modal.hide();
      });
    });
  }
});

// Combinar guest + log user
function mergeGuestCartWithUser(userEmail) {
  return new Promise((resolve, reject) => {
    console.log("Fusion con goku:", userEmail);

    // 1. Obtener carrito de localStorage (guest)
    const guestItems = JSON.parse(localStorage.getItem("cart")) || [];
    /* console.log("Items de guest:", guestItems); */

    if (guestItems.length === 0) {
      /*  console.log("No hay carrito de guest, no hay nada que fusionar"); */
      resolve();
      return;
    }

    // 2. Obtener carrito del usuario del servidor
    $.get(`/api/cart?user=${encodeURIComponent(userEmail)}`)
      .then((userCartData) => {
        /* console.log("📦 Carrito del usuario desde servidor:", userCartData); */
        let userItems = userCartData.items || [];

        // 3. Fusion doble! : sumar cantidades para productos duplicados
        guestItems.forEach((guestItem) => {
          const existingItem = userItems.find(
            (userItem) => userItem.id === guestItem.id
          );

          if (existingItem) {
            // Producto ya existe: sumar cantidades
            /* console.log(
              `Producto duplicado ID ${guestItem.id}: sumando ${existingItem.quantity} + ${guestItem.quantity}`
            ); */
            existingItem.quantity =
              (existingItem.quantity || 1) + (guestItem.quantity || 1);
          } else {
            // Producto nuevo: agregarlo al carrito del usuario
            /* console.log(
              `Producto nuevo ID ${guestItem.id}: agregando al carrito`
            ); */
            userItems.push(guestItem);
          }
        });

        /* console.log("Fusion completada!:", userItems); */

        // 4. Guardar el carrito fusionado en el servidor
        return $.ajax({
          url: "/api/cart",
          method: "POST",
          contentType: "application/json",
          data: JSON.stringify({ user: userEmail, items: userItems }),
        });
      })
      .then(() => {
        // 5. Limpiar localStorage del guest
        localStorage.removeItem("cart");
        /* console.log(
          "Carrito de guest fusionado con usuario logueado y localStorage limpiado"
        ); */
        resolve();
      })
      .catch((error) => {
        /* console.error("Error en la fusion, not enuf Ki:", error); */
        reject(error);
      });
  });
}

// Inicialización al cargar la página
$(document).ready(function () {
  $("#cart-loader").show(); // Loader que se muestra al cargar el carrito
  cargarProductos().then(function () {
    fetchCart().then(function (cartData) {
      let items = cartData.items || [];
      updateCartCount(items);
      if ($("#cart-content").length) renderCart(items);
    });
  });

  // Delegación de eventos para los botones "Añadir a la cesta"
  $(document).on("click", ".add-to-cart", function () {
    const id = parseInt($(this).attr("data-id"));
    addToCartById(id);
  });

  // Lógica del botón "ir a caja" para usuarios no logueados y guest
  $(document).on("click", ".btn-checkout", function (e) {
    e.preventDefault();
    getCurrentUser().then(function (user) {
      if (user === "guest") {
        // Mostrar modal para guest
        const modal = new bootstrap.Modal(
          document.getElementById("guestCheckoutModal")
        );
        modal.show();
      } else {
        // Lógica de checkout real para usuarios logueados
        window.location.href = "/pages/checkout.html";
      }
    });
  });

  // Manejo del botón "Seguir comprando"
  $("#seguirComprandoBtn").on("click", function () {
    const lastPage = localStorage.getItem("lastShopPage");
    window.location.href = lastPage || "/pages/index.html";
  });
});
