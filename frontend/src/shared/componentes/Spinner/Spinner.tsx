import type { CSSProperties } from 'react'

import { cx } from '@/shared/utils/cx'

import estilos from './Spinner.module.css'

export type TamanoSpinner = 'chico' | 'mediano' | 'grande'

interface SpinnerProps {
  tamano?: TamanoSpinner
  etiqueta?: string
  color?: string
}

export function Spinner({ tamano = 'mediano', etiqueta = 'Cargando', color }: SpinnerProps) {
  const estilo: CSSProperties | undefined = color ? { color } : undefined

  return (
    <span role="status">
      <span className={cx(estilos.spinner, estilos[tamano])} style={estilo} aria-hidden="true" />
      <span className={estilos.oculto}>{etiqueta}</span>
    </span>
  )
}
