<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="Tablero.aspx.cs" Inherits="DisPet.Tablero" MasterPageFile="~/Site.Master" %>
<asp:Content ID="contenido" ContentPlaceHolderID="contenidoPrincipal" runat="server">

    <asp:Literal ID="literalMensaje" runat="server" />

    <div class="tarjeta">
        <h3>Estado del dispensador</h3>
        <p><b>Nombre:</b> <asp:Literal ID="literalNombreDispensador" runat="server" /></p>
        <p><b>Nivel de alimento:</b> <asp:Literal ID="literalNivel" runat="server" /></p>
        <p><b>Conectado:</b> <asp:Literal ID="literalConectado" runat="server" /></p>
        <p><b>Bateria:</b> <asp:Literal ID="literalBateria" runat="server" /></p>
    </div>

    <div class="tarjeta">
        <h3>Horarios de hoy</h3>
        <asp:GridView ID="listaHorariosHoy" runat="server" AutoGenerateColumns="false"
            EmptyDataText="No hay horarios programados para hoy.">
            <Columns>
                <asp:BoundField DataField="NombreMascota" HeaderText="Mascota" />
                <asp:BoundField DataField="Hora" HeaderText="Hora" />
                <asp:BoundField DataField="CantidadGramos" HeaderText="Gramos" />
            </Columns>
        </asp:GridView>
    </div>

    <div class="tarjeta">
        <h3>Porcion manual</h3>
        <div class="campo">
            <label for="listaMascotas">Mascota</label>
            <asp:DropDownList ID="listaMascotas" runat="server" DataTextField="Nombre" DataValueField="IdMascota" />
        </div>
        <div class="campo">
            <label for="cajaCantidad">Cantidad en gramos</label>
            <asp:TextBox ID="cajaCantidad" runat="server" TextMode="Number" />
        </div>
        <asp:Button ID="botonDispensar" runat="server" Text="Dispensar ahora" CssClass="boton" OnClick="botonDispensar_Click" />
    </div>

</asp:Content>
