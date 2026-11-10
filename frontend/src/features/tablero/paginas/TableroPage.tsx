import { useState } from 'react'

import { useDispensarAhora, useDispositivos } from '@/features/dispositivos/hooks'
import { TarjetaDispositivo } from '@/features/dispositivos/componentes/TarjetaDispositivo'
import { useMascotas } from '@/features/mascotas/hooks'
import { useHorarios } from '@/features/horarios/hooks'
import { useTodoHistorial } from '@/features/historial/hooks'
import { obtenerMensajeError } from '@/shared/api/errores'
import { Boton } from '@/shared/componentes/Boton'
import { Campo } from '@/shared/componentes/Campo'
import { EstadoVacio } from '@/shared/componentes/EstadoVacio'
import { Modal } from '@/shared/componentes/Modal'
import { Spinner } from '@/shared/componentes/Spinner'
import { useToasts } from '@/shared/componentes/Toast'
import { AnimatedCardGrid } from '@/shared/componentes/AnimatedCard'
import { diaDeHoy } from '@/shared/constantes/dias'
import { formatearGramos } from '@/shared/utils/gramos'
import { cx } from '@/shared/utils/cx'
import type { Dispositivo } from '@/tipos'
import type { Mascota } from '@/tipos'

import estilos from './TableroPage.module.css'

interface PuntoEstadistica {
  etiqueta: string
  totales: Record<string, number>
}

function fechaLocal(fecha: Date): string {
  const anio = fecha.getFullYear()
  const mes = String(fecha.getMonth() + 1).padStart(2, '0')
  const dia = String(fecha.getDate()).padStart(2, '0')
  return `${String(anio)}-${mes}-${dia}`
}

function crearPuntos(
  mascotas: Mascota[],
  fechas: { inicio: Date; fin: Date; etiqueta: string }[],
  dispensaciones: { fechaHora: string; mascotaId: string; gramos: number; estado: string }[],
): PuntoEstadistica[] {
  return fechas.map(({ inicio, fin, etiqueta }) => {
    const totales: Record<string, number> = Object.fromEntries(mascotas.map((m) => [m.id, 0]))
    for (const dispensacion of dispensaciones) {
      if (dispensacion.estado !== 'exitosa') continue
      const fecha = fechaLocal(new Date(dispensacion.fechaHora))
      if (fecha < fechaLocal(inicio) || fecha > fechaLocal(fin)) continue
      totales[dispensacion.mascotaId] = (totales[dispensacion.mascotaId] ?? 0) + dispensacion.gramos
    }
    return { etiqueta, totales }
  })
}

function GráficoConsumo({
  titulo,
  puntos,
  mascotas,
}: {
  titulo: string
  puntos: PuntoEstadistica[]
  mascotas: Mascota[]
}) {
  const maximo = Math.max(1, ...puntos.flatMap((punto) => Object.values(punto.totales)))
  const colores = [estilos.barraUna, estilos.barraDos, estilos.barraTres]
  const mascotaPrincipal = mascotas[0]
  const coordenadas = puntos.map((punto, indice) => ({
    x: ((indice + 0.5) * 700) / puntos.length,
    y: 145 - ((mascotaPrincipal ? (punto.totales[mascotaPrincipal.id] ?? 0) : 0) / maximo) * 145,
  }))
  const segmentosTendencia = coordenadas.flatMap((punto, indice) => {
    const siguientePunto = coordenadas[indice + 1]
    if (!siguientePunto) return []
    const gramos = mascotaPrincipal ? (puntos[indice]?.totales[mascotaPrincipal.id] ?? 0) : 0
    const siguientesGramos = mascotaPrincipal
      ? (puntos[indice + 1]?.totales[mascotaPrincipal.id] ?? 0)
      : 0
    if (gramos === 0 && siguientesGramos === 0) return []

    const anterior = coordenadas[Math.max(0, indice - 1)] ?? punto
    const puntoPosterior = coordenadas[indice + 2] ?? siguientePunto
    const controlUnoX = punto.x + (siguientePunto.x - anterior.x) / 6
    const controlUnoY = punto.y + (siguientePunto.y - anterior.y) / 6
    const controlDosX = siguientePunto.x - (puntoPosterior.x - punto.x) / 6
    const controlDosY = siguientePunto.y - (puntoPosterior.y - punto.y) / 6

    return [
      {
        inicio: punto,
        fin: siguientePunto,
        ruta: `M ${String(punto.x)} ${String(punto.y)} C ${String(controlUnoX)} ${String(controlUnoY)}, ${String(controlDosX)} ${String(controlDosY)}, ${String(siguientePunto.x)} ${String(siguientePunto.y)}`,
      },
    ]
  })

  return (
    <section className={estilos.tarjetaEstadistica} aria-label={titulo}>
      <header className={estilos.encabezadoGrafica}>
        <h3>{titulo}</h3>
        <span className={estilos.iconoGrafica} aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M4 19V5m0 14h16M7 15l4-4 3 2 5-6m-4 0h4v4"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </header>
      <div className={estilos.leyenda}>
        {mascotas.map((mascota, indice) => (
          <span key={mascota.id}>
            <i className={colores[indice % colores.length]} aria-hidden="true" />
            {mascota.nombre}
          </span>
        ))}
      </div>
      <div
        className={estilos.grafica}
        style={{ gridTemplateColumns: `repeat(${String(puntos.length)}, minmax(0, 1fr))` }}
      >
        {mascotaPrincipal && segmentosTendencia.length > 0 && (
          <svg
            className={estilos.tendencia}
            viewBox="0 0 700 145"
            preserveAspectRatio="none"
            role="img"
            aria-label={`Tendencia de consumo: ${mascotaPrincipal.nombre}`}
          >
            <defs>
              <linearGradient
                id={`relleno-${titulo.replaceAll(' ', '-')}`}
                x1="0"
                x2="0"
                y1="0"
                y2="1"
              >
                <stop offset="0%" stopColor="var(--marca-500)" stopOpacity="0.4" />
                <stop offset="100%" stopColor="var(--marca-500)" stopOpacity="0.03" />
              </linearGradient>
            </defs>
            {segmentosTendencia.map((segmento, indice) => (
              <path
                key={`${puntos[indice]?.etiqueta ?? String(indice)}-area`}
                className={estilos.areaTendencia}
                d={`${segmento.ruta} L ${String(segmento.fin.x)} 145 L ${String(segmento.inicio.x)} 145 Z`}
                fill={`url(#relleno-${titulo.replaceAll(' ', '-')})`}
              />
            ))}
            {segmentosTendencia.map((segmento, indice) => (
              <path
                key={`${puntos[indice]?.etiqueta ?? String(indice)}-borde`}
                className={estilos.bordeTendencia}
                d={segmento.ruta}
              />
            ))}
            {segmentosTendencia.map((segmento, indice) => (
              <path
                key={`${puntos[indice]?.etiqueta ?? String(indice)}-linea`}
                className={estilos.lineaTendencia}
                d={segmento.ruta}
              />
            ))}
            {coordenadas.map(({ x, y }, indice) => {
              const gramos = puntos[indice]?.totales[mascotaPrincipal.id] ?? 0
              return gramos > 0 ? (
                <circle
                  key={`${puntos[indice]?.etiqueta ?? String(indice)}-punto`}
                  className={estilos.puntoTendencia}
                  cx={x}
                  cy={y}
                  r="4"
                />
              ) : null
            })}
          </svg>
        )}
        {puntos.map((punto) => (
          <div className={estilos.grupoBarras} key={punto.etiqueta}>
            <div className={estilos.barras}>
              {mascotas.map((mascota, indice) => {
                const gramos = punto.totales[mascota.id] ?? 0
                const color = colores[indice % colores.length] ?? estilos.barraUna
                return (
                  <div
                    key={mascota.id}
                    className={cx(estilos.barra, color)}
                    style={{ height: `${String((gramos / maximo) * 100)}%` }}
                    title={`${mascota.nombre}: ${String(gramos)} g`}
                    aria-label={`${mascota.nombre}: ${String(gramos)} gramos`}
                    role="img"
                  />
                )
              })}
            </div>
            <span className={estilos.etiquetaGrafica}>{punto.etiqueta}</span>
          </div>
        ))}
      </div>
      <p className={estilos.unidad}>Consumo exitoso en gramos</p>
    </section>
  )
}

export function TableroPage() {
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  const inicioSemana = new Date(hoy)
  inicioSemana.setDate(hoy.getDate() - ((hoy.getDay() + 6) % 7))
  const inicioEstadisticas = new Date(inicioSemana)
  inicioEstadisticas.setDate(inicioSemana.getDate() - 21)
  const {
    data: dispositivos,
    isLoading: cargandoDispositivos,
    isError: errorDispositivos,
    error: errorDispositivosDetalle,
  } = useDispositivos()
  const { data: horarios, isLoading: cargandoHorarios } = useHorarios()
  const { data: mascotas } = useMascotas()
  const {
    data: historial,
    isLoading: cargandoEstadisticas,
    isError: errorEstadisticas,
  } = useTodoHistorial({ desde: fechaLocal(inicioEstadisticas), hasta: fechaLocal(hoy) })
  const dispensar = useDispensarAhora()
  const mostrarToast = useToasts((estado) => estado.mostrar)

  const [objetivo, setObjetivo] = useState<Dispositivo | null>(null)
  const [gramos, setGramos] = useState(50)

  const horariosDeHoy = (horarios ?? []).filter(
    (horario) => horario.activo && horario.dias.includes(diaDeHoy()),
  )
  const mascotasCargadas = mascotas ?? []
  const registros = historial ?? []
  const dias = Array.from({ length: 7 }, (_, indice) => {
    const fecha = new Date(hoy)
    fecha.setDate(hoy.getDate() - 6 + indice)
    return {
      inicio: fecha,
      fin: fecha,
      etiqueta: fecha.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric' }),
    }
  })
  const semanas = Array.from({ length: 4 }, (_, indice) => {
    const inicio = new Date(inicioSemana)
    inicio.setDate(inicioSemana.getDate() - (3 - indice) * 7)
    const fin = new Date(inicio)
    fin.setDate(inicio.getDate() + 6)
    return {
      inicio,
      fin,
      etiqueta: `Sem. ${inicio.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}`,
    }
  })
  const consumoDiario = crearPuntos(mascotasCargadas, dias, registros)
  const consumoSemanal = crearPuntos(mascotasCargadas, semanas, registros)

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
      <header className={estilos.encabezado}>
        <p className={estilos.etiqueta}>RESUMEN DE HOY</p>
        <h1 className={estilos.titulo}>Tablero</h1>
        <p className={estilos.descripcion}>
          Revisa tus dispensadores, los próximos horarios y la alimentación de tus mascotas.
        </p>
      </header>

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
          <AnimatedCardGrid className={estilos.grid}>
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
          </AnimatedCardGrid>
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
          <AnimatedCardGrid className={estilos.listaHorarios}>
            {horariosDeHoy.map((horario) => {
              const dispositivo = dispositivos?.find((d) => d.id === horario.dispositivoId)
              const mascota = mascotas?.find((m) => m.id === horario.mascotaId)
              return (
                <article key={horario.id} className={estilos.filaHorario}>
                  <span className={estilos.hora}>{horario.hora}</span>
                  <span className={estilos.detalleHorario}>
                    {formatearGramos(horario.gramos)} · {mascota?.nombre ?? 'Mascota'} ·{' '}
                    {dispositivo?.nombre ?? 'Dispositivo'}
                  </span>
                </article>
              )
            })}
          </AnimatedCardGrid>
        )}
      </section>

      <section className={estilos.seccion}>
        <h2 className={estilos.tituloSeccion}>Estadísticas de consumo</h2>
        {cargandoEstadisticas && <Spinner etiqueta="Cargando estadísticas" />}
        {errorEstadisticas && (
          <EstadoVacio tono="error" titulo="No se pudieron cargar las estadísticas" />
        )}
        {!cargandoEstadisticas && !errorEstadisticas && mascotasCargadas.length === 0 && (
          <EstadoVacio
            titulo="Sin mascotas"
            descripcion="Agrega una mascota para ver su consumo."
          />
        )}
        {!cargandoEstadisticas && !errorEstadisticas && mascotasCargadas.length > 0 && (
          <AnimatedCardGrid className={estilos.gridEstadisticas}>
            <GráficoConsumo
              titulo="Consumo diario · últimos 7 días"
              puntos={consumoDiario}
              mascotas={mascotasCargadas}
            />
            <GráficoConsumo
              titulo="Consumo semanal · últimas 4 semanas"
              puntos={consumoSemanal}
              mascotas={mascotasCargadas}
            />
          </AnimatedCardGrid>
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
