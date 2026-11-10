import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'

import { obtenerMensajeError } from '@/shared/api/errores'
import { Boton } from '@/shared/componentes/Boton'
import { Campo } from '@/shared/componentes/Campo'
import { PaginaAuth } from '../componentes/PaginaAuth/PaginaAuth'
import { useRestablecerContrasena, useSolicitarRecuperacion } from '../hooks'
import { esquemaRecuperacion, esquemaRestablecerContrasena } from '../schemas'
import type { ValoresRecuperacion, ValoresRestablecerContrasena } from '../schemas'
import estilos from './RecuperarContrasenaPage.module.css'

export function RecuperarContrasenaPage() {
  const [parametros] = useSearchParams()
  const token = parametros.get('token')
  const recuperacion = useSolicitarRecuperacion()
  const restablecimiento = useRestablecerContrasena()
  const solicitud = useForm<ValoresRecuperacion>({ resolver: zodResolver(esquemaRecuperacion) })
  const cambio = useForm<ValoresRestablecerContrasena>({
    resolver: zodResolver(esquemaRestablecerContrasena),
  })

  if (token) {
    return (
      <PaginaAuth titulo="Nueva contraseña" subtitulo="Elige una contraseña segura para tu cuenta.">
        {restablecimiento.isSuccess ? (
          <div className={estilos.formulario}>
            <p role="status">Tu contraseña se cambió correctamente.</p>
            <p className={estilos.pie}>
              <Link to="/login">Iniciar sesión</Link>
            </p>
          </div>
        ) : (
          <form
            className={estilos.formulario}
            onSubmit={(evento) =>
              void cambio.handleSubmit(({ contrasenaNueva }) => {
                restablecimiento.mutate({ token, contrasenaNueva })
              })(evento)
            }
            noValidate
          >
            <Campo
              label="Nueva contraseña"
              type="password"
              error={cambio.formState.errors.contrasenaNueva?.message}
              {...cambio.register('contrasenaNueva')}
            />
            <Campo
              label="Confirmar nueva contraseña"
              type="password"
              error={cambio.formState.errors.confirmarContrasena?.message}
              {...cambio.register('confirmarContrasena')}
            />
            {restablecimiento.isError && (
              <p role="alert">{obtenerMensajeError(restablecimiento.error)}</p>
            )}
            <Boton type="submit" cargando={restablecimiento.isPending}>
              Cambiar contraseña
            </Boton>
            <p className={estilos.pie}>
              <Link to="/login">Volver a iniciar sesión</Link>
            </p>
          </form>
        )}
      </PaginaAuth>
    )
  }

  return (
    <PaginaAuth titulo="Recuperar contraseña" subtitulo="Ingresa el correo asociado a tu cuenta.">
      <form
        className={estilos.formulario}
        onSubmit={(evento) =>
          void solicitud.handleSubmit(({ correo }) => {
            recuperacion.mutate(correo)
          })(evento)
        }
        noValidate
      >
        <Campo
          label="Correo"
          type="email"
          error={solicitud.formState.errors.correo?.message}
          {...solicitud.register('correo')}
        />
        {recuperacion.data && (
          <p role="status" className={estilos.estado}>
            {recuperacion.data.mensaje}
          </p>
        )}
        {recuperacion.isError && <p role="alert">{obtenerMensajeError(recuperacion.error)}</p>}
        <Boton type="submit" cargando={recuperacion.isPending}>
          Solicitar recuperación
        </Boton>
        {!recuperacion.data && (
          <p className={estilos.ayuda}>
            Por seguridad, no confirmamos si el correo está registrado.
          </p>
        )}
        <p className={estilos.pie}>
          <Link to="/login">Volver a iniciar sesión</Link>
        </p>
      </form>
    </PaginaAuth>
  )
}
