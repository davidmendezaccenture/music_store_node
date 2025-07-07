// Banner/Modal de cookies para Rat Pack Instruments
// Banner/Modal de cookies para Rat Pack Instruments
(function () {
    // Si estamos en legal.html y la URL contiene #collapseCookies, abrir el collapse automáticamente
    function autoOpenCollapseIfHash() {
        if (window.location.pathname.includes('legal.html') && window.location.hash === '#collapseCookies') {
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
    }
    console.log('[cookies.js] Script cargado');
    function showBanner() {
        console.log('[cookies.js] Ejecutando showBanner');
        // Comprobación de preferencia en localStorage
        if (localStorage.getItem('cookiesConsent')) {
            console.log('[cookies.js] Consentimiento ya guardado:', localStorage.getItem('cookiesConsent'));
            return;
        }

        // Crear el HTML del banner
        const banner = document.createElement('div');
        banner.id = 'cookies-banner';
        banner.innerHTML = `
        <div id="cookies-banner-inner" style="position:fixed;bottom:-100px;left:0;width:100vw;z-index:2000;background:rgba(255,255,255,0.98);box-shadow:0 -2px 16px #0002;display:flex;justify-content:center;align-items:center;padding:1.5rem 0;opacity:0;transition:bottom 0.6s cubic-bezier(.4,1.6,.4,1),opacity 0.6s cubic-bezier(.4,1.6,.4,1);">
          <div style="max-width:700px;width:90vw;display:flex;flex-direction:column;align-items:center;gap:1rem;">
            <div style="display:flex;align-items:center;gap:0.75rem;">
              <i class="bi bi-cookie" style="font-size:2rem;color:#f6a61a;"></i>
              <span style="font-size:1.1rem;color:#333;font-weight:500;">Usamos cookies propias y de terceros para mejorar tu experiencia, analizar el tráfico y personalizar el contenido. Puedes aceptar todas o rechazar las no esenciales.</span>
            </div>
            <div style="display:flex;gap:0.5rem;flex-wrap:wrap;justify-content:center;">
              <button id="cookies-accept" style="background:#f6a61a;color:#fff;font-weight:600;border:none;padding:0.5rem 1.5rem;border-radius:6px;transition:background 0.2s;">Aceptar todas</button>
              <button id="cookies-reject" style="background:transparent;color:#f6a61a;font-weight:600;border:2px solid #f6a61a;padding:0.5rem 1.5rem;border-radius:6px;transition:background 0.2s;">Rechazar no esenciales</button>
              <a id="cookies-more-info" href="/pages/legal.html#collapseCookies" style="color:#333;text-decoration:underline;font-size:0.98rem;align-self:center;">Más información</a>
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
                inner.style.bottom = '0';
                inner.style.opacity = '1';
            }
        }, 350); // Espera a que la página esté visible

        // Función para guardar preferencia y ocultar banner
        function setConsent(value) {
            localStorage.setItem('cookiesConsent', value);
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
            // Si ya estamos en legal.html, abrir el collapse
            var isLegal = window.location.pathname.includes('legal.html');
            if (isLegal) {
                e.preventDefault();
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
