<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="Default.aspx.cs" Inherits="DisPet.Default" %>
<!DOCTYPE html>
<html lang="es">
<head runat="server">
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>DISPET — Comida a tiempo, siempre</title>
    <meta name="description" content="DisPet programa, dispensa y vigila la comida de tu perro o gato, aunque no estes en casa." />
    <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='.9em' font-size='80'%3E%F0%9F%90%BE%3C/text%3E%3C/svg%3E" />

    <!-- Aplicamos el tema guardado antes de pintar la pagina, para que
         no se vea un parpadeo claro -> oscuro al cargar. -->
    <script>
        (function () {
            try {
                var tema = localStorage.getItem("dispet-tema");
                if (tema === "oscuro") { document.documentElement.setAttribute("data-tema", "oscuro"); }
            } catch (e) { /* localStorage no disponible: seguimos en claro */ }
        })();
    </script>

    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
    <link rel="stylesheet" type="text/css" href="Estilos/Site.css" />
</head>
<body class="landing">
    <form id="formInicio" runat="server">

        <!-- ============================================================
             Barra de navegacion
             Pegada arriba (sticky) y oscura por defecto; gana fondo
             claro con blur cuando dispet.js detecta scroll.
             ============================================================ -->
        <header class="landing-nav" id="navLanding">
            <div class="landing-nav-interior">
                <a href="#inicio" class="landing-marca">
                    <span class="icono-marca" aria-hidden="true">🐾</span>
                    <span class="texto-marca">DISPET</span>
                </a>

                <nav class="landing-nav-enlaces">
                    <a href="#mascota">Elige a tu mascota</a>
                    <a href="#como-funciona">Como funciona</a>
                    <a href="#control">Control desde el celular</a>
                </nav>

                <button type="button" class="boton-tema" id="botonTema" aria-label="Cambiar a tema oscuro o claro">
                    <svg class="icono-sol" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" /></svg>
                    <svg class="icono-luna" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79Z" /></svg>
                </button>

                <a href="Login.aspx" class="boton boton-claro boton-nav">Ingresar</a>

                <button type="button" class="landing-nav-movil-boton" id="botonMenuLanding" aria-label="Abrir menu" aria-expanded="false">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
                </button>
            </div>

            <nav class="landing-nav-movil" id="menuLandingMovil">
                <a href="#mascota">Elige a tu mascota</a>
                <a href="#como-funciona">Como funciona</a>
                <a href="#control">Control desde el celular</a>
                <a href="Login.aspx">Ingresar</a>
            </nav>
        </header>


        <!-- ============================================================
             SECCION 1: Hero
             Titulo y llamado a la accion, con el prototipo del
             dispensador como imagen de fondo detras del texto.
             ============================================================ -->
        <section class="landing-hero" id="inicio">
            <div class="landing-hero-titular">
                <div class="landing-hero-resplandor" aria-hidden="true"></div>
                <img src="Images/PrototipoSinFondo.png" alt="" aria-hidden="true" class="landing-hero-fondo" />

                <div class="landing-hero-overlay">
                    <h1>La hora de comer,<br />resuelta.</h1>
                    <p class="landing-hero-sub">DisPet programa, dispensa y vigila la comida de tu mascota, incluso cuando no estas en casa.</p>
                    <div class="landing-hero-cta">
                        <a href="Login.aspx" class="boton boton-claro boton-grande">Ingresar</a>
                        <a href="#mascota" class="enlace-accion-claro">Elige a tu mascota</a>
                    </div>
                </div>
            </div>
        </section>


        <!-- ============================================================
             SECCION 2: Selector de mascota
             ============================================================ -->
        <section class="landing-seccion" id="mascota">
            <!-- Croquetas regadas de fondo, puramente decorativas:
                 cada una es la misma foto (croqueta.png) a distinto
                 tamano, rotacion y posicion para que no se vea
                 repetida. Van detras de todo (z-index:-1 en Site.css),
                 asi que donde haya tarjeta o texto solido quedan
                 tapadas sin ensuciar la lectura. -->
            <img src="Images/croqueta.png" alt="" aria-hidden="true" class="croqueta-flotante croqueta-flotante-1" />
            <img src="Images/croqueta.png" alt="" aria-hidden="true" class="croqueta-flotante croqueta-flotante-2" />
            <img src="Images/croqueta.png" alt="" aria-hidden="true" class="croqueta-flotante croqueta-flotante-3" />
            <img src="Images/croqueta.png" alt="" aria-hidden="true" class="croqueta-flotante croqueta-flotante-4" />
            <img src="Images/croqueta.png" alt="" aria-hidden="true" class="croqueta-flotante croqueta-flotante-5" />
            <img src="Images/croqueta.png" alt="" aria-hidden="true" class="croqueta-flotante croqueta-flotante-6" />

            <div class="landing-seccion-titulo reveal">
                <h2>Un dispensador, dos formas.</h2>
                <p>La misma mecanica por dentro. Elige la version pensada para tu mascota.</p>
            </div>

            <div class="selector-mascota-contenedor reveal" id="selectorMascotaContenedor">
                <div class="selector-mascota-vista">
                    <img src="Images/CanPet.jpg" alt="Perro comiendo de su plato junto al dispensador DisPet version perro" class="imagen-producto activa" data-especie="perro" />
                    <img src="Images/CatPet.jpg" alt="Gato comiendo de su plato junto al dispensador DisPet version gato" class="imagen-producto" data-especie="gato" />
                </div>
                <p class="escenario-producto-caption">Mostrando la version para: <span class="dato" id="textoEspecieActiva">perro</span></p>
            </div>

            <div class="selector-especie-envoltorio">
                <div class="selector-especie reveal" role="group" aria-label="Elegir version del dispensador">
                    <button type="button" class="selector-especie-opcion activa" data-especie="perro" aria-pressed="true">Perro</button>
                    <button type="button" class="selector-especie-opcion" data-especie="gato" aria-pressed="false">Gato</button>
                </div>
            </div>
        </section>


        <!-- ============================================================
             SECCION 3: Como funciona
             ============================================================ -->
        <section class="landing-seccion" id="como-funciona">
            <div class="landing-seccion-titulo reveal">
                <h2>De la tolva al plato, sin que muevas un dedo.</h2>
            </div>

            <ol class="lista-pasos">
                <li class="reveal">
                    <span class="lista-pasos-numero">01</span>
                    <div>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v15M8 21h8M4 7h16" /><path d="M4 7 1.5 12.5a2.75 2.75 0 0 0 5 0L4 7ZM20 7l-2.5 5.5a2.75 2.75 0 0 0 5 0L20 7Z" /></svg>
                        <h3>Llena el deposito</h3>
                        <p>Hasta que el nivel marque lleno en la app. El tubo transparente te deja verlo tambien a simple vista.</p>
                    </div>
                </li>
                <li class="reveal">
                    <span class="lista-pasos-numero">02</span>
                    <div>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.2 2" /></svg>
                        <h3>Programa el horario</h3>
                        <p>Elige los dias, la hora y los gramos exactos para cada mascota. Tu perro y tu gato pueden comer distinto.</p>
                    </div>
                </li>
                <li class="reveal">
                    <span class="lista-pasos-numero">03</span>
                    <div>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="16" height="10" rx="2" /><path d="M18 10.5h2a1.5 1.5 0 0 1 1.5 1.5 1.5 1.5 0 0 1-1.5 1.5h-2" /></svg>
                        <h3>DisPet sirve solo</h3>
                        <p>El servo abre la compuerta justo a tiempo y la dispensacion queda guardada en el historial.</p>
                    </div>
                </li>
            </ol>

            <div class="landing-cuidado-imagen landing-pasos-imagen reveal">
                <img src="Images/Style.jpg" alt="Croquetas cayendo del dispensador DisPet hacia el plato" />
            </div>
        </section>


        <!-- ============================================================
             SECCION 4: Control desde el celular
             ============================================================ -->
        <section class="landing-seccion" id="control">
            <div class="landing-cuidado reveal">
                <div class="landing-cuidado-imagen">
                    <img src="Images/Mobile.jpg" alt="Mano sosteniendo un celular con la app de DisPet abierta, con el dispensador de fondo" />
                </div>
                <div class="landing-cuidado-texto">
                    <h2>Todo lo que ves en la app, viene de aqui.</h2>
                    <p>Programa horarios, revisa el nivel del deposito y la bateria, y dispensa una porcion manual — desde donde estes.</p>
                </div>
            </div>

            <div class="rejilla-caracteristicas">
                <div class="tarjeta-caracteristica reveal">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v15M8 21h8M4 7h16" /><path d="M4 7 1.5 12.5a2.75 2.75 0 0 0 5 0L4 7ZM20 7l-2.5 5.5a2.75 2.75 0 0 0 5 0L20 7Z" /></svg>
                    <h3>Porciones por gramo</h3>
                    <p>Cada horario define una cantidad exacta. Un gato de 3 kilos y un perro de 20 no comen lo mismo, y el horario lo respeta.</p>
                </div>
                <div class="tarjeta-caracteristica reveal">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="16" height="10" rx="2" /><path d="M18 10.5h2a1.5 1.5 0 0 1 1.5 1.5 1.5 1.5 0 0 1-1.5 1.5h-2M6 10v4M9 10v4" /></svg>
                    <h3>Nivel y bateria en vivo</h3>
                    <p>El tablero muestra cuanta comida queda en el deposito y cuanta bateria le queda al dispensador, sin que tengas que acercarte.</p>
                </div>
                <div class="tarjeta-caracteristica reveal">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 2.8-6.5" /><path d="M3 4.5V9h4.5" /><path d="M12 7.5v5l3.3 1.9" /></svg>
                    <h3>Historial completo</h3>
                    <p>Cada comida servida queda con fecha, hora y cantidad, tambien si algo salio mal y no llego a dispensarse.</p>
                </div>
            </div>
        </section>


        <!-- ============================================================
             CTA final
             ============================================================ -->
        <section class="landing-cta-final">
            <h2 class="reveal">Tu mascota no entiende de horarios ocupados.</h2>
            <p class="reveal">Ingresa y deja que DisPet se encargue de la hora de comer.</p>
            <a href="Login.aspx" class="boton boton-claro boton-grande reveal">Ingresar</a>
        </section>


        <!-- ============================================================
             Pie de pagina
             ============================================================ -->
        <footer class="landing-footer">
            <div class="landing-marca">
                <span class="icono-marca" aria-hidden="true">🐾</span>
                <span class="texto-marca">DISPET</span>
            </div>
            <p>Dispensador automatico de alimento para mascotas.</p>
            <p>&copy; 2026 DISPET. Proyecto academico.</p>
        </footer>

    </form>

    <script src="Scripts/dispet.js"></script>
</body>
</html>
