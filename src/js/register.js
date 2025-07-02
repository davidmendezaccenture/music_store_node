document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registerForm");

  if (!form) {
    console.warn("⚠️ No se encontró el formulario con ID 'registerForm'");
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const usuario = Object.fromEntries(formData.entries());

    if (usuario.email !== usuario.emailConfirm) {
      alert("Los correos electrónicos no coinciden");
      return;
    }

    if (usuario.password !== usuario.passwordConfirm) {
      alert("Las contraseñas no coinciden");
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
        alert(data.mensaje);

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
            // Guardar datos del usuario en localStorage
            localStorage.setItem(
              "currentUser",
              JSON.stringify(loginData.usuario)
            );
            localStorage.setItem("isLoggedIn", "true");

            // Actualizar estado de auth.js si está disponible
            if (typeof window.updateAuthState === "function") {
              window.updateAuthState(loginData.usuario, true);
            }

            alert("¡Registro exitoso! Has sido conectado automáticamente.");
          } else {
            alert("Registro exitoso. Por favor, inicia sesión manualmente.");
          }
        } catch (loginErr) {
          console.error("Error en auto-login:", loginErr);
          alert("Registro exitoso. Por favor, inicia sesión manualmente.");
        }

        window.location.href = "/index.html";
      } else {
        alert(data.error || "Error desconocido al registrar");
      }
    } catch (err) {
      console.error("Error al enviar el formulario:", err);
      alert("Error al registrar usuario");
    }
  });
});
