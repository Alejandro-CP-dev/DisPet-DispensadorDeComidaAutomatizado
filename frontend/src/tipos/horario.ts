export type DiaSemana =
  'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado' | 'domingo'

export interface Horario {
  id: string
  dispositivoId: string
  mascotaId: string
  hora: string
  gramos: number
  dias: DiaSemana[]
  activo: boolean
}
