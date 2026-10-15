import { useRef } from 'react'

import { BotonMagnetico } from '@/shared/componentes/BotonMagnetico/BotonMagnetico'
import { DestellosTexto } from '@/shared/componentes/DestellosTexto/DestellosTexto'
import { Spotlight } from '@/shared/componentes/Spotlight/Spotlight'
import { useMediaQuery } from '@/shared/hooks/useMediaQuery'
import { useScrollProgress } from '@/shared/hooks/useScrollProgress'
import { cx } from '@/shared/utils/cx'

import estilos from './Hero.module.css'
import { useHuellasCursor } from './useHuellasCursor'

function irAEscena() {
  document.getElementById('escena')?.scrollIntoView({ behavior: 'smooth' })
}

export function Hero() {
  const refHero = useRef<HTMLElement>(null)
  const scrollY = useScrollProgress()
  const movimientoReducido = useMediaQuery('(prefers-reduced-motion: reduce)')
  const desplazamiento = movimientoReducido ? 0 : scrollY * 0.08
  useHuellasCursor(refHero)

  return (
    <section className={estilos.hero} ref={refHero}>
      <Spotlight />
      <img
        src="/img/perro.png"
        alt=""
        className={cx(estilos.fondoDecorativo, estilos.perro)}
        style={{ transform: `rotate(-5deg) translateY(${String(-desplazamiento)}px)` }}
      />
      <img
        src="/img/gato.png"
        alt=""
        className={cx(estilos.fondoDecorativo, estilos.gato)}
        style={{ transform: `rotate(5deg) translateY(${String(-desplazamiento)}px)` }}
      />

      <DestellosTexto cantidad={10}>
        <img
          src="/img/logo.png"
          alt="DisPet"
          className={cx(estilos.logo, 'logo-sobre-superficie')}
        />
      </DestellosTexto>
      <h1 className={estilos.titulo}>Tu mascota come a tiempo, estés donde estés</h1>
      <div className={estilos.acciones}>
        <BotonMagnetico type="button" className={estilos.botonPrimario} onClick={irAEscena}>
          Ver la demo
        </BotonMagnetico>
        <BotonMagnetico type="button" className={estilos.botonSecundario} onClick={irAEscena}>
          Cómo funciona
        </BotonMagnetico>
      </div>
    </section>
  )
}
