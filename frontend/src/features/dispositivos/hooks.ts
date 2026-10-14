import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { dispensarAhora, obtenerDispositivos } from './api'

const CLAVE_DISPOSITIVOS = ['dispositivos']

export function useDispositivos() {
  return useQuery({ queryKey: CLAVE_DISPOSITIVOS, queryFn: obtenerDispositivos })
}

export function useDispensarAhora() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, gramos }: { id: string; gramos: number }) => dispensarAhora(id, gramos),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CLAVE_DISPOSITIVOS })
      void queryClient.invalidateQueries({ queryKey: ['historial'] })
    },
  })
}
