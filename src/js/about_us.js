// Lógica de la página "Sobre nosotros"
document.addEventListener('DOMContentLoaded', () => {
    // Frases de cada empleado, en el mismo orden que las tarjetas
    const frases = [
        'Del piano al PC, del PC al piano.',
        'Ojo con éste, es un completo canalla',
        'Su potente voz rota te dejará sin aliento.',
        'A pesar de su nombre, ¡lo tiene todo!'
    ];

    const isTouch = window.matchMedia('(pointer: coarse)').matches;

    document.querySelectorAll('.staffCard .card').forEach((card, idx) => {
        const cardBody = card.querySelector('.card-body');
        const nombre = cardBody.querySelector('.card-title').textContent;

        // Crear bloque amarillo con nombre y frase
        const bloque = document.createElement('div');
        bloque.className = 'staffCard-yellow-block';
        bloque.innerHTML = `<h5 class='card-title'>${nombre}</h5><div class='card-desc'>${frases[idx]}</div>`;
        card.appendChild(bloque);

        // Estado inicial: solo se ve el nombre (bloque abajo)
        bloque.style.transform = 'translateY(60%)';
        bloque.style.transition = 'transform 0.3s';

        // Ocultar el nombre original
        cardBody.style.visibility = 'hidden';

        // Ajuste dinámico del tamaño de fuente del nombre
        function fitText() {
            const h5 = bloque.querySelector('h5');
            h5.style.fontSize = '';
            h5.style.whiteSpace = 'nowrap';
            let fontSize = 1.2; // em
            const maxWidth = bloque.clientWidth - 32; // padding
            while (h5.scrollWidth > maxWidth && fontSize > 0.7) {
                fontSize -= 0.05;
                h5.style.fontSize = fontSize + 'em';
            }
        }
        fitText();
        window.addEventListener('resize', fitText);

        // Animación: hover para ratón, tap para táctil
        if (isTouch) {
            card.addEventListener('touchstart', () => {
                // Cerrar otros bloques abiertos
                document.querySelectorAll('.staffCard-yellow-block.open').forEach(b => {
                    if (b !== bloque) {
                        b.style.transform = 'translateY(60%)';
                        b.classList.remove('open');
                    }
                });
                // Abrir el tocado
                bloque.style.transform = 'translateY(0)';
                bloque.classList.add('open');
            });
        } else {
            card.addEventListener('mouseenter', () => {
                bloque.style.transform = 'translateY(0)';
                bloque.classList.add('open');
            });
            card.addEventListener('mouseleave', () => {
                bloque.style.transform = 'translateY(60%)';
                bloque.classList.remove('open');
            });
        }
    });
});