import { useState } from 'react'

import { obtenerMensajeError } from '@/shared/api/errores'
import { Boton } from '@/shared/componentes/Boton'
import { AnimatedCardGrid } from '@/shared/componentes/AnimatedCard'
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
        <AnimatedCardGrid className={estilos.grid}>
          {mascotas.map((mascota) => (
            <article key={mascota.id} className={estilos.tarjeta}>
              <header className={estilos.encabezadoMascota}>
                <span className={estilos.avatar}>
                  <img
                    className={mascota.especie === 'gato' ? estilos.imagenGato : undefined}
                    src="/img/mascotas-perro-gato.png"
                    alt={mascota.especie === 'perro' ? 'Perro' : 'Gato'}
                  />
                </span>
                <h2 className={estilos.nombreMascota}>{mascota.nombre}</h2>
              </header>
              <p className={estilos.detalle}>
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M8 11c1.1 0 1.8-1.1 1.8-2.4S9.1 6.2 8 6.2 6.2 7.3 6.2 8.6 6.9 11 8 11Zm8 0c1.1 0 1.8-1.1 1.8-2.4S17.1 6.2 16 6.2s-1.8 1.1-1.8 2.4S14.9 11 16 11Zm-11 3c1 0 1.6-1 1.6-2.1S6 10 5 10s-1.6 1-1.6 2.1S4 14 5 14Zm14 0c1 0 1.6-1 1.6-2.1S20 10 19 10s-1.6 1-1.6 2.1S18 14 19 14Zm-7-1c-3 0-6 3.6-6 5.4 0 1.5 1.4 1.8 3 1.2.9-.3 1.9-.6 3-.6s2.1.3 3 .6c1.6.6 3 .3 3-1.2 0-1.8-3-5.4-6-5.4Z"
                    fill="currentColor"
                  />
                </svg>
                <span>
                  {mascota.especie === 'perro' ? 'Perro' : 'Gato'} <span aria-hidden="true">·</span>{' '}
                  {mascota.raza}
                </span>
              </p>
              <p className={estilos.detalle}>
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M12 3.5a3 3 0 0 0-3 3v1H7a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-2v-1a3 3 0 0 0-3-3Zm-1 4v-1a1 1 0 1 1 2 0v1h-2Z"
                    fill="currentColor"
                  />
                </svg>
                <span>{mascota.pesoKg} kg</span>
              </p>
              <div className={estilos.acciones}>
                <Boton
                  variante="secundario"
                  className={estilos.botonEditar}
                  aria-label={`Editar ${mascota.nombre}`}
                  onClick={() => {
                    setModal({ modo: 'editar', mascota })
                  }}
                >
                  <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                    <path
                      d="m12.8 4.2 3 3M4 16l3.5-.7L16 6.8a1.8 1.8 0 0 0-2.5-2.5L5 12.8 4 16Z"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Editar
                </Boton>
                <Boton
                  variante="peligro"
                  className={estilos.botonEliminar}
                  aria-label={`Eliminar ${mascota.nombre}`}
                  onClick={() => {
                    setAEliminar(mascota)
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
                  Eliminar
                </Boton>
              </div>
            </article>
          ))}
        </AnimatedCardGrid>
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
