// Función para obtener parámetros de la URL
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Cargar producto y mostrarlo
$(document).ready(function () {
    const productId = getQueryParam("id");
    if (!productId) return;

    $.getJSON("../assets/data/products.json", function (productos) {
        const producto = productos.find(
            (p) => String(p.id) === String(productId)
        );
        if (!producto) return;

        // Actualiza los elementos del DOM con los datos del producto
        $(".product-image")
            .attr("src", producto.image)
            .attr("alt", producto.name);
        $(".product-category").text(producto.category);
        $(".product-name").text(producto.name);
        $(".product-price").text(
            `${producto.offerPrice < producto.price
                ? producto.offerPrice
                : producto.price
            } €`
        );
        $(".product-old-price").text(
            producto.offerPrice < producto.price ? `${producto.price} €` : ""
        );
        $(".product-description").text(producto.description);
        $('.add-to-cart').attr('data-id', producto.id);
    });
});