import type { ReactNode } from 'react'

import { cx } from '@/shared/utils/cx'

import estilos from './Insignia.module.css'

export type TonoInsignia = 'exito' | 'error' | 'alerta' | 'neutral'

interface InsigniaProps {
  tono: TonoInsignia
  children: ReactNode
}

export function Insignia({ tono, children }: InsigniaProps) {
  return (
    <span className={cx(estilos.insignia, estilos[tono])}>
      <span className={estilos.punto} aria-hidden="true" />
      {children}
    </span>
  )
}
