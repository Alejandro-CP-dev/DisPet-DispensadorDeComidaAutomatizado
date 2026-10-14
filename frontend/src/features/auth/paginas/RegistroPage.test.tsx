import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

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

    expect(await screen.findByText('Ingresa tu nombre completo.')).toBeInTheDocument()
    expect(screen.getByText('Ingresa tu correo.')).toBeInTheDocument()
    expect(screen.getByText('La contraseña debe tener al menos 8 caracteres.')).toBeInTheDocument()
  })

  it('rechaza una contraseña demasiado corta', async () => {
    const usuario = userEvent.setup()
    renderizarRegistro()

    await usuario.type(screen.getByLabelText('Contraseña'), 'corta1')
    await usuario.click(screen.getByRole('button', { name: 'Crear cuenta' }))

    expect(
      await screen.findByText('La contraseña debe tener al menos 8 caracteres.'),
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

  it('registra y redirige al tablero cuando los datos son válidos', async () => {
    const usuario = userEvent.setup()
    renderizarRegistro()

    await usuario.type(screen.getByLabelText('Nombre completo'), 'Nueva Persona')
    await usuario.type(screen.getByLabelText('Correo'), 'nueva@dispet.test')
    await usuario.type(screen.getByLabelText('Contraseña'), 'contrasena1')
    await usuario.type(screen.getByLabelText('Confirmar contraseña'), 'contrasena1')
    await usuario.click(screen.getByRole('button', { name: 'Crear cuenta' }))

    expect(await screen.findByText('Pantalla del tablero')).toBeInTheDocument()
  })
})
