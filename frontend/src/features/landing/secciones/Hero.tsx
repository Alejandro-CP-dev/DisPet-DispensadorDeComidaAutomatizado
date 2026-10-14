import { useMediaQuery } from '@/shared/hooks/useMediaQuery'
import { useScrollProgress } from '@/shared/hooks/useScrollProgress'
import { cx } from '@/shared/utils/cx'

import estilos from './Hero.module.css'

function irAEscena() {
  document.getElementById('escena')?.scrollIntoView({ behavior: 'smooth' })
}

export function Hero() {
  const scrollY = useScrollProgress()
  const movimientoReducido = useMediaQuery('(prefers-reduced-motion: reduce)')
  const desplazamiento = movimientoReducido ? 0 : scrollY * 0.08

  return (
    <section className={estilos.hero}>
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

      <img src="/img/logo.png" alt="DisPet" className={cx(estilos.logo, 'logo-sobre-superficie')} />
      <h1 className={estilos.titulo}>Tu mascota come a tiempo, estés donde estés</h1>
      <div className={estilos.acciones}>
        <button type="button" className={estilos.botonPrimario} onClick={irAEscena}>
          Ver la demo
        </button>
        <button type="button" className={estilos.botonSecundario} onClick={irAEscena}>
          Cómo funciona
        </button>
      </div>
    </section>
  )
}
