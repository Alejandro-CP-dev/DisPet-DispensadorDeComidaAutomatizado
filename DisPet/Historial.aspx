<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="Historial.aspx.cs" Inherits="DisPet.Historial" MasterPageFile="~/Site.Master" Title="Historial" %>
<asp:Content ID="titulo" ContentPlaceHolderID="tituloPagina" runat="server">Historial</asp:Content>
<asp:Content ID="subtitulo" ContentPlaceHolderID="subtituloPagina" runat="server">Registro de cada vez que el dispensador solto comida.</asp:Content>
<asp:Content ID="contenido" ContentPlaceHolderID="contenidoPrincipal" runat="server">

    <div class="tarjeta">
        <asp:GridView ID="listaHistorial" runat="server" AutoGenerateColumns="false"
            OnRowDataBound="listaHistorial_RowDataBound">
            <Columns>
                <asp:BoundField DataField="NombreMascota" HeaderText="Mascota" />
                <asp:BoundField DataField="FechaHora" HeaderText="Fecha y hora" DataFormatString="{0:dd/MM/yyyy HH:mm}" />
                <asp:BoundField DataField="CantidadGramos" HeaderText="Gramos" />
                <asp:TemplateField HeaderText="Tipo">
                    <ItemTemplate>
                        <asp:Literal ID="literalTipo" runat="server" />
                    </ItemTemplate>
                </asp:TemplateField>
                <asp:TemplateField HeaderText="Estado">
                    <ItemTemplate>
                        <asp:Literal ID="literalEstado" runat="server" />
                    </ItemTemplate>
                </asp:TemplateField>
            </Columns>
            <EmptyDataTemplate>
                <div class="estado-vacio">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 2.8-6.5" /><path d="M3 4.5V9h4.5" /><path d="M12 7.5v5l3.3 1.9" /></svg>
                    <p>Todavia no hay dispensaciones registradas.</p>
                </div>
            </EmptyDataTemplate>
        </asp:GridView>
    </div>

</asp:Content>
