import { useEffect, useMemo, useRef } from 'react'
import type { CSSProperties } from 'react'

import { cx } from '@/shared/utils/cx'

import estilos from './TextoProfundidad.module.css'

const MAX_CAPAS = 64

type EstiloConVariables = CSSProperties & Record<`--${string}`, string | number>

function limitar(valor: number, minimo: number, maximo: number): number {
  return Math.min(Math.max(valor, minimo), maximo)
}

function obtenerColorCapa(
  colorFrente: string,
  colorProfundidad: string,
  indice: number,
  total: number,
): string {
  const progreso = total <= 1 ? 1 : indice / total
  const progresoSuavizado = progreso * progreso
  const mezclaFrente = Math.round((1 - progresoSuavizado) * 72 + 4)
  return `color-mix(in srgb, ${colorFrente} ${String(mezclaFrente)}%, ${colorProfundidad})`
}

function obtenerTransformacion(rotarX: number, rotarY: number): string {
  return `rotateX(${rotarX.toFixed(3)}deg) rotateY(${rotarY.toFixed(3)}deg)`
}

interface TextoProfundidadProps {
  texto?: string
  capas?: number
  profundidad?: number
  colorFrente?: string
  colorProfundidad?: string
  inclinacion?: number
  seguimientoPuntero?: boolean
  suavizado?: number
  perspectiva?: number
  orbitaAutomatica?: boolean
  velocidadOrbita?: number
  tamanoFuente?: string
  pesoFuente?: number | string
  sombra?: boolean
  className?: string
  style?: CSSProperties
}

/**
 * Texto extruido en 3D, formado por varias capas apiladas que se inclinan
 * siguiendo el puntero (o con una órbita suave cuando no hay puntero fino).
 * Adaptado de "DepthText" (React Bits) a los tokens y convenciones del proyecto.
 */
export function TextoProfundidad({
  texto = 'DisPet',
  capas = 34,
  profundidad = 2.4,
  colorFrente = 'var(--ink-900)',
  colorProfundidad = 'var(--marca-500)',
  inclinacion = 7.5,
  seguimientoPuntero = true,
  suavizado = 0.14,
  perspectiva = 900,
  orbitaAutomatica = true,
  velocidadOrbita = 0.35,
  tamanoFuente = 'clamp(3rem, 12vw, 7rem)',
  pesoFuente = 900,
  sombra = true,
  className,
  style,
}: TextoProfundidadProps) {
  const refRaiz = useRef<HTMLSpanElement>(null)
  const refEscenario = useRef<HTMLSpanElement>(null)

  const capasSeguras = limitar(Math.round(capas) || 1, 2, MAX_CAPAS)
  const profundidadSegura = limitar(profundidad || 0, 0, 12)
  const inclinacionSegura = limitar(inclinacion || 0, 0, 12)
  const suavizadoSeguro = limitar(suavizado || 0.14, 0.02, 0.35)
  const perspectivaSegura = limitar(perspectiva || 900, 300, 2000)
  const velocidadOrbitaSegura = limitar(velocidadOrbita || 0, 0, 2)

  const rotacionBase = useMemo(
    () => ({ x: -inclinacionSegura * 0.32, y: inclinacionSegura * 0.42 }),
    [inclinacionSegura],
  )

  const capasProfundidad = useMemo(
    () =>
      Array.from({ length: capasSeguras }, (_, indiceCapa) => {
        const indice = capasSeguras - indiceCapa
        return {
          indice,
          color: obtenerColorCapa(colorFrente, colorProfundidad, indice, capasSeguras),
          transform: `translateZ(${String(-indice * profundidadSegura)}px)`,
        }
      }),
    [capasSeguras, profundidadSegura, colorFrente, colorProfundidad],
  )

  useEffect(() => {
    const raiz = refRaiz.current
    const escenario = refEscenario.current
    if (!raiz || !escenario) return

    const movimientoReducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const punteroFino = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    const puedeSeguirPuntero = seguimientoPuntero && punteroFino && !movimientoReducido

    if (movimientoReducido) {
      escenario.style.transform = obtenerTransformacion(rotacionBase.x, rotacionBase.y)
      return
    }

    let idFrame = 0
    let punteroActivo = false
    const tiempoInicio = performance.now()
    const actual = { ...rotacionBase }
    const objetivo = { ...rotacionBase }

    const aplicarTransformacion = () => {
      escenario.style.transform = obtenerTransformacion(actual.x, actual.y)
    }

    const alMoverPuntero = (evento: PointerEvent) => {
      const rect = raiz.getBoundingClientRect()
      if (!rect.width || !rect.height) return

      punteroActivo = true
      const x = limitar((evento.clientX - (rect.left + rect.width / 2)) / (rect.width * 0.8), -1, 1)
      const y = limitar(
        (evento.clientY - (rect.top + rect.height / 2)) / (rect.height * 0.8),
        -1,
        1,
      )

      objetivo.x = rotacionBase.x - y * inclinacionSegura
      objetivo.y = rotacionBase.y + x * inclinacionSegura
    }

    const alSalirPuntero = () => {
      punteroActivo = false
      objetivo.x = rotacionBase.x
      objetivo.y = rotacionBase.y
    }

    if (puedeSeguirPuntero) {
      window.addEventListener('pointermove', alMoverPuntero)
      window.addEventListener('pointerleave', alSalirPuntero)
      window.addEventListener('blur', alSalirPuntero)
    }

    const tick = (ahora: number) => {
      if ((!puedeSeguirPuntero || !punteroActivo) && orbitaAutomatica) {
        const transcurrido = (ahora - tiempoInicio) / 1000
        const orbita = transcurrido * velocidadOrbitaSegura * Math.PI * 2
        const cantidadRespaldo = puedeSeguirPuntero ? 0.18 : 0.55
        objetivo.x = rotacionBase.x + Math.sin(orbita) * inclinacionSegura * cantidadRespaldo
        objetivo.y = rotacionBase.y + Math.cos(orbita * 0.85) * inclinacionSegura * cantidadRespaldo
      }

      actual.x += (objetivo.x - actual.x) * suavizadoSeguro
      actual.y += (objetivo.y - actual.y) * suavizadoSeguro
      aplicarTransformacion()
      idFrame = requestAnimationFrame(tick)
    }

    aplicarTransformacion()
    idFrame = requestAnimationFrame(tick)

    return () => {
      if (puedeSeguirPuntero) {
        window.removeEventListener('pointermove', alMoverPuntero)
        window.removeEventListener('pointerleave', alSalirPuntero)
        window.removeEventListener('blur', alSalirPuntero)
      }
      cancelAnimationFrame(idFrame)
    }
  }, [
    orbitaAutomatica,
    rotacionBase,
    seguimientoPuntero,
    velocidadOrbitaSegura,
    suavizadoSeguro,
    inclinacionSegura,
  ])

  const estiloRaiz: EstiloConVariables = {
    ...style,
    '--perspectiva': `${String(perspectivaSegura)}px`,
    '--tamano-fuente': tamanoFuente,
    '--peso-fuente': pesoFuente,
    '--color-frente': colorFrente,
    '--color-profundidad': colorProfundidad,
    '--sombra': sombra
      ? `0 22px 34px color-mix(in srgb, ${colorProfundidad} 36%, transparent), 0 4px 8px rgba(0, 0, 0, 0.28)`
      : 'none',
  }

  return (
    <span ref={refRaiz} className={cx(estilos.raiz, className)} style={estiloRaiz}>
      <span ref={refEscenario} className={estilos.escenario}>
        {capasProfundidad.map((capa) => (
          <span
            key={capa.indice}
            aria-hidden="true"
            className={estilos.capaTexto}
            style={{ color: capa.color, transform: capa.transform }}
          >
            {texto}
          </span>
        ))}
        <span className={estilos.cara}>{texto}</span>
      </span>
    </span>
  )
}
