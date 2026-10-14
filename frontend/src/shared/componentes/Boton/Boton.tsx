import { forwardRef } from 'react'
import type { ButtonHTMLAttributes } from 'react'

import { cx } from '@/shared/utils/cx'

import { Spinner } from '../Spinner/Spinner'
import estilos from './Boton.module.css'

export type VarianteBoton = 'primario' | 'secundario' | 'fantasma' | 'peligro'
export type TamanoBoton = 'mediano' | 'chico'

interface BotonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: VarianteBoton
  tamano?: TamanoBoton
  cargando?: boolean
}

const colorSpinnerPorVariante: Record<VarianteBoton, string> = {
  primario: 'var(--ink-900)',
  secundario: 'var(--ink-900)',
  fantasma: 'var(--marca-700)',
  peligro: 'var(--surface-200)',
}

export const Boton = forwardRef<HTMLButtonElement, BotonProps>(function Boton(
  {
    variante = 'primario',
    tamano = 'mediano',
    cargando = false,
    disabled,
    className,
    children,
    type = 'button',
    ...resto
  },
  ref,
) {
  const clases = cx(
    estilos.boton,
    estilos[variante],
    estilos[tamano],
    cargando && estilos.cargando,
    className,
  )

  return (
    <button
      ref={ref}
      type={type}
      className={clases}
      disabled={Boolean(disabled) || cargando}
      aria-busy={cargando}
      {...resto}
    >
      {children}
      {cargando && (
        <span className={estilos.spinnerCargando}>
          <Spinner tamano="chico" color={colorSpinnerPorVariante[variante]} />
        </span>
      )}
    </button>
  )
})
