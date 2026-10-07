<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="Tablero.aspx.cs" Inherits="DisPet.Tablero" MasterPageFile="~/Site.Master" Title="Tablero" %>
<asp:Content ID="titulo" ContentPlaceHolderID="tituloPagina" runat="server">Tablero</asp:Content>
<asp:Content ID="subtitulo" ContentPlaceHolderID="subtituloPagina" runat="server">Estado del dispensador y proxima alimentacion de tus mascotas.</asp:Content>
<asp:Content ID="contenido" ContentPlaceHolderID="contenidoPrincipal" runat="server">

    <asp:Literal ID="literalMensaje" runat="server" />

    <div class="tablero-hero">
        <div class="dial-24h-contenedor">
            <div class="dial-24h">
                <svg viewBox="0 0 200 200" aria-hidden="true">
                    <circle cx="100" cy="100" r="92" fill="none" stroke="#4a3f36" stroke-width="1.5" />
                    <circle cx="100" cy="100" r="66" fill="none" stroke="#3a322b" stroke-width="1" />
                    <g stroke-linecap="round">
                        <line x1="100" y1="8" x2="100" y2="20" stroke="#c97a2b" stroke-width="3" transform="rotate(0 100 100)" />
                        <line x1="100" y1="8" x2="100" y2="18" stroke="#564a3f" stroke-width="2" transform="rotate(15 100 100)" />
                        <line x1="100" y1="8" x2="100" y2="18" stroke="#564a3f" stroke-width="2" transform="rotate(30 100 100)" />
                        <line x1="100" y1="8" x2="100" y2="18" stroke="#564a3f" stroke-width="2" transform="rotate(45 100 100)" />
                        <line x1="100" y1="8" x2="100" y2="18" stroke="#564a3f" stroke-width="2" transform="rotate(60 100 100)" />
                        <line x1="100" y1="8" x2="100" y2="18" stroke="#564a3f" stroke-width="2" transform="rotate(75 100 100)" />
                        <line x1="100" y1="8" x2="100" y2="20" stroke="#c97a2b" stroke-width="3" transform="rotate(90 100 100)" />
                        <line x1="100" y1="8" x2="100" y2="18" stroke="#564a3f" stroke-width="2" transform="rotate(105 100 100)" />
                        <line x1="100" y1="8" x2="100" y2="18" stroke="#564a3f" stroke-width="2" transform="rotate(120 100 100)" />
                        <line x1="100" y1="8" x2="100" y2="18" stroke="#564a3f" stroke-width="2" transform="rotate(135 100 100)" />
                        <line x1="100" y1="8" x2="100" y2="18" stroke="#564a3f" stroke-width="2" transform="rotate(150 100 100)" />
                        <line x1="100" y1="8" x2="100" y2="18" stroke="#564a3f" stroke-width="2" transform="rotate(165 100 100)" />
                        <line x1="100" y1="8" x2="100" y2="20" stroke="#c97a2b" stroke-width="3" transform="rotate(180 100 100)" />
                        <line x1="100" y1="8" x2="100" y2="18" stroke="#564a3f" stroke-width="2" transform="rotate(195 100 100)" />
                        <line x1="100" y1="8" x2="100" y2="18" stroke="#564a3f" stroke-width="2" transform="rotate(210 100 100)" />
                        <line x1="100" y1="8" x2="100" y2="18" stroke="#564a3f" stroke-width="2" transform="rotate(225 100 100)" />
                        <line x1="100" y1="8" x2="100" y2="18" stroke="#564a3f" stroke-width="2" transform="rotate(240 100 100)" />
                        <line x1="100" y1="8" x2="100" y2="18" stroke="#564a3f" stroke-width="2" transform="rotate(255 100 100)" />
                        <line x1="100" y1="8" x2="100" y2="20" stroke="#c97a2b" stroke-width="3" transform="rotate(270 100 100)" />
                        <line x1="100" y1="8" x2="100" y2="18" stroke="#564a3f" stroke-width="2" transform="rotate(285 100 100)" />
                        <line x1="100" y1="8" x2="100" y2="18" stroke="#564a3f" stroke-width="2" transform="rotate(300 100 100)" />
                        <line x1="100" y1="8" x2="100" y2="18" stroke="#564a3f" stroke-width="2" transform="rotate(315 100 100)" />
                        <line x1="100" y1="8" x2="100" y2="18" stroke="#564a3f" stroke-width="2" transform="rotate(330 100 100)" />
                        <line x1="100" y1="8" x2="100" y2="18" stroke="#564a3f" stroke-width="2" transform="rotate(345 100 100)" />
                    </g>
                </svg>
                <div class="dial-24h-valor">
                    <div class="etiqueta">Nivel de alimento</div>
                    <div class="valor"><asp:Literal ID="literalNivel" runat="server" /></div>
                </div>
            </div>
        </div>

        <div class="panel-estado">
            <div class="fila-estado">
                <div class="etiqueta">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3c3 3.5 6 6.8 6 10a6 6 0 1 1-12 0c0-3.2 3-6.5 6-10z" /></svg>
                    Tolva
                </div>
                <asp:Literal ID="literalBarraNivel" runat="server" />
            </div>
            <div class="fila-estado">
                <div class="etiqueta">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="16" height="10" rx="2" /><path d="M18 10.5h2a1.5 1.5 0 0 1 1.5 1.5 1.5 1.5 0 0 1-1.5 1.5h-2" /></svg>
                    Dispensador
                </div>
                <div>
                    <div class="valor-texto"><asp:Literal ID="literalNombreDispensador" runat="server" /></div>
                    <asp:Literal ID="literalConectado" runat="server" />
                </div>
            </div>
            <div class="fila-estado">
                <div class="etiqueta">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="16" height="10" rx="2" /><path d="M18 10.5h2a1.5 1.5 0 0 1 1.5 1.5 1.5 1.5 0 0 1-1.5 1.5h-2" /><path d="M6 10v4M9 10v4" /></svg>
                    Bateria
                </div>
                <div class="valor"><asp:Literal ID="literalBateria" runat="server" /></div>
            </div>
        </div>
    </div>

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

</asp:Content>
