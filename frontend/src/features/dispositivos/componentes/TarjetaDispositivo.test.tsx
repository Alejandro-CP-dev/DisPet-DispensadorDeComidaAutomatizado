import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import type { Dispositivo } from '@/tipos'

import { TarjetaDispositivo } from './TarjetaDispositivo'

const dispensadorCocina: Dispositivo = {
  id: 'd2',
  usuarioId: 'u1',
  mascotaId: 'm2',
  nombre: 'Dispensador cocina',
  estadoConexion: 'desconectado',
  nivelAlimentoPorcentaje: 12,
}

describe('TarjetaDispositivo', () => {
  it('muestra nivel bajo, aviso de reabastecimiento y deshabilita dispensar sin conexión', () => {
    render(
      <TarjetaDispositivo
        dispositivo={dispensadorCocina}
        mascotaNombre="Simba"
        onDispensar={() => undefined}
        dispensando={false}
      />,
    )

    expect(screen.getByText('Nivel bajo')).toBeInTheDocument()
    expect(screen.getByText('Mascota: Simba')).toBeInTheDocument()
    expect(screen.getByText('Reabastecer pronto')).toBeInTheDocument()
    expect(
      screen.getByRole('progressbar', { name: 'Nivel de alimento de Dispensador cocina' }),
    ).toHaveAttribute('aria-valuenow', '12')
    expect(screen.getByRole('button', { name: /Dispensar ahora/ })).toBeDisabled()
  })

  it('muestra el estado conectado y habilita dispensar', () => {
    render(
      <TarjetaDispositivo
        dispositivo={{
          ...dispensadorCocina,
          id: 'd1',
          nombre: 'Dispensador sala',
          estadoConexion: 'conectado',
          nivelAlimentoPorcentaje: 68,
        }}
        mascotaNombre="Luna"
        onDispensar={() => undefined}
        dispensando={false}
      />,
    )

    expect(screen.getByText('Conectado')).toBeInTheDocument()
    expect(screen.getByText('Nivel adecuado')).toBeInTheDocument()
    expect(screen.getByText('Mascota: Luna')).toBeInTheDocument()
    expect(screen.queryByText('Reabastecer pronto')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Dispensar ahora/ })).toBeEnabled()
  })
})
