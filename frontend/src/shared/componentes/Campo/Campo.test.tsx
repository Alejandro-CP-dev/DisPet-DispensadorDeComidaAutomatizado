import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { describe, expect, it } from 'vitest'

import { Campo } from './Campo'

describe('Campo', () => {
  it('asocia la etiqueta con el input', () => {
    render(<Campo label="Nombre" />)
    expect(screen.getByLabelText('Nombre')).toBeInTheDocument()
  })

  it('permite escribir en el input', async () => {
    const usuario = userEvent.setup()
    render(<Campo label="Nombre" />)

    await usuario.type(screen.getByLabelText('Nombre'), 'Luna')

    expect(screen.getByLabelText('Nombre')).toHaveValue('Luna')
  })

  it('muestra el mensaje de error y marca el input como inválido', () => {
    render(<Campo label="Correo" error="Ingresa un correo válido." />)

    const input = screen.getByLabelText('Correo')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByRole('alert')).toHaveTextContent('Ingresa un correo válido.')
    expect(input).toHaveAccessibleDescription('Ingresa un correo válido.')
  })

  it('muestra la ayuda solo cuando no hay error', () => {
    const { rerender } = render(<Campo label="Peso" ayuda="En kilogramos" />)
    expect(screen.getByText('En kilogramos')).toBeInTheDocument()

    rerender(<Campo label="Peso" ayuda="En kilogramos" error="Requerido" />)
    expect(screen.queryByText('En kilogramos')).not.toBeInTheDocument()
  })

  it('reenvía la ref al elemento input, necesario para react-hook-form', () => {
    const ref = createRef<HTMLInputElement>()
    render(<Campo label="Nombre" ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
  })
})
