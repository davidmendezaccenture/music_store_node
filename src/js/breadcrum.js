// breadcrum.js: Breadcrumbs dinámicos básicos

$(document).ready(function () {
    // Carga dinámica del breadcrumb igual que el header
    $("#breadcrumb-nav").load("/pages/breadcrum.html", function () {
        renderBreadcrumb();
    });

    // Diccionario de nombres legibles
    const familiasNombres = {
        cuerda: "Cuerda",
        percusion: "Percusión",
        teclado: "Teclado"
    };
    const categoriasNombres = {
        "acoustic-guitars": "Acústicas",
        "electric-guitars": "Eléctricas",
        "classical-guitars": "Clásicas",
        basses: "Bajos",
        drums: "Baterías",
        "acoustic-drums": "Baterías acústicas",
        "electronic-drums": "Baterías electrónicas",
        "drum-accessories": "Accesorios",
        synths: "Sintetizadores",
        "digital-pianos": "Pianos digitales",
        keyboards: "Teclados"
    };

    function renderBreadcrumb() {
        const breadcrumbOl = document.querySelector("#breadcrumb-nav .breadcrumb");
        if (!breadcrumbOl) return;

        const currentPage = window.location.pathname.split("/").pop();
        let crumbs = [];

        if (currentPage === "catalog.html") {
            // Leer familia y categoría de la URL
            const params = new URLSearchParams(window.location.search);
            const familia = params.get("familia") || localStorage.getItem("familiaCatalogoActiva") || "cuerda";
            const categoria = params.get("category") || null;

            crumbs = [
                { label: "Inicio", url: "/pages/index.html" },
                { label: "Catálogo", url: "/pages/catalog.html" }
            ];
            if (familia && familiasNombres[familia]) {
                crumbs.push({ label: familiasNombres[familia], url: `catalog.html?familia=${familia}` });
            }
            if (categoria && categoriasNombres[categoria]) {
                crumbs.push({ label: categoriasNombres[categoria], url: null });
            }
        } else if (currentPage === "detail-product.html") {
            crumbs = [
                { label: "Inicio", url: "/pages/index.html" },
                { label: "Catálogo", url: "/pages/catalog.html" },
                { label: "Detalle producto", url: null }
            ];
        } else if (currentPage === "cart.html") {
            crumbs = [
                { label: "Inicio", url: "/pages/index.html" },
                { label: "Carrito", url: null }
            ];
        } else if (currentPage === "checkout.html") {
            crumbs = [
                { label: "Inicio", url: "/pages/index.html" },
                { label: "Carrito", url: "/pages/cart.html" },
                { label: "Checkout", url: null }
            ];
        } else {
            crumbs = [
                { label: "Inicio", url: null }
            ];
        }

        breadcrumbOl.innerHTML = crumbs.map(c =>
            c.url
                ? `<li class="breadcrumb-item"><a href="${c.url}">${c.label}</a></li>`
                : `<li class="breadcrumb-item active" aria-current="page">${c.label}</li>`
        ).join("");
    }

    // Actualizar breadcrumb al cambiar el historial (por ejemplo, setFamilia)
    window.addEventListener('popstate', renderBreadcrumb);
    // También si cambia la URL por pushState/replaceState (catálogo)
    // Monkey patch para detectar cambios de URL por JS
    (function (history) {
        const pushState = history.pushState;
        const replaceState = history.replaceState;
        history.pushState = function () {
            const ret = pushState.apply(this, arguments);
            window.dispatchEvent(new Event('popstate'));
            return ret;
        };
        history.replaceState = function () {
            const ret = replaceState.apply(this, arguments);
            window.dispatchEvent(new Event('popstate'));
            return ret;
        };
    })(window.history);
});
