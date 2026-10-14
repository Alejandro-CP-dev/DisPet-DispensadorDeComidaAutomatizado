export type EstadoConexion = 'conectado' | 'desconectado'

export interface Dispositivo {
  id: string
  usuarioId: string
  mascotaId: string
  nombre: string
  estadoConexion: EstadoConexion
  nivelAlimentoPorcentaje: number
}
