import { http, HttpResponse } from 'msw'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { servidor } from '@/mocks/servidor'
import { renderizarConProveedores, screen } from '@tests/renderizar'
import { RecuperarContrasenaPage } from './RecuperarContrasenaPage'

describe('RecuperarContrasenaPage', () => {
  it('muestra la confirmación después de solicitar el correo', async () => {
    const usuario = userEvent.setup()
    renderizarConProveedores(<RecuperarContrasenaPage />)

    await usuario.type(screen.getByLabelText('Correo'), 'alejandro@dispet.test')
    await usuario.click(screen.getByRole('button', { name: 'Solicitar recuperación' }))

    expect(await screen.findByRole('status')).toHaveTextContent(
      'Si el correo está asociado a una cuenta, recibirás un enlace para cambiar tu contraseña.',
    )
    expect(
      screen.queryByText('Por seguridad, no confirmamos si el correo está registrado.'),
    ).not.toBeInTheDocument()
  })

  it('muestra el error cuando SMTP no está configurado', async () => {
    servidor.use(
      http.post('http://localhost:8000/auth/recuperar-contrasena', () =>
        HttpResponse.json(
          { detail: 'El envío de correo no está configurado. Revisa backend/.env.' },
          { status: 503 },
        ),
      ),
    )
    const usuario = userEvent.setup()
    renderizarConProveedores(<RecuperarContrasenaPage />)

    await usuario.type(screen.getByLabelText('Correo'), 'alejandro@dispet.test')
    await usuario.click(screen.getByRole('button', { name: 'Solicitar recuperación' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'El envío de correo no está configurado. Revisa backend/.env.',
    )
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('cambia la contraseña usando el token del enlace', async () => {
    const usuario = userEvent.setup()
    renderizarConProveedores(<RecuperarContrasenaPage />, {
      rutaInicial: '/restablecer-contrasena?token=token-prueba',
    })

    await usuario.type(screen.getByLabelText('Nueva contraseña'), 'nueva-clave-123')
    await usuario.type(screen.getByLabelText('Confirmar nueva contraseña'), 'nueva-clave-123')
    await usuario.click(screen.getByRole('button', { name: 'Cambiar contraseña' }))

    expect(await screen.findByText('Tu contraseña se cambió correctamente.')).toBeInTheDocument()
  })
})
