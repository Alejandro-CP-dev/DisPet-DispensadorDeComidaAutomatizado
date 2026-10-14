import axios from 'axios'

const mensajesPorEstado: Record<number, string> = {
  400: 'Los datos enviados no son válidos.',
  401: 'Tu sesión expiró. Inicia sesión de nuevo.',
  403: 'No tienes permiso para realizar esta acción.',
  404: 'No se encontró el recurso solicitado.',
  409: 'Ya existe un recurso con esos datos.',
  422: 'Revisa los datos ingresados.',
}

export function obtenerMensajeError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return 'No se pudo conectar con el servidor. Revisa tu conexión.'
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
