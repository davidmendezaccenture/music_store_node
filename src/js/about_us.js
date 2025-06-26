// Inicialización de lógica para la página Sobre nosotros
$(function () {
    // Descripción empleado
    const phrases = [
        'Del piano al PC, del PC al piano.',
        'Ojo con éste, es un completo canalla',
        'Su potente voz rota te dejará sin aliento.',
        'A pesar de su nombre, ¡lo tiene todo!'
    ];

    const isTouch = window.matchMedia('(pointer: coarse)').matches;

    // Recorrido de cada tarjeta de empleado
    $('.staffCard .card').each(function (idx) {
        const $card = $(this);
        const $cardBody = $card.find('.card-body');
        const name = $cardBody.find('.card-title').text();

        // Creación del bloque amarillo con nombre y frase
        const $yellowBlock = $('<div>', { class: 'staffCard-yellow-block' });
        $yellowBlock.html(`<h5 class='card-title'>${name}</h5><div class='card-desc'>${phrases[idx]}</div>`);
        $card.append($yellowBlock);

        // Bloque amarillo NO hover
        $yellowBlock.css({
            transform: 'translateY(60%)',
            transition: 'transform 0.3s'
        });

        // Ajuste dinámico del tamaño de fuente del nombre
        function fitText() {
            const $h5 = $yellowBlock.find('h5');
            $h5.css({ fontSize: '', whiteSpace: 'nowrap' });
            let fontSize = 1.2; // em
            const maxWidth = $yellowBlock.innerWidth();
            while ($h5[0].scrollWidth > maxWidth && fontSize > 0.7) {
                fontSize -= 0.05;
                $h5.css('fontSize', fontSize + 'em');
            }
        }
        fitText();
        $(window).on('resize', fitText);

        // Animación de apertura: hover para ratón, tap para táctil
        if (isTouch) {
            $card.on('touchstart', function () {
                $('.staffCard-yellow-block.open').each(function () {
                    if (this !== $yellowBlock[0]) {
                        $(this).css('transform', 'translateY(60%)').removeClass('open');
                    }
                });
                $yellowBlock.css('transform', 'translateY(0)').addClass('open');
            });
        } else {
            $card.on('mouseenter', function () {
                $yellowBlock.css('transform', 'translateY(0)').addClass('open');
            });
            $card.on('mouseleave', function () {
                $yellowBlock.css('transform', 'translateY(60%)').removeClass('open');
            });
        }
    });
});