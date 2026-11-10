import { describe, expect, it } from 'vitest'

import { obtenerMensajeError } from './errores'

function crearErrorAxios(status?: number, data?: unknown) {
  return {
    isAxiosError: true,
    response: status ? { status, data } : undefined,
  }
}

describe('obtenerMensajeError', () => {
  it('traduce un 401 a un mensaje de sesión expirada', () => {
    expect(obtenerMensajeError(crearErrorAxios(401))).toBe(
      'Tu sesión expiró. Inicia sesión de nuevo.',
    )
  })

  it('traduce un 404 a "no se encontró"', () => {
    expect(obtenerMensajeError(crearErrorAxios(404))).toBe('No se encontró el recurso solicitado.')
  })

  it('traduce cualquier 5xx a un error de servidor', () => {
    expect(obtenerMensajeError(crearErrorAxios(503))).toBe(
      'Ocurrió un error en el servidor. Intenta de nuevo más tarde.',
    )
  })

  it('traduce el error de longitud del nombre devuelto por FastAPI', () => {
    expect(
      obtenerMensajeError(
        crearErrorAxios(422, {
          detail: [
            {
              loc: ['body', 'nombre'],
              type: 'string_too_short',
              msg: 'String should have at least 5 characters',
            },
          ],
        }),
      ),
    ).toBe('El nombre debe tener entre 5 y 20 caracteres.')
  })

  it('traduce el error de contraseña numérica devuelto por FastAPI', () => {
    expect(
      obtenerMensajeError(
        crearErrorAxios(422, {
          detail: [
            {
              loc: ['body', 'contrasena'],
              type: 'string_pattern_mismatch',
              msg: 'String should match pattern',
            },
          ],
        }),
      ),
    ).toBe('La contraseña no puede contener solo números.')
  })

  it('usa un mensaje neutro para errores 422 sin una traducción específica', () => {
    expect(
      obtenerMensajeError(
        crearErrorAxios(422, {
          detail: [{ loc: ['body', 'activo'], type: 'bool_parsing' }],
        }),
      ),
    ).toBe('Uno o más datos no cumplen los requisitos.')
  })

  it('informa que no hay conexión cuando no hay respuesta', () => {
    expect(obtenerMensajeError(crearErrorAxios())).toBe(
      'No se pudo conectar con el servidor. Revisa tu conexión.',
    )
  })

  it('usa el mensaje de un Error común si no es de axios', () => {
    expect(obtenerMensajeError(new Error('algo falló'))).toBe('algo falló')
  })

  it('cae en un mensaje genérico para cualquier otra cosa', () => {
    expect(obtenerMensajeError('texto plano')).toBe('Ocurrió un error inesperado.')
  })
})
