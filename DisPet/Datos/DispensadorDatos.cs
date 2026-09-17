using System.Data;
using System.Data.SqlClient;
using DisPet.Modelo;

namespace DisPet.Datos
{
    public class DispensadorDatos
    {
        // El prototipo asume un dispensador por usuario, por eso se trae el primero.
        public Dispensador ObtenerPorUsuario(int idUsuario)
        {
            Dispensador dispensador = null;

            using (SqlConnection conexion = ConexionBD.ObtenerConexion())
            {
                string sql = "SELECT TOP 1 IdDispensador, IdUsuario, Nombre, CapacidadGramos, " +
                             "NivelActualGramos, Conectado, BateriaPorcentaje " +
                             "FROM Dispensador WHERE IdUsuario = @IdUsuario";

                SqlCommand comando = new SqlCommand(sql, conexion);
                comando.Parameters.AddWithValue("@IdUsuario", idUsuario);

                conexion.Open();
                SqlDataReader lector = comando.ExecuteReader();

                if (lector.Read())
                {
                    dispensador = LeerDispensador(lector);
                }
            }

            return dispensador;
        }

        public void ActualizarNivel(int idDispensador, int nivelActualGramos)
        {
            using (SqlConnection conexion = ConexionBD.ObtenerConexion())
            {
                string sql = "UPDATE Dispensador SET NivelActualGramos = @NivelActualGramos " +
                             "WHERE IdDispensador = @IdDispensador";

                SqlCommand comando = new SqlCommand(sql, conexion);
                comando.Parameters.AddWithValue("@NivelActualGramos", nivelActualGramos);
                comando.Parameters.AddWithValue("@IdDispensador", idDispensador);

                conexion.Open();
                comando.ExecuteNonQuery();
            }
        }

        private Dispensador LeerDispensador(SqlDataReader lector)
        {
            Dispensador dispensador = new Dispensador();
            dispensador.IdDispensador = (int)lector["IdDispensador"];
            dispensador.IdUsuario = (int)lector["IdUsuario"];
            dispensador.Nombre = (string)lector["Nombre"];
            dispensador.CapacidadGramos = (int)lector["CapacidadGramos"];
            dispensador.NivelActualGramos = (int)lector["NivelActualGramos"];
            dispensador.Conectado = (bool)lector["Conectado"];
            dispensador.BateriaPorcentaje = (int)lector["BateriaPorcentaje"];
            return dispensador;
        }
    }
}
