import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { actualizarMascota, crearMascota, eliminarMascota, obtenerMascotas } from './api'
import type { DatosMascota } from './types'

const CLAVE_MASCOTAS = ['mascotas']

export function useMascotas() {
  return useQuery({ queryKey: CLAVE_MASCOTAS, queryFn: obtenerMascotas })
}

export function useCrearMascota() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: crearMascota,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CLAVE_MASCOTAS })
    },
  })
}

export function useActualizarMascota() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, datos }: { id: string; datos: DatosMascota }) =>
      actualizarMascota(id, datos),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CLAVE_MASCOTAS })
    },
  })
}

export function useEliminarMascota() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: eliminarMascota,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CLAVE_MASCOTAS })
    },
  })
}
