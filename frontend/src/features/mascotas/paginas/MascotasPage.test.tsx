import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { renderizarConProveedores, screen } from '@tests/renderizar'

import { MascotasPage } from './MascotasPage'

describe('MascotasPage', () => {
  it('muestra las mascotas existentes', async () => {
    renderizarConProveedores(<MascotasPage />)

    expect(await screen.findByText('Luna')).toBeInTheDocument()
    expect(screen.getByText('Simba')).toBeInTheDocument()
  })

  it('valida el formulario de alta antes de llamar a la API', async () => {
    const usuario = userEvent.setup()
    renderizarConProveedores(<MascotasPage />)

    await usuario.click(await screen.findByRole('button', { name: 'Agregar mascota' }))
    await usuario.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(await screen.findByText('Ingresa el nombre.')).toBeInTheDocument()
    expect(screen.getByText('Ingresa la raza.')).toBeInTheDocument()
  })

  it('agrega una mascota nueva y la muestra en la lista', async () => {
    const usuario = userEvent.setup()
    renderizarConProveedores(<MascotasPage />)

    await usuario.click(await screen.findByRole('button', { name: 'Agregar mascota' }))
    await usuario.type(screen.getByLabelText('Nombre'), 'Rocky')
    await usuario.selectOptions(screen.getByLabelText('Especie'), 'perro')
    await usuario.type(screen.getByLabelText('Raza'), 'Bulldog')
    await usuario.type(screen.getByLabelText('Peso (kg)'), '18')
    await usuario.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(await screen.findByText('Rocky')).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
