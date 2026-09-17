using System;
using DisPet.Datos;
using DisPet.Modelo;

namespace DisPet.Logica
{
    // Hardware simulado: no hay dispensador fisico, esta clase decide si
    // "cae" comida y lleva el nivel de la tolva en la base de datos.
    public class DispensadorLogica
    {
        // Indice = (int)DateTime.Now.DayOfWeek, donde domingo es 0.
        private static readonly string[] DiasPorIndiceSemana = { "D", "L", "M", "X", "J", "V", "S" };

        private DispensadorDatos dispensadorDatos = new DispensadorDatos();
        private DispensacionDatos dispensacionDatos = new DispensacionDatos();

        public Dispensador ObtenerPorUsuario(int idUsuario)
        {
            return dispensadorDatos.ObtenerPorUsuario(idUsuario);
        }

        public string ObtenerDiaDeHoy()
        {
            return DiasPorIndiceSemana[(int)DateTime.Now.DayOfWeek];
        }

        public bool HorarioAplicaHoy(Horario horario)
        {
            string diaHoy = ObtenerDiaDeHoy();
            return horario.Dias.Contains(diaHoy);
        }

        public Dispensacion DispensarPorcion(Mascota mascota, Dispensador dispensador, int cantidadGramos, int? idHorario)
        {
            if (cantidadGramos <= 0)
            {
                throw new Exception("La cantidad a dispensar debe ser mayor a cero.");
            }

            Dispensacion dispensacion = new Dispensacion();
            dispensacion.IdMascota = mascota.IdMascota;
            dispensacion.IdHorario = idHorario;
            dispensacion.FechaHora = DateTime.Now;
            dispensacion.CantidadGramos = cantidadGramos;

            if (idHorario.HasValue)
            {
                dispensacion.Tipo = "Programada";
            }
            else
            {
                dispensacion.Tipo = "Manual";
            }

            if (!dispensador.Conectado)
            {
                dispensacion.Estado = "Fallida";
            }
            else if (dispensador.NivelActualGramos < cantidadGramos)
            {
                dispensacion.Estado = "Fallida";
            }
            else
            {
                dispensador.NivelActualGramos = dispensador.NivelActualGramos - cantidadGramos;
                dispensadorDatos.ActualizarNivel(dispensador.IdDispensador, dispensador.NivelActualGramos);
                dispensacion.Estado = "Exitosa";
            }

            dispensacionDatos.Insertar(dispensacion);

            if (dispensacion.Estado == "Fallida")
            {
                throw new Exception("No se pudo dispensar: revise la conexion o el nivel de alimento del dispensador.");
            }

            return dispensacion;
        }
    }
}
