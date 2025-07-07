$(document).ready(function () {
  let cartItems = [];
  let promoDiscount = 0;
  let idToDelete = null;

  // Obtener usuario y carrito
  function getCurrentUser() {
    return fetch('/api/current-user')
      .then(res => res.json())
      .then(data => (data.isLoggedIn && data.usuario ? data.usuario : null));
  }

  function fetchCart(user) {
    return $.get(`/api/cart?user=${encodeURIComponent(user.email)}`);
  }

  // Renderizar resumen del pedido
function renderCartSummary() {
  const $list = $('#cart-summary ul.list-group');
  $list.empty();
  let subtotal = 0;

  cartItems.forEach((item) => {
    let imgSrc = item.image;
    if (imgSrc) {
      if (imgSrc.startsWith('..')) imgSrc = imgSrc.replace('..', '');
      if (!imgSrc.startsWith('/')) imgSrc = '/' + imgSrc.replace(/^(\.\/|\/)/, '');
      imgSrc = imgSrc.replace(/\.(png|jpg|jpeg)$/i, '.webp');
    } else {
      imgSrc = '/assets/images/default.webp';
    }

    const price = item.offerPrice || item.price;
    subtotal += price * (item.quantity || 1);

    const $li = $(`
      <li class="list-group-item d-flex align-items-center" data-id="${item.id}">
        <img src="${imgSrc}" alt="${item.name}" class="rounded me-2" width="48" height="48">
        <div class="flex-grow-1">
          <div>${item.name}</div>
          <small class="text-muted">Cantidad: ${item.quantity || 1}</small>
        </div>
        <span class="me-3">€${(price * (item.quantity || 1)).toFixed(2)}</span>
        <button class="btn btn-link text-danger p-0 btn-remove" title="Eliminar">
          <i class="bi bi-trash"></i>
        </button>
      </li>
    `);
    $list.append($li);
  });

  // Mostrar totales y descuento solo si hay código válido
  let resumenHtml = '';
  if (promoDiscount > 0) {
    const descuento = subtotal * promoDiscount;
    const total = subtotal - descuento;
    resumenHtml += `
      <div class="d-flex justify-content-between">
        <span>Subtotal:</span>
        <span>€${subtotal.toFixed(2)}</span>
      </div>
      <div class="d-flex justify-content-between">
        <span>Descuento (${(promoDiscount * 100).toFixed(0)}%):</span>
        <span class="text-success">-€${descuento.toFixed(2)}</span>
      </div>
      <div class="d-flex justify-content-between mb-3 fw-bold">
        <span>Total:</span>
        <span>€${total.toFixed(2)}</span>
      </div>
    `;
  } else {
    resumenHtml += `
      <div class="d-flex justify-content-between mb-3 fw-bold">
        <span>Total:</span>
        <span>€${subtotal.toFixed(2)}</span>
      </div>
    `;
  }
  // Inserta el resumen debajo de la lista
  $list.parent().find('.resumen-totales').remove();
  $list.after(`<div class="resumen-totales">${resumenHtml}</div>`);
}

  // Eliminar producto del resumen
// Al pulsar el icono de eliminar, muestra el modal
$(document).on('click', '.btn-remove', function () {
  idToDelete = $(this).closest('li').data('id');
  const modal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
  modal.show();
});

// Al confirmar en el modal, elimina el producto
$('#deleteConfirmModal').on('click', '#confirmDeleteBtn', function () {
  if (idToDelete !== null) {
    cartItems = cartItems.filter(item => item.id !== idToDelete);
    updateCartBackend();
    renderCartSummary();
    idToDelete = null;
    // Oculta el modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('deleteConfirmModal'));
    modal.hide();
  }
});

  // Actualizar carrito en backend tras eliminar
  function updateCartBackend() {
    getCurrentUser().then(user => {
      if (user) {
        $.ajax({
          url: '/api/cart',
          method: 'POST',
          contentType: 'application/json',
          data: JSON.stringify({ user: user.email, items: cartItems })
        });
      }
    });
  }

  // Aplicar código promocional
$('#apply-promo').on('click', function () {
  const code = $('#promo-code').val().trim().toUpperCase();
  const $feedback = $('#promo-feedback');
  if (code === 'SUMMERTIME') {
    promoDiscount = 0.05;
    $feedback.addClass('d-none').text('');
  } else {
    promoDiscount = 0;
    $feedback.removeClass('d-none').text('El código promocional es incorrecto');
  }
  renderCartSummary();
});

// Oculta el mensaje al cambiar el input
$('#promo-code').on('input', function () {
  $('#promo-feedback').addClass('d-none').text('');
});

// Inicialización
  getCurrentUser().then(user => {
    if (!user) {
      // Si no hay usuario logueado, redirige o muestra mensaje
      window.location.href = '/pages/register.html';
      return;
    }
    fetchCart(user).then(cartData => {
      cartItems = cartData.items || [];
      renderCartSummary();
    });
  });
});

// Botón cancelar redirige a carrito
$('#cart-summary').on('click', '.btn-cancel', function () {
  window.location.href = '/pages/cart.html';
});
