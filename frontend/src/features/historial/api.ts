import { api } from '@/shared/api/cliente'

import type { FiltrosHistorial, RespuestaHistorial } from './types'

export async function obtenerHistorial(filtros: FiltrosHistorial): Promise<RespuestaHistorial> {
  const { data } = await api.get<RespuestaHistorial>('/historial', {
    params: {
      pagina: filtros.pagina,
      porPagina: filtros.porPagina,
      estado: filtros.estado,
      mascotaId: filtros.mascotaId,
    },
  })
  return data
}
