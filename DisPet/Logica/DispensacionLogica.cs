using System.Collections.Generic;
using DisPet.Datos;
using DisPet.Modelo;

namespace DisPet.Logica
{
    public class DispensacionLogica
    {
        private DispensacionDatos dispensacionDatos = new DispensacionDatos();

        public List<Dispensacion> ListarHistorial(int idUsuario)
        {
            return dispensacionDatos.Listar(idUsuario);
        }
    }
}
