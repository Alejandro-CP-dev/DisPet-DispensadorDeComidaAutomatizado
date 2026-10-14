import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Boton } from './Boton'

describe('Boton', () => {
  it('llama a onClick al hacer clic', async () => {
    const alHacerClic = vi.fn()
    const usuario = userEvent.setup()
    render(<Boton onClick={alHacerClic}>Guardar</Boton>)

    await usuario.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(alHacerClic).toHaveBeenCalledTimes(1)
  })

  it('es del tipo "button" por defecto, para no enviar formularios por accidente', () => {
    render(<Boton>Acción</Boton>)
    expect(screen.getByRole('button', { name: 'Acción' })).toHaveAttribute('type', 'button')
  })

  it('se deshabilita y no dispara onClick cuando está cargando', async () => {
    const alHacerClic = vi.fn()
    const usuario = userEvent.setup()
    render(
      <Boton cargando onClick={alHacerClic}>
        Guardar
      </Boton>,
    )

    // El nombre accesible incluye el texto oculto "Cargando" para lectores de pantalla.
    const boton = screen.getByRole('button', { name: 'Guardar Cargando' })
    expect(boton).toBeDisabled()
    expect(boton).toHaveAttribute('aria-busy', 'true')

    await usuario.click(boton)
    expect(alHacerClic).not.toHaveBeenCalled()
  })

  it('respeta disabled explícito', () => {
    render(<Boton disabled>Eliminar</Boton>)
    expect(screen.getByRole('button', { name: 'Eliminar' })).toBeDisabled()
  })
})
