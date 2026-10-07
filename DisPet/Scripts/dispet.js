// ============================================================
// DISPET — Pagina de producto (landing)
// JavaScript vanilla (sin librerias externas). Se organiza en
// pequenas funciones, una por comportamiento, y todas se
// arrancan al final del archivo cuando el HTML ya cargo.
//
// Indice:
//   1. iniciarNavegacion()        -> fondo de la barra y menu movil
//   2. iniciarTema()              -> alterna claro/oscuro y lo recuerda
//   3. iniciarRevelado()          -> aparece el contenido con IntersectionObserver
//   4. iniciarSelectorMascota()   -> alterna la imagen perro/gato
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
        var nav = document.getElementById("navLanding");
        if (!nav) { return; }

        // Le agregamos fondo solido a la barra solo despues de haber
        // bajado unos pixeles, para que arranque oscura y transparente
        // sobre el hero (ver .landing-nav.con-scroll en Site.css).
        function alHacerScroll() {
            if (window.scrollY > 10) {
                nav.classList.add("con-scroll");
            } else {
                nav.classList.remove("con-scroll");
            }
        }
        window.addEventListener("scroll", alHacerScroll, { passive: true });
        alHacerScroll();

        // Menu hamburguesa para celular: un clic muestra u oculta la
        // lista de enlaces debajo del nav.
        var botonMenu = document.getElementById("botonMenuLanding");
        var menuMovil = document.getElementById("menuLandingMovil");
        if (botonMenu && menuMovil) {
            botonMenu.addEventListener("click", function () {
                var abierto = menuMovil.classList.toggle("abierta");
                botonMenu.setAttribute("aria-expanded", abierto ? "true" : "false");
            });
        }
    }


    // ------------------------------------------------------------
    // 2. Tema claro / oscuro
    //
    // El atributo data-tema en <html> es lo que Site.css lee para
    // repintar los colores de la landing (ver html[data-tema="oscuro"]
    // .landing en Site.css). Ya se aplico una vez "en caliente" desde
    // un script en el <head> de Default.aspx, para evitar el parpadeo;
    // aqui solo conectamos el boton y guardamos la preferencia.
    // ------------------------------------------------------------
    function iniciarTema() {
        var boton = document.getElementById("botonTema");
        if (!boton) { return; }

        var CLAVE_GUARDADO = "dispet-tema";

        boton.addEventListener("click", function () {
            var esOscuroAhora = document.documentElement.getAttribute("data-tema") === "oscuro";
            var nuevoTema = esOscuroAhora ? "claro" : "oscuro";

            document.documentElement.setAttribute("data-tema", nuevoTema);

            try {
                localStorage.setItem(CLAVE_GUARDADO, nuevoTema);
            } catch (e) {
                // localStorage no disponible (modo privado, etc.):
                // el tema sigue funcionando, solo no se recuerda.
            }
        });
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
    // Varios botones, cada uno con un atributo data-especie. Al
    // hacer clic, buscamos la imagen cuyo data-especie coincide y
    // la marcamos como "activa"; las demas pierden esa clase (ver
    // .imagen-producto en Site.css). Tambien actualizamos el texto
    // y el color de la leyenda ("Mostrando la version para: ...").
    // ------------------------------------------------------------
    function iniciarSelectorMascota() {
        var botones = document.querySelectorAll(".selector-especie-opcion");
        var imagenes = document.querySelectorAll(".imagen-producto");
        var contenedor = document.getElementById("selectorMascotaContenedor");
        var textoEspecie = document.getElementById("textoEspecieActiva");
        if (botones.length === 0) { return; }

        botones.forEach(function (boton) {
            boton.addEventListener("click", function () {
                var especieElegida = boton.getAttribute("data-especie");

                // Actualizamos el estado visual de los botones.
                botones.forEach(function (b) {
                    var esElElegido = b === boton;
                    b.classList.toggle("activa", esElElegido);
                    b.setAttribute("aria-pressed", esElElegido ? "true" : "false");
                });

                // Mostramos solo la imagen que corresponde a la
                // especie elegida.
                imagenes.forEach(function (img) {
                    img.classList.toggle("activa", img.getAttribute("data-especie") === especieElegida);
                });

                if (contenedor) {
                    contenedor.classList.toggle("es-gato", especieElegida === "gato");
                }
                if (textoEspecie) {
                    textoEspecie.textContent = especieElegida;
                }
            });
        });
    }


    // ------------------------------------------------------------
    // Arranque: esperamos a que el HTML este listo antes de
    // buscar elementos en el DOM.
    // ------------------------------------------------------------
    document.addEventListener("DOMContentLoaded", function () {
        iniciarNavegacion();
        iniciarTema();
        iniciarRevelado();
        iniciarSelectorMascota();
    });
})();
