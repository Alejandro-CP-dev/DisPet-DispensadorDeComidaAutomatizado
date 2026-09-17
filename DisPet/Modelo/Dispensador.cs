using System;

namespace DisPet.Modelo
{
    public class Dispensador
    {
        public int IdDispensador { get; set; }
        public int IdUsuario { get; set; }
        public string Nombre { get; set; }
        public int CapacidadGramos { get; set; }
        public int NivelActualGramos { get; set; }
        public bool Conectado { get; set; }
        public int BateriaPorcentaje { get; set; }
    }
}
