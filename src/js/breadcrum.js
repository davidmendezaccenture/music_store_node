// breadcrum.js: Breadcrumbs dinámicos básicos

$(document).ready(function () {
    // El breadcrumb se actualizará solo tras repoblar el filtro desde catalog.js
    // No manipular ni limpiar el filtro de categoría aquí
    //$(document).on('change', '#filtro-familia', function () {});
    // Actualizar breadcrumb al cambiar la categoría del filtro
    $(document).on('change', '#filtro-categoria', function () {
        renderBreadcrumb();
    });

    // Actualizar breadcrumb al cambiar el filtro de precio
    $(document).on('change', '#filtro-precio', function () {
        renderBreadcrumb();
    });

    // Actualizar breadcrumb al cambiar el filtro de ofertas
    $(document).on('change', '#filtro-oferta', function () {
        renderBreadcrumb();
    });

    // Escuchar eventos personalizados para cambio de familia
    $(document).on('familiaChanged', function () {
        renderBreadcrumb();
    });
    // Carga dinámica del breadcrumb igual que el header
    // Carga el HTML del breadcrumb y llama a renderBreadcrumb cuando esté listo
    $("#breadcrumb-nav").load("/pages/breadcrum.html", function () {
        renderBreadcrumb();
    });

    // Monkey patch para detectar cambios de URL por pushState/replaceState (solo una vez)
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

    // Diccionario de nombres legibles
    // ¡IMPORTANTE! Si se añaden nuevas categorías en el catálogo, actualiza este objeto:
    const familiasNombres = {
        cuerda: "Cuerda",
        percusion: "Percusión",
        teclado: "Teclado",
        todos: "Todos los productos" // Familia especial para mostrar todos los productos
    };
    // Nombres legibles para todas las categorías actuales (julio 2025)
    const categoriasNombres = {
        // Cuerda
        "acoustic-guitars": "Acústicas",
        "electric-guitars": "Eléctricas",
        "classical-guitars": "Clásicas",
        basses: "Bajos",
        // Percusión
        "batería acústica": "Batería acústica",
        "batería electrónica": "Batería electrónica",
        "platillos": "Platillos",
        "caja de madera": "Caja de madera",
        "pedal de bombo": "Pedal de bombo",
        "set de batería": "Set de batería",
        "batería infantil": "Batería infantil",
        "bateria studio pro": "Batería Studio Pro",
        "set de percusión": "Set de percusión",
        "caja": "Caja",
        "batería jazz studio": "Batería Jazz Studio",
        // Teclado
        "teclado digital": "Teclado digital",
        "sintetizador analógico": "Sintetizador analógico",
        "workstation": "Workstation",
        "teclado compacto urbankeys": "Teclado compacto UrbanKeys",
        "sintetizador digital": "Sintetizador digital",
        "piano digital studio88": "Piano digital Studio88",
        "teclado portátil easyplay": "Teclado portátil EasyPlay",
        "teclado infantil funkkeys": "Teclado infantil FunKeys",
        "piano digital homeclassic": "Piano digital HomeClassic",
        keyboards: "Teclados",
        "teclado vintage": "Teclado vintage",
        "sintetizador modular": "Sintetizador modular",
        // Otros (por si acaso)
        "amplifiers": "Amplificadores",
        "effect-pedals": "Pedales de efectos"
    };

    // Nombres legibles para rangos de precio
    const preciosNombres = {
        "0-100": "Menos de €100",
        "0-200": "Menos de €200",
        "0-300": "Menos de €300",
        "0-500": "Menos de €500",
        "100-300": "€100 - €300",
        "200-500": "€200 - €500",
        "300-600": "€300 - €600",
        "500-1000": "€500 - €1000",
        "1000-2000": "€1000 - €2000",
        "1000-99999": "Más de €1000",
        "2000-99999": "Más de €2000"
    };

    function renderBreadcrumb() {
        const breadcrumbOl = document.querySelector("#breadcrumb-nav .breadcrumb");
        if (!breadcrumbOl) {
            // Si no existe aún, reintenta tras un pequeño retardo (por carga asíncrona)
            setTimeout(renderBreadcrumb, 30);
            return;
        }

        const currentPage = window.location.pathname.split("/").pop();
        let crumbs = [];

        if (currentPage === "catalog.html") {
            // Leer familia de la URL o localStorage
            const params = new URLSearchParams(window.location.search);
            const familia = params.get("familia") || localStorage.getItem("familiaCatalogoActiva") || "cuerda";
            // Leer categoría del filtro si existe en el DOM, si no, de la URL
            let categoria = null;
            const filtroCategoria = document.getElementById("filtro-categoria");
            if (filtroCategoria && filtroCategoria.value) {
                // Verificar que la categoría pertenece a la familia actual
                const categoriasValidasParaFamilia = {
                    cuerda: ["acoustic-guitars", "electric-guitars", "classical-guitars", "basses"],
                    percusion: ["batería acústica", "batería electrónica", "platillos", "caja de madera", "pedal de bombo", "set de batería", "batería infantil", "bateria studio pro", "set de percusión", "caja", "batería jazz studio"],
                    teclado: ["teclado digital", "sintetizador analógico", "workstation", "teclado compacto urbankeys", "sintetizador digital", "piano digital studio88", "teclado portátil easyplay", "teclado infantil funkkeys", "piano digital homeclassic", "keyboards", "teclado vintage", "sintetizador modular"],
                    todos: [] // Para familia "todos", cualquier categoría es válida
                };
                const categoriasValidas = categoriasValidasParaFamilia[familia] || [];
                // Si es familia "todos", permitir cualquier categoría
                if (familia === 'todos' || categoriasValidas.includes(filtroCategoria.value)) {
                    categoria = filtroCategoria.value;
                }
            } else {
                categoria = params.get("category") || null;
            }

            // Leer filtro de precio del DOM o de la URL
            let precio = null;
            const filtroPrecio = document.getElementById("filtro-precio");
            if (filtroPrecio && filtroPrecio.value) {
                precio = filtroPrecio.value;
            } else {
                precio = params.get("precio") || null;
            }

            // Leer filtro de ofertas del DOM o de la URL
            let ofertas = false;
            const filtroOfertas = document.getElementById("filtro-oferta");
            if (filtroOfertas && filtroOfertas.checked) {
                ofertas = true;
            } else {
                ofertas = params.get("ofertas") === "true" || params.get("ofertas") === "1";
            }

            crumbs = [
                { label: "Inicio", url: "/pages/index.html" },
                { label: "Catálogo", action: "resetearCatalogo" }
            ];
            // Solo mostrar la familia si NO es "todos"
            if (familia && familiasNombres[familia] && familia !== 'todos') {
                crumbs.push({ label: familiasNombres[familia], action: `setFamilia('${familia}')` });
            }
            if (categoria) {
                let label = categoriasNombres[categoria];
                if (!label) {
                    // Si no está en el diccionario, mostrar la categoría de la URL/filtro de forma legible
                    let decoded = decodeURIComponent(categoria)
                        .replace(/[-_]/g, ' ')
                        .replace(/\s+/g, ' ')
                        .trim();
                    // Primera letra en mayúscula
                    label = decoded.charAt(0).toUpperCase() + decoded.slice(1);
                }
                crumbs.push({ label, url: null });
            }
            if (precio) {
                let label = preciosNombres[precio];
                let isCustomPrice = false;
                if (!label) {
                    // Si no está en el diccionario, mostrar el precio de forma legible
                    if (precio.includes('-')) {
                        const [min, max] = precio.split('-');
                        if (max === '99999') {
                            label = `Más de €${min}`;
                        } else {
                            label = `€${min} - €${max}`;
                        }
                    } else {
                        label = precio;
                        isCustomPrice = true;
                    }
                }
                crumbs.push({ label, url: null, isPrice: true, isCustomPrice });
            }
            if (ofertas) {
                crumbs.push({ label: "OFERTAS", url: null, isOffer: true });
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

        breadcrumbOl.innerHTML = crumbs.map(c => {
            if (c.url) {
                return `<li class="breadcrumb-item"><a class="breadcrumb-tab" href="${c.url}">${c.label}</a></li>`;
            } else if (c.action) {
                return `<li class="breadcrumb-item"><a class="breadcrumb-tab" href="#" onclick="${c.action}(); return false;">${c.label}</a></li>`;
            } else {
                if (c.isOffer) {
                    return `<li class="breadcrumb-item active" aria-current="page"><span class="offer-badge">${c.label}</span></li>`;
                } else if (c.isPrice) {
                    if (c.isCustomPrice) {
                        return `<li class="breadcrumb-item active" aria-current="page"><span class="price-label">Precio:</span> <span class="price-badge">${c.label}</span></li>`;
                    } else {
                        return `<li class="breadcrumb-item active" aria-current="page"><span class="price-badge">${c.label}</span></li>`;
                    }
                } else {
                    return `<li class="breadcrumb-item active" aria-current="page">${c.label}</li>`;
                }
            }
        }).join("");

        // Actualizar breadcrumb al cambiar el historial (por ejemplo, setFamilia)
        window.addEventListener('popstate', renderBreadcrumb);

        // Ejecutar después de cada actualización del breadcrumb
        afterBreadcrumbUpdate();
    }

    // Ejecutar después de cada actualización del breadcrumb
    function afterBreadcrumbUpdate() {
        // Solo esperar a que se complete el renderizado, sin funciones complejas
        setTimeout(() => {
            // Simple check sin loops infinitos
            console.log('Breadcrumb updated');
        }, 50);
    }

});
