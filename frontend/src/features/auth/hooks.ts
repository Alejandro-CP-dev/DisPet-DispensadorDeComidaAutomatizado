import { useMutation, useQueryClient } from '@tanstack/react-query'
import { create } from 'zustand'

import type { Usuario } from '@/tipos'

import {
  actualizarPerfil,
  cambiarContrasena,
  confirmarCodigoCorreo,
  iniciarSesion,
  registrarse,
  restablecerContrasena,
  solicitarCodigoCorreo,
  solicitarRecuperacion,
} from './api'
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

export function useActualizarPerfil() {
  const establecerSesion = useSesionStore((estado) => estado.establecerSesion)
  const tokenAcceso = useSesionStore((estado) => estado.tokenAcceso)

  return useMutation({
    mutationFn: actualizarPerfil,
    onSuccess: (usuario) => {
      if (tokenAcceso) establecerSesion(usuario, tokenAcceso)
    },
  })
}

export function useSolicitarCodigoCorreo() {
  return useMutation({ mutationFn: solicitarCodigoCorreo })
}

export function useConfirmarCodigoCorreo() {
  const establecerSesion = useSesionStore((estado) => estado.establecerSesion)
  const tokenAcceso = useSesionStore((estado) => estado.tokenAcceso)

  return useMutation({
    mutationFn: confirmarCodigoCorreo,
    onSuccess: (usuario) => {
      if (tokenAcceso) establecerSesion(usuario, tokenAcceso)
    },
  })
}

export function useCambiarContrasena() {
  return useMutation({
    mutationFn: ({ actual, nueva }: { actual: string; nueva: string }) =>
      cambiarContrasena(actual, nueva),
  })
}

export function useSolicitarRecuperacion() {
  return useMutation({ mutationFn: solicitarRecuperacion })
}

export function useRestablecerContrasena() {
  return useMutation({
    mutationFn: ({ token, contrasenaNueva }: { token: string; contrasenaNueva: string }) =>
      restablecerContrasena(token, contrasenaNueva),
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
