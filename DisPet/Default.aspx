<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="Default.aspx.cs" Inherits="DisPet.Default" %>
<!DOCTYPE html>
<html lang="es">
<head runat="server">
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>DISPET — Comida a tiempo, siempre</title>
    <meta name="description" content="DisPet programa, dispensa y vigila la comida de tu perro o gato, aunque no estes en casa." />
    <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='.9em' font-size='80'%3E%F0%9F%90%BE%3C/text%3E%3C/svg%3E" />
    <link rel="stylesheet" type="text/css" href="Content/dispet.css" />
</head>
<body>
    <form id="formInicio" runat="server">

        <!-- ============================================================
             Barra de navegacion fija
             ============================================================ -->
        <header class="nav" id="nav">
            <div class="nav-contenedor">
                <a href="#inicio" class="nav-marca">🐾 DISPET</a>

                <ul class="nav-enlaces">
                    <li><a href="#mascota">Elige a tu mascota</a></li>
                    <li><a href="#como-funciona">Como funciona</a></li>
                </ul>

                <a href="Login.aspx" class="boton nav-boton">Ingresar</a>

                <button type="button" class="nav-hamburguesa" id="botonMenu" aria-label="Abrir menu" aria-expanded="false">
                    <span></span><span></span><span></span>
                </button>
            </div>

            <nav class="nav-enlaces-movil" id="menuMovil">
                <a href="#mascota">Elige a tu mascota</a>
                <a href="#como-funciona">Como funciona</a>
                <a href="Login.aspx">Ingresar</a>
            </nav>
        </header>


        <!-- ============================================================
             SECCION 1: Hero
             La foto del prototipo (sin fondo, solo el producto) queda
             detras del titulo, como fondo de toda la seccion. Se mueve
             con un efecto parallax al hacer scroll (dispet.js).
             ============================================================ -->
        <section class="hero" id="inicio">
            <div class="hero-imagen-fondo">
                <img src="Images/PrototipoSinFondo.png" alt="Dispensador DisPet, version para perro y version para gato, uno junto al otro" id="heroImagen" />
            </div>

            <div class="hero-texto">
                <h1 class="hero-titulo">La hora de comer,<br />resuelta.</h1>
                <p class="hero-subtitulo">DisPet programa, dispensa y vigila la comida de tu mascota, incluso cuando no estas en casa.</p>
                <div class="hero-acciones">
                    <a href="Login.aspx" class="boton boton-relleno">Ingresar</a>
                    <a href="#mascota" class="boton boton-texto">Elige a tu mascota</a>
                </div>
            </div>
        </section>


        <!-- ============================================================
             SECCION 2: Selector de mascota
             Funciona igual que el selector de color de una pagina de
             producto: un clic cambia cual imagen esta visible.
             ============================================================ -->
        <section class="seccion" id="mascota">
            <div class="selector-encabezado reveal">
                <h2>Un dispensador, dos formas.</h2>
                <p>La misma mecanica por dentro. Elige la version pensada para tu mascota.</p>
            </div>

            <div class="selector-vista reveal">
                <img src="Images/CanPet.jpg" alt="Perro comiendo de su plato junto al dispensador DisPet version perro" class="selector-imagen activa" data-mascota="perro" />
                <img src="Images/CatPet.jpg" alt="Gato comiendo de su plato junto al dispensador DisPet version gato" class="selector-imagen" data-mascota="gato" />
            </div>

            <div class="selector-opciones reveal" role="group" aria-label="Elegir version del dispensador">
                <button type="button" class="selector-boton activa" data-mascota="perro" aria-pressed="true">
                    <span class="selector-punto selector-punto-perro"></span> Perro
                </button>
                <button type="button" class="selector-boton" data-mascota="gato" aria-pressed="false">
                    <span class="selector-punto selector-punto-gato"></span> Gato
                </button>
            </div>
        </section>


        <!-- ============================================================
             SECCION 3: Como funciona
             Tres pasos del proceso, con la foto real del mecanismo
             dispensando comida como apoyo visual.
             ============================================================ -->
        <section class="seccion" id="como-funciona">
            <h2 class="reveal">De la tolva al plato, sin que muevas un dedo.</h2>

            <div class="funciona-pasos">
                <div class="funciona-paso reveal">
                    <span class="funciona-numero">1</span>
                    <h3>Llena el deposito</h3>
                    <p>Hasta que el nivel marque lleno en la app. El tubo transparente te deja verlo tambien a simple vista.</p>
                </div>
                <div class="funciona-paso reveal">
                    <span class="funciona-numero">2</span>
                    <h3>Programa el horario</h3>
                    <p>Elige los dias, la hora y los gramos exactos para cada mascota. Tu perro y tu gato pueden comer distinto.</p>
                </div>
                <div class="funciona-paso reveal">
                    <span class="funciona-numero">3</span>
                    <h3>DisPet sirve solo</h3>
                    <p>El servo abre la compuerta justo a tiempo y la dispensacion queda guardada en el historial.</p>
                </div>
            </div>

            <div class="funciona-imagen reveal">
                <img src="Images/Style.jpg" alt="Croquetas cayendo del dispensador DisPet hacia el plato" />
            </div>
        </section>


        <!-- ============================================================
             SECCION 4: Control desde el celular
             Imagen real del app en uso + los tres datos que muestra
             el tablero (porcion, nivel/bateria, historial).
             ============================================================ -->
        <section class="seccion" id="control">
            <h2 class="reveal">Todo lo que ves en la app, viene de aqui.</h2>
            <p class="control-intro reveal">Programa horarios, revisa el nivel del deposito y la bateria, y dispensa una porcion manual — desde donde estes.</p>

            <div class="control-imagen reveal">
                <img src="Images/Mobile.jpg" alt="Mano sosteniendo un celular con la app de DisPet abierta, con el dispensador de fondo" />
            </div>

            <div class="rejilla-caracteristicas">
                <div class="caracteristica reveal">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v15M8 21h8M4 7h16" /><path d="M4 7 1.5 12.5a2.75 2.75 0 0 0 5 0L4 7ZM20 7l-2.5 5.5a2.75 2.75 0 0 0 5 0L20 7Z" /></svg>
                    <h3>Porciones por gramo</h3>
                    <p>Cada horario define una cantidad exacta. Un gato de 3 kilos y un perro de 20 no comen lo mismo, y el horario lo respeta.</p>
                </div>
                <div class="caracteristica reveal">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="16" height="10" rx="2" /><path d="M18 10.5h2a1.5 1.5 0 0 1 1.5 1.5 1.5 1.5 0 0 1-1.5 1.5h-2M6 10v4M9 10v4" /></svg>
                    <h3>Nivel y bateria en vivo</h3>
                    <p>El tablero muestra cuanta comida queda en el deposito y cuanta bateria le queda al dispensador, sin que tengas que acercarte.</p>
                </div>
                <div class="caracteristica reveal">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 2.8-6.5" /><path d="M3 4.5V9h4.5" /><path d="M12 7.5v5l3.3 1.9" /></svg>
                    <h3>Historial completo</h3>
                    <p>Cada comida servida queda con fecha, hora y cantidad, tambien si algo salio mal y no llego a dispensarse.</p>
                </div>
            </div>
        </section>


        <!-- ============================================================
             CTA final
             Franja oscura de cierre, con una sola accion posible.
             ============================================================ -->
        <section class="cta-final">
            <h2 class="reveal">Tu mascota no entiende de horarios ocupados.</h2>
            <p class="reveal">Ingresa y deja que DisPet se encargue de la hora de comer.</p>
            <a href="Login.aspx" class="boton boton-relleno">Ingresar</a>
        </section>


        <!-- ============================================================
             Pie de pagina
             ============================================================ -->
        <footer class="pie">
            <div class="pie-marca">🐾 DISPET</div>
            <p>Dispensador automatico de alimento para mascotas.</p>
            <p class="pie-copyright">&copy; 2026 DISPET. Proyecto academico.</p>
        </footer>

    </form>

    <script src="Scripts/dispet.js"></script>
</body>
</html>
