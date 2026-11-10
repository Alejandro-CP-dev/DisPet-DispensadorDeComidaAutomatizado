import { renderizarConProveedores, screen } from '@tests/renderizar'
import { DisenoApp } from './DisenoApp'

describe('DisenoApp', () => {
  it('muestra el nombre como acceso reconocible para editar el perfil', () => {
    renderizarConProveedores(<DisenoApp />)

    expect(screen.getByRole('link', { name: /editar perfil de/i })).toHaveAttribute(
      'href',
      '/perfil',
    )
  })

  it('incluye el acceso para editar el perfil en el menú móvil', () => {
    renderizarConProveedores(<DisenoApp />)

    expect(screen.getByText('Editar perfil').closest('a')).toHaveAttribute('href', '/perfil')
  })
})
