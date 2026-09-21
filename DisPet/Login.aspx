<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="Login.aspx.cs" Inherits="DisPet.Login" %>
<!DOCTYPE html>
<html>
<head runat="server">
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>DISPET - Iniciar sesion</title>
    <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='.9em' font-size='80'%3E%F0%9F%90%BE%3C/text%3E%3C/svg%3E" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
    <link rel="stylesheet" type="text/css" href="Estilos/Site.css" />
</head>
<body>
    <form id="formLogin" runat="server">
        <div class="pantalla-login">
            <div class="panel-marca">
                <div class="panel-marca-decoracion" aria-hidden="true"></div>
                <div class="panel-marca-contenido">
                    <div class="icono-marca-grande">🐾</div>
                    <h1>DISPET</h1>
                    <p class="panel-marca-tagline">Alimenta a tus mascotas a tiempo, siempre, incluso cuando no estas en casa.</p>

                    <ul class="panel-marca-lista">
                        <li>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.2 2" /></svg>
                            Horarios automaticos y porciones exactas para cada mascota
                        </li>
                        <li>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3c3 3.5 6 6.8 6 10a6 6 0 1 1-12 0c0-3.2 3-6.5 6-10z" /></svg>
                            Monitoreo del nivel de alimento en tiempo real
                        </li>
                        <li>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 2.8-6.5" /><path d="M3 4.5V9h4.5" /><path d="M12 7.5v5l3.3 1.9" /></svg>
                            Historial completo de cada dispensacion
                        </li>
                    </ul>
                </div>
            </div>

            <div class="panel-formulario">
                <div class="tarjeta-login">
                    <div class="icono-marca">🐾</div>
                    <h1>DISPET</h1>
                    <p>Ingresa para administrar el dispensador de tu mascota.</p>

                    <asp:Literal ID="literalError" runat="server" />

                    <div class="campo">
                        <label for="cajaCorreo">Correo</label>
                        <asp:TextBox ID="cajaCorreo" runat="server" TextMode="Email" placeholder="tucorreo@ejemplo.com" />
                    </div>
                    <div class="campo">
                        <label for="cajaClave">Clave</label>
                        <asp:TextBox ID="cajaClave" runat="server" TextMode="Password" placeholder="••••••••" />
                    </div>

                    <asp:Button ID="botonIngresar" runat="server" Text="Ingresar" CssClass="boton" OnClick="botonIngresar_Click" />
                </div>
            </div>
        </div>
    </form>
</body>
</html>
