import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react'

import { useMediaQuery } from '@/shared/hooks/useMediaQuery'
import { cx } from '@/shared/utils/cx'

import estilos from './MuroDeFotos.module.css'

export interface ItemMuro {
  imagen: string
  titulo?: string
  enlace?: string
}

type DireccionMuro = 'up' | 'down'

interface MuroDeFotosProps {
  items: ItemMuro[]
  columnas?: number
  anchoFoto?: number
  altoFoto?: number
  espacio?: number
  radio?: number
  inclinacion?: number
  giro?: number
  rotacion?: number
  perspectiva?: number
  profundidad?: number
  velocidad?: number
  direccion?: DireccionMuro
  variacion?: number
  parallax?: number
  pausarAlPasarCursor?: boolean
  elevacion?: number
  desvanecido?: number
  atenuacion?: number
  escalaGrises?: boolean
  colorSuperposicion?: string
  etiquetaGrupo?: string
  className?: string
}

function factorColumna(indice: number, variacion: number): number {
  const pseudo = ((indice * 0.6180339887 + 0.35) % 1) * 2 - 1
  return 1 + variacion * pseudo
}

export function MuroDeFotos({
  items,
  columnas = 5,
  anchoFoto = 300,
  altoFoto = 132,
  espacio = 18,
  radio = 24,
  inclinacion = 16,
  giro = -14,
  rotacion = 0,
  perspectiva = 1200,
  profundidad = 120,
  velocidad = 42,
  direccion = 'up',
  variacion = 0.45,
  parallax = 0.6,
  pausarAlPasarCursor = false,
  elevacion = 64,
  desvanecido = 0.6,
  atenuacion = 0.55,
  escalaGrises = false,
  colorSuperposicion = 'var(--escena-fondo)',
  etiquetaGrupo = 'Galería de fotos',
  className,
}: MuroDeFotosProps) {
  const refContenedor = useRef<HTMLDivElement>(null)
  const refPlano = useRef<HTMLDivElement>(null)
  const refPistas = useRef<(HTMLDivElement | null)[]>([])
  const refRaf = useRef<number | null>(null)

  const refDesplazamientos = useRef<number[]>([])
  const refVelocidades = useRef<number[]>([])
  const refColumnaActiva = useRef(-1)
  const refMuroConCursor = useRef(false)
  const refPuntero = useRef({ x: 0, y: 0 })
  const refPunteroSuavizado = useRef({ x: 0, y: 0 })
  const refUltimoTiempo = useRef<number | null>(null)

  const [altoContenedor, setAltoContenedor] = useState(640)
  const [enVista, setEnVista] = useState(true)
  const movimientoReducido = useMediaQuery('(prefers-reduced-motion: reduce)')

  const itemsPorColumna = useMemo(() => {
    const columnasItems: ItemMuro[][] = Array.from({ length: columnas }, () => [])
    items.forEach((item, indice) => {
      columnasItems[indice % columnas]?.push(item)
    })
    return columnasItems.map((columna) => (columna.length ? columna : items.slice(0, 1)))
  }, [items, columnas])

  const metaColumnas = useMemo(() => {
    const unidad = altoFoto + espacio
    return itemsPorColumna.map((columna) => {
      const altoCopia = Math.max(unidad, columna.length * unidad)
      const copias = Math.max(2, Math.ceil((altoContenedor * 1.6) / altoCopia) + 1)
      return { altoCopia, copias }
    })
  }, [itemsPorColumna, altoFoto, espacio, altoContenedor])

  useLayoutEffect(() => {
    const contenedor = refContenedor.current
    if (!contenedor) return

    const observadorTamano = new ResizeObserver(([entrada]) => {
      const altura = entrada?.contentRect.height
      setAltoContenedor(altura && altura > 0 ? altura : 640)
    })
    observadorTamano.observe(contenedor)

    const observadorVista = new IntersectionObserver(([entrada]) => {
      setEnVista(entrada?.isIntersecting ?? true)
    })
    observadorVista.observe(contenedor)

    return () => {
      observadorTamano.disconnect()
      observadorVista.disconnect()
    }
  }, [])

  const velocidadesBase = useMemo(() => {
    const signoDireccion = direccion === 'up' ? 1 : -1
    return itemsPorColumna.map((_, c) => {
      const signoAlterno = c % 2 === 0 ? 1 : -1
      return velocidad * factorColumna(c, variacion) * signoDireccion * signoAlterno
    })
  }, [itemsPorColumna, velocidad, direccion, variacion])

  useEffect(() => {
    refDesplazamientos.current = metaColumnas.map((meta, c) => meta.altoCopia * ((c * 0.37) % 1))
    refVelocidades.current = itemsPorColumna.map(() => 0)
  }, [metaColumnas, itemsPorColumna])

  const aplicarTransformPlano = useCallback(
    (px: number, py: number) => {
      const plano = refPlano.current
      if (!plano) return
      plano.style.transform =
        `translate(-50%, -50%) scale(1.18) ` +
        `rotateX(${String(inclinacion + py)}deg) rotateY(${String(giro + px)}deg) rotateZ(${String(rotacion)}deg) ` +
        `translateZ(${String(-profundidad)}px)`
    },
    [inclinacion, giro, rotacion, profundidad],
  )

  useEffect(() => {
    if (movimientoReducido || !enVista) {
      aplicarTransformPlano(0, 0)
      refPistas.current.forEach((el, c) => {
        const desplazamiento = refDesplazamientos.current[c] ?? 0
        if (el) el.style.transform = `translate3d(0, ${String(-desplazamiento)}px, 0)`
      })
      return
    }

    const animar = (marca: number) => {
      refUltimoTiempo.current ??= marca
      const dt = Math.min(0.05, Math.max(0, marca - refUltimoTiempo.current) / 1000)
      refUltimoTiempo.current = marca

      const inclinacionMaxima = parallax * 8
      const objetivoX = refPuntero.current.x * inclinacionMaxima
      const objetivoY = -refPuntero.current.y * inclinacionMaxima
      const suavizado = 1 - Math.exp(-dt / 0.12)
      refPunteroSuavizado.current.x += (objetivoX - refPunteroSuavizado.current.x) * suavizado
      refPunteroSuavizado.current.y += (objetivoY - refPunteroSuavizado.current.y) * suavizado
      aplicarTransformPlano(refPunteroSuavizado.current.x, refPunteroSuavizado.current.y)

      for (let c = 0; c < refPistas.current.length; c += 1) {
        const meta = metaColumnas[c]
        if (!meta) continue

        const pausado = refMuroConCursor.current && pausarAlPasarCursor
        const factor = pausado || refColumnaActiva.current === c ? 0 : 1
        const objetivo = (velocidadesBase[c] ?? 0) * factor

        const suavizadoVelocidad = 1 - Math.exp(-dt / (objetivo === 0 ? 0.16 : 0.28))
        const velocidadActual = refVelocidades.current[c] ?? 0
        refVelocidades.current[c] =
          velocidadActual + (objetivo - velocidadActual) * suavizadoVelocidad

        let siguiente = (refDesplazamientos.current[c] ?? 0) + (refVelocidades.current[c] ?? 0) * dt
        siguiente = ((siguiente % meta.altoCopia) + meta.altoCopia) % meta.altoCopia
        refDesplazamientos.current[c] = siguiente

        const el = refPistas.current[c]
        if (el) el.style.transform = `translate3d(0, ${String(-siguiente)}px, 0)`
      }

      refRaf.current = requestAnimationFrame(animar)
    }

    refRaf.current = requestAnimationFrame(animar)
    return () => {
      if (refRaf.current !== null) cancelAnimationFrame(refRaf.current)
      refRaf.current = null
      refUltimoTiempo.current = null
    }
  }, [
    velocidadesBase,
    metaColumnas,
    pausarAlPasarCursor,
    parallax,
    movimientoReducido,
    enVista,
    aplicarTransformPlano,
  ])

  const manejarMovimientoPuntero = useCallback(
    (evento: ReactPointerEvent<HTMLDivElement>) => {
      if (parallax <= 0 || movimientoReducido) return
      const rect = refContenedor.current?.getBoundingClientRect()
      if (!rect) return
      refPuntero.current = {
        x: (evento.clientX - rect.left) / rect.width - 0.5,
        y: (evento.clientY - rect.top) / rect.height - 0.5,
      }
    },
    [parallax, movimientoReducido],
  )

  const manejarSalidaMuro = useCallback(() => {
    refMuroConCursor.current = false
    refPuntero.current = { x: 0, y: 0 }
  }, [])

  const variablesCss = useMemo(
    () =>
      ({
        '--muro-ancho': `${String(anchoFoto)}px`,
        '--muro-alto': `${String(altoFoto)}px`,
        '--muro-espacio': `${String(espacio)}px`,
        '--muro-radio': `${String(radio)}px`,
        '--muro-perspectiva': `${String(perspectiva)}px`,
        '--muro-elevacion': `${String(elevacion)}px`,
        '--muro-atenuacion': atenuacion,
        '--muro-gris': escalaGrises ? 1 : 0,
        '--muro-superposicion': colorSuperposicion,
        '--muro-borde': `${String(Math.max(0, (1 - desvanecido) * 100))}%`,
      }) as CSSProperties,
    [
      anchoFoto,
      altoFoto,
      espacio,
      radio,
      perspectiva,
      elevacion,
      atenuacion,
      escalaGrises,
      colorSuperposicion,
      desvanecido,
    ],
  )

  return (
    <div
      ref={refContenedor}
      className={cx(estilos.muro, className)}
      style={variablesCss}
      onPointerMove={manejarMovimientoPuntero}
      onPointerEnter={() => {
        refMuroConCursor.current = true
      }}
      onPointerLeave={manejarSalidaMuro}
      role="group"
      aria-label={etiquetaGrupo}
    >
      <div ref={refPlano} className={estilos.plano}>
        {itemsPorColumna.map((columna, c) => {
          const meta = metaColumnas[c]
          const copias = Array.from({ length: meta?.copias ?? 2 })
          return (
            <div
              key={`columna-${String(c)}`}
              className={estilos.columna}
              onPointerEnter={() => {
                refColumnaActiva.current = c
              }}
              onPointerLeave={() => {
                refColumnaActiva.current = -1
              }}
            >
              <div
                className={estilos.pista}
                ref={(el) => {
                  refPistas.current[c] = el
                }}
              >
                {copias.map((_, indiceCopia) =>
                  columna.map((item, indiceItem) => (
                    <Foto
                      key={`${String(c)}-${String(indiceCopia)}-${String(indiceItem)}`}
                      item={item}
                    />
                  )),
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Foto({ item }: { item: ItemMuro }) {
  const interior = (
    <span className={estilos.interior}>
      <img
        src={item.imagen}
        alt={item.titulo ?? ''}
        className={estilos.imagen}
        loading="lazy"
        decoding="async"
        draggable={false}
      />
      <span className={estilos.superposicion} aria-hidden="true" />
    </span>
  )

  if (item.enlace) {
    return (
      <a href={item.enlace} target="_blank" rel="noreferrer noopener" className={estilos.foto}>
        {interior}
      </a>
    )
  }

  return <figure className={estilos.foto}>{interior}</figure>
}
