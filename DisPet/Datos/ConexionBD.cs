using System.Configuration;
using System.Data.SqlClient;

namespace DisPet.Datos
{
    public static class ConexionBD
    {
        public static SqlConnection ObtenerConexion()
        {
            string cadena = ConfigurationManager.ConnectionStrings["ConexionDisPet"].ConnectionString;
            return new SqlConnection(cadena);
        }
    }
}
