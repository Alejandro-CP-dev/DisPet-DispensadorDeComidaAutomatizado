import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'

import { FondoCollageMascota } from '@/shared/componentes/FondoCollageMascota/FondoCollageMascota'
import { cx } from '@/shared/utils/cx'

import estilos from './PaginaAuth.module.css'

interface PaginaAuthProps {
  titulo: string
  subtitulo: string
  children: ReactNode
}

/**
 * Cascarón visual compartido por las páginas de login y registro: fondo con
 * la mascota repartida como collage, enlace para volver al landing y la
 * tarjeta con el logo y el encabezado. `children` recibe el resto del
 * contenido propio de cada página (el formulario, errores, pie, etc.).
 */
export function PaginaAuth({ titulo, subtitulo, children }: PaginaAuthProps) {
  return (
    <div className={estilos.pagina}>
      <FondoCollageMascota />
      <Link to="/" className={estilos.volver}>
        <svg viewBox="0 0 20 20" width="16" height="16" fill="none" aria-hidden="true">
          <path
            d="M12.5 15.5 7 10l5.5-5.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Volver al inicio
      </Link>
      <div className={estilos.tarjeta}>
        <img
          src="/img/logo.png"
          alt="DisPet"
          className={cx(estilos.logo, 'logo-sobre-superficie')}
        />
        <div className={estilos.encabezado}>
          <h1 className={estilos.titulo}>{titulo}</h1>
          <p className={estilos.subtitulo}>{subtitulo}</p>
        </div>
        {children}
      </div>
    </div>
  )
}
