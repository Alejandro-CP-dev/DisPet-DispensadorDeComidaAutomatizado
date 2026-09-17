using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using DisPet.Modelo;

namespace DisPet.Datos
{
    public class DispensacionDatos
    {
        public List<Dispensacion> Listar(int idUsuario)
        {
            List<Dispensacion> dispensaciones = new List<Dispensacion>();

            using (SqlConnection conexion = ConexionBD.ObtenerConexion())
            {
                string sql = "SELECT DI.IdDispensacion, DI.IdMascota, DI.IdHorario, DI.FechaHora, " +
                             "DI.CantidadGramos, DI.Tipo, DI.Estado, M.Nombre AS NombreMascota " +
                             "FROM Dispensacion DI " +
                             "INNER JOIN Mascota M ON M.IdMascota = DI.IdMascota " +
                             "WHERE M.IdUsuario = @IdUsuario " +
                             "ORDER BY DI.FechaHora DESC";

                SqlCommand comando = new SqlCommand(sql, conexion);
                comando.Parameters.AddWithValue("@IdUsuario", idUsuario);

                conexion.Open();
                SqlDataReader lector = comando.ExecuteReader();

                while (lector.Read())
                {
                    Dispensacion dispensacion = new Dispensacion();
                    dispensacion.IdDispensacion = (int)lector["IdDispensacion"];
                    dispensacion.IdMascota = (int)lector["IdMascota"];

                    if (lector["IdHorario"] == DBNull.Value)
                    {
                        dispensacion.IdHorario = null;
                    }
                    else
                    {
                        dispensacion.IdHorario = (int)lector["IdHorario"];
                    }

                    dispensacion.FechaHora = (DateTime)lector["FechaHora"];
                    dispensacion.CantidadGramos = (int)lector["CantidadGramos"];
                    dispensacion.Tipo = (string)lector["Tipo"];
                    dispensacion.Estado = (string)lector["Estado"];
                    dispensacion.NombreMascota = (string)lector["NombreMascota"];

                    dispensaciones.Add(dispensacion);
                }
            }

            return dispensaciones;
        }

        public void Insertar(Dispensacion dispensacion)
        {
            using (SqlConnection conexion = ConexionBD.ObtenerConexion())
            {
                string sql = "INSERT INTO Dispensacion (IdMascota, IdHorario, FechaHora, CantidadGramos, Tipo, Estado) " +
                             "VALUES (@IdMascota, @IdHorario, @FechaHora, @CantidadGramos, @Tipo, @Estado)";

                SqlCommand comando = new SqlCommand(sql, conexion);
                comando.Parameters.AddWithValue("@IdMascota", dispensacion.IdMascota);

                if (dispensacion.IdHorario.HasValue)
                {
                    comando.Parameters.AddWithValue("@IdHorario", dispensacion.IdHorario.Value);
                }
                else
                {
                    comando.Parameters.AddWithValue("@IdHorario", DBNull.Value);
                }

                comando.Parameters.AddWithValue("@FechaHora", dispensacion.FechaHora);
                comando.Parameters.AddWithValue("@CantidadGramos", dispensacion.CantidadGramos);
                comando.Parameters.AddWithValue("@Tipo", dispensacion.Tipo);
                comando.Parameters.AddWithValue("@Estado", dispensacion.Estado);

                conexion.Open();
                comando.ExecuteNonQuery();
            }
        }
    }
}
