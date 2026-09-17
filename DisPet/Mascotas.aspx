<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="Mascotas.aspx.cs" Inherits="DisPet.Mascotas" MasterPageFile="~/Site.Master" %>
<asp:Content ID="contenido" ContentPlaceHolderID="contenidoPrincipal" runat="server">

    <asp:Literal ID="literalMensaje" runat="server" />

    <div class="tarjeta">
        <h3>Mis mascotas</h3>
        <asp:GridView ID="listaMascotas" runat="server" AutoGenerateColumns="false"
            DataKeyNames="IdMascota" EmptyDataText="No tienes mascotas registradas."
            OnRowCommand="listaMascotas_RowCommand">
            <Columns>
                <asp:BoundField DataField="Nombre" HeaderText="Nombre" />
                <asp:BoundField DataField="Especie" HeaderText="Especie" />
                <asp:BoundField DataField="Raza" HeaderText="Raza" />
                <asp:BoundField DataField="PesoKg" HeaderText="Peso (Kg)" />
                <asp:TemplateField>
                    <ItemTemplate>
                        <asp:LinkButton runat="server" CommandName="Editar" CommandArgument='<%# Eval("IdMascota") %>'>Editar</asp:LinkButton>
                        &nbsp;
                        <asp:LinkButton runat="server" CommandName="Eliminar" CommandArgument='<%# Eval("IdMascota") %>'>Eliminar</asp:LinkButton>
                    </ItemTemplate>
                </asp:TemplateField>
            </Columns>
        </asp:GridView>
    </div>

    <div class="tarjeta">
        <h3><asp:Literal ID="literalTituloFormulario" runat="server" Text="Nueva mascota" /></h3>
        <asp:HiddenField ID="cajaIdMascota" runat="server" Value="0" />

        <div class="campo">
            <label for="cajaNombre">Nombre</label>
            <asp:TextBox ID="cajaNombre" runat="server" />
        </div>
        <div class="campo">
            <label for="listaEspecie">Especie</label>
            <asp:DropDownList ID="listaEspecie" runat="server">
                <asp:ListItem Text="Perro" Value="Perro" />
                <asp:ListItem Text="Gato" Value="Gato" />
            </asp:DropDownList>
        </div>
        <div class="campo">
            <label for="cajaRaza">Raza</label>
            <asp:TextBox ID="cajaRaza" runat="server" />
        </div>
        <div class="campo">
            <label for="cajaPesoKg">Peso (Kg)</label>
            <asp:TextBox ID="cajaPesoKg" runat="server" TextMode="Number" />
        </div>

        <asp:Button ID="botonGuardar" runat="server" Text="Guardar" CssClass="boton" OnClick="botonGuardar_Click" />
        <asp:Button ID="botonCancelar" runat="server" Text="Cancelar" CssClass="boton boton-secundario" CausesValidation="false" OnClick="botonCancelar_Click" />
    </div>

</asp:Content>
