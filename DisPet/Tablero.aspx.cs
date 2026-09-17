using System;
using System.Collections.Generic;
using System.Web.UI;
using System.Web.UI.WebControls;
using DisPet.Logica;
using DisPet.Modelo;

namespace DisPet
{
    public partial class Tablero : Page
    {
        protected Literal literalMensaje;
        protected Literal literalNombreDispensador;
        protected Literal literalNivel;
        protected Literal literalConectado;
        protected Literal literalBateria;
        protected GridView listaHorariosHoy;
        protected DropDownList listaMascotas;
        protected TextBox cajaCantidad;
        protected Button botonDispensar;

        private MascotaLogica mascotaLogica = new MascotaLogica();
        private HorarioLogica horarioLogica = new HorarioLogica();
        private DispensadorLogica dispensadorLogica = new DispensadorLogica();

        // Solo para mostrar la lista de horarios de hoy junto al nombre de la
        // mascota; no corresponde a ninguna tabla de la base de datos.
        private class HorarioParaMostrar
        {
            public string NombreMascota { get; set; }
            public string Hora { get; set; }
            public int CantidadGramos { get; set; }
        }

        protected void Page_Load(object sender, EventArgs e)
        {
            if (!IsPostBack)
            {
                CargarDispensador();
                CargarHorariosDeHoy();
                CargarMascotas();
            }
        }

        private int ObtenerIdUsuario()
        {
            return (int)Session["IdUsuario"];
        }

        private void CargarDispensador()
        {
            Dispensador dispensador = dispensadorLogica.ObtenerPorUsuario(ObtenerIdUsuario());

            if (dispensador == null)
            {
                literalNombreDispensador.Text = "Sin dispensador registrado";
                return;
            }

            literalNombreDispensador.Text = dispensador.Nombre;
            literalNivel.Text = dispensador.NivelActualGramos + " / " + dispensador.CapacidadGramos + " g";

            if (dispensador.Conectado)
            {
                literalConectado.Text = "Si";
            }
            else
            {
                literalConectado.Text = "No";
            }

            literalBateria.Text = dispensador.BateriaPorcentaje + "%";
        }

        private void CargarHorariosDeHoy()
        {
            List<Horario> horarios = horarioLogica.Listar(ObtenerIdUsuario());
            List<HorarioParaMostrar> horariosHoy = new List<HorarioParaMostrar>();

            foreach (Horario horario in horarios)
            {
                if (dispensadorLogica.HorarioAplicaHoy(horario))
                {
                    Mascota mascota = mascotaLogica.ObtenerPorId(horario.IdMascota);

                    HorarioParaMostrar fila = new HorarioParaMostrar();
                    fila.NombreMascota = mascota.Nombre;
                    fila.Hora = horario.Hora;
                    fila.CantidadGramos = horario.CantidadGramos;

                    horariosHoy.Add(fila);
                }
            }

            listaHorariosHoy.DataSource = horariosHoy;
            listaHorariosHoy.DataBind();
        }

        private void CargarMascotas()
        {
            listaMascotas.DataSource = mascotaLogica.Listar(ObtenerIdUsuario());
            listaMascotas.DataBind();
        }

        protected void botonDispensar_Click(object sender, EventArgs e)
        {
            try
            {
                int idMascota = int.Parse(listaMascotas.SelectedValue);
                int cantidad = int.Parse(cajaCantidad.Text);

                Mascota mascota = mascotaLogica.ObtenerPorId(idMascota);
                Dispensador dispensador = dispensadorLogica.ObtenerPorUsuario(ObtenerIdUsuario());

                dispensadorLogica.DispensarPorcion(mascota, dispensador, cantidad, null);

                literalMensaje.Text = "<div class=\"mensaje-exito\">Se dispenso la porcion correctamente.</div>";
                CargarDispensador();
            }
            catch (Exception ex)
            {
                literalMensaje.Text = "<div class=\"mensaje-error\">" + ex.Message + "</div>";
            }
        }
    }
}
