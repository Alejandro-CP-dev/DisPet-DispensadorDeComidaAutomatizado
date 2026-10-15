import { useState } from 'react'
import type { HTMLAttributes } from 'react'

import { cx } from '@/shared/utils/cx'

import estilos from './DestellosTexto.module.css'

const FORMA_DESTELLO =
  'M80 0C80 0 84.2846 41.2925 101.496 58.504C118.707 75.7154 160 80 160 80C160 80 118.707 84.2846' +
  ' 101.496 101.496C84.2846 118.707 80 160 80 160C80 160 75.7154 118.707 58.504 101.496C41.2925' +
  ' 84.2846 0 80 0 80C0 80 41.2925 75.7154 58.504 58.504C75.7154 41.2925 80 0 80 0Z'

interface Destello {
  id: number
  top: string
  left: string
  tamano: number
  retraso: number
  duracion: number
  color: string
}

interface DestellosTextoProps extends HTMLAttributes<HTMLSpanElement> {
  /** Cantidad de destellos a dibujar alrededor del contenido. */
  cantidad?: number
  colorPrimario?: string
  colorSecundario?: string
}

function generarDestellos(
  cantidad: number,
  colorPrimario: string,
  colorSecundario: string,
): Destello[] {
  return Array.from({ length: cantidad }, (_, indice) => ({
    id: indice,
    top: `${String(Math.random() * 100)}%`,
    left: `${String(Math.random() * 100)}%`,
    tamano: 8 + Math.random() * 12,
    retraso: Math.random() * 2,
    duracion: 1.2 + Math.random() * 1.2,
    color: Math.random() > 0.5 ? colorPrimario : colorSecundario,
  }))
}

/**
 * Envuelve su contenido con pequeños destellos animados que titilan en
 * posiciones aleatorias. Adaptado de "Sparkles Text" (21st.dev / Magic UI).
 */
export function DestellosTexto({
  children,
  cantidad = 10,
  colorPrimario = 'var(--marca-500)',
  colorSecundario = 'var(--ink-900)',
  className,
  ...resto
}: DestellosTextoProps) {
  // Inicializador perezoso: Math.random() solo se llama una vez, al montar,
  // en vez de en cada render (la regla de pureza de React no permite llamar
  // funciones impuras directamente en el cuerpo del componente).
  const [destellos] = useState<Destello[]>(() =>
    generarDestellos(cantidad, colorPrimario, colorSecundario),
  )

  return (
    <span className={cx(estilos.raiz, className)} {...resto}>
      {destellos.map((destello) => (
        <svg
          key={destello.id}
          aria-hidden="true"
          viewBox="0 0 160 160"
          className={estilos.destello}
          style={{
            top: destello.top,
            left: destello.left,
            width: destello.tamano,
            height: destello.tamano,
            color: destello.color,
            animationDelay: `${String(destello.retraso)}s`,
            animationDuration: `${String(destello.duracion)}s`,
          }}
        >
          <path d={FORMA_DESTELLO} fill="currentColor" />
        </svg>
      ))}
      {children}
    </span>
  )
}
