import axios from 'axios'

const mensajesPorEstado: Record<number, string> = {
  400: 'Los datos enviados no son válidos.',
  401: 'Tu sesión expiró. Inicia sesión de nuevo.',
  403: 'No tienes permiso para realizar esta acción.',
  404: 'No se encontró el recurso solicitado.',
  409: 'Ya existe un recurso con esos datos.',
  422: 'Uno o más datos no cumplen los requisitos.',
}

function esObjeto(datos: unknown): datos is Record<string, unknown> {
  return typeof datos === 'object' && datos !== null
}

function mensajeValidacion(detalle: unknown): string | undefined {
  const errores = Array.isArray(detalle) ? detalle : [detalle]
  const error = errores.find(esObjeto)
  if (!error) return undefined

  const ubicacion = Array.isArray(error.loc) ? error.loc : []
  const campo: unknown = ubicacion[ubicacion.length - 1]
  const tipo: unknown = error.type

  if (campo === 'nombre' && (tipo === 'string_too_short' || tipo === 'string_too_long')) {
    return 'El nombre debe tener entre 5 y 20 caracteres.'
  }
  if (
    (campo === 'contrasena' || campo === 'contrasenaNueva') &&
    (tipo === 'string_too_short' || tipo === 'string_too_long')
  ) {
    return 'La contraseña debe tener entre 9 y 19 caracteres.'
  }
  if (
    (campo === 'contrasena' || campo === 'contrasenaNueva') &&
    tipo === 'string_pattern_mismatch'
  ) {
    return 'La contraseña no puede contener solo números.'
  }
  if (campo === 'correo' && tipo === 'string_pattern_mismatch') {
    return 'Ingresa un correo válido.'
  }
  if (campo === 'codigo' && tipo === 'string_pattern_mismatch') {
    return 'Ingresa el código de 6 dígitos.'
  }
  return undefined
}

export function obtenerMensajeError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return 'No se pudo conectar con el servidor. Revisa tu conexión.'
    }
    const datos: unknown = error.response.data
    if (esObjeto(datos)) {
      const detalle = datos.detail ?? datos.mensaje
      if (typeof detalle === 'string') return detalle
      const mensaje = mensajeValidacion(detalle)
      if (mensaje) return mensaje
    }
    const { status } = error.response
    if (status >= 500) {
      return 'Ocurrió un error en el servidor. Intenta de nuevo más tarde.'
    }
    return mensajesPorEstado[status] ?? 'Ocurrió un error inesperado.'
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'Ocurrió un error inesperado.'
}
