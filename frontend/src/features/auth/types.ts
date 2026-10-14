import type { Usuario } from '@/tipos'

export interface Credenciales {
  correo: string
  contrasena: string
}

export interface DatosRegistro {
  nombre: string
  correo: string
  contrasena: string
}

export interface RespuestaAutenticacion {
  usuario: Usuario
  tokenAcceso: string
}
