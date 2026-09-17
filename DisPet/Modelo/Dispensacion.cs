using System;

namespace DisPet.Modelo
{
    public class Dispensacion
    {
        public int IdDispensacion { get; set; }
        public int IdMascota { get; set; }
        public int? IdHorario { get; set; }
        public DateTime FechaHora { get; set; }
        public int CantidadGramos { get; set; }
        public string Tipo { get; set; }
        public string Estado { get; set; }

        // Solo para mostrar en pantalla, no se guarda en esta tabla
        public string NombreMascota { get; set; }
    }
}
