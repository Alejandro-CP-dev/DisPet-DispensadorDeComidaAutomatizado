import { useMutation, useQueryClient } from '@tanstack/react-query'
import { create } from 'zustand'

import type { Usuario } from '@/tipos'

import { iniciarSesion, registrarse } from './api'
import type { Credenciales, DatosRegistro } from './types'

interface EstadoSesion {
  usuario: Usuario | null
  tokenAcceso: string | null
  establecerSesion: (usuario: Usuario, tokenAcceso: string) => void
  cerrarSesion: () => void
}

export const useSesionStore = create<EstadoSesion>((set) => ({
  usuario: null,
  tokenAcceso: null,
  establecerSesion: (usuario, tokenAcceso) => {
    set({ usuario, tokenAcceso })
  },
  cerrarSesion: () => {
    set({ usuario: null, tokenAcceso: null })
  },
}))

export function useSesion() {
  const usuario = useSesionStore((estado) => estado.usuario)
  return { usuario, haySesion: usuario !== null }
}

export function useLogin() {
  const establecerSesion = useSesionStore((estado) => estado.establecerSesion)

  return useMutation({
    mutationFn: (credenciales: Credenciales) => iniciarSesion(credenciales),
    onSuccess: (respuesta) => {
      establecerSesion(respuesta.usuario, respuesta.tokenAcceso)
    },
  })
}

export function useRegistro() {
  const establecerSesion = useSesionStore((estado) => estado.establecerSesion)

  return useMutation({
    mutationFn: (datos: DatosRegistro) => registrarse(datos),
    onSuccess: (respuesta) => {
      establecerSesion(respuesta.usuario, respuesta.tokenAcceso)
    },
  })
}

export function useLogout(): () => void {
  const cerrarSesion = useSesionStore((estado) => estado.cerrarSesion)
  const queryClient = useQueryClient()

  return () => {
    cerrarSesion()
    queryClient.clear()
  }
}
