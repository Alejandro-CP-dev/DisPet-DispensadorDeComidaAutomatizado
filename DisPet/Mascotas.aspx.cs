using System;
using System.Web.UI;
using System.Web.UI.WebControls;
using DisPet.Logica;
using DisPet.Modelo;

namespace DisPet
{
    public partial class Mascotas : Page
    {
        protected Literal literalMensaje;
        protected Literal literalTituloFormulario;
        protected GridView listaMascotas;
        protected HiddenField cajaIdMascota;
        protected TextBox cajaNombre;
        protected DropDownList listaEspecie;
        protected TextBox cajaRaza;
        protected TextBox cajaPesoKg;
        protected Button botonGuardar;
        protected Button botonCancelar;

        private MascotaLogica mascotaLogica = new MascotaLogica();

        protected void Page_Load(object sender, EventArgs e)
        {
            if (!IsPostBack)
            {
                CargarLista();
            }
        }

        private int ObtenerIdUsuario()
        {
            return (int)Session["IdUsuario"];
        }

        private void CargarLista()
        {
            listaMascotas.DataSource = mascotaLogica.Listar(ObtenerIdUsuario());
            listaMascotas.DataBind();
        }

        private void LimpiarFormulario()
        {
            cajaIdMascota.Value = "0";
            cajaNombre.Text = "";
            listaEspecie.SelectedIndex = 0;
            cajaRaza.Text = "";
            cajaPesoKg.Text = "";
            literalTituloFormulario.Text = "Nueva mascota";
        }

        protected void listaMascotas_RowCommand(object sender, GridViewCommandEventArgs e)
        {
            int idMascota = int.Parse((string)e.CommandArgument);

            if (e.CommandName == "Editar")
            {
                Mascota mascota = mascotaLogica.ObtenerPorId(idMascota);

                cajaIdMascota.Value = mascota.IdMascota.ToString();
                cajaNombre.Text = mascota.Nombre;
                listaEspecie.SelectedValue = mascota.Especie;
                cajaRaza.Text = mascota.Raza;
                cajaPesoKg.Text = mascota.PesoKg.ToString();
                literalTituloFormulario.Text = "Editar mascota";
            }
            else if (e.CommandName == "Eliminar")
            {
                mascotaLogica.Eliminar(idMascota);
                LimpiarFormulario();
                CargarLista();
            }
        }

        protected void botonGuardar_Click(object sender, EventArgs e)
        {
            try
            {
                Mascota mascota = new Mascota();
                mascota.IdMascota = int.Parse(cajaIdMascota.Value);
                mascota.IdUsuario = ObtenerIdUsuario();
                mascota.Nombre = cajaNombre.Text;
                mascota.Especie = listaEspecie.SelectedValue;
                mascota.Raza = cajaRaza.Text;
                mascota.PesoKg = decimal.Parse(cajaPesoKg.Text);

                mascotaLogica.Guardar(mascota);

                literalMensaje.Text = "<div class=\"mensaje-exito\">Mascota guardada correctamente.</div>";
                LimpiarFormulario();
                CargarLista();
            }
            catch (Exception ex)
            {
                literalMensaje.Text = "<div class=\"mensaje-error\">" + ex.Message + "</div>";
            }
        }

        protected void botonCancelar_Click(object sender, EventArgs e)
        {
            LimpiarFormulario();
        }
    }
}
