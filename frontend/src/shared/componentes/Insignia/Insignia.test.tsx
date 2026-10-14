import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Insignia } from './Insignia'

describe('Insignia', () => {
  it('siempre muestra el texto, nunca solo color', () => {
    render(<Insignia tono="error">Fallida</Insignia>)
    expect(screen.getByText('Fallida')).toBeInTheDocument()
  })

  it.each([
    ['exito', 'Exitosa'],
    ['error', 'Fallida'],
    ['alerta', 'Nivel bajo'],
    ['neutral', 'Desconectado'],
  ] as const)('renderiza el tono %s con su texto', (tono, texto) => {
    render(<Insignia tono={tono}>{texto}</Insignia>)
    expect(screen.getByText(texto)).toBeInTheDocument()
  })
})
