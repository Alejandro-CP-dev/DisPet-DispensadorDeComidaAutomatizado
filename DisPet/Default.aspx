<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="Default.aspx.cs" Inherits="DisPet.Default" %>
<!DOCTYPE html>
<html lang="es">
<head runat="server">
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>DISPET — Comida a tiempo, siempre</title>
    <meta name="description" content="DisPet programa, dispensa y vigila la comida de tu perro o gato, aunque no estes en casa." />
    <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='.9em' font-size='80'%3E%F0%9F%90%BE%3C/text%3E%3C/svg%3E" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
    <link rel="stylesheet" type="text/css" href="Estilos/Site.css" />
    <script>
        (function () {
            try {
                var guardado = localStorage.getItem("dispet-tema");
                var oscuro = guardado ? guardado === "oscuro" : (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
                if (oscuro) { document.documentElement.setAttribute("data-tema", "oscuro"); }
            } catch (e) { }
        })();
    </script>
</head>
<body>
    <form id="formInicio" runat="server">
        <div class="landing">

            <header class="landing-nav" id="navInicio">
                <div class="landing-nav-interior">
                    <a href="#" class="landing-marca">
                        <span class="icono-marca">🐾</span>
                        <span class="texto-marca">DISPET</span>
                    </a>
                    <nav class="landing-nav-enlaces">
                        <a href="#como-funciona">Como funciona</a>
                        <a href="#cuidado">El dispensador</a>
                    </nav>
                    <button type="button" class="boton-tema" id="botonTema" aria-pressed="false" aria-label="Cambiar a modo oscuro">
                        <svg class="icono-sol" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4.3" /><path d="M12 2.5v2.6M12 18.9v2.6M4.2 4.2l1.9 1.9M17.9 17.9l1.9 1.9M2.5 12h2.6M18.9 12h2.6M4.2 19.8l1.9-1.9M17.9 6.1l1.9-1.9" /></svg>
                        <svg class="icono-luna" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.2 14.6A8.5 8.5 0 1 1 9.4 3.8a7 7 0 0 0 10.8 10.8z" /></svg>
                    </button>
                    <a href="Login.aspx" class="boton boton-nav">Ingresar</a>
                </div>
            </header>

            <main>

                <section class="landing-hero escena-3d-envoltorio" id="escena3dEnvoltorio">
                    <div class="escena-3d-pin" id="escena3dPin">
                        <canvas id="canvas3d"></canvas>
                        <div class="landing-hero-resplandor" aria-hidden="true"></div>
                        <div class="landing-hero-velo" aria-hidden="true"></div>

                        <div class="landing-hero-overlay" id="heroOverlay">
                            <h1>La hora de comer,<br />resuelta.</h1>
                            <p class="landing-hero-sub">DisPet programa las porciones de tu perro o gato, las entrega a tiempo y deja registro de cada comida, incluso cuando no estas en casa.</p>
                            <div class="landing-hero-cta">
                                <a href="Login.aspx" class="boton boton-grande">Ingresar</a>
                                <a href="#como-funciona" class="enlace-accion enlace-accion-claro">Ver como funciona</a>
                            </div>

                            <div class="selector-especie" role="group" aria-label="Elegir version del dispensador">
                                <button type="button" class="selector-especie-opcion activa" data-especie="perro" aria-pressed="true">Para perro</button>
                                <button type="button" class="selector-especie-opcion" data-especie="gato" aria-pressed="false">Para gato</button>
                            </div>
                        </div>

                        <div class="etiqueta-parte" data-umbral="0.9" style="--etiqueta-x: 50%; --etiqueta-y: 20%;">
                            <span class="etiqueta-parte-titulo">Tapa impresa a medida</span>
                            <span class="etiqueta-parte-texto">Orejas de perro o de gato sobre el mismo mecanismo.</span>
                        </div>
                        <div class="etiqueta-parte" data-umbral="0.5" style="--etiqueta-x: 74%; --etiqueta-y: 42%;">
                            <span class="etiqueta-parte-titulo">Deposito transparente</span>
                            <span class="etiqueta-parte-texto">Ves cuanta comida queda, sin abrir la tapa.</span>
                        </div>
                        <div class="etiqueta-parte" data-umbral="0.75" style="--etiqueta-x: 16%; --etiqueta-y: 70%;">
                            <span class="etiqueta-parte-titulo">Compuerta y servo</span>
                            <span class="etiqueta-parte-texto">Se abre justo a la hora que programaste.</span>
                        </div>
                        <div class="etiqueta-parte" data-umbral="0.96" style="--etiqueta-x: 62%; --etiqueta-y: 88%;">
                            <span class="etiqueta-parte-titulo">La porcion servida</span>
                            <span class="etiqueta-parte-texto">Gramos exactos, cada vez.</span>
                        </div>

                        <div class="escenario-producto-stage">
                            <img src="Images/dipetCan.jpeg" alt="Dispensador DisPet version perro, con orejas caidas, junto a un plato con croquetas" class="imagen-producto activa" data-especie="perro" />
                            <img src="Images/dispetCat.jpeg" alt="Dispensador DisPet version gato, color rosa con orejas puntiagudas, junto a un plato con croquetas" class="imagen-producto" data-especie="gato" />
                        </div>

                        <p class="escenario-producto-caption">
                            <span class="dato" data-caption-perro>DisPet · version Perro</span>
                            <span class="dato" data-caption-gato hidden>DisPet · version Gato</span>
                            — mismo mecanismo, orejas distintas.
                        </p>

                        <p class="escena-3d-hint">Desliza para desarmarlo</p>
                    </div>
                </section>

                <section class="landing-seccion" id="como-funciona">
                    <div class="landing-seccion-titulo">
                        <h2>De la tolva al plato, sin que muevas un dedo.</h2>
                    </div>

                    <ol class="lista-pasos">
                        <li>
                            <span class="lista-pasos-numero">1</span>
                            <div>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16l-6 9v6l-4 2v-8L4 4z" /></svg>
                                <h3>Llena el deposito</h3>
                                <p>Hasta que el nivel marque lleno en la app. El tubo transparente te deja verlo tambien a simple vista.</p>
                            </div>
                        </li>
                        <li>
                            <span class="lista-pasos-numero">2</span>
                            <div>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.2 2" /></svg>
                                <h3>Programa el horario</h3>
                                <p>Elige los dias, la hora y los gramos exactos para cada mascota. Tu perro y tu gato pueden comer distinto.</p>
                            </div>
                        </li>
                        <li>
                            <span class="lista-pasos-numero">3</span>
                            <div>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3c3 3.5 6 6.8 6 10a6 6 0 1 1-12 0c0-3.2 3-6.5 6-10z" /></svg>
                                <h3>DisPet sirve solo</h3>
                                <p>El servo abre la compuerta justo a tiempo y la dispensacion queda guardada en el historial.</p>
                            </div>
                        </li>
                    </ol>
                </section>

                <section class="landing-seccion landing-cuidado" id="cuidado">
                    <div class="landing-cuidado-imagen">
                        <img src="Images/dispetCat.jpeg" alt="Detalle del dispensador DisPet version gato mostrando el deposito de croquetas y el servomotor" />
                    </div>
                    <div class="landing-cuidado-texto">
                        <h2>Impreso en 3D, pensado para cada mascota.</h2>
                        <p>Cada DisPet se imprime a medida: la carcasa, las orejas y el plato de ceramica. El servomotor queda a la vista, sin pretender ser otra cosa que lo que es: un mecanismo simple que abre una compuerta a la hora exacta.</p>
                        <p>El deposito transparente deja ver cuanta comida queda, y la tapa superior ajusta sin herramientas para rellenar en segundos.</p>
                    </div>
                </section>

                <section class="landing-seccion">
                    <div class="landing-seccion-titulo">
                        <h2>Todo lo que ves en la app, viene de aqui.</h2>
                    </div>

                    <div class="rejilla-caracteristicas">
                        <div class="tarjeta-caracteristica">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v15M8 21h8M4 7h16" /><path d="M4 7 1.5 12.5a2.75 2.75 0 0 0 5 0L4 7ZM20 7l-2.5 5.5a2.75 2.75 0 0 0 5 0L20 7Z" /></svg>
                            <h3>Porciones por gramo</h3>
                            <p>Cada horario define una cantidad exacta. Un gato de 3 kilos y un perro de 20 no comen lo mismo, y el horario lo respeta.</p>
                        </div>
                        <div class="tarjeta-caracteristica">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="16" height="10" rx="2" /><path d="M18 10.5h2a1.5 1.5 0 0 1 1.5 1.5 1.5 1.5 0 0 1-1.5 1.5h-2M6 10v4M9 10v4" /></svg>
                            <h3>Nivel y bateria en vivo</h3>
                            <p>El tablero muestra cuanta comida queda en el deposito y cuanta bateria le queda al dispensador, sin que tengas que acercarte.</p>
                        </div>
                        <div class="tarjeta-caracteristica">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 2.8-6.5" /><path d="M3 4.5V9h4.5" /><path d="M12 7.5v5l3.3 1.9" /></svg>
                            <h3>Historial completo</h3>
                            <p>Cada comida servida queda con fecha, hora y cantidad, tambien si algo salio mal y no llego a dispensarse.</p>
                        </div>
                    </div>
                </section>

            </main>

            <section class="landing-cta-final">
                <h2>Tu mascota no entiende de horarios ocupados.</h2>
                <p>Ingresa y deja que DisPet se encargue de la hora de comer.</p>
                <a href="Login.aspx" class="boton boton-grande boton-claro">Ingresar</a>
            </section>

            <footer class="landing-footer">
                <div class="landing-marca">
                    <span class="icono-marca">🐾</span>
                    <span class="texto-marca">DISPET</span>
                </div>
                <p>Dispensador automatico de alimento para mascotas.</p>
            </footer>

        </div>
    </form>

    <script>
        (function () {
            var nav = document.getElementById('navInicio');
            if (nav) {
                var alActualizar = function () {
                    if (window.scrollY > 12) {
                        nav.classList.add('con-scroll');
                    } else {
                        nav.classList.remove('con-scroll');
                    }
                };
                window.addEventListener('scroll', alActualizar, { passive: true });
                alActualizar();
            }

            var botones = document.querySelectorAll('.selector-especie-opcion');
            var imagenes = document.querySelectorAll('.imagen-producto');
            var captionPerro = document.querySelector('[data-caption-perro]');
            var captionGato = document.querySelector('[data-caption-gato]');
            var envoltorio3d = document.getElementById('escena3dEnvoltorio');

            botones.forEach(function (boton) {
                boton.addEventListener('click', function () {
                    var especie = boton.getAttribute('data-especie');

                    botones.forEach(function (b) {
                        var esActivo = b === boton;
                        b.classList.toggle('activa', esActivo);
                        b.setAttribute('aria-pressed', esActivo ? 'true' : 'false');
                    });
                    imagenes.forEach(function (img) { img.classList.toggle('activa', img.getAttribute('data-especie') === especie); });

                    if (envoltorio3d) {
                        envoltorio3d.classList.toggle('es-gato', especie === 'gato');
                    }
                    if (captionPerro && captionGato) {
                        captionPerro.hidden = especie !== 'perro';
                        captionGato.hidden = especie !== 'gato';
                    }
                    if (window.dispetModelo3D) {
                        window.dispetModelo3D.setEspecie(especie);
                    }
                });
            });

            var botonTema = document.getElementById('botonTema');
            if (botonTema) {
                var actualizarBotonTema = function () {
                    var esOscuro = document.documentElement.getAttribute('data-tema') === 'oscuro';
                    botonTema.setAttribute('aria-pressed', esOscuro ? 'true' : 'false');
                    botonTema.setAttribute('aria-label', esOscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
                };
                actualizarBotonTema();
                botonTema.addEventListener('click', function () {
                    var esOscuro = document.documentElement.getAttribute('data-tema') === 'oscuro';
                    if (esOscuro) {
                        document.documentElement.removeAttribute('data-tema');
                    } else {
                        document.documentElement.setAttribute('data-tema', 'oscuro');
                    }
                    try { localStorage.setItem('dispet-tema', esOscuro ? 'claro' : 'oscuro'); } catch (e) { }
                    actualizarBotonTema();
                });
            }
        })();
    </script>
    <script src="Scripts/three.min.js"></script>
    <script src="Scripts/dispet3d.js"></script>
</body>
</html>
