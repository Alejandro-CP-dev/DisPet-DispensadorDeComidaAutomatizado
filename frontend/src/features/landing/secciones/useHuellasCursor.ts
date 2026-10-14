import { useEffect } from 'react'
import type { RefObject } from 'react'

import { useMediaQuery } from '@/shared/hooks/useMediaQuery'

import estilos from './Hero.module.css'

const DISTANCIA_MINIMA_PX = 46
const SEPARACION_LATERAL_PX = 13
const DURACION_ANIMACION_MS = 900
const MAX_HUELLAS_ACTIVAS = 40

const HUELLA_SVG =
  '<svg viewBox="0 0 64 64" fill="currentColor" aria-hidden="true">' +
  '<ellipse cx="32" cy="43" rx="16" ry="13"/>' +
  '<ellipse cx="13" cy="20" rx="7" ry="9"/>' +
  '<ellipse cx="30" cy="11" rx="7" ry="9.5"/>' +
  '<ellipse cx="47" cy="17" rx="7" ry="9"/>' +
  '<ellipse cx="56" cy="32" rx="6" ry="7.5"/>' +
  '</svg>'

/**
 * Deja un rastro de huellas de mascota que siguen al cursor dentro de `refContenedor`,
 * alternando lado izquierdo/derecho según la dirección del movimiento (como un andar real)
 * y desvaneciéndose después de un momento. Manipula el DOM directamente en vez de usar
 * estado de React para no re-renderizar en cada evento de movimiento.
 */
export function useHuellasCursor(refContenedor: RefObject<HTMLElement | null>): void {
  const movimientoReducido = useMediaQuery('(prefers-reduced-motion: reduce)')

  useEffect(() => {
    if (movimientoReducido) return

    const contenedor = refContenedor.current
    if (!contenedor) return

    const capa = document.createElement('div')
    capa.className = estilos.capaHuellas ?? ''
    contenedor.appendChild(capa)

    let ultimaX = 0
    let ultimaY = 0
    let hayPosicionPrevia = false
    let siguientePieIzquierdo = true
    let huellasActivas = 0

    const crearHuella = (x: number, y: number, anguloGrados: number) => {
      if (huellasActivas >= MAX_HUELLAS_ACTIVAS) return

      const huella = document.createElement('div')
      huella.className = estilos.huella ?? ''
      huella.style.left = `${String(x)}px`
      huella.style.top = `${String(y)}px`
      huella.style.setProperty('--angulo', `${String(anguloGrados)}deg`)
      huella.innerHTML = HUELLA_SVG
      capa.appendChild(huella)
      huellasActivas++

      let yaLimpiada = false
      const limpiar = () => {
        if (yaLimpiada) return
        yaLimpiada = true
        huella.remove()
        huellasActivas--
      }
      huella.addEventListener('animationend', limpiar, { once: true })
      setTimeout(limpiar, DURACION_ANIMACION_MS + 300)
    }

    const alMover = (evento: PointerEvent) => {
      const rect = contenedor.getBoundingClientRect()
      const x = evento.clientX - rect.left
      const y = evento.clientY - rect.top

      if (!hayPosicionPrevia) {
        ultimaX = x
        ultimaY = y
        hayPosicionPrevia = true
        return
      }

      const dx = x - ultimaX
      const dy = y - ultimaY
      const distancia = Math.hypot(dx, dy)
      if (distancia < DISTANCIA_MINIMA_PX) return

      const anguloRad = Math.atan2(dy, dx)
      const anguloPerpendicular = anguloRad + Math.PI / 2
      const lado = siguientePieIzquierdo ? -1 : 1
      const offsetX = Math.cos(anguloPerpendicular) * SEPARACION_LATERAL_PX * lado
      const offsetY = Math.sin(anguloPerpendicular) * SEPARACION_LATERAL_PX * lado

      crearHuella(x + offsetX, y + offsetY, (anguloRad * 180) / Math.PI + 90)

      siguientePieIzquierdo = !siguientePieIzquierdo
      ultimaX = x
      ultimaY = y
    }

    const alSalir = () => {
      hayPosicionPrevia = false
    }

    contenedor.addEventListener('pointermove', alMover)
    contenedor.addEventListener('pointerleave', alSalir)
    return () => {
      contenedor.removeEventListener('pointermove', alMover)
      contenedor.removeEventListener('pointerleave', alSalir)
      capa.remove()
    }
  }, [refContenedor, movimientoReducido])
}
