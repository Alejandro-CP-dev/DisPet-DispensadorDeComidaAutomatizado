import userEvent from '@testing-library/user-event'
import { within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { afterEach, describe, expect, it } from 'vitest'

import { servidor } from '@/mocks/servidor'
import { renderizarConProveedores, screen } from '@tests/renderizar'
import { useSesionStore } from '../hooks'
import { PerfilPage } from './PerfilPage'

describe('PerfilPage', () => {
  afterEach(() => {
    useSesionStore.setState({ usuario: null, tokenAcceso: null })
  })

  it('muestra la fecha de creación como fecha de miembro', () => {
    useSesionStore.setState({
      usuario: {
        id: 'u1',
        nombre: 'Alejandro',
        correo: 'alejandro@dispet.test',
        fechaCreacion: '2024-01-15T12:00:00.000Z',
        notificacionBateriaBaja: false,
        notificacionActualizaciones: false,
      },
      tokenAcceso: 'token-prueba',
    })
    renderizarConProveedores(<PerfilPage />)

    expect(screen.getByText('Miembro desde 15 de enero de 2024')).toHaveAttribute(
      'datetime',
      '2024-01-15T12:00:00.000Z',
    )
  })

  it('valida que el nombre del perfil tenga entre 5 y 20 caracteres', async () => {
    const usuario = userEvent.setup()
    useSesionStore.setState({
      usuario: {
        id: 'u1',
        nombre: 'Alejandro',
        correo: 'alejandro@dispet.test',
        fechaCreacion: '2024-01-15T12:00:00.000Z',
        notificacionBateriaBaja: false,
        notificacionActualizaciones: false,
      },
      tokenAcceso: 'token-prueba',
    })
    renderizarConProveedores(<PerfilPage />)

    await usuario.clear(screen.getByLabelText('Nombre completo'))
    await usuario.type(screen.getByLabelText('Nombre completo'), 'Juan')
    await usuario.click(screen.getByRole('button', { name: 'Revisar y guardar cambios' }))

    expect(
      await screen.findByText('El nombre debe tener entre 5 y 20 caracteres.'),
    ).toBeInTheDocument()
  }, 15_000)

  it('pide confirmar antes de guardar el perfil', async () => {
    const usuario = userEvent.setup()
    let cuerpoEnviado: Record<string, unknown> | undefined
    servidor.use(
      http.put('http://localhost:8000/auth/perfil', async ({ request }) => {
        cuerpoEnviado = (await request.json()) as Record<string, unknown>
        return HttpResponse.json({
          id: 'u1',
          correo: 'alejandro@dispet.test',
          nombre: 'Alejandra',
          notificacionBateriaBaja: true,
          notificacionActualizaciones: false,
        })
      }),
    )
    useSesionStore.setState({
      usuario: {
        id: 'u1',
        nombre: 'Alejandro',
        correo: 'alejandro@dispet.test',
        fechaCreacion: '2024-01-15T12:00:00.000Z',
        notificacionBateriaBaja: false,
        notificacionActualizaciones: false,
      },
      tokenAcceso: 'token-prueba',
    })
    renderizarConProveedores(<PerfilPage />)

    await usuario.clear(screen.getByLabelText('Nombre completo'))
    await usuario.type(screen.getByLabelText('Nombre completo'), 'Alejandra')
    await usuario.click(screen.getByRole('switch', { name: /Nivel bajo de batería/ }))
    await usuario.click(screen.getByRole('button', { name: 'Revisar y guardar cambios' }))

    const dialogo = screen.getByRole('dialog', { name: 'Confirmar cambios del perfil' })
    expect(useSesionStore.getState().usuario?.nombre).toBe('Alejandro')
    await usuario.click(within(dialogo).getByRole('button', { name: 'Confirmar' }))

    expect(await screen.findByText('Perfil actualizado.')).toBeInTheDocument()
    expect(cuerpoEnviado).toEqual({
      nombre: 'Alejandra',
      notificacionBateriaBaja: true,
      notificacionActualizaciones: false,
    })
    expect(useSesionStore.getState().usuario?.nombre).toBe('Alejandra')
  }, 15_000)

  it('pide confirmar antes de cambiar la contraseña', async () => {
    const usuario = userEvent.setup()
    useSesionStore.setState({
      usuario: {
        id: 'u1',
        nombre: 'Alejandro',
        correo: 'alejandro@dispet.test',
        fechaCreacion: '2024-01-15T12:00:00.000Z',
        notificacionBateriaBaja: false,
        notificacionActualizaciones: false,
      },
      tokenAcceso: 'token-prueba',
    })
    renderizarConProveedores(<PerfilPage />)

    await usuario.click(screen.getByRole('button', { name: 'Cambiar contraseña' }))
    await usuario.type(screen.getByLabelText('Contraseña actual'), 'dispet123')
    await usuario.type(screen.getByLabelText('Nueva contraseña'), 'nueva-clave1')
    await usuario.type(screen.getByLabelText('Confirmar nueva contraseña'), 'nueva-clave1')
    await usuario.click(screen.getByRole('button', { name: 'Revisar cambio' }))

    const dialogo = screen.getByRole('dialog', { name: 'Confirmar cambio de contraseña' })
    expect(screen.queryByText('Contraseña actualizada.')).not.toBeInTheDocument()
    await usuario.click(within(dialogo).getByRole('button', { name: 'Confirmar' }))

    expect(await screen.findByText('Contraseña actualizada.')).toBeInTheDocument()
  }, 15_000)

  it('solo actualiza el correo después de confirmar el código', async () => {
    const usuario = userEvent.setup()
    useSesionStore.setState({
      usuario: {
        id: 'u1',
        nombre: 'Alejandro',
        correo: 'alejandro@dispet.test',
        fechaCreacion: '2024-01-15T12:00:00.000Z',
        notificacionBateriaBaja: false,
        notificacionActualizaciones: false,
      },
      tokenAcceso: 'token-prueba',
    })
    renderizarConProveedores(<PerfilPage />)

    await usuario.type(screen.getByLabelText('Nuevo correo electrónico'), 'nuevo@dispet.test')
    await usuario.click(screen.getByRole('button', { name: 'Cambiar correo electrónico' }))
    const dialogo = screen.getByRole('dialog', { name: 'Confirma tu contraseña' })
    await usuario.type(within(dialogo).getByLabelText('Contraseña actual'), 'dispet123')
    await usuario.click(within(dialogo).getByRole('button', { name: 'Confirmar y enviar código' }))
    expect(await screen.findByLabelText('Código recibido')).toBeInTheDocument()
    expect(useSesionStore.getState().usuario?.correo).toBe('alejandro@dispet.test')

    await usuario.type(screen.getByLabelText('Código recibido'), '123456')
    await usuario.click(screen.getByRole('button', { name: 'Confirmar correo' }))

    expect(await screen.findByText('Correo actualizado correctamente.')).toBeInTheDocument()
    expect(useSesionStore.getState().usuario?.correo).toBe('nuevo@dispet.test')
  }, 15_000)
})
