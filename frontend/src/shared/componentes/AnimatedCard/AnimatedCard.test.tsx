import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { render, screen } from '@testing-library/react'

import { AnimatedCardGrid } from './AnimatedCardGrid'

describe('AnimatedCardGrid', () => {
  it('envuelve cada tarjeta y escalona su animación de entrada', () => {
    const { container } = render(
      <AnimatedCardGrid retrasoEntreTarjetas={75}>
        <span>Comida</span>
        <span>Dispensador</span>
        <span>Mascota</span>
      </AnimatedCardGrid>,
    )

    expect(screen.getAllByRole('group')).toHaveLength(3)
    expect(screen.getByText('Comida')).toBeInTheDocument()
    expect(screen.getByText('Dispensador')).toBeInTheDocument()
    expect(screen.getByText('Mascota')).toBeInTheDocument()
    expect(
      Array.from(container.querySelectorAll<HTMLElement>('[class*="contenido"]')).map(
        (contenido) => contenido.style.animationDelay,
      ),
    ).toEqual(['0ms', '75ms', '150ms'])
  })

  it('permite enfocar las tarjetas con teclado', async () => {
    const user = userEvent.setup()
    render(
      <AnimatedCardGrid>
        <span>Primera</span>
        <span>Segunda</span>
      </AnimatedCardGrid>,
    )
    const tarjetas = screen.getAllByRole('group')

    await user.tab()
    expect(tarjetas[0]).toHaveFocus()
    await user.tab()
    expect(tarjetas[1]).toHaveFocus()
  })
})
