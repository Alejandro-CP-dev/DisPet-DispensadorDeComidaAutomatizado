using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using DisPet.Modelo;

namespace DisPet.Datos
{
    public class MascotaDatos
    {
        public List<Mascota> Listar(int idUsuario)
        {
            List<Mascota> mascotas = new List<Mascota>();

            using (SqlConnection conexion = ConexionBD.ObtenerConexion())
            {
                string sql = "SELECT IdMascota, IdUsuario, Nombre, Especie, Raza, PesoKg, Activo " +
                             "FROM Mascota WHERE IdUsuario = @IdUsuario AND Activo = 1 " +
                             "ORDER BY Nombre";

                SqlCommand comando = new SqlCommand(sql, conexion);
                comando.Parameters.AddWithValue("@IdUsuario", idUsuario);

                conexion.Open();
                SqlDataReader lector = comando.ExecuteReader();

                while (lector.Read())
                {
                    mascotas.Add(LeerMascota(lector));
                }
            }

            return mascotas;
        }

        public Mascota ObtenerPorId(int idMascota)
        {
            Mascota mascota = null;

            using (SqlConnection conexion = ConexionBD.ObtenerConexion())
            {
                string sql = "SELECT IdMascota, IdUsuario, Nombre, Especie, Raza, PesoKg, Activo " +
                             "FROM Mascota WHERE IdMascota = @IdMascota";

                SqlCommand comando = new SqlCommand(sql, conexion);
                comando.Parameters.AddWithValue("@IdMascota", idMascota);

                conexion.Open();
                SqlDataReader lector = comando.ExecuteReader();

                if (lector.Read())
                {
                    mascota = LeerMascota(lector);
                }
            }

            return mascota;
        }

        public void Insertar(Mascota mascota)
        {
            using (SqlConnection conexion = ConexionBD.ObtenerConexion())
            {
                string sql = "INSERT INTO Mascota (IdUsuario, Nombre, Especie, Raza, PesoKg, Activo) " +
                             "VALUES (@IdUsuario, @Nombre, @Especie, @Raza, @PesoKg, 1)";

                SqlCommand comando = new SqlCommand(sql, conexion);
                AgregarParametrosMascota(comando, mascota);

                conexion.Open();
                comando.ExecuteNonQuery();
            }
        }

        public void Actualizar(Mascota mascota)
        {
            using (SqlConnection conexion = ConexionBD.ObtenerConexion())
            {
                string sql = "UPDATE Mascota SET Nombre = @Nombre, Especie = @Especie, " +
                             "Raza = @Raza, PesoKg = @PesoKg WHERE IdMascota = @IdMascota";

                SqlCommand comando = new SqlCommand(sql, conexion);
                AgregarParametrosMascota(comando, mascota);
                comando.Parameters.AddWithValue("@IdMascota", mascota.IdMascota);

                conexion.Open();
                comando.ExecuteNonQuery();
            }
        }

        // Se marca como inactiva en vez de borrar la fila, para no perder el
        // historial de Dispensacion ni los Horario que la referencian.
        public void Eliminar(int idMascota)
        {
            using (SqlConnection conexion = ConexionBD.ObtenerConexion())
            {
                string sql = "UPDATE Mascota SET Activo = 0 WHERE IdMascota = @IdMascota";

                SqlCommand comando = new SqlCommand(sql, conexion);
                comando.Parameters.AddWithValue("@IdMascota", idMascota);

                conexion.Open();
                comando.ExecuteNonQuery();
            }
        }

        private void AgregarParametrosMascota(SqlCommand comando, Mascota mascota)
        {
            comando.Parameters.AddWithValue("@IdUsuario", mascota.IdUsuario);
            comando.Parameters.AddWithValue("@Nombre", mascota.Nombre);
            comando.Parameters.AddWithValue("@Especie", mascota.Especie);

            if (string.IsNullOrEmpty(mascota.Raza))
            {
                comando.Parameters.AddWithValue("@Raza", DBNull.Value);
            }
            else
            {
                comando.Parameters.AddWithValue("@Raza", mascota.Raza);
            }

            comando.Parameters.AddWithValue("@PesoKg", mascota.PesoKg);
        }

        private Mascota LeerMascota(SqlDataReader lector)
        {
            Mascota mascota = new Mascota();
            mascota.IdMascota = (int)lector["IdMascota"];
            mascota.IdUsuario = (int)lector["IdUsuario"];
            mascota.Nombre = (string)lector["Nombre"];
            mascota.Especie = (string)lector["Especie"];

            if (lector["Raza"] == DBNull.Value)
            {
                mascota.Raza = "";
            }
            else
            {
                mascota.Raza = (string)lector["Raza"];
            }

            mascota.PesoKg = (decimal)lector["PesoKg"];
            mascota.Activo = (bool)lector["Activo"];
            return mascota;
        }
    }
}
