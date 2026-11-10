import { Children } from 'react'
import type { ReactNode } from 'react'

import { AnimatedCard } from './AnimatedCard'
import estilos from './AnimatedCardGrid.module.css'
import { cx } from '@/shared/utils/cx'

interface AnimatedCardGridProps {
  children: ReactNode
  className?: string
  retrasoEntreTarjetas?: number
}

export function AnimatedCardGrid({
  children,
  className,
  retrasoEntreTarjetas = 80,
}: AnimatedCardGridProps) {
  return (
    <div className={cx(estilos.grid, className)}>
      {Children.map(children, (child, indice) => (
        <AnimatedCard retrasoEntrada={indice * retrasoEntreTarjetas}>{child}</AnimatedCard>
      ))}
    </div>
  )
}
