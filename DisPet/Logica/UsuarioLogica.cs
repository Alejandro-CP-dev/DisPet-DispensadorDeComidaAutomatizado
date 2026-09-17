using System;
using DisPet.Datos;
using DisPet.Modelo;

namespace DisPet.Logica
{
    public class UsuarioLogica
    {
        private UsuarioDatos usuarioDatos = new UsuarioDatos();

        public Usuario IniciarSesion(string correo, string clave)
        {
            if (string.IsNullOrWhiteSpace(correo))
            {
                throw new Exception("Debe ingresar el correo.");
            }

            if (string.IsNullOrWhiteSpace(clave))
            {
                throw new Exception("Debe ingresar la clave.");
            }

            Usuario usuario = usuarioDatos.ObtenerPorCorreoYClave(correo, clave);

            if (usuario == null)
            {
                throw new Exception("Correo o clave incorrectos.");
            }

            if (!usuario.Activo)
            {
                throw new Exception("El usuario esta inactivo.");
            }

            return usuario;
        }
    }
}
