using System;
using System.Collections.Generic;
using DisPet.Datos;
using DisPet.Modelo;

namespace DisPet.Logica
{
    public class HorarioLogica
    {
        private static readonly string[] DiasValidos = { "L", "M", "X", "J", "V", "S", "D" };

        private HorarioDatos horarioDatos = new HorarioDatos();

        public List<Horario> Listar(int idUsuario)
        {
            return horarioDatos.Listar(idUsuario);
        }

        public Horario ObtenerPorId(int idHorario)
        {
            return horarioDatos.ObtenerPorId(idHorario);
        }

        public void Guardar(Horario horario)
        {
            Validar(horario);

            if (horario.IdHorario == 0)
            {
                horarioDatos.Insertar(horario);
            }
            else
            {
                horarioDatos.Actualizar(horario);
            }
        }

        public void Eliminar(int idHorario)
        {
            horarioDatos.Eliminar(idHorario);
        }

        private void Validar(Horario horario)
        {
            if (string.IsNullOrWhiteSpace(horario.Hora))
            {
                throw new Exception("Debe indicar la hora del horario.");
            }

            if (horario.CantidadGramos <= 0)
            {
                throw new Exception("La cantidad de gramos debe ser mayor a cero.");
            }

            if (horario.Dias == null || horario.Dias.Count == 0)
            {
                throw new Exception("Debe seleccionar al menos un dia de la semana.");
            }

            List<string> diasVistos = new List<string>();

            foreach (string dia in horario.Dias)
            {
                if (Array.IndexOf(DiasValidos, dia) == -1)
                {
                    throw new Exception("El dia '" + dia + "' no es valido.");
                }

                if (diasVistos.Contains(dia))
                {
                    throw new Exception("El dia '" + dia + "' esta repetido en el horario.");
                }

                diasVistos.Add(dia);
            }
        }
    }
}
