using System.Collections.Generic;

namespace DisPet.Modelo
{
    public class Horario
    {
        public int IdHorario { get; set; }
        public int IdMascota { get; set; }
        public int IdDispensador { get; set; }
        public string Hora { get; set; }
        public int CantidadGramos { get; set; }
        public bool Activo { get; set; }

        // Un elemento por dia en que se repite el horario, ej: "L", "M", "X".
        // Se guarda normalizado en la tabla HorarioDia, no como texto en Horario.
        public List<string> Dias { get; set; }

        public Horario()
        {
            this.Dias = new List<string>();
        }
    }
}
