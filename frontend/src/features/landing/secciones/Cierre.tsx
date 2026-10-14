import { Link } from 'react-router-dom'

import { useMediaQuery } from '@/shared/hooks/useMediaQuery'

import estilos from './Cierre.module.css'

export function Cierre() {
  const movimientoReducido = useMediaQuery('(prefers-reduced-motion: reduce)')

  return (
    <section className={estilos.seccion}>
      <video
        className={estilos.video}
        src="/video/phone.mp4"
        muted
        playsInline
        preload="auto"
        autoPlay={!movimientoReducido}
        loop={!movimientoReducido}
      />
      <div className={estilos.capa} aria-hidden="true" />
      <div className={estilos.contenido}>
        <h2 className={estilos.titulo}>Pruébalo con la app real</h2>
        <Link to="/login" className={estilos.boton}>
          Iniciar sesión
        </Link>
      </div>
    </section>
  )
}
