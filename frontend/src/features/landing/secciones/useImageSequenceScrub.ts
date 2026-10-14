import { useEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'

function limitar(valor: number, minimo: number, maximo: number): number {
  return Math.min(Math.max(valor, minimo), maximo)
}

interface OpcionesSecuencia {
  totalFrames: number
  rutaFrame: (indice: number) => string
}

interface ResultadoSecuencia {
  progreso: number
  listo: boolean
}

/**
 * Sincroniza el scroll de un contenedor con una secuencia de imágenes dibujadas
 * en un canvas (al estilo Apple), en vez de hacer seek sobre un <video>: evita el
 * throttling/latencia de decodificación que hace que el scrubbing de video se vea
 * entrecortado.
 */
export function useImageSequenceScrub(
  refContenedor: RefObject<HTMLDivElement | null>,
  refCanvas: RefObject<HTMLCanvasElement | null>,
  { totalFrames, rutaFrame }: OpcionesSecuencia,
): ResultadoSecuencia {
  const [progreso, setProgreso] = useState(0)
  const [listo, setListo] = useState(false)
  const frameDibujadoRef = useRef(-1)

  useEffect(() => {
    let cancelado = false
    const imagenes = new Array<HTMLImageElement>(totalFrames)
    const cargadas = new Array<boolean>(totalFrames).fill(false)

    function frameCercanoCargado(objetivo: number): number {
      if (cargadas[objetivo]) return objetivo
      for (let distancia = 1; distancia < totalFrames; distancia++) {
        const antes = objetivo - distancia
        const despues = objetivo + distancia
        if (antes >= 0 && cargadas[antes]) return antes
        if (despues < totalFrames && cargadas[despues]) return despues
      }
      return -1
    }

    function dibujar(indice: number) {
      const canvas = refCanvas.current
      const imagen = imagenes[indice]
      if (!canvas || !imagen) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const dpr = window.devicePixelRatio || 1
      const anchoPx = Math.round(canvas.clientWidth * dpr)
      const altoPx = Math.round(canvas.clientHeight * dpr)
      if (anchoPx === 0 || altoPx === 0) return
      if (canvas.width !== anchoPx || canvas.height !== altoPx) {
        canvas.width = anchoPx
        canvas.height = altoPx
      }

      const escala = Math.max(anchoPx / imagen.naturalWidth, altoPx / imagen.naturalHeight)
      const anchoDestino = imagen.naturalWidth * escala
      const altoDestino = imagen.naturalHeight * escala
      const x = (anchoPx - anchoDestino) / 2
      const y = (altoPx - altoDestino) / 2

      ctx.clearRect(0, 0, anchoPx, altoPx)
      ctx.drawImage(imagen, x, y, anchoDestino, altoDestino)
      frameDibujadoRef.current = indice
    }

    function dibujarFrameMasCercano(objetivo: number) {
      const indice = frameCercanoCargado(objetivo)
      if (indice !== -1 && indice !== frameDibujadoRef.current) {
        dibujar(indice)
      }
    }

    // Precarga: dispara todas las peticiones a la vez y deja que el navegador
    // priorice la conexión; el primer frame queda listo casi de inmediato.
    for (let indice = 0; indice < totalFrames; indice++) {
      const imagen = new Image()
      imagen.decoding = 'async'
      imagen.onload = () => {
        if (cancelado) return
        imagenes[indice] = imagen
        cargadas[indice] = true
        if (indice === 0) {
          dibujarFrameMasCercano(0)
          setListo(true)
        }
      }
      imagen.src = rutaFrame(indice)
    }

    let frameId: number

    function leerScroll() {
      const contenedor = refContenedor.current
      if (contenedor) {
        const rect = contenedor.getBoundingClientRect()
        const total = rect.height - window.innerHeight
        const avanzado = limitar(-rect.top, 0, total)
        const nuevoProgreso = total > 0 ? avanzado / total : 0
        setProgreso(nuevoProgreso)
        dibujarFrameMasCercano(Math.round(nuevoProgreso * (totalFrames - 1)))
      }
      frameId = requestAnimationFrame(leerScroll)
    }
    frameId = requestAnimationFrame(leerScroll)

    function alRedimensionar() {
      if (frameDibujadoRef.current >= 0) dibujar(frameDibujadoRef.current)
    }
    window.addEventListener('resize', alRedimensionar)

    return () => {
      cancelado = true
      cancelAnimationFrame(frameId)
      window.removeEventListener('resize', alRedimensionar)
    }
  }, [refContenedor, refCanvas, totalFrames, rutaFrame])

  return { progreso, listo }
}
