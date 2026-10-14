export type Especie = 'perro' | 'gato'

export interface Mascota {
  id: string
  usuarioId: string
  nombre: string
  especie: Especie
  raza: string
  pesoKg: number
}
