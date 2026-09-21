<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="Horarios.aspx.cs" Inherits="DisPet.Horarios" MasterPageFile="~/Site.Master" Title="Horarios" %>
<asp:Content ID="titulo" ContentPlaceHolderID="tituloPagina" runat="server">Horarios</asp:Content>
<asp:Content ID="subtitulo" ContentPlaceHolderID="subtituloPagina" runat="server">Programa cuando y cuanto se dispensa para cada mascota.</asp:Content>
<asp:Content ID="contenido" ContentPlaceHolderID="contenidoPrincipal" runat="server">

    <asp:Literal ID="literalMensaje" runat="server" />

    <div class="tarjeta">
        <h3>Horarios de alimentacion</h3>
        <asp:GridView ID="listaHorarios" runat="server" AutoGenerateColumns="false"
            DataKeyNames="IdHorario"
            OnRowCommand="listaHorarios_RowCommand">
            <Columns>
                <asp:BoundField DataField="NombreMascota" HeaderText="Mascota" />
                <asp:BoundField DataField="Hora" HeaderText="Hora" />
                <asp:BoundField DataField="CantidadGramos" HeaderText="Gramos" />
                <asp:TemplateField HeaderText="Dias">
                    <ItemTemplate>
                        <asp:Literal runat="server" Text='<%# Eval("DiasTexto") %>' />
                    </ItemTemplate>
                </asp:TemplateField>
                <asp:TemplateField>
                    <ItemTemplate>
                        <asp:LinkButton runat="server" CssClass="enlace-accion" CommandName="Editar" CommandArgument='<%# Eval("IdHorario") %>'>Editar</asp:LinkButton>
                        &nbsp;&nbsp;
                        <asp:LinkButton runat="server" CssClass="enlace-accion enlace-accion-peligro" CommandName="Eliminar" CommandArgument='<%# Eval("IdHorario") %>'>Eliminar</asp:LinkButton>
                    </ItemTemplate>
                </asp:TemplateField>
            </Columns>
            <EmptyDataTemplate>
                <div class="estado-vacio">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.2 2" /></svg>
                    <p>No hay horarios registrados todavia.</p>
                </div>
            </EmptyDataTemplate>
        </asp:GridView>
    </div>

    <div class="tarjeta">
        <h3><asp:Literal ID="literalTituloFormulario" runat="server" Text="Nuevo horario" /></h3>
        <asp:HiddenField ID="cajaIdHorario" runat="server" Value="0" />

        <div class="campo">
            <label for="listaMascotas">Mascota</label>
            <asp:DropDownList ID="listaMascotas" runat="server" DataTextField="Nombre" DataValueField="IdMascota" />
        </div>
        <div class="campo">
            <label for="cajaHora">Hora (HH:mm)</label>
            <asp:TextBox ID="cajaHora" runat="server" TextMode="Time" />
        </div>
        <div class="campo">
            <label for="cajaCantidadGramos">Cantidad en gramos</label>
            <asp:TextBox ID="cajaCantidadGramos" runat="server" TextMode="Number" placeholder="0" />
        </div>
        <div class="campo">
            <label>Dias de la semana</label>
            <asp:CheckBoxList ID="listaDias" runat="server" RepeatDirection="Horizontal" CssClass="lista-dias">
                <asp:ListItem Text="Lun" Value="L" />
                <asp:ListItem Text="Mar" Value="M" />
                <asp:ListItem Text="Mie" Value="X" />
                <asp:ListItem Text="Jue" Value="J" />
                <asp:ListItem Text="Vie" Value="V" />
                <asp:ListItem Text="Sab" Value="S" />
                <asp:ListItem Text="Dom" Value="D" />
            </asp:CheckBoxList>
        </div>

        <asp:Button ID="botonGuardar" runat="server" Text="Guardar" CssClass="boton" OnClick="botonGuardar_Click" />
        <asp:Button ID="botonCancelar" runat="server" Text="Cancelar" CssClass="boton boton-secundario" CausesValidation="false" OnClick="botonCancelar_Click" />
    </div>

</asp:Content>
