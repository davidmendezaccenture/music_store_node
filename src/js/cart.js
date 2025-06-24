let productos = [];

// 1. Cargar productos desde el backend
function cargarProductos() {
  return $.get('/api/products', function (data) {
    productos = data;
  });
}

// 2. Obtener usuario actual (o guest)
function getCurrentUser() {
  const user = JSON.parse(localStorage.getItem('user'));
  return user?.username || 'guest';
}

// 3. Obtener carrito del backend
function fetchCart() {
  const user = getCurrentUser();
  return $.get(`/api/cart?user=${encodeURIComponent(user)}`);
}

// 4. Guardar carrito en backend
function saveCart(items) {
  const user = getCurrentUser();
  return $.ajax({
    url: '/api/cart',
    method: 'POST',
    contentType: 'application/json',
    data: JSON.stringify({ user, items })
  });
}

// 5. Actualizar contador del carrito
function updateCartCount(items) {
  const count = items.reduce((acc, item) => acc + (item.quantity || 1), 0);
  const badge = $('#cart-count');
  if (badge.length) badge.text(count);
}

// 6. Añadir producto al carrito
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
        // Si estamos en cart.html, actualiza la vista del carrito
        if ($('#cart-content').length) renderCart(items);
      });
    });
  });
}

// 7. Renderizar carrito en cart.html
function renderCart(items) {
  const $cartEmpty = $('#cart-empty');
  const $cartContent = $('#cart-content');
  $cartContent.empty();

  if (!items.length) {
    $cartEmpty.show();
    $cartContent.hide();
    return;
  }

  $cartEmpty.hide();
  $cartContent.show();

  let total = 0;
  items.forEach(item => {
    const price = item.offerPrice || item.price;
    total += price * (item.quantity || 1);

    // Clonar template correctamente
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

$(document).on('click', '.btn-remove', function () {
  const $item = $(this).closest('.cart-item');
  const id = parseInt($item.data('id'));
  fetchCart().then(function (cartData) {
    let items = cartData.items || [];
    items = items.filter(item => item.id !== id);
    saveCart(items).then(function () {
      updateCartCount(items);
      renderCart(items);
    });
  });
});

// 8. Inicialización al cargar la página
$(document).ready(function () {
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
});