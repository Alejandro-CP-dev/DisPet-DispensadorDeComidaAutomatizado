import type { DiaSemana } from '@/tipos'

export interface OpcionDia {
  valor: DiaSemana
  etiqueta: string
}

export const DIAS_SEMANA: OpcionDia[] = [
  { valor: 'lunes', etiqueta: 'Lunes' },
  { valor: 'martes', etiqueta: 'Martes' },
  { valor: 'miercoles', etiqueta: 'Miércoles' },
  { valor: 'jueves', etiqueta: 'Jueves' },
  { valor: 'viernes', etiqueta: 'Viernes' },
  { valor: 'sabado', etiqueta: 'Sábado' },
  { valor: 'domingo', etiqueta: 'Domingo' },
]

const DIAS_POR_INDICE_JS: DiaSemana[] = [
  'domingo',
  'lunes',
  'martes',
  'miercoles',
  'jueves',
  'viernes',
  'sabado',
]

export function diaDeHoy(): DiaSemana {
  return DIAS_POR_INDICE_JS[new Date().getDay()] ?? 'domingo'
}
