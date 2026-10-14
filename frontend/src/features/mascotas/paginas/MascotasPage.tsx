import { useState } from 'react'

import { obtenerMensajeError } from '@/shared/api/errores'
import { Boton } from '@/shared/componentes/Boton'
import { EstadoVacio } from '@/shared/componentes/EstadoVacio'
import { Modal } from '@/shared/componentes/Modal'
import { Spinner } from '@/shared/componentes/Spinner'
import { useToasts } from '@/shared/componentes/Toast'
import type { Mascota } from '@/tipos'

import { FormularioMascota } from '../componentes/FormularioMascota'
import { useActualizarMascota, useCrearMascota, useEliminarMascota, useMascotas } from '../hooks'
import type { ValoresMascota } from '../schemas'
import estilos from './MascotasPage.module.css'

const ID_FORMULARIO = 'formulario-mascota'

type EstadoModal = { modo: 'crear' } | { modo: 'editar'; mascota: Mascota } | null

export function MascotasPage() {
  const { data: mascotas, isLoading, isError, error } = useMascotas()
  const crear = useCrearMascota()
  const actualizar = useActualizarMascota()
  const eliminar = useEliminarMascota()
  const mostrarToast = useToasts((estado) => estado.mostrar)

  const [modal, setModal] = useState<EstadoModal>(null)
  const [aEliminar, setAEliminar] = useState<Mascota | null>(null)

  const guardando = crear.isPending || actualizar.isPending

  function alGuardar(valores: ValoresMascota) {
    if (modal?.modo === 'editar') {
      actualizar.mutate(
        { id: modal.mascota.id, datos: valores },
        {
          onSuccess: () => {
            mostrarToast('Mascota actualizada.', 'exito')
            setModal(null)
          },
          onError: (err) => {
            mostrarToast(obtenerMensajeError(err), 'error')
          },
        },
      )
      return
    }

    crear.mutate(valores, {
      onSuccess: () => {
        mostrarToast('Mascota agregada.', 'exito')
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
        mostrarToast('Mascota eliminada.', 'exito')
        setAEliminar(null)
      },
      onError: (err) => {
        mostrarToast(obtenerMensajeError(err), 'error')
      },
    })
  }

  return (
    <div className={estilos.pagina}>
      <div className={estilos.encabezado}>
        <h1 className={estilos.titulo}>Mascotas</h1>
        <Boton
          onClick={() => {
            setModal({ modo: 'crear' })
          }}
        >
          Agregar mascota
        </Boton>
      </div>

      {isLoading && (
        <div className={estilos.centro}>
          <Spinner etiqueta="Cargando mascotas" />
        </div>
      )}

      {isError && (
        <EstadoVacio
          tono="error"
          titulo="No se pudieron cargar las mascotas"
          descripcion={obtenerMensajeError(error)}
        />
      )}

      {!isLoading && !isError && mascotas?.length === 0 && (
        <EstadoVacio
          titulo="Todavía no hay mascotas"
          descripcion="Agrega la primera mascota para empezar a programar sus horarios."
          accion={
            <Boton
              onClick={() => {
                setModal({ modo: 'crear' })
              }}
            >
              Agregar mascota
            </Boton>
          }
        />
      )}

      {!isLoading && !isError && mascotas && mascotas.length > 0 && (
        <div className={estilos.grid}>
          {mascotas.map((mascota) => (
            <div key={mascota.id} className={estilos.tarjeta}>
              <span className={estilos.nombreMascota}>{mascota.nombre}</span>
              <span className={estilos.detalle}>
                {mascota.especie === 'perro' ? 'Perro' : 'Gato'} · {mascota.raza}
              </span>
              <span className={estilos.detalle}>{mascota.pesoKg} kg</span>
              <div className={estilos.acciones}>
                <Boton
                  variante="secundario"
                  tamano="chico"
                  onClick={() => {
                    setModal({ modo: 'editar', mascota })
                  }}
                >
                  Editar
                </Boton>
                <Boton
                  variante="peligro"
                  tamano="chico"
                  onClick={() => {
                    setAEliminar(mascota)
                  }}
                >
                  Eliminar
                </Boton>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        abierto={modal !== null}
        alCerrar={() => {
          setModal(null)
        }}
        titulo={modal?.modo === 'editar' ? 'Editar mascota' : 'Agregar mascota'}
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
          <FormularioMascota
            idFormulario={ID_FORMULARIO}
            valoresIniciales={modal.modo === 'editar' ? modal.mascota : undefined}
            alEnviar={alGuardar}
          />
        )}
      </Modal>

      <Modal
        abierto={aEliminar !== null}
        alCerrar={() => {
          setAEliminar(null)
        }}
        titulo="Eliminar mascota"
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
        <p>¿Seguro que quieres eliminar a {aEliminar?.nombre}? Esta acción no se puede deshacer.</p>
      </Modal>
    </div>
  )
}
