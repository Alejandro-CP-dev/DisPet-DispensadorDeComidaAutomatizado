import { useState } from 'react'

import { useMascotas } from '@/features/mascotas/hooks'
import { obtenerMensajeError } from '@/shared/api/errores'
import { Boton } from '@/shared/componentes/Boton'
import { Campo } from '@/shared/componentes/Campo'
import { EstadoVacio } from '@/shared/componentes/EstadoVacio'
import { Modal } from '@/shared/componentes/Modal'
import { Spinner } from '@/shared/componentes/Spinner'
import { useToasts } from '@/shared/componentes/Toast'
import type { Dispositivo } from '@/tipos'

import { TarjetaDispositivo } from '../componentes/TarjetaDispositivo'
import { useDispensarAhora, useDispositivos } from '../hooks'
import estilos from './DispositivosPage.module.css'

export function DispositivosPage() {
  const { data: dispositivos, isLoading, isError, error } = useDispositivos()
  const { data: mascotas } = useMascotas()
  const dispensar = useDispensarAhora()
  const mostrarToast = useToasts((estado) => estado.mostrar)

  const [objetivo, setObjetivo] = useState<Dispositivo | null>(null)
  const [gramos, setGramos] = useState(50)

  function confirmarDispensar() {
    if (!objetivo) return
    dispensar.mutate(
      { id: objetivo.id, gramos },
      {
        onSuccess: () => {
          mostrarToast(`Se dispensaron ${String(gramos)} g en ${objetivo.nombre}.`, 'exito')
          setObjetivo(null)
        },
        onError: (err) => {
          mostrarToast(obtenerMensajeError(err), 'error')
        },
      },
    )
  }

  return (
    <div className={estilos.pagina}>
      <h1 className={estilos.titulo}>Dispositivos</h1>

      {isLoading && (
        <div className={estilos.centro}>
          <Spinner etiqueta="Cargando dispositivos" />
        </div>
      )}

      {isError && (
        <EstadoVacio
          tono="error"
          titulo="No se pudieron cargar los dispositivos"
          descripcion={obtenerMensajeError(error)}
        />
      )}

      {!isLoading && !isError && dispositivos?.length === 0 && (
        <EstadoVacio
          titulo="Todavía no hay dispositivos"
          descripcion="Vincula un dispensador para empezar."
        />
      )}

      {!isLoading && !isError && dispositivos && dispositivos.length > 0 && (
        <div className={estilos.grid}>
          {dispositivos.map((dispositivo) => (
            <TarjetaDispositivo
              key={dispositivo.id}
              dispositivo={dispositivo}
              mascotaNombre={mascotas?.find((m) => m.id === dispositivo.mascotaId)?.nombre}
              onDispensar={() => {
                setGramos(50)
                setObjetivo(dispositivo)
              }}
              dispensando={dispensar.isPending && objetivo?.id === dispositivo.id}
            />
          ))}
        </div>
      )}

      <Modal
        abierto={objetivo !== null}
        alCerrar={() => {
          setObjetivo(null)
        }}
        titulo={`Dispensar en ${objetivo?.nombre ?? ''}`}
        pie={
          <>
            <Boton
              variante="secundario"
              onClick={() => {
                setObjetivo(null)
              }}
            >
              Cancelar
            </Boton>
            <Boton onClick={confirmarDispensar} cargando={dispensar.isPending}>
              Dispensar
            </Boton>
          </>
        }
      >
        <div className={estilos.formulario}>
          <p>¿Cuántos gramos quieres dispensar ahora?</p>
          <Campo
            label="Gramos"
            type="number"
            min={1}
            value={gramos}
            onChange={(evento) => {
              setGramos(Number(evento.target.value))
            }}
          />
        </div>
      </Modal>
    </div>
  )
}
