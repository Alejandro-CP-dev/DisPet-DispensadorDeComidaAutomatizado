import { create } from 'zustand'

export type Tema = 'claro' | 'oscuro' | 'sistema'

interface EstadoTema {
  tema: Tema
  establecerTema: (tema: Tema) => void
}

const CLAVE_ALMACENAMIENTO = 'dispet-tema'

function aplicarAtributoDocumento(tema: Tema): void {
  const raiz = document.documentElement
  if (tema === 'sistema') {
    raiz.removeAttribute('data-theme')
    return
  }
  raiz.setAttribute('data-theme', tema === 'claro' ? 'light' : 'dark')
}

function leerTemaGuardado(): Tema {
  const guardado = localStorage.getItem(CLAVE_ALMACENAMIENTO)
  if (guardado === 'claro' || guardado === 'oscuro' || guardado === 'sistema') {
    return guardado
  }
  return 'sistema'
}

const temaInicial = leerTemaGuardado()
aplicarAtributoDocumento(temaInicial)

export const useTema = create<EstadoTema>((set) => ({
  tema: temaInicial,
  establecerTema: (tema) => {
    aplicarAtributoDocumento(tema)
    localStorage.setItem(CLAVE_ALMACENAMIENTO, tema)
    set({ tema })
  },
}))
