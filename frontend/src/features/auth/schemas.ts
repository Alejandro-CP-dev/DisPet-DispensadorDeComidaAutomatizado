import { z } from 'zod'

export const esquemaLogin = z.object({
  correo: z.string().min(1, 'Ingresa tu correo.').email('Ingresa un correo válido.'),
  contrasena: z.string().min(1, 'Ingresa tu contraseña.'),
})

export type ValoresLogin = z.infer<typeof esquemaLogin>

export const esquemaRegistro = z
  .object({
    nombre: z.string().min(2, 'Ingresa tu nombre completo.'),
    correo: z.string().min(1, 'Ingresa tu correo.').email('Ingresa un correo válido.'),
    contrasena: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres.'),
    confirmarContrasena: z.string().min(1, 'Confirma tu contraseña.'),
  })
  .refine((datos) => datos.contrasena === datos.confirmarContrasena, {
    message: 'Las contraseñas no coinciden.',
    path: ['confirmarContrasena'],
  })

export type ValoresRegistro = z.infer<typeof esquemaRegistro>
