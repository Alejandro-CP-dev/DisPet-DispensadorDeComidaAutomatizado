import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { Select } from './Select'

const opciones = [
  { valor: 'perro', etiqueta: 'Perro' },
  { valor: 'gato', etiqueta: 'Gato' },
]

describe('Select', () => {
  it('asocia la etiqueta y muestra las opciones', () => {
    render(<Select label="Especie" opciones={opciones} />)

    const select = screen.getByLabelText('Especie')
    expect(select).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Perro' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Gato' })).toBeInTheDocument()
  })

  it('muestra el placeholder como una opción deshabilitada', () => {
    render(<Select label="Especie" opciones={opciones} placeholder="Selecciona una especie" />)

    const placeholder = screen.getByRole('option', { name: 'Selecciona una especie' })
    expect(placeholder).toBeDisabled()
  })

  it('permite elegir una opción', async () => {
    const usuario = userEvent.setup()
    render(<Select label="Especie" opciones={opciones} />)

    await usuario.selectOptions(screen.getByLabelText('Especie'), 'gato')

    expect(screen.getByLabelText('Especie')).toHaveValue('gato')
  })

  it('muestra el mensaje de error', () => {
    render(<Select label="Especie" opciones={opciones} error="Selecciona una especie." />)
    expect(screen.getByRole('alert')).toHaveTextContent('Selecciona una especie.')
  })
})
