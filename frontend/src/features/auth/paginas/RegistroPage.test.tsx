import { http, HttpResponse } from 'msw'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { servidor } from '@/mocks/servidor'
import { renderizarConProveedores, screen } from '@tests/renderizar'

import { RegistroPage } from './RegistroPage'

function renderizarRegistro() {
  return renderizarConProveedores(
    <Routes>
      <Route path="/registro" element={<RegistroPage />} />
      <Route path="/tablero" element={<p>Pantalla del tablero</p>} />
    </Routes>,
    { rutaInicial: '/registro' },
  )
}

describe('RegistroPage', () => {
  it('muestra errores de validación con el formulario vacío', async () => {
    const usuario = userEvent.setup()
    renderizarRegistro()

    await usuario.click(screen.getByRole('button', { name: 'Crear cuenta' }))

    expect(
      await screen.findByText('El nombre debe tener entre 5 y 20 caracteres.'),
    ).toBeInTheDocument()
    expect(screen.getByText('Ingresa tu correo.')).toBeInTheDocument()
    expect(
      screen.getByText('La contraseña debe tener entre 9 y 19 caracteres.'),
    ).toBeInTheDocument()
  })

  it('rechaza una contraseña compuesta solo por números', async () => {
    const usuario = userEvent.setup()
    renderizarRegistro()

    await usuario.type(screen.getByLabelText('Contraseña'), '123456789')
    await usuario.click(screen.getByRole('button', { name: 'Crear cuenta' }))

    expect(
      await screen.findByText('La contraseña no puede contener solo números.'),
    ).toBeInTheDocument()
  })

  it('rechaza cuando las contraseñas no coinciden', async () => {
    const usuario = userEvent.setup()
    renderizarRegistro()

    await usuario.type(screen.getByLabelText('Nombre completo'), 'Nueva Persona')
    await usuario.type(screen.getByLabelText('Correo'), 'nueva@dispet.test')
    await usuario.type(screen.getByLabelText('Contraseña'), 'contrasena1')
    await usuario.type(screen.getByLabelText('Confirmar contraseña'), 'otra-contrasena')
    await usuario.click(screen.getByRole('button', { name: 'Crear cuenta' }))

    expect(await screen.findByText('Las contraseñas no coinciden.')).toBeInTheDocument()
  })

  it('rechaza un correo que ya está registrado sin distinguir mayúsculas', async () => {
    const usuario = userEvent.setup()
    renderizarRegistro()

    await usuario.type(screen.getByLabelText('Nombre completo'), 'Nueva Persona')
    await usuario.type(screen.getByLabelText('Correo'), 'ALEJANDRO@DISPET.TEST')
    await usuario.type(screen.getByLabelText('Contraseña'), 'contrasena1')
    await usuario.type(screen.getByLabelText('Confirmar contraseña'), 'contrasena1')
    await usuario.click(screen.getByRole('button', { name: 'Crear cuenta' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Ya existe una cuenta con ese correo.',
    )
    expect(screen.queryByText('Pantalla del tablero')).not.toBeInTheDocument()
  })

  it('registra y redirige al tablero cuando los datos son válidos', async () => {
    const usuario = userEvent.setup()
    let cuerpoEnviado: unknown
    servidor.use(
      http.post('http://localhost:8000/auth/registro', async ({ request }) => {
        cuerpoEnviado = await request.json()
        return HttpResponse.json({
          usuario: {
            id: 'u-nueva',
            nombre: 'Nueva Persona',
            correo: 'nueva@dispet.test',
            fechaCreacion: '2026-11-10T12:00:00.000Z',
            notificacionBateriaBaja: false,
            notificacionActualizaciones: false,
          },
          tokenAcceso: 'token-prueba',
        })
      }),
    )
    renderizarRegistro()

    await usuario.type(screen.getByLabelText('Nombre completo'), 'Nueva Persona')
    await usuario.type(screen.getByLabelText('Correo'), 'nueva@dispet.test')
    await usuario.type(screen.getByLabelText('Contraseña'), 'contrasena1')
    await usuario.type(screen.getByLabelText('Confirmar contraseña'), 'contrasena1')
    await usuario.click(screen.getByRole('button', { name: 'Crear cuenta' }))

    expect(await screen.findByText('Pantalla del tablero')).toBeInTheDocument()
    expect(cuerpoEnviado).toEqual({
      nombre: 'Nueva Persona',
      correo: 'nueva@dispet.test',
      contrasena: 'contrasena1',
    })
  })
})
