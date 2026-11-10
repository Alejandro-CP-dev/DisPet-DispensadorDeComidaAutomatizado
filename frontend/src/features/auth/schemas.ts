import { z } from 'zod'

const esquemaContrasena = z
  .string()
  .min(9, 'La contraseña debe tener entre 9 y 19 caracteres.')
  .max(19, 'La contraseña debe tener entre 9 y 19 caracteres.')
  .regex(/\D/, 'La contraseña no puede contener solo números.')

export const esquemaLogin = z.object({
  correo: z.string().min(1, 'Ingresa tu correo.').email('Ingresa un correo válido.'),
  contrasena: z.string().min(1, 'Ingresa tu contraseña.'),
})

export type ValoresLogin = z.infer<typeof esquemaLogin>

export const esquemaRegistro = z
  .object({
    nombre: z
      .string()
      .min(5, 'El nombre debe tener entre 5 y 20 caracteres.')
      .max(20, 'El nombre debe tener entre 5 y 20 caracteres.'),
    correo: z.string().min(1, 'Ingresa tu correo.').email('Ingresa un correo válido.'),
    contrasena: esquemaContrasena,
    confirmarContrasena: z.string().min(1, 'Confirma tu contraseña.'),
  })
  .refine((datos) => datos.contrasena === datos.confirmarContrasena, {
    message: 'Las contraseñas no coinciden.',
    path: ['confirmarContrasena'],
  })

export type ValoresRegistro = z.infer<typeof esquemaRegistro>

export const esquemaPerfil = z.object({
  nombre: z
    .string()
    .min(5, 'El nombre debe tener entre 5 y 20 caracteres.')
    .max(20, 'El nombre debe tener entre 5 y 20 caracteres.'),
  notificacionBateriaBaja: z.boolean(),
  notificacionActualizaciones: z.boolean(),
})

export type ValoresPerfil = z.infer<typeof esquemaPerfil>

export const esquemaCambioContrasena = z
  .object({
    contrasenaActual: z.string().min(1, 'Ingresa tu contraseña actual.'),
    contrasenaNueva: esquemaContrasena,
    confirmarContrasena: z.string().min(1, 'Confirma tu nueva contraseña.'),
  })
  .refine((datos) => datos.contrasenaNueva === datos.confirmarContrasena, {
    message: 'Las contraseñas no coinciden.',
    path: ['confirmarContrasena'],
  })

export type ValoresCambioContrasena = z.infer<typeof esquemaCambioContrasena>

export const esquemaRecuperacion = z.object({
  correo: z.string().min(1, 'Ingresa tu correo.').email('Ingresa un correo válido.'),
})

export type ValoresRecuperacion = z.infer<typeof esquemaRecuperacion>

export const esquemaRestablecerContrasena = z
  .object({
    contrasenaNueva: esquemaContrasena,
    confirmarContrasena: z.string().min(1, 'Confirma tu nueva contraseña.'),
  })
  .refine((datos) => datos.contrasenaNueva === datos.confirmarContrasena, {
    message: 'Las contraseñas no coinciden.',
    path: ['confirmarContrasena'],
  })

export type ValoresRestablecerContrasena = z.infer<typeof esquemaRestablecerContrasena>

export const esquemaCambioCorreo = z.object({
  correo: z.string().min(1, 'Ingresa tu correo.').email('Ingresa un correo válido.'),
})

export type ValoresCambioCorreo = z.infer<typeof esquemaCambioCorreo>

export const esquemaConfirmarContrasena = z.object({
  contrasena: z.string().min(1, 'Ingresa tu contraseña actual.'),
})

export type ValoresConfirmarContrasena = z.infer<typeof esquemaConfirmarContrasena>

export const esquemaCodigoCorreo = z.object({
  codigo: z.string().regex(/^\d{6}$/, 'Ingresa el código de 6 dígitos.'),
})

export type ValoresCodigoCorreo = z.infer<typeof esquemaCodigoCorreo>
