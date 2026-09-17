<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="Login.aspx.cs" Inherits="DisPet.Login" %>
<!DOCTYPE html>
<html>
<head runat="server">
    <meta charset="utf-8" />
    <title>DISPET - Iniciar sesion</title>
    <link rel="stylesheet" type="text/css" href="Estilos/Site.css" />
</head>
<body>
    <form id="formLogin" runat="server">
        <div class="encabezado">
            <h1>DISPET</h1>
        </div>
        <div class="contenido" style="max-width: 360px;">
            <div class="tarjeta">
                <asp:Literal ID="literalError" runat="server" />

                <div class="campo">
                    <label for="cajaCorreo">Correo</label>
                    <asp:TextBox ID="cajaCorreo" runat="server" CssClass="" TextMode="Email" />
                </div>
                <div class="campo">
                    <label for="cajaClave">Clave</label>
                    <asp:TextBox ID="cajaClave" runat="server" TextMode="Password" />
                </div>

                <asp:Button ID="botonIngresar" runat="server" Text="Ingresar" CssClass="boton" OnClick="botonIngresar_Click" />
            </div>
        </div>
    </form>
</body>
</html>
