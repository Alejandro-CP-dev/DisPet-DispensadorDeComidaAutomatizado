import { useState } from 'react'

import { useDispositivos } from '@/features/dispositivos/hooks'
import { obtenerMensajeError } from '@/shared/api/errores'
import { Boton } from '@/shared/componentes/Boton'
import { EstadoVacio } from '@/shared/componentes/EstadoVacio'
import { Insignia } from '@/shared/componentes/Insignia'
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

function formatearDias(dias: Horario['dias']): string {
  return DIAS_SEMANA.filter((dia) => dias.includes(dia.valor))
    .map((dia) => dia.etiqueta.slice(0, 3))
    .join(', ')
}

export function HorariosPage() {
  const { data: horarios, isLoading, isError, error } = useHorarios()
  const { data: dispositivos } = useDispositivos()
  const crear = useCrearHorario()
  const actualizar = useActualizarHorario()
  const eliminar = useEliminarHorario()
  const mostrarToast = useToasts((estado) => estado.mostrar)

  const [modal, setModal] = useState<EstadoModal>(null)
  const [aEliminar, setAEliminar] = useState<Horario | null>(null)

  const guardando = crear.isPending || actualizar.isPending

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

  const columnas: ColumnaTabla<Horario>[] = [
    {
      clave: 'dispositivoId',
      encabezado: 'Dispositivo',
      render: (horario) => dispositivos?.find((d) => d.id === horario.dispositivoId)?.nombre ?? '—',
    },
    { clave: 'hora', encabezado: 'Hora' },
    {
      clave: 'gramos',
      encabezado: 'Gramos',
      alinear: 'derecha',
      render: (horario) => formatearGramos(horario.gramos),
    },
    { clave: 'dias', encabezado: 'Días', render: (horario) => formatearDias(horario.dias) },
    {
      clave: 'activo',
      encabezado: 'Estado',
      render: (horario) => (
        <Insignia tono={horario.activo ? 'exito' : 'neutral'}>
          {horario.activo ? 'Activo' : 'Inactivo'}
        </Insignia>
      ),
    },
    {
      clave: 'id',
      encabezado: 'Acciones',
      render: (horario) => (
        <div className={estilos.acciones}>
          <Boton
            variante="secundario"
            tamano="chico"
            onClick={() => {
              setModal({ modo: 'editar', horario })
            }}
          >
            Editar
          </Boton>
          <Boton
            variante="peligro"
            tamano="chico"
            onClick={() => {
              setAEliminar(horario)
            }}
          >
            Eliminar
          </Boton>
        </div>
      ),
    },
  ]

  return (
    <div className={estilos.pagina}>
      <div className={estilos.encabezado}>
        <h1 className={estilos.titulo}>Horarios</h1>
        <Boton
          onClick={() => {
            setModal({ modo: 'crear' })
          }}
        >
          Agregar horario
        </Boton>
      </div>

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
