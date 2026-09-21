using System;
using System.Web.UI;
using System.Web.UI.WebControls;
using DisPet.Logica;
using DisPet.Modelo;

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

        protected void listaHistorial_RowDataBound(object sender, GridViewRowEventArgs e)
        {
            if (e.Row.RowType != DataControlRowType.DataRow)
            {
                return;
            }

            Dispensacion dispensacion = (Dispensacion)e.Row.DataItem;

            Literal literalTipo = (Literal)e.Row.FindControl("literalTipo");

            if (dispensacion.Tipo == "Programada")
            {
                literalTipo.Text = "<span class=\"insignia insignia-info\">Programada</span>";
            }
            else
            {
                literalTipo.Text = "<span class=\"insignia insignia-neutral\">Manual</span>";
            }

            Literal literalEstado = (Literal)e.Row.FindControl("literalEstado");

            if (dispensacion.Estado == "Exitosa")
            {
                literalEstado.Text = "<span class=\"insignia insignia-exito\">Exitosa</span>";
            }
            else
            {
                literalEstado.Text = "<span class=\"insignia insignia-error\">Fallida</span>";
            }
        }
    }
}
