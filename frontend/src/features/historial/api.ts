import { api } from '@/shared/api/cliente'

import type { FiltrosHistorial, RespuestaHistorial } from './types'

export type FormatoHistorial = 'xlsx' | 'pdf' | 'docx'

export async function obtenerHistorial(filtros: FiltrosHistorial): Promise<RespuestaHistorial> {
  const { data } = await api.get<RespuestaHistorial>('/historial', {
    params: {
      pagina: filtros.pagina,
      porPagina: filtros.porPagina,
      estado: filtros.estado,
      mascotaId: filtros.mascotaId,
      desde: filtros.desde,
      hasta: filtros.hasta,
    },
  })
  return data
}

export async function obtenerTodoHistorial(
  filtros: Omit<FiltrosHistorial, 'pagina' | 'porPagina'>,
) {
  const porPagina = 100
  const primera = await obtenerHistorial({ ...filtros, pagina: 1, porPagina })
  const paginas = Math.ceil(primera.total / porPagina)
  const items = [...primera.items]
  for (let pagina = 2; pagina <= paginas; pagina += 1) {
    const respuesta = await obtenerHistorial({ ...filtros, pagina, porPagina })
    items.push(...respuesta.items)
  }
  return items
}

export async function exportarHistorial(
  formato: FormatoHistorial,
  filtros: Omit<FiltrosHistorial, 'pagina' | 'porPagina'>,
): Promise<Blob> {
  const { data } = await api.get<Blob>('/historial/exportar', {
    params: {
      formato,
      estado: filtros.estado,
      mascotaId: filtros.mascotaId,
      fechaDesde: filtros.desde,
      fechaHasta: filtros.hasta,
    },
    responseType: 'blob',
  })
  return data
}
