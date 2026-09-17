using System;
using System.Web.UI;
using System.Web.UI.WebControls;
using DisPet.Logica;

namespace DisPet
{
    public partial class Historial : Page
    {
        protected GridView listaHistorial;

        private DispensacionLogica dispensacionLogica = new DispensacionLogica();

        protected void Page_Load(object sender, EventArgs e)
        {
            if (!IsPostBack)
            {
                int idUsuario = (int)Session["IdUsuario"];
                listaHistorial.DataSource = dispensacionLogica.ListarHistorial(idUsuario);
                listaHistorial.DataBind();
            }
        }
    }
}
