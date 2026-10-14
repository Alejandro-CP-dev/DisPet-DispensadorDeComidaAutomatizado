import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { obtenerHistorial } from './api'
import type { FiltrosHistorial } from './types'

export function useHistorial(filtros: FiltrosHistorial) {
  return useQuery({
    queryKey: ['historial', filtros],
    queryFn: () => obtenerHistorial(filtros),
    placeholderData: keepPreviousData,
  })
}
