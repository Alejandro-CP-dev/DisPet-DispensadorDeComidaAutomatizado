import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { actualizarHorario, crearHorario, eliminarHorario, obtenerHorarios } from './api'
import type { DatosHorario } from './types'

const CLAVE_HORARIOS = ['horarios']

export function useHorarios() {
  return useQuery({ queryKey: CLAVE_HORARIOS, queryFn: obtenerHorarios })
}

export function useCrearHorario() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: crearHorario,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CLAVE_HORARIOS })
    },
  })
}

export function useActualizarHorario() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, datos }: { id: string; datos: DatosHorario }) =>
      actualizarHorario(id, datos),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CLAVE_HORARIOS })
    },
  })
}

export function useEliminarHorario() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: eliminarHorario,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CLAVE_HORARIOS })
    },
  })
}
