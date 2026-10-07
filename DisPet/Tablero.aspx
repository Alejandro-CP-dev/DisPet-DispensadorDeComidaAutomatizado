<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="Tablero.aspx.cs" Inherits="DisPet.Tablero" MasterPageFile="~/Site.Master" Title="Tablero" %>
<asp:Content ID="titulo" ContentPlaceHolderID="tituloPagina" runat="server">Tablero</asp:Content>
<asp:Content ID="subtitulo" ContentPlaceHolderID="subtituloPagina" runat="server">Estado del dispensador y proxima alimentacion de tus mascotas.</asp:Content>
<asp:Content ID="contenido" ContentPlaceHolderID="contenidoPrincipal" runat="server">

    <asp:Literal ID="literalMensaje" runat="server" />

    <div class="tablero-hero">
        <div class="dial-nivel-contenedor">
            <div class="dial-nivel">
                <svg viewBox="0 0 200 200" aria-hidden="true">
                    <circle class="dial-nivel-pista" cx="100" cy="100" r="86" />
                    <asp:Literal ID="literalAnilloNivel" runat="server" />
                </svg>
                <div class="dial-nivel-valor">
                    <div class="etiqueta">Nivel de alimento</div>
                    <div class="valor"><asp:Literal ID="literalNivel" runat="server" /></div>
                    <div class="porcentaje"><asp:Literal ID="literalPorcentajeNivel" runat="server" /></div>
                </div>
            </div>
        </div>

        <div class="rejilla-estado">
            <div class="tarjeta-estado">
                <div class="tarjeta-estado-icono">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="16" height="10" rx="2" /><path d="M18 10.5h2a1.5 1.5 0 0 1 1.5 1.5 1.5 1.5 0 0 1-1.5 1.5h-2" /></svg>
                </div>
                <div class="tarjeta-estado-etiqueta">Dispensador</div>
                <div class="tarjeta-estado-valor"><asp:Literal ID="literalNombreDispensador" runat="server" /></div>
                <asp:Literal ID="literalConectado" runat="server" />
            </div>
            <div class="tarjeta-estado">
                <div class="tarjeta-estado-icono">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="16" height="10" rx="2" /><path d="M18 10.5h2a1.5 1.5 0 0 1 1.5 1.5 1.5 1.5 0 0 1-1.5 1.5h-2" /><path d="M6 10v4M9 10v4" /></svg>
                </div>
                <div class="tarjeta-estado-etiqueta">Bateria</div>
                <asp:Literal ID="literalBateria" runat="server" />
            </div>
        </div>
    </div>

    <div class="panel-maestro-detalle">
        <div class="tarjeta">
            <h3>Horarios de hoy</h3>
            <asp:GridView ID="listaHorariosHoy" runat="server" AutoGenerateColumns="false" CssClass="tabla-agenda">
                <Columns>
                    <asp:BoundField DataField="Hora" HeaderText="Hora" ItemStyle-CssClass="col-hora" />
                    <asp:BoundField DataField="NombreMascota" HeaderText="Mascota" />
                    <asp:BoundField DataField="CantidadGramos" HeaderText="Gramos" />
                </Columns>
                <EmptyDataTemplate>
                    <div class="estado-vacio">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.2 2" /></svg>
                        <p>No hay horarios programados para hoy.</p>
                    </div>
                </EmptyDataTemplate>
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
    </div>

</asp:Content>
