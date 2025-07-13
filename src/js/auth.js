// auth.js - Gestiona la autenticación de usuarios y el estado de login

// Estado Auth
let currentUser = null;
let isLoggedIn = false;

// Init
$(document).ready(function () {
  initAuth();
  initLoginForm();
});

// Iniciar autenticación
async function initAuth() {
  // Verificar localStorage
  const savedUser = localStorage.getItem("currentUser");
  const savedLoginStatus = localStorage.getItem("isLoggedIn");

  if (savedUser && savedLoginStatus === "true") {
    try {
      currentUser = JSON.parse(savedUser);
      // Verificar con el servidor que el usuario sigue logueado
      await verifyUserSession();
    } catch (error) {
      console.error("Error al parsear usuario guardado:", error);
      clearLocalAuth();
    }
  }

  // Actualizar interfaz
  updateHeaderUserStatus();
}

// Verificar sesión con el servidor
async function verifyUserSession() {
  if (!currentUser || !currentUser.email) {
    clearLocalAuth();
    return;
  }

  try {
    const response = await fetch(`/api/user-status/${currentUser.email}`);
    const data = await response.json();

    if (response.ok && data.isLoggedIn) {
      isLoggedIn = true;
      currentUser = data.usuario;
      // Actualizar localStorage con datos actualizados
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
    } else {
      // Usuario no está logueado en el servidor
      clearLocalAuth();
    }
  } catch (error) {
    console.error("Error al verificar sesión:", error);
    clearLocalAuth();
  }
}

// Limpiar datos de autenticación local
function clearLocalAuth() {
  currentUser = null;
  isLoggedIn = false;
  localStorage.removeItem("currentUser");
  localStorage.removeItem("isLoggedIn");
}

// Función para hacer logout
async function logout() {
  if (!currentUser || !currentUser.email) {
    clearLocalAuth();
    updateHeaderUserStatus();
    return;
  }

  try {
    const response = await fetch("/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: currentUser.email }),
    });

    if (response.ok) {
      clearLocalAuth();
      updateHeaderUserStatus();
      // Recargar página
      window.location.reload();
    } else {
      alert("Error al cerrar sesión");
    }
  } catch (error) {
    console.error("Error al hacer logout:", error);
    alert("Error del servidor");
  }
}

// Inicializar el formulario de login
function initLoginForm() {
  // Esperar a que el modal se cargue dinámicamente
  const checkForLoginForm = () => {
    const $loginForm = $("#loginForm");
    if ($loginForm.length > 0) {
      // Si encontrado + event listener
      $loginForm.off("submit").on("submit", handleLoginSubmit);
    } else {
      // Reintentar
      setTimeout(checkForLoginForm, 100);
    }
  };

  checkForLoginForm();
}

// Submit form
async function handleLoginSubmit(e) {
  e.preventDefault();

  const $form = $(e.target);
  const email = $form.find('input[name="email"]').val();
  const password = $form.find('input[name="password"]').val();

  try {
    const response = await fetch("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      // Actualizar estado de autenticación
      updateAuthState(data.usuario, true);

      // Fusionar carrito de guest con usuario logueado
      if (typeof mergeGuestCartWithUser === "function") {
        try {
          await mergeGuestCartWithUser(data.usuario.email);
          /* console.log("Carrito fusionado correctamente"); */
          // Actualizar contador del carrito después de la fusión
          if (typeof updateCartCount === "function") {
            const cartData = await fetchCart();
            updateCartCount(cartData.items || []);
          }
        } catch (error) {
          /* console.error("Error al fusionar carrito sin Ki:", error); */
        }
      }

      // Cerrar modal
      $("#loginModal").modal("hide");

      // Actualizar interfaz del header
      updateHeaderUserStatus();

      // Recargar página para reflejar cambios (espera al ritual de fusion)
      window.location.reload();
    } else {
      alert(data.error || "Error al iniciar sesión");
    }
  } catch (error) {
    console.error("Error al enviar login:", error);
    alert("Error del servidor");
  }
}

// Actualizar la interfaz del header y footer según el estado de login
function updateHeaderUserStatus() {
  const $loginButton = $("#loginButton");
  const $userStatus = $("#userStatus");
  const $loginButtonFooter = $("#loginButtonFooter");

  if ($loginButton.length === 0 || $userStatus.length === 0) {
    // Reintentar
    setTimeout(updateHeaderUserStatus, 100);
    return;
  }

  if (isLoggedIn && currentUser) {
    // Para añadir el hola           <small class="user-logged-greeting mb-0" style="font-size: 0.75rem;"><white>Hola, </small>
    // Usuario logueado - modificar el contenido del loginButton
    $loginButton.html(`
      <div class="d-flex align-items-center gap-2">
        <i class="bi bi-person-check user-logged-icon" aria-hidden="true"></i>
        <div class="d-flex flex-column text-start">
          <span class="user-logged-name" style="font-size: 0.85rem;">${currentUser.nombre}</span>
        </div>
        <button class="btn btn-outline-secondary btn-logout ms-2" onclick="showLogoutConfirmModal()" title="Cerrar sesión">
          <i class="bi bi-box-arrow-right"></i>
        </button>
      </div>
    `);
    // Remover atributos del modal para evitar que se abra
    $loginButton.removeAttr("data-bs-toggle data-bs-target");
    $userStatus.hide();

    // Actualizar botón del footer - mismo icono que header cuando está logueado
    if ($loginButtonFooter.length > 0) {
      $loginButtonFooter.html(
        `<i class="bi bi-person-check user-logged-icon-footer"></i>`
      );
      // Remover eventos anteriores y agregar nuevo evento para logout
      $loginButtonFooter.off("click.loginModal click.logoutModal");
      $loginButtonFooter.on("click.logoutModal", function (e) {
        e.preventDefault();
        console.log("🖱️ Click en botón de logout del footer detectado");
        showLogoutConfirmModal();
      });
    }
  } else {
    // Usuario no logueado - restaurar botón original
    $loginButton.html(`
      <i class="bi bi-person-circle login-logo" aria-hidden="true"></i>
      <span class="visually-hidden">Iniciar sesión</span>
    `);
    $userStatus.hide();

    // Restaurar botón del footer al estado original
    if ($loginButtonFooter.length > 0) {
      $loginButtonFooter.html(`<i class="bi bi-person-circle"></i>`);
      // Remover eventos de logout y restaurar eventos de login
      $loginButtonFooter.off("click.logoutModal");
      // Los eventos de login se manejan en initLoginModal() de app.js
    }
  }
}

// Obtener usuario actual (función helper para otros scripts)
function getCurrentUser() {
  return currentUser;
}

// Verificar si está logueado (función helper para otros scripts)
function getIsLoggedIn() {
  return isLoggedIn;
}

// Función para permitir que otros scripts actualicen el estado de auth
function updateAuthState(userData, loginStatus) {
  currentUser = userData;
  isLoggedIn = loginStatus;

  // Actualizar localStorage también
  if (loginStatus && userData) {
    localStorage.setItem("currentUser", JSON.stringify(userData));
    localStorage.setItem("isLoggedIn", "true");
  } else {
    clearLocalAuth();
  }
}

// Función para mostrar modal de confirmación de logout
function showLogoutConfirmModal() {
  console.log("🔍 Mostrando modal de confirmación de logout");

  const modalElement = document.getElementById("logoutConfirmModal");

  if (modalElement) {
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
    console.log("✅ Modal de logout mostrado");
  } else {
    console.warn("⚠️ Modal de logout no encontrado, ejecutando logout directo");
    logout();
  }
}

// Funciones para uso global
window.updateHeaderUserStatus = updateHeaderUserStatus;
window.updateAuthState = updateAuthState;
window.logout = logout;
window.getCurrentUser = getCurrentUser;
window.getIsLoggedIn = getIsLoggedIn;
window.showLogoutConfirmModal = showLogoutConfirmModal;
