import type { ReactNode } from 'react'

import estilos from './EstadoVacio.module.css'

export type TonoEstadoVacio = 'vacio' | 'error'

interface EstadoVacioProps {
  titulo: string
  descripcion?: string
  accion?: ReactNode
  tono?: TonoEstadoVacio
}

function IconoCaja() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 8l9-5 9 5-9 5-9-5Zm0 0v8l9 5m0-13v13m9-13v8l-9 5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconoAlerta() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3 1 21h22L12 3Zm0 7v5m0 3h.01"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function EstadoVacio({ titulo, descripcion, accion, tono = 'vacio' }: EstadoVacioProps) {
  return (
    <div className={estilos.contenedor} role={tono === 'error' ? 'alert' : undefined}>
      <div className={tono === 'error' ? estilos.iconoError : estilos.icono}>
        {tono === 'error' ? <IconoAlerta /> : <IconoCaja />}
      </div>
      <h3 className={estilos.titulo}>{titulo}</h3>
      {descripcion && <p className={estilos.descripcion}>{descripcion}</p>}
      {accion && <div className={estilos.accion}>{accion}</div>}
    </div>
  )
}
