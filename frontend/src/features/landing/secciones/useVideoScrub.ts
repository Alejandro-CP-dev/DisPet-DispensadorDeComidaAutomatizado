import { useEffect, useState } from 'react'
import type { RefObject } from 'react'

import { useMediaQuery } from '@/shared/hooks/useMediaQuery'

function limitar(valor: number, minimo: number, maximo: number): number {
  return Math.min(Math.max(valor, minimo), maximo)
}

export function useVideoScrub(
  refContenedor: RefObject<HTMLDivElement | null>,
  refVideo: RefObject<HTMLVideoElement | null>,
): number {
  const [progreso, setProgreso] = useState(0)
  const movimientoReducido = useMediaQuery('(prefers-reduced-motion: reduce)')

  useEffect(() => {
    if (movimientoReducido) return

    let frameId: number

    function leer() {
      const contenedor = refContenedor.current
      const video = refVideo.current
      if (contenedor) {
        const rect = contenedor.getBoundingClientRect()
        const total = rect.height - window.innerHeight
        const avanzado = limitar(-rect.top, 0, total)
        const nuevoProgreso = total > 0 ? avanzado / total : 0
        setProgreso(nuevoProgreso)

        if (video && !Number.isNaN(video.duration)) {
          video.currentTime = nuevoProgreso * video.duration
        }
      }
      frameId = requestAnimationFrame(leer)
    }

    frameId = requestAnimationFrame(leer)
    return () => {
      cancelAnimationFrame(frameId)
    }
  }, [refContenedor, refVideo, movimientoReducido])

  return progreso
}
