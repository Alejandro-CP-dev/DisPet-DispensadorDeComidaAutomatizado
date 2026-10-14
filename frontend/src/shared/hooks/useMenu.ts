import { create } from 'zustand'

interface EstadoMenu {
  abierto: boolean
  alternar: () => void
  cerrar: () => void
}

export const useMenu = create<EstadoMenu>((set) => ({
  abierto: false,
  alternar: () => {
    set((estado) => ({ abierto: !estado.abierto }))
  },
  cerrar: () => {
    set({ abierto: false })
  },
}))
