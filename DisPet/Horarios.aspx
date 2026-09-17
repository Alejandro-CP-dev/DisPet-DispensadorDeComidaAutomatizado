<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="Horarios.aspx.cs" Inherits="DisPet.Horarios" MasterPageFile="~/Site.Master" %>
<asp:Content ID="contenido" ContentPlaceHolderID="contenidoPrincipal" runat="server">

    <asp:Literal ID="literalMensaje" runat="server" />

    <div class="tarjeta">
        <h3>Horarios de alimentacion</h3>
        <asp:GridView ID="listaHorarios" runat="server" AutoGenerateColumns="false"
            DataKeyNames="IdHorario" EmptyDataText="No hay horarios registrados."
            OnRowCommand="listaHorarios_RowCommand">
            <Columns>
                <asp:BoundField DataField="NombreMascota" HeaderText="Mascota" />
                <asp:BoundField DataField="Hora" HeaderText="Hora" />
                <asp:BoundField DataField="CantidadGramos" HeaderText="Gramos" />
                <asp:BoundField DataField="DiasTexto" HeaderText="Dias" />
                <asp:TemplateField>
                    <ItemTemplate>
                        <asp:LinkButton runat="server" CommandName="Editar" CommandArgument='<%# Eval("IdHorario") %>'>Editar</asp:LinkButton>
                        &nbsp;
                        <asp:LinkButton runat="server" CommandName="Eliminar" CommandArgument='<%# Eval("IdHorario") %>'>Eliminar</asp:LinkButton>
                    </ItemTemplate>
                </asp:TemplateField>
            </Columns>
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
            <asp:TextBox ID="cajaCantidadGramos" runat="server" TextMode="Number" />
        </div>
        <div class="campo">
            <label>Dias de la semana</label>
            <asp:CheckBoxList ID="listaDias" runat="server" RepeatDirection="Horizontal">
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
