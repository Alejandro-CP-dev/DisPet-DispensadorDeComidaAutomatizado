import { api } from '@/shared/api/cliente'

import type { Credenciales, DatosRegistro, RespuestaAutenticacion } from './types'
import type { Usuario } from '@/tipos'

export async function iniciarSesion(credenciales: Credenciales): Promise<RespuestaAutenticacion> {
  const { data } = await api.post<RespuestaAutenticacion>('/auth/login', credenciales)
  return data
}

export async function registrarse(datos: DatosRegistro): Promise<RespuestaAutenticacion> {
  const { nombre, correo, contrasena } = datos
  const { data } = await api.post<RespuestaAutenticacion>('/auth/registro', {
    nombre,
    correo,
    contrasena,
  })
  return data
}

export async function actualizarPerfil(
  datos: Pick<Usuario, 'nombre' | 'notificacionBateriaBaja' | 'notificacionActualizaciones'>,
): Promise<Usuario> {
  const { data } = await api.put<Usuario>('/auth/perfil', datos)
  return data
}

export async function solicitarCodigoCorreo(datos: {
  correo: string
  contrasena: string
}): Promise<{ mensaje: string }> {
  const { data } = await api.post<{ mensaje: string }>('/auth/correo/codigo', datos)
  return data
}

export async function confirmarCodigoCorreo(codigo: string): Promise<Usuario> {
  const { data } = await api.post<Usuario>('/auth/correo/confirmar', { codigo })
  return data
}

export async function cambiarContrasena(
  contrasenaActual: string,
  contrasenaNueva: string,
): Promise<void> {
  await api.put('/auth/contrasena', { contrasenaActual, contrasenaNueva })
}

export async function solicitarRecuperacion(correo: string): Promise<{ mensaje: string }> {
  const { data } = await api.post<{ mensaje: string }>('/auth/recuperar-contrasena', { correo })
  return data
}

export async function restablecerContrasena(token: string, contrasenaNueva: string): Promise<void> {
  await api.post('/auth/restablecer-contrasena', { token, contrasenaNueva })
}
