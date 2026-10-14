import { z } from 'zod'

const HORA_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/

export const esquemaHorario = z.object({
  dispositivoId: z.string().min(1, 'Selecciona un dispositivo.'),
  hora: z.string().regex(HORA_REGEX, 'Ingresa una hora válida.'),
  gramos: z.coerce.number().positive('Los gramos deben ser mayores a 0.'),
  dias: z
    .array(z.enum(['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo']))
    .min(1, 'Selecciona al menos un día.'),
  activo: z.boolean(),
})

export type ValoresHorario = z.infer<typeof esquemaHorario>
