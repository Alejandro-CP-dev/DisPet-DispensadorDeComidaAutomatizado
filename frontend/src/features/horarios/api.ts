import { api } from '@/shared/api/cliente'
import type { Horario } from '@/tipos'

import type { DatosHorario } from './types'

export async function obtenerHorarios(): Promise<Horario[]> {
  const { data } = await api.get<Horario[]>('/horarios')
  return data
}

export async function crearHorario(datos: DatosHorario): Promise<Horario> {
  const { data } = await api.post<Horario>('/horarios', datos)
  return data
}

export async function actualizarHorario(id: string, datos: DatosHorario): Promise<Horario> {
  const { data } = await api.put<Horario>(`/horarios/${id}`, datos)
  return data
}

export async function eliminarHorario(id: string): Promise<void> {
  await api.delete(`/horarios/${id}`)
}
