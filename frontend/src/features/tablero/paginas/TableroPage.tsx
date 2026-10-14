import { useState } from 'react'

import { useDispensarAhora, useDispositivos } from '@/features/dispositivos/hooks'
import { TarjetaDispositivo } from '@/features/dispositivos/componentes/TarjetaDispositivo'
import { useMascotas } from '@/features/mascotas/hooks'
import { useHorarios } from '@/features/horarios/hooks'
import { obtenerMensajeError } from '@/shared/api/errores'
import { Boton } from '@/shared/componentes/Boton'
import { Campo } from '@/shared/componentes/Campo'
import { EstadoVacio } from '@/shared/componentes/EstadoVacio'
import { Modal } from '@/shared/componentes/Modal'
import { Spinner } from '@/shared/componentes/Spinner'
import { useToasts } from '@/shared/componentes/Toast'
import { diaDeHoy } from '@/shared/constantes/dias'
import { formatearGramos } from '@/shared/utils/gramos'
import type { Dispositivo } from '@/tipos'

import estilos from './TableroPage.module.css'

export function TableroPage() {
  const {
    data: dispositivos,
    isLoading: cargandoDispositivos,
    isError: errorDispositivos,
    error: errorDispositivosDetalle,
  } = useDispositivos()
  const { data: horarios, isLoading: cargandoHorarios } = useHorarios()
  const { data: mascotas } = useMascotas()
  const dispensar = useDispensarAhora()
  const mostrarToast = useToasts((estado) => estado.mostrar)

  const [objetivo, setObjetivo] = useState<Dispositivo | null>(null)
  const [gramos, setGramos] = useState(50)

  const horariosDeHoy = (horarios ?? []).filter(
    (horario) => horario.activo && horario.dias.includes(diaDeHoy()),
  )

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
      <h1 className={estilos.titulo}>Tablero</h1>

      <section className={estilos.seccion}>
        <h2 className={estilos.tituloSeccion}>Tus dispensadores</h2>

        {cargandoDispositivos && (
          <div className={estilos.centro}>
            <Spinner etiqueta="Cargando dispositivos" />
          </div>
        )}

        {errorDispositivos && (
          <EstadoVacio
            tono="error"
            titulo="No se pudieron cargar los dispositivos"
            descripcion={obtenerMensajeError(errorDispositivosDetalle)}
          />
        )}

        {!cargandoDispositivos && !errorDispositivos && dispositivos?.length === 0 && (
          <EstadoVacio
            titulo="Todavía no hay dispositivos"
            descripcion="Vincula un dispensador para empezar."
          />
        )}

        {!cargandoDispositivos && !errorDispositivos && dispositivos && dispositivos.length > 0 && (
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
      </section>

      <section className={estilos.seccion}>
        <h2 className={estilos.tituloSeccion}>Horarios de hoy</h2>

        {cargandoHorarios && (
          <div className={estilos.centro}>
            <Spinner etiqueta="Cargando horarios" />
          </div>
        )}

        {!cargandoHorarios && horariosDeHoy.length === 0 && (
          <EstadoVacio
            titulo="Sin horarios para hoy"
            descripcion="No hay horarios activos programados para el día de hoy."
          />
        )}

        {!cargandoHorarios && horariosDeHoy.length > 0 && (
          <div className={estilos.listaHorarios}>
            {horariosDeHoy.map((horario) => {
              const dispositivo = dispositivos?.find((d) => d.id === horario.dispositivoId)
              const mascota = mascotas?.find((m) => m.id === horario.mascotaId)
              return (
                <div key={horario.id} className={estilos.filaHorario}>
                  <span className={estilos.hora}>{horario.hora}</span>
                  <span className={estilos.detalleHorario}>
                    {formatearGramos(horario.gramos)} · {mascota?.nombre ?? 'Mascota'} ·{' '}
                    {dispositivo?.nombre ?? 'Dispositivo'}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </section>

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
