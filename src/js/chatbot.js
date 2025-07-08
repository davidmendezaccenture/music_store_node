// Funcionalidad del chatbot
$(function () {
  const $chatbotToggle = $("#chatbot-toggle");
  const $chatbotWindow = $("#chatbot-window");
  const $chatbotClose = $("#chatbot-close");
  const $chatbotInput = $("#chatbot-input");
  const $chatbotSend = $("#chatbot-send");
  const $chatbotMessages = $("#chatbot-messages");

  // Restaurar tamaño guardado del chatbot
  function restoreChatbotSize() {
    const savedWidth = localStorage.getItem("chatbot-width");
    const savedHeight = localStorage.getItem("chatbot-height");

    if (savedWidth) {
      $chatbotWindow.css("width", savedWidth + "px");
    }
    if (savedHeight) {
      $chatbotWindow.css("height", savedHeight + "px");
    }
  }

  // Guardar tamaño del chatbot
  function saveChatbotSize() {
    const width = $chatbotWindow.width();
    const height = $chatbotWindow.height();

    localStorage.setItem("chatbot-width", width);
    localStorage.setItem("chatbot-height", height);
  }

  // Implementar redimensionamiento personalizado desde esquina superior izquierda
  function setupCustomResize() {
    const $resizeHandle = $(".chatbot-resize-handle");
    let isResizing = false;
    let startX, startY, startWidth, startHeight;

    $resizeHandle.on("mousedown", function (e) {
      isResizing = true;
      startX = e.clientX;
      startY = e.clientY;
      startWidth = parseInt($chatbotWindow.css("width"), 10);
      startHeight = parseInt($chatbotWindow.css("height"), 10);

      // Prevenir selección de texto durante el resize
      e.preventDefault();
      $("body").css("user-select", "none");

      // Añadir clase para mostrar que se está redimensionando
      $chatbotWindow.addClass("resizing");
    });

    $(document).on("mousemove", function (e) {
      if (!isResizing) return;

      // Calcular nuevo tamaño (invertir la lógica porque estamos en esquina superior izquierda)
      const deltaX = startX - e.clientX; // Invertido
      const deltaY = startY - e.clientY; // Invertido

      const newWidth = Math.max(
        300,
        Math.min(window.innerWidth * 0.9, startWidth + deltaX)
      );
      const newHeight = Math.max(
        400,
        Math.min(window.innerHeight * 0.8, startHeight + deltaY)
      );

      $chatbotWindow.css({
        width: newWidth + "px",
        height: newHeight + "px",
      });

      // Guardar el nuevo tamaño
      saveChatbotSize();
    });

    $(document).on("mouseup", function () {
      if (isResizing) {
        isResizing = false;
        $("body").css("user-select", "");
        $chatbotWindow.removeClass("resizing");
      }
    });
  }

  // Observar cambios de tamaño (mantener para compatibilidad)
  function setupResizeObserver() {
    if (window.ResizeObserver) {
      const resizeObserver = new ResizeObserver(function (entries) {
        // Guardar el nuevo tamaño cuando el usuario redimensione
        saveChatbotSize();
      });

      resizeObserver.observe($chatbotWindow[0]);
    }
  }

  // Inicializar tamaño y funcionalidades
  restoreChatbotSize();
  setupCustomResize();
  setupResizeObserver();

  // Abrir/cerrar chatbot
  $chatbotToggle.on("click", function () {
    $chatbotWindow.toggleClass("d-none");
    if (!$chatbotWindow.hasClass("d-none")) {
      $chatbotInput.focus();
    }
  });

  $chatbotClose.on("click", function () {
    $chatbotWindow.addClass("d-none");
  });

  // Enviar mensaje
  function sendMessage() {
    const message = $chatbotInput.val().trim();
    if (!message) return;

    // Añadir mensaje del usuario
    addMessage(message, "user");
    $chatbotInput.val("");

    // Mostrar indicador de escritura
    showTypingIndicator();

    // Enviar al backend
    $.ajax({
      url: "/api/chatbot",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify({ message: message }),
      success: function (response) {
        hideTypingIndicator();
        addMessage(response.reply, "bot");
      },
      error: function () {
        hideTypingIndicator();
        addMessage(
          "Lo siento, hubo un error. Por favor, inténtalo de nuevo o usa nuestro formulario de contacto.",
          "bot"
        );
      },
    });
  }

  // Event listeners para envío
  $chatbotSend.on("click", sendMessage);
  $chatbotInput.on("keypress", function (e) {
    if (e.which === 13) {
      // Enter
      e.preventDefault();
      sendMessage();
    }
  });

  // Añadir mensaje al chat
  function addMessage(content, type) {
    const time = new Date().toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const messageHtml = `
      <div class="message ${type}-message">
        <div class="message-content">${content}</div>
        <div class="message-time">${time}</div>
      </div>
    `;

    $chatbotMessages.append(messageHtml);
    $chatbotMessages.scrollTop($chatbotMessages[0].scrollHeight);
  }

  // Mostrar indicador de escritura
  function showTypingIndicator() {
    const typingHtml = `
      <div class="typing-indicator" id="typing-indicator">
        <span>El asistente está escribiendo</span>
        <div class="typing-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    `;
    $chatbotMessages.append(typingHtml);
    $chatbotMessages.scrollTop($chatbotMessages[0].scrollHeight);
  }

  // Ocultar indicador de escritura
  function hideTypingIndicator() {
    $("#typing-indicator").remove();
  }

  // Cerrar chatbot al hacer clic fuera
  $(document).on("click", function (e) {
    if (!$(e.target).closest("#chatbot-container").length) {
      $chatbotWindow.addClass("d-none");
    }
  });

  // Prevenir que el chatbot se cierre al hacer clic dentro
  $("#chatbot-container").on("click", function (e) {
    e.stopPropagation();
  });

  // Ajustar el bottom del chatbot para no tapar el footer
  function adjustChatbotBottom() {
    var $chatbot = $("#chatbot-container");
    var footer = document.getElementById("footer");
    var chatbotDefaultBottom = 20;
    var chatbotRaisedBottom = 65;
    var threshold = 20; // Tolerancia para evitar parpadeos
    if (footer) {
      var footerRect = footer.getBoundingClientRect();
      var windowH = window.innerHeight || document.documentElement.clientHeight;
      // El salto ocurre cuando el final del footer está tocando la parte inferior de la ventana
      if (
        footerRect.bottom < windowH + threshold &&
        footerRect.bottom > windowH - threshold
      ) {
        $chatbot.css("bottom", chatbotRaisedBottom + "px", "important");
      } else {
        $chatbot.css("bottom", chatbotDefaultBottom + "px", "important");
      }
    } else {
      $chatbot.css("bottom", chatbotDefaultBottom + "px", "important");
    }
  }
  // Forzar siempre el valor inicial a 20px al cargar la página
  $(window).on("scroll resize", adjustChatbotBottom);
  $(window).on("pageshow", function () {
    $("#chatbot-container").css("bottom", "20px", "important");
    setTimeout(adjustChatbotBottom, 50);
  });
  $(function () {
    $("#chatbot-container").css("bottom", "20px", "important");
    setTimeout(adjustChatbotBottom, 50);
  });
  adjustChatbotBottom();
});
