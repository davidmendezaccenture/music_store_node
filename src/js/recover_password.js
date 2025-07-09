document.getElementById("recoverForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  // Recoge los valores del formulario
  const email = document.getElementById("recoverEmail").value.trim();
  const newPassword = document.getElementById("newPassword").value;
  const confirmNewPassword = document.getElementById("confirmNewPassword").value;

  // Envía la petición al backend
  try {
    const response = await fetch("/api/recover-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, newPassword, confirmNewPassword }),
    });

    const data = await response.json();

    // Muestra el mensaje en el modal
    document.getElementById("mensajeModalBody").textContent = data.mensaje || data.error;
    const modal = new bootstrap.Modal(document.getElementById("mensajeModal"));
    modal.show();

    // Si fue exitoso, limpia el formulario
    if (response.ok) {
      document.getElementById("recoverForm").reset();
    }
  } catch (err) {
    document.getElementById("mensajeModalBody").textContent = "Error de conexión con el servidor.";
    const modal = new bootstrap.Modal(document.getElementById("mensajeModal"));
    modal.show();
  }
});


