import { z } from 'zod'

export const esquemaMascota = z.object({
  nombre: z.string().min(1, 'Ingresa el nombre.'),
  especie: z.enum(['perro', 'gato'], { required_error: 'Selecciona una especie.' }),
  raza: z.string().min(1, 'Ingresa la raza.'),
  pesoKg: z.coerce.number().positive('El peso debe ser mayor a 0.'),
})

export type ValoresMascota = z.infer<typeof esquemaMascota>
