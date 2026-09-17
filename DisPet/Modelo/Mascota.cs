using System;

namespace DisPet.Modelo
{
    public class Mascota
    {
        public int IdMascota { get; set; }
        public int IdUsuario { get; set; }
        public string Nombre { get; set; }
        public string Especie { get; set; }
        public string Raza { get; set; }
        public decimal PesoKg { get; set; }
        public bool Activo { get; set; }
    }
}
