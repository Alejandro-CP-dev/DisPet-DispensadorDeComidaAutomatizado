using System;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace DisPet
{
    public partial class SiteMaster : MasterPage
    {
        protected LinkButton botonCerrarSesion;
        protected Literal literalUsuario;

        protected void Page_Load(object sender, EventArgs e)
        {
            if (Session["IdUsuario"] == null)
            {
                Response.Redirect("~/Login.aspx");
                return;
            }

            literalUsuario.Text = (string)Session["NombreUsuario"];
        }

        protected void botonCerrarSesion_Click(object sender, EventArgs e)
        {
            Session.Clear();
            Response.Redirect("~/Login.aspx");
        }
    }
}
