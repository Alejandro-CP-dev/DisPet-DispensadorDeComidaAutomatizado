import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { Providers } from './app/providers'
import { Rutas } from './app/router'
import './styles/global.css'

const contenedor = document.getElementById('raiz')
if (!contenedor) {
  throw new Error('No se encontró el elemento #raiz en index.html')
}

createRoot(contenedor).render(
  <StrictMode>
    <Providers>
      <Rutas />
    </Providers>
  </StrictMode>,
)
