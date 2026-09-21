<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="Mascotas.aspx.cs" Inherits="DisPet.Mascotas" MasterPageFile="~/Site.Master" Title="Mascotas" %>
<asp:Content ID="titulo" ContentPlaceHolderID="tituloPagina" runat="server">Mascotas</asp:Content>
<asp:Content ID="subtitulo" ContentPlaceHolderID="subtituloPagina" runat="server">Registra y administra las mascotas de tu hogar.</asp:Content>
<asp:Content ID="contenido" ContentPlaceHolderID="contenidoPrincipal" runat="server">

    <asp:Literal ID="literalMensaje" runat="server" />

    <div class="tarjeta">
        <h3>Mis mascotas</h3>
        <asp:GridView ID="listaMascotas" runat="server" AutoGenerateColumns="false"
            DataKeyNames="IdMascota"
            OnRowCommand="listaMascotas_RowCommand" OnRowDataBound="listaMascotas_RowDataBound">
            <Columns>
                <asp:BoundField DataField="Nombre" HeaderText="Nombre" />
                <asp:TemplateField HeaderText="Especie">
                    <ItemTemplate>
                        <asp:Literal ID="literalEspecie" runat="server" />
                    </ItemTemplate>
                </asp:TemplateField>
                <asp:BoundField DataField="Raza" HeaderText="Raza" />
                <asp:BoundField DataField="PesoKg" HeaderText="Peso (Kg)" />
                <asp:TemplateField>
                    <ItemTemplate>
                        <asp:LinkButton runat="server" CssClass="enlace-accion" CommandName="Editar" CommandArgument='<%# Eval("IdMascota") %>'>Editar</asp:LinkButton>
                        &nbsp;&nbsp;
                        <asp:LinkButton runat="server" CssClass="enlace-accion enlace-accion-peligro" CommandName="Eliminar" CommandArgument='<%# Eval("IdMascota") %>'>Eliminar</asp:LinkButton>
                    </ItemTemplate>
                </asp:TemplateField>
            </Columns>
            <EmptyDataTemplate>
                <div class="estado-vacio">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-6.7-4.35-9.1-8.6C1.3 9 2.9 5.4 6.5 5.4c2 0 3.3 1.2 4 2.3.7-1.1 2-2.3 4-2.3 3.6 0 5.2 3.6 3.6 7C19.7 16.65 12 21 12 21z" /></svg>
                    <p>Todavia no tienes mascotas registradas.</p>
                </div>
            </EmptyDataTemplate>
        </asp:GridView>
    </div>

    <div class="tarjeta">
        <h3><asp:Literal ID="literalTituloFormulario" runat="server" Text="Nueva mascota" /></h3>
        <asp:HiddenField ID="cajaIdMascota" runat="server" Value="0" />

        <div class="campo">
            <label for="cajaNombre">Nombre</label>
            <asp:TextBox ID="cajaNombre" runat="server" placeholder="Ej: Luna" />
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
            <asp:TextBox ID="cajaRaza" runat="server" placeholder="Ej: Criolla" />
        </div>
        <div class="campo">
            <label for="cajaPesoKg">Peso (Kg)</label>
            <asp:TextBox ID="cajaPesoKg" runat="server" TextMode="Number" placeholder="0.0" />
        </div>

        <asp:Button ID="botonGuardar" runat="server" Text="Guardar" CssClass="boton" OnClick="botonGuardar_Click" />
        <asp:Button ID="botonCancelar" runat="server" Text="Cancelar" CssClass="boton boton-secundario" CausesValidation="false" OnClick="botonCancelar_Click" />
    </div>

</asp:Content>
