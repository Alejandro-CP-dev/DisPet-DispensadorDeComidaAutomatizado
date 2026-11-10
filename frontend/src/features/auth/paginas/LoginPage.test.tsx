import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { renderizarConProveedores, screen } from '@tests/renderizar'
import { LoginPage } from './LoginPage'

function renderizarLogin() {
  return renderizarConProveedores(
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/tablero" element={<p>Pantalla del tablero</p>} />
    </Routes>,
    { rutaInicial: '/login' },
  )
}

describe('LoginPage', () => {
  it('muestra errores de validación con el formulario vacío', async () => {
    const usuario = userEvent.setup()
    renderizarLogin()

    await usuario.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(await screen.findByText('Ingresa tu correo.')).toBeInTheDocument()
    expect(screen.getByText('Ingresa tu contraseña.')).toBeInTheDocument()
  })

  it('valida el formato del correo', async () => {
    const usuario = userEvent.setup()
    renderizarLogin()

    await usuario.type(screen.getByLabelText('Correo'), 'no-es-un-correo')
    await usuario.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(await screen.findByText('Ingresa un correo válido.')).toBeInTheDocument()
  })

  it('permite visualizar y ocultar la contraseña', async () => {
    const usuario = userEvent.setup()
    renderizarLogin()

    const campoContrasena = screen.getByLabelText('Contraseña')
    expect(campoContrasena).toHaveAttribute('type', 'password')

    await usuario.click(screen.getByRole('button', { name: 'Mostrar contraseña' }))
    expect(campoContrasena).toHaveAttribute('type', 'text')

    await usuario.click(screen.getByRole('button', { name: 'Ocultar contraseña' }))
    expect(campoContrasena).toHaveAttribute('type', 'password')
  })

  it('muestra un mensaje de credenciales incorrectas cuando el servidor rechaza el login', async () => {
    const usuario = userEvent.setup()
    renderizarLogin()

    await usuario.type(screen.getByLabelText('Correo'), 'alejandro@dispet.test')
    await usuario.type(screen.getByLabelText('Contraseña'), 'clave-mala1')
    await usuario.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(await screen.findByText('Correo o contraseña incorrectos.')).toBeInTheDocument()
  })

  it.each(['123456789', 'corta123', 'contrasena-demasiado-larga'])(
    'envía la contraseña %s y muestra credenciales incorrectas',
    async (contrasena) => {
      const usuario = userEvent.setup()
      renderizarLogin()

      await usuario.type(screen.getByLabelText('Correo'), 'alejandro@dispet.test')
      await usuario.type(screen.getByLabelText('Contraseña'), contrasena)
      await usuario.click(screen.getByRole('button', { name: 'Entrar' }))

      expect(await screen.findByText('Correo o contraseña incorrectos.')).toBeInTheDocument()
    },
  )

  it('redirige al tablero con las credenciales correctas', async () => {
    const usuario = userEvent.setup()
    renderizarLogin()

    await usuario.type(screen.getByLabelText('Correo'), 'alejandro@dispet.test')
    await usuario.type(screen.getByLabelText('Contraseña'), 'dispet123')
    await usuario.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(await screen.findByText('Pantalla del tablero')).toBeInTheDocument()
  })
})
