using System;
using System.Collections.Generic;
using DisPet.Datos;
using DisPet.Modelo;

namespace DisPet.Logica
{
    public class MascotaLogica
    {
        private MascotaDatos mascotaDatos = new MascotaDatos();

        public List<Mascota> Listar(int idUsuario)
        {
            return mascotaDatos.Listar(idUsuario);
        }

        public Mascota ObtenerPorId(int idMascota)
        {
            return mascotaDatos.ObtenerPorId(idMascota);
        }

        public void Guardar(Mascota mascota)
        {
            Validar(mascota);

            if (mascota.IdMascota == 0)
            {
                mascotaDatos.Insertar(mascota);
            }
            else
            {
                mascotaDatos.Actualizar(mascota);
            }
        }

        public void Eliminar(int idMascota)
        {
            mascotaDatos.Eliminar(idMascota);
        }

        private void Validar(Mascota mascota)
        {
            if (string.IsNullOrWhiteSpace(mascota.Nombre))
            {
                throw new Exception("El nombre de la mascota es obligatorio.");
            }

            if (mascota.Especie != "Perro" && mascota.Especie != "Gato")
            {
                throw new Exception("La especie debe ser Perro o Gato.");
            }

            if (mascota.PesoKg <= 0)
            {
                throw new Exception("El peso debe ser mayor a cero.");
            }
        }
    }
}
