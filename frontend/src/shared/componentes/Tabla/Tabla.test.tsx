import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Tabla } from './Tabla'
import type { ColumnaTabla } from './Tabla'

interface Fila {
  id: string
  nombre: string
  gramos: number
}

const columnas: ColumnaTabla<Fila>[] = [
  { clave: 'nombre', encabezado: 'Nombre' },
  { clave: 'gramos', encabezado: 'Gramos', render: (fila) => `${String(fila.gramos)} g` },
]

describe('Tabla', () => {
  it('renderiza encabezados y filas', () => {
    const filas: Fila[] = [
      { id: '1', nombre: 'Luna', gramos: 120 },
      { id: '2', nombre: 'Simba', gramos: 50 },
    ]
    render(<Tabla columnas={columnas} filas={filas} obtenerClave={(fila) => fila.id} />)

    expect(screen.getByRole('columnheader', { name: 'Nombre' })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: 'Luna' })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: '120 g' })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: 'Simba' })).toBeInTheDocument()
  })

  it('muestra el mensaje por defecto cuando no hay filas', () => {
    render(<Tabla columnas={columnas} filas={[]} obtenerClave={(fila) => fila.id} />)
    expect(screen.getByText('No hay datos para mostrar.')).toBeInTheDocument()
  })

  it('muestra el contenido de "vacio" en vez del mensaje por defecto', () => {
    render(
      <Tabla
        columnas={columnas}
        filas={[]}
        obtenerClave={(fila) => fila.id}
        vacio={<span>Sin mascotas todavía</span>}
      />,
    )
    expect(screen.getByText('Sin mascotas todavía')).toBeInTheDocument()
    expect(screen.queryByText('No hay datos para mostrar.')).not.toBeInTheDocument()
  })
})
