import { forwardRef, useEffect, useRef } from 'react'
import type { ButtonHTMLAttributes } from 'react'

import { useMediaQuery } from '@/shared/hooks/useMediaQuery'
import { cx } from '@/shared/utils/cx'

import estilos from './BotonMagnetico.module.css'

interface BotonMagneticoProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Fracción de la distancia del puntero al centro que se aplica como atracción. */
  fuerza?: number
}

// Resorte amortiguado simple (sin dependencias): empuja la posición hacia el
// objetivo y la frena con amortiguación, dando el rebote característico del
// efecto "magnético" sin necesitar una librería de animación.
//
// Se integra en sub-pasos de tamaño fijo (PASO_FIJO) en vez de usar el `dt`
// real de cada frame directamente: con amortiguación explícita, un `dt`
// grande (una pestaña en segundo plano, un frame largo) puede volver
// inestable la simulación y mandar el botón a una posición absurda. Pasos
// fijos y pequeños mantienen la integración estable sin importar el `dt`.
const RIGIDEZ = 200
const AMORTIGUACION = 15
const MASA = 1
const PASO_FIJO = 1 / 240
const MAX_SUBPASOS = 8
const DISTANCIA_MINIMA_REPOSO = 0.02
const DISTANCIA_MAXIMA_PX = 400

/**
 * Botón que se "atrae" hacia el cursor al acercarse y vuelve a su lugar con
 * un pequeño rebote al salir. Adaptado de "Magnetic Button" (21st.dev / Hirael).
 */
export const BotonMagnetico = forwardRef<HTMLButtonElement, BotonMagneticoProps>(
  function BotonMagnetico({ fuerza = 0.4, className, ...resto }, refExterno) {
    const refInterno = useRef<HTMLButtonElement | null>(null)
    const movimientoReducido = useMediaQuery('(prefers-reduced-motion: reduce)')

    useEffect(() => {
      if (movimientoReducido) return
      const boton = refInterno.current
      if (!boton) return

      let idFrame = 0
      let objetivoX = 0
      let objetivoY = 0
      const posicion = { x: 0, y: 0 }
      const velocidad = { x: 0, y: 0 }

      const alMoverPuntero = (evento: PointerEvent) => {
        const rect = boton.getBoundingClientRect()
        objetivoX = (evento.clientX - (rect.left + rect.width / 2)) * fuerza
        objetivoY = (evento.clientY - (rect.top + rect.height / 2)) * fuerza
      }

      const alSalirPuntero = () => {
        objetivoX = 0
        objetivoY = 0
      }

      let ultimoTiempo = performance.now()
      const tick = (ahora: number) => {
        const dt = Math.min((ahora - ultimoTiempo) / 1000, PASO_FIJO * MAX_SUBPASOS)
        ultimoTiempo = ahora

        const subpasos = Math.max(1, Math.round(dt / PASO_FIJO))
        const h = dt / subpasos
        for (let i = 0; i < subpasos; i++) {
          const fuerzaX = RIGIDEZ * (objetivoX - posicion.x) - AMORTIGUACION * velocidad.x
          const fuerzaY = RIGIDEZ * (objetivoY - posicion.y) - AMORTIGUACION * velocidad.y
          velocidad.x += (fuerzaX / MASA) * h
          velocidad.y += (fuerzaY / MASA) * h
          posicion.x += velocidad.x * h
          posicion.y += velocidad.y * h
        }

        // Seguro: si por lo que sea la simulación diverge (NaN o una
        // distancia absurda), se corta de raíz en vez de dejar el botón
        // volando fuera de la pantalla.
        if (
          !Number.isFinite(posicion.x) ||
          !Number.isFinite(posicion.y) ||
          Math.hypot(posicion.x, posicion.y) > DISTANCIA_MAXIMA_PX
        ) {
          posicion.x = objetivoX
          posicion.y = objetivoY
          velocidad.x = 0
          velocidad.y = 0
        }

        const enReposo =
          objetivoX === 0 &&
          objetivoY === 0 &&
          Math.hypot(posicion.x, posicion.y) < DISTANCIA_MINIMA_REPOSO &&
          Math.hypot(velocidad.x, velocidad.y) < DISTANCIA_MINIMA_REPOSO

        boton.style.transform = enReposo
          ? ''
          : `translate(${posicion.x.toFixed(2)}px, ${posicion.y.toFixed(2)}px)`

        idFrame = requestAnimationFrame(tick)
      }

      boton.addEventListener('pointermove', alMoverPuntero)
      boton.addEventListener('pointerleave', alSalirPuntero)
      idFrame = requestAnimationFrame(tick)

      return () => {
        boton.removeEventListener('pointermove', alMoverPuntero)
        boton.removeEventListener('pointerleave', alSalirPuntero)
        cancelAnimationFrame(idFrame)
        boton.style.transform = ''
      }
    }, [fuerza, movimientoReducido])

    return (
      <button
        ref={(nodo) => {
          refInterno.current = nodo
          if (typeof refExterno === 'function') refExterno(nodo)
          else if (refExterno) refExterno.current = nodo
        }}
        className={cx(estilos.botonMagnetico, className)}
        {...resto}
      />
    )
  },
)
