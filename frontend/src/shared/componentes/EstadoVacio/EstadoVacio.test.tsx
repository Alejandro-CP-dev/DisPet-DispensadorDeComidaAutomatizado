import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { EstadoVacio } from './EstadoVacio'

describe('EstadoVacio', () => {
  it('muestra el título y la descripción', () => {
    render(<EstadoVacio titulo="Todavía no hay mascotas" descripcion="Agrega la primera." />)

    expect(screen.getByRole('heading', { name: 'Todavía no hay mascotas' })).toBeInTheDocument()
    expect(screen.getByText('Agrega la primera.')).toBeInTheDocument()
  })

  it('marca el tono error con role="alert" para que los lectores de pantalla lo anuncien', () => {
    render(<EstadoVacio tono="error" titulo="No se pudo cargar" />)
    expect(screen.getByRole('alert')).toHaveTextContent('No se pudo cargar')
  })

  it('el tono vacío (por defecto) no usa role="alert"', () => {
    render(<EstadoVacio titulo="Sin datos" />)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('muestra la acción cuando se provee', () => {
    render(<EstadoVacio titulo="Sin datos" accion={<button type="button">Reintentar</button>} />)
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument()
  })
})
