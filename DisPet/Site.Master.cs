using System;
using System.IO;
using System.Web.UI;
using System.Web.UI.HtmlControls;
using System.Web.UI.WebControls;

namespace DisPet
{
    public partial class SiteMaster : MasterPage
    {
        protected HtmlAnchor enlaceTablero;
        protected HtmlAnchor enlaceMascotas;
        protected HtmlAnchor enlaceHorarios;
        protected HtmlAnchor enlaceHistorial;
        protected Literal literalIniciales;
        protected Literal literalUsuario;
        protected LinkButton botonCerrarSesion;

        protected void Page_Load(object sender, EventArgs e)
        {
            if (Session["IdUsuario"] == null)
            {
                Response.Redirect("~/Login.aspx");
                return;
            }

            string nombreUsuario = (string)Session["NombreUsuario"];
            literalUsuario.Text = nombreUsuario;
            literalIniciales.Text = ObtenerIniciales(nombreUsuario);

            MarcarEnlaceActivo();
        }

        private string ObtenerIniciales(string nombre)
        {
            if (string.IsNullOrWhiteSpace(nombre))
            {
                return "";
            }

            string[] partes = nombre.Trim().Split(' ');

            if (partes.Length == 1)
            {
                return partes[0].Substring(0, 1).ToUpper();
            }

            return (partes[0].Substring(0, 1) + partes[partes.Length - 1].Substring(0, 1)).ToUpper();
        }

        private void MarcarEnlaceActivo()
        {
            string paginaActual = Path.GetFileName(Request.Path).ToLower();

            if (paginaActual == "tablero.aspx")
            {
                enlaceTablero.Attributes["class"] += " activo";
            }
            else if (paginaActual == "mascotas.aspx")
            {
                enlaceMascotas.Attributes["class"] += " activo";
            }
            else if (paginaActual == "horarios.aspx")
            {
                enlaceHorarios.Attributes["class"] += " activo";
            }
            else if (paginaActual == "historial.aspx")
            {
                enlaceHistorial.Attributes["class"] += " activo";
            }
        }

        protected void botonCerrarSesion_Click(object sender, EventArgs e)
        {
            Session.Clear();
            Response.Redirect("~/Login.aspx");
        }
    }
}
