// Vista explosionada del dispensador DisPet, construida con geometria
// procedural (sin modelo CAD de origen: no existe un STL del diseno).
// Las proporciones estan tomadas a ojo de las fotos del producto.
(function () {
    "use strict";

    var ENVOLTORIO_ID = "escena3dEnvoltorio";
    var PIN_ID = "escena3dPin";
    var CANVAS_ID = "canvas3d";

    function soportaWebGL() {
        try {
            var lienzo = document.createElement("canvas");
            return !!(window.WebGLRenderingContext &&
                (lienzo.getContext("webgl") || lienzo.getContext("experimental-webgl")));
        } catch (e) {
            return false;
        }
    }

    function prefiereMovimientoReducido() {
        return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }

    function iniciar() {
        var envoltorio = document.getElementById(ENVOLTORIO_ID);
        if (!envoltorio) { return; }

        var activar3d = soportaWebGL() && !prefiereMovimientoReducido() && window.innerWidth > 880 && typeof THREE !== "undefined";

        if (!activar3d) {
            envoltorio.classList.add("sin-3d");
            return;
        }

        envoltorio.classList.add("con-3d");

        var pin = document.getElementById(PIN_ID);
        var lienzo = document.getElementById(CANVAS_ID);

        // ------------------------------------------------------------
        // Colores de marca (coinciden con las variables de Site.css)
        // ------------------------------------------------------------
        var COLOR_PERRO = 0xc9974f;
        var COLOR_PERRO_OSCURO = 0xa97738;
        var COLOR_GATO = 0xd9a79e;
        var COLOR_GATO_OSCURO = 0xb98278;
        var COLOR_TUBO = 0xc9c2b2;
        var COLOR_KIBBLE = 0x8a6a3a;
        var COLOR_SERVO = 0x3a5a7a;
        var COLOR_PLATO = 0xffffff;

        // ------------------------------------------------------------
        // Escena, camara, renderer
        // ------------------------------------------------------------
        var escena = new THREE.Scene();

        var camara = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
        var objetivoCamara = new THREE.Vector3(0, 1.35, 0);

        var renderer = new THREE.WebGLRenderer({ canvas: lienzo, antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.outputColorSpace = THREE.SRGBColorSpace || renderer.outputColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.05;

        var luzAmbiente = new THREE.HemisphereLight(0xfff6e8, 0x3a2f26, 0.7);
        escena.add(luzAmbiente);

        var luzClave = new THREE.DirectionalLight(0xfff2de, 0.75);
        luzClave.position.set(3.2, 5, 3.6);
        escena.add(luzClave);

        var luzRelleno = new THREE.DirectionalLight(0xdfe8ff, 0.3);
        luzRelleno.position.set(-3.5, 2, -2.5);
        escena.add(luzRelleno);

        var luzContra = new THREE.DirectionalLight(0xffb878, 0.55);
        luzContra.position.set(-1.2, 3, -4.2);
        escena.add(luzContra);

        // ------------------------------------------------------------
        // Sombra de contacto (plano con textura radial generada por canvas)
        // ------------------------------------------------------------
        function texturaSombra() {
            var tam = 256;
            var c = document.createElement("canvas");
            c.width = tam; c.height = tam;
            var ctx = c.getContext("2d");
            var g = ctx.createRadialGradient(tam / 2, tam / 2, 0, tam / 2, tam / 2, tam / 2);
            g.addColorStop(0, "rgba(43,36,32,0.38)");
            g.addColorStop(0.7, "rgba(43,36,32,0.16)");
            g.addColorStop(1, "rgba(43,36,32,0)");
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, tam, tam);
            return new THREE.CanvasTexture(c);
        }

        var sombra = new THREE.Mesh(
            new THREE.PlaneGeometry(4.2, 4.2),
            new THREE.MeshBasicMaterial({ map: texturaSombra(), transparent: true, depthWrite: false })
        );
        sombra.rotation.x = -Math.PI / 2;
        sombra.position.y = 0.002;
        escena.add(sombra);

        // ------------------------------------------------------------
        // Grupo raiz del dispensador + piezas (cada una con su posicion
        // ensamblada en el origen local, y un desplazamiento "explosionado")
        // ------------------------------------------------------------
        var raiz = new THREE.Group();
        escena.add(raiz);

        var RADIO = 1.0;
        var ALT_BASE = 0.8;
        var ALT_VENTANA = 1.5;
        var ALT_COLLAR = 0.18;

        var yBaseCentro = ALT_BASE / 2;
        var yVentanaCentro = ALT_BASE + ALT_VENTANA / 2;
        var yCollarCentro = ALT_BASE + ALT_VENTANA + ALT_COLLAR / 2;
        var yTapaBase = ALT_BASE + ALT_VENTANA + ALT_COLLAR;

        var piezas = [];

        function agregarPieza(grupo, explosionY, explosionZ, rotExtra) {
            raiz.add(grupo);
            piezas.push({
                grupo: grupo,
                desde: new THREE.Vector3(0, 0, 0),
                hasta: new THREE.Vector3(0, explosionY, explosionZ || 0),
                rot: rotExtra || 0
            });
        }

        var materialCarcasa = new THREE.MeshStandardMaterial({ color: COLOR_PERRO, roughness: 0.72, metalness: 0.02 });
        var materialCarcasaOscuro = new THREE.MeshStandardMaterial({ color: COLOR_PERRO_OSCURO, roughness: 0.72, metalness: 0.02 });

        // --- Base + compuerta + servo ---------------------------------
        var grupoBase = new THREE.Group();
        var geoBase = new THREE.CylinderGeometry(RADIO, RADIO * 1.02, ALT_BASE, 40, 1, false);
        var baseMesh = new THREE.Mesh(geoBase, materialCarcasa);
        baseMesh.position.y = yBaseCentro;
        grupoBase.add(baseMesh);

        var compuerta = new THREE.Mesh(
            new THREE.CylinderGeometry(0.22, 0.22, 0.05, 24),
            new THREE.MeshStandardMaterial({ color: 0x241f1b, roughness: 0.5 })
        );
        compuerta.rotation.z = Math.PI / 2;
        compuerta.position.set(Math.sin(-0.35) * RADIO * 1.01, yBaseCentro - 0.05, Math.cos(-0.35) * RADIO * 1.01);
        compuerta.lookAt(new THREE.Vector3(0, compuerta.position.y, 0));
        grupoBase.add(compuerta);

        var cajaServo = new THREE.Mesh(
            new THREE.BoxGeometry(0.4, 0.42, 0.22),
            new THREE.MeshStandardMaterial({ color: COLOR_SERVO, roughness: 0.5, metalness: 0.1 })
        );
        var anguloServo = 0.55;
        cajaServo.position.set(Math.sin(anguloServo) * RADIO * 1.05, yBaseCentro + 0.02, Math.cos(anguloServo) * RADIO * 1.05);
        cajaServo.lookAt(new THREE.Vector3(0, cajaServo.position.y, 0));
        grupoBase.add(cajaServo);

        agregarPieza(grupoBase, -1.15, -0.1);

        // --- Carcasa con ventana (cilindro parcial, deja ver el tubo) --
        var grupoVentana = new THREE.Group();
        var inicioAngulo = Math.PI * 0.32;
        var largoAngulo = Math.PI * 2 - Math.PI * 0.62;
        var geoVentana = new THREE.CylinderGeometry(RADIO, RADIO, ALT_VENTANA, 40, 1, true, inicioAngulo, largoAngulo);
        var ventanaMesh = new THREE.Mesh(geoVentana, materialCarcasa);
        ventanaMesh.position.y = yVentanaCentro;
        grupoVentana.add(ventanaMesh);
        agregarPieza(grupoVentana, 0.75, -0.55);

        // --- Collarin bajo la tapa --------------------------------------
        var grupoCollar = new THREE.Group();
        var collarMesh = new THREE.Mesh(
            new THREE.CylinderGeometry(RADIO * 1.03, RADIO, ALT_COLLAR, 40),
            materialCarcasaOscuro
        );
        collarMesh.position.y = yCollarCentro;
        grupoCollar.add(collarMesh);
        agregarPieza(grupoCollar, 1.55, -0.25);

        // --- Tubo del deposito, con croquetas dentro --------------------
        var grupoTubo = new THREE.Group();
        var alturaTubo = ALT_VENTANA + 0.35;
        var tuboMesh = new THREE.Mesh(
            new THREE.CylinderGeometry(RADIO * 0.72, RADIO * 0.72, alturaTubo, 32, 1, true),
            new THREE.MeshPhysicalMaterial({
                color: COLOR_TUBO, transparent: true, opacity: 0.32,
                roughness: 0.15, metalness: 0, side: THREE.DoubleSide
            })
        );
        tuboMesh.position.y = yVentanaCentro + 0.1;
        grupoTubo.add(tuboMesh);

        var geoKibble = new THREE.DodecahedronGeometry(0.052, 0);
        var matKibble = new THREE.MeshStandardMaterial({ color: COLOR_KIBBLE, roughness: 0.85 });
        var totalKibble = 70;
        var kibbleTubo = new THREE.InstancedMesh(geoKibble, matKibble, totalKibble);
        var matriz = new THREE.Matrix4();
        var cursor = 0;
        for (var capa = 0; capa < 10; capa++) {
            for (var n = 0; n < 7; n++) {
                var r = Math.random() * RADIO * 0.58;
                var ang = Math.random() * Math.PI * 2;
                var px = Math.cos(ang) * r;
                var pz = Math.sin(ang) * r;
                var py = (yVentanaCentro - ALT_VENTANA * 0.42) + capa * 0.075 + Math.random() * 0.03;
                var cuaternion = new THREE.Quaternion().setFromEuler(
                    new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI)
                );
                matriz.compose(new THREE.Vector3(px, py, pz), cuaternion, new THREE.Vector3(1, 1, 1));
                kibbleTubo.setMatrixAt(cursor, matriz);
                cursor++;
                if (cursor >= totalKibble) { break; }
            }
            if (cursor >= totalKibble) { break; }
        }
        grupoTubo.add(kibbleTubo);
        agregarPieza(grupoTubo, 0.25, 0.05);

        // --- Tapa + orejas ------------------------------------------------
        var grupoTapa = new THREE.Group();
        var domoMesh = new THREE.Mesh(
            new THREE.SphereGeometry(RADIO * 1.05, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.52),
            materialCarcasa
        );
        domoMesh.position.y = yTapaBase + RADIO * 1.05 * Math.cos(Math.PI * 0.52) * -1;
        grupoTapa.add(domoMesh);

        function formaOrejaPerro() {
            var f = new THREE.Shape();
            f.moveTo(0, 0);
            f.bezierCurveTo(0.09, -0.02, 0.15, -0.17, 0.12, -0.36);
            f.bezierCurveTo(0.1, -0.5, 0.0, -0.54, -0.05, -0.41);
            f.bezierCurveTo(-0.1, -0.26, -0.06, -0.07, 0, 0);
            return f;
        }

        function formaOrejaGato() {
            var f = new THREE.Shape();
            f.moveTo(-0.11, 0);
            f.lineTo(0, 0.28);
            f.lineTo(0.11, 0);
            f.quadraticCurveTo(0, -0.03, -0.11, 0);
            return f;
        }

        function crearOrejas(forma, material, inclinacionZ) {
            var geo = new THREE.ExtrudeGeometry(forma, { depth: 0.04, bevelEnabled: true, bevelSize: 0.01, bevelThickness: 0.01, bevelSegments: 2 });
            geo.translate(0, 0, -0.02);
            var grupo = new THREE.Group();
            [-1, 1].forEach(function (lado) {
                var oreja = new THREE.Mesh(geo, material);
                var angulo = lado * 0.5;
                oreja.position.set(Math.sin(angulo) * RADIO * 0.97, yTapaBase - 0.01, Math.cos(angulo) * RADIO * 0.97);
                oreja.rotation.y = -angulo;
                oreja.rotation.z = lado * inclinacionZ;
                grupo.add(oreja);
            });
            return grupo;
        }

        var orejasPerro = crearOrejas(formaOrejaPerro(), materialCarcasa, -0.32);
        var orejasGato = crearOrejas(formaOrejaGato(), materialCarcasa, -0.1);
        grupoTapa.add(orejasPerro);
        grupoTapa.add(orejasGato);

        agregarPieza(grupoTapa, 2.05, -0.15);

        // --- Plato con croquetas ------------------------------------------
        var grupoPlato = new THREE.Group();
        var perfilPlato = [];
        for (var i = 0; i <= 12; i++) {
            var a = i / 12;
            perfilPlato.push(new THREE.Vector2(0.06 + a * 0.74, -0.14 + Math.pow(a, 1.7) * 0.15));
        }
        perfilPlato.push(new THREE.Vector2(0.84, 0.04));
        var platoMesh = new THREE.Mesh(
            new THREE.LatheGeometry(perfilPlato, 32),
            new THREE.MeshStandardMaterial({ color: COLOR_PLATO, roughness: 0.4, side: THREE.DoubleSide })
        );
        platoMesh.position.set(-0.35, 0, 2.0);
        grupoPlato.add(platoMesh);

        var kibblePlato = new THREE.InstancedMesh(geoKibble, matKibble, 26);
        var idx = 0;
        for (var pa = 0; pa < 26; pa++) {
            var pr = Math.random() * 0.55;
            var pang = Math.random() * Math.PI * 2;
            var px2 = -0.35 + Math.cos(pang) * pr;
            var pz2 = 2.0 + Math.sin(pang) * pr;
            var py2 = -0.02 + Math.random() * 0.1;
            var q2 = new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI));
            matriz.compose(new THREE.Vector3(px2, py2, pz2), q2, new THREE.Vector3(1, 1, 1));
            kibblePlato.setMatrixAt(idx, matriz);
            idx++;
        }
        grupoPlato.add(kibblePlato);
        agregarPieza(grupoPlato, 0.3, 0.3);

        // ------------------------------------------------------------
        // Etiquetas HTML (aparecen cuando la pieza esta mas separada)
        // ------------------------------------------------------------
        var etiquetas = Array.prototype.slice.call(pin.querySelectorAll(".etiqueta-parte"));
        var pista = pin.querySelector(".escena-3d-hint");
        var overlayTexto = document.getElementById("heroOverlay");

        // ------------------------------------------------------------
        // Especie activa: color + orejas visibles
        // ------------------------------------------------------------
        var especieActual = "perro";

        function aplicarEspecie(especie) {
            especieActual = especie;
            var colorPrincipal = especie === "gato" ? COLOR_GATO : COLOR_PERRO;
            var colorOscuro = especie === "gato" ? COLOR_GATO_OSCURO : COLOR_PERRO_OSCURO;
            materialCarcasa.color.setHex(colorPrincipal);
            materialCarcasaOscuro.color.setHex(colorOscuro);
            orejasPerro.visible = especie !== "gato";
            orejasGato.visible = especie === "gato";
            renderizar();
        }

        window.dispetModelo3D = { setEspecie: aplicarEspecie };

        // ------------------------------------------------------------
        // Loop de tamano / render
        // ------------------------------------------------------------
        function ajustarTamano() {
            var ancho = pin.clientWidth;
            var alto = pin.clientHeight;
            renderer.setSize(ancho, alto, false);
            camara.aspect = ancho / Math.max(alto, 1);
            camara.updateProjectionMatrix();
        }

        function renderizar() {
            camara.lookAt(objetivoCamara);
            renderer.render(escena, camara);
        }

        var progresoActual = 0;

        function aplicarProgreso(t) {
            progresoActual = t;
            piezas.forEach(function (p) {
                p.grupo.position.lerpVectors(p.desde, p.hasta, t);
            });
            raiz.rotation.y = t * 0.5;

            var anguloOrbita = -0.3 + t * 0.2;
            var radioOrbita = 9.4 + t * 2.6;
            camara.position.set(
                Math.sin(anguloOrbita) * radioOrbita,
                2.5 + t * 0.55,
                Math.cos(anguloOrbita) * radioOrbita
            );
            objetivoCamara.y = 1.3 + t * 0.3;

            etiquetas.forEach(function (el) {
                var umbral = parseFloat(el.getAttribute("data-umbral")) || 0.6;
                el.classList.toggle("visible", t >= umbral);
            });

            if (pista) {
                pista.style.opacity = String(Math.max(0, 1 - t * 9));
            }

            if (overlayTexto) {
                var tTexto = Math.min(1, t / 0.24);
                overlayTexto.style.opacity = String(1 - tTexto);
                overlayTexto.style.transform = "translateY(" + (-tTexto * 26) + "px) scale(" + (1 - tTexto * 0.04) + ")";
                overlayTexto.style.pointerEvents = tTexto > 0.5 ? "none" : "auto";
            }

            renderizar();
        }

        function alDesplazar() {
            var rect = envoltorio.getBoundingClientRect();
            var distancia = envoltorio.offsetHeight - window.innerHeight;
            if (distancia <= 0) { aplicarProgreso(0); return; }
            var avance = -rect.top / distancia;
            avance = Math.min(1, Math.max(0, avance));
            aplicarProgreso(avance);
        }

        window.addEventListener("resize", function () {
            ajustarTamano();
            alDesplazar();
        }, { passive: true });

        window.addEventListener("scroll", alDesplazar, { passive: true });

        ajustarTamano();
        aplicarEspecie("perro");
        aplicarProgreso(0);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", iniciar);
    } else {
        iniciar();
    }
})();
