using System.Data;
using System.Data.SqlClient;
using DisPet.Modelo;

namespace DisPet.Datos
{
    public class UsuarioDatos
    {
        public Usuario ObtenerPorCorreoYClave(string correo, string clave)
        {
            Usuario usuario = null;

            using (SqlConnection conexion = ConexionBD.ObtenerConexion())
            {
                string sql = "SELECT IdUsuario, Nombre, Correo, Clave, Activo " +
                             "FROM Usuario WHERE Correo = @Correo AND Clave = @Clave";

                SqlCommand comando = new SqlCommand(sql, conexion);
                comando.Parameters.AddWithValue("@Correo", correo);
                comando.Parameters.AddWithValue("@Clave", clave);

                conexion.Open();
                SqlDataReader lector = comando.ExecuteReader();

                if (lector.Read())
                {
                    usuario = new Usuario();
                    usuario.IdUsuario = (int)lector["IdUsuario"];
                    usuario.Nombre = (string)lector["Nombre"];
                    usuario.Correo = (string)lector["Correo"];
                    usuario.Clave = (string)lector["Clave"];
                    usuario.Activo = (bool)lector["Activo"];
                }
            }

            return usuario;
        }
    }
}
