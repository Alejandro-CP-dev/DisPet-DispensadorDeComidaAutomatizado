import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Modal } from './Modal'

describe('Modal', () => {
  it('no renderiza nada cuando está cerrada', () => {
    render(
      <Modal abierto={false} alCerrar={vi.fn()} titulo="Confirmar">
        Contenido
      </Modal>,
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('muestra el título y el contenido cuando está abierta', () => {
    render(
      <Modal abierto alCerrar={vi.fn()} titulo="Confirmar dispensación">
        ¿Dispensar ahora?
      </Modal>,
    )
    expect(screen.getByRole('dialog', { name: 'Confirmar dispensación' })).toBeInTheDocument()
    expect(screen.getByText('¿Dispensar ahora?')).toBeInTheDocument()
  })

  it('llama a alCerrar al presionar Escape', async () => {
    const alCerrar = vi.fn()
    const usuario = userEvent.setup()
    render(
      <Modal abierto alCerrar={alCerrar} titulo="Confirmar">
        Contenido
      </Modal>,
    )

    await usuario.keyboard('{Escape}')

    expect(alCerrar).toHaveBeenCalledTimes(1)
  })

  it('llama a alCerrar al hacer clic en el botón de cerrar', async () => {
    const alCerrar = vi.fn()
    const usuario = userEvent.setup()
    render(
      <Modal abierto alCerrar={alCerrar} titulo="Confirmar">
        Contenido
      </Modal>,
    )

    await usuario.click(screen.getByRole('button', { name: 'Cerrar' }))

    expect(alCerrar).toHaveBeenCalledTimes(1)
  })

  it('enfoca el contenido al abrirse, para navegación por teclado', () => {
    render(
      <Modal abierto alCerrar={vi.fn()} titulo="Confirmar">
        Contenido
      </Modal>,
    )
    expect(screen.getByRole('dialog')).toHaveFocus()
  })
})
