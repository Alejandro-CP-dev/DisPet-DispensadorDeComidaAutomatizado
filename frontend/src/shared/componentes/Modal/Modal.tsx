import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import type { ReactNode } from 'react'

import estilos from './Modal.module.css'

interface ModalProps {
  abierto: boolean
  alCerrar: () => void
  titulo: string
  children: ReactNode
  pie?: ReactNode
}

export function Modal({ abierto, alCerrar, titulo, children, pie }: ModalProps) {
  const idTitulo = useId()
  const refContenido = useRef<HTMLDivElement>(null)
  const refElementoPrevio = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!abierto) return

    refElementoPrevio.current = document.activeElement as HTMLElement | null
    refContenido.current?.focus()

    const bodyOverflowPrevio = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function alPresionarTecla(evento: KeyboardEvent) {
      if (evento.key === 'Escape') {
        alCerrar()
      }
    }

    document.addEventListener('keydown', alPresionarTecla)

    return () => {
      document.body.style.overflow = bodyOverflowPrevio
      document.removeEventListener('keydown', alPresionarTecla)
      refElementoPrevio.current?.focus()
    }
  }, [abierto, alCerrar])

  if (!abierto) return null

  return createPortal(
    <div className={estilos.fondo} onClick={alCerrar}>
      <div
        ref={refContenido}
        className={estilos.contenido}
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitulo}
        tabIndex={-1}
        onClick={(evento) => {
          evento.stopPropagation()
        }}
      >
        <div className={estilos.encabezado}>
          <h2 id={idTitulo} className={estilos.titulo}>
            {titulo}
          </h2>
          <button type="button" className={estilos.cerrar} aria-label="Cerrar" onClick={alCerrar}>
            ×
          </button>
        </div>
        <div className={estilos.cuerpo}>{children}</div>
        {pie && <div className={estilos.pie}>{pie}</div>}
      </div>
    </div>,
    document.body,
  )
}
