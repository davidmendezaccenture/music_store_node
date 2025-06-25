let productos = [];

// ALERTA DE PRODUCTO AÑADIDO
let addToCartAlertTimeout;

function showAddToCartAlert(msg = '¡Producto añadido a la cesta!') {
  $('#addToCartAlert').text(msg).stop(true, true).fadeIn(200);

  if (addToCartAlertTimeout) clearTimeout(addToCartAlertTimeout);

  addToCartAlertTimeout = setTimeout(() => {
    $('#addToCartAlert').fadeOut(400);
  }, 2000);
}

// Cargar productos desde el backend
function cargarProductos() {
  return $.get('/api/products', function (data) {
    productos = data;
  });
}

// Obtener usuario actual (o guest)
function getCurrentUser() {
  const user = JSON.parse(localStorage.getItem('user'));
  return user?.username || 'guest';
}

// Obtener carrito
function fetchCart() {
  const user = getCurrentUser();
  if (user === 'guest') {
    // Invitado: usa localStorage
    const items = JSON.parse(localStorage.getItem('cart')) || [];
    return $.Deferred().resolve({ items }).promise();
  } else {
    // Logueado: usa backend
    return $.get(`/api/cart?user=${encodeURIComponent(user)}`);
  }
}

// Guardar carrito
function saveCart(items) {
  const user = getCurrentUser();
  if (user === 'guest') {
    // Invitado: guarda en localStorage
    localStorage.setItem('cart', JSON.stringify(items));
    return $.Deferred().resolve().promise();
  } else {
    // Logueado: guarda en backend
    return $.ajax({
      url: '/api/cart',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({ user, items })
    });
  }
}

// Actualizar contador del carrito
function updateCartCount(items) {
  const count = items.reduce((acc, item) => acc + (item.quantity || 1), 0);
  const badge = $('#cart-count');
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
      const producto = productos.find(p => p.id === id);
      if (!producto) return;

      let found = items.find(item => item.id === id);
      if (found) {
        found.quantity = (found.quantity || 1) + 1;
      } else {
        items.push({ ...producto, quantity: 1 });
      }
      saveCart(items).then(function () {
        updateCartCount(items);
        showAddToCartAlert(); // Muestra el mensaje de éxito al añadir al carrito
        // Si estamos en cart.html, actualiza la vista del carrito
        if ($('#cart-content').length) renderCart(items);
      });
    });
  });
}

// Renderizar carrito en cart.html
function renderCart(items) {
  $('#cart-loader').hide(); // Oculta el loader al renderizar el carrito
  const $cartEmpty = $('#cart-empty');
  const $cartContent = $('#cart-content');
  const $colLeft = $('.col-lg-8'); // Selecciona la columna izquierda

  $cartContent.empty();

  if (!items.length) {
    $cartEmpty.show();
    $cartContent.hide();
    $colLeft.removeClass('col-lg-8').addClass('col-lg-12'); // Ocupa todo el ancho
    renderCartSummary(items);
    return;
  }

  $cartEmpty.hide();
  $cartContent.show();
  $colLeft.removeClass('col-lg-12').addClass('col-lg-8'); // Vuelve a su tamaño normal

  let total = 0;
  items.forEach(item => {
    const price = item.offerPrice || item.price;
    total += price * (item.quantity || 1);

    // Clonar template 
    const $tpl = $($('#cart-item-template').prop('content')).children().first().clone();
    $tpl.attr('data-id', item.id);
    $tpl.find('img').attr('src', item.image).attr('alt', item.name);
    $tpl.find('.card-title').text(item.name);
    $tpl.find('.card-text').text(item.description || '');
    $tpl.find('.price').text(`${price} €`);
    $tpl.find('.cart-qty-input').val(item.quantity || 1);

    $cartContent.append($tpl);
  });

  $cartContent.append(`
    <div class="text-end fw-bold fs-5 mt-3">
      Total: ${total} €
    </div>
  `);
  renderCartSummary(items);
}

function renderCartSummary(items) {
  if (!items.length) {
    $('#cart-summary').empty();
    $('#cart-summary-col').hide(); // Oculta la columna de la derecha
    return;
  }
  $('#cart-summary-col').show(); // Muestra la columna si hay productos

  const total = items.reduce((acc, item) => acc + (item.quantity || 1) * (item.offerPrice || item.price), 0);
  const $tpl = $($('#cart-summary-template').prop('content')).children().first().clone();
  $tpl.find('.total').text(`Total ${total} €`);
  $('#cart-summary').html($tpl);
}

// Eventos para botones de cantidad y eliminar
$(document).on('click', '.btn-increase', function () {
  const $item = $(this).closest('.cart-item');
  const id = parseInt($item.data('id'));
  fetchCart().then(function (cartData) {
    let items = cartData.items || [];
    let found = items.find(item => item.id === id);
    if (found) found.quantity = (found.quantity || 1) + 1;
    saveCart(items).then(function () {
      updateCartCount(items);
      renderCart(items);
    });
  });
});

$(document).on('click', '.btn-decrease', function () {
  const $item = $(this).closest('.cart-item');
  const id = parseInt($item.data('id'));
  fetchCart().then(function (cartData) {
    let items = cartData.items || [];
    let found = items.find(item => item.id === id);
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

$(document).on('click', '.btn-remove', function () {
  const $item = $(this).closest('.cart-item');
  idToDelete = parseInt($item.data('id'));
  // Muestra el modal de Bootstrap
  const modal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
  modal.show();
});

$('#confirmDeleteBtn').on('click', function () {
  if (idToDelete !== null) {
    fetchCart().then(function (cartData) {
      let items = cartData.items || [];
      items = items.filter(item => item.id !== idToDelete);
      saveCart(items).then(function () {
        updateCartCount(items);
        renderCart(items);
        idToDelete = null;
        // Oculta el modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('deleteConfirmModal'));
        modal.hide();
      });
    });
  }
});

// Inicialización al cargar la página
$(document).ready(function () {
  $('#cart-loader').show(); // Loader que se muestra al cargar el carrito
  cargarProductos().then(function () {
    fetchCart().then(function (cartData) {
      let items = cartData.items || [];
      updateCartCount(items);
      if ($('#cart-content').length) renderCart(items);
    });
  });

  // Delegación de eventos para los botones "Añadir a la cesta"
  $(document).on('click', '.add-to-cart', function () {
    const id = parseInt($(this).attr('data-id'));
    addToCartById(id);
      });

  // Manejo del botón "Seguir comprando"
  $('#seguirComprandoBtn').on('click', function () {
    const lastPage = localStorage.getItem('lastShopPage');
    window.location.href = lastPage || '/pages/index.html';
  });
});