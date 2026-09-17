using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using DisPet.Modelo;

namespace DisPet.Datos
{
    public class HorarioDatos
    {
        public List<Horario> Listar(int idUsuario)
        {
            List<Horario> horarios = new List<Horario>();

            using (SqlConnection conexion = ConexionBD.ObtenerConexion())
            {
                string sql = "SELECT H.IdHorario, H.IdMascota, H.IdDispensador, H.Hora, " +
                             "H.CantidadGramos, H.Activo " +
                             "FROM Horario H " +
                             "INNER JOIN Mascota M ON M.IdMascota = H.IdMascota " +
                             "WHERE M.IdUsuario = @IdUsuario AND H.Activo = 1 " +
                             "ORDER BY H.Hora";

                SqlCommand comando = new SqlCommand(sql, conexion);
                comando.Parameters.AddWithValue("@IdUsuario", idUsuario);

                conexion.Open();
                SqlDataReader lector = comando.ExecuteReader();

                while (lector.Read())
                {
                    horarios.Add(LeerHorario(lector));
                }

                // Se cierra el reader antes de reutilizar la conexion para
                // traer los dias de cada horario, uno por uno.
                lector.Close();

                foreach (Horario horario in horarios)
                {
                    horario.Dias = ObtenerDiasDeHorario(conexion, horario.IdHorario);
                }
            }

            return horarios;
        }

        public Horario ObtenerPorId(int idHorario)
        {
            Horario horario = null;

            using (SqlConnection conexion = ConexionBD.ObtenerConexion())
            {
                string sql = "SELECT IdHorario, IdMascota, IdDispensador, Hora, " +
                             "CantidadGramos, Activo FROM Horario WHERE IdHorario = @IdHorario";

                SqlCommand comando = new SqlCommand(sql, conexion);
                comando.Parameters.AddWithValue("@IdHorario", idHorario);

                conexion.Open();
                SqlDataReader lector = comando.ExecuteReader();

                if (lector.Read())
                {
                    horario = LeerHorario(lector);
                }

                lector.Close();

                if (horario != null)
                {
                    horario.Dias = ObtenerDiasDeHorario(conexion, horario.IdHorario);
                }
            }

            return horario;
        }

        public void Insertar(Horario horario)
        {
            using (SqlConnection conexion = ConexionBD.ObtenerConexion())
            {
                conexion.Open();
                SqlTransaction transaccion = conexion.BeginTransaction();

                string sql = "INSERT INTO Horario (IdMascota, IdDispensador, Hora, CantidadGramos, Activo) " +
                             "VALUES (@IdMascota, @IdDispensador, @Hora, @CantidadGramos, 1); " +
                             "SELECT CAST(SCOPE_IDENTITY() AS INT)";

                SqlCommand comando = new SqlCommand(sql, conexion, transaccion);
                AgregarParametrosHorario(comando, horario);

                int idHorarioNuevo = (int)comando.ExecuteScalar();

                InsertarDias(conexion, transaccion, idHorarioNuevo, horario.Dias);

                transaccion.Commit();
                horario.IdHorario = idHorarioNuevo;
            }
        }

        public void Actualizar(Horario horario)
        {
            using (SqlConnection conexion = ConexionBD.ObtenerConexion())
            {
                conexion.Open();
                SqlTransaction transaccion = conexion.BeginTransaction();

                string sql = "UPDATE Horario SET IdMascota = @IdMascota, IdDispensador = @IdDispensador, " +
                             "Hora = @Hora, CantidadGramos = @CantidadGramos WHERE IdHorario = @IdHorario";

                SqlCommand comando = new SqlCommand(sql, conexion, transaccion);
                AgregarParametrosHorario(comando, horario);
                comando.Parameters.AddWithValue("@IdHorario", horario.IdHorario);
                comando.ExecuteNonQuery();

                // Reemplazar todos los dias es mas simple que calcular cuales
                // se agregaron o quitaron respecto a la seleccion anterior.
                string sqlBorrarDias = "DELETE FROM HorarioDia WHERE IdHorario = @IdHorario";
                SqlCommand comandoBorrar = new SqlCommand(sqlBorrarDias, conexion, transaccion);
                comandoBorrar.Parameters.AddWithValue("@IdHorario", horario.IdHorario);
                comandoBorrar.ExecuteNonQuery();

                InsertarDias(conexion, transaccion, horario.IdHorario, horario.Dias);

                transaccion.Commit();
            }
        }

        // HorarioDia se borra solo por el ON DELETE CASCADE de la FK.
        public void Eliminar(int idHorario)
        {
            using (SqlConnection conexion = ConexionBD.ObtenerConexion())
            {
                string sql = "UPDATE Horario SET Activo = 0 WHERE IdHorario = @IdHorario";

                SqlCommand comando = new SqlCommand(sql, conexion);
                comando.Parameters.AddWithValue("@IdHorario", idHorario);

                conexion.Open();
                comando.ExecuteNonQuery();
            }
        }

        private void InsertarDias(SqlConnection conexion, SqlTransaction transaccion, int idHorario, List<string> dias)
        {
            string sql = "INSERT INTO HorarioDia (IdHorario, Dia) VALUES (@IdHorario, @Dia)";

            foreach (string dia in dias)
            {
                SqlCommand comando = new SqlCommand(sql, conexion, transaccion);
                comando.Parameters.AddWithValue("@IdHorario", idHorario);
                comando.Parameters.AddWithValue("@Dia", dia);
                comando.ExecuteNonQuery();
            }
        }

        private List<string> ObtenerDiasDeHorario(SqlConnection conexion, int idHorario)
        {
            List<string> dias = new List<string>();

            string sql = "SELECT Dia FROM HorarioDia WHERE IdHorario = @IdHorario ORDER BY " +
                         "CASE Dia WHEN 'L' THEN 1 WHEN 'M' THEN 2 WHEN 'X' THEN 3 " +
                         "WHEN 'J' THEN 4 WHEN 'V' THEN 5 WHEN 'S' THEN 6 WHEN 'D' THEN 7 END";

            SqlCommand comando = new SqlCommand(sql, conexion);
            comando.Parameters.AddWithValue("@IdHorario", idHorario);

            SqlDataReader lector = comando.ExecuteReader();

            while (lector.Read())
            {
                dias.Add((string)lector["Dia"]);
            }

            lector.Close();

            return dias;
        }

        private void AgregarParametrosHorario(SqlCommand comando, Horario horario)
        {
            comando.Parameters.AddWithValue("@IdMascota", horario.IdMascota);
            comando.Parameters.AddWithValue("@IdDispensador", horario.IdDispensador);
            comando.Parameters.AddWithValue("@Hora", horario.Hora);
            comando.Parameters.AddWithValue("@CantidadGramos", horario.CantidadGramos);
        }

        private Horario LeerHorario(SqlDataReader lector)
        {
            Horario horario = new Horario();
            horario.IdHorario = (int)lector["IdHorario"];
            horario.IdMascota = (int)lector["IdMascota"];
            horario.IdDispensador = (int)lector["IdDispensador"];
            horario.Hora = (string)lector["Hora"];
            horario.CantidadGramos = (int)lector["CantidadGramos"];
            horario.Activo = (bool)lector["Activo"];
            return horario;
        }
    }
}
