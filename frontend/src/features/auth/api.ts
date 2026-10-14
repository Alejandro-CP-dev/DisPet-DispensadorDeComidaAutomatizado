import { api } from '@/shared/api/cliente'

import type { Credenciales, DatosRegistro, RespuestaAutenticacion } from './types'

export async function iniciarSesion(credenciales: Credenciales): Promise<RespuestaAutenticacion> {
  const { data } = await api.post<RespuestaAutenticacion>('/auth/login', credenciales)
  return data
}

export async function registrarse(datos: DatosRegistro): Promise<RespuestaAutenticacion> {
  const { data } = await api.post<RespuestaAutenticacion>('/auth/registro', datos)
  return data
}
