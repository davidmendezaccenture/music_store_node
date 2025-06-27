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