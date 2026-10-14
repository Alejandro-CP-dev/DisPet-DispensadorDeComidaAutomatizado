import { useCallback, useRef } from 'react'

import { useMediaQuery } from '@/shared/hooks/useMediaQuery'
import { cx } from '@/shared/utils/cx'

import estilos from './Escena.module.css'
import { useImageSequenceScrub } from './useImageSequenceScrub'

const TOTAL_FRAMES = 123
const rutaFrame = (indice: number) =>
  `/img/escena-frames/frame-${String(indice + 1).padStart(3, '0')}.webp`

export function Escena() {
  const refContenedor = useRef<HTMLDivElement>(null)
  const refCanvas = useRef<HTMLCanvasElement>(null)
  const movimientoReducido = useMediaQuery('(prefers-reduced-motion: reduce)')
  const { progreso } = useImageSequenceScrub(refContenedor, refCanvas, {
    totalFrames: TOTAL_FRAMES,
    rutaFrame: useCallback((indice: number) => rutaFrame(indice), []),
  })

  const panelQueEs = (
    <div className={cx(estilos.panel, estilos.panelIzquierda, progreso < 0.5 && estilos.visible)}>
      <h2>¿Qué es DisPet?</h2>
      <p>
        Un dispensador automático que programa las porciones de tu mascota por horario y gramos
        exactos, y te avisa cuando el alimento está por acabarse.
      </p>
    </div>
  )

  const panelPorQue = (
    <div className={cx(estilos.panel, estilos.panelDerecha, progreso >= 0.5 && estilos.visible)}>
      <h2>¿Por qué DisPet?</h2>
      <p>
        Porque viajar, trabajar fuera o simplemente olvidarte un día no debería significar que tu
        mascota coma tarde. Todo se controla desde tu teléfono, estés donde estés.
      </p>
    </div>
  )

  if (movimientoReducido) {
    return (
      <section id="escena" className={cx(estilos.escena, estilos.estatico)}>
        <img className={estilos.video} src={rutaFrame(TOTAL_FRAMES - 1)} alt="" />
        {panelQueEs}
        {panelPorQue}
      </section>
    )
  }

  return (
    <section id="escena" ref={refContenedor} className={estilos.escena}>
      <div className={estilos.sticky}>
        <canvas ref={refCanvas} className={estilos.video} />
        {panelQueEs}
        {panelPorQue}
      </div>
    </section>
  )
}
