import { forwardRef, useId, useState } from 'react'
import type { InputHTMLAttributes } from 'react'

import { cx } from '@/shared/utils/cx'

import estilos from './Campo.module.css'

interface CampoProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  ayuda?: string
  permitirVerContrasena?: boolean
}

export const Campo = forwardRef<HTMLInputElement, CampoProps>(function Campo(
  { label, error, ayuda, id, required, className, permitirVerContrasena, type, ...resto },
  ref,
) {
  const idGenerado = useId()
  const idCampo = id ?? idGenerado
  const idError = `${idCampo}-error`
  const idAyuda = `${idCampo}-ayuda`
  const [mostrarContrasena, setMostrarContrasena] = useState(false)
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
      <div
        className={
          permitirVerContrasena && type === 'password' ? estilos.entradaConControl : undefined
        }
      >
        <input
          ref={ref}
          id={idCampo}
          type={mostrarContrasena ? 'text' : type}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cx(estilos.input, error && estilos.inputError, className)}
          {...resto}
        />
        {permitirVerContrasena && type === 'password' && (
          <button
            type="button"
            className={estilos.alternarVisibilidad}
            aria-label={mostrarContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            aria-pressed={mostrarContrasena}
            onClick={() => {
              setMostrarContrasena((visible) => !visible)
            }}
          >
            {mostrarContrasena ? (
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                <path d="M9.9 5.2A10.7 10.7 0 0 1 12 5c5.5 0 9 7 9 7a15 15 0 0 1-3.1 3.8M6.2 6.2C3.9 7.7 3 12 3 12s3.5 7 9 7a9.9 9.9 0 0 0 2.4-.3" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M3 12s3.5-7 9-7 9 7 9 7-3.5 7-9 7-9-7-9-7Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        )}
      </div>
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
