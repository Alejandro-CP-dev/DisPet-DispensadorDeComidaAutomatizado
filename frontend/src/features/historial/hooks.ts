import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { obtenerHistorial, obtenerTodoHistorial } from './api'
import type { FiltrosHistorial } from './types'

export function useHistorial(filtros: FiltrosHistorial) {
  return useQuery({
    queryKey: ['historial', filtros],
    queryFn: () => obtenerHistorial(filtros),
    placeholderData: keepPreviousData,
  })
}

export function useTodoHistorial(filtros: Omit<FiltrosHistorial, 'pagina' | 'porPagina'> = {}) {
  return useQuery({
    queryKey: ['historial', 'completo', filtros],
    queryFn: () => obtenerTodoHistorial(filtros),
  })
}
