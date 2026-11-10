import { describe, expect, it } from 'vitest'

import { renderizarConProveedores, screen } from '@tests/renderizar'

import { TableroPage } from './TableroPage'

describe('TableroPage', () => {
  it('muestra la tendencia de consumo en las gráficas diarias y semanales', async () => {
    renderizarConProveedores(<TableroPage />)

    const tendencias = await screen.findAllByRole('img', { name: 'Tendencia de consumo: Luna' })

    expect(tendencias).toHaveLength(2)
    for (const tendencia of tendencias) {
      expect(tendencia.querySelector('path')?.getAttribute('d')).toMatch(/^M /)
      expect(tendencia.querySelectorAll('path')[1]?.getAttribute('d')).toContain(' C ')
    }
  })
})
