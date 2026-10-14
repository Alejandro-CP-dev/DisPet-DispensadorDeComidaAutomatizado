export type TipoDispensacion = 'programada' | 'manual'
export type EstadoDispensacion = 'exitosa' | 'fallida'

export interface Dispensacion {
  id: string
  dispositivoId: string
  mascotaId: string
  horarioId: string | null
  fechaHora: string
  gramos: number
  tipo: TipoDispensacion
  estado: EstadoDispensacion
}
