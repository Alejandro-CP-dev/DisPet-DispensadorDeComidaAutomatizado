import { useEffect, useRef } from 'react'

import { useMediaQuery } from '@/shared/hooks/useMediaQuery'
import { cx } from '@/shared/utils/cx'

import estilos from './Spotlight.module.css'

interface SpotlightProps {
  /** Diámetro del resplandor, en px. */
  tamano?: number
  className?: string
}

/**
 * Resplandor radial que sigue al cursor dentro de su elemento padre (que debe
 * tener `position: relative`). Adaptado de "Spotlight" (21st.dev / ibelick).
 */
export function Spotlight({ tamano = 420, className }: SpotlightProps) {
  const refSpotlight = useRef<HTMLDivElement>(null)
  const movimientoReducido = useMediaQuery('(prefers-reduced-motion: reduce)')

  useEffect(() => {
    if (movimientoReducido) return
    const spotlight = refSpotlight.current
    const contenedor = spotlight?.parentElement
    if (!spotlight || !contenedor) return

    const alMoverPuntero = (evento: PointerEvent) => {
      const rect = contenedor.getBoundingClientRect()
      spotlight.style.left = `${String(evento.clientX - rect.left)}px`
      spotlight.style.top = `${String(evento.clientY - rect.top)}px`
    }
    const mostrar = () => {
      spotlight.style.opacity = '1'
    }
    const ocultar = () => {
      spotlight.style.opacity = '0'
    }

    contenedor.addEventListener('pointermove', alMoverPuntero)
    contenedor.addEventListener('pointerenter', mostrar)
    contenedor.addEventListener('pointerleave', ocultar)
    return () => {
      contenedor.removeEventListener('pointermove', alMoverPuntero)
      contenedor.removeEventListener('pointerenter', mostrar)
      contenedor.removeEventListener('pointerleave', ocultar)
    }
  }, [movimientoReducido])

  if (movimientoReducido) return null

  return (
    <div
      ref={refSpotlight}
      aria-hidden="true"
      className={cx(estilos.spotlight, className)}
      style={{ width: tamano, height: tamano }}
    />
  )
}
