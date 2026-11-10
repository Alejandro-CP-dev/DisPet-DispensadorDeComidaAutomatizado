export interface Usuario {
  id: string
  nombre: string
  correo: string
  fechaCreacion: string | null
  notificacionBateriaBaja: boolean
  notificacionActualizaciones: boolean
}
