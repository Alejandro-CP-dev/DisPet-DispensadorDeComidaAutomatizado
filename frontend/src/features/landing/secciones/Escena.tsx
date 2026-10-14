import { useRef } from 'react'

import { useMediaQuery } from '@/shared/hooks/useMediaQuery'
import { cx } from '@/shared/utils/cx'

import estilos from './Escena.module.css'
import { useVideoScrub } from './useVideoScrub'

export function Escena() {
  const refContenedor = useRef<HTMLDivElement>(null)
  const refVideo = useRef<HTMLVideoElement>(null)
  const movimientoReducido = useMediaQuery('(prefers-reduced-motion: reduce)')
  const progreso = useVideoScrub(refContenedor, refVideo)

  const video = (
    <video
      ref={refVideo}
      className={estilos.video}
      src="/video/escena.mp4"
      muted
      playsInline
      preload="auto"
      loop={movimientoReducido}
      autoPlay={movimientoReducido}
    />
  )

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
        {video}
        {panelQueEs}
        {panelPorQue}
      </section>
    )
  }

  return (
    <section id="escena" ref={refContenedor} className={estilos.escena}>
      <div className={estilos.sticky}>
        {video}
        {panelQueEs}
        {panelPorQue}
      </div>
    </section>
  )
}
