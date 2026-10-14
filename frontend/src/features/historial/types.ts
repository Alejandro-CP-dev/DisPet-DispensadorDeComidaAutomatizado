import type { Dispensacion, EstadoDispensacion } from '@/tipos'

export interface FiltrosHistorial {
  pagina: number
  porPagina: number
  estado?: EstadoDispensacion
  mascotaId?: string
}

export interface RespuestaHistorial {
  items: Dispensacion[]
  total: number
  pagina: number
  porPagina: number
}
