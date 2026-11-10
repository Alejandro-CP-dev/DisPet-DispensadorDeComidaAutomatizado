import { useState } from 'react'

import { useDispositivos } from '@/features/dispositivos/hooks'
import { useMascotas } from '@/features/mascotas/hooks'
import { obtenerMensajeError } from '@/shared/api/errores'
import { Boton } from '@/shared/componentes/Boton'
import { AnimatedCard } from '@/shared/componentes/AnimatedCard'
import { EstadoVacio } from '@/shared/componentes/EstadoVacio'
import { Modal } from '@/shared/componentes/Modal'
import { Spinner } from '@/shared/componentes/Spinner'
import { Tabla } from '@/shared/componentes/Tabla'
import { useToasts } from '@/shared/componentes/Toast'
import type { ColumnaTabla } from '@/shared/componentes/Tabla'
import { DIAS_SEMANA } from '@/shared/constantes/dias'
import { formatearGramos } from '@/shared/utils/gramos'
import type { Horario } from '@/tipos'

import { FormularioHorario } from '../componentes/FormularioHorario'
import { useActualizarHorario, useCrearHorario, useEliminarHorario, useHorarios } from '../hooks'
import type { ValoresHorario } from '../schemas'
import type { DatosHorario } from '../types'
import estilos from './HorariosPage.module.css'

const ID_FORMULARIO = 'formulario-horario'

type EstadoModal = { modo: 'crear' } | { modo: 'editar'; horario: Horario } | null

function obtenerProximaComida(horarios: Horario[], ahora: Date) {
  const horaActual = `${String(ahora.getHours()).padStart(2, '0')}:${String(ahora.getMinutes()).padStart(2, '0')}`

  for (let diasHasta = 0; diasHasta < 7; diasHasta += 1) {
    const fecha = new Date(ahora)
    fecha.setDate(ahora.getDate() + diasHasta)
    const dia = DIAS_SEMANA[(fecha.getDay() + 6) % 7]?.valor
    const candidatos = horarios
      .filter(
        (horario) =>
          horario.activo &&
          dia !== undefined &&
          horario.dias.includes(dia) &&
          (diasHasta > 0 || horario.hora >= horaActual),
      )
      .sort((a, b) => a.hora.localeCompare(b.hora))
    const horario = candidatos[0]
    if (horario) return { horario, diasHasta }
  }

  return null
}

function etiquetaDiaProximo(diasHasta: number): string {
  if (diasHasta === 0) return 'hoy'
  if (diasHasta === 1) return 'mañana'

  const fecha = new Date()
  fecha.setDate(fecha.getDate() + diasHasta)
  return `el ${fecha.toLocaleDateString('es-CO', { weekday: 'long' })}`
}

function formatearDias(dias: Horario['dias']): string {
  return DIAS_SEMANA.filter((dia) => dias.includes(dia.valor))
    .map((dia) => dia.etiqueta.slice(0, 3))
    .join(', ')
}

export function HorariosPage() {
  const { data: horarios, isLoading, isError, error } = useHorarios()
  const { data: dispositivos } = useDispositivos()
  const { data: mascotas } = useMascotas()
  const crear = useCrearHorario()
  const actualizar = useActualizarHorario()
  const eliminar = useEliminarHorario()
  const mostrarToast = useToasts((estado) => estado.mostrar)

  const [modal, setModal] = useState<EstadoModal>(null)
  const [aEliminar, setAEliminar] = useState<Horario | null>(null)

  const guardando = crear.isPending || actualizar.isPending
  const horariosCargados = horarios ?? []
  const horariosActivos = horariosCargados.filter((horario) => horario.activo)
  const proximaComida = obtenerProximaComida(horariosActivos, new Date())
  const resumenProximaComida = proximaComida
    ? ` · Próxima comida ${etiquetaDiaProximo(proximaComida.diasHasta)}`
    : ''

  function alGuardar(valores: ValoresHorario) {
    const dispositivo = dispositivos?.find((item) => item.id === valores.dispositivoId)
    if (!dispositivo) {
      mostrarToast('Selecciona un dispositivo válido.', 'error')
      return
    }

    const datos: DatosHorario = { ...valores, mascotaId: dispositivo.mascotaId }

    if (modal?.modo === 'editar') {
      actualizar.mutate(
        { id: modal.horario.id, datos },
        {
          onSuccess: () => {
            mostrarToast('Horario actualizado.', 'exito')
            setModal(null)
          },
          onError: (err) => {
            mostrarToast(obtenerMensajeError(err), 'error')
          },
        },
      )
      return
    }

    crear.mutate(datos, {
      onSuccess: () => {
        mostrarToast('Horario agregado.', 'exito')
        setModal(null)
      },
      onError: (err) => {
        mostrarToast(obtenerMensajeError(err), 'error')
      },
    })
  }

  function confirmarEliminar() {
    if (!aEliminar) return
    eliminar.mutate(aEliminar.id, {
      onSuccess: () => {
        mostrarToast('Horario eliminado.', 'exito')
        setAEliminar(null)
      },
      onError: (err) => {
        mostrarToast(obtenerMensajeError(err), 'error')
      },
    })
  }

  function cambiarEstado(horario: Horario) {
    actualizar.mutate(
      {
        id: horario.id,
        datos: {
          dispositivoId: horario.dispositivoId,
          mascotaId: horario.mascotaId,
          hora: horario.hora,
          gramos: horario.gramos,
          dias: horario.dias,
          activo: !horario.activo,
        },
      },
      {
        onSuccess: () => {
          mostrarToast(horario.activo ? 'Horario desactivado.' : 'Horario activado.', 'exito')
        },
        onError: (err) => {
          mostrarToast(obtenerMensajeError(err), 'error')
        },
      },
    )
  }

  const columnas: ColumnaTabla<Horario>[] = [
    {
      clave: 'dispositivoId',
      encabezado: 'Dispositivo',
      render: (horario) => {
        const dispositivo = dispositivos?.find((item) => item.id === horario.dispositivoId)
        const mascota = mascotas?.find((item) => item.id === horario.mascotaId)
        return (
          <div className={estilos.dispositivo}>
            <span className={estilos.iconoDispositivo} aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 10h16l-1.6 8H5.6L4 10Zm3-3h10m-9 3 1 4m6-4-1 4"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className={estilos.detalleDispositivo}>
              <strong>{dispositivo?.nombre ?? 'Dispositivo'}</strong>
              <span>
                {mascota
                  ? `${mascota.nombre} · ${mascota.especie === 'perro' ? 'Perro' : 'Gato'}`
                  : 'Sin mascota asignada'}
              </span>
            </span>
          </div>
        )
      },
    },
    {
      clave: 'hora',
      encabezado: 'Hora',
      render: (horario) => <strong className={estilos.hora}>{horario.hora}</strong>,
    },
    {
      clave: 'gramos',
      encabezado: 'Gramos',
      render: (horario) => (
        <span className={estilos.gramos}>{formatearGramos(horario.gramos)}</span>
      ),
    },
    {
      clave: 'dias',
      encabezado: 'Días',
      render: (horario) => (
        <div className={estilos.dias} aria-label={`Días: ${formatearDias(horario.dias)}`}>
          {DIAS_SEMANA.map((dia) => (
            <span
              key={dia.valor}
              className={horario.dias.includes(dia.valor) ? estilos.diaActivo : estilos.diaInactivo}
              title={dia.etiqueta}
              aria-hidden="true"
            >
              {dia.valor === 'miercoles' ? 'X' : dia.etiqueta.charAt(0)}
            </span>
          ))}
        </div>
      ),
    },
    {
      clave: 'activo',
      encabezado: 'Estado',
      render: (horario) => {
        const dispositivo = dispositivos?.find((item) => item.id === horario.dispositivoId)
        const actualizando = actualizar.isPending && actualizar.variables.id === horario.id
        return (
          <div className={estilos.estado}>
            <button
              type="button"
              role="switch"
              className={estilos.interruptor}
              aria-checked={horario.activo}
              aria-label={`${horario.activo ? 'Desactivar' : 'Activar'} horario de ${dispositivo?.nombre ?? 'dispositivo'} a las ${horario.hora}`}
              disabled={actualizando}
              onClick={() => {
                cambiarEstado(horario)
              }}
            >
              <span className={estilos.interruptorControl} />
            </button>
            <span className={horario.activo ? estilos.estadoActivo : estilos.estadoInactivo}>
              {horario.activo ? 'Activo' : 'Inactivo'}
            </span>
          </div>
        )
      },
    },
    {
      clave: 'id',
      encabezado: 'Acciones',
      render: (horario) => (
        <div className={estilos.acciones}>
          <Boton
            variante="secundario"
            tamano="chico"
            className={estilos.botonEditar}
            onClick={() => {
              setModal({ modo: 'editar', horario })
            }}
          >
            Editar
          </Boton>
          <Boton
            variante="peligro"
            tamano="chico"
            className={estilos.botonEliminar}
            aria-label={`Eliminar horario de ${dispositivos?.find((item) => item.id === horario.dispositivoId)?.nombre ?? 'dispositivo'}`}
            onClick={() => {
              setAEliminar(horario)
            }}
          >
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path
                d="M4.5 6h11M8 6V4h4v2m2 0-.6 10H6.6L6 6m3 3v4m2-4v4"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Boton>
        </div>
      ),
    },
  ]

  return (
    <div className={estilos.pagina}>
      <div className={estilos.encabezado}>
        <div>
          <h1 className={estilos.titulo}>Horarios</h1>
          {!isLoading && !isError && (
            <p className={estilos.resumen}>
              {horariosActivos.length}{' '}
              {horariosActivos.length === 1 ? 'horario activo' : 'horarios activos'}
              {resumenProximaComida}
            </p>
          )}
        </div>
        <Boton
          onClick={() => {
            setModal({ modo: 'crear' })
          }}
        >
          Agregar horario
        </Boton>
      </div>

      {!isLoading && !isError && (
        <AnimatedCard>
          <section className={estilos.proximaComida} aria-label="Próxima comida programada">
            <img className={estilos.reloj} src="/img/reloj-mascota.png" alt="Reloj despertador" />
            {proximaComida ? (
              <div className={estilos.detalleProxima}>
                <span>Próxima comida</span>
                <strong>
                  {proximaComida.horario.hora} ·{' '}
                  {dispositivos?.find((item) => item.id === proximaComida.horario.dispositivoId)
                    ?.nombre ?? 'Dispensador'}{' '}
                  · {formatearGramos(proximaComida.horario.gramos)}
                </strong>
              </div>
            ) : (
              <div className={estilos.detalleProxima}>
                <span>Sin próximas comidas</span>
                <strong>Agrega o activa un horario para programar la siguiente.</strong>
              </div>
            )}
          </section>
        </AnimatedCard>
      )}

      {isLoading && (
        <div className={estilos.centro}>
          <Spinner etiqueta="Cargando horarios" />
        </div>
      )}

      {isError && (
        <EstadoVacio
          tono="error"
          titulo="No se pudieron cargar los horarios"
          descripcion={obtenerMensajeError(error)}
        />
      )}

      {!isLoading && !isError && horarios && (
        <AnimatedCard>
          <div className={estilos.tablaHorarios}>
            <Tabla
              columnas={columnas}
              filas={horarios}
              obtenerClave={(horario) => horario.id}
              vacio={
                <EstadoVacio
                  titulo="Todavía no hay horarios"
                  descripcion="Agrega un horario para que el dispensador reparta comida automáticamente."
                />
              }
            />
          </div>
        </AnimatedCard>
      )}

      <Modal
        abierto={modal !== null}
        alCerrar={() => {
          setModal(null)
        }}
        titulo={modal?.modo === 'editar' ? 'Editar horario' : 'Agregar horario'}
        pie={
          <>
            <Boton
              variante="secundario"
              onClick={() => {
                setModal(null)
              }}
            >
              Cancelar
            </Boton>
            <Boton type="submit" form={ID_FORMULARIO} cargando={guardando}>
              Guardar
            </Boton>
          </>
        }
      >
        {modal && (
          <FormularioHorario
            idFormulario={ID_FORMULARIO}
            dispositivos={dispositivos ?? []}
            valoresIniciales={modal.modo === 'editar' ? modal.horario : undefined}
            alEnviar={alGuardar}
          />
        )}
      </Modal>

      <Modal
        abierto={aEliminar !== null}
        alCerrar={() => {
          setAEliminar(null)
        }}
        titulo="Eliminar horario"
        pie={
          <>
            <Boton
              variante="secundario"
              onClick={() => {
                setAEliminar(null)
              }}
            >
              Cancelar
            </Boton>
            <Boton variante="peligro" onClick={confirmarEliminar} cargando={eliminar.isPending}>
              Eliminar
            </Boton>
          </>
        }
      >
        <p>¿Seguro que quieres eliminar este horario? Esta acción no se puede deshacer.</p>
      </Modal>
    </div>
  )
}
