$(document).ready(function () {
  // Autocompletar email si hay usuario logueado
  $.get("/api/current-user", function (data) {
    if (data && data.isLoggedIn && data.usuario && data.usuario.email) {
      $("#newsletterEmail").val(data.usuario.email).prop("readonly", true);
      $("#newsletterEmailBottom")
        .val(data.usuario.email)
        .prop("readonly", true);
    }
  });

  // Función para mostrar el toast
  function showNewsletterToast() {
    const toast = new bootstrap.Toast($("#newsletterToast"));
    toast.show();
  }

  // Función para validar email
  function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Función para procesar suscripción
  function processSubscription(email, formElement) {
    if (!validateEmail(email)) {
      // Mostrar error de validación
      const input = formElement.find('input[type="email"]');
      input.addClass("is-invalid");
      input.focus();
      return;
    }

    // Remover clase de error si existía
    formElement.find('input[type="email"]').removeClass("is-invalid");

    // Simular procesamiento (añadir lógica del backend)
    console.log("Suscripción procesada para:", email);

    // Limpiar formulario
    formElement.find('input[type="email"]').val("");

    // Mostrar toast de éxito
    showNewsletterToast();
  }

  // Event listener para el formulario principal
  $("#newsletterForm").on("submit", function (e) {
    e.preventDefault();
    const email = $("#newsletterEmail").val().trim();
    processSubscription(email, $(this));
  });

  // Event listener para el formulario inferior
  $("#newsletterFormBottom").on("submit", function (e) {
    e.preventDefault();
    const email = $("#newsletterEmailBottom").val().trim();
    processSubscription(email, $(this));
  });

  // Remover clase de error al escribir
  $('input[type="email"]').on("input", function () {
    $(this).removeClass("is-invalid");
  });

  // Animación suave para las cards de beneficios
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.animation = "fadeInUp 0.6s ease forwards";
      }
    });
  }, observerOptions);

  // Observar las cards de beneficios
  $(".benefit-card").each(function (index) {
    $(this).css({
      opacity: "0",
      transform: "translateY(20px)",
    });
    observer.observe(this);

    // Delay escalonado para cada card
    setTimeout(() => {
      $(this).css("animation-delay", `${index * 0.1}s`);
    }, 100);
  });
});
