using System;
using System.Web.UI.WebControls;
using DisPet.Logica;
using DisPet.Modelo;

namespace DisPet
{
    public partial class Login : System.Web.UI.Page
    {
        protected Literal literalError;
        protected TextBox cajaCorreo;
        protected TextBox cajaClave;
        protected Button botonIngresar;

        private UsuarioLogica usuarioLogica = new UsuarioLogica();

        protected void Page_Load(object sender, EventArgs e)
        {
            if (!IsPostBack && Session["IdUsuario"] != null)
            {
                Response.Redirect("~/Tablero.aspx");
            }
        }

        protected void botonIngresar_Click(object sender, EventArgs e)
        {
            try
            {
                Usuario usuario = usuarioLogica.IniciarSesion(cajaCorreo.Text, cajaClave.Text);

                Session["IdUsuario"] = usuario.IdUsuario;
                Session["NombreUsuario"] = usuario.Nombre;

                Response.Redirect("~/Tablero.aspx");
            }
            catch (Exception ex)
            {
                literalError.Text = "<div class=\"mensaje-error\">" + ex.Message + "</div>";
            }
        }
    }
}
