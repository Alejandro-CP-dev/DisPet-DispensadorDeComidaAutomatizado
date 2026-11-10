import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import {
  useActualizarPerfil,
  useCambiarContrasena,
  useConfirmarCodigoCorreo,
  useSesionStore,
  useSolicitarCodigoCorreo,
} from '../hooks'
import {
  esquemaCambioContrasena,
  esquemaCambioCorreo,
  esquemaCodigoCorreo,
  esquemaConfirmarContrasena,
  esquemaPerfil,
} from '../schemas'
import type {
  ValoresCambioContrasena,
  ValoresCambioCorreo,
  ValoresCodigoCorreo,
  ValoresConfirmarContrasena,
  ValoresPerfil,
} from '../schemas'
import { obtenerMensajeError } from '@/shared/api/errores'
import { Boton } from '@/shared/componentes/Boton'
import { Campo } from '@/shared/componentes/Campo'
import { Modal } from '@/shared/componentes/Modal'
import estilos from './PerfilPage.module.css'

type CambioPendiente = 'perfil' | 'contrasena' | null

export function PerfilPage() {
  const usuario = useSesionStore((estado) => estado.usuario)
  const actualizarPerfil = useActualizarPerfil()
  const cambiarContrasena = useCambiarContrasena()
  const solicitarCodigoCorreo = useSolicitarCodigoCorreo()
  const confirmarCodigoCorreo = useConfirmarCodigoCorreo()
  const [mensajeContrasena, setMensajeContrasena] = useState('')
  const [codigoEnviado, setCodigoEnviado] = useState(false)
  const [mostrarConfirmacionCorreo, setMostrarConfirmacionCorreo] = useState(false)
  const [mostrarCambioContrasena, setMostrarCambioContrasena] = useState(false)
  const [cambioPendiente, setCambioPendiente] = useState<CambioPendiente>(null)
  const iniciales =
    usuario?.nombre
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((parte) => parte[0]?.toLocaleUpperCase() ?? '')
      .join('') ?? ''
  const fechaCreacion = usuario?.fechaCreacion ? new Date(usuario.fechaCreacion) : null
  const fechaMiembro =
    fechaCreacion && !Number.isNaN(fechaCreacion.valueOf())
      ? new Intl.DateTimeFormat('es-CO', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
          timeZone: 'America/Bogota',
        }).format(fechaCreacion)
      : null

  const perfil = useForm<ValoresPerfil>({
    resolver: zodResolver(esquemaPerfil),
    defaultValues: {
      nombre: usuario?.nombre ?? '',
      notificacionBateriaBaja: usuario?.notificacionBateriaBaja ?? false,
      notificacionActualizaciones: usuario?.notificacionActualizaciones ?? false,
    },
  })
  const correo = useForm<ValoresCambioCorreo>({
    resolver: zodResolver(esquemaCambioCorreo),
  })
  const codigo = useForm<ValoresCodigoCorreo>({
    resolver: zodResolver(esquemaCodigoCorreo),
  })
  const confirmacionCorreo = useForm<ValoresConfirmarContrasena>({
    resolver: zodResolver(esquemaConfirmarContrasena),
  })
  const contrasena = useForm<ValoresCambioContrasena>({
    resolver: zodResolver(esquemaCambioContrasena),
  })

  function guardarPerfil(valores: ValoresPerfil) {
    actualizarPerfil.mutate({
      nombre: valores.nombre.trim(),
      notificacionBateriaBaja: valores.notificacionBateriaBaja,
      notificacionActualizaciones: valores.notificacionActualizaciones,
    })
  }

  function confirmarCambio() {
    if (cambioPendiente === 'perfil') guardarPerfil(perfil.getValues())
    if (cambioPendiente === 'contrasena') guardarContrasena(contrasena.getValues())
    setCambioPendiente(null)
  }

  function enviarCodigo(valores: ValoresCambioCorreo) {
    confirmarCodigoCorreo.reset()
    solicitarCodigoCorreo.reset()
    confirmacionCorreo.reset()
    correo.setValue('correo', valores.correo)
    setMostrarConfirmacionCorreo(true)
  }

  function confirmarCambioCorreo(valores: ValoresConfirmarContrasena) {
    solicitarCodigoCorreo.mutate(
      { correo: correo.getValues('correo'), contrasena: valores.contrasena },
      {
        onSuccess: () => {
          setMostrarConfirmacionCorreo(false)
          confirmacionCorreo.reset()
          setCodigoEnviado(true)
          codigo.reset()
        },
      },
    )
  }

  function cerrarConfirmacionCorreo() {
    setMostrarConfirmacionCorreo(false)
    confirmacionCorreo.reset()
  }

  function verificarCodigo(valores: ValoresCodigoCorreo) {
    confirmarCodigoCorreo.mutate(valores.codigo, {
      onSuccess: () => {
        setCodigoEnviado(false)
        correo.reset()
        codigo.reset()
      },
    })
  }

  function guardarContrasena(valores: ValoresCambioContrasena) {
    setMensajeContrasena('')
    cambiarContrasena.mutate(
      { actual: valores.contrasenaActual, nueva: valores.contrasenaNueva },
      {
        onSuccess: () => {
          contrasena.reset()
          setMensajeContrasena('Contraseña actualizada.')
          setMostrarCambioContrasena(false)
        },
      },
    )
  }

  return (
    <div className={estilos.pagina}>
      <header className={estilos.resumenPerfil}>
        <div className={estilos.avatar} aria-hidden="true">
          {iniciales}
        </div>
        <div className={estilos.detallePerfil}>
          <div className={estilos.nombrePerfil}>
            <h1 className={estilos.titulo}>{usuario?.nombre ?? 'Mi perfil'}</h1>
            {usuario && <span className={estilos.estadoActivo}>Cuenta activa</span>}
          </div>
          <p>Administra tus datos personales, seguridad y preferencias de DisPet.</p>
          {usuario?.correo && (
            <div className={estilos.detallesPerfil}>
              <span className={estilos.correoPerfil}>
                <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <rect x="2.5" y="4" width="15" height="12" rx="2" />
                  <path d="m3.5 5 6.5 5 6.5-5" />
                </svg>
                {usuario.correo}
              </span>
              <span className={estilos.correoPerfil}>
                <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path d="M10 2.5v2M10 15.5v2M2.5 10h2m11 0h2M4.7 4.7l1.4 1.4m7.8 7.8 1.4 1.4m0-10.6-1.4 1.4m-7.8 7.8-1.4 1.4" />
                  <circle cx="10" cy="10" r="5.5" />
                </svg>
                {fechaMiembro ? (
                  <time dateTime={usuario.fechaCreacion ?? undefined}>
                    Miembro desde {fechaMiembro}
                  </time>
                ) : (
                  'Fecha de registro no disponible'
                )}
              </span>
            </div>
          )}
        </div>
      </header>

      <section className={estilos.tarjeta}>
        <header className={estilos.encabezadoTarjeta}>
          <span className={estilos.iconoSeccion} aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="3.5" />
              <path d="M5 20v-1a7 7 0 0 1 14 0v1" />
            </svg>
          </span>
          <div>
            <h2>Datos personales</h2>
            <p>Información básica de tu cuenta</p>
          </div>
        </header>
        <div className={estilos.contenidoTarjeta}>
          <Campo
            label="Nombre completo"
            error={perfil.formState.errors.nombre?.message}
            {...perfil.register('nombre')}
          />
        </div>
      </section>

      <section className={estilos.tarjeta}>
        <header className={estilos.encabezadoTarjeta}>
          <span className={estilos.iconoSeccion} aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <rect x="5" y="10" width="14" height="11" rx="2" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" />
            </svg>
          </span>
          <div>
            <h2>Seguridad y credenciales</h2>
            <p>Actualiza tu correo o contraseña de acceso</p>
          </div>
        </header>
        <div className={estilos.contenidoTarjeta}>
          <div className={estilos.correoActual}>
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <rect x="2.5" y="4" width="15" height="12" rx="2" />
              <path d="m3.5 5 6.5 5 6.5-5" />
            </svg>
            <div>
              <span>Correo electrónico actual</span>
              <strong>{usuario?.correo ?? 'No disponible'}</strong>
            </div>
          </div>
          <form
            className={estilos.formularioCorreo}
            onSubmit={(evento) => void correo.handleSubmit(enviarCodigo)(evento)}
            noValidate
          >
            <Campo
              label="Nuevo correo electrónico"
              type="email"
              placeholder="Escribe tu nuevo correo..."
              error={correo.formState.errors.correo?.message}
              {...correo.register('correo')}
            />
            {solicitarCodigoCorreo.isError && !mostrarConfirmacionCorreo && (
              <p role="alert">{obtenerMensajeError(solicitarCodigoCorreo.error)}</p>
            )}
            {solicitarCodigoCorreo.data && !confirmarCodigoCorreo.isSuccess && (
              <p role="status">{solicitarCodigoCorreo.data.mensaje}</p>
            )}
            <Boton type="submit" variante="secundario" cargando={solicitarCodigoCorreo.isPending}>
              Cambiar correo electrónico
            </Boton>
          </form>
          <div className={estilos.cambioContrasena}>
            <Boton
              variante="secundario"
              onClick={() => {
                setMostrarCambioContrasena((mostrar) => !mostrar)
                setMensajeContrasena('')
                cambiarContrasena.reset()
              }}
              aria-expanded={mostrarCambioContrasena}
            >
              {mostrarCambioContrasena ? 'Cancelar cambio de contraseña' : 'Cambiar contraseña'}
            </Boton>
            {mostrarCambioContrasena && (
              <form
                className={estilos.formulario}
                onSubmit={(evento) =>
                  void contrasena.handleSubmit(() => {
                    setMensajeContrasena('')
                    cambiarContrasena.reset()
                    setCambioPendiente('contrasena')
                  })(evento)
                }
                noValidate
              >
                <Campo
                  label="Contraseña actual"
                  type="password"
                  autoComplete="current-password"
                  error={contrasena.formState.errors.contrasenaActual?.message}
                  {...contrasena.register('contrasenaActual')}
                />
                <Campo
                  label="Nueva contraseña"
                  type="password"
                  autoComplete="new-password"
                  error={contrasena.formState.errors.contrasenaNueva?.message}
                  {...contrasena.register('contrasenaNueva')}
                />
                <Campo
                  label="Confirmar nueva contraseña"
                  type="password"
                  autoComplete="new-password"
                  error={contrasena.formState.errors.confirmarContrasena?.message}
                  {...contrasena.register('confirmarContrasena')}
                />
                {cambiarContrasena.isError && (
                  <p role="alert">{obtenerMensajeError(cambiarContrasena.error)}</p>
                )}
                <Boton type="submit" cargando={cambiarContrasena.isPending}>
                  Revisar cambio
                </Boton>
              </form>
            )}
            {mensajeContrasena && <p role="status">{mensajeContrasena}</p>}
          </div>
        </div>
        <Modal
          abierto={mostrarConfirmacionCorreo}
          alCerrar={cerrarConfirmacionCorreo}
          titulo="Confirma tu contraseña"
        >
          <form
            className={estilos.formulario}
            onSubmit={(evento) =>
              void confirmacionCorreo.handleSubmit(confirmarCambioCorreo)(evento)
            }
            noValidate
          >
            <p>Para cambiar tu correo, ingresa tu contraseña actual.</p>
            <Campo
              label="Contraseña actual"
              type="password"
              autoComplete="current-password"
              error={confirmacionCorreo.formState.errors.contrasena?.message}
              {...confirmacionCorreo.register('contrasena')}
            />
            {solicitarCodigoCorreo.isError && (
              <p role="alert">{obtenerMensajeError(solicitarCodigoCorreo.error)}</p>
            )}
            <Boton type="submit" cargando={solicitarCodigoCorreo.isPending}>
              Confirmar y enviar código
            </Boton>
          </form>
        </Modal>
        {codigoEnviado && (
          <form
            className={estilos.formulario}
            onSubmit={(evento) => void codigo.handleSubmit(verificarCodigo)(evento)}
            noValidate
          >
            <Campo
              label="Código recibido"
              inputMode="numeric"
              autoComplete="one-time-code"
              error={codigo.formState.errors.codigo?.message}
              {...codigo.register('codigo')}
            />
            {confirmarCodigoCorreo.isError && (
              <p role="alert">{obtenerMensajeError(confirmarCodigoCorreo.error)}</p>
            )}
            <Boton type="submit" cargando={confirmarCodigoCorreo.isPending}>
              Confirmar correo
            </Boton>
          </form>
        )}
        {confirmarCodigoCorreo.isSuccess && <p role="status">Correo actualizado correctamente.</p>}
      </section>

      <section className={estilos.tarjeta}>
        <header className={estilos.encabezadoTarjeta}>
          <span className={estilos.iconoSeccion} aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4" />
            </svg>
          </span>
          <div>
            <h2>Notificaciones</h2>
            <p>Configura las preferencias de tu cuenta</p>
          </div>
        </header>
        <div className={estilos.preferencias}>
          <label className={estilos.preferencia}>
            <span>
              <strong>Nivel bajo de batería</strong>
              <small>Mostrar aviso cuando el nivel de batería sea bajo</small>
            </span>
            <input type="checkbox" role="switch" {...perfil.register('notificacionBateriaBaja')} />
          </label>
          <label className={estilos.preferencia}>
            <span>
              <strong>Actualizaciones y estado</strong>
              <small>Preferencia para avisos sobre actualizaciones de DisPet</small>
            </span>
            <input
              type="checkbox"
              role="switch"
              {...perfil.register('notificacionActualizaciones')}
            />
          </label>
        </div>
        <div className={estilos.acciones}>
          {actualizarPerfil.isError && (
            <p role="alert">{obtenerMensajeError(actualizarPerfil.error)}</p>
          )}
          {actualizarPerfil.isSuccess && <p role="status">Perfil actualizado.</p>}
          <Boton
            cargando={actualizarPerfil.isPending}
            onClick={() => {
              void perfil.handleSubmit(() => {
                setCambioPendiente('perfil')
              })()
            }}
          >
            Revisar y guardar cambios
          </Boton>
        </div>
      </section>
      <Modal
        abierto={cambioPendiente !== null}
        alCerrar={() => {
          setCambioPendiente(null)
        }}
        titulo={
          cambioPendiente === 'contrasena'
            ? 'Confirmar cambio de contraseña'
            : 'Confirmar cambios del perfil'
        }
        pie={
          <>
            <Boton
              variante="secundario"
              onClick={() => {
                setCambioPendiente(null)
              }}
            >
              Cancelar
            </Boton>
            <Boton
              onClick={confirmarCambio}
              cargando={actualizarPerfil.isPending || cambiarContrasena.isPending}
            >
              Confirmar
            </Boton>
          </>
        }
      >
        <p>
          {cambioPendiente === 'contrasena'
            ? '¿Confirmas que quieres cambiar tu contraseña?'
            : '¿Confirmas que quieres guardar los cambios de tu perfil?'}
        </p>
      </Modal>
    </div>
  )
}
