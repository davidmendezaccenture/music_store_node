// Asegura que el CSS de cookies está cargado
function ensureCookiesCSS() {
    if (!document.querySelector('link[href*="cookies.css"]')) {
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/css/cookies.css';
        document.head.appendChild(link);
    }
}
// Banner/Modal de cookies para Rat Pack Instruments
(function () {
    // Generaliza la apertura automática de cualquier acordeón legal según el hash
    function autoOpenCollapseIfHash() {
        if (window.location.pathname.includes('legal.html') && window.location.hash.startsWith('#collapse')) {
            var collapseId = window.location.hash.substring(1); // quita el '#'
            var tryOpenCollapse = function (attempts) {
                var collapse = document.getElementById(collapseId);
                if (collapse && typeof bootstrap !== 'undefined') {
                    var bsCollapse = bootstrap.Collapse.getOrCreateInstance(collapse, { toggle: false });
                    bsCollapse.show();
                } else if (collapse) {
                    collapse.classList.add('show');
                } else if (attempts < 20) {
                    setTimeout(function () { tryOpenCollapse(attempts + 1); }, 100);
                }
            };
            tryOpenCollapse(0);
        }
    }
    console.log('[cookies.js] Script cargado');
    function showBanner() {
        console.log('[cookies.js] Ejecutando showBanner');
        // Comprobación de preferencia en localStorage
        if (localStorage.getItem('cookiesConsent')) {
            console.log('[cookies.js] Consentimiento ya guardado:', localStorage.getItem('cookiesConsent'));
            return;
        }

        // Asegurar que el CSS de cookies está cargado
        ensureCookiesCSS();
        // Crear el HTML del banner sin estilos inline, solo clases
        const banner = document.createElement('div');
        banner.id = 'cookies-banner';
        banner.setAttribute('role', 'dialog');
        banner.setAttribute('aria-modal', 'true');
        banner.setAttribute('aria-label', 'Aviso de cookies');
        banner.innerHTML = `
        <div id="cookies-banner-inner" class="cookies-banner-inner">
          <div class="cookies-banner-content">
            <div class="cookies-banner-row">
              <i class="bi bi-cookie cookies-banner-icon" aria-hidden="true"></i>
              <span class="cookies-banner-text">Usamos cookies propias y de terceros para mejorar tu experiencia, analizar el tráfico y personalizar el contenido. Puedes aceptar todas o rechazar las no esenciales.</span>
            </div>
            <div class="cookies-banner-actions">
              <button id="cookies-accept" class="cookies-btn-accept" type="button">Aceptar todas</button>
              <button id="cookies-reject" class="cookies-btn-reject" type="button">Rechazar no esenciales</button>
              <a id="cookies-more-info" class="cookies-more-info" href="/pages/legal.html#collapseCookies">Más información</a>
            </div>
          </div>
        </div>
      `;

        // Insertar el banner al final del body
        document.body.appendChild(banner);
        console.log('[cookies.js] Banner insertado en el DOM');
        // Animación de aparición (después de renderizar)
        setTimeout(function () {
            var inner = document.getElementById('cookies-banner-inner');
            if (inner) {
                inner.classList.add('show');
            }
        }, 350); // Espera a que la página esté visible

        // Función para guardar preferencia y ocultar banner (con try/catch)
        function setConsent(value) {
            try {
                localStorage.setItem('cookiesConsent', value);
            } catch (e) {
                console.warn('[cookies.js] Error guardando preferencia en localStorage:', e);
            }
            banner.remove();
            console.log('[cookies.js] Consentimiento guardado:', value);
        }

        // Eventos de los botones
        document.getElementById('cookies-accept').onclick = function () {
            setConsent('accepted');
        };
        document.getElementById('cookies-reject').onclick = function () {
            setConsent('rejected');
        };

        // Evento para el enlace de más información
        document.getElementById('cookies-more-info').onclick = function (e) {
            // Si ya estamos en legal.html, abrir el collapse de cookies y actualizar el hash
            var isLegal = window.location.pathname.includes('legal.html');
            if (isLegal) {
                e.preventDefault();
                // Cambia el hash para que la función autoOpenCollapseIfHash también funcione si el usuario navega manualmente
                if (window.location.hash !== '#collapseCookies') {
                    window.location.hash = '#collapseCookies';
                }
                // Esperar a que el DOM y Bootstrap estén listos y el acordeón esté en el DOM
                var tryOpenCollapse = function (attempts) {
                    var collapse = document.getElementById('collapseCookies');
                    if (collapse && typeof bootstrap !== 'undefined') {
                        var bsCollapse = bootstrap.Collapse.getOrCreateInstance(collapse, { toggle: false });
                        bsCollapse.show();
                    } else if (collapse) {
                        collapse.classList.add('show');
                    } else if (attempts < 20) {
                        setTimeout(function () { tryOpenCollapse(attempts + 1); }, 100);
                    }
                };
                tryOpenCollapse(0);
            }
            // Si no, dejar que el enlace navegue normalmente
        };
    }

    function onDomReady() {
        showBanner();
        autoOpenCollapseIfHash();
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', onDomReady);
    } else {
        onDomReady();
    }
})();