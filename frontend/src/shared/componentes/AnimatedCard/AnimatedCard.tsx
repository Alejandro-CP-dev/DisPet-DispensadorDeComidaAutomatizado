import type { ReactNode } from 'react'

import { cx } from '@/shared/utils/cx'

import estilos from './AnimatedCard.module.css'

interface AnimatedCardProps {
  children: ReactNode
  className?: string
  ariaLabel?: string
  retrasoEntrada?: number
}

export function AnimatedCard({
  children,
  className,
  ariaLabel,
  retrasoEntrada = 0,
}: AnimatedCardProps) {
  return (
    <div
      className={cx(estilos.tarjeta, className)}
      role="group"
      aria-label={ariaLabel}
      tabIndex={0}
    >
      <div className={estilos.contenido} style={{ animationDelay: `${String(retrasoEntrada)}ms` }}>
        {children}
      </div>
    </div>
  )
}
