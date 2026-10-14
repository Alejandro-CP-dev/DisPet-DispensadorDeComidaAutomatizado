import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { Providers } from './app/providers'
import { Rutas } from './app/router'
import './styles/global.css'

const contenedor = document.getElementById('raiz')
if (!contenedor) {
  throw new Error('No se encontró el elemento #raiz en index.html')
}

async function habilitarMocks(): Promise<void> {
  if (import.meta.env.VITE_USAR_MOCKS !== 'true') return
  const { worker } = await import('./mocks/browser')
  await worker.start({ onUnhandledRequest: 'bypass' })
}

async function iniciar(raiz: HTMLElement): Promise<void> {
  await habilitarMocks()
  createRoot(raiz).render(
    <StrictMode>
      <Providers>
        <Rutas />
      </Providers>
    </StrictMode>,
  )
}

void iniciar(contenedor)
