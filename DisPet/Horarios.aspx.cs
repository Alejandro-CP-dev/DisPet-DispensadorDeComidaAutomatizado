using System;
using System.Collections.Generic;
using System.Web.UI;
using System.Web.UI.WebControls;
using DisPet.Logica;
using DisPet.Modelo;

namespace DisPet
{
    public partial class Horarios : Page
    {
        protected Literal literalMensaje;
        protected Literal literalTituloFormulario;
        protected GridView listaHorarios;
        protected HiddenField cajaIdHorario;
        protected DropDownList listaMascotas;
        protected TextBox cajaHora;
        protected TextBox cajaCantidadGramos;
        protected CheckBoxList listaDias;
        protected Button botonGuardar;
        protected Button botonCancelar;

        private MascotaLogica mascotaLogica = new MascotaLogica();
        private HorarioLogica horarioLogica = new HorarioLogica();
        private DispensadorLogica dispensadorLogica = new DispensadorLogica();

        // Solo para mostrar el nombre de la mascota y los dias como texto en
        // la grilla; no corresponde a ninguna tabla de la base de datos.
        private class HorarioParaMostrar
        {
            public int IdHorario { get; set; }
            public string NombreMascota { get; set; }
            public string Hora { get; set; }
            public int CantidadGramos { get; set; }
            public string DiasTexto { get; set; }
        }

        protected void Page_Load(object sender, EventArgs e)
        {
            if (!IsPostBack)
            {
                CargarMascotas();
                CargarLista();
            }
        }

        private int ObtenerIdUsuario()
        {
            return (int)Session["IdUsuario"];
        }

        private void CargarMascotas()
        {
            listaMascotas.DataSource = mascotaLogica.Listar(ObtenerIdUsuario());
            listaMascotas.DataBind();
        }

        private void CargarLista()
        {
            List<Horario> horarios = horarioLogica.Listar(ObtenerIdUsuario());
            List<HorarioParaMostrar> filas = new List<HorarioParaMostrar>();

            foreach (Horario horario in horarios)
            {
                Mascota mascota = mascotaLogica.ObtenerPorId(horario.IdMascota);

                HorarioParaMostrar fila = new HorarioParaMostrar();
                fila.IdHorario = horario.IdHorario;
                fila.NombreMascota = mascota.Nombre;
                fila.Hora = horario.Hora;
                fila.CantidadGramos = horario.CantidadGramos;
                fila.DiasTexto = ConstruirChipsDeDias(horario.Dias);

                filas.Add(fila);
            }

            listaHorarios.DataSource = filas;
            listaHorarios.DataBind();
        }

        private string ConstruirChipsDeDias(List<string> dias)
        {
            string html = "";

            foreach (string dia in dias)
            {
                html += "<span class=\"insignia insignia-neutral\" style=\"margin-right:4px;\">" + dia + "</span>";
            }

            return html;
        }

        private void LimpiarFormulario()
        {
            cajaIdHorario.Value = "0";

            if (listaMascotas.Items.Count > 0)
            {
                listaMascotas.SelectedIndex = 0;
            }

            cajaHora.Text = "";
            cajaCantidadGramos.Text = "";

            foreach (ListItem item in listaDias.Items)
            {
                item.Selected = false;
            }

            literalTituloFormulario.Text = "Nuevo horario";
        }

        protected void listaHorarios_RowCommand(object sender, GridViewCommandEventArgs e)
        {
            int idHorario = int.Parse((string)e.CommandArgument);

            if (e.CommandName == "Editar")
            {
                Horario horario = horarioLogica.ObtenerPorId(idHorario);

                cajaIdHorario.Value = horario.IdHorario.ToString();
                listaMascotas.SelectedValue = horario.IdMascota.ToString();
                cajaHora.Text = horario.Hora;
                cajaCantidadGramos.Text = horario.CantidadGramos.ToString();

                foreach (ListItem item in listaDias.Items)
                {
                    item.Selected = horario.Dias.Contains(item.Value);
                }

                literalTituloFormulario.Text = "Editar horario";
            }
            else if (e.CommandName == "Eliminar")
            {
                horarioLogica.Eliminar(idHorario);
                LimpiarFormulario();
                CargarLista();
            }
        }

        protected void botonGuardar_Click(object sender, EventArgs e)
        {
            try
            {
                Dispensador dispensador = dispensadorLogica.ObtenerPorUsuario(ObtenerIdUsuario());

                if (dispensador == null)
                {
                    throw new Exception("No hay un dispensador registrado para este usuario.");
                }

                Horario horario = new Horario();
                horario.IdHorario = int.Parse(cajaIdHorario.Value);
                horario.IdMascota = int.Parse(listaMascotas.SelectedValue);
                horario.IdDispensador = dispensador.IdDispensador;
                horario.Hora = cajaHora.Text;
                horario.CantidadGramos = int.Parse(cajaCantidadGramos.Text);

                foreach (ListItem item in listaDias.Items)
                {
                    if (item.Selected)
                    {
                        horario.Dias.Add(item.Value);
                    }
                }

                horarioLogica.Guardar(horario);

                literalMensaje.Text = "<div class=\"mensaje-exito\">Horario guardado correctamente.</div>";
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
