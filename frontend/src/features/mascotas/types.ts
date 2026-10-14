import type { Mascota } from '@/tipos'

export type DatosMascota = Omit<Mascota, 'id' | 'usuarioId'>
