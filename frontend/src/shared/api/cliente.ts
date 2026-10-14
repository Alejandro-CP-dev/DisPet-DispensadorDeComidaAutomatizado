import axios from 'axios'
import type { InternalAxiosRequestConfig } from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
})

type ObtenerToken = () => string | null
type AlNoAutorizado = () => void

let obtenerToken: ObtenerToken = () => null
let alNoAutorizado: AlNoAutorizado = () => undefined

// Punto de conexión para Fase 4: evita que shared/api dependa de features/auth.
export function configurarAutenticacionApi(opciones: {
  obtenerToken?: ObtenerToken
  alNoAutorizado?: AlNoAutorizado
}): void {
  if (opciones.obtenerToken) obtenerToken = opciones.obtenerToken
  if (opciones.alNoAutorizado) alNoAutorizado = opciones.alNoAutorizado
}

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = obtenerToken()
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`)
  }
  return config
})

api.interceptors.response.use(
  (respuesta) => respuesta,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      alNoAutorizado()
    }
    // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors -- se reenvía el error original de axios, no se crea uno nuevo
    return Promise.reject(error)
  },
)
