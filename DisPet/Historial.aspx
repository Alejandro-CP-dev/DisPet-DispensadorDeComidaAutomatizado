<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="Historial.aspx.cs" Inherits="DisPet.Historial" MasterPageFile="~/Site.Master" %>
<asp:Content ID="contenido" ContentPlaceHolderID="contenidoPrincipal" runat="server">

    <div class="tarjeta">
        <h3>Historial de dispensaciones</h3>
        <asp:GridView ID="listaHistorial" runat="server" AutoGenerateColumns="false"
            EmptyDataText="Todavia no hay dispensaciones registradas.">
            <Columns>
                <asp:BoundField DataField="NombreMascota" HeaderText="Mascota" />
                <asp:BoundField DataField="FechaHora" HeaderText="Fecha y hora" DataFormatString="{0:dd/MM/yyyy HH:mm}" />
                <asp:BoundField DataField="CantidadGramos" HeaderText="Gramos" />
                <asp:BoundField DataField="Tipo" HeaderText="Tipo" />
                <asp:BoundField DataField="Estado" HeaderText="Estado" />
            </Columns>
        </asp:GridView>
    </div>

</asp:Content>
