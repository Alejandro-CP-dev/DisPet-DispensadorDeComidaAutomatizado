import { api } from '@/shared/api/cliente'
import type { Mascota } from '@/tipos'

import type { DatosMascota } from './types'

export async function obtenerMascotas(): Promise<Mascota[]> {
  const { data } = await api.get<Mascota[]>('/mascotas')
  return data
}

export async function crearMascota(datos: DatosMascota): Promise<Mascota> {
  const { data } = await api.post<Mascota>('/mascotas', datos)
  return data
}

export async function actualizarMascota(id: string, datos: DatosMascota): Promise<Mascota> {
  const { data } = await api.put<Mascota>(`/mascotas/${id}`, datos)
  return data
}

export async function eliminarMascota(id: string): Promise<void> {
  await api.delete(`/mascotas/${id}`)
}
