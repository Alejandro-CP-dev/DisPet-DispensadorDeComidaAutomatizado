import { forwardRef, useId } from 'react'
import type { SelectHTMLAttributes } from 'react'

import { cx } from '@/shared/utils/cx'

import estilos from './Select.module.css'

export interface OpcionSelect {
  valor: string
  etiqueta: string
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  opciones: OpcionSelect[]
  placeholder?: string
  error?: string
  ayuda?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, opciones, placeholder, error, ayuda, id, required, className, defaultValue, ...resto },
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
      <select
        ref={ref}
        id={idCampo}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        defaultValue={defaultValue ?? (placeholder ? '' : undefined)}
        className={cx(estilos.select, error && estilos.selectError, className)}
        {...resto}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {opciones.map((opcion) => (
          <option key={opcion.valor} value={opcion.valor}>
            {opcion.etiqueta}
          </option>
        ))}
      </select>
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
