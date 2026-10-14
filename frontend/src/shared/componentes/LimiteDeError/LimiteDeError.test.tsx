import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { LimiteDeError } from './LimiteDeError'

function ComponenteQueFalla(): never {
  throw new Error('Fallo de prueba')
}

describe('LimiteDeError', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renderiza a sus hijos cuando no hay error', () => {
    render(
      <LimiteDeError>
        <p>Todo bien</p>
      </LimiteDeError>,
    )
    expect(screen.getByText('Todo bien')).toBeInTheDocument()
  })

  it('muestra el respaldo por defecto cuando un hijo lanza un error', () => {
    render(
      <LimiteDeError>
        <ComponenteQueFalla />
      </LimiteDeError>,
    )

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('Algo salió mal')).toBeInTheDocument()
    expect(screen.getByText('Fallo de prueba')).toBeInTheDocument()
  })

  it('usa el respaldo personalizado cuando se provee', () => {
    render(
      <LimiteDeError
        respaldo={(reintentar) => <button onClick={reintentar}>Volver a intentar</button>}
      >
        <ComponenteQueFalla />
      </LimiteDeError>,
    )

    expect(screen.getByRole('button', { name: 'Volver a intentar' })).toBeInTheDocument()
  })

  it('Reintentar vuelve a renderizar a los hijos', async () => {
    const usuario = userEvent.setup()
    let fallar = true

    function Hijo() {
      if (fallar) throw new Error('Fallo de prueba')
      return <p>Recuperado</p>
    }

    render(
      <LimiteDeError
        respaldo={(reintentar) => (
          <button
            onClick={() => {
              fallar = false
              reintentar()
            }}
          >
            Reintentar
          </button>
        )}
      >
        <Hijo />
      </LimiteDeError>,
    )

    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument()

    await usuario.click(screen.getByRole('button', { name: 'Reintentar' }))

    expect(screen.getByText('Recuperado')).toBeInTheDocument()
  })
})
