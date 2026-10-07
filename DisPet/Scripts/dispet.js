// ============================================================
// DISPET — Pagina de producto
// JavaScript vanilla (sin librerias externas). Se organiza en
// pequenas funciones, una por comportamiento, y todas se
// arrancan al final del archivo cuando el HTML ya cargo.
//
// Indice:
//   1. iniciarNavegacion()      -> fondo de la barra + menu movil
//   2. iniciarParallaxHero()    -> mueve la imagen del hero al hacer scroll
//   3. iniciarRevelado()        -> aparece el contenido con IntersectionObserver
//   4. iniciarSelectorMascota() -> alterna la imagen perro/gato
// ============================================================

(function () {
    "use strict";

    // Esta variable se usa en varias funciones para saber si
    // debemos animar o no. Se calcula una sola vez.
    var prefiereMenosMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;


    // ------------------------------------------------------------
    // 1. Barra de navegacion
    // ------------------------------------------------------------
    function iniciarNavegacion() {
        var nav = document.getElementById("nav");
        if (!nav) { return; }

        // Le agregamos fondo solido a la barra solo despues de
        // haber bajado unos pixeles, para que arranque transparente
        // sobre el hero.
        function alHacerScroll() {
            if (window.scrollY > 10) {
                nav.classList.add("nav-con-fondo");
            } else {
                nav.classList.remove("nav-con-fondo");
            }
        }
        window.addEventListener("scroll", alHacerScroll, { passive: true });
        alHacerScroll();

        // Menu hamburguesa para celular: un clic muestra u oculta
        // la lista de enlaces.
        var botonMenu = document.getElementById("botonMenu");
        var menuMovil = document.getElementById("menuMovil");
        if (botonMenu && menuMovil) {
            botonMenu.addEventListener("click", function () {
                var abierto = menuMovil.classList.toggle("nav-abierto");
                botonMenu.setAttribute("aria-expanded", abierto ? "true" : "false");
            });
        }
    }


    // ------------------------------------------------------------
    // 2. Parallax de la imagen del hero
    //
    // Cada vez que el usuario hace scroll, movemos la imagen con
    // CSS transform usando un factor menor a 1 (0.25). Como la
    // imagen se mueve mas lento que el resto de la pagina, se ve
    // un efecto de profundidad.
    //
    // Usamos requestAnimationFrame para no recalcular el estilo en
    // cada pixel de scroll (que dispara el evento muchas veces por
    // segundo), sino una sola vez por cuadro de animacion.
    // ------------------------------------------------------------
    function iniciarParallaxHero() {
        var imagenHero = document.getElementById("heroImagen");
        if (!imagenHero) { return; }

        // Si el usuario prefiere menos movimiento, dejamos la
        // imagen quieta y no enganchamos el evento de scroll.
        if (prefiereMenosMovimiento) { return; }

        var actualizacionPendiente = false;
        var factorParallax = 0.25;

        function moverImagen() {
            var desplazamiento = window.scrollY;
            imagenHero.style.transform = "translateY(" + (desplazamiento * factorParallax) + "px)";
            actualizacionPendiente = false;
        }

        window.addEventListener("scroll", function () {
            // Si ya hay un cuadro pedido, no pedimos otro: evita
            // acumular trabajo si el scroll es muy rapido.
            if (!actualizacionPendiente) {
                actualizacionPendiente = true;
                requestAnimationFrame(moverImagen);
            }
        }, { passive: true });
    }


    // ------------------------------------------------------------
    // 3. Revelado de contenido al hacer scroll
    //
    // IntersectionObserver avisa cuando un elemento entra o sale
    // del area visible de la pantalla, sin que tengamos que medir
    // posiciones a mano en cada evento de scroll (mas eficiente
    // que calcularlo nosotros).
    //
    // Por cada elemento con la clase .reveal, el navegador nos
    // llama cuando cambia su visibilidad. Si entro en pantalla
    // (isIntersecting), le agregamos .reveal-activo, que es la
    // clase que en el CSS dispara la transicion de aparicion.
    // ------------------------------------------------------------
    function iniciarRevelado() {
        var elementos = document.querySelectorAll(".reveal");

        // Si el usuario prefiere menos movimiento, mostramos todo
        // de inmediato y no observamos nada.
        if (prefiereMenosMovimiento) {
            elementos.forEach(function (elemento) {
                elemento.classList.add("reveal-activo");
            });
            return;
        }

        var opciones = {
            // El elemento se considera "visible" cuando al menos
            // un 20% de su alto esta dentro de la pantalla.
            threshold: 0.2
        };

        var observador = new IntersectionObserver(function (entradas) {
            entradas.forEach(function (entrada) {
                if (entrada.isIntersecting) {
                    entrada.target.classList.add("reveal-activo");
                    // Ya se revelo: dejamos de observarlo para no
                    // seguir recibiendo avisos de este elemento.
                    observador.unobserve(entrada.target);
                }
            });
        }, opciones);

        elementos.forEach(function (elemento) {
            observador.observe(elemento);
        });
    }


    // ------------------------------------------------------------
    // 4. Selector de mascota (perro / gato)
    //
    // Funciona igual que el selector de color de una pagina de
    // producto: varios botones, cada uno con un atributo
    // data-mascota. Al hacer clic, buscamos la imagen cuyo
    // data-mascota coincide y la marcamos como "activa"; las
    // demas pierden esa clase. El CSS se encarga de mostrar solo
    // la imagen activa (ver seccion 7 de dispet.css).
    // ------------------------------------------------------------
    function iniciarSelectorMascota() {
        var botones = document.querySelectorAll(".selector-boton");
        var imagenes = document.querySelectorAll(".selector-imagen");
        if (botones.length === 0) { return; }

        botones.forEach(function (boton) {
            boton.addEventListener("click", function () {
                var mascotaElegida = boton.getAttribute("data-mascota");

                // Actualizamos el estado visual de los botones.
                botones.forEach(function (b) {
                    var esElElegido = b === boton;
                    b.classList.toggle("activa", esElElegido);
                    b.setAttribute("aria-pressed", esElElegido ? "true" : "false");
                });

                // Mostramos solo la imagen que corresponde a la
                // mascota elegida.
                imagenes.forEach(function (img) {
                    img.classList.toggle("activa", img.getAttribute("data-mascota") === mascotaElegida);
                });
            });
        });
    }


    // ------------------------------------------------------------
    // Arranque: esperamos a que el HTML este listo antes de
    // buscar elementos en el DOM.
    // ------------------------------------------------------------
    document.addEventListener("DOMContentLoaded", function () {
        iniciarNavegacion();
        iniciarParallaxHero();
        iniciarRevelado();
        iniciarSelectorMascota();
    });
})();
