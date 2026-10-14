import { create } from 'zustand'

export type TipoToast = 'exito' | 'error' | 'alerta' | 'info'

export interface Toast {
  id: string
  tipo: TipoToast
  mensaje: string
}

interface EstadoToasts {
  toasts: Toast[]
  mostrar: (mensaje: string, tipo?: TipoToast) => void
  cerrar: (id: string) => void
}

const DURACION_MS = 4000

export const useToasts = create<EstadoToasts>((set, get) => ({
  toasts: [],
  mostrar: (mensaje, tipo = 'info') => {
    const id = crypto.randomUUID()
    set((estado) => ({ toasts: [...estado.toasts, { id, tipo, mensaje }] }))
    setTimeout(() => {
      get().cerrar(id)
    }, DURACION_MS)
  },
  cerrar: (id) => {
    set((estado) => ({ toasts: estado.toasts.filter((toast) => toast.id !== id) }))
  },
}))
