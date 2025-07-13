document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registerForm");
  const capFld = document.getElementById("captcha");
  const capLbl = document.getElementById("captchaLabel");

  // Genera un captcha aleatorio
  let captcha = Math.floor(1000 + Math.random() * 9000).toString();
  if (capLbl) capLbl.textContent = "Captcha: " + captcha;

  // Función para mostrar mensajes en una modal Bootstrap
  function mostrarModal(mensaje, titulo = "Mensaje", callback = null) {
    const modalBody = document.getElementById("mensajeModalBody");
    const modalTitle = document.getElementById("mensajeModalLabel");
    const modalElement = document.getElementById("mensajeModal");
    if (modalBody && modalTitle && modalElement) {
      modalBody.textContent = mensaje;
      modalTitle.textContent = titulo;
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
      if (callback) {
        modalElement.addEventListener("hidden.bs.modal", function handler() {
          modalElement.removeEventListener("hidden.bs.modal", handler);
          callback();
        });
      }
    } else {
      alert(mensaje); // Fallback
      if (callback) callback();
    }
  }

  if (!form) {
    console.warn("⚠️ No se encontró el formulario con ID 'registerForm'");
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Validar captcha
    if (capFld && capFld.value !== captcha) {
      mostrarModal("Captcha incorrecto", "Error");
      return;
    }

    const formData = new FormData(form);
    const usuario = Object.fromEntries(formData.entries());

    // Validación extra: email y contraseña coinciden
    if (usuario.email !== usuario.emailConfirm) {
      mostrarModal("Los correos electrónicos no coinciden", "Error");
      return;
    }
    if (usuario.password !== usuario.passwordConfirm) {
      mostrarModal("Las contraseñas no coinciden", "Error");
      return;
    }

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(usuario),
      });

      const data = await res.json();

      if (res.ok) {
        // Auto-login después del registro exitoso
        try {
          const loginRes = await fetch("/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: usuario.email,
              password: usuario.password,
            }),
          });

          const loginData = await loginRes.json();

          if (loginRes.ok) {
            localStorage.setItem("currentUser", JSON.stringify(loginData.usuario));
            localStorage.setItem("isLoggedIn", "true");

            // FUSIONAR CARRITO DE GUEST CON EL DEL USUARIO
            const guestItems = JSON.parse(localStorage.getItem('cart')) || [];
            console.log("Carrito guest:", guestItems);
            if (guestItems.length) {
              try {
                const userCartRes = await fetch(`/api/cart?user=${encodeURIComponent(loginData.usuario.email)}`);
                const userCartData = await userCartRes.json();
                let userItems = userCartData.items || [];
                console.log("Carrito usuario antes de fusionar:", userItems);
                for (let guestItem of guestItems) {
                  const found = userItems.find(item => item.id === guestItem.id);
                  if (found) {
                    found.quantity = (found.quantity || 1) + (guestItem.quantity || 1);
                  } else {
                    userItems.push(guestItem);
                  }
                }
                console.log("Carrito usuario después de fusionar:", userItems);
                await fetch('/api/cart', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ user: loginData.usuario.email, items: userItems })
                });
                localStorage.setItem('cart', JSON.stringify([]));
                if (typeof window.updateCartCount === "function") {
                  window.updateCartCount(userItems);
                }
              } catch (fusionErr) {
                console.error("Error al fusionar carritos:", fusionErr);
              }
            }
            if (typeof window.updateAuthState === "function") {
              window.updateAuthState(loginData.usuario, true);
            }
            mostrarModal(
              "¡Registro exitoso! Has sido conectado automáticamente.",
              "Bienvenido",
              () => {
                window.location.href = "/index.html";
              }
            );
          } else {
            mostrarModal(
              "Registro exitoso. Por favor, inicia sesión manualmente.",
              "Atención",
              () => {
                window.location.href = "/index.html";
              }
            );
          }
        } catch (loginErr) {
          console.error("Error en auto-login:", loginErr);
          mostrarModal(
            "Registro exitoso. Por favor, inicia sesión manualmente.",
            "Atención",
            () => {
              window.location.href = "/index.html";
            }
          );
        }
      } else {
        mostrarModal(data.error || "Error desconocido al registrar", "Error");
      }
    } catch (err) {
      console.error("Error al enviar el formulario:", err);
      mostrarModal("Error al registrar usuario", "Error");
    }
  });
});

