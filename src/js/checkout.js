$(document).ready(function () {
  let cartItems = [];
  let promoDiscount = 0;

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
    let total = 0;

    cartItems.forEach((item, idx) => {
      // Ajusta la ruta de la imagen a .webp y asegúrate de que sea absoluta
      let imgSrc = item.image;
      if (imgSrc) {
        // Si la ruta es relativa, hazla absoluta
        if (imgSrc.startsWith('..')) {
          imgSrc = imgSrc.replace('..', '');
        }
        if (!imgSrc.startsWith('/')) {
          imgSrc = '/' + imgSrc.replace(/^(\.\/|\/)/, '');
        }
        // Cambia la extensión a .webp si no lo es
        imgSrc = imgSrc.replace(/\.(png|jpg|jpeg)$/i, '.webp');
      } else {
        imgSrc = '/assets/images/default.webp'; // Imagen por defecto si falta
      }

      const price = item.offerPrice || item.price;
      total += price * (item.quantity || 1);

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

    // Totales
    $('#total-sin-descuento').text(`€${total.toFixed(2)}`);
    const totalConDescuento = (total * (1 - promoDiscount)).toFixed(2);
    $('#total-con-descuento').text(`€${totalConDescuento}`);
  }

  // Eliminar producto del resumen
  $(document).on('click', '.btn-remove', function () {
    const id = $(this).closest('li').data('id');
    cartItems = cartItems.filter(item => item.id !== id);
    updateCartBackend();
    renderCartSummary();
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
