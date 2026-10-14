import { forwardRef, useId } from 'react'
import type { InputHTMLAttributes } from 'react'

import { cx } from '@/shared/utils/cx'

import estilos from './Campo.module.css'

interface CampoProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  ayuda?: string
}

export const Campo = forwardRef<HTMLInputElement, CampoProps>(function Campo(
  { label, error, ayuda, id, required, className, ...resto },
  ref,
) {
  const idGenerado = useId()
  const idCampo = id ?? idGenerado
  const idError = `${idCampo}-error`
  const idAyuda = `${idCampo}-ayuda`
  const describedBy =
    [error && idError, ayuda && !error && idAyuda].filter(Boolean).join(' ') || undefined

  return (
    <div className={estilos.contenedor}>
      <label htmlFor={idCampo} className={estilos.etiqueta}>
        {label}
        {required && (
          <span className={estilos.requerido} aria-hidden="true">
            *
          </span>
        )}
      </label>
      <input
        ref={ref}
        id={idCampo}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cx(estilos.input, error && estilos.inputError, className)}
        {...resto}
      />
      {ayuda && !error && (
        <p id={idAyuda} className={estilos.ayuda}>
          {ayuda}
        </p>
      )}
      {error && (
        <p id={idError} role="alert" className={estilos.error}>
          {error}
        </p>
      )}
    </div>
  )
})
