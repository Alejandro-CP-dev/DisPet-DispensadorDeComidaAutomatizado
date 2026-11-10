import { http, HttpResponse } from 'msw'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { horarios as horariosDemo } from '@/mocks/datos'
import { servidor } from '@/mocks/servidor'
import { renderizarConProveedores, screen, within } from '@tests/renderizar'

import { HorariosPage } from './HorariosPage'

describe('HorariosPage', () => {
  it('muestra el resumen y los horarios en una tabla con días e imágenes', async () => {
    renderizarConProveedores(<HorariosPage />)

    expect(
      await screen.findByText(
        (_, elemento) =>
          elemento !== null &&
          elemento.tagName === 'P' &&
          elemento.textContent.includes('4 horarios activos'),
      ),
    ).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Reloj despertador' })).toBeInTheDocument()
    expect(screen.getByRole('table')).toBeInTheDocument()

    const filaSala = screen.getByRole('row', { name: /Dispensador sala.*07:30/ })
    expect(within(filaSala).getByText('07:30')).toBeInTheDocument()
    expect(within(filaSala).getByLabelText(/^Días:/)).toHaveTextContent('LMXJVSD')
    expect(
      within(filaSala).getByRole('button', { name: 'Eliminar horario de Dispensador sala' }),
    ).toBeInTheDocument()
  })

  it('permite activar y desactivar un horario desde su fila', async () => {
    const usuario = userEvent.setup()
    const horarios = structuredClone(horariosDemo)
    let cuerpoEnviado: Record<string, unknown> | undefined
    servidor.use(
      http.get('http://localhost:8000/horarios', () => HttpResponse.json(horarios)),
      http.put('http://localhost:8000/horarios/:id', async ({ params, request }) => {
        const datos = (await request.json()) as Record<string, unknown>
        if ('id' in datos) {
          return HttpResponse.json({ detail: 'Extra inputs are not permitted.' }, { status: 422 })
        }
        cuerpoEnviado = datos
        const horario = horarios.find((item) => item.id === params.id)
        if (!horario) return new HttpResponse(null, { status: 404 })
        Object.assign(horario, datos)
        return HttpResponse.json(horario)
      }),
    )
    renderizarConProveedores(<HorariosPage />)

    const interruptor = await screen.findByRole('switch', {
      name: 'Desactivar horario de Dispensador sala a las 07:30',
    })
    expect(interruptor).toHaveAttribute('aria-checked', 'true')

    await usuario.click(interruptor)
    const activar = await screen.findByRole('switch', {
      name: 'Activar horario de Dispensador sala a las 07:30',
    })
    expect(activar).toHaveAttribute('aria-checked', 'false')
    expect(cuerpoEnviado).toEqual({
      dispositivoId: 'd1',
      mascotaId: 'm1',
      hora: '07:30',
      gramos: 120,
      dias: ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'],
      activo: false,
    })
    expect(screen.getByText('Inactivo')).toBeInTheDocument()

    await usuario.click(activar)
    const desactivar = await screen.findByRole('switch', {
      name: 'Desactivar horario de Dispensador sala a las 07:30',
    })
    expect(desactivar).toHaveAttribute('aria-checked', 'true')
    expect(cuerpoEnviado).toMatchObject({ activo: true })
  })
})
