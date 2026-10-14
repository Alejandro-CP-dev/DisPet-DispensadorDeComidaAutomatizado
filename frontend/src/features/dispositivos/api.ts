import { api } from '@/shared/api/cliente'
import type { Dispensacion, Dispositivo } from '@/tipos'

export async function obtenerDispositivos(): Promise<Dispositivo[]> {
  const { data } = await api.get<Dispositivo[]>('/dispositivos')
  return data
}

export async function dispensarAhora(id: string, gramos: number): Promise<Dispensacion> {
  const { data } = await api.post<Dispensacion>(`/dispositivos/${id}/dispensar`, { gramos })
  return data
}
